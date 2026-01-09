export const HomePageLocators = {
  cookieConsentAcceptButton: 'button[id*="accept"], button[class*="accept"], button:has-text("Accept"), button:has-text("Akzeptieren"), button:has-text("ALLE ERLAUBEN")',
  cookieConsentBanner: '[id*="cookie"], [class*="cookie"], [data-testid*="cookie"]',
  parfumLink: 'a:has-text("Parfum"), a[href*="parfum"], nav a:has-text("Parfum"), a[href*="/c/parfum"]',
  navigationMenu: 'nav, [role="navigation"], header nav, navigation, [class*="navigation"], [class*="menu"]',
  body: 'body',
} as const;

