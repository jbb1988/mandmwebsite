'use client';

import { useState, useEffect } from 'react';

interface Template {
  id: string;
  name: string;
  segment: string;
  trigger_type: string;
  subject_line: string;
  body_template: string;
}

export default function TemplatePreviewPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates/triggered', {
        headers: { 'X-Admin-Password': password }
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        setAuthenticated(true);
        if (data.templates.length > 0) {
          setSelectedTemplate(data.templates[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  // Replace template variables with sample data
  const renderTemplate = (template: Template) => {
    if (!template) return '';

    let html = template.body_template;

    // Sample data for preview
    const sampleData: Record<string, string> = {
      '{{first_name}}': 'Coach',
      '{{last_name}}': 'Johnson',
      '{{organization_name}}': 'Elite Baseball Academy',
      '{{logo_url}}': 'https://mindandmuscle.ai',
      '{{cta_url}}': 'https://mindandmuscle.ai/download',
      '{{unsubscribe_url}}': 'https://mindandmuscle.ai/unsubscribe',
      '{{tracking_url_logo}}': 'https://mindandmuscle.ai',
      '{{calendly_link}}': 'https://mindandmuscle.ai/download',
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      html = html.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return html;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6">Template Preview</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            View Templates
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading templates...</div>
      </div>
    );
  }

  // Group templates by trigger type
  const groupedTemplates = templates.reduce((acc, template) => {
    const type = template.trigger_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  const triggerLabels: Record<string, string> = {
    clicked_no_booking: 'Clicked but No Booking (24h)',
    multiple_opens: 'Multiple Opens (4h)',
    clicked_went_quiet: 'Clicked then Went Quiet (48h)',
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 min-h-screen p-4 overflow-y-auto">
          <h1 className="text-xl font-bold text-white mb-6">Engagement Templates</h1>

          {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
            <div key={type} className="mb-6">
              <h2 className="text-sm font-semibold text-blue-400 uppercase mb-2">
                {triggerLabels[type] || type}
              </h2>
              <div className="space-y-1">
                {typeTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium capitalize">{template.segment.replace(/_/g, ' ')}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-6">
          {selectedTemplate && (
            <div>
              {/* Template Info */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    {selectedTemplate.trigger_type}
                  </span>
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded capitalize">
                    {selectedTemplate.segment.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mb-1">Subject Line:</div>
                <div className="text-white font-medium">
                  {selectedTemplate.subject_line.replace('{{first_name}}', 'Coach')}
                </div>
              </div>

              {/* Email Preview */}
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-sm text-gray-600">Email Preview</span>
                </div>
                <iframe
                  srcDoc={renderTemplate(selectedTemplate)}
                  className="w-full h-[700px] border-0"
                  title="Email Preview"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
