import { test, expect, Locator, Page } from '@playwright/test';
import * as allure from "allure-js-commons";
import { UiAssertionsPage } from '../utilities/UiAssertionsPage';
import { AllureReporter } from 'allure-playwright';
import path from 'path';
// import { CartPage } from './CartPage';

export class HomePage {
  page: Page;
  uiassertionsPage: UiAssertionsPage;
  logoTitle: Locator;
  hpHeroComponent: Locator;
  hpHero_Header1: Locator;
  hpHero_Header2: Locator;
  hpHero_TimeStamp: Locator;
  hpHero_ShopWomenCTA: Locator;
  hpHero_ShopMenCTA: Locator;
  hpHero_WOTimeStamp: Locator;
  hpHero_WOTimeStamp_Header: Locator;
  hpHero_WOTimeStamp_desc: Locator;
  hpHero_WOTimeStamp_ShopNowCTA: Locator;
  hpHero_FloatingImage: Locator;
  hpHero_FloatingImage_Header: Locator;
  hpHero_FloatingImage_Desc: Locator;
  hpHero_FloatingImage_ShopNowCTA: Locator;
  hpHero_FloatingImage_Timestamps: Locator;
  // Category Pathing Bottom Reveal Hover Carousel
  hp_CatBottomhover: Locator;
  hp_CatCardsBottomhoverHeader: Locator;
  hp_CatCardsBottomhoverDescription: Locator;
  readonly hp_CatCardsBottomhover: Locator;
  readonly hp_CatImageBottomhover: string;
  readonly hp_CatNameBottomhover: string;
  readonly hp_CatCarouselArrowIconBottomhover: string;
  readonly hp_CatCardDescriptionBottomhover: string;
  readonly hp_CatProgressIndicatorBottomhover: Locator;
  // readonly hp_CatScrollArrow: string;
  readonly hp_CatScrollContainerBottomhover: string;
  readonly hp_CatScrollArrowLeftBottomhover: Locator;
  readonly hp_CatScrollArrowRightBottomhover: Locator;
  // Single CTA Break
  readonly hp_SingleCTABrk_WithImgTitle: Locator;
  readonly hp_SingleCTABrk_WithImgdesc: Locator;
  readonly hp_SingleCTABrk_WithImg_CTA: Locator;
  readonly hp_SingleCTABrk_WOImg: Locator;
  readonly hp_SingleCTABrk_WOImgHeader: Locator;
  readonly hp_SingleCTABrk_WOImgdesc: Locator;
  readonly hp_SingleCTABrk_WOImg_CTA: Locator;

  hp_MediaBreaker: Locator;
  hp_MediaBreaker_CTA: Locator;
  // hompageCategoryPathingBottomRevealOnHoverComponent: Locator;
  // Vertical Carousel Hover
  hp_VerticalCardsCarouselHeaderTop: Locator;
  hp_VerticalCardsCarouselHeaderSide: Locator;
  hp_VerticalCardsCarousel: Locator;
  hp_VerticalCardsProgressIndicator: Locator;
  hp_VerticalCardsArrowLeft: Locator;
  hp_VerticalCardsArrowRight: Locator;
  hp_VerticalCardsImage: string;
  hp_VerticalCardsName: string;
  hp_VerticalCardsArrowIcon: string;
  // Pathing Set
  hp_PathingSetComponent: Locator;
  hp_PathingSetComponentHeading: Locator;
  hp_PathingSetCategoryCards: Locator;
  hp_PathingSetCategoryTitles: string;
  hp_PathingSetCategoryDescriptions: string;
  //Product Carousel
  hp_ProductCarouselHeaderDescription: Locator;
  hp_ProductCarouselCards: Locator;
  hp_ProductCarouselCardColourSwatch: Locator;
  hp_ProductCarouselCardName: Locator;
  hp_ProductCarouselCardImg: Locator;
  hp_ProductCarouselCardPrice: Locator;
  hp_ProductCarouselRightArrow: Locator;
  hp_ProductCarouselCardNavigation: string;
  hp_ProductCarouselLeftArrow: Locator;
  hp_ProductCarouselProgressIndicator: Locator;



