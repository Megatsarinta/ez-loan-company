import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'
import { 
  Users, Globe, Shield, Award, Target, 
  Heart, TrendingUp, ChevronRight, CheckCircle,
  MapPin, Phone, Mail, Clock, Building, Users2,
  Briefcase, Star, Sparkles, HandHeart, Leaf
} from 'lucide-react'

export default function AboutPage() {
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
              <Link href="/about" className="text-[var(--color-accent-500)] font-medium border-b-2 border-[var(--color-accent-500)] pb-1">
                About Us
              </Link>
              <Link href="/faq" className="text-[var(--color-text-primary)] hover:text-[var(--color-accent-500)] font-medium transition-colors">
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
        <section className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-green-50 text-[var(--color-text-primary)] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-orange-200/50">
            <Heart className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span>🇮🇳 Serving NRIs Worldwide Since 2015</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
            For the{' '}
            <span className="bg-gradient-to-r from-[var(--color-accent-500)] via-[var(--color-bg-surface)] to-[var(--color-secondary-600)] bg-clip-text text-transparent">
              Global Indian
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-text-secondary)] mb-8 lg:mb-12 max-w-4xl mx-auto">
            Our mission is to provide fast, accessible, and secure financial solutions 
            for Non-Resident Indians (NRIs), helping them achieve their dreams for their families back home.
          </p>
        </section>

        {/* Government Regulators Badge */}
        <section className="mb-16">
          <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 border border-[var(--color-border)] max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[var(--color-accent-500)]" />
                <div>
                  <h3 className="font-bold text-gray-900">RBI Regulated NBFC</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Registered with Government of India</p>
                </div>
              </div>
              
              {/* Government Logos */}
              <div className="flex items-center gap-6 flex-wrap justify-center">
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={48} height={48} className="object-contain" />
                </div>
                <div className="w-12 h-12 relative">
                  <Image src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" width={48} height={48} className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story - Updated with NRI context */}
        <section className="mb-16 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-[var(--color-accent-500)]" />
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Story</h2>
              </div>
              <div className="space-y-4 text-[var(--color-text-secondary)]">
                <p>
                  Founded in 2015 by former NRIs who themselves experienced the challenges of 
                  accessing financial services while living abroad, EasyLoan was born from a 
                  simple idea: every NRI deserves fast, fair, and transparent access to credit.
                </p>
                <p>
                  We started as a small team in Mumbai, focused on understanding the unique 
                  financial needs of overseas Indians. Today, we have served over 500,000 NRIs 
                  across 50+ countries, helping them achieve their dreams and support their 
                  families back home.
                </p>
                <p>
                  We continue to innovate and improve our services for our fellow Indians abroad, 
                  providing not just loans but comprehensive financial solutions for the modern NRI.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[var(--color-accent-500)]/10 to-[var(--color-secondary-600)]/10 rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-[var(--color-bg-surface)]/80 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-3xl font-bold text-[var(--color-accent-500)] mb-2">{stat.value}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Vision - Updated with Indian colors */}
        <section className="mb-16 md:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-3xl p-8 text-[var(--color-bg-surface)]">
              <Target className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="opacity-90">
                To make financial services accessible to every NRI around the world, 
                providing fast, transparent, and fair lending solutions that empower them 
                to build a secure future for their families in India.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[var(--color-secondary-600)] to-[var(--color-primary-900)] rounded-3xl p-8 text-[var(--color-bg-surface)]">
              <Globe className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="opacity-90">
                To become the most trusted financial partner for every Non-Resident Indian, 
                recognized for innovation, integrity, and exceptional service across the 
                global Indian community.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values - Updated with NRI-focused values */}
        <section className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Principles that guide our service to the NRI community
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-lg border border-[var(--color-border)] hover:shadow-xl transition-all duration-300 hover:border-[var(--color-accent-500)]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-[var(--color-text-secondary)]">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team & Leadership - Updated with Indian backgrounds */}
        <section className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Former NRIs and financial experts dedicated to serving our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[var(--color-accent-500)]/10 to-[var(--color-secondary-600)]/10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users2 className="w-16 h-16 text-[var(--color-accent-500)]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-[var(--color-secondary-600)] font-medium mb-3">{member.position}</p>
                <p className="text-[var(--color-text-secondary)] text-sm mb-2">{member.bio}</p>
                <p className="text-xs text-[var(--color-text-secondary)] italic">{member.experience}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Regulatory Compliance - Updated with government logos */}
        <section className="mb-16 md:mb-20">
          <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <Shield className="w-6 h-6 text-[var(--color-accent-500)]" />
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Regulatory Compliance</h2>
                </div>
                <p className="text-[var(--color-text-secondary)] mb-6">
                  We are recognized and registered with Government of India authorities 
                  to ensure the safety and protection of our NRI customers.
                </p>
                <ul className="space-y-3">
                  {compliance.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)]" />
                      <span className="text-[var(--color-text-primary)]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-bg-surface)]/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.rbi}
                    alt="RBI Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">RBI Registered</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Reserve Bank of India</p>
                </div>
                <div className="bg-[var(--color-bg-surface)]/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.mca}
                    alt="MCA Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">MCA Registered</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Ministry of Corporate Affairs</p>
                </div>
                <div className="bg-[var(--color-bg-surface)]/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.cibil}
                    alt="CIBIL Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">CIBIL Partner</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Credit Bureau Partner</p>
                </div>
                <div className="bg-[var(--color-bg-surface)]/80 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <Image
                    src={GOVERNMENT_LOGOS.digilocker}
                    alt="DigiLocker Logo"
                    width={48}
                    height={48}
                    className="mx-auto mb-4 object-contain"
                  />
                  <h3 className="font-bold text-gray-900 mb-2">DigiLocker</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">Digital Document Verification</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info - Updated with Indian info */}
        <section className="mb-12">
          <div className="bg-[var(--color-bg-surface)] rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                Always ready to help with your financial needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-accent-500)] transition-colors">
                <div className="w-12 h-12 bg-[var(--color-accent-100)] rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-[var(--color-accent-500)]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">24/7 Helpline</h3>
                <p className="text-[var(--color-text-secondary)] mb-2">{COMPANY_INFO.contact.tollFree}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Always available</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-accent-500)] transition-colors">
                <div className="w-12 h-12 bg-[var(--color-secondary-100)] rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-[var(--color-secondary-600)]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
                <p className="text-[var(--color-text-secondary)] mb-2">{COMPANY_INFO.contact.email}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Response within 2 hours</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-accent-500)] transition-colors">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-[var(--color-primary-900)]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Headquarters</h3>
                <p className="text-[var(--color-text-secondary)] mb-2">Mumbai, India</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Serving NRIs worldwide</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-3xl p-8 md:p-12 text-[var(--color-bg-surface)]">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-lg mb-8 opacity-90">Join 500,000+ NRIs who have trusted us</p>
            <Link href="/register">
              <Button className="bg-[var(--color-bg-surface)] text-[var(--color-accent-500)] hover:bg-[var(--color-bg-main)] text-lg py-6 px-12 rounded-2xl shadow-lg">
                Apply Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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

            {/* Accreditation */}
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

