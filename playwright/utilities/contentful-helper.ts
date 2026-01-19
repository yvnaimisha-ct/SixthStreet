import { createClient } from 'contentful';
import dotenv from 'dotenv';
import path from 'path';
import { getPublishedPostsAndPages } from './db/queries';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

export async function getContentfulEntriesWithLimit(contentType: string, limit: number = 1000) {
  try {
    const entries = await client.getEntries({
      content_type: contentType,
      limit: limit,
    });

    console.log(`✓ Retrieved ${entries.items.length} entries from Contentful (${contentType})`);
    return entries.items;
  } catch (error) {
    console.error(`Error fetching Contentful entries for ${contentType}:`, error);
    throw error;
  }
}

export async function getContentfulEntryByField(fieldName: string, fieldValue: string, contentType: string = 'currentOpportunities') {
  try {
    const query: any = {
      content_type: contentType,
    };
    query[`fields.${fieldName}`] = fieldValue;
    
    const entries = await client.getEntries(query);
    return entries.items[0] || null;
  } catch (error) {
    console.error(`Error fetching Contentful entry with ${fieldName}=${fieldValue}:`, error);
    return null;
  }
}

export async function validateContentfulConnection() {
  try {
    const space = await client.getSpace();
    console.log(`✓ Connected to Contentful Space: ${space.name}`);
    return space;
  } catch (error) {
    console.error('Error connecting to Contentful:', error);
    throw error;
  }
}

export function extractEntryFields(entry: any) {
  return {
    id: entry.sys.id,
    title: entry.fields.title,
    slug: entry.fields.slug,
    content: entry.fields.content,
    ...entry.fields
  };
}

export async function validateContentTypeMigration(contentType: string, matchField: string = 'slug') {
  const sqlEntries = await getPublishedPostsAndPages();
  const getContentfulEntries = await getContentfulEntriesWithLimit(contentType);
  
  console.log(`\n📊 Migration Report for: ${contentType}`);
  console.log(`   SQL: ${sqlEntries.length} entries | Contentful: ${getContentfulEntries.length} entries`);
  
  let matchCount = 0;
  const unmatchedEntries: string[] = [];
  
  for (const sqlEntry of sqlEntries) {
    const cfEntry = await getContentfulEntryByField(matchField, sqlEntry.post_name, contentType);
    if (cfEntry) {
      matchCount++;
    } else {
      unmatchedEntries.push(sqlEntry.post_name);
    }
  }
  
  const migrationPercentage = Math.round((matchCount / sqlEntries.length) * 100);
  console.log(`   ✓ Migrated: ${matchCount}/${sqlEntries.length} (${migrationPercentage}%)`);
  
  if (unmatchedEntries.length > 0 && unmatchedEntries.length <= 5) {
    console.log(`   ✗ Unmatched entries: ${unmatchedEntries.join(', ')}`);
  }
  
  return { total: sqlEntries.length, migrated: matchCount, percentage: migrationPercentage, unmatched: unmatchedEntries };
}
export async function validateContentTypeMigrationnew(
  contentType: string,
  matchField: string = 'slug',
  requiredFields: string[] = ['title', 'slug', 'body']
) {
  const sqlEntries = await getPublishedPostsAndPages();
  const filteredSqlEntries = sqlEntries.filter(entry => entry.post_type === contentType);

  const totalEntries = filteredSqlEntries.length;
  let matchedCount = 0;
  const unmatchedEntries: string[] = [];

  console.log(`\n📊 Migration Report for: ${contentType}`);
  console.log(`   SQL: ${totalEntries} entries`);

  for (const sqlEntry of filteredSqlEntries) {
    const cfEntry = await getContentfulEntryByField(matchField, sqlEntry.post_name, contentType);

    if (!cfEntry) {
      unmatchedEntries.push(sqlEntry.post_name);
      continue;
    }

    const cfFields = extractEntryFields(cfEntry);

    const allFieldsPresent = requiredFields.every(field => cfFields[field]);
    if (allFieldsPresent) matchedCount++;
    else unmatchedEntries.push(sqlEntry.post_name);
  }

  const migrationPercentage = totalEntries ? Math.round((matchedCount / totalEntries) * 100) : 0;
  console.log(`   ✓ Migrated: ${matchedCount}/${totalEntries} (${migrationPercentage}%)`);

  if (unmatchedEntries.length > 0 && unmatchedEntries.length <= 10) {
    console.log(`   ✗ Unmatched entries: ${unmatchedEntries.join(', ')}`);
  }

  return { total: totalEntries, migrated: matchedCount, percentage: migrationPercentage, unmatched: unmatchedEntries };
}
