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
    this.consoleMessages = [];
    this.runtimeExceptions = [];
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
              if (data.method === 'Console.messageAdded') {
                this.consoleMessages.push(data.params.message);
              }
              if (data.method === 'Runtime.exceptionThrown') {
                this.runtimeExceptions.push(data.params.exceptionDetails);
              }
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
    fs.writeFileSync(path.join(projectDir, 'tests', 'screenshots', filename), buffer);
    console.log(`  Saved screenshot: ${filename} (${buffer.length} bytes)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('  STARTING COMPREHENSIVE FINAL PORTFOLIO AUDIT & QA SUITE');
  console.log('================================================================');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,1100',
    htmlUrl
  ]);

  const client = new CDPClient(9222);

  try {
    await client.connect();
    console.log('Connected to Chrome DevTools Protocol!');

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Console.enable');
    await client.send('Runtime.enable');

    await client.eval('new Promise(r => setTimeout(r, 600))');

    let passed = 0;
    let failed = 0;
    const bugs = [];

    function assert(condition, testName, bugDetails = null) {
      if (condition) {
        console.log(`  PASS: ${testName}`);
        passed++;
      } else {
        console.error(`  FAIL: ${testName}`);
        failed++;
        if (bugDetails) bugs.push(bugDetails);
        else bugs.push(testName);
      }
    }

    // ========================================================================
    // 1. CONSOLE & RUNTIME ERROR AUDIT
    // ========================================================================
    console.log('\n--- 1. CONSOLE & RUNTIME ERROR AUDIT ---');
    const errorLogs = client.consoleMessages.filter(m => m.level === 'error');
    assert(client.runtimeExceptions.length === 0, 'Zero uncaught runtime exceptions during page lifecycle');
    assert(errorLogs.length === 0, 'Zero browser console error messages generated');

    // ========================================================================
    // 2. HEADER & NAVIGATION AUDIT
    // ========================================================================
    console.log('\n--- 2. HEADER & NAVIGATION AUDIT ---');
    const headerInfo = await client.eval(`(() => {
      const header = document.getElementById('siteHeader');
      const navLinks = Array.from(document.querySelectorAll('.desktop-nav .nav-link')).map(l => ({
        href: l.getAttribute('href'),
        text: l.textContent.trim(),
        targetExists: !!document.querySelector(l.getAttribute('href'))
      }));
      const themeToggle = document.getElementById('themeToggle');
      const initialTheme = document.documentElement.dataset.theme;
      
      // Test theme toggle
      themeToggle.click();
      const toggledTheme = document.documentElement.dataset.theme;
      themeToggle.click(); // revert
      const revertedTheme = document.documentElement.dataset.theme;

      // Test IST live clock
      const clockText = document.getElementById('liveClock')?.textContent;

      return {
        headerExists: !!header,
        isFixed: window.getComputedStyle(header).position === 'fixed',
        navLinks,
        initialTheme,
        toggledTheme,
        revertedTheme,
        clockText
      };
    })()`);

    assert(headerInfo.headerExists && headerInfo.isFixed, 'Floating header exists with position: fixed');
    assert(headerInfo.navLinks.length === 6, 'Desktop navigation contains 6 core section links');
    headerInfo.navLinks.forEach(l => {
      assert(l.targetExists, `Nav destination ${l.href} (${l.text}) exists on page`);
    });
    assert(headerInfo.toggledTheme !== headerInfo.initialTheme, 'Theme toggle switches between light and dark themes');
    assert(headerInfo.revertedTheme === headerInfo.initialTheme, 'Theme toggle cleanly reverts back to original theme');
    assert(Boolean(headerInfo.clockText) && headerInfo.clockText.includes(':'), `Live Mumbai IST clock active: "${headerInfo.clockText}"`);

    // ========================================================================
    // 3. OPERATIONS PIPELINE & DEMAND LOOP AUDIT
    // ========================================================================
    console.log('\n--- 3. OPERATIONS PIPELINE & DEMAND LOOP AUDIT ---');
    const pipelineAudit = await client.eval(`(() => {
      // 1. Initial State
      const initialActiveCount = document.querySelectorAll('.op-node.is-active').length;
      const initialTelemetryRevealed = document.getElementById('nodeTelemetry')?.classList.contains('is-revealed');
      const statusPill = document.getElementById('statusStripScenarioPill')?.textContent;

      // 2. Test Node 01 Click
      const node0 = document.querySelector('.op-node[data-stage="0"]');
      node0.click();
      const node0Revealed = document.getElementById('nodeTelemetry')?.classList.contains('is-revealed');
      const node0Title = document.getElementById('telemetryTitle')?.textContent;

      // 3. Test Explore Stage Drawer Toggle
      const exploreBtn = document.getElementById('exploreStageBtn');
      exploreBtn.click();
      const exploreOpen = document.getElementById('exploreStageContent')?.style.display === 'block';
      exploreBtn.click();
      const exploreClosed = document.getElementById('exploreStageContent')?.style.display === 'none';

      // 4. Test Scenario Details Drawer Toggle
      const scenarioDetailsBtn = document.getElementById('scenarioDetailsToggleBtn');
      scenarioDetailsBtn.click();
      const scenarioDetailsOpen = document.getElementById('scenarioDetailsBox')?.style.display === 'block';
      scenarioDetailsBtn.click();
      const scenarioDetailsClosed = document.getElementById('scenarioDetailsBox')?.style.display === 'none';

      // 5. Test Delay Scenario
      document.querySelector('.scenario-btn[data-scenario="delay"]').click();
      const isDelayBottleneck = document.querySelector('.op-node[data-stage="1"]')?.classList.contains('is-bottleneck');
      const delayStatusText = document.getElementById('statusStripScenarioPill')?.textContent;

      // 6. Test Surge Scenario
      document.querySelector('.scenario-btn[data-scenario="surge"]').click();
      const isSurgeDist = document.querySelector('.op-node[data-stage="4"]')?.classList.contains('is-surge');
      const isSurgeRetail = document.querySelector('.op-node[data-stage="5"]')?.classList.contains('is-surge');

      // 7. Test Reverse Feedback Loop Toggle
      const loopBtn = document.getElementById('feedbackLoopBtn');
      loopBtn.click();
      const isLoopActive = loopBtn.classList.contains('is-active');
      const pulseDirection = document.querySelector('.pulse-feedback')?.style.animationDirection;
      loopBtn.click(); // revert

      // Restore Steady state
      document.querySelector('.scenario-btn[data-scenario="normal"]').click();

      return {
        initialActiveCount,
        initialTelemetryRevealed,
        statusPill,
        node0Revealed,
        node0Title,
        exploreOpen,
        exploreClosed,
        scenarioDetailsOpen,
        scenarioDetailsClosed,
        isDelayBottleneck,
        delayStatusText,
        isSurgeDist,
        isSurgeRetail,
        isLoopActive,
        pulseDirection
      };
    })()`);

    assert(pipelineAudit.initialActiveCount === 0, 'Pipeline starts minimal by default (0 nodes active initially)');
    assert(pipelineAudit.initialTelemetryRevealed === false, 'Stage telemetry panel hidden by default');
    assert(pipelineAudit.node0Revealed === true, 'Clicking Stage 01 reveals stage telemetry panel');
    assert(pipelineAudit.node0Title === 'Supplier Sourcing & Negotiations', 'Stage 01 displays Supplier Sourcing & Negotiations');
    assert(pipelineAudit.exploreOpen && pipelineAudit.exploreClosed, 'Explore Stage drawer toggles open and closed on demand');
    assert(pipelineAudit.scenarioDetailsOpen && pipelineAudit.scenarioDetailsClosed, 'Scenario Details drawer toggles open and closed on demand');
    assert(pipelineAudit.isDelayBottleneck === true, 'Delay scenario highlights Stage 02 Sourcing bottleneck (+12D)');
    assert(pipelineAudit.delayStatusText?.includes('BOTTLENECK ALERT'), 'Delay scenario updates status pill to BOTTLENECK ALERT');
    assert(pipelineAudit.isSurgeDist && pipelineAudit.isSurgeRetail, 'Surge scenario highlights Distribution & Retail stages');
    assert(pipelineAudit.isLoopActive && pipelineAudit.pulseDirection === 'reverse', 'Reverse Demand Feedback loop button activates reverse upstream flow');

    // ========================================================================
    // 4. SELECTED WORK & CASE STUDY DOSSIERS AUDIT
    // ========================================================================
    console.log('\n--- 4. SELECTED WORK & CASE STUDY DOSSIERS AUDIT ---');
    const workAudit = await client.eval(`(() => {
      const cards = Array.from(document.querySelectorAll('.project-card'));
      const cardIds = cards.map(c => c.dataset.projectId);

      // Test Case Study Modal Trigger (CavinKare Dossier)
      const cavinTrigger = document.querySelector('[data-open-case="cavinkare"]');
      cavinTrigger?.click();
      const dlg = document.getElementById('caseDialog');
      const isOpen = dlg?.open;
      const title = document.querySelector('#caseDialogBody .dialog-title')?.textContent;
      const takeaways = document.querySelector('.dossier-takeaways')?.textContent;
      const body = document.getElementById('caseDialogBody')?.textContent;

      // Close modal
      document.querySelector('[data-close-dialog="caseDialog"]')?.click();
      const isClosed = !dlg?.open;

      return {
        cardCount: cards.length,
        cardIds,
        modalOpens: isOpen,
        modalCloses: isClosed,
        dossierTitle: title,
        dossierTakeaways: takeaways,
        dossierBody: body
      };
    })()`);

    assert(workAudit.cardCount === 4, 'Exactly 4 selected work project cards present');
    assert(workAudit.cardIds.includes('cavinkare') && workAudit.cardIds.includes('onlysolar'), 'Case studies include confirmed CavinKare and Only Solar work');
    assert(workAudit.modalOpens === true, 'Clicking View Case Study Dossier opens caseDialog');
    assert(workAudit.dossierTitle?.includes('Making a Beat Work Harder'), 'CavinKare dossier populates correct title');
    assert(workAudit.dossierTakeaways?.includes('distribution') || workAudit.dossierBody?.includes('General Trade'), 'CavinKare dossier populates authentic takeaways');
    assert(workAudit.modalCloses === true, 'Case study dialog closes cleanly on close button click');

    // ========================================================================
    // 5. PROFESSIONAL JOURNEY & CAREER MILESTONES AUDIT
    // ========================================================================
    console.log('\n--- 5. PROFESSIONAL JOURNEY & CAREER MILESTONES AUDIT ---');
    const journeyAudit = await client.eval(`(() => {
      const rows = Array.from(document.querySelectorAll('.timeline-row'));
      const milestoneKeys = rows.map(r => r.dataset.milestone);

      // Test clicking CavinKare milestone inspector
      const cavinInspectBtn = document.querySelector('[data-inspect-milestone="cavinkare"]');
      cavinInspectBtn?.click();
      const dlg = document.getElementById('milestoneDialog');
      const isOpen = dlg?.open;
      const title = document.querySelector('#milestoneDialogBody h3')?.textContent;
      const body = document.getElementById('milestoneDialogBody')?.textContent;

      // Close modal
      document.querySelector('[data-close-dialog="milestoneDialog"]')?.click();
      const isClosed = !dlg?.open;

      return {
        rowCount: rows.length,
        milestoneKeys,
        isOpen,
        isClosed,
        title,
        body
      };
    })()`);

    assert(journeyAudit.rowCount === 4, 'Timeline has 4 distinct career milestones (MBA, CavinKare, Only Solar, BTech)');
    assert(journeyAudit.isOpen === true, 'Clicking milestone Inspect opens Milestone Inspector dialog');
    assert(journeyAudit.title?.includes('CavinKare'), 'Milestone dialog displays CavinKare title');
    assert(journeyAudit.body?.toLowerCase().includes('50+ retail outlets') && journeyAudit.body?.includes('+30%'), 'Milestone dialog preserves confirmed CavinKare metrics');
    assert(journeyAudit.isClosed === true, 'Milestone dialog closes cleanly');

    // ========================================================================
    // 6. DECISION STUDIO & OPERATIONS LAB AUDIT
    // ========================================================================
    console.log('\n--- 6. DECISION STUDIO & OPERATIONS LAB AUDIT ---');
    const labAudit = await client.eval(`(() => {
      // 1. Test Landed-Cost Calculator Sliders in Lab Modal
      document.getElementById('openLabModalBtn')?.click();
      const labDlg = document.getElementById('labDialog');
      const isLabOpen = labDlg?.open;

      const calcUnits = document.getElementById('calcUnits');
      const calcFob = document.getElementById('calcFob');
      const calcFreight = document.getElementById('calcFreight');
      
      const initialUnitLanded = document.getElementById('resUnitLanded')?.textContent;
      const initialGrandTotal = document.getElementById('resGrandTotal')?.textContent;

      if (calcUnits) {
        calcUnits.value = 2500;
        calcUnits.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (calcFob) {
        calcFob.value = 65;
        calcFob.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const updatedUnitLanded = document.getElementById('resUnitLanded')?.textContent;
      const updatedGrandTotal = document.getElementById('resGrandTotal')?.textContent;

      // 2. Test Lab Tab Switching to Incident Triage
      const triageTab = document.querySelector('.lab-tab-btn[data-lab-tool="triage"]');
      triageTab?.click();
      const toolTriage = document.getElementById('toolTriage');
      const isTriageVisible = toolTriage?.classList.contains('is-active');

      // 3. Test Selecting Incident SYN-101
      const inc101 = document.querySelector('.incident-row[data-incident-id="SYN-101"]');
      inc101?.click();
      const selectedId = document.getElementById('selectedIncidentId')?.textContent;
      const hasResolutionActions = document.querySelectorAll('.btn-sim-action').length > 0;

      // Close Lab Dialog
      document.querySelector('[data-close-dialog="labDialog"]')?.click();
      const isLabClosed = !labDlg?.open;

      return {
        isLabOpen,
        isLabClosed,
        initialUnitLanded,
        updatedUnitLanded,
        initialGrandTotal,
        updatedGrandTotal,
        calculatorResponded: initialGrandTotal !== updatedGrandTotal,
        isTriageVisible,
        selectedId,
        hasResolutionActions
      };
    })()`);

    assert(labAudit.isLabOpen === true, 'Decision Studio & Operations Lab dialog opens cleanly');
    assert(labAudit.calculatorResponded === true, 'Landed-Cost Simulator dynamically updates calculated totals');
    assert(labAudit.isTriageVisible === true, 'Lab tab switches cleanly to Operations Exception Board');
    assert(labAudit.selectedId?.includes('SYN-101'), 'Incident selection inspects selected incident (SYN-101)');
    assert(labAudit.hasResolutionActions === true, 'Incident triage populates actionable trade-off protocol buttons');
    assert(labAudit.isLabClosed === true, 'Lab dialog closes cleanly');

    // ========================================================================
    // 7. CAPABILITIES & CREDENTIALS MODALS AUDIT
    // ========================================================================
    console.log('\n--- 7. CAPABILITIES & CREDENTIALS MODALS AUDIT ---');
    const standaloneAudit = await client.eval(`(() => {
      // Capabilities Modal
      document.getElementById('openCapabilitiesBtn')?.click();
      const capDlg = document.getElementById('capabilitiesDialog');
      const capOpen = capDlg?.open;
      document.querySelector('[data-close-dialog="capabilitiesDialog"]')?.click();
      const capClosed = !capDlg?.open;

      // Credentials Modal
      document.getElementById('openCredentialsBtn')?.click();
      const credDlg = document.getElementById('credentialsDialog');
      const credOpen = credDlg?.open;
      document.querySelector('[data-close-dialog="credentialsDialog"]')?.click();
      const credClosed = !credDlg?.open;

      return {
        capOpen,
        capClosed,
        credOpen,
        credClosed
      };
    })()`);

    assert(standaloneAudit.capOpen && standaloneAudit.capClosed, 'Operational Capabilities modal opens and closes properly');
    assert(standaloneAudit.credOpen && standaloneAudit.credClosed, 'Academic Credentials modal opens and closes properly');

    // ========================================================================
    // 8. CONTACT SECTION & GMAIL REDIRECT WORKFLOW AUDIT
    // ========================================================================
    console.log('\n--- 8. CONTACT SECTION & GMAIL REDIRECT WORKFLOW AUDIT ---');
    const contactAudit = await client.eval(`(() => {
      // 1. Copy email button
      const copyBtn = document.getElementById('copyEmailBtn');
      const initialCopyText = copyBtn?.textContent;

      // 2. Category Chips
      const chips = Array.from(document.querySelectorAll('.category-chip'));
      const generalChip = document.querySelector('.category-chip[data-topic="general"]');
      generalChip?.click();
      const subject = document.getElementById('userSubject')?.value;
      const isCardTinted = document.getElementById('contactFormCard')?.classList.contains('topic-general');

      // 3. Form submission validation
      document.getElementById('userName').value = 'Test Recruiter';
      document.getElementById('userEmail').value = 'recruiter@enterprise-logistics.com';
      document.getElementById('userMsg').value = 'Interested in discussing operations internship and commercial roles.';

      let capturedUrl = null;
      const originalOpen = window.open;
      window.open = (url) => { capturedUrl = url; return { closed: false }; };

      document.getElementById('inquiryForm').dispatchEvent(new Event('submit', { cancelable: true }));
      window.open = originalOpen;

      const feedbackText = document.getElementById('formFeedback')?.textContent;

      return {
        chipCount: chips.length,
        subjectUpdated: subject?.includes('General Inquiry'),
        isCardTinted,
        capturedUrl,
        feedbackText
      };
    })()`);

    assert(contactAudit.chipCount === 5, '5 interactive conversation category chips present');
    assert(contactAudit.subjectUpdated === true, 'Clicking category chip updates subject automatically');
    assert(contactAudit.isCardTinted === true, 'Contact card border subtly accents corresponding topic tint');
    assert(contactAudit.capturedUrl?.includes('mail.google.com/mail/?view=cm'), 'Submit generates valid Gmail Compose URL');
    assert(contactAudit.capturedUrl?.includes('jayeshsingh9b%40gmail.com'), 'Gmail URL addressed to verified recipient jayeshsingh9b@gmail.com');
    assert(contactAudit.feedbackText?.includes('Opening Gmail compose window'), 'Confirmation provides honest guidance without claiming false auto-send');

    // ========================================================================
    // 9. PROFILE DIGITAL IDENTITY CARD AUDIT (V26)
    // ========================================================================
    console.log('\n--- 9. PROFILE DIGITAL IDENTITY CARD AUDIT (V26) ---');
    const profileCardAudit = await client.eval(`(() => {
      document.getElementById('profilePopupTrigger').click();
      const dlg = document.getElementById('profileDialog');
      const frame = dlg.querySelector('.profile-id-frame');
      const rect = frame.getBoundingClientRect();

      // Check all 3 tabs can be clicked and toggle visibility
      document.getElementById('profileTabJourney').click();
      const journeyShown = !document.getElementById('profilePanelJourney').hidden;

      document.getElementById('profileTabInterests').click();
      const interestsShown = !document.getElementById('profilePanelInterests').hidden;

      document.getElementById('profileTabOverview').click();
      const overviewShown = !document.getElementById('profilePanelOverview').hidden;

      // Close modal
      document.getElementById('profileDialogCloseBtn').click();
      const isClosed = !dlg.open;

      return {
        width: rect.width,
        height: rect.height,
        journeyShown,
        interestsShown,
        overviewShown,
        isClosed
      };
    })()`);

    assert(profileCardAudit.width <= 720, 'Profile card is compact (width <= 720px)');
    assert(profileCardAudit.journeyShown === true, 'Journey tab switches and reveals timeline');
    assert(profileCardAudit.interestsShown === true, 'Interests tab switches and reveals topic pills');
    assert(profileCardAudit.overviewShown === true, 'Overview tab switches and reveals education cards');
    assert(profileCardAudit.isClosed === true, 'Close button closes profile modal cleanly');

    // ========================================================================
    // 10. STRICT PRIVACY AUDIT (ZERO PHONE NUMBERS)
    // ========================================================================
    console.log('\n--- 10. STRICT PRIVACY AUDIT (ZERO PHONE NUMBERS) ---');
    const privacyAudit = await client.eval(`(() => {
      const allText = document.body.innerText;
      const phoneRegex = /(?:\\+91[\\s\\-]?)?[6-9]\\d{9}|(?:\\+?1[\\s\\-]?)?\\(?\\d{3}\\)?[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}/g;
      const matches = (allText.match(phoneRegex) || []).filter(m => {
        const digits = m.replace(/\\D/g, '');
        return digits.length >= 10 && !['20202024', '20262028', '20242025'].includes(digits);
      });
      return {
        matches,
        clean: matches.length === 0
      };
    })()`);
    assert(privacyAudit.clean === true, 'Zero public phone numbers anywhere on page or in modal content');

    // ========================================================================
    // 11. CROSS-DEVICE VIEWPORT & RESPONSIVE AUDIT
    // ========================================================================
    console.log('\n--- 11. CROSS-DEVICE VIEWPORT & RESPONSIVE AUDIT ---');
    const viewports = [
      { name: 'Widescreen Desktop (1920×1080)', w: 1920, h: 1080, mobile: false, dsf: 1, file: 'v26-final-1920.png' },
      { name: 'Standard Desktop (1440×900)', w: 1440, h: 900, mobile: false, dsf: 1, file: 'v26-final-1440.png' },
      { name: 'Small Desktop / Tablet (1024×768)', w: 1024, h: 768, mobile: false, dsf: 1, file: 'v26-final-1024.png' },
      { name: 'Portrait Tablet (768×1024)', w: 768, h: 1024, mobile: true, dsf: 2, file: 'v26-final-768.png' },
      { name: 'Standard Mobile (390×844)', w: 390, h: 844, mobile: true, dsf: 3, file: 'v26-final-390.png' },
      { name: 'Compact Mobile (360×800)', w: 360, h: 800, mobile: true, dsf: 3, file: 'v26-final-360.png' }
    ];

    for (const vp of viewports) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.w,
        height: vp.h,
        deviceScaleFactor: vp.dsf,
        mobile: vp.mobile
      });
      await client.eval('new Promise(r => setTimeout(r, 150))');

      const overflow = await client.eval(`(() => {
        const sw = document.documentElement.scrollWidth;
        const cw = document.documentElement.clientWidth;
        return {
          scrollWidth: sw,
          clientWidth: cw,
          hasOverflow: sw > cw
        };
      })()`);

      assert(overflow.hasOverflow === false, `${vp.name} has ZERO horizontal overflow (${overflow.scrollWidth}px <= ${overflow.clientWidth}px)`);
      await client.screenshot(vp.file);
    }

    // ========================================================================
    // 12. MOBILE MENU DRAWER AUDIT (390px)
    // ========================================================================
    console.log('\n--- 12. MOBILE MENU DRAWER AUDIT ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });

    const mobileMenuAudit = await client.eval(`(() => {
      const toggle = document.getElementById('menuToggle');
      const drawer = document.getElementById('mobileNav');
      toggle.click();
      const isOpen = drawer.classList.contains('is-open');
      const ariaExpanded = toggle.getAttribute('aria-expanded');

      // Test clicking drawer nav link
      const firstLink = drawer.querySelector('.mobile-nav-links a');
      firstLink?.click();
      const isClosedAfterClick = !drawer.classList.contains('is-open');

      return {
        isOpen,
        ariaExpanded,
        isClosedAfterClick
      };
    })()`);

    assert(mobileMenuAudit.isOpen === true, 'Clicking mobile hamburger opens slide-in navigation drawer');
    assert(mobileMenuAudit.ariaExpanded === 'true', 'Mobile toggle sets aria-expanded="true"');
    assert(mobileMenuAudit.isClosedAfterClick === true, 'Clicking a link inside mobile drawer closes the drawer');

    // ========================================================================
    // FINAL AUDIT SUMMARY
    // ========================================================================
    console.log('\n================================================================');
    console.log(`  COMPREHENSIVE AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      console.error('Bugs discovered during audit:', bugs);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal audit error:', err);
    process.exitCode = 1;
  } finally {
    client.close();
    chrome.kill();
  }
}

runComprehensiveAudit();
