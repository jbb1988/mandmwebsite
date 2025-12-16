'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';
import { GradientTextReveal } from '@/components/animations';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Upload, Download, RefreshCw, Image as ImageIcon, Smartphone, Save, CheckCircle, Package } from 'lucide-react';

export default function BannerGeneratorPage() {
  const { getPassword } = useAdminAuth();
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [partnerLogo, setPartnerLogo] = useState<string | null>(null);
  const [isGeneratingFacebook, setIsGeneratingFacebook] = useState(false);
  const [isGeneratingFacebookCoBranded, setIsGeneratingFacebookCoBranded] = useState(false);
  const [isGeneratingTwitter, setIsGeneratingTwitter] = useState(false);
  const [isGeneratingTwitterCoBranded, setIsGeneratingTwitterCoBranded] = useState(false);
  const [isGeneratingPartner, setIsGeneratingPartner] = useState(false);
  const [isDownloadingAllFacebook, setIsDownloadingAllFacebook] = useState(false);
  const [isDownloadingAllTwitter, setIsDownloadingAllTwitter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerNotes, setPartnerNotes] = useState('');
  const facebookBannerRef = useRef<HTMLDivElement>(null);
  const facebookCoBrandedRef = useRef<HTMLDivElement>(null);
  const twitterBannerRef = useRef<HTMLDivElement>(null);
  const twitterCoBrandedRef = useRef<HTMLDivElement>(null);
  const partnerBannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const partnerLogoInputRef = useRef<HTMLInputElement>(null);

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

  // Co-branded Facebook banner (with partner logo badge)
  const downloadFacebookCoBranded = async () => {
    if (!facebookCoBrandedRef.current) return;
    setIsGeneratingFacebookCoBranded(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(facebookCoBrandedRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1080,
        height: 1080,
      });
      const link = document.createElement('a');
      link.download = `mind-muscle-facebook-cobranded-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating Facebook co-branded banner:', error);
      alert('Error generating banner. Please try again.');
    } finally {
      setIsGeneratingFacebookCoBranded(false);
    }
  };

  // Co-branded Twitter banner (with partner logo badge)
  const downloadTwitterCoBranded = async () => {
    if (!twitterCoBrandedRef.current) return;
    setIsGeneratingTwitterCoBranded(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(twitterCoBrandedRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1600,
        height: 900,
      });
      const link = document.createElement('a');
      link.download = `mind-muscle-twitter-cobranded-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating Twitter co-branded banner:', error);
      alert('Error generating banner. Please try again.');
    } finally {
      setIsGeneratingTwitterCoBranded(false);
    }
  };

  // Download all Facebook banners
  const downloadAllFacebookBanners = async () => {
    if (!facebookBannerRef.current) return;
    setIsDownloadingAllFacebook(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const timestamp = Date.now();

      // Download standard Facebook banner
      const canvas1 = await html2canvas(facebookBannerRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1080,
        height: 1080,
      });
      const link1 = document.createElement('a');
      link1.download = `mind-muscle-facebook-standard-${timestamp}.png`;
      link1.href = canvas1.toDataURL('image/png');
      link1.click();

      // Download co-branded Facebook banner if available
      if (facebookCoBrandedRef.current && partnerLogo) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
        const canvas2 = await html2canvas(facebookCoBrandedRef.current, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0f172a',
          width: 1080,
          height: 1080,
        });
        const link2 = document.createElement('a');
        link2.download = `mind-muscle-facebook-cobranded-${timestamp}.png`;
        link2.href = canvas2.toDataURL('image/png');
        link2.click();
      }
    } catch (error) {
      console.error('Error downloading all Facebook banners:', error);
      alert('Error downloading banners. Please try again.');
    } finally {
      setIsDownloadingAllFacebook(false);
    }
  };

  // Download all Twitter banners
  const downloadAllTwitterBanners = async () => {
    if (!twitterBannerRef.current) return;
    setIsDownloadingAllTwitter(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const timestamp = Date.now();

      // Download standard Twitter banner
      const canvas1 = await html2canvas(twitterBannerRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1600,
        height: 900,
      });
      const link1 = document.createElement('a');
      link1.download = `mind-muscle-twitter-standard-${timestamp}.png`;
      link1.href = canvas1.toDataURL('image/png');
      link1.click();

      // Download co-branded Twitter banner if available
      if (twitterCoBrandedRef.current && partnerLogo) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
        const canvas2 = await html2canvas(twitterCoBrandedRef.current, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0f172a',
          width: 1600,
          height: 900,
        });
        const link2 = document.createElement('a');
        link2.download = `mind-muscle-twitter-cobranded-${timestamp}.png`;
        link2.href = canvas2.toDataURL('image/png');
        link2.click();
      }
    } catch (error) {
      console.error('Error downloading all Twitter banners:', error);
      alert('Error downloading banners. Please try again.');
    } finally {
      setIsDownloadingAllTwitter(false);
    }
  };

  const resetQrCode = () => {
    setQrCodeImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Partner Logo Upload Handlers
  const handlePartnerLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPartnerLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handlePartnerLogoDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPartnerLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const resetPartnerLogo = () => {
    setPartnerLogo(null);
    if (partnerLogoInputRef.current) {
      partnerLogoInputRef.current.value = '';
    }
  };

  // Partner Banner Generation
  const downloadPartnerBanner = async () => {
    if (!partnerBannerRef.current) return;
    setIsGeneratingPartner(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(partnerBannerRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1600,
        height: 900,
      });
      const link = document.createElement('a');
      link.download = `mind-muscle-partner-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating Partner banner:', error);
      alert('Error generating banner. Please try again.');
    } finally {
      setIsGeneratingPartner(false);
    }
  };

  // Helper to convert a ref element to blob
  const elementToBlob = async (
    ref: React.RefObject<HTMLDivElement>,
    width: number,
    height: number,
    html2canvas: typeof import('html2canvas').default
  ): Promise<Blob | null> => {
    if (!ref.current) return null;
    const canvas = await html2canvas(ref.current, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0f172a',
      width,
      height,
    });
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
  };

  // Save all banners and assets to library
  const saveBannerToLibrary = async () => {
    if (!partnerName || !partnerEmail) {
      alert('Please fill in partner name and email to save to library.');
      return;
    }

    if (!qrCodeImage) {
      alert('Please upload a QR code first.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const html2canvas = (await import('html2canvas')).default;

      // Generate all banners in parallel
      const [
        bannerPartnerBlob,
        bannerFacebookBlob,
        bannerFacebookCoBrandedBlob,
        bannerTwitterBlob,
        bannerTwitterCoBrandedBlob,
      ] = await Promise.all([
        partnerLogo ? elementToBlob(partnerBannerRef, 1600, 900, html2canvas) : null,
        elementToBlob(facebookBannerRef, 1080, 1080, html2canvas),
        partnerLogo ? elementToBlob(facebookCoBrandedRef, 1080, 1080, html2canvas) : null,
        elementToBlob(twitterBannerRef, 1600, 900, html2canvas),
        partnerLogo ? elementToBlob(twitterCoBrandedRef, 1600, 900, html2canvas) : null,
      ]);

      // Prepare form data
      const formData = new FormData();
      formData.append('partnerName', partnerName);
      formData.append('partnerEmail', partnerEmail);
      formData.append('notes', partnerNotes);

      // Add all banners
      if (bannerPartnerBlob) formData.append('bannerPartner', bannerPartnerBlob, 'banner-partner.png');
      if (bannerFacebookBlob) formData.append('bannerFacebook', bannerFacebookBlob, 'banner-facebook.png');
      if (bannerFacebookCoBrandedBlob) formData.append('bannerFacebookCoBranded', bannerFacebookCoBrandedBlob, 'banner-facebook-cobranded.png');
      if (bannerTwitterBlob) formData.append('bannerTwitter', bannerTwitterBlob, 'banner-twitter.png');
      if (bannerTwitterCoBrandedBlob) formData.append('bannerTwitterCoBranded', bannerTwitterCoBrandedBlob, 'banner-twitter-cobranded.png');

      // Add original logo if available
      if (partnerLogo) {
        const logoResponse = await fetch(partnerLogo);
        const logoBlob = await logoResponse.blob();
        formData.append('logo', logoBlob, 'logo.png');
      }

      // Add original QR code
      if (qrCodeImage) {
        const qrResponse = await fetch(qrCodeImage);
        const qrBlob = await qrResponse.blob();
        formData.append('qrCode', qrBlob, 'qrcode.png');
      }

      const password = getPassword();

      const response = await fetch('/api/admin/partner-banners', {
        method: 'POST',
        headers: {
          'X-Admin-Password': password,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        if (response.status === 401) {
          alert('Session expired. Please log out from the admin panel and log back in, then try again.');
        } else {
          alert(`Failed to save: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('Error saving banners:', error);
      alert('Error saving banners. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminGate
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
        <div className="text-center mb-8">
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

        {/* Admin Navigation */}
        <AdminNav />

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

        {/* Side-by-Side Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* QR Code Upload */}
          <div>
            <h4 className="font-semibold text-sm text-gray-300 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center text-xs text-neon-cortex-blue font-bold">1</span>
              QR Code
            </h4>
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
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-neon-cortex-blue/50 transition-colors bg-white/5 h-48 flex items-center justify-center"
            >
              {qrCodeImage ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={qrCodeImage}
                    alt="Uploaded QR Code"
                    className="w-24 h-24 object-contain rounded-lg"
                  />
                  <p className="text-xs text-neon-cortex-green">QR Code uploaded!</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetQrCode();
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Change
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neon-cortex-blue/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-neon-cortex-blue" />
                  </div>
                  <div>
                    <p className="font-semibold">Drop QR code here</p>
                    <p className="text-xs text-gray-400">or click to browse</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Partner Logo Upload */}
          <div>
            <h4 className="font-semibold text-sm text-gray-300 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neon-cortex-green/20 flex items-center justify-center text-xs text-neon-cortex-green font-bold">2</span>
              Partner Logo
            </h4>
            <input
              ref={partnerLogoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePartnerLogoUpload}
              className="hidden"
            />
            <div
              onClick={() => partnerLogoInputRef.current?.click()}
              onDrop={handlePartnerLogoDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-neon-cortex-green/50 transition-colors bg-white/5 h-48 flex items-center justify-center"
            >
              {partnerLogo ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={partnerLogo}
                    alt="Partner Logo"
                    className="h-20 max-w-full object-contain rounded-lg"
                  />
                  <p className="text-xs text-neon-cortex-green">Logo uploaded!</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPartnerLogo();
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Change
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neon-cortex-green/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-neon-cortex-green" />
                  </div>
                  <div>
                    <p className="font-semibold">Drop partner logo here</p>
                    <p className="text-xs text-gray-400">or click to browse</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Partner Info Fields */}
        <LiquidGlass variant="neutral" className="p-6 mb-8">
          <h4 className="font-semibold text-sm text-gray-300 mb-4 flex items-center gap-2">
            <Save className="w-4 h-4 text-neon-cortex-green" />
            Partner Info (for saving to library)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Partner Name *</label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g., ABC Sports Academy"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cortex-blue/50 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Partner Email *</label>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="e.g., coach@abcsports.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cortex-blue/50 focus:outline-none text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
            <textarea
              value={partnerNotes}
              onChange={(e) => setPartnerNotes(e.target.value)}
              placeholder="Any additional notes about this partner..."
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-neon-cortex-blue/50 focus:outline-none text-sm resize-none"
            />
          </div>
        </LiquidGlass>

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

                  {/* Brand name - under subhead, left-aligned */}
                  <p
                    style={{
                      margin: '8px 0 0 0',
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontWeight: 500,
                      letterSpacing: '0.2px',
                      textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                    }}
                  >
                    Mind & Muscle
                  </p>
                </div>

                {/* RIGHT SIDE - 40% width - QR Code Block */}
                {/* QR code already contains M&M logo - no duplicate needed */}
                <div
                  style={{
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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

          {/* Facebook Download Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
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
                  Download Standard
                </>
              )}
            </LiquidButton>
            <LiquidButton
              onClick={downloadAllFacebookBanners}
              variant="orange"
              size="md"
              disabled={!qrCodeImage || isDownloadingAllFacebook}
            >
              {isDownloadingAllFacebook ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Download All Facebook
                </>
              )}
            </LiquidButton>
          </div>
        </div>

        {/* ================================================================== */}
        {/* FACEBOOK CO-BRANDED BANNER - 1080x1080px (1:1) with Partner Badge */}
        {/* ================================================================== */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-solar-surge-orange" />
            Facebook Co-Branded (1080x1080px Square)
            {partnerLogo && <span className="text-xs text-neon-cortex-green bg-neon-cortex-green/10 px-2 py-1 rounded-full">Partner Logo Added</span>}
          </h3>

          <div className="overflow-auto rounded-xl border border-white/10">
            <div
              ref={facebookCoBrandedRef}
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

              {/* Gradient overlay */}
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
                  {/* Partner Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '24px',
                      padding: '10px 16px 10px 12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '10px',
                      width: 'fit-content',
                    }}
                  >
                    {partnerLogo ? (
                      <img
                        src={partnerLogo}
                        alt="Partner"
                        style={{
                          height: '70px',
                          maxWidth: '180px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '70px',
                          width: '100px',
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          border: '2px dashed rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Partner Logo</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.75)',
                          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      >
                        Powered by Mind & Muscle
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#10B981',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      >
                        Official Team Partner
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '48px',
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

                  {/* Subhead */}
                  <p
                    style={{
                      margin: '20px 0 0 0',
                      fontSize: '18px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                      textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                    }}
                  >
                    AI Training for Baseball & Softball Athletes
                  </p>
                </div>

                {/* RIGHT SIDE - 40% width - QR Code Block */}
                <div
                  style={{
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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
                            width: '260px',
                            height: '260px',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </div>

                      <p
                        style={{
                          margin: '14px 0 0 0',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'white',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        Scan to Join
                      </p>

                      <div
                        style={{
                          marginTop: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
                          Teams Start
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
                          QR Code<br />260x260px
                        </p>
                      </div>
                      <p
                        style={{
                          margin: '14px 0 0 0',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.4)',
                          textAlign: 'center',
                        }}
                      >
                        Scan to Join
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Co-Branded Download Button */}
          <div className="flex justify-center mt-4">
            <LiquidButton
              onClick={downloadFacebookCoBranded}
              variant="blue"
              size="md"
              disabled={!qrCodeImage || !partnerLogo || isGeneratingFacebookCoBranded}
            >
              {isGeneratingFacebookCoBranded ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Co-Branded Facebook PNG
                </>
              )}
            </LiquidButton>
          </div>
          {!partnerLogo && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Upload a partner logo to enable co-branded download
            </p>
          )}
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

                  {/* Brand name - under subhead, left-aligned */}
                  <p
                    style={{
                      margin: '8px 0 0 0',
                      fontSize: '16px',
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontWeight: 500,
                      letterSpacing: '0.2px',
                      textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    }}
                  >
                    Mind & Muscle
                  </p>
                </div>

                {/* RIGHT SIDE - 35% width - QR Code Block */}
                {/* QR code already contains M&M logo - no duplicate needed */}
                <div
                  style={{
                    width: '35%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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

          {/* Twitter Download Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
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
                  Download Standard
                </>
              )}
            </LiquidButton>
            <LiquidButton
              onClick={downloadAllTwitterBanners}
              variant="blue"
              size="md"
              disabled={!qrCodeImage || isDownloadingAllTwitter}
            >
              {isDownloadingAllTwitter ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Download All X/Twitter
                </>
              )}
            </LiquidButton>
          </div>
        </div>

        {/* ================================================================== */}
        {/* X/TWITTER CO-BRANDED BANNER - 1600x900px (16:9) with Partner Badge */}
        {/* ================================================================== */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-neon-cortex-blue" />
            X (Twitter) Co-Branded (1600x900px - 16:9)
            {partnerLogo && <span className="text-xs text-neon-cortex-green bg-neon-cortex-green/10 px-2 py-1 rounded-full">Partner Logo Added</span>}
          </h3>

          <div className="overflow-auto rounded-xl border border-white/10">
            <div
              ref={twitterCoBrandedRef}
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

              {/* Gradient overlay */}
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
                  {/* Partner Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '28px',
                      padding: '12px 20px 12px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '12px',
                      width: 'fit-content',
                    }}
                  >
                    {partnerLogo ? (
                      <img
                        src={partnerLogo}
                        alt="Partner"
                        style={{
                          height: '95px',
                          maxWidth: '240px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '95px',
                          width: '140px',
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          border: '2px dashed rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Partner Logo</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.75)',
                          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      >
                        Powered by Mind & Muscle
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#10B981',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      >
                        Official Team Partner
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
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

                  {/* Subhead */}
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

                {/* RIGHT SIDE - 35% width - QR Code Block */}
                <div
                  style={{
                    width: '35%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {qrCodeImage ? (
                    <>
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

                      <p
                        style={{
                          margin: '12px 0 0 0',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'white',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        Scan to Join
                      </p>

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
                          Teams Start
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
                          margin: '12px 0 0 0',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.4)',
                          textAlign: 'center',
                        }}
                      >
                        Scan to Join
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Twitter Co-Branded Download Button */}
          <div className="flex justify-center mt-4">
            <LiquidButton
              onClick={downloadTwitterCoBranded}
              variant="orange"
              size="md"
              disabled={!qrCodeImage || !partnerLogo || isGeneratingTwitterCoBranded}
            >
              {isGeneratingTwitterCoBranded ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Co-Branded X/Twitter PNG
                </>
              )}
            </LiquidButton>
          </div>
          {!partnerLogo && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Upload a partner logo to enable co-branded download
            </p>
          )}
        </div>

        {/* ================================================================== */}
        {/* PARTNER BANNER PREVIEW - 1600x900px (16:9) with Partner Branding */}
        {/* ================================================================== */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-neon-cortex-green" />
            Partner Co-Branded Banner (1600x900px - 16:9)
          </h3>

          <div className="overflow-auto rounded-xl border border-white/10">
            {/*
              PARTNER CO-BRANDED BANNER - LOCKED SPECS
              Canvas: 1600x900px (16:9)
              Safe Zone: 1320x720px (140px L/R, 90px T/B)
              Export: PNG, sRGB
            */}
            <div
              ref={partnerBannerRef}
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
                  {/* Partner Badge - Logo prominent, "Powered by" secondary */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '28px',
                      padding: '12px 20px 12px 14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '12px',
                      width: 'fit-content',
                    }}
                  >
                    {partnerLogo ? (
                      <img
                        src={partnerLogo}
                        alt="Partner"
                        style={{
                          height: '95px',
                          maxWidth: '240px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '95px',
                          width: '140px',
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          border: '2px dashed rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Partner Logo</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.75)',
                          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      >
                        Powered by Mind & Muscle
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#10B981',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }}
                      >
                        Official Team Partner
                      </span>
                    </div>
                  </div>

                  {/* Headline - Left aligned */}
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

                  {/* Subhead */}
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

                {/* RIGHT SIDE - 35% width - QR Code Block (no logo - moved to left side) */}
                <div
                  style={{
                    width: '35%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
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

                      {/* Label below QR */}
                      <p
                        style={{
                          margin: '12px 0 0 0',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'white',
                          textAlign: 'center',
                          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                          letterSpacing: '0.2px',
                        }}
                      >
                        Scan to Join
                      </p>

                      {/* CTA: "Teams Start FREE" */}
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
                          Teams Start
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
                          margin: '12px 0 0 0',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.4)',
                          textAlign: 'center',
                        }}
                      >
                        Scan to Join
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Partner Banner Download & Save Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <LiquidButton
              onClick={downloadPartnerBanner}
              variant="green"
              size="md"
              disabled={!qrCodeImage || !partnerLogo || isGeneratingPartner}
            >
              {isGeneratingPartner ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Partner Banner PNG
                </>
              )}
            </LiquidButton>

            <LiquidButton
              onClick={saveBannerToLibrary}
              variant="blue"
              size="md"
              disabled={!qrCodeImage || !partnerLogo || !partnerName || !partnerEmail || isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved to Library!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Library
                </>
              )}
            </LiquidButton>
          </div>

          {(!qrCodeImage || !partnerLogo) && (
            <p className="text-center text-sm text-gray-500 mt-2">
              {!partnerLogo && !qrCodeImage
                ? 'Upload both a partner logo and QR code to enable download'
                : !partnerLogo
                ? 'Upload a partner logo above to enable download'
                : 'Upload a QR code at the top of the page to enable download'}
            </p>
          )}

          {(qrCodeImage && partnerLogo && (!partnerName || !partnerEmail)) && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Fill in partner name and email above to save to library
            </p>
          )}
        </div>

        {!qrCodeImage && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Upload a QR code first to enable downloads
          </p>
        )}
      </div>
    </div>
    </AdminGate>
  );
}
