import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_auth';
const ADMIN_COOKIE_VALUE = 'authenticated';

/**
 * Server-side: Check if the request has valid admin authentication
 * Use this in API routes to protect admin endpoints
 */
export async function isAdminAuthenticated(request?: NextRequest): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    return adminCookie?.value === ADMIN_COOKIE_VALUE;
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return false;
  }
}

/**
 * Server-side: Verify admin password and return boolean
 * Use this in login/auth routes
 */
export function verifyAdminPassword(password: string): boolean {
  const correctPassword = process.env.ADMIN_PASSWORD || process.env.PREVIEW_PASSWORD;

  if (!correctPassword) {
    console.error('ADMIN_PASSWORD not configured in environment');
    return false;
  }

  return password === correctPassword;
}

/**
 * Server-side: Set admin authentication cookie
 * Call this after successful password verification
 */
export async function setAdminAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * Server-side: Clear admin authentication cookie
 * Call this for logout functionality
 */
export async function clearAdminAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Constants for use in client-side redirects and API responses
 */
export const ADMIN_LOGIN_PATH = '/admin/login';
export const ADMIN_HOME_PATH = '/admin';
