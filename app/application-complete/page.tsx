'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  CheckCircle, 
  Phone, 
  Home,
  FileText,
  Shield,
  Mail,
  Copy,
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatIndianCurrency } from '@/config/currency'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

interface ApplicationDetails {
  id: string
  document_number: string
  amount_requested: number
  loan_term_months: number
  submitted_at: string
  user_email: string
  user_phone: string
  purpose: string
}

export default function ApplicationCompletePage() {
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch('/api/loans?action=get_user_application')
        if (response.ok) {
          const data = await response.json()
          if (data.application) {
            setApplication(data.application)
          } else {
            router.push('/loan-application')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching application:', error)
        toast.error('Failed to load application details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplication()
  }, [router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Document number copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--color-accent-500)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading your application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Application Not Found</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              We couldn't find your loan application. Please start a new application.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] font-semibold py-3 rounded-xl"
              onClick={() => router.push('/loan-application')}
            >
              Apply for a Loan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)]">
      {/* Simple Header - Only Logo on Left */}
      <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 relative">
              <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-[var(--color-accent-500)]">EASY</span>
              <span className="text-[var(--color-secondary-600)]">LOAN</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content - Clean and Simple */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Icon - Updated to Saffron-to-Green Gradient */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 text-[var(--color-bg-surface)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Application Submitted!</h1>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
            Your loan application has been successfully submitted and is now being processed.
          </p>
        </div>

        {/* Loan Summary Card */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 mb-8 border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Application Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-bg-main)] p-3 rounded-lg">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Loan Amount</p>
              <p className="text-lg font-bold text-[var(--color-accent-500)]">{formatIndianCurrency(application.amount_requested)}</p>
            </div>
            <div className="bg-[var(--color-bg-main)] p-3 rounded-lg">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Loan Term</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{application.loan_term_months} months</p>
            </div>
          </div>
        </div>

        {/* Document Number Card */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 mb-8 text-center border border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">Document Number</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xl font-mono font-bold text-[var(--color-accent-500)]">{application.document_number}</p>
            <button
              onClick={() => copyToClipboard(application.document_number)}
              className="p-2 hover:bg-[var(--color-bg-main)] rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <Copy className={`w-4 h-4 ${copied ? 'text-[var(--color-secondary-600)]' : 'text-[var(--color-text-secondary)]'}`} />
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">Keep this number for reference</p>
        </div>

        {/* Next Steps - Clean List */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-6 mb-8 border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-accent-500)]">1</span>
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Document Verification</p>
                <p className="text-sm text-[var(--color-text-secondary)]">We'll verify your Aadhaar/PAN and KYC documents within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-accent-500)]">2</span>
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">CIBIL Check & Assessment</p>
                <p className="text-sm text-[var(--color-text-secondary)]">Our team will evaluate your application and credit score</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-accent-500)]">3</span>
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Final Decision</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  You'll receive an SMS and email confirmation of your loan status within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information for NRIs */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-6 mb-8 border border-[var(--color-accent-500)]/20">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">For NRI Applicants</h2>
          <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)] mt-0.5 flex-shrink-0" />
              <span>Funds will be disbursed to your NRE/NRO account upon approval</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)] mt-0.5 flex-shrink-0" />
              <span>You'll receive repayment reminders via email and SMS</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--color-secondary-600)] mt-0.5 flex-shrink-0" />
              <span>EMI will be auto-debited through NACH/UPI mandate</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons - Home, Wallet, Contact Support */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          <Link href="/home" className="w-full sm:w-auto sm:flex-1 max-w-xs">
            <Button 
              className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Link href="/wallet" className="w-full sm:w-auto sm:flex-1 max-w-xs">
            <Button 
              className="w-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Go to Wallet
            </Button>
          </Link>
          <Link href="/my-account/support" className="w-full sm:w-auto sm:flex-1 max-w-xs">
            <Button 
              variant="outline" 
              className="w-full border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] hover:bg-[var(--color-accent-100)] font-semibold py-3 rounded-xl bg-transparent"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </Link>
        </div>

        {/* Simple Footer Note */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              RBI Regd: {COMPANY_INFO.rbiRegistrationNo}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {COMPANY_INFO.contact.email}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-4">
            © 2024 {COMPANY_INFO.name}. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}