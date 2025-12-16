'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import PasswordGate from '@/components/PasswordGate';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { GradientTextReveal } from '@/components/animations';
import { Upload, Download, RefreshCw, Image as ImageIcon, Smartphone } from 'lucide-react';

export default function BannerGeneratorPage() {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingFacebook, setIsGeneratingFacebook] = useState(false);
  const [isGeneratingTwitter, setIsGeneratingTwitter] = useState(false);
  const facebookBannerRef = useRef<HTMLDivElement>(null);
  const twitterBannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

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

  const downloadFacebookBanner = async () => {
    if (!facebookBannerRef.current) return;
    setIsGeneratingFacebook(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(facebookBannerRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1080,
        height: 1080,
      });
      const link = document.createElement('a');
      link.download = `mind-muscle-facebook-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating Facebook banner:', error);
      alert('Error generating banner. Please try again.');
    } finally {
      setIsGeneratingFacebook(false);
    }
  };

  const downloadTwitterBanner = async () => {
    if (!twitterBannerRef.current) return;
    setIsGeneratingTwitter(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(twitterBannerRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1600,
        height: 900,
      });
      const link = document.createElement('a');
      link.download = `mind-muscle-twitter-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating Twitter banner:', error);
      alert('Error generating banner. Please try again.');
    } finally {
      setIsGeneratingTwitter(false);
    }
  };

  const resetQrCode = () => {
    setQrCodeImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PasswordGate
      password={adminPassword}
      title="Partner Banner Generator"
      description="Enter admin password to access this tool"
    >
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
              ref={facebookBannerRef}
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

              {/* Gradient overlay - darken behind text by ~10-15%, NO blur */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    linear-gradient(to right, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.35) 55%, rgba(15, 23, 42, 0.25) 100%)
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
                  {/* Blue first line, orange second line, reduced letter-spacing */}
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '52px',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      lineHeight: 1.15,
                      letterSpacing: '-1.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span style={{
                      color: '#0EA5E9',
                      display: 'block',
                      textShadow: '0 2px 12px rgba(0,0,0,0.7)'
                    }}>
                      Discipline the Mind.
                    </span>
                    <span style={{
                      color: '#F97316',
                      display: 'block',
                      textShadow: '0 2px 12px rgba(0,0,0,0.7)'
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

                {/* RIGHT SIDE - 40% width - ONE UNIFIED VERTICAL BLOCK */}
                {/* Stack: LOGO → QR → "Scan to Get Started" → "Get Started FREE" */}
                <div
                  style={{
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* LOGO: 95px width, centered above QR, 14px spacing to QR */}
                  {/* NO glow, NO outline, soft shadow only (10-15% opacity) */}
                  <img
                    src="/assets/images/logo.png"
                    alt="Mind & Muscle"
                    style={{
                      width: '95px',
                      height: '95px',
                      marginBottom: '14px',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))',
                    }}
                  />

                  {/* QR CODE: 280x280px on solid white card */}
                  {qrCodeImage ? (
                    <>
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
                            width: '280px',
                            height: '280px',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </div>

                      {/* CTA TEXT: Center-aligned under QR */}
                      {/* "Scan to Get Started" → white */}
                      <p
                        style={{
                          margin: '16px 0 0 0',
                          fontSize: '17px',
                          fontWeight: 600,
                          color: 'white',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        Scan to Get Started
                      </p>

                      {/* "Get Started" → white, "FREE" → muted green (not neon) */}
                      <div
                        style={{
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'white',
                            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                          }}
                        >
                          Get Started
                        </span>
                        <span
                          style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            color: '#22C55E',
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
                          width: '312px',
                          height: '312px',
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
                          QR Code<br />280x280px
                        </p>
                      </div>
                      <p
                        style={{
                          margin: '16px 0 0 0',
                          fontSize: '17px',
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

          {/* Facebook Download Button */}
          <div className="flex justify-center mt-4">
            <LiquidButton
              onClick={downloadFacebookBanner}
              variant="blue"
              size="md"
              disabled={!qrCodeImage || isGeneratingFacebook}
            >
              {isGeneratingFacebook ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Facebook PNG
                </>
              )}
            </LiquidButton>
          </div>
        </div>

        {/* ================================================================== */}
        {/* TWITTER/X BANNER PREVIEW - 1600x900px (16:9) */}
        {/* ================================================================== */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-neon-cortex-blue" />
            X (Twitter) Feed Post (1600x900px - 16:9)
          </h3>

          <div className="overflow-auto rounded-xl border border-white/10">
            {/*
              X (TWITTER) FEED POST IMAGE - LOCKED SPECS
              Canvas: 1600x900px (16:9)
              Safe Zone: 1320x720px (140px L/R, 90px T/B)
              Export: PNG, sRGB
            */}
            <div
              ref={twitterBannerRef}
              style={{
                width: '1600px',
                height: '900px',
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

              {/* Gradient overlay - soft vignette behind headline */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(ellipse at 35% 50%, rgba(15, 23, 42, 0.7) 0%, transparent 65%),
                    linear-gradient(to right, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.35) 55%, rgba(15, 23, 42, 0.45) 100%)
                  `,
                }}
              />

              {/* SAFE ZONE CONTAINER: 1320x720px centered (140px L/R, 90px T/B) */}
              <div
                style={{
                  position: 'absolute',
                  top: '90px',
                  left: '140px',
                  width: '1320px',
                  height: '720px',
                  display: 'flex',
                }}
              >
                {/* LEFT SIDE - 65% width - Primary Message Block */}
                <div
                  style={{
                    width: '65%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: '40px',
                  }}
                >
                  {/* Headline - Left aligned, vertically centered */}
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '64px',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      lineHeight: 1.12,
                      letterSpacing: '-1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span style={{
                      color: '#0EA5E9',
                      display: 'block',
                      textShadow: '0 2px 20px rgba(0,0,0,0.85), 0 4px 40px rgba(14, 165, 233, 0.3)'
                    }}>
                      Discipline the Mind.
                    </span>
                    <span style={{
                      color: '#F97316',
                      display: 'block',
                      textShadow: '0 2px 20px rgba(0,0,0,0.85), 0 4px 40px rgba(249, 115, 22, 0.3)'
                    }}>
                      Dominate the Game.
                    </span>
                  </h1>

                  {/* Subhead - only if readable at phone size */}
                  <p
                    style={{
                      margin: '28px 0 0 0',
                      fontSize: '22px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    }}
                  >
                    AI Training for Baseball & Softball Athletes
                  </p>
                </div>

                {/* RIGHT SIDE - 35% width - Brand + Action Block */}
                {/* Logo + QR as ONE unified vertical unit */}
                <div
                  style={{
                    width: '35%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Logo: 120px, nudged down 12px, reduced shadow (7% opacity) */}
                  {/* Aligns logo center with QR card's top edge */}
                  <img
                    src="/assets/images/logo.png"
                    alt="Mind & Muscle"
                    style={{
                      width: '120px',
                      height: '120px',
                      marginTop: '12px',
                      marginBottom: '12px',
                      filter: 'drop-shadow(0 5px 16px rgba(0,0,0,0.07))',
                    }}
                  />

                  {/* QR Code Section */}
                  {qrCodeImage ? (
                    <>
                      {/* QR Code on white card - 240x240px */}
                      <div
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '10px',
                          padding: '14px',
                          boxShadow: '0 6px 28px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        <img
                          src={qrCodeImage}
                          alt="Partner QR Code"
                          style={{
                            width: '240px',
                            height: '240px',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </div>

                      {/* Label below QR - tightened spacing (9px instead of 14px) */}
                      <p
                        style={{
                          margin: '9px 0 0 0',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'white',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        Scan to Get Started
                      </p>

                      {/* CTA: "Get Started FREE" */}
                      <div
                        style={{
                          marginTop: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: 'white',
                            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                          }}
                        >
                          Get Started
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            fontWeight: 800,
                            color: '#22C55E',
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
                          width: '268px',
                          height: '268px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          border: '2px dashed rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <p
                          style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '13px',
                            textAlign: 'center',
                          }}
                        >
                          QR Code<br />240x240px min
                        </p>
                      </div>
                      <p
                        style={{
                          margin: '9px 0 0 0',
                          fontSize: '16px',
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

          {/* Twitter Download Button */}
          <div className="flex justify-center mt-4">
            <LiquidButton
              onClick={downloadTwitterBanner}
              variant="orange"
              size="md"
              disabled={!qrCodeImage || isGeneratingTwitter}
            >
              {isGeneratingTwitter ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download X/Twitter PNG
                </>
              )}
            </LiquidButton>
          </div>
        </div>

        {!qrCodeImage && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Upload a QR code first to enable downloads
          </p>
        )}
      </div>
    </div>
    </PasswordGate>
  );
}
