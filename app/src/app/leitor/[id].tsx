import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/circle-button';
import { Icon } from '@/components/icons';
import { LumeColors } from '@/constants/lume';
import { useLeitor } from '@/hooks/use-leitor';

export default function Leitor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { documento, pref, estilo, proximaFonte, proximoZoom, salvarPosicao } = useLeitor(Number(id));
  const [modoMarcar, setModoMarcar] = useState(false); // usado no Passo 7

  if (!documento || !pref || !estilo) return null;
  const texto = documento.textoAdaptado ?? '';

  // Calcula até onde o usuário rolou e guarda no banco
  function aoPararDeRolar(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const maximo = contentSize.height - layoutMeasurement.height;
    const proporcao = maximo > 0 ? contentOffset.y / maximo : 1;
    salvarPosicao(proporcao * texto.length);
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Voltar">
          <Icon name="back" size={28} color={LumeColors.texto} />
        </Pressable>
        <Text style={styles.titulo} numberOfLines={1}>{documento.titulo}</Text>
        <CircleButton icone="settings" rotulo="Configurações" />
      </View>

      <View style={[styles.cartao, estilo.cartao]}>
        <ScrollView
          contentContainerStyle={{ padding: 24 }}
          onMomentumScrollEnd={aoPararDeRolar}
          onScrollEndDrag={aoPararDeRolar}>
          <Text style={estilo.texto}>{texto}</Text>
        </ScrollView>
      </View>

      <View style={[styles.barra, { backgroundColor: pref.corBorda }]}>
        <Pressable onPress={proximaFonte} accessibilityLabel="Trocar fonte"
          style={[styles.botao, { backgroundColor: pref.corTexto }]}>
          <Text style={styles.aa}>Aa</Text>
        </Pressable>
        <Pressable onPress={() => setModoMarcar((m) => !m)} accessibilityLabel="Marcar texto"
          style={[styles.botao, { backgroundColor: pref.corTexto }, modoMarcar && styles.ativo]}>
          <Icon name="marker" size={24} color="#fff" />
        </Pressable>
        <Pressable onPress={proximoZoom} accessibilityLabel="Aumentar texto"
          style={[styles.botao, { backgroundColor: pref.corTexto }]}>
          <Icon name="zoom" size={24} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: LumeColors.fundo, paddingHorizontal: 16 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  titulo: { flex: 1, fontSize: 18, fontWeight: '700', color: LumeColors.texto },
  cartao: { flex: 1, borderRadius: 40, overflow: 'hidden' },
  barra: {
    alignSelf: 'center', flexDirection: 'row', gap: 4, marginVertical: 12,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
  },
  botao: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  ativo: { borderWidth: 3, borderColor: '#fff' },
  aa: { color: '#fff', fontSize: 20, fontWeight: '600' },
});