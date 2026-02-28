import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getLoanApplicationWithUserByDocumentNumber, getAdminLoanApplicationsPaginated } from '@/lib/db-operations';

// Complete status color mapping from review-loan-modal
const STATUS_COLOR_MAP: Record<string, string> = {
  'UNDER_REVIEW': '#3B82F6',
  'LOAN_APPROVED': '#22C55E',
  'LOAN_APPROVED_CONFIRMATION': '#22C55E',
  'OTP_GENERATED': '#22C55E',
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
  'UNFROZEN': '#22C55E',
  'LOW_CREDIT_SCORE': '#F97316',
  'TOP_UP_CREDIT_SCORE': '#8B5CF6',
  'WITHDRAWAL_REJECTED': '#DC2626',
  'OVERDUE': '#B91C1C',
  'TAX': '#F59E0B',
  'TAX_SETTLED': '#22C55E',
  'WITHDRAWAL_SUCCESSFUL': '#22C55E',
  'BANK_INFO_UPDATED': '#22C55E',
  'PERSONAL_INFO_UPDATED': '#22C55E',
  'INSURANCE': '#0EA5E9',
  'GAMBLING': '#F43F5E',
  'IRREGULAR_ACTIVITY': '#DC2626',
  'DUPLICATE_APPLICATION': '#E11D48',
  'ACCOUNT_SUSPENDED': '#DC2626',
  'ACCOUNT_REACTIVATED': '#22C55E',
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
  
  // Legacy colors for backward compatibility
  const legacyColors: Record<string, string> = {
    'pending': '#F59E0B',
    'PENDING': '#F59E0B',
    'under_review': '#3B82F6',
    'UNDER REVIEW': '#3B82F6',
    'approved': '#22C55E',
    'APPROVED': '#22C55E',
    'rejected': '#EF4444',
    'REJECTED': '#EF4444',
    'handling fee': '#8B5CF6',
    'HANDLING FEE': '#8B5CF6',
    'overdue record': '#DC2626',
    'OVERDUE RECORD': '#DC2626',
    'withdrawal successfully': '#22C55E',
    'WITHDRAWAL SUCCESSFULLY': '#22C55E',
    'declined': '#EF4444',
    'DECLINED': '#EF4444',
    'disbursed': '#22C55E',
    'DISBURSED': '#22C55E',
    'completed': '#22C55E',
    'COMPLETED': '#22C55E',
    'defaulted': '#7F1D1D',
    'DEFAULTED': '#7F1D1D',
    'cancelled': '#64748B',
    'CANCELLED': '#64748B',
  };
  
  const lowerStatus = status?.toLowerCase();
  if (legacyColors[status]) {
    return legacyColors[status];
  }
  if (legacyColors[lowerStatus]) {
    return legacyColors[lowerStatus];
  }
  
  return '#6B7280';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const exact = searchParams.get('exact') === 'true';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const offset = (page - 1) * limit;

    console.log('[v0] Fetching loans with params:', { page, limit, search, exact, status, startDate, endDate });

    if (exact && search) {
      console.log('[v0] Performing EXACT document number search for:', search);
      const exactResult = await getLoanApplicationWithUserByDocumentNumber(search.trim());
      const exactLoan = exactResult.success ? exactResult.data : null;

      if (!exactResult.success && exactResult.error) {
        console.error('[v0] Exact loan search error:', exactResult.error);
        return NextResponse.json({
          success: false,
          error: 'Search error: ' + exactResult.error,
          loans: [],
        }, { status: 500 });
      }

      if (exactLoan) {
        console.log('[v0] Found EXACT loan match for document:', search, 'Loan ID:', exactLoan.id, 'DB Document:', exactLoan.document_number, 'Borrower:', exactLoan.users?.full_name);
        
        // CRITICAL VERIFICATION: Ensure document number actually matches
        if (exactLoan.document_number !== search.trim()) {
          console.error('[v0] CRITICAL: Returned loan document does not match search!', {
            searched_for: search.trim(),
            found_document: exactLoan.document_number,
            loan_id: exactLoan.id,
          });
          return NextResponse.json({
            success: false,
            error: 'Database returned mismatched document',
            loans: [],
          }, { status: 500 });
        }
        
        // Transform single loan
        const transformedLoan = {
          id: exactLoan.id,
          order_number: exactLoan.document_number,
          document_number: exactLoan.document_number,
          borrower_name: exactLoan.users?.full_name || 'Unknown',
          borrower_id_number: exactLoan.users?.id_card_number || 'N/A',
          borrower_phone: exactLoan.users?.phone_number || 'N/A',
          borrower_email: exactLoan.users?.email || null,
          loan_amount: Number(exactLoan.amount_requested) || 0,
          amount_requested: Number(exactLoan.amount_requested) || 0,
          interest_rate: Number(exactLoan.interest_rate) || 0,
          loan_period_months: Number(exactLoan.loan_term_months) || 12,
          loan_term_months: Number(exactLoan.loan_term_months) || 12,
          status: exactLoan.status === 'pending' ? 'PENDING' : (exactLoan.status || 'PENDING').toUpperCase(),
          status_color: getStatusColor(exactLoan.status === 'pending' ? 'PENDING' : exactLoan.status),
          status_description: exactLoan.admin_status_message || '',
          created_at: exactLoan.created_at,
          updated_at: exactLoan.updated_at,
          user_id: exactLoan.user_id,
          bank_name: exactLoan.users?.bank_name || 'N/A',
          bank_card_number: exactLoan.users?.bank_card_number || null,
          // KYC document URLs
          kyc_front_url: exactLoan.kyc_front_url,
          kyc_back_url: exactLoan.kyc_back_url,
          selfie_url: exactLoan.selfie_url,
          signature_url: exactLoan.signature_url,
          personal_info: exactLoan.personal_info,
          is_active: exactLoan.is_active,
          source: 'loan_applications',
          loan_type: 'Personal Loan',
        };

        return NextResponse.json({
          success: true,
          loans: [transformedLoan], // Array with SINGLE loan
          data: [transformedLoan],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1,
          },
          exact_match: true,
        });
      } else {
        // No exact match found
        console.log('[v0] No exact loan match found for document:', search);
        return NextResponse.json({
          success: true,
          loans: [],
          data: [],
          pagination: {
            page: 1,
            limit: 1,
            total: 0,
            pages: 0,
          },
          exact_match: false,
        });
      }
    }

    // 🔵 REGULAR SEARCH WITH PAGINATION - Use PG (loan_applications may not have is_active)
    const pgResult = await getAdminLoanApplicationsPaginated({
      limit,
      offset,
      search: search || undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (!pgResult.success) {
      console.error('[v0] Admin loans PG error:', pgResult.error);
      return NextResponse.json(
        { success: false, error: pgResult.error || 'Failed to fetch loans', loans: [] },
        { status: 500 }
      );
    }

    const { rows: loanAppsData, total: loanAppsCount } = pgResult.data ?? { rows: [], total: 0 };

    // Transform to same shape as before
    const transformedLoanApps = (loanAppsData || []).map((app: any) => ({
      id: app.id,
      order_number: app.document_number,
      document_number: app.document_number,
      borrower_name: app.users?.full_name || 'Unknown',
      borrower_id_number: 'N/A',
      borrower_phone: app.users?.phone_number || 'N/A',
      bank_name: 'N/A',
      bank_card_number: null,
      loan_amount: Number(app.amount_requested) || 0,
      interest_rate: Number(app.interest_rate) || 0,
      loan_period_months: Number(app.loan_term_months) || 12,
      status: app.status === 'pending' ? 'PENDING' : (app.status || 'PENDING').toUpperCase(),
      status_color: getStatusColor(app.status === 'pending' ? 'PENDING' : app.status),
      created_at: app.created_at,
      user_id: app.user_id,
      is_active: true,
      source: 'loan_applications',
      loan_type: 'Personal Loan',
    }));

    return NextResponse.json({
      success: true,
      loans: transformedLoanApps,
      data: transformedLoanApps,
      pagination: {
        page,
        limit,
        total: loanAppsCount || 0,
        pages: Math.ceil((loanAppsCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[v0] Loans GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loans', loans: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userId,
      loanAmount,
      interestRate,
      loanPeriodMonths,
      bankName,
      borrowerName,
      borrowerIdNumber,
      borrowerPhone,
    } = body;

    if (!userId || !loanAmount || !interestRate || !loanPeriodMonths) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await supabaseAdmin
      .from('loans')
      .insert([
        {
          user_id: userId,
          order_number: orderNumber,
          loan_amount: loanAmount,
          interest_rate: interestRate,
          loan_period_months: loanPeriodMonths,
          borrower_name: borrowerName,
          borrower_phone: borrowerPhone,
          status: 'PENDING',
          status_color: '#F59E0B',
          bank_name: bankName,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[v0] Loan creation error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Loan created successfully',
      data,
    });
  } catch (error) {
    console.error('[v0] Loan POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
