# Locator Best Practices

## ✅ Using CSS Selectors (Not XPath)

This project uses **CSS selectors exclusively** - no XPath selectors are used. CSS selectors are:
- **Faster** - Better performance than XPath
- **More readable** - Easier to understand and maintain
- **More stable** - Less brittle than XPath

## ✅ Relative Selectors Only

All selectors use **relative paths** - no absolute paths:

### ❌ Avoid Absolute Paths:
```typescript
// BAD - Absolute path
'[href="/de/c/parfum/01"]'
'a[href="/de/p/123"]'
```

### ✅ Use Relative/Partial Matches:
```typescript
// GOOD - Relative with partial match
'a[href*="parfum"]'
'a[href*="/p/"]'
'a[href*="/c/parfum"]'
```

## ✅ Best Practices Applied

1. **Partial Matches (`*=`)**: Use `[attribute*="value"]` for flexible matching
2. **Text-based Selectors**: Use `:has-text()` for text content matching
3. **Semantic Selectors**: Use HTML5 elements like `article`, `nav`, `aside`
4. **Multiple Fallbacks**: Provide multiple selector options for robustness
5. **Attribute Selectors**: Use `[class*="value"]`, `[id*="value"]`, `[data-testid*="value"]`

## Example Patterns

```typescript
// ✅ Good - Relative, flexible, multiple fallbacks
parfumLink: 'a:has-text("Parfum"), a[href*="parfum"], nav a:has-text("Parfum")'

// ✅ Good - Partial match, semantic element
productList: 'a[href*="/p/"], [class*="product"], article'

// ✅ Good - Text-based with fallbacks
filterButton: 'button:has-text("Sale"), [class*="sale"], [data-filter*="sale"]'
```

## Why Avoid Absolute XPath?

1. **Brittle**: Breaks easily when DOM structure changes
2. **Slow**: XPath is slower than CSS selectors
3. **Hard to maintain**: Complex XPath expressions are difficult to read
4. **Absolute paths**: XPath often uses absolute paths like `/html/body/div[1]/...`

## Current Status

✅ **No XPath selectors** in the codebase
✅ **No absolute paths** in href attributes
✅ **All selectors are relative** and flexible
✅ **Multiple fallback selectors** for robustness

