'use client';

import { useEffect } from 'react';

export default function AndroidAppRedirect() {
  useEffect(() => {
    window.location.href = 'https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="text-center text-white">
        <p className="text-xl">Redirecting to Google Play...</p>
        <p className="text-sm text-gray-400 mt-2">
          If you're not redirected, <a href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle" className="text-blue-400 underline">click here</a>
        </p>
      </div>
    </div>
  );
}
