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
      } catch (e) {
        // Retry
      }
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
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('=== STARTING PORTFOLIO V28 VERIFICATION ===');
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

    // 1. SECTION 02: THE THREE OPERATING LENSES TESTS
    console.log('\n--- 1. SECTION 02: OPERATING PRINCIPLES (THREE LENSES) AUDIT ---');
    await client.setViewport(1440, 900);
    await new Promise(r => setTimeout(r, 500));

    // Initial state check
    const lens1Check = await client.eval(`(() => {
      const btn1 = document.querySelector('#lensBtnBeat');
      const scene1 = document.querySelector('#sceneBeat');
      const indicator = document.querySelector('#stageLensIndicator')?.textContent;
      const thesis = document.querySelector('#lensDetailThesis')?.textContent;
      const observation = document.querySelector('#beatObservationText')?.textContent;
      const nodes = document.querySelectorAll('.route-node').length;
      return {
        btn1Active: btn1?.classList.contains('is-active'),
        scene1Active: scene1?.classList.contains('is-active'),
        indicator,
        thesis: thesis?.substring(0, 40),
        observation: observation?.substring(0, 35),
        nodesCount: nodes
      };
    })()`);

    console.log('Lens 1 (Beat) Initial State:', lens1Check);
    if (!lens1Check.btn1Active || !lens1Check.scene1Active || lens1Check.nodesCount !== 5) {
      throw new Error('Lens 1 initial state assertion failed');
    }

    // Capture Lens 1 screenshot
    await client.eval(`document.querySelector('#approach').scrollIntoView()`);
    await new Promise(r => setTimeout(r, 300));
    await client.screenshot(`${projectDir}/v28-principles-lens1-1440.png`);
    console.log('Captured v28-principles-lens1-1440.png');

    // Switch to Lens 2 (Landed Economics)
    const lens2Check = await client.eval(`(() => {
      const btn2 = document.querySelector('#lensBtnLanded');
      btn2.click();
      const scene2 = document.querySelector('#sceneLanded');
      const indicator = document.querySelector('#stageLensIndicator')?.textContent;
      const title = document.querySelector('#lensDetailTitle')?.textContent;
      const tiers = document.querySelectorAll('.cost-tier').length;
      const formula = document.querySelector('.formula-text')?.textContent;
      return {
        btn2Active: btn2.classList.contains('is-active'),
        scene2Active: scene2.classList.contains('is-active'),
        indicator,
        title,
        tiersCount: tiers,
        formulaHasLanded: formula?.includes('$155 Landed Unit Cost')
      };
    })()`);

    console.log('Lens 2 (Landed) State:', lens2Check);
    if (!lens2Check.btn2Active || !lens2Check.scene2Active || !lens2Check.formulaHasLanded) {
      throw new Error('Lens 2 state assertion failed');
    }

    // Interact with Cost Tier in Lens 2
    const tierInteract = await client.eval(`(() => {
      const tier1 = document.querySelector('.cost-tier[data-tier-idx="1"]');
      tier1.click();
      const text = document.querySelector('#landedObservationText')?.textContent;
      return {
        tier1Active: tier1.classList.contains('is-active'),
        textHasFreight: text?.includes('Ocean container') || text?.includes('Freight')
      };
    })()`);
    console.log('Lens 2 Tier Interaction:', tierInteract);
    if (!tierInteract.tier1Active) {
      throw new Error('Cost tier click interaction failed');
    }

    // Capture Lens 2 screenshot
    await client.screenshot(`${projectDir}/v28-principles-lens2-1440.png`);
    console.log('Captured v28-principles-lens2-1440.png');

    // Switch to Lens 3 (Relational Systems)
    const lens3Check = await client.eval(`(() => {
      const btn3 = document.querySelector('#lensBtnRelational');
      btn3.click();
      const scene3 = document.querySelector('#sceneRelational');
      const indicator = document.querySelector('#stageLensIndicator')?.textContent;
      const title = document.querySelector('#lensDetailTitle')?.textContent;
      const nodes = document.querySelectorAll('.rel-node').length;
      return {
        btn3Active: btn3.classList.contains('is-active'),
        scene3Active: scene3.classList.contains('is-active'),
        indicator,
        title,
        nodesCount: nodes
      };
    })()`);

    console.log('Lens 3 (Relational) State:', lens3Check);
    if (!lens3Check.btn3Active || !lens3Check.scene3Active || lens3Check.nodesCount !== 4) {
      throw new Error('Lens 3 state assertion failed');
    }

    // Capture Lens 3 screenshot
    await client.screenshot(`${projectDir}/v28-principles-lens3-1440.png`);
    console.log('Captured v28-principles-lens3-1440.png');

    // Test Bridge Link navigation from Lens 3 to Section 03
    const bridgeCheck = await client.eval(`(() => {
      const bridgeLink = document.querySelector('#lensBridgeLink');
      const bridgeTarget = bridgeLink?.dataset.bridgeTarget;
      bridgeLink?.click();
      const activeProjectCard = document.querySelector('.project-index-entry.is-selected');
      return {
        bridgeTarget,
        selectedProjectId: activeProjectCard?.dataset.projectId,
        hasHighlight: activeProjectCard?.classList.contains('is-highlighted')
      };
    })()`);

    console.log('Bridge Link Navigation Check:', bridgeCheck);
    if (bridgeCheck.selectedProjectId !== 'pipeline') {
      throw new Error('Bridge link did not select target project in Section 03');
    }

    // 2. SECTION 03: THE INTERACTIVE PROJECT EXHIBITION AUDIT
    console.log('\n--- 2. SECTION 03: SELECTED WORK (INTERACTIVE EXHIBITION) AUDIT ---');

    // Check project cards in index
    const workAudit = await client.eval(`(() => {
      const cards = Array.from(document.querySelectorAll('.project-card'));
      const cardIds = cards.map(c => c.dataset.projectId);
      const previewTitle = document.querySelector('#previewTitle')?.textContent;
      const previewProblem = document.querySelector('#previewProblem')?.textContent;
      const previewDossierCase = document.querySelector('#previewDossierBtn')?.dataset.openCase;
      return {
        cardCount: cards.length,
        cardIds,
        previewTitle: previewTitle?.substring(0, 35),
        previewProblem: previewProblem?.substring(0, 35),
        previewDossierCase
      };
    })()`);

    console.log('Project Cards & Preview Audit:', workAudit);
    if (workAudit.cardCount !== 4 || !workAudit.cardIds.includes('cavinkare') || !workAudit.cardIds.includes('onlysolar')) {
      throw new Error('Project cards count or IDs mismatch');
    }

    // Select CavinKare project and verify preview
    const cavinSelect = await client.eval(`(() => {
      const cavinCard = document.querySelector('.project-index-entry[data-project-id="cavinkare"]');
      cavinCard.click();
      const isSel = cavinCard.classList.contains('is-selected');
      const cat = document.querySelector('#previewCategory')?.textContent;
      const metrics = Array.from(document.querySelectorAll('#previewMetrics .metric-val')).map(m => m.textContent);
      const dossierCase = document.querySelector('#previewDossierBtn')?.dataset.openCase;
      const noticeDisplay = window.getComputedStyle(document.querySelector('#previewConceptNotice')).display;
      return {
        isSel,
        cat,
        metrics,
        dossierCase,
        noticeDisplay
      };
    })()`);

    console.log('CavinKare Selection Check:', cavinSelect);
    if (!cavinSelect.isSel || !cavinSelect.metrics.includes('+30%') || cavinSelect.noticeDisplay !== 'none') {
      throw new Error('CavinKare selection assertion failed');
    }

    // Select Only Solar project and verify preview
    const onlySolarSelect = await client.eval(`(() => {
      const card = document.querySelector('.project-index-entry[data-project-id="onlysolar"]');
      card.click();
      const isSel = card.classList.contains('is-selected');
      const cat = document.querySelector('#previewCategory')?.textContent;
      const metrics = Array.from(document.querySelectorAll('#previewMetrics .metric-val')).map(m => m.textContent);
      const dossierCase = document.querySelector('#previewDossierBtn')?.dataset.openCase;
      return {
        isSel,
        cat,
        metrics,
        dossierCase
      };
    })()`);

    console.log('Only Solar Selection Check:', onlySolarSelect);
    if (!onlySolarSelect.isSel || !onlySolarSelect.metrics.includes('0 → 1') || onlySolarSelect.dossierCase !== 'onlysolar') {
      throw new Error('Only Solar selection assertion failed');
    }

    // Select Concept (See the Whole Flow) and verify synthetic notice
    const conceptSelect = await client.eval(`(() => {
      const card = document.querySelector('.project-index-entry[data-project-id="pipeline"]');
      card.click();
      const isSel = card.classList.contains('is-selected');
      const noticeDisplay = window.getComputedStyle(document.querySelector('#previewConceptNotice')).display;
      const noticeText = document.querySelector('#previewConceptText')?.textContent;
      return {
        isSel,
        noticeDisplay,
        noticeText
      };
    })()`);

    console.log('Concept Selection Check:', conceptSelect);
    if (conceptSelect.noticeDisplay === 'none' || !conceptSelect.noticeText.includes('Synthetic Dataset')) {
      throw new Error('Concept synthetic notice assertion failed');
    }

    // Filter Testing
    console.log('\n--- 3. PROJECT FILTERING AUDIT ---');
    const filterTests = await client.eval(`(() => {
      const btnAll = document.querySelector('.project-filter-btn[data-filter="all"]');
      const btnExp = document.querySelector('.project-filter-btn[data-filter="experience"]');
      const btnEnt = document.querySelector('.project-filter-btn[data-filter="entrepreneurship"]');
      const btnCon = document.querySelector('.project-filter-btn[data-filter="concepts"]');

      // Test Experience filter
      btnExp.click();
      const expVisible = Array.from(document.querySelectorAll('.project-index-entry')).filter(e => e.style.display !== 'none').map(e => e.dataset.projectId);
      const expActiveProject = document.querySelector('#previewDossierBtn')?.dataset.openCase;

      // Test Entrepreneurship filter
      btnEnt.click();
      const entVisible = Array.from(document.querySelectorAll('.project-index-entry')).filter(e => e.style.display !== 'none').map(e => e.dataset.projectId);
      const entActiveProject = document.querySelector('#previewDossierBtn')?.dataset.openCase;

      // Test Concepts filter
      btnCon.click();
      const conVisible = Array.from(document.querySelectorAll('.project-index-entry')).filter(e => e.style.display !== 'none').map(e => e.dataset.projectId);
      const conActiveProject = document.querySelector('#previewDossierBtn')?.dataset.openCase;

      // Reset to All
      btnAll.click();
      const allVisible = Array.from(document.querySelectorAll('.project-index-entry')).filter(e => e.style.display !== 'none').map(e => e.dataset.projectId);

      return {
        expVisible,
        expActiveProject,
        entVisible,
        entActiveProject,
        conVisible,
        conActiveProject,
        allVisible
      };
    })()`);

    console.log('Filter Results:', filterTests);
    if (filterTests.expVisible.length !== 1 || filterTests.entVisible.length !== 1 || filterTests.conVisible.length !== 2 || filterTests.allVisible.length !== 4) {
      throw new Error('Project filter count assertion failed');
    }

    // Capture Section 03 Exhibition Screenshot at 1440
    await client.eval(`document.querySelector('#work').scrollIntoView()`);
    await new Promise(r => setTimeout(r, 400));
    await client.screenshot(`${projectDir}/v28-work-exhibition-1440.png`);
    console.log('Captured v28-work-exhibition-1440.png');

    // Test Case Study Modal Trigger from Preview Button
    console.log('\n--- 4. CASE STUDY DOSSIER TRIGGER AUDIT ---');
    const modalTest = await client.eval(`(() => {
      // Select CavinKare
      document.querySelector('.project-index-entry[data-project-id="cavinkare"]').click();
      const previewBtn = document.querySelector('#previewDossierBtn');
      previewBtn.click();
      const dialog = document.querySelector('#caseDialog');
      const isOpen = !!dialog?.open;
      const cat = document.querySelector('#caseDialogCategory')?.textContent;
      const title = document.querySelector('#caseDialogBody .dialog-title')?.textContent;

      // Close Dialog
      document.querySelector('[data-close-dialog="caseDialog"]')?.click();
      const isClosed = !dialog?.open;

      return {
        isOpen,
        cat,
        title: title?.substring(0, 35),
        isClosed
      };
    })()`);

    console.log('Case Study Modal Test:', modalTest);
    if (!modalTest.isOpen || !modalTest.isClosed) {
      throw new Error('Case study modal opening/closing failed');
    }

    // Test Viewport Responsiveness and Overflow
    console.log('\n--- 5. RESPONSIVE VIEWPORT & OVERFLOW AUDIT ---');
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
        await client.eval(`document.querySelector('#work').scrollIntoView()`);
        await new Promise(r => setTimeout(r, 300));
        await client.screenshot(`${projectDir}/v28-work-mobile-390.png`);
        console.log('Captured v28-work-mobile-390.png');
      }
    }

    console.log('\n=== ALL V28 VERIFICATION TESTS PASSED PERFECTLY (100%) ===');
  } finally {
    client.close();
    chromeProc.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('\n❌ V28 VERIFICATION FAILED:', err);
  process.exit(1);
});
