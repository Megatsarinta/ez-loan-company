import { NextRequest, NextResponse } from 'next/server';
import { registerUser, loginUser } from '@/lib/db-operations';
import { getClientIP } from '@/lib/ip-location';

// Helper function to validate Indian phone number
function validateIndianPhoneNumber(phone: string): boolean {
  // Check if it's a 10-digit number (after removing leading zero if present)
  const cleanPhone = phone.startsWith('0') ? phone.substring(1) : phone;
  return /^\d{10}$/.test(cleanPhone);
}

// Helper function to normalize phone number for storage (with leading zero)
function normalizePhoneForStorage(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it's a 10-digit number, add leading zero
  if (digits.length === 10) {
    return `0${digits}`;
  }
  
  // If it's 11 digits and starts with 0, return as is
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits;
  }
  
  // If it has country code (+91), extract the 10 digits and add leading zero
  if (digits.length === 12 && digits.startsWith('91')) {
    return `0${digits.substring(2)}`;
  }
  
  // Return as is if no match (should not happen with validation)
  return digits;
}

// Helper function to get display format (for logging/debugging)
function getDisplayFormat(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91 ${digits.substring(1)}`; // +91 9876543210
  }
  return phone;
}

export async function POST(req: NextRequest) {
  try {
    const { action, phoneNumber, password, fullName } = await req.json();

    // Log incoming request for debugging
    console.log(`Auth ${action} attempt:`, {
      receivedPhone: phoneNumber,
      displayFormat: getDisplayFormat(phoneNumber)
    });

    if (action === 'register') {
      // Validate inputs
      if (!phoneNumber || !password || !fullName) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate phone number (should be 10 digits from form)
      if (!validateIndianPhoneNumber(phoneNumber)) {
        return NextResponse.json(
          { error: 'Please enter a valid 10-digit Indian mobile number starting with 6,7,8, or 9' },
          { status: 400 }
        );
      }

      // Normalize phone number to storage format (with leading zero)
      const normalizedPhone = normalizePhoneForStorage(phoneNumber);
      
      console.log('Registration processing:', {
        received: phoneNumber,
        normalized: normalizedPhone,
        display: getDisplayFormat(normalizedPhone)
      });

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      // Register with normalized phone number (format: 0XXXXXXXXX)
      const result = await registerUser(normalizedPhone, password, fullName);
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Registration failed';
        // Check if it's a duplicate phone error
        if (errorMessage.includes('already exists')) {
          return NextResponse.json(
            { error: 'This phone number is already registered. Please login instead.' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }

      // Don't return password hash
      const { password_hash, ...userWithoutPassword } = result.data;
      
      console.log('Registration successful:', {
        userId: result.data.id,
        phone: result.data.phone_number,
        displayFormat: getDisplayFormat(result.data.phone_number)
      });

      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      });
    }

    if (action === 'login') {
      if (!phoneNumber || !password) {
        return NextResponse.json(
          { error: 'Missing phone number or password' },
          { status: 400 }
        );
      }

      // Normalize phone number to storage format (with leading zero)
      const normalizedPhone = normalizePhoneForStorage(phoneNumber);
      
      console.log('Login processing:', {
        received: phoneNumber,
        normalized: normalizedPhone,
        display: getDisplayFormat(normalizedPhone)
      });

      // Login with normalized phone number
      const result = await loginUser(normalizedPhone, password);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Invalid phone number or password' },
          { status: 401 }
        );
      }

      if (result.data.is_banned === true) {
        return NextResponse.json(
          { error: 'Your account has been disabled. Please contact support.' },
          { status: 403 }
        );
      }

      // Track login with client IP from the incoming request (server-side fetch would see server IP)
      const clientIp = getClientIP(req);
      fetch(new URL('/api/track-login', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: result.data.id, ipAddress: clientIp }),
      }).catch(err => console.error('Failed to track login:', err));

      // Create session cookie - Note: changed credit_score to cibil_score
      const response = NextResponse.json({
        success: true,
        user: {
          id: result.data.id,
          phone_number: result.data.phone_number,
          full_name: result.data.full_name,
          cibil_score: result.data.cibil_score, // Changed from credit_score
          wallet_balance: result.data.wallet_balance,
        },
      });

      // Store user ID in session
      response.cookies.set({
        name: 'user_id',
        value: result.data.id.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      console.log('Login successful:', {
        userId: result.data.id,
        phone: result.data.phone_number,
        displayFormat: getDisplayFormat(result.data.phone_number)
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}