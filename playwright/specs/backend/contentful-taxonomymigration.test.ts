import { test } from '@playwright/test';
import sectorSchema from '../../testdata/contentful-contentmigration/taxonomy/sector.schema.json';  
import { validateContentEntries } from '../../utilities/db/contentful-taxonomymigrationvalidations';

test('@contentful Content validation – Sector taxonomy', async () => {
  // const schema = loadSchema('sector.schema.json');
  await validateContentEntries(sectorSchema);
});
