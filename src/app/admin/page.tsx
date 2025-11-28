'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, MessageSquare, Search, LogOut } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';

interface AdminTool {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'orange' | 'neutral';
}

const adminTools: AdminTool[] = [
  {
    title: 'Feedback Dashboard',
    description: 'View and manage user feedback from mobile app and website',
    href: '/admin/feedback',
    icon: MessageSquare,
    color: 'blue',
  },
  {
    title: 'Team Lookup',
    description: 'Search team codes and license information by email',
    href: '/admin/team-lookup',
    icon: Search,
    color: 'orange',
  },
];

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if admin authenticated
        const response = await fetch('/api/admin/check-auth');

        if (response.status === 401) {
          // Not authenticated - redirect to login
          router.push('/admin/login?returnUrl=/admin');
          return;
        }

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Any other error - redirect to login
          router.push('/admin/login?returnUrl=/admin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin/login?returnUrl=/admin');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <LiquidGlass variant="blue" className="max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cortex-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Verifying access...</p>
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-cortex-blue/20 mb-6">
            <Shield className="w-10 h-10 text-neon-cortex-blue" />
          </div>
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
              Admin Portal
            </span>
          </h1>
          <p className="text-xl text-text-secondary">
            Manage feedback, team licenses, and business metrics
          </p>
        </div>

        {/* Admin Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.href} onClick={() => router.push(tool.href)} className="cursor-pointer">
                <LiquidGlass
                  variant={tool.color}
                  className="p-6 hover:scale-105 transition-transform"
                >
                  <div className="flex flex-col h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black mb-2">{tool.title}</h3>
                    <p className="text-text-secondary text-sm flex-1">{tool.description}</p>
                    <div className="mt-4 text-neon-cortex-blue text-sm font-semibold">
                      Open →
                    </div>
                  </div>
                </LiquidGlass>
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all text-text-secondary hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-xs text-text-secondary">
            Authorized access only • Session expires in 30 days
          </p>
        </div>
      </div>
    </div>
  );
}
