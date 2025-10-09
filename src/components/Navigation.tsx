'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import { clsx } from 'clsx';

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/team-licensing', label: 'Team Licensing' },
    { href: '/partner-program', label: 'Partner Program' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'py-2' : 'py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LiquidGlass
          variant="neutral"
          intensity="strong"
          rounded="2xl"
          padding="none"
          className={clsx(
            'transition-all duration-300',
            isScrolled && 'shadow-liquid'
          )}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo + Brand Name */}
              <Link href="/" className="flex items-center gap-3 group">
                <img
                  src="/assets/images/logo.png"
                  alt="Mind & Muscle"
                  className="w-10 h-10 drop-shadow-lg transition-transform group-hover:scale-110"
                />
                <span className="font-poppins font-bold text-xl">
                  Mind & Muscle
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-text-secondary hover:text-starlight-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* CTA Button - Glassmorphic Style */}
              <div className="hidden md:block">
                <Link
                  href="/team-licensing"
                  className="block px-6 py-2 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-text-secondary hover:text-starlight-white transition-colors font-medium py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/team-licensing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-6 py-3 rounded-lg font-semibold text-center backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </div>
        </LiquidGlass>
      </div>
    </nav>
  );
};

export default Navigation;
