import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] p-6">
      <div className="max-w-4xl mx-auto bg-[var(--color-bg-surface)] rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="text-[var(--color-primary-700)] hover:underline">← Back to Home</Link>
          <h1 className="text-3xl font-bold mt-4 text-gray-900">Contact Support</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-[var(--color-text-secondary)]">Contact page coming soon. For support, please use the in-app messaging.</p>
        </div>
      </div>
    </div>
  )
}
