import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateSignature } from '@/lib/db-operations';
import { createClient } from '@supabase/supabase-js';

/**
 * Dedicated endpoint used by the signature page to save the borrower's signature.
 * It proxies to the same logic as the `sign_application` branch in /api/loans,
 * but with a simpler payload (applicationId + signatureUrl).
 */
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

    const { applicationId, signatureUrl } = await req.json();

    if (!applicationId || !signatureUrl) {
      return NextResponse.json(
        { error: 'Missing application ID or signature URL' },
        { status: 400 }
      );
    }

    const result = await updateSignature(applicationId, signatureUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Also update the loans table to reflect signed status (best-effort)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        await supabase
          .from('loans')
          .update({
            status: 'Under Review',
            status_description: 'Application signed and under review',
            signed_at: new Date().toISOString()
          })
          .eq('loan_application_id', applicationId);
      }
    } catch (err) {
      // Log but don't fail the main signature save
      console.error('[v0] loans table update after signature failed:', err);
    }

    return NextResponse.json({
      success: true,
      application: result.data,
    });
  } catch (error) {
    console.error('[v0] update-signature error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}