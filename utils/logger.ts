import { Page } from '@playwright/test';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private testInfo: any = null;
  private page: Page | null = null;

  setTestInfo(testInfo: any): void {
    this.testInfo = testInfo;
  }

  setPage(page: Page): void {
    this.page = page;
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, error?: Error | unknown, ...args: any[]): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.log(LogLevel.ERROR, message, errorMessage, ...args);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    const fullMessage = args.length > 0 ? `${logMessage} ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')}` : logMessage;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(fullMessage);
        break;
      case LogLevel.INFO:
        console.info(fullMessage);
        break;
      case LogLevel.WARN:
        console.warn(fullMessage);
        break;
      case LogLevel.ERROR:
        console.error(fullMessage);
        break;
    }
  }

  logProducts(products: Array<{ name: string; price: string }>, filter?: string): void {
    const header = filter 
      ? `Products filtered by "${filter}":`
      : `Total products displayed: ${products.length}`;
    
    this.info(header);
    
    products.forEach((product, index) => {
      this.info(`${index + 1}. ${product.name} - ${product.price}`);
    });
  }
}

export const logger = new Logger();

