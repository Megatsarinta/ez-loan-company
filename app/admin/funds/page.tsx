// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import { WithdrawalTable } from '@/components/withdrawal-table';
import { CheckingDataModal } from '@/components/checking-data-modal';
import { ConfirmWithdrawalModal } from '@/components/confirm-withdrawal-modal';
import DeleteConfirmDialog from '@/components/delete-confirm-dialog';
import { GOVERNMENT_LOGOS, COMPANY_LOGOS } from '@/lib/constants/company-info';

interface Withdrawal {
  id: number;
  withdraw_number: string;
  withdrawal_code: string | null;
  amount: number;
  status: string;
  withdrawal_date: string;
  user: {
    id: number;
    full_name: string;
    phone_number: string;
    wallet_balance: number;
  };
}

export default function WithdrawalListPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showCheckingDataModal, setShowCheckingDataModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Declare the variable

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', ((page - 1) * limit).toString());
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/withdrawals?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setWithdrawals(result.data);
        setTotal(result.total);
        setError('');
      } else {
        setError(result.error || 'Failed to fetch withdrawals');
      }
    } catch (err) {
      setError('Error fetching withdrawals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, searchTerm, statusFilter]);

  useEffect(() => {
    fetchWithdrawals();
  }, [page, startDate, endDate, searchTerm, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchWithdrawals();
  };

  const handleRefresh = () => {
    setPage(1);
    fetchWithdrawals();
  };

  const handleCheckingData = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowCheckingDataModal(true);
  };

  const handleConfirmWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowConfirmModal(true);
  };

  const handleDeleteClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowRejectDialog(false);
        fetchWithdrawals();
      } else {
        setError(result.error || 'Failed to reject withdrawal');
      }
    } catch (err) {
      setError('Error rejecting withdrawal');
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Header - same structure as Deposit Management */}
      <header className="bg-white border-b border-[#e9ecef] shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-[#6C757D] hover:text-[#FF9933] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1e3a5f]">Fund Management</h1>
                <p className="text-sm text-[#6C757D]">Manage member withdrawal requests</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-50 to-green-50 px-3 py-1.5 rounded-full border border-[#FF9933]/20">
            <Shield className="w-4 h-4 text-[#FF9933]" />
            <span className="text-xs font-medium text-[#212529]">RBI • MCA • CIBIL</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6 border border-gray-100 shadow-md bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF9933] to-[#138808] rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#212529]">Filter & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#FF9933]" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-[#138808]" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#FF6B00]" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Refused To Pay">Refused To Pay</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-2 flex items-center gap-1">
                <Users className="w-4 h-4 text-[#FF9933]" />
                Search
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by document number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#212529] placeholder-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                />
                <Button
                  onClick={handleSearch}
                  size="icon"
                  className="px-4 bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleRefresh}
              size="sm"
              className="gap-2 bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Table */}
        <Card className="border border-gray-100 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#FF9933] border-t-[#138808] rounded-full animate-spin" />
                <p className="text-[#6C757D]">Loading withdrawals...</p>
              </div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No withdrawals found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
              </div>
            </div>
          ) : (
            <>
              <WithdrawalTable
                withdrawals={withdrawals}
                onCheckingData={handleCheckingData}
                onConfirmWithdrawal={handleConfirmWithdrawal}
                onReject={handleDeleteClick}
              />

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="border-2 border-[#FF9933] text-[#FF9933] bg-white hover:bg-orange-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-sm text-[#6C757D]">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="border-2 border-[#FF9933] text-[#FF9933] bg-white hover:bg-orange-50 disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Government Logos */}
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-green-50 rounded-xl p-4 border border-[#FF9933]/20">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.rbi} alt="SEC" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#FF9933]">RBI Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.mca} alt="BSP" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#138808]">MCA Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 relative">
                <Image src={GOVERNMENT_LOGOS.cibil} alt="DMW" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-xs font-medium text-[#138808]">CIBIL Partner</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCheckingDataModal && selectedWithdrawal && (
        <CheckingDataModal
          memberId={selectedWithdrawal.user.id.toString()}
          onClose={() => setShowCheckingDataModal(false)}
        />
      )}

      {showConfirmModal && selectedWithdrawal && (
        <ConfirmWithdrawalModal
          withdrawal={selectedWithdrawal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            setShowConfirmModal(false);
            fetchWithdrawals();
          }}
        />
      )}

      {showRejectDialog && selectedWithdrawal && (
        <DeleteConfirmDialog
          title="Reject Withdrawal"
          message={`Are you sure you want to reject this withdrawal request? (${selectedWithdrawal.withdraw_number}) The amount will be returned to the user's wallet.`}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectDialog(false)}
        />
      )}
    </>
  );
}
