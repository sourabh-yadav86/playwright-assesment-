import { Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { config } from '../config/config';

/**
 * Base Page Object Model class
 * Contains common methods and properties shared across all page objects
 */
export class BasePage {
  protected helpers: Helpers;
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new Helpers(page);
  }

  async navigateTo(url: string = config.baseUrl): Promise<void> {
    try {
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: config.timeout.veryLong 
      });
      
      await this.page.waitForTimeout(2000);
      
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {
        console.log('Networkidle timeout, but page should be usable');
      }
    } catch (error) {
      console.log('Navigation with domcontentloaded failed, trying commit: ', error);
      await this.page.goto(url, { 
        waitUntil: 'commit',
        timeout: config.timeout.veryLong 
      });
      await this.page.waitForTimeout(3000);
    }
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForPageReady(): Promise<void> {
    await this.helpers.waitForPageLoad();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.helpers.takeScreenshot(name);
  }
}

