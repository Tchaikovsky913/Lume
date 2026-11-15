import { useCallback, useEffect, useState } from 'react';
import type { AtualizarPreferencia, EsquemaCor, Fonte, Preferencia, Usuario } from '@/database';
import { useRepositorios } from '@/database/DatabaseProvider';

export function useConfiguracoes() {
  const { usuarios, preferencias } = useRepositorios();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pref, setPref] = useState<Preferencia | null>(null);
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [esquemas, setEsquemas] = useState<EsquemaCor[]>([]);

  useEffect(() => {
    (async () => {
      const u = await usuarios.obterPrimeiro();
      if (!u) return;
      setUsuario(u);
      setPref(await preferencias.obter(u.id));
      setFontes(await preferencias.listarFontes());
      setEsquemas(await preferencias.listarEsquemas());
    })();
  }, [usuarios, preferencias]);

  // Nome: só grava se não estiver vazio e se mudou
  const salvarNome = useCallback(async (nome: string) => {
    if (!usuario) return;
    const limpo = nome.trim();
    if (!limpo || limpo === usuario.nome) return;
    setUsuario((await usuarios.atualizar(usuario.id, { nome: limpo })) ?? usuario);
  }, [usuario, usuarios]);

  // Grava qualquer preferência (fonte, espaçamento, cor, tamanho)
  const salvar = useCallback(async (dados: AtualizarPreferencia) => {
    if (!usuario) return;
    setPref(await preferencias.atualizar(usuario.id, dados));
  }, [usuario, preferencias]);

  // Enquanto o dedo arrasta o slider: só atualiza a prévia, sem gravar
  const previaTamanho = useCallback((valor: number) => {
    setPref((p) => (p ? { ...p, tamanhoFonte: Math.round(valor) } : p));
  }, []);

  return { usuario, pref, fontes, esquemas, salvarNome, salvar, previaTamanho };
}