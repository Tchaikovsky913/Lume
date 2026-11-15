import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { Documento, Fonte, Preferencia } from '@/database';
import { paraEstiloLeitura } from '@/database';
import { useRepositorios } from '@/database/DatabaseProvider';

const TAMANHO_MIN = 12;
const TAMANHO_MAX = 48;
const PASSO_ZOOM = 4;
const TAMANHO_APOS_MAX = 16;

export function useLeitor(documentoId: number) {
  const { usuarios, preferencias, documentos } = useRepositorios();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [pref, setPref] = useState<Preferencia | null>(null);
  const [fontes, setFontes] = useState<Fonte[]>([]);

  // Relê o banco toda vez que a tela volta ao foco
  // (ex.: depois de mudar algo em Configurações)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const u = await usuarios.obterPrimeiro();
          if (!u) return;
          const [doc, p, f] = await Promise.all([
            documentos.obter(documentoId),
            preferencias.obter(u.id),
            preferencias.listarFontes(),
          ]);
          if (!ativo) return;
          setDocumento(doc);
          setPref(p);
          setFontes(f);
        } catch (e) {
          console.warn('Erro ao carregar o leitor:', e);
        }
      })();
      return () => {
        ativo = false;
      };
    }, [documentoId, usuarios, documentos, preferencias]),
  );

  // Botão "Aa": passa para a próxima fonte da lista (e volta ao início no fim)
  const proximaFonte = useCallback(async () => {
    if (!pref || fontes.length === 0) return;
    const i = fontes.findIndex((f) => f.nome === pref.fonte);
    const proxima = fontes[(i + 1) % fontes.length];
    try {
      setPref(await preferencias.atualizar(pref.usuarioId, { fonte: proxima.nome }));
    } catch (e) {
      console.warn('Erro ao trocar a fonte:', e);
    }
  }, [pref, fontes, preferencias]);

  // Botão lupa: aumenta de 4 em 4 (nunca passa de 48);
  // ao já estar no máximo, volta para 16
  const proximoZoom = useCallback(async () => {
    if (!pref) return;
    const atual = pref.tamanhoFonte;
    const novo =
      atual >= TAMANHO_MAX
        ? TAMANHO_APOS_MAX
        : Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, atual + PASSO_ZOOM));
    try {
      setPref(await preferencias.atualizar(pref.usuarioId, { tamanhoFonte: novo }));
    } catch (e) {
      console.warn('Erro ao mudar o zoom:', e);
    }
  }, [pref, preferencias]);

  // Guarda onde o usuário parou (posição em caracteres do texto)
  const salvarPosicao = useCallback(
    (posicao: number) => documentos.salvarProgresso(documentoId, posicao),
    [documentos, documentoId],
  );

  return {
    documento,
    pref,
    estilo: pref ? paraEstiloLeitura(pref) : null,
    proximaFonte,
    proximoZoom,
    salvarPosicao,
  };
}