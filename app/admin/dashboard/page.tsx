'use client';

import React from "react"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Calendar,
  Shield,
  Award,
  Briefcase,
  HandCoins,
  UserCheck,
  Banknote,
  PieChart
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import { GOVERNMENT_LOGOS, COMPANY_LOGOS } from '@/lib/constants/company-info';

interface AdminSession {
  id: number;
  role: string;
}

interface DashboardMetrics {
  newUsers: number;
  newApplicants: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingWithdrawals: number;
  totalDeposits: number;
  totalWithdrawn: number;
  dateRange: { start: string; end: string };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Check admin session on mount
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin', {
          method: 'GET',
        });

        if (!response.ok) {
          console.log('[v0] Admin session invalid, redirecting to login');
          router.push('/admin-login');
          return;
        }

        const data = await response.json();
        setAdmin(data.admin);
        console.log('[v0] Admin session valid:', data.admin);
      } catch (err) {
        console.error('[v0] Session check error:', err);
        router.push('/admin-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    // Fetch metrics when dates change
    if (admin) {
      fetchMetrics();
    }
  }, [startDate, endDate, admin]);

  const fetchMetrics = async () => {
    try {
      setIsFetchingMetrics(true);
      setError('');

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_metrics',
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data.metrics);
      console.log('[v0] Metrics fetched:', data.metrics);
    } catch (err) {
      console.error('[v0] Metrics fetch error:', err);
      setError('Failed to load metrics');
    } finally {
      setIsFetchingMetrics(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logout',
        }),
      });

      console.log('[v0] Admin logged out');
      router.push('/admin-login');
    } catch (err) {
      console.error('[v0] Logout error:', err);
      setError('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-main)] via-[var(--color-primary-100)] to-[var(--color-accent-100)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[var(--color-accent-500)] border-t-[var(--color-secondary-600)] rounded-full animate-spin" />
          </div>
          <p className="text-[var(--color-text-primary)] font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const metricCard = (
    label: string,
    value: number | string,
    href: string,
    icon: React.ReactNode,
    bgColor: string,
    iconColor: string
  ) => (
    <Link href={href} className="block group">
      <Card className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] group-hover:border-[var(--color-accent-500)]/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">{label}</p>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${bgColor}`} style={{ color: iconColor }}>
            {icon}
          </div>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-main)] via-[var(--color-primary-100)] to-[var(--color-accent-100)]">
      {/* Header */}
      <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile logo - hidden on desktop since sidebar has it */}
            <div className="w-8 h-8 relative md:hidden">
              <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                <Briefcase className="w-3 h-3" />
                Role: {admin.role}
              </p>
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {/* Government Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-red-50 px-3 py-1.5 rounded-full border border-[var(--color-accent-500)]/20">
              <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
              <span className="text-xs font-medium text-[var(--color-text-primary)]">RBI • MCA • MeitY</span>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {error && (
          <div className="bg-[var(--color-primary-100)] border border-[var(--color-border)] rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-secondary-600)] font-medium">{error}</p>
          </div>
        )}

        {/* Date Range Selector */}
        <Card className="p-6 mb-8 border border-[var(--color-border)] shadow-md bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[var(--color-bg-surface)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Date Range Filter</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
              />
            </div>
            <Button
              onClick={fetchMetrics}
              disabled={isFetchingMetrics}
              className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] text-[var(--color-bg-surface)] px-8 py-2 rounded-lg gap-2"
            >
              {isFetchingMetrics ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--color-bg-surface)] border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <PieChart className="w-4 h-4" />
                  Apply
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Metrics Grid */}
        {metrics && (
          <>
            {/* Row 1 - User Metrics */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[var(--color-accent-500)]" />
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">User & Application Metrics</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCard(
                  'New Users',
                  metrics.newUsers,
                  '/admin/users',
                  <Users className="w-6 h-6" />,
                  'bg-blue-50',
                  'var(--color-accent-500)'
                )}
                {metricCard(
                  'New Applicants',
                  metrics.newApplicants,
                  '/admin/users',
                  <UserCheck className="w-6 h-6" />,
                  'bg-emerald-50',
                  'var(--color-secondary-600)'
                )}
                {metricCard(
                  'Pending Applications',
                  metrics.pendingApplications,
                  '/admin/loans?status=pending',
                  <Clock className="w-6 h-6" />,
                  'bg-[var(--color-accent-100)]',
                  'var(--color-accent-600)'
                )}
                {metricCard(
                  'Approved Applications',
                  metrics.approvedApplications,
                  '/admin/loans?status=approved',
                  <CheckCircle className="w-6 h-6" />,
                  'bg-[var(--color-secondary-100)]',
                  'var(--color-secondary-600)'
                )}
              </div>
            </div>

            {/* Row 2 - Application Status */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[var(--color-secondary-600)]" />
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Application Status</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCard(
                  'Rejected Applications',
                  metrics.rejectedApplications,
                  '/admin/loans?status=rejected',
                  <XCircle className="w-6 h-6" />,
                  'bg-[var(--color-primary-100)]',
                  'var(--color-secondary-600)'
                )}
                {metricCard(
                  'Pending Withdrawals',
                  metrics.pendingWithdrawals,
                  '/admin/withdrawals',
                  <Clock className="w-6 h-6" />,
                  'bg-[var(--color-accent-100)]',
                  'var(--color-accent-600)'
                )}
                {metricCard(
                  'Total Deposits',
                  formatINR(metrics.totalDeposits),
                  '/admin/funds',
                  <Banknote className="w-6 h-6" />,
                  'bg-blue-50',
                  'var(--color-accent-500)'
                )}
                {metricCard(
                  'Total Withdrawn',
                  formatINR(metrics.totalWithdrawn),
                  '/admin/funds',
                  <HandCoins className="w-6 h-6" />,
                  'bg-purple-50',
                  'var(--color-primary-700)'
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-6 border border-[var(--color-accent-500)]/20">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[var(--color-accent-500)]" />
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] hover:bg-[var(--color-primary-100)]">
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/loans">
                  <Button variant="outline" className="w-full border-2 border-[var(--color-secondary-600)] text-[var(--color-secondary-600)] hover:bg-[var(--color-accent-100)]">
                    View Loans
                  </Button>
                </Link>
                <Link href="/admin/funds">
                  <Button variant="outline" className="w-full border-2 border-[var(--color-secondary-600)] text-[var(--color-secondary-600)] hover:bg-[var(--color-secondary-100)]">
                    Manage Funds
                  </Button>
                </Link>
                <Link href="/admin/documents">
                  <Button variant="outline" className="w-full border-2 border-[var(--color-accent-600)] text-[var(--color-accent-600)] hover:bg-[var(--color-accent-100)]">
                    Documents
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!metrics && !isFetchingMetrics && (
          <Card className="p-12 text-center border border-[var(--color-border)]">
            <div className="flex justify-center mb-4">
              <FileText className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-[var(--color-text-secondary)] text-lg mb-2">No data available</p>
            <p className="text-[var(--color-text-secondary)] text-sm">Try adjusting your date range or check back later.</p>
          </Card>
        )}
      </main>
    </div>
  );
}
