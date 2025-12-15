'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { GradientTextReveal } from '@/components/animations';
import { Upload, Download, RefreshCw, Image as ImageIcon, Smartphone } from 'lucide-react';

export default function BannerGeneratorPage() {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrCodeImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrCodeImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const downloadBanner = async () => {
    if (!bannerRef.current) return;

    setIsGenerating(true);

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(bannerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1200,
        height: 628,
      });

      const link = document.createElement('a');
      link.download = `mind-muscle-partner-banner-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating banner:', error);
      alert('Error generating banner. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQrCode = () => {
    setQrCodeImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo Watermark */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
        <Image
          src="/assets/images/logo.png"
          alt=""
          width={1200}
          height={1200}
          className="object-contain"
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <GradientTextReveal
            text="Partner Banner Generator"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-relaxed"
            gradientFrom="#F97316"
            gradientTo="#0EA5E9"
            delay={0.2}
          />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Upload a partner's QR code to generate a professional marketing banner.
          </p>
        </div>

        {/* Instructions */}
        <LiquidGlass variant="blue" className="p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-neon-cortex-blue" />
            How to Use
          </h3>
          <ol className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="font-bold text-solar-surge-orange">1.</span>
              Go to the <a href="/partner-program" className="text-neon-cortex-blue hover:underline">Partner Program page</a> QR code generator
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-solar-surge-orange">2.</span>
              Enter the partner's Tolt referral link and download their QR code
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-solar-surge-orange">3.</span>
              Upload that QR code here using the dropzone below
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-solar-surge-orange">4.</span>
              Download the generated banner and send it to the partner
            </li>
          </ol>
        </LiquidGlass>

        {/* QR Code Upload */}
        <div className="mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center cursor-pointer hover:border-neon-cortex-blue/50 transition-colors bg-white/5"
          >
            {qrCodeImage ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={qrCodeImage}
                  alt="Uploaded QR Code"
                  className="w-32 h-32 object-contain rounded-lg"
                />
                <p className="text-sm text-neon-cortex-green">QR Code uploaded! Preview below.</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetQrCode();
                  }}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Upload different QR code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-neon-cortex-blue" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Drop QR code image here</p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner Preview */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-solar-surge-orange" />
            Banner Preview (1200x628px)
          </h3>

          <div className="overflow-auto rounded-xl border border-white/10">
            {/* Professional Banner Design */}
            <div
              ref={bannerRef}
              style={{
                width: '1200px',
                height: '628px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* Background Image */}
              <img
                src="/assets/images/baseball_field_dusk.png"
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />

              {/* Dark Gradient Overlay - Creates depth and text legibility */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.6) 100%)',
                }}
              />

              {/* Content Container */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  padding: '50px 60px',
                }}
              >
                {/* Left Section - Branding (2/3 width) */}
                <div
                  style={{
                    flex: '2',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  {/* Logo */}
                  <img
                    src="/assets/images/logo.png"
                    alt="Mind & Muscle"
                    style={{
                      width: '90px',
                      height: '90px',
                      marginBottom: '30px',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                    }}
                  />

                  {/* Headline */}
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '56px',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      lineHeight: 1.1,
                      letterSpacing: '-1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span style={{ color: '#0EA5E9', display: 'block', textShadow: '0 2px 20px rgba(14, 165, 233, 0.4)' }}>
                      Discipline the Mind.
                    </span>
                    <span style={{ color: '#F97316', display: 'block', textShadow: '0 2px 20px rgba(249, 115, 22, 0.4)' }}>
                      Dominate the Game.
                    </span>
                  </h1>

                  {/* Subtext */}
                  <p
                    style={{
                      margin: '24px 0 0 0',
                      fontSize: '22px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                    }}
                  >
                    AI Training for Baseball & Softball Athletes
                  </p>
                </div>

                {/* Right Section - CTA Zone (1/3 width) */}
                <div
                  style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '40px',
                  }}
                >
                  {qrCodeImage ? (
                    <>
                      {/* QR Code Container */}
                      <div
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '16px',
                          padding: '16px',
                          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <img
                          src={qrCodeImage}
                          alt="Partner QR Code"
                          style={{
                            width: '160px',
                            height: '160px',
                            objectFit: 'contain',
                          }}
                        />
                      </div>

                      {/* CTA Text */}
                      <p
                        style={{
                          marginTop: '20px',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: 'white',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}
                      >
                        Scan to Download
                      </p>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: '24px',
                          fontWeight: 900,
                          color: '#22C55E',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}
                      >
                        FREE
                      </p>

                      {/* App Store Badges */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          marginTop: '16px',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>App Store</span>
                        </div>
                        <div
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                          </svg>
                          <span style={{ color: 'white', fontSize: '11px', fontWeight: 600 }}>Google Play</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Placeholder */
                    <div
                      style={{
                        width: '192px',
                        height: '192px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        border: '2px dashed rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '14px',
                          textAlign: 'center',
                          padding: '20px',
                        }}
                      >
                        QR Code will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center">
          <LiquidButton
            onClick={downloadBanner}
            variant="orange"
            size="lg"
            disabled={!qrCodeImage || isGenerating}
            className="!px-12"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Banner PNG
              </>
            )}
          </LiquidButton>
        </div>

        {!qrCodeImage && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Upload a QR code first to enable download
          </p>
        )}
      </div>
    </div>
  );
}
