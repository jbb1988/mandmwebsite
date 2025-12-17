'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import {
  Users, RefreshCw, Trash2, Search, ExternalLink, CheckCircle, XCircle,
  AlertTriangle, Mail, Calendar, Link2, Image, ChevronDown, ChevronUp
} from 'lucide-react';

// Card component matching admin styling
function Card({ children, className = '', variant = 'default', glow = false }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: boolean;
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };
  const glowClass = glow ? 'shadow-lg shadow-blue-500/10' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}>
      {children}
    </div>
  );
}

interface Partner {
  id: string;
  email: string;
  name: string;
  first_name: string;
  tolt_partner_id: string | null;
  referral_url: string | null;
  referral_slug: string | null;
  logo_url: string | null;
  created_at: string;
  toltStatus?: string;
  toltError?: string;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteFromTolt, setDeleteFromTolt] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || '';

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async (checkTolt = false) => {
    try {
      setLoading(true);
      const url = checkTolt ? '/api/admin/partners?checkTolt=true' : '/api/admin/partners';
      const res = await fetch(url, {
        headers: { 'x-admin-password': adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setPartners(data.partners);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch partners' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch partners' });
    } finally {
      setLoading(false);
    }
  };

  const syncWithTolt = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ action: 'sync-all' }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Synced ${data.total} partners. ${data.notInTolt} not found in Tolt.`
        });
        // Refresh with Tolt status
        await fetchPartners(true);
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const deletePartner = async (email: string) => {
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ email, deleteFromTolt }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setPartners(partners.filter(p => p.email !== email));
        setDeleteConfirm(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Delete failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const filteredPartners = partners.filter(p =>
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getToltStatusBadge = (partner: Partner) => {
    if (!partner.tolt_partner_id) {
      return (
        <span className="flex items-center gap-1 text-xs text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          No Tolt ID
        </span>
      );
    }
    if (partner.toltStatus === 'not_found') {
      return (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <XCircle className="w-3 h-3" />
          Not in Tolt
        </span>
      );
    }
    if (partner.toltStatus) {
      return (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle className="w-3 h-3" />
          {partner.toltStatus}
        </span>
      );
    }
    return (
      <span className="text-xs text-white/40">
        Not checked
      </span>
    );
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14]">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-7 h-7 text-blue-400" />
                Partner Management
              </h1>
              <p className="text-white/60 mt-1">
                Manage affiliate partners and sync with Tolt
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchPartners(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={syncWithTolt}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync with Tolt
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
              <button
                onClick={() => setMessage(null)}
                className="float-right text-white/60 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-2xl font-bold text-white">{partners.length}</div>
              <div className="text-sm text-white/60">Total Partners</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {partners.filter(p => p.toltStatus === 'active' || (!p.toltStatus && p.tolt_partner_id)).length}
              </div>
              <div className="text-sm text-white/60">With Tolt ID</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {partners.filter(p => !p.tolt_partner_id).length}
              </div>
              <div className="text-sm text-white/60">No Tolt ID</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-400">
                {partners.filter(p => p.toltStatus === 'not_found').length}
              </div>
              <div className="text-sm text-white/60">Not in Tolt</div>
            </Card>
          </div>

          {/* Search */}
          <Card className="p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
          </Card>

          {/* Partners List */}
          <Card variant="elevated" className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                Partners ({filteredPartners.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-white/60">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading partners...
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                No partners found
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredPartners.map((partner) => (
                  <div key={partner.id} className="hover:bg-white/5 transition-colors">
                    {/* Main row */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar/Logo */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          {partner.logo_url ? (
                            <img
                              src={partner.logo_url}
                              alt={partner.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {partner.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {partner.name}
                            </span>
                            {getToltStatusBadge(partner)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{partner.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {expandedPartner === partner.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>

                        {deleteConfirm === partner.email ? (
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs text-white/60">
                              <input
                                type="checkbox"
                                checked={deleteFromTolt}
                                onChange={(e) => setDeleteFromTolt(e.target.checked)}
                                className="rounded"
                              />
                              Also Tolt
                            </label>
                            <button
                              onClick={() => deletePartner(partner.email)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(partner.email)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete partner"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedPartner === partner.id && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-white/5 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-white/40 mb-1">Tolt Partner ID</div>
                            <div className="text-white font-mono">
                              {partner.tolt_partner_id || 'None'}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Referral Slug</div>
                            <div className="text-white font-mono">
                              {partner.referral_slug || 'None'}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Created</div>
                            <div className="text-white flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(partner.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Has Logo</div>
                            <div className="text-white flex items-center gap-1">
                              <Image className="w-3 h-3" />
                              {partner.logo_url ? 'Yes' : 'No'}
                            </div>
                          </div>
                          {partner.referral_url && (
                            <div className="sm:col-span-2">
                              <div className="text-white/40 mb-1">Referral URL</div>
                              <a
                                href={partner.referral_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                              >
                                <Link2 className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{partner.referral_url}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminGate>
  );
}
