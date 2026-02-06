import { test, expect, Locator, Page } from '@playwright/test';
import { AllureReporter } from 'allure-playwright';

export class LoginPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }
}
module.exports = { LoginPage };