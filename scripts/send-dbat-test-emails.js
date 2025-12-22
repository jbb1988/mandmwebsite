// Script to send D-BAT campaign test emails
// Usage: RESEND_API_KEY=xxx node scripts/send-dbat-test-emails.js

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = 'jeff@mindandmuscle.ai';

if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY environment variable is required');
  process.exit(1);
}

const emails = [
  {
    subject: '[TEST 1/4] quick idea for D-BAT Austin',
    step: 1
  },
  {
    subject: '[TEST 2/4] Your athletes train at home. You earn 10-15%.',
    step: 2
  },
  {
    subject: '[TEST 3/4] Be the first D-BAT in Texas to offer this',
    step: 3
  },
  {
    subject: '[TEST 4/4] Final check-in: D-BAT partnership',
    step: 4
  }
];

async function getTemplateBody(step) {
  // Fetch from Supabase
  const response = await fetch(
    `https://kuswlvbjplkgrqlmqtok.supabase.co/rest/v1/marketing_email_templates?segment=eq.dbat_facility&sequence_step=eq.${step}&select=body_template`,
    {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1c3dsdmJqcGxrZ3JxbG1xdG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDY1OTUsImV4cCI6MjA2Mjg4MjU5NX0.ORpOxgCWfXKU9xh9UjSUkI0KBTOyjjc2eaSTOSHCPMo',
        'Content-Type': 'application/json'
      }
    }
  );
  const data = await response.json();
  if (!data || !data[0]) throw new Error(`Template not found for step ${step}`);

  // Replace variables with test data
  let body = data[0].body_template;
  body = body.replace(/\{\{first_name\}\}/g, 'Jeff');
  body = body.replace(/\{\{last_name\}\}/g, 'Butt');
  body = body.replace(/\{\{facility_name\}\}/g, 'D-BAT Austin');
  body = body.replace(/\{\{state\}\}/g, 'Texas');
  body = body.replace(/\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/g, 'https://www.mindandmuscle.ai/unsubscribe');

  return body;
}

async function sendEmail(subject, htmlBody) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Jeff Butt <jeff@mindandmuscle.ai>',
      to: [TO_EMAIL],
      subject: subject,
      html: htmlBody
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function main() {
  console.log(`Sending ${emails.length} test emails to ${TO_EMAIL}...\n`);

  for (const email of emails) {
    try {
      console.log(`Sending: ${email.subject}`);
      const body = await getTemplateBody(email.step);
      const result = await sendEmail(email.subject, body);
      console.log(`  ✓ Sent! ID: ${result.id}\n`);

      // Small delay between emails
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}\n`);
    }
  }

  console.log('Done! Check your inbox at', TO_EMAIL);
}

main().catch(console.error);
