/**
 * Generates PNG PWA icons and splash screens from SVG sources.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');
const splashDir = join(publicDir, 'splash');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const APPLE_SPLASH_SIZES = [
  { width: 1170, height: 2532, name: 'apple-splash-1170x2532.png' },
  { width: 1284, height: 2778, name: 'apple-splash-1284x2778.png' },
  { width: 750, height: 1334, name: 'apple-splash-750x1334.png' },
  { width: 2048, height: 2732, name: 'apple-splash-2048x2732.png' },
];

async function renderSvg(svgPath, width, height) {
  const svg = await readFile(svgPath);
  return sharp(svg, { density: Math.max(72, Math.ceil(Math.max(width, height) / 512 * 72)) })
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png();
}

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });
  const standardSvg = join(iconsDir, 'icon.svg');
  const maskableSvg = join(iconsDir, 'icon-maskable.svg');

  for (const size of ICON_SIZES) {
    const out = join(iconsDir, `icon-${size}.png`);
    await (await renderSvg(standardSvg, size, size)).toFile(out);
    console.log(`Wrote ${out}`);
  }

  const maskableOut = join(iconsDir, 'icon-maskable-512.png');
  await (await renderSvg(maskableSvg, 512, 512)).toFile(maskableOut);
  console.log(`Wrote ${maskableOut}`);

  // Favicon
  await (await renderSvg(standardSvg, 32, 32)).toFile(join(publicDir, 'favicon-32.png'));
  await (await renderSvg(standardSvg, 16, 16)).toFile(join(publicDir, 'favicon-16.png'));
}

async function generateSplashes() {
  await mkdir(splashDir, { recursive: true });
  const splashSvg = join(splashDir, 'splash.svg');

  for (const { width, height, name } of APPLE_SPLASH_SIZES) {
    const svg = await readFile(splashSvg);
    const out = join(splashDir, name);
    await sharp(svg, { density: 144 })
      .resize(width, height, { fit: 'cover', background: '#FAFAFA' })
      .png()
      .toFile(out);
    console.log(`Wrote ${out}`);
  }

  await (await renderSvg(join(iconsDir, 'icon.svg'), 512, 512)).toFile(join(splashDir, 'splash-512.png'));
}

await generateIcons();
await generateSplashes();
console.log('PWA assets generated.');
