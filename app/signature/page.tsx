'use client'

import React from "react"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RotateCcw, FileText, CheckCircle, AlertCircle, Loader2, Shield, PenSquare, X, Pen } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { LoanApplication as BaseLoanApp } from '@/lib/application-progress';
type LoanApplication = BaseLoanApp & { signature_url?: string };
import { CURRENCY_CONFIG, formatIndianCurrency, calculateEMI } from '@/config/currency'
import { generateFullContract, DEFAULT_CONTRACT_TEMPLATE } from '@/lib/contract-generator'
import Image from 'next/image'
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info'

interface User {
  id: number
  phone_number: string
  full_name: string
  id_card_number?: string
  pan_number?: string
  aadhaar_number?: string
}

interface PersonalInfo {
  full_name?: string
  id_card_number?: string
  phone_number?: string
  living_address?: string
  email?: string
  monthly_income?: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

interface ContractData {
  amount: number
  term: number
  monthlyPayment: number
  interestRate: number
}

export default function SignaturePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showContract, setShowContract] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [contractFullText, setContractFullText] = useState('')
  const [contractHeader, setContractHeader] = useState<any>(null)
  const [error, setError] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const fetchUserAndApplication = async () => {
      try {
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          router.push('/login')
          return
        }
        const userData = await userResponse.json()
        setUser(userData.user)

        const appResponse = await fetch('/api/loans?action=get_user_application')
        if (appResponse.ok) {
          const appData = await appResponse.json()
          if (appData.application) {
            // Check if already signed
            if (appData.application.is_signed || appData.application.signature_url) {
              console.log('[v0] Application already signed, redirecting...');
              router.push('/application-complete');
              return;
            }
            
            setApplication(appData.application)
            
            // Get personal information for contract (use response directly so ID number is available for contract header)
            let personalData: { info?: { full_name?: string; id_card_number?: string; living_address?: string } } = {}
            const personalInfoResponse = await fetch('/api/account/personal-info')
            if (personalInfoResponse.ok) {
              personalData = await personalInfoResponse.json()
              setPersonalInfo(personalData.info || personalData)
            }
            
            const interestRate = appData.application.interest_rate ?? 0.005 // 0.5% per month
            const monthlyPayment = calculateEMI(
              appData.application.amount_requested,
              appData.application.loan_term_months,
              interestRate
            )
            
            setContractData({
              amount: appData.application.amount_requested,
              term: appData.application.loan_term_months,
              monthlyPayment,
              interestRate: interestRate * 100, // Store as percentage for display (0.5)
            })
            
            const info = personalData?.info || (personalData as any)
            const borrowerName = info?.full_name || userData.user?.full_name || 'Borrower'
            const borrowerId = info?.id_card_number || userData.user?.id_card_number || ''
            const borrowerPhone = userData.user?.phone_number || ''
            const borrowerAddress = info?.living_address || ''
            
            const contractGenerated = generateFullContract({
              borrower_name: borrowerName,
              id_number: borrowerId,
              phone_number: borrowerPhone,
              loan_amount: appData.application.amount_requested,
              interest_rate: interestRate,
              loan_period_months: appData.application.loan_term_months,
              bank_name: userData.user?.bank_details?.bankName || 'Local Payment method',
            })
            
            setContractFullText(contractGenerated.full_document)
            setContractHeader(contractGenerated.header)
            console.log('[v0] Contract generated with header:', contractGenerated.header)
          } else {
            router.push('/loan-application')
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndApplication()
  }, [router])

  // Initialize canvas with touch support
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up high-resolution canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#e9ecef'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsSigning(true)
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!touch) return

    setIsSigning(true)
    setIsDrawing(true)
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    setTouchPosition({ x, y })
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const touch = e.touches[0]
    if (!touch) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
    setTouchPosition({ x, y })
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)
    setTouchPosition(null)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const resetSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#e9ecef'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    setIsSigning(false)
    setError('')
  }

