import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { getBankDetails, saveBankDetails, saveBankDetailsPg } from '@/lib/db-operations';

// Prefer bank_details table (PG); fallback to users.bank_details if needed
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = parseInt(userId);

    try {
      // 1) Try bank_details table first (PG-backed)
      const result = await getBankDetails(uid);
      if (result.success && result.data) {
        const row = result.data as any;
        return NextResponse.json({
          bankDetails: {
            bankName: row.bank_name || '',
            accountNumber: row.account_number || '',
            ifscCode: row.ifsc_code || '',
            accountType: row.account_type || 'Savings',
            isAdminSet: false,
          },
        });
      }

      // 2) Fallback: users.bank_details (if column exists)
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('bank_details, bank_name')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ bankDetails: null });
      }

      if (!data) {
        return NextResponse.json({ bankDetails: null });
      }

      const bankDetails = data.bank_details;
      const isAdminSet = bankDetails && typeof bankDetails === 'object' ? (bankDetails as any).setBy === 'admin' : false;

      return NextResponse.json({
        bankDetails: bankDetails && typeof bankDetails === 'object' ? {
          bankName: (bankDetails as any).bankName || (bankDetails as any).bank_name || data.bank_name || '',
          accountNumber: (bankDetails as any).account_number || (bankDetails as any).accountNumber || '',
          ifscCode: (bankDetails as any).ifscCode || (bankDetails as any).ifsc_code || '',
          accountType: (bankDetails as any).accountType || (bankDetails as any).account_type || 'Savings',
          isAdminSet,
        } : null,
      });
    } catch (e) {
      console.error('[v0] Bank details fetch error:', e);
      return NextResponse.json({ bankDetails: null });
    }
  } catch (error) {
    console.error('[v0] Bank details fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bankName, accountNumber, ifscCode, accountType } = body;

    if (!bankName?.trim() || !accountNumber?.trim() || !ifscCode?.trim()) {
      return NextResponse.json(
        { error: 'Bank Name, Account Number, and IFSC/IBAN are required' },
        { status: 400 }
      );
    }

    const uid = parseInt(userId, 10);

    // Only allow users to set bank details if admin hasn't already set them
    let isAdminSet = false;
    try {
      const { data: existingData, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('bank_details')
        .eq('id', parseInt(userId))
        .single();

      if (!fetchError || fetchError.code === 'PGRST116') {
        const existingBankDetails = existingData?.bank_details;
        isAdminSet = existingBankDetails && typeof existingBankDetails === 'object' ? existingBankDetails.setBy === 'admin' : false;
      }
    } catch (_) {
      // Column may not exist; allow save
    }

    if (isAdminSet) {
      return NextResponse.json(
        { error: 'Bank details have been set by admin and cannot be modified' },
        { status: 403 }
      );
    }

    const accountTypeMap = (t: string): 'NRE' | 'NRO' | 'savings' | 'current' => {
      const v = (t || '').toString();
      if (v === 'NRE') return 'NRE';
      if (v === 'NRO') return 'NRO';
      if (v === 'current' || v === 'Current') return 'current';
      return 'savings';
    };
    // Accept any IFSC or IBAN string (no format validation)
    const ifscOrIbanValue = (ifscCode || '').toString().trim();

    const payload = {
      account_type: accountType ? accountTypeMap(accountType) : 'savings',
      bank_name: (bankName || '').trim(),
      branch: '',
      account_number: (accountNumber || '').trim(),
      ifsc_code: ifscOrIbanValue,
      account_holder_name: 'Account Holder',
    };

    const saveResult = await saveBankDetails(uid, payload);
    const pgResult = !saveResult.success ? await saveBankDetailsPg(uid, payload) : saveResult;

    if (saveResult.success || pgResult.success) {
      return NextResponse.json({
        success: true,
        bankDetails: { bankName: payload.bank_name, accountNumber: payload.account_number, ifscCode: ifscOrIbanValue, accountType: payload.account_type },
      });
    }

    const bankDetails = {
      bankName: payload.bank_name,
      accountNumber: payload.account_number,
      ifscCode: ifscOrIbanValue,
      accountType: payload.account_type,
      updatedAt: new Date().toISOString(),
    };
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ bank_details: bankDetails })
        .eq('id', uid)
        .select();

      if (!error) {
        return NextResponse.json({
          success: true,
          bankDetails: data?.[0]?.bank_details ?? bankDetails,
        });
      }
    } catch (_) {
      // ignore
    }

    const errMsg = !saveResult.success && 'error' in saveResult ? saveResult.error : 'error' in pgResult ? pgResult.error : 'Failed to save bank details';
    console.error('Bank details save error:', errMsg);
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  } catch (error) {
    console.error('Bank details save error:', error);
    return NextResponse.json(
      { error: 'Failed to save bank details' },
      { status: 500 }
    );
  }
}
