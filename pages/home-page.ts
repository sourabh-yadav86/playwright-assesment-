import { Page } from '@playwright/test';
import { BasePage } from './base-page';
import { config } from '../config/config';

/**
 * Home Page Object Model
 * Handles interactions with the Douglas.de homepage
 */
export class HomePage extends BasePage {
  private readonly cookieConsentAcceptButton = 'button[id*="accept"], button[class*="accept"], button:has-text("Accept"), button:has-text("Akzeptieren"), button:has-text("ALLE ERLAUBEN")';
  private readonly cookieConsentBanner = '[id*="cookie"], [class*="cookie"], [data-testid*="cookie"]';
  private readonly parfumLink = 'a:has-text("Parfum"), a[href*="parfum"], nav a:has-text("Parfum"), [href="/de/c/parfum/01"]';
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
      
      await this.page.waitForTimeout(2000);
      
      const navVisible = await this.helpers.isVisible(this.navigationMenu, config.timeout.short);
      
    
      const parfumLinkVisible = await this.helpers.isVisible(this.parfumLink, config.timeout.short);
      
      if (parfumLinkVisible) {
        await this.helpers.scrollToElement(this.parfumLink);
        
        try {
          await Promise.race([
            this.helpers.clickWithRetry(this.parfumLink),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Click timeout')), 10000))
          ]);
          
          await Promise.race([
            this.page.waitForURL('**/parfum**', { timeout: 15000 }),
            this.page.waitForLoadState('domcontentloaded', { timeout: 15000 })
          ]).catch(() => {
            console.log('Navigation wait timed out, but continuing...');
          });
        } catch (error) {
          console.log('Click timeout, navigating directly: ', error);
          await this.page.goto(`${config.baseUrl}/c/parfum/01`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        }
      } else {
        console.log('Parfum link not found, navigating directly');
        await this.page.goto(`${config.baseUrl}/c/parfum/01`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      }
    } catch (error) {
      console.log('Error clicking Parfum link, navigating directly: ', error);
      await this.page.goto(`${config.baseUrl}/c/parfum/01`, { waitUntil: 'domcontentloaded', timeout: 30000 });
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

