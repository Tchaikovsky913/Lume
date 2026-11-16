import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { CoresCapaPadrao } from '@/constants/lume';
import type { Categoria, ItemBiblioteca } from '@/database';
import { useRepositorios } from '@/database/DatabaseProvider';
import { apagarArquivo } from '@/utils/arquivos';

export type FiltroAtivo =
  | { tipo: 'todos' }
  | { tipo: 'favoritos' }
  | { tipo: 'categoria'; id: number };

export function useBiblioteca() {
  const { usuarios, categorias, documentos } = useRepositorios();
  const [filtro, setFiltro] = useState<FiltroAtivo>({ tipo: 'todos' });
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState<ItemBiblioteca[]>([]);
  const [listaCategorias, setListaCategorias] = useState<Categoria[]>([]);
  const ultimaCarga = useRef(0); // evita que uma resposta antiga sobrescreva uma nova

  const carregar = useCallback(async () => {
    const numero = ++ultimaCarga.current;
    const u = await usuarios.obterPrimeiro();
    if (!u) return;
    const [cats, lista] = await Promise.all([
      categorias.listar(u.id),
      documentos.listarBiblioteca(u.id, {
        somenteFavoritos: filtro.tipo === 'favoritos',
        categoriaId: filtro.tipo === 'categoria' ? filtro.id : undefined,
        busca,
      }),
    ]);
    if (numero !== ultimaCarga.current) return;
    setListaCategorias(cats);
    setItens(lista);
  }, [usuarios, categorias, documentos, filtro, busca]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  // ----- Ações do botão de opções -----

  const renomear = useCallback(
    async (id: number, titulo: string) => {
      await documentos.renomear(id, titulo);
      await carregar();
    },
    [documentos, carregar],
  );

  /** nome = null remove a tag; nome novo cria a categoria; nome existente reaproveita. */
  const definirTag = useCallback(
    async (item: ItemBiblioteca, nome: string | null) => {
      if (nome === null) {
        await documentos.mudarCategoria(item.id, null);
      } else {
        const existente = listaCategorias.find(
          (c) => c.nome.toLowerCase() === nome.trim().toLowerCase(),
        );
        const cor = CoresCapaPadrao[listaCategorias.length % CoresCapaPadrao.length];
        const cat = existente ?? (await categorias.obterOuCriar(item.usuarioId, nome, cor));
        await documentos.mudarCategoria(item.id, cat.id);
      }
      await carregar();
    },
    [documentos, categorias, listaCategorias, carregar],
  );

  const excluir = useCallback(
    async (id: number) => {
      const doc = await documentos.obter(id); // lê os caminhos ANTES de apagar o registro
      await documentos.remover(id);
      if (doc) {
        await apagarArquivo(doc.arquivoOrigem);
        await apagarArquivo(doc.arquivoExportado);
      }
      await carregar();
    },
    [documentos, carregar],
  );

  const secoes = useMemo(() => {
    const grupos: { titulo: string; itens: ItemBiblioteca[] }[] = [];
    for (const item of itens) {
      const titulo = item.categoria ?? 'Sem categoria';
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.titulo === titulo) ultimo.itens.push(item);
      else grupos.push({ titulo, itens: [item] });
    }
    return grupos;
  }, [itens]);

  return {
    filtro, setFiltro, busca, setBusca,
    categorias: listaCategorias, secoes,
    renomear, definirTag, excluir,
  };
}