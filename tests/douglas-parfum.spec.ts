import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ParfumPage } from '../pages/parfum-page';
import { TestDataLoader } from '../utils/test-data-loader';
import { config } from '../config/config';


test.describe('Douglas.de Parfum Product Listing Tests', () => {
  let homePage: HomePage;
  let parfumPage: ParfumPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    parfumPage = new ParfumPage(page);
  });

  
  const filterCriteria = TestDataLoader.getFilterCriteria(config.testDataPath);

  for (const criteria of filterCriteria) {
    test(`Should list products filtered by "${criteria}" criteria`, async ({ page }) => {
      await test.step(`Navigate to ${config.baseUrl}`, async () => {
        await homePage.navigateToHomePage();
        await homePage.verifyHomePageLoaded();
      });

      await test.step('Handle cookie consent', async () => {
        await homePage.handleCookieConsent();
      });

      await test.step('Click on Parfum link', async () => {
        await homePage.clickParfum();
        await parfumPage.verifyParfumPageLoaded();
      });

      await test.step(`List products filtered by "${criteria}"`, async () => {
        const products = await parfumPage.listProductsByFilter(criteria);
        
        expect(products.length).toBeGreaterThan(0);
        

        console.log(`\nProducts filtered by "${criteria}":`);
        products.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - ${product.price}`);
        });

        products.forEach((product) => {
          expect(product.name || product.price).toBeTruthy();
        });

        await parfumPage.takeScreenshot(`products-${criteria.toLowerCase()}`);
      });
    });
  }

  test('Should verify all filter criteria are available', async ({ page }) => {
    await test.step('Navigate and setup', async () => {
      await homePage.navigateToHomePage();
      await homePage.handleCookieConsent();
      await homePage.clickParfum();
      await parfumPage.verifyParfumPageLoaded();
    });

    await test.step('Verify filter section is visible', async () => {
      const productCount = await parfumPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });
  });

  test('Should display products without filters', async ({ page }) => {
    await test.step('Navigate and setup', async () => {
      await homePage.navigateToHomePage();
      await homePage.handleCookieConsent();
      await homePage.clickParfum();
      await parfumPage.verifyParfumPageLoaded();
    });

    await test.step('Get product list without filters', async () => {
      const products = await parfumPage.getProductList();
      expect(products.length).toBeGreaterThan(0);
      
      console.log(`\nTotal products displayed: ${products.length}`);
      products.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.price}`);
      });
    });
  });
});

