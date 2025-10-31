import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Validate token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Update user password using admin client
    console.log('🔐 Attempting to update password for user:', tokenData.user_id);
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Password update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    console.log('✅ Password updated successfully for user:', tokenData.user_id);
    console.log('📧 User email:', updateData?.user?.email);

    // CRITICAL: Verify the password was actually set correctly by attempting to sign in
    console.log('🧪 Verifying password was set correctly...');
    try {
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: updateData?.user?.email || '',
        password: newPassword,
      });

      if (signInError) {
        console.error('❌ CRITICAL: Password verification failed immediately after setting!', signInError);
        console.error('❌ This means the password was NOT saved correctly in Supabase');
        return NextResponse.json(
          { error: 'Password was updated but verification failed. Please try resetting again.' },
          { status: 500 }
        );
      }

      console.log('✅ Password verification successful - login works with new password');
      
      // Sign out the test session
      await supabaseAdmin.auth.signOut();
    } catch (verifyError) {
      console.error('❌ Exception during password verification:', verifyError);
    }

    // Mark token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
