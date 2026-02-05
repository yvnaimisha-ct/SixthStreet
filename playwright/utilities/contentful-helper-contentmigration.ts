import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!;
const ENV = process.env.CONTENTFUL_ENV || 'development';
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!;
export const DEFAULT_LOCALE = process.env.CONTENTFUL_LOCALE || 'en-US';

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  throw new Error('Missing required Contentful environment variables');
}

const BASE_URL = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV}`;

const headers = {
  Authorization: `Bearer ${MANAGEMENT_TOKEN}`,
  'Content-Type': 'application/json',
};

/* ------------------------------------------------------------------ */
/* GET SINGLE ENTRY BY FIELD VALUE */
/* ------------------------------------------------------------------ */
export async function getEntryByContentTypeAndField(
  contentType: string,
  field: string,
  value: string,
  locale: string = DEFAULT_LOCALE
) {
  if (!contentType) {
    throw new Error('contentType is required to fetch Contentful entries');
  }

  console.log('🔎 Fetching entry', {
    contentType,
    field,
    value,
    locale,
  });

  const res = await axios.get(`${BASE_URL}/entries`, {
    headers,
    params: {
      content_type: contentType,
      [`fields.${field}`]: value,
      locale,
      limit: 1,
    },
  });

  return res.data.items?.[0] ?? null;
}

export async function getEntriesByContentTypeAndField(
  contentType: string,
  field: string,
  value: string
) {
  console.log('🔎 Fetching entries', {
    contentType,
    field,
    value,
    locale: DEFAULT_LOCALE,
  });
  const res = await axios.get(`${BASE_URL}/entries`, {
    headers,
    params: {
      content_type: contentType,
      [`fields.${field}`]: value,
      locale: DEFAULT_LOCALE,
      limit: 1000,
    },
  });

  return res.data.items ?? [];
}

/* ------------------------------------------------------------------ */
/* GET ALL ENTRIES FOR A CONTENT TYPE */
/* ------------------------------------------------------------------ */
export async function getEntriesByContentType(
  contentType: string,
  locale: string = DEFAULT_LOCALE
) {
  if (!contentType) {
    throw new Error('contentType is required to fetch Contentful entries');
  }

  const res = await axios.get(`${BASE_URL}/entries`, {
    headers,
    params: {
      content_type: contentType,
      locale,
      limit: 1000,
    },
  });

  return res.data.items ?? [];
}

export async function getEntriesLinkedToEntry(
  contentType: string,
  linkedEntryId: string
) {
  const res = await axios.get(`${BASE_URL}/entries`, {
    headers,
    params: {
      content_type: contentType,
      links_to_entry: linkedEntryId,
      limit: 1000,
    },
  });

  return res.data.items ?? [];
}
export async function getEntryById(entryId: string) {
  try {
    const res = await axios.get(`${BASE_URL}/entries/${entryId}`, {
      headers,
    });

    return res.data?.fields ?? null;
  } catch (error: any) {
    console.error(`Failed to fetch entry ${entryId}`, error?.response?.data || error);
    return null;
  }
}