  constructor(page: Page) {
    this.page = page;
    this.logoTitle = page.locator('a[title="Tactical Gear"]');
    // this.hompageCategoryPathingBottomRevealOnHoverComponent = page.locator('.category-slider .card').filter({ has: page.locator('.category-label') });
    // Variation1 - Hero with horizontal timestamp
    this.hpHeroComponent = page.locator('.banner-block-overlay').first();
    this.hpHero_Header1 = page.locator('//*[@id="maincontent"]/div[2]/div/div[2]/div/section/div/div[2]/div/div[1]/h1[1]');
    this.hpHero_Header2 = page.locator('//h2[contains(@class,"banner-block-heading2")]').first();


    this.hpHero_TimeStamp = page.locator('//*[@id="maincontent"]/div[2]/div/div[2]/div/section/div/div[2]/div/div[1]/h1[1]');
    this.hpHero_ShopWomenCTA = page.locator('//div[contains(@data-content-type,"tactical_home_hero_banner")]//a[2]');
    this.hpHero_ShopMenCTA = page.locator('//div[contains(@data-content-type,"tactical_home_hero_banner")]//a[1]');
    // Variation2 - Hero without timestamp
    this.hpHero_WOTimeStamp = page.locator('.expand-box-container > .banner-block-overlay');
    this.hpHero_WOTimeStamp_Header = page.locator('//h1[@class="banner-block-heading m-b-32 xs-m-b-24 uppercase"]');
    this.hpHero_WOTimeStamp_desc = page.locator('//p[@class="banner-block-body body"][contains(text(),"Kick your conditioning and endurance training into")]');
    this.hpHero_WOTimeStamp_ShopNowCTA = page.locator('//span[@data-element="cta"][normalize-space()="SHOP NOW"]:visible');
    // Variation3 - Hero with floating image and vertical timestamp
    this.hpHero_FloatingImage = page.locator('.box-container > .banner-block-overlay');
    this.hpHero_FloatingImage_Header = page.locator('//h1[@class="banner-block-heading uppercase"]');
    this.hpHero_FloatingImage_Desc = page.locator('//p[normalize-space()="Gear up with our ultimate adventure-ready pants"]');
    this.hpHero_FloatingImage_ShopNowCTA = page.locator('//div[@class="cta-buttons"]//a[.//span[normalize-space(.)="SHOP Now"]]');
    this.hpHero_FloatingImage_Timestamps = page.locator('//div[contains(@class,"animate__animated animate__fadeIn animate__delay-06s uppercase font-martin-mono")]');
    //Single CTA Break without image
    this.hp_SingleCTABrk_WOImg = page.locator('//*[@id="maincontent"]/div[2]/div/div[10]/div/div/div');
    this.hp_SingleCTABrk_WOImgHeader = page.locator('div.video-text-container h2');
    this.hp_SingleCTABrk_WOImgdesc = page.locator('div.video-text-container p');
    // this.hp_SingleCTABrk_WOImg_CTA = page.locator('//div[contains(@class,"w-max-content")]//button');
    this.hp_SingleCTABrk_WOImg_CTA = page.locator('//*[@id="maincontent"]/div[2]/div/div[11]/div/div[2]/div/a');
    //Single CTA Break with image
    this.hp_SingleCTABrk_WithImgTitle = page.locator('//div[contains(@class, "promo-headline") and contains(@class, "font-heading")]');
    this.hp_SingleCTABrk_WithImgdesc = page.locator('//div[contains(@class, "promo-body")]');
    this.hp_SingleCTABrk_WithImg_CTA = page.locator('//*[@id="maincontent"]/div[2]/div/div[7]/div/div/div/div/div[3]/div/button');
    //Pathing Set
    this.hp_PathingSetComponent = page.locator('.pathing-set-container');
    this.hp_PathingSetComponentHeading = page.locator('//div[@class="pathing-set-heading"]');
    this.hp_PathingSetCategoryCards = page.locator('.pathing-set-container .pathing-set-column');
    this.hp_PathingSetCategoryTitles = '.card-content';
    this.hp_PathingSetCategoryDescriptions = '.hidden-content';
    //Vertical Cards
    this.hp_VerticalCardsCarouselHeaderTop = page.locator('//div[@class="vertically-expanding-cards-section"]//div[@class="pagebuilder-column-group"]');
    this.hp_VerticalCardsCarouselHeaderSide = page.locator('.vertically-expanding-cards-section .vertical-cards-side-header');
    this.hp_VerticalCardsCarousel = page.locator('.slick-slide:not(.slick-cloned) .vertical-card.cursor-pointer');
    this.hp_VerticalCardsImage = '.card-img';
    this.hp_VerticalCardsName = '.vertical-card-title';
    this.hp_VerticalCardsArrowIcon = '.red-arrow svg';
    this.hp_VerticalCardsArrowRight = page.locator('//button[@aria-label="View next vertical card"]');
    this.hp_VerticalCardsArrowLeft = page.locator('//button[@aria-label="View previous vertical card"]');
    this.hp_VerticalCardsProgressIndicator = page.locator('//div[@class="progress-bar-section flex-sb m-t-16 m-b-16"]');
    // CSS selectors for individual elements inside a card or category carousel

    this.hp_CatCardsBottomhover = page.locator('.slick-slide:not(.slick-cloned) .card');
    this.hp_CatImageBottomhover = '.card-image';
    this.hp_CatNameBottomhover = '.default-category p.uppercase';
    this.hp_CatCarouselArrowIconBottomhover = '.category-arrow svg';
    this.hp_CatCardDescriptionBottomhover = '.category-description';
    this.hp_CatProgressIndicatorBottomhover = page.locator('//div[@class="category-progress-bar-section flex-sb m-t-16 m-b-16"]'); // optional or placeholder
    this.hp_CatScrollArrowLeftBottomhover = page.locator('//button[@aria-label="View previous category"]//*[name()="svg"]');
    this.hp_CatScrollArrowRightBottomhover = page.locator('//button[@aria-label="View next category"]//*[name()="svg"]');
    this.hp_CatScrollContainerBottomhover = '.slick-slide[aria-hidden="false"]';
    //Media Breaker
    this.hp_MediaBreaker = page.locator('//*[@id="background-video"]');
    this.hp_MediaBreaker_CTA = page.locator('//button[contains(@class, "video-control") and @aria-label="Play/Pause Video"]');
    //Product Carousel
    this.hp_ProductCarouselHeaderDescription = page.locator('div[class="product-carousel-container responsive-padding-top"] div[class="pagebuilder-column-group"]');
    this.hp_ProductCarouselCards = page.locator('.slick-slide:not(.slick-cloned) .item.product');
    this.hp_ProductCarouselCardColourSwatch = page.locator('.swatch');
    this.hp_ProductCarouselRightArrow = page.locator('//button[@aria-label="View next product image"]');
    this.hp_ProductCarouselLeftArrow = page.locator('//button[@aria-label="View previous product image"]');
    this.hp_ProductCarouselProgressIndicator = page.locator('//div[@class="hero-product-carousel small-lh"]//div[@class="progress-bar-container"]');
    this.hp_ProductCarouselCardNavigation = 'a.product-item-link';
    this.hp_ProductCarouselCardName = page.locator('.product-item-name');
    this.hp_ProductCarouselCardImg = page.locator('.product-item-photo img');
    this.hp_ProductCarouselCardPrice = page.locator('.price');

  }

