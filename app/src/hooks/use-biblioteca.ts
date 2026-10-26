import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import type { Categoria, ItemBiblioteca } from '@/database';
import { useRepositorios } from '@/database/DatabaseProvider';

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

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const u = await usuarios.obterPrimeiro();
        if (!u) return;
        const cats = await categorias.listar(u.id);
        const lista = await documentos.listarBiblioteca(u.id, {
          somenteFavoritos: filtro.tipo === 'favoritos',
          categoriaId: filtro.tipo === 'categoria' ? filtro.id : undefined,
          busca,
        });
        if (ativo) {
          setListaCategorias(cats);
          setItens(lista);
        }
      })();
      return () => { ativo = false; };
    }, [usuarios, categorias, documentos, filtro, busca]),
  );

  // Agrupa por categoria (o banco já entrega ordenado)
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

  return { filtro, setFiltro, busca, setBusca, categorias: listaCategorias, secoes };
}