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
  const saffron = 'var(--color-accent-500)';
  const green = 'var(--color-secondary-600)';

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
        :root {
          --color-primary-900: #1E3A8A;
          --color-primary-700: #1E40AF;
          --color-primary-100: #DBEAFE;
          --color-secondary-600: #10B981;
          --color-secondary-500: #34D399;
          --color-secondary-100: #D1FAE5;
          --color-accent-500: #F97316;
          --color-accent-600: #EA580C;
          --color-accent-100: #FFEDD5;
          --color-bg-main: #F9FAFB;
          --color-bg-surface: #FFFFFF;
          --color-text-primary: #111827;
          --color-text-secondary: #374151;
          --color-border: #E5E7EB;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Times New Roman', serif; 
          color: var(--color-text-primary); 
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
          border-bottom: 2px solid var(--color-accent-500);
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
          color: var(--color-accent-500);
        }
        .company-name span:last-child {
          color: var(--color-secondary-600);
        }
        .company-tagline {
          font-size: 11px;
          color: var(--color-text-secondary);
        }
        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-primary-100);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          color: var(--color-accent-500);
          font-weight: 500;
        }
        .document-info {
          text-align: right;
        }
        .document-number {
          font-size: 14px;
          font-weight: bold;
          background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent-500) 10%, transparent), color-mix(in srgb, var(--color-secondary-600) 10%, transparent));
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--color-accent-500) 12%, transparent);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .document-number span {
          font-family: monospace;
          font-weight: bold;
          color: var(--color-accent-500);
        }
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .page-header h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--color-accent-500), var(--color-secondary-600));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .page-header p {
          color: var(--color-text-secondary);
          font-size: 14px;
        }
        .parties-section {
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-accent-100));
          border: 1px solid color-mix(in srgb, var(--color-accent-500) 12%, transparent);
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
          color: var(--color-text-secondary);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .party-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .party-name.lender {
          color: var(--color-accent-500);
        }
        .party-name.borrower {
          color: var(--color-secondary-600);
        }
        .party-details {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }
        .contract-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid var(--color-border);
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
          background: linear-gradient(135deg, var(--color-accent-500), var(--color-secondary-600));
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
          color: var(--color-text-primary);
        }
        .card-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .info-card {
          background: linear-gradient(135deg, var(--color-bg-main), white);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid;
          height: 120px;
          display: flex;
          flex-direction: column;
        }
        .info-card.blue {
          border-color: color-mix(in srgb, var(--color-accent-500) 12%, transparent);
        }
        .info-card.red {
          border-color: color-mix(in srgb, var(--color-secondary-600) 12%, transparent);
        }
        .info-card.green {
          border-color: color-mix(in srgb, var(--color-secondary-600) 12%, transparent);
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
        .info-icon.blue { color: var(--color-accent-500); }
        .info-icon.red { color: var(--color-secondary-600); }
        .info-icon.green { color: var(--color-secondary-600); }
        .info-label {
          font-size: 12px;
          font-weight: 600;
        }
        .info-label.blue { color: var(--color-accent-500); }
        .info-label.red { color: var(--color-secondary-600); }
        .info-label.green { color: var(--color-secondary-600); }
        .info-value {
          flex: 1;
          display: flex;
          align-items: center;
          font-size: 16px;
          color: var(--color-text-primary);
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
        .article.blue { border-left-color: var(--color-accent-500); }
        .article.red { border-left-color: var(--color-secondary-600); }
        .article.green { border-left-color: var(--color-secondary-600); }
        .article-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .article-title.blue { color: var(--color-accent-500); }
        .article-title.red { color: var(--color-secondary-600); }
        .article-title.green { color: var(--color-secondary-600); }
        .article-content {
          color: var(--color-text-secondary);
          font-size: 14px;
          line-height: 1.6;
        }
        .article-list {
          list-style-type: disc;
          margin-left: 24px;
          margin-top: 8px;
          color: var(--color-text-secondary);
        }
        .penalty-box {
          background: var(--color-accent-100);
          border-left: 4px solid var(--color-accent-500);
          padding: 12px;
          margin-top: 12px;
          font-weight: bold;
          color: var(--color-primary-900);
        }
        .signatures-section {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 2px solid var(--color-border);
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
          color: var(--color-text-secondary);
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
          color: var(--color-text-secondary);
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
          color: var(--color-text-primary);
        }
        .stamp-text .title {
          font-size: 14px;
          color: var(--color-text-secondary);
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
          color: var(--color-text-primary);
        }
        .printed-title {
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        .trust-badges {
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-accent-100));
          border-radius: 16px;
          padding: 16px;
          border: 1px solid color-mix(in srgb, var(--color-accent-500) 12%, transparent);
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
        .trust-text.blue { color: var(--color-accent-500); }
        .trust-text.green { color: var(--color-secondary-600); }
        .trust-text.red { color: var(--color-secondary-600); }
        .footer-note {
          text-align: center;
          color: var(--color-text-secondary);
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-500)" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>RBI Registered</span>
        </div>
      </div>

      <!-- Document Number Badge -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="document-number">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-500)" stroke-width="2">
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
              <svg class="info-icon blue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-500)" stroke-width="2">
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
              <svg class="info-icon red" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-600)" stroke-width="2">
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
              <svg class="info-icon green" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-600)" stroke-width="2">
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
              <svg class="info-icon blue" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-500)" stroke-width="2">
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
              <svg class="info-icon red" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-600)" stroke-width="2">
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
              <svg class="info-icon green" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-600)" stroke-width="2">
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
        <div class="active-contract" style="background: linear-gradient(135deg, var(--color-secondary-100), color-mix(in srgb, var(--color-secondary-600) 15%, white)); border: 1px solid color-mix(in srgb, var(--color-secondary-600) 25%, transparent); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-600)" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <div style="font-weight: 500; color: var(--color-text-primary);">✓ Active Contract</div>
            <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 14px; color: var(--color-text-secondary);">
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
        <div style="text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);">
          <h2 style="font-size: 24px; font-weight: bold; color: var(--color-accent-500); margin-bottom: 8px;">LOAN AGREEMENT</h2>
          <p style="font-size: 14px; color: var(--color-text-secondary);">Between ${COMPANY_INFO.name} and ${displayBorrowerName}</p>
        </div>

        <!-- Articles 1-10 -->
        <div class="articles-section">
          <!-- Article 1 -->
          <div class="article blue">
            <div class="article-title blue">Article 1: Loan Application Form</div>
            <div class="article-content">Loan Application: Use your KYC-validated identification (such as Aadhaar, PAN, Voter ID, or Driver's License) to apply for a loan.</div>
          </div>

          <!-- Article 2 -->
          <div class="article red">
            <div class="article-title red">Article 2: Interest Rates and Charges</div>
            <div class="article-content">Interest Rates and Charges: The aggregate of interest rate, late payment penalties, processing fees, and all other charges shall not exceed the limits prescribed by the Reserve Bank of India (RBI) for your specific loan category. Interest will be charged as a simple interest rate on the outstanding principal amount and will be fully disclosed in the loan agreement.</div>
          </div>

          <!-- Article 3 -->
          <div class="article green">
            <div class="article-title green">Article 3: Borrower's Obligations</div>
            <div class="article-content">
              <p>During the loan tenure, the borrower must:</p>
              <ul class="article-list">
                <li>Pay interest as per the agreed schedule.</li>
                <li>Repay the principal amount on the due date.</li>
                <li>Cooperate with the lender to resolve any payment issues if a scheduled debit from the borrower's bank account fails due to insufficient funds or other bank-related issues.</li>
                <li>Adhere to all terms and conditions of the contract.</li>
                <li>Utilize the loan amount strictly for lawful purposes as declared.</li>
              </ul>
            </div>
          </div>

          <!-- Article 4 -->
          <div class="article blue">
            <div class="article-title blue">Article 4: Loan Terms and Conditions</div>
            <div class="article-content">
              <p>(1) In the event that a borrower applies for a loan online without providing collateral, the lender assumes a higher risk. To mitigate this, the borrower must provide a form of loan guarantee or credit enhancement (such as a third-party guarantee or security deposit) to allow the lender to assess the borrower's liquidity and ensure their ability to make the minimum repayment. The borrower's financial liquidity must be thoroughly verified.</p>
              <p>(2) In the case of online borrowers without collateral, the lenders assume a higher risk. To address this, borrowers must provide a clear view of their financial status to the company to confirm their ability to repay the debt. As part of this assessment, the borrower may be required to maintain a minimum balance or security deposit equivalent to 10% of the loan amount (or demonstrate they have 10% liquidity readily available). Upon successful verification, the borrower will receive the full loan amount credited to their account.</p>
              <p>(3) Upon signing this contract (digitally or physically), both the borrower and the lender are bound by its terms. In the event of a breach of contract by either party, the aggrieved party has the right to seek recourse in a court of law in India. The defaulting party may be liable for penal charges as specified in the contract, subject to RBI guidelines.</p>
              <p>(4) If a credit transfer fails due to an issue on the borrower's side (e.g., incorrect account details or technical issues), the lender may request the borrower's assistance to resolve the issue. Upon successful resolution, the lender will process the fund transfer.</p>
              <p>(5) The borrower shall repay the loan principal and interest by the due date specified. If the borrower wishes to request an extension or restructuring, they must apply to the lender at least 5 days before the original due date.</p>
              <div class="penalty-box">
                <strong>(6) If the borrower fails to repay on the stipulated date, a penal interest (default interest) will be charged on the overdue amount as per the terms disclosed in the loan contract, subject to RBI regulations on fair practices.</strong>
              </div>
            </div>
          </div>

          <!-- Article 5 -->
          <div class="article red">
            <div class="article-title red">Article 5: Lender's Considerations</div>
            <div class="article-content">
              <p>Loan Disbursement: Before granting the loan, the lender reserves the right to review the following to make a final lending decision:</p>
              <ul class="article-list">
                <li>Completion of all legal formalities and Know Your Customer (KYC) verification as per RBI guidelines.</li>
                <li>Verification of the borrower's identity and address through officially valid documents.</li>
                <li>Confirmation that the borrower has paid any applicable processing fees associated with this application.</li>
                <li>Confirmation that the borrower meets the eligibility criteria and credit policy specified by the lender.</li>
                <li>Assessment of the borrower's current business and financial position to ensure no material adverse change has occurred.</li>
                <li>Ensuring the borrower has not breached any terms specified in this application or prior agreements.</li>
              </ul>
            </div>
          </div>

          <!-- Article 6 -->
          <div class="article green">
            <div class="article-title green">Article 6: Usage and Repayment of Loan</div>
            <div class="article-content">
              <p>(1) The borrower is strictly prohibited from using the loan proceeds for illegal activities, speculation, or purposes not disclosed in the application. Violation of this clause gives the lender the right to demand immediate repayment of the principal and accrued interest, and the borrower will be solely responsible for all legal consequences.</p>
              <p>(2) The borrower must repay the principal and interest by the due date. For any overdue amount, the lender is entitled to recover the loan and collect reasonable late payment charges as explicitly disclosed in the loan agreement and compliant with Indian law and RBI guidelines.</p>
            </div>
          </div>

          <!-- Article 7 -->
          <div class="article blue">
            <div class="article-title blue">Article 7: Modification or Termination of Contract</div>
            <div class="article-content">Neither party is permitted to unilaterally modify or terminate this contract. If either party wishes to propose a modification in accordance with the law, they must notify the other party in writing to allow for negotiation. Upon termination of this Agreement for any reason, the Borrower shall immediately repay all outstanding principal, accrued interest, and any other charges due as per the terms of this Agreement.</div>
          </div>

          <!-- Article 8 -->
          <div class="article red">
            <div class="article-title red">Article 8: Dispute Resolution</div>
            <div class="article-content">In the event of a dispute, both parties agree to first attempt to resolve the matter through mutual negotiation. If negotiations fail, the dispute may be subject to the jurisdiction of the courts in the city where the lender's office is located, or as otherwise specified in the loan agreement. This Agreement is governed by the laws of India.</div>
          </div>

          <!-- Article 9 -->
          <div class="article green">
            <div class="article-title green">Article 9: Key Fact Statement (KFS) - Disclosure</div>
            <div class="article-content">In compliance with RBI guidelines on Fair Practices Code and Digital Lending, a Key Fact Statement (KFS) will be provided to the borrower before loan execution. The KFS will include the Annual Percentage Rate (APR), the amount financed, the total amount payable, the repayment schedule, and an itemized breakdown of all fees and charges. The borrower acknowledges receipt and understanding of this disclosure.</div>
          </div>

          <!-- Article 10 -->
          <div class="article blue">
            <div class="article-title blue">Article 10: Electronic Agreement and Data Privacy</div>
            <div class="article-content">This Agreement may be executed through an electronic method (Aadhaar-based OTP, E-Sign, etc.), which shall have the same legal effect as a physical document. The lender shall comply with the provisions of the Information Technology Act, 2000, and the data protection principles for processing borrower data. This loan agreement is effective from the date of its execution by both parties. Both the lender and borrower shall retain a copy of this contract for their records.</div>
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
        <div className="sticky top-0 bg-[var(--color-bg-surface)] z-10 pb-4 border-b border-[var(--color-border)] mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-xl flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5 text-[var(--color-bg-surface)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] bg-clip-text text-transparent">
                    Loan Contract
                  </span>
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Document: {loan.order_number}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!loading && contract && (
                <Button
                  onClick={handlePrint}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)]"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--color-bg-main)] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[var(--color-text-primary)]" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[var(--color-accent-500)] border-t-[var(--color-secondary-600)] rounded-full animate-spin mx-auto" />
              <p className="text-[var(--color-text-secondary)]">Loading contract...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-[var(--color-primary-100)] border border-[var(--color-border)] rounded-xl p-6 text-center">
            <p className="text-[var(--color-primary-900)]">{error}</p>
          </div>
        ) : contract ? (
          <div className="space-y-8">
            {/* Parties Section - Lender is the company name */}
            <div className="bg-gradient-to-br from-blue-50 to-red-50 border border-[var(--color-accent-500)]/20 rounded-xl p-6">
              <h4 className="text-lg font-bold text-[var(--color-accent-500)] mb-4 pb-2 border-b border-[var(--color-accent-500)]/20">
                PARTIES TO THIS AGREEMENT
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-2">LENDER</p>
                  <p className="font-bold text-[var(--color-accent-500)] text-lg">{COMPANY_INFO.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">15th Floor, One Corporate Centre</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Julia Vargas Ave, Ortigas Center</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Mumbai, Maharashtra</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase mb-2">BORROWER</p>
                  <p className="font-bold text-[var(--color-secondary-600)] text-lg">{contract.header.borrower_name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">ID: {contract.header.id_number}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Phone: {contract.header.phone_number}</p>
                </div>
              </div>
            </div>

            {/* 2x3 Grid of Cards with consistent text size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Borrower Name */}
              <div className="bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-accent-500)]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[var(--color-accent-500)]" />
                  <span className="text-sm font-semibold text-[var(--color-accent-500)]">Borrower Name</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[var(--color-text-primary)] text-base">{contract.header.borrower_name}</p>
                </div>
              </div>

              {/* ID Number */}
              <div className="bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-secondary-600)]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[var(--color-secondary-600)]" />
                  <span className="text-sm font-semibold text-[var(--color-secondary-600)]">ID Number</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[var(--color-text-primary)] font-mono text-base">{contract.header.id_number}</p>
                </div>
              </div>

              {/* Bank Name - from user's bank_details */}
              <div className="bg-gradient-to-br from-[var(--color-secondary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-secondary-600)]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-[var(--color-secondary-600)]" />
                  <span className="text-sm font-semibold text-[var(--color-secondary-600)]">Bank Name</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[var(--color-text-primary)] text-base">{bankName}</p>
                </div>
              </div>

              {/* Loan Amount */}
              <div className="bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-accent-500)]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[var(--color-accent-500)]" />
                  <span className="text-sm font-semibold text-[var(--color-accent-500)]">Loan Amount</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[var(--color-text-primary)] text-base">{contract.header.loan_amount}</p>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-secondary-600)]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-[var(--color-secondary-600)]" />
                  <span className="text-sm font-semibold text-[var(--color-secondary-600)]">Interest Rate</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[var(--color-text-primary)] text-base">{contract.header.interest_rate}</p>
                </div>
              </div>

              {/* Loan Period */}
              <div className="bg-gradient-to-br from-[var(--color-secondary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-secondary-600)]/20 p-4 h-[120px] flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[var(--color-secondary-600)]" />
                  <span className="text-sm font-semibold text-[var(--color-secondary-600)]">Loan Period</span>
                </div>
                <div className="flex-1 flex items-center">
                  <p className="text-[var(--color-text-primary)] text-base">{contract.header.loan_period}</p>
                </div>
              </div>
            </div>

            {/* Active Contract Status */}
            {contract.is_signed && (
              <div className="bg-gradient-to-r from-[var(--color-secondary-100)] to-[var(--color-secondary-100)] border border-[var(--color-border)] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)]" />
                  <div>
                    <p className="text-gray-900 font-medium">✓ Active Contract</p>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-1 flex items-center gap-1">
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
            <div className="bg-[var(--color-bg-surface)] rounded-2xl p-6 md:p-8 shadow-lg border border-[var(--color-border)]">
              <div className="text-center mb-8 pb-4 border-b border-[var(--color-border)]">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-accent-500)] mb-2">LOAN AGREEMENT</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Between {COMPANY_INFO.name} and {contract.header.borrower_name}</p>
              </div>

              {/* Articles 1-10 */}
              <div className="space-y-8">
                {/* Article 1 */}
                <div className="pl-4 border-l-4 border-[var(--color-accent-500)]">
                  <h3 className="font-bold text-[var(--color-accent-500)] mb-3 text-lg">Article 1: Loan Application Form</h3>
                  <p className="text-[var(--color-text-secondary)]">Loan Application: Use your KYC-validated identification (such as Aadhaar, PAN, Voter ID, or Driver's License) to apply for a loan.</p>
                </div>

                {/* Article 2 */}
                <div className="pl-4 border-l-4 border-[var(--color-secondary-600)]">
                  <h3 className="font-bold text-[var(--color-secondary-600)] mb-3 text-lg">Article 2: Interest Rates and Charges</h3>
                  <p className="text-[var(--color-text-secondary)]">Interest Rates and Charges: The aggregate of interest rate, late payment penalties, processing fees, and all other charges shall not exceed the limits prescribed by the Reserve Bank of India (RBI) for your specific loan category. Interest will be charged as a simple interest rate on the outstanding principal amount and will be fully disclosed in the loan agreement.</p>
                </div>

                {/* Article 3 */}
                <div className="pl-4 border-l-4 border-[var(--color-secondary-600)]">
                  <h3 className="font-bold text-[var(--color-secondary-600)] mb-3 text-lg">Article 3: Borrower's Obligations</h3>
                  <div className="text-[var(--color-text-secondary)]">
                    <p>During the loan tenure, the borrower must:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Pay interest as per the agreed schedule.</li>
                      <li>Repay the principal amount on the due date.</li>
                      <li>Cooperate with the lender to resolve any payment issues if a scheduled debit from the borrower's bank account fails due to insufficient funds or other bank-related issues.</li>
                      <li>Adhere to all terms and conditions of the contract.</li>
                      <li>Utilize the loan amount strictly for lawful purposes as declared.</li>
                    </ul>
                  </div>
                </div>

                {/* Article 4 */}
                <div className="pl-4 border-l-4 border-[var(--color-accent-500)]">
                  <h3 className="font-bold text-[var(--color-accent-500)] mb-3 text-lg">Article 4: Loan Terms and Conditions</h3>
                  <div className="text-[var(--color-text-secondary)] space-y-3">
                    <p>(1) In the event that a borrower applies for a loan online without providing collateral, the lender assumes a higher risk. To mitigate this, the borrower must provide a form of loan guarantee or credit enhancement (such as a third-party guarantee or security deposit) to allow the lender to assess the borrower's liquidity and ensure their ability to make the minimum repayment. The borrower's financial liquidity must be thoroughly verified.</p>
                    <p>(2) In the case of online borrowers without collateral, the lenders assume a higher risk. To address this, borrowers must provide a clear view of their financial status to the company to confirm their ability to repay the debt. As part of this assessment, the borrower may be required to maintain a minimum balance or security deposit equivalent to 10% of the loan amount (or demonstrate they have 10% liquidity readily available). Upon successful verification, the borrower will receive the full loan amount credited to their account.</p>
                    <p>(3) Upon signing this contract (digitally or physically), both the borrower and the lender are bound by its terms. In the event of a breach of contract by either party, the aggrieved party has the right to seek recourse in a court of law in India. The defaulting party may be liable for penal charges as specified in the contract, subject to RBI guidelines.</p>
                    <p>(4) If a credit transfer fails due to an issue on the borrower's side (e.g., incorrect account details or technical issues), the lender may request the borrower's assistance to resolve the issue. Upon successful resolution, the lender will process the fund transfer.</p>
                    <p>(5) The borrower shall repay the loan principal and interest by the due date specified. If the borrower wishes to request an extension or restructuring, they must apply to the lender at least 5 days before the original due date.</p>
                    <div className="bg-[var(--color-accent-100)] border-l-4 border-[var(--color-accent-500)] p-3 mt-2">
                      <p className="text-[var(--color-primary-900)]"><strong>(6) If the borrower fails to repay on the stipulated date, a penal interest (default interest) will be charged on the overdue amount as per the terms disclosed in the loan contract, subject to RBI regulations on fair practices.</strong></p>
                    </div>
                  </div>
                </div>

                {/* Article 5 */}
                <div className="pl-4 border-l-4 border-[var(--color-secondary-600)]">
                  <h3 className="font-bold text-[var(--color-secondary-600)] mb-3 text-lg">Article 5: Lender's Considerations</h3>
                  <div className="text-[var(--color-text-secondary)]">
                    <p>Loan Disbursement: Before granting the loan, the lender reserves the right to review the following to make a final lending decision:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Completion of all legal formalities and Know Your Customer (KYC) verification as per RBI guidelines.</li>
                      <li>Verification of the borrower's identity and address through officially valid documents.</li>
                      <li>Confirmation that the borrower has paid any applicable processing fees associated with this application.</li>
                      <li>Confirmation that the borrower meets the eligibility criteria and credit policy specified by the lender.</li>
                      <li>Assessment of the borrower's current business and financial position to ensure no material adverse change has occurred.</li>
                      <li>Ensuring the borrower has not breached any terms specified in this application or prior agreements.</li>
                    </ul>
                  </div>
                </div>

                {/* Article 6 */}
                <div className="pl-4 border-l-4 border-[var(--color-secondary-600)]">
                  <h3 className="font-bold text-[var(--color-secondary-600)] mb-3 text-lg">Article 6: Usage and Repayment of Loan</h3>
                  <div className="text-[var(--color-text-secondary)] space-y-3">
                    <p>(1) The borrower is strictly prohibited from using the loan proceeds for illegal activities, speculation, or purposes not disclosed in the application. Violation of this clause gives the lender the right to demand immediate repayment of the principal and accrued interest, and the borrower will be solely responsible for all legal consequences.</p>
                    <p>(2) The borrower must repay the principal and interest by the due date. For any overdue amount, the lender is entitled to recover the loan and collect reasonable late payment charges as explicitly disclosed in the loan agreement and compliant with Indian law and RBI guidelines.</p>
                  </div>
                </div>

                {/* Article 7 */}
                <div className="pl-4 border-l-4 border-[var(--color-accent-500)]">
                  <h3 className="font-bold text-[var(--color-accent-500)] mb-3 text-lg">Article 7: Modification or Termination of Contract</h3>
                  <p className="text-[var(--color-text-secondary)]">Neither party is permitted to unilaterally modify or terminate this contract. If either party wishes to propose a modification in accordance with the law, they must notify the other party in writing to allow for negotiation. Upon termination of this Agreement for any reason, the Borrower shall immediately repay all outstanding principal, accrued interest, and any other charges due as per the terms of this Agreement.</p>
                </div>

                {/* Article 8 */}
                <div className="pl-4 border-l-4 border-[var(--color-secondary-600)]">
                  <h3 className="font-bold text-[var(--color-secondary-600)] mb-3 text-lg">Article 8: Dispute Resolution</h3>
                  <p className="text-[var(--color-text-secondary)]">In the event of a dispute, both parties agree to first attempt to resolve the matter through mutual negotiation. If negotiations fail, the dispute may be subject to the jurisdiction of the courts in the city where the lender's office is located, or as otherwise specified in the loan agreement. This Agreement is governed by the laws of India.</p>
                </div>

                {/* Article 9 */}
                <div className="pl-4 border-l-4 border-[var(--color-secondary-600)]">
                  <h3 className="font-bold text-[var(--color-secondary-600)] mb-3 text-lg">Article 9: Key Fact Statement (KFS) - Disclosure</h3>
                  <p className="text-[var(--color-text-secondary)]">In compliance with RBI guidelines on Fair Practices Code and Digital Lending, a Key Fact Statement (KFS) will be provided to the borrower before loan execution. The KFS will include the Annual Percentage Rate (APR), the amount financed, the total amount payable, the repayment schedule, and an itemized breakdown of all fees and charges. The borrower acknowledges receipt and understanding of this disclosure.</p>
                </div>

                {/* Article 10 */}
                <div className="pl-4 border-l-4 border-[var(--color-accent-500)]">
                  <h3 className="font-bold text-[var(--color-accent-500)] mb-3 text-lg">Article 10: Electronic Agreement and Data Privacy</h3>
                  <p className="text-[var(--color-text-secondary)]">This Agreement may be executed through an electronic method (Aadhaar-based OTP, E-Sign, etc.), which shall have the same legal effect as a physical document. The lender shall comply with the provisions of the Information Technology Act, 2000, and the data protection principles for processing borrower data. This loan agreement is effective from the date of its execution by both parties. Both the lender and borrower shall retain a copy of this contract for their records.</p>
                </div>
              </div>

              {/* Signatures Section */}
              <div className="mt-12 pt-8 border-t-2 border-[var(--color-border)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Borrower Signature */}
                  <div className="text-center">
                    <p className="text-[var(--color-text-secondary)] text-sm mb-4 font-semibold">BORROWER'S SIGNATURE</p>

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
                          <p className="text-[var(--color-text-secondary)] text-sm italic">Not signed</p>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{contract.header.borrower_name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">Borrower</p>
                  </div>

                  {/* Lender Signature - With Stamp */}
                  <div className="text-center relative">
                    <p className="text-[var(--color-text-secondary)] text-sm mb-4 font-semibold">LENDER'S SIGNATURE</p>

                    <div className="relative mb-4 min-h-[100px] flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                        <p className="font-semibold text-gray-900">{COMPANY_INFO.name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">Authorized Signatory</p>
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
            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-4 border border-[var(--color-accent-500)]/20">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative">
                    <Image src="/logos/rbi.png" alt="RBI" width={24} height={24} className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative">
                    <Image src="/logos/mca.png" alt="MCA" width={24} height={24} className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-secondary-600)]">MCA Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative">
                    <Image src="/logos/cibil.png" alt="CIBIL" width={24} height={24} className="object-contain" />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-secondary-600)]">CIBIL Partner</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onClose}
                className="w-full max-w-md bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Close Contract
              </Button>
            </div>

            {/* Footer Note */}
            <div className="text-center">
              <p className="text-xs text-[var(--color-text-secondary)]">
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
