import { test, expect } from '@playwright/test';
import { POManager } from '../../pageobjects/POManager';
import { captureFailureLogs } from '../../utilities/logUtils';
import * as allure from "allure-js-commons";

test.describe('5.11 Tactical Login Feature', () => {

    //allure.suite('SS Login Feature Testcases');
    // This will run before each test to open the base URL
    test.beforeEach(async ({ page, baseURL, browser },testInfo) => {
        
        if (typeof baseURL === 'string') {
            await page.goto(baseURL);
            //allure.
           allure.label('Base URL', baseURL);
        } else {
            allure.severity('baseURL is not defined or not a string');
            throw new Error('baseURL is not defined or not a string');
        }
        await page.getByRole('button', { name: 'Close' }).click();
    });

    test.afterEach(async ({ page }, testInfo) => {
        console.log('Execution Status : ' + testInfo.status);
        // if (testInfo.status === 'failed') {
        //     // Use the utility to capture failure logs if the test fails
        //     await captureFailureLogs(page, testInfo, new Error('Test failed in afterEach'));
        // }

    });

    test('Valid Login - Valid User', {tag : ['@smoke', '@regression']},  async ({ page }, testInfo) => {

        const poManager = new POManager(page);
        console.log('Starting Valid Login Test');
    });
});