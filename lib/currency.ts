/**
 * Indian Rupee (INR ₹) Currency Utilities
 * Standardized formatting and validation for the entire application
 */

/**
 * Format a number to Indian Rupee currency format
 * @param amount - The amount to format
 * @returns Formatted string like "₹100,000.00"
 */
export function formatINR(amount: number): string {
  if (amount === null || amount === undefined) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Validate if loan amount is within acceptable range
 * @param amount - The loan amount to validate
 * @returns true if valid, false otherwise
 */
export function validateLoanAmount(amount: number): boolean {
  return amount >= 100000 && amount <= 5000000
}

/**
 * Get error message for invalid loan amount
 * @param amount - The loan amount
 * @returns Error message or empty string if valid
 */
export function getLoanAmountError(amount: number): string {
  if (amount < 100000) {
    return 'Minimum loan amount is ₹1,00,000.00'
  }
  if (amount > 5000000) {
    return 'Maximum loan amount is ₹50,00,000.00'
  }
  return ''
}

/**
 * Get interest rate for a given loan term
 * @param termMonths - Loan term in months (6, 12, 24, or 36)
 * @returns Interest rate as decimal (e.g., 0.5 for 0.5%)
 */
export function getInterestRateByTerm(termMonths: number): number {
  const rates: Record<number, number> = {
    6: 0.5,
    12: 0.6,
    24: 0.7,
    36: 0.8,
  }
  return rates[termMonths] ?? 0.5 // Default to 0.5% if not found
}

/**
 * Get all available loan terms
 * @returns Array of available loan terms in months
 */
export function getAvailableLoanTerms(): number[] {
  return [6, 12, 24, 36]
}

/**
 * Get loan term labels with interest rates
 * @returns Array of term options for form selects
 */
export function getLoanTermOptions(): Array<{
  value: number
  label: string
  rate: number
}> {
  return [
    { value: 6, label: '6 months', rate: 0.5 },
    { value: 12, label: '12 months', rate: 0.6 },
    { value: 24, label: '24 months', rate: 0.7 },
    { value: 36, label: '36 months', rate: 0.8 },
  ]
}

/**
 * Validate if loan term is valid
 * @param term - Loan term in months
 * @returns true if valid
 */
export function isValidLoanTerm(term: number): boolean {
  return getAvailableLoanTerms().includes(term)
}

/**
 * Get validation error for loan term
 * @param term - Loan term to validate
 * @returns Error message or empty string if valid
 */
export function getLoanTermError(term: number): string {
  if (!isValidLoanTerm(term)) {
    return 'Loan term must be 6, 12, 24, or 36 months'
  }
  return ''
}

/**
 * Constants for currency configuration
 */
export const CURRENCY_CONFIG = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
  MIN_LOAN: 100000,
  MAX_LOAN: 5000000,
  VALID_TERMS: [6, 12, 24, 36] as const,
  INTEREST_RATES: {
    6: 0.5,
    12: 0.6,
    24: 0.7,
    36: 0.8,
  } as const,
}
