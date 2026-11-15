import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { Espaco, LumeColors } from '@/constants/lume';
import { paraEstiloLeitura } from '@/database';
import type { Espacamento } from '@/database';
import { useConfiguracoes } from '@/hooks/use-configuracoes';

const ESPACAMENTOS: { valor: Espacamento; rotulo: string }[] = [
  { valor: 'normal', rotulo: 'Normal' },
  { valor: 'confortavel', rotulo: 'Confortável' },
  { valor: 'amplo', rotulo: 'Amplo' },
];

export default function Configuracoes() {
  const { usuario, pref, fontes, esquemas, salvarNome, salvar, previaTamanho } = useConfiguracoes();
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (usuario) setNome(usuario.nome);
  }, [usuario]);

  if (!usuario || !pref) return null;
  const estilo = paraEstiloLeitura(pref);

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right']}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Voltar">
          <Icon name="back" size={28} color={LumeColors.texto} />
        </Pressable>
        <Text style={styles.titulo}>Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        {/* NOME */}
        <View style={[styles.cartao, styles.linhaNome]}>
          <Text style={styles.rotuloNome}>Nome:</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            onEndEditing={() => salvarNome(nome)}
            onBlur={() => salvarNome(nome)}
            maxLength={40}
            style={styles.inputNome}
            accessibilityLabel="Seu nome"
          />
        </View>

        <Text style={styles.secao}>Ajustes de Leitura</Text>

        {/* PRÉVIA + TAMANHO */}
        <View style={styles.cartao}>
          <Text style={[estilo.texto, styles.previa]}>Aa - Texto de Exemplo</Text>
          <View style={styles.linhaTamanho}>
            <Text style={styles.tamanho}>{pref.tamanhoFonte}</Text>
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={12}
              maximumValue={48}
              step={1}
              value={pref.tamanhoFonte}
              minimumTrackTintColor={LumeColors.primaria}
              thumbTintColor={LumeColors.primaria}
              onValueChange={previaTamanho}
              onSlidingComplete={(v) => salvar({ tamanhoFonte: v })}
            />
          </View>
        </View>

        {/* ESPAÇAMENTO */}
        <View style={styles.cartao}>
          <Text style={styles.rotulo}>Espaçamento</Text>
          <View style={styles.linha}>
            {ESPACAMENTOS.map((e) => {
              const ativo = pref.espacamento === e.valor;
              return (
                <Pressable key={e.valor} onPress={() => salvar({ espacamento: e.valor })}
                  style={[styles.pilula, ativo && styles.pilulaAtiva]}>
                  <Text style={[styles.pilulaTexto, ativo && styles.pilulaTextoAtivo]}>{e.rotulo}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* FONTE */}
        <View style={styles.cartao}>
          <Text style={styles.rotulo}>Fonte</Text>
          {fontes.map((f) => {
            const ativo = pref.fonte === f.nome;
            return (
              <Pressable key={f.id} onPress={() => salvar({ fonte: f.nome })}
                style={[styles.opcaoFonte, ativo && styles.opcaoFonteAtiva]}>
                <Text style={[{ fontFamily: f.nome }, styles.opcaoFonteTexto, ativo && { color: '#fff' }]}>
                  {f.nome}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ESQUEMAS DE COR */}
        <View style={styles.cartao}>
          <Text style={styles.rotulo}>Esquemas de Cor</Text>
          <View style={styles.linhaCores}>
            {esquemas.map((e) => {
              const ativo = pref.esquemaCor === e.nome;
              return (
                <Pressable key={e.id} onPress={() => salvar({ esquemaCor: e.nome })}
                  accessibilityLabel={`Esquema ${e.nome}`}
                  style={[
                    styles.amostra,
                    { backgroundColor: e.corFundo, borderColor: e.corBorda },
                    ativo && { borderColor: e.corTexto, borderWidth: 3 },
                  ]}>
                  {ativo && <Icon name="check" size={30} color={e.corTexto} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: LumeColors.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: Espaco.lg },
  titulo: { fontSize: 20, fontWeight: '700', color: LumeColors.texto },
  conteudo: { paddingHorizontal: Espaco.lg, paddingBottom: 40, gap: Espaco.md },
  cartao: {
    backgroundColor: LumeColors.cartaoClaro, borderColor: LumeColors.cartaoClaroBorda,
    borderWidth: 1, borderRadius: 24, padding: 18, gap: 12,
  },
  linhaNome: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
  rotuloNome: { fontWeight: '700', fontSize: 15, color: LumeColors.texto },
  inputNome: { flex: 1, fontSize: 15, color: LumeColors.texto, padding: 0 },
  secao: { fontSize: 15, color: '#333', marginTop: Espaco.sm },
  previa: { fontWeight: '600' },
  linhaTamanho: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tamanho: { color: LumeColors.primaria, fontWeight: '700', width: 28 },
  rotulo: { fontSize: 15, color: '#333' },
  linha: { flexDirection: 'row', gap: 8 },
  pilula: {
    flex: 1, paddingVertical: 6, borderRadius: 999, alignItems: 'center',
    borderWidth: 1, borderColor: LumeColors.cartaoClaroBorda,
  },
  pilulaAtiva: { backgroundColor: LumeColors.primaria, borderColor: LumeColors.primaria },
  pilulaTexto: { color: LumeColors.primaria, fontSize: 12, fontWeight: '600' },
  pilulaTextoAtivo: { color: '#fff' },
  opcaoFonte: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: LumeColors.primaria,
  },
  opcaoFonteAtiva: { backgroundColor: LumeColors.primaria },
  opcaoFonteTexto: { fontSize: 18, color: LumeColors.primaria },
  linhaCores: { flexDirection: 'row', justifyContent: 'space-around' },
  amostra: {
    width: 66, height: 66, borderRadius: 18, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
});