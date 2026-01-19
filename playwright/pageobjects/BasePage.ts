import { Locator, Page } from '@playwright/test';
// import { CartPage } from './CartPage';

export class BasePage {
    page: Page;
    cartIcon: Locator;
    drawerCartCount: Locator;
    cartPage: Locator;
    sideBarOpenButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartIcon = page.locator("#minicart-toggle");
        this.drawerCartCount = page.locator('.block-title .qty');
        //this.cartCount = page.locator('button[role="button"][name="Toggle Cart Menu"]');
        this.cartPage = page.locator("My Cart");

        this.sideBarOpenButton = page.locator("//button[text()='Open Menu']");
    }
    async clickCartIcon() {
        await this.cartIcon.click();
    }

    async clickSideBarOpenButton() {
        await this.sideBarOpenButton.click();
    }
}
    module.exports = { BasePage };