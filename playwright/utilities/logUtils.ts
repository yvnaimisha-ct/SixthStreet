import { Page, TestInfo } from '@playwright/test';

export async function captureFailureLogs(page: Page, testInfo: TestInfo, error: any) {
    const errorMessage = error.message || 'Unknown error occurred';

    // Attach error message
    testInfo.attach('Error Message', {
        body: `Test failed with error: ${errorMessage}`,
        contentType: 'text/plain',
    });

    // Capture and attach screenshot on failure
    const screenshotBuffer = await page.screenshot();
    testInfo.attach('Failure Screenshot', {
        body: screenshotBuffer,
        contentType: 'image/png',
    });

    // Capture page source for debugging
    const pageSource = await page.content();
    testInfo.attach('Page Source', {
        body: pageSource,
        contentType: 'text/html',
    });

    // Log error to console for real-time feedback
    console.error(`Test failed: ${errorMessage}`);
}
