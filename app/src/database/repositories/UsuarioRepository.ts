/**
 * UsuarioRepository
 * ---------------------------------------------------------------
 * CRUD da tabela `usuario` (dados de cadastro).
 * Ao criar um usuário, o próprio banco cria as preferências padrão
 * (trigger trg_usuario_preferencia_padrao).
 *
 * Como o banco é local, normalmente existe 1 usuário por aparelho:
 * use `obterPrimeiro()` na abertura do app para saber se já há cadastro.
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import type { Usuario } from '../types';

const COLUNAS = `id, nome, email, criado_em AS criadoEm, atualizado_em AS atualizadoEm`;

export class UsuarioRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async criar(nome: string, email?: string | null): Promise<Usuario> {
    const r = await this.db.runAsync('INSERT INTO usuario (nome, email) VALUES (?, ?)', [
      nome.trim(),
      email?.trim() || null,
    ]);
    return (await this.obter(r.lastInsertRowId))!;
  }

  async obter(id: number): Promise<Usuario | null> {
    return this.db.getFirstAsync<Usuario>(`SELECT ${COLUNAS} FROM usuario WHERE id = ?`, [id]);
  }

  /** Primeiro usuário cadastrado (ou null se o app ainda não tem cadastro). */
  async obterPrimeiro(): Promise<Usuario | null> {
    return this.db.getFirstAsync<Usuario>(`SELECT ${COLUNAS} FROM usuario ORDER BY id LIMIT 1`);
  }

  async atualizar(
    id: number,
    dados: { nome?: string; email?: string | null },
  ): Promise<Usuario | null> {
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    if (dados.nome !== undefined) {
      sets.push('nome = ?');
      params.push(dados.nome.trim());
    }
    if (dados.email !== undefined) {
      sets.push('email = ?');
      params.push(dados.email?.trim() || null);
    }
    if (sets.length > 0) {
      await this.db.runAsync(`UPDATE usuario SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
    }
    return this.obter(id);
  }

  /** Remove o usuário e, em cascata, preferências, categorias e documentos. */
  async remover(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM usuario WHERE id = ?', [id]);
  }
}
