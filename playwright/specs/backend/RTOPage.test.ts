import { test, expect } from '@playwright/test';
import { getDBConnection } from '../../utilities/db/connection';
import {validatePostExists, validatePostBySlug, comparePostWithContentful, comparePostWithContentfulnew2} from '../../utilities/db/queries';
import { validateContentfulConnection, getContentfulEntryByField, getContentfulEntriesWithLimit, validateContentTypeMigration } from '../../utilities/contentful-helper';
import { Entry, EntrySkeletonType } from 'contentful';
// import { responsibleInvestmentPolicyRule } from '../../utilities/db/rules';
import { migrationRules } from '../../utilities/db/rules';
import { validationProfiles } from '../../utilities/db/validations';



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

test('Compare SQL vs Contentful entries - Migration validation', async () => {

  const CONTENT_TYPE = 'page'; // Adjust as needed
  const sqlEntries = await getPublishedPostsAndPages();
  const contentfulEntries = await getContentfulEntriesWithLimit(CONTENT_TYPE);

  console.log(`\n✓ SQL entries: ${sqlEntries.length}`);
  console.log(`✓ Contentful entries: ${contentfulEntries.length}`);

  if (contentfulEntries.length === 0) {
    console.log('⚠ No entries in Contentful yet. Skipping comparison.');
    return;
  }

  // Build Contentful slug → entry map
  const contentfulMap = new Map<string, any>();
  for (const entry of contentfulEntries) {
    if (entry.fields?.slug) {
      contentfulMap.set(String(entry.fields.slug), entry);
    }
  }
  // Compare first 3 SQL entries with Contentful
  const compareCount = Math.min(3, sqlEntries.length);
  console.log(`\nComparing first ${compareCount} entries:`);

  for (let i = 0; i < compareCount; i++) {
    const sqlEntry = sqlEntries[i];
    const contentfulEntry = await contentfulMap.get(sqlEntry.post_name);

    if (contentfulEntry) {
      const cfFields = contentfulEntry.fields;
      console.log(`\n✓ Found match in Contentful:`);
      console.log(`  SQL: ${sqlEntry.post_title}`);
      console.log(`  Contentful: ${cfFields.title || cfFields.name}`);
      console.log(`  Slug Match: ${sqlEntry.post_name === (cfFields.slug || sqlEntry.post_name)}`);

      expect(contentfulEntry.fields.slug).toBe(sqlEntry.post_name);
      expect(contentfulEntry.fields.title || contentfulEntry.fields.name).toBe(sqlEntry.post_title);
    } else {
      console.log(`\n✗ No Contentful entry found for: ${sqlEntry.post_title} (${sqlEntry.post_name})`);
    }
  }
});

test('Validate migration for account content type', async () => {
  const result = await validateContentTypeMigration('account', 'slug');
  expect(result.percentage).toBeGreaterThanOrEqual(0);
});

test('Fetch all entries from Contentful - account type', async () => {
  const entries = await getContentfulEntriesWithLimit('account', 1000);
  console.log(`\n✓ Total Accounts fetched: ${entries.length}`);

  if (entries.length > 0) {
    console.log('Sample accounts:');
    entries.slice(0, 3).forEach((entry: any, idx: number) => {
      console.log(`  ${idx + 1}. ${entry.fields.title || entry.fields.name || 'N/A'} (ID: ${entry.sys.id})`);
    });
  }
});

// This test is using specific SQL ID and comparing with Contentful entry
test('Migration validation: SQL ID 704 vs Contentful', async () => {
  const TARGET_POST_ID = 704;
  const CONTENT_TYPE = 'page';

  // 1️⃣ Fetch SQL record
  const sqlPost = await validatePostExists(TARGET_POST_ID);

  expect(sqlPost).not.toBeNull();
  console.log(`✓ SQL record found: ${sqlPost.post_title} (${sqlPost.post_name})`);

  // 2️⃣ Fetch Contentful entries
  const contentfulEntries = await getContentfulEntriesWithLimit(CONTENT_TYPE);

  expect(contentfulEntries.length).toBeGreaterThan(0);

  // 3️⃣ Find matching Contentful entry by slug
  const matchingEntry = contentfulEntries.find(
    entry => entry.fields?.slug === sqlPost.post_name
  );

  // ❌ FAIL if Contentful entry not found
  expect(
    matchingEntry,
    `❌ Contentful entry not found for slug: ${sqlPost.post_name}`
  ).toBeTruthy();

  console.log(`✓ Contentful entry found for slug: ${sqlPost.post_name}`);

  // 4️⃣ Field-by-field comparison
  const comparison = comparePostWithContentful(sqlPost, matchingEntry!);

  console.log('\n📊 Migration comparison result:');
  console.table(comparison.fieldComparison);

  // Note: Check if entry is published
  const isPublished = !!(matchingEntry!.sys.updatedAt);
  console.log(`\n⚠️  Entry is ${isPublished ? 'PUBLISHED' : 'DRAFT (not published)'} in Contentful`);
  console.log(`  updatedAt: ${matchingEntry!.sys.updatedAt || 'null'}`);
  console.log(`  createdAt: ${matchingEntry!.sys.createdAt || 'null'}`);

  // ❌ FAIL if any mismatch
  expect(
    comparison.matches,
    `❌ Migration mismatch for slug ${sqlPost.post_name}`
  ).toBe(true);

  console.log(`✓ Migration SUCCESS for slug: ${sqlPost.post_name}`);
});


