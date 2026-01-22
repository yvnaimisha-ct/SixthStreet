import { TestInfo, expect, test } from '@playwright/test';
import { loadAllSchemas } from '../../utilities/schema-loader';
import { getContentType } from '../../utilities/contentful-helper-schema';
import { validateContentTypeSchema } from '../../utilities/db/validations';


const schemas = loadAllSchemas();

for (const schema of schemas) {
  test(`Contentful schema validation: ${schema.id}`, async () => {
    try {
      const actual = await getContentType(schema.id);
      await validateContentTypeSchema(actual, schema, test.info());
    } catch (error) {
      // This will properly fail the test with the validation error
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  });
}
