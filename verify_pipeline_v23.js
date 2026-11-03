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
    for (let i = 0; i < 20; i++) {
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
  console.log('--- STARTING V23.1 INTERACTIVE OPERATIONS PIPELINE VERIFICATION ---');

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

    // Enable Page and DOM
    await client.send('Page.enable');
    await client.send('DOM.enable');

    // Wait for DOM content
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
    // TEST SUITE 1: Baseline Initial State
    // ========================================================================
    console.log('\n[Suite 1] Baseline Initial State');
    const initialStage = await client.eval(`(() => {
      const activeNode = document.querySelector('.op-node.is-active');
      const stageTag = document.getElementById('telemetryStage')?.textContent;
      const title = document.getElementById('telemetryTitle')?.textContent;
      const scenario = document.querySelector('.scenario-btn.is-active')?.dataset.scenario;
      const loopActive = document.getElementById('feedbackLoopBtn')?.classList.contains('is-active');
      return {
        stageIdx: activeNode?.dataset.stage,
        stageTag,
        title,
        scenario,
        loopActive
      };
    })()`);

    assert(initialStage.stageIdx === '0', 'Initial active node is Stage 0 (Supplier)');
    assert(initialStage.stageTag?.includes('STAGE 01 // SUPPLIER'), 'Stage tag displays STAGE 01 // SUPPLIER');
    assert(initialStage.title === 'Supplier Sourcing & Negotiations', 'Title displays Supplier Sourcing & Negotiations');
    assert(initialStage.scenario === 'normal', 'Initial scenario is Steady (normal)');
    assert(initialStage.loopActive === false, 'Initial feedback loop is inactive (normal latency)');

    // ========================================================================
    // TEST SUITE 2: All 6 Pipeline Stages Selection
    // ========================================================================
    console.log('\n[Suite 2] Six Pipeline Stages - Every Node Must Update');
    const stagesExpected = [
      { idx: 0, tag: 'STAGE 01 // SUPPLIER', title: 'Supplier Sourcing & Negotiations', grounding: 'GROUNDING: ONLY SOLAR SOURCING' },
      { idx: 1, tag: 'STAGE 02 // SOURCING', title: 'Import Logistics & Landed-Cost Modeling', grounding: 'GROUNDING: ONLY SOLAR IMPORT LOGISTICS' },
      { idx: 2, tag: 'STAGE 03 // INVENTORY', title: 'Safety Stock & Replenishment Planning', grounding: 'GROUNDING: ANALYTICAL OPERATIONS MODEL' },
      { idx: 3, tag: 'STAGE 04 // WAREHOUSE', title: 'Depot Storage & Product Availability Flow', grounding: 'GROUNDING: ANALYTICAL OPERATIONS MODEL' },
      { idx: 4, tag: 'STAGE 05 // DISTRIBUTION', title: 'Territory Beat Routing & Fulfillment', grounding: 'GROUNDING: CAVINKARE BEAT ROUTING' },
      { idx: 5, tag: 'STAGE 06 // RETAIL', title: 'Retail Availability & General Trade Execution', grounding: 'GROUNDING: CAVINKARE GT SALES EXECUTION' }
    ];

    for (const st of stagesExpected) {
      const clickRes = await client.eval(`(() => {
        const node = document.querySelector('.op-node[data-stage="${st.idx}"]');
        if (!node) return { error: 'node not found' };
        node.click();
        const activeNode = document.querySelector('.op-node.is-active');
        const activeCount = document.querySelectorAll('.op-node.is-active').length;
        const stageTag = document.getElementById('telemetryStage')?.textContent;
        const title = document.getElementById('telemetryTitle')?.textContent;
        const grounding = document.getElementById('telemetryGrounding')?.textContent;
        const desc = document.getElementById('telemetryDesc')?.textContent;
        const metric = document.getElementById('telemetryMetric')?.textContent;
        return {
          clickedIdx: ${st.idx},
          activeIdx: activeNode?.dataset.stage,
          activeCount,
          stageTag,
          title,
          grounding,
          descLength: desc?.length || 0,
          metric
        };
      })()`);

      assert(clickRes.activeIdx === String(st.idx), `Node ${st.idx} became active`);
      assert(clickRes.activeCount === 1, `Exactly 1 node is active (no multi-selection leak)`);
      assert(clickRes.stageTag === st.tag, `Telemetry stage tag matches "${st.tag}"`);
      assert(clickRes.title === st.title, `Telemetry title matches "${st.title}"`);
      assert(clickRes.grounding === st.grounding, `Telemetry grounding matches "${st.grounding}"`);
      assert(clickRes.descLength > 40, `Telemetry description is populated (${clickRes.descLength} chars)`);
    }

    // Capture screenshot of Stage 02 (Sourcing)
    await client.eval(`document.querySelector('.op-node[data-stage="1"]').click()`);
    await client.screenshot('v23-1-sourcing-active.png');

    // ========================================================================
    // TEST SUITE 3: Three Scenarios (Steady / Delay / Surge)
    // ========================================================================
    console.log('\n[Suite 3] Three Scenarios (Steady / Delay / Surge)');

    // Test Delay Scenario
    const delayRes = await client.eval(`(() => {
      const delayBtn = document.querySelector('.scenario-btn[data-scenario="delay"]');
      delayBtn.click();
      const sourcingNode = document.querySelector('.op-node[data-stage="1"]');
      const isBottleneck = sourcingNode?.classList.contains('is-bottleneck');
      const bannerPill = document.getElementById('telemetryScenarioPill')?.textContent;
      const impactText = document.getElementById('telemetryScenarioImpact')?.textContent;
      const fwdPulseDuration = document.querySelector('.pipe-pulse')?.style.animationDuration;
      return {
        isBottleneck,
        bannerPill,
        impactText,
        fwdPulseDuration
      };
    })()`);

    assert(delayRes.isBottleneck === true, 'Delay scenario applies .is-bottleneck to Sourcing (node 1)');
    assert(delayRes.bannerPill?.includes('BOTTLENECK ALERT'), 'Telemetry banner shows BOTTLENECK ALERT');
    assert(delayRes.impactText?.includes('BOTTLENECK') || delayRes.impactText?.includes('delay'), 'Telemetry scenario impact explains delay/bottleneck effect');
    assert(delayRes.fwdPulseDuration === '10s', 'Forward pulse slowed to 10s');
    await client.screenshot('v23-1-delay-bottleneck.png');

    // Test Surge Scenario
    const surgeRes = await client.eval(`(() => {
      const surgeBtn = document.querySelector('.scenario-btn[data-scenario="surge"]');
      surgeBtn.click();
      const sourcingNode = document.querySelector('.op-node[data-stage="1"]');
      const distNode = document.querySelector('.op-node[data-stage="4"]');
      const retailNode = document.querySelector('.op-node[data-stage="5"]');
      const bannerPill = document.getElementById('telemetryScenarioPill')?.textContent;
      const impactText = document.getElementById('telemetryScenarioImpact')?.textContent;
      const fwdPulseDuration = document.querySelector('.pipe-pulse')?.style.animationDuration;
      return {
        sourcingBottleneck: sourcingNode?.classList.contains('is-bottleneck'),
        distSurge: distNode?.classList.contains('is-surge'),
        retailSurge: retailNode?.classList.contains('is-surge'),
        bannerPill,
        impactText,
        fwdPulseDuration
      };
    })()`);

    assert(surgeRes.sourcingBottleneck === false, 'Sourcing node loses bottleneck in Surge scenario');
    assert(surgeRes.distSurge === true, 'Distribution node (4) gains .is-surge');
    assert(surgeRes.retailSurge === true, 'Retail node (5) gains .is-surge');
    assert(surgeRes.bannerPill?.includes('DEMAND SURGE'), 'Telemetry banner shows DEMAND SURGE');
    assert(surgeRes.fwdPulseDuration === '2.2s', 'Forward pulse accelerated to 2.2s');
    await client.screenshot('v23-1-surge-pressure.png');

    // Test Steady Scenario
    const steadyRes = await client.eval(`(() => {
      const steadyBtn = document.querySelector('.scenario-btn[data-scenario="normal"]');
      steadyBtn.click();
      const distNode = document.querySelector('.op-node[data-stage="4"]');
      const bannerPill = document.getElementById('telemetryScenarioPill')?.textContent;
      const fwdPulseDuration = document.querySelector('.pipe-pulse')?.style.animationDuration;
      return {
        distSurge: distNode?.classList.contains('is-surge'),
        bannerPill,
        fwdPulseDuration
      };
    })()`);

    assert(steadyRes.distSurge === false, 'Nodes lose .is-surge in Steady scenario');
    assert(steadyRes.bannerPill?.includes('STEADY STATE'), 'Telemetry banner restores STEADY STATE');
    assert(steadyRes.fwdPulseDuration === '5s', 'Forward pulse restored to 5s nominal');

    // ========================================================================
    // TEST SUITE 4: Reverse Demand Feedback Loop (Toggle Button)
    // ========================================================================
    console.log('\n[Suite 4] Reverse Demand Feedback Loop Toggle');

    // Click 1: Activate Reverse Feedback Loop
    const loopOnRes = await client.eval(`(() => {
      const loopBtn = document.getElementById('feedbackLoopBtn');
      loopBtn.click();
      const isActive = loopBtn.classList.contains('is-active');
      const ariaPressed = loopBtn.getAttribute('aria-pressed');
      const badgeText = document.getElementById('loopBadgeText')?.textContent;
      const loopPill = document.getElementById('telemetryLoopPill')?.textContent;
      const loopPillEngaged = document.getElementById('telemetryLoopPill')?.classList.contains('is-engaged');
      const pulseDirection = document.querySelector('.pulse-feedback')?.style.animationDirection;
      return {
        isActive,
        ariaPressed,
        badgeText,
        loopPill,
        loopPillEngaged,
        pulseDirection
      };
    })()`);

    assert(loopOnRes.isActive === true, 'Feedback loop button gains .is-active');
    assert(loopOnRes.ariaPressed === 'true', 'Feedback loop button aria-pressed is "true"');
    assert(loopOnRes.badgeText?.includes('DEMAND PULL ACTIVE'), 'Badge text changes to DEMAND PULL ACTIVE');
    assert(loopOnRes.loopPill?.includes('Upstream Pull Engaged'), 'Telemetry loop pill shows Upstream Pull Engaged');
    assert(loopOnRes.loopPillEngaged === true, 'Telemetry loop pill has .is-engaged styling');
    assert(loopOnRes.pulseDirection === 'reverse', 'Pulse animation direction changed to reverse');
    await client.screenshot('v23-1-reverse-loop.png');

    // Click 2: Deactivate / Restore Feedback Loop
    const loopOffRes = await client.eval(`(() => {
      const loopBtn = document.getElementById('feedbackLoopBtn');
      loopBtn.click();
      const isActive = loopBtn.classList.contains('is-active');
      const ariaPressed = loopBtn.getAttribute('aria-pressed');
      const badgeText = document.getElementById('loopBadgeText')?.textContent;
      const loopPill = document.getElementById('telemetryLoopPill')?.textContent;
      const pulseDirection = document.querySelector('.pulse-feedback')?.style.animationDirection;
      return {
        isActive,
        ariaPressed,
        badgeText,
        loopPill,
        pulseDirection
      };
    })()`);

    assert(loopOffRes.isActive === false, 'Feedback loop button restores inactive state');
    assert(loopOffRes.ariaPressed === 'false', 'Feedback loop button aria-pressed is "false"');
    assert(loopOffRes.badgeText === 'REVERSE DEMAND FEEDBACK LOOP ↺', 'Badge text restores REVERSE DEMAND FEEDBACK LOOP ↺');
    assert(loopOffRes.loopPill?.includes('Standard Latency'), 'Telemetry loop pill restores Standard Latency');
    assert(loopOffRes.pulseDirection === 'normal', 'Pulse animation direction restores normal');

    // ========================================================================
    // TEST SUITE 5: Combined Independent States
    // ========================================================================
    console.log('\n[Suite 5] Combined Independent States (No state clobbering)');

    // Combination: Stage 4 (Distribution) + Delay + Feedback Loop On
    const comboRes = await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="4"]').click();
      document.querySelector('.scenario-btn[data-scenario="delay"]').click();
      document.getElementById('feedbackLoopBtn').click();

      const activeStage = document.querySelector('.op-node.is-active')?.dataset.stage;
      const scenario = document.querySelector('.scenario-btn.is-active')?.dataset.scenario;
      const loopActive = document.getElementById('feedbackLoopBtn')?.classList.contains('is-active');
      const stageTag = document.getElementById('telemetryStage')?.textContent;
      const bannerPill = document.getElementById('telemetryScenarioPill')?.textContent;
      const loopPill = document.getElementById('telemetryLoopPill')?.textContent;
      const impactText = document.getElementById('telemetryScenarioImpact')?.textContent;

      return {
        activeStage,
        scenario,
        loopActive,
        stageTag,
        bannerPill,
        loopPill,
        impactText
      };
    })()`);

    assert(comboRes.activeStage === '4', 'Stage 4 (Distribution) remains active');
    assert(comboRes.scenario === 'delay', 'Delay scenario remains active');
    assert(comboRes.loopActive === true, 'Feedback loop remains active');
    assert(comboRes.stageTag?.includes('STAGE 05 // DISTRIBUTION'), 'Stage tag displays Distribution');
    assert(comboRes.bannerPill?.includes('BOTTLENECK ALERT'), 'Banner displays Bottleneck Alert');
    assert(comboRes.loopPill?.includes('Upstream Pull Engaged'), 'Loop pill displays Upstream Pull Engaged');
    assert(comboRes.impactText?.includes('ration') || comboRes.impactText?.includes('Beat'), 'Distribution delay scenario explanation displayed');
    await client.screenshot('v23-1-combined-state.png');

    // Now switch stage to 5 (Retail) without touching scenario or loop:
    const switchStageRes = await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="5"]').click();
      return {
        activeStage: document.querySelector('.op-node.is-active')?.dataset.stage,
        scenario: document.querySelector('.scenario-btn.is-active')?.dataset.scenario,
        loopActive: document.getElementById('feedbackLoopBtn')?.classList.contains('is-active'),
        stageTag: document.getElementById('telemetryStage')?.textContent,
        bannerPill: document.getElementById('telemetryScenarioPill')?.textContent
      };
    })()`);

    assert(switchStageRes.activeStage === '5', 'Stage successfully changed to 5 (Retail)');
    assert(switchStageRes.scenario === 'delay', 'Scenario preserved as Delay (not reset!)');
    assert(switchStageRes.loopActive === true, 'Feedback loop preserved as Active (not reset!)');

    // ========================================================================
    // TEST SUITE 6: Keyboard Accessibility Navigation
    // ========================================================================
    console.log('\n[Suite 6] Keyboard Accessibility (Arrow Keys & Enter/Space)');

    const kbdRes = await client.eval(`(() => {
      // Focus node 0
      const node0 = document.querySelector('.op-node[data-stage="0"]');
      node0.focus();

      // Trigger ArrowRight
      node0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      const stageAfterRight = document.querySelector('.op-node.is-active')?.dataset.stage;

      // Trigger ArrowRight again
      const node1 = document.querySelector('.op-node[data-stage="1"]');
      node1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      const stageAfterSecondRight = document.querySelector('.op-node.is-active')?.dataset.stage;

      // Trigger ArrowLeft
      const node2 = document.querySelector('.op-node[data-stage="2"]');
      node2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      const stageAfterLeft = document.querySelector('.op-node.is-active')?.dataset.stage;

      return {
        stageAfterRight,
        stageAfterSecondRight,
        stageAfterLeft
      };
    })()`);

    assert(kbdRes.stageAfterRight === '1', 'ArrowRight moves selection from Stage 0 to Stage 1');
    assert(kbdRes.stageAfterSecondRight === '2', 'ArrowRight moves selection from Stage 1 to Stage 2');
    assert(kbdRes.stageAfterLeft === '1', 'ArrowLeft moves selection from Stage 2 back to Stage 1');

    // ========================================================================
    // TEST SUITE 7: Layout Viewport & Responsiveness
    // ========================================================================
    console.log('\n[Suite 7] Viewport Layout & Mobile Responsiveness');

    // Reset to Stage 0, Normal Scenario, Standard Loop for clean default screenshot
    await client.eval(`(() => {
      document.querySelector('.op-node[data-stage="0"]').click();
      document.querySelector('.scenario-btn[data-scenario="normal"]').click();
      if (document.getElementById('feedbackLoopBtn').classList.contains('is-active')) {
        document.getElementById('feedbackLoopBtn').click();
      }
    })()`);

    await client.screenshot('v23-1-desktop-1440.png');

    // Set mobile viewport 500x900
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 500,
      height: 900,
      deviceScaleFactor: 2,
      mobile: true
    });

    const mobileRes = await client.eval(`(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const card = document.getElementById('operationsVisual');
      const cardWidth = card ? card.offsetWidth : 0;
      return {
        scrollWidth,
        clientWidth,
        hasHorizontalOverflow: scrollWidth > clientWidth,
        cardWidth
      };
    })()`);

    assert(mobileRes.hasHorizontalOverflow === false, 'Mobile viewport (500px) has ZERO horizontal overflow');
    assert(mobileRes.cardWidth > 300, `Operations card fits comfortably at ${mobileRes.cardWidth}px`);
    await client.screenshot('v23-1-mobile-500.png');

    console.log(`\n======================================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
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
