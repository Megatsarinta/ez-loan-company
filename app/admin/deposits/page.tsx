'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  Banknote,
  History,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { GOVERNMENT_LOGOS, COMPANY_LOGOS } from '@/lib/constants/company-info';
import { formatINR } from '@/lib/currency';
import { toast } from 'sonner';

interface SearchUserResult {
  id: number;
  full_name: string;
  phone_number: string;
  wallet_balance: number;
  document_number: string | null;
}

interface DepositRow {
  id: number;
  user_id: number;
  amount: number;
  description: string;
  created_at: string;
  metadata: { operatorUsername?: string; operatorRole?: string; note?: string } | null;
  user?: { full_name: string; phone_number: string };
  document_number?: string | null;
}

const DATE_PRESETS: Record<string, () => { start: Date; end: Date }> = {
  today: () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return { start: d, end: new Date() };
  },
  yesterday: () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return { start: d, end };
  },
  lastWeek: () => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
  thisWeek: () => {
    const end = new Date();
    const start = new Date(end);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
  lastMonth: () => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
  thisMonth: () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { start, end };
  },
  all: () => {
    const end = new Date();
    const start = new Date(2020, 0, 1);
    return { start, end };
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDepositsPage() {
  const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchUserResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupNote, setTopupNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [depositsTotal, setDepositsTotal] = useState(0);
  const [depositsPage, setDepositsPage] = useState(1);
  const [depositsLimit, setDepositsLimit] = useState(20);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [depositsSearch, setDepositsSearch] = useState('');
  const [datePreset, setDatePreset] = useState<string>('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const applyDatePreset = useCallback((preset: string) => {
    const fn = DATE_PRESETS[preset];
    if (fn) {
      const { start, end } = fn();
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, []);

  useEffect(() => {
    const preset = datePreset || 'thisMonth';
    applyDatePreset(preset);
  }, [datePreset, applyDatePreset]);

  const handleSearchUser = async () => {
    const q = searchQuery.trim();
    if (!q) {
      toast.error('Enter phone number or loan order number');
      return;
    }
    setSearching(true);
    setSearchResult(null);
    setError('');
    try {
      const res = await fetch(`/api/admin/deposits/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'User not found');
        toast.error(data.error || 'User not found');
        return;
      }
      setSearchResult(data.user);
    } catch (err) {
      setError('Search failed');
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmTopup = async () => {
    if (!searchResult) return;
    const amount = Number(topupAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: searchResult.id,
          amount,
          note: topupNote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create deposit');
        return;
      }
      toast.success(`Deposit of ${formatINR(amount)} successful. New balance: ${formatINR(data.newBalance)}`);
      setTopupAmount('');
      setTopupNote('');
      setSearchResult(null);
      setSearchQuery('');
      setDepositsPage(1);
      fetchDeposits();
    } catch (err) {
      toast.error('Failed to create deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDeposits = useCallback(async () => {
    setDepositsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(depositsPage));
      params.set('limit', String(depositsLimit));
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (depositsSearch.trim()) params.set('search', depositsSearch.trim());
      const res = await fetch(`/api/admin/deposits?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load deposits');
        setDeposits([]);
        setDepositsTotal(0);
        return;
      }
      setDeposits(data.data || []);
      setDepositsTotal(data.total ?? 0);
    } catch (err) {
      setError('Failed to load deposits');
      setDeposits([]);
      setDepositsTotal(0);
    } finally {
      setDepositsLoading(false);
    }
  }, [depositsPage, depositsLimit, startDate, endDate, depositsSearch]);

  useEffect(() => {
    if (activeTab === 'history') fetchDeposits();
  }, [activeTab, fetchDeposits]);

  const totalPages = Math.ceil(depositsTotal / depositsLimit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-main)] via-[var(--color-primary-100)] to-[var(--color-accent-100)]">
      <header className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border)] shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image src={COMPANY_LOGOS.main} alt="EasyLoan" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-primary-900)]">Deposit Management</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">Manual top-up and deposit history</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex gap-2 mb-6 border-b border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'topup'
                ? 'bg-[var(--color-accent-500)] text-[var(--color-bg-surface)]'
                : 'bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            }`}
          >
            Manual Top-up
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-[var(--color-accent-500)] text-[var(--color-bg-surface)]'
                : 'bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            }`}
          >
            Deposit History
          </button>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-[var(--color-primary-100)] border border-[var(--color-border)] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-primary-900)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {activeTab === 'topup' && (
          <Card className="p-6 border border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[var(--color-accent-500)]" />
              Find user and add funds
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Phone number or Loan order number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleSearchUser}
                disabled={searching}
                className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] gap-2"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </div>

            {searchResult && (
              <div className="border border-[var(--color-border)] rounded-xl p-4 mb-6 bg-[var(--color-bg-main)]">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-[var(--color-accent-500)]" />
                  <span className="font-medium text-[var(--color-text-primary)]">User found</span>
                </div>
                <p className="text-[var(--color-text-primary)] font-medium">{searchResult.full_name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">{searchResult.phone_number}</p>
                {searchResult.document_number && (
                  <p className="text-sm text-[var(--color-text-secondary)]">Order: {searchResult.document_number}</p>
                )}
                <p className="text-sm mt-2">
                  Current balance: <span className="font-semibold text-[var(--color-accent-500)]">{formatINR(searchResult.wallet_balance)}</span>
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="topup-amount">Top-up Amount (₹)</Label>
                    <Input
                      id="topup-amount"
                      type="number"
                      min={1}
                      placeholder="Enter amount"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topup-note">Note / Remark</Label>
                    <textarea
                      id="topup-note"
                      placeholder="Optional note for this deposit"
                      value={topupNote}
                      onChange={(e) => setTopupNote(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirmTopup}
                      disabled={submitting}
                      className="bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchResult(null);
                        setTopupAmount('');
                        setTopupNote('');
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'history' && (
          <>
            <Card className="p-4 mb-6 border border-[var(--color-border)]">
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-accent-500)]" />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">Date</span>
                </div>
                <select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value)}
                  className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] text-sm"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="thisWeek">This Week</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisMonth">This Month</option>
                  <option value="all">All</option>
                </select>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] text-sm"
                />
                <div className="flex gap-2 flex-1">
                  <Input
                    placeholder="Search by phone or order number"
                    value={depositsSearch}
                    onChange={(e) => setDepositsSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    onClick={() => { setDepositsPage(1); fetchDeposits(); }}
                    className="bg-[var(--color-accent-500)] text-[var(--color-bg-surface)]"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="border border-[var(--color-border)] overflow-hidden">
              <div className="overflow-x-auto">
                {depositsLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[var(--color-accent-500)] mx-auto mb-4" />
                    <p className="text-[var(--color-text-secondary)]">Loading deposit history...</p>
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[var(--color-bg-main)] border-b border-[var(--color-border)]">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">#</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">Loan Order Number</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">Name & Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">Remarks</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">Creation Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-primary)]">Operator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deposits.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                              No deposits found.
                            </td>
                          </tr>
                        ) : (
                          deposits.map((row, index) => (
                            <tr key={row.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-main)]">
                              <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                {(depositsPage - 1) * depositsLimit + index + 1}
                              </td>
                              <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                                {row.document_number || '—'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-[var(--color-text-primary)]">{row.user?.full_name ?? '—'}</div>
                                <div className="text-xs text-[var(--color-text-secondary)]">{row.user?.phone_number ?? '—'}</div>
                              </td>
                              <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{formatINR(row.amount)}</td>
                              <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] max-w-[200px] truncate" title={row.metadata?.note || row.description}>
                                {row.metadata?.note || row.description || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatDate(row.created_at)}</td>
                              <td className="px-4 py-3 text-sm text-[var(--color-text-primary)]">
                                {row.metadata?.operatorRole && row.metadata?.operatorUsername
                                  ? `${row.metadata.operatorRole} - ${row.metadata.operatorUsername}`
                                  : '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <div className="p-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          Rows per page:
                        </span>
                        <select
                          value={depositsLimit}
                          onChange={(e) => { setDepositsLimit(Number(e.target.value)); setDepositsPage(1); }}
                          className="px-2 py-1 border border-[var(--color-border)] rounded bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          Total: {depositsTotal} records
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositsPage((p) => Math.max(1, p - 1))}
                          disabled={depositsPage <= 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-[var(--color-text-primary)]">
                          Page {depositsPage} of {totalPages || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositsPage((p) => Math.min(totalPages, p + 1))}
                          disabled={depositsPage >= totalPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
