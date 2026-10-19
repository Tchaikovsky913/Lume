/**
 * database.ts
 * ---------------------------------------------------------------
 * Abre o arquivo lume.db (uma única vez, padrão singleton), liga as
 * chaves estrangeiras e aplica as migrações pendentes.
 *
 * Uso:  const db = await getDb();
 */
import * as SQLite from 'expo-sqlite';
import { MIGRACOES } from './schema';

export const NOME_BANCO = 'lume.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Retorna sempre a mesma conexão (abre e migra na primeira chamada). */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = abrirEMigrar().catch((erro) => {
      dbPromise = null; // permite tentar de novo se falhar
      throw erro;
    });
  }
  return dbPromise;
}

async function abrirEMigrar(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(NOME_BANCO);
  // foreign_keys precisa ser ligado a cada conexão; WAL melhora desempenho.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrar(db);
  return db;
}

/** Executa só as migrações acima da versão gravada no aparelho. */
async function migrar(db: SQLite.SQLiteDatabase): Promise<void> {
  const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const versaoAtual = linha?.user_version ?? 0;

  for (let i = versaoAtual; i < MIGRACOES.length; i++) {
    const novaVersao = i + 1;
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRACOES[i]);
      await db.execAsync(`PRAGMA user_version = ${novaVersao}`);
    });
  }
}

/** Fecha a conexão (útil em testes). */
export async function fecharDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await db.closeAsync();
    dbPromise = null;
  }
}
