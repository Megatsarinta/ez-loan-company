import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'
import { 
  HelpCircle, ChevronDown, ChevronUp,
  FileText, CreditCard, Shield, Clock,
  Globe, Banknote, Phone, Mail,
  Search, CheckCircle, AlertCircle,
  HandCoins, Headphones, MessageCircle,
  Users, Wallet, Star
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-green-50/20">
      {/* Navigation Header - Updated with Digital India logo */}
      <header className="sticky top-0 z-50 bg-[var(--color-bg-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-4">
                {/* Digital India Logo */}
                <div className="w-12 h-12 lg:w-14 lg:h-14 relative">
                  <Image
                    src={COMPANY_LOGOS.main}
                    alt="Digital India"
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
                      <span className="text-[var(--color-accent-500)]">EASY</span>
                      <span className="text-[var(--color-secondary-600)]">LOAN</span>
                    </span>
                    <span className="ml-2 text-[10px] lg:text-xs bg-[var(--color-accent-500)] text-[var(--color-bg-surface)] px-2 py-0.5 rounded-full font-semibold">
                      NRI
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[var(--color-secondary-600)]" />
                      RBI Regd. NBFC
                    </span>
                  </p>
                </div>
              </Link>
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent-500)] font-medium transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent-500)] font-medium transition-colors">
                About Us
              </Link>
              <Link href="/faq" className="text-[var(--color-accent-500)] font-medium border-b-2 border-[var(--color-accent-500)] pb-1">
                FAQ
              </Link>
            </nav>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Hero Section - Updated with English */}
        <section className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-green-50 text-[var(--color-text-primary)] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-200/50">
            <HelpCircle className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span>Frequently Asked Questions</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
            What would you like to{' '}
            <span className="bg-gradient-to-r from-[var(--color-accent-500)] via-[var(--color-bg-surface)] to-[var(--color-secondary-600)] bg-clip-text text-transparent">
              know?
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-text-secondary)] mb-8 lg:mb-12 max-w-3xl mx-auto">
            Find answers to common questions about our loans, 
            application process, and services for NRIs.
          </p>

          {/* Government Regulators Mini Badge */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={32} height={32} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={32} height={32} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={32} height={32} className="object-contain" />
            </div>
            <div className="w-8 h-8 relative">
              <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] ml-2">RBI Regulated NBFC</span>
          </div>
        </section>

        {/* Quick Links - Updated colors */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            <a href="#application" className="flex flex-col items-center p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-500)] hover:shadow-md transition-all group">
              <FileText className="w-8 h-8 text-[var(--color-accent-500)] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Application Process</span>
              <span className="text-xs text-[var(--color-text-secondary)] mt-1">How to apply</span>
            </a>
            <a href="#requirements" className="flex flex-col items-center p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-500)] hover:shadow-md transition-all group">
              <CreditCard className="w-8 h-8 text-[var(--color-secondary-600)] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Loan Requirements</span>
              <span className="text-xs text-[var(--color-text-secondary)] mt-1">Documents needed</span>
            </a>
            <a href="#security" className="flex flex-col items-center p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-500)] hover:shadow-md transition-all group">
              <Shield className="w-8 h-8 text-[var(--color-primary-900)] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Security & Safety</span>
              <span className="text-xs text-[var(--color-text-secondary)] mt-1">Your data safety</span>
            </a>
            <a href="#repayment" className="flex flex-col items-center p-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-500)] hover:shadow-md transition-all group">
              <Clock className="w-8 h-8 text-[var(--color-accent-500)] mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-900 text-center">Repayment</span>
              <span className="text-xs text-[var(--color-text-secondary)] mt-1">How to repay</span>
            </a>
          </div>
        </section>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Application Process */}
          <section id="application">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-[var(--color-accent-500)]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Application Process</h2>
              <span className="text-sm text-[var(--color-text-secondary)] ml-auto">How to apply</span>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {applicationFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-[var(--color-text-secondary)] mb-4">{faq.answer}</p>
                    {faq.additional && (
                      <div className="mt-4 p-4 bg-[var(--color-accent-100)] rounded-lg">
                        <p className="text-sm text-[var(--color-text-primary)]">{faq.additional}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Loan Requirements */}
          <section id="requirements">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[var(--color-secondary-600)]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Loan Requirements</h2>
              <span className="text-sm text-[var(--color-text-secondary)] ml-auto">Documents needed</span>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {requirementsFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`req-${index}`}
                  className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-[var(--color-text-secondary)] mb-4">{faq.answer}</p>
                    {faq.bullets && (
                      <ul className="space-y-2 mt-4">
                        {faq.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
                            <span className="text-[var(--color-text-secondary)]">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Security & Safety */}
          <section id="security">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-[var(--color-primary-900)]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Security & Safety</h2>
              <span className="text-sm text-[var(--color-text-secondary)] ml-auto">Your data safety</span>
            </div>
            
            {/* Regulatory Security Badge */}
            <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={32} height={32} className="object-contain" />
              <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={32} height={32} className="object-contain" />
              <p className="text-sm text-[var(--color-text-primary)] ml-2">
                <span className="font-bold">RBI Registered • MeitY Certified</span> - Secure and compliant
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {securityFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`sec-${index}`}
                  className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-[var(--color-text-secondary)]">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Repayment */}
          <section id="repayment">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-[var(--color-accent-500)]" />
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Repayment & Payments</h2>
              <span className="text-sm text-[var(--color-text-secondary)] ml-auto">How to repay</span>
            </div>
            
            {/* Payment Partners */}
            <div className="bg-[var(--color-bg-main)] rounded-xl p-4 mb-6 flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Partner Payment Channels:</span>
              <span className="text-xs bg-[var(--color-bg-surface)] px-3 py-1 rounded-full shadow-sm">NACH AutoPay</span>
              <span className="text-xs bg-[var(--color-bg-surface)] px-3 py-1 rounded-full shadow-sm">UPI AutoPay</span>
              <span className="text-xs bg-[var(--color-bg-surface)] px-3 py-1 rounded-full shadow-sm">NRE/NRO Transfer</span>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {repaymentFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`repay-${index}`}
                  className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] px-6"
                >
                  <AccordionTrigger className="py-6 hover:no-underline">
                    <span className="text-lg font-medium text-left text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-[var(--color-text-secondary)]">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        {/* Still Need Help - Updated with English and regulator logos */}
        <section className="mt-16 md:mt-20">
          <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-3xl p-8 md:p-12 text-[var(--color-bg-surface)] text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-bg-surface)] rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--color-bg-surface)] rounded-full translate-x-24 translate-y-24"></div>
            </div>
            
            <div className="relative z-10">
              <Headphones className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Still have questions?</h2>
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Our NRI support team is available 24/7 to help with any questions you may have.
              </p>
              
              {/* Regulatory Trust Badges */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <div className="bg-[var(--color-bg-surface)]/20 rounded-full px-4 py-2 flex items-center gap-2">
                  <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={20} height={20} className="object-contain" />
                  <span className="text-sm">RBI Registered</span>
                </div>
                <div className="bg-[var(--color-bg-surface)]/20 rounded-full px-4 py-2 flex items-center gap-2">
                  <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={20} height={20} className="object-contain" />
                  <span className="text-sm">CIBIL Partner</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[var(--color-bg-surface)] text-[var(--color-accent-500)] hover:bg-[var(--color-bg-main)] px-8 py-6 text-lg rounded-2xl shadow-xl">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="border-2 border-[var(--color-bg-surface)] text-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface)]/10 px-8 py-6 text-lg rounded-2xl bg-transparent">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </Button>
                <Button variant="outline" className="border-2 border-[var(--color-bg-surface)] text-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface)]/10 px-8 py-6 text-lg rounded-2xl bg-transparent">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Live Chat
                </Button>
              </div>
              
              <p className="text-sm opacity-80 mt-6">
                🇮🇳 Toll-free support for NRIs worldwide
              </p>
            </div>
          </div>
        </section>

        {/* Quick Support Links */}
        <section className="mt-12">
          <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Other ways to get help</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[var(--color-accent-100)] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-[var(--color-accent-500)]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Live Chat</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">24/7 online</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[var(--color-secondary-100)] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-[var(--color-secondary-600)]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">{COMPANY_INFO.contact.email}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[var(--color-primary-900)]" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">NRI Community</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">Join our forum</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Updated with Digital India logo */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 relative">
                  <Image src={COMPANY_LOGOS.main} alt="Digital India" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-lg font-black tracking-tight">
                  <span className="text-[var(--color-accent-500)]">EASY</span>
                  <span className="text-[var(--color-secondary-600)]">LOAN</span>
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                For NRIs, For India. Fast, secure, and accessible loans for our global Indian community.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]">Home</Link></li>
                <li><Link href="/about" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]">About Us</Link></li>
                <li><Link href="/faq" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]">FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Regulatory */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Regulatory</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-[var(--color-accent-100)] text-[var(--color-accent-500)] px-2 py-1 rounded-full">RBI</span>
                <span className="text-xs bg-[var(--color-secondary-100)] text-[var(--color-secondary-600)] px-2 py-1 rounded-full">MCA</span>
                <span className="text-xs bg-blue-50 text-[var(--color-primary-900)] px-2 py-1 rounded-full">CIBIL</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              © 2024 {COMPANY_INFO.name}. All rights reserved. {COMPANY_INFO.tagline.nri}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const applicationFAQs = [
  {
    question: "How long does the application process take?",
    answer: "Our online application takes only 5-10 minutes to complete. After submission, most applications are reviewed and approved within 24 hours during business days.",
    additional: "Weekend applications are processed on the next business day."
  },
  {
    question: "Can I apply from overseas as an NRI?",
    answer: "Yes! We are specifically designed for NRIs. You can apply from anywhere in the world as long as you have internet access.",
    additional: "We serve NRIs in over 50 countries including USA, UK, Canada, UAE, Singapore, Australia, and more."
  },
  {
    question: "Do I need to be in India to apply?",
    answer: "No, you can apply while living abroad. All processes are done online, and funds can be disbursed to your NRE or NRO account in India.",
    additional: "The entire process is paperless and can be completed from anywhere."
  }
]

