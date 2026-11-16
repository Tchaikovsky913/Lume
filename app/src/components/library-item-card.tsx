import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/icons';
import { corDaCapa, LumeColors, Raio } from '@/constants/lume';
import type { ItemBiblioteca } from '@/database';
import { tempoRelativo } from '@/hooks/tempo-relativo';

export function LibraryItemCard({ item, onPress, onOpcoes }: {
  item: ItemBiblioteca; onPress?: () => void; onOpcoes?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.cartao} accessibilityRole="button">
      <View style={[styles.capa, { backgroundColor: corDaCapa(item.corCapa, item.id) }]} />
      <View style={styles.centro}>
        <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.data}>{tempoRelativo(item.criadoEm)}</Text>
      </View>
      <View style={styles.direita}>
        <Icon name="play" size={22} color={LumeColors.primaria} strokeWidth={1.8} />
        <Pressable
          onPress={onOpcoes}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel={`Opções de ${item.titulo}`}>
          <Icon name="more" size={24} color={LumeColors.primaria} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#fff', borderRadius: Raio.cartao, padding: 20, paddingVertical: 16,
    borderWidth: 1, borderColor: LumeColors.cartaoClaroBorda,
  },
  capa: { width: 62, height: 71, borderRadius: Raio.capa },
  centro: { flex: 1, gap: 18 },
  titulo: { fontSize: 16, fontWeight: '700', color: LumeColors.texto },
  data: { fontSize: 13, color: '#333' },
  direita: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'space-between' },
});