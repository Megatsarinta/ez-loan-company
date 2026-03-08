import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserDetailsById, 
  getLoanApplications, 
  getTransactions, 
  markPersonalInfoCompleted, 
  markKYCCompleted, 
  markSignatureCompleted, 
  getVerificationStatus,
  getPersonalInfo,
  getBankDetails,
} from '@/lib/db-operations';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Get verification status
    if (action === 'get_verification_status') {
      const result = await getVerificationStatus(parseInt(userId)); // Updated function name
      if (!result.success || !result.data) {
        return NextResponse.json({ 
          verification: { 
            personal_info_completed: false, 
            kyc_completed: false, 
            bank_info_completed: false, 
            signature_completed: false 
          } 
        });
      }
      return NextResponse.json({ verification: result.data });
    }

    const userResult = await getUserDetailsById(parseInt(userId));
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error },
        { status: 400 }
      );
    }

    // Transform the user data to match Indian market fields
    const { password_hash, cibil_score, personal_info, bank_details, ...userWithoutPassword } = userResult.data as any;
    const uid = parseInt(userId);

    // Ensure id_card_number and bank_details for loan-contract/signature (from personal_info + bank_details tables if not in user)
    let id_card_number = (personal_info?.id_number ?? personal_info?.id_card_number) || userWithoutPassword.id_card_number;
    let bank_details_merged = bank_details || userWithoutPassword.bank_details;
    if (!id_card_number || !bank_details_merged) {
      if (!id_card_number) {
        const piResult = await getPersonalInfo(uid);
        if (piResult.success && piResult.data) {
          const row = piResult.data as any;
          id_card_number = row.id_number || row.id_card_number || '';
        }
      }
      if (!bank_details_merged) {
        const bankResult = await getBankDetails(uid);
        if (bankResult.success && bankResult.data) {
          const b = bankResult.data as any;
          bank_details_merged = { bankName: b.bank_name || b.bankName };
        }
      }
    }
    const bankForFrontend = bank_details_merged && typeof bank_details_merged === 'object'
      ? { bankName: (bank_details_merged as any).bank_name ?? (bank_details_merged as any).bankName }
      : undefined;

    return NextResponse.json({ 
      user: {
        ...userWithoutPassword,
        cibil_score: cibil_score || 750,
        id_card_number: id_card_number || userWithoutPassword.id_card_number || '',
        bank_details: bankForFrontend,
      } 
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await req.json();

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete('user_id');
      return response;
    }

    if (action === 'get_loans') {
      const result = await getLoanApplications(parseInt(userId));
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      
      // Format loans with Indian currency
      const formattedLoans = result.data?.map((loan: any) => ({
        ...loan,
        amount_formatted: `₹${loan.amount_requested?.toLocaleString('en-IN')}`,
        currency: 'INR'
      })) || [];
      
      return NextResponse.json({ loans: formattedLoans });
    }

    if (action === 'get_transactions') {
      const result = await getTransactions(parseInt(userId));
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      
      // Format transactions with Indian currency
      const formattedTransactions = result.data?.map((tx: any) => ({
        ...tx,
        amount_formatted: `₹${tx.amount?.toLocaleString('en-IN')}`,
        currency: 'INR'
      })) || [];
      
      return NextResponse.json({ transactions: formattedTransactions });
    }

    if (action === 'mark_verification') {
      const { step } = await req.json();
      let result;

      if (step === 'personal_info') {
        result = await markPersonalInfoCompleted(parseInt(userId));
      } else if (step === 'kyc') {
        result = await markKYCCompleted(parseInt(userId));
      } else if (step === 'signature') {
        result = await markSignatureCompleted(parseInt(userId));
      } else {
        return NextResponse.json(
          { error: 'Invalid verification step' },
          { status: 400 }
        );
      }

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, user: result.data });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { full_name, email } = body; // Added email as optional field

    if (!full_name) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    // Update user's information in database
    const updateData: any = { full_name };
    if (email) updateData.email = email;

    const { error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('[v0] Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user information' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Put user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}