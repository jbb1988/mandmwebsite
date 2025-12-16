'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import {
  FolderOpen, Search, RefreshCw, Download, Trash2, Eye, X,
  Calendar, Mail, User, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react';

interface Banner {
  id: string;
  partner_name: string;
  partner_email: string;
  partner_logo_url: string | null;
  qr_code_url: string | null;
  banner_url: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function Card({ children, className = '', variant = 'default' }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

export default function BannerLibraryPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/admin/partner-banners?${params}`, {
        headers: { 'X-Admin-Password': adminPassword },
      });

      const data = await response.json();
      if (data.success) {
        setBanners(data.banners);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, adminPassword]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    setDeleting(bannerId);
    try {
      const response = await fetch(`/api/admin/partner-banners?id=${bannerId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });

      const data = await response.json();
      if (data.success) {
        fetchBanners();
        if (selectedBanner?.id === bannerId) {
          setSelectedBanner(null);
        }
      } else {
        alert(`Failed to delete: ${data.message}`);
      }
    } catch {
      alert('Failed to delete banner');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (banner: Banner) => {
    try {
      const response = await fetch(banner.banner_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${banner.partner_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-banner.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Fallback: open in new tab
      window.open(banner.banner_url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AdminGate
      title="Admin: Banner Library"
      description="Enter admin password to access banner library"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <FolderOpen className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Banner Library</h1>
              <p className="text-white/50 text-sm sm:text-base">Search and manage saved partner banners</p>
            </div>

            {/* Admin Navigation */}
            <AdminNav />

            {/* Stats & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white/50 text-sm">Total Banners:</span>
                  <span className="ml-2 text-white font-bold">{total}</span>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by partner name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button
                  onClick={fetchBanners}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Banner Grid */}
            <Card variant="elevated" className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <p className="mt-2 text-gray-400">Loading banners...</p>
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    {debouncedSearch ? `No banners found for "${debouncedSearch}"` : 'No banners saved yet'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create banners in the Banner Generator and save them to the library
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {banners.map((banner) => (
                      <div
                        key={banner.id}
                        className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all"
                      >
                        {/* Banner Thumbnail */}
                        <div
                          className="aspect-[2/1] bg-gray-900 relative cursor-pointer"
                          onClick={() => setSelectedBanner(banner)}
                        >
                          <img
                            src={banner.banner_url}
                            alt={`${banner.partner_name} banner`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Banner Info */}
                        <div className="p-3">
                          <h3 className="font-semibold text-white truncate">{banner.partner_name}</h3>
                          <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {banner.partner_email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(banner.created_at)}
                          </p>
                          {banner.notes && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{banner.notes}</p>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleDownload(banner)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-xs font-medium transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                            <button
                              onClick={() => handleDelete(banner.id)}
                              disabled={deleting === banner.id}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs font-medium disabled:opacity-50 transition-colors"
                            >
                              {deleting === banner.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-white/10">
                      <p className="text-sm text-gray-400">
                        Page {page} of {totalPages} ({total} total)
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages}
                          className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Full-size Preview Modal */}
        {selectedBanner && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedBanner(null)}
          >
            <div
              className="bg-[#0F1123] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedBanner.partner_name}</h2>
                  <p className="text-sm text-gray-400">{selectedBanner.partner_email}</p>
                </div>
                <button
                  onClick={() => setSelectedBanner(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Banner Preview */}
              <div className="p-4">
                <img
                  src={selectedBanner.banner_url}
                  alt={`${selectedBanner.partner_name} banner`}
                  className="w-full rounded-lg"
                />
              </div>

              {/* Banner Details */}
              <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">Partner:</span>
                    <span className="text-white">{selectedBanner.partner_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{selectedBanner.partner_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">{formatDate(selectedBanner.created_at)}</span>
                  </div>
                  {selectedBanner.notes && (
                    <div className="text-sm">
                      <span className="text-gray-400">Notes:</span>
                      <p className="text-white mt-1">{selectedBanner.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleDownload(selectedBanner)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Banner
                  </button>
                  <a
                    href={selectedBanner.banner_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open Full Size
                  </a>
                  <button
                    onClick={() => {
                      handleDelete(selectedBanner.id);
                    }}
                    disabled={deleting === selectedBanner.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 font-medium transition-colors disabled:opacity-50"
                  >
                    {deleting === selectedBanner.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete Banner
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
