import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, verifyAdminWithRateLimit } from '@/lib/admin-auth';

// Create Supabase client inside functions to ensure env vars are available
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'update';
  priority: number;
  active: boolean;
  target_audience: 'all' | 'free' | 'premium' | 'coach';
  target_user_ids: string[] | null;
  created_at: string;
  expires_at: string | null;
  starts_at: string | null;
  created_by: string | null;
  reaction_type: 'none' | 'general' | 'usefulness' | 'bug_fix' | 'content';
  // Push notification fields
  send_push: boolean;
  push_title: string | null;
  push_scheduled_at: string | null;
  push_sent_at: string | null;
  push_sent_count: number;
  notification_sound: string;
  play_banner_sound: boolean;
}

interface AnnouncementReaction {
  id: string;
  announcement_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

// GET: List all announcements
export async function GET(request: NextRequest) {
  console.log('[Announcements API] GET request received');

  if (!verifyAdmin(request)) {
    console.log('[Announcements API] Unauthorized - admin verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('[Announcements API] Admin verified');

  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    console.log('[Announcements API] Creating Supabase client...');
    console.log('[Announcements API] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('[Announcements API] SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

    const supabase = getSupabaseClient();
    console.log('[Announcements API] Supabase client created, querying...');

    let query = supabase
      .from('system_announcements')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data: announcements, error } = await query;
    console.log('[Announcements API] Query completed. Error:', error?.message || 'none', 'Count:', announcements?.length || 0);

    if (error) {
      console.error('[Announcements API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get stats
    const stats = {
      total: announcements?.length || 0,
      active: announcements?.filter((a: SystemAnnouncement) => a.active).length || 0,
      inactive: announcements?.filter((a: SystemAnnouncement) => !a.active).length || 0,
      byType: {
        info: announcements?.filter((a: SystemAnnouncement) => a.type === 'info').length || 0,
        warning: announcements?.filter((a: SystemAnnouncement) => a.type === 'warning').length || 0,
        success: announcements?.filter((a: SystemAnnouncement) => a.type === 'success').length || 0,
        update: announcements?.filter((a: SystemAnnouncement) => a.type === 'update').length || 0,
      },
    };

    return NextResponse.json({
      success: true,
      announcements: announcements || [],
      stats,
    });
  } catch (error) {
    console.error('[Announcements API] CATCH ERROR:', error);
    console.error('[Announcements API] Error type:', typeof error);
    console.error('[Announcements API] Error name:', (error as Error)?.name);
    console.error('[Announcements API] Error message:', (error as Error)?.message);
    console.error('[Announcements API] Error stack:', (error as Error)?.stack);
    return NextResponse.json({
      error: 'Internal server error',
      details: (error as Error)?.message
    }, { status: 500 });
  }
}

// POST: Create, update, delete, or toggle announcements (rate limited)
export async function POST(request: NextRequest) {
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { action } = body;

    // CREATE announcement
    if (action === 'create') {
      const {
        title, message, type, priority, target_audience, target_user_ids,
        expires_at, starts_at, created_by, reaction_type,
        send_push, push_title, push_scheduled_at, notification_sound, play_banner_sound
      } = body;

      if (!title || !message) {
        return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('system_announcements')
        .insert({
          title,
          message,
          type: type || 'info',
          priority: priority || 0,
          active: true,
          target_audience: target_audience || 'all',
          target_user_ids: target_user_ids || null,
          expires_at: expires_at || null,
          starts_at: starts_at || null,
          created_by: created_by || 'Admin',
          reaction_type: reaction_type || 'none',
          // Push notification fields
          send_push: send_push || false,
          push_title: push_title || null,
          push_scheduled_at: push_scheduled_at || null,
          notification_sound: notification_sound || 'default',
          play_banner_sound: play_banner_sound || false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // If send_push is enabled and no schedule, trigger push now
      if (send_push && !push_scheduled_at && data) {
        try {
          const pushResult = await sendAnnouncementPush(supabase, data.id);
          console.log('[Announcements API] Push sent:', pushResult);
        } catch (pushError) {
          console.error('[Announcements API] Failed to send push:', pushError);
          // Don't fail the whole request, just log it
        }
      }

      return NextResponse.json({ success: true, announcement: data, message: 'Announcement created' });
    }

    // UPDATE announcement
    if (action === 'update') {
      const {
        id, title, message, type, priority, target_audience, target_user_ids,
        expires_at, starts_at, active, reaction_type,
        send_push, push_title, push_scheduled_at, notification_sound, play_banner_sound
      } = body;

      if (!id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      const updateData: Partial<SystemAnnouncement> = {};
      if (title !== undefined) updateData.title = title;
      if (message !== undefined) updateData.message = message;
      if (type !== undefined) updateData.type = type;
      if (priority !== undefined) updateData.priority = priority;
      if (target_audience !== undefined) updateData.target_audience = target_audience;
      if (target_user_ids !== undefined) updateData.target_user_ids = target_user_ids;
      if (expires_at !== undefined) updateData.expires_at = expires_at;
      if (starts_at !== undefined) updateData.starts_at = starts_at;
      if (active !== undefined) updateData.active = active;
      if (reaction_type !== undefined) updateData.reaction_type = reaction_type;
      // Push notification fields
      if (send_push !== undefined) updateData.send_push = send_push;
      if (push_title !== undefined) updateData.push_title = push_title;
      if (push_scheduled_at !== undefined) updateData.push_scheduled_at = push_scheduled_at;
      if (notification_sound !== undefined) updateData.notification_sound = notification_sound;
      if (play_banner_sound !== undefined) updateData.play_banner_sound = play_banner_sound;

      const { data, error } = await supabase
        .from('system_announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, announcement: data, message: 'Announcement updated' });
    }

    // TOGGLE active status
    if (action === 'toggle') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('system_announcements')
        .select('active')
        .eq('id', id)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Toggle
      const { data, error } = await supabase
        .from('system_announcements')
        .update({ active: !current.active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        announcement: data,
        message: data.active ? 'Announcement activated' : 'Announcement deactivated',
      });
    }

    // DELETE announcement
    if (action === 'delete') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('system_announcements')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Announcement deleted' });
    }

    // SEARCH USERS for targeting
    if (action === 'search-users') {
      const { query } = body;

      if (!query || query.length < 2) {
        return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
      }

      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, name')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, users: users || [] });
    }

    // GET REACTIONS for an announcement
    if (action === 'get-reactions') {
      const { announcement_id, page = 1, limit = 50 } = body;
      console.log('[Reactions API] Getting reactions for:', announcement_id);

      if (!announcement_id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      // Get reactions
      const offset = (page - 1) * limit;
      const { data: reactions, error: reactionsError, count } = await supabase
        .from('announcement_reactions')
        .select('id, reaction, created_at, user_id', { count: 'exact' })
        .eq('announcement_id', announcement_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      console.log('[Reactions API] Reactions result:', { reactions, error: reactionsError?.message, count });

      if (reactionsError) {
        console.error('[Reactions API] Error fetching reactions:', reactionsError);
        return NextResponse.json({ error: reactionsError.message }, { status: 500 });
      }

      // Get user profiles for reactions
      const userIds = [...new Set((reactions || []).map(r => r.user_id))];
      let profilesMap: Record<string, { email: string; name: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, name')
          .in('id', userIds);

        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = { email: p.email, name: p.name };
          return acc;
        }, {} as Record<string, { email: string; name: string | null }>);
      }

      // Calculate aggregated stats
      const { data: allReactions, error: statsError } = await supabase
        .from('announcement_reactions')
        .select('reaction')
        .eq('announcement_id', announcement_id);

      if (statsError) {
        return NextResponse.json({ error: statsError.message }, { status: 500 });
      }

      // Count by reaction type
      const reactionCounts: Record<string, number> = {};
      (allReactions || []).forEach((r: { reaction: string }) => {
        reactionCounts[r.reaction] = (reactionCounts[r.reaction] || 0) + 1;
      });

      // Format reactions with user info
      const formattedReactions = (reactions || []).map((r) => ({
        id: r.id,
        reaction: r.reaction,
        created_at: r.created_at,
        user: {
          id: r.user_id,
          email: profilesMap[r.user_id]?.email || 'Unknown',
          name: profilesMap[r.user_id]?.name || null,
        },
      }));

      return NextResponse.json({
        success: true,
        reactions: formattedReactions,
        stats: {
          total: count || 0,
          by_reaction: reactionCounts,
        },
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // SEND PUSH manually for an existing announcement
    if (action === 'send-push') {
      const { id } = body;

      if (!id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      try {
        const result = await sendAnnouncementPush(supabase, id);
        return NextResponse.json({
          success: true,
          sent_count: result.sent_count,
          message: `Push notification sent to ${result.sent_count} users`,
        });
      } catch (pushError) {
        console.error('[Announcements API] Failed to send push:', pushError);
        return NextResponse.json({
          error: (pushError as Error).message || 'Failed to send push notification'
        }, { status: 500 });
      }
    }

    // GET DELIVERY REPORT for push notifications
    if (action === 'get-delivery-report') {
      const { announcement_id, page = 1, limit = 50 } = body;

      if (!announcement_id) {
        return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
      }

      const offset = (page - 1) * limit;
      const { data: deliveries, error, count } = await supabase
        .from('announcement_push_deliveries')
        .select('*, profiles:user_id(email, name)', { count: 'exact' })
        .eq('announcement_id', announcement_id)
        .order('sent_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate stats
      const total = count || 0;
      const delivered = deliveries?.filter(d => d.delivered_at).length || 0;
      const opened = deliveries?.filter(d => d.opened_at).length || 0;
      const failed = deliveries?.filter(d => d.error).length || 0;

      return NextResponse.json({
        success: true,
        deliveries: deliveries || [],
        stats: {
          total,
          delivered,
          opened,
          failed,
          delivery_rate: total > 0 ? Math.round((delivered / total) * 100) : 0,
          open_rate: total > 0 ? Math.round((opened / total) * 100) : 0,
        },
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    }

    // SEND STANDALONE PUSH (no announcement, just push notification)
    if (action === 'send-standalone-push') {
      const { title, body: pushBody, target_audience, target_user_ids, notification_sound } = body;

      if (!title || !pushBody) {
        return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
      }

      try {
        const result = await sendStandalonePush(supabase, {
          title,
          body: pushBody,
          target_audience: target_audience || 'all',
          target_user_ids: target_user_ids || null,
          notification_sound: notification_sound || 'default',
        });
        return NextResponse.json({
          success: true,
          sent_count: result.sent_count,
          message: `Push notification sent to ${result.sent_count} users`,
        });
      } catch (pushError) {
        console.error('[Announcements API] Failed to send standalone push:', pushError);
        return NextResponse.json({
          error: (pushError as Error).message || 'Failed to send push notification'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in announcement management:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to send push notifications for an announcement
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendAnnouncementPush(
  supabase: any,
  announcementId: string
): Promise<{ sent_count: number }> {
  // Get the announcement
  const { data: announcement, error: fetchError } = await supabase
    .from('system_announcements')
    .select('*')
    .eq('id', announcementId)
    .single();

  if (fetchError || !announcement) {
    throw new Error('Announcement not found');
  }

  // Build query for target users with FCM tokens
  let usersQuery = supabase
    .from('profiles')
    .select('id, email, fcm_token, subscription_tier')
    .not('fcm_token', 'is', null);

  // Apply targeting
  if (announcement.target_user_ids && announcement.target_user_ids.length > 0) {
    usersQuery = usersQuery.in('id', announcement.target_user_ids);
  } else if (announcement.target_audience !== 'all') {
    // Map audience to subscription tiers
    const audienceMap: Record<string, string[]> = {
      free: ['free', 'trial', null as unknown as string],
      premium: ['pro', 'premium', 'annual'],
      coach: ['coach', 'team'],
    };
    const tiers = audienceMap[announcement.target_audience] || [];
    if (tiers.length > 0) {
      usersQuery = usersQuery.in('subscription_tier', tiers);
    }
  }

  const { data: users, error: usersError } = await usersQuery;

  if (usersError) {
    throw new Error(`Failed to fetch users: ${usersError.message}`);
  }

  if (!users || users.length === 0) {
    // No users to notify, just mark as sent with 0 count
    await supabase
      .from('system_announcements')
      .update({ push_sent_at: new Date().toISOString(), push_sent_count: 0 })
      .eq('id', announcementId);
    return { sent_count: 0 };
  }

  // Send push to each user via direct HTTP call to edge function
  let sentCount = 0;
  const pushTitle = announcement.push_title || announcement.title;
  const pushBody = announcement.message.substring(0, 100) + (announcement.message.length > 100 ? '...' : '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  for (const user of users) {
    if (!user.fcm_token) continue;

    try {
      console.log(`[Announcement Push] Sending to user ${user.email} (${user.id})`);

      // Call the FCM edge function directly via HTTP
      const response = await fetch(`${supabaseUrl}/functions/v1/send-fcm-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          userId: user.id,
          title: pushTitle,
          body: pushBody,
          data: {
            type: 'announcement',
            announcementId: announcementId,
          },
        }),
      });

      const result = await response.json();
      console.log(`[Announcement Push] Response for ${user.email}:`, result);

      const fcmError = !response.ok ? result.error : null;

      // Record delivery attempt
      await supabase
        .from('announcement_push_deliveries')
        .upsert({
          announcement_id: announcementId,
          user_id: user.id,
          fcm_token: user.fcm_token,
          sent_at: new Date().toISOString(),
          error: fcmError || null,
        }, { onConflict: 'announcement_id,user_id' });

      if (response.ok && result.success) {
        sentCount++;
      }
    } catch (e) {
      console.error(`[Push] Failed to send to user ${user.id}:`, e);
      // Record failed delivery
      await supabase
        .from('announcement_push_deliveries')
        .upsert({
          announcement_id: announcementId,
          user_id: user.id,
          fcm_token: user.fcm_token,
          sent_at: new Date().toISOString(),
          error: (e as Error).message,
        }, { onConflict: 'announcement_id,user_id' });
    }
  }

  // Update announcement with push stats
  await supabase
    .from('system_announcements')
    .update({
      push_sent_at: new Date().toISOString(),
      push_sent_count: sentCount,
    })
    .eq('id', announcementId);

  return { sent_count: sentCount };
}

// Helper function to send standalone push notifications (no announcement)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendStandalonePush(
  supabase: any,
  options: {
    title: string;
    body: string;
    target_audience: 'all' | 'free' | 'premium' | 'coach';
    target_user_ids: string[] | null;
    notification_sound: string;
  }
): Promise<{ sent_count: number }> {
  const { title, body, target_audience, target_user_ids, notification_sound } = options;

  // Build query for target users with FCM tokens
  let usersQuery = supabase
    .from('profiles')
    .select('id, email, fcm_token, subscription_tier')
    .not('fcm_token', 'is', null);

  // Apply targeting
  if (target_user_ids && target_user_ids.length > 0) {
    usersQuery = usersQuery.in('id', target_user_ids);
  } else if (target_audience !== 'all') {
    const audienceMap: Record<string, string[]> = {
      free: ['free', 'trial'],
      premium: ['pro', 'premium', 'annual'],
      coach: ['coach', 'team'],
    };
    const tiers = audienceMap[target_audience] || [];
    if (tiers.length > 0) {
      usersQuery = usersQuery.in('subscription_tier', tiers);
    }
  }

  const { data: users, error: usersError } = await usersQuery;

  if (usersError) {
    throw new Error(`Failed to fetch users: ${usersError.message}`);
  }

  if (!users || users.length === 0) {
    return { sent_count: 0 };
  }

  // Send push to each user via direct HTTP call to edge function
  // This is more reliable than supabase.functions.invoke from Next.js
  let sentCount = 0;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  for (const user of users) {
    if (!user.fcm_token) continue;

    try {
      console.log(`[Standalone Push] Sending to user ${user.email} (${user.id})`);

      const response = await fetch(`${supabaseUrl}/functions/v1/send-fcm-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          userId: user.id,
          title,
          body,
          sound: notification_sound, // Admin-selected sound override
          data: {
            type: 'admin_push',
            action: 'open_dashboard',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();
      console.log(`[Standalone Push] Response for ${user.email}:`, result);

      if (response.ok && result.success) {
        sentCount++;
      } else {
        console.error(`[Standalone Push] FCM error for user ${user.id}:`, result.error || result);
      }
    } catch (e) {
      console.error(`[Standalone Push] Failed to send to user ${user.id}:`, e);
    }
  }

  console.log(`[Standalone Push] Sent ${sentCount}/${users.length} push notifications`);
  return { sent_count: sentCount };
}
