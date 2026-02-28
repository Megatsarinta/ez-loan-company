// Central INR Currency Configuration for Indian Market (NRI Focus)
export const CURRENCY_CONFIG = {
  // Currency identification
  symbol: '₹',
  code: 'INR',
  locale: 'en-IN',
  name: 'Indian Rupee',

  // Loan amount constraints (in Indian Rupees)
  // Minimum: ₹1,00,000 (1 Lakh)
  // Maximum: ₹50,00,000 (50 Lakhs) / ₹1,00,00,000 (1 Crore)
  minLoan: 100000,      // ₹1,00,000 (1 Lakh)
  maxLoan: 10000000,    // ₹1,00,00,000 (1 Crore)

  // Loan terms and monthly interest rates (as decimal: 0.5% = 0.005, 0.6% = 0.006, etc.)
  loanTerms: [
    { months: 6, interestRate: 0.005, label: '6 months' },
    { months: 12, interestRate: 0.006, label: '12 months' },
    { months: 24, interestRate: 0.007, label: '24 months' },
    { months: 36, interestRate: 0.008, label: '36 months' },
  ],

  // Validation messages (in Indian English)
  messages: {
    minLoanError: 'Minimum loan amount is ₹1,00,000 (1 Lakh)',
    maxLoanError: 'Maximum loan amount is ₹1,00,00,000 (1 Crore)',
    invalidTerm: 'Loan term must be 6, 12, 24, or 36 months',
    invalidAmount: 'Loan amount must be between ₹1,00,000 and ₹1,00,00,000',
  },

  // EMI formula: [(Loan Amount / Term) + (Loan Amount × Monthly Interest Rate)]
  emiCalculationNote: 'Repayment = (P / n) + (P × r) where P = principal, n = term months, r = monthly rate',

  // Indian numbering system info (Lakhs & Crores)
  numberingSystem: {
    lakh: 100000,
    crore: 10000000,
    formatWithUnits: true, // Show amounts in Lakhs/Crores
  },
};

// Helper function to get interest rate by term
export function getInterestRateByTerm(termMonths: number): number {
  const term = CURRENCY_CONFIG.loanTerms.find((t) => t.months === termMonths);
  return term ? term.interestRate : CURRENCY_CONFIG.loanTerms[0].interestRate;
}

// Helper function to get term label with monthly rate (no p.a.)
export function getTermLabel(termMonths: number): string {
  const term = CURRENCY_CONFIG.loanTerms.find((t) => t.months === termMonths);
  return term
    ? `${term.months} months - ${(term.interestRate * 100).toFixed(1)}% per month`
    : `${termMonths} months`;
}

// Helper function to get simplified term label (without rates)
export function getSimpleTermLabel(termMonths: number): string {
  const term = CURRENCY_CONFIG.loanTerms.find((t) => t.months === termMonths);
  return term ? term.label : `${termMonths} months`;
}

// Helper function to validate loan amount
export function validateLoanAmount(amount: number): { valid: boolean; error?: string } {
  if (amount < CURRENCY_CONFIG.minLoan) {
    return { valid: false, error: CURRENCY_CONFIG.messages.minLoanError };
  }
  if (amount > CURRENCY_CONFIG.maxLoan) {
    return { valid: false, error: CURRENCY_CONFIG.messages.maxLoanError };
  }
  return { valid: true };
}

// Helper function to validate loan term
export function validateLoanTerm(termMonths: number): boolean {
  return CURRENCY_CONFIG.loanTerms.some((t) => t.months === termMonths);
}

// Helper function to get available loan terms
export function getAvailableLoanTerms(): number[] {
  return CURRENCY_CONFIG.loanTerms.map((t) => t.months);
}

// Helper function to get available loan terms with full details
export function getAvailableLoanTermsWithDetails(): Array<{
  months: number;
  interestRate: number;
  label: string;
}> {
  return [...CURRENCY_CONFIG.loanTerms];
}

// Helper function to format amount in Indian numbering system (Lakhs/Crores)
export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Helper function to format amount in full Indian number format
export function formatFullIndianCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Repayment = [(Loan Amount / Term) + (Loan Amount × Monthly Interest Rate)]
export function calculateEMI(
  principal: number,
  termMonths: number,
  interestRate: number
): number {
  if (termMonths === 0) return principal;
  const principalPerMonth = principal / termMonths;
  const interestPerMonth = principal * interestRate;
  return Math.round(principalPerMonth + interestPerMonth);
}

// Helper function to calculate total interest
export function calculateTotalInterest(
  principal: number,
  termMonths: number,
  interestRate: number
): number {
  const emi = calculateEMI(principal, termMonths, interestRate);
  return (emi * termMonths) - principal;
}

// Helper function to calculate total payment
export function calculateTotalPayment(
  principal: number,
  termMonths: number,
  interestRate: number
): number {
  const emi = calculateEMI(principal, termMonths, interestRate);
  return emi * termMonths;
}