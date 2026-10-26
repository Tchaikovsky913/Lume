import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LumeColors } from '@/constants/lume';

/** Barra de progresso. `valor` vai de 0 a 100. */
export function ProgressBar({ valor }: { valor: number }) {
  const pct = Math.min(100, Math.max(0, valor));
  return (
    <View
      style={styles.trilho}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}>
      <View style={[styles.preenchido, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: { height: 10, borderRadius: 5, backgroundColor: LumeColors.trilho, overflow: 'hidden' },
  preenchido: { height: '100%', borderRadius: 5, backgroundColor: LumeColors.primaria },
});
