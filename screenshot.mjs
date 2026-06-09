import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.URL || 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'desktop',  width: 1440, height: 900  },
  { name: 'tablet',   width: 768,  height: 1024 },
  { name: 'mobile',   width: 390,  height: 844  },
];

async function run() {
  await mkdir(join(__dirname, 'brand_assets'), { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30_000 });
    // Allow animations to settle
    await new Promise(r => setTimeout(r, 1200));
    const out = join(__dirname, 'brand_assets', `screenshot-${vp.name}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log(`  ✓ ${vp.name.padEnd(8)} → ${out}`);
  }

  await browser.close();
  console.log('\nAlle Screenshots gespeichert.\n');
}

run().catch(err => { console.error(err); process.exit(1); });
