export function calculateMonthlyPayment(
  principal: number,
  interestRatePercent: number,
  termMonths: number
): number {
  const monthlyRate = interestRatePercent / 100;
  if (monthlyRate === 0) return principal / termMonths;
  
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  return principal * (numerator / denominator);
}

export function calculateMonthlyInterest(
  principal: number,
  interestRatePercent: number
): number {
  return (principal * interestRatePercent) / 100;
}

export function calculateMonthlyPrincipal(
  principal: number,
  termMonths: number
): number {
  return principal / termMonths;
}

export function calculateTotalRepayment(
  monthlyPayment: number,
  termMonths: number
): number {
  return monthlyPayment * termMonths;
}

export function calculateTotalInterest(
  totalRepayment: number,
  principal: number
): number {
  return totalRepayment - principal;
}
