import { FullConfig } from '@playwright/test';
import * as os from 'node:os';

// This function will run before all tests
async function globalSetup(config: FullConfig) {

  console.log('Running global setup...');
  
  // This is where you can set the environment info for Allure
  const allure = require('@wdio/allure-reporter').default;

  allure.addLabel('executor', 'Playwright Executor');
  allure.addLabel('executorVersion', '1.0.0');
  allure.addLabel('description', 'Automated tests executed using Playwright');
  allure.addLabel('platform', os.platform());
  allure.addLabel('nodeVersion', process.version);
  allure.addLabel('cpuCores', os.cpus().length.toString());

  // You can also interact with the configuration and set other properties
  // For example, setting environment variables, or initializing any global setup
}

export default globalSetup;
