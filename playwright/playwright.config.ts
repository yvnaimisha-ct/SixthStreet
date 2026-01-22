import { defineConfig, devices } from '@playwright/test';
import * as os from "node:os"; // Import OS module to retrieve system information
import dotenv from 'dotenv';

let configs: any = {};
dotenv.config();

try {
  if (process.env.CONFIG_FILE) {
    //configs = JSON.parse(process.env.CONFIG_FILE);
    configs = require("../configs/playwrightConfig.json");
  } else {
    configs = require("../configs/playwrightConfig.json");
  }
} catch (err) {
  console.warn("Invalid CONFIG_FILE or parsing failed. Falling back to default config.");
  configs = require("../configs/playwrightConfig.json");
  console.error("Error loading config:", err);
}

// dotenv.config();


// Get environment variables
const env = process.env.ENV || 'stage'; // Default to stage since that's what exists in config
const runMode = process.env.RUN_MODE || 'local';
let platform: 'WEB' | 'API' = 'WEB';
// Get the project configuration from environment variables
const projectConfig = process.env.PROJECT;

// Retrieve environment-specific configurations
const config = configs[env] || { timeout: 30000 };
if (!config) {
  throw new Error(`No configuration found for environment: ${env}`);
}

// Default directories
let testDir = './specs';
let reportOutputDir = './playwright/reports/web/allure-results'; // Default report directory for web tests

// Determine headless mode
const isHeadless = process.env.HEADLESS === 'true' ? true : configs.headless;

// Logging
console.log(`Using configuration for environment: ${env}`);
console.log("TIMEOUT FROM CONFIG FILE: ", configs[env].timeout);
console.log("PROJECT CONFIG: ", projectConfig);
console.log("PROJECT CONFIG: ", projectConfig);

// Array to hold the selected Playwright project configuration
var projects: any = [] = [];

// if (isMobileMode) console.log("SELECTED MOBILE DEVICE FOR EMULATION: ", selectedDevice);
// Apply Playwright's predefined device configuration if mobile mode is enabled
// const deviceConfig = isMobileMode && devices[selectedDevice] ? devices[selectedDevice] : {};
// Assign appropriate browser-specific project configurations based on `PROJECT` environment variable
if (projectConfig === 'chrome') {
  projects = configs.testChrome.map((project: { use: any; }) => ({
    ...project,
    use: {
      ...project.use,
      viewport: project.use?.viewport || { width: 1500, height: 960 }
    }
  }));
} else if (projectConfig === 'firefox') {
  projects = configs.testFirefox;
} else if (projectConfig === 'webkit') {
  projects = configs.testSafari;
} else if (projectConfig === 'edge') {
  projects = configs.testEdge;
} else if (projectConfig === 'all') {
  projects = configs.testAllBrowsers;
} else if (projectConfig === 'api') {
  // If testing APIs, set the test directory and allure report path for API tests
  platform="API";
//   projects = configs.testApi;
  testDir = "./specs/apis/";
  // Set API report directory
  reportOutputDir = './playwright/reports/api/allure-results';
// } else {
//   // Default to Chromium if no specific browser is provided
//   projects = [
//     {
//       name: 'chromium',
//       use: { browserName: 'chromium' },
//     }
//   ];
}
const reportTitle="Automation Report for "+platform;
// Function to determine the correct Allure results folder dynamically
const getAllureResultsFolder = () => {
  return projectConfig === 'api' ? './playwright/reports/api/allure-results' : './playwright/reports/web/allure-results';
};
// API configuration (for API testing scenarios)
export const apiConfig = {
  baseURL: config.backendHostingUrl,
  authToken: config.apiKey || 'sample' // Use apiKey from config if available
};
// User credentials configuration (useful for login-based tests)
export const user = {
  username: config.userName,
  password: config.password,
};
console.log("PROJECT CONFIG VALUE: ", projects);
console.log("Report Dir: ", reportOutputDir);
if(runMode === 'BROWSERSTACK'){
  const updatedArray= projects.map((project :{use:any})=> ({
    // Add the new field to the 'details' object
      ...project,
      use: {
        ...project.use,
        connectOptions: {
            wsEndpoint: `wss://ondemand.us-west-1.saucelabs.com/playwright?username=${process.env.SAUCE_USERNAME}&accessKey=${process.env.SAUCE_ACCESS_KEY}`,
          } // Adding the new field to the child object
      }
    }));
    projects=updatedArray;
    console.log("PROJECT BEFORE MAP "+JSON.stringify(projects));
    //projects=mapToBrowserStackSettings(projects);
    //console.log("BS PROJECT "+projects);
}
// Define Playwright's global configuration
export default defineConfig({
  // Specify the directory containing test files
  // testDir: testDir, 
  testDir: './specs',
  // Global test timeout (in milliseconds)await page.getByRole('button', { name: 'Close' }).click();
  timeout: config.timeout,
  // Number of times a test will be retried before failing (set to 0 for no retries)
  retries:0,
  // Set the number of parallel workers based on `playwrightConfig.json`
  workers: 4,//configs.workers,
  // Configure the test report format (Allure Report)
  reporter: [
    ['allure-playwright', {
      resultsDir: getAllureResultsFolder(), // Dynamically determine results folder
      detail: false, // Disable detailed reporting for a cleaner report
      suiteTitle: true, // Enable suite titles for better report organization
      environmentInfo: {
        "Automation Platform": platform, // Test execution environment (e.g., dev, qa, prod)
        "Test Environment": env,
        os_platform: os.platform(), // OS name (Windows/Linux/macOS)
        os_release: os.release(), // OS version
        os_version: os.version(), // OS detailed version
        node_version: process.version, // Node.js version used for execution
        architecture: os.arch(), // System architecture (x64, arm, etc.)
        hostname: os.hostname(), // Machine hostname
      },
      executor: {
        name: 'Test Executor', // Name of the executor (useful for CI/CD identification)
        type: 'local', // Execution type (e.g., local, CI, containerized)
        url: 'https://your-ci-system.com', // CI/CD system URL (for linking reports)
      },
    }],
  ],
  // Playwright `use` configurations (shared settings for all tests)
  use: {
    ignoreHTTPSErrors: true,
    baseURL: config.baseURL || 'https://sixthstreet.com/', // Set base URL dynamically
    // baseURL: 'https://sixthstreet.com/', // Set base URL dynamically
    headless: isHeadless, // Run tests in headless mode if enabled
    // ...deviceConfig,  // Apply mobile device emulation settings if applicable
    screenshot: 'only-on-failure', // Capture screenshots only on test failures
    video: 'retain-on-failure', // Record videos for failed test cases
  },
  // Global teardown file (executed after all tests complete)
  globalTeardown: '../configs/allure-teardown.ts',
  // Uncomment and use if a global setup script is needed before test execution
  // globalSetup: './playwright/utilities/global-setup',
  // Define the projects (browsers/devices) to run tests on
  projects: projects
});