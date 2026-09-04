const { spawn } = require('child_process');
const http = require('http');

async function getJson(endpoint, port = 9222) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else if (msg.method) {
          const listeners = this.eventListeners.get(msg.method) || [];
          listeners.forEach(fn => fn(msg.params));
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, fn) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(fn);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluation exception: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }
}

async function runBlackBoxQA() {
  console.log('🚀 Launching Headless Chrome for Black-Box Production QA...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_qa_' + Date.now()
  ]);

  const report = {
    homepage: {},
    personas: [],
    edgeCases: [],
    permalinks: {},
    mobileAudit: [],
    technicalQA: { consoleErrors: [], failedRequests: [], missingFiles: [] },
    seo: {},
    retailerChecks: []
  };

  try {
    // Wait for Chrome port
    let version;
    for (let i = 0; i < 30; i++) {
      try {
        version = await getJson('/json/version');
        break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    const tabs = await getJson('/json/list');
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const cdp = new SimpleCDP(pageTab.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('✅ Connected to live browser tab via CDP\n');

    cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        report.technicalQA.consoleErrors.push(params.args.map(a => a.value).join(' '));
      }
    });

    cdp.on('Network.responseReceived', (params) => {
      if (params.response.status >= 400) {
        report.technicalQA.failedRequests.push({
          url: params.response.url,
          status: params.response.status,
          statusText: params.response.statusText
        });
      }
    });

    await cdp.send('Network.enable');
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // =========================================================
    // SECTION 1: HOMEPAGE AUDIT
    // =========================================================
    console.log('========================================');
    console.log('1. AUDITING HOMEPAGE');
    console.log('========================================');
    await cdp.send('Page.navigate', { url: 'https://espressopair.pages.dev/' });
    await new Promise(r => setTimeout(r, 2500));

    report.homepage.title = await cdp.evaluate('document.title');
    report.homepage.h1 = await cdp.evaluate('document.querySelector("h1")?.innerText');
    report.homepage.subhead = await cdp.evaluate('document.querySelector("p.text-base")?.innerText');
    report.homepage.badge = await cdp.evaluate('document.querySelector(".inline-flex")?.innerText');
    report.homepage.cta = await cdp.evaluate('document.querySelector("button.bg-crema")?.innerText');
    report.homepage.founderCardPresent = await cdp.evaluate('!!document.querySelector("h3")');

    console.log('Title:', report.homepage.title);
    console.log('H1:', report.homepage.h1);
    console.log('CTA Button:', report.homepage.cta);
    console.log('Founder Rationale Present:', report.homepage.founderCardPresent);

    // =========================================================
    // SECTION 2: PERSONAS (A to H)
    // =========================================================
    console.log('\n========================================');
    console.log('2. TESTING REALISTIC PERSONAS VIA UI PERMALINKS');
    console.log('========================================');

    const personasToTest = [
      {
        id: 'A',
        name: '$600 beginner who mainly drinks lattes',
        url: 'https://espressopair.pages.dev/#build?budget=600&drinks=milk_drinks&volume=1&tinkering=simple&beans=either'
      },
      {
        id: 'B',
        name: '$350 manual espresso purist',
        url: 'https://espressopair.pages.dev/#build?budget=350&drinks=espresso&volume=1&tinkering=enjoys_ritual&beans=single_dose'
      },
      {
        id: 'C',
        name: '$1,200 light-roast clarity-focused user',
        url: 'https://espressopair.pages.dev/#build?budget=1200&drinks=espresso&volume=1&tinkering=rabbit_hole&beans=single_dose'
      },
      {
        id: 'D',
        name: '$1,500 fast morning / multiple milk drinks',
        url: 'https://espressopair.pages.dev/#build?budget=1500&drinks=milk_drinks&volume=2&tinkering=simple&beans=single_dose'
      },
      {
        id: 'E',
        name: '$800 compact + quiet setup',
        url: 'https://espressopair.pages.dev/#build?budget=800&drinks=both&volume=1&tinkering=willing_to_learn&beans=single_dose&counter=true'
      },
      {
        id: 'F',
        name: '$2,000 traditional espresso/body-focused user',
        url: 'https://espressopair.pages.dev/#build?budget=2000&drinks=both&volume=2&tinkering=willing_to_learn&beans=single_dose'
      },
      {
        id: 'G',
        name: '$200 impossible budget (Reality Check)',
        url: 'https://espressopair.pages.dev/#build?budget=200&drinks=espresso&volume=1&tinkering=simple&beans=either'
      },
      {
        id: 'H',
        name: '$3,500 enthusiast',
        url: 'https://espressopair.pages.dev/#build?budget=3500&drinks=espresso&volume=1&tinkering=rabbit_hole&beans=single_dose'
      }
    ];

    for (const p of personasToTest) {
      await cdp.send('Page.navigate', { url: p.url });
      await new Promise(r => setTimeout(r, 1500));

      const res = await cdp.evaluate(`(() => {
        const h1 = document.querySelector('h1')?.innerText || '';
        const cards = document.querySelectorAll('.grid.grid-cols-1.md\\\\:grid-cols-2 h3');
        const machine = cards[0]?.innerText || '';
        const grinder = cards[1]?.innerText || '';
        const totalContainer = document.querySelector('.pt-3 .text-crema');
        const totalText = totalContainer?.innerText || '';
        const remainingText = totalContainer?.parentElement?.innerText || '';
        const unspentBanner = document.querySelector('.bg-emerald-50\\\\/70 p')?.innerText || null;
        const noSetupNotice = document.querySelector('.bg-amber-50\\\\/90')?.innerText || null;
        const spendLess = document.querySelectorAll('.grid-cols-1.sm\\\\:grid-cols-2 h4')[0]?.innerText || null;
        const spendMore = document.querySelectorAll('.grid-cols-1.sm\\\\:grid-cols-2 h4')[1]?.innerText || null;
        
        return {
          h1,
          machine,
          grinder,
          total: totalText,
          summary: remainingText.replace(/\\n/g, ' '),
          unspentBanner,
          noSetupNotice: !!noSetupNotice,
          spendLess,
          spendMore
        };
      })()`);

      console.log(`\n📌 Persona ${p.id}: ${p.name}`);
      console.log(`   Header: ${res.h1}`);
      console.log(`   Machine: ${res.machine}`);
      console.log(`   Grinder: ${res.grinder}`);
      console.log(`   Cost: ${res.total} | ${res.summary}`);
      if (res.unspentBanner) console.log(`   Unspent Advice: "${res.unspentBanner.slice(0, 100)}..."`);
      if (res.noSetupNotice) console.log(`   ⚠️ Notice Banner Present: Yes (NO_FEASIBLE_SETUP correctly signaled)`);
      if (res.spendLess) console.log(`   Spend Less Alt: ${res.spendLess}`);
      if (res.spendMore) console.log(`   Spend More Alt: ${res.spendMore}`);

      report.personas.push({ persona: p.name, ...res });
    }

    // =========================================================
    // SECTION 3: MOBILE LAYOUT AUDIT
    // =========================================================
    console.log('\n========================================');
    console.log('3. TESTING MOBILE VIEWPORTS (375px, 390px, 768px)');
    console.log('========================================');

    const viewports = [
      { name: 'iPhone SE (375px)', width: 375, height: 667 },
      { name: 'iPhone 14 (390px)', width: 390, height: 844 },
      { name: 'iPad Mini (768px)', width: 768, height: 1024 }
    ];

    for (const vp of viewports) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 600));

      const overflow = await cdp.evaluate(`(() => {
        const docWidth = document.documentElement.offsetWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const hasHorizontalScroll = scrollWidth > docWidth;
        const bodyWidth = document.body.scrollWidth;
        return { docWidth, scrollWidth, bodyWidth, hasHorizontalScroll };
      })()`);

      console.log(`Viewport ${vp.name}: DocWidth=${overflow.docWidth}, ScrollWidth=${overflow.scrollWidth}, Horizontal Overflow=${overflow.hasHorizontalScroll}`);
      report.mobileAudit.push({ viewport: vp.name, ...overflow });
    }

    // Reset viewport
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    // =========================================================
    // SECTION 4: PERMALINK & TAMPERING AUDIT
    // =========================================================
    console.log('\n========================================');
    console.log('4. TESTING PERMALINK REHYDRATION & TAMPERING');
    console.log('========================================');

    const tamperingTests = [
      { name: 'Negative budget', url: 'https://espressopair.pages.dev/#build?budget=-500' },
      { name: 'String budget', url: 'https://espressopair.pages.dev/#build?budget=freecoffee' },
      { name: 'Unknown drinks type', url: 'https://espressopair.pages.dev/#build?drinks=nitro_cold_brew' },
      { name: 'Out of bounds volume', url: 'https://espressopair.pages.dev/#build?volume=999' }
    ];

    for (const t of tamperingTests) {
      await cdp.send('Page.navigate', { url: t.url });
      await new Promise(r => setTimeout(r, 1000));
      const status = await cdp.evaluate(`(() => {
        const error = document.querySelector('pre')?.innerText || null;
        const h1 = document.querySelector('h1')?.innerText || '';
        const machine = document.querySelectorAll('.grid.grid-cols-1.md\\\\:grid-cols-2 h3')[0]?.innerText || '';
        return { hasCrash: !!error, h1, machine };
      })()`);

      console.log(`Tamper Test "${t.name}": Crash=${status.hasCrash}, Result=${status.machine || status.h1}`);
    }

    // =========================================================
    // SECTION 5: RETAILER LINKS & EXTERNAL CHECKS
    // =========================================================
    console.log('\n========================================');
    console.log('5. AUDITING RETAILER LINKS ON LIVE RESULT');
    console.log('========================================');
    await cdp.send('Page.navigate', { url: 'https://espressopair.pages.dev/#build?budget=1200&drinks=both&volume=2&tinkering=willing_to_learn&beans=either' });
    await new Promise(r => setTimeout(r, 1500));

    const retailerLinks = await cdp.evaluate(`(() => {
      const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
      return links.map(a => ({
        text: a.innerText.trim(),
        href: a.href,
        rel: a.rel
      }));
    })()`);

    console.log(`Found ${retailerLinks.length} external retailer buttons:`);
    retailerLinks.forEach((l, idx) => {
      console.log(`  ${idx + 1}. [${l.text}] -> ${l.href} (rel: "${l.rel}")`);
    });
    report.retailerChecks = retailerLinks;

    // Check SEO static files (robots.txt, sitemap.xml)
    console.log('\n========================================');
    console.log('6. STATIC ASSETS & SEO CHECKS');
    console.log('========================================');
    const staticChecks = [
      'https://espressopair.pages.dev/robots.txt',
      'https://espressopair.pages.dev/sitemap.xml',
      'https://espressopair.pages.dev/favicon.svg'
    ];

    for (const u of staticChecks) {
      await cdp.send('Page.navigate', { url: u });
      await new Promise(r => setTimeout(r, 800));
      const content = await cdp.evaluate('document.body.innerText');
      const is404 = content.includes('404') || content.includes('Not Found') || content.includes('Page Not Found');
      console.log(`File: ${u} -> ${is404 ? '❌ 404 / Missing' : '✅ Present'}`);
      if (is404) report.technicalQA.missingFiles.push(u);
    }

    console.log('\n========================================');
    console.log('QA RUN COMPLETE. Summary:');
    console.log('Console Errors:', report.technicalQA.consoleErrors);
    console.log('Failed Requests:', report.technicalQA.failedRequests);
    console.log('Missing Static Files:', report.technicalQA.missingFiles);
    console.log('========================================');

  } finally {
    chrome.kill();
  }
}

runBlackBoxQA().catch(err => {
  console.error('Fatal error during blackbox QA:', err);
  process.exit(1);
});
