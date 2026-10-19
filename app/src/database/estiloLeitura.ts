/**
 * estiloLeitura.ts
 * ---------------------------------------------------------------
 * Converte a Preferencia salva no banco em um objeto de estilo que
 * pode ser aplicado direto num <Text> do React Native e no cartão
 * de leitura:
 *
 *   const { texto, cartao } = paraEstiloLeitura(preferencia);
 *   <View style={cartao}><Text style={texto}>{doc.textoAdaptado}</Text></View>
 *
 * IMPORTANTE: `fontFamily` recebe o NOME da fonte ('Lexend', 'Andika',
 * 'OpenDyslexic'). Ele precisa ser o mesmo nome com que a fonte foi
 * registrada no app (ex.: useFonts do expo-font).
 *
 * Os fatores de espaçamento abaixo são sugestões; ajuste com a equipe.
 */
import type { Espacamento, Preferencia } from './types';

const FATOR_LINHA: Record<Espacamento, number> = {
  normal: 1.4,
  confortavel: 1.7,
  amplo: 2.0,
};

const ESPACO_LETRAS: Record<Espacamento, number> = {
  normal: 0,
  confortavel: 0.5,
  amplo: 1,
};

export interface EstiloLeitura {
  texto: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    color: string;
  };
  cartao: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  };
}

export function paraEstiloLeitura(p: Preferencia): EstiloLeitura {
  return {
    texto: {
      fontFamily: p.fonte,
      fontSize: p.tamanhoFonte,
      lineHeight: Math.round(p.tamanhoFonte * FATOR_LINHA[p.espacamento]),
      letterSpacing: ESPACO_LETRAS[p.espacamento],
      color: p.corTexto,
    },
    cartao: {
      backgroundColor: p.corFundo,
      borderColor: p.corBorda,
      borderWidth: 1,
    },
  };
}
