'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Home, 
  Wallet, 
  UserIcon, 
  Clock,
  FileText,
  Shield,
  Zap,
  MapPin,
  ChevronRight,
  Sparkles,
  Gift,
  IndianRupee,
  Percent
} from 'lucide-react'
import Link from 'next/link'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'
import { CURRENCY_CONFIG } from '@/config/currency'

// Terms with different interest rates
const loanTerms = [
  { months: 6, rate: 0.005, label: '6 months' },
  { months: 12, rate: 0.006, label: '12 months' },
  { months: 24, rate: 0.007, label: '24 months' },
  { months: 36, rate: 0.008, label: '36 months' }
]

interface UserData {
  id: number
  phone_number: string
  full_name: string
  credit_score: number
  wallet_balance: number
}

// Ad images for slider
const ads = [
  { id: 1, src: '/ads/ad-1.jpg', alt: 'Advertisement 1' },
  { id: 2, src: '/ads/ad-2.jpg', alt: 'Advertisement 2' },
  { id: 3, src: '/ads/ad-3.jpg', alt: 'Advertisement 3' },
  { id: 4, src: '/ads/ad-4.jpg', alt: 'Advertisement 4' },
  { id: 5, src: '/ads/ad-5.jpg', alt: 'Advertisement 5' }
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeNav, setActiveNav] = useState('home')
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  // Auto-update notifications (realistic masked phone numbers for India)
  const mockNotifications = [
    { phone: '09876****123', amount: 110000, location: 'Mumbai', method: 'UPI' },
    { phone: '09950****456', amount: 330000, location: 'Delhi', method: 'NEFT' },
    { phone: '09008****789', amount: 880000, location: 'Bangalore', method: 'IMPS' },
    { phone: '09268****234', amount: 440000, location: 'Chennai', method: 'RTGS' },
    { phone: '09358****567', amount: 220000, location: 'Kolkata', method: 'UPI' },
    { phone: '09108****890', amount: 990000, location: 'Pune', method: 'NEFT' },
    { phone: '09818****123', amount: 550000, location: 'Ahmedabad', method: 'IMPS' },
    { phone: '09478****456', amount: 770000, location: 'Hyderabad', method: 'RTGS' },
    { phone: '09668****789', amount: 1250000, location: 'Jaipur', method: 'UPI' },
    { phone: '09218****234', amount: 3100000, location: 'Lucknow', method: 'NEFT' }
  ]

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  // Auto-rotate notifications every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotificationIndex(
        (prev) => (prev + 1) % mockNotifications.length
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-slide ads every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN')
  }

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for Indian display
    if (phone.startsWith('0')) {
      // Remove leading zero for display: 0987654321 -> +91 987654321
      const withoutLeadingZero = phone.substring(1)
      return `+91 ${withoutLeadingZero.slice(0, 5)}****${withoutLeadingZero.slice(-2)}`
    }
    return phone
  }

  const formatStoredPhone = (phone: string) => {
    // For displaying the full stored format in welcome message
    if (phone.startsWith('0')) {
      return phone // Keep as 0987654321 format for welcome message
    }
    return phone
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)] pb-24">
      {/* Header - Fixed vertical alignment */}
      <header className="bg-[var(--color-bg-surface)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            {/* Left - EASYLOAN with NRI aligned properly */}
            <Link href="/home" className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 relative flex-shrink-0 mt-0.5">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="Digital India"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-black tracking-tight whitespace-nowrap">
                  <span className="text-[var(--color-accent-500)]">EASY</span>
                  <span className="text-[var(--color-secondary-600)]">LOAN</span>
                </span>
                {/* NRI badge - now directly below with no extra spacing */}
                <span className="text-[8px] md:text-[10px] bg-[var(--color-accent-500)] text-[var(--color-bg-surface)] px-2 py-0.5 rounded-full font-semibold self-start mt-0.5">
                  NRI
                </span>
              </div>
            </Link>
            
            {/* Right - Welcome: phone number and credit score below */}
            <div className="flex flex-col items-end min-w-0 max-w-[60%] sm:max-w-[70%]">
              <div className="text-xs text-[var(--color-text-secondary)] truncate w-full text-right">
                Welcome: <span className="font-mono font-medium text-[var(--color-text-primary)]">{formatStoredPhone(user.phone_number)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs mt-0.5 bg-gradient-to-r from-[var(--color-accent-500)]/10 to-[var(--color-secondary-600)]/10 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-[var(--color-accent-500)] flex-shrink-0" />
                <span className="whitespace-nowrap font-medium">CIBIL Score: {(user as any).cibil_score ?? user.credit_score ?? '750'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {/* Ad Slider Section */}
        <section className="mb-8">
          <div className="relative rounded-2xl overflow-hidden shadow-lg h-40 md:h-56 w-full">
            {/* Ad Images */}
            {ads.map((ad, index) => (
              <div
                key={ad.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentAdIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={ad.src}
                  alt={ad.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
            
            {/* Slider Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAdIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentAdIndex 
                      ? 'bg-[var(--color-bg-surface)] w-4' 
                      : 'bg-[var(--color-bg-surface)]/50 hover:bg-[var(--color-bg-surface)]/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Click-to-Borrow Loans */}
        <section className="mb-6">
          <div className="p-4 bg-[var(--color-bg-surface)] rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800">Click-to-Borrow Loans</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <IndianRupee className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Maximum Loan Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {CURRENCY_CONFIG.symbol}{CURRENCY_CONFIG.maxLoan.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Percent className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Maximum Monthly Interest Rate</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(Math.max(...CURRENCY_CONFIG.loanTerms.map(t => t.interestRate)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Loan Info Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-2xl p-6 text-[var(--color-bg-surface)] shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Need funds urgently?</h2>
            </div>
            <p className="text-[var(--color-bg-surface)]/90 mb-4 max-w-2xl">
              Get approved for a loan in as fast as 24 hours with our Quick Loan application. 
              Low interest rates, flexible terms, and no collateral required. RBI Regulated NBFC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/loan-application" className="inline-block">
                <button className="bg-[var(--color-bg-surface)] text-[var(--color-accent-500)] hover:bg-[var(--color-bg-main)] font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                  Apply Quick Loan
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4" />
                <span>0% processing fee • No hidden charges</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Withdrawals Section */}
        <section className="mb-12">
          <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 max-w-lg mx-auto">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--color-accent-500)]" />
              Recent Transactions
            </h3>
            
            <div className="space-y-4">
              {/* Current Notification */}
              <div key={currentNotificationIndex} className="flex justify-between items-center py-4 border-b border-[#eee]">
                <div>
                  <div className="font-semibold text-lg">{formatPhoneNumber(mockNotifications[currentNotificationIndex].phone)}</div>
                  <div className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {mockNotifications[currentNotificationIndex].location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[var(--color-secondary-600)]">₹{formatCurrency(mockNotifications[currentNotificationIndex].amount)}</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    <div className="font-medium">{mockNotifications[currentNotificationIndex].method}</div>
                    <div>
                      {currentNotificationIndex === 0 ? 'Just now' : 
                       currentNotificationIndex === 1 ? '15 mins ago' :
                       currentNotificationIndex === 2 ? '30 mins ago' :
                       currentNotificationIndex === 3 ? '45 mins ago' :
                       currentNotificationIndex === 4 ? '1 hour ago' :
                       currentNotificationIndex === 5 ? '2 hours ago' :
                       `${currentNotificationIndex} hours ago`}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next two notifications */}
              {[1, 2].map((offset, idx) => {
                const notificationIdx = (currentNotificationIndex + offset) % mockNotifications.length
                return (
                  <div key={`notification-${notificationIdx}`} className="flex justify-between items-center py-3">
                    <div>
                      <div className="font-medium">{formatPhoneNumber(mockNotifications[notificationIdx].phone)}</div>
                      <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {mockNotifications[notificationIdx].location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[var(--color-secondary-600)]">₹{formatCurrency(mockNotifications[notificationIdx].amount)}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        <div>{mockNotifications[notificationIdx].method}</div>
                        <div>{offset === 1 ? 'Recently' : 'Earlier today'}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-surface)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 py-4">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link
            href="/home"
            onClick={() => setActiveNav('home')}
            className={`flex flex-col items-center px-8 py-2 rounded-lg transition-all ${
              activeNav === 'home' 
                ? 'text-[var(--color-accent-500)] bg-[rgba(255,153,51,0.05)]' 
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]'
            }`}
          >
            <Home className={`w-7 h-7 mb-1 transition-transform ${activeNav === 'home' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">HOME</span>
          </Link>

          <Link
            href="/wallet"
            onClick={() => setActiveNav('wallet')}
            className={`flex flex-col items-center px-8 py-2 rounded-lg transition-all ${
              activeNav === 'wallet' 
                ? 'text-[var(--color-accent-500)] bg-[rgba(255,153,51,0.05)]' 
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]'
            }`}
          >
            <Wallet className={`w-7 h-7 mb-1 transition-transform ${activeNav === 'wallet' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">WALLET</span>
          </Link>

          <Link
            href="/my-account"
            onClick={() => setActiveNav('account')}
            className={`flex flex-col items-center px-8 py-2 rounded-lg transition-all ${
              activeNav === 'account' 
                ? 'text-[var(--color-accent-500)] bg-[rgba(255,153,51,0.05)]' 
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)]'
            }`}
          >
            <UserIcon className={`w-7 h-7 mb-1 transition-transform ${activeNav === 'account' ? 'scale-110' : ''}`} />
            <span className="text-xs font-semibold">ACCOUNT</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}