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
                  flexDirection: 'column',
                  padding: '50px 60px',
                }}
              >
                {/* TOP SECTION - Text Left + Logo Right */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flex: '1',
                  }}
                >
                  {/* Left - Headline & Subtext */}
                  <div>
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
                        margin: '20px 0 0 0',
                        fontSize: '22px',
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                      }}
                    >
                      AI Training for Baseball & Softball Athletes
                    </p>
                  </div>

                  {/* Right - Logo */}
                  <img
                    src="/assets/images/logo.png"
                    alt="Mind & Muscle"
                    style={{
                      width: '180px',
                      height: '180px',
                      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
                    }}
                  />
                </div>

                {/* BOTTOM SECTION - QR Centered + CTA Right */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '20px',
                  }}
                >
                  {qrCodeImage ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '30px',
                      }}
                    >
                      {/* QR Code Container */}
                      <div
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '16px',
                          padding: '14px',
                          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <img
                          src={qrCodeImage}
                          alt="Partner QR Code"
                          style={{
                            width: '140px',
                            height: '140px',
                            objectFit: 'contain',
                          }}
                        />
                      </div>

                      {/* CTA Text - Right of QR */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: 800,
                            color: 'white',
                            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Get Started
                        </p>
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            fontSize: '36px',
                            fontWeight: 900,
                            color: '#22C55E',
                            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
                            letterSpacing: '1px',
                          }}
                        >
                          FREE
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Placeholder */
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '30px',
                      }}
                    >
                      <div
                        style={{
                          width: '168px',
                          height: '168px',
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
                          QR Code here
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '28px',
                            fontWeight: 800,
                            color: 'rgba(255,255,255,0.4)',
                          }}
                        >
                          Get Started
                        </p>
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            fontSize: '36px',
                            fontWeight: 900,
                            color: 'rgba(34, 197, 94, 0.4)',
                          }}
                        >
                          FREE
                        </p>
                      </div>
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
