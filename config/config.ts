export const config = {
  baseUrl: process.env.BASE_URL || 'https://www.douglas.de/de',
  timeout: {
    short: 5000,
    medium: 15000,
    long: 30000,
    veryLong: 60000,
  },
  browsers: {
    chromium: 'chromium',
    firefox: 'firefox',
    webkit: 'webkit',
  },
  testDataPath: './data/test-data.json',
  screenshots: {
    onFailure: true,
    fullPage: true,
  },
};