  get homePageTitle() {
    return this.logoTitle;
  }

  // Method to take a screenshot
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
  async validateCarouselCardCount(
    cardsLocator: Locator,
    minCards = 3,
    // maxCards = 8
  ): Promise<void> {
    try {

      // Wait for any ongoing animations/transitions
      await this.page.waitForTimeout(1000);

      // Wait for at least one card to be present and visible
      await cardsLocator.first().waitFor({
        state: 'visible',
        timeout: 10000
      }).catch(e => {
        console.warn('First card not visible, checking if any cards exist...');
        return cardsLocator.first().waitFor({ state: 'attached', timeout: 5000 });
      });

      // Get all matching elements and log details
      const allCards = await cardsLocator.all();
      console.log(`🔍 Found ${allCards.length} cards in total`);

      // Log details of each card
      for (let i = 0; i < Math.min(allCards.length, 5); i++) {
        try {
          const isVisible = await allCards[i].isVisible();
          console.log(`Card ${i + 1}:`, {
            visible: isVisible,
          });
        } catch (e) {
          console.error(`Error checking card ${i + 1}:`, e);
        }
      }

      // Final count and assertion
      const cardCount = allCards.length;
      console.log(`🔍 Carousel has ${cardCount} cards`);

      expect(
        cardCount,
        `Carousel card count should be at least ${minCards} but found ${cardCount}`
      ).toBeGreaterThanOrEqual(minCards);

    } catch (error) {
      console.error('Error in validateCarouselCardCount:', error);

      // Take a screenshot on failure
      await this.page.screenshot({
        path: `test-results/carousel-error-${Date.now()}.png`,
        fullPage: true
      });

      throw error; // Re-throw to fail the test
    }
  }
  async validatePathingSetCards(expectedCategories: string[]) {
    await expect(this.hp_PathingSetComponent).toBeVisible();
    await expect(this.hp_PathingSetComponentHeading).toBeVisible();

    const cards = this.hp_PathingSetCategoryCards;
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
    console.log(`🔍 Pathing Set has ${count} cards`);
    expect(count).toBeLessThanOrEqual(3);

    // Collect actual category names for assertion
    const actualCategories: string[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const title = card.locator(this.hp_PathingSetCategoryTitles);
      const description = card.locator(this.hp_PathingSetCategoryDescriptions);
      const image = card.locator('img');

       await allure.step(`Validate card #${i + 1}`, async () => {
        await card.waitFor({ state: 'attached' });
        await title.waitFor({ state: 'attached' });
        await description.waitFor({ state: 'attached' });
        await image.waitFor({ state: 'attached' });
        await expect(title).toBeVisible();
        const text = await title.textContent();
        if (text) actualCategories.push(text.trim());

        await expect(image).toBeVisible();
        await card.hover();
        await expect(description).toBeVisible();
        // await this.uiassertionsPage.dismissOptionalPopup();
      });

      await Promise.all([
        this.page.waitForNavigation(),
        card.click()
      ]);
      await this.page.goBack({ waitUntil: 'load' });
    }

    // ✅ Now do the category check ONCE after all cards
    await allure.step(`Assert categories [${expectedCategories.join(', ')}] are present`, async () => {
      for (const expected of expectedCategories) {
        const found = actualCategories.some((cat) =>
          cat.toLowerCase().includes(expected.toLowerCase())
        );
        if (found) {
          const message = `✅ Found expected category: "${expected}"`;
          console.log(message);
          await allure.step(message, async () => { });
        } else {
          const error = `❌ Expected category '${expected}' not found. Actual: ${actualCategories.join(', ')}`;
          console.error(error);
          await allure.step(error, async () => { });
          throw new Error(error);
        }
      }
    });
  }
}
module.exports = { HomePage };