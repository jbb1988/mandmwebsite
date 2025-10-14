'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Plus, AlertCircle, CreditCard, Check, ArrowLeft, Shield } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { GradientTextReveal } from '@/components/animations';

interface TeamData {
  teamCode: string;
  currentSeats: number;
  lockedInRate: number;
  discountPercentage: number;
  purchaseDate: string;
  subscriptionId: string;
}

export default function ManageTeamLicense() {
  const [teamCode, setTeamCode] = useState('');
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [additionalSeats, setAdditionalSeats] = useState(12);
  const [processingPayment, setProcessingPayment] = useState(false);

  const lookupTeamCode = async () => {
    if (!teamCode.trim()) {
      setError('Please enter your team code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/lookup-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode: teamCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup team code');
      }

      setTeamData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to lookup team code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSeats = async () => {
    if (!teamData) return;

    const maxAllowedSeats = teamData.currentSeats * 2;
    const newTotalSeats = teamData.currentSeats + additionalSeats;

    if (newTotalSeats > maxAllowedSeats) {
      setError(`Cannot exceed ${maxAllowedSeats} total seats (2x your original ${teamData.currentSeats} seats). Please contact support for larger teams.`);
      return;
    }

    setProcessingPayment(true);
    setError('');

    try {
      const response = await fetch('/api/add-team-seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamCode: teamData.teamCode,
          subscriptionId: teamData.subscriptionId,
          additionalSeats,
          lockedInRate: teamData.lockedInRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process seat addition');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add seats. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const calculateProration = () => {
    if (!teamData) return 0;

    // Simple annual calculation (Stripe will handle exact proration)
    return additionalSeats * teamData.lockedInRate;
  };

  const maxAllowedSeats = teamData ? teamData.currentSeats * 2 : 0;
  const newTotalSeats = teamData ? teamData.currentSeats + additionalSeats : 0;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/team-licensing"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-starlight-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team Licensing
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <LiquidGlass variant="blue" rounded="full" padding="none" glow={true} className="px-6 py-3">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-neon-cortex-blue drop-shadow-[0_0_12px_rgba(14,165,233,0.8)]" />
                <span className="text-base md:text-lg font-bold">TEAM MANAGEMENT</span>
              </div>
            </LiquidGlass>
          </div>
          <GradientTextReveal
            text="Manage Your Team License"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 leading-tight"
            gradientFrom="#0EA5E9"
            gradientTo="#F97316"
            delay={0.2}
          />
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-5xl mx-auto font-medium leading-relaxed">
            Add seats at your locked-in discount rate
          </p>
        </div>

        {!teamData ? (
          /* Team Code Lookup */
          <LiquidGlass variant="neutral" className="max-w-2xl mx-auto">
            <div className="p-8">
              <div className="text-center mb-6">
                <Users className="w-16 h-16 text-neon-cortex-blue mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Enter Your Team Code</h2>
                <p className="text-text-secondary">
                  Your team code was sent to your email after purchase
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Team Code</label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="TEAM-XXXX-XXXX"
                    className="w-full px-4 py-3 bg-slate-900 border-2 border-neon-cortex-blue/40 rounded-lg focus:outline-none focus:border-neon-cortex-blue focus:ring-2 focus:ring-neon-cortex-blue/20 transition-all text-center text-lg font-mono text-white placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && lookupTeamCode()}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                <button
                  onClick={lookupTeamCode}
                  disabled={loading}
                  className="w-full px-6 py-3 rounded-lg font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Looking up...' : 'Access Team Management'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-text-secondary text-center">
                  Can't find your team code?{' '}
                  <Link href="/support" className="text-neon-cortex-blue hover:underline">
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          </LiquidGlass>
        ) : (
          /* Team Management Dashboard */
          <div className="space-y-6">
            {/* Current License Info */}
            <LiquidGlass variant="blue">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Team: {teamData.teamCode}</h2>
                    <p className="text-text-secondary text-sm">
                      Active since {new Date(teamData.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-neon-cortex-blue">{teamData.currentSeats}</div>
                    <div className="text-sm text-text-secondary">Current Seats</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm text-text-secondary mb-1">Locked-In Rate</div>
                    <div className="text-2xl font-bold text-neon-cortex-green">
                      ${teamData.lockedInRate.toFixed(2)}/seat
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm text-text-secondary mb-1">Your Discount</div>
                    <div className="text-2xl font-bold text-solar-surge-orange">
                      {teamData.discountPercentage}% OFF
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm text-text-secondary mb-1">Max Seats Allowed</div>
                    <div className="text-2xl font-bold text-starlight-white">
                      {maxAllowedSeats} seats
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlass>

            {/* Add Seats Section */}
            <LiquidGlass variant="neutral">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="w-6 h-6 text-solar-surge-orange" />
                  <h3 className="text-xl font-bold">Add More Seats</h3>
                </div>

                <div className="space-y-6">
                  {/* Seat Counter */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Additional Seats</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setAdditionalSeats(Math.max(1, additionalSeats - 1))}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={maxAllowedSeats - teamData.currentSeats}
                        value={additionalSeats}
                        onChange={(e) => setAdditionalSeats(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 px-4 py-3 bg-slate-900 border-2 border-neon-cortex-blue/40 rounded-lg focus:outline-none focus:border-neon-cortex-blue focus:ring-2 focus:ring-neon-cortex-blue/20 transition-all text-center text-2xl font-bold text-white"
                      />
                      <button
                        onClick={() => setAdditionalSeats(Math.min(maxAllowedSeats - teamData.currentSeats, additionalSeats + 1))}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Calculation Summary */}
                  <div className="p-4 bg-gradient-to-br from-neon-cortex-blue/20 via-solar-surge-orange/10 to-transparent border-2 border-neon-cortex-blue/40 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Current Seats:</span>
                        <span className="font-bold">{teamData.currentSeats} seats</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Adding:</span>
                        <span className="font-bold text-solar-surge-orange">+{additionalSeats} seats</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-text-secondary">New Total:</span>
                        <span className="font-bold text-neon-cortex-blue text-lg">{newTotalSeats} seats</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="font-semibold">Annual Cost for New Seats:</span>
                        <span className="font-black text-neon-cortex-green text-xl">
                          ${calculateProration().toFixed(2)}/year
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-text-secondary">
                        💡 New seats start their own 12-month subscription from today at your locked-in rate of ${teamData.lockedInRate.toFixed(2)}/seat
                      </p>
                    </div>
                  </div>

                  {/* Validation Message */}
                  {newTotalSeats > maxAllowedSeats && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-red-200 font-semibold mb-1">Seat Limit Exceeded</p>
                        <p className="text-red-200/80">
                          Maximum {maxAllowedSeats} seats allowed (2x your original {teamData.currentSeats} seats).
                          For larger teams, please <Link href="/support" className="underline">contact support</Link>.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  )}

                  {/* Add Seats Button */}
                  <button
                    onClick={addSeats}
                    disabled={processingPayment || newTotalSeats > maxAllowedSeats}
                    className="w-full px-6 py-4 rounded-lg font-bold text-lg backdrop-blur-md transition-all duration-300 hover:scale-105 border border-neon-cortex-blue/30 bg-gradient-to-br from-background-primary/80 via-background-secondary/60 to-neon-cortex-blue/10 hover:shadow-liquid-glow-blue hover:border-neon-cortex-blue/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Add {additionalSeats} Seat{additionalSeats !== 1 ? 's' : ''} - ${calculateProration().toFixed(2)}/year
                      </>
                    )}
                  </button>

                  {/* Benefits Reminder */}
                  <div className="p-4 bg-neon-cortex-green/10 border border-neon-cortex-green/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-neon-cortex-green flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-neon-cortex-green font-semibold mb-1">Rate Locked In</p>
                        <p className="text-text-secondary">
                          Your {teamData.discountPercentage}% discount is permanently locked at ${teamData.lockedInRate.toFixed(2)}/seat,
                          even if prices increase in the future.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlass>
          </div>
        )}
      </div>
    </div>
  );
}
