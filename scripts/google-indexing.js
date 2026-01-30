#!/usr/bin/env node
/**
 * Google Search Console / Indexing API Script for MyDigipal
 *
 * MODES:
 *   1. List mode (default): Generate URL list from sitemap for manual submission
 *   2. API mode: Submit URLs via Google Indexing API (requires setup)
 *
 * Usage:
 *   node scripts/google-indexing.js                     # List all URLs from sitemap
 *   node scripts/google-indexing.js --output urls.txt   # Save URLs to file
 *   node scripts/google-indexing.js --api               # Submit via API (requires credentials)
 *   node scripts/google-indexing.js --api --url <url>   # Submit single URL via API
 *
 * API SETUP (for --api mode):
 *   1. Go to Google Cloud Console: https://console.cloud.google.com/
 *   2. Create a project or select existing one
 *   3. Enable "Indexing API": https://console.cloud.google.com/apis/library/indexing.googleapis.com
 *   4. Create Service Account: IAM & Admin > Service Accounts > Create
 *   5. Create JSON key: Service Account > Keys > Add Key > Create new key > JSON
 *   6. Save as: scripts/google-credentials.json
 *   7. Add service account email as Owner in Search Console:
 *      Search Console > Settings > Users and permissions > Add user
 *      (Use the service account email from the JSON file)
 *
 * RATE LIMITS:
 *   - Google Indexing API: 200 requests per day
 *   - For bulk submissions, use sitemap ping instead
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  sitemapUrl: 'https://mydigipal.com/sitemap.xml',
  credentialsPath: path.join(__dirname, 'google-credentials.json'),
  apiEndpoint: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
  batchEndpoint: 'https://indexing.googleapis.com/batch',
  dailyQuota: 200,
};

// Parse command line arguments
const args = process.argv.slice(2);
const isApiMode = args.includes('--api');
const outputIndex = args.indexOf('--output');
const urlIndex = args.indexOf('--url');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getUrlsFromSitemap(sitemapUrl) {
  console.log(`📥 Fetching sitemap: ${sitemapUrl}`);
  const xml = await fetchUrl(sitemapUrl);

  if (xml.includes('<sitemapindex')) {
    const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    console.log(`   Found ${sitemapUrls.length} sub-sitemaps`);

    let allUrls = [];
    for (const subSitemapUrl of sitemapUrls) {
      const subUrls = await getUrlsFromSitemap(subSitemapUrl);
      allUrls = allUrls.concat(subUrls);
    }
    return allUrls;
  }

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`   Found ${urls.length} URLs`);
  return urls;
}

async function getAccessToken() {
  if (!fs.existsSync(CONFIG.credentialsPath)) {
    throw new Error(`
❌ Credentials file not found: ${CONFIG.credentialsPath}

To use API mode, you need to set up Google Cloud credentials:
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Enable Indexing API
3. Create Service Account with JSON key
4. Save the JSON file as: scripts/google-credentials.json
5. Add the service account email as Owner in Google Search Console

For now, use list mode without --api flag to get URLs for manual submission.
`);
  }

  const credentials = JSON.parse(fs.readFileSync(CONFIG.credentialsPath, 'utf-8'));

  // Create JWT - requires 'jsonwebtoken' package: npm install jsonwebtoken
  let jwt;
  try {
    jwt = (await import('jsonwebtoken')).default;
  } catch (e) {
    throw new Error(`
❌ Package 'jsonwebtoken' not found.
   Run: npm install jsonwebtoken
`);
  }
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    credentials.private_key,
    { algorithm: 'RS256' }
  );

  // Exchange JWT for access token
  const response = await postForm('https://oauth2.googleapis.com/token', {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: token,
  });

  return JSON.parse(response).access_token;
}

function postForm(url, data) {
  return new Promise((resolve, reject) => {
    const formData = new URLSearchParams(data).toString();
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.write(formData);
    req.end();
  });
}

async function submitUrlToGoogle(url, accessToken, type = 'URL_UPDATED') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ url, type });

    const options = {
      hostname: 'indexing.googleapis.com',
      port: 443,
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function pingSitemap() {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(CONFIG.sitemapUrl)}`;
  console.log(`\n🔔 Pinging Google with sitemap...`);
  console.log(`   URL: ${pingUrl}`);

  try {
    await fetchUrl(pingUrl);
    console.log('   ✅ Sitemap ping successful!');
  } catch (error) {
    console.log(`   ❌ Ping failed: ${error.message}`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║    Google Search Console Indexing Tool     ║');
  console.log('║             mydigipal.com                  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Get URLs
  let urls = [];
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    urls = [args[urlIndex + 1]];
    console.log('📌 Single URL mode');
  } else {
    console.log('🗺️  Fetching URLs from sitemap...\n');
    urls = await getUrlsFromSitemap(CONFIG.sitemapUrl);
  }

  console.log(`\n📊 Total URLs: ${urls.length}`);

  if (isApiMode) {
    // API Mode
    console.log('\n🔐 API Mode - Submitting to Google Indexing API');
    console.log(`   ⚠️  Daily quota: ${CONFIG.dailyQuota} requests`);

    if (urls.length > CONFIG.dailyQuota) {
      console.log(`   ⚠️  You have ${urls.length} URLs but only ${CONFIG.dailyQuota} daily quota.`);
      console.log(`   Only the first ${CONFIG.dailyQuota} URLs will be submitted.`);
      urls = urls.slice(0, CONFIG.dailyQuota);
    }

    try {
      const accessToken = await getAccessToken();
      console.log('   ✅ Authentication successful\n');

      let success = 0;
      let failed = 0;

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        process.stdout.write(`   [${i + 1}/${urls.length}] ${url.substring(0, 60)}...`);

        try {
          const result = await submitUrlToGoogle(url, accessToken);
          if (result.statusCode === 200) {
            console.log(' ✅');
            success++;
          } else {
            console.log(` ❌ (${result.statusCode})`);
            failed++;
          }
        } catch (error) {
          console.log(` ❌ (${error.message})`);
          failed++;
        }

        // Rate limiting - 1 request per 100ms
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`\n📈 Results: ${success} succeeded, ${failed} failed`);
    } catch (error) {
      console.log(error.message);
    }
  } else {
    // List Mode (default)
    console.log('\n📋 List Mode - URLs for manual submission\n');

    if (outputIndex !== -1 && args[outputIndex + 1]) {
      const outputPath = args[outputIndex + 1];
      fs.writeFileSync(outputPath, urls.join('\n'));
      console.log(`✅ URLs saved to: ${outputPath}`);
      console.log(`   You can use this file for bulk submission in Search Console.`);
    } else {
      console.log('URLs to submit to Google Search Console:\n');
      console.log('─'.repeat(60));
      urls.forEach(url => console.log(url));
      console.log('─'.repeat(60));
      console.log(`\n💡 Tip: Use --output urls.txt to save to a file`);
    }

    // Always ping sitemap
    await pingSitemap();

    console.log('\n📝 Manual submission options:');
    console.log('   1. Search Console > URL Inspection > paste each URL');
    console.log('   2. Search Console > Sitemaps > Submit sitemap');
    console.log('   3. Use --api flag with credentials for automated submission');
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
