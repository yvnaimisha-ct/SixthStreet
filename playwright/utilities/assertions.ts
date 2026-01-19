import { expect } from '@playwright/test';  // Import Playwright's expect module
import { page } from '@playwright/test';

/**
 * Asserts that the page title is correct.
 * @param {string} expectedTitle - The expected title of the page.
 */
export const assertPageTitle = async (expectedTitle: string) => {
    const title = await browser.getTitle();  // Get the page title using Playwright in WebDriverIO
    expect(title).toBe(expectedTitle);  // Assert that title matches the expected value
};

/**
 * Asserts that the text of a given element matches the expected text.
 * @param {string} selector - The selector of the element.
 * @param {string} expectedText - The expected text of the element.
 */
export const assertElementText = async (selector: string, expectedText: string) => {
    const element = await $(selector);  // Locate the element using WebDriverIO selectors
    const text = await element.getText();  // Get the text of the element
    expect(text).toBe(expectedText);  // Assert the text is as expected
};

/**
 * Asserts that an element is clickable.
 * @param {string} selector - The selector of the element.
 */
export const assertElementIsClickable = async (selector: string) => {
    const element = await $(selector);  // Locate the element using WebDriverIO selectors
    const isClickable = await element.isClickable();  // Check if the element is clickable
    expect(isClickable).toBe(true);  // Assert that the element is clickable
};
