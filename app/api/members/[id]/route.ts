import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { logAdminActivity, getLatestLoanApplicationByUserId, updateUserCibilScore, updateUserBannedStatus, getBankDetails, getPersonalInfo, updatePersonalInfoIdAndName, saveBankDetailsPg } from '@/lib/db-operations';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid member ID' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('[v0] Supabase error:', error);
      throw error;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // 1) Prefer bank_details table (where user saves from Account Management)
    let bankName: string | null = null;
    let bankCardNumber = user.bank_card_number || null;
    let accountNumber: string | null = null;
    let ifscCode: string | null = null;
    const bankDetailsRow = await getBankDetails(user.id);
    if (bankDetailsRow.success && bankDetailsRow.data) {
      const b = bankDetailsRow.data as any;
      bankName = b.bank_name || null;
      accountNumber = b.account_number || null;
      ifscCode = b.ifsc_code || null;
    }

    // 2) Fallback: users.bank_details JSON and users.bank_name
    if (!bankName && !accountNumber && user.bank_details && typeof user.bank_details === 'object') {
      const bankDetails = user.bank_details as any;
      bankName = bankDetails.bankName || bankDetails.bank_name || user.bank_name || null;
      accountNumber = bankDetails.accountNumber || bankDetails.account_number || null;
      bankCardNumber = bankDetails.bankCardNumber || bankCardNumber;
    }
    if (!bankName) bankName = user.bank_name || null;

    // 3) Fallback: withdrawals table
    if (!bankName && !accountNumber) {
      const { data: withdrawalData } = await supabaseAdmin
        .from('withdrawals')
        .select('bank_name, account_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      if (withdrawalData) {
        bankName = withdrawalData.bank_name;
        accountNumber = withdrawalData.account_number;
      }
    }

    const loanResult = await getLatestLoanApplicationByUserId(user.id);
    const loanApp = loanResult.success ? loanResult.data : null;

    // Prefer personal_info table; fallback to loan application JSON
    let personalInfoData: Record<string, unknown> = {};
    const personalInfoResult = await getPersonalInfo(user.id);
    if (personalInfoResult.success && personalInfoResult.data) {
      personalInfoData = personalInfoResult.data as Record<string, unknown>;
    }
    if (Object.keys(personalInfoData).length === 0 && loanApp?.personal_info && typeof loanApp.personal_info === 'object') {
      personalInfoData = loanApp.personal_info as Record<string, unknown>;
    }

    // Build ID photos array from KYC documents
    const idPhotos = [];
    if (loanApp?.kyc_front_url) {
      idPhotos.push({ id: 1, url: loanApp.kyc_front_url, type: 'front' });
    }
    if (loanApp?.kyc_back_url) {
      idPhotos.push({ id: 2, url: loanApp.kyc_back_url, type: 'back' });
    }
    if (loanApp?.selfie_url) {
      idPhotos.push({ id: 3, url: loanApp.selfie_url, type: 'selfie' });
    }

    const personal = personalInfoData as any;
    const registrationArea =
      (user.city && user.country) ? `${user.city}, ${user.country}` :
      user.city || user.country ||
      (personal?.city && personal?.state ? `${personal.city}, ${personal.state}` : null) ||
      personal?.living_address || 'Unknown';
    const ipDisplay = user.ip_address || user.last_login_ip || 'N/A';

    const transformedUser = {
      id: user.id,
      name: user.full_name || personal?.full_name || 'Unknown',
      username: user.phone_number,
      email: user.email,
      score: user.cibil_score ?? user.credit_score ?? 500,
      wallet: user.wallet_balance || 0,
      withdrawal_code: user.withdrawal_otp || null,
      registration_date: user.created_at,
      status: user.is_banned ? 'disabled' : 'active',
      registration_area: registrationArea,
      ip_address: ipDisplay,
      // 🔴 ADD THESE THREE LINES
      last_login_location: user.last_login_location,
      last_login_ip: user.last_login_ip,
      last_login_at: user.last_login_at,
      // 🔴
      note: user.notes || null,
      // Comprehensive member data
      full_name: user.full_name || personal?.full_name || 'Unknown',
      facebook_name: personal?.facebook_name || user.facebook_name || null,
      id_card_number: (personal as any)?.id_number ?? (personal as any)?.id_card_number ?? user.id_card_number ?? null,
      id_photos: idPhotos.length > 0 ? idPhotos : (user.id_photos || []),
      living_address: personal?.living_address || user.living_address || null,
      loan_purpose: personal?.loan_purpose || user.loan_purpose || null,
      company_name: personal?.company_name || user.company_name || null,
      position: personal?.position || user.position || null,
      seniority: personal?.seniority || user.seniority || null,
      monthly_income: personal?.monthly_income ?? user.monthly_income ?? 0,
      unit_address: personal?.unit_address || user.unit_address || null,
      contact_person1: personal?.contact_person1 || user.contact_person1 || null,
      contact_person2: personal?.contact_person2 || user.contact_person2 || null,
      signature_image: loanApp?.signature_url || user.signature_image || null,
      gender: (personalInfoData as any)?.gender || user.gender || null,
      date_of_birth: (personalInfoData as any)?.date_of_birth || user.date_of_birth || null,
      current_job: (personalInfoData as any)?.current_job ?? (personal as any)?.current_job ?? user.current_job ?? null,
      relative_name: (personalInfoData as any)?.emergency_contact_name ?? (personalInfoData as any)?.relative_name ?? user.relative_name ?? ((personalInfoData as any)?.contact_person1?.name) ?? null,
      relative_phone: (personalInfoData as any)?.emergency_contact_phone ?? (personalInfoData as any)?.relative_phone ?? user.relative_phone ?? ((personalInfoData as any)?.contact_person1?.phone) ?? null,
      bank_name: bankName,
      bank_card_number: bankCardNumber,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      bank_details: {
        bankName: bankName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        setBy: user.bank_details?.setBy || null,
        updatedAt: user.bank_details?.updatedAt || null,
      },
      // System data
      personalInfoCompleted: user.personal_info_completed,
      kycCompleted: user.kyc_completed,
      signatureCompleted: user.signature_completed,
    };

    return NextResponse.json({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error('[v0] Member detail API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch member',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid member ID' },
        { status: 400 }
      );
    }

    console.log('[v0] PATCH request for member:', memberId);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log('[v0] PATCH body:', body);
    const { action, ...updates } = body;

    const dbUpdates: any = {};
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value || 'Admin';
    let adminUsername = 'Unknown Admin';
    if (adminId) {
      const { data: adminRow } = await supabaseAdmin.from('admin').select('username').eq('id', adminId).single();
      if (adminRow?.username) adminUsername = adminRow.username;
    }

    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('wallet_balance, withdrawal_otp, is_banned, full_name, bank_name, bank_details')
      .eq('id', memberId)
      .single();
    const oldWallet = currentUser?.wallet_balance ?? 0;

    // Handle different action types with proper mapping
    if (action === 'wallet' && updates.amount !== undefined) {
      dbUpdates.wallet_balance = parseFloat(updates.amount);
      console.log('[v0] Updating wallet:', dbUpdates.wallet_balance);
      
      const { error: historyError } = await supabaseAdmin
        .from('wallet_modification_history')
        .insert({
          user_id: memberId,
          admin_id: adminId ? parseInt(adminId) : null,
          admin_username: adminUsername,
          old_balance: oldWallet,
          new_balance: parseFloat(updates.amount),
          amount_changed: parseFloat(updates.amount) - oldWallet,
          reason: updates.reason || 'Admin wallet modification',
          created_at: new Date().toISOString(),
        });
      if (historyError) console.error('[v0] Error logging wallet modification:', historyError);

      await logAdminActivity(
        adminId ? parseInt(adminId, 10) : null,
        adminUsername,
        adminRole,
        memberId,
        'wallet_update',
        String(oldWallet),
        String(parseFloat(updates.amount)),
        updates.reason || 'Balance updated by admin'
      );
    } else if (action === 'score' && updates.score !== undefined) {
      dbUpdates.cibil_score = parseInt(updates.score, 10);
      console.log('[v0] Updating cibil_score:', dbUpdates.cibil_score);
    } else if (action === 'withdrawal-code' && updates.code !== undefined) {
      dbUpdates.withdrawal_otp = updates.code;
      console.log('[v0] Updating withdrawal code');
      Promise.resolve().then(() =>
        logAdminActivity(
          adminId ? parseInt(adminId, 10) : null,
          adminUsername,
          adminRole,
          memberId,
          'code_update',
          currentUser?.withdrawal_otp ?? null,
          updates.code,
          'Withdrawal code updated by admin'
        )
      ).catch(() => {});
    } else if (action === 'password' && updates.password !== undefined) {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      dbUpdates.password_hash = hashedPassword;
      console.log('[v0] Updating password with proper bcrypt hashing');
    } else if (action === 'bank') {
      console.log('[v0] Updating bank details via saveBankDetailsPg (account_type + ifsc required)');
      const bankName = updates.bankName ?? '';
      const accountNumber = updates.accountNumber ?? '';
      const ifscCode = updates.ifscCode ?? updates.ifsc_code ?? '';

      const pgResult = await saveBankDetailsPg(memberId, {
        account_type: 'savings',
        bank_name: bankName,
        branch: updates.branch ?? '',
        account_number: accountNumber,
        ifsc_code: ifscCode,
        account_holder_name: updates.accountHolderName ?? currentUser?.full_name ?? '',
      });

      if (!pgResult.success) {
        return NextResponse.json(
          { success: false, error: pgResult.error || 'Database update failed' },
          { status: 400 }
        );
      }

      Promise.resolve().then(() =>
        logAdminActivity(
          adminId ? parseInt(adminId, 10) : null,
          adminUsername,
          adminRole,
          memberId,
          'bank_info',
          currentUser?.bank_name ? JSON.stringify({ bank_name: currentUser.bank_name }) : null,
          JSON.stringify({ bank_name: bankName, account_number: accountNumber, ifsc_code: ifscCode }),
          'Bank details updated by admin'
        )
      ).catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Member updated successfully',
        data: { ...currentUser, bank_name: bankName, account_number: accountNumber, ifsc_code: ifscCode },
      });
    } else if (action === 'identity') {
      console.log('[v0] Updating identity via personal_info table (PG)');
      const newFullName = updates.actualName ?? currentUser?.full_name ?? '';
      const newIdNumber = updates.idNumber ?? '';

      const piResult = await updatePersonalInfoIdAndName(memberId, newIdNumber, newFullName);
      if (!piResult.success) {
        return NextResponse.json(
          { success: false, error: `Database update failed: ${piResult.error}` },
          { status: 400 }
        );
      }

      if (updates.actualName) {
        dbUpdates.full_name = updates.actualName;
      }

      Promise.resolve().then(() =>
        logAdminActivity(
          adminId ? parseInt(adminId, 10) : null,
          adminUsername,
          adminRole,
          memberId,
          'personal_info',
          JSON.stringify({ full_name: currentUser?.full_name }),
          JSON.stringify({ full_name: newFullName, id_number: newIdNumber }),
          'Personal info updated by admin'
        )
      ).catch(() => {});

      if (Object.keys(dbUpdates).length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Member updated successfully',
          data: { ...currentUser, full_name: newFullName },
        });
      }
    } else if (action === 'status') {
      const isBanning = updates.status === 'disabled' || updates.status === true;
      dbUpdates.is_banned = isBanning;
      console.log('[v0] Updating status to:', isBanning ? 'banned' : 'active');
      Promise.resolve().then(() =>
        logAdminActivity(
          adminId ? parseInt(adminId, 10) : null,
          adminUsername,
          adminRole,
          memberId,
          isBanning ? 'ban' : 'unban',
          String(!!currentUser?.is_banned),
          String(isBanning),
          isBanning ? 'User banned by admin' : 'User unbanned by admin'
        )
      ).catch(() => {});
    } else {
      // Generic update - map common field names
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'action') {
          dbUpdates[key] = value;
        }
      });
      console.log('[v0] Generic update:', dbUpdates);
    }

    if (Object.keys(dbUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    console.log('[v0] Database updates:', dbUpdates);

    let data: any = null;
    let error: any = null;
    if (Object.keys(dbUpdates).length > 0) {
      const { data: supabaseData, error: supabaseError } = await supabaseAdmin
        .from('users')
        .update(dbUpdates)
        .eq('id', memberId)
        .select()
        .single();
      data = supabaseData;
      error = supabaseError;
    } else {
      data = currentUser;
    }

    if (error) {
      const errMsg = (error.message || '').toLowerCase();
      if (action === 'score' && (errMsg.includes('credit_score') || errMsg.includes('cibil_score') || errMsg.includes('schema cache'))) {
        const scoreResult = await updateUserCibilScore(memberId, parseInt(String(updates.score), 10));
        if (scoreResult.success) {
          return NextResponse.json({
            success: true,
            message: 'Member updated successfully',
            data: { ...currentUser, cibil_score: updates.score },
          });
        }
      }
      if (action === 'status' && (errMsg.includes('is_banned') || errMsg.includes('schema cache'))) {
        const isBanning = updates.status === 'disabled' || updates.status === true;
        const banResult = await updateUserBannedStatus(memberId, isBanning);
        if (banResult.success) {
          return NextResponse.json({
            success: true,
            message: 'Member updated successfully',
            data: { ...currentUser, is_banned: isBanning },
          });
        }
      }
      console.error('[v0] Supabase update error:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Database update failed: ${error.message}`,
        },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Member not found after update' },
        { status: 404 }
      );
    }

    console.log('[v0] Member updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data,
    });
  } catch (error) {
    console.error('[v0] Member update API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update member';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
