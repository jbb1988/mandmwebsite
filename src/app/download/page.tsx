import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Download Mind & Muscle | Free Baseball Training App',
  description: 'Download Mind & Muscle for iOS or Android. Train smarter with AI-powered mental training, position-specific drills, and video swing analysis.',
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png"
            alt="Mind & Muscle"
            className="w-32 h-32 mx-auto"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Get Mind & Muscle
        </h1>
        <p className="text-gray-300 mb-8">
          Train smarter with AI-powered coaching for baseball & softball athletes.
        </p>

        {/* App Store Buttons */}
        <div className="space-y-4">
          <a
            href="https://apps.apple.com/us/app/mind-muscle/id6754098729"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-black hover:bg-gray-800 text-white py-4 px-6 rounded-xl transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs text-gray-400">Download on the</div>
              <div className="text-lg font-semibold">App Store</div>
            </div>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.exceptionalhabit.mind_and_muscle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-black hover:bg-gray-800 text-white py-4 px-6 rounded-xl transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs text-gray-400">Get it on</div>
              <div className="text-lg font-semibold">Google Play</div>
            </div>
          </a>
        </div>

        {/* Features */}
        <div className="mt-10 text-left bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">What you get with Pro:</h2>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>7 AI coaches for complete training</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Mental toughness training</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Position-specific drills</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Video swing analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>186 game scenarios</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm">
            <span className="text-blue-400 font-semibold">Discipline the Mind.</span>{' '}
            <span className="text-orange-400 font-semibold">Dominate the Game.</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <Link href="/" className="hover:text-gray-400">mindandmuscle.ai</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
