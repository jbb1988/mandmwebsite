'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Captures referral codes from URL parameters and stores them in sessionStorage
 * This allows the referral code to persist across page navigation
 */
export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a ref parameter in the current URL
    const refParam = searchParams.get('ref');

    if (refParam) {
      // Store it in sessionStorage so it persists across page navigation
      sessionStorage.setItem('tolt_referral_code', refParam);
      console.log('Referral code captured:', refParam);
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
