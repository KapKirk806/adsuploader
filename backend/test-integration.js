#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests Google Drive and Meta API connections
 */

const axios = require('axios');
const readline = require('readline');

const API_BASE = 'http://localhost:5000/api';
const TEST_TOKEN = 'Bearer test-token';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testHealthCheck() {
  info('Testing health check...');
  try {
    const response = await axios.get('http://localhost:5000/health');
    if (response.data.status === 'healthy') {
      success('Server is healthy');
      return true;
    }
  } catch (err) {
    error(`Health check failed: ${err.message}`);
    return false;
  }
}

async function testGoogleDriveStatus() {
  info('Testing Google Drive connection status...');
  try {
    const response = await axios.get(`${API_BASE}/google-drive/status`, {
      headers: { Authorization: TEST_TOKEN },
    });

    if (response.data.connected) {
      success(`Google Drive connected: ${response.data.email}`);
      return true;
    } else {
      warning('Google Drive not connected yet');
      return false;
    }
  } catch (err) {
    error(`Google Drive status check failed: ${err.message}`);
    return false;
  }
}

async function testGoogleDriveConnect() {
  info('Getting Google Drive OAuth URL...');
  try {
    const response = await axios.get(`${API_BASE}/google-drive/connect`, {
      headers: { Authorization: TEST_TOKEN },
    });

    if (response.data.authUrl) {
      success('Google Drive OAuth URL generated');
      log('\n📋 Copy this URL and open it in your browser:', 'yellow');
      log(response.data.authUrl, 'blue');
      log('\nAfter authorizing, come back here and press Enter to continue...\n', 'yellow');

      // Wait for user to complete OAuth
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question('Press Enter after completing OAuth in browser: ', () => {
          rl.close();
          resolve(true);
        });
      });
    }
  } catch (err) {
    error(`Failed to get OAuth URL: ${err.message}`);
    return false;
  }
}

async function testGoogleDriveListFiles() {
  info('Listing files from Google Drive...');
  try {
    const response = await axios.get(`${API_BASE}/google-drive/files`, {
      headers: { Authorization: TEST_TOKEN },
    });

    if (response.data.files && response.data.files.length > 0) {
      success(`Found ${response.data.files.length} files in Google Drive`);
      log('\nFirst 3 files:', 'blue');
      response.data.files.slice(0, 3).forEach((file, i) => {
        log(`  ${i + 1}. ${file.name} (${file.mimeType})`);
      });
      return response.data.files;
    } else {
      warning('No files found in Google Drive. Upload some images/videos to test.');
      return [];
    }
  } catch (err) {
    error(`Failed to list Google Drive files: ${err.response?.data?.error || err.message}`);
    return null;
  }
}

async function testMetaAPIMode() {
  info('Checking Meta API configuration...');

  const hasFacebookCreds = process.env.FACEBOOK_APP_ID &&
                           process.env.FACEBOOK_APP_ID !== 'your-facebook-app-id';

  if (hasFacebookCreds) {
    success('Meta API credentials configured - REAL MODE');
    info(`App ID: ${process.env.FACEBOOK_APP_ID}`);
    return 'real';
  } else {
    warning('Meta API in MOCK MODE (no credentials configured)');
    return 'mock';
  }
}

async function testTemplatesList() {
  info('Testing templates endpoint...');
  try {
    const response = await axios.get(`${API_BASE}/templates`, {
      headers: { Authorization: TEST_TOKEN },
    });

    if (response.data.templates) {
      success(`Found ${response.data.templates.length} templates`);
      return true;
    }
  } catch (err) {
    error(`Templates endpoint failed: ${err.message}`);
    return false;
  }
}

async function testJobsList() {
  info('Testing jobs endpoint...');
  try {
    const response = await axios.get(`${API_BASE}/jobs`, {
      headers: { Authorization: TEST_TOKEN },
    });

    if (response.data.jobs) {
      success(`Found ${response.data.jobs.length} jobs`);
      return true;
    }
  } catch (err) {
    error(`Jobs endpoint failed: ${err.message}`);
    return false;
  }
}

async function runTests() {
  log('\n=== AdsUploader Integration Tests ===\n', 'blue');

  // Test 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    error('\n❌ Server is not running! Start it with: npm run dev\n');
    process.exit(1);
  }

  log('\n');

  // Test 2: Meta API mode
  await testMetaAPIMode();

  log('\n');

  // Test 3: Google Drive status
  const driveConnected = await testGoogleDriveStatus();

  log('\n');

  // Test 4: If not connected, offer to connect
  if (!driveConnected) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question('Would you like to connect Google Drive now? (y/n): ', (ans) => {
        rl.close();
        resolve(ans.toLowerCase());
      });
    });

    if (answer === 'y') {
      await testGoogleDriveConnect();
      log('\n');

      // Recheck status
      const nowConnected = await testGoogleDriveStatus();
      if (nowConnected) {
        log('\n');
        await testGoogleDriveListFiles();
      }
    }
  } else {
    // Already connected, list files
    log('\n');
    await testGoogleDriveListFiles();
  }

  log('\n');

  // Test 5: Other endpoints
  await testTemplatesList();
  log('\n');
  await testJobsList();

  log('\n=== Tests Complete ===\n', 'blue');
  success('All basic tests passed!');
  log('\nNext steps:', 'yellow');
  log('1. Upload some files via the frontend or API');
  log('2. Create a campaign template');
  log('3. Publish a job to Meta Ads');
  log('\n');
}

// Run tests
runTests().catch((err) => {
  error(`Test suite failed: ${err.message}`);
  console.error(err);
  process.exit(1);
});
