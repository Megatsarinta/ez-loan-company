import { NextRequest, NextResponse } from 'next/server';
import { getUserDetailsById, getLatestLoanApplicationByUserId } from '@/lib/db-operations';
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

    // Fetch user profile data
    const userResult = await getUserDetailsById(parseInt(userId));
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error },
        { status: 400 }
      );
    }

    const user = userResult.data;
    console.log('[v0] User from DB:', { id: user.id, full_name: user.full_name, phone_number: user.phone_number });

    // Try to fetch full name from loan application if user's full_name is still the phone number (direct PG to avoid schema cache)
    let fullName = user.full_name;
    if (!fullName || fullName === user.phone_number) {
      try {
        const loanResult = await getLatestLoanApplicationByUserId(parseInt(userId));
        const loanApp = loanResult.success ? loanResult.data : null;
        const personalInfo = (loanApp as any)?.personal_info;
        if (personalInfo && typeof personalInfo === 'object' && personalInfo.full_name) {
          fullName = personalInfo.full_name;
          console.log('[v0] Found full_name from loan application:', fullName);
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ full_name: fullName })
            .eq('id', user?.id);
          if (updateError) console.error('[v0] Error updating user full_name:', updateError);
        }
      } catch (e) {
        console.error('[v0] Error fetching loan application:', e);
      }
    }

    const { password_hash, ...userWithoutPassword } = user;

    // Determine credit label based on CIBIL score (300-900)
    const score = user.cibil_score ?? user.credit_score ?? 750;
    let creditLabel = 'Low credit';
    if (score > 700) {
      creditLabel = 'High credit';
    } else if (score > 300) {
      creditLabel = 'Medium credit';
    }

    console.log('[v0] Returning profile with full_name:', fullName);

    return NextResponse.json({
      profile: {
        ...userWithoutPassword,
        full_name: fullName,
        creditLabel,
        joinedDate: user.created_at,
        credit_score: score,
        cibil_score: score,
      },
    });
  } catch (error) {
    console.error('[v0] Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
