import fs from 'fs';
import path from 'path';

export function loadAllSchemas() {
  const dir = path.join(process.cwd(), 'playwright/testdata/contentful-schemas');
  return fs.readdirSync(dir).map(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    return JSON.parse(content);
  });
}
