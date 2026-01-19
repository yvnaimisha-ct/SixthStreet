import { customTest as test, expect } from '../../testdata/test-base';
import { POManager } from '../../pageobjects/POManager';
import { HomePage } from '../../pageobjects/HomePage';
import { PDP } from '../../pageobjects/PDP';
import { UiAssertionsPage } from '../../utilities/UiAssertionsPage';
import { CartPage } from '../../pageobjects/CartPage';
import * as allure from "allure-js-commons";
const pdpTestData = require('../../testdata/pdpTestData.json');

test.describe('Validate PDP Components', () => {
  let poManager: POManager;
  let uiassertionsPage: UiAssertionsPage;
  let homepage: HomePage;
  let pdp: PDP;
  let cart: CartPage;
  test.beforeEach(async ({ page, baseURL }, testInfo) => {
    testInfo.setTimeout(60000);
    if (typeof baseURL === 'string') {
      await page.goto(baseURL);
      allure.label('Base URL', baseURL);
    } else {
      allure.severity('baseURL is not defined or not a string');
      throw new Error('baseURL is not defined or not a string');
    }

    // Always initialize POManager and pages
    poManager = new POManager(page);
    uiassertionsPage = poManager.getUiAssertionsPage();
    homepage = poManager.getHomePage();
    pdp = poManager.getPDPPage();
    cart = poManager.getCartPage();
  });
  test('Validate Buying tools and Accordions', async ({ page }, testInfo) => {
    testInfo.setTimeout(400000);
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(10, 11).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating PDP Hero for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateBuyingTools(pdpData);
      const sections = [
         'Product Details',
        // 'Size + Fit',
         'Shipping + Returns',
        // 'Add the Essentials',
      ];
      for (const section of sections) {
        await pdp.validateTitleAndDescriptionPresent(section);
        await pdp.validateAccordionDefaultExpanded(section);
        await pdp.validateToggleBehavior(section);
      }
      await pdp.validateShippingDescriptionText();
    }
  });
  test('Validate FitGuide', async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(9, 10).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating PDP Hero for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateFitGuideFunctionality();
    }
  });
  test('Add products, verify and close mini-cart', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0, 2).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating Add to Cart for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.selectProductAttributes(page, pdpData);
      await pdp.addProductToCart();
      await pdp.validateMiniCartModal(page, pdpData.productName, pdpData.price);
      await pdp.closeMiniCart();
    }
  });
  test('Validate Qty Adjuster', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0, 1).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating PDP Buying tools for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateQuantityBehavior();
    }
  });
  test('Validate Checkout Cart CTA', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    const attributeMap: Record<string, string> = {
      length: 'dimension',
      color: 'color',
      size: 'size',
    };
    for (const [index, pdpData] of pdpTestData.slice(0, 1).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log('Validating PDP Buying tools for: ${ pdpData.productName } (${ validatingUrl })');
      await page.goto(validatingUrl);
      for (const [attributekey, values] of Object.entries(pdpData)) {
        // Skip metadata fields
        if (["pdpUrl", "productName", "isOnSale", "price"].includes(attributekey)) continue;

        // Normalize values (array or string)
        const cleanedKey = attributekey.trim().replace(/[:\s]+$/, '').toLowerCase(); // removes trailing colons/spaces
        const attributeCode = attributeMap[cleanedKey] || cleanedKey;
        const options = Array.isArray(values) ? values : [values];

        for (const value of options) {
          const swatchOption = page.locator(`.swatch-attribute[data-attribute-code="${attributeCode.toLowerCase()}"] .swatch-option[aria-label="${value}"]`).first();
          await expect(swatchOption).toBeVisible({ timeout: 5000 });
          await swatchOption.click();
        }
      }
      await pdp.customProduct_AddToCartButton.click();
      await pdp.validateMiniCartModal(page, pdpData.productName, pdpData.price);
      await expect(pdp.cartQuickview_CheckoutCTA).toBeVisible();
      await pdp.cartQuickview_CheckoutCTA.click();
      await expect(page).toHaveURL(/\/checkout/);
      console.log('✅ Checkout CTA clicked successfully');
    }
  });
  test('Click restriction link opens modal', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(3, 4).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating PDP Buying tools for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateRestrictionsModal(page);
    }
  });
  test('Validate Add to cart Buy Bar color Swatch', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0, 1).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating PDP Buying tools for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateBuyBarWithSwatchBehavior(pdpData.productName);
    }
  });
  test('Validate Add to cart Buy Bar Pricing ', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0, 2).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating PDP Buying tools for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateBuyBarPricing(pdpData.price, pdpData.isOnSale);
    }
  });
  test('Add custom name tape to cart and verify mini-cart', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    const customNameTapeProducts = pdpTestData.filter(p => p.nameTapeText && p.threadColor);
    for (const [index, pdpData] of customNameTapeProducts.entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Custom Name Tape PDP: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      allure.logStep('🎨 Selecting font style: Bold')
      await expect(pdp.customProduct_FontOption).toHaveAttribute('aria-required', 'true');
      await expect(pdp.customProduct_FontOption).toBeChecked();
      allure.logStep(`🎨 Selecting thread color: ${pdpData.threadColor}`);
      await pdp.customProduct_ThreadColorLabel(pdpData.threadColor).click();
      allure.logStep(`✏️  Entering custom text: "${pdpData.nameTapeText}"`);
      const isAdded = await pdp.ValidateCustomTapeInputField(page, pdpData.nameTapeText);
      if (isAdded) {
        allure.logStep('🔍 Validating mini-cart...');
        await pdp.validateMiniCartModal(page, pdpData.productName, pdpData.price);
        await pdp.closeMiniCart();
        console.log('✅ Product added to cart')
      } else {
        console.log('⚠️ Skipping mini-cart validation due to input Error');
      }
    }
  });
  test('Gift Card Validation to mini cart', async ({ page }) => {
    // const baseUrl = test.info().project.use.baseURL!;
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(6, 7).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating Add to Cart for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateGiftCardBehavior();
      await pdp.customProduct_AddToCartButton.click();
      await pdp.validateMiniCartModal(page, pdpData.productName, pdpData.price);
      await pdp.closeMiniCart();
    }
  });
  test.skip('Image Gallery and Editorial Grid Validation', async ({ page }) => {
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0, 1).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Image Gallery and Editorial Grid for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await expect(pdp.imagegallery_Upper).toBeVisible();
      await expect(pdp.imagegallery_Lower).toBeVisible();
      console.log('✅ Image Gallery is visible');
      // await expect(pdp.editorialgrid_Title).toBeVisible();
      await expect(pdp.editorialgrid_ImgLeft).toBeVisible();
      await expect(pdp.editorialgrid_DescLeft).toBeVisible();
      await expect(pdp.editorialgrid_ImgRight).toBeVisible();
      await expect(pdp.editorialgrid_DescRight).toBeVisible();
      console.log('✅ Editorial Grid is visible with left and right images and description');
    }
  });
  // Validate PickUp Store Selection when Stores available => Location Access
  test('Validate PDP Pickup Flow when stores available', async ({ page, context }, testInfo) => {
    testInfo.setTimeout(120000);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.3044022, longitude: -77.5103001 }); // Simulates fredericksburg ZIP (22401)
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(7, 8).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Pickup after store selection for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
    const pdp = new PDP(page);
    await pdp.selectProductAttributes(page, pdpData);
    await pdp.validateBopisFlowOnStoreSelection();
    await pdp.validateChangeLocation();
    await pdp.validateStoreAvailabilityOnSwatchUpdate();
    }
  });
  // Validate PickUp Store product unavailable message and change location CTA when Stores not available => Allow Location Access
  test.skip('Validate PDP Pickup Flow when stores not available', async ({ page, context }, testInfo) => {
    testInfo.setTimeout(180000);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.3044022, longitude: -77.5103001 }); // Simulates fredericksburg ZIP (10001)
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(7, 8).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Pickup after store selection for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
    const pdp = new PDP(page);
    await pdp.validateDeliveryOptionsOnPageLoad();
    await page.locator('//div[@id="option-label-color-92-item-139"]').click();
    await page.locator('//div[@id="option-label-size-179-item-33"]').click();
    await pdp.validateBopisFlowOnStoreSelection();
    }
    // const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0, 1).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Pickup after store selection for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      console.log('navigating to dfferent product with no stores available')
      // await expect(pdp.product_PickUpInStore_productUnavailableMsg).toBeHidden();
      await expect(pdp.product_PickUpInStore_ChangeLocationCTA).toBeHidden();
      await pdp.selectProductAttributes(page, pdpData);
      console.log('selected product attributes')
      await page.waitForTimeout(5000);
      await expect(pdp.product_PickUpInStore_productUnavailableMsg).toBeVisible();
      // await page.reload();
      // await expect(pdp.product_PickUpInStore_productUnavailableMsg);
      await expect(pdp.product_PickUpInStore_ChangeLocationCTA).toBeVisible();
      console.log('Item unavailable Optional Message and Change Location CTA are visible')
      await pdp.product_PickUpInStore_ChangeLocationCTA.click();
      console.log('Change Location CTA clicked');
      await expect(pdp.bopisModal_Title).toBeVisible();
      console.log('Bopis Modal is visible');
    }
  });
  // Validate Bopis Modal with no stores found and with stores found 
  test('Validate Bopis Modal with no stores found', async ({ page, context }, testInfo) => {
    testInfo.setTimeout(120000);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.3044022, longitude: -77.5103001 }); // Simulates fredericksburg ZIP (22401)
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0, 1).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Bopis Modal for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
    const pdp = new PDP(page);
    await pdp.selectProductAttributes(page, pdpData);
    await pdp.validateBopisModalErrMsg();
    }
  });
  // Validate Bopis Modal with stores found
  test('Validate Bopis Modal with stores found', async ({ page, context }, testInfo) => {
    testInfo.setTimeout(120000);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.3044022, longitude: -77.5103001 }); // Simulates fredericksburg ZIP (22401)
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(7, 8).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Bopis Modal for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
    const pdp = new PDP(page);
    await pdp.selectProductAttributes(page, pdpData);
    await pdp.product_PickUpInStore_SelectStoreCTA.click();
    await pdp.bopismodal_Radius.click();
    await pdp.bopismodal_Radius.selectOption('100');
    await pdp.bopismodal_EnterCTA.waitFor({ state: 'visible' });
    await pdp.bopismodal_EnterCTA.click();
    await page.waitForTimeout(5000);
    await expect(pdp.bopisModal_ProductUnavailableMsg).toBeHidden();
    await pdp.validateAllStoreCards();
    }
  });
  // Validate pickup flow when location permission is not allowed
  test('PDP Pickup flow when location permission is not allowed', async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(7, 8).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Pickup after store selection for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
    const pdp = new PDP(page);
    await pdp.selectProductAttributes(page, pdpData);
    // Open BOPIS modal
    await pdp.product_PickUpInStore_SelectStoreCTA.click();
    await expect(pdp.bopisModal_Title).toBeVisible();
    // Validate ZIP code is NOT prefilled
    const zipValue = await pdp.bopisModal_SearchZipCode.inputValue();
    expect(zipValue).toBe('');
    console.log('ZIP code is NOT prefilled when Location permissions are not granted');
    // Close modal
    await pdp.bopisModal_CloseButton.click();
    // Validate pickup section still shows “Select a Store” CTA and message
    await expect(pdp.product_PickUpInStore_SelectStoreCTA).toBeVisible();
    console.log('Pickup section retains its state after closing modal with select a Store CTA');
    }
  });
  // Validate quantity exceeded toast
  test('Validate quantity exceeded toast', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 38.3044022, longitude: -77.5103001 }); // Simulates fredericksburg ZIP (22401)
    const pdp = new PDP(page);
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(8, 9).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating quantity exceeded toast for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.selectProductAttributes(page, pdpData);
      await pdp.validateBopisFlowOnStoreSelection();
      await pdp.product_ShipToMe.click();
      await pdp.productwoSale_QtyIncrease.click();
      await pdp.productwoSale_QtyIncrease.click();
      await pdp.product_PickUpInStore.click();
      await pdp.validateQuantityExceededToast();
      await pdp.product_ShipToMe.click();
      await expect(pdp.product_PickUpInStore_Description).toBeHidden();
    }
  });
  test.only('Validate Add The Essentials Section and Add To Cart flow', async ({ page }, testInfo) => {
    testInfo.setTimeout(240000);
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(10,11).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`Validating PDP Hero for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
  const pdp = new PDP(page);
  // await pdp.validateEssentialsSectionVisibleAndExpanded();
  // await pdp.validateEssentialsAllProductCards();
  await pdp.addFirstProductToCartAndValidateMiniCart();
    }
  });
  test('Validate Review Section', async ({ page }) => {
    const pdp = new PDP(page);
    const baseUrl = test.info().project.use.baseURL!;
    for (const [index, pdpData] of pdpTestData.slice(0,1).entries()) {
      const validatingUrl = new URL(pdpData.pdpUrl, baseUrl).toString();
      console.log(`(${index + 1}) Validating Review Section for: ${pdpData.productName} (${validatingUrl})`);
      await page.goto(validatingUrl);
      await pdp.validateReviewSection();
    }
  });
});