const requirementsFAQs = [
  {
    question: "What documents do I need to apply?",
    answer: "We keep requirements simple for NRIs:",
    bullets: [
      "Valid Indian Passport",
      "Proof of NRI status (Visa/Work permit)",
      "Proof of income (salary slips or bank statements)",
      "NRE/NRO account details",
      "PAN Card"
    ]
  },
  {
    question: "Is collateral required?",
    answer: "No, we offer unsecured loans specifically designed for NRIs. No collateral or property is required for loan approval."
  },
  {
    question: "What is the minimum income requirement?",
    answer: "Minimum income requirement varies by country but typically starts at equivalent of ₹15,00,000 per year."
  }
]

const securityFAQs = [
  {
    question: "Is my personal information secure?",
    answer: "Yes, we use bank-level 256-bit SSL encryption and comply with Indian IT Act 2000. Your information is never shared without consent."
  },
  {
    question: "How do you protect against fraud?",
    answer: "We use advanced fraud detection systems, multi-factor authentication, and regular security audits. We are ISO 27001 certified."
  },
  {
    question: "Is EasyLoan regulated in India?",
    answer: "Yes, we are an RBI Registered NBFC and comply with all Government of India regulations including RBI guidelines and MCA requirements."
  }
]

const repaymentFAQs = [
  {
    question: "What are my repayment options?",
    answer: "We offer flexible repayment options including NACH auto-debit from your NRE/NRO account, UPI AutoPay, or international bank transfers."
  },
  {
    question: "Can I pay early without penalty?",
    answer: "Yes, you can pay off your loan early without any prepayment penalties as per RBI guidelines. This can actually save you money on interest."
  },
  {
    question: "What happens if I miss a payment?",
    answer: "Contact our support team immediately. We offer grace periods and restructuring options for NRIs facing genuine financial challenges as per RBI guidelines."
  }
]