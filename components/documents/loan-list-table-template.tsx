'use client'

import Image from 'next/image'
import React from 'react'
import { COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

interface Loan {
  document_number: string
  borrower_name: string
  loan_amount: number
  loan_purpose: string
  loan_period_months: number
  status: string
}

interface LoanListTableTemplateProps {
  realUser?: Loan | null
  mockLoans?: Loan[]
  loanPurpose?: string
}

export default function LoanListTableTemplate({ 
  realUser, 
  mockLoans = [],
  loanPurpose = 'Business Expansion'
}: LoanListTableTemplateProps) {
  
  // Brand colors (saffron, green, navy)
  const navy = '#1e3a5f'
  const saffron = '#FF9933'
  const green = '#138808'
  
  // Default mock loans (only valid terms: 6, 12, 24, 36 months)
  const defaultMockLoans = [
    {
      document_number: 'DOC-1770255500123-05',
      borrower_name: 'Priya Sharma',
      loan_amount: 250000,
      loan_purpose: 'Small Business',
      loan_period_months: 12,
      status: 'Loan Approved'
    },
    {
      document_number: 'DOC-1770260300456-07',
      borrower_name: 'Rahul Verma',
      loan_amount: 500000,
      loan_purpose: 'Home Renovation',
      loan_period_months: 24,
      status: 'Loan Approved'
    },
    {
      document_number: 'DOC-1770265800789-02',
      borrower_name: 'Anita Patel',
      loan_amount: 150000,
      loan_purpose: 'Education',
      loan_period_months: 6,
      status: 'Declined'
    },
    {
      document_number: 'DOC-1770270100234-11',
      borrower_name: 'Suresh Kumar',
      loan_amount: 300000,
      loan_purpose: 'Medical',
      loan_period_months: 36,
      status: 'Loan Approved'
    },
    {
      document_number: 'DOC-1770278900567-03',
      borrower_name: 'Meera Reddy',
      loan_amount: 450000,
      loan_purpose: 'Business Expansion',
      loan_period_months: 24,
      status: 'Loan Approved'
    },
    {
      document_number: 'DOC-1770283400789-08',
      borrower_name: 'Vikram Singh',
      loan_amount: 600000,
      loan_purpose: 'Debt Consolidation',
      loan_period_months: 36,
      status: 'Declined'
    },
    {
      document_number: 'DOC-1770288900123-12',
      borrower_name: 'Kavita Nair',
      loan_amount: 200000,
      loan_purpose: 'Vehicle Loan',
      loan_period_months: 12,
      status: 'Loan Approved'
    },
    {
      document_number: 'DOC-1770294500678-15',
      borrower_name: 'Arun Joshi',
      loan_amount: 350000,
      loan_purpose: 'Equipment Purchase',
      loan_period_months: 24,
      status: 'Loan Approved'
    },
    {
      document_number: 'DOC-1770300100890-06',
      borrower_name: 'Lakshmi Iyer',
      loan_amount: 275000,
      loan_purpose: 'Wedding',
      loan_period_months: 12,
      status: 'Loan Approved'
    }
  ]

  const displayMockLoans = mockLoans.length > 0 ? mockLoans : defaultMockLoans
  const displayRealUser = realUser || {
    document_number: 'DOC-1770439003790-10',
    borrower_name: 'Rajesh Kumar',
    loan_amount: 1000000,
    loan_purpose: loanPurpose,
    loan_period_months: 36,
    status: 'Loan Approved'
  }

  // Normalize status for display (Approved/APPROVED → Loan Approved) and green badge per admin design
  const displayStatus = (status: string) => {
    if (!status) return 'Pending'
    const s = status.trim()
    if (s === 'Loan Approved' || s === 'Approved' || s === 'APPROVED') return 'Loan Approved'
    if (s === 'Declined' || s === 'DECLINED') return 'Declined'
    return status
  }

  const getStatusBadgeClass = (status: string) => {
    const normalized = (status || '').trim()
    if (normalized === 'Loan Approved' || normalized === 'Approved' || normalized === 'APPROVED') {
      return 'bg-[#138808]/15 text-[#138808] border border-[#138808] font-bold'
    }
    if (normalized === 'DECLINED' || normalized === 'Declined') return 'bg-red-50 text-red-700 border border-red-300 font-bold'
    return 'bg-yellow-50 text-[#FF6B00] border border-[#FF6B00] font-bold'
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="w-full bg-white p-6" style={{ fontSize: '12px' }}>
      {/* Header with Logo and Company Name - brand colors */}
      <div className="flex justify-center mb-5 pb-4 border-b-2 border-[#FF9933]/30">
  <div className="flex items-center gap-4">
    <div className="w-16 h-16 relative flex-shrink-0">
      <Image
        src={COMPANY_LOGOS.main}
        alt="EASY LOAN COMPANY Logo"
        width={64}
        height={64}
        className="object-contain"
        priority
      />
    </div>
    <div className="text-left">
      <div className="text-xl font-bold tracking-tight">
        <span style={{ color: saffron }}>EASY </span>
        <span style={{ color: green }}>LOAN</span>
        <span style={{ color: navy }}> COMPANY PVT LTD</span>
      </div>
    </div>
  </div>
</div>

      {/* Filter Tabs and Mock Search Field - EMPTY, no document number displayed */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
          <button className="px-5 py-1.5 rounded-full text-xs font-semibold bg-white shadow-sm" style={{ color: navy }}>All</button>
          <button className="px-5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-white/50">Loan Approved</button>
          <button className="px-5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-white/50">Declined</button>
          <button className="px-5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:bg-white/50">Pending</button>
        </div>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1.5 bg-white w-60">
          <span className="text-gray-400 mr-2 text-sm">🔍</span>
          <span className="text-xs text-gray-400 italic">Search document number...</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white">
              <th className="px-3 py-2.5 text-left font-bold">Document Number</th>
              <th className="px-3 py-2.5 text-left font-bold">Applicant</th>
              <th className="px-3 py-2.5 text-left font-bold">Loan Amount</th>
              <th className="px-3 py-2.5 text-left font-bold">Loan Purpose</th>
              <th className="px-3 py-2.5 text-left font-bold">Term</th>
              <th className="px-3 py-2.5 text-left font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Real User - From Search */}
            <tr className="border-b border-gray-200 bg-white">
              <td className="px-3 py-2.5 font-mono text-gray-700" style={{ color: navy }}>{displayRealUser.document_number}</td>
              <td className="px-3 py-2.5 text-gray-700">{displayRealUser.borrower_name}</td>
              <td className="px-3 py-2.5 font-semibold text-gray-800" style={{ color: navy }}>₹{formatCurrency(displayRealUser.loan_amount)}</td>
              <td className="px-3 py-2.5 text-gray-600">{displayRealUser.loan_purpose}</td>
              <td className="px-3 py-2.5 text-gray-600">{displayRealUser.loan_period_months} months</td>
              <td className="px-3 py-2.5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block ${getStatusBadgeClass(displayRealUser.status)}`}>
                  {displayStatus(displayRealUser.status)}
                </span>
              </td>
            </tr>
            
            {/* Mock Data Rows - 9 rows */}
            {displayMockLoans.slice(0, 9).map((loan, index) => (
              <tr 
                key={loan.document_number} 
                className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2.5 font-mono text-gray-700">{loan.document_number}</td>
                <td className="px-3 py-2.5 text-gray-700">{loan.borrower_name}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-800">₹{formatCurrency(loan.loan_amount)}</td>
                <td className="px-3 py-2.5 text-gray-600">{loan.loan_purpose}</td>
                <td className="px-3 py-2.5 text-gray-600">{loan.loan_period_months} months</td>
                <td className="px-3 py-2.5">
<span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block ${getStatusBadgeClass(loan.status)}`}>
                  {displayStatus(loan.status)}
                </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Gradient from dark navy to gold */}
      <div className="mt-3 flex items-center justify-between">
        <button className="px-5 py-1.5 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
          ← Previous Page
        </button>
        <div className="text-xs font-medium text-gray-600">
          Items per page: 10 (1–10 of 198,565)
        </div>
        <button className="px-5 py-1.5 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
          Next Page →
        </button>
      </div>

      {/* NO FOOTER - Removed department logos and RBI number */}
    </div>
  )
}
