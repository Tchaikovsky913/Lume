import { useCallback, useEffect, useState } from 'react';
import type { Documento, Fonte, Preferencia } from '@/database';
import { paraEstiloLeitura } from '@/database';
import { useRepositorios } from '@/database/DatabaseProvider';

export function useLeitor(documentoId: number) {
  const { usuarios, preferencias, documentos } = useRepositorios();
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [pref, setPref] = useState<Preferencia | null>(null);
  const [fontes, setFontes] = useState<Fonte[]>([]);

  useEffect(() => {
    (async () => {
      const u = await usuarios.obterPrimeiro();
      if (!u) return;
      setDocumento(await documentos.obter(documentoId));
      setPref(await preferencias.obter(u.id));
      setFontes(await preferencias.listarFontes());
    })();
  }, [documentoId, usuarios, documentos, preferencias]);

  // Botão "Aa": passa para a próxima fonte da lista (e volta ao início no fim)
  const proximaFonte = useCallback(async () => {
    if (!pref || fontes.length === 0) return;
    const i = fontes.findIndex((f) => f.nome === pref.fonte);
    const proxima = fontes[(i + 1) % fontes.length];
    setPref(await preferencias.atualizar(pref.usuarioId, { fonte: proxima.nome }));
  }, [pref, fontes, preferencias]);

  // Botão lupa: aumenta o tamanho; ao chegar no máximo (48), volta para 16
  const proximoZoom = useCallback(async () => {
    if (!pref) return;
    const novo = pref.tamanhoFonte >= 48 ? 16 : pref.tamanhoFonte + 4;
    setPref(await preferencias.atualizar(pref.usuarioId, { tamanhoFonte: novo }));
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