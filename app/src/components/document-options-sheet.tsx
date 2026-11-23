import React, { useEffect, useState } from 'react';
import {
  Alert, Keyboard, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text,
  TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LumeColors, Raio } from '@/constants/lume';
import type { Categoria, ItemBiblioteca } from '@/database';

type Modo = 'menu' | 'renomear' | 'tag' | 'excluir';

interface Props {
  item: ItemBiblioteca | null;
  categorias: Categoria[];
  onFechar: () => void;
  onRenomear: (id: number, titulo: string) => Promise<void>;
  onDefinirTag: (item: ItemBiblioteca, nome: string | null) => Promise<void>;
  onExcluir: (id: number) => Promise<void>;
}

export function DocumentOptionsSheet({
  item, categorias, onFechar, onRenomear, onDefinirTag, onExcluir,
}: Props) {
  const [modo, setModo] = useState<Modo>('menu');
  const [titulo, setTitulo] = useState('');
  const [novaTag, setNovaTag] = useState('');

  const insets = useSafeAreaInsets();
  const [tecladoAberto, setTecladoAberto] = useState(false);

  // Sempre que abrir para outro documento, volta ao menu
  useEffect(() => {
    setModo('menu');
    setTitulo(item?.titulo ?? '');
    setNovaTag('');
  }, [item]);

  // Só para saber se o teclado está aberto (o KeyboardAvoidingView cuida de subir a folha)
  useEffect(() => {
    const abre = Keyboard.addListener('keyboardDidShow', () => setTecladoAberto(true));
    const fecha = Keyboard.addListener('keyboardDidHide', () => setTecladoAberto(false));
    return () => {
      abre.remove();
      fecha.remove();
    };
  }, []);

  if (!item) return null;

  async function executar(acao: () => Promise<void>) {
    try {
      await acao();
      onFechar();
    } catch (e) {
      Alert.alert('Não foi possível concluir', e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar opções" />
      {/* 'padding' nos DOIS sistemas: sobe a folha acima do teclado (antes só funcionava no iOS) */}
      <KeyboardAvoidingView behavior="padding" style={styles.posicao} pointerEvents="box-none">
        <View
          style={[
            styles.folha,
            // sem teclado: respeita a barra de navegação do Android; com teclado: ele já ocupa esse espaço
            { paddingBottom: 20 + (tecladoAberto ? 0 : insets.bottom) },
          ]}>
          <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>

          {modo === 'menu' && (
            <>
              <Opcao rotulo="Renomear" onPress={() => setModo('renomear')} />
              <Opcao rotulo="Alterar tag" onPress={() => setModo('tag')} />
              <Opcao rotulo="Excluir" perigo onPress={() => setModo('excluir')} />
            </>
          )}

          {modo === 'renomear' && (
            <>
              <TextInput
                value={titulo}
                onChangeText={setTitulo}
                autoFocus
                maxLength={80}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (titulo.trim() && titulo.trim() !== item.titulo) {
                    executar(() => onRenomear(item.id, titulo));
                  }
                }}
                accessibilityLabel="Novo nome do documento"
              />
              <Botoes
                onCancelar={() => setModo('menu')}
                rotuloOk="Salvar"
                desativado={!titulo.trim() || titulo.trim() === item.titulo}
                onOk={() => executar(() => onRenomear(item.id, titulo))}
              />
            </>
          )}

          {modo === 'tag' && (
            <>
              <ScrollView
                style={styles.listaTags}
                contentContainerStyle={{ gap: 10 }}
                keyboardShouldPersistTaps="handled">
                <Opcao
                  rotulo="Sem tag"
                  marcado={item.categoriaId === null}
                  onPress={() => executar(() => onDefinirTag(item, null))}
                />
                {categorias.map((c) => (
                  <Opcao
                    key={c.id}
                    rotulo={c.nome}
                    cor={c.cor}
                    marcado={item.categoriaId === c.id}
                    onPress={() => executar(() => onDefinirTag(item, c.nome))}
                  />
                ))}
              </ScrollView>
              <TextInput
                value={novaTag}
                onChangeText={setNovaTag}
                placeholder="Ou crie uma nova tag"
                placeholderTextColor="#6B6B6B"
                maxLength={30}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (novaTag.trim()) executar(() => onDefinirTag(item, novaTag));
                }}
                accessibilityLabel="Nome da nova tag"
              />
              <Botoes
                onCancelar={() => setModo('menu')}
                rotuloOk="Criar e aplicar"
                desativado={!novaTag.trim()}
                onOk={() => executar(() => onDefinirTag(item, novaTag))}
              />
            </>
          )}

          {modo === 'excluir' && (
            <>
              <Text style={styles.aviso}>
                Excluir "{item.titulo}"? Essa ação não pode ser desfeita.
              </Text>
              <Botoes
                onCancelar={() => setModo('menu')}
                rotuloOk="Excluir"
                perigo
                onOk={() => executar(() => onExcluir(item.id))}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Opcao({ rotulo, onPress, perigo, marcado, cor }: {
  rotulo: string; onPress: () => void; perigo?: boolean; marcado?: boolean; cor?: string | null;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.opcao}>
      {cor ? <View style={[styles.bolinha, { backgroundColor: cor }]} /> : null}
      <Text style={[styles.opcaoTexto, perigo && { color: '#B3261E' }]}>{rotulo}</Text>
      {marcado ? <Text style={styles.marca}>✓</Text> : null}
    </Pressable>
  );
}

function Botoes({ onCancelar, onOk, rotuloOk, desativado, perigo }: {
  onCancelar: () => void; onOk: () => void; rotuloOk: string; desativado?: boolean; perigo?: boolean;
}) {
  return (
    <View style={styles.botoes}>
      <Pressable onPress={onCancelar} style={[styles.botao, styles.botaoSec]} accessibilityRole="button">
        <Text style={styles.botaoSecTexto}>Cancelar</Text>
      </Pressable>
      <Pressable
        onPress={onOk}
        disabled={desativado}
        accessibilityRole="button"
        style={[styles.botao, { backgroundColor: perigo ? '#B3261E' : LumeColors.primaria }, desativado && { opacity: 0.4 }]}>
        <Text style={styles.botaoTexto}>{rotuloOk}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  posicao: { flex: 1, justifyContent: 'flex-end' },
  folha: {
    backgroundColor: LumeColors.fundo, padding: 20, gap: 10,
    borderTopLeftRadius: Raio.cartao + 8, borderTopRightRadius: Raio.cartao + 8,
  },
  titulo: { fontSize: 17, fontWeight: '700', color: LumeColors.texto, marginBottom: 4 },
  opcao: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: LumeColors.cartaoClaroBorda,
  },
  opcaoTexto: { flex: 1, fontSize: 16, color: LumeColors.texto },
  marca: { color: LumeColors.primaria, fontWeight: '700', fontSize: 18 },
  bolinha: { width: 12, height: 12, borderRadius: 6 },
  listaTags: { maxHeight: 230, flexGrow: 0 },
  input: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: LumeColors.cartaoClaroBorda, padding: 12, fontSize: 16,
    color: LumeColors.texto,
  },
  aviso: { fontSize: 15, color: LumeColors.texto, lineHeight: 22 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 4 },
  botao: { flex: 1, paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  botaoSec: { backgroundColor: LumeColors.cartaoClaro, borderWidth: 1, borderColor: LumeColors.cartaoClaroBorda },
  botaoSecTexto: { color: LumeColors.primaria, fontWeight: '700', fontSize: 15 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});