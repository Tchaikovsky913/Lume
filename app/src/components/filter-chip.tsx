import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LumeColors } from '@/constants/lume';

interface Props {
  rotulo: string;
  cor?: string | null; // bolinha colorida (opcional)
  ativo: boolean;
  onPress: () => void;
}

export function FilterChip({ rotulo, cor, ativo, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.chip, ativo && styles.chipAtivo]}>
      {cor ? <View style={[styles.bolinha, { backgroundColor: cor }]} /> : null}
      <Text style={[styles.texto, ativo && styles.textoAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999,
    backgroundColor: LumeColors.cartaoClaro,
    borderWidth: 1, borderColor: LumeColors.cartaoClaroBorda,
  },
  chipAtivo: { backgroundColor: LumeColors.primaria, borderColor: LumeColors.primaria },
  bolinha: { width: 12, height: 12, borderRadius: 6 },
  texto: { color: LumeColors.primaria, fontSize: 15 },
  textoAtivo: { color: '#fff', fontWeight: '700' },
});