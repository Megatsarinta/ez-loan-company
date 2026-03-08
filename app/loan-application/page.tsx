'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X, ChevronRight, Shield, CheckCircle, Lock, Calendar, PiggyBank, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApplicationProgress, getSmartRedirectPath, type UserVerification } from '@/lib/application-progress'
import type { LoanApplication } from '@/lib/application-progress'
import { CURRENCY_CONFIG, formatIndianCurrency, validateLoanAmount, calculateEMI } from '@/config/currency'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export const dynamic = 'force-dynamic'

interface User {
  id: number
  phone_number: string
  full_name: string
  credit_score: number
  wallet_balance: number
}

const INTEREST_RATES: { [key: number]: number } = {
  6: 0.005,   // 0.5% per month
  12: 0.006,  // 0.6% per month
  24: 0.007,  // 0.7% per month
  36: 0.008,  // 0.8% per month
}

export default function LoanApplicationPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [existingApplication, setExistingApplication] = useState<LoanApplication | null>(null)
  const [userVerification, setUserVerification] = useState<UserVerification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    amount: 100000,
    term: 6,
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchUserAndApplication = async () => {
      try {
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          router.push('/login')
          return
        }
        const userData = await userResponse.json()
        setUser(userData.user)

        const verificationResponse = await fetch('/api/user?action=get_verification_status')
        if (verificationResponse.ok) {
          const verData = await verificationResponse.json()
          setUserVerification(verData.verification)
        }

        const appResponse = await fetch('/api/loans?action=get_user_application')
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.application) {
            setExistingApplication(appData.application)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndApplication()
  }, [router])

  // If user has an existing application, show message and next steps
  if (!isLoading && existingApplication) {
    const progress = getApplicationProgress(existingApplication, userVerification)
    const stepsStatusMap: Record<string, string> = {
      'kyc-upload': 'Your loan is confirmed. Please complete KYC verification with Aadhaar/PAN.',
      'personal-information': 'Please complete your personal information.',
      'bank-information': 'Please fill in your bank account details for loan disbursement.',
      signature: 'Please sign the loan agreement with digital signature.',
      'application-complete': 'Your application is complete!',
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)]">
        {/* Header */}
        <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center gap-4 max-w-4xl mx-auto w-full">
            <Link
              href="/home"
              className="flex items-center gap-2 text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={32} height={32} className="object-contain" />
              </div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Loan Application</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-8 max-w-2xl mx-auto">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
            <div className="bg-gradient-to-r from-[var(--color-accent-500)]/10 to-[var(--color-secondary-600)]/10 border border-[var(--color-accent-500)]/30 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--color-accent-500)]" />
                Application Already Submitted
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Your loan application is already submitted and under review.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isKYCComplete ? 'bg-[var(--color-secondary-600)] text-[var(--color-bg-surface)]' : 'bg-[var(--color-text-secondary)] text-[var(--color-bg-surface)]'}`}>
                    {progress.isKYCComplete ? '✓' : '1'}
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)]">KYC Verification (Aadhaar/PAN)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isPersonalInfoComplete ? 'bg-[var(--color-secondary-600)] text-[var(--color-bg-surface)]' : 'bg-[var(--color-text-secondary)] text-[var(--color-bg-surface)]'}`}>
                    {progress.isPersonalInfoComplete ? '✓' : '2'}
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)]">Personal Information</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isBankInfoComplete ? 'bg-[var(--color-secondary-600)] text-[var(--color-bg-surface)]' : 'bg-[var(--color-text-secondary)] text-[var(--color-bg-surface)]'}`}>
                    {progress.isBankInfoComplete ? '✓' : '3'}
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)]">Bank Information</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${progress.isSignatureComplete ? 'bg-[var(--color-secondary-600)] text-[var(--color-bg-surface)]' : 'bg-[var(--color-text-secondary)] text-[var(--color-bg-surface)]'}`}>
                    {progress.isSignatureComplete ? '✓' : '4'}
                  </span>
                  <span className="text-sm text-[var(--color-text-primary)]">Digital Signature</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              {stepsStatusMap[progress.currentStep]}
            </p>

            <div className="flex gap-3">
              <Link href="/home" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-main)] hover:border-[var(--color-accent-500)]/30 rounded-xl"
                >
                  Back to Home
                </Button>
              </Link>
              <Link href={`/${progress.nextStep}`} className="flex-1">
                <Button 
                  className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continue Application
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow empty string while typing
    if (value === '') {
      setFormData((prev) => ({ ...prev, amount: 0 }))
      return
    }
    
    const numValue = parseInt(value)
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setFormData((prev) => ({ ...prev, amount: numValue }))
    }
  }

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // If empty, show error
    if (value === '') {
      setErrors((prev) => ({ 
        ...prev, 
        amount: CURRENCY_CONFIG.messages.minLoanError
      }))
      return
    }
    
    const numValue = parseInt(value)
    const validation = validateLoanAmount(numValue)
    
    if (!validation.valid) {
      setErrors((prev) => ({ 
        ...prev, 
        amount: validation.error || 'Invalid amount'
      }))
      if (numValue < CURRENCY_CONFIG.minLoan) {
        setFormData((prev) => ({ ...prev, amount: CURRENCY_CONFIG.minLoan }))
      } else if (numValue > CURRENCY_CONFIG.maxLoan) {
        setFormData((prev) => ({ ...prev, amount: CURRENCY_CONFIG.maxLoan }))
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.amount
        return newErrors
      })
    }
  }

  const handleTermChange = (term: number) => {
    setFormData((prev) => ({ ...prev, term }))
  }

  // Calculate loan info
  const interestRate = INTEREST_RATES[formData.term] || 0.005
  const monthlyPayment = calculateEMI(formData.amount, formData.term, interestRate)
  const monthlyPrincipal = formData.amount / formData.term
  const monthlyInterest = formData.amount * interestRate
  const totalInterest = monthlyInterest * formData.term
  const totalPayment = formData.amount + totalInterest
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate amount before submitting
      const validation = validateLoanAmount(formData.amount)
      if (!validation.valid) {
        setErrors({ amount: validation.error || 'Invalid amount' })
        setIsSubmitting(false)
        return
      }

      const documentNumber = `LOAN-${Date.now()}-${user?.id}`

      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          documentNumber,
          amountRequested: formData.amount,
          loanTermMonths: formData.term,
          interestRate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ api: data.error || 'Failed to create loan application' })
        setIsSubmitting(false)
        return
      }

      // Success - redirect to KYC upload
      router.push('/kyc-upload')
    } catch (error) {
      console.error('Error submitting loan:', error)
      setErrors({ api: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] pb-8">
      {/* Header */}
      <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-lg font-black tracking-tight">
                    <span className="text-[var(--color-accent-500)]">EASY</span>
                    <span className="text-[var(--color-secondary-600)]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Loan Application</p>
              </div>
            </div>
          </div>
          
          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[var(--color-accent-100)] px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Registered NBFC</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">
            Hello, {user?.full_name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-[var(--color-text-secondary)]">Let's find the right loan for you</p>
        </div>

        {/* STEP 1: LOAN SELECTION */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg mb-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-full flex items-center justify-center text-[var(--color-bg-surface)] font-bold text-sm">
              1
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Choose your loan</h2>
          </div>

          {/* LOAN AMOUNT */}
          <div className="mb-8">
            <Label className="block text-base font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-[var(--color-accent-500)]" />
              Enter the amount you need to borrow
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)] text-lg font-semibold">
                ₹
              </span>
              <Input
                type="number"
                value={formData.amount === 0 ? '' : formData.amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                min={CURRENCY_CONFIG.minLoan}
                max={CURRENCY_CONFIG.maxLoan}
                step="10000"
                className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] pl-10 text-lg font-semibold h-14 rounded-xl transition-colors focus:border-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-700)]/20"
                placeholder="Enter amount"
              />
            </div>
            
            {/* Min and Max Labels with Indian formatting */}
            <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mt-2 px-1">
              <span className="font-medium">Min: {formatIndianCurrency(CURRENCY_CONFIG.minLoan)}</span>
              <span className="font-medium">Max: {formatIndianCurrency(CURRENCY_CONFIG.maxLoan)}</span>
            </div>
            
            {/* Error Message with Alert Icon */}
            {errors.amount && (
              <div className="flex items-start gap-2 mt-2 text-[var(--color-primary-900)] bg-[var(--color-primary-100)] p-3 rounded-lg border border-[var(--color-border)]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{errors.amount}</p>
              </div>
            )}
          </div>

          {/* LOAN TERM */}
          <div className="mb-8">
            <Label className="block text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--color-secondary-600)]" />
              Loan term
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[6, 12, 24, 36].map((term) => (
                <button
                  key={term}
                  onClick={() => handleTermChange(term)}
                  className={`py-4 px-4 rounded-xl font-semibold transition-all border-2 ${
                    formData.term === term
                      ? 'bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-white border-transparent shadow-md'
                      : 'bg-[var(--color-bg-main)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-accent-500)]/50'
                  }`}
                >
                  {term} months
                </button>
              ))}
            </div>
          </div>

          {/* LOAN INFORMATION TABLE - Only show if amount is valid */}
          {formData.amount >= CURRENCY_CONFIG.minLoan && formData.amount <= CURRENCY_CONFIG.maxLoan && (
            <div className="mb-8">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Loan information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Principal amount:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formatIndianCurrency(formData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Monthly interest rate:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {(interestRate * 100).toFixed(1)}% per month
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Loan term:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formData.term} months
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Monthly principal:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formatIndianCurrency(monthlyPrincipal)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Monthly interest:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formatIndianCurrency(monthlyInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Total interest:</span>
                  <span className="font-semibold text-[var(--color-secondary-600)]">
                    {formatIndianCurrency(totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Total payment:</span>
                  <span className="font-semibold text-[var(--color-accent-500)]">
                    {formatIndianCurrency(totalPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 px-4 mt-4 bg-gradient-to-r from-[var(--color-accent-500)]/5 to-[var(--color-secondary-600)]/5 rounded-xl border border-[var(--color-accent-500)]/20">
                  <span className="font-bold text-[var(--color-text-primary)] text-base">Monthly EMI:</span>
                  <span className="font-bold text-[var(--color-accent-500)] text-xl">
                    {formatIndianCurrency(monthlyPayment)}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] italic mt-3">
                  *No processing fee • EMI calculated as per RBI guidelines
                </p>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[var(--color-text-secondary)]">Application date:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{today}</span>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMATION BUTTON - Disabled if amount is invalid */}
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={formData.amount < CURRENCY_CONFIG.minLoan || formData.amount > CURRENCY_CONFIG.maxLoan || formData.amount === 0}
            className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Confirm Loan</span>
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Secure & Trust Card - Updated with Indian regulatory logos */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Secure & Trusted</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Your information is protected</p>
          </div>
          <div className="flex justify-center items-center gap-8">
            {/* RBI Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[var(--color-bg-surface)] rounded-xl flex items-center justify-center mb-2 p-2 shadow-sm border border-[var(--color-border)]">
                <Image 
                  src={GOVERNMENT_LOGOS.rbi} 
                  alt="RBI" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">RBI Registered</span>
            </div>
            
            {/* CIBIL Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[var(--color-bg-surface)] rounded-xl flex items-center justify-center mb-2 p-2 shadow-sm border border-[var(--color-border)]">
                <Image 
                  src={GOVERNMENT_LOGOS.cibil} 
                  alt="CIBIL" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">CIBIL Partner</span>
            </div>
            
            {/* DigiLocker Logo */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[var(--color-bg-surface)] rounded-xl flex items-center justify-center mb-2 p-2 shadow-sm border border-[var(--color-border)]">
                <Image 
                  src={GOVERNMENT_LOGOS.digilocker} 
                  alt="DigiLocker" 
                  width={48} 
                  height={48} 
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-primary)]">DigiLocker</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-[var(--color-text-secondary)]">
            {COMPANY_INFO.name} | CIN: {COMPANY_INFO.cin} | RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}
          </p>
        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-xl max-w-sm w-full p-6 relative border border-[var(--color-border)]">
            {/* Close Button */}
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
              className="absolute top-5 right-5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-[var(--color-bg-surface)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Confirm Your Loan</h3>
            </div>

            {/* Error Message */}
            {errors.api && (
              <div className="bg-[var(--color-primary-100)] border border-[var(--color-border)] rounded-xl p-3 mb-4">
                <p className="text-sm text-[var(--color-primary-900)] font-medium">{errors.api}</p>
              </div>
            )}

            {/* Loan Details */}
            <div className="bg-gradient-to-r from-[var(--color-bg-main)] to-[var(--color-primary-100)] rounded-xl p-4 mb-6">
              <p className="text-center mb-3 text-[var(--color-text-primary)]">
                <span className="font-bold text-lg">{formatIndianCurrency(formData.amount).replace('₹', '')}</span> for {formData.term} months
              </p>
              <div className="space-y-2 text-sm border-t border-[var(--color-border)] pt-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Monthly EMI:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formatIndianCurrency(monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Total amount:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {formatIndianCurrency(monthlyPayment * formData.term)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Application date:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{today}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 border-2 border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-main)] hover:border-[var(--color-accent-500)]/30 rounded-xl disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-[var(--color-bg-surface)] border-t-transparent rounded-full animate-spin mr-2" />
                    Confirming...
                  </>
                ) : (
                  'Confirm & Continue'
                )}
              </Button>
            </div>
            
            {/* Note */}
            <p className="text-xs text-[var(--color-text-secondary)] text-center mt-4">
              You'll proceed to Aadhaar/PAN verification after confirmation
            </p>
          </div>
        </div>
      )}
    </div>
  )
}