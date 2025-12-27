'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogAuditRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to System Monitor with Log Audit tab
    router.replace('/admin/system?tab=log-audit');
  }, [router]);

  return (
    <div className="p-8 text-white flex items-center justify-center min-h-screen">
      <p className="text-white/60">Redirecting to System Monitor...</p>
    </div>
  );
}
