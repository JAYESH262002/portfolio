const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const projectDir = '/Users/rajput/Documents/main decision/jayesh-portfolio-next';
const htmlUrl = 'file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/index.html';

class CDPClient {
  constructor(port = 9222) {
    this.port = port;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
  }

  async connect() {
    for (let i = 0; i < 25; i++) {
      try {
        const res = await fetch(`http://localhost:${this.port}/json`);
        const tabs = await res.json();
        const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('index.html'));
        if (pageTab && pageTab.webSocketDebuggerUrl) {
          return new Promise((resolve, reject) => {
            this.ws = new WebSocket(pageTab.webSocketDebuggerUrl);
            this.ws.onopen = () => resolve();
            this.ws.onerror = (e) => reject(e);
            this.ws.onmessage = (event) => {
              const data = JSON.parse(event.data);
              if (data.id && this.pending.has(data.id)) {
                const { resolve, reject } = this.pending.get(data.id);
                this.pending.delete(data.id);
                if (data.error) reject(data.error);
                else resolve(data.result);
              }
            };
          });
        }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    throw new Error('Failed to find index.html page tab in Chrome');
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600
    });
    await this.send('Emulation.setVisibleSize', { width, height });
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('=== STARTING PORTFOLIO V29 VERIFICATION ===');
  const chromeProc = spawn(chromePath, [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    htmlUrl
  ]);

  const client = new CDPClient(9222);

