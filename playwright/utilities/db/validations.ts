import { expect, TestInfo } from '@playwright/test';

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

export type SchemaError = {
  contentType: string;
  field: string;
  rule: string;
  expected?: any;
  actual?: any;
};

export interface ExpectedFieldSchema {
  id: string;
  name: string;
  type: string;
  required: boolean;
  linkType?: string;
  items?: {
    type: string;
    validations?: {
      regexp?: string;
      linkContentType?: string[];
      linkMimetypeGroup?: string[];
    };
  };
  validations?: {
    regexp?: string;
    linkContentType?: string[];
    linkMimetypeGroup?: string[];
  };
}

export interface ExpectedContentTypeSchema {
  id: string;
  name: string;
  displayField: string;
  description: string;
  fields: ExpectedFieldSchema[];
}

export interface ContentfulField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  linkType?: string;
  validations?: any[];
  items?: {
    type: string;
    linkType?: string;
    validations?: any[];
  };
}

export interface ContentfulContentType {
  id: string;
  name: string;
  displayField: string;
  description: string;
  fields: ContentfulField[];
}

/* ------------------------------------------------------------------ */
/* MAIN VALIDATOR */
/* ------------------------------------------------------------------ */

export async function validateContentTypeSchema(
  actual: ContentfulContentType,
  expected: ExpectedContentTypeSchema,
  testInfo: TestInfo
): Promise<SchemaError[]> {
  const errors: SchemaError[] = [];

  console.log(`\n📦 Validating Content Type: ${expected.id}`);

  /* ---- CONTENT TYPE META ---- */
  assertRule(actual.id, expected.id, 'id', expected.id, '__meta__', errors);

  assertRule(actual.name, expected.name, 'name', expected.id, '__meta__', errors);

  assertRule(actual.displayField, expected.displayField, 'displayField', expected.id, '__meta__', errors);

  /* ---- FIELD LEVEL ---- */
  for (const expectedField of expected.fields) {
    console.log(`  🔍 Field: ${expectedField.id}`);

    const actualField = actual.fields.find(
      f => f.id === expectedField.id
    );

    if (!actualField) {
      recordError(errors, {
        contentType: expected.id,
        field: expectedField.id,
        rule: 'presence',
        expected: 'FIELD_EXISTS',
        actual: 'MISSING',
      });
      console.log(`    ❌ Missing field`);
      continue;
    }

    console.log(`    ✅ Field present`);

    /* ---- BASE RULES ---- */
    assertRule(actualField.type, expectedField.type, 'type', expected.id, expectedField.id, errors);

    assertRule(actualField.required, expectedField.required, 'required', expected.id, expectedField.id, errors);

    assertRule(actualField.name, expectedField.name, 'name', expected.id, expectedField.id, errors);

    // if (expected.description !== undefined) {
    //   assertRule(
    //     actual.description,
    //     expected.description,
    //     'description',
    //     expected.id,
    //     '__meta__',
    //     errors
    //   );
    // }

    /* ---- LINK FIELD RULES ---- */
    if (expectedField.type === 'Link') {
      assertRule(
        actualField.linkType,
        expectedField.linkType,
        'linkType',
        expected.id,
        expectedField.id,
        errors
      );

      validateLinkContentType(
        actualField.validations,
        expectedField.validations,
        expected.id,
        expectedField.id,
        errors
      );

      validateLinkMimeTypeGroup(
        actualField.validations,
        expectedField.validations,
        expected.id,
        expectedField.id,
        errors
      );
    }

    /* ---- ARRAY FIELD RULES ---- */
    if (expectedField.type === 'Array') {
      validateArrayRules(
        actualField,
        expectedField,
        expected.id,
        errors
      );
    }

    /* ---- FIELD VALIDATIONS ---- */
    validateRegexpRule(
      actualField.validations,
      expectedField.validations,
      expected.id,
      expectedField.id,
      errors
    );
  }

  /* ---- FINAL REPORT ---- */
  if (errors.length > 0) {
    console.error(`❌ Content Type ${expected.id} FAILED (${errors.length} issues)`);
    testInfo.attach(`Schema errors – ${expected.id}`, {
      body: JSON.stringify(errors, null, 2),
      contentType: 'application/json',
    });
    throw new Error(`Schema validation failed for Content Type ${expected.id} with ${errors.length} errors.`);
  } else {
    console.log(`✅ Content Type ${expected.id} PASSED`);
  }

  return errors;
}

/* ------------------------------------------------------------------ */
/* RULE HELPERS */
/* ------------------------------------------------------------------ */

