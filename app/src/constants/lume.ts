/**
 * constants/lume.ts
 * ---------------------------------------------------------------
 * Cores, espaçamentos e raios da identidade visual do Lume.
 * (O template do Expo continua em `theme.ts`; este arquivo é o
 * tema próprio do app.)
 */

export const LumeColors = {
  fundo: '#F4F0E8',
  texto: '#111111',
  primaria: '#0077B6',
  sobrePrimaria: '#FFFFFF',
  circulo: '#94C4DB', // botões redondos do topo
  cartaoClaro: '#E6F1FB', // fundo dos botões Importar / Biblioteca
  cartaoClaroBorda: '#8EC3EA',
  superficie: '#FFFFFF', // cartões de "Continue Lendo"
  trilho: '#D9D9D9', // fundo da barra de progresso
} as const;

/** Cores usadas nas capas quando o documento não tem `corCapa`. */
export const CoresCapaPadrao = ['#94C4EE', '#F2AB72', '#B7A1DB', '#7FCBA8', '#F2C46D', '#E99AA8'] as const;

export const Espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const Raio = { cartao: 24, botao: 20, capa: 14, pilula: 999 } as const;

/** Escolhe uma cor de capa estável a partir do id do documento. */
export function corDaCapa(corCapa: string | null, id: number): string {
  return corCapa ?? CoresCapaPadrao[Math.abs(id) % CoresCapaPadrao.length];
}
