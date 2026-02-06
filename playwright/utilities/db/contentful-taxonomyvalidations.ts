import { expect } from '@playwright/test';
import {
  getEntriesByContentTypeAndField,
  getEntriesLinkedToEntry,
  DEFAULT_LOCALE,
} from '../contentful-helper-contentmigration';
import { link } from 'fs';

interface ContentfulEntry {
  sys: {
    id: string;
    publishedVersion?: number;
  };
  fields: Record<string, any>;
}

export async function validateContentEntries(schema: any) {
  const { category, term, rules, entries } = schema;
  const contentType = term?.contentType;

  let categoryEntry: ContentfulEntry | undefined;

  /* -------------------------------------------------- */
  /* 1️⃣ CATEGORY (PARENT) VALIDATION */
  /* -------------------------------------------------- */
  if (category) {
    const categories = await getEntriesByContentTypeAndField(
      category.contentType,
      'title',
      category.name
    );

    expect(
      categories.length,
      `Category "${category.name}" not found`
    ).toBeGreaterThan(0);

    categoryEntry = categories[0];
  }

  /* -------------------------------------------------- */
  /* 2️⃣ FETCH ALL TERMS LINKED TO CATEGORY (ONCE) */
  /* -------------------------------------------------- */
  let linkedTerms: ContentfulEntry[] = [];

  if (rules?.term?.belongsToSet && categoryEntry) {
    linkedTerms = await getEntriesLinkedToEntry(
      contentType, // ✅ TERM content type
      categoryEntry.sys.id
    );
  }

  /* -------------------------------------------------- */
  /* 3️⃣ VALIDATE EACH EXPECTED TERM */
  /* -------------------------------------------------- */
  for (const expected of entries) {
    const matchingEntries = await getEntriesByContentTypeAndField(
      contentType,
      'title',
      expected.title
    );

    expect(
      matchingEntries.length,
      `No entry found with title "${expected.title}"`
    ).toBeGreaterThan(0);

    /* ---- Pick the correct entry (linked one) ---- */
    const linkedentry = rules?.term?.belongsToSet
      ? matchingEntries.find((entry: ContentfulEntry)=>
          linkedTerms.some((t: ContentfulEntry) => t.sys.id === entry.sys.id)
        )
      : matchingEntries[0];

    expect(
      linkedentry,
      `"${expected.title}" exists but is not linked to "${category?.name}"`
    ).toBeTruthy();

    /* -------------------------------------------------- */
    /* 4️⃣ MUST BE PUBLISHED */
    /* -------------------------------------------------- */
    if (rules?.term?.mustBePublished) {
      expect(
        linkedentry.sys.publishedVersion,
        `"${expected.title}" is not published`
      ).toBeDefined();
    }

    /* -------------------------------------------------- */
    /* 5️⃣ REQUIRED FIELDS */
    /* -------------------------------------------------- */
    if (rules?.term?.requiredFields) {
      for (const field of rules.term.requiredFields) {
        expect(
          linkedentry.fields[field]?.[DEFAULT_LOCALE],
          `Missing required field "${field}" for "${expected.title}"`
        ).toBeTruthy();
      }
    }

    /* -------------------------------------------------- */
    /* 6️⃣ VALUE VALIDATION */
    /* -------------------------------------------------- */
    if (rules?.term?.validateValues) {
      if (expected.key) {
        expect(linkedentry.fields.key[DEFAULT_LOCALE]).toBe(expected.key);
      }

      if (expected.description) {
        expect(linkedentry.fields.description[DEFAULT_LOCALE]).toBe(
          expected.description
        );
      }
    }
  }
}

