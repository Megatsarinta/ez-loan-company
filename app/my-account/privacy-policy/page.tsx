'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  Lock, 
  FileText, 
  Users,
  Eye,
  Database,
  Key,
  AlertCircle,
  Home,
  Wallet,
  UserCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  Globe,
  IndianRupee,
  Scale
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function PrivacyPolicyPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string>('introduction')

  // Privacy Policy sections - English only for Indian market
  const policySections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: [
        'Welcome to EasyLoan Company Pvt Ltd. We are committed to protecting your personal information and your right to privacy in compliance with the Indian IT Act, 2000 and RBI guidelines.',
        'By using EasyLoan services, you consent to the collection and use of your personal information as described in this Privacy Policy.',
        'This policy explains how we collect, use, disclose, and safeguard your information when you use our platform.'
      ]
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      content: [
        'We collect personal information that you voluntarily provide to us when you register for an account, apply for a loan, or use our services:',
        '• Identity Information: Full name, date of birth, gender, photograph',
        '• Contact Details: Phone number, email address, current address',
        '• Government IDs: Aadhaar number, PAN card, passport (for NRIs)',
        '• Financial Information: Income details, bank account information, NRE/NRO account details, IFSC code',
        '• Employment Information: Occupation, employer details, salary slips',
        '• Transaction Data: Loan amounts, repayment history, credit score (CIBIL)',
        '• Technical Data: IP address, device information, browser type, location data'
      ]
    },
    {
      id: 'information-use',
      title: '3. How We Use Your Information',
      content: [
        'We use your information for the following purposes:',
        '• Loan Processing: To evaluate loan applications, determine eligibility, and disburse funds',
        '• Credit Assessment: To check your CIBIL score and creditworthiness',
        '• Account Management: To create and manage your user account',
        '• Verification: To verify your identity using Aadhaar/PAN and prevent fraud',
        '• Communication: To send updates about your loan status, EMI reminders, and offers',
        '• Regulatory Compliance: To comply with RBI guidelines and Indian laws',
        '• Service Improvement: To analyze usage patterns and enhance our platform',
        '• Security: To protect against unauthorized access and potential threats'
      ]
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      content: [
        'We implement bank-grade security measures to protect your data:',
        '• 256-bit SSL encryption for all data transmission',
        '• Two-factor authentication (2FA) for account access',
        '• Regular security audits and vulnerability assessments',
        '• ISO 27001 certified security protocols',
        '• Secure servers with restricted access',
        '• Data encryption at rest and in transit',
        '• Regular backups and disaster recovery procedures',
        '• All data is stored in secure data centers located in India'
      ]
    },
    {
      id: 'data-sharing',
      title: '5. Information Sharing and Disclosure',
      content: [
        'We may share your information with:',
        '• Credit Bureaus: CIBIL and other credit information companies for credit assessment',
        '• Banking Partners: For loan disbursement and repayment processing',
        '• Regulatory Authorities: RBI, MCA, and other government bodies as required by law',
        '• Service Providers: For identity verification, payment processing, and customer support',
        '• We DO NOT sell your personal information to third parties',
        '• We DO NOT share your data for marketing purposes without your consent',
        '• All data sharing is done in compliance with Indian data protection laws'
      ]
    },
    {
      id: 'privacy-rights',
      title: '6. Your Privacy Rights',
      content: [
        'Under the Indian IT Act, 2000 and RBI guidelines, you have the following rights:',
        '• Right to Access: Request copies of your personal data',
        '• Right to Rectification: Correct inaccurate or incomplete information',
        '• Right to Erasure: Request deletion of your data subject to legal retention requirements',
        '• Right to Restrict Processing: Object to certain data processing activities',
        '• Right to Data Portability: Receive your data in a structured format',
        '• Right to Withdraw Consent: Revoke consent for data processing at any time',
        '• To exercise these rights, contact our Grievance Officer',
        '• We will respond to your request within 30 days as per RBI guidelines'
      ]
    },
    {
      id: 'data-retention',
      title: '7. Data Retention',
      content: [
        'We retain your personal information for as long as necessary to:',
        '• Provide you with our services and maintain your account',
        '• Comply with legal and regulatory requirements (RBI mandates 8-10 years)',
        '• Resolve disputes and enforce our agreements',
        '• After account closure, we may retain certain data for legal and audit purposes',
        '• Anonymized data may be retained for analytical purposes indefinitely'
      ]
    },
    {
      id: 'cookies-tracking',
      title: '8. Cookies and Tracking Technologies',
      content: [
        'We use cookies and similar technologies to:',
        '• Remember your login session and preferences',
        '• Analyze website traffic and usage patterns',
        '• Improve user experience and platform performance',
        '• You can control cookie settings through your browser',
        '• Disabling cookies may affect certain functionality',
        '• We do not use cookies for targeted advertising'
      ]
    },
    {
      id: 'grievance-redressal',
      title: '9. Grievance Redressal',
      content: [
        'As per RBI guidelines, we have appointed a Grievance Redressal Officer:',
        '• For any privacy-related concerns or complaints',
        '• To address data access, correction, or deletion requests',
        '• To handle disputes regarding data processing',
        '• Complaints will be acknowledged within 24 hours',
        '• Resolution will be provided within 30 days as per RBI norms',
        '• If unsatisfied, you may escalate to the RBI Banking Ombudsman'
      ]
    }
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] pb-24">
      {/* HEADER - EasyLoan India branding */}
      <header className="bg-[var(--color-bg-surface)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] hover:bg-[var(--color-accent-100)] p-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="EasyLoan India"
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
                <p className="text-xs text-[var(--color-text-secondary)]">Privacy Policy • IT Act 2000 Compliant</p>
              </div>
            </div>
          </div>
          
          {/* Government Badges - Updated for India */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--color-accent-100)] px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.rbi}
                alt="RBI Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[var(--color-accent-500)]">RBI Regd</span>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-secondary-100)] px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.meity}
                alt="MeitY Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[var(--color-secondary-600)]">MeitY Certified</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.digilocker}
                alt="DigiLocker"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[var(--color-primary-900)]">DigiLocker</span>
            </div>
          </div>
        </div>
      </header>

      {/* POLICY HEADER - Indian flag gradient */}
      <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] rounded-2xl mx-4 mt-4 p-6 md:p-8 max-w-6xl md:mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6" />
          <span className="text-sm bg-[var(--color-bg-surface)]/20 px-3 py-1 rounded-full">For NRIs • For India</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <div className="flex items-center gap-4">
              <span className="text-[var(--color-bg-surface)]/80">Last Updated: March 2024</span>
              <span className="px-3 py-1 bg-[var(--color-bg-surface)]/20 rounded-full text-sm">Version 4.0</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-[var(--color-bg-surface)]/20 backdrop-blur-sm rounded-xl text-sm border border-[var(--color-bg-surface)]/30">
              IT Act 2000 Compliant
            </span>
          </div>
        </div>

        {/* Regulatory Logos */}
        <div className="flex items-center gap-4 mt-6">
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-sm text-[var(--color-bg-surface)]/80 ml-2">Data Privacy Compliant</span>
        </div>

        {/* Compliance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-[var(--color-bg-surface)]/20">
            <Shield className="w-5 h-5 text-[var(--color-bg-surface)]" />
            <div>
              <div className="font-semibold">IT Act 2000</div>
              <div className="text-sm text-[var(--color-bg-surface)]/80">Data Protection Standards</div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-[var(--color-bg-surface)]/20">
            <Lock className="w-5 h-5 text-[var(--color-bg-surface)]" />
            <div>
              <div className="font-semibold">RBI Guidelines</div>
              <div className="text-sm text-[var(--color-bg-surface)]/80">Consumer Protection</div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-[var(--color-bg-surface)]/20">
            <CheckCircle className="w-5 h-5 text-[var(--color-bg-surface)]" />
            <div>
              <div className="font-semibold">ISO 27001</div>
              <div className="text-sm text-[var(--color-bg-surface)]/80">Certified</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-[var(--color-bg-surface)] rounded-xl shadow-lg p-6 sticky top-24 border border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Policy Sections</h3>
              <nav className="space-y-2">
                {policySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-100)] hover:text-[var(--color-accent-500)]'
                    }`}
                  >
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Compliance Badges */}
              <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                <h4 className="font-bold mb-3 text-sm">Regulatory Compliance</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                    <span className="text-xs">Indian IT Act, 2000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                    <span className="text-xs">RBI Guidelines on Data Privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                    <span className="text-xs">ISO 27001 Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                    <span className="text-xs">DigiLocker Partner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Content */}
          <div className="lg:w-3/4">
            <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 md:p-8 border border-[var(--color-border)]">
              {policySections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={`mb-10 ${index !== 0 ? 'pt-10 border-t border-[var(--color-border)]' : ''}`}
                >
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 pb-2 border-b-2 border-[var(--color-accent-500)]">
                    {section.title}
                  </h2>

                  {section.content.map((paragraph, pIndex) => {
                    if (paragraph.startsWith('•')) {
                      return (
                        <div key={pIndex} className="flex items-start gap-2 mb-2 ml-4">
                          <div className="w-1.5 h-1.5 bg-[var(--color-secondary-600)] rounded-full mt-2"></div>
                          <p className="text-[var(--color-text-secondary)]">{paragraph.substring(1).trim()}</p>
                        </div>
                      )
                    }
                    return (
                      <p key={pIndex} className="mb-4 text-[var(--color-text-secondary)] leading-relaxed">
                        {paragraph}
                      </p>
                    )
                  })}
                </section>
              ))}

              {/* NRI Data Protection Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl border border-[var(--color-accent-500)]/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[var(--color-accent-500)]" />
                  NRI Data Protection
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Your data is protected even when applying from overseas under the IT Act, 2000</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">International data transfer safeguards compliant with Indian laws</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">NRI-specific privacy rights under RBI guidelines</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Data stored in secure Indian data centers as per RBI data localization norms</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Section */}
              <section className="mt-12 pt-10 border-t border-[var(--color-border)]">
                <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-6 border border-[var(--color-accent-500)]/20">
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--color-accent-500)]" />
                    Contact Our Grievance Officer
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">Grievance Redressal Officer</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-[var(--color-accent-500)]" />
                          <a 
                            href={`mailto:${COMPANY_INFO.keyPersonnel.grievanceOfficer.email}`}
                            className="text-[var(--color-accent-500)] hover:underline"
                          >
                            {COMPANY_INFO.keyPersonnel.grievanceOfficer.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-[var(--color-secondary-600)]" />
                          <a 
                            href={`tel:${COMPANY_INFO.keyPersonnel.grievanceOfficer.phone.replace(/\D/g, '')}`}
                            className="text-[var(--color-secondary-600)] hover:underline"
                          >
                            {COMPANY_INFO.keyPersonnel.grievanceOfficer.phone}
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-2">For data privacy concerns and complaints</p>
                    </div>
                    
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-[var(--color-accent-500)] mt-1" />
                          <span className="text-[var(--color-text-secondary)]">Response within 48 hours as per RBI guidelines</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="w-4 h-4 text-[var(--color-secondary-600)] mt-1" />
                          <span className="text-[var(--color-text-secondary)]">NRI priority support available</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Scale className="w-4 h-4 text-[var(--color-primary-900)] mt-1" />
                          <span className="text-[var(--color-text-secondary)]">Escalate to RBI Banking Ombudsman if unsatisfied</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Your Privacy Rights under Indian Law:</strong> You have rights under the Indian IT Act, 2000 including access, correction, and deletion of your personal data. To exercise these rights, contact our Grievance Officer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Localization Note */}
              <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Data Localization:</strong> In compliance with RBI guidelines, all personal and financial data is stored exclusively on servers located in India.
                </p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="w-full mt-6 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to About Us
            </button>
          </div>
        </div>
      </div>

      {/* Government Trust Badges */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-4 border border-[var(--color-accent-500)]/20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">MeitY Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-primary-900)]">DigiLocker</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-accent-500)]">CIBIL Partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4">
        <p className="text-xs text-[var(--color-text-secondary)]">
          {COMPANY_INFO.name} | CIN: {COMPANY_INFO.cin} | RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}
          <br />
          Registered Office: {COMPANY_INFO.registeredOffice.fullAddress}
        </p>
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 py-4 border-t border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)]"
          >
            <Home className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>

          <Link
            href="/wallet"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)]"
          >
            <Wallet className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>

          <Link
            href="/my-account"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[var(--color-accent-500)] bg-[var(--color-accent-100)]"
          >
            <UserCircle className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}