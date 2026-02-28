'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import BankCarousel from '@/components/bank-carousel'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS, LOAN_TENURES } from '@/lib/constants/company-info'
import {
  Globe, Users, Banknote, Rocket, Shield, Zap, Clock,
  Percent, LogIn, UserPlus, ChevronRight, Star, CheckCircle,
  Award, Phone, Mail, Headphones, Heart, Target, TrendingUp,
  CreditCard, Smartphone, Wallet, Briefcase, FileText,
  Calculator, ChevronLeft, IndianRupee
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HomePage() {
  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(100000)
  const [activeAmount, setActiveAmount] = useState(100000)
  const [selectedTerm, setSelectedTerm] = useState(6)

  // Testimonials Carousel State
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)

  // Quick amount options (in lakhs)
  const quickAmounts = [100000, 300000, 500000]

  // Get current rate based on selected term
  const getCurrentRate = () => {
    const term = LOAN_TENURES.find(t => t.months === selectedTerm)
    return term ? term.monthlyRate : 0.008
  }

  // Calculate monthly payment
  const calculateMonthlyPayment = (amount: number, termMonths: number, rate: number) => {
    if (termMonths === 0 || rate === 0) return amount
    const monthlyRate = rate
    const monthly = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
    return Math.round(monthly)
  }

  // Format currency for Indian format (with ₹ symbol)
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN')
  }

  // Format for lakhs/crores display
  const formatIndianNumber = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`
    }
    return `₹${formatCurrency(amount)}`
  }

  // Calculate derived values
  const currentRate = getCurrentRate()
  const monthlyPayment = calculateMonthlyPayment(loanAmount, selectedTerm, currentRate)
  const totalPayment = monthlyPayment * selectedTerm
  const totalInterest = totalPayment - loanAmount

  // Auto-slide testimonials every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-emerald-50/30">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#FF9933]/15 via-white to-[#138808]/15 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Company Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 relative">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="EasyLoan"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

              {/* Brand Name */}
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl lg:text-3xl font-black tracking-tight">
                    <span className="text-[#FF9933]">EASY</span>
                    <span className="text-[#138808]">LOAN</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] lg:text-xs bg-[#FF9933] text-white px-2 py-0.5 rounded-full font-semibold">
                    NRI
                  </span>
                  <span className="text-[10px] lg:text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                    RBI Regd
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="#features" className="text-gray-700 hover:text-[#FF9933] font-medium transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-[#FF9933] font-medium transition-colors">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-[#FF9933] font-medium transition-colors">
                Testimonials
              </Link>
              <Link href="#government" className="text-gray-700 hover:text-[#FF9933] font-medium transition-colors">
                Regulators
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-[#FF9933]">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all">
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Apply Now</span>
                  <span className="sm:hidden">Apply</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-20 lg:mb-24">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200/50">
            <Award className="w-4 h-4 text-[#FF9933]" />
            <span>Trusted by {COMPANY_INFO.stats.customersServed} NRIs Worldwide 🇮🇳</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1e3a5f] mb-4 lg:mb-6">
            Instant Loans for{' '}
            <span className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] bg-clip-text text-transparent">
              NRIs Worldwide
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12 max-w-3xl mx-auto px-4">
            {COMPANY_INFO.tagline.nri} • No collateral • Apply from anywhere • Approved in 24 hours
          </p>

          {/* Key Stats - Using COMPANY_INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 lg:mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-[#FF9933] mb-2">
                {formatIndianNumber(COMPANY_INFO.loanProducts.maxAmount)}
              </div>
              <div className="text-gray-600">Maximum Loan Amount</div>
              <div className="text-sm text-gray-500 mt-2">Flexible terms for your needs</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-[#138808] mb-2 flex items-center justify-center gap-2">
                <Zap className="w-6 h-6" />
                <span>{COMPANY_INFO.stats.averageProcessingTime}</span>
              </div>
              <div className="text-gray-600">Fast Approval</div>
              <div className="text-sm text-gray-500 mt-2">Get approved within a day</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-[#FF9933] mb-2 flex items-center justify-center gap-2">
                <Percent className="w-6 h-6" />
                <span>0.5% - 0.8%</span>
              </div>
              <div className="text-gray-600">Monthly Interest Rate</div>
              <div className="text-sm text-gray-500 mt-2">Fixed rates by tenure</div>
            </div>
          </div>
        </section>

        {/* Loan Calculator Section */}
        <section className="mb-16 md:mb-20">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <Calculator className="w-6 h-6 text-[#FF9933]" />
                <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a5f]">
                  How much do you need?
                </h2>
              </div>
              <p className="text-gray-600 text-base sm:text-lg px-4">
                Use the calculator to know your monthly EMI
              </p>
            </div>

            {/* Calculator Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8 mx-4 sm:mx-6 md:mx-0">

              {/* Loan Amount Display */}
              <div className="text-center mb-6">
                <span className="text-sm text-gray-500 uppercase tracking-wider">Loan Amount</span>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FF9933] mt-1">
                  ₹{formatCurrency(loanAmount)}
                </div>
              </div>

              {/* Amount Slider */}
              <div className="mb-8 px-2">
                <input
                  type="range"
                  min={COMPANY_INFO.loanProducts.minAmount}
                  max={COMPANY_INFO.loanProducts.maxAmount}
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => {
                    setLoanAmount(parseInt(e.target.value))
                    setActiveAmount(parseInt(e.target.value))
                  }}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-pan-y
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:h-8 
                    [&::-webkit-slider-thumb]:w-8 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-[#FF9933]
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:h-8
                    [&::-moz-range-thumb]:w-8
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-[#FF9933]
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-white
                    [&::-moz-range-thumb]:cursor-pointer"
                />

                {/* Min/Max Labels */}
                <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                  <span>{formatIndianNumber(COMPANY_INFO.loanProducts.minAmount)}</span>
                  <span>{formatIndianNumber(COMPANY_INFO.loanProducts.maxAmount)}</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-3 px-1">Quick select:</p>
                <div className="flex gap-3 justify-center">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setLoanAmount(amount)
                        setActiveAmount(amount)
                      }}
                      className={`flex-1 max-w-[120px] py-4 rounded-xl text-base font-semibold transition-all touch-manipulation ${activeAmount === amount
                        ? 'bg-[#FF9933] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                        }`}
                    >
                      {formatIndianNumber(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Term Selection - Using LOAN_TENURES from company-info */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-3 px-1">Loan term:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {LOAN_TENURES.map((term) => (
                    <button
                      key={term.months}
                      onClick={() => setSelectedTerm(term.months)}
                      className={`py-3 sm:py-4 rounded-xl text-center transition-all touch-manipulation ${selectedTerm === term.months
                        ? 'bg-gradient-to-r from-[#FF9933] to-[#138808] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                        }`}
                    >
                      <div className="font-semibold text-sm sm:text-base">{term.label}</div>
                      <div className="text-xs mt-1 opacity-80">{term.monthlyRate * 100}% per month</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-gradient-to-r from-orange-50 to-green-50 p-6 rounded-2xl mb-6">
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-600">Monthly EMI</span>
                  <div className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mt-1">
                    ₹{formatCurrency(monthlyPayment)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <span className="text-gray-500 block">Total Interest</span>
                    <span className="font-semibold text-[#138808]">₹{formatCurrency(totalInterest)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500 block">Total Payment</span>
                    <span className="font-semibold text-[#FF9933]">₹{formatCurrency(totalPayment)}</span>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <Link href="/register" className="block">
                <button className="w-full bg-gradient-to-r from-[#FF9933] to-[#138808] text-white py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 touch-manipulation flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Apply Now
                </button>
              </Link>

              {/* Trust Note */}
              <p className="text-xs text-gray-400 text-center mt-4">
                ✓ {COMPANY_INFO.loanProducts.processingFee} • Zero hidden charges • RBI Regulated
              </p>
            </div>
          </div>
        </section>

        {/* Government Regulators Section */}
        <section id="government" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-[#FF9933]" />
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a5f]">
                Regulated By
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {COMPANY_INFO.classification} registered with Government of India authorities
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
              {/* RBI */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.rbi}
                    alt="RBI"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">RBI</span>
                <span className="text-[10px] text-gray-500 text-center">Reserve Bank of India</span>
              </div>

              {/* MCA */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.mca}
                    alt="MCA"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">MCA</span>
                <span className="text-[10px] text-gray-500 text-center">Ministry of Corporate Affairs</span>
              </div>

              {/* MeitY */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.meity}
                    alt="MeitY"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">MeitY</span>
                <span className="text-[10px] text-gray-500 text-center">Ministry of Electronics & IT</span>
              </div>

              {/* CIBIL */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.cibil}
                    alt="CIBIL"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">CIBIL</span>
                <span className="text-[10px] text-gray-500 text-center">Credit Bureau</span>
              </div>

              {/* DigiLocker */}
              <div className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 relative">
                  <Image
                    src={GOVERNMENT_LOGOS.digilocker}
                    alt="DigiLocker"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">DigiLocker</span>
                <span className="text-[10px] text-gray-500 text-center">Digital Document Wallet</span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#138808]" />
                <span className="text-sm text-gray-700 font-medium">
                  {COMPANY_INFO.classification} • RBI Reg No: {COMPANY_INFO.rbiRegistrationNo} • CIBIL Partner
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* NRI Features Section */}
        <section id="features" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-[#FF9933]" />
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a5f]">
                Why NRIs Trust Us
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {COMPANY_INFO.tagline.mission}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nriFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-4">
              3 Simple Steps to Get Your Loan
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From application to payout, we've made it easy for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#FF9933] to-[#138808] -translate-y-1/2"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF9933] to-[#138808] flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <div className="mt-4 text-[#FF9933]">
                    {step.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Carousel */}
        <section id="testimonials" className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-4">
              Stories from Our NRI Community
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join {COMPANY_INFO.stats.nriCustomers} NRIs who trusted us
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative max-w-md mx-auto">
            {/* Testimonial Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 min-h-[280px] flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-100 to-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-[#FF9933]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1e3a5f] text-lg">{testimonials[currentTestimonialIndex].name}</h4>
                  <p className="text-sm text-gray-500">{testimonials[currentTestimonialIndex].profession}</p>
                  <p className="text-xs text-[#FF9933]">{testimonials[currentTestimonialIndex].country}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <div className="flex-1">
                <p className="text-gray-600 italic mb-4 text-base leading-relaxed">
                  "{testimonials[currentTestimonialIndex].quote}"
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-[#FF9933]">{testimonials[currentTestimonialIndex].loanAmount}</span>
                <div className="flex gap-1">
                  {testimonials.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentTestimonialIndex ? 'bg-[#FF9933] w-4' : 'bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hidden sm:block hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#FF9933]" />
            </button>
            <button
              onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hidden sm:block hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#FF9933]" />
            </button>
          </div>
        </section>

        {/* Bank Partners */}
        <section className="mb-16 md:mb-20 lg:mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-[#1e3a5f] mb-4">
              Partner Banks & Payment Platforms
            </h3>
            <p className="text-gray-600 text-lg">Direct integration with your preferred financial institutions</p>
          </div>

          <BankCarousel />
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-3xl p-8 md:p-12 text-center text-white mb-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Apply for a Loan?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join {COMPANY_INFO.stats.customersServed} customers who have secured their loans with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="sm:flex-1 max-w-sm">
                <Button className="w-full bg-white text-[#FF9933] hover:bg-gray-100 text-lg py-6 rounded-2xl shadow-lg">
                  <Wallet className="w-5 h-5 mr-2" />
                  Apply Now
                </Button>
              </Link>
              <Link href="/login" className="sm:flex-1 max-w-sm">
                <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white/10 text-lg py-6 rounded-2xl bg-transparent">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Already have an account? Login
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>24/7 Customer Support</span>
              </div>
              <div className="w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>100% Secure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1e3a5f]/20 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-4">
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
                  <span className="text-lg font-black tracking-tight">
                    <span className="text-[#FF9933]">EASY</span>
                    <span className="text-[#138808]">LOAN</span>
                  </span>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-[#138808]" />
                    {COMPANY_INFO.classification}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {COMPANY_INFO.tagline.mission}
              </p>

              {/* Trust Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-[10px] bg-orange-50 text-[#FF9933] px-2 py-1 rounded-full font-medium">
                  RBI Registered
                </span>
                <span className="text-[10px] bg-green-50 text-[#138808] px-2 py-1 rounded-full font-medium">
                  CIBIL Partner
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                  ISO 27001
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-[#1e3a5f] mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-gray-600 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-[#FF9933] transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#FF9933] rounded-full"></span>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* NRI Resources */}
            <div>
              <h4 className="font-bold text-[#1e3a5f] mb-4 text-sm uppercase tracking-wider">NRI Resources</h4>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#138808] rounded-full"></span>
                  NRE/NRO Account Guide
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#138808] rounded-full"></span>
                  FEMA Guidelines
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#138808] rounded-full"></span>
                  Repatriation Rules
                </li>
                <li className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#138808] rounded-full"></span>
                  DTAA Benefits
                </li>
              </ul>

              {/* Government Partner Mini Badges */}
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 relative opacity-70">
                  <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
                </div>
                <div className="w-6 h-6 relative opacity-70">
                  <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={24} height={24} className="object-contain" />
                </div>
                <div className="w-6 h-6 relative opacity-70">
                  <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={24} height={24} className="object-contain" />
                </div>
                <span className="text-[10px] text-gray-400">Regulatory Partners</span>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-[#1e3a5f] mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#FF9933]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">24/7 Helpline</span>
                    <p className="text-xs text-gray-500">{COMPANY_INFO.contact.tollFree}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#138808]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Email Support</span>
                    <p className="text-xs text-gray-500">{COMPANY_INFO.contact.email}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-[#FF9933]" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Live Chat</span>
                    <p className="text-xs text-gray-500">24/7 Available</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

// NRI Features
const nriFeatures = [
  {
    icon: <Target className="w-6 h-6 text-[#FF9933]" />,
    title: "For NRIs Worldwide",
    description: "Specially designed for Non-Resident Indians living abroad"
  },
  {
    icon: <Globe className="w-6 h-6 text-[#FF9933]" />,
    title: "Global Coverage",
    description: "Apply from anywhere in the world, receive funds in India"
  },
  {
    icon: <Rocket className="w-6 h-6 text-[#138808]" />,
    title: "24-Hour Approval",
    description: "Fast track processing for urgent financial needs"
  },
  {
    icon: <CreditCard className="w-6 h-6 text-[#FF9933]" />,
    title: "Direct to NRE/NRO Account",
    description: "Receive money directly to your NRE or NRO bank account"
  }
]

// Steps
const steps = [
  {
    title: "Apply Online",
    description: "Complete our simple 5-minute application form",
    icon: <Smartphone className="w-8 h-8" />
  },
  {
    title: "Get Approved",
    description: "Receive approval within 24 hours",
    icon: <Shield className="w-8 h-8" />
  },
  {
    title: "Receive Funds",
    description: "Money sent directly to your NRE/NRO account",
    icon: <Wallet className="w-8 h-8" />
  }
]

// Testimonials - 10 items
const testimonials = [
  {
    name: "Priya Sharma",
    profession: "Software Engineer",
    country: "USA",
    quote: "In just 12 hours, my loan was approved. Great help for my family's emergency needs back home.",
    loanAmount: "₹2,50,000"
  },
  {
    name: "Rajesh Kumar",
    profession: "Doctor",
    country: "UK",
    quote: "No collateral required, process was so simple. Interest rates are very competitive for NRIs.",
    loanAmount: "₹5,00,000"
  },
  {
    name: "Anjali Desai",
    profession: "Teacher",
    country: "Canada",
    quote: "24/7 customer support, someone always available to help. Very professional service.",
    loanAmount: "₹1,50,000"
  },
  {
    name: "Vikram Singh",
    profession: "Engineer",
    country: "UAE",
    quote: "Applied while at work, got money in my NRE account next day. Great for my parents' medical needs.",
    loanAmount: "₹7,50,000"
  },
  {
    name: "Meera Patel",
    profession: "Accountant",
    country: "Singapore",
    quote: "First time taking an online loan but it was so easy and safe. Thank you EasyLoan!",
    loanAmount: "₹1,00,000"
  },
  {
    name: "Suresh Nair",
    profession: "Banker",
    country: "Australia",
    quote: "Money reached my NRO account within 24 hours. Extremely helpful for emergency.",
    loanAmount: "₹3,00,000"
  },
  {
    name: "Deepa Krishnan",
    profession: "Nurse",
    country: "Germany",
    quote: "Good interest rates and no hidden charges. Highly recommended for NRIs.",
    loanAmount: "₹4,50,000"
  },
  {
    name: "Arun Mehta",
    profession: "IT Manager",
    country: "USA",
    quote: "Smooth application process and quick customer support response.",
    loanAmount: "₹12,00,000"
  },
  {
    name: "Lakshmi Iyer",
    profession: "Professor",
    country: "New Zealand",
    quote: "Used the loan for my daughter's wedding. Thank you EasyLoan!",
    loanAmount: "₹8,00,000"
  },
  {
    name: "Manoj Gupta",
    profession: "Business Analyst",
    country: "UAE",
    quote: "Simple requirements and no collateral needed. Perfect for NRIs like us.",
    loanAmount: "₹2,00,000"
  }
]