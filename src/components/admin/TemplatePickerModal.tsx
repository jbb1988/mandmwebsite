'use client';

import React, { useState } from 'react';
import { Card } from './shared/Card';
import {
  X,
  Copy,
  Check,
  FileText,
  TrendingUp,
  Send,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content: string;
}

interface TemplateStats {
  name: string;
  used: number;
  responses: number;
  conversions: number;
  responseRate: number;
  conversionRate: number;
}

interface TemplatePickerModalProps {
  templates: Template[];
  templateStats?: TemplateStats[];
  contactName: string;
  groupName?: string;
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export function TemplatePickerModal({
  templates,
  templateStats = [],
  contactName,
  groupName,
  onSelect,
  onClose,
}: TemplatePickerModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Get stats for a template
  const getStats = (templateName: string) => {
    return templateStats.find(s => s.name === templateName);
  };

  // Preview template with replaced placeholders
  const previewTemplate = (content: string) => {
    let text = content;
    text = text.replace(/{name}/g, contactName.split(' ')[0]);
    text = text.replace(/{group_name}/g, groupName || '[Group Name]');
    return text;
  };

  // Copy template to clipboard
  const handleCopy = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = previewTemplate(template.content);
    await navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Use template and close
  const handleUseTemplate = (template: Template) => {
    onSelect(template);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-xl">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Select Template</h2>
              <p className="text-sm text-white/40">
                Choose a template for <span className="text-cyan-400">{contactName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/40">
              <FileText className="w-12 h-12 mb-3 opacity-50" />
              <p>No templates available</p>
            </div>
          ) : (
            templates.map((template) => {
              const stats = getStats(template.name);
              const isSelected = selectedId === template.id;
              const isCopied = copiedId === template.id;

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedId(isSelected ? null : template.id)}
                  className={`rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {/* Template Header */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        {stats && stats.responseRate > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                            <TrendingUp className="w-3 h-3" />
                            {stats.responseRate}% response
                          </span>
                        )}
                      </div>

                      {/* Stats row */}
                      {stats && (
                        <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                          <span>{stats.used} uses</span>
                          <span>{stats.responses} responses</span>
                          <span>{stats.conversions} conversions</span>
                        </div>
                      )}

                      {/* Template Preview (collapsed) */}
                      <p className={`text-sm text-white/60 ${isSelected ? '' : 'line-clamp-2'}`}>
                        {previewTemplate(template.content)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button
                        onClick={(e) => handleCopy(template, e)}
                        className={`p-2 rounded-lg transition-colors ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 hover:bg-white/20 text-white/60'
                        }`}
                        title="Copy to clipboard"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded content with full preview */}
                  {isSelected && (
                    <div className="px-4 pb-4 space-y-3">
                      {/* Full template content */}
                      <div className="p-4 bg-black/30 rounded-xl border border-white/10">
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Full Preview</p>
                        <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
                          {previewTemplate(template.content)}
                        </pre>
                      </div>

                      {/* Use Template button */}
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Copy & Mark as Sent
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer with hint */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <p className="text-xs text-white/40 text-center">
            Click a template to expand, then use &quot;Copy & Mark as Sent&quot; to copy and update the contact status
          </p>
        </div>
      </Card>
    </div>
  );
}

export default TemplatePickerModal;
