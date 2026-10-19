import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  Documento,
  FiltroBiblioteca,
  ItemBiblioteca,
  ItemContinueLendo,
  NovoDocumento,
} from '../types';
import { agoraISO } from '../utils';

const COLUNAS = `
  id, usuario_id AS usuarioId, categoria_id AS categoriaId, titulo, origem,
  texto_original AS textoOriginal, texto_adaptado AS textoAdaptado,
  arquivo_origem AS arquivoOrigem, arquivo_exportado AS arquivoExportado,
  status, mensagem_erro AS mensagemErro, cor_capa AS corCapa, favorito,
  posicao_leitura AS posicaoLeitura, progresso, ultima_leitura_em AS ultimaLeituraEm,
  criado_em AS criadoEm, atualizado_em AS atualizadoEm`;

type LinhaDocumento = Omit<Documento, 'favorito'> & { favorito: number };
type LinhaBiblioteca = Omit<ItemBiblioteca, 'favorito'> & { favorito: number };

export class DocumentoRepository {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  // Criação e leitura 

  async criar(dados: NovoDocumento): Promise<Documento> {
    const r = await this.db.runAsync(
      `INSERT INTO documento
         (usuario_id, categoria_id, titulo, origem, texto_original, texto_adaptado,
          arquivo_origem, cor_capa, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.usuarioId,
        dados.categoriaId ?? null,
        dados.titulo.trim(),
        dados.origem,
        dados.textoOriginal ?? null,
        dados.textoAdaptado ?? null,
        dados.arquivoOrigem ?? null,
        dados.corCapa ?? null,
        dados.status ?? 'concluido',
      ],
    );
    return (await this.obter(r.lastInsertRowId))!;
  }

  // Documento completo (com textos). 
  async obter(id: number): Promise<Documento | null> {
    const linha = await this.db.getFirstAsync<LinhaDocumento>(
      `SELECT ${COLUNAS} FROM documento WHERE id = ?`,
      [id],
    );
    return linha ? { ...linha, favorito: linha.favorito === 1 } : null;
  }

  // Listagens para as telas 

  // Tela Biblioteca. Itens sem categoria aparecem por último.
  async listarBiblioteca(
    usuarioId: number,
    filtro: FiltroBiblioteca = {},
  ): Promise<ItemBiblioteca[]> {
    const where: string[] = ['usuario_id = ?'];
    const params: (string | number)[] = [usuarioId];

    if (filtro.somenteFavoritos) where.push('favorito = 1');
    if (filtro.categoriaId !== undefined) {
      where.push('categoria_id = ?');
      params.push(filtro.categoriaId);
    }
    if (filtro.busca?.trim()) {
      where.push('titulo LIKE ?');
      params.push(`%${filtro.busca.trim()}%`);
    }

    const linhas = await this.db.getAllAsync<LinhaBiblioteca>(
      `SELECT id, usuario_id AS usuarioId, titulo, cor_capa AS corCapa, favorito,
              criado_em AS criadoEm, progresso, categoria_id AS categoriaId, categoria
         FROM v_biblioteca
        WHERE ${where.join(' AND ')}
        ORDER BY categoria IS NULL, categoria, criado_em DESC`,
      params,
    );
    return linhas.map((l) => ({ ...l, favorito: l.favorito === 1 }));
  }

  /** Home > "Continue Lendo": os últimos lidos que ainda não terminaram. */
  async listarContinueLendo(usuarioId: number, limite = 5): Promise<ItemContinueLendo[]> {
    return this.db.getAllAsync<ItemContinueLendo>(
      `SELECT id, usuario_id AS usuarioId, titulo, cor_capa AS corCapa, progresso,
              ultima_leitura_em AS ultimaLeituraEm
         FROM v_continue_lendo
        WHERE usuario_id = ?
        LIMIT ?`,
      [usuarioId, limite],
    );
  }

  // ----- Ciclo do processamento (OCR) ------------------------------------

  async concluirProcessamento(
    id: number,
    textos: { textoOriginal: string; textoAdaptado: string },
  ): Promise<Documento | null> {
    await this.db.runAsync(
      `UPDATE documento
          SET texto_original = ?, texto_adaptado = ?, status = 'concluido', mensagem_erro = NULL
        WHERE id = ?`,
      [textos.textoOriginal, textos.textoAdaptado, id],
    );
    return this.obter(id);
  }

  async marcarErro(id: number, mensagem: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE documento SET status = 'erro', mensagem_erro = ? WHERE id = ?`,
      [mensagem, id],
    );
  }

  // ----- Leitura e organização -------------------------------------------

  /**
   * Grava onde o usuário parou. `posicao` = índice do caractere em
   * texto_adaptado. O percentual é calculado pelo próprio banco.
   */
  async salvarProgresso(id: number, posicao: number): Promise<void> {
    const pos = Math.max(0, Math.floor(posicao));
    await this.db.runAsync(
      `UPDATE documento
          SET posicao_leitura   = ?,
              progresso         = MIN(100, CAST(? * 100.0 / MAX(length(COALESCE(texto_adaptado, '')), 1) AS INTEGER)),
              ultima_leitura_em = ?
        WHERE id = ?`,
      [pos, pos, agoraISO(), id],
    );
  }

  /** Inverte o favorito e devolve o novo valor. */
  async alternarFavorito(id: number): Promise<boolean> {
    await this.db.runAsync(
      'UPDATE documento SET favorito = 1 - favorito WHERE id = ?',
      [id],
    );
    const doc = await this.obter(id);
    return doc?.favorito ?? false;
  }

  async renomear(id: number, titulo: string): Promise<void> {
    await this.db.runAsync('UPDATE documento SET titulo = ? WHERE id = ?', [titulo.trim(), id]);
  }

  async mudarCategoria(id: number, categoriaId: number | null): Promise<void> {
    await this.db.runAsync('UPDATE documento SET categoria_id = ? WHERE id = ?', [categoriaId, id]);
  }

  /** Guarda o caminho do arquivo gerado no download (RF09). */
  async definirArquivoExportado(id: number, caminho: string | null): Promise<void> {
    await this.db.runAsync('UPDATE documento SET arquivo_exportado = ? WHERE id = ?', [caminho, id]);
  }

  /**
   * Remove só o registro. Apagar os arquivos físicos (foto/PDF/exportado)
   * é responsabilidade de quem chama — leia os caminhos com obter() antes.
   */
  async remover(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM documento WHERE id = ?', [id]);
  }
}
