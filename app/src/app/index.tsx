/**
 * src/app/index.tsx  —  TELA DE TESTE DO BANCO (temporária)
 * ---------------------------------------------------------------
 * Substitui a Home de demonstração do template. Serve para provar
 * que o SQLite está funcionando no celular:
 *   - cria o usuário na primeira abertura (e as preferências padrão)
 *   - mostra as preferências lidas do banco, aplicadas num cartão de leitura
 *   - botões alteram as preferências (UPDATE) e criam documentos (INSERT)
 *   - FECHE e REABRA o app: os dados devem continuar lá (persistência)
 *
 * Quando terminar os testes, apague este conteúdo e monte a Home real.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { paraEstiloLeitura } from '@/database';
import type { Espacamento, ItemBiblioteca, Preferencia, Usuario } from '@/database';
import { useRepositorios } from '@/database/DatabaseProvider';

const ESQUEMAS = ['azul', 'roxo', 'laranja', 'verde'];
const ESPACAMENTOS: Espacamento[] = ['normal', 'confortavel', 'amplo'];

const TEXTO_EXEMPLO =
  'Bem-vindo ao Lume. Este é um texto de exemplo para testar as preferências de ' +
  'leitura salvas no banco de dados local. Mude a cor, o tamanho e o espaçamento.';

export default function TesteBanco() {
  const { usuarios, preferencias, documentos, categorias } = useRepositorios();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pref, setPref] = useState<Preferencia | null>(null);
  const [biblioteca, setBiblioteca] = useState<ItemBiblioteca[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      let u = await usuarios.obterPrimeiro();
      if (!u) u = await usuarios.criar('João Emanuel');
      setUsuario(u);
      setPref(await preferencias.obter(u.id));
      setBiblioteca(await documentos.listarBiblioteca(u.id));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    }
  }, [usuarios, preferencias, documentos]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function executar(acao: () => Promise<void>) {
    try {
      await acao();
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    }
  }

  const proximaCor = () =>
    executar(async () => {
      if (!usuario || !pref) return;
      const i = ESQUEMAS.indexOf(pref.esquemaCor);
      const proxima = ESQUEMAS[(i + 1) % ESQUEMAS.length];
      setPref(await preferencias.atualizar(usuario.id, { esquemaCor: proxima }));
    });

  const proximoEspacamento = () =>
    executar(async () => {
      if (!usuario || !pref) return;
      const i = ESPACAMENTOS.indexOf(pref.espacamento);
      const proximo = ESPACAMENTOS[(i + 1) % ESPACAMENTOS.length];
      setPref(await preferencias.atualizar(usuario.id, { espacamento: proximo }));
    });

  const mudarTamanho = (delta: number) =>
    executar(async () => {
      if (!usuario || !pref) return;
      const novo = Math.min(48, Math.max(12, pref.tamanhoFonte + delta));
      setPref(await preferencias.atualizar(usuario.id, { tamanhoFonte: novo }));
    });

  const criarDocumento = () =>
    executar(async () => {
      if (!usuario) return;
      const categoria = await categorias.obterOuCriar(usuario.id, 'Teste');
      const doc = await documentos.criar({
        usuarioId: usuario.id,
        titulo: `Documento de teste ${biblioteca.length + 1}`,
        origem: 'texto',
        categoriaId: categoria.id,
        textoOriginal: TEXTO_EXEMPLO,
        textoAdaptado: TEXTO_EXEMPLO,
      });
      // simula que o usuário leu 40% do texto
      await documentos.salvarProgresso(doc.id, Math.floor(TEXTO_EXEMPLO.length * 0.4));
      await carregar();
    });

  const apagarDocumentos = () =>
    executar(async () => {
      for (const item of biblioteca) await documentos.remover(item.id);
      await carregar();
    });

  const estilo = pref ? paraEstiloLeitura(pref) : null;

  return (
    <ScrollView contentContainerStyle={styles.tela}>
      <Text style={styles.titulo}>Teste do banco Lume</Text>

      {erro && <Text style={styles.erro}>Erro: {erro}</Text>}

      {!usuario || !pref || !estilo ? (
        <Text style={styles.texto}>Carregando...</Text>
      ) : (
        <>
          <Text style={styles.texto}>Usuário: {usuario.nome} (id {usuario.id})</Text>
          <Text style={styles.texto}>
            Fonte: {pref.fonte} · Tamanho: {pref.tamanhoFonte} · Espaçamento: {pref.espacamento} ·
            Cor: {pref.esquemaCor}
          </Text>

          <View style={[styles.cartao, estilo.cartao]}>
            <Text style={estilo.texto}>{TEXTO_EXEMPLO}</Text>
          </View>

          <View style={styles.linha}>
            <Botao rotulo="Trocar cor" onPress={proximaCor} />
            <Botao rotulo="Espaçamento" onPress={proximoEspacamento} />
          </View>
          <View style={styles.linha}>
            <Botao rotulo="Fonte -" onPress={() => mudarTamanho(-2)} />
            <Botao rotulo="Fonte +" onPress={() => mudarTamanho(2)} />
          </View>

          <Text style={styles.subtitulo}>Biblioteca ({biblioteca.length})</Text>
          {biblioteca.map((d) => (
            <Text key={d.id} style={styles.texto}>
              • {d.titulo} — {d.categoria ?? 'sem categoria'} — {d.progresso}% lido
            </Text>
          ))}

          <View style={styles.linha}>
            <Botao rotulo="Criar documento" onPress={criarDocumento} />
            <Botao rotulo="Apagar todos" onPress={apagarDocumentos} />
          </View>

          <Text style={styles.dica}>
            Feche o app por completo e abra de novo: usuário, preferências e documentos devem
            continuar iguais.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

function Botao({ rotulo, onPress }: { rotulo: string; onPress: () => void }) {
  return (
    <Pressable style={styles.botao} onPress={onPress}>
      <Text style={styles.botaoTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { padding: 20, paddingTop: 64, gap: 12, backgroundColor: '#fff', flexGrow: 1 },
  titulo: { fontSize: 24, fontWeight: '700', color: '#111' },
  subtitulo: { fontSize: 18, fontWeight: '600', marginTop: 8, color: '#111' },
  texto: { fontSize: 15, color: '#222' },
  erro: { color: '#b00020', fontSize: 14 },
  dica: { fontSize: 13, color: '#666', marginTop: 8 },
  cartao: { padding: 16, borderRadius: 20 },
  linha: { flexDirection: 'row', gap: 10 },
  botao: { flex: 1, backgroundColor: '#0077B6', padding: 12, borderRadius: 12 },
  botaoTexto: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});