import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icons';
import { LumeColors, Raio } from '@/constants/lume';

interface Props {
  titulo: string;
  subtitulo: string;
  onPress?: () => void;
}

/** Botão principal azul ("Nova Digitalização"). */
export function HeroButton({ titulo, subtitulo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${subtitulo}`}
      onPress={onPress}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}>
      <View style={styles.icone}>
        <Icon name="scan" size={28} color={LumeColors.sobrePrimaria} strokeWidth={1.8} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: LumeColors.primaria,
    borderRadius: Raio.cartao,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  pressionado: { opacity: 0.88 },
  icone: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 2 },
  titulo: { color: LumeColors.sobrePrimaria, fontSize: 19, fontWeight: '700' },
  subtitulo: { color: LumeColors.sobrePrimaria, fontSize: 13.5 },
});
