'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';

interface TeamInfo {
  id: string;
  name: string;
  join_code: string;
  admin_email: string;
  max_seats: number;
  seats_used: number;
  license_status: string;
  created_at: string;
  stripe_subscription_id: string;
}

export default function TeamLookupAdmin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  const lookupTeams = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setTeams([]);

    try {
      const response = await fetch('/api/admin/lookup-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.status === 401) {
        // Not authenticated - redirect to login
        router.push('/admin/login?returnUrl=/admin/team-lookup');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup teams');
      }

      setTeams(data.teams || []);

      if (data.teams.length === 0) {
        setError('No teams found for this email address');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to lookup teams');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-neon-cortex-blue to-solar-surge-orange bg-clip-text text-transparent">
              Team Code Lookup
            </span>
          </h1>
          <p className="text-lg text-text-secondary">Admin tool to retrieve team codes for customer support</p>
        </div>

        <LiquidGlass variant="neutral" className="mb-6">
          <div className="p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Customer Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-3 bg-space-black/50 border border-white/20 rounded-lg focus:outline-none focus:border-neon-cortex-blue transition-colors text-starlight-white placeholder:text-text-secondary/50"
                  onKeyDown={(e) => e.key === 'Enter' && lookupTeams()}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                onClick={lookupTeams}
                disabled={loading}
                className="w-full px-6 py-3 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Searching...'
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Lookup Teams
                  </>
                )}
              </button>
            </div>
          </div>
        </LiquidGlass>

        {teams.length > 0 && (
          <div className="space-y-4">
            {teams.map((team) => (
              <LiquidGlass key={team.id} variant="blue">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{team.name}</h3>
                      <p className="text-sm text-text-secondary">
                        Created: {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      team.license_status === 'active'
                        ? 'bg-neon-cortex-green/20 text-neon-cortex-green border border-neon-cortex-green/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {team.license_status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-text-secondary mb-1">Team Code</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-black text-neon-cortex-blue font-mono">
                          {team.join_code}
                        </div>
                        <button
                          onClick={() => copyToClipboard(team.join_code)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {copied === team.join_code ? (
                            <CheckCircle className="w-5 h-5 text-neon-cortex-green" />
                          ) : (
                            <Copy className="w-5 h-5 text-text-secondary" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="text-sm text-text-secondary mb-1">Seats</div>
                      <div className="text-xl font-bold">
                        {team.seats_used} / {team.max_seats} used
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-text-secondary space-y-1">
                    <p><strong>Admin Email:</strong> {team.admin_email}</p>
                    <p><strong>Subscription ID:</strong> {team.stripe_subscription_id}</p>
                  </div>
                </div>
              </LiquidGlass>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
