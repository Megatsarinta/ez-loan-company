'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Headphones, 
  Home, 
  Wallet, 
  UserCircle, 
  ArrowLeft, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  X,
  Shield,
  Clock,
  CheckCircle,
  HelpCircle,
  Facebook,
  Twitter,
  MessageSquare,
  MailQuestion,
  PhoneCall,
  MessageCircle as MessageCircleIcon,
  Send,
  ChevronDown,
  ChevronUp,
  IndianRupee
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the form data to your backend
    console.log('Contact form submitted:', contactForm)
    setFormSubmitted(true)
    setTimeout(() => setFormSubmitted(false), 5000)
  }

  const faqItems = [
    {
      question: "How do I apply for a loan?",
      answer: "Navigate to the Home page and click on 'Apply for a Loan'. Follow the step-by-step process to submit your application. You'll need to complete KYC verification with Aadhaar/PAN, provide personal information, and sign the digital contract."
    },
    {
      question: "How can I check my CIBIL score?",
      answer: "Your CIBIL score is displayed on your Account page. It updates automatically based on your repayment behavior and is refreshed every month. The score ranges from 300 to 900, with 750+ considered good."
    },
    {
      question: "What are the requirements for NRI loans?",
      answer: "For NRI loans, you need: Valid Indian Passport, work visa/residence permit, employment contract, salary slips (last 3 months), bank statements (last 6 months), NRE/NRO account details, and PAN Card. You can apply from anywhere in the world."
    },
    {
      question: "How long does loan approval take?",
      answer: "Most applications are approved within 24 hours. NRI applications may take up to 48 hours for verification due to international document checks. Once approved, funds are disbursed within 2-4 hours to your NRE/NRO account."
    },
    {
      question: "What payment methods do you accept for EMI?",
      answer: "We accept multiple payment methods: NACH auto-debit from your bank account, UPI AutoPay (Google Pay, PhonePe, Paytm), NEFT/RTGS/IMPS transfer, and standing instructions for NRE/NRO accounts."
    },
    {
      question: "How do I reset my withdrawal code?",
      answer: "You can request a withdrawal code reset from your Wallet page. The new 6-digit code will be sent to your registered mobile number. For security reasons, withdrawal codes cannot be retrieved - only reset."
    }
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] pb-24">
      {/* Header - Redesigned with EasyLoan branding */}
      <header className="bg-[var(--color-bg-surface)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/my-account" className="mr-2">
              <ArrowLeft className="w-6 h-6 text-[var(--color-accent-500)] hover:text-[var(--color-accent-600)] transition-colors" />
            </Link>
            
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
                    <span className="text-[var(--color-accent-500)]">EASY</span>
                    <span className="text-[var(--color-secondary-600)]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">Customer Support • 24/7</p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[var(--color-accent-100)] px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Regd NBFC</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Hero Section - Indian flag gradient */}
        <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] rounded-3xl p-8 shadow-2xl mb-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-bg-surface)]/5 rounded-full -translate-y-16 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-bg-surface)]/5 rounded-full translate-y-12 -translate-x-8"></div>
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Headphones className="w-6 h-6" />
              <span className="text-sm bg-[var(--color-bg-surface)]/20 px-3 py-1 rounded-full">24/7 Customer Support</span>
            </div>
            
            <div className="w-20 h-20 bg-[var(--color-bg-surface)]/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-3">How Can We Help You?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Our dedicated support team is available 24/7 to assist you with any questions about loans, 
              repayments, or your account.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-bg-surface)]/20">
                <Phone className="w-6 h-6 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Phone Support</h3>
                <p className="text-sm opacity-90">{COMPANY_INFO.contact.phone}</p>
                <p className="text-xs opacity-80 mt-1">24/7 Available</p>
              </div>
              <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-bg-surface)]/20">
                <Mail className="w-6 h-6 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm opacity-90">{COMPANY_INFO.contact.email}</p>
                <p className="text-xs opacity-80 mt-1">Response within 2 hrs</p>
              </div>
              <div className="bg-[var(--color-bg-surface)]/10 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-bg-surface)]/20">
                <MessageCircle className="w-6 h-6 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm opacity-90">24/7 Online</p>
                <p className="text-xs opacity-80 mt-1">Instant response</p>
              </div>
            </div>
          </div>
        </div>

        {/* Government Logos Strip - Updated for India */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-4 mb-6 border border-[var(--color-accent-500)]/20">
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
          </div>
        </div>

        {/* Contact Cards - Redesigned with Indian colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[var(--color-accent-500)] rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-[var(--color-bg-surface)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)]">Phone Support</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">24/7 Helpline</p>
              </div>
            </div>
            <p className="text-lg font-bold text-[var(--color-accent-500)] mb-2">{COMPANY_INFO.contact.phone}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Toll-free: {COMPANY_INFO.contact.tollFree}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[var(--color-secondary-600)] rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-[var(--color-bg-surface)]" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)]">Email Support</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">24hr Response Time</p>
              </div>
            </div>
            <p className="text-lg font-bold text-[var(--color-secondary-600)] mb-2">{COMPANY_INFO.contact.email}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">NRI Support: {COMPANY_INFO.contact.nriEmail}</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-lg border border-[var(--color-border)] mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
              <MailQuestion className="w-4 h-4 text-[var(--color-bg-surface)]" />
            </div>
            Send Us a Message
          </h2>
          
          {formSubmitted ? (
            <div className="bg-[var(--color-secondary-100)] border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-[var(--color-secondary-600)] mx-auto mb-4" />
              <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Message Sent Successfully!</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">Our support team will get back to you within 2 hours.</p>
              <Button 
                onClick={() => setFormSubmitted(false)}
                className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)]"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Your Name</label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Enter 10-digit Indian mobile number</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Your Message</label>
                <Textarea
                  placeholder="How can we help you?"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* FAQ Section - Redesigned */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-lg border border-[var(--color-border)] mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-[var(--color-bg-surface)]" />
            </div>
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[var(--color-bg-main)] transition-colors"
                >
                  <span className="font-medium text-[var(--color-text-primary)]">{item.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[var(--color-accent-500)]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-main)]/50">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Grievance Officer Information */}
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-6 border border-[var(--color-accent-500)]/20 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--color-bg-surface)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-primary)]">Grievance Redressal Officer</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">As per RBI guidelines</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-bg-surface)]/80 p-4 rounded-lg">
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{COMPANY_INFO.keyPersonnel.grievanceOfficer.name}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-2">{COMPANY_INFO.keyPersonnel.grievanceOfficer.designation}</p>
              <div className="space-y-1">
                <p className="text-xs flex items-center gap-2">
                  <Mail className="w-3 h-3 text-[var(--color-accent-500)]" />
                  <a href={`mailto:${COMPANY_INFO.keyPersonnel.grievanceOfficer.email}`} className="text-[var(--color-accent-500)] hover:underline">
                    {COMPANY_INFO.keyPersonnel.grievanceOfficer.email}
                  </a>
                </p>
                <p className="text-xs flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[var(--color-secondary-600)]" />
                  <span>{COMPANY_INFO.keyPersonnel.grievanceOfficer.phone}</span>
                </p>
              </div>
            </div>
            
            <div className="bg-[var(--color-bg-surface)]/80 p-4 rounded-lg">
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Escalation Matrix</p>
              <ul className="text-xs space-y-2 text-[var(--color-text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-accent-500)] rounded-full mt-1.5"></span>
                  <span>If not satisfied with response, escalate to Nodal Officer within 30 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-secondary-600)] rounded-full mt-1.5"></span>
                  <span>Further escalation to RBI Banking Ombudsman as per RBI guidelines</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-6 border border-[var(--color-accent-500)]/20 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[var(--color-bg-surface)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-primary)]">Support Hours</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">We're here when you need us</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--color-bg-surface)]/80 p-3 rounded-lg text-center">
              <Phone className="w-5 h-5 text-[var(--color-accent-500)] mx-auto mb-2" />
              <p className="font-semibold text-[var(--color-text-primary)]">Phone Support</p>
              <p className="text-xs text-[var(--color-text-secondary)]">24/7 • Always Open</p>
            </div>
            <div className="bg-[var(--color-bg-surface)]/80 p-3 rounded-lg text-center">
              <Mail className="w-5 h-5 text-[var(--color-secondary-600)] mx-auto mb-2" />
              <p className="font-semibold text-[var(--color-text-primary)]">Email Support</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Response within 2 hrs</p>
            </div>
            <div className="bg-[var(--color-bg-surface)]/80 p-3 rounded-lg text-center">
              <MessageCircle className="w-5 h-5 text-[var(--color-primary-900)] mx-auto mb-2" />
              <p className="font-semibold text-[var(--color-text-primary)]">Live Chat</p>
              <p className="text-xs text-[var(--color-text-secondary)]">24/7 • Instant</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <Link href="/my-account" className="block mt-6">
          <Button className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Account
          </Button>
        </Link>
      </main>

      {/* Footer Note */}
      <div className="text-center mt-6 pb-4 px-4">
        <p className="text-xs text-[var(--color-text-secondary)]">
          {COMPANY_INFO.name} | CIN: {COMPANY_INFO.cin} | RBI Reg No: {COMPANY_INFO.rbiRegistrationNo}
          <br />
          Registered Office: {COMPANY_INFO.registeredOffice.fullAddress}
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-4 z-40 border-t border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/home" className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)] no-underline">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">HOME</span>
          </Link>
          
          <Link href="/wallet" className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)] no-underline">
            <Wallet className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>
          
          <Link href="/my-account" className="flex flex-col items-center px-6 md:px-8 py-2 rounded-lg transition-all text-[var(--color-accent-500)] bg-[var(--color-accent-100)] no-underline">
            <UserCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}