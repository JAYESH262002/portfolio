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
  console.log('--- STARTING OPERATIONS PIPELINE OUTSIDE-CLICK VERIFICATION ---');

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

    // Wait for initial render
    await new Promise(r => setTimeout(r, 500));

    // ========================================================================
    // TEST SUITE 1: VERIFY INITIAL MINIMAL STATE
    // ========================================================================
    console.log('[Suite 1] Baseline Minimal Initial State');
    const initialState = await client.eval(`(() => {
      const activeNodes = document.querySelectorAll('.op-node.is-active').length;
      const telemetryRevealed = document.getElementById('nodeTelemetry')?.classList.contains('is-revealed');
      const scenarioDetailsOpen = document.getElementById('scenarioDetailsBox')?.style.display !== 'none';
      const activeScenario = document.querySelector('.scenario-btn.is-active')?.dataset.scenario;
      const isReversed = document.getElementById('feedbackLoopBtn')?.classList.contains('is-active');

      return {
        activeNodes,
        telemetryRevealed,
        scenarioDetailsOpen,
        activeScenario,
        isReversed
      };
    })()`);

    assert(initialState.activeNodes === 0, 'No pipeline nodes are active initially');
    assert(initialState.telemetryRevealed === false, 'Stage telemetry panel is hidden by default');
    assert(initialState.scenarioDetailsOpen === false, 'Scenario details drawer is closed by default');
    assert(initialState.activeScenario === 'normal', 'Default scenario is Steady (normal)');
    assert(initialState.isReversed === false, 'Default feedback loop direction is forward');

    // ========================================================================
    // TEST SUITE 2: SELECT SUPPLIER (STAGE 0) & EXPAND DETAILS
    // ========================================================================
    console.log('\n[Suite 2] Step 1 & 2: Select Stage 01 (Supplier) & Expand Details');
    const stage01Expanded = await client.eval(`(() => {
      // 1. Click Stage 01 (Supplier)
      const node0 = document.querySelector('.op-node[data-stage="0"]');
      node0.click();

      // 2. Click "Explore this stage" button
      const exploreBtn = document.getElementById('exploreStageBtn');
      exploreBtn?.click();

      const activeNodes = document.querySelectorAll('.op-node.is-active').length;
      const node0Active = node0.classList.contains('is-active');
      const telemetryRevealed = document.getElementById('nodeTelemetry')?.classList.contains('is-revealed');
      const stageTitle = document.getElementById('telemetryTitle')?.textContent;
      const exploreOpen = document.getElementById('exploreStageContent')?.style.display !== 'none';

      return {
        activeNodes,
        node0Active,
        telemetryRevealed,
        stageTitle,
        exploreOpen
      };
    })()`);

    assert(stage01Expanded.activeNodes === 1 && stage01Expanded.node0Active, 'Stage 01 (Supplier) is active');
    assert(stage01Expanded.telemetryRevealed === true, 'Stage telemetry panel is revealed');
    assert(stage01Expanded.stageTitle?.includes('Supplier Sourcing'), 'Stage 01 displays Supplier Sourcing & Negotiations');
    assert(stage01Expanded.exploreOpen === true, 'Explore Stage drawer is expanded');

    // ========================================================================
    // TEST SUITE 3: CLICK INSIDE TELEMETRY PANEL — MUST REMAIN EXPANDED
    // ========================================================================
    console.log('\n[Suite 3] Step 3: Click Inside Panel — Must Remain Expanded');
    const clickInsideRes = await client.eval(`(() => {
      // Click inside the telemetry description paragraph
      const descElem = document.getElementById('telemetryDesc');
      descElem?.click();

      // Click inside focus pill
      const focusPill = document.getElementById('telemetryMetric');
      focusPill?.click();

      // Click card background
      const visualCard = document.getElementById('operationsVisual');
      visualCard?.click();

      const node0Active = document.querySelector('.op-node[data-stage="0"]')?.classList.contains('is-active');
      const telemetryRevealed = document.getElementById('nodeTelemetry')?.classList.contains('is-revealed');
      const exploreOpen = document.getElementById('exploreStageContent')?.style.display !== 'none';

      return {
        node0Active,
        telemetryRevealed,
        exploreOpen
      };
    })()`);

    assert(clickInsideRes.node0Active === true, 'Stage 01 remains active after clicking inside panel');
    assert(clickInsideRes.telemetryRevealed === true, 'Telemetry panel remains revealed after clicking inside panel');
    assert(clickInsideRes.exploreOpen === true, 'Explore content remains expanded after clicking inside panel');

    // ========================================================================
    // TEST SUITE 4: SELECT DELAY & CLICK ANOTHER STAGE (INVENTORY)
    // ========================================================================
    console.log('\n[Suite 4] Step 4 & 5: Select Delay Scenario & Click Another Stage (Inventory)');
    const stageSwitchRes = await client.eval(`(() => {
      // 1. Select Delay scenario
      const delayBtn = document.querySelector('.scenario-btn[data-scenario="delay"]');
      delayBtn?.click();

      // 2. Open Scenario Details
      document.getElementById('scenarioDetailsToggleBtn')?.click();

      // 3. Click Stage 03 (Inventory)
      const node2 = document.querySelector('.op-node[data-stage="2"]');
      node2.click();

      const activeNodes = document.querySelectorAll('.op-node.is-active').length;
      const node2Active = node2.classList.contains('is-active');
      const activeScenario = document.querySelector('.scenario-btn.is-active')?.dataset.scenario;
      const stageTitle = document.getElementById('telemetryTitle')?.textContent;
      const scenarioDetailsOpen = document.getElementById('scenarioDetailsBox')?.style.display !== 'none';
      const isSourcingBottleneck = document.querySelector('.op-node[data-stage="1"]')?.classList.contains('is-bottleneck');

      return {
        activeNodes,
        node2Active,
        activeScenario,
        stageTitle,
        scenarioDetailsOpen,
        isSourcingBottleneck
      };
    })()`);

    assert(stageSwitchRes.activeNodes === 1 && stageSwitchRes.node2Active, 'Stage 03 (Inventory) became active without closing system');
    assert(stageSwitchRes.activeScenario === 'delay', 'Scenario remains Delay without resetting on internal switch');
    assert(stageSwitchRes.isSourcingBottleneck === true, 'Sourcing node highlights bottleneck (+12D)');
    assert(stageSwitchRes.stageTitle?.includes('Safety Stock'), 'Telemetry updated to Inventory (Safety Stock & Replenishment)');
    assert(stageSwitchRes.scenarioDetailsOpen === true, 'Scenario details drawer remains open');

    // ========================================================================
    // TEST SUITE 5: CLICK OUTSIDE PIPELINE BOX — MUST COLLAPSE & RESET TO DEFAULT
    // ========================================================================
    console.log('\n[Suite 5] Step 6 & 7: Click Outside Pipeline Box — Collapse & Reset to Default');
    await client.eval(`(() => {
      // Click on the hero title outside the pipeline card
      const heroHeading = document.querySelector('.hero-content h1');
      heroHeading?.click();
    })()`);

    // Allow smooth 220ms collapse animation to finish
    await new Promise(r => setTimeout(r, 300));

    const resetState = await client.eval(`(() => {
      const activeNodes = document.querySelectorAll('.op-node.is-active').length;
      const telemetryRevealed = document.getElementById('nodeTelemetry')?.classList.contains('is-revealed');
      const telemetryCollapsing = document.getElementById('nodeTelemetry')?.classList.contains('is-collapsing');
      const scenarioDetailsOpen = document.getElementById('scenarioDetailsBox')?.style.display !== 'none';
      const activeScenario = document.querySelector('.scenario-btn.is-active')?.dataset.scenario;
      const isReversed = document.getElementById('feedbackLoopBtn')?.classList.contains('is-active');
      const statusPill = document.getElementById('statusStripScenarioPill')?.textContent;

      return {
        activeNodes,
        telemetryRevealed,
        telemetryCollapsing,
        scenarioDetailsOpen,
        activeScenario,
        isReversed,
        statusPill
      };
    })()`);

    assert(resetState.activeNodes === 0, 'Outside click unselected all 6 pipeline nodes');
    assert(resetState.telemetryRevealed === false && resetState.telemetryCollapsing === false, 'Stage telemetry panel is completely collapsed');
    assert(resetState.scenarioDetailsOpen === false, 'Scenario details drawer is closed');
    assert(resetState.activeScenario === 'normal', 'Scenario is reset to Steady (normal)');
    assert(resetState.isReversed === false, 'Feedback loop direction is reset to default');
    assert(resetState.statusPill?.includes('STEADY STATE'), 'Status strip restored to STEADY STATE');

    await client.screenshot(`${projectDir}/v26-pipeline-reset-desktop.png`);

    // ========================================================================
    // TEST SUITE 6: ESCAPE KEY RESET
    // ========================================================================
    console.log('\n[Suite 6] Escape Key Reset Verification');
    // Open stage 05 (Distribution), activate feedback loop, select surge
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="4"]')?.click();
      document.querySelector('.scenario-btn[data-scenario="surge"]')?.click();
      document.getElementById('feedbackLoopBtn')?.click();
      document.getElementById('scenarioDetailsToggleBtn')?.click();
    })()`);

    const preEscape = await client.eval(`(() => {
      return {
        node4Active: document.querySelector('.op-node[data-stage="4"]')?.classList.contains('is-active'),
        activeScenario: document.querySelector('.scenario-btn.is-active')?.dataset.scenario,
        isReversed: document.getElementById('feedbackLoopBtn')?.classList.contains('is-active'),
        scenarioDetailsOpen: document.getElementById('scenarioDetailsBox')?.style.display !== 'none'
      };
    })()`);

    assert(preEscape.node4Active && preEscape.activeScenario === 'surge' && preEscape.isReversed, 'Pipeline expanded and configured prior to Escape');

    // Press Escape key
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });

    await new Promise(r => setTimeout(r, 300));

    const postEscape = await client.eval(`(() => {
      return {
        activeNodes: document.querySelectorAll('.op-node.is-active').length,
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed'),
        activeScenario: document.querySelector('.scenario-btn.is-active')?.dataset.scenario,
        isReversed: document.getElementById('feedbackLoopBtn')?.classList.contains('is-active'),
        scenarioDetailsOpen: document.getElementById('scenarioDetailsBox')?.style.display !== 'none'
      };
    })()`);

    assert(postEscape.activeNodes === 0, 'Escape key reset unselected all nodes');
    assert(postEscape.telemetryRevealed === false, 'Escape key collapsed telemetry panel');
    assert(postEscape.activeScenario === 'normal', 'Escape key reset scenario to Steady');
    assert(postEscape.isReversed === false, 'Escape key reset feedback loop to forward');
    assert(postEscape.scenarioDetailsOpen === false, 'Escape key closed scenario details');

    // ========================================================================
    // TEST SUITE 7: OUTSIDE CLICKS ON NAVIGATION & OTHER SECTIONS
    // ========================================================================
    console.log('\n[Suite 7] Outside Clicks on Header, Nav & Sections');
    // Open stage 02 (Sourcing)
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="1"]')?.click();
    })()`);

    // Click outside on the "Work" navigation link
    await client.eval(`(() => {
      const workLink = document.querySelector('.desktop-nav a[href="#work"]');
      workLink?.click();
    })()`);

    await new Promise(r => setTimeout(r, 300));

    const postNavClick = await client.eval(`(() => {
      return {
        activeNodes: document.querySelectorAll('.op-node.is-active').length,
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed')
      };
    })()`);

    assert(postNavClick.activeNodes === 0, 'Clicking navigation link resets pipeline');
    assert(postNavClick.telemetryRevealed === false, 'Clicking navigation link collapses telemetry');

    // Open stage 06 (Retail)
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="5"]')?.click();
    })()`);

    // Click on page background (<main>)
    await client.eval(`(() => {
      document.querySelector('main')?.click();
    })()`);

    await new Promise(r => setTimeout(r, 300));

    const postBackgroundClick = await client.eval(`(() => {
      return {
        activeNodes: document.querySelectorAll('.op-node.is-active').length,
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed')
      };
    })()`);

    assert(postBackgroundClick.activeNodes === 0, 'Clicking page background resets pipeline');
    assert(postBackgroundClick.telemetryRevealed === false, 'Clicking page background collapses telemetry');

    // ========================================================================
    // TEST SUITE 8: MOBILE VIEWPORT & TAP OUTSIDE RESET (390 × 844)
    // ========================================================================
    console.log('\n[Suite 8] Mobile Viewport Tap Outside Reset (390 × 844)');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 300));

    // Tap Stage 01 (Supplier) on mobile
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="0"]')?.click();
    })()`);

    const mobileOpened = await client.eval(`(() => {
      return {
        node0Active: document.querySelector('.op-node[data-stage="0"]')?.classList.contains('is-active'),
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed')
      };
    })()`);

    assert(mobileOpened.node0Active && mobileOpened.telemetryRevealed, 'Mobile tap opens Stage 01 and reveals telemetry');

    // Tap outside on mobile hero paragraph
    await client.eval(`(() => {
      document.querySelector('.hero-content p')?.click();
    })()`);

    await new Promise(r => setTimeout(r, 300));

    const mobileReset = await client.eval(`(() => {
      return {
        activeNodes: document.querySelectorAll('.op-node.is-active').length,
        telemetryRevealed: document.getElementById('nodeTelemetry')?.classList.contains('is-revealed'),
        activeScenario: document.querySelector('.scenario-btn.is-active')?.dataset.scenario
      };
    })()`);

    assert(mobileReset.activeNodes === 0, 'Tapping outside on mobile unselects all nodes');
    assert(mobileReset.telemetryRevealed === false, 'Tapping outside on mobile collapses telemetry');
    assert(mobileReset.activeScenario === 'normal', 'Tapping outside on mobile restores Steady scenario');

    await client.eval(`window.scrollTo(0, 0)`);
    await new Promise(r => setTimeout(r, 200));
    await client.screenshot(`${projectDir}/v26-pipeline-reset-mobile-390.png`);

    console.log('\n======================================================');
    console.log(`OUTSIDE-CLICK TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
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
