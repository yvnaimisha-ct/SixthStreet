import { expect } from '@playwright/test';
import {
  getEntriesByContentTypeAndField,
  getEntriesLinkedToEntry,
  DEFAULT_LOCALE
} from '../../utilities/contentful-helper-contentmigration';

interface ContentfulEntry {
  sys: {
    id: string;
    publishedVersion?: number;
  };
  fields: Record<string, any>;
}

export async function validateControlledValueSet(schema: any) {
  const { category, term, rules, entries } = schema;

  /* -------------------------------------------------- */
  /* 1️⃣ VALIDATE CATEGORY */
  /* -------------------------------------------------- */
  const categories = await getEntriesByContentTypeAndField(
    category.contentType,
    'title',
    category.name
  );

  expect(
    categories.length,
    `Controlled Value Set "${category.name}" not found`
  ).toBeGreaterThan(0);

  const categoryEntry = categories[0];

  /* ---- Category publication ---- */
  if (rules.category?.mustBePublished) {
    expect(
      categoryEntry.sys.publishedVersion,
      `"${category.name}" is not published`
    ).toBeDefined();
  }

  /* ---- Category required fields ---- */
  for (const field of rules.category.requiredFields) {
    expect(
      categoryEntry.fields[field]?.[DEFAULT_LOCALE],
      `Missing category field "${field}" for "${category.name}"`
    ).toBeTruthy();
  }

  /* -------------------------------------------------- */
  /* 2️⃣ FETCH ALL TERMS LINKED TO CATEGORY */
  /* -------------------------------------------------- */
  const linkedTerms = await getEntriesLinkedToEntry(
    term.contentType,
    categoryEntry.sys.id
  );

  /* -------------------------------------------------- */
  /* 3️⃣ VALIDATE EACH CONTROLLED VALUE */
  /* -------------------------------------------------- */
  for (const expected of entries) {
    const matching = await getEntriesByContentTypeAndField(
      term.contentType,
      'title',
      expected.title
    );

    expect(
      matching.length,
      `Controlled value "${expected.title}" not found`
    ).toBeGreaterThan(0);

    const entry = matching.find((e: ContentfulEntry) =>
      linkedTerms.some(t => t.sys.id === e.sys.id)
    );

    expect(
      entry,
      `"${expected.title}" exists but is not linked to "${category.name}"`
    ).toBeTruthy();

    /* ---- Term publication ---- */
    if (rules.term?.mustBePublished) {
      expect(
        entry.sys.publishedVersion,
        `"${expected.title}" is not published`
      ).toBeDefined();
    }

    /* ---- Term required fields ---- */
    for (const field of rules.term.requiredFields) {
      expect(
        entry.fields[field]?.[DEFAULT_LOCALE] ??
          entry.fields[field]?.[DEFAULT_LOCALE]?.sys?.id,
        `Missing term field "${field}" for "${expected.title}"`
      ).toBeTruthy();
    }

    /* ---- Exact key validation ---- */
    if (expected.key) {
      expect(entry.fields.key[DEFAULT_LOCALE]).toBe(expected.key);
    }
  }
}
