'use client'

import Image from 'next/image'
import { COMPANY_INFO_FALLBACK, COMPANY_LOGOS } from '@/lib/constants/company-info'

interface RepaymentScheduleTemplateProps {
  loanId?: string
}

export default function RepaymentScheduleTemplate({ loanId }: RepaymentScheduleTemplateProps) {
  // Brand colors (saffron, green, navy)
  const navy = 'var(--color-primary-900)'
  const saffron = 'var(--color-accent-500)'
  const green = 'var(--color-secondary-600)'

  const mockSchedule = [
    { month: 1, dueDate: '03/06/2026', principalPayment: '27,455.04', interestPayment: '666.67', totalPayment: '28,121.70', balance: '972,544.96' },
    { month: 2, dueDate: '04/06/2026', principalPayment: '27,473.34', interestPayment: '648.36', totalPayment: '28,121.70', balance: '945,071.63' },
    { month: 3, dueDate: '05/06/2026', principalPayment: '27,491.65', interestPayment: '630.05', totalPayment: '28,121.70', balance: '917,579.97' },
    { month: 4, dueDate: '06/06/2026', principalPayment: '27,509.98', interestPayment: '611.72', totalPayment: '28,121.70', balance: '890,069.99' },
    { month: 5, dueDate: '07/06/2026', principalPayment: '27,528.32', interestPayment: '593.38', totalPayment: '28,121.70', balance: '862,541.67' },
    { month: 6, dueDate: '08/06/2026', principalPayment: '27,546.67', interestPayment: '575.03', totalPayment: '28,121.70', balance: '835,995.00' },
    { month: 7, dueDate: '09/06/2026', principalPayment: '27,565.04', interestPayment: '556.66', totalPayment: '28,121.70', balance: '808,429.96' },
    { month: 8, dueDate: '10/06/2026', principalPayment: '27,583.42', interestPayment: '538.28', totalPayment: '28,121.70', balance: '780,846.54' },
    { month: 9, dueDate: '11/06/2026', principalPayment: '27,601.81', interestPayment: '519.89', totalPayment: '28,121.70', balance: '753,244.73' },
    { month: 10, dueDate: '12/06/2026', principalPayment: '27,620.21', interestPayment: '501.49', totalPayment: '28,121.70', balance: '725,624.52' },
    { month: 11, dueDate: '01/07/2026', principalPayment: '27,638.63', interestPayment: '483.07', totalPayment: '28,121.70', balance: '697,985.89' },
    { month: 12, dueDate: '02/07/2026', principalPayment: '27,657.06', interestPayment: '464.64', totalPayment: '28,121.70', balance: '670,328.83' },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto bg-[var(--color-bg-surface)] p-6" style={{ fontSize: '12px' }}>
      {/* Company name header - same as loan list table */}
      <div className="flex justify-center mb-5 pb-4 border-b-2 border-[var(--color-accent-500)]/30">
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
            <h2 className="text-sm font-bold mt-1" style={{ color: green }}>REPAYMENT SCHEDULE</h2>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Repayment Period: 2026-02-06 to 2029-02-06</p>
          </div>
        </div>
      </div>

      {/* Borrower Information & Loan Details Cards - brand colors */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Left Card - Borrower Details (saffron theme) */}
        <div
          className="rounded-lg overflow-hidden border-2 shadow-sm"
          style={{ borderColor: saffron, backgroundColor: 'var(--color-accent-100)' }}
        >
          <div className="px-3 py-2 text-[var(--color-bg-surface)] text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: saffron }}>
            Borrower Information
          </div>
          <div className="p-3 space-y-1.5">
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>COMPANY NAME</p>
              <p className="text-xs font-bold" style={{ color: navy }}>{COMPANY_INFO_FALLBACK.name}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>BORROWER NAME</p>
              <p className="text-xs font-bold text-gray-900">Rajesh Kumar</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>DOCUMENT NUMBER</p>
              <p className="text-xs font-mono text-[var(--color-text-primary)]">DOC-1770439003790-10</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>PHONE NUMBER</p>
              <p className="text-xs font-bold" style={{ color: green }}>+91-9876543210</p>
            </div>
          </div>
        </div>

        {/* Right Card - Loan Details (green theme) */}
        <div
          className="rounded-lg overflow-hidden border-2 shadow-sm"
          style={{ borderColor: green, backgroundColor: 'var(--color-secondary-100)' }}
        >
          <div className="px-3 py-2 text-[var(--color-bg-surface)] text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: green }}>
            Loan Details
          </div>
          <div className="p-3 space-y-1.5">
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>LOAN AMOUNT</p>
              <p className="text-sm font-bold" style={{ color: navy }}>₹10,00,000</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>LOAN TERM</p>
              <p className="text-xs font-bold text-gray-900">36 months</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>INTEREST RATE</p>
              <p className="text-xs font-bold text-gray-900">0.8%</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold" style={{ color: navy }}>TOTAL REPAYMENT</p>
              <p className="text-xs font-bold" style={{ color: green }}>₹1,008,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Schedule Table - same as loan list table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border border-[var(--color-border)] rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)]">
              <th className="px-3 py-2.5 text-left font-bold">Month</th>
              <th className="px-3 py-2.5 text-left font-bold">Due Date</th>
              <th className="px-3 py-2.5 text-right font-bold">Principal</th>
              <th className="px-3 py-2.5 text-right font-bold">Interest</th>
              <th className="px-3 py-2.5 text-right font-bold">Total Payment</th>
              <th className="px-3 py-2.5 text-right font-bold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {mockSchedule.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-[var(--color-border)] ${index % 2 === 0 ? 'bg-[var(--color-bg-surface)]' : 'bg-[var(--color-bg-main)]'}`}
              >
                <td className="px-3 py-2.5 font-semibold text-[var(--color-text-primary)]" style={{ color: navy }}>{row.month}</td>
                <td className="px-3 py-2.5 text-[var(--color-text-primary)]">{row.dueDate}</td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-800">₹{row.principalPayment}</td>
                <td className="px-3 py-2.5 text-right font-mono text-gray-800">₹{row.interestPayment}</td>
                <td className="px-3 py-2.5 text-right font-bold font-mono text-gray-800" style={{ color: navy }}>₹{row.totalPayment}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[var(--color-text-primary)]">₹{row.balance}</td>
              </tr>
            ))}
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-main)] font-bold">
              <td colSpan={2} className="px-3 py-2.5 text-right text-gray-800">TOTAL</td>
              <td className="px-3 py-2.5 text-right text-gray-800">₹330,000.00</td>
              <td className="px-3 py-2.5 text-right text-gray-800">₹6,600.00</td>
              <td className="px-3 py-2.5 text-right text-gray-800">₹336,600.00</td>
              <td className="px-3 py-2.5 text-right text-gray-800">₹0.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Instructions - saffron accent */}
      <div className="p-3 mb-3 rounded-lg border-2" style={{ backgroundColor: `${saffron}08`, borderColor: `${saffron}50`, borderLeft: `4px solid ${saffron}` }}>
        <p className="text-[10px] font-bold mb-1" style={{ color: navy }}>IMPORTANT PAYMENT INSTRUCTIONS</p>
        <ul className="text-[9px] text-[var(--color-text-secondary)] space-y-0.5">
          <li>• Payment is due on the 15th of every month</li>
          <li>• Late payments will incur a 5% penalty</li>
          <li>• Early repayment is allowed without any prepayment penalties</li>
          <li>• Contact us at {COMPANY_INFO_FALLBACK.contactPhone} for any questions or concerns</li>
        </ul>
      </div>

      {/* Footer - brand strip */}
      <div className="pt-2 flex justify-between items-center text-[8px] rounded-b-lg" style={{ borderTop: `2px solid ${green}40` }}>
        <div className="text-[var(--color-text-secondary)]">Generated on: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="font-bold" style={{ color: navy }}>{COMPANY_INFO_FALLBACK?.name || 'EASY LOAN COMPANY PVT LTD'}</div>
      </div>
    </div>
  )
}
