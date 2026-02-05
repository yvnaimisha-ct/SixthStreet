import { Locator, Page } from '@playwright/test';
// import { CartPage } from './CartPage';

export class BasePage {
    page: Page;
    

    constructor(page: Page) {
        this.page = page;
    }
}
    module.exports = { BasePage };