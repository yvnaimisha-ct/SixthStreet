import { getDBConnection } from './connection';

export async function getPublishedPostsAndPages() {
  const db = await getDBConnection();

  const [rows] = await db.execute(`
    SELECT 
      ID,
      post_title,
      post_name,
      post_type,
      post_date
    FROM wp_posts
    WHERE post_status = 'publish'
      AND post_type IN ('post', 'page')
      AND post_title IS NOT NULL
  `);

  await db.end();

  return rows as {
    ID: number;
    post_title: string;
    post_name: string;
    post_type: 'post' | 'page';
    post_date: string;
  }[];
}

export async function validatePostExists(postId: number) {
  const db = await getDBConnection();

  const [rows] = await db.execute(`
    SELECT 
      ID,
      post_title,
      post_name,
      post_type,
      post_date,
      post_content,
      post_excerpt,
      post_status,
      post_author,
      post_modified
    FROM wp_posts
    WHERE ID = ?
      AND post_status = 'publish'
  `, [postId]);

  await db.end();

  return (rows as any[])[0] || null;
}
export async function validatePostBySlug(postSlug: string) { 
  const db = await getDBConnection(); 
    
  const [rows] = await db.execute(`
    SELECT 
      ID, 
      post_title, 
      post_name, 
      post_type, 
      post_date, 
      post_content, 
      post_excerpt 
    FROM wp_posts 
    WHERE post_name = ? AND post_status = 'publish' AND post_type 
      IN ('post', 'page')` , [postSlug]); 

  await db.end();
  return (rows as any[])[0] || null; 
}

export function comparePostWithContentful(sqlPost: any, contentfulEntry: any) {
  // Extract Contentful fields
  const cfFields = contentfulEntry?.fields || {};
  const sys = contentfulEntry?.sys || {};
  
  const comparison = {
    matches: true,
    migrationSummary: {
      sqlId: sqlPost.ID,
      sqlTitle: sqlPost.post_title,
      contentfulId: contentfulEntry?.sys?.id,
      contentfulTitle: cfFields.title,
      status: '' as string
    },
    fieldComparison: {
      title: {
        sql: sqlPost.post_title,
        contentful: cfFields.title,
        match: sqlPost.post_title === cfFields.title
      },
      slug: {
        sql: sqlPost.post_name,
        contentful: cfFields.slug,
        match: sqlPost.post_name === cfFields.slug
      },
      body: {
        sql: sqlPost.post_content ? 'Present' : 'Missing',
        contentful: cfFields.body ? 'Present' : 'Missing',
        match: !!cfFields.body
      },
      contentType: {
        expected: 'page',
        actual: sys.contentType?.sys?.id,
        match: sys.contentType?.sys?.id === 'page'
      },
      published: {
        expected: true,
        actual: Boolean(contentfulEntry?.sys?.publishedAt),
        match: Boolean(contentfulEntry?.sys?.publishedAt)
      },
    //   published: {
    //     expected: true,
    //     actual: !!sys.publishedAt,
    //     match: !!sys.publishedAt
    //   },
    
      content: {
        sql: sqlPost.post_content ? 'Present' : 'Missing',
        contentful: cfFields.body || cfFields.content ? 'Present' : 'Missing',
        // match: !!(sqlPost.post_content === (cfFields.body || cfFields.content))
        match:
          Boolean(sqlPost.post_content) &&
          Boolean(cfFields.body || cfFields.content)
      }
    }
  };

  // Check if all fields match
  comparison.matches = Object.values(comparison.fieldComparison).every(field => field.match);
  comparison.migrationSummary.status = comparison.matches ? '✓ SUCCESS' : '✗ MISMATCH';
  
  return comparison;
}
// export function comparePostWithContentfulnew(
//   sqlPost: any,
//   contentfulEntry: any,
//   rule: any
// ) {
//   const cfFields = contentfulEntry.fields;
//   const sys = contentfulEntry.sys;

//   const fieldComparison = {
//     title: {
//       match:
//         !rule.validations.title ||
//         sqlPost.post_title === cfFields.title,
//     },

//     slug: {
//       match:
//         !rule.validations.slug ||
//         sqlPost.post_name === cfFields.slug,
//     },

