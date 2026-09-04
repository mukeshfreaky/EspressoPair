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
    return res.result?.value;
  }
}

async function inspect() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_dbg_' + Date.now()
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

    // 1. Inspect URL parsing on direct fresh load with hash
    const testUrl = 'https://espressopair.pages.dev/#build?budget=600&drinks=milk_drinks&volume=1&tinkering=simple&beans=either';
    console.log('Navigating to testUrl:', testUrl);
    await cdp.send('Page.navigate', { url: testUrl });
    await new Promise(r => setTimeout(r, 2500));

    const loc = await cdp.evaluate(`(() => {
      return {
        href: window.location.href,
        hash: window.location.hash,
        search: window.location.search,
        h1: document.querySelector('h1')?.innerText,
        cards: Array.from(document.querySelectorAll('h3')).map(h => h.innerText)
      };
    })()`);
    console.log('Location info:', loc);

    // 2. Find overflow elements at 375px width
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    const overflowElements = await cdp.evaluate(`(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > 375 || el.scrollWidth > 375) {
          overflowing.push({
            tag: el.tagName,
            class: el.className,
            scrollWidth: el.scrollWidth,
            rectRight: rect.right,
            text: el.innerText ? el.innerText.slice(0, 50) : ''
          });
        }
      }
      return overflowing.slice(0, 10);
    })()`);

    console.log('\nOverflowing elements at 375px:');
    console.log(overflowElements);

  } finally {
    chrome.kill();
  }
}

inspect().catch(console.error);
