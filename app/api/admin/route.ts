import { NextRequest, NextResponse } from 'next/server';
import { adminLogin, getAllLoanApplications, updateLoanApplicationStatus, initializeAdminFromEnv, getDashboardMetrics, getAllUsers, getUserDetailsById, getPersonalInfo, getUserLoans, getUserActivityHistory, banUser, resetUserPassword, updateWithdrawalCode } from '@/lib/db-operations';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { action, username, password, applicationId, status, adminMessage, startDate, endDate, skip, limit, search, userId, otp } = await req.json();

    // Initialize admin from environment variables
    if (action === 'init') {
      const result = await initializeAdminFromEnv();
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: result.data || 'Admin initialized successfully',
      });
    }

    // Admin login
    if (action === 'login') {
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Missing credentials' },
          { status: 400 }
        );
      }

      const result = await adminLogin(username, password);
      if (!result.success) {
        console.log('[v0] Admin login failed:', result.error);
        return NextResponse.json(
          { error: result.error },
          { status: 401 }
        );
      }

      // Create admin session
      const response = NextResponse.json({
        success: true,
        data: {
          id: result.data?.id,
          username: result.data?.username,
          email: result.data?.email,
          role: result.data?.role,
        },
      });

      response.cookies.set({
        name: 'admin_id',
        value: result.data?.id?.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      response.cookies.set({
        name: 'admin_role',
        value: result.data?.role,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      console.log('[v0] Admin logged in:', result.data?.username);

      return response;
    }

    // Get all loan applications (admin only)
    if (action === 'get_all_applications') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const result = await getAllLoanApplications();
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({ applications: result.data });
    }

    // Update application status (admin only)
    if (action === 'update_status') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (!applicationId || !status) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }

      const result = await updateLoanApplicationStatus(
        applicationId,
        status,
        adminMessage
      );

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

    // Admin logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete('admin_id');
      response.cookies.delete('admin_role');
      console.log('[v0] Admin logged out');
      return response;
    }

    // Get dashboard metrics
    if (action === 'get_metrics') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      console.log('[v0] Fetching metrics with dates:', startDate, endDate);
      const result = await getDashboardMetrics(startDate, endDate);

      if (!result.success) {
        console.error('[v0] Metrics error:', result.error);
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        metrics: result.data,
      });
    }

    // Get users list
    if (action === 'get_users') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      console.log('[v0] Fetching users with skip:', skip, 'limit:', limit, 'search:', search);
      const result = await getAllUsers(skip || 0, limit || 10, search, status);

      if (!result.success) {
        console.error('[v0] Get users error:', result.error);
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        users: result.data,
        total: result.total,
      });
    }

    // Get user detail with loans and activity
    if (action === 'get_user_detail') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.log('[v0] Getting user detail for userId:', userId);
      const userResult = await getUserDetailsById(userId);
      console.log('[v0] User result:', userResult);

      if (!userResult.success) {
        return NextResponse.json({ error: userResult.error }, { status: 400 });
      }

      const loansResult = await getUserLoans(userId);
      const activityResult = await getUserActivityHistory(userId);
      const personalInfoResult = await getPersonalInfo(userId);

      console.log('[v0] Loans result:', loansResult);
      console.log('[v0] Activity result:', activityResult);

      const personalInfo = personalInfoResult.success && personalInfoResult.data ? personalInfoResult.data : null;

      return NextResponse.json({
        success: true,
        user: userResult.data,
        personalInfo,
        loans: loansResult.success ? loansResult.data : [],
        activity: activityResult.success ? activityResult.data : { transactions: [], repayments: [] },
      });
    }

    // Reset user password
    if (action === 'reset_password') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.log('[v0] Resetting password for userId:', userId);
      const result = await resetUserPassword(userId, password);
      console.log('[v0] Reset password result:', result);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.data });
    }

    // Update withdrawal OTP
    if (action === 'update_otp') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.log('[v0] Updating OTP for userId:', userId);
      const result = await updateWithdrawalCode(userId, otp);
      console.log('[v0] Update OTP result:', result);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.data });
    }

    // Ban user
    if (action === 'ban_user') {
      const cookieStore = await cookies();
      const adminId = cookieStore.get('admin_id')?.value;

      if (!adminId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.log('[v0] Banning user:', userId);
      const result = await banUser(userId);
      console.log('[v0] Ban user result:', result);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: result.data });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[v0] Admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_id')?.value;
    const adminRole = cookieStore.get('admin_role')?.value;

    if (!adminId || !adminRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: parseInt(adminId),
        role: adminRole,
      },
    });
  } catch (error) {
    console.error('[v0] Admin session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
