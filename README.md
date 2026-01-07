# Playwright Test Automation Framework for Douglas.de

A comprehensive test automation framework built with Playwright, implementing Page Object Model (POM), data-driven testing, and comprehensive reporting.

## Framework Features

✅ **Page Object Model (POM)** - Clean separation of test logic and UI elements  
✅ **Reporting** - HTML Reports and Allure Reports  
✅ **Reusable Methods** - Common functionalities implemented as reusable utilities  
✅ **External Test Data Management** - Test data stored in JSON files  
✅ **No Hardcoded Values** - All configuration managed through config files  
✅ **Parameterized Methods** - Data-driven tests with parameterization  

## Project Structure

```
playwright/
├── config/
│   └── config.ts              # Centralized configuration (no hardcoded values)
├── data/
│   └── test-data.json         # External test data (JSON format)
├── pages/
│   ├── base-page.ts           # Base Page Object Model class
│   ├── home-page.ts           # HomePage POM
│   └── parfum-page.ts         # ParfumPage POM
├── utils/
│   ├── helpers.ts             # Reusable helper methods
│   └── test-data-loader.ts    # Test data loading utility
├── tests/
│   └── douglas-parfum.spec.ts # Data-driven test cases
├── playwright.config.ts        # Playwright configuration
├── package.json               # Project dependencies
└── tsconfig.json             # TypeScript configuration
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. (Optional) Install Allure commandline tool for Allure reports:
```bash
# macOS
brew install allure

# Or download from https://github.com/allure-framework/allure2/releases
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in headed mode (see browser):
```bash
npm run test:headed
```

### Run tests on specific browsers:
```bash
npm run test:chrome      # Chromium
npm run test:firefox     # Firefox
npm run test:webkit      # WebKit/Safari
npm run test:all-browsers # All browsers
```

### Run tests in debug mode:
```bash
npm run test:debug
```

## Test Case Implementation

The framework implements the following test scenario:

1. **Navigate to:** `https://www.douglas.de/de`
2. **Handle:** Cookie consent banner
3. **Click on:** "Parfum" navigation link
4. **List:** Products based on filter criteria (Sale, Neu, Limitiert)

### Data-Driven Test Criteria

The test is parameterized with the following filter criteria (from `data/test-data.json`):
- **Sale**
- **Neu**
- **Limitiert**

Each criteria runs as a separate test case, demonstrating data-driven testing.

## How It Works - Step-by-Step Execution Flow

### Test Execution Flow

Here's a detailed breakdown of how each step is executed when running the tests:

#### **1. Test Initialization**
```
┌─────────────────────────────────────┐
│ Test Suite Starts                   │
│ - Loads test data from JSON         │
│ - Initializes Page Objects          │
│ - Sets up browser context           │
└─────────────────────────────────────┘
```

**What happens:**
- `TestDataLoader.getFilterCriteria()` reads `data/test-data.json` and extracts filter criteria: `["Sale", "Neu", "Limitiert"]`
- For each criteria, a separate test case is dynamically created
- `beforeEach` hook initializes `HomePage` and `ParfumPage` objects
- Playwright creates a new browser page instance

#### **2. Step 1: Navigate to Douglas.de**
```typescript
await test.step(`Navigate to ${config.baseUrl}`, async () => {
  await homePage.navigateToHomePage();
  await homePage.verifyHomePageLoaded();
});
```

**Detailed execution:**
1. **`homePage.navigateToHomePage()`** calls:
   - `BasePage.navigateTo(config.baseUrl)` → navigates to `https://www.douglas.de/de`
   - Waits for `networkidle` state (all network requests complete)
   - `Helpers.waitForPageLoad()` ensures page is fully loaded

2. **`homePage.verifyHomePageLoaded()`**:
   - Waits for navigation menu selector: `nav, [role="navigation"], header nav`
   - Uses `config.timeout.long` (30 seconds) timeout
   - Verifies homepage is ready for interaction

#### **3. Step 2: Handle Cookie Consent**
```typescript
await test.step('Handle cookie consent', async () => {
  await homePage.handleCookieConsent();
});
```

