'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft,
  CheckCircle,
  Shield,
  FileText,
  Scale,
  Gavel,
  UserCheck,
  DollarSign,
  AlertTriangle,
  Globe,
  Heart,
  Users,
  Clock,
  HandCoins
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function LandingTermsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('agreement')

  const termsSections = [
    {
      id: 'agreement',
      title: 'Agreement to Terms',
      content: 'By accessing our website or services, you agree to be bound by these Terms of Service.'
    },
    {
      id: 'eligibility',
      title: 'Eligibility',
      content: 'You must be at least 18 years old and an Indian citizen or NRI to use our services.'
    },
    {
      id: 'services',
      title: 'Our Services',
      content: 'We provide online lending services to qualified Indian citizens and NRIs worldwide.'
    },
    {
      id: 'responsibilities',
      title: 'User Responsibilities',
      content: 'You are responsible for providing accurate information and maintaining account security.'
    },
    {
      id: 'prohibited',
      title: 'Prohibited Activities',
      content: 'You may not use our services for illegal activities or provide false information.'
    }
  ]

  const loanTerms = [
    { term: '6 months', rate: '0.5% per month' },
    { term: '12 months', rate: '0.6% per month' },
    { term: '24 months', rate: '0.7% per month' },
    { term: '36 months', rate: '0.8% per month' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)]">
      {/* Header - Updated with Digital India logo */}
      <header className="bg-[var(--color-bg-surface)] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              {/* Digital India Logo */}
              <div className="w-10 h-10 relative">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="Digital India"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-text-primary)] flex items-baseline gap-1">
                  <span className="text-[var(--color-accent-500)]">EASY</span>
                  <span className="text-[var(--color-secondary-600)]">LOAN</span>
                </h1>
                <p className="text-sm text-[var(--color-text-secondary)]">Terms of Service</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--color-secondary-100)] px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                <span className="font-semibold text-sm">RBI Registered</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section - Updated with NRI focus */}
        <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6" />
            <span className="text-sm bg-[var(--color-bg-surface)]/20 px-3 py-1 rounded-full">For NRIs • For India</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-[var(--color-bg-surface)]/90 mb-6">
            Welcome to EasyLoan. These terms govern your use of our website and services as an RBI Registered NBFC.
          </p>
          
          {/* Government Logos - Indian Regulators */}
          <div className="flex items-center gap-4 mt-4">
            <div className="w-8 h-8 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-1">
              <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-1">
              <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={24} height={24} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-1">
              <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-sm text-[var(--color-bg-surface)]/80 ml-2">Government Regulated NBFC</span>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--color-bg-surface)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-[var(--color-accent-500)]" />
              <h3 className="font-bold text-lg">Legal Agreement</h3>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm">Binding contract between you and EasyLoan under Indian law</p>
          </div>
          
          <div className="bg-[var(--color-bg-surface)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="w-6 h-6 text-[var(--color-secondary-600)]" />
              <h3 className="font-bold text-lg">Indian Law</h3>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm">Governed by laws of India and RBI regulations</p>
          </div>
          
          <div className="bg-[var(--color-bg-surface)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-[var(--color-primary-900)]" />
              <h3 className="font-bold text-lg">Electronic Acceptance</h3>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm">Use of services equals acceptance under IT Act 2000</p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation */}
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <h3 className="font-bold text-lg mb-4">Sections</h3>
                <nav className="space-y-2">
                  {termsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
                        setActiveSection(section.id)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)]'
                          : 'bg-[var(--color-bg-main)] hover:bg-[var(--color-bg-main)]'
                      }`}
                    >
                      <div className="font-medium">{section.title}</div>
                    </button>
                  ))}
                </nav>
                
                {/* Regulatory Information */}
                <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                  <h4 className="font-bold text-sm mb-3">Regulatory Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      <span className="text-xs text-[var(--color-text-secondary)]">RBI Registration No. {COMPANY_INFO.rbiRegistrationNo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      <span className="text-xs text-[var(--color-text-secondary)]">CIN: {COMPANY_INFO.cin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      <span className="text-xs text-[var(--color-text-secondary)]">{COMPANY_INFO.classification}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-2/3">
              {termsSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="mb-8 last:mb-0 pb-8 border-b border-[var(--color-border)] last:border-0"
                >
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                    {section.title}
                  </h2>
                  <p className="text-[var(--color-text-secondary)]">{section.content}</p>
                </section>
              ))}
              
              {/* NRI Special Provisions */}
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[var(--color-accent-500)]" />
                  Special Provisions for NRIs
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">NRIs can apply from anywhere in the world</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">No need to be physically present in India</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Funds disbursed to NRE/NRO accounts</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Loan Terms Table */}
              <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[var(--color-accent-500)]" />
                  Loan Terms & Interest Rates
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)]">
                        <th className="p-4 text-left">Loan Term</th>
                        <th className="p-4 text-left">Monthly Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanTerms.map((term, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-[var(--color-bg-main)]' : 'bg-[var(--color-bg-surface)]'}>
                          <td className="p-4 font-semibold">{term.term}</td>
                          <td className="p-4 text-[var(--color-secondary-600)] font-semibold">{term.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                  *Rates are subject to change based on credit assessment as per RBI guidelines
                </p>
              </div>

              {/* Important Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> These terms are a summary. Full terms are available after account registration.
                      By continuing to use our services, you accept these terms under the Indian Contract Act, 1872.
                    </p>
                  </div>
                </div>
              </div>

              {/* NRI Rights */}
              <div className="mt-8 bg-[var(--color-accent-100)] rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-accent-500)]" />
                  Your Rights as an NRI
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <span>Right to transparent loan terms under RBI guidelines</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <span>Right to data privacy under Indian IT Act 2000</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <span>Right to fair collection practices as per RBI Fair Practices Code</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-[var(--color-bg-surface)] border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <Link
            href="/privacy"
            className="flex-1 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <Shield className="w-5 h-5" />
            View Privacy Policy
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-[var(--color-text-secondary)]">
            {COMPANY_INFO.name} | CIN: {COMPANY_INFO.cin} | RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}
            <br />
            {COMPANY_INFO.classification} • All rights reserved. For NRIs, For India.
          </p>
        </div>
      </main>
    </div>
  )
}