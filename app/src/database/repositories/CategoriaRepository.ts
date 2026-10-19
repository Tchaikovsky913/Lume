import type { SQLiteDatabase } from 'expo-sqlite';
import type { Categoria } from '../types';

const COLUNAS = `id, usuario_id AS usuarioId, nome, cor`;

export class CategoriaRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async criar(usuarioId: number, nome: string, cor?: string | null): Promise<Categoria> {
    const r = await this.db.runAsync(
      'INSERT INTO categoria (usuario_id, nome, cor) VALUES (?, ?, ?)',
      [usuarioId, nome.trim(), cor ?? null],
    );
    return (await this.obter(r.lastInsertRowId))!;
  }

  async obterOuCriar(usuarioId: number, nome: string, cor?: string | null): Promise<Categoria> {
    const existente = await this.db.getFirstAsync<Categoria>(
      `SELECT ${COLUNAS} FROM categoria WHERE usuario_id = ? AND nome = ?`,
      [usuarioId, nome.trim()],
    );
    return existente ?? this.criar(usuarioId, nome, cor);
  }

  async obter(id: number): Promise<Categoria | null> {
    return this.db.getFirstAsync<Categoria>(`SELECT ${COLUNAS} FROM categoria WHERE id = ?`, [id]);
  }

  async listar(usuarioId: number): Promise<Categoria[]> {
    return this.db.getAllAsync<Categoria>(
      `SELECT ${COLUNAS} FROM categoria WHERE usuario_id = ? ORDER BY nome`,
      [usuarioId],
    );
  }

  async atualizar(id: number, dados: { nome?: string; cor?: string | null }): Promise<Categoria | null> {
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    if (dados.nome !== undefined) {
      sets.push('nome = ?');
      params.push(dados.nome.trim());
    }
    if (dados.cor !== undefined) {
      sets.push('cor = ?');
      params.push(dados.cor);
    }
    if (sets.length > 0) {
      await this.db.runAsync(`UPDATE categoria SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
    }
    return this.obter(id);
  }

  async remover(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM categoria WHERE id = ?', [id]);
  }
}
