/**
 * index.ts
 * ---------------------------------------------------------------
 * Ponto único de importação do módulo de banco de dados.
 * `criarRepositorios(db)` monta todas as classes de uma vez.
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { CategoriaRepository } from './repositories/CategoriaRepository';
import { DocumentoRepository } from './repositories/DocumentoRepository';
import { PreferenciaRepository } from './repositories/PreferenciaRepository';
import { UsuarioRepository } from './repositories/UsuarioRepository';
import { LimpezaService } from './services/LimpezaService';

export function criarRepositorios(db: SQLiteDatabase) {
  return {
    usuarios: new UsuarioRepository(db),
    preferencias: new PreferenciaRepository(db),
    categorias: new CategoriaRepository(db),
    documentos: new DocumentoRepository(db),
    limpeza: new LimpezaService(db),
  };
}

export type Repositorios = ReturnType<typeof criarRepositorios>;

export { getDb, fecharDb } from './database';
export { paraEstiloLeitura } from './estiloLeitura';
export { agoraISO } from './utils';
export * from './types';
export { UsuarioRepository } from './repositories/UsuarioRepository';
export { PreferenciaRepository } from './repositories/PreferenciaRepository';
export { CategoriaRepository } from './repositories/CategoriaRepository';
export { DocumentoRepository } from './repositories/DocumentoRepository';
export { LimpezaService } from './services/LimpezaService';
