import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { config } from '../config/config';

export class ParfumPage extends BasePage {
  private readonly filterSection = '[class*="filter"], [data-testid*="filter"], aside, [role="complementary"]';
  private readonly filterCriteria = {
    sale: 'button:has-text("Sale"), [class*="sale"], [data-filter*="sale"]',
    neu: 'button:has-text("Neu"), [class*="new"], [data-filter*="new"], [data-filter*="neu"]',
    limitiert: 'button:has-text("Limitiert"), [class*="limited"], [data-filter*="limited"], [data-filter*="limitiert"]',
  };
  private readonly productList = 'a[href*="/de/p/"], [class*="product"], [data-testid*="product"], article, [class*="item"], [class*="tile"], [class*="card"]';
  private readonly productName = '[class*="product-name"], [class*="title"], h2, h3, generic:has-text("€")';
  private readonly productPrice = '[class*="price"], [class*="cost"], [data-testid*="price"], generic:has-text("€"):not(:has-text("/"))';
  private readonly applyFilterButton = 'button:has-text("Anwenden"), button:has-text("Apply"), button[type="submit"]';
  private readonly clearFiltersButton = 'button:has-text("Zurücksetzen"), button:has-text("Clear"), button[class*="clear"]';

  constructor(page: Page) {
    super(page);
  }

  async verifyParfumPageLoaded(): Promise<void> {
    try {
      const pageContent = await this.page.content();
      if (pageContent.includes('Access Denied') || pageContent.includes('access denied')) {
        console.log('Access Denied page detected in verifyParfumPageLoaded');
        throw new Error('Access Denied: Website is blocking automated access');
      }
      
      await this.page.waitForLoadState('domcontentloaded');
      
      const productSelectors = [
        'a[href*="/de/p/"]',
        'a[href*="/p/"]',
        '[class*="product"]',
        'article',
        '[class*="tile"]',
        '[class*="card"]'
      ];
      
      let productsFound = false;
      for (const selector of productSelectors) {
        try {
          await this.page.waitForSelector(selector, { 
            timeout: config.timeout.short,
            state: 'visible' 
          });
          productsFound = true;
          console.log(`Products found using selector: ${selector}`);
          break;
        } catch {
          continue;
        }
      }
      
      if (!productsFound) {
        await this.page.waitForTimeout(1000);
        
        for (const selector of productSelectors) {
          const elements = this.page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            productsFound = true;
            console.log(`Products found after wait using selector: ${selector}`);
            break;
          }
        }
      }
      
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch {
      }
      
      if (!productsFound) {
        console.log('Warning: No products found during page verification, but continuing...');
      }
    } catch (error) {
      console.log('Parfum page verification: ', error);
    }
  }

  async applyFilter(criteria: string): Promise<void> {
    try {
      await this.helpers.waitForElement(this.filterSection, config.timeout.medium);

      let filterSelector = '';
      const criteriaLower = criteria.toLowerCase();
      
      if (criteriaLower.includes('sale')) {
        filterSelector = this.filterCriteria.sale;
      } else if (criteriaLower.includes('neu') || criteriaLower.includes('new')) {
        filterSelector = this.filterCriteria.neu;
      } else if (criteriaLower.includes('limitiert') || criteriaLower.includes('limited')) {
        filterSelector = this.filterCriteria.limitiert;
      }

      if (filterSelector) {
        await this.helpers.scrollToElement(this.filterSection);
        
        const filterVisible = await this.helpers.isVisible(filterSelector, config.timeout.short);
        if (filterVisible) {
          await this.helpers.clickWithRetry(filterSelector);
          
          await this.page.waitForTimeout(1000);
          
          const applyButtonVisible = await this.helpers.isVisible(this.applyFilterButton, config.timeout.short);
          if (applyButtonVisible) {
            await this.helpers.clickWithRetry(this.applyFilterButton);
          }
          
          await this.page.waitForTimeout(1000);
        }
      }
    } catch (error) {
      console.log(`Error applying filter ${criteria}:`, error);
    }
  }

  async getProductList(): Promise<Array<{ name: string; price: string }>> {
    const productsVisible = await this.helpers.isVisible(this.productList, config.timeout.short);
    if (!productsVisible) {
      await this.page.waitForTimeout(1000);
    }
    
    const products: Array<{ name: string; price: string }> = [];
    
    const selectors = [
      'a[href*="/de/p/"]',
      '[class*="product"]',
      '[data-testid*="product"]',
      'article',
      '[class*="tile"]',
      '[class*="card"]'
    ];
    
    let productElements = null;
    for (const selector of selectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        productElements = elements;
        break;
      }
    }
    
    if (!productElements) {
      console.log('No products found with any selector');
      return products;
    }
    
    const productCount = await productElements.count();

    for (let i = 0; i < Math.min(productCount, 20); i++) {
      try {
        const productElement = productElements.nth(i);
        
        let name = '';
        const linkText = await productElement.textContent();
        if (linkText) {
          const textParts = linkText.split('€');
          if (textParts.length > 0) {
            name = textParts[0].trim();
          }
        }
        
        if (!name) {
          const nameElement = productElement.locator(this.productName).first();
          if (await nameElement.count() > 0) {
            name = (await nameElement.textContent())?.trim() || '';
          }
        }

        let price = '';
        const allText = await productElement.textContent();
        if (allText) {
          const priceMatch = allText.match(/\d+[.,]\d+\s*€/);
          if (priceMatch) {
            price = priceMatch[0].trim();
          }
        }
        
        if (!price) {
          const priceElement = productElement.locator(this.productPrice).first();
          if (await priceElement.count() > 0) {
            price = (await priceElement.textContent())?.trim() || '';
          }
        }

        if (name || price) {
          products.push({ name: name || 'Unknown', price: price || 'N/A' });
        }
      } catch (error) {
        console.log(`Error extracting product ${i}:`, error);
      }
    }

    return products;
  }

  async getProductCount(): Promise<number> {
    await this.page.waitForTimeout(1000);
    
    const selectors = [
      'a[href*="/de/p/"]',
      'a[href*="/p/"]',
      '[class*="product"]',
      '[data-testid*="product"]',
      'article',
      '[class*="tile"]',
      '[class*="card"]',
      '[class*="item"]',
      '[data-product-id]',
      '[itemtype*="Product"]',
    ];
    
    for (const selector of selectors) {
      try {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`Found ${count} products using selector: ${selector}`);
          return count;
        }
      } catch (error) {
        continue;
      }
    }
    
    try {
      const allLinks = this.page.locator('a[href*="/p/"]');
      const linkCount = await allLinks.count();
      if (linkCount > 0) {
        console.log(`Found ${linkCount} potential product links`);
        return linkCount;
      }
    } catch (error) {
      console.log('Error checking for product links:', error);
    }
    
    console.log('No products found with any selector');
    return 0;
  }

  async clearFilters(): Promise<void> {
    try {
      const clearButtonVisible = await this.helpers.isVisible(this.clearFiltersButton, config.timeout.short);
      if (clearButtonVisible) {
        await this.helpers.clickWithRetry(this.clearFiltersButton);
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('Error clearing filters:', error);
    }
  }

  async listProductsByFilter(criteria: string): Promise<Array<{ name: string; price: string }>> {
    await this.applyFilter(criteria);
    return await this.getProductList();
  }
}