  try {
    await client.connect();
    console.log('Connected to Chrome via CDP.');

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    // 1. SECTION 02: EDITORIAL OPERATING PRINCIPLES AUDIT
    console.log('\n--- 1. SECTION 02: EDITORIAL OPERATING PRINCIPLES AUDIT ---');
    await client.setViewport(1440, 900);
    await new Promise(r => setTimeout(r, 400));

    // Initial state check
    const principlesCheck = await client.eval(`(() => {
      const items = Array.from(document.querySelectorAll('.editorial-principle-item'));
      const item0 = items[0];
      const item1 = items[1];
      const item2 = items[2];
      const openLoopBtn = document.getElementById('openLoopBtn');

      return {
        itemCount: items.length,
        item0Active: item0?.classList.contains('is-active'),
        item1Active: item1?.classList.contains('is-active'),
        item2Active: item2?.classList.contains('is-active'),
        item0Heading: item0?.querySelector('.principle-heading')?.textContent?.trim(),
        item1Heading: item1?.querySelector('.principle-heading')?.textContent?.trim(),
        item2Heading: item2?.querySelector('.principle-heading')?.textContent?.trim(),
        hasOpenLoopBtn: Boolean(openLoopBtn)
      };
    })()`);

    console.log('Section 02 Initial State:', principlesCheck);
    if (principlesCheck.itemCount !== 3 || !principlesCheck.item0Active || principlesCheck.item1Active) {
      throw new Error('Section 02 principle items count or initial active state mismatch');
    }

    // Scroll to Section 02 and capture screenshot of Principle 01
    await client.eval(`document.getElementById('approach').scrollIntoView()`);
    await new Promise(r => setTimeout(r, 300));
    await client.screenshot(`${projectDir}/tests/screenshots/v29-principles-editorial-1440.png`);
    console.log('Captured v29-principles-editorial-1440.png');

    // Toggle Principle 02 (True Landed Economics)
    const toggleP2 = await client.eval(`(() => {
      const item1 = document.querySelectorAll('.editorial-principle-item')[1];
      item1.querySelector('.principle-summary-row')?.click();
      const p1Active = document.querySelectorAll('.editorial-principle-item')[0].classList.contains('is-active');
      const p2Active = item1.classList.contains('is-active');
      const indicator = item1.querySelector('.principle-toggle-indicator')?.textContent;
      const thesis = item1.querySelector('.principle-thesis')?.textContent;
      const hasCostStack = Boolean(item1.querySelector('.minimal-cost-stack'));

      return {
        p1Active,
        p2Active,
        indicator,
        thesisSnippet: thesis?.substring(0, 40),
        hasCostStack
      };
    })()`);

    console.log('Principle 02 Toggled State:', toggleP2);
    if (toggleP2.p1Active || !toggleP2.p2Active || !toggleP2.hasCostStack) {
      throw new Error('Principle 02 toggle failed');
    }

    await client.screenshot(`${projectDir}/tests/screenshots/v29-principles-landed-1440.png`);
    console.log('Captured v29-principles-landed-1440.png');

    // Test Bridge Link from Section 02 to Section 03
    const bridgeTest = await client.eval(`(() => {
      const link = document.querySelector('.editorial-principle-item.is-active .principle-bridge-link');
      link?.click();
      const onlySolarRow = document.querySelector('.editorial-project-row[data-project-id="onlysolar"]');
      return {
        target: link?.dataset.bridgeTo,
        rowHasHighlight: onlySolarRow?.classList.contains('is-highlighted')
      };
    })()`);

    console.log('Bridge Link Test:', bridgeTest);
    if (bridgeTest.target !== 'onlysolar' || !bridgeTest.rowHasHighlight) {
      throw new Error('Bridge link navigation or row highlight failed');
    }

    // 2. SECTION 03: EDITORIAL PROJECT INDEX AUDIT
    console.log('\n--- 2. SECTION 03: EDITORIAL PROJECT INDEX AUDIT ---');

    const workAudit = await client.eval(`(() => {
      const rows = Array.from(document.querySelectorAll('.project-card.editorial-project-row'));
      const projectIds = rows.map(r => r.dataset.projectId);
      const titles = rows.map(r => r.querySelector('.project-row-title')?.textContent?.trim());
      const hasOldFilters = Boolean(document.querySelector('.project-filters-wrap'));
      const hasOldDashboardPreview = Boolean(document.querySelector('#projectLivePreview'));

      return {
        rowCount: rows.length,
        projectIds,
        titles,
        hasOldFilters,
        hasOldDashboardPreview
      };
    })()`);

    console.log('Section 03 Index Audit:', workAudit);
    if (workAudit.rowCount !== 4 || workAudit.hasOldFilters || workAudit.hasOldDashboardPreview) {
      throw new Error('Section 03 row count mismatch or lingering dashboard components found');
    }

    // Scroll to Section 03 and capture screenshot
    await client.eval(`document.getElementById('work').scrollIntoView()`);
    await new Promise(r => setTimeout(r, 400));
    await client.screenshot(`${projectDir}/tests/screenshots/v29-work-editorial-1440.png`);
    console.log('Captured v29-work-editorial-1440.png');

    // 3. CASE STUDY DOSSIER MODAL AUDIT
    console.log('\n--- 3. CASE STUDY DOSSIER TRIGGER AUDIT ---');
    const caseModalTest = await client.eval(`(() => {
      // Trigger CavinKare case study
      const cavinBtn = document.querySelector('.editorial-project-row[data-project-id="cavinkare"] .btn-editorial-dossier');
      cavinBtn?.click();

      const dlg = document.getElementById('caseDialog');
      const isOpen = Boolean(dlg?.open);
      const cat = document.getElementById('caseDialogCategory')?.textContent;
      const title = document.querySelector('#caseDialogBody .dialog-title')?.textContent;
      const takeaways = document.querySelector('.dossier-takeaways')?.textContent;

      // Close modal
      document.querySelector('[data-close-dialog="caseDialog"]')?.click();
      const isClosed = !dlg?.open;

      return {
        isOpen,
        cat,
        title,
        takeawaysSnippet: takeaways?.substring(0, 30),
        isClosed
      };
    })()`);

    console.log('Case Study Modal Test:', caseModalTest);
    if (!caseModalTest.isOpen || !caseModalTest.isClosed || !caseModalTest.title?.includes('Making a Beat Work Harder')) {
      throw new Error('Case study modal opening/closing failed');
    }

    // 4. RESPONSIVE VIEWPORT & OVERFLOW AUDIT
    console.log('\n--- 4. RESPONSIVE VIEWPORT & OVERFLOW AUDIT ---');
    const viewports = [
      { w: 1920, h: 1080, name: 'desktop-1920' },
      { w: 1440, h: 900, name: 'desktop-1440' },
      { w: 1024, h: 768, name: 'tablet-1024' },
      { w: 768, h: 1024, name: 'tablet-768' },
      { w: 390, h: 844, name: 'mobile-390' }
    ];

    for (const vp of viewports) {
      await client.setViewport(vp.w, vp.h);
      await new Promise(r => setTimeout(r, 300));
      const overflow = await client.eval(`(() => {
        const root = document.documentElement;
        return {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          hasOverflow: root.scrollWidth > root.clientWidth + 1
        };
      })()`);

      console.log(`Viewport ${vp.w}x${vp.h} (${vp.name}): overflow=${overflow.hasOverflow} (${overflow.scrollWidth} / ${overflow.clientWidth})`);
      if (overflow.hasOverflow) {
        throw new Error(`Horizontal overflow detected at ${vp.w}x${vp.h}!`);
      }

      if (vp.w === 390) {
        await client.eval(`document.getElementById('approach').scrollIntoView()`);
        await new Promise(r => setTimeout(r, 300));
        await client.screenshot(`${projectDir}/tests/screenshots/v29-principles-mobile-390.png`);

        await client.eval(`document.getElementById('work').scrollIntoView()`);
        await new Promise(r => setTimeout(r, 300));
        await client.screenshot(`${projectDir}/tests/screenshots/v29-work-mobile-390.png`);
        console.log('Captured v29 mobile screenshots');
      }
    }

    console.log('\n=== ALL V29 VERIFICATION TESTS PASSED PERFECTLY (100%) ===');
  } finally {
    client.close();
    chromeProc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('\n❌ V29 VERIFICATION FAILED:', err);
  process.exit(1);
});
