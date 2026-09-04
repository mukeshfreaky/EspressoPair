import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gearPath = path.resolve(__dirname, '../src/data/gear.json');

console.log('🔍 Validating EspressoPair Gear Database...\n');

if (!fs.existsSync(gearPath)) {
  console.error(`❌ Gear file not found at: ${gearPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(gearPath, 'utf8');
let gear;

try {
  gear = JSON.parse(rawData);
} catch (err) {
  console.error('❌ Failed to parse gear.json as valid JSON:', err.message);
  process.exit(1);
}

const errors = [];
const seenIds = new Set();

function validateUrl(url, context) {
  if (!url || typeof url !== 'string') {
    errors.push(`${context}: Missing or invalid URL.`);
    return;
  }
  try {
    new URL(url);
  } catch {
    errors.push(`${context}: Malformed URL: "${url}"`);
  }
}

function validateDate(dateStr, context) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    errors.push(`${context}: Invalid ISO date format (expected YYYY-MM-DD): "${dateStr}"`);
  }
}

// 1. Validate Machines
if (!Array.isArray(gear.machines) || gear.machines.length === 0) {
  errors.push('gear.json must contain a non-empty "machines" array.');
} else {
  console.log(`📦 Found ${gear.machines.length} espresso machines.`);
  
  gear.machines.forEach((m, idx) => {
    const ctx = `Machine [${m.id || idx}]`;

    if (!m.id || typeof m.id !== 'string') errors.push(`${ctx}: Missing or invalid 'id'.`);
    if (seenIds.has(m.id)) errors.push(`${ctx}: Duplicate ID detected: '${m.id}'.`);
    seenIds.add(m.id);

    if (!m.name) errors.push(`${ctx}: Missing 'name'.`);
    if (!m.brand) errors.push(`${ctx}: Missing 'brand'.`);
    if (typeof m.price !== 'number' || m.price <= 0) errors.push(`${ctx}: Price must be a positive number.`);
    if (!m.boiler_type) errors.push(`${ctx}: Missing 'boiler_type'.`);
    if (typeof m.warmup_minutes !== 'number') errors.push(`${ctx}: Missing 'warmup_minutes'.`);
    if (typeof m.has_pid !== 'boolean') errors.push(`${ctx}: 'has_pid' must be a boolean.`);
    if (typeof m.opv_pressure_bar !== 'number' || m.opv_pressure_bar <= 0) errors.push(`${ctx}: 'opv_pressure_bar' must be positive.`);
    if (!m.steam_capability) errors.push(`${ctx}: Missing 'steam_capability'.`);
    if (!m.portafilter_size_mm) errors.push(`${ctx}: Missing 'portafilter_size_mm'.`);

    // Editorial checks
    if (!Array.isArray(m.pros) || m.pros.length === 0) errors.push(`${ctx}: Must have at least one pro in 'pros'.`);
    if (!Array.isArray(m.cons) || m.cons.length === 0) errors.push(`${ctx}: Must have at least one con in 'cons'.`);
    if (!Array.isArray(m.best_for) || m.best_for.length === 0) errors.push(`${ctx}: Must have at least one entry in 'best_for'.`);
    if (!m.my_take || m.my_take.trim().length < 30) errors.push(`${ctx}: 'my_take' must be a thoughtful paragraph (>= 30 chars).`);

    // Source & verification checks
    validateUrl(m.source_url, `${ctx} source_url`);
    validateDate(m.last_verified, `${ctx} last_verified`);
    if (!['verified', 'needs_review'].includes(m.verification_status)) {
      errors.push(`${ctx}: Invalid verification_status: '${m.verification_status}'.`);
    }

    // Retailer links
    if (!Array.isArray(m.retailers) || m.retailers.length === 0) {
      errors.push(`${ctx}: Must have at least one retailer link.`);
    } else {
      m.retailers.forEach((r, rIdx) => {
        validateUrl(r.url, `${ctx} Retailer [${r.name || rIdx}] URL`);
      });
    }
  });
}

// 2. Validate Grinders
if (!Array.isArray(gear.grinders) || gear.grinders.length === 0) {
  errors.push('gear.json must contain a non-empty "grinders" array.');
} else {
  console.log(`📦 Found ${gear.grinders.length} espresso grinders.`);
  
  gear.grinders.forEach((g, idx) => {
    const ctx = `Grinder [${g.id || idx}]`;

    if (!g.id || typeof g.id !== 'string') errors.push(`${ctx}: Missing or invalid 'id'.`);
    if (seenIds.has(g.id)) errors.push(`${ctx}: Duplicate ID detected across catalog: '${g.id}'.`);
    seenIds.add(g.id);

    if (!g.name) errors.push(`${ctx}: Missing 'name'.`);
    if (!g.brand) errors.push(`${ctx}: Missing 'brand'.`);
    if (typeof g.price !== 'number' || g.price <= 0) errors.push(`${ctx}: Price must be a positive number.`);
    if (!g.type) errors.push(`${ctx}: Missing 'type'.`);
    if (!['flat', 'conical'].includes(g.burr_type)) errors.push(`${ctx}: 'burr_type' must be 'flat' or 'conical'.`);
    if (typeof g.burr_size_mm !== 'number' || g.burr_size_mm <= 0) errors.push(`${ctx}: 'burr_size_mm' must be positive.`);
    if (typeof g.is_stepless !== 'boolean') errors.push(`${ctx}: 'is_stepless' must be a boolean.`);

    // Editorial checks
    if (!Array.isArray(g.pros) || g.pros.length === 0) errors.push(`${ctx}: Must have at least one pro in 'pros'.`);
    if (!Array.isArray(g.cons) || g.cons.length === 0) errors.push(`${ctx}: Must have at least one con in 'cons'.`);
    if (!g.my_take || g.my_take.trim().length < 30) errors.push(`${ctx}: 'my_take' must be a thoughtful paragraph (>= 30 chars).`);

    // Source & verification checks
    validateUrl(g.source_url, `${ctx} source_url`);
    validateDate(g.last_verified, `${ctx} last_verified`);
    if (!['verified', 'needs_review'].includes(g.verification_status)) {
      errors.push(`${ctx}: Invalid verification_status: '${g.verification_status}'.`);
    }

    // Retailer links
    if (!Array.isArray(g.retailers) || g.retailers.length === 0) {
      errors.push(`${ctx}: Must have at least one retailer link.`);
    } else {
      g.retailers.forEach((r, rIdx) => {
        validateUrl(r.url, `${ctx} Retailer [${r.name || rIdx}] URL`);
      });
    }
  });
}

// Summary
if (errors.length > 0) {
  console.error(`\n❌ Validation failed with ${errors.length} error(s):`);
  errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
  process.exit(1);
} else {
  console.log('\n✅ All gear records passed schema, price, URL, and verification checks!');
  process.exit(0);
}

