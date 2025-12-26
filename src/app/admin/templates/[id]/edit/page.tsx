'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  ArrowLeft, Save, X, RefreshCw, Eye, AlertCircle,
  Check, Plus, Monitor, Smartphone
} from 'lucide-react';

// Card component
function Card({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-[#0F1123]/80 border border-white/[0.08] ${className}`}>
      {children}
    </div>
  );
}

// Template variables that can be inserted
const TEMPLATE_VARIABLES = [
  { key: 'first_name', label: 'First Name', example: 'Coach' },
  { key: 'last_name', label: 'Last Name', example: 'Johnson' },
  { key: 'organization_name', label: 'Organization', example: 'Elite Baseball' },
  { key: 'facility_name', label: 'Facility', example: 'Training Center' },
  { key: 'calendly_link', label: 'Calendly Link', example: 'https://calendly.com/...' },
  { key: 'cta_url', label: 'CTA URL', example: 'https://mindandmuscle.ai/download' },
  { key: 'unsubscribe_url', label: 'Unsubscribe', example: 'https://mindandmuscle.ai/unsubscribe' },
  { key: 'logo_url', label: 'Logo URL', example: 'https://mindandmuscle.ai/logo.png' },
];

// Sample data for preview
const SAMPLE_DATA: Record<string, string> = {
  first_name: 'Coach',
  last_name: 'Johnson',
  organization_name: 'Elite Baseball Academy',
  company_name: 'Elite Baseball Academy',
  facility_name: 'Elite Training Center',
  logo_url: 'https://mindandmuscle.ai',
  cta_url: 'https://mindandmuscle.ai/download',
  calendly_link: 'https://calendly.com/mindandmuscle',
  unsubscribe_url: 'https://mindandmuscle.ai/unsubscribe',
  tracking_url_logo: 'https://mindandmuscle.ai',
  tracking_url_cta: 'https://mindandmuscle.ai/download',
  your_name: 'Alex',
  platform: 'Instagram',
  full_name: 'Coach Johnson',
  tier: 'Pro',
  trial_days_remaining: '3',
  features_used: '5',
  last_feature: 'Swing Lab',
  streak_count: '12',
  app_url: 'https://mindandmuscle.ai/app',
  partner_link: 'https://mindandmuscle.ai/partner',
  current_year: new Date().getFullYear().toString(),
};

interface Template {
  id: string;
  name: string;
  segment: string;
  sequence_step: number;
  subject_line: string;
  body_template: string;
  is_triggered: boolean;
  trigger_type: string | null;
  category: string;
  source: string;
}

export default function TemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [subjectLine, setSubjectLine] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showVariables, setShowVariables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getPassword } = useAdminAuth();
  const router = useRouter();

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const password = getPassword();
      const response = await fetch(`/api/admin/templates/${resolvedParams.id}`, {
        headers: { 'X-Admin-Password': password },
      });
      const data = await response.json();
      if (data.success) {
        setTemplate(data.template);
        setSubjectLine(data.template.subject_line);
        setBodyTemplate(data.template.body_template);
      } else {
        setError(data.error || 'Failed to load template');
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [resolvedParams.id]);

  // Track changes
  useEffect(() => {
    if (template) {
      setHasChanges(
        subjectLine !== template.subject_line ||
        bodyTemplate !== template.body_template
      );
    }
  }, [subjectLine, bodyTemplate, template]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Render preview with sample data
  const renderPreview = () => {
    let html = bodyTemplate;

    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value);
    });

    return html;
  };

  // Insert variable at cursor position
  const insertVariable = (key: string) => {
    const variable = `{{${key}}}`;
    const textarea = document.getElementById('body-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = bodyTemplate.substring(0, start) + variable + bodyTemplate.substring(end);
      setBodyTemplate(newValue);

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
    setShowVariables(false);
  };

  // Save template
  const saveTemplate = async () => {
    if (!template) return;

    setSaving(true);
    setError(null);

    try {
      const password = getPassword();
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          subject_line: subjectLine,
          body_template: bodyTemplate,
          category: template.category,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        setHasChanges(false);
        setTimeout(() => setSaved(false), 2000);

        // Update template state
        setTemplate({
          ...template,
          subject_line: subjectLine,
          body_template: bodyTemplate,
        });
      } else {
        setError(data.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      </AdminSidebar>
    );
  }

  if (!template || error) {
    return (
      <AdminSidebar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">
            {error || 'Template Not Found'}
          </h2>
          <Link
            href="/admin/templates"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Link>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0A0B14] border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/templates/${template.id}`}
                className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Edit: {template.name || `${template.segment} - Step ${template.sequence_step}`}
                </h1>
                {hasChanges && (
                  <span className="text-yellow-400 text-xs">Unsaved changes</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/templates/${template.id}`}
                className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </Link>
              <button
                onClick={saveTemplate}
                disabled={saving || !hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  hasChanges
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3">
            <div className="flex items-center gap-2 max-w-7xl mx-auto text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left: Editor */}
            <div className="space-y-4 flex flex-col">
              {/* Subject Line */}
              <Card className="p-4">
                <label className="block text-white/60 text-sm mb-2">Subject Line</label>
                <input
                  type="text"
                  value={subjectLine}
                  onChange={(e) => setSubjectLine(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                  placeholder="Email subject line..."
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/30 text-xs">{subjectLine.length} characters</span>
                </div>
              </Card>

              {/* Variable Insertion */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Insert Variable</span>
                  <button
                    onClick={() => setShowVariables(!showVariables)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {showVariables ? 'Hide' : 'Show All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(showVariables ? TEMPLATE_VARIABLES : TEMPLATE_VARIABLES.slice(0, 4)).map((v) => (
                    <button
                      key={v.key}
                      onClick={() => insertVariable(v.key)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {v.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Body Editor */}
              <Card className="p-4 flex-1 flex flex-col">
                <label className="block text-white/60 text-sm mb-2">HTML Body</label>
                <textarea
                  id="body-editor"
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  className="flex-1 min-h-[400px] w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
                  placeholder="<html>...</html>"
                  spellCheck={false}
                />
              </Card>
            </div>

            {/* Right: Preview */}
            <div className="flex flex-col">
              {/* Preview Header */}
              <Card className="p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-white/40" />
                    <span className="text-white/60 text-sm">Live Preview</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                    <button
                      onClick={() => setDeviceMode('desktop')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        deviceMode === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeviceMode('mobile')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                        deviceMode === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Subject Preview */}
              <Card className="p-3 mb-4">
                <div className="text-white/40 text-xs mb-1">Subject:</div>
                <div className="text-white text-sm">
                  {subjectLine.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_DATA[key] || `{{${key}}}`)}
                </div>
              </Card>

              {/* Email Preview */}
              <Card className="flex-1 overflow-hidden">
                <div className="bg-[#1a1b2e] px-4 py-2 border-b border-white/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div
                  className={`bg-white overflow-auto ${
                    deviceMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''
                  }`}
                  style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}
                >
                  <iframe
                    srcDoc={renderPreview()}
                    className={`border-0 h-full ${deviceMode === 'mobile' ? 'w-[375px]' : 'w-full'}`}
                    title="Email Preview"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
