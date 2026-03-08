'use client'

import { FileText, Download, ArrowRight, Lock, Share2, Printer, Shield, Award, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GOVERNMENT_LOGOS } from '@/lib/constants/company-info'

export default function DocumentManagementPage() {
  const documents = [
    {
      title: 'Loan Approval Letter',
      description: 'Generate and download professional loan approval letters with company branding and government logos',
      icon: FileText,
      href: '/admin/documents/loan-approval-letter',
      gradient: 'from-[var(--color-accent-500)] to-[var(--color-secondary-600)]',
      color: 'blue-red',
      formats: ['PDF', 'PNG', 'Excel'],
      features: ['RBI/MCA/CIBIL logos', 'Borrower details', 'Loan terms', 'Professional format', 'NRI Loan Department stamp']
    },
    {
      title: 'Loan List Table',
      description: 'Export complete loan records table with applicant information and status tracking',
      icon: FileText,
      href: '/admin/documents/loan-list-table',
      gradient: 'from-[var(--color-secondary-600)] to-[var(--color-accent-500)]',
      color: 'green-blue',
      formats: ['PDF', 'PNG', 'Excel'],
      features: ['All loan records', 'Status badges', 'Filter information', 'Pagination data', 'Color-coded status']
    },
    {
      title: 'Repayment Schedule',
      description: 'Generate detailed monthly repayment schedules with amortization and balance tracking',
      icon: FileText,
      href: '/admin/documents/repayment-schedule',
      gradient: 'from-[var(--color-secondary-600)] to-[var(--color-accent-500)]',
      color: 'red-orange',
      formats: ['PDF', 'PNG', 'Excel'],
      features: ['Monthly breakdown', 'Principal & interest', 'Balance tracking', 'Payment due dates', 'Late fee calculations']
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-bg-main)] to-[var(--color-border)]">
      {/* Header */}
      <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] bg-clip-text text-transparent">
                Document Management
              </span>
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Generate, manage, and export professional financial documents
            </p>
          </div>
          
          {/* Government Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[var(--color-accent-500)]/20">
            <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span className="text-xs font-medium text-[var(--color-text-primary)]">RBI • MCA • CIBIL</span>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-10">
        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {documents.map((doc) => {
            const Icon = doc.icon
            return (
              <div key={doc.title} className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] shadow-md hover:shadow-xl transition-all overflow-hidden group">
                {/* Color Header - Using flag gradients */}
                <div className={`h-2 bg-gradient-to-r ${doc.gradient}`}></div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${doc.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 text-[var(--color-bg-surface)]" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{doc.title}</h2>
                  </div>

                  <p className="text-[var(--color-text-secondary)] text-sm mb-4">{doc.description}</p>

                  {/* Formats */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-1">
                      <Award className="w-3 h-3 text-[var(--color-accent-500)]" />
                      Export Formats:
                    </p>
                    <div className="flex gap-2">
                      {doc.formats.map((fmt) => (
                        <span key={fmt} className="px-2.5 py-1 bg-[var(--color-bg-main)] text-[var(--color-text-primary)] text-xs font-medium rounded border border-[var(--color-border)]">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-[var(--color-secondary-600)]" />
                      Features:
                    </p>
                    <ul className="space-y-1">
                      {doc.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-600)]"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link href={doc.href} className="block">
                    <Button className={`w-full bg-gradient-to-r ${doc.gradient} text-[var(--color-bg-surface)] font-semibold py-2.5 rounded-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2`}>
                      <Download className="w-4 h-4" />
                      Generate & Export
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Government Logos Strip */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 mb-8 border border-[var(--color-accent-500)]/20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.rbi} alt="SEC" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-accent-500)]">RBI Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.mca} alt="BSP" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">MCA Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.cibil} alt="DMW" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">CIBIL Partner</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Section - Redesigned with flag colors */}
        <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-2xl border border-[var(--color-accent-500)]/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[var(--color-accent-500)]" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-[var(--color-bg-surface)] rounded-xl p-4 border-2 border-[var(--color-border)] hover:border-[var(--color-accent-500)] hover:bg-blue-50 transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <Share2 className="w-5 h-5 text-[var(--color-accent-500)] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[var(--color-text-primary)]">Share Document</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">Send documents directly to clients via email</p>
            </button>

            <button className="bg-[var(--color-bg-surface)] rounded-xl p-4 border-2 border-[var(--color-border)] hover:border-[var(--color-secondary-600)] hover:bg-[var(--color-secondary-100)] transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <Printer className="w-5 h-5 text-[var(--color-secondary-600)] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[var(--color-text-primary)]">Print Document</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">Print documents directly from the browser</p>
            </button>

            <button className="bg-[var(--color-bg-surface)] rounded-xl p-4 border-2 border-[var(--color-border)] hover:border-[var(--color-secondary-600)] hover:bg-[var(--color-primary-100)] transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-[var(--color-secondary-600)] group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[var(--color-text-primary)]">Secure Archive</span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">Archive and manage document history securely</p>
            </button>
          </div>
        </div>

        {/* Info Section - Redesigned */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] shadow-md p-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-[var(--color-bg-surface)]" />
            </div>
            Document Generation Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-1">
                <Award className="w-4 h-4 text-[var(--color-accent-500)]" />
                Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex gap-2">
                  <span className="text-[var(--color-secondary-600)] font-bold">✓</span>
                  <span>Always verify borrower information before generating documents</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-secondary-600)] font-bold">✓</span>
                  <span>Use PDF format for archival and legal documentation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-secondary-600)] font-bold">✓</span>
                  <span>Maintain digital copies of all generated documents</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--color-secondary-600)] font-bold">✓</span>
                  <span>Review documents for accuracy before sharing with clients</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-1">
                <Download className="w-4 h-4 text-[var(--color-secondary-600)]" />
                Export Format Recommendations
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li><span className="font-medium text-[var(--color-accent-500)]">PDF:</span> Best for legal documents and archival</li>
                <li><span className="font-medium text-[var(--color-secondary-600)]">PNG:</span> Best for quick previews and sharing on messaging apps</li>
                <li><span className="font-medium text-[var(--color-secondary-600)]">Excel:</span> Best for data analysis and bulk processing</li>
                <li><span className="font-medium text-[var(--color-accent-600)]">Multiple:</span> Generate in all formats for flexibility</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
