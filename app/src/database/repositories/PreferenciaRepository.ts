/**
 * PreferenciaRepository
 * ---------------------------------------------------------------
 * Preferências de leitura do usuário (RF07): fonte, tamanho,
 * espaçamento e esquema de cor. Alimenta as telas Configurações
 * e Leitura.
 *
 * - obter(): devolve tudo já "resolvido" (nome da fonte + cores).
 * - atualizar(): altera só os campos informados.
 * - listarFontes()/listarEsquemas(): opções exibidas em Configurações.
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import type { AtualizarPreferencia, EsquemaCor, Fonte, Preferencia } from '../types';

const COLUNAS = `
  usuario_id AS usuarioId, fonte, tamanho_fonte AS tamanhoFonte, espacamento,
  esquema_cor AS esquemaCor, cor_fundo AS corFundo, cor_texto AS corTexto, cor_borda AS corBorda`;

export class PreferenciaRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async obter(usuarioId: number): Promise<Preferencia | null> {
    return this.db.getFirstAsync<Preferencia>(
      `SELECT ${COLUNAS} FROM v_preferencia_completa WHERE usuario_id = ?`,
      [usuarioId],
    );
  }

  /**
   * Atualiza apenas o que vier em `dados`. Fonte e esquema de cor são
   * informados pelo NOME; se o nome não existir, o banco rejeita (lança erro).
   */
  async atualizar(usuarioId: number, dados: AtualizarPreferencia): Promise<Preferencia | null> {
    const sets: string[] = [];
    const params: (string | number)[] = [];

    if (dados.fonte !== undefined) {
      sets.push('fonte_id = (SELECT id FROM fonte WHERE nome = ? AND disponivel = 1)');
      params.push(dados.fonte);
    }
    if (dados.tamanhoFonte !== undefined) {
      sets.push('tamanho_fonte = ?');
      params.push(Math.round(dados.tamanhoFonte));
    }
    if (dados.espacamento !== undefined) {
      sets.push('espacamento = ?');
      params.push(dados.espacamento);
    }
    if (dados.esquemaCor !== undefined) {
      sets.push('esquema_cor_id = (SELECT id FROM esquema_cor WHERE nome = ?)');
      params.push(dados.esquemaCor);
    }

    if (sets.length > 0) {
      await this.db.runAsync(
        `UPDATE preferencia SET ${sets.join(', ')} WHERE usuario_id = ?`,
        [...params, usuarioId],
      );
    }
    return this.obter(usuarioId);
  }

  /** Volta tudo para o padrão (Lexend, 20, confortável, azul). */
  async restaurarPadrao(usuarioId: number): Promise<Preferencia | null> {
    await this.db.runAsync(
      `UPDATE preferencia
          SET fonte_id = 1, tamanho_fonte = 20, espacamento = 'confortavel', esquema_cor_id = 1
        WHERE usuario_id = ?`,
      [usuarioId],
    );
    return this.obter(usuarioId);
  }

  async listarFontes(): Promise<Fonte[]> {
    const linhas = await this.db.getAllAsync<{ id: number; nome: string; disponivel: number }>(
      'SELECT id, nome, disponivel FROM fonte WHERE disponivel = 1 ORDER BY id',
    );
    return linhas.map((l) => ({ ...l, disponivel: l.disponivel === 1 }));
  }

  async listarEsquemas(): Promise<EsquemaCor[]> {
    return this.db.getAllAsync<EsquemaCor>(
      `SELECT id, nome, cor_fundo AS corFundo, cor_texto AS corTexto, cor_borda AS corBorda
         FROM esquema_cor ORDER BY id`,
    );
  }
}
