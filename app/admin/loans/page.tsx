'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
  X,
  Trash2,
  Eye,
  Edit,
  FileText,
  CheckCircle,
  UserCheck,
  Filter,
  Calendar,
  RefreshCw,
  DollarSign,
  Percent,
  Clock,
  Shield,
  Users,
  Briefcase
} from 'lucide-react';
import { ReviewModal } from '@/components/review-loan-modal';
import { ModifyLoanModal } from '@/components/modify-loan-modal';
import { ViewContractModal } from '@/components/view-contract-modal';
import { formatINR } from '@/lib/currency';
import { CheckingDataModal } from '@/components/checking-data-modal';
import { GOVERNMENT_LOGOS, COMPANY_LOGOS } from '@/lib/constants/company-info';

interface Loan {
  id: string;
  order_number: string;
  borrower_name: string;
  borrower_phone: string;
  loan_amount: number;
  interest_rate: number;
  loan_period_months: number;
  status: string;
  status_color: string;
  created_at: string;
  user_id: number;
  loan_application_id?: number; // Add this field
  contractId?: string;
}

interface ApiResponse {
  success: boolean;
  data: Loan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const QUICK_DATE_RANGES = {
  today: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      start: today,
      end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    };
  },
  yesterday: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return {
      start: yesterday,
      end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
    };
  },
  week: () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end: today };
  },
};

