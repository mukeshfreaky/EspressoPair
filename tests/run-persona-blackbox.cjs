const { spawn } = require('child_process');
const http = require('http');

async function getJson(endpoint, port = 9222) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
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

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluation exception');
    }
    return res.result?.value;
  }
}

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_qa_full_' + Date.now()
  ]);

  try {
    let tabs;
    for (let i = 0; i < 30; i++) {
      try {
        tabs = await getJson('/json/list');
        if (tabs && tabs.length > 0) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    const pageTab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || tabs[0];
    const cdp = new SimpleCDP(pageTab.webSocketDebuggerUrl);
    await cdp.connect();

    console.log('=== BLACK-BOX PERSONA RUN ON LIVE URL ===\n');

    const personas = [
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
        name: '$200 impossible budget',
        url: 'https://espressopair.pages.dev/#build?budget=200&drinks=espresso&volume=1&tinkering=simple&beans=either'
      },
      {
        id: 'H',
        name: '$3,500 enthusiast',
        url: 'https://espressopair.pages.dev/#build?budget=3500&drinks=espresso&volume=1&tinkering=rabbit_hole&beans=single_dose'
      }
    ];

    for (const p of personas) {
      // Force reload by navigating to blank first so hash changes re-hydrate fully
      await cdp.send('Page.navigate', { url: 'about:blank' });
      await cdp.send('Page.navigate', { url: p.url });
      await new Promise(r => setTimeout(r, 2000));

      const res = await cdp.evaluate(`(() => {
        const h1 = document.querySelector('h1')?.innerText || '';
        const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1.md\\\\:grid-cols-2 h3')).map(h => h.innerText);
        const machine = cards[0] || '';
        const grinder = cards[1] || '';
        
        const totalSpan = document.querySelector('.text-crema')?.innerText || '';
        const totalContainer = document.querySelector('.text-crema')?.parentElement?.innerText || '';
        
        const machineLogic = document.querySelectorAll('.grid-cols-1.md\\\\:grid-cols-3 p')[0]?.innerText || '';
        const grinderLogic = document.querySelectorAll('.grid-cols-1.md\\\\:grid-cols-3 p')[1]?.innerText || '';
        const budgetLogic = document.querySelectorAll('.grid-cols-1.md\\\\:grid-cols-3 p')[2]?.innerText || '';
        
        const unspentCard = document.querySelector('.bg-emerald-50\\\\/70 p')?.innerText || null;
        const noSetupCard = document.querySelector('.bg-amber-50\\\\/90')?.innerText || null;
        
        const alts = Array.from(document.querySelectorAll('.grid-cols-1.sm\\\\:grid-cols-2 h4')).map(h => h.innerText);
        const altReasons = Array.from(document.querySelectorAll('.grid-cols-1.sm\\\\:grid-cols-2 p')).map(p => p.innerText);

        return {
          h1,
          machine,
          grinder,
          total: totalSpan,
          costBreakdown: totalContainer.replace(/\\n/g, ' '),
          machineLogic,
          grinderLogic,
          budgetLogic,
          unspentCard,
          noSetupCard,
          spendLess: alts[0] ? { name: alts[0], reason: altReasons[0] } : null,
          spendMore: alts[1] ? { name: alts[1], reason: altReasons[1] } : null
        };
      })()`);

      console.log(`------------------------------------------------------------`);
      console.log(`📌 Persona ${p.id}: ${p.name}`);
      console.log(`Page Heading: "${res.h1}"`);
      console.log(`Recommended Machine: "${res.machine}"`);
      console.log(`Recommended Grinder: "${res.grinder}"`);
      console.log(`Total Cost: ${res.total} (${res.costBreakdown})`);
      console.log(`Machine Editorial: "${res.machineLogic.slice(0, 120)}..."`);
      console.log(`Grinder Editorial: "${res.grinderLogic.slice(0, 120)}..."`);
      if (res.unspentCard) {
        console.log(`💰 Unspent Budget Rationale: "${res.unspentCard.slice(0, 140)}..."`);
      }
      if (res.noSetupCard) {
        console.log(`⚠️ Reality Check Notice: "${res.noSetupCard.replace(/\\n/g, ' ').slice(0, 140)}..."`);
      }
      if (res.spendLess) {
        console.log(`📉 Spend Less: ${res.spendLess.name} -> "${res.spendLess.reason}"`);
      }
      if (res.spendMore) {
        console.log(`📈 Spend More: ${res.spendMore.name} -> "${res.spendMore.reason}"`);
      }
    }

    console.log('\n========================================');
    console.log('✅ ALL 8 PERSONAS AUDITED ON PRODUCTION BUILD');
    console.log('========================================');

  } finally {
    chrome.kill();
  }
}

run().catch(console.error);

