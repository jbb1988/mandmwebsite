#!/usr/bin/env npx tsx
/**
 * Generate just The Zone and The Vault social images
 * Run with: npx tsx scripts/generate-zone-vault-images.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function main() {
  console.log('🚀 Generating The Zone and The Vault social images...\n');

  const { generateAllStaticImages, SOCIAL_IMAGE_TEMPLATES } = await import('../src/lib/social-image-generator');

  // Find The Zone and The Vault templates
  const targetTemplateIds = ['feature_the_zone', 'feature_the_vault'];
  const targetTemplates = SOCIAL_IMAGE_TEMPLATES.filter(
    t => targetTemplateIds.includes(t.id)
  );

  if (targetTemplates.length === 0) {
    console.error('❌ Could not find The Zone or The Vault templates!');
    console.log('Available templates:', SOCIAL_IMAGE_TEMPLATES.map(t => t.id).join(', '));
    process.exit(1);
  }

  console.log(`📋 Found ${targetTemplates.length} templates to generate:`);
  targetTemplates.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
  console.log('');

  // Use the proper generateAllStaticImages function with template IDs
  const result = await generateAllStaticImages({
    templateIds: targetTemplateIds,
    formats: ['feed_square', 'feed_portrait', 'story', 'twitter', 'linkedin'],
  });

  console.log('\n\n📊 Summary:');
  console.log(`Success: ${result.success}`);
  console.log(`Generated: ${result.images.length} images`);

  if (result.error) {
    console.error(`❌ Error: ${result.error}`);
  }

  if (result.images.length > 0) {
    console.log('\n🔗 Generated URLs:');
    result.images.forEach(img => console.log(`  ${img.templateId} (${img.format}): ${img.url}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
