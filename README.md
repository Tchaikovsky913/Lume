# Lume — Guia do Banco de Dados e do Projeto

Guia para a equipe do Lume. Cobre três assuntos:

1. [Comandos de instalação e configuração](#1-comandos-de-instalação-e-configuração)
2. [Onde a equipe de UI pode trabalhar](#2-onde-a-equipe-de-ui-pode-trabalhar)
3. [Como o banco de dados funciona](#3-como-o-banco-de-dados-funciona)

> **Resumo:** o app é React Native (Expo) com um banco **SQLite local** (`lume.db`), acessado pela biblioteca `expo-sqlite`. Todo o código do banco está em `app/src/database/`. A equipe de UI **não precisa escrever SQL**: basta usar o hook `useRepositorios()`.

---

## 1. Comandos de instalação e configuração

### 1.1 Configuração inicial (feita uma única vez por Otávio)

Estes comandos já foram executados. Estão aqui só como registro. **Os parceiros não precisam repeti-los.**

| Comando | Para que serve |
|---|---|
| `winget install OpenJS.NodeJS.LTS` | Instala o Node.js (versão LTS), que traz o `npm` e o `npx`. |
| `node -v` e `npx -v` | Confere se o Node e o npx foram instalados e mostram a versão. |
| `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` | Libera scripts locais no PowerShell (sem isso, o `npx` é bloqueado). Responder `S` quando perguntar. |
| `cd C:\PI-4\Lume` | Entra na pasta do repositório. |
| `npx create-expo-app@latest app` | Cria o projeto Expo na subpasta `app` (foi escolhido o SDK 57, compatível com o Expo Go). |
| `cd app` | Entra na pasta do projeto. |
| `npx expo install expo-sqlite` | Instala o SQLite no projeto. O pacote fica registrado no `package.json`. |
| `npx expo start --tunnel` | Inicia o servidor de desenvolvimento em modo túnel. |

### 1.2 Para os parceiros: rodar o projeto depois de clonar

**Pré-requisitos:** Node.js LTS, Git e o app **Expo Go** instalado no celular (Play Store ou App Store).

```powershell
# 1. (se necessário) instalar Node.js e Git
winget install OpenJS.NodeJS.LTS
winget install Git.Git

# 2. (se o PowerShell bloquear o npx) liberar scripts, uma vez só
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# 3. FECHAR e reabrir o terminal / VS Code, depois conferir
node -v
npx -v

# 4. clonar o repositório e entrar na pasta do app
git clone <URL-DO-REPOSITORIO>
cd Lume\app

# 5. instalar as dependências (já inclui expo-sqlite)
npm install

# 6. iniciar o app
npx expo start --tunnel
```

Depois, leia o **QR code** que aparece no terminal com o **Expo Go**.

**Atualizar o projeto no dia a dia:**

```powershell
git pull
npm install        # só é necessário se o package.json mudou
npx expo start --tunnel
```

> Não é preciso rodar `npx create-expo-app` nem `npx expo install expo-sqlite` de novo: o projeto já existe e o `expo-sqlite` já está no `package.json`. O `npm install` baixa tudo.
>
> Confira que a pasta `node_modules` **não** vai para o GitHub. O template do Expo já traz um `.gitignore` que a ignora.

### 1.3 Problemas encontrados e como resolver

| Mensagem / sintoma | Causa | Solução |
|---|---|---|
| `npx não é reconhecido como nome de cmdlet` | Terminal ou VS Code aberto antes de instalar o Node. | Fechar o terminal **e o VS Code por completo** e abrir de novo. Se persistir, reiniciar o computador. |
| `A execução de scripts foi desabilitada neste sistema` | Política de execução do PowerShell. | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` (ou usar o CMD). |
| App no celular mostra `Failed to download remote update` | O celular não alcançou o computador (Wi-Fi diferente, firewall ou rede que isola aparelhos). | Rodar `npx expo start --tunnel`. |
| `The package @expo/ngrok is required to use tunnels` | O modo túnel precisa desse pacote. | Responder `yes` para instalar. Se der erro depois, rodar o mesmo comando de novo ou `npm install --save-dev @expo/ngrok`. |
| QR code antigo não abre | O endereço do túnel muda a cada início. | Ler o QR code novo mostrado no terminal. |

**Dica:** o banco só funciona no celular ou emulador, **não no navegador** (tecla `w` do Expo).

---

## 2. Onde a equipe de UI pode trabalhar

### 2.1 Mapa das pastas

```
Lume/                          <- raiz do repositório
└── app/                       <- projeto Expo
    ├── package.json
    ├── assets/                <- imagens, ícones e (futuramente) fontes
    └── src/
        ├── app/               <- TELAS e rotas  (EQUIPE DE UI)
        │   ├── _layout.tsx    <- layout raiz (contém o DatabaseProvider)
        │   └── index.tsx      <- tela inicial (hoje é só uma tela de TESTE)
        ├── components/        <- componentes reutilizáveis  (EQUIPE DE UI)
        ├── constants/         <- cores, temas, valores fixos  (EQUIPE DE UI)
        ├── hooks/             <- hooks de interface  (EQUIPE DE UI)
        └── database/          <- BANCO DE DADOS  (não editar sem falar com o Otávio)
```

### 2.2 O que a UI pode fazer livremente

- **Criar e editar telas** em `src/app/`. O Expo Router usa roteamento por arquivos: cada arquivo vira uma tela. Sugestão de organização para o Lume, seguindo o Figma:

| Arquivo (sugestão) | Tela |
|---|---|
| `src/app/index.tsx` | Home (Nova Digitalização, Importar Imagem, Biblioteca, Continue Lendo) |
| `src/app/biblioteca.tsx` | Biblioteca (filtros Todos / Favoritos / categorias) |
| `src/app/leitura/[id].tsx` | Leitura do documento (o `[id]` é o id do documento) |
| `src/app/configuracoes.tsx` | Configurações (fonte, tamanho, espaçamento, esquema de cor) |

- **Criar componentes** em `src/components/` (cartões de documento, barra de progresso, botões, seletor de cor...).
- **Definir cores e temas** em `src/constants/`. As cores dos 4 esquemas de leitura (azul, roxo, laranja, verde) vêm do banco; as demais cores do app podem ficar aqui.
- **Abas e navegação:** o template criou duas abas de exemplo (Home e Explore), configuradas em `src/components/app-tabs`. Podem ser trocadas pelas do Lume.

### 2.3 O que a UI NÃO deve mexer

| Item | Motivo |
|---|---|
| `src/database/` | É o banco. Qualquer mudança de tabela exige uma migração (ver seção 3.7). Se precisar de um dado novo, peça ao Otávio. |
| O `<DatabaseProvider>` em `src/app/_layout.tsx` | É ele que abre o banco. Se for removido, `useRepositorios()` dá erro. Pode mudar o resto do layout, mas **mantenha o Provider envolvendo as telas**. |
| `src/app/index.tsx` atual | É só uma tela de teste do banco. Pode ser **substituída** pela Home real. |

### 2.4 Como uma tela usa o banco

A tela chama `useRepositorios()` e usa os métodos prontos. Não há SQL na UI:

```tsx
import { useRepositorios } from '@/database/DatabaseProvider';

const { usuarios, preferencias, categorias, documentos, limpeza } = useRepositorios();
```

| Tela | Métodos que ela provavelmente usa |
|---|---|
| **Home** | `usuarios.obterPrimeiro()` (nome na saudação) · `documentos.listarContinueLendo(usuarioId, limite)` · `documentos.criar(...)` ao digitalizar |
| **Biblioteca** | `documentos.listarBiblioteca(usuarioId, { somenteFavoritos, categoriaId, busca })` · `categorias.listar(usuarioId)` · `documentos.alternarFavorito(id)` |
| **Leitura** | `documentos.obter(id)` · `preferencias.obter(usuarioId)` + `paraEstiloLeitura(pref)` (estilo pronto) · `documentos.salvarProgresso(id, posicao)` |
| **Configurações** | `preferencias.obter(usuarioId)` · `preferencias.atualizar(usuarioId, {...})` · `preferencias.listarFontes()` · `preferencias.listarEsquemas()` · `preferencias.restaurarPadrao(usuarioId)` · `usuarios.atualizar(id, { nome })` |
| **Fluxo de OCR** | `documentos.criar({ status: 'processando', ... })` → `concluirProcessamento(id, textos)` ou `marcarErro(id, mensagem)` |

Pontos de atenção para a UI:

- **Fontes:** o banco guarda só o **nome** da fonte (`Lexend`, `Andika`, `OpenDyslexic`). Os arquivos das fontes precisam ser carregados no app (com `expo-font`) usando exatamente esses nomes.
- **Estilo de leitura pronto:** `paraEstiloLeitura(pref)` devolve `{ texto, cartao }` com `fontFamily`, `fontSize`, `lineHeight`, `letterSpacing` e cores, prontos para aplicar em `<Text>` e `<View>`.
- **Progresso:** `salvarProgresso(id, posicao)` recebe o **índice do caractere** onde o usuário parou. O percentual é calculado pelo banco.
- **Dados vêm sempre assíncronos:** todos os métodos retornam `Promise` (use `await`).

---

## 3. Como o banco de dados funciona

### 3.1 Visão geral

- É um banco **SQLite local**: um arquivo chamado `lume.db`, criado no armazenamento privado do app, no próprio celular. Funciona sem internet e **os dados não saem do aparelho** (ajuda no RN01 / LGPD).
- A biblioteca `expo-sqlite` faz a ponte entre o JavaScript e o SQLite nativo do Android/iOS.
- Na primeira abertura, o banco é criado por **migrações**. Nas aberturas seguintes, só as migrações novas rodam.
- O único dado que sai do aparelho é a imagem/PDF enviada ao OCR do Google Vision (RNF02/RNF03), e isso acontece fora do banco.

### 3.2 Camadas

```
Telas (UI)
   │  useRepositorios()
DatabaseProvider.tsx ──► index.ts  (monta os repositórios)
   │
Repositórios + LimpezaService     (escrevem o SQL, devolvem objetos tipados)
   │  runAsync / getFirstAsync / getAllAsync
database.ts ──► expo-sqlite ──► lume.db   (arquivo no celular)
   │
schema.ts                         (SQL de criação: tabelas, triggers, views)
```

Cada camada só fala com a de baixo. A UI nunca toca no SQL.

### 3.3 Modelo de dados

```
usuario 1 ─── 1 preferencia ─── N:1 ─► fonte
   │                      └──── N:1 ─► esquema_cor
   ├── 1:N ─► categoria 1 ─── N ─► documento
   └── 1:N ─► documento
```

Regras de exclusão: apagar um **usuário** apaga em cascata suas preferências, categorias e documentos. Apagar uma **categoria** não apaga os documentos: eles ficam sem categoria.

#### `usuario` — dados de cadastro
| Coluna | Tipo | Observação |
|---|---|---|
| `id` | INTEGER PK | Automático. |
| `nome` | TEXT | Obrigatório, não pode ser vazio. |
| `email` | TEXT | Opcional, único. |
| `criado_em`, `atualizado_em` | TEXT | Data ISO UTC, preenchida pelo banco. |

#### `fonte` — opções de fonte (tabela de domínio)
`id`, `nome` (único), `disponivel` (0/1). Vem com **Lexend** (padrão, RN03), **Andika** e **OpenDyslexic**.

#### `esquema_cor` — opções de cor (tabela de domínio)
`id`, `nome` (azul, roxo, laranja, verde), `cor_fundo`, `cor_texto`, `cor_borda` (hex). Os valores são aproximados e devem ser ajustados com as cores finais do Figma.

#### `preferencia` — preferências de leitura (1 por usuário, RF07)
| Coluna | Observação |
|---|---|
| `usuario_id` | PK e FK para `usuario`. |
| `fonte_id` | FK para `fonte`. Padrão: Lexend. |
| `tamanho_fonte` | Inteiro de 12 a 48. Padrão: 20. |
| `espacamento` | `normal`, `confortavel` ou `amplo`. Padrão: `confortavel`. |
| `esquema_cor_id` | FK para `esquema_cor`. Padrão: azul. |
| `atualizado_em` | Atualizado automaticamente. |

#### `categoria` — grupos da Biblioteca
`id`, `usuario_id`, `nome`, `cor`. O nome é único por usuário.

#### `documento` — textos adaptados guardados localmente (RF06 / RF09)
| Coluna | Observação |
|---|---|
| `id`, `usuario_id`, `categoria_id` | Chaves. A categoria é opcional. |
| `titulo` | Obrigatório. |
| `origem` | `camera`, `imagem`, `pdf` ou `texto`. |
| `texto_original` | Texto bruto devolvido pelo OCR. |
| `texto_adaptado` | Texto acessível que aparece na leitura. |
| `arquivo_origem` | Caminho local da foto/PDF enviado. |
| `arquivo_exportado` | Caminho do arquivo gerado no download (RF09). |
| `status` | `pendente`, `processando`, `concluido` ou `erro`. |
| `mensagem_erro` | Preenchida quando `status = 'erro'`. |
| `cor_capa` | Cor do quadradinho da lista. |
| `favorito` | 0 ou 1. |
| `posicao_leitura` | Índice do caractere onde o usuário parou. |
| `progresso` | 0 a 100 (calculado pelo banco). |
| `ultima_leitura_em` | Alimenta o "Continue Lendo". |
| `criado_em`, `atualizado_em` | Datas automáticas. |

### 3.4 Triggers, views e índices

**Triggers (automações do próprio banco)**

| Trigger | O que faz |
|---|---|
| `trg_usuario_preferencia_padrao` | Ao inserir um usuário, cria suas preferências padrão (Lexend, 20, confortável, azul). |
| `trg_usuario_atualizado` | Atualiza `atualizado_em` do usuário. |
| `trg_preferencia_atualizada` | Atualiza `atualizado_em` das preferências. |
| `trg_documento_atualizado` | Atualiza `atualizado_em` do documento. |

**Views (consultas prontas)**

| View | Usada por | O que devolve |
|---|---|---|
| `v_preferencia_completa` | Leitura e Configurações | Preferência já com o **nome** da fonte e as cores do esquema. |
| `v_biblioteca` | Biblioteca | Documentos concluídos com o nome da categoria. |
| `v_continue_lendo` | Home | Documentos concluídos, já iniciados e com menos de 100%, do mais recente ao mais antigo. |

**Índices** aceleram as listagens por usuário/data, por última leitura, favoritos e categoria.

### 3.5 Os arquivos, um a um

Todos ficam em `app/src/database/`.

| Arquivo | O que faz | Conexões |
|---|---|---|
| `types.ts` | Define em TypeScript o formato de cada tabela (`Usuario`, `Preferencia`, `Documento`...). Converte `snake_case` do banco em `camelCase`. | Usado por todos os repositórios e pela UI. |
| `utils.ts` | Gera datas no mesmo formato ISO que o banco usa por padrão (`agoraISO`, `diasAtrasISO`). | Usado por `DocumentoRepository` e `LimpezaService`. |
| `schema.ts` | Guarda o SQL de criação do banco dentro de um array de **migrações** (`MIGRACOES`). | Lido por `database.ts`. |
| `database.ts` | Abre o `lume.db` (uma única conexão), liga as chaves estrangeiras (`PRAGMA foreign_keys = ON`) e executa as migrações pendentes, controlando a versão com `PRAGMA user_version`. | Usa `expo-sqlite` e `schema.ts`. Fornece o `db` a todos. |
| `repositories/UsuarioRepository.ts` | Cadastro: `criar`, `obter`, `obterPrimeiro`, `atualizar`, `remover`. | Tabela `usuario`. |
| `repositories/PreferenciaRepository.ts` | Preferências: `obter`, `atualizar`, `restaurarPadrao`, `listarFontes`, `listarEsquemas`. Fonte e cor são informadas pelo **nome**. | View `v_preferencia_completa` e tabelas `preferencia`, `fonte`, `esquema_cor`. |
| `repositories/CategoriaRepository.ts` | Categorias: `criar`, `obterOuCriar`, `obter`, `listar`, `atualizar`, `remover`. | Tabela `categoria`. |
| `repositories/DocumentoRepository.ts` | Documentos: `criar`, `obter`, `listarBiblioteca`, `listarContinueLendo`, `concluirProcessamento`, `marcarErro`, `salvarProgresso`, `alternarFavorito`, `renomear`, `mudarCategoria`, `definirArquivoExportado`, `remover`. As listagens **não trazem os textos**, para ficarem rápidas. | Tabela `documento` e views `v_biblioteca` e `v_continue_lendo`. |
| `services/LimpezaService.ts` | Limpeza do histórico (RF08): apaga documentos com mais de 90 dias, **exceto favoritos**, e depois apaga os arquivos físicos. Recebe por parâmetro a função que apaga arquivos. | Tabela `documento`; usa `utils.ts`. |
| `estiloLeitura.ts` | Converte a `Preferencia` em estilo de React Native (`fontFamily`, `fontSize`, `lineHeight`, `letterSpacing`, cores). Não acessa o banco. | Usa `types.ts`. Chamado pelas telas. |
| `index.ts` | Reúne tudo: `criarRepositorios(db)` devolve `{ usuarios, preferencias, categorias, documentos, limpeza }`. Também exporta os tipos. | Importa todos os repositórios. |
| `DatabaseProvider.tsx` | Abre o banco quando o app inicia e entrega os repositórios via contexto. Expõe `useRepositorios()`. | Usa `getDb()` e `criarRepositorios()`. Fica no `_layout.tsx`. |

**Segurança do SQL:** todos os valores entram por parâmetros (`?`), nunca concatenados no texto da consulta, o que evita SQL injection.

### 3.6 Exemplo de ponta a ponta

1. O usuário toca em **Nova Digitalização**. A tela chama `documentos.criar({ status: 'processando', origem: 'camera', arquivoOrigem })`. O repositório faz um `INSERT` em `documento`.
2. O app envia a imagem ao Google Vision. Com a resposta, chama `documentos.concluirProcessamento(id, { textoOriginal, textoAdaptado })`. Um `UPDATE` grava os textos e muda o status para `concluido`. Se falhar, chama `marcarErro(id, mensagem)`.
3. Na **Leitura**, a tela chama `documentos.obter(id)` e `preferencias.obter(usuarioId)` e aplica `paraEstiloLeitura(pref)` ao texto.
4. Enquanto o usuário rola o texto, `salvarProgresso(id, posicao)` grava a posição. O banco calcula o percentual e registra `ultima_leitura_em`. O documento passa a aparecer na view `v_continue_lendo` (Home).
5. Em **Configurações**, `preferencias.atualizar(usuarioId, { esquemaCor: 'verde' })` faz um `UPDATE`, e a próxima Leitura já usa o verde.

### 3.7 Como alterar o banco (migrações)

**Nunca edite a migração existente** (`V1` em `schema.ts`): ela já rodou nos aparelhos. Para mudar, siga estes passos:

1. Em `schema.ts`, crie uma `V2` com o SQL da mudança (por exemplo, `ALTER TABLE documento ADD COLUMN ...`).
2. Adicione-a ao array: `export const MIGRACOES = [V1, V2];`.
3. Atualize os tipos em `types.ts` e as consultas dos repositórios.

Ao abrir o app, o `database.ts` compara a versão gravada no aparelho com a lista e executa só a `V2`, **sem perder os dados**.

**Durante o desenvolvimento**, se quiser recomeçar do zero, limpe os dados do app **Expo Go** no celular (Configurações do Android → Apps → Expo Go → Armazenamento → Limpar dados). Isso apaga o `lume.db`, e ele é recriado na próxima abertura.

### 3.8 Decisões em aberto e limitações atuais

| Item | Situação |
|---|---|
| **Limpeza trimestral (RF08)** | Implementada como "documentos com mais de 90 dias, exceto favoritos". Falta decidir com a equipe se favoritos devem ficar, e **chamar** `limpeza.executar(...)` ao abrir o app (ainda não está ligado). |
| **Fontes** | O banco guarda os nomes. Os arquivos das fontes ainda precisam ser carregados no app com `expo-font`. |
| **Login e senha** | Não são guardados. Se o login for local, usar hash ou o armazenamento seguro do sistema. |
| **Papel "Suporte"** | Não está modelado: o banco é local e do usuário final. Se quiserem um log de erros local, pode ser adicionado numa migração. |
| **Integração com OCR** | O banco já tem o ciclo de status (`processando` → `concluido`/`erro`), mas a chamada ao Google Vision ainda não foi implementada. |
| **Cores dos esquemas** | Valores aproximados dos protótipos; ajustar com o Figma. |
| **Teste de persistência** | Validado no celular: as preferências e documentos continuam depois de fechar e abrir o app. |
 S