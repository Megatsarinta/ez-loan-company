'use client';

import { formatDate } from '@/lib/utils';
import { getStatusColor } from '@/lib/withdrawal-utils';
import { formatINR } from '@/lib/currency';
import { Button } from '@/components/ui/button';

interface Withdrawal {
  id: number;
  withdraw_number: string;
  document_number?: string;
  withdrawal_code: string | null;
  amount: number;
  status: string;
  withdrawal_date: string;
  user: {
    id: number;
    full_name: string;
    phone_number: string;
  };
}

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
  onCheckingData: (withdrawal: Withdrawal) => void;
  onConfirmWithdrawal: (withdrawal: Withdrawal) => void;
  onReject: (withdrawal: Withdrawal) => void;
}

// Statuses that should disable action buttons
const FINAL_STATUSES = ['Completed', 'Failed', 'Refused To Pay', 'Cancelled'];
const PROCESSING_STATUSES = ['Processing'];

export function WithdrawalTable({
  withdrawals,
  onCheckingData,
  onConfirmWithdrawal,
  onReject,
}: WithdrawalTableProps) {

  const isActionDisabled = (status: string) => {
    return FINAL_STATUSES.includes(status) || PROCESSING_STATUSES.includes(status);
  };

  const getButtonTitle = (status: string, action: string) => {
    if (FINAL_STATUSES.includes(status)) {
      return `Cannot ${action} - withdrawal is already ${status}`;
    }
    if (PROCESSING_STATUSES.includes(status)) {
      return `Cannot ${action} - withdrawal is currently being processed`;
    }
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-accent-500)]/10 to-[var(--color-secondary-600)]/10">
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">No.</th>
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">Document Number</th>
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">Withdrawal Code</th>
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">Name</th>
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">Username</th>
            <th className="px-6 py-3 text-right font-semibold text-[var(--color-text-primary)]">Amount</th>
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">Withdrawal Date</th>
            <th className="px-6 py-3 text-left font-semibold text-[var(--color-text-primary)]">Operate</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((withdrawal, index) => {
            const disabled = isActionDisabled(withdrawal.status);
            const isPending = withdrawal.status === 'Pending';
            const showActions = isPending;

            return (
              <tr key={withdrawal.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-accent-500)]/5 transition-colors">
                <td className="px-6 py-4 text-[var(--color-text-primary)]">{index + 1}</td>
                <td className="px-6 py-4 font-mono text-[var(--color-text-primary)]">{withdrawal.document_number || withdrawal.withdraw_number}</td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="Code"
                    value={withdrawal.withdrawal_code || ''}
                    readOnly
                    className="w-20 px-2 py-1 border border-[var(--color-border)] rounded text-xs bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-700)] focus:ring-opacity-20"
                  />
                </td>
                <td className="px-6 py-4 text-[var(--color-text-primary)]">{withdrawal.user.full_name}</td>
                <td className="px-6 py-4 font-mono text-[var(--color-text-primary)]">{withdrawal.user.phone_number}</td>
                <td className="px-6 py-4 text-right font-semibold text-[var(--color-text-primary)]">
                  {formatINR(withdrawal.amount)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex px-3 py-1 text-xs font-semibold rounded-full text-[var(--color-bg-surface)]"
                    style={{ backgroundColor: getStatusColor(withdrawal.status) }}
                  >
                    {withdrawal.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--color-text-primary)]">{formatDate(withdrawal.withdrawal_date)}</td>
                <td className="px-6 py-4">
                  {showActions ? (
                    // Show full action buttons for pending withdrawals
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onCheckingData(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)]"
                        title="Check member details"
                      >
                        Checking Data
                      </Button>
                      <Button
                        onClick={() => onConfirmWithdrawal(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)]"
                        title="Confirm withdrawal"
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={() => onReject(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 border border-[var(--color-primary-900)] text-[var(--color-primary-900)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-primary-100)]"
                        title="Reject withdrawal"
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    // Show disabled/read-only state for non-pending withdrawals
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onCheckingData(withdrawal)}
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-secondary-600)] text-[var(--color-bg-surface)] hover:from-[var(--color-accent-600)] hover:to-[var(--color-secondary-500)]"
                        title="Check member details"
                      >
                        Checking Data
                      </Button>
                      <Button
                        disabled
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] cursor-not-allowed border border-[var(--color-border)]"
                        title={getButtonTitle(withdrawal.status, 'confirm')}
                      >
                        Confirm
                      </Button>
                      <Button
                        disabled
                        size="sm"
                        className="text-xs px-2 py-1 h-7 bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] cursor-not-allowed border border-[var(--color-border)]"
                        title={getButtonTitle(withdrawal.status, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
