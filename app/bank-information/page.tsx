'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, Landmark, CreditCard, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function BankInformationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    identifierType: 'IFSC' as 'IFSC' | 'IBAN',
    ifscOrIban: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch user')
        }

        const bankResponse = await fetch('/api/account/bank-details')
        if (bankResponse.ok) {
          const data = await bankResponse.json()
          if (data.bankDetails && (data.bankDetails.bankName || data.bankDetails.accountNumber)) {
            setFormData({
              bankName: data.bankDetails.bankName || '',
              accountNumber: data.bankDetails.accountNumber || '',
              identifierType: 'IFSC',
              ifscOrIban: data.bankDetails.ifscCode || '',
            })
            setIsCompleted(true)
          }
        }

        const verResponse = await fetch('/api/user?action=get_verification_status')
        if (verResponse.ok) {
          const verData = await verResponse.json()
          if (verData.verification?.bank_info_completed) {
            setIsCompleted(true)
          }
        }
      } catch (err) {
        console.error('Error fetching bank details:', err)
        setError('Failed to load. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.bankName?.trim() || !formData.accountNumber?.trim() || !formData.ifscOrIban?.trim()) {
      setError('Bank Name, Account Number, and IFSC Code or IBAN are required.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/account/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber.trim(),
          ifscCode: formData.ifscOrIban.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bank details')
      }

      setSuccess('Bank details saved.')
      setIsCompleted(true)
      router.push('/signature')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueToSignature = () => {
    router.push('/signature')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] pb-8">
      <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/personal-information"
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
                <p className="text-xs text-[var(--color-text-secondary)]">Bank Information</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-[var(--color-accent-100)] px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Regd NBFC</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            <span className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] bg-clip-text text-transparent">
              Bank Account for Disbursement
            </span>
          </h1>
          <p className="text-[var(--color-text-secondary)]">Enter the account where you want to receive your loan amount</p>
        </div>

        {/* Progress: 4 steps — KYC, Personal, Bank (current), Signature */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-2 bg-[var(--color-accent-500)] rounded-full" />
          <div className="w-6 h-2 bg-[var(--color-accent-500)] rounded-full" />
          <div className="w-6 h-2 bg-[var(--color-accent-500)] rounded-full" />
          <div className="w-2 h-2 bg-[var(--color-border)] rounded-full" />
        </div>

        {isCompleted && (
          <div className="bg-[var(--color-secondary-100)] border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-900 font-medium">Bank information already completed</p>
              <p className="text-xs text-green-700 mt-1">You can update below or continue to sign the agreement.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[var(--color-primary-100)] border border-[var(--color-border)] rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-primary-900)] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[var(--color-primary-900)] font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-[var(--color-secondary-100)] border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-xl flex items-center justify-center shadow-md">
                <Landmark className="w-6 h-6 text-[var(--color-bg-surface)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Account Details</h2>
                <p className="text-[var(--color-text-secondary)] text-sm">For loan disbursement and withdrawals</p>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[var(--color-accent-500)]" />
                Bank Name
              </Label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Please fill your information"
                className="w-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] rounded-xl px-4 py-3 text-base focus:outline-none transition-colors"
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--color-secondary-600)]" />
                Account Number
              </Label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Please fill your information"
                className="w-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] rounded-xl px-4 py-3 text-base focus:outline-none transition-colors"
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[var(--color-secondary-600)]" />
                IFSC Code or IBAN
              </Label>
              <div className="flex gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="identifierType"
                    checked={formData.identifierType === 'IFSC'}
                    onChange={() => setFormData((prev) => ({ ...prev, identifierType: 'IFSC' }))}
                    className="rounded-full border-2 border-[var(--color-border)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">IFSC Code</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="identifierType"
                    checked={formData.identifierType === 'IBAN'}
                    onChange={() => setFormData((prev) => ({ ...prev, identifierType: 'IBAN' }))}
                    className="rounded-full border-2 border-[var(--color-border)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">IBAN</span>
                </label>
              </div>
              <input
                type="text"
                name="ifscOrIban"
                value={formData.ifscOrIban}
                onChange={handleChange}
                placeholder="Please fill your information"
                className="w-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent-500)] focus:border-[var(--color-accent-500)] rounded-xl px-4 py-3 text-base focus:outline-none transition-colors"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Enter any letters or numbers as per your {formData.identifierType === 'IBAN' ? 'IBAN' : 'IFSC code'}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link href="/personal-information" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-[var(--color-border)] hover:border-[var(--color-accent-500)] hover:text-[var(--color-accent-500)] rounded-xl py-3"
                >
                  Back
                </Button>
              </Link>
              {isCompleted ? (
                <Button
                  type="button"
                  onClick={handleContinueToSignature}
                  className="flex-1 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] rounded-xl py-3 hover:opacity-90"
                >
                  Continue to Sign
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] rounded-xl py-3 hover:opacity-90 disabled:opacity-70"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Continue to Sign'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
