import { test, expect, Locator, Page } from '@playwright/test';
import * as allure from "allure-js-commons";


export class HomePage {
  page: Page;



  constructor(page: Page) {
    this.page = page;
  }


  // Method to take a screenshot
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
module.exports = { HomePage };