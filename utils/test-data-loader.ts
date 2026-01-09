import * as fs from 'fs';
import * as path from 'path';

export class TestDataLoader {
  static loadTestData(filePath: string): any {
    try {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to load test data from ${filePath}: ${error}`);
    }
  }

  static getTestDataForTestCase(testCaseName: string, filePath: string): any {
    const testData = this.loadTestData(filePath);
    return testData[testCaseName] || testData;
  }

  static getFilterCriteria(filePath: string): string[] {
    const testData = this.loadTestData(filePath);
    return testData.filterCriteria || [];
  }
}

