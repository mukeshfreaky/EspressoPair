# EspressoPair ☕

> A human-feeling espresso setup recommendation tool. Helping coffee drinkers answer: *"Given how I actually drink coffee, my real budget, and how much coffee faff I can tolerate, what machine and grinder setup should I buy?"*

---

## Why EspressoPair Exists

Espresso equipment advice on the internet is notoriously polarized and overwhelming:
* Beginners face 40-page forum flame wars between dual boilers, heat exchangers, thermojets, burr geometry, and retention bellows.
* Big-box retail review sites push cheap 15-bar pressurized appliances that produce watery, bitter foam.
* Retailer recommendation quizzes only recommend products they sell in their own warehouse, excluding direct-to-consumer darlings like the Turin DF54/DF64, Flair 58, Cafelat Robot, or Niche Zero.

**EspressoPair cuts through the noise:**
1. **Strict Total System Budget:** If a user specifies an $800 budget, the engine treats that as the hard ceiling for **Machine + Grinder + Essential Tools** (0.1g scale, WDT needle distributor, self-leveling tamper). We never recommend an $750 machine that leaves you without a grinder.
2. **Deterministic Rules Over AI Fluff:** No vague LLM hallucinations, fabricated prices, or fake credentials. Recommendations are computed from physical constraints (boiler capacity, warm-up times, burr sizes, workflow preferences).
3. **Decoupled Affiliate Architecture:** Recommendation scores are 100% isolated from whether a product pays an affiliate commission. We regularly recommend products with zero affiliate compensation whenever they represent the best tool for the user.

---

## Tech Stack

* **Framework:** React 19 + Vite 6 + TypeScript
* **Styling:** Tailwind CSS (warm, editorial coffee aesthetic)
* **Icons:** Lucide React
* **Data Store:** Version-controlled JSON flat-files (`src/data/gear.json`, `src/data/accessories.json`, `src/data/retailers.json`)
* **Testing:** Behavioral test suite in `tests/run-tests.ts`
* **Validation:** CLI verification tooling in `scripts/validate-gear.js` and `scripts/check-links.js`
* **Zero Backend Required:** 100% statically exportable to Vercel, Cloudflare Pages, Netlify, or GitHub Pages.

---

## Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Run Behavioral Test Suite
Verifies budget ceilings, deal-breakers, volume scaling, and core buyer personas:
```bash
npm test
```

### 4. Validate Gear Catalog
Validates prices, URLs, physical dimensions, verification timestamps, and editorial notes:
```bash
npm run validate-gear
```

### 5. Build for Production
```bash
npm run build
```

---

## Project Structure

```text
├── scripts/
│   ├── validate-gear.js     # CLI validator for gear database integrity
│   └── check-links.js       # Retailer and source URL verification script
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Brand header, navigation & transparency badge
│   │   ├── Footer.tsx       # FTC disclosure, guide links & philosophy
│   │   ├── Hero.tsx         # Conversational headline & founder story
│   │   ├── Quiz.tsx         # 6-step diagnostic workflow wizard
│   │   ├── ResultsView.tsx  # Hero setup, cost breakdown, alternatives & share link
│   │   ├── GearCatalogView.tsx # Filterable database of verified machines & grinders
│   │   └── EditorialPages.tsx  # In-depth guides & founder narrative
│   ├── data/
│   │   ├── gear.json        # 15 curated machines + 12 curated grinders
│   │   ├── accessories.json # Essentials ($56-$70) vs skip list ($200+ gadgets)
│   │   └── retailers.json   # Abstracted merchant partner links & disclosure text
│   ├── lib/
│   │   ├── engine.ts        # Deterministic matching & pair scoring engine
│   │   └── analytics.ts     # Privacy-respecting anonymous funnel tracking
│   ├── types/
│   │   └── index.ts         # TypeScript domain models
│   ├── App.tsx              # URL parameter hydration & view orchestrator
│   └── main.tsx             # Application entry point
├── tests/
│   └── run-tests.ts         # Automated behavioral test suite (30 passing assertions)
└── package.json
```

---

## How to Maintain Gear Data

Target maintenance is **under 1 hour per month** because prosumer espresso equipment lifecycles last 5–10 years and prices are protected by manufacturer Minimum Advertised Price (MAP) policies.

### Adding a New Machine or Grinder
1. Open `src/data/gear.json`.
2. Add a new record following the schema in `src/types/index.ts`.
3. Include:
   * Verified physical specs (boiler type, warmup, PID, dimensions)
   * Official manufacturer source URL
   * Current date in `last_verified` (e.g. `2026-09-04`)
   * Human-written editorial note in `my_take`
4. Run `npm run validate-gear`. If any field is malformed or price is invalid, the script will reject the change.

---

## Deployment (Vercel / Cloudflare Pages)

1. Push this repository to GitHub.
2. Link the repository to **Vercel** or **Cloudflare Pages**.
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Deploy. Zero environment variables required for basic functionality.

