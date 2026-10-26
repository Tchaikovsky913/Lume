import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/icons';
import { LumeColors } from '@/constants/lume';

interface Props {
  icone: IconName;
  rotulo: string; // acessibilidade
  onPress?: () => void;
}

/** Botão redondo do topo da Home (câmera, configurações, pastas). */
export function CircleButton({ icone, rotulo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={onPress}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}>
      <Icon name={icone} size={26} color={LumeColors.primaria} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: LumeColors.circulo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.7 },
});
