export type MigrationRule = {
  name: string;
  profile: 'satitcPolicyPage';

  contentful: {
    contentType: string;
    matchField: 'slug',
    expectedSlug: string;
  };

  sql: {
    postType: string;
    expectedSlug: string;
  };
};

export const migrationRules: MigrationRule[] = [
  {
    name: 'Responsible Investment Policy',
    profile: 'satitcPolicyPage',

    contentful: {
      contentType: 'page',
      matchField: 'slug',
      expectedSlug: 'responsible-investment-policy',
    },

    sql: {
      postType: 'page',
      expectedSlug: 'responsible-investment-policy',
    },
  },
  {
    name: 'Terms of Use',
    profile: 'satitcPolicyPage',

    contentful: {
      contentType: 'page',
      matchField: 'slug',
      expectedSlug: 'terms-of-use',
    },

    sql: {
      postType: 'page',
      expectedSlug: 'terms-of-use',
    },
  },
  {
    name: 'Privacy Policy',
    profile: 'satitcPolicyPage',

    contentful: {
      contentType: 'page',
      matchField: 'slug',
      expectedSlug: 'privacy-policy',
    },

    sql: {
      postType: 'page',
      expectedSlug: 'privacy-policy',
    },
  },
];
