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
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1080,
        height: 1080,
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
            Facebook Feed Post (1080x1080px Square)
          </h3>

          <div className="overflow-auto rounded-xl border border-white/10">
            {/*
              FACEBOOK FEED POST IMAGE - LOCKED SPECS
              Canvas: 1080x1080px (1:1 square)
              Safe Zone: 860x860px (110px padding all sides)
              Export: PNG, sRGB
            */}
            <div
              ref={bannerRef}
              style={{
                width: '1080px',
                height: '1080px',
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

              {/* Gradient overlay - subtle vignette for headline readability */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(ellipse at 30% 40%, rgba(15, 23, 42, 0.75) 0%, transparent 70%),
                    linear-gradient(to right, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.5) 100%)
                  `,
                }}
              />

              {/* SAFE ZONE CONTAINER: 860x860px centered (110px padding all sides) */}
              <div
                style={{
                  position: 'absolute',
                  top: '110px',
                  left: '110px',
                  width: '860px',
                  height: '860px',
                  display: 'flex',
                }}
              >
                {/* LEFT SIDE - 60% width - Primary Message Block */}
                <div
                  style={{
                    width: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: '30px',
                  }}
                >
                  {/* Headline - Left aligned, vertically centered */}
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '52px',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      lineHeight: 1.15,
                      letterSpacing: '-0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span style={{
                      color: '#0EA5E9',
                      display: 'block',
                      textShadow: '0 2px 16px rgba(0,0,0,0.8), 0 4px 32px rgba(14, 165, 233, 0.3)'
                    }}>
                      Discipline the Mind.
                    </span>
                    <span style={{
                      color: '#F97316',
                      display: 'block',
                      textShadow: '0 2px 16px rgba(0,0,0,0.8), 0 4px 32px rgba(249, 115, 22, 0.3)'
                    }}>
                      Dominate the Game.
                    </span>
                  </h1>

                  {/* Subhead - only if readable at phone size */}
                  <p
                    style={{
                      margin: '24px 0 0 0',
                      fontSize: '20px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                      textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                    }}
                  >
                    AI Training for Baseball & Softball Athletes
                  </p>
                </div>

                {/* RIGHT SIDE - 40% width - Action + Brand Block */}
                <div
                  style={{
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '20px',
                    paddingBottom: '20px',
                  }}
                >
                  {/* Logo - near top-right, with subtle halo */}
                  <img
                    src="/assets/images/logo.png"
                    alt="Mind & Muscle"
                    style={{
                      width: '160px',
                      height: '160px',
                      filter: 'drop-shadow(0 0 30px rgba(14, 165, 233, 0.25)) drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
                    }}
                  />

                  {/* QR Code Section - centered vertically */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {qrCodeImage ? (
                      <>
                        {/* QR Code on white card - MIN 260x260px with quiet zone */}
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                          }}
                        >
                          <img
                            src={qrCodeImage}
                            alt="Partner QR Code"
                            style={{
                              width: '260px',
                              height: '260px',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                        </div>

                        {/* Label below QR - REQUIRED: "Scan to Get Started" */}
                        <p
                          style={{
                            margin: '16px 0 0 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'white',
                            textAlign: 'center',
                            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                            letterSpacing: '0.3px',
                          }}
                        >
                          Scan to Get Started
                        </p>

                        {/* CTA: "Get Started FREE" - secondary to headline */}
                        <div
                          style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '22px',
                              fontWeight: 700,
                              color: 'white',
                              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                            }}
                          >
                            Get Started
                          </span>
                          <span
                            style={{
                              fontSize: '22px',
                              fontWeight: 800,
                              color: '#4ADE80',
                              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                            }}
                          >
                            FREE
                          </span>
                        </div>
                      </>
                    ) : (
                      /* Placeholder when no QR uploaded */
                      <>
                        <div
                          style={{
                            width: '292px',
                            height: '292px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
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
                            }}
                          >
                            QR Code<br />260x260px min
                          </p>
                        </div>
                        <p
                          style={{
                            margin: '16px 0 0 0',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.4)',
                            textAlign: 'center',
                          }}
                        >
                          Scan to Get Started
                        </p>
                      </>
                    )}
                  </div>
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
