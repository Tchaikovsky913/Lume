import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from '@/components/icons';
import { LumeColors, Raio } from '@/constants/lume';

interface Props {
  icone: IconName;
  titulo: string;
  onPress?: () => void;
}

/** Cartão claro de ação ("Importar Imagem", "Biblioteca"). */
export function ActionCard({ icone, titulo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}>
      <Icon name={icone} size={26} color={LumeColors.primaria} />
      <Text style={styles.titulo}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flex: 1,
    minHeight: 104,
    backgroundColor: LumeColors.cartaoClaro,
    borderColor: LumeColors.cartaoClaroBorda,
    borderWidth: 1,
    borderRadius: Raio.cartao,
    padding: 14,
    justifyContent: 'space-between',
  },
  pressionado: { opacity: 0.8 },
  titulo: { color: LumeColors.primaria, fontSize: 16, fontWeight: '700', paddingLeft: 14 },
});
