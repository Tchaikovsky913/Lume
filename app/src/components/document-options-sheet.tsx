import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';

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

  // Sempre que abrir para outro documento, volta ao menu
  useEffect(() => {
    setModo('menu');
    setTitulo(item?.titulo ?? '');
    setNovaTag('');
  }, [item]);

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
    <Modal transparent animationType="fade" visible onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar opções" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.posicao}
        pointerEvents="box-none">
        <View style={styles.folha}>
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
              <TextInput
                value={novaTag}
                onChangeText={setNovaTag}
                placeholder="Ou crie uma nova tag"
                maxLength={30}
                style={styles.input}
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
  input: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: LumeColors.cartaoClaroBorda, padding: 12, fontSize: 16,
  },
  aviso: { fontSize: 15, color: LumeColors.texto, lineHeight: 22 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 4 },
  botao: { flex: 1, paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  botaoSec: { backgroundColor: LumeColors.cartaoClaro, borderWidth: 1, borderColor: LumeColors.cartaoClaroBorda },
  botaoSecTexto: { color: LumeColors.primaria, fontWeight: '700', fontSize: 15 },
  botaoTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});