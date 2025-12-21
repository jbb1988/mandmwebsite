'use client';

import React, { useState } from 'react';
import { X, Send, Calendar, CheckSquare, Square, Loader2, FileText, ChevronDown } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content?: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkMarkSent: (templateName?: string) => Promise<void>;
  onBulkSetFollowUp: (date: string) => Promise<void>;
  isAllSelected: boolean;
  templates?: Template[];
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkMarkSent,
  onBulkSetFollowUp,
  isAllSelected,
  templates = [],
}: BulkActionBarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const handleBulkMarkSent = async (templateName?: string) => {
    setIsLoading(true);
    setShowTemplatePicker(false);
    try {
      await onBulkMarkSent(templateName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetFollowUp = async (daysFromNow: number) => {
    setIsLoading(true);
    try {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      await onBulkSetFollowUp(date.toISOString());
      setShowFollowUpPicker(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#1B1F39] border border-white/20 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
        {/* Select All / Clear */}
        <button
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-cyan-400" />
          ) : (
            <Square className="w-4 h-4 text-white/40" />
          )}
          <span className="text-sm text-white/70">
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </span>
        </button>

        {/* Selection count */}
        <div className="px-3 py-1.5 bg-cyan-500/20 rounded-lg">
          <span className="text-sm font-medium text-cyan-400">
            {selectedCount} selected
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {/* Mark as DM Sent with Template Picker */}
          <div className="relative">
            <button
              onClick={() => templates.length > 0 ? setShowTemplatePicker(!showTemplatePicker) : handleBulkMarkSent()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Mark Sent</span>
              {templates.length > 0 && <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Template dropdown */}
            {showTemplatePicker && templates.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 bg-[#1B1F39] border border-white/20 rounded-xl shadow-xl p-2 min-w-[220px] max-h-[300px] overflow-y-auto">
                <div className="px-3 py-1.5 text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Select Template
                </div>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleBulkMarkSent(template.name)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <div className="font-medium text-white">{template.name}</div>
                    {template.content && (
                      <div className="text-xs text-white/40 line-clamp-1 mt-0.5">{template.content}</div>
                    )}
                  </button>
                ))}
                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    onClick={() => handleBulkMarkSent()}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/10 transition-colors"
                  >
                    No template (just mark sent)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Set Follow-up */}
          <div className="relative">
            <button
              onClick={() => setShowFollowUpPicker(!showFollowUpPicker)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-colors disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Follow-up</span>
            </button>

            {/* Follow-up dropdown */}
            {showFollowUpPicker && (
              <div className="absolute bottom-full mb-2 left-0 bg-[#1B1F39] border border-white/20 rounded-xl shadow-xl p-2 min-w-[140px]">
                <button
                  onClick={() => handleSetFollowUp(1)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => handleSetFollowUp(3)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
                >
                  In 3 days
                </button>
                <button
                  onClick={() => handleSetFollowUp(7)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
                >
                  In 1 week
                </button>
                <button
                  onClick={() => handleSetFollowUp(14)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
                >
                  In 2 weeks
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4 text-white/40" />
        </button>
      </div>
    </div>
  );
}

export default BulkActionBar;
