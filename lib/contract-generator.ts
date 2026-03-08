'use strict';

const EXACT_CONTRACT_TEMPLATE = `"Installment Agreement", the Lender and the Borrower agree to and jointly abide by this Agreement. The following terms and conditions shall apply.

Article 1: Loan Application Form
Loan Application: Use your KYC-validated identification (such as Aadhaar, PAN, Voter ID, or Driver's License) to apply for a loan.

Article 2: Interest Rates and Charges
Interest Rates and Charges: The aggregate of interest rate, late payment penalties, processing fees, and all other charges shall not exceed the limits prescribed by the Reserve Bank of India (RBI) for your specific loan category. Interest will be charged as a simple interest rate on the outstanding principal amount and will be fully disclosed in the loan agreement.

Article 3: Borrower's Obligations
During the loan tenure, the borrower must:
(1) Pay interest as per the agreed schedule.
(2) Repay the principal amount on the due date.
(3) Cooperate with the lender to resolve any payment issues if a scheduled debit from the borrower's bank account fails due to insufficient funds or other bank-related issues.
(4) Adhere to all terms and conditions of the contract.
(5) Utilize the loan amount strictly for lawful purposes as declared.

Article 4: Loan Terms and Conditions
(1) In the event that a borrower applies for a loan online without providing collateral, the lender assumes a higher risk. To mitigate this, the borrower must provide a form of loan guarantee or credit enhancement (such as a third-party guarantee or security deposit) to allow the lender to assess the borrower's liquidity and ensure their ability to make the minimum repayment. The borrower's financial liquidity must be thoroughly verified.

(2) In the case of online borrowers without collateral, the lenders assume a higher risk. To address this, borrowers must provide a clear view of their financial status to the company to confirm their ability to repay the debt. As part of this assessment, the borrower may be required to maintain a minimum balance or security deposit equivalent to 10% of the loan amount (or demonstrate they have 10% liquidity readily available). Upon successful verification, the borrower will receive the full loan amount credited to their account.

(3) Upon signing this contract (digitally or physically), both the borrower and the lender are bound by its terms. In the event of a breach of contract by either party, the aggrieved party has the right to seek recourse in a court of law in India. The defaulting party may be liable for penal charges as specified in the contract, subject to RBI guidelines.

(4) If a credit transfer fails due to an issue on the borrower's side (e.g., incorrect account details or technical issues), the lender may request the borrower's assistance to resolve the issue. Upon successful resolution, the lender will process the fund transfer.

(5) The borrower shall repay the loan principal and interest by the due date specified. If the borrower wishes to request an extension or restructuring, they must apply to the lender at least 5 days before the original due date.

(6) If the borrower fails to repay on the stipulated date, a penal interest (default interest) will be charged on the overdue amount as per the terms disclosed in the loan contract, subject to RBI regulations on fair practices.

Article 5: Lender's Considerations
Loan Disbursement: Before granting the loan, the lender reserves the right to review the following to make a final lending decision:
(1) Completion of all legal formalities and Know Your Customer (KYC) verification as per RBI guidelines.
(2) Verification of the borrower's identity and address through officially valid documents.
(3) Confirmation that the borrower has paid any applicable processing fees associated with this application.
(4) Confirmation that the borrower meets the eligibility criteria and credit policy specified by the lender.
(5) Assessment of the borrower's current business and financial position to ensure no material adverse change has occurred.
(6) Ensuring the borrower has not breached any terms specified in this application or prior agreements.

Article 6: Usage and Repayment of Loan
(1) The borrower is strictly prohibited from using the loan proceeds for illegal activities, speculation, or purposes not disclosed in the application. Violation of this clause gives the lender the right to demand immediate repayment of the principal and accrued interest, and the borrower will be solely responsible for all legal consequences.

(2) The borrower must repay the principal and interest by the due date. For any overdue amount, the lender is entitled to recover the loan and collect reasonable late payment charges as explicitly disclosed in the loan agreement and compliant with Indian law and RBI guidelines.

Article 7: Modification or Termination of Contract
Neither party is permitted to unilaterally modify or terminate this contract. If either party wishes to propose a modification in accordance with the law, they must notify the other party in writing to allow for negotiation. Upon termination of this Agreement for any reason, the Borrower shall immediately repay all outstanding principal, accrued interest, and any other charges due as per the terms of this Agreement.

Article 8: Dispute Resolution
In the event of a dispute, both parties agree to first attempt to resolve the matter through mutual negotiation. If negotiations fail, the dispute may be subject to the jurisdiction of the courts in the city where the lender's office is located, or as otherwise specified in the loan agreement. This Agreement is governed by the laws of India.

Article 9: Key Fact Statement (KFS) - Disclosure
In compliance with RBI guidelines on Fair Practices Code and Digital Lending, a Key Fact Statement (KFS) will be provided to the borrower before loan execution. The KFS will include the Annual Percentage Rate (APR), the amount financed, the total amount payable, the repayment schedule, and an itemized breakdown of all fees and charges. The borrower acknowledges receipt and understanding of this disclosure.

Article 10: Electronic Agreement and Data Privacy
This Agreement may be executed through an electronic method (Aadhaar-based OTP, E-Sign, etc.), which shall have the same legal effect as a physical document. The lender shall comply with the provisions of the Information Technology Act, 2000, and the data protection principles for processing borrower data. This loan agreement is effective from the date of its execution by both parties. Both the lender and borrower shall retain a copy of this contract for their records.

Lender: Credit
Borrower: ________________`;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateContractHeader(data: {
  borrower_name: string;
  id_number?: string;
  phone_number: string;
  loan_amount: number;
  interest_rate: number;
  loan_period_months: number;
  bank_name?: string;
}): {
  borrower_name: string;
  id_number: string;
  phone_number: string;
  loan_amount: string;
  interest_rate: string;
  loan_period: string;
  bank_name: string;
} {
  return {
    borrower_name: data.borrower_name || 'N/A',
    id_number: data.id_number || 'N/A',
    phone_number: data.phone_number || 'N/A',
    loan_amount: `₹${formatCurrency(data.loan_amount)}`,
    interest_rate: `${(Number(data.interest_rate) * 100).toFixed(1)}% per month`,
    loan_period: `${data.loan_period_months} months`,
    bank_name: data.bank_name || 'N/A',
  };
}

export function generateContractHeaderText(header: ReturnType<typeof generateContractHeader>): string {
  return `Contract

Name of the borrower: ${header.borrower_name}
ID Number: ${header.id_number}
Cell phone number: ${header.phone_number}
Loan Amount: ${header.loan_amount}
Interest Rate: ${header.interest_rate}
Installment Payment: ${header.loan_period}
Lender: ${header.bank_name}

`;
}

export function generateFullContract(data: {
  borrower_name: string;
  id_number?: string;
  phone_number: string;
  loan_amount: number;
  interest_rate: number;
  loan_period_months: number;
  bank_name?: string;
}): {
  header: ReturnType<typeof generateContractHeader>;
  body: string;
  full_document: string;
} {
  const header = generateContractHeader(data);
  const headerText = generateContractHeaderText(header);
  const fullDocument = headerText + EXACT_CONTRACT_TEMPLATE;

  return {
    header,
    body: EXACT_CONTRACT_TEMPLATE,
    full_document: fullDocument,
  };
}

export const DEFAULT_CONTRACT_TEMPLATE = EXACT_CONTRACT_TEMPLATE;
