import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LumeColors } from '@/constants/lume';
import { useRepositorios } from '@/database/DatabaseProvider';

const CIANO = '#00B4D8';
const AZUL_CLARO = '#8DB8EA';
const ROXO = '#B39DDB';

// ----- Medidas. As frações são da ÁREA ÚTIL (tela menos a barra de navegação). -----
const TOPO_BOTOES = 0.86; // onde começam os botões (se houver espaço)
const ALTURA_BOTAO = 55;
const ALTURA_CAMPO = 52;
const MARGEM_PONTOS = 24; // distância das bolinhas até a barra de navegação
const TAMANHO_PONTO = 13;
const FRACAO_TEXTO_TELA1 = 0.89; // onde TERMINA o texto da tela 1
const SUBIDA_MINIMA_TECLADO = 0.3; // quanto o conteúdo sobe ao digitar (fração da área útil)
const MARGEM_TEXTO = 20;
const MARGEM_BOTOES = 35;

const SLIDES = [
  {
    id: 'oi',
    imagem: require('@/assets/images/sparky/sparkle-outline-white.svg'),
    decoracao: 'canto',
    escala: 0.73, // tamanho do Sparky em relação à largura da tela
    centro: 0.55, // meio do Sparky (fração da área útil)
    tamanhoTitulo: 30,
  },
  {
    id: 'nome',
    imagem: require('@/assets/images/sparky/sparkle-curioso-outline-white.svg'),
    decoracao: 'topo',
    escala: 0.81,
    centro: 0.53,
    tamanhoTitulo: 22,
  },
  {
    // Esta tela tem o Sparky um pouco menor e mais alto para sobrar espaço ao botão "Começar"
    id: 'fim',
    imagem: require('@/assets/images/sparky/sparkle-descolado-outline-white.svg'),
    decoracao: 'barras',
    escala: 0.74,
    centro: 0.505,
    tamanhoTitulo: 30,
  },
] as const;

type Decoracao = (typeof SLIDES)[number]['decoracao'];

// ---------- formas decorativas do fundo ----------
function Circulo({ raio, cx, cor }: { raio: number; cx: number; cor: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        left: cx - raio,
        top: -raio,
        width: raio * 2,
        height: raio * 2,
        borderRadius: raio,
        backgroundColor: cor,
      }}
    />
  );
}

function Fundo({ tipo, largura }: { tipo: Decoracao; largura: number }) {
  if (tipo === 'canto') {
    return (
      <>
        <Circulo raio={largura * 0.6} cx={largura} cor={CIANO} />
        <Circulo raio={largura * 0.47} cx={largura} cor={AZUL_CLARO} />
        <Circulo raio={largura * 0.38} cx={largura} cor={ROXO} />
      </>
    );
  }
  if (tipo === 'topo') {
    return (
      <>
        <Circulo raio={largura * 0.5} cx={largura / 2} cor={CIANO} />
        <Circulo raio={largura * 0.43} cx={largura / 2} cor={AZUL_CLARO} />
        <Circulo raio={largura * 0.27} cx={largura / 2} cor={ROXO} />
      </>
    );
  }
  const larg = 71;
  const x0 = largura / 2 - larg * 1.5;
  const barras = [
    { cor: ROXO, alt: 195 },
    { cor: CIANO, alt: 272 },
    { cor: AZUL_CLARO, alt: 195 },
  ];
  return (
    <>
      {barras.map((b, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: x0 + i * larg,
            width: larg,
            height: b.alt,
            backgroundColor: b.cor,
            borderBottomLeftRadius: larg / 2,
            borderBottomRightRadius: larg / 2,
          }}
        />
      ))}
    </>
  );
}

