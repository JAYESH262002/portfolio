/**
 * Jayesh Singh — V17 Minimal Operations Portfolio
 * Interactive Architecture, Simulation Engine & Progressive Disclosure System
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

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
  // 5. CUSTOM CURSOR (Desktop fine pointer only)
  // ==========================================================================
  const cursorDot = $('#cursorDot');
  const cursorRing = $('#cursorRing');

  if (finePointer && cursorDot && cursorRing) {
    window.addEventListener('pointermove', (e) => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
      cursorRing.style.left = `${e.clientX}px`;
      cursorRing.style.top = `${e.clientY}px`;
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    const interactiveSelectors = 'a, button, input, textarea, .op-node, .incident-card';
    $$(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1.6)';
        cursorRing.style.borderColor = 'var(--accent-coral)';
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorRing.style.borderColor = 'var(--accent-lavender)';
      });
    });
  }

  // ==========================================================================
  // 6. SIGNATURE OPERATIONS VISUAL (Replaces Photograph)
  // Supplier → Sourcing → Inventory → Warehouse → Distribution → Retail + Loop
  // ==========================================================================
  const stageData = [
    {
      stage: 'STAGE 01 // SUPPLIER',
      status: 'NOMINAL CADENCE',
      title: 'Factory Capacity & Overseas Lead Time',
      desc: 'Evaluating factory capacity limits, component BOM availability, and FOB terms before capital commitment. Sourcing resilience begins at the tier-1 manufacturer gate.',
      metric: 'Lead Time: 28 Days',
      context: 'Only Solar Tier-1 Manufacturer Audits'
    },
    {
      stage: 'STAGE 02 // SOURCING',
      status: 'PRICE LOCK ACTIVE',
      title: 'Landed-Cost Build-Up & Currency Risk',
      desc: 'Modeling container freight spot rates, customs tariffs, port demurrage risks, and currency fluctuations to ensure target gross margin remains viable after import.',
      metric: 'Landed Margin: +24.8%',
      context: 'Multi-variable Landed-Cost Engine'
    },
    {
      stage: 'STAGE 03 // INVENTORY',
      status: 'SAFETY BUFFER HEALTHY',
      title: 'Safety Stock, EOQ & Reorder Trigger Points',
      desc: 'Balancing inventory holding capital against stockout risk. Calculating dynamic reorder points factoring supplier lead time variance and historical sales velocity.',
      metric: 'Safety Stock: 18 Days',
      context: '3NF Relational Inventory Database'
    },
    {
      stage: 'STAGE 04 // WAREHOUSE',
      status: 'DISPATCH VELOCITY OPTIMAL',
      title: 'Inbound Receiving, Sortation & Put-Away',
      desc: 'Standardizing depot intake inspection, batch serialization, and pallet cross-docking to prevent fulfillment lag and unrecorded transit breakage.',
      metric: 'Cycle Time: 48h Inbound',
      context: 'Depot Receiving & RMA Triage Protocol'
    },
    {
      stage: 'STAGE 05 // DISTRIBUTION',
      status: 'BEAT CADENCE ACTIVE',
      title: 'Territory Route Scheduling & Fulfillment',
      desc: 'Sequencing high-density delivery routes, coordinating distributor stock dispatches, and aligning primary factory shipping with secondary field counter orders.',
      metric: 'On-Time Dispatch: 99.4%',
      context: 'Daily Beat Reorder Synchronization'
    },
    {
      stage: 'STAGE 06 // RETAIL',
      status: 'SHELF FILL RATE 98.2%',
      title: '50+ General Trade Outlets & Shelf Take-Off',
      desc: 'Direct field presence across 50+ retail counters. Auditing planogram visibility, retailer working capital limits, and fast-moving SKU velocity at point of sale.',
      metric: 'Active GT Base: +20% Lift',
      context: 'CavinKare Mumbai Beat Transformation'
    }
  ];

  const opNodes = $$('.op-node');
  const telemetryStage = $('#telemetryStage');
  const telemetryStatus = $('#telemetryStatus');
  const telemetryTitle = $('#telemetryTitle');
  const telemetryDesc = $('#telemetryDesc');
  const telemetryMetric = $('#telemetryMetric');
  const telemetryContext = $('#telemetryContext');

  function updateTelemetry(stageIdx) {
    const data = stageData[stageIdx];
    if (!data) return;

    opNodes.forEach((node, idx) => {
      node.classList.toggle('is-active', idx === stageIdx);
    });

    if (telemetryStage) telemetryStage.textContent = data.stage;
    if (telemetryStatus) telemetryStatus.innerHTML = `<i class="status-dot"></i> ${data.status}`;
    if (telemetryTitle) telemetryTitle.textContent = data.title;
    if (telemetryDesc) telemetryDesc.textContent = data.desc;
    if (telemetryMetric) telemetryMetric.textContent = data.metric;
    if (telemetryContext) telemetryContext.textContent = data.context;
  }

  opNodes.forEach((node) => {
    const idx = parseInt(node.dataset.stage, 10);
    node.addEventListener('click', () => updateTelemetry(idx));
    node.addEventListener('mouseenter', () => updateTelemetry(idx));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateTelemetry(idx);
      }
    });
  });

  // Scenario Buttons
  const scenarioBtns = $$('.scenario-btn');
  const forwardPulses = $$('.pipe-pulse');
  const feedbackPulse = $('.pulse-feedback');

  scenarioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      const scenario = btn.dataset.scenario;

      if (scenario === 'normal') {
        forwardPulses.forEach((p) => p.style.animationDuration = '5s');
        if (feedbackPulse) feedbackPulse.style.animationDuration = '4.5s';
        if (telemetryStatus) telemetryStatus.innerHTML = '<i class="status-dot"></i> NOMINAL STEADY FLOW';
        showToast('Pipeline Scenario: Steady state operations nominal');
      } else if (scenario === 'delay') {
        forwardPulses.forEach((p) => p.style.animationDuration = '9s');
        if (feedbackPulse) feedbackPulse.style.animationDuration = '6s';
        if (telemetryStatus) telemetryStatus.innerHTML = '<i class="status-dot" style="background:#c46244;box-shadow:0 0 6px #c46244"></i> PORT CLEARANCE BOTTLENECK';
        showToast('Pipeline Alert: Port clearance delay simulated (+12 days lead-time)');
      } else if (scenario === 'surge') {
        forwardPulses.forEach((p) => p.style.animationDuration = '2.5s');
        if (feedbackPulse) feedbackPulse.style.animationDuration = '2s';
        if (telemetryStatus) telemetryStatus.innerHTML = '<i class="status-dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8"></i> DEMAND SURGE DETECTED';
        showToast('Pipeline Alert: Retail demand surge triggered rapid replenishment cycle');
      }
    });
  });

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
      const rect = dlg.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
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
    }
  });

  // Trigger buttons for standalone modals
  $('#openLoopBtn')?.addEventListener('click', () => openDialog('loopDialog'));
  $('#openCapabilitiesBtn')?.addEventListener('click', () => openDialog('capabilitiesDialog'));
  $('#openCredentialsBtn')?.addEventListener('click', () => openDialog('credentialsDialog'));
  $('#openLabModalBtn')?.addEventListener('click', () => openDialog('labDialog'));

  // ==========================================================================
  // 8. CASE STUDY DOSSIER DATA & INJECTION
  // ==========================================================================
  const caseDossiers = {
    cavinkare: {
      category: 'FMCG RETAIL DISTRIBUTION',
      title: 'Optimizing Mumbai High-Frequency Retail Beat & Replenishment Sync',
      sections: [
        {
          heading: '01 // Operational Scope & Field Context',
          body: 'Sales Representative — CavinKare (Third-Party Payroll) · Oct 2025 – Feb 2026\nTerritory: Andheri to Bandra, Mumbai (50+ General Trade retail outlets, supermarkets, and local distributors).'
        },
        {
          heading: '02 // The Real Bottleneck',
          body: 'High outlet density, tight retailer working capital, and asynchronous reorder cycles between field order booking and distributor dispatch risked stockouts on fast-moving SKUs while stagnant reach remained in underserved sub-beats.'
        },
        {
          heading: '03 // 3-Step Execution Architecture',
          body: '1. Beat Segmentation & Route Engineering: Sequenced 50+ outlets by velocity and credit reliability while carving out prospecting windows that acquired 10+ new GT accounts in Month 1 (+20% active base).\n2. Replenishment Sync: Coordinated primary and secondary booking directly with distributor closing stock to protect on-time, in-full fill rates.\n3. Merchandising & Trade Schemes: Secured prime "Hot Spot" counter visibility and deployed targeted trade schemes, delivering a +30% MoM revenue increase in focus categories.'
        },
        {
          heading: '04 // Quantified Outcome & Career Takeaway',
          body: 'Demonstrates how frontline sales growth depends directly on replenishment reliability (Operations) and highlights where automated beat-level reorder alerts (Product Management) eliminate stockouts.'
        }
      ],
      takeaways: {
        title: 'Core Methodological Lesson',
        text: 'A sales rep is not just a commercial negotiator—they are the critical human sensor in a replenishment supply chain.'
      }
    },
    onlysolar: {
      category: '0→1 VENTURE SOURCING',
      title: 'Cross-Border Sourcing, Landed-Cost Modeling & B2B Distribution Launch',
      sections: [
        {
          heading: '01 // Operational Scope & Field Context',
          body: 'Co-Founder & Business Head — Only Solar (Import & Export) · 2024 – Early 2025\nMumbai, India · Commercial Solar, Street, and Flood Lighting.'
        },
        {
          heading: '02 // The Real Bottleneck',
          body: 'Launching an import-distribution lighting venture required solving overseas supplier lead times and freight/customs duty volatility on the supply side while preserving competitive multi-tier distributor margins on the demand side.'
        },
        {
          heading: '03 // 3-Step Execution Architecture',
          body: '1. Supplier Vetting & RFQ Negotiation: Evaluated international tier-1 manufacturers across defect tolerance, MOQ flexibility, and FOB unit pricing.\n2. Landed-Cost & Margin Modeling: Built unit-economics models combining FOB price, freight, customs duties, port demurrage buffers, and inland transit to structure B2B distributor price tiers.\n3. Channel Operations & P&L Control: Led B2B buyer relationships, distributor onboarding, working-capital cycles, and warranty reconciliation.'
        },
        {
          heading: '04 // Quantified Outcome & Career Takeaway',
          body: 'Connects cross-border procurement and landed-cost math (Operations) directly to channel pricing, positioning, and B2B conversion (Sales & Marketing).'
        }
      ],
      takeaways: {
        title: 'Core Methodological Lesson',
        text: 'Never commit capital to an FOB quote until ocean demurrage, inspection delays, and inland transit damage have been fully factored into landed unit margins.'
      }
    },
    pipeline: {
      category: 'DATA & SYSTEMS ARCHITECTURE',
      title: 'Relational Supply Chain Inventory Pipeline & OTIF Dashboard Architecture',
      sections: [
        {
          heading: '01 // Operational Scope & Field Context',
          body: 'Applied Systems & Analytics Blueprint synthesizing B.Tech CS (LPU, 75.8%), SQL/Power BI data modeling, and Mumbai FMCG distribution workflows.'
        },
        {
          heading: '02 // The Real Bottleneck',
          body: 'In General Trade distribution, field reps book orders without real-time visibility into distributor warehouse stock, while supply planners only see aggregated primary sales—causing phantom stockouts and lost weekend secondary sales.'
        },
        {
          heading: '03 // 3-Step Execution Architecture',
          body: '1. Relational SQL Schema: Linked Outlet Master, Beat Visit Logs, SKU Order Bookings, and Distributor Closing Inventory into one unified 3NF model.\n2. Power BI KPI Layer: Instrumented Beat Strike Rate, Outlet Drop Size, SKU Fill-Rate Gap, and Days-Since-Last-Order.\n3. Exception Workflow Rules: Specified lightweight SFA/DMS alerts that flag high-velocity outlets at risk of stockout before the morning beat begins.'
        },
        {
          heading: '04 // Quantified Outcome & Career Takeaway',
          body: 'Showcases how Computer Science and BI tools (Product/Tech) solve physical inventory replenishment and territory sales bottlenecks (Operations & Commercial).'
        }
      ],
      takeaways: {
        title: 'Core Methodological Lesson',
        text: 'Relational clarity beats dashboard vanity. An operational system is only as good as its ability to highlight what requires human intervention right now.'
      }
    },
    reverse: {
      category: 'REVERSE LOGISTICS & QUALITY',
      title: 'Closed-Loop B2B Return Merchandise Authorization (RMA) Workflow',
      sections: [
        {
          heading: '01 // Operational Scope & Field Context',
          body: 'Reverse Logistics & Warranty Lifecycle Architecture · Only Solar Venture & Distribution Operations.'
        },
        {
          heading: '02 // The Real Bottleneck',
          body: 'Solar lighting hardware returns (driver failures, cell degradation) sat in regional distribution depots for weeks without triage, locking working capital and triggering customer friction.'
        },
        {
          heading: '03 // 3-Step Execution Architecture',
          body: '1. Intake Classification: Implemented 3-tier depot triage (A: immediate bench repair, B: supplier credit reclaim, C: raw scrap separation).\n2. Standardized SOP: Established 48-hour RMA turnaround SLA with serialized component barcode tracking.\n3. Supplier Warranty Claim Reconciliation: Bundled defect diagnostic reports to recover vendor credits directly against subsequent container orders.'
        },
        {
          heading: '04 // Quantified Outcome & Career Takeaway',
          body: 'Reduced average RMA depot dwell time by 65% and turned an unstructured cost leak into an actionable feedback loop for tier-1 supplier quality audits.'
        }
      ],
      takeaways: {
        title: 'Core Methodological Lesson',
        text: 'Reverse logistics is not waste management—it is the highest-signal quality feedback loop in modern operations.'
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
  // 9. MILESTONE INSPECTOR MODAL
  // ==========================================================================
  const milestoneData = {
    mba: {
      category: 'CURRENT ACADEMICS',
      title: 'MBA Candidate — Operations & Logistics Major (2024–2026)',
      inst: 'Lovely Professional University (LPU), Punjab, India',
      overview: 'Dedicated full-time specialization in end-to-end supply chain management, quantitative production scheduling, enterprise resource planning (ERP), and multi-modal logistics economics.',
      highlights: [
        'Advanced Supply Chain Design: Linear programming for warehouse node placement and freight network optimization.',
        'Inventory Optimization: Statistical safety stocks, stochastic demand modeling, and lead-time risk mitigation.',
        'ERP Integration: Process mapping from procurement purchase requisitions (PR) through three-way invoice matching and dispatch fulfillment.'
      ]
    },
    venture: {
      category: 'VENTURE EXECUTION',
      title: 'Co-Founder & Operations Lead — Only Solar (2023–2024)',
      inst: 'Renewable Lighting Equipment Distribution, Mumbai',
      overview: 'Bootstrapped and led international sourcing, freight logistics, and B2B wholesale distribution for commercial solar lighting hardware.',
      highlights: [
        'Global Sourcing: Identified and audited tier-1 manufacturers overseas; negotiated FOB pricing and quality inspection SLAs.',
        'Customs & Demurrage Management: Coordinated customs broker clearing through Nhava Sheva (JNPT) port without demurrage penalties.',
        'B2B Channel Strategy: Scaled dealer distribution network, established credit terms, and delivered positive gross operating margins.'
      ]
    },
    cavinkare: {
      category: 'FIELD SALES & BEAT OPERATIONS',
      title: 'Sales Representative — CavinKare (2023)',
      inst: 'Mumbai Territory Beat Execution (Third-Party Payroll)',
      overview: 'Owned daily field operations across a 50+ retail outlet beat in high-density Western Mumbai consumer clusters.',
      highlights: [
        'Territory Beat Engineering: Redesigned daily store visit sequence to eliminate travel deadhead and balance order frequency.',
        '+20% Month-1 Expansion: Systematically prospected underserved general trade shops, onboarding 10+ new active retail accounts in Month 1.',
        'Secondary-to-Primary Sync: Coordinated retail replenishment orders directly against distributor inventory to prevent stockouts on key SKUs.'
      ]
    },
    btech: {
      category: 'ENGINEERING FOUNDATION',
      title: 'B.Tech in Computer Science & Engineering (2019–2023)',
      inst: 'Lovely Professional University · 75.8% Aggregate',
      overview: 'Four-year engineering degree providing rigorous training in relational database systems, algorithms, software development life cycles, and analytical problem-solving.',
      highlights: [
        'Relational Databases & SQL: Third-normal-form schema design, indexing, transactions, and complex analytical queries.',
        'Algorithmic Thinking: Graph traversal, sorting algorithms, and optimization fundamentals applied to logistics routing.',
        'Data Systems: Python, pandas, and data structures applied to supply chain anomaly detection.'
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
            <h4>Key Operations &amp; Systems Highlights</h4>
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
  // 10. OPERATIONS LAB: DECISION SIMULATORS (Inside #labDialog)
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

  // Tool 1: Landed-Cost Calculator Engine
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

  const USD_TO_INR = 83.0; // Current standard reference exchange rate

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

  // Tool 2: Exception Triage Board Simulator
  const initialIncidents = [
    {
      id: 'INC-204',
      title: 'Container Demurrage Alert at JNPT Port',
      desc: '40ft container holding 1,200 solar modules delayed at customs due to bill of entry tariff code discrepancy. Free detention ends in 48 hours.',
      sev: 'sev-high',
      sevLabel: 'CRITICAL',
      time: 'T-48h',
      resolved: false,
      impact: 'Risk of ₹18,000/day shipping line demurrage + potential wholesale customer stockout.',
      options: [
        {
          label: 'A: Pay provisional duty guarantee and file urgent amendment.',
          resolution: 'Immediate container release granted. Demurrage avoided completely. Ledger balance cleared in 14 days.'
        },
        {
          label: 'B: Route regional buffer inventory to fulfill customer commitments.',
          resolution: 'Customer deliveries preserved at 100% OTIF; depot stock drawn down by 35%.'
        }
      ]
    },
    {
      id: 'INC-318',
      title: 'Fast-Moving SKU Stockout in Andheri Cluster',
      desc: '12 high-velocity general trade outlets report zero stock of 100ml personal care SKU ahead of the weekend buying peak.',
      sev: 'sev-high',
      sevLabel: 'CRITICAL',
      time: 'T-12h',
      resolved: false,
      impact: 'Estimated lost secondary sales of ₹85,000 across Saturday-Sunday beat.',
      options: [
        {
          label: 'A: Trigger emergency distributor cross-dock delivery tonight.',
          resolution: 'Emergency dispatch dispatched via local tempo. All 12 outlets replenished by 8:30 AM.'
        },
        {
          label: 'B: Reallocate stock from low-velocity sub-beat stores.',
          resolution: 'Inter-outlet stock transfer executed; protected primary retail tier without extra freight.'
        }
      ]
    },
    {
      id: 'INC-402',
      title: 'Distributor Credit Limit Soft Hold',
      desc: 'Key Bandra distributor reached 98% credit threshold due to pending clearing cheque, holding automated primary dispatch order.',
      sev: 'sev-med',
      sevLabel: 'MEDIUM',
      time: 'T-24h',
      resolved: false,
      impact: '₹2,40,000 shipment staged on warehouse loading dock waiting for release.',
      options: [
        {
          label: 'A: Verify RTGS bank transfer reference and authorize 24h provisional release.',
          resolution: 'Funds verified with accounts; dispatch cleared without disrupting Monday morning beat.'
        },
        {
          label: 'B: Split dispatch into partial shipment against cash-on-delivery balance.',
          resolution: 'Risk mitigated; distributor accepted partial lot; remaining goods held until cheque clearance.'
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
      card.className = `incident-card ${inc.resolved ? 'is-resolved' : ''} ${selectedIncident?.id === inc.id ? 'is-selected' : ''}`;
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
            <strong style="color:var(--accent-teal)">RESOLUTION LOGGED</strong>
            <p>${inc.resolvedText || 'This exception has been triaged and resolved.'}</p>
          </div>
        </div>
      `;
      return;
    }

    let html = `
      <div class="resolution-panel">
        <h5 class="res-title">${inc.title}</h5>
        <div class="res-impact">
          <strong>OPERATIONAL RISK &amp; IMPACT</strong>
          <p>${inc.impact}</p>
        </div>
        <strong style="font:700 11px var(--mono);color:var(--ink-light);text-transform:uppercase;">Select Triage Resolution:</strong>
        <div class="res-options-list">
    `;

    inc.options.forEach((opt, idx) => {
      html += `
        <button class="btn-res-option" data-opt-idx="${idx}" type="button">
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
        showToast(`Triage executed for ${inc.id}`);
      });
    });
  }

  resetTriageBtn?.addEventListener('click', () => {
    incidents = JSON.parse(JSON.stringify(initialIncidents));
    selectedIncident = null;
    renderIncidentList();
    if (resolutionBody) {
      resolutionBody.innerHTML = '<p class="placeholder-text">Click on any pending incident from the left to inspect trade-offs and trigger resolution protocol.</p>';
    }
    if (selectedIncidentId) selectedIncidentId.textContent = 'Select an incident';
    showToast('Triage queue reset to nominal default');
  });

  renderIncidentList();

  // ==========================================================================
  // 11. CLIPBOARD COPY & TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  const toastManager = $('#toastManager');
  function showToast(message) {
    if (!toastManager) return;
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

  function copyEmailToClipboard() {
    const email = contactEmailLink?.textContent || 'singhjayesh416@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      if (copyBtnText) copyBtnText.textContent = 'Copied ✓';
      showToast(`Copied ${email} to clipboard`);
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy (⌘C)';
      }, 2500);
    }).catch(() => {
      showToast(`Email: ${email}`);
    });
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
  // 12. DIRECT INQUIRY FORM VALIDATION
  // ==========================================================================
  const inquiryForm = $('#inquiryForm');
  const formFeedback = $('#formFeedback');

  inquiryForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#userName')?.value.trim();
    const email = $('#userEmail')?.value.trim();
    const message = $('#userMsg')?.value.trim();

    if (!name || !email || !message) {
      if (formFeedback) {
        formFeedback.style.color = 'var(--accent-coral)';
        formFeedback.textContent = 'Please fill out all required fields before sending.';
      }
      return;
    }

    if (formFeedback) {
      formFeedback.style.color = 'var(--accent-teal)';
      formFeedback.textContent = `Thank you, ${name}. Your message has been prepared for dispatch.`;
    }
    showToast(`Note from ${name} recorded!`);
    inquiryForm.reset();
    setTimeout(() => {
      if (formFeedback) formFeedback.textContent = '';
    }, 4500);
  });

  console.log('Jayesh Singh — Minimal Operations V17 initialized successfully.');
})();