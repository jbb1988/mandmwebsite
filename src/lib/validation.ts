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

// Organization name validation - truly optional (empty string allowed)
export const organizationSchema = z
  .string()
  .max(200, 'Organization name too long')
  .trim()
  .optional()
  .transform(val => val === '' ? undefined : val)
  .refine(
    val => val === undefined || val === '' || (val.length >= 2 && /^[a-zA-Z0-9\s&,.'()-]+$/.test(val)),
    { message: 'Organization name must be at least 2 characters with valid characters only' }
  );

// Text field validation (for descriptions, comments, etc.)
export const textFieldSchema = z
  .string()
  .max(2000, 'Text too long')
  .trim()
  .optional();

// Team code validation (for athletes/parents joining a team)
export const teamCodeSchema = z
  .string()
  .regex(/^[A-Z0-9-]+$/, 'Invalid team code format')
  .min(8, 'Team code too short')
  .max(24, 'Team code too long')
  .trim();

// Coach code validation (for coaches managing their license)
export const coachCodeSchema = z
  .string()
  .regex(/^COACH-[A-Z0-9-]+$/, 'Please enter your Coach Code (starts with COACH-), not your Team Code')
  .min(14, 'Coach code too short')
  .max(24, 'Coach code too long')
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

// Billing type enum for checkout
export const billingTypeSchema = z.enum(['upfront', 'monthly']).default('upfront');

// Checkout session schema
export const checkoutSessionSchema = z.object({
  seatCount: seatCountSchema,
  email: emailSchema,
  billingType: billingTypeSchema, // 'upfront' or 'monthly'
  testMode: z.boolean().optional(),
  toltReferral: z.string().max(100).trim().optional(),
  finderCode: z.string().max(100).trim().optional(),
  promoCode: z.string().regex(/^[A-Z0-9]{6,12}$/, 'Invalid promo code format').optional(),
  // UTM tracking parameters
  utmSource: z.string().max(100).trim().optional(),
  utmMedium: z.string().max(100).trim().optional(),
  utmCampaign: z.string().max(100).trim().optional(),
  // Multi-team organization fields
  isMultiTeamOrg: z.boolean().optional(),
  organizationName: organizationSchema,
  numberOfTeams: z.number().int().min(2).max(50).optional(), // If multi-team, must be 2-50
  seatsPerTeam: z.array(z.number().int().min(1)).optional(), // Array of seat counts per team
}).refine(
  (data) => {
    // If multi-team org, organization name and number of teams are required
    if (data.isMultiTeamOrg) {
      if (!data.organizationName || !data.numberOfTeams || data.numberOfTeams < 2) {
        return false;
      }
      // Validate seats allocation
      if (data.seatsPerTeam) {
        // Must have one seat count for each team
        if (data.seatsPerTeam.length !== data.numberOfTeams) {
          return false;
        }
        // Total allocated seats must equal total seat count
        const totalAllocated = data.seatsPerTeam.reduce((sum, seats) => sum + seats, 0);
        if (totalAllocated !== data.seatCount) {
          return false;
        }
        // Each team must have at least 1 seat
        if (data.seatsPerTeam.some(seats => seats < 1)) {
          return false;
        }
      }
      return true;
    }
    return true;
  },
  {
    message: 'Multi-team organizations require valid organization name, number of teams, and proper seat allocation that totals to seat count',
  }
);

// Add team seats schema
export const addTeamSeatsSchema = z.object({
  teamCode: teamCodeSchema,
  subscriptionId: z.string().startsWith('sub_', 'Invalid subscription ID'),
  additionalSeats: z.number().int().min(1).max(100),
  lockedInRate: priceSchema,
  customerEmail: emailSchema,
  testMode: z.boolean().optional(),
});

// Lookup team schema (for coaches accessing management - requires COACH code)
export const lookupTeamSchema = z.object({
  teamCode: coachCodeSchema,
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
