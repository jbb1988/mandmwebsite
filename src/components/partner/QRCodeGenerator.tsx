'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import {
  Download,
  Link as LinkIcon,
  QrCode,
  Building2,
  Trophy,
  Users,
  CreditCard,
  Share2,
  Mail
} from 'lucide-react';

const useCases = [
  {
    icon: Building2,
    title: 'Facility Banners',
    description: 'Print large banners for batting cages, training facilities, or indoor complexes',
    tip: 'Print at least 2×2 inches for scanning from 3+ feet',
  },
  {
    icon: Trophy,
    title: 'Tournament Signage',
    description: 'Place at registration tables, dugouts, or concession stands during tournaments',
    tip: 'Laminate for outdoor durability',
  },
  {
    icon: Users,
    title: 'League Materials',
    description: 'Include in league welcome packets, team rosters, or parent handouts',
    tip: 'Works great on printed flyers',
  },
  {
    icon: CreditCard,
    title: 'Business Cards',
    description: 'Add to your coaching or training business cards for easy scanning',
    tip: 'Minimum 0.8×0.8 inches for cards',
  },
  {
    icon: Share2,
    title: 'Social Media',
    description: 'Share in Instagram stories, Facebook posts, or team group chats',
    tip: 'PNG format works best',
  },
  {
    icon: Mail,
    title: 'Email Signatures',
    description: 'Embed in your email signature for passive referrals',
    tip: 'Keep it small but scannable',
  },
];

export function QRCodeGenerator() {
  const [url, setUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code whenever URL changes
  useEffect(() => {
    if (url.trim()) {
      generateQRCode(url);
    } else {
      setQrCodeDataUrl('');
    }
  }, [url]);

  const generateQRCode = async (text: string) => {
    try {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Generate QR code to canvas with Mind & Muscle branding colors
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#02124A', // deep-orbit-navy
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H', // High error correction for logo overlay
      });

      // Load and overlay logo
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = '/assets/images/logo.png';

      logo.onload = () => {
        // Calculate logo size (25% of QR code size for optimal scanning)
        const logoSize = size * 0.25;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Draw white circular background for logo
        const bgRadius = logoSize * 0.6;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, bgRadius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw logo
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeDataUrl(dataUrl);
      };

      logo.onerror = () => {
        // If logo fails to load, just use QR code without logo
        console.warn('Logo failed to load, using QR code without logo');
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeDataUrl(dataUrl);
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadPNG = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = 'mind-muscle-qr-code.png';
    link.href = qrCodeDataUrl;
    link.click();
  };

  const downloadSVG = async () => {
    if (!url.trim()) return;

    try {
      const svgString = await QRCode.toString(url, {
        type: 'svg',
        width: 400,
        margin: 2,
        color: {
          dark: '#02124A',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url_blob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'mind-muscle-qr-code.svg';
      link.href = url_blob;
      link.click();
      URL.revokeObjectURL(url_blob);
    } catch (error) {
      console.error('Error generating SVG:', error);
    }
  };

  return (
    <div id="qr-generator">
      {/* QR Code Generator */}
      <LiquidGlass variant="orange" glow={true} className="p-8 mb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-solar-surge-orange to-neon-cortex-blue flex items-center justify-center">
              <QrCode className="w-8 h-8 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-black mb-2">
            <span className="bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
              Generate Your QR Code
            </span>
          </h3>

          <p className="text-text-secondary">
            Create branded QR codes with the Mind & Muscle logo for your referral link
          </p>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <label htmlFor="qr-url-input" className="block text-sm font-semibold text-text-primary mb-2">
            Your Referral Link
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-text-secondary" />
            </div>
            <input
              id="qr-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://mindandmuscle.ai/?ref=your-code"
              className="w-full pl-12 pr-4 py-4 bg-card-background-darker border-2 border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-solar-surge-orange transition-colors"
            />
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Get your referral link from the{' '}
            <a
              href="https://mind-and-muscle.tolt.io"
              className="text-solar-surge-orange hover:text-muscle-primary font-semibold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              partner dashboard
            </a>
          </p>
        </div>

        {/* Hidden canvas for QR code generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* QR Code Preview */}
        {qrCodeDataUrl ? (
          <div>
            <div className="flex justify-center mb-6">
              <div className="bg-white p-6 rounded-xl shadow-liquid-glow-orange">
                <img
                  src={qrCodeDataUrl}
                  alt="Generated QR Code"
                  className="w-full max-w-[280px]"
                />
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiquidButton
                variant="orange"
                size="lg"
                fullWidth
                onClick={downloadPNG}
              >
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download PNG
                </div>
              </LiquidButton>

              <LiquidButton
                variant="blue"
                size="lg"
                fullWidth
                onClick={downloadSVG}
              >
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download SVG
                </div>
              </LiquidButton>
            </div>

            <p className="text-xs text-text-secondary text-center mt-4">
              PNG is best for digital (email, social). SVG is best for print (scales perfectly).
            </p>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-lg">
            <QrCode className="w-12 h-12 text-text-secondary/50 mx-auto mb-3" />
            <p className="text-text-secondary text-sm">
              Enter your referral link above to generate a QR code
            </p>
          </div>
        )}
      </LiquidGlass>

      {/* Use Case Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {useCases.map((useCase, index) => {
          const Icon = useCase.icon;
          return (
            <LiquidGlass
              key={index}
              variant={index % 2 === 0 ? 'blue' : 'orange'}
              className="p-5"
            >
              <div className={`inline-block p-2 rounded-lg mb-3 ${
                index % 2 === 0
                  ? 'bg-neon-cortex-blue/20'
                  : 'bg-solar-surge-orange/20'
              }`}>
                <Icon className={`w-5 h-5 ${
                  index % 2 === 0
                    ? 'text-neon-cortex-blue'
                    : 'text-solar-surge-orange'
                }`} />
              </div>
              <h4 className="text-base font-bold mb-1">{useCase.title}</h4>
              <p className="text-text-secondary text-sm mb-2">{useCase.description}</p>
              <p className="text-xs text-text-secondary/70 italic">{useCase.tip}</p>
            </LiquidGlass>
          );
        })}
      </div>
    </div>
  );
}
