#!/usr/bin/env npx tsx
/**
 * Generate all static social images for the partner dashboard
 * Run with: npx tsx scripts/generate-static-social-images.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// Now import the generator (after env is loaded)
async function main() {
  console.log('🚀 Starting static social image generation...\n');

  // Dynamic import after env is loaded
  const { generateAllStaticImages, SOCIAL_IMAGE_TEMPLATES } = await import('../src/lib/social-image-generator');

  console.log(`📋 Found ${SOCIAL_IMAGE_TEMPLATES.length} templates`);
  console.log(`📐 Generating 5 formats per template (square, portrait, story, twitter, linkedin)`);
  console.log(`📦 Total images to generate: ${SOCIAL_IMAGE_TEMPLATES.length * 5}\n`);

  const startTime = Date.now();

  const result = await generateAllStaticImages();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`\n✅ Success! Generated ${result.images.length} images in ${duration}s`);
    console.log('\nSample URLs:');
    result.images.slice(0, 5).forEach(img => {
      console.log(`  - ${img.templateId} (${img.format}): ${img.url}`);
    });
  } else {
    console.error(`\n❌ Generation failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
