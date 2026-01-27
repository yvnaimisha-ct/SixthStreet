import { TestInfo, expect, test } from '@playwright/test';
import allure from 'allure-playwright';

// ---------------- TYPES ----------------
export type Validation = {
  regexp?: { pattern: string };
  linkContentType?: string[];
};

export interface ArrayItems {
  type: string;
  linkType?: string;
  validations?: Validation[];
}

export interface ExpectedFieldSchema {
  id: string;
  name?: string;
  type: string;
  required: boolean;
  linkType?: string;
  items?: ArrayItems;
  validations?: Validation[];
}

export interface ExpectedContentTypeSchema {
  id: string;
  name: string;
  displayField: string;
  description?: string;
  fields: ExpectedFieldSchema[];
}

export interface ContentfulField extends ExpectedFieldSchema {}

export interface ContentfulContentType {
  id: string;
  name: string;
  displayField: string;
  description?: string;
  fields: ContentfulField[];
}

// ---------------- VALIDATION FUNCTION ----------------
export async function validateContentTypeSchema(
  actual: ContentfulContentType,
  expected: ExpectedContentTypeSchema,
  testInfo: TestInfo
) {
  // ---- CONTENT TYPE LEVEL ----
  await test.step(`Validating Content Type: ${expected.id}`, async () => {
    console.log(`\n🔍 Validating Content Type: ${expected.id}`);
    expect(actual.id).toBe(expected.id);
    expect(actual.name).toBe(expected.name);
    expect(actual.displayField).toBe(expected.displayField);
    // if (expected.description) {
    //   expect(actual.description).toBe(expected.description);
    // }
  });

  // ---- FIELD LEVEL ----
  for (const expectedField of expected.fields) {
    await test.step(`Validating Field: ${expectedField.id}`, async () => {
      console.log(`\n➡️ Validating Field: ${expectedField.id}`);

      const actualField = actual.fields.find(f => f.id === expectedField.id);
      expect(actualField, `❌ Missing field: ${expectedField.id}`).toBeDefined();

      // --- TYPE ---
      try {
        expect(actualField!.type).toBe(expectedField.type);
      } catch (error) {
        testInfo.attach(`Type mismatch – ${expectedField.id}`, {
          body: JSON.stringify(
            {
              field: expectedField.id,
              property: 'type',
              expected: expectedField.type,
              actual: actualField!.type,
            },
            null,
            2
          ),
          contentType: 'application/json',
        });
        throw error;
      }

      // --- NAME ---
      if (expectedField.name) {
        try {
          expect(actualField!.name).toBe(expectedField.name);
        } catch (error) {
          testInfo.attach(`Name mismatch – ${expectedField.id}`, {
            body: JSON.stringify(
              {
                field: expectedField.id,
                property: 'name',
                expected: expectedField.name,
                actual: actualField!.name,
              },
              null,
              2
            ),
            contentType: 'application/json',
          });
          throw error;
        }
      }

      // --- REQUIRED ---
      try {
        expect(actualField!.required).toBe(expectedField.required);
      } catch (error) {
        testInfo.attach(`Required mismatch – ${expectedField.id}`, {
          body: JSON.stringify(
            {
              field: expectedField.id,
              property: 'required',
              expected: expectedField.required,
              actual: actualField!.required,
            },
            null,
            2
          ),
          contentType: 'application/json',
        });
        throw error;
      }

      // --- LINK FIELD ---
      if (expectedField.type === 'Link') {
        await validateLinkField(actualField!, expectedField, testInfo);
      }

      // --- ARRAY FIELD ---
      if (expectedField.type === 'Array') {
        await validateArrayField(actualField!, expectedField, testInfo);
      }

      // --- REGEXP VALIDATION FOR SYMBOL/TEXT FIELDS ---
      if (expectedField.validations?.length) {
        const regexValidation = expectedField.validations.find(v => v.regexp?.pattern);
        if (regexValidation?.regexp?.pattern) {
          const actualRegex = actualField!.validations?.[0]?.regexp?.pattern ?? 'MISSING';
          try {
            expect(actualRegex).toBe(regexValidation.regexp.pattern);
          } catch (error) {
            testInfo.attach(`Regexp mismatch – ${expectedField.id}`, {
              body: JSON.stringify(
                {
                  field: expectedField.id,
                  property: 'validations.regexp',
                  expected: regexValidation.regexp.pattern,
                  actual: actualRegex,
                },
                null,
                2
              ),
              contentType: 'application/json',
            });
            throw error;
          }
        }
      }
    });
  }
}

