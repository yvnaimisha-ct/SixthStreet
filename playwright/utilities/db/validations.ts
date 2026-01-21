import { expect } from '@playwright/test';
import {
  ContentfulContentType,
  ExpectedContentTypeSchema
} from '../types/contentful-schema.types';

export type ValidationProfile = {
  title?: boolean;
  slug?: boolean;
  body?: boolean;
  contentType?: boolean;
  published?: boolean;
};

export const validationProfiles: Record<string, ValidationProfile> = {
  staticPolicyPage: {
    title: true,
    slug: true,
    body: true,
    contentType: true,
    published: true,
  },
};

export function validateContentTypeSchema(actual: ContentfulContentType, expected: ExpectedContentTypeSchema) {
  expect(actual.name).toBe(expected.name);
  expect(actual.displayField).toBe(expected.displayField);

  expected.fields.forEach(expectedField => {
    const actualField = actual.fields.find(f => f.id === expectedField.id);
    expect(actualField, `Missing field: ${expectedField.id}`).toBeDefined();

    expect(actualField!.type).toBe(expectedField.type);
    expect(actualField!.required).toBe(expectedField.required);

  // Item-level validations (Array fields)
    if (expectedField.items?.validations?.regexp) {
      const actualRegex =
        actualField!.items?.validations?.[0]?.regexp?.pattern;

      expect(actualRegex).toBe(expectedField.items.validations.regexp);
    }
  });
}

// function normalizeValidations(validations = []) {
//   const result: any = {};
//   validations.forEach(v => {
//     if (v.linkContentType) result.linkContentType = v.linkContentType;
//     if (v.regexp) result.regexp = v.regexp.pattern;
//     if (v.in) result.in = v.in;
//   });
//   return result;
// }
