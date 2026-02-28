import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { step } = body

    if (!step) {
      return NextResponse.json(
        { error: 'Step is required' },
        { status: 400 }
      )
    }

    // Map step to database column name for Indian KYC flow
    const columnMap: Record<string, string> = {
      // Personal info steps
      personal_info: 'personal_info_completed',
      personal_info_completed: 'personal_info_completed',
      
      // KYC steps
      kyc: 'kyc_completed',
      kyc_completed: 'kyc_completed',
      kyc_upload: 'kyc_completed', // Added alias
      
      // Signature step
      signature: 'signature_completed',
      signature_completed: 'signature_completed',
      
      // Indian-specific KYC steps (if you want more granular tracking)
      aadhaar_verified: 'aadhaar_verified',
      pan_verified: 'pan_verified',
      bank_verified: 'bank_verified',
    }

    const column = columnMap[step]
    if (!column) {
      return NextResponse.json(
        { error: 'Invalid verification step' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      [column]: true,
      last_verified_at: new Date().toISOString(),
    }

    // If this is the final step (signature), also update overall verification status
    if (step === 'signature' || step === 'signature_completed') {
      updateData.is_verified = true
      updateData.verified_at = new Date().toISOString()
    }

    // Update verification status in users table
    const { error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('[v0] Error marking verification:', error)
      return NextResponse.json(
        { error: 'Failed to mark verification step' },
        { status: 400 }
      )
    }

    // Log verification step for audit
    console.log(`[v0] User ${userId} completed verification step: ${step}`)

    return NextResponse.json({ 
      success: true,
      message: `Successfully marked ${step} as completed`,
      step_completed: step
    })
  } catch (error) {
    console.error('[v0] Mark verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}