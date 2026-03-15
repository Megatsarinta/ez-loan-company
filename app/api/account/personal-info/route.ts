import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { getLatestLoanApplicationByUserId, updateUserPersonalInfoDirect, getPersonalInfo, savePersonalInfo } from '@/lib/db-operations';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = parseInt(userId);
    let info: Record<string, any> = {};
    let contactPerson1 = { name: '', phone: '', relationship: 'Family' };
    let contactPerson2 = { name: '', phone: '', relationship: 'Family' };

    // 1) Prefer personal_info table (what user filled on personal-information page)
    const piResult = await getPersonalInfo(uid);
    if (piResult.success && piResult.data) {
      const row = piResult.data as any;
      info = {
        full_name: row.full_name || '',
        id_card_number: row.id_number || '',
        id_type: row.id_type || 'aadhaar',
        gender: row.gender || '',
        date_of_birth: row.date_of_birth || '',
        position: row.current_job || '',
        monthly_income: row.monthly_income || '',
        loan_purpose: row.loan_purpose || '',
        living_address: row.living_address || '',
        city: row.city || '',
        state: row.state || '',
        pincode: row.pincode || '',
      };
      contactPerson1 = {
        name: row.emergency_contact_name || '',
        phone: row.emergency_contact_phone || '',
        relationship: 'Family',
      };
    }

    // 2) Always merge users + loan application personal_info so account-management shows all fields from application
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, phone_number')
      .eq('id', uid)
      .single();

    if (!userError && userData) {
      if (!info.full_name) info.full_name = userData.full_name || '';
      info.phone_number = info.phone_number || userData.phone_number;
    }

    const loanResult = await getLatestLoanApplicationByUserId(uid);
    const loanApp = loanResult.success ? (loanResult.data as any) : null;
    if (loanApp?.personal_info && typeof loanApp.personal_info === 'object') {
      const p = loanApp.personal_info as any;
      if (!info.full_name) info.full_name = p.full_name || '';
      if (!info.id_card_number) info.id_card_number = p.id_card_number ?? p.id_number ?? '';
      if (!info.gender) info.gender = p.gender || '';
      if (!info.date_of_birth) info.date_of_birth = p.date_of_birth || '';
      if (!info.living_address) info.living_address = p.living_address || '';
      if (!info.loan_purpose) info.loan_purpose = p.loan_purpose || '';
      if (info.monthly_income == null || info.monthly_income === '') info.monthly_income = p.monthly_income;
      if (!info.position) info.position = p.current_job || p.position || '';
      if (!info.city) info.city = p.city || '';
      if (!info.state) info.state = p.state || '';
      if (!info.pincode) info.pincode = p.pincode || '';
      if (!contactPerson1.name) contactPerson1.name = p.emergency_contact_name || '';
      if (!contactPerson1.phone) contactPerson1.phone = p.emergency_contact_phone || '';
    }

    const transformedInfo = {
      full_name: info.full_name || '',
      phone_number: info.phone_number || '',
      id_card_number: info.id_card_number || '',
      id_type: info.id_type || 'aadhaar',
      gender: info.gender || '',
      date_of_birth: info.date_of_birth || '',
      current_job: info.position || '',
      stable_income: info.monthly_income ?? '',
      loan_purpose: info.loan_purpose || '',
      living_address: info.living_address || '',
      relative_name: contactPerson1.name || '',
      relative_phone: contactPerson1.phone || '',
      emergency_contact_name: contactPerson1.name || '',
      emergency_contact_phone: contactPerson1.phone || '',
      city: info.city || '',
      state: info.state || '',
      pincode: info.pincode || '',
      facebook_name: info.facebook_name || '',
      company_name: info.company_name || '',
      position: info.position || '',
      seniority: info.seniority || '',
      monthly_income: info.monthly_income || '',
      unit_address: info.unit_address || '',
      contact_person1: info.contact_person1,
      contact_person2: info.contact_person2,
    };

    return NextResponse.json({ info: transformedInfo });
  } catch (error) {
    console.error('[v0] Personal info GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    console.log('[v0] Updating personal info for user:', userId, body);

    // Create contact person objects
    const contactPerson1 = {
      name: body.relative_name || '',
      phone: body.relative_phone || '',
      relationship: 'Family'
    };

    // Keep existing contact_person2 if needed
    let contactPerson2 = { name: '', phone: '', relationship: 'Family' };

    // Try to fetch existing contact_person2 to preserve it
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('contact_person2')
      .eq('id', parseInt(userId))
      .single();

    if (existingUser?.contact_person2) {
      try {
        if (typeof existingUser.contact_person2 === 'string') {
          contactPerson2 = JSON.parse(existingUser.contact_person2);
        } else {
          contactPerson2 = existingUser.contact_person2;
        }
      } catch (e) {
        console.error('[v0] Error parsing existing contact_person2:', e);
      }
    }

    const updateData: any = {
      // New fields
      full_name: body.full_name,
      id_card_number: body.id_card_number,
      gender: body.gender,
      date_of_birth: body.date_of_birth,
      living_address: body.living_address,
      loan_purpose: body.loan_purpose,
      city: body.city || '',
      state: body.state || '',
      pincode: body.pincode || '',

      // Map to existing fields for backward compatibility
      position: body.current_job, // Map current_job to position
      monthly_income: body.stable_income, // Map stable_income to monthly_income

      // Keep existing fields that we're not using in new form
      facebook_name: body.facebook_name || '',
      company_name: body.company_name || '',
      seniority: body.seniority || '',
      unit_address: body.unit_address || '',

      // Update contact person 1 with relative info
      contact_person1: JSON.stringify(contactPerson1),

      // Preserve contact_person2
      contact_person2: JSON.stringify(contactPerson2),

      // Mark as completed
      personal_info_completed: true,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await updateUserPersonalInfoDirect(parseInt(userId), updateData);

    if (!result.success) {
      console.error('[v0] Update error (PG direct):', result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Also save to personal_info table so GET and account-management show full info
    const idType = (body.id_type as string) || 'national_id';
    const idNumber = (body.id_card_number || '').trim();
    const emergencyName = (body.emergency_contact_name || body.relative_name || '').trim();
    const emergencyPhone = String(body.emergency_contact_phone || body.relative_phone || '').trim();
    const monthlyIncomeNum = typeof body.monthly_income === 'number' ? body.monthly_income : (typeof body.stable_income === 'number' ? body.stable_income : parseFloat(String(body.monthly_income || body.stable_income || 0).replace(/[^0-9.-]+/g, '')) || 0);
    const saveResult = await savePersonalInfo(parseInt(userId), {
      full_name: body.full_name || '',
      id_type: idType,
      id_number: idNumber,
      gender: body.gender || '',
      date_of_birth: body.date_of_birth || '',
      current_job: body.current_job || '',
      monthly_income: monthlyIncomeNum,
      loan_purpose: body.loan_purpose || '',
      living_address: body.living_address || '',
      city: body.city || '',
      state: body.state || '',
      pincode: body.pincode || '',
      emergency_contact_name: emergencyName || 'N/A',
      emergency_contact_phone: emergencyPhone || 'N/A',
    });
    if (!saveResult.success) {
      console.error('[v0] savePersonalInfo error (non-blocking):', saveResult.error);
    }

    console.log('[v0] Personal info updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Personal information updated successfully',
      info: result.data,
    });
  } catch (error) {
    console.error('[v0] Personal info PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