**Detailed execution:**
1. **Check for cookie banner**:
   - `Helpers.isVisible()` checks for cookie banner using selector: `[id*="cookie"], [class*="cookie"], [data-testid*="cookie"]`
   - Uses `config.timeout.short` (5 seconds) - non-blocking if not found

2. **If banner is visible**:
   - Searches for accept button: `button[id*="accept"], button[class*="accept"], button:has-text("Akzeptieren"), button:has-text("ALLE ERLAUBEN")`
   - `Helpers.clickWithRetry()` clicks with 3 retry attempts
   - Waits for banner to disappear using `waitForElementHidden()`

3. **If accept button not found**:
   - Presses `Escape` key as fallback
   - Continues execution even if cookie handling fails (graceful degradation)

#### **4. Step 3: Click on Parfum Link**
```typescript
await test.step('Click on Parfum link', async () => {
  await homePage.clickParfum();
  await parfumPage.verifyParfumPageLoaded();
});
```

**Detailed execution:**
1. **`homePage.clickParfum()`**:
   - Waits for navigation menu to be visible (`config.timeout.medium` = 15 seconds)
   - Searches for Parfum link: `a:has-text("Parfum"), a[href*="parfum"], nav a:has-text("Parfum")`
   - Scrolls to element using `scrollIntoViewIfNeeded()`
   - Clicks with retry mechanism (3 attempts)
   - Waits for navigation: `domcontentloaded` → `networkidle`

2. **Fallback strategy**:
   - If link not found, directly navigates to `${config.baseUrl}/parfum`

3. **`parfumPage.verifyParfumPageLoaded()`**:
   - Waits for product list selector: `[class*="product"], [data-testid*="product"], article`
   - Verifies Parfum page is loaded and ready

#### **5. Step 4: List Products by Filter**
```typescript
await test.step(`List products filtered by "${criteria}"`, async () => {
  const products = await parfumPage.listProductsByFilter(criteria);
  // ... validations
});
```

**Detailed execution:**

**A. Apply Filter (`parfumPage.applyFilter(criteria)`):**
1. **Wait for filter section**:
   - Waits for: `[class*="filter"], [data-testid*="filter"], aside, [role="complementary"]`
   - Uses `config.timeout.medium` (15 seconds)

2. **Map criteria to selector**:
   - `"Sale"` → `button:has-text("Sale"), [class*="sale"], [data-filter*="sale"]`
   - `"Neu"` → `button:has-text("Neu"), [class*="new"], [data-filter*="new"]`
   - `"Limitiert"` → `button:has-text("Limitiert"), [class*="limited"], [data-filter*="limited"]`

3. **Apply filter**:
   - Scrolls to filter section
   - Checks if filter button is visible
   - Clicks filter button with retry
   - Waits 2 seconds for filter to apply
   - Checks for "Apply" button (`button:has-text("Anwenden")`) and clicks if present
   - Waits 3 seconds for products to reload

**B. Get Product List (`parfumPage.getProductList()`):**
1. **Wait for products**:
   - Waits for product list selector to be visible
   - Uses `config.timeout.medium` (15 seconds)

2. **Extract product data**:
   - Locates all product elements (limited to first 20)
   - For each product:
     - Extracts name from: `[class*="product-name"], [class*="title"], h2, h3`
     - Extracts price from: `[class*="price"], [class*="cost"], [data-testid*="price"]`
     - Creates object: `{ name: string, price: string }`
   - Returns array of product objects

**C. Validations:**
1. **Product count check**: `expect(products.length).toBeGreaterThan(0)`
2. **Product details check**: Each product must have name OR price
3. **Logging**: Products are logged to console for reporting
4. **Screenshot**: Takes screenshot with name `products-{criteria}`

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Test Execution Flow                                         │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Load Test Data        │
        │ (Sale, Neu, Limitiert)│
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Initialize Page       │
        │ Objects (beforeEach)  │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│ Test: Sale    │      │ Test: Neu     │  ... (for each criteria)
