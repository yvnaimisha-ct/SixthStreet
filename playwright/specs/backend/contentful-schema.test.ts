import { test } from '@playwright/test';
import { loadAllSchemas } from '../../utilities/schema-loader';
import { getContentType } from '../../utilities/contentful-helper-schema';
import { validateContentTypeSchema } from '../../utilities/db/validations';


const schemas = loadAllSchemas();

for (const schema of schemas) {
  test(`Contentful schema validation: ${schema.id}`, async () => {
    const actual = await getContentType(schema.id);
    validateContentTypeSchema(actual, schema);
    expect(true).toBeTruthy();
  });
}
