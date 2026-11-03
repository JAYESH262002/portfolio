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

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${path.basename(filePath)} (${fs.statSync(filePath).size} bytes)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('======================================================');
  console.log('  STARTING PORTFOLIO V27 VERIFICATION SUITE');
  console.log('======================================================\n');

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    htmlUrl
  ]);

  const client = new CDPClient(9222);
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

  try {
    await client.connect();
    console.log('Connected to Chrome DevTools Protocol!\n');

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    await new Promise(r => setTimeout(r, 400));

    // ========================================================================
    // PRIORITY 1: OPERATIONS PIPELINE OUTSIDE-CLICK RESET AUDIT
    // ========================================================================
    console.log('[Priority 1] Operations Pipeline Outside-Click Boundary & Reset Audit');

    // 1. Boundary check: data-pipeline-root exists on outermost container
    const boundaryCheck = await client.eval(`(() => {
      const root = document.querySelector('[data-pipeline-root]');
      const id = root?.id;
      const hasSvg = Boolean(root?.querySelector('.pipeline-svg'));
      const hasScenarios = Boolean(root?.querySelector('.scenario-toggles'));
      const hasTelemetry = Boolean(root?.querySelector('#nodeTelemetry'));
      const hasDetails = Boolean(root?.querySelector('#scenarioDetailsBox'));
      return {
        hasRoot: Boolean(root),
        id,
        hasSvg,
        hasScenarios,
        hasTelemetry,
        hasDetails
      };
    })()`);

    assert(boundaryCheck.hasRoot === true, 'Outermost container has [data-pipeline-root] attribute');
    assert(boundaryCheck.id === 'operationsVisual', 'Root element matches #operationsVisual');
    assert(boundaryCheck.hasSvg && boundaryCheck.hasScenarios && boundaryCheck.hasTelemetry && boundaryCheck.hasDetails, 'All pipeline elements (SVG, scenarios, telemetry, details) reside inside the root');

    // 2. Select Stage 01 (Supplier) and expand details
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="0"]')?.click();
      document.getElementById('exploreStageBtn')?.click();
      document.querySelector('.scenario-btn[data-scenario="delay"]')?.click();
      document.getElementById('scenarioDetailsToggleBtn')?.click();
    })()`);

    const preOutsideClick = await client.eval(`(() => {
      return {
        node0Active: document.querySelector('.op-node[data-stage="0"]')?.classList.contains('is-active'),
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed'),
        scenarioDetailsOpen: document.getElementById('scenarioDetailsBox')?.style.display !== 'none',
        exploreOpen: document.getElementById('exploreStageContent')?.style.display !== 'none',
        activeScenario: document.querySelector('.scenario-btn.is-active')?.dataset.scenario
      };
    })()`);

    assert(preOutsideClick.node0Active && preOutsideClick.telemetryRevealed, 'Pipeline stage 01 active and telemetry revealed');
    assert(preOutsideClick.scenarioDetailsOpen && preOutsideClick.exploreOpen, 'Scenario Details and Explore Stage both expanded');
    assert(preOutsideClick.activeScenario === 'delay', 'Delay scenario is selected');

    // 3. Click INSIDE the panel: must remain expanded
    await client.eval(`(() => {
      document.getElementById('telemetryDesc')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      document.getElementById('telemetryDesc')?.click();
    })()`);

    const postInsideClick = await client.eval(`(() => {
      return {
        node0Active: document.querySelector('.op-node[data-stage="0"]')?.classList.contains('is-active'),
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed'),
        exploreOpen: document.getElementById('exploreStageContent')?.style.display !== 'none'
      };
    })()`);

    assert(postInsideClick.node0Active && postInsideClick.telemetryRevealed, 'Clicking inside panel keeps stage and telemetry expanded');

    // 4. Click OUTSIDE: on hero heading
    await client.eval(`(() => {
      const heading = document.querySelector('.hero-content h1');
      heading?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      heading?.click();
    })()`);

    await new Promise(r => setTimeout(r, 100));

    const postOutsideClick = await client.eval(`(() => {
      return {
        activeNodes: document.querySelectorAll('.op-node.is-active').length,
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed'),
        scenarioDetailsOpen: document.getElementById('scenarioDetailsBox')?.style.display !== 'none',
        exploreOpen: document.getElementById('exploreStageContent')?.style.display !== 'none',
        activeScenario: document.querySelector('.scenario-btn.is-active')?.dataset.scenario,
        isReversed: document.getElementById('feedbackLoopBtn')?.classList.contains('is-active'),
        statusPill: document.getElementById('statusStripScenarioPill')?.textContent
      };
    })()`);

    assert(postOutsideClick.activeNodes === 0, 'Clicking outside unselects all 6 pipeline nodes');
    assert(postOutsideClick.telemetryRevealed === false, 'Stage telemetry panel is completely hidden');
    assert(postOutsideClick.scenarioDetailsOpen === false, 'Scenario details drawer is closed');
    assert(postOutsideClick.exploreOpen === false, 'Explore stage drawer is closed');
    assert(postOutsideClick.activeScenario === 'normal', 'Scenario reset to Steady (normal)');
    assert(postOutsideClick.isReversed === false, 'Feedback loop restored to forward');
    assert(postOutsideClick.statusPill?.includes('STEADY STATE'), 'Status strip restored to STEADY STATE');

    await client.screenshot(`${projectDir}/v27-pipeline-reset-1440.png`);

    // 5. Test Outside Click from Navigation Link
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="2"]')?.click();
      const navWork = document.querySelector('.desktop-nav a[href="#work"]');
      navWork?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      navWork?.click();
    })()`);

    const postNavClick = await client.eval(`(() => {
      return {
        activeNodes: document.querySelectorAll('.op-node.is-active').length,
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed')
      };
    })()`);

    assert(postNavClick.activeNodes === 0, 'Clicking navigation link resets pipeline');
    assert(postNavClick.telemetryRevealed === false, 'Navigation link click hides telemetry');

    // 6. Test Escape Key Reset
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="4"]')?.click();
      document.querySelector('.scenario-btn[data-scenario="surge"]')?.click();
    })()`);

    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });

    const postEscape = await client.eval(`(() => {
      return {
        activeNodes: document.querySelectorAll('.op-node.is-active').length,
        activeScenario: document.querySelector('.scenario-btn.is-active')?.dataset.scenario
      };
    })()`);

    assert(postEscape.activeNodes === 0, 'Escape key reset unselects all nodes');
    assert(postEscape.activeScenario === 'normal', 'Escape key reset restores Steady scenario');

    // ========================================================================
    // PRIORITY 2: CUSTOM CIRCULAR CURSOR PERFORMANCE AUDIT
    // ========================================================================
    console.log('\n[Priority 2] Custom Circular Cursor Performance Audit');

    const cursorStyles = await client.eval(`(() => {
      const cursor = document.getElementById('cursorHalo');
      const cs = window.getComputedStyle(cursor);
      return {
        position: cs.position,
        width: cs.width,
        height: cs.height,
        borderRadius: cs.borderRadius,
        pointerEvents: cs.pointerEvents,
        background: cs.backgroundColor,
        transition: cs.transition,
        willChange: cs.willChange
      };
    })()`);

    assert(cursorStyles.position === 'fixed', 'Cursor uses position: fixed');
    assert(cursorStyles.width === '20px' && cursorStyles.height === '20px', 'Cursor is 20px diameter');
    assert(cursorStyles.borderRadius === '50%', 'Cursor is perfectly circular (50% border-radius)');
    assert(cursorStyles.pointerEvents === 'none', 'Cursor has pointer-events: none');
    assert(cursorStyles.background.includes('rgba(0, 0, 0, 0)') || cursorStyles.background === 'transparent', 'Cursor center is completely hollow/transparent');
    assert(!cursorStyles.transition.includes('transform'), 'Zero CSS transition on transform (no artificial position lag)');

    // Test direct pointer position tracking
    await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 450, y: 320 });
    await new Promise(r => setTimeout(r, 60));

    const cursorTransform = await client.eval(`(() => {
      const cursor = document.getElementById('cursorHalo');
      return {
        transform: cursor.style.transform,
        isActive: cursor.classList.contains('is-active')
      };
    })()`);

    assert(cursorTransform.isActive === true, 'Cursor becomes active on pointer move');
    assert(cursorTransform.transform.includes('450px') && cursorTransform.transform.includes('320px'), `Cursor transform directly matches pointer coordinates: "${cursorTransform.transform}"`);
    assert(cursorTransform.transform.includes('translate(-50%, -50%)'), 'Cursor is centered on pointer via translate(-50%, -50%)');

    // Hover interactive element
    await client.eval(`(() => {
      const btn = document.querySelector('.btn-primary');
      btn?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    })()`);

    const cursorHover = await client.eval(`document.getElementById('cursorHalo')?.classList.contains('is-hovering')`);
    assert(cursorHover === true, 'Cursor gains .is-hovering on interactive element');

    // Hover input element
    await client.eval(`(() => {
      const input = document.getElementById('userName');
      input?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    })()`);

    const cursorInput = await client.eval(`document.getElementById('cursorHalo')?.classList.contains('is-input')`);
    assert(cursorInput === true, 'Cursor gains .is-input over form fields to preserve native I-beam cursor');

    // ========================================================================
    // PRIORITY 3: CONTACT PAGE DIRECT CHANNELS REBUILD AUDIT
    // ========================================================================
    console.log('\n[Priority 3] Contact Page Direct Channels Rebuild Audit');

    // 1. Headline & Layout
    const contactLayout = await client.eval(`(() => {
      const headline = document.getElementById('contactHeadline')?.textContent;
      const grid = document.querySelector('.contact-grid');
      const cs = window.getComputedStyle(grid);
      const directCard = document.getElementById('contactDirectCard');
      const formCard = document.getElementById('contactFormCard');
      const r1 = directCard?.getBoundingClientRect();
      const r2 = formCard?.getBoundingClientRect();
      const equalHeight = Math.abs((r1?.height || 0) - (r2?.height || 0)) <= 3;

      return {
        headline,
        alignItems: cs.alignItems,
        equalHeight,
        directCardExists: Boolean(directCard),
        formCardExists: Boolean(formCard)
      };
    })()`);

    assert(contactLayout.headline?.includes('Start an operational conversation'), 'Contact headline is "Start an operational conversation."');
    assert(contactLayout.equalHeight === true, 'Contact cards match equal height and balanced size');
    assert(contactLayout.directCardExists && contactLayout.formCardExists, 'Two complementary columns (Direct Directory + Inquiry Form) present');

    // 2. Directory Rows
    const directRows = await client.eval(`(() => {
      const rows = Array.from(document.querySelectorAll('.direct-channel-row'));
      const labels = rows.map(r => r.querySelector('.channel-row-label')?.textContent?.trim());
      const emailLink = document.getElementById('contactEmailLink')?.getAttribute('href');
      const linkedinLink = document.querySelector('a.channel-row-val[href*="linkedin"]')?.getAttribute('href');
      const resumeLink = document.querySelector('a.btn-channel-download')?.getAttribute('href');
      const locationText = document.querySelector('.channel-val-static')?.textContent?.trim();

      return {
        rowCount: rows.length,
        labels,
        emailLink,
        linkedinLink,
        resumeLink,
        locationText
      };
    })()`);

    assert(directRows.rowCount === 4, 'Direct Channels contains exactly 4 organized directory rows');
    assert(directRows.labels.includes('EMAIL ADDRESS'), 'Channel 1: Email Address row present');
    assert(directRows.emailLink === 'mailto:jayeshsingh9b@gmail.com', 'Email link targets verified address jayeshsingh9b@gmail.com');
    assert(directRows.labels.includes('PROFESSIONAL PROFILE'), 'Channel 2: Professional Profile row present');
    assert(directRows.linkedinLink?.includes('linkedin.com/in/jsingh26'), 'LinkedIn link targets verified profile linkedin.com/in/jsingh26');
    assert(directRows.labels.includes('LOCATION BASE'), 'Channel 3: Location Base row present');
    assert(directRows.locationText === 'Mumbai, India', 'Location is clean "Mumbai, India" without fake coordinates');
    assert(directRows.labels.includes('DOWNLOAD PROFILE'), 'Channel 4: Download Profile row present');
    assert(directRows.resumeLink === 'assets/Jayesh-Singh-Resume.pdf', 'Download link references verified local resume PDF');

    // 3. Test Copy Email Button
    const copyTest = await client.eval(`(() => {
      const copyBtn = document.getElementById('copyEmailBtn');
      copyBtn?.click();
      const btnText = document.getElementById('copyBtnText')?.textContent;
      return { btnText };
    })()`);

    assert(copyTest.btnText?.includes('Copied') || copyTest.btnText?.includes('Email Copied'), 'Copy Email button provides immediate confirmation feedback');

    // 4. Test Category Chips & Gmail URL Redirection
    const formTest = await client.eval(`(() => {
      const chipSupply = document.querySelector('.category-chip[data-topic="supply"]');
      chipSupply?.click();

      const subject = document.getElementById('userSubject')?.value;
      const isCardTinted = document.getElementById('contactFormCard')?.classList.contains('topic-supply');

      // Fill form
      document.getElementById('userName').value = 'Rohan Shah';
      document.getElementById('userEmail').value = 'rohan@enterprise.in';
      document.getElementById('userMsg').value = 'Reviewing logistics network design and lead-time optimization.';

      let capturedUrl = null;
      const origOpen = window.open;
      window.open = (url) => { capturedUrl = url; return null; };

      const form = document.getElementById('inquiryForm');
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

      window.open = origOpen;

      return {
        subject,
        isCardTinted,
        capturedUrl
      };
    })()`);

    assert(formTest.isCardTinted === true, 'Selecting category chip shifts card accent tint');
    assert(formTest.subject?.includes('Supply Chain'), 'Subject line auto-suggests category topic');
    assert(formTest.capturedUrl?.includes('mail.google.com/mail/?view=cm'), 'Form generates valid Gmail Compose redirection URL');
    assert(formTest.capturedUrl?.includes('jayeshsingh9b%40gmail.com'), 'Gmail recipient is verified jayeshsingh9b@gmail.com');
    assert(formTest.capturedUrl?.includes('Rohan%20Shah'), 'Sender name properly encoded in Gmail draft');

    // Scroll to contact section and capture desktop screenshot
    await client.eval(`document.getElementById('contact').scrollIntoView({ behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 200));
    await client.screenshot(`${projectDir}/v27-contact-desktop-1440.png`);

    // ========================================================================
    // MOBILE VIEWPORT VERIFICATION (390 × 844)
    // ========================================================================
    console.log('\n[Mobile Viewport] 390 × 844 Responsive Audit');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 200));

    // Test mobile overflow and stacked columns
    const mobileCheck = await client.eval(`(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const grid = document.querySelector('.contact-grid');
      const cs = window.getComputedStyle(grid);
      return {
        hasOverflow: scrollWidth > clientWidth,
        scrollWidth,
        clientWidth,
        gridColumns: cs.gridTemplateColumns
      };
    })()`);

    assert(mobileCheck.hasOverflow === false, `Mobile has ZERO horizontal overflow (${mobileCheck.scrollWidth}px <= ${mobileCheck.clientWidth}px)`);
    assert(mobileCheck.gridColumns.split(' ').length === 1, 'Contact columns cleanly stack on mobile (1fr)');

    await client.screenshot(`${projectDir}/v27-contact-mobile-390.png`);

    // ========================================================================
    // STRICT PRIVACY AUDIT
    // ========================================================================
    console.log('\n[Privacy Audit] Checking for zero public phone numbers');
    const privacyCheck = await client.eval(`(() => {
      const contactSectionText = document.getElementById('contact')?.innerText || '';
      const regex = /(?:\\+91|91|0)?[6-9]\\d{9}/;
      return {
        hasPhone: regex.test(contactSectionText),
        matched: contactSectionText.match(regex)?.[0] || null
      };
    })()`);

    assert(privacyCheck.hasPhone === false, 'Zero phone numbers exposed in Contact section');

    console.log('\n======================================================');
    console.log(`PORTFOLIO V27 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  } finally {
    client.close();
    chromeProc.kill('SIGTERM');
    process.exit(failed > 0 ? 1 : 0);
  }
}

run();