└───────┬───────┘      └───────┬───────┘
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
        ┌───────────────────────┐
        │ Step 1: Navigate      │
        │ to Douglas.de         │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Step 2: Handle        │
        │ Cookie Consent        │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Step 3: Click         │
        │ Parfum Link           │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Step 4: Apply Filter  │
        │ & List Products       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Validate & Report     │
        │ (Screenshot, Log)     │
        └───────────────────────┘
```

### Key Components Interaction

**Page Object Model Hierarchy:**
```
BasePage (common methods)
  ├── HomePage (homepage interactions)
  └── ParfumPage (product listing interactions)
```

**Helper Methods Used:**
- `waitForElement()` - Waits for element visibility
- `clickWithRetry()` - Clicks with 3 retry attempts
- `isVisible()` - Non-blocking visibility check
- `scrollToElement()` - Scrolls element into view
- `waitForNavigation()` - Waits for page navigation
- `waitForPageLoad()` - Waits for network idle

**Error Handling Strategy:**
- Try-catch blocks prevent test failures on non-critical operations
- Retry mechanisms handle flaky elements
- Fallback strategies (direct navigation, Escape key)
- Graceful degradation (continues if cookie handling fails)

**Data Flow:**
```
test-data.json → TestDataLoader → Test Cases → Page Objects → Helpers → Browser
```

## Reporting

### HTML Report (Playwright)
After test execution, view the HTML report:
```bash
npm run report
```

### Allure Report
Generate and view Allure report:
```bash
# Generate report
npm run allure:generate

# Open report
npm run allure:open

# Or serve directly
npm run allure:serve
```

## Best Practices Implemented

1. **Page Object Model (POM)**
   - Separation of concerns: UI elements and actions in page objects
   - Base page class for common functionality
   - Easy maintenance and reusability

2. **No Hardcoded Values**
   - All URLs, timeouts, and configurations in `config/config.ts`
   - Environment variables support
   - Easy to modify without touching test code

3. **Reusable Methods**
   - Helper class with common operations (click, fill, wait, etc.)
   - Retry mechanisms for flaky elements
   - Consistent error handling

4. **External Test Data**
   - Test data in JSON format (`data/test-data.json`)
   - Easy to update test data without code changes
   - Support for multiple test scenarios

5. **Parameterized Tests**
   - Data-driven approach using test data loader
   - Single test method handles multiple scenarios
   - Easy to add new test cases

6. **Comprehensive Reporting**
   - HTML reports with screenshots and videos
   - Allure reports for detailed test analytics
   - Console logging for debugging

7. **Error Handling**
   - Try-catch blocks for resilient tests
   - Retry mechanisms for flaky operations
   - Graceful degradation

8. **Code Organization**
   - Clear folder structure
   - TypeScript for type safety
   - Consistent naming conventions

## Code Optimizations

1. **Smart Selectors**: Multiple selector strategies for robustness
2. **Retry Logic**: Built-in retry mechanisms for flaky elements
3. **Wait Strategies**: Appropriate wait conditions (visible, hidden, networkidle)
4. **Parallel Execution**: Tests can run in parallel (configurable)
5. **Screenshot on Failure**: Automatic screenshots for failed tests
6. **Video Recording**: Videos retained only on failure

## Configuration

### Environment Variables
You can override default configuration using environment variables:
```bash
BASE_URL=https://www.douglas.de/de npm test
```

### Modify Test Data
Edit `data/test-data.json` to add/remove filter criteria or modify test data.

## Troubleshooting

### Tests fail with timeout errors
- Increase timeout values in `config/config.ts`
- Check network connectivity
- Verify selectors are still valid

### Cookie consent not handled
- The framework tries multiple strategies to handle cookies
- If cookies persist, check browser console for errors
- Selectors may need updating if website structure changes

### Products not listed
- Verify filter selectors match current website structure
- Check if website requires authentication
- Review network requests in browser DevTools

## Future Enhancements

- [ ] Add support for CSV/Excel test data
- [ ] Implement API testing capabilities
- [ ] Add visual regression testing
- [ ] Integrate with CI/CD pipelines
- [ ] Add more page objects for other sections
- [ ] Implement test data generators

## License

ISC

