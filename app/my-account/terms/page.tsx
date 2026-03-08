'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Shield, 
  AlertTriangle,
  Scale,
  Gavel,
  UserCheck,
  Clock,
  DollarSign,
  CreditCard,
  Home,
  Wallet,
  UserCircle,
  Globe,
  Heart,
  Users,
  Printer,
  Download,
  IndianRupee,
  Landmark,
  ScrollText
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function TermsOfServicePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string>('agreement-terms')

  // Terms sections - English only for Indian market
  const termsSections = [
    {
      id: 'agreement-terms',
      title: '1. Agreement to Terms',
      content: [
        'These Terms of Service constitute a legally binding agreement between you and EasyLoan Company Pvt Ltd, an RBI Registered NBFC.',
        'By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms under the Indian Contract Act, 1872.',
        'If you do not agree with any part of these terms, you must not use our Services.'
      ]
    },
    {
      id: 'eligibility',
      title: '2. Eligibility Requirements',
      content: [
        'To use EasyLoan services, you must meet the following criteria:',
        '• Be at least 18 years of age',
        '• Be an Indian citizen or Non-Resident Indian (NRI) with valid Indian passport',
        '• Have a valid Aadhaar Card and PAN Card',
        '• Have an active Indian mobile number (for residents) or NRI contact details',
        '• Have a verifiable source of income',
        '• Consent to credit checks with CIBIL and other bureaus',
        '• Not be declared bankrupt or have any ongoing insolvency proceedings'
      ]
    },
    {
      id: 'loan-services',
      title: '3. Loan Services',
      content: [
        'When you apply for a loan through EasyLoan:',
        '• You authorize us to conduct credit checks with CIBIL and other credit bureaus',
        '• You certify that all information provided is accurate and complete',
        '• Loan approval is subject to our internal credit policies and RBI guidelines',
        '• We reserve the right to reject any application without providing a reason',
        '• Approved loans will be disbursed to your NRE/NRO or Indian bank account',
        '• Interest rates are as disclosed at the time of application and follow RBI guidelines',
        '• No processing fee is charged as per our policy'
      ]
    },
    {
      id: 'repayment-terms',
      title: '4. Repayment Terms',
      content: [
        'By accepting a loan, you agree to:',
        '• Make timely EMI payments on or before the due date',
        '• Pay all applicable interest and charges as per the loan agreement',
        '• Maintain sufficient funds in your designated bank account for NACH auto-debit',
        '• Inform us immediately of any financial difficulties affecting repayment',
        '• Late payments will attract penalty interest as per RBI guidelines',
        '• Prepayment is allowed without any penalty after 6 months',
        '• Default may result in reporting to CIBIL and legal action'
      ]
    },
    {
      id: 'user-responsibilities',
      title: '5. User Responsibilities',
      content: [
        'As a user of EasyLoan services, you agree to:',
        '• Use the Services only for lawful purposes as per Indian laws',
        '• Provide accurate, current, and complete information during registration',
        '• Maintain the confidentiality of your account credentials',
        '• Immediately notify us of any unauthorized account access',
        '• Comply with all applicable RBI regulations and Indian laws',
        '• Not use the Services for money laundering or illegal activities',
        '• Keep your contact information updated for communication'
      ]
    },
    {
      id: 'nri-provisions',
      title: '6. NRI Special Provisions',
      content: [
        'For Non-Resident Indians (NRIs), the following additional provisions apply:',
        '• Loan applications can be submitted from anywhere in the world',
        '• Physical presence in India is not required for loan processing',
        '• Income documentation from foreign employers is accepted',
        '• Loans are disbursed to NRE/NRO accounts as per FEMA guidelines',
        '• Repayment can be made through international remittance or NRE/NRO accounts',
        '• Foreign currency loans are not available - all loans are in INR',
        '• NRIs must comply with both Indian and host country laws',
        '• Special consideration for force majeure situations affecting overseas employment'
      ]
    },
    {
      id: 'data-privacy',
      title: '7. Data Privacy and Protection',
      content: [
        'We are committed to protecting your personal information:',
        '• All data is collected and processed in compliance with the Indian IT Act, 2000',
        '• Your information will not be shared without your consent except as required by law',
        '• We implement bank-grade 256-bit SSL encryption for all data transmission',
        '• Credit information may be shared with CIBIL and other bureaus',
        '• You have the right to access and correct your personal data',
        '• Data retention follows RBI guidelines and statutory requirements',
        '• For privacy concerns, contact our Grievance Officer'
      ]
    },
    {
      id: 'dispute-resolution',
      title: '8. Dispute Resolution',
      content: [
        'Any disputes arising from these Terms shall be resolved as follows:',
        '• First, through good faith negotiations between parties',
        '• If unresolved, through mediation as per Indian law',
        '• Subsequent escalation to arbitration in Mumbai as per the Arbitration and Conciliation Act, 1996',
        '• The courts in Mumbai shall have exclusive jurisdiction',
        '• You may also approach the RBI Banking Ombudsman for banking-related disputes',
        '• All disputes shall be governed by the laws of India'
      ]
    }
  ]

  const loanTerms = [
    { months: 6,  rate: 0.005, apr: 6.0, processingFee: 'No processing fee', lateFee: '2% per month on overdue amount' },
    { months: 12, rate: 0.006, apr: 7.2, processingFee: 'No processing fee', lateFee: '2% per month on overdue amount' },
    { months: 24, rate: 0.007, apr: 8.4, processingFee: 'No processing fee', lateFee: '2% per month on overdue amount' },
    { months: 36, rate: 0.008, apr: 9.6, processingFee: 'No processing fee', lateFee: '2% per month on overdue amount' }
  ];

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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] pb-24">
      {/* HEADER - EasyLoan India branding */}
      <header className="bg-[var(--color-bg-surface)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4 print:hidden">
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
                <p className="text-xs text-[var(--color-text-secondary)]">Terms of Service • RBI Regulated</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)] rounded-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm">Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* TERMS HEADER - Indian flag gradient */}
      <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] rounded-2xl mx-4 mt-4 p-6 md:p-8 max-w-6xl md:mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6" />
          <span className="text-sm bg-[var(--color-bg-surface)]/20 px-3 py-1 rounded-full">For NRIs • For India</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[var(--color-bg-surface)]/80">Last Updated: March 2024</span>
              <span className="px-3 py-1 bg-[var(--color-bg-surface)]/20 rounded-full text-sm">Version 5.0</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Effective: March 1, 2024
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-[var(--color-bg-surface)]/20 backdrop-blur-sm rounded-xl text-sm border border-[var(--color-bg-surface)]/30">
              RBI Regd NBFC
            </span>
          </div>
        </div>

        {/* Regulatory Logos */}
        <div className="flex items-center gap-4 mt-6">
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={24} height={24} className="object-contain" />
          </div>
          <div className="w-10 h-10 relative bg-[var(--color-bg-surface)]/10 rounded-lg p-2">
            <Image src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-sm text-[var(--color-bg-surface)]/80 ml-2">RBI Regulated • MCA Registered</span>
        </div>

        {/* Legal Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-[var(--color-bg-surface)]/20">
            <Scale className="w-5 h-5 text-[var(--color-bg-surface)]" />
            <div>
              <div className="font-semibold">Legal Agreement</div>
              <div className="text-sm text-[var(--color-bg-surface)]/80">Indian Contract Act, 1872</div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-[var(--color-bg-surface)]/20">
            <Gavel className="w-5 h-5 text-[var(--color-bg-surface)]" />
            <div>
              <div className="font-semibold">Indian Law</div>
              <div className="text-sm text-[var(--color-bg-surface)]/80">Mumbai Jurisdiction</div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-[var(--color-bg-surface)]/20">
            <UserCheck className="w-5 h-5 text-[var(--color-bg-surface)]" />
            <div>
              <div className="font-semibold">Digital Signature</div>
              <div className="text-sm text-[var(--color-bg-surface)]/80">Valid under IT Act, 2000</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* LOAN TERMS TABLE */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 mb-6 border border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-[var(--color-bg-surface)]" />
            </div>
            Loan Terms & Fees
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)]">
                  <th className="p-4 text-left rounded-tl-xl">Loan Term</th>
                  <th className="p-4 text-left">Monthly Rate</th>
                  <th className="p-4 text-left">Annual (p.a.)</th>
                  <th className="p-4 text-left">Processing Fee</th>
                  <th className="p-4 text-left rounded-tr-xl">Late Payment Fee</th>
                </tr>
              </thead>
              <tbody>
                {loanTerms.map((term, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[var(--color-bg-main)]' : 'bg-[var(--color-bg-surface)]'}>
                    <td className="p-4 border-b border-[var(--color-border)] font-semibold">{term.months} months</td>
                    <td className="p-4 border-b border-[var(--color-border)]">
                      <span className="font-semibold text-[var(--color-secondary-600)]">{(term.rate * 100).toFixed(1)}%</span>
                    </td>
                    <td className="p-4 border-b border-[var(--color-border)]">
                      <span className="font-semibold text-[var(--color-accent-500)]">{term.apr.toFixed(1)}%</span>
                    </td>
                    <td className="p-4 border-b border-[var(--color-border)]">
                      <span className="font-semibold text-[var(--color-primary-900)]">{term.processingFee}</span>
                    </td>
                    <td className="p-4 border-b border-[var(--color-border)]">
                      <span className="font-semibold text-[var(--color-accent-500)]">{term.lateFee}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-4">*As per RBI guidelines, all rates are subject to change with notice</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-[var(--color-bg-surface)] rounded-xl shadow-lg p-6 sticky top-24 border border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Terms Sections</h3>
              <nav className="space-y-2">
                {termsSections.map((section) => (
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

              {/* Regulatory Information */}
              <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                <h4 className="font-bold mb-3 text-sm">Regulatory Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)]" />
                    <span className="text-xs text-[var(--color-text-secondary)]">RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}</span>
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

          {/* Terms Content */}
          <div className="lg:w-3/4">
            <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 md:p-8 border border-[var(--color-border)]">
              {termsSections.map((section, index) => (
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

              {/* NRI Special Provisions */}
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl border border-[var(--color-accent-500)]/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[var(--color-accent-500)]" />
                  NRI Rights & Protections
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Right to transparent loan terms under RBI guidelines</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Right to data privacy under IT Act, 2000</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Right to fair collection practices as per RBI Fair Practices Code</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Access to RBI Banking Ombudsman for grievance redressal</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contact Section */}
              <section className="mt-12 pt-10 border-t border-[var(--color-border)]">
                <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-6 border border-[var(--color-accent-500)]/20">
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--color-accent-500)]" />
                    Legal Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">{COMPANY_INFO.name} Legal Department</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-[var(--color-accent-500)]" />
                          <a 
                            href={`mailto:${COMPANY_INFO.contact.email}`}
                            className="text-[var(--color-accent-500)] hover:underline"
                          >
                            {COMPANY_INFO.contact.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-[var(--color-secondary-600)]" />
                          <a 
                            href={`tel:${COMPANY_INFO.contact.phone.replace(/\D/g, '')}`}
                            className="text-[var(--color-secondary-600)] hover:underline"
                          >
                            {COMPANY_INFO.contact.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Landmark className="w-4 h-4 text-[var(--color-accent-500)] mt-1" />
                          <span className="text-[var(--color-text-secondary)]">{COMPANY_INFO.registeredOffice.fullAddress}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-[var(--color-secondary-600)]" />
                          <span className="text-[var(--color-text-secondary)]">Monday to Friday, 9:00 AM to 6:00 PM IST</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Notice */}
              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> These terms are legally binding under Indian law. By continuing to use our services, you accept these terms as per the Indian Contract Act, 1872.
                    </p>
                  </div>
                </div>
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
                <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">MCA Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-primary-900)]">CIBIL Partner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-accent-500)]">DigiLocker</span>
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