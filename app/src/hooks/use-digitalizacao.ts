import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { useRepositorios } from '@/database/DatabaseProvider';

// Lidas do arquivo .env (só mudam ao reiniciar com: npx expo start -c)
const OCR_URL = process.env.EXPO_PUBLIC_OCR_URL;
const APP_TOKEN = process.env.EXPO_PUBLIC_APP_TOKEN;

const MSG_SEM_CONFIG =
  'O servidor de leitura não está configurado. Confira o arquivo .env e reinicie o app.';

/** A URL existe e é http(s)? (evita "no protocol: undefined") */
function urlValida(url: string | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url.trim());
}

// Envia a imagem ao servidor e devolve os dois textos
async function lerImagem(base64: string, mimeType: string) {
  if (!urlValida(OCR_URL)) throw new Error(MSG_SEM_CONFIG);

  const ctrl = new AbortController();
  const limite = setTimeout(() => ctrl.abort(), 45_000); // desiste após 45 segundos
  try {
    let r: Response;
    try {
      r = await fetch(OCR_URL.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(APP_TOKEN ? { 'x-app-token': APP_TOKEN } : {}),
        },
        body: JSON.stringify({ imagemBase64: base64, mimeType }),
        signal: ctrl.signal,
      });
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') throw e; // tratado abaixo
      throw new Error('Não foi possível conectar ao servidor. Verifique a internet.');
    }
    if (!r.ok) {
      // Mostra o código HTTP para facilitar achar o problema (401 token, 404 caminho, 500 servidor...)
      let detalhe = '';
      try {
        const corpo = await r.text();
        console.warn('OCR respondeu', r.status, corpo.slice(0, 500));
        const j = JSON.parse(corpo);
        detalhe = String(j.erro ?? j.error ?? j.message ?? '').slice(0, 120);
      } catch {
        /* resposta não era JSON: ignora */
      }
      throw new Error(
        `Não foi possível ler a imagem (erro ${r.status}${detalhe ? `: ${detalhe}` : ''}). Tente de novo.`,
      );
    }
    const d = await r.json();
    const original = String(d.textoOriginal ?? '').trim();
    if (!original) throw new Error('Não encontramos texto nessa imagem.');
    return {
      textoOriginal: original,
      textoAdaptado: String(d.textoAdaptado ?? '').trim() || original,
    };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('A leitura demorou demais. Tente de novo.');
    }
    throw e;
  } finally {
    clearTimeout(limite);
  }
}

export function useDigitalizacao() {
  const { usuarios, documentos } = useRepositorios();
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const digitalizar = useCallback(
    async (origem: 'camera' | 'imagem') => {
      if (processando) return; // evita toques repetidos
      setErro(null);

      // 0) Servidor configurado? Se não, avisa já (antes de abrir a câmera)
      if (!urlValida(OCR_URL)) {
        setErro(MSG_SEM_CONFIG);
        return;
      }

      // 1) Escolher a imagem
      let resultado: ImagePicker.ImagePickerResult;
      if (origem === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setErro('Permita o uso da câmera para digitalizar.');
          return;
        }
        resultado = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
      } else {
        resultado = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.5,
          base64: true,
        });
      }
      if (resultado.canceled) return;

      const img = resultado.assets[0];
      if (!img.base64) {
        setErro('Não foi possível abrir a imagem.');
        return;
      }
      if (img.base64.length > 4_000_000) {
        setErro('Imagem muito grande. Tente uma foto menor.');
        return;
      }

      // 2) Criar o documento "processando" e ler a imagem
      const u = await usuarios.obterPrimeiro();
      if (!u) return;
      setProcessando(true);
      const doc = await documentos.criar({
        usuarioId: u.id,
        titulo: `Digitalização ${new Date().toLocaleDateString('pt-BR')}`,
        origem,
        arquivoOrigem: img.uri,
        status: 'processando',
      });

      try {
        const textos = await lerImagem(img.base64, img.mimeType ?? 'image/jpeg');
        await documentos.concluirProcessamento(doc.id, textos);
        router.push({ pathname: '/leitor/[id]', params: { id: doc.id } });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido.';
        await documentos.remover(doc.id); // falhou: não deixa documento "fantasma" no banco
        setErro(msg);
      } finally {
        setProcessando(false);
      }
    },
    [processando, usuarios, documentos],
  );

  return { digitalizar, processando, erro };
}