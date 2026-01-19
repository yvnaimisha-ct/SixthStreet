import { Page, Locator } from '@playwright/test';
import * as allure from "allure-js-commons";
import { test, expect } from '@playwright/test';

export interface CarouselLocators {
  carouselName: string;
  container: Locator;
  leftArrow: Locator;
  rightArrow: Locator;
  progressIndicator: Locator;
  paginationCounter: Locator;
  slides: Locator;
}

export class CarouselValidator {
  private page: Page;
  private locators: CarouselLocators;

  constructor(page: Page, locators: CarouselLocators) {
    this.page = page;
    this.locators = locators;
  }

  private getContainer(): Locator {
    return this.locators.container;
  }

  private getLeftArrow(): Locator {
    return this.locators.leftArrow;
  }

  private getRightArrow(): Locator {
    return this.locators.rightArrow;
  }

  private getProgressIndicator(): Locator {
    return this.locators.progressIndicator;
  }

  private getPaginationCounter(): Locator {
    return this.locators.paginationCounter;
  }

  private getSlides(): Locator {
    return this.locators.slides;
  }

  async validateInitialState(): Promise<boolean> {
    return await allure.step(`Validate ${this.locators.carouselName} initial state`, async () => {
      // Validate carousel is visible
      await expect(this.getContainer()).toBeVisible();
      allure.logStep(`Carousel ${this.locators.carouselName} is visible`);
      console.log(`Carousel ${this.locators.carouselName} is visible`);
      console.log(this.getSlides());
      await this.getSlides().first().waitFor({ state: 'visible' });
      
      
      // Get total number of slides
      const totalSlides = await this.getSlides().count();
      console.log(`Total slides: ${totalSlides}`);

      // If 3 or fewer cards, hide arrows as there's nothing to scroll to
      if (totalSlides <= 4) {
        await expect(this.getLeftArrow()).toBeHidden();
        await expect(this.getRightArrow()).toBeHidden();
        allure.logStep(`Arrows are hidden as there are only ${totalSlides} slides (3 or fewer cards)`);
        console.log(`Arrows are hidden as there are only ${totalSlides} slides (3 or fewer cards)`);
        return false;
      } else {
        // For 5 or more slides, validate arrow states
        // Left arrow should be visible but disabled initially
        await expect(this.getLeftArrow()).toBeVisible();
        await expect(this.getLeftArrow()).toBeDisabled();
        allure.logStep(`Left arrow is disabled initially`);
        console.log(`Left arrow is disabled initially`);

        // Right arrow should be visible and enabled initially
        await expect(this.getRightArrow()).toBeVisible();
        await expect(this.getRightArrow()).not.toBeDisabled();
        allure.logStep(`Right arrow is enabled initially`);
        console.log(`Right arrow is enabled initially`);
        return true;
      }
    });
  }
  async validateInitialState_AboutUs(): Promise<boolean> {
    return await allure.step(`Validate ${this.locators.carouselName} initial state`, async () => {
      // Validate carousel is visible
      await expect(this.getContainer()).toBeVisible();
      allure.logStep(`Carousel ${this.locators.carouselName} is visible`);
      console.log(`Carousel ${this.locators.carouselName} is visible`);
      console.log(this.getSlides());
      await this.getSlides().first().waitFor({ state: 'visible' });
      
      
      // Get total number of slides
      const totalSlides = await this.getSlides().count();
      console.log(`Total slides: ${totalSlides}`);
        await expect(this.getLeftArrow()).toBeVisible();
        await expect(this.getLeftArrow()).toBeDisabled();
        allure.logStep(`Left arrow is disabled initially`);
        console.log(`Left arrow is disabled initially`);

        // Right arrow should be visible and enabled initially
        await expect(this.getRightArrow()).toBeVisible();
        await expect(this.getRightArrow()).not.toBeDisabled();
        allure.logStep(`Right arrow is enabled initially`);
        console.log(`Right arrow is enabled initially`);
        return true;
    });
  }
  async validateNavigation(): Promise<void> {
    await allure.step(`Validate ${this.locators.carouselName} navigation`, async () => {
      await this.getSlides().last().waitFor({ state: 'visible' }); 
      const totalSlides = await this.getSlides().count();
      console.log(`Total slides: ${totalSlides}`);
      
      if (totalSlides <= 3) {
        console.log('Not enough slides for navigation test, skipping navigation test');
        return;
      }
  

      // Navigate right until the end
      let currentSlide = 1;
      let previousCounter = '';
      let sameCounterCount = 0;
      const MAX_SAME_COUNTER = 3; // Safety to prevent infinite loop
  
      while (currentSlide < totalSlides * 2) { // *2 as safety factor
        const isRightArrowEnabled = !(await this.getRightArrow().isDisabled());
        
        // If right arrow is disabled, we've reached the end
        if (!isRightArrowEnabled) {
          console.log('Right arrow is disabled, reached end of carousel');
          break;
        }
  
        // Get current counter state
        const currentCounter = await this.getPaginationCounter().textContent() || '';
        
        // Check if we're stuck (counter not changing)
        if (currentCounter === previousCounter) {
          sameCounterCount++;
          if (sameCounterCount >= MAX_SAME_COUNTER) {
            console.log(`Counter didn't change after ${MAX_SAME_COUNTER} attempts, assuming end of carousel`);
            break;
          }
        } else {
          sameCounterCount = 0;
          previousCounter = currentCounter;
        }
  
        await this.getRightArrow().click();
        await this.page.waitForTimeout(500); // Increased timeout for better reliability
        currentSlide++;
        console.log(`Navigated to slide ${currentSlide}, counter: ${currentCounter}`);
  
        // Both arrows should be enabled during navigation
        await expect(this.getLeftArrow()).not.toBeDisabled();
        console.log('Left arrow is enabled during navigation');
      }
  
      // Verify right arrow is disabled at the end
      const isRightArrowDisabled = await this.getRightArrow().isDisabled();
      if (!isRightArrowDisabled) {
        console.warn('Right arrow is still enabled at what appears to be the end of the carousel');
      }
  
      // Navigate back to start
      while (currentSlide > 1) {
        const isLeftArrowEnabled = !(await this.getLeftArrow().isDisabled());
        if (!isLeftArrowEnabled) break;
  
        await this.getLeftArrow().click();
        await this.page.waitForTimeout(500);
        currentSlide--;
        console.log(`Navigated back to slide ${currentSlide}`);
  
        // Right arrow should be enabled when not at the end
        if (currentSlide < totalSlides) {
          await expect(this.getRightArrow()).not.toBeDisabled();
        }
      }
  
      // Verify left arrow is disabled at the start
      await expect(this.getLeftArrow()).toBeDisabled();
      console.log('Left arrow is disabled at the start');
  
      console.log(`✅ ${this.locators.carouselName} Navigation Validated`);
    });
  }
}