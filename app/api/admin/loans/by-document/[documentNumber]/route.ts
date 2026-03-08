import { NextRequest, NextResponse } from 'next/server';
import { getLoanApplicationWithUserByDocumentNumber, getPersonalInfo } from '@/lib/db-operations';

// Original loan status colors (Indian brand: green #138808, saffron #FF9933)
const STATUS_COLOR_MAP: Record<string, string> = {
  'UNDER_REVIEW': '#3B82F6',
  'LOAN_APPROVED': '#138808',
  'LOAN_APPROVED_CONFIRMATION': '#138808',
  'OTP_GENERATED': '#138808',
  'WITHDRAWAL_PROCESSING': '#6366F1',
  'WITHDRAWAL_FAILED': '#DC2626',
  'INVALID_BANK_NAME': '#EF4444',
  'INVALID_BANK_ACCOUNT': '#EF4444',
  'INVALID_BANK_ACCOUNT_FROZEN': '#EF4444',
  'MISMATCH_BENEFICIARY': '#EF4444',
  'INVALID_ID_CARD': '#EF4444',
  'FUND_FROZEN': '#EF4444',
  'ERROR_INFO': '#EF4444',
  'ACCOUNT_LIMIT_REACHED': '#EF4444',
  'PROCESSING_UNFREEZE': '#6366F1',
  'UNFROZEN': '#138808',
  'LOW_CREDIT_SCORE': '#F97316',
  'TOP_UP_CREDIT_SCORE': '#8B5CF6',
  'WITHDRAWAL_REJECTED': '#DC2626',
  'OVERDUE': '#B91C1C',
  'TAX': '#F59E0B',
  'TAX_SETTLED': '#138808',
  'WITHDRAWAL_SUCCESSFUL': '#138808',
  'BANK_INFO_UPDATED': '#138808',
  'PERSONAL_INFO_UPDATED': '#138808',
  'INSURANCE': '#0EA5E9',
  'GAMBLING': '#F43F5E',
  'IRREGULAR_ACTIVITY': '#DC2626',
  'DUPLICATE_APPLICATION': '#E11D48',
  'ACCOUNT_SUSPENDED': '#DC2626',
  'ACCOUNT_REACTIVATED': '#138808',
  'ACCOUNT_DEACTIVATED': '#64748B',
  'RENEW_OTP': '#F59E0B',
};

function getStatusColor(status: string): string {
  // Try exact match first
  if (STATUS_COLOR_MAP[status]) {
    return STATUS_COLOR_MAP[status];
  }
  
  // Try uppercase version
  const upperStatus = status?.toUpperCase();
  if (STATUS_COLOR_MAP[upperStatus]) {
    return STATUS_COLOR_MAP[upperStatus];
  }
  
  // Legacy colors for backward compatibility (original Indian brand)
  const legacyColors: Record<string, string> = {
    'pending': '#FF9933',
    'under_review': '#3B82F6',
    'approved': '#138808',
    'rejected': '#EF4444',
  };
  
  const lowerStatus = status?.toLowerCase();
  if (legacyColors[lowerStatus]) {
    return legacyColors[lowerStatus];
  }
  
  return '#6B7280';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentNumber: string }> }
) {
  try {
    const { documentNumber } = await params;
    const decodedDocNumber = decodeURIComponent(documentNumber);

    console.log('[v0] Fetching loan by DOCUMENT NUMBER:', decodedDocNumber);

    // Use PG (no is_active column on loan_applications)
    const result = await getLoanApplicationWithUserByDocumentNumber(decodedDocNumber);
    const loanAppData = result.success ? result.data : null;

    if (!result.success || !loanAppData) {
      console.error('[v0] Error fetching loan by document_number:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Loan not found: ' + (result.error || 'Loan with document number ' + decodedDocNumber + ' not found'),
        },
        { status: 404 }
      );
    }

    console.log('[v0] ✓ Found in loan_applications - ID:', loanAppData.id, 'Document:', loanAppData.document_number, 'Borrower:', loanAppData.users?.full_name);

    // CRITICAL VERIFICATION: Ensure document number matches exactly
    if (loanAppData.document_number !== decodedDocNumber) {
      console.error('[v0] CRITICAL MISMATCH:', {
        requested: decodedDocNumber,
        returned: loanAppData.document_number,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database integrity error: document number mismatch' 
        },
        { status: 500 }
      );
    }

    // Calculate loan values
    const loanAmount = Number(loanAppData.amount_requested) || 0;
    const interestRate = Number(loanAppData.interest_rate) || 0;
    const loanTermMonths = Number(loanAppData.loan_term_months) || 12;

    const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
    const monthlyPrincipal = loanAmount / loanTermMonths;
    const monthlyInstallment = monthlyPrincipal + monthlyInterest;
    const totalRepayment = loanAmount + (monthlyInterest * loanTermMonths);

    // Fetch ID card number from personal_info for Loan Approval Letter
    let borrowerIdNumber = 'N/A';
    if (loanAppData.user_id) {
      const piResult = await getPersonalInfo(Number(loanAppData.user_id));
      if (piResult.success && piResult.data && typeof piResult.data === 'object') {
        const row = piResult.data as { id_number?: string; id_card_number?: string };
        borrowerIdNumber = row.id_number || row.id_card_number || 'N/A';
      }
    }

    // Transform the data
    const transformedData = {
      id: loanAppData.id,
      document_number: loanAppData.document_number,
      order_number: loanAppData.document_number,
      borrower_name: loanAppData.users?.full_name || 'N/A',
      borrower_phone: loanAppData.users?.phone_number || 'N/A',
      borrower_id_number: borrowerIdNumber,
      borrower_email: null,
      loan_amount: loanAmount,
      amount_requested: loanAmount,
      interest_rate: interestRate,
      loan_period_months: loanTermMonths,
      loan_term_months: loanTermMonths,
      status: loanAppData.status || 'pending',
      status_color: loanAppData.status_color || getStatusColor(loanAppData.status),
      status_description: loanAppData.admin_status_message || '',
      created_at: loanAppData.created_at,
      updated_at: loanAppData.updated_at,
      user_id: loanAppData.user_id,
      bank_name: 'N/A',
      bank_card_number: null,
      kyc_front_url: loanAppData.kyc_front_url,
      kyc_back_url: loanAppData.kyc_back_url,
      selfie_url: loanAppData.selfie_url,
      signature_url: loanAppData.signature_url,
      personal_info: loanAppData.personal_info,
      is_active: true,
      monthly_interest: monthlyInterest,
      monthly_installment: monthlyInstallment,
      total_repayment: totalRepayment,
      source: 'loan_applications',
      loan_type: 'Personal Loan',
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('[v0] Unexpected error in loan by-document endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error' 
      },
      { status: 500 }
    );
  }
}
