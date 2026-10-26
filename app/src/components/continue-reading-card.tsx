import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icons';
import { ProgressBar } from '@/components/progress-bar';
import { corDaCapa, LumeColors, Raio } from '@/constants/lume';
import type { ItemContinueLendo } from '@/database';

interface Props {
  item: ItemContinueLendo;
  onPress?: (item: ItemContinueLendo) => void;
}

/** Linha da lista "Continue Lendo": capa colorida, título, progresso e play. */
export function ContinueReadingCard({ item, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Continuar lendo ${item.titulo}, ${Math.round(item.progresso)}% lido`}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}>
      <View style={[styles.capa, { backgroundColor: corDaCapa(item.corCapa, item.id) }]} />
      <View style={styles.centro}>
        <Text style={styles.titulo} numberOfLines={1}>
          {item.titulo}
        </Text>
        <ProgressBar valor={item.progresso} />
      </View>
      <View style={styles.play}>
        <Icon name="play" size={22} color={LumeColors.primaria} strokeWidth={1.8} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: LumeColors.superficie,
    borderColor: LumeColors.cartaoClaroBorda,
    borderWidth: 1,
    borderRadius: Raio.cartao,
    padding: 20,
    paddingVertical: 16,
  },
  pressionado: { opacity: 0.85 },
  capa: { width: 62, height: 71, borderRadius: Raio.capa },
  centro: { flex: 1, gap: 12 },
  titulo: { color: LumeColors.texto, fontSize: 16, fontWeight: '700' },
  play: { alignSelf: 'flex-start' },
});
