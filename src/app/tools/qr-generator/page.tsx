'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { Download, Link as LinkIcon, QrCode } from 'lucide-react';

export default function QRGeneratorPage() {
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
      // Generate QR code with Mind & Muscle branding colors
      const dataUrl = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: '#02124A', // deep-orbit-navy
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H', // High error correction for logo overlay
      });
      setQrCodeDataUrl(dataUrl);

      // Also render to canvas for SVG export
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: 400,
          margin: 2,
          color: {
            dark: '#02124A',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
      }
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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl w-full">
        <LiquidGlass variant="orange" glow={true} className="p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-solar-surge-orange to-neon-cortex-blue flex items-center justify-center">
                <QrCode className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-solar-surge-orange to-neon-cortex-blue bg-clip-text text-transparent">
                QR Code Generator
              </span>
            </h1>

            <p className="text-lg text-text-secondary">
              Convert your Mind & Muscle referral link into a scannable QR code
            </p>
          </div>

          {/* Input Field */}
          <div className="mb-8">
            <label htmlFor="url-input" className="block text-sm font-semibold text-text-primary mb-2">
              Your Referral Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://mindandmuscle.ai/?ref=your-code"
                className="w-full pl-12 pr-4 py-4 bg-card-background-darker border-2 border-white/10 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-solar-surge-orange transition-colors"
              />
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Paste your Tolt referral link from the dashboard
            </p>
          </div>

          {/* QR Code Preview */}
          {qrCodeDataUrl ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4 text-center">
                Your QR Code
              </h2>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-6 rounded-xl shadow-liquid-glow-orange">
                  <img
                    src={qrCodeDataUrl}
                    alt="Generated QR Code"
                    className="w-full max-w-sm"
                  />
                </div>
              </div>

              {/* Hidden canvas for SVG generation */}
              <canvas ref={canvasRef} className="hidden" />

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

              {/* Usage Tips */}
              <div className="mt-8 p-6 bg-card-background-darker rounded-lg border border-white/10">
                <h3 className="text-lg font-bold text-solar-surge-orange mb-3">
                  💡 QR Code Usage Tips
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• <strong>PNG:</strong> Best for digital use (emails, social media, presentations)</li>
                  <li>• <strong>SVG:</strong> Best for print (flyers, business cards, posters) - scales perfectly</li>
                  <li>• Add to business cards for instant sign-ups</li>
                  <li>• Display at events, gyms, or training facilities</li>
                  <li>• Include in printed marketing materials</li>
                  <li>• Share on Instagram Stories or TikTok</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
              <QrCode className="w-16 h-16 text-text-secondary/50 mx-auto mb-4" />
              <p className="text-text-secondary">
                Enter your referral link above to generate a QR code
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-text-secondary mb-4">
              Need your referral link?{' '}
              <a
                href="https://mind-and-muscle.tolt.io"
                className="text-solar-surge-orange hover:text-muscle-primary font-semibold transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit your partner dashboard →
              </a>
            </p>
            <p className="text-xs text-text-secondary/70">
              This tool is exclusively for Mind & Muscle partners
            </p>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
}
