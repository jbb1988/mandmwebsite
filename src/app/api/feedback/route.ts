import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Zod schema for feedback validation
const feedbackSchema = z.object({
  category: z.enum(['bug_report', 'feature_request', 'general_feedback', 'ai_coach_feedback']),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email('Invalid email address').max(255).optional().nullable().or(z.literal('')),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired entries periodically
  if (!record || record.resetTime < now) {
    const newRecord = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    rateLimitMap.set(ip, newRecord);
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_HOUR - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= MAX_REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_HOUR - record.count,
    resetTime: record.resetTime,
  };
}

function collectBrowserInfo(request: NextRequest): Record<string, string> {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'Unknown';

  return {
    userAgent,
    language: acceptLanguage,
    platform: 'Web',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Too many feedback submissions. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': MAX_REQUESTS_PER_HOUR.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = feedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { category, subject, message, contactName, contactEmail } = validationResult.data;

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Collect browser/device information
    const deviceInfo = collectBrowserInfo(request);

    // Get current URL from request
    const url = request.nextUrl.origin;

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Prepare feedback data
    const feedbackData = {
      user_id: userId,
      source: 'website',
      category,
      subject: subject.trim(),
      message: message.trim(),
      contact_name: contactName?.trim() || null,
      contact_email: contactEmail?.trim() || null,
      device_info: deviceInfo,
      url,
      // Let database handle created_at with default now()
    };

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('user_feedback')
      .insert([feedbackData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting feedback:', error);
      console.error('Feedback data:', feedbackData);
      return NextResponse.json(
        {
          error: 'Failed to submit feedback',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Trigger email notification via edge function
    if (data?.id) {
      try {
        await supabase.functions.invoke('send-feedback-notification', {
          body: { feedback_id: data.id },
        });
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error('Error sending feedback notification:', emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
        id: data.id,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': MAX_REQUESTS_PER_HOUR.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in feedback API:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
