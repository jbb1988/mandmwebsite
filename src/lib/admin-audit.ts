import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AdminAction =
  | 'grant_trial'
  | 'revoke_trial'
  | 'extend_trial'
  | 'create_promo_code'
  | 'delete_promo_code'
  | 'sync_partners'
  | 'create_partner'
  | 'update_partner'
  | 'send_announcement'
  | 'delete_announcement'
  | 'grant_discount'
  | 'update_user'
  | 'delete_user'
  | 'ban_user'
  | 'unban_user'
  | 'login'
  | 'logout';

export interface AuditLogEntry {
  action: AdminAction;
  targetType?: 'user' | 'partner' | 'promo_code' | 'announcement' | 'system';
  targetId?: string;
  targetEmail?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        action: entry.action,
        target_type: entry.targetType,
        target_id: entry.targetId,
        target_email: entry.targetEmail,
        details: entry.details || {},
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        admin_identifier: 'admin', // Can be updated when proper admin auth is added
      });

    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (error) {
    console.error('Error in logAdminAction:', error);
  }
}

// Helper to extract IP and User-Agent from request headers
export function getRequestInfo(headers: Headers): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || undefined,
    userAgent: headers.get('user-agent') || undefined,
  };
}

// Get recent admin actions for dashboard display
export async function getRecentAdminActions(limit = 20): Promise<{
  success: boolean;
  actions?: Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetEmail: string | null;
    details: Record<string, unknown>;
    createdAt: string;
  }>;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      actions: data?.map(row => ({
        id: row.id,
        action: row.action,
        targetType: row.target_type,
        targetEmail: row.target_email,
        details: row.details || {},
        createdAt: row.created_at,
      })),
    };
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    return { success: false, error: 'Failed to fetch admin actions' };
  }
}
