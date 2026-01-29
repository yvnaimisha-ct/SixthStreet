import fs from 'fs';
import path from 'path';

export function loadAllSchemas() {
  const dir = path.join(process.cwd(), 'playwright/testdata/contentful-schemas');
  return fs.readdirSync(dir).map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    return JSON.parse(content);
  });
}

// export function loadSchemas() {
//   const dir = path.join(process.cwd(), 'playwright/testdata/contentful-schemas');
//   const allSchemas = loadAllSchemas();

//   const envTypes = process.env.CONTENT_TYPES;

//   if (!envTypes) {
//     console.log('📦 Loading ALL content type schemas');
//     return allSchemas;
//   }

//   const ids = envTypes.split(',').map(t => t.trim());

//   console.log(`📦 Loading schemas for: ${ids.join(', ')}`);

//   return allSchemas.filter(schema =>
//     ids.includes(schema.id)
//   );
// }
export function loadSchemas() {
  const dir = path.join(
    process.cwd(),
    'playwright/testdata/contentful-schemas'
  );

  const allSchemas = fs.readdirSync(dir).map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    return JSON.parse(content);
  });

  const envTypes = process.env.CONTENT_TYPES
    ?.split(',')
    .map(t => t.trim());

  if (!envTypes || envTypes.length === 0) {
    console.log('📦 Loading ALL content type schemas');
    return allSchemas;
  }

  console.log(`📦 Loading schemas for: ${envTypes.join(', ')}`);

  return allSchemas.filter(schema =>
    envTypes.includes(schema.id)
  );
}