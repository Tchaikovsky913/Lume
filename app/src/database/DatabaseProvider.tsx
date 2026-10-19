/**
 * DatabaseProvider.tsx
 * ---------------------------------------------------------------
 * Abre o banco ao iniciar o app e disponibiliza os repositórios
 * para qualquer tela via hook:
 *
 *   // App.tsx
 *   <DatabaseProvider fallback={<ActivityIndicator />}>
 *     <Navegacao />
 *   </DatabaseProvider>
 *
 *   // Em qualquer tela
 *   const { documentos, preferencias } = useRepositorios();
 */
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { criarRepositorios, getDb, type Repositorios } from './index';

const Contexto = createContext<Repositorios | null>(null);

interface Props {
  children: ReactNode;
  /** Exibido enquanto o banco abre/migra (ex.: tela de splash). */
  fallback?: ReactNode;
}

export function DatabaseProvider({ children, fallback = null }: Props) {
  const [repos, setRepos] = useState<Repositorios | null>(null);
  const [erro, setErro] = useState<Error | null>(null);

  useEffect(() => {
    let ativo = true;
    getDb()
      .then((db) => ativo && setRepos(criarRepositorios(db)))
      .catch((e) => ativo && setErro(e instanceof Error ? e : new Error(String(e))));
    return () => {
      ativo = false;
    };
  }, []);

  if (erro) throw erro; // capture com um Error Boundary
  if (!repos) return <>{fallback}</>;
  return <Contexto.Provider value={repos}>{children}</Contexto.Provider>;
}

export function useRepositorios(): Repositorios {
  const repos = useContext(Contexto);
  if (!repos) throw new Error('useRepositorios deve ser usado dentro de <DatabaseProvider>');
  return repos;
}
