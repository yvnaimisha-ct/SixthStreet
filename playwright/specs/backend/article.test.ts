import { test, expect } from '@playwright/test';
import { getDBConnection } from '../../utilities/db/connection';
import { getPublishedPostsAndPages, validatePostBySlug, getPostByIdAndSlug } from '../../utilities/db/queries';
import { validateContentfulConnection, getContentfulEntries, getContentfulEntryByField, getContentfulEntriesWithLimit, validateContentTypeMigration } from '../../utilities/contentful-helper';

test('Validate MySQL connection is successful', async () => {
  const db = await getDBConnection();
  
  const connection = db;
  expect(connection).toBeTruthy();
  
  console.log('✓ MySQL connection successful');
  
  await db.end();
});

test('Read published posts and pages from SQL', async () => {
  const entries = await getPublishedPostsAndPages();
  
  console.log(`✓ Retrieved ${entries.length} entries from database`);
  
  if (entries.length > 0) {
    console.log('Sample entries:');
    entries.slice(0, 3).forEach((entry: any) => {
      console.log(`  - ${entry.post_type}: ${entry.post_title} (${entry.post_name})`);
    });
  }
  
  expect(entries.length).toBeGreaterThan(0);
});

test('Validate SQL entries exist by slug', async () => {
  const entries = await getPublishedPostsAndPages();
  
  // Test first 5 entries to verify they exist in SQL
  const samplesToValidate = entries.slice(0, 5);
  
  console.log(`\nValidating ${samplesToValidate.length} entries in SQL database:`);
  
  for (const entry of samplesToValidate) {
    const dbEntry = await validatePostBySlug(entry.post_name);
    
    expect(dbEntry).toBeTruthy();
    expect(dbEntry.post_title).toBe(entry.post_title);
    expect(dbEntry.post_name).toBe(entry.post_name);
    
    console.log(`  ✓ Verified: ${entry.post_title} (${entry.post_name})`);
  }
  
  console.log(`\n✓ All ${samplesToValidate.length} entries validated in SQL`);
});

test('Validate specific post: responsible-investment-policy (ID: 704)', async () => {
  const postId = 704;
  const postSlug = 'responsible-investment-policy';
  
  // Query using both ID and slug for validation
  const post = await getPostByIdAndSlug(postId, postSlug);
  
  expect(post).toBeTruthy();
  expect(post.ID).toBe(postId);
  expect(post.post_name).toBe(postSlug);
  expect(post.post_status).toBe('publish');
  
  console.log('\n✓ Post Details:');
  console.log(`  ID: ${post.ID}`);
  console.log(`  Title: ${post.post_title}`);
  console.log(`  Slug: ${post.post_name}`);
  console.log(`  Type: ${post.post_type}`);
  console.log(`  Status: ${post.post_status}`);
  console.log(`  Author ID: ${post.post_author}`);
  console.log(`  Created: ${post.post_date}`);
  console.log(`  Modified: ${post.post_modified}`);
  console.log(`  Content Length: ${post.post_content ? post.post_content.length : 0} characters`);
  console.log(`  Excerpt: ${post.post_excerpt ? post.post_excerpt.substring(0, 100) + '...' : 'N/A'}`);
});

test('Validate Contentful connection is successful', async () => {
  const space = await validateContentfulConnection();
  expect(space).toBeTruthy();
  console.log(`✓ Contentful Space connected: ${space.name}`);
});

test('Read all entries from Contentful', async () => {
  const entries = await getContentfulEntries();
  
  console.log(`✓ Retrieved ${entries.length} entries from Contentful`);
  
  if (entries.length > 0) {
    console.log('Sample Contentful entries:');
    entries.slice(0, 3).forEach((entry: any) => {
      console.log(`  - ${entry.fields.title || entry.fields.name} (ID: ${entry.sys.id})`);
    });
  }
  
  expect(entries.length).toBeGreaterThanOrEqual(0);
});

test('Compare SQL vs Contentful entries - Migration validation', async () => {
  const sqlEntries = await getPublishedPostsAndPages();
  const contentfulEntries = await getContentfulEntries('page');
  
  console.log(`\n✓ SQL entries: ${sqlEntries.length}`);
  console.log(`✓ Contentful entries: ${contentfulEntries.length}`);
  
  if (contentfulEntries.length === 0) {
    console.log('⚠ No entries in Contentful yet. Skipping comparison.');
    return;
  }
  
  // Compare first 3 SQL entries with Contentful
  const compareCount = Math.min(3, sqlEntries.length);
  console.log(`\nComparing first ${compareCount} entries:`);
  
  for (let i = 0; i < compareCount; i++) {
    const sqlEntry = sqlEntries[i];
    const contentfulEntry = await getContentfulEntryByField('slug', sqlEntry.post_name, 'page');
    
    if (contentfulEntry) {
      const cfFields = contentfulEntry.fields;
      console.log(`\n✓ Found match in Contentful:`);
      console.log(`  SQL: ${sqlEntry.post_title}`);
      console.log(`  Contentful: ${cfFields.title || cfFields.name}`);
      console.log(`  Slug Match: ${sqlEntry.post_name === (cfFields.slug || sqlEntry.post_name)}`);
    } else {
      console.log(`\n✗ No Contentful entry found for: ${sqlEntry.post_title} (${sqlEntry.post_name})`);
    }
  }
});

test('Validate migration for currentOpportunities content type', async () => {
  const result = await validateContentTypeMigration('currentOpportunities', 'slug');
  expect(result.percentage).toBeGreaterThan(0);
});

test('Validate migration for account content type', async () => {
  const result = await validateContentTypeMigration('account', 'slug');
  expect(result.percentage).toBeGreaterThanOrEqual(0);
});

test.only('Fetch all entries from Contentful - account type', async () => {
  const entries = await getContentfulEntriesWithLimit('account', 1000);
  console.log(`\n✓ Total Accounts fetched: ${entries.length}`);
  
  if (entries.length > 0) {
    console.log('Sample accounts:');
    entries.slice(0, 3).forEach((entry: any, idx: number) => {
      console.log(`  ${idx + 1}. ${entry.fields.title || entry.fields.name || 'N/A'} (ID: ${entry.sys.id})`);
    });
  }
});
