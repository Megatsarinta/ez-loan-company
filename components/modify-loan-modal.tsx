'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader, DollarSign, Percent, Calendar } from 'lucide-react';

interface ModifyLoanModalProps {
  loan: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function ModifyLoanModal({ loan, onClose, onSave }: ModifyLoanModalProps) {
  const [loanAmount, setLoanAmount] = useState(loan.loan_amount.toString());
  const [interestRate, setInterestRate] = useState(loan.interest_rate.toString());
  const [loanPeriod, setLoanPeriod] = useState(loan.loan_period_months.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Brand colors
  const saffron = 'var(--color-accent-500)';
  const green = 'var(--color-secondary-600)';

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (!loanAmount || isNaN(Number(loanAmount))) {
        setError('Invalid loan amount');
        return;
      }
      if (!interestRate || isNaN(Number(interestRate))) {
        setError('Invalid interest rate');
        return;
      }
      if (!loanPeriod || isNaN(Number(loanPeriod))) {
        setError('Invalid loan period');
        return;
      }

      await onSave({
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        loanPeriodMonths: parseInt(loanPeriod),
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="max-w-md w-full p-6 border-0 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] bg-clip-text text-transparent">
            Modify Loan Terms
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-bg-main)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Document Info (for context) */}
        <div className="bg-gradient-to-r from-orange-50 to-green-50 p-4 rounded-lg mb-6 border border-[var(--color-accent-500)]/20">
          <p className="text-xs text-[var(--color-text-secondary)] mb-1">Document Number</p>
          <p className="font-mono font-semibold text-[var(--color-text-primary)] text-sm">
            {loan.order_number || loan.document_number}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">Borrower</p>
          <p className="font-medium text-[var(--color-text-primary)]">{loan.borrower_name}</p>
        </div>

        <div className="space-y-5 mb-6">
          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-[var(--color-accent-500)]" />
              Loan Amount (₹)
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-700)] focus:ring-opacity-20 focus:border-[var(--color-accent-500)] transition-all"
              min="0"
              step="0.01"
              placeholder="Enter loan amount"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
              <Percent className="w-4 h-4 text-[var(--color-secondary-600)]" />
              Interest Rate (%)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-700)] focus:ring-opacity-20 focus:border-[var(--color-accent-500)] transition-all"
              min="0"
              step="0.01"
              placeholder="Enter interest rate"
            />
          </div>

          {/* Loan Period */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-[var(--color-accent-500)]" />
              Loan Period (Months)
            </label>
            <input
              type="number"
              value={loanPeriod}
              onChange={(e) => setLoanPeriod(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-700)] focus:ring-opacity-20 focus:border-[var(--color-accent-500)] transition-all"
              min="1"
              placeholder="Enter loan period in months"
            />
          </div>

          {/* Preview of changes */}
          <div className="bg-[var(--color-bg-main)] p-4 rounded-xl border border-[var(--color-border)] mt-4">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Preview Changes</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Amount</p>
                <p className="font-bold text-[var(--color-accent-500)]">₹{Number(loanAmount).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Rate</p>
                <p className="font-bold text-[var(--color-secondary-600)]">{interestRate}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[var(--color-text-secondary)]">Period</p>
                <p className="font-bold text-[var(--color-text-primary)]">{loanPeriod} months</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-[var(--color-primary-100)] border-2 border-[var(--color-border)] text-red-700 text-sm p-4 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            className="flex-1 border-2 border-[var(--color-accent-500)] text-[var(--color-accent-500)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-accent-100)] py-3 text-base font-medium rounded-xl transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 gap-2 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)] py-3 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Admin footer */}
        <div className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
          EasyLoan • Admin Portal
        </div>
      </Card>
    </div>
  );
}
