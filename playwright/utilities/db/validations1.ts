import { expect,test } from '@playwright/test';

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

export async function validateContentTypeSchema(actual: ContentfulContentType, expected: ExpectedContentTypeSchema){
  await test.step(`Validate content type: ${expected.id}`, () => {
    console.log(`\n🔍 Validating Content Type: ${expected.id}`);
  
    expect(actual.id).toBe(expected.id);
    expect(actual.name).toBe(expected.name);
    expect(actual.displayField).toBe(expected.displayField);

    if (expected.description) {
    expect(actual.description).toBe(expected.description);
  }

  // Field level validations
  expected.fields.forEach(expectedField => {
    test.step(`Validate field: ${expectedField.id}`, () => {
        console.log(`\n➡️ Field: ${expectedField.id}`);

    const actualField = actual.fields.find(f => f.id === expectedField.id);
    expect(actualField, `❌ Missing field: ${expectedField.id}`).toBeDefined();

    expect(actualField!.type).toBe(expectedField.type);
    expect(actualField!.required).toBe(expectedField.required);

  // Item-level validations (Array fields)
  if (expectedField.type === 'Array') {
      expect(actualField!.items?.type).toBe(expectedField.items?.type);

    if (expectedField.items?.validations?.regexp) {
      const actualRegex =
        actualField!.items?.validations?.[0]?.regexp?.pattern;

        console.log(
              `   regexp → expected: ${expectedField.items.validations.regexp}, actual: ${actualRegex}`
            );

      expect(actualRegex).toBe(expectedField.items.validations.regexp);
    }
  }
  });
  });
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
