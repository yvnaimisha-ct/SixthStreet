import { test, expect, Locator, Page } from '@playwright/test';
import { AllureReporter } from 'allure-playwright';

export class LoginPage {
    page: Page;
    myAccount : Locator;
    myAccountTile: Locator;
    LogoTitle: Locator;
    signinButton: Locator;
    email: Locator;
    password: Locator;
    errMsg: Locator;

    constructor(page: Page) {
        this.page = page;
        this.myAccount = page.locator('a[data-gtm-l="My Account"]');
        this.LogoTitle = page.locator('a[title="Tactical Gear"]');
        this.myAccountTile = page.locator('.base');
        this.signinButton = page.locator('#send2');
        this.email = page.locator('#email');
        this.password = page.locator('#password');
        this.errMsg = page.locator("div[role='alert'] div:nth-child(1) div:nth-child(1)");
    }

    async validLogin(username: string, password: string) {
        await this.myAccount.waitFor({state:'visible'});
        await this.myAccount.click();
        await this.email.waitFor({state:'visible'});
        await this.email.fill(username);
        await this.password.fill(password);
        await this.signinButton.click();
        await this.page.waitForLoadState('networkidle');
        const bool = await this.myAccountTile.isVisible();
        expect(bool).toBeTruthy();
        const title = await this.myAccountTile.textContent();
        console.log(title);
    }

    async validateErrMsg(expectedErrMsg: string) {
        const actualErrorMessage = await this.errMsg.textContent();
        if (actualErrorMessage?.includes(expectedErrMsg)) {
            console.log('Error message is correct');
        } else {
            throw new Error(`Error message does not match! Expected: "${expectedErrMsg}", but got: "${actualErrorMessage}"`);
        }
    }
}
module.exports = { LoginPage };