const stats = [
  { value: '500K+', label: 'NRIs Served' },
  { value: '₹2,500+ Cr', label: 'Loans Disbursed' },
  { value: '50+', label: 'Countries' },
  { value: '2015', label: 'Founded' }
]

const values = [
  {
    icon: <Heart className="w-6 h-6 text-[var(--color-accent-500)]" />,
    title: 'Compassion',
    description: 'We understand the NRI journey and treat every client with respect and empathy.'
  },
  {
    icon: <Shield className="w-6 h-6 text-[var(--color-accent-500)]" />,
    title: 'Integrity',
    description: 'Transparent and honest service at all times.'
  },
  {
    icon: <Sparkles className="w-6 h-6 text-[var(--color-secondary-600)]" />,
    title: 'Innovation',
    description: 'Continuously improving our service for NRIs worldwide.'
  },
  {
    icon: <Users className="w-6 h-6 text-[var(--color-secondary-600)]" />,
    title: 'Community',
    description: 'Building a support system for our global Indian family.'
  }
]

const team = [
  {
    name: 'Rajesh Mehta',
    position: 'CEO & Co-Founder',
    bio: 'Former NRI in Dubai',
    experience: '15 years in financial services'
  },
  {
    name: 'Priya Sharma',
    position: 'Chief Operations Officer',
    bio: 'Former NRI in Singapore',
    experience: 'Specializes in digital banking'
  },
  {
    name: 'Vikram Patel',
    position: 'Chief Technology Officer',
    bio: 'Fintech expert',
    experience: '12 years in banking technology'
  }
]

const compliance = [
  'Registered with Reserve Bank of India (RBI)',
  'Ministry of Corporate Affairs (MCA) compliant',
  'CIBIL credit bureau partner',
  'DigiLocker integrated for secure KYC',
  'Regular security audits and ISO 27001 certified'
]