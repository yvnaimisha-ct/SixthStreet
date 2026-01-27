import { TestInfo, expect, test } from '@playwright/test';
import { loadAllSchemas } from '../../utilities/schema-loader';
import { getContentType } from '../../utilities/contentful-helper-schema';
import { validateContentTypeSchema } from '../../utilities/db/validations2';

const schemas = loadAllSchemas();
test.describe('@contentful Contentful schema validation', () => {
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

  test.only(`Page Load validation: `, async ({ page }) => {
    console.log('Page load check');
    
    // Add timeout and wait for the input to be visible
    await page.goto('https://sixth-street-replatform-dev.vercel.app/', { waitUntil: 'domcontentloaded' });
    
    try {
      // Wait for the password input to be visible
      const passwordInput = page.locator('input[name="_vercel_password"]');
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      
      // Fill the password
      await passwordInput.fill('g!7B#m9zQp$tW%2f');
      console.log('Password entered');
      
      // Wait for the button to be enabled and click it
      const submitButton = page.locator('button.submit:not([disabled])');
      await submitButton.waitFor({ state: 'visible', timeout: 5000 });
      await submitButton.click();
      console.log('Submit button clicked');
      
      // Wait for navigation to complete with a timeout
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      console.log('Page navigation complete');
      
      // Add some verification that you're on the expected page
      console.log('Current URL:', page.url());
      
    } catch (error) {
      console.error('Error during test execution:', error);
      // Take a screenshot on failure
      await page.screenshot({ path: 'error-screenshot.png' });
      throw error;
    }
  });
});
