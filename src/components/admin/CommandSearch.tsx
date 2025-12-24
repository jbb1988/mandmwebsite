'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Search,
  User,
  Handshake,
  FileText,
  X,
  Command,
  ArrowRight,
} from 'lucide-react';

interface SearchResult {
  type: 'user' | 'partner' | 'page';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

export default function CommandSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { getPassword } = useAdminAuth();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const password = getPassword();
        const response = await fetch(`/api/admin/global-search?q=${encodeURIComponent(query)}`, {
          headers: { 'X-Admin-Password': password },
        });
        const data = await response.json();
        if (data.success) {
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, getPassword]);

  // Handle navigation with keyboard
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigateToResult(results[selectedIndex]);
    }
  }, [results, selectedIndex]);

  const navigateToResult = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    router.push(result.href);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'partner':
        return <Handshake className="w-4 h-4 text-emerald-400" />;
      case 'page':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <Search className="w-4 h-4 text-white/40" />;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/50 text-sm transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/40">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          setIsOpen(false);
          setQuery('');
          setResults([]);
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 bg-[#0F1123] border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search className={`w-5 h-5 ${loading ? 'text-cyan-400 animate-pulse' : 'text-white/40'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search users, partners, pages..."
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-lg"
          />
          <button
            onClick={() => {
              setIsOpen(false);
              setQuery('');
              setResults([]);
            }}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => navigateToResult(result)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  index === selectedIndex
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="p-2 bg-white/10 rounded-xl">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{result.title}</p>
                  <p className="text-sm text-white/40 truncate">{result.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    result.type === 'user'
                      ? 'bg-blue-500/20 text-blue-400'
                      : result.type === 'partner'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {result.type}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="p-8 text-center text-white/40">
            No results found for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Tips */}
        <div className="flex items-center justify-between p-3 bg-white/5 text-xs text-white/30 border-t border-white/10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
              select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
