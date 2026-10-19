/**
 * LimpezaService
 * ---------------------------------------------------------------
 * Limpeza trimestral do histórico (RF08).
 *
 * Regra implementada: apaga documentos criados há mais de 90 dias,
 * EXCETO favoritos (decisão a confirmar com a equipe — para apagar
 * tudo, passe `manterFavoritos: false`).
 *
 * Os registros são removidos do banco numa transação e, depois, os
 * arquivos físicos (foto/PDF/exportado) são apagados. Para não
 * depender da versão do expo-file-system, a função que apaga o
 * arquivo é recebida por parâmetro. Exemplo:
 *
 *   import * as FileSystem from 'expo-file-system/legacy'; // SDK 54+
 *   // (em SDKs anteriores: 'expo-file-system')
 *   await limpezaService.executar({
 *     apagarArquivo: (uri) => FileSystem.deleteAsync(uri, { idempotent: true }),
 *   });
 *
 * Chame `executar()` ao abrir o app: é idempotente (se não há nada
 * vencido, não faz nada).
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { diasAtrasISO } from '../utils';

export interface OpcoesLimpeza {
  /** Quantos dias o histórico é mantido. Padrão: 90 (um trimestre). */
  dias?: number;
  /** Se true (padrão), documentos favoritos nunca são apagados. */
  manterFavoritos?: boolean;
  /** Apaga um arquivo do armazenamento do aparelho. */
  apagarArquivo?: (caminho: string) => Promise<void>;
}

export interface ResultadoLimpeza {
  documentosRemovidos: number;
  arquivosRemovidos: number;
  arquivosComFalha: string[];
}

export class LimpezaService {
  private db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async executar(opcoes: OpcoesLimpeza = {}): Promise<ResultadoLimpeza> {
    const dias = opcoes.dias ?? 90;
    const manterFavoritos = opcoes.manterFavoritos ?? true;
    const limite = diasAtrasISO(dias);
    const filtroFavorito = manterFavoritos ? 'AND favorito = 0' : '';

    const vencidos = await this.db.getAllAsync<{
      id: number;
      arquivoOrigem: string | null;
      arquivoExportado: string | null;
    }>(
      `SELECT id, arquivo_origem AS arquivoOrigem, arquivo_exportado AS arquivoExportado
         FROM documento
        WHERE criado_em < ? ${filtroFavorito}`,
      [limite],
    );

    if (vencidos.length === 0) {
      return { documentosRemovidos: 0, arquivosRemovidos: 0, arquivosComFalha: [] };
    }

    // 1) Remove os registros (tudo ou nada).
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `DELETE FROM documento WHERE criado_em < ? ${filtroFavorito}`,
        [limite],
      );
    });

    // 2) Remove os arquivos físicos; uma falha não interrompe as demais.
    let arquivosRemovidos = 0;
    const arquivosComFalha: string[] = [];
    if (opcoes.apagarArquivo) {
      const caminhos = vencidos.flatMap((d) => [d.arquivoOrigem, d.arquivoExportado]);
      for (const caminho of caminhos) {
        if (!caminho) continue;
        try {
          await opcoes.apagarArquivo(caminho);
          arquivosRemovidos++;
        } catch {
          arquivosComFalha.push(caminho);
        }
      }
    }

    return { documentosRemovidos: vencidos.length, arquivosRemovidos, arquivosComFalha };
  }
}
