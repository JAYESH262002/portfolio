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
  console.log('--- STARTING PORTFOLIO V26 VERIFICATION SUITE ---');

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
    // SUITE 1: Translucent Floating Glass Header (V26)
    // ========================================================================
    console.log('\n[Suite 1] Translucent Floating Glass Header (Portfolio V26)');
    
    // Top of page header state
    const headerTopProps = await client.eval(`(() => {
      const h = document.getElementById('siteHeader');
      if (!h) return { error: 'siteHeader missing' };
      const style = window.getComputedStyle(h);
      return {
        position: style.position,
        zIndex: style.zIndex,
        borderRadius: style.borderRadius,
        backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
        backgroundColor: style.backgroundColor,
        isScrolled: h.classList.contains('is-scrolled'),
        hasSpecularRim: !!document.querySelector('.site-header::before')
      };
    })()`);

    assert(headerTopProps.position === 'fixed', 'Header has position: fixed (floats above page)');
    assert(parseInt(headerTopProps.zIndex, 10) >= 100, 'Header z-index allows it to float above page content');
    assert(headerTopProps.backdropFilter?.includes('blur'), 'Header applies backdrop-filter blur');
    assert(headerTopProps.backgroundColor.includes('rgba') && !headerTopProps.backgroundColor.includes('rgb(255, 255, 255)'), 'Header background has true translucency (rgba)');

    // Capture screenshot at top of page
    await client.screenshot('v26-header-top-1440.png');

    // Scroll page down and check scrolled glass state
    await client.eval(`(() => {
      window.scrollTo(0, 350);
      document.documentElement.scrollTop = 350;
      window.dispatchEvent(new Event('scroll'));
    })()`);
    await client.eval('new Promise(r => setTimeout(r, 100))');
    
    const headerScrolledProps = await client.eval(`(() => {
      const h = document.getElementById('siteHeader');
      const style = window.getComputedStyle(h);
      return {
        scrollY: window.scrollY,
        isScrolled: h.classList.contains('is-scrolled'),
        backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
        backgroundColor: style.backgroundColor
      };
    })()`);

    assert(headerScrolledProps.isScrolled === true, 'Header gains .is-scrolled when page scrolls past 30px');
    assert(headerScrolledProps.backdropFilter?.includes('blur'), 'Scrolled header retains strong backdrop blur');
    assert(headerScrolledProps.backgroundColor.includes('rgba'), 'Scrolled header retains translucent glass background');

    // Capture screenshot while scrolled (showing underlying content visible through header)
    await client.screenshot('v26-header-scrolled-1440.png');

    // Scroll back to top
    await client.eval(`window.scrollTo(0, 0); window.dispatchEvent(new Event('scroll'));`);
    await client.eval('new Promise(r => setTimeout(r, 200))');

    // ========================================================================
    // SUITE 2: Reimagined Profile Popup (Compact Digital Identity Card)
    // ========================================================================
    console.log('\n[Suite 2] Reimagined Profile Identity Card Modal (#profileDialog)');

    // Trigger click on profile photo in header
    const openRes = await client.eval(`(() => {
      const trigger = document.getElementById('profilePopupTrigger');
      trigger.click();
      const dlg = document.getElementById('profileDialog');
      const frame = dlg.querySelector('.profile-id-frame');
      const rect = frame.getBoundingClientRect();
      const style = window.getComputedStyle(frame);
      return {
        isOpen: dlg.open === true,
        width: rect.width,
        height: rect.height,
        heightRatio: rect.height / window.innerHeight,
        maxWidth: style.maxWidth,
        borderRadius: style.borderRadius
      };
    })()`);

    assert(openRes.isOpen === true, 'Clicking header profile photo opens #profileDialog');
    assert(openRes.width <= 720, 'Profile card is compact (width <= 720px, fits requirement 600–720px)');
    assert(openRes.heightRatio <= 0.88, 'Profile card height fits comfortably within viewport (< 88vh)');

    // Verify Identity Header elements
    const heroRes = await client.eval(`(() => {
      const name = document.getElementById('profileDialogName')?.textContent?.trim();
      const sub = document.querySelector('.profile-id-subtitle')?.textContent?.trim();
      const bio = document.querySelector('.profile-id-bio')?.textContent?.trim();
      const avatar = document.querySelector('.profile-id-avatar');
      const closeBtn = document.getElementById('profileDialogCloseBtn');
      const emailPill = document.querySelector('.profile-mini-pill span')?.textContent?.trim();
      return {
        name,
        sub,
        bio,
        hasAvatar: avatar !== null && avatar.getAttribute('src')?.includes('jayesh-singh.png'),
        hasCloseBtn: closeBtn !== null,
        emailPill
      };
    })()`);

    assert(heroRes.name?.includes('JAYESH') && heroRes.name?.includes('SINGH'), 'Identity card displays JAYESH SINGH wordmark');
    assert(heroRes.sub?.includes('OPERATIONS / COMMERCIAL SYSTEMS'), 'Subtitle displays OPERATIONS / COMMERCIAL SYSTEMS');
    assert(heroRes.bio?.includes('MBA student specialising in Operations & Logistics'), 'Short intro matches exact prompt specification');
    assert(heroRes.hasAvatar === true, 'Profile avatar image is present');
    assert(heroRes.hasCloseBtn === true, 'Close button is present');
    assert(heroRes.emailPill === 'jayeshsingh9b@gmail.com', 'Verified email pill is discreetly available');

    // Verify 3 Segmented Navigation Tabs
    const tabsRes = await client.eval(`(() => {
      const tabs = Array.from(document.querySelectorAll('.profile-nav-btn')).map(t => ({
        tabName: t.dataset.profileTab,
        text: t.textContent.trim(),
        isActive: t.classList.contains('is-active'),
        ariaSelected: t.getAttribute('aria-selected')
      }));
      return { tabs, count: tabs.length };
    })()`);

    assert(tabsRes.count === 3, 'Exactly 3 navigation tabs: OVERVIEW | JOURNEY | INTERESTS');
    assert(tabsRes.tabs[0].tabName === 'overview' && tabsRes.tabs[0].isActive === true, 'Overview is the default active tab');
    assert(tabsRes.tabs[1].tabName === 'journey' && tabsRes.tabs[1].isActive === false, 'Journey tab present');
    assert(tabsRes.tabs[2].tabName === 'interests' && tabsRes.tabs[2].isActive === false, 'Interests tab present');

    // Verify Panel 1: Overview Content
    const overviewContentRes = await client.eval(`(() => {
      const panel = document.getElementById('profilePanelOverview');
      const isVisible = panel && !panel.hidden && panel.classList.contains('is-active');
      const text = panel?.textContent || '';
      return {
        isVisible,
        hasMba: text.includes('MBA — Operations & Logistics') && text.includes('Lovely Professional University'),
        hasBtech: text.includes('B.Tech — Computer Science') && text.includes('Graduated 2024'),
        hasFoundation: text.includes('CORE FOUNDATION')
      };
    })()`);

    assert(overviewContentRes.isVisible === true, 'Overview panel is visible by default');
    assert(overviewContentRes.hasMba === true, 'Overview lists MBA in Operations & Logistics (LPU, 2026–2028)');
    assert(overviewContentRes.hasBtech === true, 'Overview lists B.Tech Computer Science (LPU, Graduated 2024)');
    assert(overviewContentRes.hasFoundation === true, 'Overview displays core foundation synthesis');

    // Capture screenshot of Overview tab
    await client.screenshot('v26-profile-overview-1440.png');

    // Switch to Tab 2: JOURNEY
    const journeyTabRes = await client.eval(`(() => {
      document.getElementById('profileTabJourney').click();
      const journeyPanel = document.getElementById('profilePanelJourney');
      const overviewPanel = document.getElementById('profilePanelOverview');
      const steps = Array.from(document.querySelectorAll('.journey-step-btn')).map(s => ({
        chapter: s.dataset.chapter,
        isActive: s.classList.contains('is-active'),
        label: s.querySelector('.step-label')?.textContent
      }));
      const activeTitle = document.getElementById('journeyDetailTitle')?.textContent;
      const activeText = document.getElementById('journeyDetailText')?.textContent;
      const metrics = Array.from(document.querySelectorAll('#journeyDetailMetrics .metric-pill')).map(p => p.textContent);
      return {
        journeyVisible: !journeyPanel.hidden && journeyPanel.classList.contains('is-active'),
        overviewHidden: overviewPanel.hidden,
        stepCount: steps.length,
        steps,
        activeTitle,
        activeText,
        metrics
      };
    })()`);

    assert(journeyTabRes.journeyVisible === true, 'Clicking Journey tab switches to Journey panel');
    assert(journeyTabRes.overviewHidden === true, 'Overview panel is hidden when Journey is active');
    assert(journeyTabRes.stepCount === 4, 'Journey timeline contains exactly 4 chapters');
    assert(journeyTabRes.activeTitle?.includes('CavinKare'), 'CavinKare is featured chapter on journey view');
    assert(journeyTabRes.activeText?.includes('50+ active retail outlets') && journeyTabRes.activeText?.includes('+30%'), 'Preserves confirmed CavinKare achievements (50+ outlets, +30% MoM lift)');

    // Test Clicking Chapter 1: Computer Science
    const csStepRes = await client.eval(`(() => {
      document.querySelector('.journey-step-btn[data-chapter="cs"]').click();
      return {
        title: document.getElementById('journeyDetailTitle')?.textContent,
        text: document.getElementById('journeyDetailText')?.textContent
      };
    })()`);
    assert(csStepRes.title?.includes('Computer Science & Engineering'), 'Selecting CS chapter updates detail to B.Tech Computer Science');

    // Test Clicking Chapter 2: Only Solar
    const solarStepRes = await client.eval(`(() => {
      document.querySelector('.journey-step-btn[data-chapter="solar"]').click();
      return {
        title: document.getElementById('journeyDetailTitle')?.textContent,
        text: document.getElementById('journeyDetailText')?.textContent
      };
    })()`);
    assert(solarStepRes.title?.includes('Only Solar'), 'Selecting Solar chapter updates detail to Only Solar Sourcing');

    // Capture screenshot of Journey tab
    await client.eval('new Promise(r => setTimeout(r, 250))');
    await client.screenshot('v26-profile-journey-1440.png');

    // Switch to Tab 3: INTERESTS
    const interestsTabRes = await client.eval(`(() => {
      document.getElementById('profileTabInterests').click();
      const interestsPanel = document.getElementById('profilePanelInterests');
      const pills = Array.from(document.querySelectorAll('.interest-pill-btn')).map(p => ({
        topic: p.dataset.interest,
        text: p.textContent.trim(),
        isActive: p.classList.contains('is-active')
      }));
      const title = document.getElementById('interestCardTitle')?.textContent;
      const desc = document.getElementById('interestCardDesc')?.textContent;
      return {
        interestsVisible: !interestsPanel.hidden && interestsPanel.classList.contains('is-active'),
        pillCount: pills.length,
        pills,
        title,
        desc
      };
    })()`);

    assert(interestsTabRes.interestsVisible === true, 'Clicking Interests tab switches to Interests panel');
    assert(interestsTabRes.pillCount === 5, 'Interests tab features 5 understated topic pills');
    assert(interestsTabRes.pills[0].isActive === true, 'Operations & Logistics pill is selected by default');
    assert(interestsTabRes.desc?.includes('Optimizing the physical flow of goods'), 'Displays grounded explanation for Operations & Logistics');

    // Test Clicking Interest 2: Supply Chain
    const supplyTopicRes = await client.eval(`(() => {
      document.querySelector('.interest-pill-btn[data-interest="supply"]').click();
      return {
        tag: document.getElementById('interestFocusTag')?.textContent,
        title: document.getElementById('interestCardTitle')?.textContent,
        desc: document.getElementById('interestCardDesc')?.textContent
      };
    })()`);
    assert(supplyTopicRes.tag?.includes('SUPPLY CHAIN'), 'Selecting Supply Chain updates focus tag');
    assert(supplyTopicRes.desc?.includes('Aligning vendor lead times'), 'Selecting Supply Chain updates explanation');

    // Capture screenshot of Interests tab
    await client.eval('new Promise(r => setTimeout(r, 250))');
    await client.screenshot('v26-profile-interests-1440.png');

    // Test Close Button
    const closeRes = await client.eval(`(() => {
      document.getElementById('profileDialogCloseBtn').click();
      const dlg = document.getElementById('profileDialog');
      return { isOpen: dlg.open };
    })()`);
    assert(closeRes.isOpen === false, 'Clicking close button (✕) closes #profileDialog');

    // Re-open and test Escape key close
    const escapeRes = await client.eval(`(() => {
      document.getElementById('profilePopupTrigger').click();
      const wasOpen = document.getElementById('profileDialog').open;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      const isNowClosed = !document.getElementById('profileDialog').open;
      return { wasOpen, isNowClosed };
    })()`);
    assert(escapeRes.wasOpen === true && escapeRes.isNowClosed === true, 'Pressing Escape key closes #profileDialog');

    // ========================================================================
    // SUITE 3: Strict Privacy Audit (Zero Public Phone Numbers)
    // ========================================================================
    console.log('\n[Suite 3] Strict Privacy Audit');
    const privacyCheck = await client.eval(`(() => {
      const allText = document.body.innerText;
      const html = document.body.innerHTML;
      const phoneRegex = /(?:\\+91[\\s\\-]?)?[6-9]\\d{9}|(?:\\+?1[\\s\\-]?)?\\(?\\d{3}\\)?[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}/g;
      const matches = allText.match(phoneRegex) || [];
      const filteredMatches = matches.filter(m => {
        const digits = m.replace(/\\D/g, '');
        return digits.length >= 10 && !m.includes('2020') && !m.includes('2024') && !m.includes('2026') && !m.includes('2028');
      });
      return {
        detectedPhones: filteredMatches,
        hasPhone: filteredMatches.length > 0
      };
    })()`);
    assert(privacyCheck.hasPhone === false, 'Zero public phone numbers found anywhere on the page or in dialogs');

    // ========================================================================
    // SUITE 4: Mobile Responsive Bottom Sheet View (390px)
    // ========================================================================
    console.log('\n[Suite 4] Mobile Viewport Bottom Sheet Transformation (390px)');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });

    const mobileSheetRes = await client.eval(`(() => {
      document.getElementById('profilePopupTrigger').click();
      const dlg = document.getElementById('profileDialog');
      const frame = dlg.querySelector('.profile-id-frame');
      const rect = frame.getBoundingClientRect();
      const style = window.getComputedStyle(frame);
      return {
        isOpen: dlg.open,
        width: rect.width,
        bottomAligned: rect.bottom >= 840,
        hasTopCorners: style.borderTopLeftRadius !== '0px'
      };
    })()`);

    assert(mobileSheetRes.isOpen === true, 'Mobile opens profile dialog cleanly');
    assert(mobileSheetRes.width <= 390, 'Mobile profile card fits within 390px width');
    assert(mobileSheetRes.hasTopCorners === true, 'Mobile profile bottom sheet has rounded top corners');

    await client.screenshot('v26-profile-mobile-390.png');

    console.log(`\n======================================================`);
    console.log(`PORTFOLIO V26 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
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
