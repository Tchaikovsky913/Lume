/**
 * types.ts
 * ---------------------------------------------------------------
 * Tipos TypeScript que representam as tabelas do banco.
 * Os nomes das colunas no SQLite são snake_case; aqui usamos
 * camelCase (os repositórios convertem com "AS" nos SELECTs).
 * Datas são strings ISO 8601 em UTC (ex.: 2026-10-18T14:16:56Z).
 */

export type Origem = 'camera' | 'imagem' | 'pdf' | 'texto';
export type StatusDocumento = 'pendente' | 'processando' | 'concluido' | 'erro';
export type Espacamento = 'normal' | 'confortavel' | 'amplo';

// ----- Usuário -------------------------------------------------
export interface Usuario {
  id: number;
  nome: string;
  email: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

// ----- Tabelas de domínio (Configurações) ----------------------
export interface Fonte {
  id: number;
  nome: string;
  disponivel: boolean;
}

export interface EsquemaCor {
  id: number;
  nome: string;
  corFundo: string;
  corTexto: string;
  corBorda: string;
}

// ----- Preferências (já "resolvidas" com nome da fonte e cores) -
export interface Preferencia {
  usuarioId: number;
  fonte: string;
  tamanhoFonte: number;
  espacamento: Espacamento;
  esquemaCor: string;
  corFundo: string;
  corTexto: string;
  corBorda: string;
}

/** Campos que a tela de Configurações pode alterar. */
export interface AtualizarPreferencia {
  fonte?: string; // nome em `fonte` (ex.: 'Lexend')
  tamanhoFonte?: number; // 12 a 48
  espacamento?: Espacamento;
  esquemaCor?: string; // nome em `esquema_cor` (ex.: 'azul')
}

// ----- Categoria -----------------------------------------------
export interface Categoria {
  id: number;
  usuarioId: number;
  nome: string;
  cor: string | null;
}

// ----- Documento -----------------------------------------------
/** Documento completo (inclui os textos, que podem ser grandes). */
export interface Documento {
  id: number;
  usuarioId: number;
  categoriaId: number | null;
  titulo: string;
  origem: Origem;
  textoOriginal: string | null;
  textoAdaptado: string | null;
  arquivoOrigem: string | null;
  arquivoExportado: string | null;
  status: StatusDocumento;
  mensagemErro: string | null;
  corCapa: string | null;
  favorito: boolean;
  posicaoLeitura: number;
  progresso: number; // 0 a 100
  ultimaLeituraEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface NovoDocumento {
  usuarioId: number;
  titulo: string;
  origem: Origem;
  categoriaId?: number | null;
  textoOriginal?: string | null;
  textoAdaptado?: string | null;
  arquivoOrigem?: string | null;
  corCapa?: string | null;
  status?: StatusDocumento; // padrão: 'concluido'
}

/** Item leve para a tela Biblioteca (sem os textos). */
export interface ItemBiblioteca {
  id: number;
  usuarioId: number;
  titulo: string;
  corCapa: string | null;
  favorito: boolean;
  criadoEm: string;
  progresso: number;
  categoriaId: number | null;
  categoria: string | null;
}

/** Item leve para "Continue Lendo" na Home. */
export interface ItemContinueLendo {
  id: number;
  usuarioId: number;
  titulo: string;
  corCapa: string | null;
  progresso: number;
  ultimaLeituraEm: string;
}

export interface FiltroBiblioteca {
  somenteFavoritos?: boolean;
  categoriaId?: number;
  busca?: string; // procura no título
}
