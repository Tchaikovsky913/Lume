import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'camera' | 'settings' | 'folder' | 'scan' | 'import' | 'library' | 'play';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const GEAR =
  'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z';

/** Ícones de traço (estilo Feather) desenhados com react-native-svg. */
export function Icon({ name, size = 24, color = '#000', strokeWidth = 2 }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'camera' && (
        <>
          <Path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            {...stroke}
          />
          <Circle cx={12} cy={13} r={4} {...stroke} />
        </>
      )}
      {name === 'back' && (
  <Path d="M15 18 L9 12 L15 6" {...stroke} />
)}

{name === 'search' && (
  <>
    {/* lupa: círculo desenhado com dois arcos */}
    <Path d="M3 11 A8 8 0 0 1 19 11 A8 8 0 0 1 3 11 Z" {...stroke} />
    {/* cabo da lupa */}
    <Path d="M16.65 16.65 L21 21" {...stroke} />
  </>
)}
{name === 'marker' && (
  <>
    <Path d="M3 21 L4 16 L16 4 L20 8 L8 20 Z" {...stroke} />
    <Path d="M13 7 L17 11" {...stroke} />
  </>
)}
{name === 'zoom' && (
  <>
    <Path d="M3 11 A8 8 0 0 1 19 11 A8 8 0 0 1 3 11 Z" {...stroke} />
    <Path d="M16.65 16.65 L21 21" {...stroke} />
    <Path d="M8 11 L14 11" {...stroke} />
    <Path d="M11 8 L11 14" {...stroke} />
  </>
)}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...stroke} />
          <Path d={GEAR} {...stroke} />
        </>
      )}
      {name === 'folder' && (
        <Path
          d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
          {...stroke}
        />
      )}
      {name === 'scan' && (
        <>
          <Path
            d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"
            {...stroke}
          />
          <Circle cx={12} cy={12} r={2.5} stroke={color} fill={color} strokeWidth={1} />
        </>
      )}
      {name === 'import' && (
        <>
          <Rect x={3} y={3} width={18} height={5} rx={1.5} {...stroke} />
          <Path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" {...stroke} />
          <Path d="M12 11v5M9.5 13.5 12 16l2.5-2.5" {...stroke} />
        </>
      )}
      {name === 'library' && (
        <>
          <Rect x={3} y={3} width={5} height={18} rx={1} {...stroke} />
          <Rect x={10} y={3} width={5} height={18} rx={1} {...stroke} />
          <Path d="m17 5.5 4-1 3 15.5-4 1z" transform="translate(-2 0)" {...stroke} />
        </>
      )}
      {name === 'play' && <Path d="M7 4l13 8-13 8z" {...stroke} />}
    </Svg>
  );
}
