import { expect } from '@playwright/test';
import {
  getEntryByContentTypeAndField,
  getEntriesLinkedToEntry,
  DEFAULT_LOCALE,
} from '../../utilities/contentful-helper-contentmigration';

export async function validateContentEntries(schema: any) {
  const { contentType, taxonomySet, rules, entries } = schema;

  let setEntry: any;

  // 1️⃣ Validate taxonomy set exists
  if (taxonomySet) {
    setEntry = await getEntryByContentTypeAndField(
      taxonomySet.contentType,
      'title',
      taxonomySet.name
    );

    expect(
      setEntry,
      `Taxonomy Set "${taxonomySet.name}" not found`
    ).toBeTruthy();
  }

  // 2️⃣ Fetch all terms linked to the set (ONCE)
  let linkedTerms: any[] = [];
  if (taxonomySet) {
    linkedTerms = await getEntriesLinkedToEntry(
      contentType,
      setEntry.sys.id
    );
  }

  // 3️⃣ Validate each taxonomy term
  for (const expected of entries) {
    const entry = await getEntryByContentTypeAndField(
      contentType,
      'title',
      expected.title
    );

    expect(entry, `Entry "${expected.title}" not found`).toBeTruthy();

    // 3️⃣ Required fields existence
    if (rules?.term?.requiredFields) {
      for (const field of rules.term.requiredFields) {
        expect(
          entry.fields[field]?.[DEFAULT_LOCALE],
          `Missing required field "${field}" for "${expected.title}"`
        ).toBeTruthy();
      }
    }

    // 4️⃣ Field value validation
    if (rules?.term?.validateValues) {
      expect(entry.fields.title[DEFAULT_LOCALE]).toBe(expected.title);
      expect(entry.fields.key[DEFAULT_LOCALE]).toBe(expected.key);

      if (expected.description) {
        expect(entry.fields.description[DEFAULT_LOCALE]).toBe(
          expected.description
        );
      }
    }

    // 5️⃣ Taxonomy linkage validation (CRITICAL)
    if (taxonomySet) {
      const isLinked = linkedTerms.some(
        (t: any) => t.sys.id === entry.sys.id
      );

      expect(
        isLinked,
        `"${expected.title}" is not linked to taxonomy set "${taxonomySet.name}"`
      ).toBe(true);
    }
  }
}
