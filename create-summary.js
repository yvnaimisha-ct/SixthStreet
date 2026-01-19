const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { WebClient } = require('@slack/web-api');

//const { argv } = require('process');
const argv = yargs(process.argv.slice(2)).argv;

const SLACK_TOKEN = process.env.SLACK_TOKEN; // Add your Slack token here or via .env file
const CHANNEL_ID = process.env.SLACK_CHANNEL; // Add your Slack channel ID
console.log(`Generating summary for platform: ${argv.platform}`);
const reportDir = path.resolve(__dirname, './playwright/reports', 'widgets');
console.log('reportDir:',reportDir);
const suitesFile = path.join(reportDir, 'suites.json');
const categoriesFile = path.join(reportDir, 'categories.json');
const summaryFile = path.join(reportDir, 'summary.json');
console.log('slack-token:',SLACK_TOKEN);
console.log('Channel id:',CHANNEL_ID);
// GitHub-specific environment variables
const repo = process.env.GITHUB_REPOSITORY; // "owner/repo"
const runId = process.env.GITHUB_RUN_ID; // Workflow run ID
const workflowUrl = `https://github.com/${repo}/actions/runs/${runId}`;
if (!fs.existsSync(suitesFile) || !fs.existsSync(categoriesFile)) {
  console.error('Required Allure report files are missing. Ensure the report is generated.');
  process.exit(1);
}
const summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
const totalTests = summaryData.statistic.total;
const passedTests = summaryData.statistic.passed;
const failedTests = summaryData.statistic.failed;
const brokenTests = summaryData.statistic.broken;
const skippedTests = summaryData.statistic.skipped;
const startTime = new Date(summaryData.time.start);
const endTime = new Date(summaryData.time.stop);
// Format the date to a human-readable string
const startTimeParsed = startTime.toLocaleString("en-US", {
  weekday: "long",     // e.g., "Monday"
  year: "numeric",     // e.g., "2023"
  month: "long",       // e.g., "January"
  day: "numeric",      // e.g., "2"
  hour: "2-digit",     // e.g., "03"
  minute: "2-digit",   // e.g., "05"
  second: "2-digit",   // e.g., "45"
  hour12: true         // Use 12-hour time (true) or 24-hour time (false)
});
const stopTimeParsed = endTime.toLocaleString("en-US", {
  weekday: "long",     // e.g., "Monday"
  year: "numeric",     // e.g., "2023"
  month: "long",       // e.g., "January"
  day: "numeric",      // e.g., "2"
  hour: "2-digit",     // e.g., "03"
  minute: "2-digit",   // e.g., "05"
  second: "2-digit",   // e.g., "45"
  hour12: true         // Use 12-hour time (true) or 24-hour time (false)
});
var duration=formatTimestampToTime(summaryData.time.duration);
function convertToHHMMSS(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  const pad = (num) => String(num).padStart(2, '0'); // Pad numbers with leading zero
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
function formatTimestampToTime(timestamp) {
  // Convert the timestamp to seconds
  const totalSeconds = Math.floor(timestamp / 1000);
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  // Format with leading zeros if needed
  const formattedTime = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
  ].join(':');
  return formattedTime;
}
if (!SLACK_TOKEN || !CHANNEL_ID) {
  console.error('Slack token or channel ID is missing!');
  //process.exit(1);
}
const slackClient = new WebClient(SLACK_TOKEN);
const sendSlackMessage = async (message) => {
  try {
    await slackClient.chat.postMessage({
      channel: CHANNEL_ID,
      text: emailBody,
    });
    console.log('Message sent to Slack!');
  } catch (error) {
    console.error('Error sending Slack message:', error);
  }
};
const emailBody = `
Hello,
The automation test run for SixthStreet is complete. Here's the summary:
- Platform: ${argv.platform}
- Total Tests: ${totalTests}
- ✅ Passed: ${passedTests}
- ❌ Failed: ${failedTests}
- 💔 Broken : ${brokenTests}
- ⚠️ Skipped: ${skippedTests}
- Start Time: ${startTimeParsed}
- Stop Time: ${stopTimeParsed}
- Duration: ${duration}  
Full execution report of this run is also available. You can view it at:
https://codeandtheory.github.io/SixthStreet-automation/${argv.platform}
You can debug this run using the following workflow link:
${workflowUrl}
Best regards,  
Automation Team
`;
sendSlackMessage(emailBody);
fs.writeFileSync('email-body.txt', emailBody);
console.log('Email body created successfully.');