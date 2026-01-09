import { Page } from '@playwright/test';
import { Helpers } from '../utils/helpers';
import { config } from '../config/config';

export class BasePage {
  protected helpers: Helpers;
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new Helpers(page);
  }

  async navigateTo(url: string = config.baseUrl): Promise<void> {
    try {
      const currentUrl = this.page.url();
      if (currentUrl === url || currentUrl.includes(url.replace('https://', '').replace('http://', ''))) {
        const pageContent = await this.page.content();
        if (pageContent.includes('Access Denied') || pageContent.includes('access denied')) {
          throw new Error(`Access Denied on current page. URL: ${currentUrl}. The website is blocking automated access.`);
        }
        return;
      }

      await this.page.waitForTimeout(500);
      
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: config.timeout.veryLong,
        referer: 'https://www.google.com/',
      });
      
      await this.page.waitForTimeout(1000);
      
      const pageContent = await this.page.content();
      if (pageContent.includes('Access Denied') || pageContent.includes('access denied')) {
        const pageTitle = await this.page.title();
        throw new Error(
          `Access Denied: Website is blocking automated access.\n` +
          `URL: ${url}\n` +
          `Page Title: ${pageTitle}\n` +
          `This site appears to have bot protection. Consider:\n` +
          `1. Using a different approach (headless: false, slower execution)\n` +
          `2. Checking if the site requires specific headers or cookies\n` +
          `3. Contacting the site owner for automated testing permissions`
        );
      }
      
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch {
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access Denied')) {
        throw error;
      }
      
      console.log('Navigation with domcontentloaded failed, trying commit: ', error);
      await this.page.goto(url, { 
        waitUntil: 'commit',
        timeout: config.timeout.veryLong 
      });
      await this.page.waitForTimeout(3000);
      
      const pageContent = await this.page.content();
      if (pageContent.includes('Access Denied') || pageContent.includes('access denied')) {
        const pageTitle = await this.page.title();
        throw new Error(
          `Access Denied after retry: Website is blocking automated access.\n` +
          `URL: ${url}\n` +
          `Page Title: ${pageTitle}`
        );
      }
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

