'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Loader, Search, X, Printer, Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { COMPANY_INFO, COMPANY_LOGOS, GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

interface LoanData {
  documentNumber: string
  borrowerName: string
  borrowerPhone?: string
  loanAmount: number
  interestRate: number
  loanTerm: number
  startDate: string
  monthlyPayment: number
  totalRepayment?: string
}

interface RepaymentItem {
  month: number
  dueDate: string
  principal: number
  interest: number
  total: number
  balance: number
}

export default function RepaymentSchedulePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentLoanData, setCurrentLoanData] = useState<LoanData | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentItem[]>([])
  const [showNotFound, setShowNotFound] = useState(false)

  // Brand colors (same as loan list table)
  const navy = '#1e3a5f'
  const saffron = '#FF9933'
  const green = '#138808'

  // Search for loans by document number
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    setShowNotFound(false)
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/loans?search=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.loans || [])
        setShowResults(true)
      }
    } catch (error) {
      console.error('[v0] Error searching loans:', error)
    }
  }, [])

  // Calculate repayment schedule (reducing balance EMI)
  // interestRate: either monthly decimal (0.008 = 0.8%/month) or annual % (e.g. 9.6)
  const calculateRepaymentSchedule = (loanAmount: number, interestRate: number, months: number, startDate: string) => {
    const monthlyRate = interestRate <= 0.1 ? interestRate : interestRate / 100 / 12
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    
    const schedule: RepaymentItem[] = []
    let balance = loanAmount
    const start = new Date(startDate)

    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(start)
      dueDate.setMonth(dueDate.getMonth() + i)
      
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      const newBalance = balance - principalPayment
      balance = Math.max(0, Math.round(newBalance * 100) / 100)

      schedule.push({
        month: i,
        dueDate: dueDate.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        total: Math.round(monthlyPayment * 100) / 100,
        balance
      })
    }

    return { schedule, monthlyPayment }
  }

  // Select a loan from search results
  const selectLoan = (loan: any) => {
    setShowNotFound(false)
    // interest_rate as decimal (0.005 = 0.5%/month). Repayment = (P/n) + (P*r)
    const monthlyRateDecimal = Number(loan.interest_rate) < 0.01 ? Number(loan.interest_rate) : Number(loan.interest_rate) / 100
    const P = Number(loan.loan_amount)
    const n = loan.loan_period_months
    const monthlyPayment = P / n + P * monthlyRateDecimal
    const totalRepaymentAmount = monthlyPayment * n

    const loanData: LoanData = {
      documentNumber: loan.document_number,
      borrowerName: loan.borrower_name,
      borrowerPhone: loan.borrower_phone || '+91-XXXXXXXXXX',
      loanAmount: P,
      interestRate: Number(loan.interest_rate),
      loanTerm: n,
      startDate: new Date(loan.created_at).toISOString().split('T')[0],
      monthlyPayment,
      totalRepayment: totalRepaymentAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })
    }

    setCurrentLoanData(loanData)
    
    // Calculate repayment schedule
    const { schedule } = calculateRepaymentSchedule(
      loanData.loanAmount,
      loanData.interestRate,
      loanData.loanTerm,
      loanData.startDate
    )
    setRepaymentSchedule(schedule)
    
    setSearchQuery(loan.document_number)
    setShowResults(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setCurrentLoanData(null)
    setRepaymentSchedule([])
    setShowNotFound(false)
  }

  const handlePrint = () => {
    if (!currentLoanData || repaymentSchedule.length === 0) {
      alert('Please search and select a loan first')
      return
    }

    setIsLoading(true)

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to print the document')
      setIsLoading(false)
      return
    }

    const baseUrl = window.location.origin
    const companyLogo = `${baseUrl}${COMPANY_LOGOS.main}`
    const dofLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.makeInIndia}`
    const bspLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.mca}`
    const secLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.rbi}`
    const dmwLogoSvg = `${baseUrl}${GOVERNMENT_LOGOS.cibil}`

    const startDate = new Date(currentLoanData.startDate)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + currentLoanData.loanTerm)
    
    const formattedStartDate = startDate.toISOString().split('T')[0]
    const formattedEndDate = endDate.toISOString().split('T')[0]

    const totalPrincipal = repaymentSchedule.reduce((sum, item) => sum + item.principal, 0)
    const totalInterest = repaymentSchedule.reduce((sum, item) => sum + item.interest, 0)
    const totalPayment = repaymentSchedule.reduce((sum, item) => sum + item.total, 0)

    // Mock ID card number (in real app, this would come from the loan data)
    const idCardNumber = '11123343350' // This should be fetched from the actual user data

    const printHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Repayment Schedule - ${currentLoanData.documentNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      margin: 0; 
      padding: 0; 
      width: 100%; 
      height: 100%; 
      background: white;
    }
    body { 
      font-family: Arial, sans-serif; 
      color: #333; 
    }
    .container { 
      width: 297mm; 
      height: 210mm; 
      margin: 0 auto; 
      padding: 10mm;
      display: flex;
      flex-direction: column;
      position: relative;
      background: white;
    }
    
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
      height: 100%;
    }
    
    /* Header - same as loan list (saffron/green/navy) */
    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(255, 153, 51, 0.3);
    }
    .company-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo {
      width: 64px;
      height: 64px;
      flex-shrink: 0;
    }
    .logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .company-info {
      text-align: left;
    }
    .company-name-line1 {
      font-size: 20px;
      font-weight: bold;
      line-height: 1.2;
    }
    .company-name-saffron { color: #FF9933; }
    .company-name-green { color: #138808; }
    .company-name-navy { color: #1e3a5f; }
    .title-repayment { font-size: 14px; font-weight: bold; color: #138808; margin-top: 4px; }
    .period { font-size: 10px; color: #6b7280; margin-top: 2px; }
    
    /* Info cards - brand colors (saffron / green) */
    .cards-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 15px;
    }
    .card {
      padding: 10px 12px;
      border-radius: 8px;
      border: 2px solid;
      overflow: hidden;
    }
    .card-header { padding: 8px 12px; color: white; font-size: 10px; font-weight: bold; text-transform: uppercase; }
    .card.saffron { background: #fffbf7; border-color: #FF9933; }
    .card.saffron .card-header { background: #FF9933; }
    .card.green { background: #f0fdf4; border-color: #138808; }
    .card.green .card-header { background: #138808; }
    .card-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 10px;
    }
    .card-label {
      width: 110px;
      font-weight: 600;
      color: #475569;
    }
    .card-value {
      font-weight: 600;
      color: #0f172a;
    }
    .card-value.highlight { color: #1e3a5f; }
    .card-value.green { color: #138808; }
    
    /* Table - same as loan list (saffron to green gradient) */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 10px 0;
      font-size: 9.5px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    thead tr {
      background: linear-gradient(to right, #FF9933, #138808);
    }
    th {
      color: white;
      padding: 8px 10px;
      text-align: left;
      font-weight: 700;
      font-size: 9.5px;
      background: transparent;
    }
    th.right {
      text-align: right;
      padding-right: 10px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
      font-size: 9px;
    }
    td.right {
      text-align: right;
      padding-right: 10px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tbody tr:nth-child(even) {
      background: #f9fafb;
    }
    tbody tr:nth-child(odd) {
      background: #fff;
    }
    .total-row {
      background: #f3f4f6;
      font-weight: 700;
      border-top: 2px solid #e5e7eb;
    }
    .total-row td {
      font-weight: 700;
      padding: 8px 10px;
      background: #f3f4f6;
      color: #1f2937;
    }
    
    /* Payment instructions - saffron accent */
    .instructions {
      background: rgba(255, 153, 51, 0.06);
      border-left: 4px solid #FF9933;
      padding: 8px 12px;
      margin: 10px 0 8px 0;
    }
    .instructions-title {
      font-size: 10px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 4px;
    }
    .instructions-list {
      font-size: 8.5px;
      color: #475569;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .instructions-list li {
      list-style: none;
    }
    
    /* Borrower info */
    .borrower-info {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #475569;
      padding: 6px 0;
      border-top: 1px dashed #cbd5e1;
      margin-top: 5px;
    }
    .borrower-info span {
      font-weight: 600;
      color: #0f172a;
    }
    
    /* Footer - Clean, no logos */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #cbd5e1;
      font-size: 8px;
      color: #64748b;
    }
    .footer-left {
      font-weight: 500;
    }
    .footer-right {
      text-align: right;
    }
    .footer-company {
      font-weight: 700;
      color: #1e3a5f;
    }
    
    @media print {
      @page { 
        size: A4 landscape; 
        margin: 8mm;
      }
      html, body {
        width: 297mm;
        height: 210mm;
        display: block;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .container {
        width: 297mm;
        height: 210mm;
        margin: 0;
        padding: 8mm;
        box-shadow: none;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      thead tr {
        background: linear-gradient(to right, #FF9933, #138808);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <!-- Header - same as loan list (EASY LOAN COMPANY PVT LTD) -->
      <div class="header">
        <div class="company-section">
          <div class="logo">
            <img src="${companyLogo}" alt="${COMPANY_INFO.name} Logo" />
          </div>
          <div class="company-info">
            <div class="company-name-line1">
              <span class="company-name-saffron">EASY </span><span class="company-name-green">LOAN</span><span class="company-name-navy"> COMPANY PVT LTD</span>
            </div>
            <div class="title-repayment">REPAYMENT SCHEDULE</div>
            <div class="period">Repayment Period: ${formattedStartDate} to ${formattedEndDate}</div>
          </div>
        </div>
      </div>

      <!-- Info Cards - saffron / green -->
      <div class="cards-container">
        <div class="card saffron">
          <div class="card-header">Borrower Information</div>
          <div style="padding: 10px 12px;">
            <div class="card-row">
              <span class="card-label">Company Name:</span>
              <span class="card-value">${COMPANY_INFO.name}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Borrower Name:</span>
              <span class="card-value">${currentLoanData.borrowerName}</span>
            </div>
            <div class="card-row">
              <span class="card-label">ID Card Number:</span>
              <span class="card-value" style="font-family: monospace;">${idCardNumber}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Phone Number:</span>
              <span class="card-value highlight">${currentLoanData.borrowerPhone || '+91-XXXXXXXXXX'}</span>
            </div>
          </div>
        </div>

        <div class="card green">
          <div class="card-header">Loan Details</div>
          <div style="padding: 10px 12px;">
            <div class="card-row">
              <span class="card-label">Loan Amount:</span>
              <span class="card-value highlight">₹${currentLoanData.loanAmount.toLocaleString()}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Interest Rate:</span>
              <span class="card-value">${(currentLoanData.interestRate * 100).toFixed(1)}%</span>
            </div>
            <div class="card-row">
              <span class="card-label">Loan Terms:</span>
              <span class="card-value">${currentLoanData.loanTerm} months</span>
            </div>
            <div class="card-row">
              <span class="card-label">Total Repayment:</span>
              <span class="card-value green">₹${totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Repayment Table - Complete with all months -->
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Due Date</th>
            <th class="right">Principal</th>
            <th class="right">Interest</th>
            <th class="right">Total Payment</th>
            <th class="right">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${repaymentSchedule.map(item => `
            <tr>
              <td>${item.month}</td>
              <td>${item.dueDate}</td>
              <td class="right">₹${item.principal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td class="right">₹${item.interest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td class="right">₹${item.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td class="right">₹${item.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2" style="text-align: right; font-weight: 700;">TOTAL</td>
            <td class="right">₹${totalPrincipal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            <td class="right">₹${totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            <td class="right">₹${totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            <td class="right">₹0.00</td>
          </tr>
        </tbody>
      </table>

      <!-- Payment Instructions -->
      <div class="instructions">
        <div class="instructions-title">IMPORTANT PAYMENT INSTRUCTIONS</div>
        <ul class="instructions-list">
          <li>• Payment is due on the 15th of every month</li>
          <li>• Late payments will incur a 5% penalty</li>
          <li>• Early repayment is allowed without any prepayment penalties</li>
          <li>• Contact us at ${COMPANY_INFO.contact.phone} for any questions or concerns</li>
        </ul>
      </div>

      <!-- Borrower Info -->
      <div class="borrower-info">
        <div><span>Borrower:</span> ${currentLoanData.borrowerName}</div>
        <div><span>Document Number:</span> ${currentLoanData.documentNumber}</div>
      </div>

      <!-- Footer - Clean, no logos -->
      <div class="footer">
        <div class="footer-left">Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="footer-right"><span class="footer-company">${COMPANY_INFO.name}</span></div>
      </div>
    </div>
  </div>
  <script>
    setTimeout(() => {
      window.print();
    }, 300);
  </script>
</body>
</html>`

  printWindow.document.write(printHTML)
  printWindow.document.close()
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/documents" className="inline-flex items-center gap-2 text-[#FF9933] hover:text-[#138808] mb-4 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Documents
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent">
                Repayment Schedule
              </span>
            </h1>
            <p className="text-[#6C757D] mt-1">Generate detailed repayment schedules with monthly breakdown</p>
          </div>
          
          {/* Government Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[#FF9933]/20">
            <Shield className="w-4 h-4 text-[#FF9933]" />
            <span className="text-xs font-medium text-[#212529]">RBI • MCA • CIBIL</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-auto max-h-[900px]">
            {showNotFound ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <div className="w-20 h-20 mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-center font-medium text-amber-700">No loan found with document number "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-2">Please verify the document number and try again.</p>
                <Button
                  onClick={clearSearch}
                  className="mt-4 border-2 border-[#FF9933] text-[#FF9933] bg-white hover:bg-blue-50"
                >
                  Clear Search
                </Button>
              </div>
            ) : currentLoanData && repaymentSchedule.length > 0 ? (
              <div id="repayment-export-content" className="space-y-6">
                {/* Company header - same as loan list table */}
                <div className="flex justify-center mb-5 pb-4 border-b-2 border-[#FF9933]/30">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={COMPANY_LOGOS.main}
                        alt={`${COMPANY_INFO.name} Logo`}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-xl font-bold tracking-tight">
                        <span style={{ color: saffron }}>EASY </span>
                        <span style={{ color: green }}>LOAN</span>
                        <span style={{ color: navy }}> COMPANY PVT LTD</span>
                      </div>
                      <h2 className="text-sm font-bold mt-1" style={{ color: green }}>REPAYMENT SCHEDULE</h2>
                      <p className="text-[10px] text-gray-600 mt-0.5">
                        Repayment Period: {currentLoanData.startDate} to {new Date(new Date(currentLoanData.startDate).setMonth(new Date(currentLoanData.startDate).getMonth() + currentLoanData.loanTerm)).toISOString().split('T')[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Two Info Cards - brand colors */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Card: Borrower (saffron theme) */}
                  <div className="rounded-lg overflow-hidden border-2 shadow-sm" style={{ borderColor: saffron, backgroundColor: '#fffbf7' }}>
                    <div className="px-3 py-2 text-white text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: saffron }}>Borrower Information</div>
                    <div className="p-3 space-y-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Company Name</p>
                        <p className="font-semibold" style={{ color: navy }}>{COMPANY_INFO.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Borrower Name</p>
                        <p className="font-semibold text-gray-900">{currentLoanData.borrowerName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Document Number</p>
                        <p className="font-mono font-semibold text-gray-700">{currentLoanData.documentNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Phone Number</p>
                        <p className="font-bold" style={{ color: green }}>{currentLoanData.borrowerPhone || '+91-XXXXXXXXXX'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Card: Loan Details (green theme) */}
                  <div className="rounded-lg overflow-hidden border-2 shadow-sm" style={{ borderColor: green, backgroundColor: '#f0fdf4' }}>
                    <div className="px-3 py-2 text-white text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: green }}>Loan Details</div>
                    <div className="p-3 space-y-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Loan Amount</p>
                        <p className="font-bold" style={{ color: navy }}>₹{currentLoanData.loanAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Interest Rate</p>
                        <p className="font-bold text-gray-900">{(currentLoanData.interestRate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Loan Terms</p>
                        <p className="font-bold text-gray-900">{currentLoanData.loanTerm} months</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Total Repayment</p>
                        <p className="font-bold" style={{ color: green }}>₹{currentLoanData.totalRepayment}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Repayment Table - same as loan list table */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white">
                        <th className="px-3 py-2.5 text-left font-bold">Month</th>
                        <th className="px-3 py-2.5 text-left font-bold">Due Date</th>
                        <th className="px-3 py-2.5 text-right font-bold">Principal</th>
                        <th className="px-3 py-2.5 text-right font-bold">Interest</th>
                        <th className="px-3 py-2.5 text-right font-bold">Total Payment</th>
                        <th className="px-3 py-2.5 text-right font-bold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repaymentSchedule.map((item, index) => (
                        <tr key={item.month} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-3 py-2.5 font-semibold text-gray-700" style={{ color: navy }}>{item.month}</td>
                          <td className="px-3 py-2.5 text-gray-700">{item.dueDate}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-gray-800">₹{item.principal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-gray-800">₹{item.interest.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2.5 text-right font-bold font-mono text-gray-800" style={{ color: navy }}>₹{item.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-gray-700">₹{item.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-gray-200 bg-gray-100 font-bold">
                        <td colSpan={2} className="px-3 py-2.5 text-right text-gray-800">TOTAL</td>
                        <td className="px-3 py-2.5 text-right text-gray-800">₹{repaymentSchedule.reduce((s, i) => s + i.principal, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right text-gray-800">₹{repaymentSchedule.reduce((s, i) => s + i.interest, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right text-gray-800">₹{repaymentSchedule.reduce((s, i) => s + i.total, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right text-gray-800">₹0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Borrower Info */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600">
                  <p className="font-semibold">Borrower: {currentLoanData.borrowerName}</p>
                  <p>Document Number: {currentLoanData.documentNumber}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Search and select a document number to view repayment schedule</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 h-fit sticky top-24 max-h-[700px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#212529]">Export Options</h2>
          </div>

          {/* Document Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#212529] mb-3 flex items-center gap-1">
              <Search className="w-4 h-4 text-[#FF9933]" />
              Search Document Number
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#FF9933] transition-shadow bg-white">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter document number..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
                {searchQuery && (
                  <X
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={clearSearch}
                  />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-gray-300 rounded-lg bg-white shadow-lg z-10">
                  <div className="max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => selectLoan(result)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-sm text-gray-900">{result.document_number}</div>
                        <div className="text-xs text-gray-600">{result.borrower_name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 border border-gray-300 rounded-lg bg-white shadow-lg p-4 text-sm text-gray-500 z-10">
                  No results found
                </div>
              )}
            </div>
          </div>

          {/* Schedule Info */}
          {currentLoanData && (
            <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-[#FF9933]/20">
              <p className="text-sm font-medium text-[#212529] flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                Schedule: <span className="font-bold text-[#FF9933]">{currentLoanData.loanTerm} months</span>
              </p>
            </div>
          )}

          {/* Print Button */}
          <Button
            onClick={handlePrint}
            disabled={isLoading || !currentLoanData || repaymentSchedule.length === 0}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Preparing...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print Schedule
              </>
            )}
          </Button>

          {/* Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-[#FF9933]/20">
            <h4 className="text-sm font-semibold text-[#212529] mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#00A86B]" />
              Document Information
            </h4>
            <ul className="text-xs text-[#6C757D] space-y-1.5">
              <li className="flex items-start">
                <span className="text-[#138808] mr-2">•</span>
                <span>Schedule is dynamically calculated based on loan term</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#138808] mr-2">•</span>
                <span>Document prints in A4 landscape orientation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Government Logos Strip */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 border border-[#FF9933]/20">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative">
              <Image src={GOVERNMENT_LOGOS.rbi} alt="SEC" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xs font-medium text-[#FF9933]">RBI Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative">
              <Image src={GOVERNMENT_LOGOS.mca} alt="BSP" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xs font-medium text-[#00A86B]">MCA Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative">
              <Image src={GOVERNMENT_LOGOS.cibil} alt="DMW" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xs font-medium text-[#138808]">CIBIL Partner</span>
          </div>
        </div>
      </div>
    </div>
  )
}