const compressSignature = (canvas: HTMLCanvasElement): string => {
  // Create a temporary canvas for resizing
  const resizedCanvas = document.createElement('canvas')
  const ctx = resizedCanvas.getContext('2d')
  
  if (!ctx) return canvas.toDataURL('image/png')
  
  // Resize to max 300px width while maintaining aspect ratio
  const maxWidth = 300
  const scale = maxWidth / canvas.width
  resizedCanvas.width = maxWidth
  resizedCanvas.height = canvas.height * scale
  
  // Draw with white background and smooth lines
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height)
  ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height)
  
  // Use PNG for signatures (preserves sharp lines)
  const compressedData = resizedCanvas.toDataURL('image/png')
  
  console.log('[v0] Original signature size:', Math.round(canvas.toDataURL('image/png').length / 1024), 'KB')
  console.log('[v0] Compressed signature size:', Math.round(compressedData.length / 1024), 'KB')
  
  return compressedData
}

  const handleConfirmSignature = async () => {
    if (!isSigning) {
      setError('Please sign the document')
      return
    }

    if (!application) {
      setError('Application not found')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const canvas = canvasRef.current
      if (!canvas) {
        setError('Signature canvas not found')
        setIsSubmitting(false)
        return
      }

      // Compress the signature to reduce size
      const signatureData = compressSignature(canvas)

      // Submit signature via the dedicated update-signature endpoint
      const response = await fetch('/api/loans/update-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          signatureUrl: signatureData,
          isSigned: true,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[v0] Signature update failed:', responseData)
        setError(responseData.error || 'Failed to sign application')
        setIsSubmitting(false)
        return
      }

      console.log('[v0] Signature saved successfully:', responseData)

      // Mark signature as completed via API
      await fetch('/api/users/mark-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'signature',
        }),
      }).catch((err) => console.error('Error marking signature verification:', err))

      // Navigate to application-complete page
      router.push('/application-complete')
    } catch (err) {
      console.error('Sign error:', err)
      setError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#6C757D]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !application || !contractData) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return formatIndianCurrency(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7fa] to-[#e9ecef] pb-8">
      {/* Header */}
      <header className="bg-white border-b border-[#e9ecef] shadow-[0_4px_12px_rgba(0,0,0,0.08)] sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/personal-information"
              className="flex items-center gap-2 text-[#FF9933] hover:text-[#e68a2e] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-lg font-black tracking-tight">
                    <span className="text-[#FF9933]">EASY</span>
                    <span className="text-[#138808]">LOAN</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">Sign Agreement</p>
              </div>
            </div>
          </div>
          
          {/* Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-[#FF9933]" />
            <span className="text-xs font-medium text-[#FF9933]">RBI Regd NBFC</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
            <span className="bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent">
              Sign Your Loan Agreement
            </span>
          </h1>
          <p className="text-[#6C757D]">Review and sign to complete your application</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-2 bg-[#FF9933] rounded-full"></div>
          <div className="w-6 h-2 bg-[#FF9933] rounded-full"></div>
          <div className="w-6 h-2 bg-[#FF9933] rounded-full"></div>
          <div className="w-6 h-2 bg-[#FF9933] rounded-full"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Professional Contract Card */}
        <div className="bg-white border-2 border-[#e9ecef] rounded-2xl p-6 shadow-lg mb-6 font-serif">
          {/* Contract Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-[#FF9933]/20">
            <h2 className="text-xl md:text-2xl font-bold text-[#FF9933]">LOAN AGREEMENT</h2>
            <p className="text-xs text-gray-500 mt-1">Document No: {application?.document_number} • RBI Regd NBFC</p>
          </div>

          {/* Loan Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-green-50 border border-[#FF9933]/20 rounded-xl p-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Loan Amount</p>
                <p className="text-lg font-bold text-[#FF9933]">{formatCurrency(contractData.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Loan Term</p>
                <p className="text-lg font-bold text-[#212529]">{contractData.term} months</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Monthly EMI</p>
                <p className="text-lg font-bold text-[#138808]">{formatCurrency(contractData.monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="text-lg font-bold text-[#212529]">{contractData.interestRate.toFixed(1)}% per month</p>
              </div>
            </div>
          </div>

          {/* View Full Contract Button */}
          <Button
            onClick={() => setShowContract(true)}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-6"
          >
            <FileText className="w-5 h-5 mr-2" />
            View Loan Contract (10 Articles)
          </Button>

          {/* Signature Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-full flex items-center justify-center">
                <Pen className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#212529]">Borrower's Signature</h3>
            </div>
            
            <div className="border-2 border-[#e9ecef] rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="w-full h-48 touch-none cursor-crosshair"
              />
            </div>
            <p className="text-sm text-[#6C757D] text-center">Draw your signature above using your finger or mouse</p>
          </div>

          {/* Reset Button */}
          <Button
            onClick={resetSignature}
            className="w-full border-2 border-[#e9ecef] hover:border-[#FF9933] text-[#212529] hover:text-[#FF9933] bg-white hover:bg-[#f8f9fa] font-medium py-3 rounded-xl transition-all duration-300 mb-4"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset Signature
          </Button>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmSignature}
            disabled={isSubmitting || !isSigning}
            className="w-full bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Signature & Submit
              </>
            )}
          </Button>

          {/* Legal Notice */}
          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded-xl p-4 mt-6">
            <p className="text-xs text-[#6C757D] text-center">
              <strong>Important:</strong> By signing above, you agree to all terms and conditions outlined in the 10-article loan agreement. This electronic signature is legally binding under the Indian IT Act, 2000.
            </p>
          </div>
        </div>
      </main>

      {/* Contract Modal - Professional Indian Loan Contract Design */}
      {showContract && contractFullText && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-hidden">
            
            {/* Modal Header with X button */}
            <div className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white px-3 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 relative">
              {/* X Close Button - Always visible */}
              <button
                onClick={() => setShowContract(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 sm:p-1.5 transition-colors z-20"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 pr-8">
                {/* Logo and Title Section */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  {/* Company Logo - Digital India Logo */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 p-1 sm:p-1.5 md:p-2 rounded-lg backdrop-blur-sm flex-shrink-0">
                    <img 
                      src={COMPANY_LOGOS.main} 
                      alt="EasyLoan Logo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                      LOAN AGREEMENT
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm mt-0.5 truncate">
                      {COMPANY_INFO.name} • RBI Regd • CIBIL Partner
                    </p>
                  </div>
                </div>
                
                {/* Document Number - Full document number */}
                <div className="flex items-center justify-start sm:justify-end">
                  <div className="bg-white/10 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2">
                    <p className="text-[10px] sm:text-xs font-medium text-white/80">Document No.</p>
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg font-mono font-bold text-white break-all">
                      {application?.document_number || contractHeader?.document_number || 'LOAN-XXXXXX'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(98vh-140px)] sm:max-h-[calc(95vh-160px)] md:max-h-[calc(90vh-180px)] bg-[#fafafa]">
              
              {/* Watermarked Background */}
              <div className="relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                  <img 
                    src={COMPANY_LOGOS.main} 
                    alt="EasyLoan Watermark" 
                    className="w-48 sm:w-56 md:w-64 lg:w-80 xl:w-96 h-auto opacity-20"
                  />
                </div>
                
                <div className="relative space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 font-serif text-gray-800 text-xs sm:text-sm md:text-base">
                  
                  {/* Contract Header - Lender and Borrower */}
                  {contractHeader && (
                    <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#FF9933] mb-2 sm:mb-3 md:mb-4 pb-1 sm:pb-2 border-b border-gray-200">
                        PARTIES TO THIS AGREEMENT
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 md:gap-8">
                        {/* Lender Section */}
                        <div className="space-y-1 flex-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">LENDER</p>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">{COMPANY_INFO.name}</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">{COMPANY_INFO.registeredOffice.address}</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">{COMPANY_INFO.registeredOffice.area}</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">{COMPANY_INFO.registeredOffice.city}, {COMPANY_INFO.registeredOffice.state} - {COMPANY_INFO.registeredOffice.pincode}</p>
                          
                          {/* Regulatory Logos */}
                          <div className="flex gap-1 sm:gap-1.5 md:gap-2 mt-2 sm:mt-3 md:mt-4 flex-wrap">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.rbi} alt="RBI" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.mca} alt="MCA" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" className="w-full h-full object-contain" />
                            </div>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">
                              <img src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" className="w-full h-full object-contain" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Borrower Section */}
                        <div className="space-y-1 flex-1 text-left sm:text-right">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">BORROWER</p>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base break-words">
                            {contractHeader.borrower_name}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">
                            ID: {user?.id_card_number || personalInfo?.id_card_number || contractHeader?.id_number || 'N/A'}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">
                            Phone: {contractHeader.phone_number}
                          </p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 break-words">
                            Address: {contractHeader.address || personalInfo?.living_address || ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loan Terms Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-green-50 border border-[#FF9933]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#FF9933] mb-2 sm:mb-3 md:mb-4">
                      LOAN TERMS SUMMARY
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Principal Amount:</span>
                        <span className="text-sm font-bold text-[#FF9933]">{contractHeader?.loan_amount}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Interest Rate:</span>
                        <span className="text-sm font-bold">{contractHeader?.interest_rate} per month</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Loan Term:</span>
                        <span className="text-sm font-bold">{contractHeader?.loan_period}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 sm:border-0">
                        <span className="text-xs font-medium text-gray-600">Monthly EMI:</span>
                        <span className="text-sm font-bold text-[#138808]">{formatCurrency(contractData?.monthlyPayment || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 sm:col-span-2">
                        <span className="text-xs font-medium text-gray-600">Total Repayment:</span>
                        <span className="text-sm font-bold text-[#138808]">
                          {formatCurrency((contractData?.monthlyPayment || 0) * (contractData?.term || 1))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contract Articles - Professional Legal Format */}
                  <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#FF9933] mb-3 sm:mb-4 md:mb-5 lg:mb-6 pb-1 sm:pb-2 border-b border-gray-200">
                      TERMS AND CONDITIONS
                    </h3>
                    
                    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                      {/* Article 1 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 1: LOAN FORM</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          The Borrower agrees to obtain an unsecured loan from the Lender by submitting valid KYC documents (Aadhaar/PAN) and completing the online application process. The loan shall be disbursed directly to the Borrower's designated NRE/NRO bank account or UPI ID upon approval.
                        </p>
                      </div>

                      {/* Article 2 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 2: INTEREST RATE AND CHARGES</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          The loan shall bear interest at the rate specified in the Loan Terms Summary above. All interest rates, late payment fees, service charges, or any other fees combined shall not exceed the maximum rate as prescribed by RBI guidelines. No processing fee is charged.
                        </p>
                      </div>

                      {/* Article 3 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 3: BORROWER'S OBLIGATIONS</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed mb-1 sm:mb-2">
                          During the loan term, the Borrower agrees to:
                        </p>
                        <ul className="list-disc ml-4 sm:ml-5 md:ml-6 lg:ml-8 text-[11px] sm:text-xs md:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                          <li>Pay all interest and principal amounts when due as specified in the repayment schedule.</li>
                          <li>Make timely payments of the monthly EMI without fail through NACH/UPI AutoPay.</li>
                          <li>Notify the Lender immediately of any circumstances that may affect the ability to repay.</li>
                          <li>Cooperate with the Lender to restructure the loan if necessary due to financial hardship as per RBI guidelines.</li>
                          <li>Comply with all terms and conditions set forth in this Agreement.</li>
                        </ul>
                      </div>

                      {/* Article 4 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 4: LOAN TERMS AND CONDITIONS</h4>
                        <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[11px] sm:text-xs md:text-sm text-gray-700">
                          <p>(1) The Borrower acknowledges that this is an unsecured loan and the Lender assumes credit risk. The Borrower must demonstrate financial capacity to repay through verification of income and CIBIL score.</p>
                          <p>(2) The Borrower must provide accurate and complete financial information to enable the Lender to assess creditworthiness. Any misrepresentation may result in immediate loan recall.</p>
                          <p>(3) Upon execution of this Agreement, both parties are bound by all terms herein. Breach by either party may result in legal action under the Indian Contract Act, 1872.</p>
                          <p>(4) The Lender shall disburse funds promptly upon satisfaction of all conditions precedent as per RBI guidelines.</p>
                          <p>(5) Early repayment of the loan is permitted without penalty as per RBI Fair Practices Code.</p>
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-2.5 md:p-3 lg:p-4 mt-2 sm:mt-2.5 md:mt-3">
                            <p className="text-yellow-800 font-semibold text-[11px] sm:text-xs md:text-sm">(6) Late payments shall incur a penalty interest as per RBI guidelines on overdue amounts, calculated after a three-day grace period from the due date.</p>
                          </div>
                        </div>
                      </div>

                      {/* Article 5 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 5: LENDER'S RIGHTS</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed mb-1 sm:mb-2">The Lender reserves the right to evaluate and verify:</p>
                        <ul className="list-disc ml-4 sm:ml-5 md:ml-6 lg:ml-8 text-[11px] sm:text-xs md:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                          <li>The Borrower's legal capacity to enter into this Agreement.</li>
                          <li>Payment of any applicable fees or charges related to the loan.</li>
                          <li>Compliance with all loan conditions precedent to disbursement.</li>
                          <li>Material adverse changes in the Borrower's financial condition.</li>
                          <li>CIBIL score and credit history.</li>
                        </ul>
                      </div>

                      {/* Article 6 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 6: USE OF PROCEEDS AND REPAYMENT</h4>
                        <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[11px] sm:text-xs md:text-sm text-gray-700">
                          <p>(1) The Borrower shall not use loan proceeds for illegal activities. Violation of this provision shall entitle the Lender to demand immediate full repayment and pursue legal remedies.</p>
                          <p>(2) The Borrower must repay principal and interest according to the schedule. For amounts past due, the Lender may assess a late payment fee as per RBI guidelines.</p>
                        </div>
                      </div>

                      {/* Article 7 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 7: AMENDMENT OR TERMINATION</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          No modification or termination of this Agreement shall be effective without the written consent of both parties. Should either party seek to amend or terminate, written notice must be provided at least thirty (30) days in advance.
                        </p>
                      </div>

                      {/* Article 8 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 8: DISPUTE RESOLUTION</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          The parties agree to first attempt resolution of any dispute through good faith negotiations. If negotiations fail, the dispute shall be brought before the proper courts of Mumbai, to the exclusion of other venues, as per the Indian Arbitration and Conciliation Act.
                        </p>
                      </div>

                      {/* Article 9 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 9: FORCE MAJEURE</h4>
                        <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[11px] sm:text-xs md:text-sm text-gray-700">
                          <p>Neither party shall be liable for failure to perform obligations due to events beyond reasonable control, including but not limited to natural disasters, pandemics, government actions, or telecommunications failures. However, the Borrower remains obligated to repay the loan. In case of genuine hardship due to force majeure, the Lender may consider restructuring options as per RBI guidelines.</p>
                          <p>The Borrower acknowledges that providing false information or fraudulent documents constitutes fraud and may result in criminal prosecution and civil liability under Indian law.</p>
                        </div>
                      </div>

                      {/* Article 10 */}
                      <div className="pl-2 sm:pl-3 md:pl-4 border-l-2 sm:border-l-3 md:border-l-4 border-[#FF9933]">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">ARTICLE 10: EFFECTIVITY</h4>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                          This Agreement shall take effect on the date of electronic or manual signing by both parties. This Agreement may be executed in counterparts, each of which shall be deemed an original. Electronic signatures shall have the same legal force and effect as handwritten signatures under the Indian IT Act, 2000. The parties acknowledge receipt of a copy of this Agreement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm mt-4 sm:mt-5 md:mt-6 lg:mt-8">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#FF9933] mb-3 sm:mb-4 md:mb-5 lg:mb-6 pb-1 sm:pb-2 border-b border-gray-200">
                      SIGNATURE PAGE
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-8 md:gap-12">
                      {/* Borrower Signature */}
                      <div className="flex-1">
                        <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-2 sm:mb-3 md:mb-4">BORROWER'S SIGNATURE</p>
                        
                        <div className="mb-2 sm:mb-3 md:mb-4" style={{ minHeight: '60px' }}>
                          {application?.signature_url ? (
                            <img 
                              src={application.signature_url} 
                              alt="Borrower Signature" 
                              className="max-w-full max-h-[50px] sm:max-h-[60px] md:max-h-[70px] lg:max-h-[80px] object-contain" 
                            />
                          ) : (
                            <p className="text-gray-400 text-[10px] sm:text-xs italic">(To be signed above)</p>
                          )}
                        </div>
                        
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 break-words">Printed Name: {contractHeader?.borrower_name}</p>
                        <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">
                          Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>

                      {/* Lender Signature - Fixed stamp overlay covering entire section */}
                      <div className="flex-1 relative">
                        {/* Stamp overlay - positioned to cover everything */}
                        <div className="absolute -top-2 -left-2 right-0 bottom-0 z-20 pointer-events-none flex items-start justify-start">
                          <img 
                            src="/logos/company-stamp.png" 
                            alt="Company Stamp" 
                            className="w-40 sm:w-44 md:w-48 h-auto opacity-70 object-contain" 
                          />
                        </div>
                        
                        {/* Content that will be stamped over */}
                        <div className="relative z-10">
                          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-2 sm:mb-3 md:mb-4">LENDER'S SIGNATURE</p>
                          
                          <div className="space-y-1">
                            <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">Printed Name: {COMPANY_INFO.keyPersonnel.ceo.name}</p>
                            <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">Title: {COMPANY_INFO.keyPersonnel.ceo.designation}</p>
                            <p className="text-[11px] sm:text-xs md:text-sm text-gray-700">
                              Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-5 md:mt-6 text-center text-[10px] sm:text-xs text-gray-500 border-t border-gray-200 pt-3 sm:pt-4">
                      <p className="px-2 break-words">
                        This document was generated electronically and is legally binding. {COMPANY_INFO.name} is an RBI Registered NBFC (Reg No: {COMPANY_INFO.rbiRegistrationNo}) and CIBIL Partner.
                      </p>
                    </div>
                  </div>

                  {/* Borrower's Declaration */}
                  <div className="bg-gradient-to-r from-orange-50 to-green-50 border border-[#FF9933]/20 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-[11px] sm:text-xs md:text-sm text-[#212529] italic font-medium break-words">
                      "I have read, understood, and agree to all terms and conditions of this Loan Agreement. I confirm that all information provided is true and correct."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Sign and Continue buttons - Hidden on mobile, visible on desktop */}
            <div className="bg-gray-50 px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-4 border-t border-gray-200 hidden sm:flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowContract(false)}
                className="bg-white border-2 border-[#FF9933] text-[#FF9933] hover:bg-orange-50 font-semibold px-4 py-2 sm:px-5 sm:py-2 md:px-6 md:py-2 text-xs sm:text-sm md:text-base rounded-lg transition-colors w-full sm:w-auto order-2 sm:order-1"
              >
                Back to Contract
              </button>
              <button
                onClick={() => {
                  setShowContract(false);
                  // Scroll to signature section
                  setTimeout(() => {
                    document.querySelector('.signature-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white font-semibold px-6 py-2 sm:px-8 sm:py-2 md:px-10 md:py-2 text-xs sm:text-sm md:text-base rounded-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto order-1 sm:order-2"
              >
                Sign Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#212529] font-medium">Processing your signature...</p>
          </div>
        </div>
      )}
    </div>
  )
}