'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronDown,
  Home,
  Wallet,
  UserCircle,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  TrendingUp,
  DollarSign,
  Percent
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/currency'
import { GOVERNMENT_LOGOS, COMPANY_LOGOS } from '@/lib/constants/company-info'

interface RepaymentInstallment {
  id: number
  installmentNumber: number
  dueDate: string
  amount: number
  principalAmount: number
  interestAmount: number
  status: 'upcoming' | 'due_soon' | 'paid' | 'overdue'
  paidDate?: string
  lateFee?: number
}

export default function RepaymentSchedulePage() {
  const router = useRouter()
  const [schedule, setSchedule] = useState<RepaymentInstallment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loanSummary, setLoanSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    remainingBalance: 0,
    nextDueDate: '',
  })

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/account/repayment-schedule')
        if (response.ok) {
          const data = await response.json()
          setSchedule(data.installments || [])
          setLoanSummary(data.summary)
          console.log('[v0] Repayment schedule loaded')
        } else if (response.status === 401) {
          router.push('/login')
        } else {
          setError('Failed to load schedule')
        }
      } catch (err) {
        console.error('[v0] Error fetching schedule:', err)
        setError('An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [router])

  const getStatusColor = (status: string): { bg: string; text: string; border: string } => {
    switch (status) {
      case 'paid':
        return { bg: 'var(--color-secondary-100)', text: 'var(--color-secondary-600)', border: 'var(--color-secondary-600)' }
      case 'due_soon':
        return { bg: 'var(--color-accent-100)', text: 'var(--color-accent-600)', border: 'var(--color-accent-600)' }
      case 'overdue':
        return { bg: 'var(--color-primary-100)', text: 'var(--color-primary-900)', border: 'var(--color-primary-900)' }
      default:
        return { bg: 'var(--color-bg-main)', text: 'var(--color-text-secondary)', border: 'var(--color-text-secondary)' }
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'paid': return 'PAID'
      case 'due_soon': return 'DUE SOON'
      case 'overdue': return 'OVERDUE'
      case 'upcoming': return 'UPCOMING'
      default: return status.replace('_', ' ').toUpperCase()
    }
  }

  const filteredSchedule =
    filterStatus === 'all'
      ? schedule
      : schedule.filter((item) => item.status === filterStatus)

  const progressPercentage =
    loanSummary.totalAmount > 0
      ? (loanSummary.paidAmount / loanSummary.totalAmount) * 100
      : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading schedule...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--color-secondary-600)]" />
          </div>
          <p className="text-[var(--color-secondary-600)] mb-4">{error}</p>
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)]"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!isLoading && schedule.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)]">
        {/* Header */}
        <header className="bg-[var(--color-bg-surface)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] hover:bg-[var(--color-accent-100)]/50 p-2 rounded-xl transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image
                    src={COMPANY_LOGOS.main}
                    alt="EasyLoan"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-xl font-black tracking-tight">
                      <span className="text-[var(--color-accent-500)]">EASY</span>
                      <span className="text-[var(--color-secondary-600)]">LOAN</span>
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Repayment Schedule</p>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
              <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Registered</span>
            </div>
          </div>
        </header>

        {/* Empty State */}
        <main className="px-4 py-12 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-accent-500)]/20">
              <Calendar className="w-10 h-10 text-[var(--color-accent-500)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No schedule available</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">You don't have an approved loan yet or no repayment schedule has been set up.</p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)]/50"
            >
              Go Back
            </Button>
          </div>
        </main>

        {/* Footer Note */}
        <div className="text-center mt-6 pb-4">
          <p className="text-xs text-[var(--color-text-secondary)]">
            EasyLoan is RBI Registered, MCA Supervised, and MeitY Accredited.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] pb-24">
      {/* Header */}
      <header className="bg-[var(--color-bg-surface)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] hover:bg-[var(--color-accent-100)]/50 p-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="EasyLoan"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-xl font-black tracking-tight">
                    <span className="text-[var(--color-accent-500)]">EASY</span>
                    <span className="text-[var(--color-secondary-600)]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Repayment Schedule</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Registered</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Loan Summary - Redesigned with flag colors */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[var(--color-bg-surface)]" />
            </div>
            Loan Summary
          </h2>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-[var(--color-text-secondary)]">Progress</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{Math.round(progressPercentage)}%</p>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Summary Grid - Color coded cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-[var(--color-accent-500)]/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-[var(--color-accent-500)]" />
                <p className="text-xs text-[var(--color-text-secondary)]">Total Amount</p>
              </div>
              <p className="text-lg font-bold text-[var(--color-accent-500)]">
                {formatINR(loanSummary.totalAmount)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-secondary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-secondary-600)]/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                <p className="text-xs text-[var(--color-text-secondary)]">Paid Amount</p>
              </div>
              <p className="text-lg font-bold text-[var(--color-secondary-600)]">
                {formatINR(loanSummary.paidAmount)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-secondary-600)]/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-[var(--color-secondary-600)]" />
                <p className="text-xs text-[var(--color-text-secondary)]">Remaining</p>
              </div>
              <p className="text-lg font-bold text-[var(--color-secondary-600)]">
                {formatINR(loanSummary.remainingBalance)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[var(--color-accent-100)] to-[var(--color-bg-surface)] rounded-xl border border-[var(--color-accent-600)]/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[var(--color-accent-600)]" />
                <p className="text-xs text-[var(--color-text-secondary)]">Next Due</p>
              </div>
              <p className="text-lg font-bold text-[var(--color-accent-600)]">
                {loanSummary.nextDueDate
                  ? new Date(loanSummary.nextDueDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric'
                  })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Buttons - Redesigned */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'upcoming', 'due_soon', 'paid', 'overdue'].map((status) => {
            const isActive = filterStatus === status
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                    ? 'bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] shadow-md'
                    : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent-500)] hover:text-[var(--color-accent-500)]'
                  }`}
              >
                {status === 'all' ? 'All' : getStatusLabel(status)}
              </button>
            )
          })}
        </div>

        {/* Schedule Table */}
        <div className="bg-[var(--color-bg-surface)] rounded-xl shadow-lg border border-[var(--color-border)] overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] px-4 py-3">
            <h3 className="text-[var(--color-bg-surface)] font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Installment Schedule
            </h3>
          </div>

          {filteredSchedule.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredSchedule.map((installment) => {
                const statusStyle = getStatusColor(installment.status)
                return (
                  <div key={installment.id}>
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === installment.id ? null : installment.id
                        )
                      }
                      className="w-full px-4 py-4 flex items-center justify-between hover:bg-[var(--color-bg-main)] transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          Installment #{installment.installmentNumber}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(installment.dueDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                          {formatINR(installment.amount)}
                        </p>
                        <span
                          className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            borderColor: statusStyle.border
                          }}
                        >
                          {getStatusLabel(installment.status)}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform ${expandedId === installment.id ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* Expanded Details */}
                    {expandedId === installment.id && (
                      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-4 border-t border-[var(--color-border)]">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-[var(--color-bg-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Principal</p>
                            <p className="font-semibold text-[var(--color-accent-500)]">
                              {formatINR(installment.principalAmount)}
                            </p>
                          </div>
                          <div className="bg-[var(--color-bg-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Interest</p>
                            <p className="font-semibold text-[var(--color-secondary-600)]">
                              {formatINR(installment.interestAmount)}
                            </p>
                          </div>
                          {installment.status === 'paid' && installment.paidDate && (
                            <div className="col-span-2 bg-[var(--color-bg-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Paid On</p>
                              <p className="font-semibold text-[var(--color-secondary-600)]">
                                {new Date(installment.paidDate).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                          {installment.status === 'overdue' && installment.lateFee && (
                            <div className="col-span-2 bg-[var(--color-bg-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Late Fee</p>
                              <p className="font-semibold text-[var(--color-secondary-600)]">
                                {formatINR(installment.lateFee)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-[var(--color-text-secondary)]">No installments found</div>
          )}
        </div>

        {/* Government Trust Badges */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 mb-6 border border-[var(--color-accent-500)]/20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">MCA Supervised</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">MeitY Accredited</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Back to Account
        </Button>
      </main>

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4">
        <p className="text-xs text-[var(--color-text-secondary)]">
          EasyLoan is RBI Registered, MCA Supervised, and MeitY Accredited.
          All rights reserved. For NRI, for Family.
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 py-4 border-t border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] hover:bg-[var(--color-accent-500)]/5"
          >
            <Home className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>

          <Link
            href="/wallet"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] hover:bg-[var(--color-accent-500)]/5"
          >
            <Wallet className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>

          <Link
            href="/my-account"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[var(--color-accent-500)] bg-[rgba(0,56,168,0.05)]"
          >
            <UserCircle className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
