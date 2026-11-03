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
      throw new Error(`Eval exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(filename, clip = null) {
    await this.eval('document.querySelectorAll(".toast").forEach(t => t.remove())');
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(path.join(projectDir, filename), buffer);
    console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTestSuite() {
  console.log('--- STARTING PORTFOLIO V25 VERIFICATION SUITE ---');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1440,1100',
    htmlUrl
  ]);

  const client = new CDPClient(9222);

  try {
    await client.connect();
    console.log('Connected to Chrome DevTools Protocol!');

    await client.send('Page.enable');
    await client.send('DOM.enable');

    await client.eval('new Promise(r => setTimeout(r, 600))');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
      if (condition) {
        console.log(`  PASS: ${message}`);
        passed++;
      } else {
        console.error(`  FAIL: ${message}`);
        failed++;
      }
    }

    // ========================================================================
    // SUITE 1: Signature Hollow Circular Cursor
    // ========================================================================
    console.log('\n[Suite 1] Signature Hollow Circular Cursor (Portfolio V25)');
    const cursorProps = await client.eval(`(() => {
      const c = document.getElementById('cursorHalo');
      if (!c) return { error: 'cursorHalo element missing' };
      const style = window.getComputedStyle(c);
      return {
        hasCircleClass: c.classList.contains('cursor-circle'),
        width: style.width,
        height: style.height,
        borderWidth: style.borderTopWidth,
        borderRadius: style.borderRadius,
        pointerEvents: style.pointerEvents,
        background: style.backgroundColor
      };
    })()`);

    assert(cursorProps.hasCircleClass === true, 'Cursor has .cursor-circle class');
    assert(cursorProps.width === '20px', 'Cursor width is 20px (refined diameter)');
    assert(cursorProps.height === '20px', 'Cursor height is 20px (refined diameter)');
    assert(parseFloat(cursorProps.borderWidth) >= 1 && parseFloat(cursorProps.borderWidth) <= 1.5, 'Cursor outline is thin (1–1.5px)');
    assert(cursorProps.borderRadius === '50%', 'Cursor is perfectly circular (50% border radius)');
    assert(cursorProps.pointerEvents === 'none', 'Cursor has pointer-events: none (no click interception)');
    assert(cursorProps.background === 'rgba(0, 0, 0, 0)' || cursorProps.background === 'transparent', 'Cursor centre is completely transparent (zero solid fill)');

    // Test Cursor Hover State on Interactive Element
    const cursorHoverProps = await client.eval(`(() => {
      const c = document.getElementById('cursorHalo');
      const btn = document.querySelector('.scenario-btn');
      // Simulate hover
      document.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, target: btn }));
      btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      return {
        isHovering: c.classList.contains('is-hovering')
      };
    })()`);

    assert(cursorHoverProps.isHovering === true, 'Cursor gains .is-hovering on interactive element hover');

    // ========================================================================
    // SUITE 2: Operations Pipeline — Minimal By Default & Progressive Discovery
    // ========================================================================
    console.log('\n[Suite 2] Operations Pipeline (Minimal By Default & Discovery)');
    
    // Initial Minimal State Check
    const pipeInit = await client.eval(`(() => {
      const activeNodes = document.querySelectorAll('.op-node.is-active');
      const statusStrip = document.getElementById('pipelineStatusStrip');
      const statusPill = document.getElementById('statusStripScenarioPill')?.textContent;
      const statusHint = document.getElementById('statusStripHint')?.textContent;
      const scenarioBox = document.getElementById('scenarioDetailsBox');
      const telemetry = document.getElementById('nodeTelemetry');
      return {
        activeNodeCount: activeNodes.length,
        statusStripVisible: statusStrip !== null && window.getComputedStyle(statusStrip).display !== 'none',
        statusPill,
        statusHint,
        scenarioBoxHidden: scenarioBox?.style.display === 'none',
        telemetryRevealed: telemetry?.classList.contains('is-revealed')
      };
    })()`);

    assert(pipeInit.activeNodeCount === 0, 'Initial state: All 6 nodes clean/unselected (minimal default)');
    assert(pipeInit.statusStripVisible === true, 'Pipeline status strip is visible');
    assert(pipeInit.statusPill?.includes('STEADY STATE'), 'Status strip shows STEADY STATE');
    assert(pipeInit.statusHint?.includes('Click any stage'), 'Status strip displays discovery hint');
    assert(pipeInit.scenarioBoxHidden === true, 'Scenario details box is hidden by default');
    assert(pipeInit.telemetryRevealed === false, 'Stage telemetry panel is NOT revealed automatically (minimal default)');

    // Test Scenario Details Toggle
    const scenarioToggleRes = await client.eval(`(() => {
      const toggleBtn = document.getElementById('scenarioDetailsToggleBtn');
      const box = document.getElementById('scenarioDetailsBox');
      toggleBtn.click();
      const openDisplay = box.style.display;
      const openAria = toggleBtn.getAttribute('aria-expanded');
      const openText = document.getElementById('scenarioDetailsBtnText')?.textContent;

      toggleBtn.click(); // Close
      const closedDisplay = box.style.display;
      const closedAria = toggleBtn.getAttribute('aria-expanded');

      return {
        openDisplay,
        openAria,
        openText,
        closedDisplay,
        closedAria
      };
    })()`);

    assert(scenarioToggleRes.openDisplay === 'block', 'Clicking Scenario Details expands the drawer');
    assert(scenarioToggleRes.openAria === 'true', 'Aria-expanded is true when open');
    assert(scenarioToggleRes.openText?.includes('Hide Scenario Details'), 'Button text updates to Hide Scenario Details');
    assert(scenarioToggleRes.closedDisplay === 'none', 'Clicking again collapses the scenario drawer');
    assert(scenarioToggleRes.closedAria === 'false', 'Aria-expanded is false when closed');

    // Test Clicking Node 01 (Supplier)
    const stage01Click = await client.eval(`(() => {
      const node0 = document.querySelector('.op-node[data-stage="0"]');
      node0.click();
      const node0Active = node0.classList.contains('is-active');
      const telemetry = document.getElementById('nodeTelemetry');
      const isRevealed = telemetry.classList.contains('is-revealed');
      const title = document.getElementById('telemetryTitle')?.textContent;
      const metric = document.getElementById('telemetryMetric')?.textContent;
      const exploreContent = document.getElementById('exploreStageContent');
      return {
        node0Active,
        isRevealed,
        title,
        metric,
        exploreContentHidden: exploreContent.style.display === 'none'
      };
    })()`);

    assert(stage01Click.node0Active === true, 'Clicking Supplier node highlights Stage 01');
    assert(stage01Click.isRevealed === true, 'Node telemetry reveals compact panel on stage click');
    assert(stage01Click.title === 'Supplier Sourcing & Negotiations', 'Title displays Supplier Sourcing & Negotiations');
    assert(stage01Click.metric?.includes('Supplier Relationships'), 'Focus area displays Supplier Relationships');
    assert(stage01Click.exploreContentHidden === true, 'Deeper explore content is collapsed by default');

    // Test "Explore this stage" Toggle
    const exploreToggleRes = await client.eval(`(() => {
      const btn = document.getElementById('exploreStageBtn');
      const content = document.getElementById('exploreStageContent');
      btn.click();
      const openDisplay = content.style.display;
      const openAria = btn.getAttribute('aria-expanded');
      const openText = document.getElementById('exploreStageBtnText')?.textContent;

      btn.click(); // Collapse
      const closedDisplay = content.style.display;
      const closedAria = btn.getAttribute('aria-expanded');

      return {
        openDisplay,
        openAria,
        openText,
        closedDisplay,
        closedAria
      };
    })()`);

    assert(exploreToggleRes.openDisplay === 'block', 'Clicking "Explore this stage" expands deeper content');
    assert(exploreToggleRes.openAria === 'true', 'Explore button aria-expanded is true');
    assert(exploreToggleRes.openText?.includes('Collapse stage details'), 'Button text toggles to Collapse stage details');
    assert(exploreToggleRes.closedDisplay === 'none', 'Clicking again collapses deeper content');
    assert(exploreToggleRes.closedAria === 'false', 'Explore button aria-expanded restores false');

    // Test All 6 Stages can be clicked and update data
    for (let i = 0; i < 6; i++) {
      const stRes = await client.eval(`(() => {
        const node = document.querySelector('.op-node[data-stage="${i}"]');
        node.click();
        const activeNode = document.querySelector('.op-node.is-active');
        const title = document.getElementById('telemetryTitle')?.textContent;
        return {
          activeIdx: activeNode?.dataset.stage,
          title
        };
      })()`);
      assert(stRes.activeIdx === String(i), `Stage ${i} correctly becomes active on selection`);
      assert(Boolean(stRes.title), `Stage ${i} populates title: "${stRes.title}"`);
    }

    // Test Scenarios (Delay, Surge, Steady)
    const delayScenarioRes = await client.eval(`(() => {
      document.querySelector('.scenario-btn[data-scenario="delay"]').click();
      const sourcingBottleneck = document.querySelector('.op-node[data-stage="1"]')?.classList.contains('is-bottleneck');
      const pillText = document.getElementById('statusStripScenarioPill')?.textContent;
      return {
        sourcingBottleneck,
        pillText
      };
    })()`);

    assert(delayScenarioRes.sourcingBottleneck === true, 'Delay scenario applies bottleneck highlight to Stage 02 (Sourcing)');
    assert(delayScenarioRes.pillText?.includes('BOTTLENECK ALERT'), 'Status strip pill shows BOTTLENECK ALERT');

    const surgeScenarioRes = await client.eval(`(() => {
      document.querySelector('.scenario-btn[data-scenario="surge"]').click();
      const distSurge = document.querySelector('.op-node[data-stage="4"]')?.classList.contains('is-surge');
      const retailSurge = document.querySelector('.op-node[data-stage="5"]')?.classList.contains('is-surge');
      const pillText = document.getElementById('statusStripScenarioPill')?.textContent;
      return {
        distSurge,
        retailSurge,
        pillText
      };
    })()`);

    assert(surgeScenarioRes.distSurge === true, 'Surge scenario highlights Stage 05 (Distribution)');
    assert(surgeScenarioRes.retailSurge === true, 'Surge scenario highlights Stage 06 (Retail)');
    assert(surgeScenarioRes.pillText?.includes('DEMAND SURGE'), 'Status strip pill shows DEMAND SURGE');

    // Test Reverse Demand Feedback Loop Toggle
    const loopToggleRes = await client.eval(`(() => {
      const loopBtn = document.getElementById('feedbackLoopBtn');
      loopBtn.click();
      const isActive = loopBtn.classList.contains('is-active');
      const badgeText = document.getElementById('loopBadgeText')?.textContent;
      const pulseDirection = document.querySelector('.pulse-feedback')?.style.animationDirection;
      loopBtn.click(); // restore
      const isRestored = !loopBtn.classList.contains('is-active');
      return {
        isActive,
        badgeText,
        pulseDirection,
        isRestored
      };
    })()`);

    assert(loopToggleRes.isActive === true, 'Feedback loop button toggles to active');
    assert(loopToggleRes.badgeText?.includes('DEMAND PULL ACTIVE'), 'Badge text changes to DEMAND PULL ACTIVE');
    assert(loopToggleRes.pulseDirection === 'reverse', 'Pulse direction reverses along feedback curve');
    assert(loopToggleRes.isRestored === true, 'Clicking again restores standard feedback loop');

    // ========================================================================
    // SUITE 3: Interactive Contact Section (Chips, Prefill & Gmail Compose)
    // ========================================================================
    console.log('\n[Suite 3] Interactive Contact Section (Chips & Gmail Compose)');

    // Verify closing composition headline
    const contactHeadline = await client.eval(`document.getElementById('contactHeadline')?.textContent`);
    assert(contactHeadline?.includes('Start an operational conversation') || contactHeadline?.includes('Every good conversation starts with a clear signal'), 'Contact headline matches closing composition requirement');

    // Verify 5 Conversation Category Chips
    const chipsRes = await client.eval(`(() => {
      const chips = document.querySelectorAll('.category-chip');
      const selectedChip = document.querySelector('.category-chip.is-selected');
      return {
        count: chips.length,
        selectedTopic: selectedChip?.dataset.topic
      };
    })()`);

    assert(chipsRes.count === 5, 'Exactly 5 conversation category chips present');
    assert(chipsRes.selectedTopic === 'ops', 'Default selected chip is Operations & Logistics');

    // Test clicking Category 2: Supply Chain & Sourcing
    const supplyChipRes = await client.eval(`(() => {
      const supplyChip = document.querySelector('.category-chip[data-topic="supply"]');
      supplyChip.click();
      const isSelected = supplyChip.classList.contains('is-selected');
      const note = document.getElementById('categoryContextNote')?.textContent;
      const cardClass = document.getElementById('contactFormCard')?.className;
      const subjectVal = document.getElementById('userSubject')?.value;
      return {
        isSelected,
        note,
        cardClass,
        subjectVal
      };
    })()`);

    assert(supplyChipRes.isSelected === true, 'Supply Chain chip gains .is-selected');
    assert(supplyChipRes.note?.includes('vendor vetting') || supplyChipRes.note?.includes('import logistics'), 'Contextual note updates for supply chain');
    assert(supplyChipRes.cardClass?.includes('topic-supply'), 'Contact card gains .topic-supply accent tint');
    assert(supplyChipRes.subjectVal === 'Supply Chain & Sourcing Inquiry', 'Subject field pre-populated with Supply Chain inquiry');

    // Test clicking Category 3: Commercial Opportunities
    const commChipRes = await client.eval(`(() => {
      const commChip = document.querySelector('.category-chip[data-topic="commercial"]');
      commChip.click();
      const subjectVal = document.getElementById('userSubject')?.value;
      return { subjectVal };
    })()`);
    assert(commChipRes.subjectVal === 'Commercial & Business Opportunity', 'Subject field updates to Commercial & Business Opportunity');

    // Test Form Validation: Empty submit
    const emptySubmitRes = await client.eval(`(() => {
      document.getElementById('userName').value = '';
      document.getElementById('userEmail').value = '';
      document.getElementById('userSubject').value = '';
      document.getElementById('userMsg').value = '';
      document.getElementById('inquiryForm').dispatchEvent(new Event('submit', { cancelable: true }));
      const feedback = document.getElementById('formFeedback')?.textContent;
      return { feedback };
    })()`);
    assert(emptySubmitRes.feedback?.includes('fill out all required fields'), 'Empty form submission produces validation error message');

    // Test Form Validation: Invalid email
    const invalidEmailRes = await client.eval(`(() => {
      document.getElementById('userName').value = 'Test User';
      document.getElementById('userEmail').value = 'notanemail';
      document.getElementById('userSubject').value = 'Test Subject';
      document.getElementById('userMsg').value = 'Test Message';
      document.getElementById('inquiryForm').dispatchEvent(new Event('submit', { cancelable: true }));
      const feedback = document.getElementById('formFeedback')?.textContent;
      return { feedback };
    })()`);
    assert(invalidEmailRes.feedback?.includes('valid email address'), 'Invalid email produces email format error message');

    // Test Valid Submit: Prepares Gmail Compose URL & Fallback
    const validSubmitRes = await client.eval(`(() => {
      document.getElementById('userName').value = 'Sarah Connor';
      document.getElementById('userEmail').value = 'sarah@skynet-ops.com';
      document.getElementById('userSubject').value = 'Supply Chain & Inventory Modeling';
      document.getElementById('userMsg').value = 'Hello Jayesh, we would like to discuss optimizing our regional inventory turnover.';
      
      let openedUrl = null;
      const originalOpen = window.open;
      window.open = (url) => { openedUrl = url; return { closed: false }; };

      document.getElementById('inquiryForm').dispatchEvent(new Event('submit', { cancelable: true }));
      
      const feedback = document.getElementById('formFeedback')?.textContent;
      const fallbackHref = document.getElementById('fallbackMailtoLink')?.getAttribute('href');
      
      window.open = originalOpen;
      return {
        openedUrl,
        feedback,
        fallbackHref
      };
    })()`);

    assert(validSubmitRes.openedUrl?.includes('mail.google.com/mail/?view=cm'), 'Constructs valid Gmail compose URL (mail.google.com/mail/?view=cm)');
    assert(validSubmitRes.openedUrl?.includes('jayeshsingh9b%40gmail.com'), 'Gmail URL addressed to verified recipient jayeshsingh9b@gmail.com');
    assert(validSubmitRes.openedUrl?.includes('Sarah%20Connor'), 'Gmail URL encodes sender name');
    assert(validSubmitRes.fallbackHref?.startsWith('mailto:jayeshsingh9b@gmail.com'), 'Fallback mailto link prepared with verified email');
    assert(validSubmitRes.feedback?.includes('Opening Gmail compose window') || validSubmitRes.feedback?.includes('Review and send'), 'Friendly status confirmation displayed without false message-sent claim');

    // ========================================================================
    // SUITE 4: Privacy Audit
    // ========================================================================
    console.log('\n[Suite 4] Privacy Audit (Zero Public Phone Numbers)');
    const phoneAudit = await client.eval(`(() => {
      const pageText = document.body.innerText;
      const phoneRegex = /(?:\\+91[\\-\\s]?)?[6789]\\d{9}/g;
      const matches = pageText.match(phoneRegex);
      return {
        foundPhoneCount: matches ? matches.length : 0,
        matches
      };
    })()`);

    assert(phoneAudit.foundPhoneCount === 0, 'Zero public phone numbers found anywhere on the page');

    // ========================================================================
    // SUITE 5: Viewport Testing & Visual Screenshots
    // ========================================================================
    console.log('\n[Suite 5] Viewports & Visual Screenshots');

    // 1440 × 900 Standard Desktop
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });
    // Set minimal default pipeline view
    await client.eval(`(() => {
      document.querySelector('.scenario-btn[data-scenario="normal"]').click();
      const node0 = document.querySelector('.op-node[data-stage="0"]');
      node0.click();
      document.getElementById('exploreStageBtn')?.click(); // open explore drawer
      document.getElementById('userName').value = '';
      document.getElementById('userEmail').value = '';
      document.getElementById('userSubject').value = 'Operations & Logistics Discussion';
      document.getElementById('userMsg').value = '';
      document.getElementById('formFeedback').textContent = '';
    })()`);
    await client.screenshot('v25-desktop-1440.png');

    // Capture Contact Section specifically
    await client.eval(`(() => {
      const contactEl = document.getElementById('contact');
      if (contactEl) contactEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await client.eval('new Promise(r => setTimeout(r, 200))');
    await client.screenshot('v25-contact-1440.png');

    // Scroll back to top
    await client.eval('window.scrollTo(0, 0)');

    // 1920 × 1080 Expansive Desktop
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client.screenshot('v25-desktop-1920.png');

    // 768 × 1024 Tablet Portrait
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: true
    });
    await client.screenshot('v25-tablet-768.png');

    // 390 × 844 Mobile Viewport
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    const mobileOverflow = await client.eval(`(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      return {
        scrollWidth,
        clientWidth,
        hasHorizontalOverflow: scrollWidth > clientWidth
      };
    })()`);
    assert(mobileOverflow.hasHorizontalOverflow === false, 'Mobile viewport (390px) has ZERO horizontal overflow');
    await client.screenshot('v25-mobile-390.png');

    console.log(`\n======================================================`);
    console.log(`PORTFOLIO V25 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    client.close();
    chrome.kill();
  }
}

runTestSuite();
