import { test, expect } from '@playwright/test';
import sectorSchema from '../../testdata/contentful-contentmigration/taxonomy/sector.schema.json';  
import industrySchema from '../../testdata/contentful-contentmigration/taxonomy/industry.schema.json';
import investorgroupSchema from '../../testdata/contentful-contentmigration/taxonomy/investorgroup.schema.json';
import peopletypeSchema from '../../testdata/contentful-contentmigration/taxonomy/peopletype.schema.json';
import strategySchema from '../../testdata/contentful-contentmigration/taxonomy/strategy.schema.json';
import topicSchema from '../../testdata/contentful-contentmigration/taxonomy/topic.schema.json';
import { validateContentEntries } from '../../utilities/db/contentful-taxonomyvalidations';
import { validateControlledValueSet } from '../../utilities/db/contentful-controlledvaluevalidation';
import filingGroupControlledSchema from '../../testdata/contentful-contentmigration/controlledvalueset/filinggroup.schema.json';
import { getEntryById, getEntriesByContentType } from '../../utilities/contentful-helper-contentmigration';

const schemas = [
  sectorSchema,
  industrySchema,
  investorgroupSchema,
  peopletypeSchema,
  strategySchema,
  topicSchema
];

schemas.forEach(schema => {
  const categoryName =
    schema.category?.name ||
    schema.term?.contentType ||
    'unknown';

  test(`@contentful Content validation – taxonomy – ${categoryName}`, async () => {
    await validateContentEntries(schema);
  });
});

test(`@contentful Content validation – taxonomy - strategy`, async () => {
    // const schema = loadSchema('sector.schema.json');
    await validateContentEntries(strategySchema);
  });

test.only(
  '@contentful Controlled Value Set – Filing Group',
  async () => {
    await validateControlledValueSet(filingGroupControlledSchema);
  }
);