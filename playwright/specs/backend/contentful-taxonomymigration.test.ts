import { test } from '@playwright/test';
import sectorSchema from '../../testdata/contentful-contentmigration/taxonomy/sector.schema.json';  
import industrySchema from '../../testdata/contentful-contentmigration/taxonomy/industry.schema.json';
import investorgroupSchema from '../../testdata/contentful-contentmigration/taxonomy/investorgroup.schema.json';
import peopletypeSchema from '../../testdata/contentful-contentmigration/taxonomy/peopletype.schema.json';
import strategySchema from '../../testdata/contentful-contentmigration/taxonomy/strategy.schema.json';
import topicSchema from '../../testdata/contentful-contentmigration/taxonomy/topic.schema.json';
import { validateContentEntries } from '../../utilities/db/contentful-taxonomymigrationvalidations';

test('@contentful Content validation – Sector taxonomy', async () => {
  // const schema = loadSchema('sector.schema.json');
  await validateContentEntries(strategySchema);
});
