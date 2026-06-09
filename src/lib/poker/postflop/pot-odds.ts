export function potOddsPercent(callAmount: number, pot: number): number {
  if (callAmount <= 0) return 0;
  return (callAmount / (pot + callAmount)) * 100;
}

export function isProfitableCall(
  equityPercent: number,
  callAmount: number,
  pot: number
): boolean {
  return equityPercent > potOddsPercent(callAmount, pot);
}
