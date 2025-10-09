'use client';

import { useEffect } from 'react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function PartnerResourcesRedirect() {
  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://app.tolt.io';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        <LiquidGlass variant="orange" glow={true} className="p-12">
          <div className="mb-8">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-solar-surge-orange to-neon-cortex-blue flex items-center justify-center">
                <ExternalLink className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
                Resources Moved!
              </span>
            </h1>

            <p className="text-xl text-text-secondary mb-8">
              All partner resources are now available in your secure Tolt dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <a href="https://app.tolt.io" className="block">
              <LiquidButton variant="orange" size="lg" fullWidth>
                <div className="flex items-center justify-center gap-2">
                  Access Partner Dashboard
                  <ArrowRight className="w-5 h-5" />
                </div>
              </LiquidButton>
            </a>

            <p className="text-sm text-text-secondary">
              Redirecting automatically in 3 seconds...
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-text-secondary mb-4">
              Not a partner yet?
            </p>
            <a href="/partner-program" className="inline-block">
              <LiquidButton variant="blue" size="sm">
                Apply to Partner Program
              </LiquidButton>
            </a>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
