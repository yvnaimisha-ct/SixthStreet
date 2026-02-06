import { test } from '@playwright/test';
import { POManager } from '../../pageobjects/POManager';
import * as allure from "allure-js-commons";

test.describe('SixStreet Homepage Tests', () => {

    //allure.suite('SS Login Feature Testcases');
    // This will run before each test to open the base URL
    test.beforeEach(async ({ page, baseURL, browser },testInfo) => {
        
        if (typeof baseURL === 'string') {
            await page.goto(baseURL);
            console.log('Navigated to Base URL: ' + baseURL);
            //allure.
           allure.label('Base URL', baseURL);
        } else {
            allure.severity('baseURL is not defined or not a string');
            throw new Error('baseURL is not defined or not a string');
        }
        
    });

    test.afterEach(async ({ page }, testInfo) => {
        console.log('Execution Status : ' + testInfo.status);
       

    });

    test('Launch Sixstreet Homepage Tests', {tag : ['@smoke', '@regression']},  async ({ page }, testInfo) => {

        const poManager = new POManager(page);
        console.log('Starting Valid URL Test');
    });
});