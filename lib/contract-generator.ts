'use strict';

const EXACT_CONTRACT_TEMPLATE = `"Installment Agreement", the Lender and the Borrower agree to and jointly abide by this Agreement. Adhering to the principles of equity, voluntary, honesty and reputation, there is no consensus, this small loan agreement is signed and ensures compliance and performance by the parties.

Article 1
Loan Form: Use an unsecured ID card to request a loan.

Article 2
Premium interest rate:
Interest rates, fines, service charges or any fees. Total not more than 25% per year.

Article 3
During the loan tenure, the borrower has to:
(1) Pay interest at the same time.
(2) To give capital on time.
(3) If it is not possible to borrow money from the account due to the borrower's problem, the borrower should cooperate with the lender to finalize the payment.
(4) comply with all the terms of the contract.

Article 4
(1)  In case the borrower borrows online without using collateral, the lender is at risk of lending. The borrower must have a loan guarantee to check the liquidity of the borrower's personal loan minimum repayment. Must be verified for financial liquidity 

(2) In the case of online borrowers without collateral, The lenders run the risk of lending. Borrowers must show their financial status to the company to confirm their ability to repay their debts. The borrower will withdraw the full amount of the loan account.

(3) After signing this contract, both the borrower and the lender must comply with all requirements of the contract. If either party breaches the contract, the other party has the right to sue in court. The party not complying with this will have to pay a fine of 50 percent of the installment amount if it does not object.

(4) In the event that the credit transfer cannot be resolved due to the problems of the borrower, the lender has the right to request the borrower to assist in handling it. After completing this operation, the lender has to transfer the funds.

(5) The borrower shall repay the loan principal and interest within the period specified in the contract. If the borrower wants to apply for loan extension, he/she has to disburse it 5 days before the contract period.

(6) If theborrower does not repay on time on the stipulated repayment date, penalty interest will be calculated after three days at 0.5% per day.

Article 5
Lending: Before granting a loan, the lender has the right to consider the following matters and take a decision to grant the loan as a result of the review:
(1) The Borrower has entered into this Agreement Completion of legal formalities (if any) relating to the loan under the Act, such as regulatory delivery of government permits, approvals, registrations and relevant laws;
(2) whether the Borrower has paid the costs associated with this Agreement (if any);
(3) whether the borrower has complied with the loan terms specified in this Agreement;
(4) whether the business and financial position of the borrower has changed adversely;
(5) If the Borrower breaches the terms specified in this Agreement.

Article 6
(1) The borrower cannot use the loan for illegal activities. Otherwise, the Lender reserves the right to require the Borrower to repay the principal and interest promptly and the legal consequences shall be borne by the Borrower.
(2) The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect 5% of the total amount due.

Article 7
Modification or termination of contract: In all of the above provisions, neither party is permitted to modify or terminate the contract without permission. When either party wishes to bring to the fore such facts in accordance with the provisions of the law, he must notify the other party in writing in time for the settlement. After this Agreement is modified or terminated, the Borrower shall repay 30% to the principal and interest in accordance with the terms of this Agreement.

Article 8
Dispute Resolution: Both parties agree to amend the terms of this Agreement through negotiation. If the negotiations do not agree, you can ask the local arbitration committee to mediate or bring the matter to a local court.

Article 9
The lender assumes the credit risk of the borrower. Due to the "new corona pandemic", the central office requires borrowers to purchase personal accident insurance. If the borrower is unable to repay the loan on time due to force mature, the lender may ask the insurance company to assist in the payment of the borrower's loan and the loan should be transferred to the borrower's account. Borrowing is specified in the internal contract. Half an hour after the purchase, if the borrower signs the contract but does not comply with the terms, the company considers it a serious fraud and will take the credit dispute to the people's court. The anti-contract king is also presented. After purchase, if the lender does not lend on time, the borrower has the right to sue directly in the local court.

Article 10
This short loan agreement takes effect from the date of its signing by both parties (including the electronic agreement). The text of the contract has the same legal effect. The lender and borrower keep a copy of the contract.

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
