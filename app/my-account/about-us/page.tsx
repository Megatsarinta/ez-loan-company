'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ExternalLink, 
  Shield, 
  CheckCircle, 
  Globe, 
  Phone, 
  Mail, 
  Building, 
  FileText, 
  Users,
  Target,
  Award,
  Clock,
  Lock,
  Star,
  Home,
  Wallet,
  UserCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Sparkles,
  TrendingUp,
  HandHeart,
  IndianRupee
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

interface FAQItem {
  question: string
  answer: string
}

interface PolicyItem {
  name: string
  url: string
  description: string
}

interface ValueItem {
  title: string
  description: string
  icon: string
  color: string
}

interface StatItem {
  label: string
  value: string
}

interface AboutData {
  company: string
  intro: string
  mission: string
  yearsActive: number
  security: string
  compliance: string
  email: string
  phone: string
  website: string
  faqItems: FAQItem[]
  policies: PolicyItem[]
  values: ValueItem[]
  stats: StatItem[]
  address: string
  operatingHours: string
}

// Get icon component based on icon name
const getIconComponent = (iconName: string, color: string = 'currentColor') => {
  const iconProps = { className: "w-6 h-6", style: { color } }
  switch(iconName) {
    case 'shield': return <Shield {...iconProps} />
    case 'globe': return <Globe {...iconProps} />
    case 'target': return <Target {...iconProps} />
    case 'clock': return <Clock {...iconProps} />
    case 'lock': return <Lock {...iconProps} />
    case 'award': return <Award {...iconProps} />
    case 'users': return <Users {...iconProps} />
    case 'heart': return <Heart {...iconProps} />
    case 'sparkles': return <Sparkles {...iconProps} />
    case 'hand-heart': return <HandHeart {...iconProps} />
    case 'trending-up': return <TrendingUp {...iconProps} />
    case 'check-circle': return <CheckCircle {...iconProps} />
    case 'file-text': return <FileText {...iconProps} />
    case 'rupee': return <IndianRupee {...iconProps} />
    default: return <Award {...iconProps} />
  }
}