// ---------------- HELPERS ----------------
async function validateLinkField(
  actualField: ContentfulField,
  expectedField: ExpectedFieldSchema,
  testInfo: TestInfo
) {
  console.log(`   🔗 Validating Link field`);

  if (expectedField.linkType) {
    try {
      expect(actualField.linkType).toBe(expectedField.linkType);
    } catch (error) {
      testInfo.attach(`linkType mismatch – ${expectedField.id}`, {
        body: JSON.stringify(
          {
            field: expectedField.id,
            property: 'linkType',
            expected: expectedField.linkType,
            actual: actualField.linkType,
          },
          null,
          2
        ),
        contentType: 'application/json',
      });
      throw error;
    }
  }

  if (expectedField.validations?.length) {
    const expectedValidation = expectedField.validations.find(v => v.linkContentType?.length);
    if (expectedValidation?.linkContentType?.length) {
      const actualValidation = actualField.validations?.find(v => v.linkContentType?.length);
      expect(
        actualValidation,
        `❌ Missing linkContentType validation for field "${expectedField.id}"`
      ).toBeDefined();

      try {
        expect(actualValidation!.linkContentType).toEqual(expectedValidation.linkContentType);
      } catch (error) {
        testInfo.attach(`linkContentType mismatch – ${expectedField.id}`, {
          body: JSON.stringify(
            {
              field: expectedField.id,
              property: 'validations.linkContentType',
              expected: expectedValidation.linkContentType,
              actual: actualValidation?.linkContentType ?? 'MISSING',
            },
            null,
            2
          ),
          contentType: 'application/json',
        });
        throw error;
      }
    }
  }
}

async function validateArrayField(
  actualField: ContentfulField,
  expectedField: ExpectedFieldSchema,
  testInfo: TestInfo
) {
  console.log(`   📚 Validating Array field`);

  const expectedItems = expectedField.items;
  const actualItems = actualField.items;

  // ⚠️ Guard against undefined items
  expect(actualItems, `❌ Missing items definition for array field "${expectedField.id}"`).toBeDefined();
  if (!actualItems) return; // early exit to satisfy TypeScript

  // Validate item type
  expect(actualItems.type).toBe(expectedItems?.type);

  // If items are Link, validate linkType + linkContentType
  if (actualItems.type === 'Link' && expectedItems) {
    if (expectedItems.linkType) {
      try {
        expect(actualItems.linkType).toBe(expectedItems.linkType);
      } catch (error) {
        testInfo.attach(`Array items.linkType mismatch – ${expectedField.id}`, {
          body: JSON.stringify(
            {
              field: expectedField.id,
              property: 'items.linkType',
              expected: expectedItems.linkType,
              actual: actualItems.linkType,
            },
            null,
            2
          ),
          contentType: 'application/json',
        });
        throw error;
      }
    }

    if (expectedItems.validations?.length) {
      const expectedValidation = expectedItems.validations.find(v => v.linkContentType?.length);
      if (expectedValidation?.linkContentType?.length) {
        const actualValidation = actualItems.validations?.find(v => v.linkContentType?.length);

        expect(
          actualValidation,
          `❌ Missing linkContentType in array items "${expectedField.id}"`
        ).toBeDefined();
        if (!actualValidation) return;

        try {
          expect(actualValidation!.linkContentType).toEqual(expectedValidation.linkContentType);
        } catch (error) {
          testInfo.attach(`Array items.linkContentType mismatch – ${expectedField.id}`, {
            body: JSON.stringify(
              {
                field: expectedField.id,
                property: 'items.validations.linkContentType',
                expected: expectedValidation.linkContentType,
                actual: actualValidation?.linkContentType ?? 'MISSING',
              },
              null,
              2
            ),
            contentType: 'application/json',
          });
          throw error;
        }
      }
    }
  }

  // Regexp for array items
  if (expectedItems?.validations?.length) {
    const regexValidation = expectedItems.validations.find(v => v.regexp?.pattern);
    if (regexValidation?.regexp?.pattern) {
      const actualRegex = actualItems.validations?.[0]?.regexp?.pattern ?? 'MISSING';
      try {
        expect(actualRegex).toBe(regexValidation.regexp.pattern);
      } catch (error) {
        testInfo.attach(`Array items.regexp mismatch – ${expectedField.id}`, {
          body: JSON.stringify(
            {
              field: expectedField.id,
              property: 'items.validations.regexp',
              expected: regexValidation.regexp.pattern,
              actual: actualRegex,
            },
            null,
            2
          ),
          contentType: 'application/json',
        });
        throw error;
      }
    }
  }
}

