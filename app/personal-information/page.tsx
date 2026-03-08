'use client'

import React from "react"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS, LOAN_PURPOSES } from '@/lib/constants/company-info'

interface User {
  id: number
  phone_number: string
  full_name: string
  email?: string
}

interface PersonalInfo {
  full_name: string
  id_card_number: string
  id_type: string
  gender: string
  date_of_birth: string
  current_job: string
  monthly_income: string
  loan_purpose: string
  living_address: string
  emergency_contact_name: string
  emergency_contact_phone: string
}

export default function PersonalInformationPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [formData, setFormData] = useState<PersonalInfo>({
    full_name: '',
    id_card_number: '',
    id_type: 'aadhaar',
    gender: '',
    date_of_birth: '',
    current_job: '',
    monthly_income: '',
    loan_purpose: '',
    living_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true)
        
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch user')
        }
        
        const userData = await userResponse.json()
        setUser(userData.user)

        const infoResponse = await fetch('/api/account/personal-info')
        if (infoResponse.ok) {
          const data = await infoResponse.json()
          if (data.info) {
            setFormData({
              full_name: data.info.full_name || '',
              id_card_number: data.info.id_card_number || '',
              id_type: data.info.id_type || 'aadhaar',
              gender: data.info.gender || '',
              date_of_birth: data.info.date_of_birth || '',
              current_job: data.info.current_job || '',
              monthly_income: data.info.monthly_income || '',
              loan_purpose: data.info.loan_purpose || '',
              living_address: data.info.living_address || '',
              emergency_contact_name: data.info.emergency_contact_name || '',
              emergency_contact_phone: data.info.emergency_contact_phone || '',
            })
          }
        }

        const verResponse = await fetch('/api/user?action=get_verification_status')
        if (verResponse.ok) {
          const verData = await verResponse.json()
          if (verData.verification?.personal_info_completed) {
            setIsCompleted(true)
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err)
        setApiError('Failed to load user data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    if (apiError) {
      setApiError('')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.id_type) {
      newErrors.id_type = 'Please select ID type'
    }
    
    if (!formData.id_card_number?.trim()) {
      newErrors.id_card_number = 'ID number is required'
    } else {
      const idNumber = formData.id_card_number.trim()
      if (formData.id_type === 'aadhaar' && !/^\d{12}$/.test(idNumber)) {
        newErrors.id_card_number = 'Aadhaar number must be 12 digits'
      } else if (formData.id_type === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idNumber)) {
        newErrors.id_card_number = 'PAN must be in format: ABCDE1234F'
      } else if (formData.id_type === 'passport' && !/^[A-Z][0-9]{7}$/.test(idNumber)) {
        newErrors.id_card_number = 'Passport number must be 8 characters (1 letter + 7 digits)'
      }
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender'
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    } else {
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age < 18) {
        newErrors.date_of_birth = 'You must be at least 18 years old'
      }
    }
    
    if (!formData.current_job?.trim()) {
      newErrors.current_job = 'Current occupation is required'
    }
    
    if (!formData.monthly_income?.trim()) {
      newErrors.monthly_income = 'Monthly income is required'
    } else {
      const income = parseFloat(formData.monthly_income.replace(/[^0-9.-]+/g, ''))
      if (isNaN(income) || income < 0) {
        newErrors.monthly_income = 'Please enter a valid income amount'
      }
    }
    
    if (!formData.loan_purpose?.trim()) {
      newErrors.loan_purpose = 'Loan purpose is required'
    }
    
    if (!formData.living_address?.trim()) {
      newErrors.living_address = 'Current address is required'
    }
    
    if (!formData.emergency_contact_name?.trim()) {
      newErrors.emergency_contact_name = 'Emergency contact name is required'
    }
    
    if (!formData.emergency_contact_phone?.trim()) {
      newErrors.emergency_contact_phone = 'Emergency contact number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.emergency_contact_phone.trim())) {
      newErrors.emergency_contact_phone = 'Please enter a valid 10-digit Indian mobile number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    if (!user) {
      setApiError('User not found. Please log in again.')
      return
    }

    setIsSubmitting(true)
    setApiError('')

    try {
      const response = await fetch('/api/account/personal-info', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthly_income: parseFloat(formData.monthly_income.replace(/[^0-9.-]+/g, '')).toString()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save information')
      }

      await fetch('/api/users/mark-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'personal_info' }),
      }).catch(err => console.error('Error marking verification:', err))

      router.push('/bank-information')
      
    } catch (err) {
      console.error('Submit error:', err)
      setApiError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading your information...</p>
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
              href="/kyc-upload"
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
                <p className="text-xs text-[var(--color-text-secondary)]">Personal Information</p>
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
              Complete Your Profile
            </span>
          </h1>
          <p className="text-[var(--color-text-secondary)]">Please fill in all required information for KYC compliance</p>
        </div>

        {/* Progress: 4 steps — KYC, Personal (current), Bank, Signature */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-2 bg-[var(--color-accent-500)] rounded-full"></div>
          <div className="w-6 h-2 bg-[var(--color-accent-500)] rounded-full"></div>
          <div className="w-2 h-2 bg-[var(--color-border)] rounded-full"></div>
          <div className="w-2 h-2 bg-[var(--color-border)] rounded-full"></div>
        </div>

        {isCompleted && (
          <div className="bg-[var(--color-secondary-100)] border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-900 font-medium">✓ Personal information already completed</p>
              <p className="text-xs text-green-700 mt-1">You can update your information below if needed</p>
            </div>
          </div>
        )}

        {apiError && (
          <div className="bg-[var(--color-primary-100)] border border-[var(--color-border)] rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-primary-900)] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[var(--color-primary-900)] font-medium">{apiError}</p>
          </div>
        )}

        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[var(--color-text-primary)] font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="As per Aadhaar/PAN card"
                  className={`bg-[var(--color-bg-surface)] border-2 ${
                    errors.full_name ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_type" className="text-[var(--color-text-primary)] font-medium">
                  ID Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="id_type"
                  name="id_type"
                  value={formData.id_type}
                  onChange={handleChange}
                  className={`w-full bg-[var(--color-bg-surface)] border-2 ${
                    errors.id_type ? 'border-red-300' : 'border-[var(--color-border)]'
                  } rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent-500)] transition-colors`}
                  disabled={isSubmitting}
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="voter">Voter ID</option>
                  <option value="driving">Driving License</option>
                </select>
                {errors.id_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_card_number" className="text-[var(--color-text-primary)] font-medium">
                  ID Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="id_card_number"
                  name="id_card_number"
                  value={formData.id_card_number}
                  onChange={handleChange}
                  placeholder={
                    formData.id_type === 'aadhaar' ? '12-digit Aadhaar number' :
                    formData.id_type === 'pan' ? '10-digit PAN (e.g., ABCDE1234F)' :
                    'Enter ID number'
                  }
                  className={`bg-[var(--color-bg-surface)] border-2 ${
                    errors.id_card_number ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.id_card_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_card_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[var(--color-text-primary)] font-medium">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full bg-[var(--color-bg-surface)] border-2 ${
                    errors.gender ? 'border-red-300' : 'border-[var(--color-border)]'
                  } rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent-500)] transition-colors`}
                  disabled={isSubmitting}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-[var(--color-text-primary)] font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`bg-[var(--color-bg-surface)] border-2 ${
                    errors.date_of_birth ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_job" className="text-[var(--color-text-primary)] font-medium">
                  Current Occupation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="current_job"
                  name="current_job"
                  value={formData.current_job}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer, Business Owner"
                  className={`bg-[var(--color-bg-surface)] border-2 ${
                    errors.current_job ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.current_job && (
                  <p className="text-red-500 text-sm mt-1">{errors.current_job}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_income" className="text-[var(--color-text-primary)] font-medium">
                  Monthly Income (₹) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">₹</span>
                  <Input
                    id="monthly_income"
                    name="monthly_income"
                    value={formData.monthly_income}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                    className={`bg-[var(--color-bg-surface)] border-2 pl-8 ${
                      errors.monthly_income ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                    } rounded-xl px-4 py-3 transition-colors`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.monthly_income && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthly_income}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="loan_purpose" className="text-[var(--color-text-primary)] font-medium">
                  Purpose of Loan <span className="text-red-500">*</span>
                </Label>
                <select
                  id="loan_purpose"
                  name="loan_purpose"
                  value={formData.loan_purpose}
                  onChange={handleChange}
                  className={`w-full bg-[var(--color-bg-surface)] border-2 ${
                    errors.loan_purpose ? 'border-red-300' : 'border-[var(--color-border)]'
                  } rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-accent-500)] transition-colors`}
                  disabled={isSubmitting}
                >
                  <option value="">Select loan purpose</option>
                  {LOAN_PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
                {errors.loan_purpose && (
                  <p className="text-red-500 text-sm mt-1">{errors.loan_purpose}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="living_address" className="text-[var(--color-text-primary)] font-medium">
                  Current Residential Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="living_address"
                  name="living_address"
                  value={formData.living_address}
                  onChange={handleChange}
                  placeholder="Flat/House No., Area, City, PIN Code"
                  className={`bg-[var(--color-bg-surface)] border-2 ${
                    errors.living_address ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.living_address && (
                  <p className="text-red-500 text-sm mt-1">{errors.living_address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name" className="text-[var(--color-text-primary)] font-medium">
                  Emergency Contact Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Full name of family member"
                  className={`bg-[var(--color-bg-surface)] border-2 ${
                    errors.emergency_contact_name ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.emergency_contact_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone" className="text-[var(--color-text-primary)] font-medium">
                  Emergency Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`bg-[var(--color-bg-surface)] border-2 ${
                    errors.emergency_contact_phone ? 'border-red-300 focus:border-red-500' : 'border-[var(--color-border)] focus:border-[var(--color-accent-500)]'
                  } rounded-xl px-4 py-3 transition-colors`}
                  disabled={isSubmitting}
                />
                {errors.emergency_contact_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_phone}</p>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-6 border-t border-[var(--color-border)]">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] font-semibold py-3 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Information'
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Your information is secure and encrypted. {COMPANY_INFO.name} is an RBI Registered NBFC.
          </p>
        </div>
      </main>
    </div>
  )
}