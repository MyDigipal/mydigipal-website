#!/usr/bin/env node
/**
 * IndexNow Submission Script for MyDigipal
 *
 * Usage:
 *   node scripts/indexnow.js                    # Submit all URLs from sitemap
 *   node scripts/indexnow.js --url <url>        # Submit a single URL
 *   node scripts/indexnow.js --file <file>      # Submit URLs from a file (one per line)
 *   node scripts/indexnow.js --dry-run          # Preview URLs without submitting
 *
 * IndexNow notifies: Bing, Yandex, Seznam, Naver
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  host: 'mydigipal.com',
  key: '69a67a739e033bbad818c0097069a97b',
  keyLocation: 'https://mydigipal.com/69a67a739e033bbad818c0097069a97b.txt',
  sitemapUrl: 'https://mydigipal.com/sitemap.xml',
  // IndexNow endpoints (they share data with each other)
  endpoints: [
    'https://api.indexnow.org/indexnow',
    // 'https://www.bing.com/indexnow',  // Alternative
    // 'https://yandex.com/indexnow',    // Alternative
  ],
  maxUrlsPerRequest: 10000, // IndexNow limit
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const singleUrlIndex = args.indexOf('--url');
const fileIndex = args.indexOf('--file');

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

  // Check if it's a sitemap index
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

  // Regular sitemap
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`   Found ${urls.length} URLs`);
  return urls;
}

async function submitToIndexNow(urls) {
  if (urls.length === 0) {
    console.log('❌ No URLs to submit');
    return;
  }

  if (urls.length > CONFIG.maxUrlsPerRequest) {
    console.log(`⚠️  Too many URLs (${urls.length}). Splitting into batches...`);
    const batches = [];
    for (let i = 0; i < urls.length; i += CONFIG.maxUrlsPerRequest) {
      batches.push(urls.slice(i, i + CONFIG.maxUrlsPerRequest));
    }
    for (let i = 0; i < batches.length; i++) {
      console.log(`\n📦 Batch ${i + 1}/${batches.length}`);
      await submitBatch(batches[i]);
    }
    return;
  }

  await submitBatch(urls);
}

async function submitBatch(urls) {
  const payload = JSON.stringify({
    host: CONFIG.host,
    key: CONFIG.key,
    keyLocation: CONFIG.keyLocation,
    urlList: urls,
  });

  console.log(`\n🚀 Submitting ${urls.length} URLs to IndexNow...`);

  for (const endpoint of CONFIG.endpoints) {
    try {
      const response = await postJson(endpoint, payload);
      console.log(`✅ ${endpoint}: ${response.statusCode} ${response.statusMessage}`);

      if (response.statusCode === 200 || response.statusCode === 202) {
        console.log('   URLs accepted for indexing');
      } else if (response.statusCode === 400) {
        console.log('   ❌ Bad request - check URL format');
      } else if (response.statusCode === 403) {
        console.log('   ❌ Key not valid - check key file is accessible');
      } else if (response.statusCode === 422) {
        console.log('   ❌ URLs don\'t match the host');
      } else if (response.statusCode === 429) {
        console.log('   ⚠️  Too many requests - try again later');
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║       IndexNow Submission Tool         ║');
  console.log('║           mydigipal.com                ║');
  console.log('╚════════════════════════════════════════╝\n');

  let urls = [];

  if (singleUrlIndex !== -1 && args[singleUrlIndex + 1]) {
    // Single URL mode
    urls = [args[singleUrlIndex + 1]];
    console.log('📌 Single URL mode');
  } else if (fileIndex !== -1 && args[fileIndex + 1]) {
    // File mode
    const fs = require('fs');
    const filePath = args[fileIndex + 1];
    console.log(`📄 Reading URLs from: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    urls = content.split('\n').map(u => u.trim()).filter(u => u && u.startsWith('http'));
  } else {
    // Sitemap mode (default)
    console.log('🗺️  Sitemap mode - fetching all URLs\n');
    urls = await getUrlsFromSitemap(CONFIG.sitemapUrl);
  }

  console.log(`\n📊 Total URLs: ${urls.length}`);

  if (isDryRun) {
    console.log('\n🔍 DRY RUN - URLs that would be submitted:');
    urls.slice(0, 20).forEach(url => console.log(`   ${url}`));
    if (urls.length > 20) {
      console.log(`   ... and ${urls.length - 20} more`);
    }
    return;
  }

  await submitToIndexNow(urls);

  console.log('\n✨ Done!');
  console.log('\n📝 Note: IndexNow shares submissions across Bing, Yandex, Seznam, and Naver.');
  console.log('   Google does not support IndexNow - use Google Search Console for Google indexing.');
}

main().catch(console.error);
