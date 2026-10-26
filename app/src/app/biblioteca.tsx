import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { FilterChip } from '@/components/filter-chip';
import { Icon } from '@/components/icons';
import { LibraryItemCard } from '@/components/library-item-card';
import { Espaco, LumeColors } from '@/constants/lume';
import { useBiblioteca } from '@/hooks/use-biblioteca';

export default function Biblioteca() {
  const { filtro, setFiltro, busca, setBusca, categorias, secoes } = useBiblioteca();
  const [buscando, setBuscando] = useState(false);

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right']}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Voltar" hitSlop={12}>
          <Icon name="back" size={28} color={LumeColors.texto} />
        </Pressable>
        <Text style={styles.titulo}>Biblioteca</Text>
        <CircleButton icone="settings" rotulo="Configurações" />
        <CircleButton icone="search" rotulo="Buscar" onPress={() => setBuscando((b) => !b)} />
      </View>

      {buscando && (
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar pelo título..."
          style={styles.busca}
          autoFocus
        />
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}
        contentContainerStyle={{ gap: 8, paddingHorizontal: Espaco.lg }}>
        <FilterChip rotulo="Todos" ativo={filtro.tipo === 'todos'}
          onPress={() => setFiltro({ tipo: 'todos' })} />
        <FilterChip rotulo="Favoritos" cor="#F2AB72" ativo={filtro.tipo === 'favoritos'}
          onPress={() => setFiltro({ tipo: 'favoritos' })} />
        {categorias.map((c) => (
          <FilterChip key={c.id} rotulo={c.nome} cor={c.cor}
            ativo={filtro.tipo === 'categoria' && filtro.id === c.id}
            onPress={() => setFiltro({ tipo: 'categoria', id: c.id })} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.lista}>
        {secoes.length === 0 && <Text style={styles.vazio}>Nenhum texto encontrado.</Text>}
        {secoes.map((s) => (
          <View key={s.titulo} style={{ gap: Espaco.md }}>
            <Text style={styles.secao}>{s.titulo}</Text>
            {s.itens.map((item) => (
  <LibraryItemCard
    key={item.id}
    item={item}
    onPress={() => router.push({ pathname: '/leitor/[id]', params: { id: item.id } })}
  />
))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: LumeColors.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Espaco.lg },
  titulo: { flex: 1, fontSize: 20, fontWeight: '700', color: LumeColors.texto },
  busca: { marginHorizontal: Espaco.lg, marginBottom: Espaco.sm, padding: 12, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: LumeColors.cartaoClaroBorda },
  chips: { flexGrow: 0, marginBottom: Espaco.lg },
  lista: { padding: Espaco.lg, paddingTop: 0, gap: Espaco.lg },
  secao: { fontSize: 15, color: '#333' },
  vazio: { color: '#555', paddingVertical: Espaco.lg },
});