'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Printer, Loader, FileText, User, CreditCard, Building, Percent, Calendar, Shield, CheckCircle, Clock, Home, Wallet, UserCircle } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { COMPANY_INFO } from '@/lib/constants/company-info';
import Image from 'next/image';
import Link from 'next/link';

interface ViewContractModalProps {
  loan: any;
  onClose: () => void;
}

export function ViewContractModal({ loan, onClose }: ViewContractModalProps) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bankName, setBankName] = useState<string>('Local Payment Method');

  // Brand colors
  const saffron = '#FF9933';
  const green = '#138808';

  useEffect(() => {
    fetchContract();
  }, [loan.id, loan.contractId]);

  // Parse bank details from the bank_details JSON column
  useEffect(() => {
    if (loan?.bank_details) {
      try {
        // If bank_details is a string, parse it
        if (typeof loan.bank_details === 'string') {
          const parsed = JSON.parse(loan.bank_details);
          if (parsed.bankName) {
            setBankName(parsed.bankName);
          }
        }
        // If it's already an object
        else if (typeof loan.bank_details === 'object' && loan.bank_details !== null) {
          if (loan.bank_details.bankName) {
            setBankName(loan.bank_details.bankName);
          }
        }
      } catch (e) {
        console.error('[v0] Error parsing bank details:', e);
      }
    } else if (loan?.bank_name) {
      // Fallback to direct bank_name field
      setBankName(loan.bank_name);
    }
  }, [loan]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      setError('');

      const contractId = loan.contractId || `loan_${loan.id}`;
      console.log('[v0] Fetching contract with ID:', contractId);

      const response = await fetch(`/api/admin/loans/${contractId}/contract`);
      const data = await response.json();

      if (data.success) {
        setContract(data.contract);
      } else {
        setError(data.error || 'Failed to load contract');
      }
    } catch (err) {
      console.error('[v0] Contract fetch error:', err);
      setError('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const baseUrl = window.location.origin;

    // Use the correct image paths from /public/logos/
    const rbiLogo = `${baseUrl}/logos/rbi.png`;
    const mcaLogo = `${baseUrl}/logos/mca.png`;
    const cibilLogo = `${baseUrl}/logos/cibil.png`;
    const stampSvg = `${baseUrl}/logos/company-stamp.png`;

    const displayBorrowerName = contract?.header?.borrower_name || loan.borrower_name || 'N/A';
    const displayIdNumber = contract?.header?.id_number || loan.borrower_id_number || 'N/A';
    const displayPhoneNumber = contract?.header?.phone_number || loan.borrower_phone || 'N/A';
    const displayLoanAmount = contract?.header?.loan_amount || formatINR(loan.loan_amount);
    const displayInterestRate =
      contract?.header?.interest_rate ||
      `${(Number(loan.interest_rate) * 100).toFixed(1)}% per month`;
    const displayLoanPeriod = contract?.header?.loan_period || `${loan.loan_period_months} months`;
    const displayDocumentNumber = loan.order_number || loan.document_number || 'N/A';
    const displaySignatureUrl = contract?.signature_url;

    const contractHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loan Contract - ${displayDocumentNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Times New Roman', serif; 
          color: #212529; 
          background: white;
          padding: 40px;
          max-width: 900px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #FF9933;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .logo {
          width: 60px;
          height: 60px;
        }
        .logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .company-name {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }
        .company-name span:first-child {
          color: #FF9933;
        }
        .company-name span:last-child {
          color: #138808;
        }
        .company-tagline {
          font-size: 11px;
          color: #6C757D;
        }
        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f0f7ff;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          color: #FF9933;
          font-weight: 500;
        }
        .document-info {
          text-align: right;
        }
        .document-number {
          font-size: 14px;
          font-weight: bold;
          background: linear-gradient(135deg, #FF993310, #13880810);
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid #FF993320;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .document-number span {
          font-family: monospace;
          font-weight: bold;
          color: #FF9933;
        }
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .page-header h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #FF9933, #138808);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .page-header p {
          color: #6C757D;
          font-size: 14px;
        }
        .parties-section {
          background: linear-gradient(135deg, #f0f7ff, #fff0f0);
          border: 1px solid #FF993320;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }
        .parties-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .party-title {
          font-size: 12px;
          font-weight: 600;
          color: #6C757D;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .party-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .party-name.lender {
          color: #FF9933;
        }
        .party-name.borrower {
          color: #138808;
        }
        .party-details {
          font-size: 14px;
          color: #6C757D;
          line-height: 1.5;
        }
        .contract-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e9ecef;
          margin-bottom: 32px;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .card-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FF9933, #138808);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-icon svg {
          width: 24px;
          height: 24px;
          color: white;
        }
        .card-title {
          font-size: 20px;
          font-weight: bold;
          color: #212529;
        }
        .card-subtitle {
          font-size: 14px;
          color: #6C757D;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .info-card {
          background: linear-gradient(135deg, #f8f9fa, white);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid;
          height: 120px;
          display: flex;
          flex-direction: column;
        }
        .info-card.blue {
          border-color: #FF993320;
        }
        .info-card.red {
          border-color: #13880820;
        }
        .info-card.green {
          border-color: #13880820;
        }
        .info-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .info-icon {
          width: 16px;
          height: 16px;
        }
        .info-icon.blue { color: #FF9933; }
        .info-icon.red { color: #138808; }
        .info-icon.green { color: #138808; }
        .info-label {
          font-size: 12px;
          font-weight: 600;
        }
        .info-label.blue { color: #FF9933; }
        .info-label.red { color: #138808; }
        .info-label.green { color: #138808; }
        .info-value {
          flex: 1;
          display: flex;
          align-items: center;
          font-size: 16px;
          color: #212529;
        }
        .info-value.mono {
          font-family: monospace;
        }
        .articles-section {
          margin-top: 32px;
        }
        .article {
          margin-bottom: 32px;
          padding-left: 16px;
          border-left-width: 4px;
          border-left-style: solid;
        }
        .article.blue { border-left-color: #FF9933; }
        .article.red { border-left-color: #138808; }
        .article.green { border-left-color: #138808; }
        .article-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .article-title.blue { color: #FF9933; }
        .article-title.red { color: #138808; }
        .article-title.green { color: #138808; }
        .article-content {
          color: #6C757D;
          font-size: 14px;
          line-height: 1.6;
        }
        .article-list {
          list-style-type: disc;
          margin-left: 24px;
          margin-top: 8px;
          color: #6C757D;
        }
        .penalty-box {
          background: #fff9e6;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin-top: 12px;
          font-weight: bold;
          color: #856404;
        }
        .signatures-section {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 2px solid #e9ecef;
        }
        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .signature-block {
          text-align: center;
        }
        .signature-label {
          color: #6C757D;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .signature-image-container {
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .signature-image {
          max-width: 100%;
          max-height: 100px;
          object-fit: contain;
        }
        .signature-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          color: #adb5bd;
          font-style: italic;
          font-size: 14px;
        }
        .stamp-container {
          position: relative;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .stamp-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 0;
        }
        .stamp-text .name {
          font-weight: 600;
          color: #212529;
        }
        .stamp-text .title {
          font-size: 14px;
          color: #6C757D;
        }
        .stamp-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
        }
        .stamp-overlay img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          opacity: 0.7;
        }
        .printed-name {
          font-weight: 600;
          color: #212529;
        }
        .printed-title {
          font-size: 14px;
          color: #6C757D;
        }
        .trust-badges {
          background: linear-gradient(135deg, #f0f7ff, #fff0f0);
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #FF993320;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 24px;
          margin: 32px 0;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .trust-logo {
          width: 24px;
          height: 24px;
        }
        .trust-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .trust-text {
          font-size: 12px;
          font-weight: 500;
        }
        .trust-text.blue { color: #FF9933; }
        .trust-text.green { color: #138808; }
        .trust-text.red { color: #138808; }
        .footer-note {
          text-align: center;
          color: #adb5bd;
          font-size: 12px;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <div class="logo">
            <img src="${bpLogo}" alt="EasyLoan" />
          </div>
          <div>
            <div class="company-name">
              <span>EASY</span><span>LOAN</span>
            </div>
            <div class="company-tagline">Loan Contract</div>
          </div>
        </div>
        <div class="trust-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9933" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>RBI Registered</span>
        </div>
      </div>

      <!-- Document Number Badge -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="document-number">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9933" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>Document: </span>
          <span>${displayDocumentNumber}</span>
        </div>
      </div>

      <!-- Page Header -->
      <div class="page-header">
        <h1>Standard Loan Agreement</h1>
        <p>Review our standard loan terms and conditions</p>
      </div>

      <!-- Parties Section -->
      <div class="parties-section">
        <div class="parties-grid">
          <div>
            <div class="party-title">LENDER</div>
          <div class="party-name lender">${COMPANY_INFO.name}</div>
            <div class="party-details">
              15th Floor, One Corporate Centre<br>
              Julia Vargas Ave, Ortigas Center<br>
              Mumbai, Maharashtra
            </div>
          </div>
          <div>
            <div class="party-title">BORROWER</div>
            <div class="party-name borrower">${displayBorrowerName}</div>
            <div class="party-details">
              ID: ${displayIdNumber}<br>
              Phone: ${displayPhoneNumber}
            </div>
          </div>
        </div>
      </div>

      <!-- Contract Details Card -->
      <div class="contract-card">
        <div class="card-header">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div>
            <div class="card-title">Contract Details</div>
            <div class="card-subtitle">Your loan information</div>
          </div>
        </div>

        <!-- 2x3 Grid of Cards -->
        <div class="info-grid">
          <!-- Card 1 - Borrower Name -->
          <div class="info-card blue">
            <div class="info-header">
              <svg class="info-icon blue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9933" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span class="info-label blue">Borrower Name</span>
            </div>
            <div class="info-value">${displayBorrowerName}</div>
          </div>

          <!-- Card 2 - ID Number -->
          <div class="info-card red">
            <div class="info-header">
              <svg class="info-icon red" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#138808" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
              </svg>
              <span class="info-label red">ID Number</span>
            </div>
            <div class="info-value mono">${displayIdNumber}</div>
          </div>

          <!-- Card 3 - Bank Name -->
          <div class="info-card green">
            <div class="info-header">
              <svg class="info-icon green" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#138808" stroke-width="2">
                <rect x="4" y="8" width="16" height="12" rx="2"/>
                <path d="M2 14h20"/>
                <path d="M8 21v-4"/>
                <path d="M16 21v-4"/>
              </svg>
              <span class="info-label green">Bank Name</span>
            </div>
            <div class="info-value">${bankName}</div>
          </div>

          <!-- Card 4 - Loan Amount -->
          <div class="info-card blue">
            <div class="info-header">
              <svg class="info-icon blue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9933" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
              </svg>
              <span class="info-label blue">Loan Amount</span>
            </div>
            <div class="info-value">${displayLoanAmount}</div>
          </div>

          <!-- Card 5 - Interest Rate -->
          <div class="info-card red">
            <div class="info-header">
              <svg class="info-icon red" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#138808" stroke-width="2">
                <path d="M19 5L5 19"/>
                <circle cx="6.5" cy="6.5" r="2.5"/>
                <circle cx="17.5" cy="17.5" r="2.5"/>
              </svg>
              <span class="info-label red">Interest Rate</span>
            </div>
            <div class="info-value">${displayInterestRate}</div>
          </div>

          <!-- Card 6 - Loan Period -->
          <div class="info-card green">
            <div class="info-header">
              <svg class="info-icon green" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#138808" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span class="info-label green">Loan Period</span>
            </div>
            <div class="info-value">${displayLoanPeriod}</div>
          </div>
        </div>

        <!-- Active Contract Status -->
        ${contract?.is_signed ? `
        <div class="active-contract" style="background: linear-gradient(135deg, #f0f9f0, #e8f5e8); border: 1px solid #13880840; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#138808" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <div style="font-weight: 500; color: #212529;">✓ Active Contract</div>
            <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 14px; color: #6C757D;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Signed on: ${contract?.signed_at ? new Date(contract.signed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </div>
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Loan Agreement Section -->
      <div class="contract-card">
        <div style="text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef;">
          <h2 style="font-size: 24px; font-weight: bold; color: #FF9933; margin-bottom: 8px;">LOAN AGREEMENT</h2>
          <p style="font-size: 14px; color: #6C757D;">Between ${COMPANY_INFO.name} and ${displayBorrowerName}</p>
        </div>

        <!-- Articles 1-10 -->
        <div class="articles-section">
          <!-- Article 1 -->
          <div class="article blue">
            <div class="article-title blue">Article 1: Loan Form</div>
            <div class="article-content">Loan Form: Use an unsecured ID card to request a loan.</div>
          </div>

          <!-- Article 2 -->
          <div class="article red">
            <div class="article-title red">Article 2: Premium Interest Rate</div>
            <div class="article-content">Interest rates, fines, service charges or any fees. Total not more than 25% per year.</div>
          </div>

          <!-- Article 3 -->
          <div class="article green">
            <div class="article-title green">Article 3: Borrower's Obligations</div>
            <div class="article-content">
              <p>During the loan tenure, the borrower has to:</p>
              <ul class="article-list">
                <li>Pay interest at the same time.</li>
                <li>To give capital on time.</li>
                <li>If it is not possible to borrow money from the account due to the borrower's problem, the borrower should cooperate with the lender to finalize the payment.</li>
                <li>Comply with all the terms of the contract.</li>
              </ul>
            </div>
          </div>

          <!-- Article 4 -->
          <div class="article blue">
            <div class="article-title blue">Article 4: Loan Terms and Conditions</div>
            <div class="article-content">
              <p>(1) In case the borrower borrows online without using collateral, the lender is at risk of lending. The borrower must have a loan guarantee to check the liquidity of the borrower's personal loan minimum repayment. Must be verified for financial liquidity.</p>
              <p>(2) In the case of online borrowers without collateral, The lenders run the risk of lending. Borrowers must show their financial status to the company to confirm their ability to repay their debts. The borrower will withdraw the full amount of the loan account.</p>
              <p>(3) After signing this contract, both the borrower and the lender must comply with all requirements of the contract. If either party breaches the contract, the other party has the right to sue in court. The party not complying with this will have to pay a fine of 50 percent of the installment amount if it does not object.</p>
              <p>(4) In the event that the credit transfer cannot be resolved due to the problems of the borrower, the lender has the right to request the borrower to assist in handling it. After completing this operation, the lender has to transfer the funds.</p>
              <p>(5) The borrower shall repay the loan principal and interest within the period specified in the contract. If the borrower wants to apply for loan extension, he/she has to disburse it 5 days before the contract period.</p>
              <div class="penalty-box">
                <strong>(6) If the borrower does not repay on time on the stipulated repayment date, penalty interest will be calculated after three days at 0.5% per day.</strong>
              </div>
            </div>
          </div>

          <!-- Article 5 -->
          <div class="article red">
            <div class="article-title red">Article 5: Lending Considerations</div>
            <div class="article-content">
              <p>Before granting a loan, the lender has the right to consider the following matters:</p>
              <ul class="article-list">
                <li>The Borrower has entered into this Agreement Completion of legal formalities (if any) relating to the loan under the Act.</li>
                <li>Whether the Borrower has paid the costs associated with this Agreement (if any).</li>
                <li>Whether the borrower has complied with the loan terms specified in this Agreement.</li>
                <li>Whether the business and financial position of the borrower has changed adversely.</li>
                <li>If the Borrower breaches the terms specified in this Agreement.</li>
              </ul>
            </div>
          </div>

          <!-- Article 6 -->
          <div class="article green">
            <div class="article-title green">Article 6: Use of Loan and Repayment</div>
            <div class="article-content">
              <p>(1) The borrower cannot use the loan for illegal activities. Otherwise, the Lender reserves the right to require the Borrower to repay the principal and interest promptly and the legal consequences shall be borne by the Borrower.</p>
              <p>(2) The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect 5% of the total amount due.</p>
            </div>
          </div>

          <!-- Article 7 -->
          <div class="article blue">
            <div class="article-title blue">Article 7: Modification or Termination of Contract</div>
            <div class="article-content">In all of the above provisions, neither party is permitted to modify or terminate the contract without permission. When either party wishes to bring to the fore such facts in accordance with the provisions of the law, he must notify the other party in writing in time for the settlement. After this Agreement is modified or terminated, the Borrower shall repay 30% to the principal and interest in accordance with the terms of this Agreement.</div>
          </div>

          <!-- Article 8 -->
          <div class="article red">
            <div class="article-title red">Article 8: Dispute Resolution</div>
            <div class="article-content">Both parties agree to amend the terms of this Agreement through negotiation. If the negotiations do not agree, you can ask the local arbitration committee to mediate or bring the matter to a local court.</div>
          </div>

          <!-- Article 9 -->
          <div class="article green">
            <div class="article-title green">Article 9: Insurance and Force Majeure</div>
            <div class="article-content">
              <p>The lender assumes the credit risk of the borrower. Due to the "new corona pandemic", the central office requires borrowers to purchase personal accident insurance. If the borrower is unable to repay the loan on time due to force majeure, the lender may ask the insurance company to assist in the payment of the borrower's loan and the loan should be transferred to the borrower's account.</p>
              <p>Half an hour after the purchase, if the borrower signs the contract but does not comply with the terms, the company considers it a serious fraud and will take the credit dispute to the people's court. After purchase, if the lender does not lend on time, the borrower has the right to sue directly in the local court.</p>
            </div>
          </div>

          <!-- Article 10 -->
          <div class="article blue">
            <div class="article-title blue">Article 10: Effectiveness of the Agreement</div>
            <div class="article-content">This short loan agreement takes effect from the date of its signing by both parties (including the electronic agreement). The text of the contract has the same legal effect. The lender and borrower keep a copy of the contract.</div>
          </div>
        </div>

        <!-- Signatures Section -->
        <div class="signatures-section">
          <div class="signatures-grid">
            <!-- Borrower Signature -->
            <div class="signature-block">
              <div class="signature-label">BORROWER'S SIGNATURE</div>
              <div class="signature-image-container">
                ${displaySignatureUrl ? `
                  <img src="${displaySignatureUrl}" alt="Borrower Signature" class="signature-image" />
                ` : `
                  <div class="signature-placeholder">Not signed</div>
                `}
              </div>
              <div class="printed-name">${displayBorrowerName}</div>
              <div class="printed-title">Borrower</div>
            </div>

            <!-- Lender Signature - With Stamp -->
            <div class="signature-block">
              <div class="signature-label">LENDER'S SIGNATURE</div>
              <div class="stamp-container">
                <div class="stamp-text">
                  <div class="printed-name">${COMPANY_INFO.name}</div>
                  <div class="printed-title">Authorized Signatory</div>
                </div>
                <div class="stamp-overlay">
                  <img src="${stampSvg}" alt="Stamp" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Government Trust Badges -->
      <div class="trust-badges">
        <div class="trust-item">
          <div class="trust-logo">
            <img src="${rbiLogo}" alt="RBI" />
          </div>
          <span class="trust-text blue">RBI Registered</span>
        </div>
        <div class="trust-item">
          <div class="trust-logo">
            <img src="${mcaLogo}" alt="MCA" />
          </div>
          <span class="trust-text green">MCA Registered</span>
        </div>
        <div class="trust-item">
          <div class="trust-logo">
            <img src="${cibilLogo}" alt="CIBIL" />
          </div>
          <span class="trust-text red">CIBIL Partner</span>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="footer-note">
        EasyLoan is RBI Registered, MCA Registered, and CIBIL Partner. All rights reserved. For NRI, for Family.
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(contractHTML);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto border-0 shadow-xl">
        {/* Header with EasyLoan branding */}
        <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent">
                    Loan Contract
                  </span>
                </h3>
                <p className="text-sm text-[#6C757D]">Document: {loan.order_number}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!loading && contract && (
                <Button
                  onClick={handlePrint}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white hover:from-[#e68a2e] hover:to-[#0f6d07]"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#212529]" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#FF9933] border-t-[#138808] rounded-full animate-spin mx-auto" />
              <p className="text-[#6C757D]">Loading contract...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : contract ? (
          <div className="space-y-8">
            {/* Parties Section - Lender is the company name */}
            <div className="bg-gradient-to-br from-blue-50 to-red-50 border border-[#FF9933]/20 rounded-xl p-6">
              <h4 className="text-lg font-bold text-[#FF9933] mb-4 pb-2 border-b border-[#FF9933]/20">
                PARTIES TO THIS AGREEMENT
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">LENDER</p>
                  <p className="font-bold text-[#FF9933] text-lg">{COMPANY_INFO.name}</p>
                  <p className="text-sm text-gray-600">15th Floor, One Corporate Centre</p>
                  <p className="text-sm text-gray-600">Julia Vargas Ave, Ortigas Center</p>
                  <p className="text-sm text-gray-600">Mumbai, Maharashtra</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">BORROWER</p>
                  <p className="font-bold text-[#138808] text-lg">{contract.header.borrower_name}</p>
                  <p className="text-sm text-gray-600">ID: {contract.header.id_number}</p>
                  <p className="text-sm text-gray-600">Phone: {contract.header.phone_number}</p>
                </div>
              </div>
            </div>

            {/* 2x3 Grid of Cards with consistent text size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Borrower Name */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-[#FF9933]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#FF9933]" />
                  <span className="text-sm font-semibold text-[#FF9933]">Borrower Name</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[#212529] text-base">{contract.header.borrower_name}</p>
                </div>
              </div>

              {/* ID Number */}
              <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-[#138808]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#138808]" />
                  <span className="text-sm font-semibold text-[#138808]">ID Number</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[#212529] font-mono text-base">{contract.header.id_number}</p>
                </div>
              </div>

              {/* Bank Name - from user's bank_details */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-[#138808]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-[#138808]" />
                  <span className="text-sm font-semibold text-[#138808]">Bank Name</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[#212529] text-base">{bankName}</p>
                </div>
              </div>

              {/* Loan Amount */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-[#FF9933]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#FF9933]" />
                  <span className="text-sm font-semibold text-[#FF9933]">Loan Amount</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[#212529] text-base">{contract.header.loan_amount}</p>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-[#138808]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-[#138808]" />
                  <span className="text-sm font-semibold text-[#138808]">Interest Rate</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[#212529] text-base">{contract.header.interest_rate}</p>
                </div>
              </div>

              {/* Loan Period */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-[#138808]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#138808]" />
                  <span className="text-sm font-semibold text-[#138808]">Loan Period</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[#212529] text-base">{contract.header.loan_period}</p>
                </div>
              </div>
            </div>

            {/* Active Contract Status */}
            {contract.is_signed && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#138808]" />
                  <div>
                    <p className="text-gray-900 font-medium">✓ Active Contract</p>
                    <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Signed on: {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loan Agreement Articles */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <div className="text-center mb-8 pb-4 border-b border-gray-200">
                <h2 className="text-2xl md:text-3xl font-bold text-[#FF9933] mb-2">LOAN AGREEMENT</h2>
                <p className="text-sm text-gray-500">Between {COMPANY_INFO.name} and {contract.header.borrower_name}</p>
              </div>

              {/* Articles 1-10 */}
              <div className="space-y-8">
                {/* Article 1 */}
                <div className="pl-4 border-l-4 border-[#FF9933]">
                  <h3 className="font-bold text-[#FF9933] mb-3 text-lg">Article 1: Loan Form</h3>
                  <p className="text-[#6C757D]">Loan Form: Use an unsecured ID card to request a loan.</p>
                </div>

                {/* Article 2 */}
                <div className="pl-4 border-l-4 border-[#138808]">
                  <h3 className="font-bold text-[#138808] mb-3 text-lg">Article 2: Premium Interest Rate</h3>
                  <p className="text-[#6C757D]">Interest rates, fines, service charges or any fees. Total not more than 25% per year.</p>
                </div>

                {/* Article 3 */}
                <div className="pl-4 border-l-4 border-[#138808]">
                  <h3 className="font-bold text-[#138808] mb-3 text-lg">Article 3: Borrower's Obligations</h3>
                  <div className="text-[#6C757D]">
                    <p>During the loan tenure, the borrower has to:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Pay interest at the same time.</li>
                      <li>To give capital on time.</li>
                      <li>If it is not possible to borrow money from the account due to the borrower's problem, the borrower should cooperate with the lender to finalize the payment.</li>
                      <li>Comply with all the terms of the contract.</li>
                    </ul>
                  </div>
                </div>

                {/* Article 4 */}
                <div className="pl-4 border-l-4 border-[#FF9933]">
                  <h3 className="font-bold text-[#FF9933] mb-3 text-lg">Article 4: Loan Terms and Conditions</h3>
                  <div className="text-[#6C757D] space-y-3">
                    <p>(1) In case the borrower borrows online without using collateral, the lender is at risk of lending. The borrower must have a loan guarantee to check the liquidity of the borrower's personal loan minimum repayment. Must be verified for financial liquidity.</p>
                    <p>(2) In the case of online borrowers without collateral, The lenders run the risk of lending. Borrowers must show their financial status to the company to confirm their ability to repay their debts. The borrower will withdraw the full amount of the loan account.</p>
                    <p>(3) After signing this contract, both the borrower and the lender must comply with all requirements of the contract. If either party breaches the contract, the other party has the right to sue in court. The party not complying with this will have to pay a fine of 50 percent of the installment amount if it does not object.</p>
                    <p>(4) In the event that the credit transfer cannot be resolved due to the problems of the borrower, the lender has the right to request the borrower to assist in handling it. After completing this operation, the lender has to transfer the funds.</p>
                    <p>(5) The borrower shall repay the loan principal and interest within the period specified in the contract. If the borrower wants to apply for loan extension, he/she has to disburse it 5 days before the contract period.</p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-2">
                      <p className="text-yellow-800"><strong>(6) If the borrower does not repay on time on the stipulated repayment date, penalty interest will be calculated after three days at 0.5% per day.</strong></p>
                    </div>
                  </div>
                </div>

                {/* Article 5 */}
                <div className="pl-4 border-l-4 border-[#138808]">
                  <h3 className="font-bold text-[#138808] mb-3 text-lg">Article 5: Lending Considerations</h3>
                  <div className="text-[#6C757D]">
                    <p>Before granting a loan, the lender has the right to consider the following matters:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>The Borrower has entered into this Agreement Completion of legal formalities (if any) relating to the loan under the Act.</li>
                      <li>Whether the Borrower has paid the costs associated with this Agreement (if any).</li>
                      <li>Whether the borrower has complied with the loan terms specified in this Agreement.</li>
                      <li>Whether the business and financial position of the borrower has changed adversely.</li>
                      <li>If the Borrower breaches the terms specified in this Agreement.</li>
                    </ul>
                  </div>
                </div>

                {/* Article 6 */}
                <div className="pl-4 border-l-4 border-[#138808]">
                  <h3 className="font-bold text-[#138808] mb-3 text-lg">Article 6: Use of Loan and Repayment</h3>
                  <div className="text-[#6C757D] space-y-3">
                    <p>(1) The borrower cannot use the loan for illegal activities. Otherwise, the Lender reserves the right to require the Borrower to repay the principal and interest promptly and the legal consequences shall be borne by the Borrower.</p>
                    <p>(2) The borrower shall repay the principal and interest within the period specified in the contract. For the overdue portion, the lender is entitled to recover the loan and collect 5% of the total amount due.</p>
                  </div>
                </div>

                {/* Article 7 */}
                <div className="pl-4 border-l-4 border-[#FF9933]">
                  <h3 className="font-bold text-[#FF9933] mb-3 text-lg">Article 7: Modification or Termination of Contract</h3>
                  <p className="text-[#6C757D]">In all of the above provisions, neither party is permitted to modify or terminate the contract without permission. When either party wishes to bring to the fore such facts in accordance with the provisions of the law, he must notify the other party in writing in time for the settlement. After this Agreement is modified or terminated, the Borrower shall repay 30% to the principal and interest in accordance with the terms of this Agreement.</p>
                </div>

                {/* Article 8 */}
                <div className="pl-4 border-l-4 border-[#138808]">
                  <h3 className="font-bold text-[#138808] mb-3 text-lg">Article 8: Dispute Resolution</h3>
                  <p className="text-[#6C757D]">Both parties agree to amend the terms of this Agreement through negotiation. If the negotiations do not agree, you can ask the local arbitration committee to mediate or bring the matter to a local court.</p>
                </div>

                {/* Article 9 */}
                <div className="pl-4 border-l-4 border-[#138808]">
                  <h3 className="font-bold text-[#138808] mb-3 text-lg">Article 9: Insurance and Force Majeure</h3>
                  <div className="text-[#6C757D] space-y-3">
                    <p>The lender assumes the credit risk of the borrower. Due to the "new corona pandemic", the central office requires borrowers to purchase personal accident insurance. If the borrower is unable to repay the loan on time due to force majeure, the lender may ask the insurance company to assist in the payment of the borrower's loan and the loan should be transferred to the borrower's account.</p>
                    <p>Half an hour after the purchase, if the borrower signs the contract but does not comply with the terms, the company considers it a serious fraud and will take the credit dispute to the people's court. After purchase, if the lender does not lend on time, the borrower has the right to sue directly in the local court.</p>
                  </div>
                </div>

                {/* Article 10 */}
                <div className="pl-4 border-l-4 border-[#FF9933]">
                  <h3 className="font-bold text-[#FF9933] mb-3 text-lg">Article 10: Effectiveness of the Agreement</h3>
                  <p className="text-[#6C757D]">This short loan agreement takes effect from the date of its signing by both parties (including the electronic agreement). The text of the contract has the same legal effect. The lender and borrower keep a copy of the contract.</p>
                </div>
              </div>

              {/* Signatures Section */}
              <div className="mt-12 pt-8 border-t-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Borrower Signature */}
                  <div className="text-center">
                    <p className="text-[#6C757D] text-sm mb-4 font-semibold">BORROWER'S SIGNATURE</p>

                    <div className="mb-4 min-h-[100px] flex items-center justify-center">
                      {contract.signature_url ? (
                        <div className="relative w-full h-[100px]">
                          <Image
                            src={contract.signature_url}
                            alt="Borrower Signature"
                            fill
                            className="object-contain"
                            unoptimized={true}
                            priority
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[100px]">
                          <p className="text-gray-400 text-sm italic">Not signed</p>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{contract.header.borrower_name}</p>
                    <p className="text-sm text-gray-600">Borrower</p>
                  </div>

                  {/* Lender Signature - With Stamp */}
                  <div className="text-center relative">
                    <p className="text-[#6C757D] text-sm mb-4 font-semibold">LENDER'S SIGNATURE</p>

                    <div className="relative mb-4 min-h-[100px] flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                        <p className="font-semibold text-gray-900">{COMPANY_INFO.name}</p>
                        <p className="text-sm text-gray-600">Authorized Signatory</p>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <Image
                          src="/logos/NRILoanStamp.png"
                          alt="Stamp"
                          width={120}
                          height={120}
                          className="object-contain opacity-70"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Government Trust Badges */}
            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-4 border border-[#FF9933]/20">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative">
                    <Image src="/logos/rbi.png" alt="RBI" width={24} height={24} className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-[#FF9933]">RBI Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative">
                    <Image src="/logos/mca.png" alt="MCA" width={24} height={24} className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-[#138808]">MCA Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative">
                    <Image src="/logos/cibil.png" alt="CIBIL" width={24} height={24} className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-[#138808]">CIBIL Partner</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onClose}
                className="w-full max-w-md bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Close Contract
              </Button>
            </div>

            {/* Footer Note */}
            <div className="text-center">
              <p className="text-xs text-gray-400">
                EasyLoan is RBI Registered, MCA Registered, and CIBIL Partner.
                All rights reserved. For NRI, for Family.
              </p>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
