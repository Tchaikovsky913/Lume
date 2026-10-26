/**
 * hooks/use-home.ts
 * ---------------------------------------------------------------
 * Carrega o que a Home precisa do banco: usuário e "Continue Lendo".
 * Recarrega sempre que a tela volta ao foco (ex.: depois de ler).
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { ItemContinueLendo, Usuario } from '@/database';
import { useRepositorios } from '@/database/DatabaseProvider';

export function useHome() {
  const { usuarios, documentos } = useRepositorios();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [continuar, setContinuar] = useState<ItemContinueLendo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          let u = await usuarios.obterPrimeiro();
          if (!u) u = await usuarios.criar('Leitor'); // primeira abertura
          const lista = await documentos.listarContinueLendo(u.id);
          if (!ativo) return;
          setUsuario(u);
          setContinuar(lista);
          setErro(null);
        } catch (e) {
          if (ativo) setErro(e instanceof Error ? e.message : String(e));
        } finally {
          if (ativo) setCarregando(false);
        }
      })();
      return () => {
        ativo = false;
      };
    }, [usuarios, documentos]),
  );

  return { usuario, continuar, carregando, erro };
}

/** "Bom dia", "Boa tarde" ou "Boa noite" conforme a hora local. */
export function saudacao(data: Date = new Date()): string {
  const h = data.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
