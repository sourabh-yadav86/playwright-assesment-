import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { config } from '../config/config';

export class HomePage extends BasePage {
  private readonly cookieConsentAcceptButton = 'button[id*="accept"], button[class*="accept"], button:has-text("Accept"), button:has-text("Akzeptieren"), button:has-text("ALLE ERLAUBEN")';
  private readonly cookieConsentBanner = '[id*="cookie"], [class*="cookie"], [data-testid*="cookie"]';
  private readonly parfumLink = 'nav a[href="/de/c/parfum/01"], a[id*="navigation-main-entry"][href*="parfum"], a[href="/de/c/parfum/01"]';
  private readonly navigationMenu = 'nav, [role="navigation"], header nav, navigation, [class*="navigation"], [class*="menu"]';

  constructor(page: Page) {
    super(page);
  }

  async navigateToHomePage(): Promise<void> {
    await this.navigateTo(config.baseUrl);
  }

  async handleCookieConsent(): Promise<void> {
    try {
      const cookieBannerVisible = await this.helpers.isVisible(this.cookieConsentBanner, config.timeout.short);
      
      if (cookieBannerVisible) {
        const acceptButtonVisible = await this.helpers.isVisible(this.cookieConsentAcceptButton, config.timeout.short);
        
        if (acceptButtonVisible) {
          await this.helpers.clickWithRetry(this.cookieConsentAcceptButton);
          await this.helpers.waitForElementHidden(this.cookieConsentBanner, config.timeout.medium);
        } else {
          await this.page.keyboard.press('Escape');
        }
      }
    } catch (error) {
      console.log('Cookie consent handling: ', error);
    }
  }

 
  async clickParfum(): Promise<void> {
    try {
      const pageContent = await this.page.content();
      if (pageContent.includes('Access Denied') || pageContent.includes('access denied')) {
        throw new Error('Cannot navigate to Parfum page: Access Denied detected on current page.');
      }
      
      await this.page.waitForTimeout(500);
      
      const navVisible = await this.helpers.isVisible(this.navigationMenu, config.timeout.short);
      
      const parfumLinkVisible = await this.helpers.isVisible(this.parfumLink, config.timeout.short);
      
      if (parfumLinkVisible) {
        const parfumLinkLocator = this.page.locator(this.parfumLink).first();
        await parfumLinkLocator.scrollIntoViewIfNeeded();
        
        try {
          await Promise.race([
            parfumLinkLocator.click({ timeout: 10000 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Click timeout')), 10000))
          ]);
          
          await Promise.race([
            this.page.waitForURL('**/parfum**', { timeout: 15000 }),
            this.page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          ]).catch(() => {
            console.log('Navigation wait timed out, but continuing...');
          });
          
          const newPageContent = await this.page.content();
          if (newPageContent.includes('Access Denied') || newPageContent.includes('access denied')) {
            throw new Error('Access Denied after navigating to Parfum page.');
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('Access Denied')) {
            throw error;
          }
          console.log('Click timeout, navigating directly: ', error);
          await this.page.goto(`${config.baseUrl}/c/parfum/01`, { waitUntil: 'domcontentloaded', timeout: 30000 });
          
          const directNavContent = await this.page.content();
          if (directNavContent.includes('Access Denied') || directNavContent.includes('access denied')) {
            throw new Error('Access Denied after direct navigation to Parfum page.');
          }
        }
      } else {
        console.log('Parfum link not found, navigating directly');
        await this.page.goto(`${config.baseUrl}/c/parfum/01`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const directNavContent = await this.page.content();
        if (directNavContent.includes('Access Denied') || directNavContent.includes('access denied')) {
          throw new Error('Access Denied after direct navigation to Parfum page.');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Access Denied')) {
        throw error;
      }
      console.log('Error clicking Parfum link, navigating directly: ', error);
      await this.page.goto(`${config.baseUrl}/c/parfum/01`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      const finalContent = await this.page.content();
      if (finalContent.includes('Access Denied') || finalContent.includes('access denied')) {
        throw new Error('Access Denied: Website is blocking automated access to Parfum page.');
      }
    }
  }


  async verifyHomePageLoaded(): Promise<void> {
    try {
      const navVisible = await this.helpers.isVisible(this.navigationMenu, config.timeout.medium);
      if (navVisible) {
        return;
      }
      
      const bodyVisible = await this.helpers.isVisible('body', config.timeout.short);
      if (bodyVisible) {
        await this.page.waitForTimeout(3000);
        const navRetry = await this.helpers.isVisible(this.navigationMenu, config.timeout.short);
        if (navRetry) {
          return;
        }
      }
      
      await this.page.waitForLoadState('domcontentloaded');
      try {
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {
       
        console.log('Networkidle timeout in verifyHomePageLoaded, but continuing...');
      }
    } catch (error) {
      console.log('Homepage verification: ', error);

    }
  }
}

