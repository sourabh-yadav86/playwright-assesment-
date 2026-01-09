import { Page, expect } from '@playwright/test';
import { config } from '../config/config';

export class Helpers {
  constructor(private page: Page) {}

  async waitForElement(selector: string, timeout: number = config.timeout.medium): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async waitForElementHidden(selector: string, timeout: number = config.timeout.medium): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  async clickWithRetry(selector: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.click(selector, { timeout: config.timeout.short });
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async fillWithRetry(selector: string, value: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.fill(selector, value, { timeout: config.timeout.short });
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async getText(selector: string): Promise<string> {
    await this.waitForElement(selector);
    const element = this.page.locator(selector);
    return await element.textContent() || '';
  }

  async getAllTexts(selector: string): Promise<string[]> {
    await this.waitForElement(selector);
    const elements = this.page.locator(selector);
    const count = await elements.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await elements.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }

  async isVisible(selector: string, timeout: number = config.timeout.short): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async waitForPageLoad(): Promise<void> {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: config.timeout.medium });
      
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {
        console.log('Networkidle timeout in waitForPageLoad, but continuing...');
      }
    } catch (error) {
      console.log('Page load wait error: ', error);
    }
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: config.screenshots.fullPage,
    });
  }

  async waitForNavigation(): Promise<void> {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: config.timeout.medium });
      
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {
        console.log('Networkidle timeout in waitForNavigation, but continuing...');
      }
    } catch (error) {
      console.log('Navigation wait error: ', error);
    }
  }
}

