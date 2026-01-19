import { execSync } from 'child_process';
const path = require('path');
import fs from 'fs';
const projectConfig = process.env.PROJECT;
// Replace with your folder path
const fileName = 'environment.properties';
// :white_check_mark: Use the same output folder as in `playwright.config.ts`
const resultsDir = projectConfig === 'api'
  ? './playwright/reports/api/allure-results'
  : './playwright/reports/web/allure-results';
const reportDir = projectConfig === 'api'
  ? './playwright/reports/api/allure-report'
  : './playwright/reports/web/allure-report';
const reportName = projectConfig === 'api' ? 'Backend Automation Report' : 'Web Automation Report'
const executorName = projectConfig === 'api' ? 'SixthStreet-api-pipeline' : 'SixthStreet-web-pipeline'
// :white_check_mark: Step 1: Read JSON file
if (process.env.BUILD_BUILDID !== undefined) {
  createExecuterJsonFile(executorName);
}
export default async function globalTeardown() {
  console.log(`:loudspeaker: Generating Allure Report from ${resultsDir}... Open it using: allure open ${reportDir}`);
  try {
    execSync(`allure generate ${resultsDir} --clean --output ${reportDir}`, { stdio: 'inherit' });
    const platformReport = path.resolve(__dirname, '..', reportDir, 'widgets')
    const summaryFile = path.join(platformReport, 'summary.json');
    const summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
    summaryData.reportName = reportName;
    // :white_check_mark: Step 3: Write back the modified JSON
    fs.writeFileSync(summaryFile, JSON.stringify(summaryData, null, 2));
    console.log(`:white_check_mark: Allure Report generated successfully! Open it using: allure open ${reportDir}`);
  } catch (error) {
    console.error(':x: Failed to generate Allure Report:', error);
  }
}
function createExecuterJsonFile(buildName: string) {
  const pipelineUrl = process.env.SYSTEM_COLLECTIONURI
    ? `https://${process.env.SYSTEM_COLLECTIONURI.split('/')[2]}/${process.env.SYSTEM_TEAMPROJECT}/_build/results?buildId=${process.env.BUILD_BUILDID}`
    : '';
  const allureResultPath = path.resolve(__dirname, '..', resultsDir)
  const json = {
    "name": "Azure Devops pipeline",
    "type": "ci",
    "url": pipelineUrl,
    "buildName": buildName,
    "buildUrl": pipelineUrl
  }
  const executorFile = path.join(allureResultPath, 'executor.json');
  fs.writeFileSync(executorFile, JSON.stringify(json, null, 2));
}
function customizeAllureReport() {
  const allureHtmlPath = path.resolve(reportDir, 'index.html');
  let allHtmlContent = fs.readFileSync(allureHtmlPath, 'utf-8');
  // 1. Change the report title in the <title> tag
  allHtmlContent = allHtmlContent.replace(/<title>Allure<\/title>/, `<title>${reportName}</title>`);
  // 2. Change the logo in the Allure report
  const logoPath = path.resolve(__dirname, './custom_logo.png'); // Path to your custom logo
  const logoBase64 = fs.readFileSync(logoPath, 'base64');
  allHtmlContent = allHtmlContent.replace(
    /<img src=".*" alt="Allure" class="allure-logo">/,
    `<img src="data:image/png;base64,${logoBase64}" alt="Custom Logo" class="allure-logo">`
  );
  // 3. Change the "Allure" title in the main header
  allHtmlContent = allHtmlContent.replace(
    /<h1>Allure<\/h1>/,
    `<h1>${reportName}</h1>`
  );
  // 4. Modify the left-hand sidebar title if needed (e.g., "Overview")
  allHtmlContent = allHtmlContent.replace(
    /<h3>Overview<\/h3>/,
    `<h3>${reportName} Overview</h3>`
  );
  // 5. Add a new custom section in the left sidebar
  const sidebarSection = `
    <section class="sidebar-item">
      <h4>Project Details</h4>
      <ul>
        <li><a href="#">Project Info</a></li>
        <li><a href="#">Test Summary</a></li>
      </ul>
    </section>
  `;
  // Insert the new sidebar section into the left sidebar (replace the placeholder `#sidebar`)
  allHtmlContent = allHtmlContent.replace(
    /<div class="sidebar">/,
    `<div class="sidebar">
      ${sidebarSection}`
  );
  // 6. Write the modified HTML back to the file
  fs.writeFileSync(allureHtmlPath, allHtmlContent);
}