//     body: {
//       match:
//         !rule.validations.bodyPresent ||
//         Boolean(cfFields.body),
//     },

//     contentType: {
//       match:
//         !rule.validations.contentTypeMatch ||
//         sys.contentType?.sys?.id === rule.contentful.contentType,
//     },

//     published: {
//       match:
//         !rule.validations.published ||
//         Boolean(sys.publishedAt),
//     },
//   };

//   const matches = Object.values(fieldComparison).every(
//     (field: any) => field.match
//   );

//   return {
//     matches,
//     fieldComparison,
//   };
// }
// comparePostWithContentful.ts

export function comparePostWithContentfulnew2(
  sqlPost: any,
  entry: any,
  rule: any
) {
  const rows: any[] = [];
  let matches = true;

  const validations = rule.validations;

  // Title
  if (validations.title) {
    const sqlValue = sqlPost.post_title;
    const cfValue = entry.fields?.title;

    const match = sqlValue === cfValue;
    if (!match) matches = false;

    rows.push({
      field: 'title',
      sql: sqlValue,
      contentful: cfValue,
      expected: cfValue, 
      actual: cfValue,
      match,
    });
  }

  // Slug
  if (validations.slug) {
    const sqlValue = sqlPost.post_name;
    const cfValue = entry.fields?.slug;

    const match = sqlValue === cfValue;
    if (!match) matches = false;

    rows.push({
      field: 'slug',
      sql: sqlValue,
      contentful: cfValue,
      expected: cfValue, 
      actual: cfValue,
      match,
    });
  }

  // Body presence
  if (validations.bodyPresent) {
    const sqlValue = sqlPost.post_content ? 'Present' : 'Missing';
    const cfValue = entry.fields?.body ? 'Present' : 'Missing';

    const match = sqlValue === cfValue;
    if (!match) matches = false;

    rows.push({
      field: 'body',
      sql: sqlValue,
      contentful: cfValue,
      expected: cfValue, 
      actual: cfValue,
      match,
    });
  }

  // Content type
  if (validations.contentTypeMatch) {
    const expected = rule.contentful.contentType;
    const actual = entry.sys.contentType.sys.id;

    const match = expected === actual;
    if (!match) matches = false;

    rows.push({
      field: 'contentType',
      sql: rule.sql.postType,
      contentful: actual,
      expected,
      actual,
      match,
    });
  }

  // Published (IMPORTANT)
  if (validations.published) {
    const expected = true;

    // ❗ correct signal
    const actual = Boolean(entry.sys.publishedAt);

    const match = expected === actual;
    if (!match) matches = false;

    rows.push({
      field: 'published',
      sql: '',
      contentful: actual,
      expected,
      actual,
      match,
    });
  }

  return {
    matches,
    fieldComparison: rows,
  };
}

export function compareSqlWithContentful({
  sql,
  contentful,
  expectedContentType,
  requiredFields,
}: {
  sql: any;
  contentful: any;
  expectedContentType: string;
  requiredFields: string[];
}) {
  const cfFields = contentful.fields;
  const sys = contentful.sys;

  const fieldComparison: Record<string, any> = {
    title: {
      sql: sql.post_title,
      contentful: cfFields.title,
      match: sql.post_title === cfFields.title,
    },
    slug: {
      sql: sql.post_name,
      contentful: cfFields.slug,
      match: sql.post_name === cfFields.slug,
    },
    contentType: {
      expected: expectedContentType,
      actual: sys.contentType?.sys?.id,
      match: sys.contentType?.sys?.id === expectedContentType,
    },
    published: {
      expected: true,
      actual: Boolean(sys.publishedAt || sys.firstPublishedAt),
      match: Boolean(sys.publishedAt || sys.firstPublishedAt),
    },
  };

  // Required field presence check
  for (const field of requiredFields) {
    fieldComparison[field] = {
      expected: 'Present',
      actual: cfFields[field] ? 'Present' : 'Missing',
      match: Boolean(cfFields[field]),
    };
  }

  const matches = Object.values(fieldComparison).every(f => f.match);

  return {
    matches,
    fieldComparison,
  };
}
