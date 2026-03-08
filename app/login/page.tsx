'use client'

import React from "react"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, CheckCircle, Phone, Lock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { COUNTRY_CODES } from '@/lib/country-codes'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    countryCode: '+91',
    phone: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
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

      if (!formData.password) {
        setError('Password is required')
        setLoading(false)
        return
      }

      // Format phone number for admin panel format (starting with 0)
      // User enters: 9876543210
      // For storage/query: 09876543210 (with leading zero)
      const phoneForQuery = `0${formData.phone}`

      // Also keep international format for display
      const fullInternationalPhone = `${formData.countryCode}${formData.phone}`

      console.log('Login attempt:', {
        userInput: formData.phone,
        queryFormat: phoneForQuery, // Format for database query (starting with 0)
        internationalFormat: fullInternationalPhone // For reference
      })

      // Call login API - send the phone in the format stored in database (starting with 0)
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          phoneNumber: phoneForQuery, // Send as 0XXXXXXXXX format for DB query
          internationalPhone: fullInternationalPhone, // Optional, for reference
          password: formData.password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Login failed. Please check your phone number and password.')
        setLoading(false)
        return
      }

      // Redirect to home on successful login
      setTimeout(() => {
        router.push('/home')
      }, 500)

    } catch (err) {
      console.error('Login error:', err)
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
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] flex flex-col">
      {/* Header with Back Button */}
      <header className="pt-6 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Branding - Updated to EasyLoan */}
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
              <span className="text-[var(--color-accent-500)]">EASY</span>
              <span className="text-[var(--color-secondary-600)]">LOAN</span>
            </h1>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs bg-[var(--color-accent-100)] text-[var(--color-accent-500)] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                RBI Registered
              </span>
              <span className="text-xs bg-[var(--color-secondary-100)] text-[var(--color-secondary-600)] px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                CIBIL Partner
              </span>
            </div>

            <p className="text-[var(--color-text-secondary)] text-sm mt-4">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 border border-[var(--color-border)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-[var(--color-primary-100)] border border-[var(--color-border)] rounded-xl">
                  <p className="text-sm text-[var(--color-primary-900)]">{error}</p>
                </div>
              )}

              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--color-accent-500)]" />
                  Mobile Number
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Country Code Select */}
                  <div className="relative w-full sm:w-1/3">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent appearance-none bg-[var(--color-bg-surface)] text-sm"
                    >
                      {/* Prioritize India at the top */}
                      <option value="+91">🇮🇳 IN +91</option>
                      {COUNTRY_CODES.filter(c => c.code !== '+91').map((countryData) => (
                        <option key={`${countryData.code}-${countryData.country}`} value={countryData.code}>
                          {countryData.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text-primary)]">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--color-secondary-600)]" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--color-accent-500)] hover:text-[var(--color-secondary-600)] font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-secondary)] mt-4">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Encrypted • Your information is secure</span>
              </div>
            </form>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6 bg-[var(--color-bg-surface)]/50 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-secondary)]">
              New to EasyLoan?{' '}
              <Link
                href="/register"
                className="text-[var(--color-accent-500)] hover:text-[var(--color-secondary-600)] font-bold transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="text-center pb-4">
        <p className="text-xs text-[var(--color-text-secondary)]">
          {COMPANY_INFO.name} is an RBI Registered NBFC • CIBIL Partner • ISO 27001 Certified
        </p>
      </footer>
    </div>
  )
}