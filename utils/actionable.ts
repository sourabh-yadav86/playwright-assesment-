import { Page, Locator } from '@playwright/test';
import { config } from '../config/config';
import { logger } from './logger';

export class Actionable {
  constructor(private page: Page) {}

  async click(selector: string | Locator, options?: { timeout?: number; force?: boolean; maxRetries?: number }): Promise<void> {
    const maxRetries = options?.maxRetries ?? 3;
    const timeout = options?.timeout ?? config.timeout.short;
    const force = options?.force ?? false;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        
        if (force) {
          await locator.click({ timeout, force: true });
        } else {
          await locator.click({ timeout });
        }
        
        logger.debug(`Successfully clicked element: ${typeof selector === 'string' ? selector : 'locator'}`);
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          logger.error(`Failed to click element after ${maxRetries} attempts`, error);
          throw error;
        }
        
        logger.warn(`Click attempt ${i + 1} failed, retrying...`);
        try {
          const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
          await locator.waitFor({ state: 'visible', timeout: config.timeout.retryWait });
        } catch {
        }
      }
    }
  }

  async fill(selector: string | Locator, value: string, options?: { timeout?: number; maxRetries?: number }): Promise<void> {
    const maxRetries = options?.maxRetries ?? 3;
    const timeout = options?.timeout ?? config.timeout.short;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.fill(value, { timeout });
        logger.debug(`Successfully filled element with value: ${value.substring(0, 20)}...`);
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          logger.error(`Failed to fill element after ${maxRetries} attempts`, error);
          throw error;
        }
        
        logger.warn(`Fill attempt ${i + 1} failed, retrying...`);
        try {
          const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
          await locator.waitFor({ state: 'visible', timeout: config.timeout.retryWait });
        } catch {
        }
      }
    }
  }

  async type(selector: string | Locator, text: string, options?: { delay?: number; timeout?: number }): Promise<void> {
    const delay = options?.delay ?? 100;
    const timeout = options?.timeout ?? config.timeout.short;
    
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.type(text, { delay, timeout });
    logger.debug(`Successfully typed text into element`);
  }

  async clear(selector: string | Locator): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.clear();
    logger.debug(`Successfully cleared element`);
  }

  async selectOption(selector: string | Locator, value: string | number): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.selectOption(value);
    logger.debug(`Successfully selected option: ${value}`);
  }

  async check(selector: string | Locator): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.check();
    logger.debug(`Successfully checked element`);
  }

  async uncheck(selector: string | Locator): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.uncheck();
    logger.debug(`Successfully unchecked element`);
  }

  async hover(selector: string | Locator): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.hover();
    logger.debug(`Successfully hovered over element`);
  }

  async doubleClick(selector: string | Locator): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.dblclick();
    logger.debug(`Successfully double-clicked element`);
  }

  async rightClick(selector: string | Locator): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.click({ button: 'right' });
    logger.debug(`Successfully right-clicked element`);
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
    logger.debug(`Successfully pressed key: ${key}`);
  }

  async typeKeys(keys: string): Promise<void> {
    await this.page.keyboard.type(keys);
    logger.debug(`Successfully typed keys`);
  }

  async scrollIntoView(selector: string | Locator): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.scrollIntoViewIfNeeded();
    logger.debug(`Successfully scrolled element into view`);
  }

  async uploadFile(selector: string | Locator, filePath: string): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.setInputFiles(filePath);
    logger.debug(`Successfully uploaded file: ${filePath}`);
  }

  async dragAndDrop(sourceSelector: string | Locator, targetSelector: string | Locator): Promise<void> {
    const source = typeof sourceSelector === 'string' ? this.page.locator(sourceSelector) : sourceSelector;
    const target = typeof targetSelector === 'string' ? this.page.locator(targetSelector) : targetSelector;
    await source.dragTo(target);
    logger.debug(`Successfully dragged and dropped element`);
  }

  async getText(selector: string | Locator): Promise<string> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const text = await locator.textContent();
    return text?.trim() || '';
  }

  async getAllTexts(selector: string | Locator): Promise<string[]> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const count = await locator.count();
    const texts: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await locator.nth(i).textContent();
      if (text) texts.push(text.trim());
    }
    
    return texts;
  }

  async getAttribute(selector: string | Locator, attributeName: string): Promise<string | null> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await locator.getAttribute(attributeName);
  }

  async getCount(selector: string | Locator): Promise<number> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await locator.count();
  }

  async isVisible(selector: string | Locator, timeout: number = config.timeout.short): Promise<boolean> {
    try {
      const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isHidden(selector: string | Locator, timeout: number = config.timeout.short): Promise<boolean> {
    try {
      const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
      await locator.waitFor({ state: 'hidden', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isEnabled(selector: string | Locator): Promise<boolean> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return await locator.isEnabled();
  }

  async waitForVisible(selector: string | Locator, timeout: number = config.timeout.medium): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForHidden(selector: string | Locator, timeout: number = config.timeout.medium): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'hidden', timeout });
  }

  async waitForEnabled(selector: string | Locator, timeout: number = config.timeout.medium): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'attached', timeout });
    let attempts = 0;
    const maxAttempts = Math.floor(timeout / 100);
    
    while (attempts < maxAttempts) {
      if (await locator.isEnabled()) {
        return;
      }
      await this.page.waitForTimeout(100);
      attempts++;
    }
    
    throw new Error(`Element not enabled after ${timeout}ms`);
  }
}

