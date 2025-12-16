'use client';

import { useState } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import {
  Handshake, AlertCircle, CheckCircle2, ExternalLink,
  Search, Users, FileText, ArrowRight, Info
} from 'lucide-react';

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

export default function PartnerAttributionPage() {
  const [referralCode, setReferralCode] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/partner-attribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          referralCode: referralCode.trim().toUpperCase(),
          customerEmail: customerEmail.trim().toLowerCase(),
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();
      setResult({
        success: data.success,
        message: data.message,
      });

      if (data.success) {
        // Clear form on success
        setReferralCode('');
        setCustomerEmail('');
        setAmount('');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to server',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commission = amount ? (parseFloat(amount) * 0.10).toFixed(2) : '0.00';

  return (
    <AdminGate
      title="Partner Attribution"
      description="Manually attribute sales to Tolt partners"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/5 via-transparent to-blue-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Handshake className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Partner Attribution</h1>
              <p className="text-white/50">Manually attribute sales to Tolt affiliate partners</p>
            </div>

            <AdminNav />

            {/* When to Use Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-1">When to use manual attribution</h3>
                  <p className="text-white/60 text-sm">
                    Use this when a partner's tracking link failed but you know they referred the customer.
                    This creates a conversion in Tolt so the partner gets commission credit.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Attribution Form */}
              <div className="bg-[#0F1123]/80 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Create Tolt Conversion
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Step 1: Partner Code */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mr-2">1</span>
                      Partner Referral Code
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g., SMITH or COACHJ"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                      required
                    />
                    <p className="text-xs text-white/40 mt-1">
                      Don't know it? <a href="https://app.tolt.io/partners" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Look up in Tolt →</a>
                    </p>
                  </div>

                  {/* Step 2: Customer Email */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mr-2">2</span>
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                      required
                    />
                    <p className="text-xs text-white/40 mt-1">
                      The email of the customer who purchased
                    </p>
                  </div>

                  {/* Step 3: Amount */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mr-2">3</span>
                      Purchase Amount ($)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="1284.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                      required
                    />
                  </div>

                  {/* Commission Preview */}
                  {amount && parseFloat(amount) > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Partner Commission (10%)</span>
                        <span className="text-emerald-400 font-bold text-lg">${commission}</span>
                      </div>
                    </div>
                  )}

                  {/* Result Message */}
                  {result && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 ${
                      result.success
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      {result.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={result.success ? 'text-emerald-400' : 'text-red-400'}>
                        {result.message}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !referralCode || !customerEmail || !amount}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Handshake className="w-5 h-5" />
                        Create Tolt Conversion
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column - Help & Links */}
              <div className="space-y-6">
                {/* How It Works */}
                <div className="bg-[#0F1123]/80 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Enter partner code</p>
                        <p className="text-white/50 text-sm">The unique code assigned to the partner in Tolt</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Add customer details</p>
                        <p className="text-white/50 text-sm">Email links customer to partner for future renewals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Conversion created in Tolt</p>
                        <p className="text-white/50 text-sm">Partner sees it in their dashboard and earns commission</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-[#0F1123]/80 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-white/40" />
                    Tolt Dashboard
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="https://app.tolt.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-emerald-400" />
                        <span className="text-white">Tolt Dashboard</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    </a>
                    <a
                      href="https://app.tolt.io/partners"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-white">View Partners</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    </a>
                    <a
                      href="https://app.tolt.io/conversions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="text-white">View Conversions</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                    </a>
                  </div>
                </div>

                {/* Find Partner Code Help */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <h4 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Finding a Partner Code
                  </h4>
                  <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://app.tolt.io/partners" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Tolt Partners</a></li>
                    <li>Search by partner name or email</li>
                    <li>Click on their profile</li>
                    <li>Copy their referral code</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