function validateArrayRules(
  actualField: ContentfulField,
  expectedField: ExpectedFieldSchema,
  contentType: string,
  errors: SchemaError[]
) {
  const actualItems = actualField.items;
  const expectedItems = expectedField.items;

  if (!actualItems) {
    recordError(errors, {
      contentType,
      field: expectedField.id,
      rule: 'items',
      expected: 'DEFINED',
      actual: 'MISSING',
    });
    return;
  }

  assertRule(
    actualItems.type,
    expectedItems?.type,
    'items.type',
    contentType,
    expectedField.id,
    errors
  );

  assertRule(
    actualItems.linkType,
    expectedItems?.linkType,
    'items.linkType',
    contentType,
    expectedField.id,
    errors
  );

  /* items.regexp */
  validateRegexpRule(
    actualItems.validations,
    expectedItems?.validations,
    contentType,
    `${expectedField.id}.items`,
    errors
  );

  /* items.linkContentType */
  validateLinkContentType(
    actualItems.validations,
    expectedItems?.validations,
    contentType,
    `${expectedField.id}.items`,
    errors
  );

  validateLinkMimeTypeGroup(
    actualItems.validations,
    expectedItems?.validations,
    contentType,
    `${expectedField.id}.items`,
    errors
  );
}

function normalizeExpectedValidations(validations: any): any[] {
  if (!validations) return [];
  return Array.isArray(validations) ? validations : [validations];
}


/* VALIDATION RULES */

// function validateRegexpRule(
//   actualValidations: any[] | undefined,
//   expectedValidations: any | undefined,
//   contentType: string,
//   field: string,
//   errors: SchemaError[]
// ) {
//   const expected = expectedValidations?.regexp;
//   if (!expected) return;

//   const actual =
//     actualValidations?.find(v => v.regexp)?.regexp?.pattern;

//   assertRule(
//     actual,
//     expected,
//     'regexp',
//     contentType,
//     field,
//     errors
//   );
// }
function validateRegexpRule(
  actualValidations: any[] | undefined,
  expectedValidations: any,
  contentType: string,
  field: string,
  errors: SchemaError[]
) {
  const expectedList = normalizeExpectedValidations(expectedValidations);

  const expected = expectedList.find(v => v.regexp)?.regexp;
  if (!expected) return;

  const expectedPattern =
    typeof expected === 'string' ? expected : expected.pattern;

  const actualPattern =
    actualValidations?.find(v => v.regexp)?.regexp?.pattern;

  assertRule(
    actualPattern,
    expectedPattern,
    'regexp',
    contentType,
    field,
    errors
  );
}

function validateLinkContentType(
  actualValidations: any[] | undefined,
  expectedValidations: any | undefined,
  contentType: string,
  field: string,
  errors: SchemaError[]
) {

  const expectedList = normalizeExpectedValidations(expectedValidations);
  // const expected = expectedValidations?.linkContentType;
  const expected =
    expectedList.find(v => v.linkContentType)?.linkContentType;
  if (!expected) return;

  const actual =
    actualValidations?.find(v => v.linkContentType)?.linkContentType;

  assertRule(
    actual,
    expected,
    'linkContentType',
    contentType,
    field,
    errors
  );
}

function validateLinkMimeTypeGroup(
  actualValidations: any[] | undefined,
  expectedValidations: any | undefined,
  contentType: string,
  field: string,
  errors: SchemaError[]
) {

  const expectedList = normalizeExpectedValidations(expectedValidations);
  // const expected = expectedValidations?.linkMimetypeGroup;
  const expected =
    expectedList.find(v => v.linkMimetypeGroup)?.linkMimetypeGroup;
  if (!expected) return;

  const actual =
    actualValidations?.find(v => v.linkMimetypeGroup)?.linkMimetypeGroup;

  assertRule(
    actual,
    expected,
    'linkMimetypeGroup',
    contentType,
    field,
    errors
  );
}

/* ------------------------------------------------------------------ */
/* ASSERT + ERROR COLLECTOR */
/* ------------------------------------------------------------------ */

function assertRule(
  actual: any,
  expected: any,
  rule: string,
  contentType: string,
  field: string,
  errors: SchemaError[]
) {
  try {
    expect(actual).toEqual(expected);
    console.log(`    ✅ ${rule}`);
  } catch {
    // console.log(`    ❌ ${rule}`);
    console.log(
      `    ❌ ${rule}\n` +
      `       ↳ expected: ${JSON.stringify(expected)}\n` +
      `       ↳ actual:   ${JSON.stringify(actual)}`
    );

    recordError(errors, {
      contentType,
      field,
      rule,
      expected,
      actual,
    });
  }
}

function recordError(
  errors: SchemaError[],
  error: SchemaError
) {
  errors.push(error);
}
