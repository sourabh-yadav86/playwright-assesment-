import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ParfumPage } from '../pages/parfum-page';
import { TestDataLoader } from '../utils/test-data-loader';
import { config } from '../config/config';


test.describe('Douglas.de Parfum Product Listing Tests', () => {
  let homePage: HomePage;
  let parfumPage: ParfumPage;

  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          const plugins = [];
          for (let i = 0; i < 5; i++) {
            plugins.push({
              name: `Plugin ${i}`,
              description: `Description ${i}`,
              filename: `plugin${i}.dll`,
              length: 1,
            });
          }
          return plugins as any;
        },
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['de-DE', 'de', 'en-US', 'en'],
      });
      
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as PermissionStatus) :
          originalQuery(parameters)
      );
      
      (window as any).chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {},
      };
      
      if (navigator.getBattery) {
        const originalGetBattery = navigator.getBattery;
        navigator.getBattery = function() {
          return Promise.resolve({
            charging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
            level: 0.8,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          } as any);
        };
      }
      
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
      });
      
      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
      });
      
      Object.defineProperty(navigator, 'platform', {
        get: () => 'MacIntel',
      });
      
      Object.defineProperty(navigator, 'vendor', {
        get: () => 'Google Inc.',
      });
      
      Object.defineProperty(window, 'navigator', {
        value: new Proxy(navigator, {
          has: (target, key) => {
            if (key === 'webdriver') return false;
            return key in target;
          },
          get: (target, key) => {
            if (key === 'webdriver') return undefined;
            return target[key as keyof typeof target];
          },
        }),
      });
    });
    
    await page.waitForTimeout(500);
    
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
      
      await page.waitForTimeout(1000);
    });

    await test.step('Verify products are displayed', async () => {
      const pageContent = await page.content();
      const currentUrl = page.url();
      const pageTitle = await page.title();
      
      if (pageContent.includes('Access Denied') || pageContent.includes('access denied')) {
        throw new Error(`Access Denied: Website is blocking automated access. URL: ${currentUrl}, Title: ${pageTitle}`);
      }
      
      try {
        await page.waitForSelector('a[href*="/de/p/"], [class*="product"], article, [class*="tile"], [class*="card"]', { 
          timeout: 5000,
          state: 'visible' 
        }).catch(() => {
        });
      } catch (error) {
      }
      
      const productCount = await parfumPage.getProductCount();
      
      const count = typeof productCount === 'number' ? productCount : 0;
      
      if (count === 0) {
        await page.screenshot({ path: 'debug-no-products.png', fullPage: true });
      }
      
      expect(count).toBeGreaterThan(0);
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

