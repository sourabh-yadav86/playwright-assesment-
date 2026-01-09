export const ParfumPageLocators = {
  filterSection: '[class*="filter"], [data-testid*="filter"], aside, [role="complementary"]',
  
  filterCriteria: {
    sale: 'button:has-text("Sale"), [class*="sale"], [data-filter*="sale"]',
    neu: 'button:has-text("Neu"), [class*="new"], [data-filter*="new"], [data-filter*="neu"]',
    limitiert: 'button:has-text("Limitiert"), [class*="limited"], [data-filter*="limited"], [data-filter*="limitiert"]',
  },
  
  productList: 'a[href*="/p/"], [class*="product"], [data-testid*="product"], article, [class*="item"], [class*="tile"], [class*="card"]',
  
  productSelectors: [
    'a[href*="/p/"]',
    '[class*="product"]',
    '[data-testid*="product"]',
    'article',
    '[class*="tile"]',
    '[class*="card"]',
  ],
  
  productName: '[class*="product-name"], [class*="title"], h2, h3, generic:has-text("€")',
  productPrice: '[class*="price"], [class*="cost"], [data-testid*="price"], generic:has-text("€"):not(:has-text("/"))',
  
  applyFilterButton: 'button:has-text("Anwenden"), button:has-text("Apply"), button[type="submit"]',
  clearFiltersButton: 'button:has-text("Zurücksetzen"), button:has-text("Clear"), button[class*="clear"]',
} as const;

