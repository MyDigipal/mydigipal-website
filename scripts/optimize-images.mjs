/**
 * Image Optimization Script
 * Compresses large images in public/images folder
 * Run with: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, rename } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '../public/images');
const BACKUP_DIR = join(__dirname, '../public/images/_originals');

// Size threshold in bytes (200KB)
const SIZE_THRESHOLD = 200 * 1024;

// Supported formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

// Quality settings
const QUALITY = {
  jpeg: 80,
  webp: 80,
  png: 80,
  avif: 65,
};

// Max dimensions
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

async function getAllImages(dir) {
  const images = [];

  async function scan(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip backup folder
        if (entry.name === '_originals') continue;
        await scan(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          const stats = await stat(fullPath);
          if (stats.size > SIZE_THRESHOLD) {
            images.push({
              path: fullPath,
              size: stats.size,
              ext,
            });
          }
        }
      }
    }
  }

  await scan(dir);
  return images;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function optimizeImage(imagePath) {
  const ext = extname(imagePath).toLowerCase();
  const relativePath = imagePath.replace(PUBLIC_DIR, '');
  const backupPath = join(BACKUP_DIR, relativePath);

  try {
    // Create backup directory
    await mkdir(dirname(backupPath), { recursive: true });

    // Move original to backup
    await rename(imagePath, backupPath);

    // Read and optimize
    let pipeline = sharp(backupPath);

    // Get metadata
    const metadata = await pipeline.metadata();

    // Resize if too large
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Output based on format
    if (ext === '.png') {
      // Convert PNG to WebP for better compression
      const webpPath = imagePath.replace('.png', '.webp');
      await pipeline.webp({ quality: QUALITY.webp }).toFile(webpPath);

      // Also save optimized PNG for fallback
      await sharp(backupPath)
        .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: QUALITY.png, compressionLevel: 9 })
        .toFile(imagePath);

      const newStats = await stat(imagePath);
      const webpStats = await stat(webpPath);
      return {
        originalPath: imagePath,
        newSize: newStats.size,
        webpPath,
        webpSize: webpStats.size,
      };
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline
        .jpeg({ quality: QUALITY.jpeg, mozjpeg: true })
        .toFile(imagePath);

      const newStats = await stat(imagePath);
      return { originalPath: imagePath, newSize: newStats.size };
    } else if (ext === '.webp') {
      await pipeline
        .webp({ quality: QUALITY.webp })
        .toFile(imagePath);

      const newStats = await stat(imagePath);
      return { originalPath: imagePath, newSize: newStats.size };
    }
  } catch (error) {
    console.error(`Error optimizing ${imagePath}:`, error.message);
    // Restore from backup on error
    try {
      await rename(backupPath, imagePath);
    } catch (e) {
      // Backup restore failed
    }
    return null;
  }
}

async function main() {
  console.log('Scanning for large images...\n');

  const images = await getAllImages(PUBLIC_DIR);

  if (images.length === 0) {
    console.log('No images over 200KB found. Nothing to optimize.');
    return;
  }

  console.log(`Found ${images.length} images over 200KB:\n`);

  // Sort by size descending
  images.sort((a, b) => b.size - a.size);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const image of images) {
    const relativePath = image.path.replace(PUBLIC_DIR, '');
    console.log(`Optimizing: ${relativePath} (${formatBytes(image.size)})`);

    const result = await optimizeImage(image.path);

    if (result) {
      totalOriginal += image.size;
      totalOptimized += result.newSize;

      const saved = image.size - result.newSize;
      const percent = ((saved / image.size) * 100).toFixed(1);

      console.log(`  -> ${formatBytes(result.newSize)} (saved ${formatBytes(saved)}, ${percent}%)`);

      if (result.webpPath) {
        console.log(`  -> WebP: ${formatBytes(result.webpSize)}`);
      }
    }

    console.log('');
  }

  console.log('='.repeat(50));
  console.log(`Total original: ${formatBytes(totalOriginal)}`);
  console.log(`Total optimized: ${formatBytes(totalOptimized)}`);
  console.log(`Total saved: ${formatBytes(totalOriginal - totalOptimized)} (${((1 - totalOptimized/totalOriginal) * 100).toFixed(1)}%)`);
  console.log('\nOriginal files backed up to: public/images/_originals/');
}

main().catch(console.error);
