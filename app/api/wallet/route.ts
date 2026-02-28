import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createWithdrawal, getBankDetails, deductWalletBalance } from '@/lib/db-operations';

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

    const { action, amount, withdrawal_code, order_number } = await req.json();

    console.log('[v0] Withdrawal request:', {
      action,
      amount,
      withdrawal_code: withdrawal_code ? '***' : null,
      order_number,
      userId
    });

    if (action === 'submit-withdrawal') {
      // Validate required fields
      if (!amount || !withdrawal_code || !order_number) {
        console.log('[v0] Missing required fields:', { amount, withdrawal_code, order_number });
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Verify user has sufficient balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_balance, withdrawal_otp, full_name')
        .eq('id', parseInt(userId))
        .single();

      if (userError || !userData) {
        console.error('[v0] User fetch error:', userError);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('[v0] User data:', {
        wallet_balance: userData.wallet_balance,
        withdrawal_otp_exists: !!userData.withdrawal_otp
      });

      // Check balance
      if (userData.wallet_balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Verify withdrawal code matches
      if (userData.withdrawal_otp !== withdrawal_code) {
        console.log('[v0] OTP mismatch:', {
          expected: userData.withdrawal_otp ? '***' : null,
          provided: '***'
        });
        return NextResponse.json(
          { error: 'Invalid withdrawal code' },
          { status: 400 }
        );
      }

      // Get current timestamp
      const now = new Date().toISOString();
      const withdrawNumber = `WD-${Date.now()}-${userId}`;

      // Get user's bank details (from bank_details table; no account_name in withdrawals)
      let bankName = '';
      let accountNumber = '';
      let ifscCode = '';
      const bankResult = await getBankDetails(parseInt(userId));
      if (bankResult.success && bankResult.data) {
        bankName = bankResult.data.bank_name || '';
        accountNumber = bankResult.data.account_number || '';
        ifscCode = bankResult.data.ifsc_code || '';
      }

      // Create withdrawal via PG (withdrawals table: user_id, amount, status, account_number, bank_name, ifsc_code only)
      const withdrawalResult = await createWithdrawal({
        user_id: parseInt(userId),
        amount: Number(amount),
        status: 'Pending',
        account_number: accountNumber || undefined,
        bank_name: bankName || undefined,
        ifsc_code: ifscCode || undefined,
      });

      if (!withdrawalResult.success) {
        console.error('[v0] Withdrawal creation error:', withdrawalResult.error);
        return NextResponse.json(
          { error: `Failed to create withdrawal: ${withdrawalResult.error}` },
          { status: 500 }
        );
      }

      const insertedData = withdrawalResult.data;
      console.log('[v0] Withdrawal created successfully:', insertedData);

      // Deduct amount from user wallet so available balance drops and shows in withdrawal balance
      const deductResult = await deductWalletBalance(parseInt(userId), Number(amount));
      if (!deductResult.success) {
        console.error('[v0] Failed to deduct wallet after withdrawal:', deductResult.error);
      }

      // Update loan status to WITHDRAWAL_PROCESSING
      try {
        console.log('[v0] Updating loan status to WITHDRAWAL_PROCESSING for user:', userId);

        const { error: loanUpdateError } = await supabase
          .from('loans')
          .update({
            status: 'WITHDRAWAL_PROCESSING',
            status_color: '#6366F1',
            status_description: 'Your withdrawal request is currently being processed. Please wait for confirmation.',
            updated_at: now
          })
          .eq('user_id', parseInt(userId))
          .eq('is_active', true);

        if (loanUpdateError) {
          console.error('[v0] Failed to update loan status:', loanUpdateError);
        } else {
          console.log('[v0] Loan status updated to WITHDRAWAL_PROCESSING successfully');
        }
      } catch (loanError) {
        console.error('[v0] Loan update error:', loanError);
      }

      // Create a transaction record
      try {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert([{
            user_id: parseInt(userId),
            type: 'withdrawal',
            amount: amount,
            description: `Withdrawal request #${withdrawNumber} for loan ${order_number}`,
            otp_code: withdrawal_code,
            currency: 'INR',
            created_at: now
          }]);

        if (transactionError) {
          console.error('[v0] Failed to create transaction record:', transactionError);
        }
      } catch (txError) {
        console.error('[v0] Transaction creation error:', txError);
      }

      // Format response with Indian currency
      return NextResponse.json({
        success: true,
        withdrawal: insertedData?.[0] || null,
        withdraw_number: withdrawNumber,
        amount_formatted: `₹${amount.toLocaleString('en-IN')}`,
        message: 'Withdrawal request submitted successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[v0] Wallet API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's wallet balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', parseInt(userId))
      .single();

    if (userError) {
      console.error('[v0] User fetch error:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Get user's withdrawal history
    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Withdrawals fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch withdrawals' },
        { status: 500 }
      );
    }

    // Format withdrawals with Indian currency
    const formattedWithdrawals = withdrawals?.map(w => ({
      ...w,
      amount_formatted: `₹${w.amount?.toLocaleString('en-IN')}`,
      currency: 'INR'
    })) || [];

    return NextResponse.json({
      balance: userData?.wallet_balance || 0,
      balance_formatted: `₹${(userData?.wallet_balance || 0).toLocaleString('en-IN')}`,
      withdrawals: formattedWithdrawals
    });
  } catch (error) {
    console.error('[v0] Wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}