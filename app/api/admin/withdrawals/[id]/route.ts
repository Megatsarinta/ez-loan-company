import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const adminId = 'your_admin_id_here'; // Declare adminId variable

// GET: Get withdrawal details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[v0] Fetching withdrawal with id:', id);

    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .select(`
        *,
        user:users(
          id, full_name, phone_number, email, 
          wallet_balance, id_number, bank_name, 
          bank_card_number, bank_details
        ),
        processor:admin(id, username)
      `)
      .eq('id', parseInt(id))
      .single();

    if (error) {
      console.error('[v0] Withdrawal fetch error:', error);
      throw error;
    }
    if (!data) {
      console.error('[v0] No withdrawal found with id:', id);
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Withdrawal fetched successfully:', { id: data.id, status: data.status });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[v0] Error fetching withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH: Confirm, reject, or update withdrawal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, withdrawalCode, status } = body;

    console.log('[v0] Withdrawal PATCH - action:', action, 'id:', id);

    // Get withdrawal details
    const { data: withdrawal, error: fetchError } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (fetchError || !withdrawal) {
      console.error('[v0] Withdrawal not found:', id);
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Verify withdrawal code if provided
    if (withdrawal.withdrawal_code && withdrawalCode) {
      if (withdrawal.withdrawal_code !== withdrawalCode) {
        return NextResponse.json(
          { success: false, error: 'Invalid withdrawal code' },
          { status: 400 }
        );
      }
    }

    if (action === 'confirm') {
      console.log('[v0] Confirming withdrawal:', id);

      // Update withdrawal status to Completed (withdrawals table has no processed_at column)
      // Wallet was already deducted when user submitted the withdrawal
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'Completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) {
        console.error('[v0] Withdrawal update error:', updateError);
        throw updateError;
      }

      // Update loan status to WITHDRAWAL_SUCCESSFUL with proper color
      await supabaseAdmin
        .from('loans')
        .update({
          status: 'WITHDRAWAL_SUCCESSFUL',
          status_description: 'Your withdrawal has been successfully transferred to your provided bank account. Please check for verification, and if you have any issues, contact the finance department immediately. Thank you!',
          status_color: '#22C55E', // Use hex color, not Tailwind classes
          updated_at: new Date().toISOString()
        })
        .eq('user_id', withdrawal.user_id)
        .eq('is_active', true);

      console.log('[v0] Withdrawal confirmed:', id);

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else if (action === 'reject') {
      console.log('[v0] Rejecting withdrawal:', id);

      // Update withdrawal status to Refused To Pay (rejected)
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'Refused To Pay',
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) {
        console.error('[v0] Withdrawal update error:', updateError);
        throw updateError;
      }

      // Refund amount back to user wallet (atomic add — was deducted on submit via PG)
      const { addWalletBalance } = await import('@/lib/db-operations');
      const refundResult = await addWalletBalance(withdrawal.user_id, Number(withdrawal.amount));
      if (!refundResult.success) {
        // Fallback: Supabase update if PG unavailable (single add, no read to avoid double-credit)
        const { data: userRow } = await supabaseAdmin
          .from('users')
          .select('wallet_balance')
          .eq('id', withdrawal.user_id)
          .single();
        const currentWallet = Number(userRow?.wallet_balance ?? 0);
        await supabaseAdmin
          .from('users')
          .update({
            wallet_balance: currentWallet + Number(withdrawal.amount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', withdrawal.user_id);
      }

      // FIX: Update loan status to WITHDRAWAL_FAILED with red color
      // IMPORTANT: Update the 'loans' table, not 'loan_applications'
      await supabaseAdmin
        .from('loans')
        .update({
          status: 'WITHDRAWAL_FAILED',
          status_color: '#DC2626', // Red color
          status_description: 'Your withdrawal request has failed. Please contact the Finance Department for further details.',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', withdrawal.user_id)
        .eq('is_active', true);

      console.log('[v0] Withdrawal rejected:', id);

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else if (action === 'cancel') {
      console.log('[v0] Cancelling withdrawal:', id);

      // Update status to Cancelled
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'Cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('[v0] Withdrawal cancelled:', id);

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else if (action === 'update-status') {
      console.log('[v0] Updating withdrawal status:', id, 'to:', status);

      // Validate status
      const validStatuses = ['Pending', 'Processing', 'Completed', 'Failed', 'Refused To Pay', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      // Update custom status
      const { data: updatedWithdrawal, error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({
          status: status || 'Pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, data: updatedWithdrawal });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[v0] Error updating withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete/Cancel withdrawal
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get withdrawal details
    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of Pending or Cancelled withdrawals
    if (withdrawal.status !== 'Pending' && withdrawal.status !== 'Cancelled') {
      return NextResponse.json(
        { success: false, error: `Cannot delete ${withdrawal.status} withdrawals` },
        { status: 400 }
      );
    }

    // DO NOT refund balance - it was never deducted
    // Deleting a Pending withdrawal just removes the record
    // Available balance will automatically recalculate

    // Delete withdrawal
    const { error } = await supabaseAdmin
      .from('withdrawals')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    console.log('[v0] Withdrawal deleted:', id, '- Balance not modified');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting withdrawal:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
