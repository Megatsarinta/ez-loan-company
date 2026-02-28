'use client'

import React from "react"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, CheckCircle, Phone, Lock, User, Mail, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES } from '@/lib/country-codes'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    countryCode: '+91', // India country code
    phone: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Basic validation
      if (!formData.fullName.trim()) {
        setError('Full name is required')
        setLoading(false)
        return
      }

      if (!formData.phone.trim()) {
        setError('Phone number is required')
        setLoading(false)
        return
      }

      // Indian phone number validation (10 digits)
      if (!/^\d{10}$/.test(formData.phone)) {
        setError('Please enter a valid 10-digit Indian mobile number')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }

      // Format phone number for admin panel (starting with 0)
      // Remove the +91 and add leading 0 for storage
      const phoneWithoutCountry = formData.phone
      const formattedPhoneForStorage = `0${phoneWithoutCountry}` // e.g., 0987654321

      // Also store the full international format for display/communication
      const fullInternationalPhone = `${formData.countryCode}${formData.phone}`

      console.log('Registration with:', {
        displayFormat: fullInternationalPhone, // For user display +91987654321
        storageFormat: formattedPhoneForStorage, // For admin panel 0987654321
        fullName: formData.fullName
      })

      // Call registration API
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          // Store in the format expected by admin panel (starting with 0)
          phoneNumber: formattedPhoneForStorage,
          // Also include international format if needed
          internationalPhone: fullInternationalPhone,
          password: formData.password,
          fullName: formData.fullName
        })
      })

      let result: { error?: string } = {}
      try {
        result = await response.json()
      } catch {
        setError('Invalid response from server. Please try again.')
        setLoading(false)
        return
      }

      if (!response.ok) {
        const message = typeof result?.error === 'string' ? result.error : 'Registration failed'
        console.error('Registration API error:', result?.error ?? result)
        setError(message)
        setLoading(false)
        return
      }

      // Show success message and redirect to login
      setTimeout(() => {
        router.push('/login')
      }, 500)

    } catch (err) {
      console.error('Registration error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] flex flex-col">
      {/* Header with Back Button */}
      <header className="pt-6 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#FF9933] hover:text-[#e68a2e] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              {/* Digital India Logo */}
              <div className="w-16 h-16 relative">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="Digital India"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tight mb-2">
              <span className="text-[#FF9933]">EASY</span>
              <span className="text-[#138808]">LOAN</span>
            </h1>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs bg-orange-50 text-[#FF9933] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                RBI Registered
              </span>
              <span className="text-xs bg-green-50 text-[#138808] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                CIBIL Partner
              </span>
            </div>

            <p className="text-[#6C757D] text-sm mt-4">
              Create your account
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#FF9933]" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#FF9933]" />
                  Mobile Number
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Country Code Select - Fixed to India for NRI focus */}
                  <div className="relative w-full sm:w-1/3">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent appearance-none bg-white text-sm"
                    >
                      {/* Prioritize India at the top */}
                      <option value="+91">🇮🇳 IN +91</option>
                      {COUNTRY_CODES.filter(c => c.code !== '+91').map((countryData) => (
                        <option key={`${countryData.code}-${countryData.country}`} value={countryData.code}>
                          {countryData.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div className="w-full sm:flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#138808]" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#138808]" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-[#FF9933] border-gray-300 rounded focus:ring-[#FF9933]"
                  required
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#FF9933] hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#FF9933] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Encrypted • Your information is secure</span>
              </div>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#FF9933] hover:text-[#138808] font-bold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="text-center pb-4">
        <p className="text-xs text-gray-400">
          {COMPANY_INFO.name} is an RBI Registered NBFC • CIBIL Partner • ISO 27001 Certified
        </p>
      </footer>
    </div>
  )
}