export default function AdminLoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showCheckingDataModal, setShowCheckingDataModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin', { method: 'GET' });
        if (!response.ok) {
          router.push('/admin-login');
          return;
        }
        setIsLoading(false);
      } catch (err) {
        console.error('[v0] Session check error:', err);
        router.push('/admin-login');
      }
    };
    checkSession();
  }, [router]);

  // Fetch loans
  useEffect(() => {
    if (isLoading) return;

    const fetchLoans = async () => {
      try {
        setIsFetching(true);
        setError('');

        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('page', page.toString());
        params.append('limit', pageSize.toString());

        const response = await fetch(`/api/admin/loans?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch loans');
        }

        const data: ApiResponse = await response.json();

        if (data.success) {
          setLoans(data.data);
          setTotalLoans(data.pagination.total);
          setTotalPages(data.pagination.pages);
        } else {
          throw new Error('Failed to fetch loans');
        }
      } catch (err) {
        console.error('[v0] Fetch loans error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load loans');
      } finally {
        setIsFetching(false);
      }
    };

    fetchLoans();
  }, [isLoading, page, searchTerm, startDate, endDate, pageSize]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return { date: `${day}/${month}/${year}`, time: `${hours}:${minutes}` };
  };

  const applyQuickDateRange = (range: keyof typeof QUICK_DATE_RANGES) => {
    const dates = QUICK_DATE_RANGES[range]();
    setStartDate(dates.start.toISOString().split('T')[0]);
    setEndDate(dates.end.toISOString().split('T')[0]);
    setPage(1);
  };

  const fetchLoanDetails = async (loanId: string) => {
    try {
      const response = await fetch(`/api/admin/loans/${loanId}`);
      if (response.ok) {
        const data = await response.json();
        return data.loan?.loan_application_id;
      }
    } catch (err) {
      console.error('[v0] Error fetching loan details:', err);
    }
    return null;
  };

  const handleAction = async (loan: Loan, action: string) => {
    if (action === 'contract') {
      // For contract, try to get the loan_application_id
      let appId = loan.loan_application_id;

      // If not available in the loan object, fetch it
      if (!appId) {
        appId = await fetchLoanDetails(loan.id);
      }

      // Use appId if found, otherwise fallback to loan.id
      const contractAppId = appId || loan.id;

      setSelectedLoan({
        ...loan,
        contractId: `app_${contractAppId}` // Use app_ prefix for loan_applications
      });
      setShowContractModal(true);
    } else {
      setSelectedLoan(loan);

      if (action === 'review') setShowReviewModal(true);
      if (action === 'modify') setShowModifyModal(true);
      if (action === 'checking') setShowCheckingDataModal(true);
      if (action === 'delete') setShowDeleteConfirm(true);
    }
  };

  const handleSaveReview = async (data: any) => {
    if (!selectedLoan) return;

    try {
      console.log('[v0] Saving review for loan:', selectedLoan.id, 'with data:', data);
      const response = await fetch(`/api/admin/loans/${selectedLoan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('[v0] Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update loan status');
      }

      setSuccess('Loan status updated successfully');
      setShowReviewModal(false);

      // Refresh data without page reload for immediate update
      setTimeout(() => {
        setLoans(loans.map(loan =>
          loan.id === selectedLoan.id
            ? { ...loan, ...data }
            : loan
        ));
        setSelectedLoan(null);
      }, 500);
    } catch (err) {
      console.error('[v0] Error saving review:', err);
      setError(err instanceof Error ? err.message : 'Failed to update loan');
    }
  };

  const handleSaveModify = async (data: any) => {
    if (!selectedLoan) return;

    try {
      console.log('[v0] Saving modify for loan:', selectedLoan.id, 'with data:', data);
      const response = await fetch(`/api/admin/loans/${selectedLoan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('[v0] Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to modify loan');
      }

      setSuccess('Loan modified successfully');
      setShowModifyModal(false);

      // Refresh data without page reload for immediate update
      setTimeout(() => {
        setLoans(loans.map(loan =>
          loan.id === selectedLoan.id
            ? { ...loan, ...data }
            : loan
        ));
        setSelectedLoan(null);
      }, 500);
    } catch (err) {
      console.error('[v0] Error saving modify:', err);
      setError(err instanceof Error ? err.message : 'Failed to modify loan');
    }
  };

  const handleDelete = async () => {
    if (!selectedLoan) return;

    try {
      setDeleting(true);
      setError('');

      console.log('[v0] Deleting loan:', selectedLoan.id);
      const response = await fetch(`/api/admin/loans/${selectedLoan.id}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();
      console.log('[v0] Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete loan');
      }

      setSuccess('Loan deleted successfully');
      setShowDeleteConfirm(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('[v0] Error deleting:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete loan');
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--color-text-secondary)]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header - same structure as Deposit Management */}
      <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-primary-900)]">Loan Management</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {totalLoans > 0
                    ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, totalLoans)} of ${totalLoans} loans`
                    : 'No loans found'}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-50 to-green-50 px-3 py-1.5 rounded-full border border-[var(--color-accent-500)]/20">
            <Shield className="w-4 h-4 text-[var(--color-accent-500)]" />
            <span className="text-xs font-medium text-[var(--color-text-primary)]">RBI • MCA • CIBIL</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {error && (
          <div className="bg-[var(--color-primary-100)] border border-[var(--color-border)] rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-primary-900)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-[var(--color-secondary-100)] border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-[var(--color-secondary-600)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-secondary-600)] font-medium">{success}</p>
          </div>
        )}

        {/* Filter Card */}
        <Card className="p-6 mb-8 border border-[var(--color-border)] shadow-md bg-[var(--color-bg-surface)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-[var(--color-bg-surface)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Filter Loans</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4 text-[var(--color-accent-500)]" />
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    placeholder="Document number, name, or phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[var(--color-accent-500)]" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[var(--color-secondary-600)]" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-500)]" onClick={() => applyQuickDateRange('today')}>
                Today
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-500)]" onClick={() => applyQuickDateRange('yesterday')}>
                Yesterday
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-500)]" onClick={() => applyQuickDateRange('week')}>
                This Week
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-secondary-500)] gap-1"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
              <Button
                size="sm"
                className="border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] bg-[var(--color-bg-surface)] hover:bg-blue-50"
                onClick={() => {
                  setSearchTerm('');
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Loans Table */}
        <div className="border border-[var(--color-border)] shadow-md bg-[var(--color-bg-surface)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[var(--color-accent-500)]/10 to-[var(--color-secondary-600)]/10 border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">No.</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">Document Number</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">Loan Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">Interest Rate</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">Creation Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)]">Operations</th>
                </tr>
              </thead>
              <tbody>
                {isFetching && loans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-[var(--color-accent-500)] border-t-[var(--color-secondary-600)] rounded-full animate-spin" />
                        <span className="text-[var(--color-text-secondary)]">Loading loans...</span>
                      </div>
                    </td>
                  </tr>
                ) : loans.length > 0 ? (
                  loans.map((loan, index) => {
                    const { date, time } = formatDate(loan.created_at);
                    return (
                      <tr key={loan.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-accent-100)]/30 transition-colors">
                        <td className="px-4 py-4 text-[var(--color-text-primary)]">{(page - 1) * pageSize + index + 1}</td>
                        <td className="px-4 py-4 text-[var(--color-text-primary)] font-medium">{loan.order_number}</td>
                        <td className="px-4 py-4">
                          <div className="text-[var(--color-text-primary)] font-medium">{loan.borrower_name}</div>
                          <div className="text-xs text-[var(--color-text-secondary)]">{loan.borrower_phone}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-[var(--color-accent-500)]" />
                            <span className="text-[var(--color-text-primary)] font-medium">{formatINR(loan.loan_amount)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Percent className="w-3 h-3 text-[var(--color-secondary-600)]" />
                            <span className="text-[var(--color-text-primary)]">{(Number(loan.interest_rate) * 100).toFixed(2)}%</span>
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">{loan.loan_period_months} months</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[var(--color-text-primary)]">{date}</div>
                          <div className="text-xs text-[var(--color-text-secondary)]">{time}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium text-[var(--color-bg-surface)] inline-block"
                            style={{ backgroundColor: loan.status_color }}
                          >
                            {loan.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5 min-w-[320px]">
                            <button
                              onClick={() => handleAction(loan, 'review')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[var(--color-accent-500)]/10 text-[var(--color-accent-500)] border border-[var(--color-accent-500)]/30 rounded-md hover:bg-[var(--color-accent-500)]/20 transition-colors whitespace-nowrap"
                              title="Review loan application"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Review
                            </button>
                            <button
                              onClick={() => handleAction(loan, 'modify')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[var(--color-secondary-600)]/10 text-[var(--color-secondary-600)] border border-[var(--color-secondary-600)]/30 rounded-md hover:bg-[var(--color-secondary-600)]/20 transition-colors whitespace-nowrap"
                              title="Modify loan details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Modify
                            </button>
                            <button
                              onClick={() => handleAction(loan, 'checking')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[var(--color-accent-500)]/10 text-[var(--color-secondary-600)] border border-[var(--color-secondary-600)]/30 rounded-md hover:bg-[var(--color-secondary-600)]/20 transition-colors whitespace-nowrap"
                              title="Check member data"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Checking
                            </button>
                            <button
                              onClick={() => handleAction(loan, 'contract')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-[var(--color-accent-500)]/20 to-[var(--color-secondary-600)]/20 text-[var(--color-secondary-600)] border border-[var(--color-accent-500)]/40 rounded-md hover:from-[var(--color-accent-500)]/30 hover:to-[var(--color-secondary-600)]/30 transition-colors whitespace-nowrap"
                              title="View contract"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Contract
                            </button>
                            <button
                              onClick={() => handleAction(loan, 'delete')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[var(--color-primary-100)] text-red-700 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
                              title="Delete loan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <p className="text-[var(--color-text-secondary)] text-lg">No loans found</p>
                        <p className="text-[var(--color-text-secondary)] text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-surface)]">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] bg-[var(--color-bg-surface)] hover:bg-blue-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] bg-[var(--color-bg-surface)] hover:bg-blue-50 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Government Logos */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 border border-[var(--color-accent-500)]/20">
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
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">MCA Supervised</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.meity} alt="MeitY" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[var(--color-secondary-600)]">MeitY Accredited</span>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedLoan && (
        <ReviewModal
          loan={selectedLoan}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedLoan(null);
          }}
          onSave={handleSaveReview}
        />
      )}

      {/* Modify Loan Modal */}
      {showModifyModal && selectedLoan && (
        <ModifyLoanModal
          loan={selectedLoan}
          onClose={() => {
            setShowModifyModal(false);
            setSelectedLoan(null);
          }}
          onSave={handleSaveModify}
        />
      )}

      {/* View Contract Modal */}
      {showContractModal && selectedLoan && (
        <ViewContractModal
          loan={selectedLoan}
          onClose={() => {
            setShowContractModal(false);
            setSelectedLoan(null);
          }}
        />
      )}

      {/* Checking Data Modal */}
      {showCheckingDataModal && selectedLoan && (
        <CheckingDataModal
          memberId={selectedLoan.user_id.toString()}
          onClose={() => {
            setShowCheckingDataModal(false);
            setSelectedLoan(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="max-w-sm w-full p-6 border border-[var(--color-border)] shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Confirm Delete</h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Are you sure you want to delete this loan? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedLoan(null);
                }}
                className="flex-1 border-2 border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-main)]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-gradient-to-r from-[var(--color-secondary-600)] to-[var(--color-primary-900)] hover:from-[var(--color-primary-900)] hover:to-[var(--color-primary-700)] text-[var(--color-bg-surface)] gap-2"
              >
                {deleting && <Loader className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