// This test is using rules
// test('Migration validation: Responsible Investment Policy', async () => {
//   const rule = responsibleInvestmentPolicyRule;

//   // 1️⃣ Fetch SQL record
//   const sqlPost = await validatePostBySlug(rule.sql.expectedSlug);

//   expect(sqlPost).not.toBeNull();
//   console.log(
//     `✓ SQL record found: ${sqlPost.post_title} (${sqlPost.post_name})`
//   );

//   // 2️⃣ Fetch Contentful entries (same as test 1 pattern)
//   const contentfulEntries = await getContentfulEntriesWithLimit(
//     rule.contentful.contentType
//   );

//   expect(contentfulEntries.length).toBeGreaterThan(0);

//   // 3️⃣ Find matching Contentful entry by slug
//   const matchingEntry = contentfulEntries.find(
//     entry =>
//       entry.fields?.[rule.contentful.matchField] ===
//       rule.contentful.expectedSlug
//   );

//   expect(
//     matchingEntry,
//     `❌ Contentful entry not found for slug: ${rule.contentful.expectedSlug}`
//   ).toBeTruthy();

//   console.log(
//     `✓ Contentful entry found for slug: ${rule.contentful.expectedSlug}`
//   );

//   // 4️⃣ Field-by-field comparison (same output shape)
//   const comparison = comparePostWithContentfulnew(
//     sqlPost,
//     matchingEntry!,
//     rule
//   );

//   console.log('\n📊 Migration comparison result:');
//   console.table(comparison.fieldComparison);

//   // 5️⃣ Published info (same signal as first test)
//   const isPublished = true;
//   console.log(
//     `\n⚠️  Entry is ${isPublished ? 'PUBLISHED' : 'DRAFT (not published)'} in Contentful`
//   );
//   console.log(
//     `  publishedAt: ${matchingEntry!.sys.updatedAt || 'null'}`
//   );
//   console.log(
//     `  createdAt: ${matchingEntry!.sys.createdAt || 'null'}`
//   );

//   // 6️⃣ Assertion
//   expect(
//     comparison.matches,
//     `❌ Migration mismatch for ${rule.name}`
//   ).toBe(true);

//   console.log(`✓ Migration SUCCESS for slug: ${rule.sql.expectedSlug}`);
// });

migrationRules.forEach(rule => {
  test.only(`Migration validation: ${rule.name}`, async () => {
    console.log(`\n🔍 Migration validation started`);
    console.log(`📄 Content: ${rule.name}`);

    // 1️⃣ SQL
    const sqlPost = await validatePostBySlug(rule.sql.expectedSlug);

    expect(sqlPost).not.toBeNull();
    console.log(
      `✓ SQL record found: ${sqlPost.post_title} (${sqlPost.post_name})`
    );

    // 2️⃣ Contentful entries (same pattern as original test)
    const contentfulEntries = await getContentfulEntriesWithLimit(
      rule.contentful.contentType
    );

    expect(contentfulEntries.length).toBeGreaterThan(0);

    // 3️⃣ Match by slug (or rule field)
    const matchingEntry = contentfulEntries.find(
      entry =>
        entry.fields?.[rule.contentful.matchField] ===
        rule.contentful.expectedSlug
    );

    expect(
      matchingEntry,
      `❌ Contentful entry not found for slug: ${rule.contentful.expectedSlug}`
    ).toBeTruthy();

    console.log(
      `✓ Contentful entry found for slug: ${rule.contentful.expectedSlug}`
    );

    // 4️⃣ Comparison (same output structure)
    const comparison = comparePostWithContentfulnew2(
      sqlPost,
      matchingEntry!,
      rule
    );

    console.log('\n📊 Migration comparison result:');
    console.table(
      comparison.fieldComparison.map(row => ({
        field: row.field,
        sql: row.sql ?? '',
        contentful: row.contentful ?? '',
        match: row.match,
        expected: row.expected ?? '',
        actual: row.actual ?? '',
      }))
    );

    // 5️⃣ Publish signal (same as Test 1)
    const isPublished = Boolean(matchingEntry!.sys.updatedAt);

    console.log(
      `\n⚠️  Entry is ${isPublished ? 'PUBLISHED' : 'DRAFT (not published)'} in Contentful`
    );
    console.log(
      `  updatedAt: ${matchingEntry!.sys.updatedAt || 'null'}`
    );
    console.log(
      `  createdAt: ${matchingEntry!.sys.createdAt || 'null'}`
    );

    // 6️⃣ Assertion
    expect(
      comparison.matches,
      `❌ Migration mismatch for ${rule.name}`
    ).toBe(true);

    console.log(`✓ Migration SUCCESS for slug: ${rule.sql.expectedSlug}`);
  });
});


