import { customTest as test, expect } from '../../testdata/test-base';
import { POManager } from '../../pageobjects/POManager';
import { HomePage } from '../../pageobjects/HomePage';
import { UiAssertionsPage } from '../../utilities/UiAssertionsPage';
import * as allure from "allure-js-commons";
import { CarouselLocators, CarouselValidator } from '../../utilities/CarouselValidator';
import { Locator } from '@playwright/test';

const datasets = JSON.parse(JSON.stringify(require("../../testdata/loginTestData.json")));

test.describe('Validate HomePage Components', () => {
  let poManager: POManager;
  let uiassertionsPage: UiAssertionsPage;
  let homepage: HomePage;

  test.beforeEach(async ({ page, baseURL }, testInfo) => {
    testInfo.setTimeout(60000);
    if (typeof baseURL === 'string') {
      await page.goto(baseURL);
      allure.label('Base URL', baseURL);
    } else {
      allure.severity('baseURL is not defined or not a string');
      throw new Error('baseURL is not defined or not a string');
    }
    poManager = new POManager(page);
    uiassertionsPage = poManager.getUiAssertionsPage();
    homepage = poManager.getHomePage();
  });
  const visibleCount = async (locator: Locator) => {
    const n = await locator.count();
    let visible = 0;
    for (let i = 0; i < n; i++) {
      if (await locator.nth(i).isVisible()) visible++;
    }
    return visible;
  };

  // Hero Section Tests
  test('Validate Homepage Hero Component based on presence', { tag: '@smoke' }, async ({ page }) => {
    const heroCounts = await Promise.all([
      visibleCount(homepage.hpHero_Header2),                      // Hero with horizontal timestamp
      visibleCount(homepage.hpHero_WOTimeStamp_Header),           // Hero without timestamp
      visibleCount(homepage.hpHero_FloatingImage_Header),         // Hero with floating image and vertical timestamp
    ]);

    const totalHeroes = heroCounts.filter(count => count > 0).length;

    if (totalHeroes > 1) {
      throw new Error(`❌ More than one hero section is displayed. Found: ${totalHeroes}`);
    }
    // Hero with horizontal timestamp
    try {
      if (heroCounts[0] > 0) {
        await uiassertionsPage.validateComponentText(homepage.hpHero_Header2);
        await page.waitForTimeout(1000);
        await expect(homepage.hpHero_TimeStamp).toBeVisible();
        console.log("Homepage hero timestamp validated: " + await homepage.hpHero_TimeStamp.textContent());

        await uiassertionsPage.validateCtasInComponent(homepage.hpHeroComponent, homepage.hpHero_ShopWomenCTA);
        await expect(homepage.hpHero_ShopMenCTA).toBeVisible();
        await uiassertionsPage.validateCtasInComponent(homepage.hpHeroComponent, homepage.hpHero_ShopMenCTA);
        console.log("Homepage hero CTA validated");
        return;
      }
    } catch (e) {
      console.log('ℹ️ Header2 is present but not visible, trying next hero layout...');
    }
    // Hero without timestamp

    try {
      if (heroCounts[1] > 0) {
        await uiassertionsPage.validateComponentText(homepage.hpHero_WOTimeStamp_Header);
        await uiassertionsPage.validateComponentText(homepage.hpHero_WOTimeStamp_desc);
        console.log("Homepage hero w/o timestamp Header validated");
        console.log("Homepage hero w/o timestamp Description validated");

        await uiassertionsPage.validateCtasInComponent(homepage.hpHero_WOTimeStamp, homepage.hpHero_WOTimeStamp_ShopNowCTA);
        console.log("Homepage hero w/o timestamp CTA validated");
        return;
      }
    } catch (e) {
      console.log('WO Timestamp Header is present but not visible, trying next hero layout...');
    }

    // Hero with floating image and vertical timestamp
    try {
      if (heroCounts[2] > 0) {
        await uiassertionsPage.validateComponentText(homepage.hpHero_FloatingImage_Header);
        await uiassertionsPage.validateComponentText(homepage.hpHero_FloatingImage_Desc);
        console.log("✅ Homepage hero floating image Header validated");
        console.log("✅ Homepage hero floating image Description validated");

        await uiassertionsPage.validateCtasInComponent(homepage.hpHero_FloatingImage, homepage.hpHero_FloatingImage_ShopNowCTA);
        console.log("✅ Homepage hero floating image CTA validated");

        await expect(homepage.hpHero_FloatingImage_Timestamps).toBeVisible();
        console.log("✅ Homepage hero floating image Timestamp validated");
        return;
      }
    } catch (e) {
      console.log('ℹ️ Floating image layout not visible either.');
    }
    throw new Error("No known homepage hero component is present.");
  });

  test('Validate single CTA breaker without image', { tag: '@regression' }, async ({ page }, testInfo) => {
    testInfo.setTimeout(90000);
    await allure.step('Validate Single CTA Breaker text without image', async () => {
      await uiassertionsPage.validateComponentText(homepage.hp_SingleCTABrk_WOImgHeader);
      await uiassertionsPage.validateComponentText(homepage.hp_SingleCTABrk_WOImgdesc);
    });
    await allure.step('Validate CTA inside Single CTA Breaker without image', async () => {
      await uiassertionsPage.validateCtasInComponent(homepage.hp_SingleCTABrk_WOImg, homepage.hp_SingleCTABrk_WOImg_CTA);
    });
    await allure.step('Log Single CTA Breaker validation messages', async () => {
      console.log("Single CTA Breaker text validated");
      console.log("Single CTA Breaker CTA validated");
    });
  });
  test('Validate Media Breaker Presence', async ({ page }) => {
    await allure.step('Navigate to Media Breaker section', async () => {
      // await page.goto("https://mcstaging.511tactical.com/511-expand-home-page-htmlconversion");
      await expect(homepage.hp_MediaBreaker).toBeVisible();
      await expect(homepage.hp_MediaBreaker_CTA).toBeVisible();
    });
    await allure.step('Media Breaker validated', async () => {
      console.log("Media Breaker validated");
    });
  });
  // Pathing Set Tests
  test('Validate Pathing Set cards', async ({ page }, testInfo) => {
    testInfo.setTimeout(90000);
    await allure.step('Navigate to Pathing Set section with header texts', async () => {
      // await page.goto("https://mcstaging.511tactical.com/511-expand-home-page-htmlconversion");
      const expectedCategories = ["Women's training", "Men's Training", "Women's training"];
      await homepage.validatePathingSetCards(expectedCategories);
    });
  });
  // Single CTA Breaker Tests
  test('Validate single CTA breaker with image', { tag: '@regression' }, async ({ page }, testInfo) => {
    testInfo.setTimeout(90000);
    // await page.goto("https://staging3.511tactical.com/us-pl/511-expand-home-page-conversion");
    await allure.step('Validate Single CTA Breaker text with image', async () => {
      await uiassertionsPage.validateComponentText(homepage.hp_SingleCTABrk_WithImgTitle);
      await uiassertionsPage.validateComponentText(homepage.hp_SingleCTABrk_WithImgdesc);
    });
    await allure.step('Validate CTA inside Single CTA Breaker with image', async () => {
      // await uiassertionsPage.validateCtasInComponent(homepage.hp_SingleCTABrk_WithImgTitle, homepage.hp_SingleCTABrk_WithImg_CTA);
      await uiassertionsPage.validateCtasInComponent(homepage.hp_SingleCTABrk_WithImgTitle, page.locator('//span[normalize-space()="SHOP Now"]'));

    });
    await allure.step('Log Single CTA Breaker validation messages', async () => {
      console.log("Single CTA Breaker text validated");
      console.log("Single CTA Breaker CTA validated");
    });
  });
  test('Validate Category Pathing Carousel Navigation', async ({ page }, testInfo) => {
    testInfo.setTimeout(240000);
    const locators: CarouselLocators = {
      carouselName: "Category Pathing Carousel",
      // container: page.locator('//div[@class="default-category-carousel p-b-80 xs-p-b-48"]'),
      container: page.locator('//div[@class="carousel-container bottom-hover-reveal-carousel-container"]'),
      leftArrow: page.locator('.nav-prev.arrow-btn').first(),
      rightArrow: page.locator('.nav-next.arrow-btn').first(),
      progressIndicator: page.locator('.progress-bar').first(),
      paginationCounter: page.locator('//div[@id="slide-counter-category"]'),
      slides: page.locator('.slick-slide:not(.slick-cloned) .card')
    };
    const validator = new CarouselValidator(page, locators);
    await validator.validateInitialState();
    await validator.validateNavigation();

    await uiassertionsPage.validateCategoryPathingBottomRevealHoverCarousel(
      locators.slides,
      {
        imageSelector: '.card-image',
        categoryNameSelector: '.default-category p.uppercase',
        arrowIconSelector: '.category-arrow svg',
        descriptionSelector: '.category-description',
        sectionHeaderLocatorTop: locators.container.locator('.card-header').first(),
        sectionHeaderLocatorSide: locators.container.locator('.card-header').first(),
        headingSelector: page.locator('.category-pathing-sub-heading').first(),
        paragraphSelector: page.locator('.category-pathing-paragraph').first()
      }
    );
  });
  test('Validate vertical Hover Carousel Navigation', async ({ page }, testInfo) => {
    testInfo.setTimeout(240000);
    const locators: CarouselLocators = {
      carouselName: "Vertical Hover Carousel",
      container: page.locator('//div[@class="pagebuilder-column-group vertically-expanding-cards-carousel-container"]'),
      leftArrow: page.locator('//div[@class="left vertical-arrow-btn-container"]//button[@aria-label="View previous vertical card"]'),
      rightArrow: page.locator('//div[@class="right vertical-arrow-btn-container"]//button[@aria-label="View next vertical card"]'),
      progressIndicator: page.locator('(//div[@class="progress-bar"])[2]'),
      paginationCounter: page.locator('//div[@id="slide-counter-cards"]'),
      slides: page.locator('.slick-slide:not(.slick-cloned) .vertical-card')
    };
    const validator = new CarouselValidator(page, locators);
    await validator.validateInitialState();
    await validator.validateNavigation();

    await uiassertionsPage.validateVerticalHoverCarousel(
      locators.slides,
      {
        imageSelector: '.card-img',
        categoryNameSelector: '.vertical-card-title',
        sectionHeaderLocatorTop: locators.container.locator('.card-header').first(),
        sectionHeaderLocatorSide: locators.container.locator('.card-header').first(),
        headingSelector: page.locator("(//div[@class='pagebuilder-column-line'])[3]")
      }
    );
  });
  test('Validate product carousel Navigation', async ({ page }, testInfo) => {
    testInfo.setTimeout(240000);
    const locators: CarouselLocators = {
      carouselName: "Product Carousel",
      container: page.locator('.product-slider'),
      leftArrow: page.locator('//button[@aria-label="View previous product image"]'),
      rightArrow: page.locator('//button[@aria-label="View next product image"]'),
      progressIndicator: page.locator('(//div[@class="progress-bar"])[3]'),
      paginationCounter: page.locator('#slide-counter-products'),
      slides: page.locator('.slick-slide:not(.slick-cloned) .product-item-info')
    };
    const validator = new CarouselValidator(page, locators);
    await validator.validateInitialState();
    await validator.validateNavigation();

    await uiassertionsPage.validateProductCarousel(
      locators.slides,
      {
        imageSelector: '.product-item-photo img',
        nameSelector: '.product-item-name',
        priceSelector: '.price',
        swatchSelector: '.swatch',
        sectionHeaderLocatorTop: locators.container.locator('.card-header').first(),
        sectionHeaderLocatorSide: locators.container.locator('.card-header').first(),
        headingSelector: page.locator('.product-carousel-sub-heading'),
        paragraphSelector: page.locator('.product-carousel-paragraph')
      }
    );
  });
});