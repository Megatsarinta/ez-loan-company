'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle,
  Eye,
  Database,
  Key,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  Users,
  Globe
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function LandingPrivacyPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('introduction')

  const policySections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: 'We protect your personal information and respect your right to privacy.'
    },
    {
      id: 'information',
      title: 'Information We Collect',
      content: 'We collect information you provide when registering, applying for loans, or using our services.'
    },
    {
      id: 'usage',
      title: 'How We Use Information',
      content: 'We use your information to provide services, verify identity, prevent fraud, and comply with Indian laws and RBI regulations.'
    },
    {
      id: 'security',
      title: 'Data Security',
      content: 'We implement bank-grade security measures to protect your data in compliance with Indian IT Act 2000.'
    },
    {
      id: 'rights',
      title: 'Your Rights',
      content: 'You have rights to access, correct, and delete your personal information under Indian data protection laws.'
    }
  ]

  const securityFeatures = [
    { icon: Lock, title: '256-bit SSL Encryption', desc: 'Bank-grade data protection' },
    { icon: Shield, title: 'Two-Factor Auth', desc: 'Extra account security' },
    { icon: Database, title: 'Secure Servers', desc: 'RBI-compliant infrastructure' },
    { icon: Key, title: 'Access Control', desc: 'Strict permission management' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)]">
      {/* Header */}
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
                <p className="text-sm text-[var(--color-text-secondary)]">Privacy Policy</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--color-secondary-100)] px-3 py-1.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                <span className="font-semibold text-sm">RBI Regulated</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6" />
            <span className="text-sm bg-[var(--color-bg-surface)]/20 px-3 py-1 rounded-full">For NRIs • For India</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-[var(--color-bg-surface)]/90 mb-6">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information in compliance with Indian laws and RBI guidelines.
          </p>
          
          {/* Government Logos - Indian Regulators */}
          <div className="flex items-center gap-4 mt-4">
            <div className="w-8 h-8 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-1">
              <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-1">
              <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={24} height={24} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-1">
              <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={24} height={24} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-1">
              <Image src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-sm text-[var(--color-bg-surface)]/80 ml-2">IT Act 2000 Compliant</span>
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-[var(--color-bg-surface)] rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--color-accent-100)] rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-[var(--color-accent-500)]" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-[var(--color-text-secondary)] text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Policy Content */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation */}
            <div className="md:w-1/3">
              <div className="sticky top-24">
                <h3 className="font-bold text-lg mb-4">Policy Sections</h3>
                <nav className="space-y-2">
                  {policySections.map((section) => (
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

                {/* Compliance Badges */}
                <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                  <h4 className="font-bold mb-3">Compliance • Regulatory</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      <span className="text-sm">Indian IT Act 2000</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      <span className="text-sm">RBI Guidelines on Data Privacy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                      <span className="text-sm">ISO 27001 Certified</span>
                    </div>
                  </div>

                  {/* Government Partner Mini Logos */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-8 h-8 relative opacity-70">
                      <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={32} height={32} className="object-contain" />
                    </div>
                    <span className="text-xs text-[var(--color-text-secondary)]">MeitY Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-2/3">
              {policySections.map((section) => (
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

              {/* NRI Data Protection Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[var(--color-accent-500)]" />
                  NRI Data Protection
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Your data is protected even when applying from overseas</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">International data transfer safeguards in place</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">NRI-specific privacy rights under Indian law</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Contact Our Grievance Officer
                </h3>
                
                <div className="bg-[var(--color-accent-100)] rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-4">Grievance Officer</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-[var(--color-accent-500)]" />
                          <span className="text-[var(--color-text-primary)]">{COMPANY_INFO.keyPersonnel.grievanceOfficer.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-[var(--color-accent-500)]" />
                          <span className="text-[var(--color-text-primary)]">{COMPANY_INFO.keyPersonnel.grievanceOfficer.phone}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-2">For data privacy concerns</p>
                    </div>
                    
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-[var(--color-accent-500)] mt-1" />
                          <span className="text-[var(--color-text-primary)]">Response within 48 hours as per RBI guidelines</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-[var(--color-accent-500)] mt-1" />
                          <span className="text-[var(--color-text-primary)]">NRI priority support available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Your Rights under Indian IT Act 2000:</strong> You have rights to access, correct, and request deletion of your personal data in compliance with Indian data protection laws.
                    </p>
                  </div>
                </div>
              </div>

              {/* Regulatory Registration Note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {COMPANY_INFO.name} is an RBI Registered NBFC (Reg No: {COMPANY_INFO.rbiRegistrationNo}) and compliant with all applicable Indian laws.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Updated with Indian flag colors */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-[var(--color-bg-surface)] border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <Link
            href="/terms"
            className="flex-1 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
          >
            <Shield className="w-5 h-5" />
            View Terms of Service
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-[var(--color-text-secondary)]">
            {COMPANY_INFO.name} | CIN: {COMPANY_INFO.cin} | RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}
            <br />
            All rights reserved. For NRIs, For India.
          </p>
        </div>
      </main>
    </div>
  )
}