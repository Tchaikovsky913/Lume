/**
 * src/app/index.tsx  —  HOME do Lume
 * ---------------------------------------------------------------
 * Saudação, "Nova Digitalização", atalhos (Importar Imagem / Biblioteca)
 * e a lista "Continue Lendo" lida do banco.
 *
 * As navegações ainda não têm tela de destino: os TODO abaixo marcam
 * onde ligar `router.push(...)` quando as rotas existirem.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionCard } from '@/components/action-card';
import { CircleButton } from '@/components/circle-button';
import { ContinueReadingCard } from '@/components/continue-reading-card';
import { HeroButton } from '@/components/hero-button';
import { Espaco, LumeColors } from '@/constants/lume';
import { saudacao, useHome } from '@/hooks/use-home';
import { router } from 'expo-router'; //router

import { Pressable } from 'react-native';
import { useRepositorios } from '@/database/DatabaseProvider';

export default function Home() {
  const { usuario, continuar, carregando, erro } = useHome();

  const { usuarios, categorias, documentos } = useRepositorios();

async function criarTeste() {
  const u = (await usuarios.obterPrimeiro())!;
  const cat = await categorias.obterOuCriar(u.id, 'RPG', '#B7A1DB');
  const texto =
    'Bem-vindo ao Dragon Blazers.\n\n' +
    'Este é um RPG inspirado em DELTARUNE.\n\n' +
    'É um projeto extraoficial. Não tem relação com Toby Fox nem com sua equipe de desenvolvimento.\n\n' +
    'O jogo recria o sistema de magia de DELTARUNE em formato de RPG de mesa.\n\n' +
    'As regras foram feitas para serem simples.';
  const doc = await documentos.criar({
    usuarioId: u.id,
    titulo: 'Dragon Blazers',
    origem: 'texto',
    categoriaId: cat.id,
    corCapa: '#B7A1DB',
    textoOriginal: texto,
    textoAdaptado: texto,
  });
  await documentos.salvarProgresso(doc.id, 10); // faz aparecer em "Continue Lendo"
  router.push({ pathname: '/leitor/[id]', params: { id: doc.id } });
}

  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? '';

  return (
    <SafeAreaView style={styles.tela} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.topo}>
          <CircleButton icone="camera" rotulo="Abrir câmera" /* TODO: rota da câmera */ />
          <View style={styles.topoDireita}>
            <CircleButton icone="settings" rotulo="Configurações" /* TODO: rota de configurações */ />
            <CircleButton icone="folder" rotulo="Pastas" /* TODO: rota de categorias */ />
          </View>
        </View>

        <Text style={styles.saudacao}>
          {saudacao()}, <Text style={styles.nome}>{primeiroNome}</Text>
        </Text>

        <HeroButton
          titulo="Nova Digitalização"
          subtitulo="Aponte a câmera para o seu texto."
          /* TODO: rota de digitalização */
        />

        <View style={styles.linha}>
          <ActionCard icone="import" titulo={'Importar\nImagem'} /* TODO: importar imagem */ />
          <ActionCard icone="library" titulo="Biblioteca" onPress={() => router.push('/biblioteca')} />
        </View>

        <Text style={styles.secao}>Continue Lendo</Text>

        <Pressable onPress={criarTeste} style={{ padding: 12, backgroundColor: '#ddd', borderRadius: 12 }}>
  <Text>[TESTE] Criar texto e abrir leitor</Text>
</Pressable>

        {erro ? (
          <Text style={styles.vazio}>Não foi possível carregar seus textos.</Text>
        ) : carregando ? null : continuar.length === 0 ? (
          <Text style={styles.vazio}>
            Nada por aqui ainda. Digitalize ou importe um texto para começar.
          </Text>
        ) : (
          continuar.map((item) => (
           <ContinueReadingCard
  key={item.id}
  item={item}
  onPress={(it) => router.push({ pathname: '/leitor/[id]', params: { id: it.id } })}
/>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: LumeColors.fundo },
  conteudo: { padding: Espaco.lg, paddingBottom: Espaco.xl * 2, gap: Espaco.md },
  topo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Espaco.sm },
  topoDireita: { flexDirection: 'row', gap: Espaco.md },
  saudacao: { fontSize: 15, color: LumeColors.texto },
  nome: { color: LumeColors.primaria, fontWeight: '700' },
  linha: { flexDirection: 'row', gap: Espaco.md },
  secao: { fontSize: 16, color: LumeColors.texto, marginTop: Espaco.lg },
  vazio: { fontSize: 14, color: '#555', paddingVertical: Espaco.md },
});
