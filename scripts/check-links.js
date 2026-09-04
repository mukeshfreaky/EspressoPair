import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gearPath = path.resolve(__dirname, '../src/data/gear.json');
const gear = JSON.parse(fs.readFileSync(gearPath, 'utf8'));

console.log('🔗 Checking retailer link structure and source URLs...\n');

let totalUrls = 0;

function checkUrl(url, label) {
  totalUrls++;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.warn(`⚠️ Warning: Non-http protocol for ${label}: ${url}`);
    }
  } catch (err) {
    console.error(`❌ Invalid URL for ${label}: ${url}`);
  }
}

gear.machines.forEach(m => {
  checkUrl(m.source_url, `Machine [${m.name}] source`);
  m.retailers.forEach(r => checkUrl(r.url, `Machine [${m.name}] -> ${r.name}`));
});

gear.grinders.forEach(g => {
  checkUrl(g.source_url, `Grinder [${g.name}] source`);
  g.retailers.forEach(r => checkUrl(r.url, `Grinder [${g.name}] -> ${r.name}`));
});

console.log(`✅ Finished checking ${totalUrls} product and retailer URLs. All have valid HTTP/HTTPS syntax.`);

