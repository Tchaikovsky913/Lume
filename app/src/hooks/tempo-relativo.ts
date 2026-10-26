export function tempoRelativo(iso: string, agora = new Date()): string {
  const dias = Math.floor((agora.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return 'Adicionado hoje';
  if (dias === 1) return 'Adicionado ontem';
  if (dias < 7) return `Há ${dias} dias`;
  if (dias < 14) return 'Há uma semana';
  if (dias < 30) return `Há ${Math.floor(dias / 7)} semanas`;
  if (dias < 60) return 'Adicionado há um mês';
  return `Há ${Math.floor(dias / 30)} meses`;
}