// ---------- tela ----------
export default function BoasVindas() {
  const { usuarios } = useRepositorios();
  const insets = useSafeAreaInsets();
  const lista = useRef<FlatList>(null);

  // Tamanho REAL da área da tela (medido), para as posições baterem com o mockup
  const [area, setArea] = useState<{ largura: number; altura: number } | null>(null);
  const aoMedir = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ largura: width, altura: height });
  };

  const [indice, setIndice] = useState(0);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [teclado, setTeclado] = useState(0);

  // Altura do teclado: usada para subir o conteúdo e o campo de nome não ficar escondido
  useEffect(() => {
    const abrir = Keyboard.addListener('keyboardDidShow', (e) => setTeclado(e.endCoordinates.height));
    const fechar = Keyboard.addListener('keyboardDidHide', () => setTeclado(0));
    return () => {
      abrir.remove();
      fechar.remove();
    };
  }, []);

  const irPara = (i: number) => lista.current?.scrollToIndex({ index: i, animated: true });

  // Garante que exista um usuário no banco (é isso que marca "já fez o onboarding")
  async function garantirUsuario(nomeEscolhido?: string) {
    const existente = await usuarios.obterPrimeiro();
    if (existente) {
      if (!nomeEscolhido) return existente;
      return (await usuarios.atualizar(existente.id, { nome: nomeEscolhido })) ?? existente;
    }
    return usuarios.criar(nomeEscolhido || 'Leitor');
  }

  async function executar(acao: () => Promise<void>) {
    setSalvando(true);
    setErro(null);
    try {
      await acao();
    } catch {
      setErro('Algo deu errado. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  }

  const cadastrar = () => {
    const limpo = nome.trim();
    if (!limpo) return setErro('Digite como quer ser chamado.');
    executar(async () => {
      await garantirUsuario(limpo);
      Keyboard.dismiss();
      setEditando(false);
      irPara(2);
    });
  };

  const pular = () =>
    executar(async () => {
      await garantirUsuario();
      irPara(2);
    });

  const comecar = () =>
    executar(async () => {
      await garantirUsuario(); // cobre quem deslizou direto sem passar pela tela 2
      router.replace('/');
    });

  function renderSlide(item: (typeof SLIDES)[number], largura: number, alturaTotal: number) {
    const tamanho = largura * item.escala;
    const editandoAqui = item.id === 'nome' && editando;

    // Área útil: a tela menos a barra de navegação do Android
    const H = alturaTotal - insets.bottom;
    const topoPontos = H - MARGEM_PONTOS - TAMANHO_PONTO;
    // Botões nunca descem a ponto de encostar nas bolinhas
    const topoBotoes = Math.min(H * TOPO_BOTOES, topoPontos - 14 - ALTURA_BOTAO);
    const topoCampo = topoBotoes - 8 - ALTURA_CAMPO;

    // O texto é "preso" por baixo: se for maior, cresce para CIMA e nunca encosta nos botões
    const bordaTexto =
      item.id === 'oi' ? H * FRACAO_TEXTO_TELA1 : editandoAqui ? topoCampo - 16 : topoBotoes - 16;

    // Tela 2: quanto subir o conteúdo enquanto o teclado está aberto
    const baseConteudo = topoBotoes + ALTURA_BOTAO;
    const subirPeloTeclado = baseConteudo - (alturaTotal - teclado) + 16;
    const subir = editandoAqui ? Math.max(H * SUBIDA_MINIMA_TECLADO, subirPeloTeclado) : 0;

    const mensagemErro = erro ? <Text style={styles.erro}>{erro}</Text> : null;

    return (
      <View style={[styles.slide, { width: largura, height: alturaTotal }]}>
        <Fundo tipo={item.decoracao} largura={largura} />

        <View style={[styles.preencher, { transform: [{ translateY: -subir }] }]}>
          {/* Sparky (some enquanto o teclado está aberto, para não atrapalhar) */}
          <Image
            source={item.imagem}
            contentFit="contain"
            style={{
              position: 'absolute',
              width: tamanho,
              height: tamanho,
              left: (largura - tamanho) / 2,
              top: H * item.centro - tamanho / 2,
              opacity: editandoAqui ? 0 : 1,
            }}
          />

          {/* Título e texto (presos por baixo) */}
          <View
            style={{
              position: 'absolute',
              left: MARGEM_TEXTO,
              right: MARGEM_TEXTO,
              bottom: alturaTotal - bordaTexto,
              gap: 14,
            }}>
            <Text
              style={[
                styles.titulo,
                { fontSize: item.tamanhoTitulo, lineHeight: Math.round(item.tamanhoTitulo * 1.3) },
              ]}>
              {item.id === 'oi' && 'Oi, como vai?'}
              {item.id === 'nome' && 'Vamos nós conhecer melhor'}
              {item.id === 'fim' && 'Seja Bem-vindo!'}
            </Text>

            {item.id === 'oi' && (
              <Text style={styles.texto}>
                Meu nome é <Text style={styles.negrito}>Sparky</Text>, e vou ser seu guia dentro do
                app do Lume.
              </Text>
            )}
            {item.id === 'nome' && (
              <Text style={styles.texto}>Nem perguntei o seu nome. Como eu poderia te chamar?</Text>
            )}
            {item.id === 'fim' && (
              <Text style={styles.texto}>
                Aproveite sua leitura acessível e que cabe no seu bolso com o Lume, seja bem-vindo!
              </Text>
            )}
            {item.id !== 'oi' && mensagemErro}
          </View>

          {/* Tela 2: Cadastrar / Pular  (ou campo de nome) */}
          {item.id === 'nome' && !editando && (
            <View style={[styles.linhaBotoes, { top: topoBotoes }]}>
              <Pressable style={styles.botao} onPress={() => setEditando(true)} disabled={salvando}>
                <Text style={styles.botaoTexto}>Cadastrar</Text>
              </Pressable>
              <Pressable style={styles.botao} onPress={pular} disabled={salvando}>
                <Text style={styles.botaoTexto}>Pular</Text>
              </Pressable>
            </View>
          )}

          {item.id === 'nome' && editando && (
            <>
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
                placeholderTextColor="#6B7F99"
                maxLength={40}
                autoFocus
                onSubmitEditing={cadastrar}
                style={[
                  styles.input,
                  { top: topoCampo, left: MARGEM_BOTOES, right: MARGEM_BOTOES, height: ALTURA_CAMPO },
                ]}
              />
              <View style={[styles.linhaBotoes, { top: topoBotoes }]}>
                <Pressable style={styles.botao} onPress={() => setEditando(false)} disabled={salvando}>
                  <Text style={styles.botaoTexto}>Voltar</Text>
                </Pressable>
                <Pressable style={styles.botao} onPress={cadastrar} disabled={salvando}>
                  <Text style={styles.botaoTexto}>Continuar</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Tela 3: Começar */}
          {item.id === 'fim' && (
            <View style={[styles.linhaBotoes, { top: topoBotoes }]}>
              <Pressable style={styles.botao} onPress={comecar} disabled={salvando}>
                <Text style={styles.botaoTexto}>Começar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tela} onLayout={aoMedir}>
      <StatusBar style="light" />

      {area && (
        <>
          <FlatList
            ref={lista}
            data={SLIDES}
            keyExtractor={(s) => s.id}
            renderItem={({ item }) => renderSlide(item, area.largura, area.altura)}
            extraData={{ editando, teclado, erro, salvando, nome, area }}
            horizontal
            pagingEnabled
            scrollEnabled={!editando}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            getItemLayout={(_, i) => ({ length: area.largura, offset: area.largura * i, index: i })}
            onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
              setIndice(Math.round(e.nativeEvent.contentOffset.x / area.largura))
            }
          />

          <View
            style={[styles.pontos, { bottom: insets.bottom + MARGEM_PONTOS }]}
            pointerEvents="none">
            {SLIDES.map((s, i) => (
              <View key={s.id} style={[styles.ponto, i === indice && styles.pontoAtivo]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: LumeColors.primaria },
  slide: { overflow: 'hidden' },
  preencher: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  titulo: { color: '#fff', fontFamily: 'LexendBold' },
  texto: { color: '#fff', fontSize: 20, lineHeight: 28, fontFamily: 'Lexend' },
  negrito: { fontFamily: 'LexendBold' },
  linhaBotoes: {
    position: 'absolute',
    left: MARGEM_BOTOES,
    right: MARGEM_BOTOES,
    flexDirection: 'row',
    gap: 8,
  },
  botao: {
    flex: 1,
    height: ALTURA_BOTAO,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AZUL_CLARO,
    borderWidth: 2,
    borderColor: '#6FA3DE',
  },
  botaoTexto: { color: LumeColors.primaria, fontSize: 18, fontFamily: 'LexendBold' },
  input: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 17,
    color: LumeColors.texto,
    fontFamily: 'Lexend',
  },
  erro: { color: '#FFD6D6', fontSize: 14, fontFamily: 'Lexend' },
  pontos: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', gap: 8 },
  ponto: { width: TAMANHO_PONTO, height: TAMANHO_PONTO, borderRadius: 7, backgroundColor: '#333' },
  pontoAtivo: { backgroundColor: '#D9D9D9' },
});