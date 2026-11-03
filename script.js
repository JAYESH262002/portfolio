/**
 * Jayesh Singh — Portfolio V21
 * Content Accuracy, Gmail Compose Workflow & Progressive Disclosure Engine
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = !window.matchMedia('(pointer: coarse)').matches;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Polyfill Element, SVGElement & SVGGElement prototype.click for SVG graphics groups (<g>, <rect>, etc.)
  if (typeof window !== 'undefined') {
    const polyfillClick = function() {
      this.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    };
    if (window.Element && typeof window.Element.prototype.click !== 'function') {
      window.Element.prototype.click = polyfillClick;
    }
    if (window.SVGElement && typeof window.SVGElement.prototype.click !== 'function') {
      window.SVGElement.prototype.click = polyfillClick;
    }
    if (window.SVGGElement && typeof window.SVGGElement.prototype.click !== 'function') {
      window.SVGGElement.prototype.click = polyfillClick;
    }
  }

  // ==========================================================================
  // 1. THEME MANAGEMENT (Light / Dark with localStorage)
  // ==========================================================================
  const storageKey = 'jayesh-minimal-ops-theme';
  let currentTheme = document.documentElement.dataset.theme || 'light';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') {
      currentTheme = saved;
    }
  } catch (e) {}

  const applyTheme = (theme) => {
    currentTheme = theme;
    document.documentElement.dataset.theme = currentTheme;
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = currentTheme === 'dark' ? '#0c1117' : '#faf8f5';
    try {
      localStorage.setItem(storageKey, currentTheme);
    } catch (e) {}
  };
  applyTheme(currentTheme);

  const themeToggle = $('#themeToggle');
  themeToggle?.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // ==========================================================================
  // 2. LIVE MUMBAI IST CLOCK
  // ==========================================================================
  const liveClock = $('#liveClock');
  function updateClock() {
    if (!liveClock) return;
    try {
      const now = new Date();
      const istTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      liveClock.textContent = `MUMBAI ${istTime} IST`;
    } catch (e) {
      liveClock.textContent = 'MUMBAI IST';
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ==========================================================================
  // 3. GLOSSY HEADER: POINTER-TRACKED SHINE, SCROLL STATE & SLIDING PILL NAV
  // ==========================================================================
  const header = $('#siteHeader');
  const desktopNav = $('.desktop-nav');
  const navIndicator = $('.nav-indicator');
  const navLinks = $$('.nav-link');
  const scrollProgressBar = $('#scrollProgress');

  // Scroll Progress and Header Compression
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgressBar && docHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      scrollProgressBar.style.width = `${progress}%`;
    }
    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 30);
    }
  }, { passive: true });

  // Pointer-tracked glass specular shine
  if (header && finePointer) {
    header.addEventListener('pointermove', (e) => {
      const rect = header.getBoundingClientRect();
      header.style.setProperty('--shine-x', `${e.clientX - rect.left}px`);
      header.style.setProperty('--shine-y', `${e.clientY - rect.top}px`);
    }, { passive: true });
  }

  // Active navigation indicator
  function moveNavIndicator(target) {
    if (!target || !desktopNav || !navIndicator) return;
    const navBox = desktopNav.getBoundingClientRect();
    const linkBox = target.getBoundingClientRect();
    navIndicator.style.width = `${linkBox.width}px`;
    navIndicator.style.transform = `translate(${linkBox.left - navBox.left}px, -50%)`;
  }

  const initialActive = $('.nav-link.is-active') || navLinks[0];
  if (initialActive) {
    setTimeout(() => moveNavIndicator(initialActive), 120);
  }

  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => moveNavIndicator(link));
    link.addEventListener('focus', () => moveNavIndicator(link));
    link.addEventListener('click', () => {
      navLinks.forEach((item) => item.classList.toggle('is-active', item === link));
      moveNavIndicator(link);
    });
  });

  desktopNav?.addEventListener('mouseleave', () => {
    moveNavIndicator($('.nav-link.is-active') || navLinks[0]);
  });

  // Section Observer for updating active nav pill on scroll
  const navSections = $$('section[id]');
  if ('IntersectionObserver' in window && navSections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          const targetLink = $(`a.nav-link[href="#${id}"]`);
          if (targetLink) {
            navLinks.forEach((l) => l.classList.remove('is-active'));
            targetLink.classList.add('is-active');
            moveNavIndicator(targetLink);
          }
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });

    navSections.forEach((sec) => navObserver.observe(sec));
  }

  // ==========================================================================
  // 4. MOBILE NAVIGATION DRAWER
  // ==========================================================================
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  const mobileCloseBtn = $('#mobileCloseBtn');

  function setMobileMenu(open) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileNav.classList.toggle('is-open', open);
    mobileNav.inert = !open;
    document.body.classList.toggle('menu-open', open);
  }

  menuToggle?.addEventListener('click', () => setMobileMenu(true));
  mobileCloseBtn?.addEventListener('click', () => setMobileMenu(false));
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) setMobileMenu(false);
  });
  $$('.mobile-nav-links a').forEach((link) => {
    link.addEventListener('click', () => setMobileMenu(false));
  });

  // ==========================================================================
  // 5. SIGNATURE HOLLOW CIRCULAR CURSOR (Portfolio V27 — Zero Lag)
  // Direct position tracking batched through requestAnimationFrame
  // Pure 18–20px hollow circle, locks immediately to pointer, no trailing lag
  // ==========================================================================
  const cursorHalo = $('#cursorHalo');

  if (finePointer && !prefersReducedMotion && cursorHalo) {
    let latestX = -100;
    let latestY = -100;
    let framePending = false;
    let isHovering = false;
    let isClicking = false;
    let isOverInput = false;
    let isVisible = false;

    function updateCursorPosition() {
      if (!isVisible) {
        framePending = false;
        return;
      }
      const scale = isClicking ? (isHovering ? 1.4 : 0.88) : (isHovering ? 1.85 : 1);
      // Centers the 20px circle on the exact pointer coordinates with translate(-50%, -50%)
      cursorHalo.style.transform = `translate3d(${latestX}px, ${latestY}px, 0) translate(-50%, -50%) scale(${scale})`;
      framePending = false;
    }

    window.addEventListener('pointermove', (e) => {
      latestX = e.clientX;
      latestY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorHalo.classList.add('is-active');
      }

      if (!framePending) {
        framePending = true;
        requestAnimationFrame(updateCursorPosition);
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      isVisible = false;
      cursorHalo.classList.remove('is-active');
    });

    document.addEventListener('pointerenter', () => {
      isVisible = true;
      cursorHalo.classList.add('is-active');
    });

    window.addEventListener('pointerdown', () => {
      isClicking = true;
      cursorHalo.classList.add('is-clicking');
      if (!framePending) {
        framePending = true;
        requestAnimationFrame(updateCursorPosition);
      }
    }, { passive: true });

    window.addEventListener('pointerup', () => {
      isClicking = false;
      cursorHalo.classList.remove('is-clicking');
      if (!framePending) {
        framePending = true;
        requestAnimationFrame(updateCursorPosition);
      }
    }, { passive: true });

    const interactiveSelectors = 'a, button, [role="button"], [role="tab"], [role="option"], .op-node, .incident-card, .brand-avatar-btn, .category-chip, .channel-link-chip, .btn, .btn-channel-action, .lens-tab-btn, .project-filter-btn, .project-index-entry, .cost-tier, .rel-node, .route-node, .scenario-btn, .timeline-row, .entry-dossier-link, .lens-bridge-link, summary';
    const inputSelectors = 'input, textarea, select, [contenteditable="true"]';

    document.addEventListener('mouseover', (e) => {
      const targetEl = e.target && typeof e.target.closest === 'function' ? e.target : null;
      if (!targetEl) return;

      // Check input elements (preserve native text editing cursor, fade custom ring)
      if (targetEl.closest(inputSelectors)) {
        if (!isOverInput) {
          isOverInput = true;
          cursorHalo.classList.add('is-input');
        }
      } else if (isOverInput) {
        isOverInput = false;
        cursorHalo.classList.remove('is-input');
      }

      // Check interactive elements (hover enlargement + multi-colour effect)
      const isInteractiveTarget = Boolean(
        targetEl.closest(interactiveSelectors) ||
        (window.getComputedStyle(targetEl).cursor === 'pointer' && !targetEl.closest(inputSelectors))
      );

      if (isInteractiveTarget) {
        if (!isHovering) {
          isHovering = true;
          cursorHalo.classList.add('is-hovering');
          if (!framePending) {
            framePending = true;
            requestAnimationFrame(updateCursorPosition);
          }
        }
      } else if (isHovering) {
        isHovering = false;
        cursorHalo.classList.remove('is-hovering');
        if (!framePending) {
          framePending = true;
          requestAnimationFrame(updateCursorPosition);
        }
      }
    }, { passive: true });
  }

  // ==========================================================================
  // 6. SIGNATURE OPERATIONS VISUAL & INTERACTIVE PIPELINE SYSTEM
  // Supplier → Sourcing → Inventory → Warehouse → Distribution → Retail + Loop
  // ==========================================================================
  const stageData = [
    {
      num: '01',
      name: 'SUPPLIER',
      title: 'Supplier Sourcing & Negotiations',
      focus: 'Supplier Relationships & Vendor Negotiations',
      grounding: 'GROUNDING: ONLY SOLAR SOURCING',
      desc: 'Evaluating overseas manufacturers, negotiating commercial MOQs and unit economics, and aligning production schedules with import cycles. Sourcing reliability starts at vendor contract rigor.',
      scenarios: {
        normal: 'Factory cadence nominal. Production schedules aligned with planned shipping windows and baseline stock buffers.',
        delay: 'Upstream buffer queued. Factory holds completed product runs until port customs backlog eases.',
        surge: 'Factory lead-times expedited. Requires early MOQ renegotiation and production capacity reservations with overseas vendors.'
      },
      feedback: 'Real-time retail sell-through signals pull upstream production batches before regional safety stocks reach reorder red-lines.'
    },
    {
      num: '02',
      name: 'SOURCING',
      title: 'Import Logistics & Landed-Cost Modeling',
      focus: 'Supplier Selection & Landed-Cost Analysis',
      grounding: 'GROUNDING: ONLY SOLAR IMPORT LOGISTICS',
      desc: 'Managing cross-border container freight, customs duties, and landed-cost modeling to preserve viable wholesale and distributor margin structures across fluctuating import tariffs.',
      scenarios: {
        normal: 'Container shipping and port clearance tracking within standard transit windows (18–24 days).',
        delay: 'PRIMARY BOTTLENECK: Port customs documentation hold introduces +12 days transit delay, freezing downstream depot intake.',
        surge: 'Container dispatch velocity accelerated; priority freight lanes evaluated for high-velocity SKUs.'
      },
      feedback: 'Distributor reorder velocity directly dictates container booking schedules, preventing demurrage fees and over-ordering.'
    },
    {
      num: '03',
      name: 'INVENTORY',
      title: 'Safety Stock & Replenishment Planning',
      focus: 'Stock Availability & Buffer Modeling',
      grounding: 'GROUNDING: ANALYTICAL OPERATIONS MODEL',
      desc: 'Balancing working capital investment against stockout risks. Calculating reorder points and safety stock levels to absorb upstream transit variations.',
      scenarios: {
        normal: 'Buffer inventory operating at nominal 21-day cover. Reorder cycles synchronized with depot consumption.',
        delay: 'Safety stock absorbing upstream port hold. Buffer drawn down to 7 days; automated alerts flag critical SKUs.',
        surge: 'Stock depletion velocity doubles. Emergency safety stock allocations released to meet retail demand spikes.'
      },
      feedback: 'Secondary sales velocity triggers automated replenishment thresholds, preventing bullwhip demand amplification.'
    },
    {
      num: '04',
      name: 'WAREHOUSE',
      title: 'Depot Storage & Product Availability Flow',
      focus: 'Depot Handling & Availability Within Flow',
      grounding: 'GROUNDING: ANALYTICAL OPERATIONS MODEL',
      desc: 'Coordinating depot intake, batch serialization, and order staging to ensure seamless stock availability for downstream regional distribution beats.',
      scenarios: {
        normal: 'Inbound staging and outbound dispatch synchronized. Order pick-and-pack operating on standard 24-hour cycle.',
        delay: 'Outbound dispatch constrained by inbound delays. Warehouse teams prioritize high-turnover SKUs for immediate staging.',
        surge: 'Depot cross-docking activated. Primary shipments routed directly to fulfillment bays to maintain dispatch velocity.'
      },
      feedback: 'Field distributor bookings dictate staging order priorities at the warehouse loading dock.'
    },
    {
      num: '05',
      name: 'DISTRIBUTION',
      title: 'Territory Beat Routing & Fulfillment',
      focus: 'Channel Movement & Territory Beat Coverage',
      grounding: 'GROUNDING: CAVINKARE BEAT ROUTING',
      desc: 'Structuring high-frequency retail beat routes across Andheri to Bandra, Mumbai. Balancing store visit frequency with order booking to maximize daily fulfillment productivity.',
      scenarios: {
        normal: 'Standard daily beat schedule active. 50+ retail counters serviced on structured weekly visit cycles.',
        delay: 'Beat routes adjusted to ration available inventory across key counters, protecting high-velocity accounts.',
        surge: 'Daily beat frequency intensified. Same-day distributor re-dispatch mobilized to fulfill surge volume.'
      },
      feedback: 'Daily sales beat reports feed ground-level retailer demand and counter sentiments directly back to distribution managers.'
    },
    {
      num: '06',
      name: 'RETAIL',
      title: 'Retail Availability & General Trade Execution',
      focus: 'Shelf Availability, Account Acquisition & Feedback',
      grounding: 'GROUNDING: CAVINKARE GT SALES EXECUTION',
      desc: 'Direct counter execution across 50+ General Trade retail outlets in Mumbai. Onboarded 10+ new accounts in Month 1, expanded active retailer base by +20%, and achieved +30% MoM focus category lift.',
      scenarios: {
        normal: '50+ counters fully merchandised. Trade schemes, counter visibility, and replenishment operating steadily.',
        delay: 'Counter stock tightens. Field representatives deploy alternative SKUs and trade allowances to protect counter share.',
        surge: 'High retail sell-through. Counter stock turnover accelerates, translating footfall into +30% MoM focus category growth.'
      },
      feedback: 'Point-of-sale customer demand and retail counter reorders initiate the reverse feedback signal upstream through distribution to procurement.'
    }
  ];

  // Unified Reactive Pipeline State Model (Portfolio V25 & V26.1)
  // Minimal by default: activeStage is null initially; revealed on node click
  const pipelineState = {
    activeStage: null,          // null by default (minimal initial view); 0..5 when stage selected
    activeScenario: 'normal',   // 'normal' | 'delay' | 'surge'
    isReversed: false,          // boolean: toggles reverse feedback loop
    expandedStage: false,       // boolean: "Explore this stage" deeper drawer toggle
    scenarioDetailsOpen: false  // boolean: "Scenario Details" drawer toggle
  };

  const operationsVisual = $('#operationsVisual');
  const opNodes = $$('.op-node');
  const scenarioBtns = $$('.scenario-btn');
  const forwardPulses = $$('.pipe-pulse:not(.pulse-feedback)');
  const feedbackPulse = $('.pulse-feedback');
  const feedbackLoopBtn = $('#feedbackLoopBtn');
  const loopBadgeText = $('#loopBadgeText');
  const feedbackTrack = $('#feedbackPath');

  const statusStripScenarioPill = $('#statusStripScenarioPill');
  const statusStripHint = $('#statusStripHint');
  const scenarioDetailsToggleBtn = $('#scenarioDetailsToggleBtn');
  const scenarioDetailsBtnText = $('#scenarioDetailsBtnText');
  const scenarioDetailsBox = $('#scenarioDetailsBox');
  const scenarioDetailsTitle = $('#scenarioDetailsTitle');
  const scenarioDetailsText = $('#scenarioDetailsText');

  const nodeTelemetry = $('#nodeTelemetry');
  const telemetryStage = $('#telemetryStage');
  const telemetryGrounding = $('#telemetryGrounding');
  const telemetryLoopPill = $('#telemetryLoopPill');
  const telemetryTitle = $('#telemetryTitle');
  const telemetryDesc = $('#telemetryDesc');
  const telemetryScenarioImpact = $('#telemetryScenarioImpact');
  const telemetryFeedbackImpact = $('#telemetryFeedbackImpact');
  const telemetryMetric = $('#telemetryMetric');
  const telemetryContext = $('#telemetryContext');
  const exploreStageBtn = $('#exploreStageBtn');
  const exploreStageBtnText = $('#exploreStageBtnText');
  const exploreStageContent = $('#exploreStageContent');

  let pipelineCollapseTimer = null;

  function isPipelineDefault() {
    return (
      pipelineState.activeStage === null &&
      pipelineState.activeScenario === 'normal' &&
      !pipelineState.isReversed &&
      !pipelineState.expandedStage &&
      !pipelineState.scenarioDetailsOpen
    );
  }

  function resetPipelineToDefault() {
    if (isPipelineDefault()) return;

    if (pipelineCollapseTimer) {
      clearTimeout(pipelineCollapseTimer);
      pipelineCollapseTimer = null;
    }

    pipelineState.activeStage = null;
    pipelineState.activeScenario = 'normal';
    pipelineState.isReversed = false;
    pipelineState.expandedStage = false;
    pipelineState.scenarioDetailsOpen = false;

    if (nodeTelemetry) {
      nodeTelemetry.classList.remove('is-revealed', 'is-collapsing');
    }
    if (scenarioDetailsBox) {
      scenarioDetailsBox.classList.remove('is-collapsing');
      scenarioDetailsBox.style.display = 'none';
      scenarioDetailsBox.setAttribute('aria-hidden', 'true');
    }
    if (exploreStageContent) {
      exploreStageContent.style.display = 'none';
      exploreStageContent.setAttribute('aria-hidden', 'true');
    }
    if (exploreStageBtn) {
      exploreStageBtn.setAttribute('aria-expanded', 'false');
    }
    if (exploreStageBtnText) {
      exploreStageBtnText.textContent = 'Explore this stage ↓';
    }
    if (scenarioDetailsToggleBtn) {
      scenarioDetailsToggleBtn.setAttribute('aria-expanded', 'false');
    }
    if (scenarioDetailsBtnText) {
      scenarioDetailsBtnText.textContent = 'Scenario Details ↓';
    }

    renderPipeline();
  }

  function renderPipeline() {
    // 1. Update Op-Nodes styling and ARIA attributes
    opNodes.forEach((node, idx) => {
      const isSelected = pipelineState.activeStage !== null && idx === pipelineState.activeStage;
      node.classList.toggle('is-active', isSelected);
      node.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      // Bottleneck on Sourcing (idx 1) when Delay scenario
      const isBottleneck = pipelineState.activeScenario === 'delay' && idx === 1;
      node.classList.toggle('is-bottleneck', isBottleneck);

      // Surge on Distribution (idx 4) & Retail (idx 5) when Surge scenario
      const isSurge = pipelineState.activeScenario === 'surge' && (idx === 4 || idx === 5);
      node.classList.toggle('is-surge', isSurge);
    });

    // 2. Update Scenario Buttons
    scenarioBtns.forEach((btn) => {
      const isBtnActive = btn.dataset.scenario === pipelineState.activeScenario;
      btn.classList.toggle('is-active', isBtnActive);
      btn.setAttribute('aria-pressed', isBtnActive ? 'true' : 'false');
    });

    // 3. Update Forward Signal Pulses
    if (pipelineState.activeScenario === 'normal') {
      forwardPulses.forEach((p) => {
        p.style.animationDuration = '5s';
        p.style.fill = '';
      });
    } else if (pipelineState.activeScenario === 'delay') {
      forwardPulses.forEach((p) => {
        p.style.animationDuration = '10s';
        p.style.fill = 'var(--accent-coral)';
      });
    } else if (pipelineState.activeScenario === 'surge') {
      forwardPulses.forEach((p) => {
        p.style.animationDuration = '2.2s';
        p.style.fill = '#38bdf8';
      });
    }

    // 4. Update Feedback Loop Button & Signal
    if (feedbackLoopBtn) {
      feedbackLoopBtn.classList.toggle('is-active', pipelineState.isReversed);
      feedbackLoopBtn.setAttribute('aria-pressed', pipelineState.isReversed ? 'true' : 'false');
    }

    if (loopBadgeText) {
      loopBadgeText.textContent = pipelineState.isReversed
        ? '↺ DEMAND PULL ACTIVE // UPSTREAM SIGNAL ON'
        : 'REVERSE DEMAND FEEDBACK LOOP ↺';
    }

    if (feedbackTrack) {
      feedbackTrack.classList.toggle('is-active', pipelineState.isReversed);
    }

    if (feedbackPulse) {
      if (pipelineState.isReversed) {
        feedbackPulse.style.animationDirection = 'reverse';
        feedbackPulse.style.animationDuration = pipelineState.activeScenario === 'surge' ? '1.5s' : '2.4s';
        feedbackPulse.style.fill = 'var(--accent-teal)';
      } else {
        feedbackPulse.style.animationDirection = 'normal';
        feedbackPulse.style.animationDuration = pipelineState.activeScenario === 'delay' ? '7s' : (pipelineState.activeScenario === 'surge' ? '2.2s' : '4.5s');
        feedbackPulse.style.fill = 'var(--accent-coral)';
      }
    }

    // 5. Update Status Strip (Minimal Default Summary)
    if (statusStripScenarioPill) {
      if (pipelineState.activeScenario === 'normal') {
        statusStripScenarioPill.className = 'status-strip-pill pill-steady';
        statusStripScenarioPill.innerHTML = '<i class="status-dot"></i> STEADY STATE // NOMINAL CADENCE';
      } else if (pipelineState.activeScenario === 'delay') {
        statusStripScenarioPill.className = 'status-strip-pill pill-delay';
        statusStripScenarioPill.innerHTML = '<i class="status-dot status-delay"></i> BOTTLENECK ALERT // PORT CLEARANCE (+12D)';
      } else if (pipelineState.activeScenario === 'surge') {
        statusStripScenarioPill.className = 'status-strip-pill pill-surge';
        statusStripScenarioPill.innerHTML = '<i class="status-dot status-surge"></i> DEMAND SURGE // +40% CHANNEL VELOCITY';
      }
    }

    if (statusStripHint) {
      if (pipelineState.activeStage === null) {
        statusStripHint.textContent = 'Click any stage (01–06) to inspect operational flow →';
      } else {
        const cur = stageData[pipelineState.activeStage];
        statusStripHint.textContent = `Stage ${cur.num} ${cur.name} selected · Details revealed below ↓`;
      }
    }

    // 6. Update Scenario Details Box (Expandable Drawer)
    if (scenarioDetailsBox && scenarioDetailsToggleBtn) {
      if (pipelineState.scenarioDetailsOpen) {
        scenarioDetailsBox.classList.remove('is-collapsing');
        scenarioDetailsBox.style.display = 'block';
        scenarioDetailsBox.setAttribute('aria-hidden', 'false');
        scenarioDetailsToggleBtn.setAttribute('aria-expanded', 'true');
        if (scenarioDetailsBtnText) {
          scenarioDetailsBtnText.textContent = 'Hide Scenario Details ↑';
        }
      } else if (!scenarioDetailsBox.classList.contains('is-collapsing')) {
        scenarioDetailsBox.style.display = 'none';
        scenarioDetailsBox.setAttribute('aria-hidden', 'true');
        scenarioDetailsToggleBtn.setAttribute('aria-expanded', 'false');
        if (scenarioDetailsBtnText) {
          scenarioDetailsBtnText.textContent = 'Scenario Details ↓';
        }
      } else {
        scenarioDetailsBox.setAttribute('aria-hidden', 'true');
        scenarioDetailsToggleBtn.setAttribute('aria-expanded', 'false');
        if (scenarioDetailsBtnText) {
          scenarioDetailsBtnText.textContent = 'Scenario Details ↓';
        }
      }

      if (scenarioDetailsTitle && scenarioDetailsText) {
        if (pipelineState.activeScenario === 'normal') {
          scenarioDetailsTitle.textContent = 'Steady State Flow Dynamics';
          scenarioDetailsText.textContent = 'All six pipeline stages operate at balanced throughput. Overseas production runs match container freight bookings, buffer inventories absorb planned transit variances, and distributor beats fulfill retail orders without stockout bottlenecks.';
        } else if (pipelineState.activeScenario === 'delay') {
          scenarioDetailsTitle.textContent = 'Port Clearance Bottleneck Dynamics';
          scenarioDetailsText.textContent = 'A 12-day customs delay at Stage 02 (Sourcing) halts inbound intake. Downstream depots rely on safety stock buffers; field sales beats ration available inventory across Mumbai counters to protect high-velocity retail accounts.';
        } else if (pipelineState.activeScenario === 'surge') {
          scenarioDetailsTitle.textContent = 'High-Velocity Retail Demand Dynamics';
          scenarioDetailsText.textContent = '+40% retail sell-through accelerates distributor reorders. Depot cross-docking is activated, and beat visit frequencies across Andheri to Bandra are doubled to capture counter demand without shelf stockouts.';
        }
      }
    }

    // 7. Update Stage Telemetry Panel (Minimal by default; revealed on stage click)
    if (nodeTelemetry) {
      if (pipelineState.activeStage !== null) {
        const currentStage = stageData[pipelineState.activeStage];
        nodeTelemetry.classList.remove('is-collapsing');
        nodeTelemetry.classList.add('is-revealed');

        if (telemetryStage) telemetryStage.textContent = `STAGE ${currentStage.num} // ${currentStage.name}`;
        if (telemetryGrounding) telemetryGrounding.textContent = currentStage.grounding;
        if (telemetryTitle) telemetryTitle.textContent = currentStage.title;
        if (telemetryDesc) telemetryDesc.textContent = currentStage.desc;
        if (telemetryMetric) telemetryMetric.textContent = currentStage.focus;
        if (telemetryContext) telemetryContext.textContent = currentStage.grounding;
        if (telemetryScenarioImpact) telemetryScenarioImpact.textContent = currentStage.scenarios[pipelineState.activeScenario];
        if (telemetryFeedbackImpact) telemetryFeedbackImpact.textContent = currentStage.feedback;

        if (telemetryLoopPill) {
          telemetryLoopPill.textContent = pipelineState.isReversed
            ? 'Demand Loop: Upstream Pull Engaged'
            : 'Demand Loop: Standard Latency';
        }

        // Deeper Explore Stage Content Toggle
        if (exploreStageContent && exploreStageBtn) {
          exploreStageContent.style.display = pipelineState.expandedStage ? 'block' : 'none';
          exploreStageContent.setAttribute('aria-hidden', pipelineState.expandedStage ? 'false' : 'true');
          exploreStageBtn.setAttribute('aria-expanded', pipelineState.expandedStage ? 'true' : 'false');
          if (exploreStageBtnText) {
            exploreStageBtnText.textContent = pipelineState.expandedStage ? 'Collapse stage details ↑' : 'Explore this stage ↓';
          }
        }
      } else {
        nodeTelemetry.classList.remove('is-revealed');
        if (exploreStageContent) {
          exploreStageContent.style.display = 'none';
          exploreStageContent.setAttribute('aria-hidden', 'true');
        }
        if (exploreStageBtn) {
          exploreStageBtn.setAttribute('aria-expanded', 'false');
        }
        if (exploreStageBtnText) {
          exploreStageBtnText.textContent = 'Explore this stage ↓';
        }
      }
    }
  }

  // Bind Op-Nodes (Click, Touch, Keyboard)
  opNodes.forEach((node) => {
    const idx = parseInt(node.dataset.stage, 10);
    const selectStage = (e) => {
      if (e) e.preventDefault();
      if (pipelineCollapseTimer) {
        clearTimeout(pipelineCollapseTimer);
        pipelineCollapseTimer = null;
        if (nodeTelemetry) nodeTelemetry.classList.remove('is-collapsing');
        if (scenarioDetailsBox) scenarioDetailsBox.classList.remove('is-collapsing');
      }
      pipelineState.activeStage = idx;
      renderPipeline();
    };

    node.addEventListener('click', selectStage);
    node.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') selectStage(e);
    });

    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectStage(e);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = pipelineState.activeStage === null ? 0 : (pipelineState.activeStage + 1) % opNodes.length;
        if (pipelineCollapseTimer) {
          clearTimeout(pipelineCollapseTimer);
          pipelineCollapseTimer = null;
        }
        pipelineState.activeStage = nextIdx;
        opNodes[nextIdx].focus();
        renderPipeline();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIdx = pipelineState.activeStage === null ? 0 : (pipelineState.activeStage - 1 + opNodes.length) % opNodes.length;
        if (pipelineCollapseTimer) {
          clearTimeout(pipelineCollapseTimer);
          pipelineCollapseTimer = null;
        }
        pipelineState.activeStage = prevIdx;
        opNodes[prevIdx].focus();
        renderPipeline();
      }
    });
  });

  // Bind Scenario Buttons
  scenarioBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (pipelineCollapseTimer) {
        clearTimeout(pipelineCollapseTimer);
        pipelineCollapseTimer = null;
        if (nodeTelemetry) nodeTelemetry.classList.remove('is-collapsing');
        if (scenarioDetailsBox) scenarioDetailsBox.classList.remove('is-collapsing');
      }
      const newScenario = btn.dataset.scenario;
      pipelineState.activeScenario = newScenario;
      renderPipeline();

      const toastLabel = newScenario === 'normal'
        ? 'Pipeline Scenario: Steady state operations nominal'
        : newScenario === 'delay'
        ? 'Pipeline Simulation: Port clearance delay (+12 days lead-time bottleneck)'
        : 'Pipeline Simulation: Retail demand surge (+40% channel velocity)';
      showToast(toastLabel);
    });
  });

  // Bind Scenario Details Toggle
  scenarioDetailsToggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (pipelineCollapseTimer) {
      clearTimeout(pipelineCollapseTimer);
      pipelineCollapseTimer = null;
      if (scenarioDetailsBox) scenarioDetailsBox.classList.remove('is-collapsing');
    }
    pipelineState.scenarioDetailsOpen = !pipelineState.scenarioDetailsOpen;
    renderPipeline();
  });

  // Bind Explore Stage Toggle
  exploreStageBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    pipelineState.expandedStage = !pipelineState.expandedStage;
    renderPipeline();
  });

  // Bind Interactive Feedback Loop Button
  if (feedbackLoopBtn) {
    const toggleLoop = (e) => {
      if (e) e.preventDefault();
      if (pipelineCollapseTimer) {
        clearTimeout(pipelineCollapseTimer);
        pipelineCollapseTimer = null;
      }
      pipelineState.isReversed = !pipelineState.isReversed;
      renderPipeline();

      const toastLabel = pipelineState.isReversed
        ? 'Demand Feedback Loop: Active upstream pull engaged'
        : 'Demand Feedback Loop: Restored to standard flow';
      showToast(toastLabel);
    };

    feedbackLoopBtn.addEventListener('click', toggleLoop);
    feedbackLoopBtn.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') toggleLoop(e);
    });
    feedbackLoopBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggleLoop(e);
      }
    });
  }

  // Initial Pipeline Render
  renderPipeline();

  // Clicking empty SVG canvas (outside of nodes and feedback loop) also deselects
  const pipelineSvg = $('.pipeline-svg');
  if (pipelineSvg) {
    pipelineSvg.addEventListener('click', (e) => {
      if (e.target === pipelineSvg || e.target.classList.contains('pipe-track') || e.target.classList.contains('pipe-track-feedback')) {
        if (!isPipelineDefault()) {
          resetPipelineToDefault();
        }
      }
    });
  }

  // ==========================================================================
  // OUTSIDE-CLICK / OUTSIDE-POINTER BOUNDARY HANDLER FOR OPERATIONS PIPELINE (V27)
  // Capture phase touchstart + pointerdown + click ensures immediate interception
  // before any child element can stop propagation or prevent bubbling.
  // ==========================================================================
  function handleOutsidePipelineInteraction(event) {
    const root = document.querySelector('[data-pipeline-root]') || document.getElementById('operationsVisual');
    if (!root) return;
    if (isPipelineDefault()) return;

    const path = (event.composedPath && event.composedPath()) || [];
    const isInside = root.contains(event.target) || path.includes(root);
    if (isInside) return;

    resetPipelineToDefault();
  }

  // Register in capture phase across all touch, pointer, and click input events
  document.addEventListener('touchstart', handleOutsidePipelineInteraction, { capture: true, passive: true });
  document.addEventListener('pointerdown', handleOutsidePipelineInteraction, true);
  document.addEventListener('click', handleOutsidePipelineInteraction, true);

  // ==========================================================================
  // 7. PROGRESSIVE DISCLOSURE MODAL DIALOGS
  // ==========================================================================
  const allDialogs = $$('dialog.app-dialog');

  function openDialog(dialogId) {
    const dlg = $(`#${dialogId}`);
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
    } else {
      dlg.setAttribute('open', '');
    }
    document.body.classList.add('modal-open');
  }

  function closeDialog(dialogElement) {
    if (!dialogElement) return;
    if (typeof dialogElement.close === 'function') {
      dialogElement.close();
    } else {
      dialogElement.removeAttribute('open');
    }
    document.body.classList.remove('modal-open');
  }

  function closeAllModals() {
    allDialogs.forEach((dlg) => closeDialog(dlg));
  }

  // Backdrop click and close buttons
  allDialogs.forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      // In native HTML5 <dialog>, clicking the backdrop targets the dialog element itself
      if (e.target === dlg) {
        closeDialog(dlg);
      }
    });
  });

  $$('[data-close-dialog]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.closeDialog;
      closeDialog($(`#${targetId}`));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      setMobileMenu(false);
      resetPipelineToDefault();
    }
  });

  // Trigger buttons for standalone modals
  $('#openLoopBtn')?.addEventListener('click', () => openDialog('loopDialog'));
  $('#openCapabilitiesBtn')?.addEventListener('click', () => openDialog('capabilitiesDialog'));
  $('#openCredentialsBtn')?.addEventListener('click', () => openDialog('credentialsDialog'));
  $('#openLabModalBtn')?.addEventListener('click', () => openDialog('labDialog'));

  // ==========================================================================
  // 7B. COMPACT DIGITAL IDENTITY CARD CONTROLLER (Portfolio V26)
  // ==========================================================================
  const profileDialog = $('#profileDialog');
  const profileNavBtns = $$('.profile-nav-btn');
  const profilePanels = $$('.profile-panel');

  function setProfileTab(tabName) {
    profileNavBtns.forEach((btn) => {
      const isSelected = btn.dataset.profileTab === tabName;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    profilePanels.forEach((panel) => {
      const match = panel.id === `profilePanel${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
      panel.classList.toggle('is-active', match);
      if (match) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  profileNavBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setProfileTab(btn.dataset.profileTab);
    });
  });

  // Keyboard navigation for profile tabs (Left / Right Arrow)
  const profileNavWrap = $('.profile-id-nav');
  profileNavWrap?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIdx = profileNavBtns.findIndex((b) => b.classList.contains('is-active'));
      const nextIdx = e.key === 'ArrowRight'
        ? (currentIdx + 1) % profileNavBtns.length
        : (currentIdx - 1 + profileNavBtns.length) % profileNavBtns.length;
      profileNavBtns[nextIdx].focus();
      setProfileTab(profileNavBtns[nextIdx].dataset.profileTab);
    }
  });

  // Journey Stepper Controller (4 Chapters)
  const journeyChapters = {
    cs: {
      tag: 'CHAPTER 01 // COMPUTER SCIENCE FOUNDATIONS',
      period: '2020 – 2024',
      title: 'B.Tech in Computer Science & Engineering — Lovely Professional University',
      text: 'Built a rigorous foundation in algorithms, relational databases, data structures, and software architecture. This computer science grounding forms the analytical backbone for building modern operational models and automated reporting logic.',
      metrics: ['Algorithms & Data Structures', 'Relational Database Systems', 'Quantitative Problem-Solving', 'Graduated 2024']
    },
    solar: {
      tag: 'CHAPTER 02 // ENTREPRENEURSHIP & TRADE',
      period: '2024 – EARLY 2025',
      title: 'Co-Founder & Business Head — Only Solar (Import & Export)',
      text: 'Led cross-border commercial sourcing of solar products from overseas manufacturers. Negotiated vendor MOQs, modeled landed unit costs across fluctuating currency exchange rates, managed customs documentation, and scheduled inventory fulfillment to domestic distributors.',
      metrics: ['Overseas Manufacturer MOQs', 'Landed-Cost Financial Modeling', 'Port Customs Documentation', 'Inventory Buffer Cycles']
    },
    cavinkare: {
      tag: 'CHAPTER 03 // FMCG FRONTLINE FIELD SALES',
      period: 'OCTOBER 2025 – FEBRUARY 2026',
      title: 'Sales Representative — CavinKare (Third-Party Payroll)',
      text: 'Managed frontline General Trade distribution and secondary sales beats across Mumbai (Andheri to Bandra). Maintained 50+ active retail outlets, onboarded 10+ new GT accounts within Month 1, achieved a +20% active retailer-base expansion, and delivered a +30% month-on-month focus-category revenue increase.',
      metrics: ['50+ Retail Outlets Covered', '10+ GT Accounts M1', '+20% Retailer Expansion', '+30% MoM Focus Category Lift']
    },
    mba: {
      tag: 'CHAPTER 04 // ADVANCED OPERATIONS ARCHITECTURE',
      period: '2026 – 2028 (PURSUING)',
      title: 'MBA — Operations & Logistics — Lovely Professional University',
      text: 'Pursuing graduate specialization connecting quantitative models with commercial execution. Focus areas include multi-echelon inventory optimization, logistics network design, supplier contract structures, and practical operations systems.',
      metrics: ['Supply Chain Optimization', 'Inventory Theory & Replenishment', 'Logistics Network Design', 'Commercial Systems']
    }
  };

  const journeyStepBtns = $$('.journey-step-btn');
  const journeyChapterTag = $('#journeyChapterTag');
  const journeyPeriodTag = $('#journeyPeriodTag');
  const journeyDetailTitle = $('#journeyDetailTitle');
  const journeyDetailText = $('#journeyDetailText');
  const journeyDetailMetrics = $('#journeyDetailMetrics');

  function setJourneyChapter(chapterKey) {
    const chapter = journeyChapters[chapterKey];
    if (!chapter) return;

    journeyStepBtns.forEach((btn) => {
      const isSelected = btn.dataset.chapter === chapterKey;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });

    if (journeyChapterTag) journeyChapterTag.textContent = chapter.tag;
    if (journeyPeriodTag) journeyPeriodTag.textContent = chapter.period;
    if (journeyDetailTitle) journeyDetailTitle.textContent = chapter.title;
    if (journeyDetailText) journeyDetailText.textContent = chapter.text;

    if (journeyDetailMetrics) {
      journeyDetailMetrics.innerHTML = chapter.metrics
        .map((m) => `<span class="metric-pill">${m}</span>`)
        .join('');
    }
  }

  journeyStepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setJourneyChapter(btn.dataset.chapter);
    });
  });

  // Interests Discovery Controller (5 Topics)
  const interestTopics = {
    ops: {
      tag: 'INTEREST FOCUS // OPERATIONS & LOGISTICS',
      title: 'Frictionless Flow from Sourcing to Shelf',
      desc: 'Optimizing the physical flow of goods from import container docks to local neighborhood retail shelves with minimal friction and maximum velocity. Ensuring operational models reflect field reality rather than theoretical assumptions.',
      note: 'Informed by direct beat route logistics in Mumbai and import turnaround at Only Solar.'
    },
    supply: {
      tag: 'INTEREST FOCUS // SUPPLY CHAIN DYNAMICS',
      title: 'Resilience, Buffer Stock & Lead-Time Governance',
      desc: 'Aligning vendor lead times, safety stocks, and replenishment cycles so unexpected transit disruptions or demand spikes do not lead to out-of-stock retail shelves.',
      note: 'Grounded in overseas shipping cycles, port clearance variance, and regional depot replenishment.'
    },
    commercial: {
      tag: 'INTEREST FOCUS // COMMERCIAL OPERATIONS',
      title: 'Bridging Warehouse Availability with Beat Sales Pull',
      desc: 'Connecting warehouse inventory availability with frontline beat sales incentives to drive measurable sell-through and distributor profitability.',
      note: 'Reflects firsthand FMCG distributor interactions, credit terms, and retailer margin structures.'
    },
    process: {
      tag: 'INTEREST FOCUS // PROCESS THINKING',
      title: 'Standardized Workflows & Bottleneck Elimination',
      desc: 'Deconstructing complex commercial workflows into standardized, repeatable steps that eliminate friction, reduce cycle time, and prevent costly operational mistakes.',
      note: 'Combining Computer Science algorithmic thinking with real-world distribution protocols.'
    },
    analysis: {
      tag: 'INTEREST FOCUS // BUSINESS ANALYSIS',
      title: 'Translating Ground Signals into Actionable Decisions',
      desc: 'Translating point-of-sale data, beat coverage metrics, and landed costs into actionable operational decisions rather than static vanity reports.',
      note: 'Practical focus on metrics that directly impact stock turn, fulfillment rate, and working capital.'
    }
  };

  const interestPillBtns = $$('.interest-pill-btn');
  const interestFocusTag = $('#interestFocusTag');
  const interestCardTitle = $('#interestCardTitle');
  const interestCardDesc = $('#interestCardDesc');
  const interestPracticalNote = $('#interestPracticalNote');

  function setInterestTopic(topicKey) {
    const topic = interestTopics[topicKey];
    if (!topic) return;

    interestPillBtns.forEach((btn) => {
      const isSelected = btn.dataset.interest === topicKey;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });

    if (interestFocusTag) interestFocusTag.textContent = topic.tag;
    if (interestCardTitle) interestCardTitle.textContent = topic.title;
    if (interestCardDesc) interestCardDesc.textContent = topic.desc;
    if (interestPracticalNote) {
      interestPracticalNote.innerHTML = `<strong>Grounding:</strong> ${topic.note}`;
    }
  }

  interestPillBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setInterestTopic(btn.dataset.interest);
    });
  });

  // Profile Popup Trigger: reset to default states on open
  $('#profilePopupTrigger')?.addEventListener('click', () => {
    setProfileTab('overview');
    setJourneyChapter('cavinkare');
    setInterestTopic('ops');
    openDialog('profileDialog');
  });


  // ==========================================================================
  // 7C. SECTION 02: THE THREE OPERATING LENSES CONTROLLER (Portfolio V28)
  // ==========================================================================
  const lensData = {
    beat: {
      num: '01',
      indicator: 'OPERATING LENS 01 // WALK THE BEAT FIRST',
      groundingPill: 'CavinKare FMCG Field Sales (Mumbai)',
      badge: 'FIELD EXECUTION LENS',
      title: 'Walk the Beat First',
      thesis: 'Real operational insight starts with observing the actual work on the shopfloor, not from an abstracted dashboard. Shopkeeper relationships and shelf friction reveal what reports miss.',
      grounding: '50+ Mumbai General Trade retail outlets visited regularly across the Andheri–Bandra corridor during FMCG field execution at CavinKare.',
      bridgeText: 'Explore CavinKare Beat Expansion Case Study',
      bridgeTarget: 'cavinkare',
      observations: [
        'Distributor Depot: Order booking accuracy directly dictates next-morning van fill rates and eliminates secondary delivery re-trips.',
        'Andheri Kirana Cluster: Shelf space is fiercely contested; secondary SKU placements stall if shopkeeper cash-flow cycle is tight.',
        'Linking Road Supermarket: Modern Trade shelf facings require weekly audits; eye-level placement drives a 2.4x velocity lift.',
        'Bandra General Store: Personal rapport and on-time replacement of damaged units unlocks reorders for newly introduced SKUs.',
        'Market Feedback Hub: Retailer feedback gathered directly from counters feeds back into distributor SKU allocations before regional stockouts occur.'
      ]
    },
    landed: {
      num: '02',
      indicator: 'OPERATING LENS 02 // TRUE LANDED ECONOMICS',
      groundingPill: 'Only Solar Cross-Border Sourcing & Import Logistics',
      badge: 'COMMERCIAL SOURCING LENS',
      title: 'True Landed Economics',
      thesis: 'A supplier quotation is only one part of a commercial decision. Sourcing decisions must factor in ocean freight volatility, port demurrage buffers, and inland linehaul to protect viable margins.',
      grounding: 'Managed end-to-end import logistics, vendor negotiations, pricing strategy, and landed cost models at Only Solar.',
      bridgeText: 'Explore Only Solar Sourcing & Landed Economics Case Study',
      bridgeTarget: 'onlysolar',
      observations: [
        'FOB Baseline (38%): Negotiating a 5% unit discount at the factory means zero if ocean freight surcharges or 4-day port demurrage delays consume the variance.',
        'Freight & Demurrage Reserve (24%): Ocean container swings require dynamic booking buffers; holding space reserves costs less than missing departure windows.',
        'Customs, IGST & Port Clearing (22%): Accurate HS-code classification and pre-arrival bill-of-entry filing eliminate warehouse demurrage fees.',
        'Inland Linehaul & Storage (16%): Multimodal linehaul scheduling ensures regional depots maintain 14-day safety buffers without holding excess deadstock.'
      ]
    },
    relational: {
      num: '03',
      indicator: 'OPERATING LENS 03 // PRACTICAL RELATIONAL SYSTEMS',
      groundingPill: 'B.Tech Computer Science Grounding + MBA Operations',
      badge: 'SYSTEMS ARCHITECTURE LENS',
      title: 'Practical Relational Systems',
      thesis: 'Execution fails when information is trapped in spreadsheets and functional silos. Clean relational schemas link demand captures to inventory thresholds so handoffs do not fail.',
      grounding: 'Computer Science engineering foundation applied to enterprise commercial data models, relational schemas, and operations management.',
      bridgeText: 'Explore Relational Architecture Case Study',
      bridgeTarget: 'pipeline',
      observations: [
        'Retailer Store ➔ Order Booking: If store order history is captured in static spreadsheets, field reps book blind orders against depleted warehouse batches, creating 72-hour fulfillment rejections.',
        'Commercial Order Booking ➔ Validation: Relational validation against active retailer credit limits prevents shipping unauthorized batches that get rejected at delivery.',
        'Warehouse Stock ➔ Allocation: Real-time Available-to-Promise batch reservation prevents stockout overselling across competing sales beats.',
        'Replenishment Pull ➔ Supplier Lead-Time: Automated reorder point calculation based on historical lead times triggers supplier batches before safety stocks breach critical red-lines.'
      ]
    }
  };

  let activeLens = 'beat';
  const lensTabBtns = $$('.lens-tab-btn');
  const lensScenes = $$('.lens-scene');
  const stageLensIndicator = $('#stageLensIndicator');
  const stageGroundingVal = $('#stageGroundingVal');
  const lensDetailNum = $('#lensDetailNum');
  const lensDetailBadge = $('#lensDetailBadge');
  const lensDetailTitle = $('#lensDetailTitle');
  const lensDetailThesis = $('#lensDetailThesis');
  const lensDetailGrounding = $('#lensDetailGrounding');
  const lensBridgeText = $('#lensBridgeText');
  const lensBridgeLink = $('#lensBridgeLink');

  function setOperatingLens(lensKey) {
    if (!lensData[lensKey]) return;
    activeLens = lensKey;
    const data = lensData[lensKey];

    // Update Tab Buttons
    lensTabBtns.forEach((btn) => {
      const isSel = btn.dataset.lens === lensKey;
      btn.classList.toggle('is-active', isSel);
      btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });

    // Update Active Scene
    lensScenes.forEach((scene) => {
      scene.classList.toggle('is-active', scene.dataset.scene === lensKey);
    });

    // Update Meta Strip
    if (stageLensIndicator) stageLensIndicator.textContent = data.indicator;
    if (stageGroundingVal) stageGroundingVal.textContent = data.groundingPill;

    // Update Right Detail Card
    if (lensDetailNum) lensDetailNum.textContent = data.num;
    if (lensDetailBadge) lensDetailBadge.textContent = data.badge;
    if (lensDetailTitle) lensDetailTitle.textContent = data.title;
    if (lensDetailThesis) lensDetailThesis.textContent = data.thesis;
    if (lensDetailGrounding) lensDetailGrounding.textContent = data.grounding;
    if (lensBridgeText) lensBridgeText.textContent = data.bridgeText;
    if (lensBridgeLink) lensBridgeLink.dataset.bridgeTarget = data.bridgeTarget;
  }

  // Lens Tab Click & Keyboard Navigation
  lensTabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => setOperatingLens(btn.dataset.lens));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = lensTabBtns[(idx + 1) % lensTabBtns.length];
        next.focus();
        next.click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = lensTabBtns[(idx - 1 + lensTabBtns.length) % lensTabBtns.length];
        prev.focus();
        prev.click();
      }
    });
  });

  // Scene 1: Route Node Interactions
  const routeNodes = $$('.route-node');
  const beatObservationText = $('#beatObservationText');
  routeNodes.forEach((node) => {
    function activateNode() {
      routeNodes.forEach((n) => n.classList.remove('is-active'));
      node.classList.add('is-active');
      const idx = parseInt(node.dataset.nodeIdx, 10);
      if (beatObservationText && lensData.beat.observations[idx]) {
        beatObservationText.textContent = lensData.beat.observations[idx];
      }
    }
    node.addEventListener('click', activateNode);
    node.addEventListener('mouseenter', activateNode);
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateNode();
      }
    });
  });

  // Scene 2: Landed Cost Tier Interactions
  const costTiers = $$('.cost-tier');
  const landedObservationText = $('#landedObservationText');
  costTiers.forEach((tier) => {
    function activateTier() {
      costTiers.forEach((t) => t.classList.remove('is-active'));
      tier.classList.add('is-active');
      const idx = parseInt(tier.dataset.tierIdx, 10);
      if (landedObservationText && lensData.landed.observations[idx]) {
        landedObservationText.textContent = lensData.landed.observations[idx];
      }
    }
    tier.addEventListener('click', activateTier);
    tier.addEventListener('mouseenter', activateTier);
    tier.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTier();
      }
    });
  });

  // Scene 3: Relational Node Interactions
  const relNodes = $$('.rel-node');
  const relationalObservationText = $('#relationalObservationText');
  relNodes.forEach((node) => {
    function activateRelNode() {
      relNodes.forEach((n) => n.classList.remove('is-active'));
      node.classList.add('is-active');
      const idx = parseInt(node.dataset.relIdx, 10);
      if (relationalObservationText && lensData.relational.observations[idx]) {
        relationalObservationText.textContent = lensData.relational.observations[idx];
      }
    }
    node.addEventListener('click', activateRelNode);
    node.addEventListener('mouseenter', activateRelNode);
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateRelNode();
      }
    });
  });

  // Bridge Link Click to Smoothly Navigate to Section 03 & Select Project
  if (lensBridgeLink) {
    lensBridgeLink.addEventListener('click', (e) => {
      e.preventDefault();
      const targetProject = lensBridgeLink.dataset.bridgeTarget;
      const workSec = document.getElementById('work');
      if (workSec) {
        workSec.scrollIntoView({ behavior: 'smooth' });
      }
      setProjectFilter('all');
      selectProject(targetProject);
      const targetCard = document.querySelector(`.project-index-entry[data-project-id="${targetProject}"]`);
      if (targetCard) {
        targetCard.classList.remove('is-highlighted');
        void targetCard.offsetWidth; // re-trigger animation
        targetCard.classList.add('is-highlighted');
      }
    });
  }

  // ==========================================================================
  // 7D. SECTION 03: SELECTED WORK EXHIBITION CONTROLLER (Portfolio V28)
  // ==========================================================================
  const projectsData = {
    cavinkare: {
      category: 'PROFESSIONAL EXPERIENCE // CAVINKARE',
      date: 'Oct 2025 – Feb 2026',
      isConcept: false,
      title: 'Making a Beat Work Harder: FMCG Retail Beat & Territory Expansion in Mumbai',
      problem: "Unproductive retailer visits in Mumbai's Andheri–Bandra corridor; high stockout frequency on high-margin lines due to inconsistent reordering cadence and slow retailer onboarding.",
      action: 'Restructured daily beat routes covering 50+ retail outlets, onboarded 10+ high-potential General Trade accounts in Month 1, established direct retailer rapport, and aligned order booking with stock availability.',
      metrics: [
        { val: '+30%', label: 'MoM Focus-Category Revenue Lift' },
        { val: '50+', label: 'Mumbai GT Retail Outlets Covered' },
        { val: '+20%', label: 'Active Retailer-Base Expansion' },
        { val: '10+', label: 'GT Accounts Onboarded in Month 1' }
      ],
      schematicSvg: `<svg class="schematic-svg" viewBox="0 0 540 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Beat routing schematic">
        <rect x="10" y="25" width="130" height="50" rx="8" fill="#FBF8F3" stroke="#E2DCD5" stroke-width="1.5" />
        <text x="75" y="48" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">Distributor Depot</text>
        <text x="75" y="62" font-family="JetBrains Mono, monospace" font-size="9" fill="#E05A47" text-anchor="middle">Stock Dispatch</text>

        <path d="M 140 50 L 190 50" stroke="#E05A47" stroke-width="2" stroke-dasharray="4 4" />
        <polygon points="190,46 198,50 190,54" fill="#E05A47" />

        <rect x="200" y="20" width="150" height="60" rx="8" fill="#FFF" stroke="#E05A47" stroke-width="1.5" />
        <text x="275" y="45" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="12" fill="#1C1A17" text-anchor="middle">50+ Retail Outlets</text>
        <text x="275" y="59" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#5A554E" text-anchor="middle">Andheri–Bandra Beat</text>
        <text x="275" y="72" font-family="JetBrains Mono, monospace" font-size="9" fill="#1D7C6B" text-anchor="middle">+20% Active Accounts</text>

        <path d="M 350 50 L 400 50" stroke="#1D7C6B" stroke-width="2" />
        <polygon points="400,46 408,50 400,54" fill="#1D7C6B" />

        <rect x="410" y="25" width="120" height="50" rx="8" fill="#FBF8F3" stroke="#1D7C6B" stroke-width="1.5" />
        <text x="470" y="46" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="13" fill="#1D7C6B" text-anchor="middle">+30% MoM Lift</text>
        <text x="470" y="62" font-family="JetBrains Mono, monospace" font-size="9" fill="#5A554E" text-anchor="middle">Focus Category</text>
      </svg>`
    },
    onlysolar: {
      category: 'ENTREPRENEURSHIP // ONLY SOLAR',
      date: '2024 – Early 2025',
      isConcept: false,
      title: 'From Supplier to Shelf: Import Sourcing, Landed Cost Modeling & Commercial GTM',
      problem: 'Unpredictable international supply lead times and volatile shipping rates threatening gross margin viability on commercial solar imports without unified landed cost models.',
      action: 'Co-founded venture, evaluated international manufacturers, led vendor negotiations, managed import logistics, developed GTM and pricing plans, and oversaw P&L decisions.',
      metrics: [
        { val: '0 → 1', label: 'Commercial GTM Venture Launch' },
        { val: 'End-to-End', label: 'Import Logistics & Sourcing' },
        { val: 'Multi-Tier', label: 'Landed Unit Cost Modeling' },
        { val: 'Direct MOQs', label: 'Manufacturer Negotiations' }
      ],
      schematicSvg: `<svg class="schematic-svg" viewBox="0 0 540 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sourcing and landed economics schematic">
        <rect x="8" y="25" width="105" height="50" rx="8" fill="#FBF8F3" stroke="#E2DCD5" stroke-width="1.5" />
        <text x="60" y="47" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">Factory FOB</text>
        <text x="60" y="61" font-family="JetBrains Mono, monospace" font-size="9" fill="#E05A47" text-anchor="middle">Baseline: 38%</text>

        <path d="M 113 50 L 138 50" stroke="#8B7FB8" stroke-width="2" />
        <polygon points="138,46 144,50 138,54" fill="#8B7FB8" />

        <rect x="145" y="25" width="115" height="50" rx="8" fill="#FBF8F3" stroke="#E2DCD5" stroke-width="1.5" />
        <text x="202" y="47" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">Ocean Freight</text>
        <text x="202" y="61" font-family="JetBrains Mono, monospace" font-size="9" fill="#8B7FB8" text-anchor="middle">Transit & Demurrage</text>

        <path d="M 260 50 L 285 50" stroke="#D98A36" stroke-width="2" />
        <polygon points="285,46 291,50 285,54" fill="#D98A36" />

        <rect x="292" y="25" width="115" height="50" rx="8" fill="#FBF8F3" stroke="#E2DCD5" stroke-width="1.5" />
        <text x="349" y="47" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">Customs / Port</text>
        <text x="349" y="61" font-family="JetBrains Mono, monospace" font-size="9" fill="#D98A36" text-anchor="middle">Tariff & Clearance</text>

        <path d="M 407 50 L 432 50" stroke="#1D7C6B" stroke-width="2" />
        <polygon points="432,46 438,50 432,54" fill="#1D7C6B" />

        <rect x="439" y="20" width="95" height="60" rx="8" fill="#FFF" stroke="#1D7C6B" stroke-width="1.5" />
        <text x="486" y="44" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="12" fill="#1D7C6B" text-anchor="middle">Landed Cost</text>
        <text x="486" y="58" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#5A554E" text-anchor="middle">Margin Protection</text>
        <text x="486" y="70" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#1D7C6B" text-anchor="middle">0 → 1 GTM Model</text>
      </svg>`
    },
    pipeline: {
      category: 'INDEPENDENT ANALYTICAL CONCEPT',
      date: '2024–2025 · CONCEPTUAL',
      isConcept: true,
      conceptPill: 'Synthetic Dataset & Conceptual Architecture',
      title: 'See the Whole Flow: Relational Distribution Schema & Replenishment Dashboard',
      problem: 'In General Trade distribution, field reps often book orders without visibility into distributor warehouse stock, leading to avoidable stockout gaps.',
      action: 'Designed a conceptual third-normal-form relational SQL schema and Power BI dashboard model linking store visits, order bookings, and distributor stock thresholds.',
      metrics: [
        { val: '3NF', label: 'Normalized SQL Relational Schema' },
        { val: 'Power BI', label: 'Store Replenishment Model' },
        { val: 'Synthetic', label: 'Simulated Order & Stock Datasets' },
        { val: 'Concept', label: 'End-to-End Distribution Model' }
      ],
      schematicSvg: `<svg class="schematic-svg" viewBox="0 0 540 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Relational schema architecture diagram">
        <rect x="10" y="20" width="125" height="60" rx="8" fill="#FBF8F3" stroke="#8B7FB8" stroke-width="1.5" />
        <text x="72" y="42" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">STORE_VISITS</text>
        <text x="72" y="56" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#5A554E" text-anchor="middle">store_id (PK) · beat_id</text>
        <text x="72" y="69" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#8B7FB8" text-anchor="middle">visit_timestamp · rep_id</text>

        <path d="M 135 50 L 175 50" stroke="#8B7FB8" stroke-width="2" />
        <text x="155" y="44" font-family="JetBrains Mono, monospace" font-size="8" fill="#8B7FB8" text-anchor="middle">1:N</text>
        <polygon points="175,46 181,50 175,54" fill="#8B7FB8" />

        <rect x="183" y="20" width="145" height="60" rx="8" fill="#FFF" stroke="#8B7FB8" stroke-width="1.5" />
        <text x="255" y="42" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">ORDER_BOOKINGS</text>
        <text x="255" y="56" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#5A554E" text-anchor="middle">order_id (PK) · store_id (FK)</text>
        <text x="255" y="69" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#8B7FB8" text-anchor="middle">sku_code · qty · status</text>

        <path d="M 328 50 L 368 50" stroke="#8B7FB8" stroke-width="2" />
        <text x="348" y="44" font-family="JetBrains Mono, monospace" font-size="8" fill="#8B7FB8" text-anchor="middle">N:1</text>
        <polygon points="368,46 374,50 368,54" fill="#8B7FB8" />

        <rect x="376" y="20" width="154" height="60" rx="8" fill="#FBF8F3" stroke="#8B7FB8" stroke-width="1.5" />
        <text x="453" y="42" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">DISTRIBUTOR_STOCK</text>
        <text x="453" y="56" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#5A554E" text-anchor="middle">sku_code (PK) · on_hand</text>
        <text x="453" y="69" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#1D7C6B" text-anchor="middle">reorder_lvl · lead_days</text>
      </svg>`
    },
    reverse: {
      category: 'INDEPENDENT OPERATIONS ANALYTICS CONCEPT',
      date: '2024–2025 · CONCEPTUAL',
      isConcept: true,
      conceptPill: 'Illustrative Scenario & Decision Model',
      title: 'Exceptions First: Reverse Logistics & Warranty Triage Decision Model',
      problem: 'Return authorizations and warranty claims sitting in regional distribution depots without structured triage, locking capital and slowing customer resolution.',
      action: 'Mapped an illustrative 3-tier diagnostic triage workflow (bench repair, vendor credit reclamation, scrap) with serialized component tracking.',
      metrics: [
        { val: '3-Tier', label: 'Diagnostic Intake Triage Routing' },
        { val: 'Illustrative', label: 'Turnaround SLA Simulation' },
        { val: 'Serialized', label: 'Component Return Tracking Model' },
        { val: 'Concept', label: 'Reverse Logistics Framework' }
      ],
      schematicSvg: `<svg class="schematic-svg" viewBox="0 0 540 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Warranty triage flow schematic">
        <rect x="10" y="25" width="115" height="50" rx="8" fill="#FBF8F3" stroke="#E2DCD5" stroke-width="1.5" />
        <text x="67" y="46" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11" fill="#1C1A17" text-anchor="middle">Depot Return Intake</text>
        <text x="67" y="60" font-family="JetBrains Mono, monospace" font-size="9" fill="#8B7FB8" text-anchor="middle">Serialized RMA Tag</text>

        <path d="M 125 50 L 165 50" stroke="#8B7FB8" stroke-width="2" />
        <polygon points="165,46 171,50 165,54" fill="#8B7FB8" />

        <rect x="173" y="20" width="130" height="60" rx="8" fill="#FFF" stroke="#8B7FB8" stroke-width="1.5" />
        <text x="238" y="44" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="11.5" fill="#1C1A17" text-anchor="middle">3-Tier Triage Router</text>
        <text x="238" y="58" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#5A554E" text-anchor="middle">Diagnostic Testing</text>
        <text x="238" y="70" font-family="JetBrains Mono, monospace" font-size="8.5" fill="#8B7FB8" text-anchor="middle">SLA Decision Tree</text>

        <path d="M 303 35 L 345 25" stroke="#1D7C6B" stroke-width="1.5" />
        <polygon points="345,22 352,25 345,28" fill="#1D7C6B" />
        <rect x="355" y="10" width="175" height="25" rx="5" fill="#FBF8F3" stroke="#1D7C6B" stroke-width="1" />
        <text x="442" y="26" font-family="JetBrains Mono, monospace" font-size="9" fill="#1D7C6B" text-anchor="middle">Tier 1: Bench Repair / Refurb</text>

        <path d="M 303 50 L 345 50" stroke="#D98A36" stroke-width="1.5" />
        <polygon points="345,47 352,50 345,53" fill="#D98A36" />
        <rect x="355" y="38" width="175" height="25" rx="5" fill="#FBF8F3" stroke="#D98A36" stroke-width="1" />
        <text x="442" y="54" font-family="JetBrains Mono, monospace" font-size="9" fill="#D98A36" text-anchor="middle">Tier 2: Vendor Credit Claim</text>

        <path d="M 303 65 L 345 75" stroke="#E05A47" stroke-width="1.5" />
        <polygon points="345,72 352,75 345,78" fill="#E05A47" />
        <rect x="355" y="65" width="175" height="25" rx="5" fill="#FBF8F3" stroke="#E05A47" stroke-width="1" />
        <text x="442" y="81" font-family="JetBrains Mono, monospace" font-size="9" fill="#E05A47" text-anchor="middle">Tier 3: Salvage Raw Scrap</text>
      </svg>`
    }
  };

  let activeProject = 'cavinkare';
  let activeFilter = 'all';

  const projectFilterBtns = $$('.project-filter-btn');
  const projectEntries = $$('.project-index-entry');
  const previewCategory = $('#previewCategory');
  const previewDate = $('#previewDate');
  const previewConceptNotice = $('#previewConceptNotice');
  const previewConceptText = $('#previewConceptText');
  const previewTitle = $('#previewTitle');
  const previewSchematicStage = $('#previewSchematicStage');
  const previewProblem = $('#previewProblem');
  const previewAction = $('#previewAction');
  const previewMetrics = $('#previewMetrics');
  const previewDossierBtn = $('#previewDossierBtn');

  function renderProjectPreview(projectId) {
    if (!projectsData[projectId]) return;
    const p = projectsData[projectId];

    if (previewCategory) previewCategory.textContent = p.category;
    if (previewDate) previewDate.textContent = p.date;

    if (previewConceptNotice) {
      if (p.isConcept) {
        previewConceptNotice.style.display = 'block';
        if (previewConceptText) previewConceptText.textContent = p.conceptPill || 'Synthetic Dataset & Conceptual Architecture';
      } else {
        previewConceptNotice.style.display = 'none';
      }
    }

    if (previewTitle) previewTitle.textContent = p.title;
    if (previewSchematicStage) previewSchematicStage.innerHTML = p.schematicSvg;
    if (previewProblem) previewProblem.textContent = p.problem;
    if (previewAction) previewAction.textContent = p.action;

    if (previewMetrics && p.metrics) {
      previewMetrics.innerHTML = p.metrics.map(m => `
        <div class="metric-card">
          <strong class="metric-val">${m.val}</strong>
          <span class="metric-sub">${m.label}</span>
        </div>
      `).join('');
    }

    if (previewDossierBtn) {
      previewDossierBtn.dataset.openCase = projectId;
    }
  }

  function selectProject(projectId) {
    if (!projectsData[projectId]) return;
    activeProject = projectId;

    projectEntries.forEach((entry) => {
      const isSel = entry.dataset.projectId === projectId;
      entry.classList.toggle('is-selected', isSel);
      entry.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });

    renderProjectPreview(projectId);
  }

  function setProjectFilter(filterKey) {
    activeFilter = filterKey;

    projectFilterBtns.forEach((btn) => {
      const isSel = btn.dataset.filter === filterKey;
      btn.classList.toggle('is-active', isSel);
    });

    let visibleCards = [];
    projectEntries.forEach((entry) => {
      const cat = entry.dataset.category;
      const isVisible = filterKey === 'all' || cat === filterKey;
      entry.style.display = isVisible ? 'flex' : 'none';
      if (isVisible) visibleCards.push(entry);
    });

    // If currently active project is hidden by filter, select first visible project
    const currentEntry = document.querySelector(`.project-index-entry[data-project-id="${activeProject}"]`);
    if (currentEntry && currentEntry.style.display === 'none' && visibleCards.length > 0) {
      selectProject(visibleCards[0].dataset.projectId);
    }
  }

  // Filter Button Clicks
  projectFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => setProjectFilter(btn.dataset.filter));
  });

  // Project Entry Hover, Click & Keyboard Navigation
  projectEntries.forEach((entry, idx) => {
    entry.addEventListener('click', () => selectProject(entry.dataset.projectId));
    entry.addEventListener('mouseenter', () => selectProject(entry.dataset.projectId));
    entry.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectProject(entry.dataset.projectId);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const visibleEntries = Array.from(projectEntries).filter(el => el.style.display !== 'none');
        const curIdx = visibleEntries.indexOf(entry);
        if (curIdx >= 0 && curIdx < visibleEntries.length - 1) {
          visibleEntries[curIdx + 1].focus();
          selectProject(visibleEntries[curIdx + 1].dataset.projectId);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const visibleEntries = Array.from(projectEntries).filter(el => el.style.display !== 'none');
        const curIdx = visibleEntries.indexOf(entry);
        if (curIdx > 0) {
          visibleEntries[curIdx - 1].focus();
          selectProject(visibleEntries[curIdx - 1].dataset.projectId);
        }
      }
    });
  });

  // Initial render of preview
  renderProjectPreview(activeProject);

  // ==========================================================================
  // 8. CASE STUDY DOSSIER DATA & INJECTION (All 4 Retained & Factually Audited)
  // ==========================================================================
  const caseDossiers = {
    cavinkare: {
      category: 'PROFESSIONAL EXPERIENCE // CAVINKARE',
      title: 'Making a Beat Work Harder: FMCG Retail Beat & Territory Expansion in Mumbai',
      sections: [
        {
          heading: '01 // Verified Role & Operating Scope',
          body: 'Sales Representative — CavinKare (Third-Party Payroll) · Oct 2025 – Feb 2026\nTerritory: Andheri to Bandra corridor, Mumbai (50+ General Trade retail outlets, supermarkets, and local distributors).'
        },
        {
          heading: '02 // The Frontline Bottleneck',
          body: 'High outlet density, tight retailer working capital, and asynchronous reorder cycles between field order booking and distributor dispatch risked stockouts on fast-moving SKUs while leaving underserved accounts neglected.'
        },
        {
          heading: '03 // 3-Step Field Execution Architecture',
          body: '1. Beat Segmentation & Route Planning: Sequenced 50+ retail outlets by sales velocity and order reliability, reserving dedicated prospecting windows that onboarded 10+ new General Trade accounts in Month 1 (+20% active retailer-base expansion).\n2. Replenishment Synchronization: Coordinated primary and secondary order booking directly with distributor closing stock to maintain on-shelf product availability.\n3. Merchandising & Trade Schemes: Secured prime counter visibility and executed targeted trade schemes, delivering a confirmed +30% month-on-month revenue growth in focus categories.'
        },
        {
          heading: '04 // Market Intelligence & Operational Takeaway',
          body: 'Consistently tracked performance against sales targets and shared competitor pricing and market feedback to guide territory decisions. Confirms how revenue growth in General Trade distribution depends directly on replenishment reliability and disciplined beat routines.'
        }
      ],
      takeaways: {
        title: 'Core Field Lesson',
        text: 'A territory sales representative is the vital sensory link in consumer distribution—connecting counter-level buying patterns to distributor fulfillment.'
      }
    },
    onlysolar: {
      category: 'ENTREPRENEURSHIP // ONLY SOLAR',
      title: 'From Supplier to Shelf: Cross-Border Sourcing, Pricing & Commercial Operations',
      sections: [
        {
          heading: '01 // Verified Role & Operating Scope',
          body: 'Co-Founder & Business Head — Only Solar (Import & Export) · 2024 – Early 2025\nMumbai, India · Commercial solar, street, and flood lighting equipment.'
        },
        {
          heading: '02 // The Operational Challenge',
          body: 'Launching an import-distribution venture required establishing reliable overseas manufacturer relationships, managing international freight logistics, and setting viable pricing structures for domestic commercial customers.'
        },
        {
          heading: '03 // Genuine Operational Responsibilities',
          body: '1. Supplier Sourcing & Negotiation: Sourced international manufacturers, conducted supplier due diligence, and negotiated purchase contracts and FOB pricing.\n2. Import Logistics Management: Managed overseas shipping, customs clearance coordination, port documentation, and inland transit to maintain supply reliability.\n3. Commercial GTM & P&L: Developed the venture sales strategy, pricing models, and go-to-market plan; built customer and distributor relationships and oversaw daily business operations and commercial decisions.'
        },
        {
          heading: '04 // Entrepreneurial Takeaway',
          body: 'Provided direct, end-to-end exposure to the entire commercial lifecycle of running a business: from overseas factory evaluation and logistics documentation to customer conversion and P&L control.'
        }
      ],
      takeaways: {
        title: 'Core Venture Lesson',
        text: 'Commercial viability in import distribution depends on disciplined cost modeling—factoring tariffs, shipping volatility, and working capital into every pricing decision.'
      }
    },
    pipeline: {
      category: 'INDEPENDENT ANALYTICAL CONCEPT',
      title: 'See the Whole Flow: Field-to-Distributor Inventory Visibility Architecture',
      sections: [
        {
          heading: '01 // Nature of Project: Independent Analytical Concept',
          body: 'Independent conceptual architecture combining Computer Science engineering fundamentals (B.Tech CS, Graduated 2024) with FMCG field distribution observations. Note: Uses synthetic datasets to model supply chain visibility.'
        },
        {
          heading: '02 // The Structural Problem',
          body: 'In traditional retail distribution, field sales representatives often book orders without visibility into distributor warehouse inventory, while supply planners only see aggregated primary sales—leading to avoidable stockout gaps.'
        },
        {
          heading: '03 // Conceptual System Design',
          body: '1. Relational Database Schema (SQL): Designed a conceptual third-normal-form (3NF) relational data model linking Store Masters, Beat Visit Logs, SKU Bookings, and Distributor Closing Stock.\n2. Replenishment Dashboards (Power BI): Modeled key operational indicators including Beat Strike Rate, SKU Fill-Rate Gaps, and Days-Since-Last-Order.\n3. Exception Triggers: Specified automated rules to flag high-velocity retail outlets at risk of stockout before the morning beat begins.'
        },
        {
          heading: '04 // Analytical Takeaway',
          body: 'Demonstrates how computational data structures and business intelligence tools can resolve physical information handoffs between field sales and warehouse replenishment.'
        }
      ],
      takeaways: {
        title: 'Conceptual Architecture Lesson',
        text: 'Relational clarity beats dashboard vanity. A useful system highlights exactly where human operational intervention is needed before a stockout occurs.'
      }
    },
    reverse: {
      category: 'INDEPENDENT OPERATIONS ANALYTICS CONCEPT',
      title: 'Exceptions First: Closed-Loop Reverse Logistics & Warranty Lifecycle Triage Model',
      sections: [
        {
          heading: '01 // Nature of Project: Independent Analytical Concept',
          body: 'Independent operations analytics model exploring structured warranty workflows and return triage protocols. Note: Uses illustrative operational scenarios to demonstrate decision logic.'
        },
        {
          heading: '02 // The Reverse Logistics Challenge',
          body: 'In hardware distribution, returned equipment and warranty authorizations often sit idle in regional depots without structured triage, locking capital and triggering customer friction.'
        },
        {
          heading: '03 // Conceptual Workflow Architecture',
          body: '1. 3-Tier Diagnostic Intake: Conceptualized triage criteria at depot receipt (Tier A: immediate repair, Tier B: supplier warranty reclamation, Tier C: scrap recovery).\n2. Standardized SOP Workflows: Modeled turnaround target SLAs with serialized tracking.\n3. Supplier Warranty Reclamation: Mapped diagnostic reporting workflows to recover vendor credits against future purchase lots.'
        },
        {
          heading: '04 // Operational Takeaway',
          body: 'Shows how reverse logistics can be transformed from an unstructured cost center into an actionable quality feedback mechanism.'
        }
      ],
      takeaways: {
        title: 'Analytical Modeling Lesson',
        text: 'Reverse logistics is not waste disposal—it is a critical diagnostic feedback loop for supplier quality audits.'
      }
    }
  };

  const caseDialog = $('#caseDialog');
  const caseDialogCategory = $('#caseDialogCategory');
  const caseDialogBody = $('#caseDialogBody');

  $$('[data-open-case]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caseId = btn.dataset.openCase;
      const data = caseDossiers[caseId];
      if (!data) return;

      if (caseDialogCategory) caseDialogCategory.textContent = data.category;
      if (caseDialogBody) {
        let html = `<h3 class="dialog-title">${data.title}</h3>`;
        html += '<div class="dossier-body">';
        data.sections.forEach((sec) => {
          html += `
            <div class="dossier-section">
              <h4>${sec.heading}</h4>
              <p>${sec.body}</p>
            </div>
          `;
        });
        if (data.takeaways) {
          html += `
            <div class="dossier-takeaways">
              <strong>${data.takeaways.title}</strong>
              <p>${data.takeaways.text}</p>
            </div>
          `;
        }
        html += '</div>';
        caseDialogBody.innerHTML = html;
      }

      openDialog('caseDialog');
    });
  });

  // ==========================================================================
  // 9. MILESTONE INSPECTOR MODAL (Factually Audited Career Records)
  // ==========================================================================
  const milestoneData = {
    mba: {
      category: 'GRADUATE EDUCATION // PURSUING',
      title: 'Master of Business Administration (MBA) — 2026–2028',
      inst: 'Lovely Professional University (LPU), Punjab, India',
      overview: 'Currently pursuing an MBA specializing in Operations & Logistics to sharpen strategic management, global supply chain planning, and commercial operations capabilities. (Minor is currently undecided).',
      highlights: [
        'Confirmed Major: Operations & Logistics Management.',
        'Supply Chain & Sourcing: Quantitative inventory models, procurement strategy, and distribution network planning.',
        'Enterprise Systems: Operations planning, ERP integration concepts, and process standard operating procedures (SOPs).'
      ]
    },
    cavinkare: {
      category: 'FIELD SALES // PROFESSIONAL EXPERIENCE',
      title: 'Sales Representative — CavinKare (Third-Party Payroll) · Oct 2025 – Feb 2026',
      inst: 'Territory: Andheri to Bandra, Mumbai',
      overview: 'Managed field sales and retail distribution across the high-density Andheri-Bandra corridor, covering General Trade outlets, supermarkets, and local distributors.',
      highlights: [
        '50+ Retail Outlets Covered: Managed regular route coverage and order booking across general trade and supermarkets.',
        '+20% Active Retail Base: Prospected and onboarded 10+ new General Trade accounts within Month 1 through route planning.',
        '+30% MoM Revenue Lift: Achieved confirmed month-on-month revenue growth in focus categories through planogram compliance and trade schemes.',
        'Distributor Replenishment: Coordinated primary and secondary order booking directly with distributor inventory to maintain product availability.',
        'Market Feedback: Shared regular competitor insights and market feedback to guide territory decisions.'
      ]
    },
    venture: {
      category: 'ENTREPRENEURSHIP // VENTURE LEADERSHIP',
      title: 'Co-Founder & Business Head — Only Solar · 2024 – Early 2025',
      inst: 'Import & Export of Commercial Solar, Street & Flood Lighting, Mumbai',
      overview: 'Co-founded an import-export venture focused on sourcing and distributing commercial solar, street, and flood lighting products.',
      highlights: [
        'International Supplier Sourcing: Sourced and vetted overseas manufacturers; led vendor negotiations.',
        'Import Logistics & Compliance: Managed cross-border freight coordination, port clearing documentation, and inland transit.',
        'Commercial GTM & Pricing: Formulated sales strategy, pricing structures, and go-to-market plans.',
        'Distributor Relationships & P&L: Managed customer and distributor accounts, oversaw daily business operations, and made commercial P&L decisions.'
      ]
    },
    btech: {
      category: 'UNDERGRADUATE EDUCATION // ENGINEERING',
      title: 'Bachelor of Technology (BTech), Computer Science Engineering — Graduated 2024',
      inst: 'Lovely Professional University (LPU), Punjab, India',
      overview: 'Four-year engineering degree providing rigorous training in relational database systems, algorithms, software engineering, and computational problem-solving.',
      highlights: [
        'Relational Databases & SQL: Third-normal-form schema design, indexing, transactions, and analytical queries.',
        'Data Structures & Algorithms: Computational optimization and graph traversal logic applicable to routing and scheduling.',
        'Analytical Foundation: Translating operational and commercial handoffs into structured, repeatable data workflows.'
      ]
    }
  };

  const milestoneCategory = $('#milestoneCategory');
  const milestoneDialogBody = $('#milestoneDialogBody');

  $$('[data-inspect-milestone]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.inspectMilestone;
      const data = milestoneData[id];
      if (!data) return;

      if (milestoneCategory) milestoneCategory.textContent = data.category;
      if (milestoneDialogBody) {
        let html = `
          <h3 class="dialog-title">${data.title}</h3>
          <p class="dialog-intro">${data.inst}</p>
          <div class="dossier-section">
            <h4>Role &amp; Context Overview</h4>
            <p>${data.overview}</p>
          </div>
          <div class="dossier-section">
            <h4>Key Responsibilities &amp; Highlights</h4>
            <ul class="cap-list" style="margin-top:0.75rem;">
        `;
        data.highlights.forEach((h) => {
          html += `<li><strong>•</strong> ${h}</li>`;
        });
        html += '</ul></div>';
        milestoneDialogBody.innerHTML = html;
      }

      openDialog('milestoneDialog');
    });
  });

  // ==========================================================================
  // 10. OPERATIONS LAB: DECISION SIMULATORS (Synthetic Assumptions & Scenarios)
  // ==========================================================================
  // Lab Tab Switching
  const labTabs = $$('.lab-tab-btn');
  const toolCalculator = $('#toolCalculator');
  const toolTriage = $('#toolTriage');

  labTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      labTabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      const tool = tab.dataset.labTool;
      if (tool === 'calculator') {
        toolCalculator?.classList.add('is-active');
        toolTriage?.classList.remove('is-active');
      } else {
        toolCalculator?.classList.remove('is-active');
        toolTriage?.classList.add('is-active');
      }
    });
  });

  // Tool 1: Landed-Cost Calculator Engine (Synthetic Model Assumptions)
  const calcUnits = $('#calcUnits');
  const calcFob = $('#calcFob');
  const calcFreight = $('#calcFreight');
  const calcDuty = $('#calcDuty');
  const calcTransit = $('#calcTransit');
  const targetMargin = $('#targetMargin');

  const valUnits = $('#valUnits');
  const valFob = $('#valFob');
  const valFreight = $('#valFreight');
  const valDuty = $('#valDuty');
  const valTransit = $('#valTransit');

  const resUnitLanded = $('#resUnitLanded');
  const resFobShare = $('#resFobShare');
  const resFobTotal = $('#resFobTotal');
  const resFreightTotal = $('#resFreightTotal');
  const resDutyTotal = $('#resDutyTotal');
  const resTransitTotal = $('#resTransitTotal');
  const resGrandTotal = $('#resGrandTotal');
  const resTargetPrice = $('#resTargetPrice');

  const USD_TO_INR = 83.0; // Illustrative reference rate

  function formatRupees(num) {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function calculateLandedCosts() {
    const units = parseFloat(calcUnits?.value || 1000);
    const fobUsd = parseFloat(calcFob?.value || 45);
    const freightUsd = parseFloat(calcFreight?.value || 2800);
    const dutyPct = parseFloat(calcDuty?.value || 18);
    const transitInr = parseFloat(calcTransit?.value || 120);
    const marginPct = parseFloat(targetMargin?.value || 25);

    // Update slider label readouts
    if (valUnits) valUnits.textContent = units.toLocaleString();
    if (valFob) valFob.textContent = `$${fobUsd.toFixed(2)}`;
    if (valFreight) valFreight.textContent = `$${freightUsd.toLocaleString()}`;
    if (valDuty) valDuty.textContent = `${dutyPct}%`;
    if (valTransit) valTransit.textContent = `₹${transitInr}`;

    // Financial calculations
    const fobTotalInr = units * fobUsd * USD_TO_INR;
    const freightTotalInr = freightUsd * USD_TO_INR;
    const dutyTotalInr = (fobTotalInr + freightTotalInr) * (dutyPct / 100);
    const transitTotalInr = units * transitInr;
    const grandTotalInr = fobTotalInr + freightTotalInr + dutyTotalInr + transitTotalInr;

    const unitLandedInr = grandTotalInr / units;
    const targetPriceInr = unitLandedInr / (1 - (marginPct / 100));
    const fobSharePct = Math.round((fobTotalInr / grandTotalInr) * 100);

    // Update result cards
    if (resUnitLanded) resUnitLanded.textContent = formatRupees(unitLandedInr);
    if (resFobShare) resFobShare.textContent = `Factory FOB represents ${fobSharePct}% of total landed cost`;
    if (resFobTotal) resFobTotal.textContent = formatRupees(fobTotalInr);
    if (resFreightTotal) resFreightTotal.textContent = formatRupees(freightTotalInr);
    if (resDutyTotal) resDutyTotal.textContent = formatRupees(dutyTotalInr);
    if (resTransitTotal) resTransitTotal.textContent = formatRupees(transitTotalInr);
    if (resGrandTotal) resGrandTotal.textContent = formatRupees(grandTotalInr);
    if (resTargetPrice) resTargetPrice.textContent = `${formatRupees(targetPriceInr)} / Unit`;
  }

  [calcUnits, calcFob, calcFreight, calcDuty, calcTransit, targetMargin].forEach((input) => {
    input?.addEventListener('input', calculateLandedCosts);
  });
  calculateLandedCosts();

  // Tool 2: Illustrative Exception Triage Simulator (Synthetic Scenarios)
  const initialIncidents = [
    {
      id: 'SYN-101',
      title: 'Port Custom Documentation Verification Delay',
      desc: 'Illustrative import container awaiting tariff classification verification at port customs. Free demurrage buffer ends in 48 hours.',
      sev: 'sev-high',
      sevLabel: 'HIGH PRIORITY',
      time: 'T-48h',
      resolved: false,
      impact: 'Illustrative demurrage cost risk and downstream distributor fulfillment delay.',
      options: [
        {
          label: 'A: File provisional tariff guarantee and submit clarification note.',
          resolution: 'Provisional release granted. Demurrage avoided; compliance documents submitted.'
        },
        {
          label: 'B: Route secondary buffer inventory to protect customer delivery SLAs.',
          resolution: 'Customer deliveries preserved; depot buffer drawn down by 30%.'
        }
      ]
    },
    {
      id: 'SYN-202',
      title: 'High-Velocity General Trade SKU Out of Stock',
      desc: 'Illustrative retail cluster reports zero stock of fast-moving SKU ahead of weekend buying peak.',
      sev: 'sev-high',
      sevLabel: 'HIGH PRIORITY',
      time: 'T-12h',
      resolved: false,
      impact: 'Lost counter sales and retailer shelf-share displacement.',
      options: [
        {
          label: 'A: Coordinate emergency cross-dock replenishment with distributor.',
          resolution: 'Emergency morning dispatch scheduled; retail counter stock restored by 9:00 AM.'
        },
        {
          label: 'B: Execute inter-outlet stock balancing from lower-velocity stores.',
          resolution: 'Inter-outlet transfer completed; core retail tier protected without extra freight.'
        }
      ]
    },
    {
      id: 'SYN-303',
      title: 'Distributor Credit Limit Reorder Check',
      desc: 'Illustrative key distributor order reaches 95% credit ceiling pending bank clearing.',
      sev: 'sev-med',
      sevLabel: 'MEDIUM',
      time: 'T-24h',
      resolved: false,
      impact: 'Dispatch staged at warehouse pending credit confirmation.',
      options: [
        {
          label: 'A: Confirm bank transfer reference with accounts and approve dispatch.',
          resolution: 'Payment verified; order cleared for next-morning beat delivery.'
        },
        {
          label: 'B: Deliver partial shipment against cash-on-delivery balance.',
          resolution: 'Commercial risk balanced; partial lot delivered to maintain stock continuity.'
        }
      ]
    }
  ];

  let incidents = JSON.parse(JSON.stringify(initialIncidents));
  let selectedIncident = null;

  const incidentList = $('#incidentList');
  const activeIncidentCount = $('#activeIncidentCount');
  const selectedIncidentId = $('#selectedIncidentId');
  const resolutionBody = $('#resolutionBody');
  const resetTriageBtn = $('#resetTriageBtn');

  function renderIncidentList() {
    if (!incidentList) return;
    incidentList.innerHTML = '';

    const pendingCount = incidents.filter((i) => !i.resolved).length;
    if (activeIncidentCount) {
      activeIncidentCount.textContent = `${pendingCount} Pending`;
    }

    incidents.forEach((inc) => {
      const card = document.createElement('div');
      card.className = `incident-card incident-row ${inc.resolved ? 'is-resolved' : ''} ${selectedIncident?.id === inc.id ? 'is-selected' : ''}`;
      card.dataset.incidentId = inc.id;
      card.innerHTML = `
        <div class="incident-card-top">
          <span class="incident-severity ${inc.sev}">${inc.resolved ? 'RESOLVED ✓' : inc.sevLabel}</span>
          <span class="incident-time">${inc.time}</span>
        </div>
        <div class="incident-title">${inc.id}: ${inc.title}</div>
        <p class="incident-desc">${inc.desc}</p>
      `;
      card.addEventListener('click', () => {
        selectedIncident = inc;
        renderIncidentList();
        renderResolutionPanel(inc);
      });
      incidentList.appendChild(card);
    });
  }

  function renderResolutionPanel(inc) {
    if (!resolutionBody) return;
    if (selectedIncidentId) selectedIncidentId.textContent = inc.id;

    if (inc.resolved) {
      resolutionBody.innerHTML = `
        <div class="resolution-panel">
          <h5 class="res-title">${inc.title}</h5>
          <div class="res-impact" style="border-left-color:var(--accent-teal);background:var(--accent-teal-soft)">
            <strong style="color:var(--accent-teal)">RESOLUTION SIMULATED</strong>
            <p>${inc.resolvedText || 'This scenario has been evaluated and resolved.'}</p>
          </div>
        </div>
      `;
      return;
    }

    let html = `
      <div class="resolution-panel">
        <h5 class="res-title">${inc.title}</h5>
        <div class="res-impact">
          <strong>OPERATIONAL RISK &amp; TRADE-OFF</strong>
          <p>${inc.impact}</p>
        </div>
        <strong style="font:700 11px var(--mono);color:var(--ink-light);text-transform:uppercase;">Select Decision Option:</strong>
        <div class="res-options-list">
    `;

    inc.options.forEach((opt, idx) => {
      html += `
        <button class="btn-res-option btn-sim-action" data-opt-idx="${idx}" type="button">
          ${opt.label}
        </button>
      `;
    });

    html += '</div></div>';
    resolutionBody.innerHTML = html;

    $$('.btn-res-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const optIdx = parseInt(btn.dataset.optIdx, 10);
        const chosen = inc.options[optIdx];
        inc.resolved = true;
        inc.resolvedText = chosen.resolution;
        renderIncidentList();
        renderResolutionPanel(inc);
        showToast(`Decision executed for ${inc.id}`);
      });
    });
  }

  resetTriageBtn?.addEventListener('click', () => {
    incidents = JSON.parse(JSON.stringify(initialIncidents));
    selectedIncident = null;
    renderIncidentList();
    if (resolutionBody) {
      resolutionBody.innerHTML = '<p class="placeholder-text">Click on any pending synthetic incident from the left to inspect trade-offs and simulate resolution protocol.</p>';
    }
    if (selectedIncidentId) selectedIncidentId.textContent = 'Select an incident';
    showToast('Synthetic triage queue reset');
  });

  renderIncidentList();

  // ==========================================================================
  // 11. CLIPBOARD COPY & TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  const toastManager = $('#toastManager');
  function showToast(message) {
    if (!toastManager) return;
    while (toastManager.children.length >= 2) {
      toastManager.removeChild(toastManager.firstChild);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastManager.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }

  const copyEmailBtn = $('#copyEmailBtn');
  const copyBtnText = $('#copyBtnText');
  const contactEmailLink = $('#contactEmailLink');
  const VERIFIED_EMAIL = 'jayeshsingh9b@gmail.com';

  function copyEmailToClipboard() {
    if (copyBtnText) copyBtnText.textContent = 'Email Copied ✓';
    showToast(`Copied ${VERIFIED_EMAIL} to clipboard`);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(VERIFIED_EMAIL).catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = VERIFIED_EMAIL;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        } catch (e) {
          // ignore
        }
      });
    }

    setTimeout(() => {
      if (copyBtnText) copyBtnText.textContent = 'Copy Email';
    }, 2500);
  }

  copyEmailBtn?.addEventListener('click', copyEmailToClipboard);

  // Global ⌘C / Ctrl+C shortcut handler when user has not selected other text
  document.addEventListener('keydown', (e) => {
    const isCopy = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c';
    const selection = window.getSelection().toString();
    if (isCopy && !selection) {
      const activeEl = document.activeElement;
      const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';
      if (!isInput) {
        copyEmailToClipboard();
      }
    }
  });

  // ==========================================================================
  // 12. INTERACTIVE CONTACT SECTION & GMAIL REDIRECT WORKFLOW (Portfolio V25)
  // Conversation Category Chips, Dynamic Subject Prefill, and Direct Compose
  // ==========================================================================
  const categoryChips = $$('.category-chip');
  const categoryContextNote = $('#categoryContextNote');
  const contactFormCard = $('#contactFormCard');
  const userSubjectInput = $('#userSubject');

  const topicMap = {
    ops: {
      subject: 'Operations & Logistics Discussion',
      note: 'Discussing inventory visibility, beat route productivity, and warehouse fulfillment optimization.',
      className: 'topic-ops'
    },
    supply: {
      subject: 'Supply Chain & Sourcing Inquiry',
      note: 'Discussing overseas vendor vetting, landed-cost modeling, and cross-border import logistics.',
      className: 'topic-supply'
    },
    commercial: {
      subject: 'Commercial & Business Opportunity',
      note: 'Discussing FMCG territory sales, retailer acquisition, and commercial partnerships.',
      className: 'topic-commercial'
    },
    projects: {
      subject: 'Project Collaboration & Systems',
      note: 'Discussing operations consulting, relational database tools, or co-building new systems.',
      className: 'topic-projects'
    },
    general: {
      subject: 'General Inquiry / Operational Networking',
      note: 'General questions, professional networking, or discussing ideas across technology and operations.',
      className: 'topic-general'
    }
  };

  categoryChips.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const topicKey = chip.dataset.topic;
      const data = topicMap[topicKey];
      if (!data) return;

      categoryChips.forEach((c) => {
        const isCurrent = c === chip;
        c.classList.toggle('is-selected', isCurrent);
        c.setAttribute('aria-checked', isCurrent ? 'true' : 'false');
      });

      if (categoryContextNote) {
        categoryContextNote.textContent = data.note;
      }

      if (contactFormCard) {
        contactFormCard.className = `contact-form-card ${data.className}`;
      }

      if (userSubjectInput) {
        userSubjectInput.value = data.subject;
      }

      showToast(`Topic selected: ${chip.textContent.trim()}`);
    });
  });

  const inquiryForm = $('#inquiryForm');
  const formFeedback = $('#formFeedback');
  const formFallback = $('#formFallback');
  const fallbackMailtoLink = $('#fallbackMailtoLink');

  inquiryForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('#userName')?.value.trim();
    const email = $('#userEmail')?.value.trim();
    const subject = $('#userSubject')?.value.trim();
    const message = $('#userMsg')?.value.trim();

    // 1. Validate required fields
    if (!name || !email || !subject || !message) {
      if (formFeedback) {
        formFeedback.style.color = 'var(--accent-coral)';
        formFeedback.textContent = 'Please fill out all required fields before continuing.';
      }
      return;
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (formFeedback) {
        formFeedback.style.color = 'var(--accent-coral)';
        formFeedback.textContent = 'Please enter a valid email address.';
      }
      return;
    }

    // 3. Prepare message body
    const activeChip = $('.category-chip.is-selected');
    const selectedTopic = activeChip ? activeChip.textContent.trim() : 'Operations & Logistics';
    const bodyText = `Hi Jayesh,\n\n${message}\n\n---\nDiscussion Topic: ${selectedTopic}\nFrom: ${name}\nSender's Email: ${email}`;

    // 4. Construct Gmail URL pattern
    const recipient = VERIFIED_EMAIL;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    // Prepare mailto fallback
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    if (fallbackMailtoLink) {
      fallbackMailtoLink.setAttribute('href', mailtoUrl);
    }

    // 5. Open Gmail in a new tab
    let popupBlocked = false;
    try {
      const newWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        popupBlocked = true;
      }
    } catch (err) {
      popupBlocked = true;
    }

    // 6. Appropriate feedback (DO NOT show false "sent" notification)
    if (formFeedback) {
      formFeedback.style.color = 'var(--accent-teal)';
      formFeedback.textContent = 'Opening Gmail compose window with your prefilled message. Review and send it directly from your Gmail account.';
    }

    // 7. Fallback if popup blocked
    if (popupBlocked && formFallback) {
      formFallback.style.display = 'block';
    }
  });

  console.log('Jayesh Singh — Portfolio V21 initialized successfully.');
})();