export default function AboutUsPage() {
  const router = useRouter()
  const [about, setAbout] = useState<AboutData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')

  // Default data with EasyLoan branding for Indian market
  const defaultAboutData: AboutData = {
    company: COMPANY_INFO.name || 'EasyLoan Company Pvt Ltd',
    intro: 'EasyLoan is the leading digital lending platform in India, focused on providing fast, secure, and accessible financial solutions to Indians worldwide, with special attention to Non-Resident Indians (NRIs).',
    mission: COMPANY_INFO.tagline.mission || 'To democratize access to financial services by leveraging technology, providing transparent loan solutions, and building trust through secure, RBI-regulated operations. For NRIs, for India.',
    yearsActive: new Date().getFullYear() - parseInt(COMPANY_INFO.incorporationDate.split('-')[0] || '2020'),
    security: 'We implement bank-grade security protocols including 256-bit SSL encryption, two-factor authentication, and regular security audits. All data is stored in secure, ISO 27001 certified servers compliant with Indian IT Act 2000.',
    compliance: `Registered with the Ministry of Corporate Affairs (CIN: ${COMPANY_INFO.cin}) and regulated by the Reserve Bank of India (RBI Reg No: ${COMPANY_INFO.rbiRegistrationNo}). We strictly adhere to RBI guidelines, Fair Practices Code, and Indian data protection laws.`,
    email: COMPANY_INFO.contact.email || 'support@easyloan.com',
    phone: COMPANY_INFO.contact.phone || '+91 22 6789 1234',
    website: COMPANY_INFO.contact.website || 'https://www.easyloan.com',
    address: COMPANY_INFO.registeredOffice.fullAddress || 'Mumbai, Maharashtra, India',
    operatingHours: 'Monday to Friday, 9:00 AM to 6:00 PM IST | Saturday, 10:00 AM to 2:00 PM IST',
    faqItems: [
      {
        question: 'How long does loan approval take?',
        answer: 'Most applications are approved within 2-24 hours. NRI applications may take slightly longer for verification but typically within 48 hours.'
      },
      {
        question: 'What are your interest rates?',
        answer: 'Our rates range from 0.5% to 0.8% monthly (6% to 9.6% p.a.) depending on credit score, loan amount, and term length. We offer competitive rates with no hidden charges.'
      },
      {
        question: 'Is EasyLoan safe and legitimate?',
        answer: `Yes! We are an RBI Registered NBFC (Reg No: ${COMPANY_INFO.rbiRegistrationNo}) and CIBIL partner. All transactions are secured with bank-grade encryption and we comply with all Indian financial regulations including RBI guidelines and the IT Act 2000.`
      },
      {
        question: 'Can NRIs apply for loans?',
        answer: 'Absolutely! We specialize in NRI loans. You can apply from anywhere in the world and we accept various proof of income documents from overseas employment. Funds can be disbursed to your NRE/NRO accounts.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept payments through all major Indian banks via NEFT/RTGS/IMPS, UPI apps (Google Pay, PhonePe, Paytm), NACH auto-debit, and international remittance services for NRI repayments.'
      },
      {
        question: 'How do I improve my CIBIL score?',
        answer: 'Maintain timely repayments, keep credit utilization low, update your income information regularly, and maintain a good credit history. Your credit limit increases automatically with good repayment behavior.'
      }
    ],
    policies: [
      { 
        name: 'Privacy Policy', 
        url: '/my-account/privacy-policy',
        description: 'How we protect your personal data under IT Act 2000'
      },
      { 
        name: 'Terms of Service', 
        url: '/my-account/terms', 
        description: 'User agreement and RBI compliance guidelines'
      },
      { 
        name: 'Grievance Policy', 
        url: '/my-account/grievance', 
        description: 'Nodal officer and complaint redressal'
      }
    ],
    values: [
      {
        title: 'Transparency',
        description: 'No hidden fees, clear terms, and upfront disclosure of all charges as per RBI guidelines.',
        icon: 'target',
        color: '#FF9933'
      },
      {
        title: 'Security',
        description: 'Bank-grade security, RBI regulation, and ISO 27001 certification.',
        icon: 'shield',
        color: '#138808'
      },
      {
        title: 'Accessibility',
        description: 'Available 24/7, designed for Indians worldwide including NRIs.',
        icon: 'globe',
        color: '#000080'
      },
      {
        title: 'Speed',
        description: 'Fast approval and disbursement within 24 hours for qualified applicants.',
        icon: 'clock',
        color: '#FF9933'
      },
      {
        title: 'Integrity',
        description: 'We follow the RBI Fair Practices Code and treat every client with respect.',
        icon: 'heart',
        color: '#138808'
      },
      {
        title: 'Community',
        description: 'Building a supportive financial ecosystem for our global Indian family.',
        icon: 'hand-heart',
        color: '#000080'
      }
    ],
    stats: [
      { label: 'Active Users', value: '500,000+' },
      { label: 'Total Loans', value: '₹2,500+ Cr' },
      { label: 'NRI Clients', value: '200,000+' },
      { label: 'Approval Rate', value: '94%' }
    ]
  }

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        // In production, fetch from your API
        // const response = await fetch('/api/about-us')
        // if (response.ok) {
        //   const data = await response.json()
        //   setAbout(data)
        // }
        
        // For now, use default data
        setTimeout(() => {
          setAbout(defaultAboutData)
          setIsLoading(false)
        }, 500)
      } catch (err) {
        console.error('Error loading about data:', err)
        setAbout(defaultAboutData)
        setIsLoading(false)
      }
    }

    fetchAbout()
  }, [])

  // Handle scroll for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'company-info', element: document.getElementById('company-info') },
        { id: 'our-values', element: document.getElementById('our-values') },
        { id: 'security-compliance', element: document.getElementById('security-compliance') },
        { id: 'contact-info', element: document.getElementById('contact-info') },
        { id: 'faq', element: document.getElementById('faq') },
        { id: 'policies', element: document.getElementById('policies') }
      ]

      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        if (section.element) {
          const { offsetTop, offsetHeight } = section.element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleFAQ = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Header height
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#6C757D]">Loading company information...</p>
        </div>
      </div>
    )
  }

  if (!about) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6C757D] mb-4">Failed to load company information</p>
          <button 
            onClick={() => router.back()} 
            className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#e68a2e] hover:to-[#0f6d07] transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-24">
      {/* HEADER - Redesigned with EasyLoan branding */}
      <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="text-[#FF9933] hover:text-[#e68a2e] hover:bg-orange-50 p-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3">
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
                <div className="flex items-baseline">
                  <span className="text-xl font-black tracking-tight">
                    <span className="text-[#FF9933]">EASY</span>
                    <span className="text-[#138808]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">About Us • Company Information</p>
              </div>
            </div>
          </div>
          
          {/* Government Badges - Updated to Indian regulators */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.rbi}
                alt="RBI Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[#FF9933]">RBI Registered</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.cibil}
                alt="CIBIL Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[#138808]">CIBIL Partner</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Image
                src={GOVERNMENT_LOGOS.digilocker}
                alt="DigiLocker Logo"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="font-semibold text-xs text-[#000080]">DigiLocker</span>
            </div>
          </div>
        </div>
      </header>

      {/* QUICK NAVIGATION (Desktop) - Updated colors */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'company-info', label: 'Company Info' },
            { id: 'our-values', label: 'Our Values' },
            { id: 'security-compliance', label: 'Security' },
            { id: 'contact-info', label: 'Contact' },
            { id: 'faq', label: 'FAQs' },
            { id: 'policies', label: 'Policies' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-[#FF9933] to-[#138808] text-white'
                  : 'bg-white text-[#6C757D] hover:bg-orange-50 hover:text-[#FF9933]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* HERO SECTION - Redesigned with Indian flag colors */}
        <section id="company-info" className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white rounded-2xl p-6 md:p-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-8"></div>
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{about.company}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">🇮🇳</span>
                <span className="text-white/90">RBI Registered NBFC • For NRIs, for India</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 relative z-10">
            <p className="text-lg text-white/90">{about.intro}</p>
            <p className="text-white/80">{about.mission}</p>
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/70">Incorporated in {COMPANY_INFO.incorporationDate.split('-')[0]}</p>
            </div>
          </div>
          
          {/* Company Stats - Redesigned cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
            {about.stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* OUR VALUES - Redesigned with color-coded cards */}
        <section id="our-values" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            Our Core Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {about.values.map((value, index) => (
              <div key={index} className="bg-[#f8f9fa] rounded-xl p-5 hover:shadow-md transition-all border border-gray-100 hover:border-[#FF9933]/20">
                <div className="mb-3" style={{ color: value.color }}>
                  {getIconComponent(value.icon, value.color)}
                </div>
                <h3 className="font-semibold text-[#212529] mb-2">{value.title}</h3>
                <p className="text-sm text-[#6C757D]">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECURITY & COMPLIANCE - Redesigned with Indian flag colors */}
        <section id="security-compliance" className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security & Compliance
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <h3 className="font-semibold mb-3">Bank-Grade Security</h3>
              <p className="text-white/90 text-sm mb-4">{about.security}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Two-Factor Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">ISO 27001 Certified</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <h3 className="font-semibold mb-3">Regulatory Compliance</h3>
              <p className="text-white/90 text-sm mb-4">{about.compliance}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={16} height={16} className="object-contain" />
                  <span className="text-sm">RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={16} height={16} className="object-contain" />
                  <span className="text-sm">CIN: {COMPANY_INFO.cin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={16} height={16} className="object-contain" />
                  <span className="text-sm">CIBIL Partner</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT INFORMATION - Redesigned with color-coded cards */}
        <section id="contact-info" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#FF9933] rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Email Support</h3>
                  <p className="text-sm text-[#6C757D]">24/7 Customer Support</p>
                </div>
              </div>
              <a 
                href={`mailto:${about.email}`}
                className="text-[#FF9933] hover:text-[#e68a2e] font-medium break-all hover:underline"
              >
                {about.email}
              </a>
            </div>
            
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#138808] rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Phone Support</h3>
                  <p className="text-sm text-[#6C757D]">Mon-Sat, 9AM-6PM IST</p>
                </div>
              </div>
              <a 
                href={`tel:${about.phone.replace(/[^+\d]/g, '')}`}
                className="text-[#138808] hover:text-[#0f6d07] font-medium hover:underline"
              >
                {about.phone}
              </a>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#000080] rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">Website</h3>
                  <p className="text-sm text-[#6C757D]">Official Information</p>
                </div>
              </div>
              <a 
                href={`https://${about.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#000080] hover:text-[#000066] font-medium flex items-center gap-1 hover:underline"
              >
                {about.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Additional Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#212529] mb-2">Registered Office</h4>
                <p className="text-sm text-[#6C757D]">{about.address}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#212529] mb-2">Operating Hours</h4>
                <p className="text-sm text-[#6C757D]">{about.operatingHours}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS - Redesigned header */}
        <section id="faq" className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Frequently Asked Questions
            </h2>
            <p className="text-white/80 text-sm mt-1">Find answers to common questions about our services</p>
          </div>
          
          <div className="divide-y divide-[#f0f0f0]">
            {about.faqItems.map((item, index) => (
              <div key={index} className="p-6">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#212529] group-hover:text-[#FF9933] transition-colors">
                        {item.question}
                      </p>
                      {expandedFaq === index && (
                        <p className="text-sm text-[#6C757D] mt-2">{item.answer}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-[#FF9933]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#6C757D]" />
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* POLICIES - Redesigned cards */}
        <section id="policies" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Company Policies
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {about.policies.map((policy, index) => (
              <Link
                key={index}
                href={policy.url}
                className="group block"
              >
                <div className="bg-[#f8f9fa] hover:bg-gradient-to-r hover:from-[#FF9933] hover:to-[#138808] group-hover:text-white border border-gray-100 rounded-xl p-4 transition-all group-hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#212529] group-hover:text-white">
                          {policy.name}
                        </span>
                        <p className="text-xs text-[#6C757D] group-hover:text-white/80 mt-1">{policy.description}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#6C757D] group-hover:text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Government Trust Badges - Updated to Indian regulators */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-4 border border-[#FF9933]/20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#FF9933]">RBI Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#138808]">MCA Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#000080]">CIBIL Partner</span>
            </div>
          </div>
        </div>

        {/* BACK BUTTON - Updated gradient */}
        <button
          onClick={() => router.back()}
          className="w-full bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to My Account
        </button>
      </main>

      {/* BOTTOM NAVIGATION - Updated colors */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 py-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#FF9933] hover:bg-orange-50"
          >
            <Home className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>

          <Link
            href="/wallet"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#6C757D] hover:text-[#FF9933] hover:bg-orange-50"
          >
            <Wallet className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>

          <Link
            href="/my-account"
            className="flex flex-col items-center px-8 py-2 rounded-lg transition-all text-[#FF9933] bg-orange-50"
          >
            <UserCircle className="w-7 h-7 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4">
        <p className="text-xs text-gray-400">
          {COMPANY_INFO.name} | CIN: {COMPANY_INFO.cin} | RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}
          <br />
          All rights reserved. For NRIs, for India.
        </p>
      </div>
    </div>
  )
}