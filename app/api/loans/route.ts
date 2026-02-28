import { NextRequest, NextResponse } from 'next/server';
import {
  createLoanApplication,
  uploadKYCDocuments,
  getActiveApplicationForUser,
  getPersonalInfo,
  updateSignature,
  getAllLoanApplications,
  getUserByIdForLoan,
  insertLoanRecord,
  getActiveLoansForUser,
  updateLoanApplicationKycUrlField,
} from '@/lib/db-operations';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

    // Get user's active application
    if (action === 'get_user_application') {
      const result = await getActiveApplicationForUser(parseInt(userId));

      if (result.data) {
        result.data.amount_formatted = `₹${result.data.amount_requested?.toLocaleString('en-IN')}`;
        result.data.currency = 'INR';

        // So "Apply Quick Loan" doesn't ask for personal info again: merge personal_info from personal_info table when application has none
        const app = result.data as any;
        const hasPersonalInfo = app.personal_info && typeof app.personal_info === 'object' && Object.keys(app.personal_info).length > 0;
        if (!hasPersonalInfo) {
          const piResult = await getPersonalInfo(parseInt(userId));
          if (piResult.success && piResult.data) {
            const row = piResult.data as any;
            app.personal_info = {
              full_name: row.full_name || '',
              id_card_number: row.id_number || row.id_card_number || '',
              gender: row.gender || '',
              date_of_birth: row.date_of_birth || '',
              current_job: row.current_job || '',
              monthly_income: row.monthly_income ?? '',
              loan_purpose: row.loan_purpose || '',
              living_address: row.living_address || '',
              city: row.city || '',
              state: row.state || '',
              pincode: row.pincode || '',
              emergency_contact_name: row.emergency_contact_name || '',
              emergency_contact_phone: row.emergency_contact_phone || '',
            };
          }
        }
      }

      return NextResponse.json({ application: result.data });
    }

    const applicationId = url.searchParams.get('id');

    if (applicationId) {
      // Get specific application - verify ownership
      const { data: allApps } = await getAllLoanApplications();
      const app = allApps?.find(
        (a: any) => a.id === parseInt(applicationId) && a.user_id === parseInt(userId)
      );

      // Format amount in ₹
      if (app) {
        app.amount_formatted = `₹${app.amount_requested?.toLocaleString('en-IN')}`;
        app.currency = 'INR';
      }

      return NextResponse.json({ application: app });
    }

    // Default: Return user's active loans from loans table (direct PG to avoid schema cache)
    const loansResult = await getActiveLoansForUser(parseInt(userId));
    const data = loansResult.success ? loansResult.data : [];

    const formattedLoans = (Array.isArray(data) ? data : []).map((loan: any) => ({
      ...loan,
      amount_formatted: `₹${Number(loan.loan_amount || 0).toLocaleString('en-IN')}`,
      currency: 'INR'
    }));

    return NextResponse.json({ loans: formattedLoans });
  } catch (error) {
    console.error('Get application error:', error);
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

    const {
      action,
      documentNumber,
      amountRequested,
      loanTermMonths,
      interestRate,
      applicationId,
      status,
      adminMessage,
      frontUrl,
      backUrl,
      selfieUrl,
      personalInfo,
      signatureUrl,
      type,
      url
    } = await req.json();

    if (action === 'create') {
      if (!documentNumber || !amountRequested || !loanTermMonths) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate Indian loan amount range (₹1,00,000 to ₹1,00,00,000)
      if (amountRequested < 100000 || amountRequested > 10000000) {
        return NextResponse.json(
          { error: 'Loan amount must be between ₹1,00,000 and ₹1,00,00,000' },
          { status: 400 }
        );
      }

      // Validate loan term (must be 6, 12, 24, or 36 months)
      if (![6, 12, 24, 36].includes(loanTermMonths)) {
        return NextResponse.json(
          { error: 'Loan term must be 6, 12, 24, or 36 months' },
          { status: 400 }
        );
      }

      console.log('[v0] Creating loan application for user:', userId);

      const result = await createLoanApplication(
        parseInt(userId),
        documentNumber,
        amountRequested,
        loanTermMonths,
        interestRate ?? 0.005 // Default 0.5% per month
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      const loanApplicationId = result.data.id;
      console.log('[v0] Created loan application with ID:', loanApplicationId);

      const annualRate = (interestRate ?? 0.005) * 12 * 100;
      const userData = await getUserByIdForLoan(parseInt(userId));

      if (userData?.full_name) {
        console.log('[v0] Creating loan record with document number:', documentNumber);
        const insertResult = await insertLoanRecord({
          id: loanApplicationId,
          user_id: parseInt(userId),
          document_number: documentNumber,
          order_number: documentNumber,
          loan_amount: amountRequested,
          interest_rate: interestRate ?? 0.005,
          annual_rate: annualRate,
          loan_period_months: loanTermMonths,
          status: 'Under Review',
          status_color: '#F59E0B',
          status_description: 'Your application has been received and is now under review. Our team is carefully assessing your information. You will receive an update within 24 hours.',
        });
        if (!insertResult.success) {
          console.error('[v0] Loan record creation error:', insertResult.error);
        } else {
          console.log('[v0] Loan record created successfully with ID:', loanApplicationId);
        }
      } else {
        console.log('[v0] Skipping loan record creation - no valid user data found for user:', userId);
      }

      // Format response with Indian currency
      const formattedApplication = {
        ...result.data,
        amount_formatted: `₹${amountRequested.toLocaleString('en-IN')}`,
        currency: 'INR'
      };

      return NextResponse.json({
        success: true,
        application: formattedApplication,
      });
    }

    if (action === 'update_kyc_url') {
      if (!applicationId || !type || !url) {
        return NextResponse.json(
          { error: 'Missing application ID, type, or URL' },
          { status: 400 }
        );
      }

      if (!url.startsWith('data:image') && !url.startsWith('https://')) {
        return NextResponse.json(
          { error: 'Invalid image URL format' },
          { status: 400 }
        );
      }

      const kycType = type === 'front' ? 'front' : type === 'back' ? 'back' : 'selfie';
      const result = await updateLoanApplicationKycUrlField(parseInt(applicationId), kycType, url);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        application: result.data,
      });
    }

    if (action === 'upload_kyc') {
      if (!applicationId || !frontUrl || !backUrl || !selfieUrl) {
        return NextResponse.json(
          { error: 'Missing KYC documents' },
          { status: 400 }
        );
      }

      const result = await uploadKYCDocuments(
        applicationId,
        frontUrl,
        backUrl,
        selfieUrl,

      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Also update the loans table with borrower information
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      if (personalInfo) {
        const updateData: any = {};

        if (personalInfo.id_card_number) {
          // Check if it's Aadhaar or PAN based on length/format
          if (personalInfo.id_card_number.length === 12) {
            updateData.borrower_aadhaar = personalInfo.id_card_number;
          } else if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(personalInfo.id_card_number)) {
            updateData.borrower_pan = personalInfo.id_card_number;
          }
        }

        if (personalInfo.full_name) {
          updateData.borrower_name = personalInfo.full_name;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('loans')
            .update(updateData)
            .eq('loan_application_id', applicationId);
        }
      }

      return NextResponse.json({
        success: true,
        application: result.data,
      });
    }

    if (action === 'update_personal_info') {
      if (!applicationId || !personalInfo) {
        return NextResponse.json(
          { error: 'Missing application ID or personal info' },
          { status: 400 }
        );
      }

      const result = await uploadKYCDocuments(
        applicationId,
        '', // Keep existing front URL
        '', // Keep existing back URL
        '', // Keep existing selfie URL

      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Also update the loans table with borrower information
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const updateData: any = {};

      if (personalInfo.id_card_number) {
        if (personalInfo.id_card_number.length === 12) {
          updateData.borrower_aadhaar = personalInfo.id_card_number;
        } else if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(personalInfo.id_card_number)) {
          updateData.borrower_pan = personalInfo.id_card_number;
        }
      }

      if (personalInfo.full_name) {
        updateData.borrower_name = personalInfo.full_name;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('loans')
          .update(updateData)
          .eq('loan_application_id', applicationId);
      }

      return NextResponse.json({
        success: true,
        application: result.data,
      });
    }

    if (action === 'sign_application') {
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

      // Also update the loans table to reflect signed status
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabase
        .from('loans')
        .update({
          status: 'Under Review',
          status_description: 'Application signed and under review',
          signed_at: new Date().toISOString()
        })
        .eq('loan_application_id', applicationId);

      return NextResponse.json({
        success: true,
        application: result.data,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Loan application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}