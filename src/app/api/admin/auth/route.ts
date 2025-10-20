import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminAuthCookie, clearAdminAuthCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password
    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Set authentication cookie
    await setAdminAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in admin auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    await clearAdminAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in admin logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
