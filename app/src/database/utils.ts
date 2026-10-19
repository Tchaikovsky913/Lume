/**
 * utils.ts
 * ---------------------------------------------------------------
 * Funções auxiliares de data. Usam o MESMO formato dos DEFAULTs do
 * schema (ISO UTC sem milissegundos), para a ordenação por texto
 * funcionar corretamente.
 */

const semMilissegundos = (iso: string): string => iso.replace(/\.\d{3}Z$/, 'Z');

/** Data/hora atual: 2026-10-18T14:16:56Z */
export const agoraISO = (): string => semMilissegundos(new Date().toISOString());

/** Data de `dias` atrás, no mesmo formato. */
export const diasAtrasISO = (dias: number): string =>
  semMilissegundos(new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString());
