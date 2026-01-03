import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface QueueConfig {
  table: string;
  statusColumn: string;
  statusType: 'text' | 'boolean'; // 'text' for status strings, 'boolean' for processed flag
  timestampColumn: string;
  displayName: string;
}

const QUEUE_CONFIGS: QueueConfig[] = [
  { table: 'ai_generation_queue', statusColumn: 'status', statusType: 'text', timestampColumn: 'created_at', displayName: 'AI Generation Queue' },
  { table: 'event_notification_queue', statusColumn: 'processed', statusType: 'boolean', timestampColumn: 'created_at', displayName: 'Event Notifications' },
  { table: 'fb_daily_outreach_queue', statusColumn: 'status', statusType: 'text', timestampColumn: 'posted_at', displayName: 'FB Outreach Queue' },
  { table: 'x_daily_outreach_queue', statusColumn: 'status', statusType: 'text', timestampColumn: 'last_activity_date', displayName: 'X Outreach Queue' },
];

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const queues = await Promise.all(
      QUEUE_CONFIGS.map(async (config) => {
        try {
          // Build SQL based on status type (text vs boolean)
          let sql: string;
          if (config.statusType === 'boolean') {
            // For boolean 'processed' column
            sql = `
              SELECT
                '${config.table}' as queue_name,
                '${config.displayName}' as display_name,
                COUNT(*) as total_items,
                COUNT(*) FILTER (WHERE ${config.statusColumn} = false) as pending,
                0 as processing,
                COUNT(*) FILTER (WHERE ${config.statusColumn} = true) as completed,
                0 as failed,
                MIN(${config.timestampColumn}) FILTER (WHERE ${config.statusColumn} = false) as oldest_pending,
                MAX(${config.timestampColumn}) as newest_item
              FROM ${config.table}
            `;
          } else {
            // For text status column
            sql = `
              SELECT
                '${config.table}' as queue_name,
                '${config.displayName}' as display_name,
                COUNT(*) as total_items,
                COUNT(*) FILTER (WHERE ${config.statusColumn} = 'pending') as pending,
                COUNT(*) FILTER (WHERE ${config.statusColumn} = 'processing' OR ${config.statusColumn} = 'in_progress') as processing,
                COUNT(*) FILTER (WHERE ${config.statusColumn} = 'completed' OR ${config.statusColumn} = 'done') as completed,
                COUNT(*) FILTER (WHERE ${config.statusColumn} = 'failed' OR ${config.statusColumn} = 'error') as failed,
                MIN(${config.timestampColumn}) FILTER (WHERE ${config.statusColumn} = 'pending') as oldest_pending,
                MAX(${config.timestampColumn}) as newest_item
              FROM ${config.table}
            `;
          }

          // Get queue stats
          const { data: stats } = await supabase.rpc('exec_sql', { sql });

          // Get recent items
          const { data: recentItems } = await supabase
            .from(config.table)
            .select('*')
            .order(config.timestampColumn, { ascending: false })
            .limit(10);

          return {
            ...stats?.[0],
            recentItems: recentItems || []
          };
        } catch (e) {
          return {
            queue_name: config.table,
            display_name: config.displayName,
            total_items: 0,
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            error: 'Failed to fetch queue stats'
          };
        }
      })
    );

    // Also get net._http_response queue (Supabase's internal HTTP queue)
    try {
      const { data: httpQueue } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT
            'net._http_response' as queue_name,
            'HTTP Request Queue' as display_name,
            COUNT(*) as total_items,
            COUNT(*) FILTER (WHERE status_code IS NULL) as pending,
            COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as completed,
            COUNT(*) FILTER (WHERE status_code >= 400 OR status_code IS NULL) as failed
          FROM net._http_response
          WHERE created > NOW() - INTERVAL '24 hours'
        `
      });

      if (httpQueue?.[0]) {
        queues.push(httpQueue[0]);
      }
    } catch {
      // HTTP queue may not be accessible, ignore errors
    }

    return NextResponse.json(queues);
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    return NextResponse.json({ error: 'Failed to fetch queue stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, queueName, itemIds } = await request.json();

    if (action === 'retry') {
      // Retry failed items
      const { error } = await supabase
        .from(queueName)
        .update({ status: 'pending', error_message: null, retry_count: 0 })
        .in('id', itemIds);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_failed') {
      // Delete failed items
      const { error } = await supabase
        .from(queueName)
        .delete()
        .eq('status', 'failed');

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'clear_completed') {
      // Delete old completed items
      const { error } = await supabase
        .from(queueName)
        .delete()
        .in('status', ['completed', 'done'])
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with queue action:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
