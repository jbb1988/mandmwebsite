import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email too short')
  .max(100, 'Email too long')
  .toLowerCase()
  .trim();

// Name validation (no special characters to prevent XSS)
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

// Organization name validation
export const organizationSchema = z
  .string()
  .min(2, 'Organization name must be at least 2 characters')
  .max(200, 'Organization name too long')
  .regex(/^[a-zA-Z0-9\s&,.'()-]+$/, 'Invalid characters in organization name')
  .trim()
  .optional();

// Text field validation (for descriptions, comments, etc.)
export const textFieldSchema = z
  .string()
  .max(2000, 'Text too long')
  .trim()
  .optional();

// Team code validation
export const teamCodeSchema = z
  .string()
  .regex(/^[A-Z0-9-]+$/, 'Invalid team code format')
  .min(8, 'Team code too short')
  .max(20, 'Team code too long')
  .trim();

// Seat count validation
export const seatCountSchema = z
  .number()
  .int('Seat count must be a whole number')
  .min(1, 'Minimum 1 seat required')
  .max(1000, 'Maximum 1000 seats allowed');

// Price validation
export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .max(500, 'Price per seat cannot exceed $500')
  .refine((val) => Number.isFinite(val), 'Invalid price value');

// Partner application schema
export const partnerApplicationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  organization: organizationSchema,
  audience: textFieldSchema,
  networkSize: z.string().max(50).trim().optional(),
  promotionChannel: z.string().max(200).trim().optional(),
  whyExcited: textFieldSchema,
  turnstileToken: z.string().min(1, 'CAPTCHA verification required'),
});

// Checkout session schema
export const checkoutSessionSchema = z.object({
  seatCount: seatCountSchema,
  email: emailSchema,
  testMode: z.boolean().optional(),
  toltReferral: z.string().max(100).trim().optional(),
});

// Add team seats schema
export const addTeamSeatsSchema = z.object({
  teamCode: teamCodeSchema,
  subscriptionId: z.string().startsWith('sub_', 'Invalid subscription ID'),
  additionalSeats: z.number().int().min(1).max(100),
  lockedInRate: priceSchema,
  customerEmail: emailSchema,
  testMode: z.boolean().optional(),
});

// Lookup team schema
export const lookupTeamSchema = z.object({
  teamCode: teamCodeSchema,
});

// Sanitize HTML in user input (removes script tags, event handlers, etc.)
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Escape user input for safe display in HTML emails
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}
