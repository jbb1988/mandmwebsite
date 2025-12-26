import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface WebhookLogData {
  source: string; // 'revenuecat', 'calendly', 'resend', 'stripe', etc.
  event_type: string;
  payload?: any;
  status?: 'received' | 'processed' | 'failed' | 'retried';
  status_code?: number;
  error_message?: string;
  processing_time_ms?: number;
  ip_address?: string;
  headers?: Record<string, string>;
}

export async function logWebhook(data: WebhookLogData) {
  try {
    await supabase.from('webhook_logs').insert({
      source: data.source,
      event_type: data.event_type,
      payload: data.payload,
      status: data.status || 'received',
      status_code: data.status_code,
      error_message: data.error_message,
      processing_time_ms: data.processing_time_ms,
      ip_address: data.ip_address,
      headers: data.headers,
      processed_at: data.status === 'processed' ? new Date().toISOString() : null,
    });
  } catch (error) {
    // Don't throw - webhook logging should never break the main flow
    console.error('Failed to log webhook:', error);
  }
}

export async function updateWebhookLog(
  id: string,
  updates: Partial<WebhookLogData>
) {
  try {
    await supabase
      .from('webhook_logs')
      .update({
        ...updates,
        processed_at: updates.status === 'processed' ? new Date().toISOString() : undefined,
      })
      .eq('id', id);
  } catch (error) {
    console.error('Failed to update webhook log:', error);
  }
}

// Helper to create a webhook logger for a specific source
export function createWebhookLogger(source: string) {
  return {
    log: (event_type: string, payload?: any, options?: Partial<WebhookLogData>) =>
      logWebhook({ source, event_type, payload, ...options }),

    success: (event_type: string, payload?: any, processing_time_ms?: number) =>
      logWebhook({
        source,
        event_type,
        payload,
        status: 'processed',
        status_code: 200,
        processing_time_ms
      }),

    error: (event_type: string, error: string, payload?: any, status_code = 500) =>
      logWebhook({
        source,
        event_type,
        payload,
        status: 'failed',
        status_code,
        error_message: error
      }),
  };
}

// Pre-configured loggers for common webhook sources
export const revenueCatLogger = createWebhookLogger('revenuecat');
export const calendlyLogger = createWebhookLogger('calendly');
export const resendLogger = createWebhookLogger('resend');
export const stripeLogger = createWebhookLogger('stripe');
