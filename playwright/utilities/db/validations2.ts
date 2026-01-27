import { TestInfo, expect, test } from '@playwright/test';
import allure from 'allure-playwright';

import {
  ContentfulContentType,
  ExpectedContentTypeSchema
} from '../types/contentful-schema.types';

export async function validateContentTypeSchema(
  actual: ContentfulContentType,
  expected: ExpectedContentTypeSchema,
  testInfo: TestInfo
) {
  // console.log('actual data', actual)
  await test.step(`Validating Content Type: ${expected.id}`, async () => {
    console.log(`\n🔍 Validating Content Type: ${expected.id}`);

    expect(actual.id).toBe(expected.id);
    expect(actual.name).toBe(expected.name);
    expect(actual.displayField).toBe(expected.displayField);

    // if (expected.description) {
    //   expect(actual.description).toBe(expected.description);
    // }
  });

  // ✅ IMPORTANT: for...of + await
  for (const expectedField of expected.fields) {
    await test.step(`Validating Field: ${expectedField.id}`, async () => {
      console.log(`\n➡️ Validating Field: ${expectedField.id}`);

      const actualField = actual.fields.find(
        f => f.id === expectedField.id
      );

      expect(
        actualField,
        `❌ Missing field: ${expectedField.id}`
      ).toBeDefined();

      // ---- TYPE VALIDATION ----
      try {
        expect(actualField!.type).toBe(expectedField.type);
      } catch (error) {
        console.error(
          `❌ Type mismatch for field "${expectedField.id}"`,
          {
            expected: expectedField.type,
            actual: actualField!.type,
          }
        );

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

        throw error; // ✅ FAILS THE TEST PROPERLY
      }
      // ---- NAME VALIDATION ----
      if (expectedField.name) {
        try {
          expect(actualField!.name).toBe(expectedField.name);
        } catch (error) {
          console.error(
            `❌ Name mismatch for field "${expectedField.id}"`,
            {
              expected: expectedField.name,
              actual: actualField!.name,
            }
          );
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

      // ---- REQUIRED VALIDATION ----
      try {
        expect(actualField!.required).toBe(expectedField.required);
      } catch (error) {
        console.error(
          `❌ Required flag mismatch for field "${expectedField.id}"`,
          {
            expected: expectedField.required,
            actual: actualField!.required,
          }
        );

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
      // ---- LINK VALIDATION (Direct Link Field) ----
      if (expectedField.type === 'Link') {
        console.log(`   🔗 Validating Link field`);

        // linkType
        try {
          expect(actualField!.linkType).toBe(expectedField.linkType);
        } catch (error) {
          testInfo.attach(`linkType mismatch – ${expectedField.id}`, {
            body: JSON.stringify(
              {
                field: expectedField.id,
                property: 'linkType',
                expected: expectedField.linkType,
                actual: actualField!.linkType,
              },
              null,
              2
            ),
            contentType: 'application/json',
          });
          throw error;
        }
        // ---- linkContentType (STRICT) ----
        if (expectedField.validations && Array.isArray(expectedField.validations)) {
          const expectedValidation = expectedField.validations.find(
            v => 'linkContentType' in v
          );
          
          if (expectedValidation?.linkContentType) {
            const actualValidation = Array.isArray(actualField!.validations) 
              ? actualField!.validations.find(v => 'linkContentType' in v)
              : undefined;

            expect(
              actualValidation,
              `❌ Missing linkContentType validation for field "${expectedField.id}"`
            ).toBeDefined();

            try {
              expect(actualValidation!.linkContentType).toEqual(
                expectedValidation.linkContentType
              );
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
        // ---- ARRAY VALIDATION ----
        else if (expectedField.type === 'Array') {
          console.log(`   📚 Validating Array field`);
          expect(actualField!.items?.type)
            .toBe(expectedField.items?.type);

          if (expectedField.items?.validations?.regexp) {
            const actualRegex =
              actualField!.items?.validations?.[0]?.regexp?.pattern;

            console.log(
              `   regexp → expected: ${expectedField.items.validations.regexp}, actual: ${actualRegex}`
            );

            try {
              expect(actualRegex).toBe(
                expectedField.items.validations.regexp
              );
            } catch (error) {
              console.error(
                `❌ Regexp mismatch for field "${expectedField.id}"`,
                {
                  expected: expectedField.items.validations.regexp,
                  actual: actualRegex,
                }
              );

              testInfo.attach(`Regexp mismatch – ${expectedField.id}`, {
                body: JSON.stringify(
                  {
                    field: expectedField.id,
                    property: 'items.validations.regexp',
                    expected: expectedField.items.validations.regexp,
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



