/**
 * Jayesh Singh — Master Reconstruction (V17 Next)
 * High-performance, modular, accessible interaction & animation engine.
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
  const storageKey = 'jayesh-portfolio-theme';
  let currentTheme = 'light';
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') currentTheme = saved;
  } catch (e) {}

  const applyTheme = (theme) => {
    currentTheme = theme;
    document.documentElement.dataset.theme = currentTheme;
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = currentTheme === 'dark' ? '#0b1016' : '#faf8f5';
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
  // 3. GLOSSY HEADER: POINTER-TRACKED SHINE, SCROLL STATE & SLIDING PILL
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
      header.classList.toggle('is-scrolled', scrollTop > 35);
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
    setTimeout(() => moveNavIndicator(initialActive), 100);
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
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0.05 });

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setMobileMenu(false);
      closeAllModals();
    }
  });

  // ==========================================================================
  // 5. HERO 3D TILT CARD & PARTICLE CANVAS SIGNAL NETWORK
  // ==========================================================================
  const heroArt = $('#heroArt');
  const heroCaption = $('#heroSignalCaption');

  if (heroArt && finePointer) {
    let bounds = heroArt.getBoundingClientRect();
    const updateBounds = () => { bounds = heroArt.getBoundingClientRect(); };
    window.addEventListener('resize', updateBounds, { passive: true });

    heroArt.addEventListener('pointermove', (e) => {
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const midX = bounds.width / 2;
      const midY = bounds.height / 2;
      const tiltY = ((x - midX) / midX) * 9;
      const tiltX = -((y - midY) / midY) * 9;

      heroArt.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      heroArt.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      heroArt.style.setProperty('--art-x', `${x.toFixed(1)}px`);
      heroArt.style.setProperty('--art-y', `${y.toFixed(1)}px`);
    }, { passive: true });

    heroArt.addEventListener('pointerleave', () => {
      heroArt.style.setProperty('--tilt-x', '0deg');
      heroArt.style.setProperty('--tilt-y', '0deg');
      heroArt.style.setProperty('--art-x', '50%');
      heroArt.style.setProperty('--art-y', '50%');
    });
  }

  // Interactive Orbit Domain Pins
  const signalMessages = {
    field: 'FMCG field distribution: 50+ retail outlet beat across Andheri–Bandra.',
    venture: 'Global sourcing: International RFQs, customs duties & landed-cost unit economics.',
    systems: 'Systems intelligence: B.Tech CS relational SQL & Power BI fill-rate dashboards.'
  };

  $$('.orbit-label').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const signal = btn.dataset.signal;
      if (heroCaption && signalMessages[signal]) {
        heroCaption.textContent = signalMessages[signal];
      }
    });
  });

  // Canvas Particle Signal Network
  const canvas = $('#signalCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const resizeCanvas = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const numPoints = 28;
    const points = Array.from({ length: numPoints }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.2
    }));

    function drawNetwork() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(117, 100, 127, 0.45)';
      ctx.strokeStyle = 'rgba(117, 100, 127, 0.12)';
      ctx.lineWidth = 1;

      for (let i = 0; i < numPoints; i++) {
        const p1 = points[i];
        p1.x += p1.vx;
        p1.y += p1.vy;
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < numPoints; j++) {
          const p2 = points[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawNetwork);
    }
    requestAnimationFrame(drawNetwork);
  }

  // ==========================================================================
  // 6. CHAPTER 01: 4-STAGE OPERATING LOOP
  // ==========================================================================
  const loopData = {
    observe: {
      kicker: '01 / START CLOSE TO REALITY',
      title: 'Observe before optimising.',
      copy: 'Begin with the beat route, the retail shelf, the supplier RFQ call, or the spreadsheet a frontline team actually uses. Notice the gap between the designed SOP and lived reality.',
      proof: 'Walking 50+ retail outlets from Andheri to Bandra revealed that a low reorder number is often a distributor credit-cycle bottleneck, not a drop in consumer demand.'
    },
    frame: {
      kicker: '02 / NAME THE BOTTLENECK',
      title: 'Make the operational signal legible.',
      copy: 'Translate scattered field notes, order logs, and stock movements into a structured view that supply planners, sales reps, and commercial leads can challenge together.',
      proof: 'Linking beat visit logs with distributor closing stock in SQL exposes phantom stockouts before secondary sales are lost on the weekend.'
    },
    decide: {
      kicker: '03 / WEIGH THE CONSTRAINTS',
      title: 'Decide with unit-economics context.',
      copy: 'Every operational decision is a trade-off between factory quote, freight volatility, buffer stock, and distributor channel margin.',
      proof: 'At Only Solar, modeling customs duty, ocean freight volatility, and defect buffer showed when a higher factory quote actually yielded a lower net landed cost.'
    },
    repeat: {
      kicker: '04 / LEAVE A WORKING RHYTHM',
      title: 'Build habits that survive a busy Tuesday.',
      copy: 'The output of good operations or product design is a repeatable check, a clearer handoff, or an exception alert that changes Tuesday-morning execution.',
      proof: 'Sequencing outlets by velocity and credit reliability enabled 10+ new GT account onboardings in Month 1 (+20% active retailer base).'
    }
  };

  const loopTabs = $$('.loop-tab');
  const loopKicker = $('#loopKicker');
  const loopTitle = $('#loopTitle');
  const loopCopy = $('#loopCopy');
  const loopProof = $('#loopProof');

  loopTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const stage = tab.dataset.stage;
      const data = loopData[stage];
      if (!data) return;

      loopTabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });

      if (loopKicker) loopKicker.textContent = data.kicker;
      if (loopTitle) loopTitle.textContent = data.title;
      if (loopCopy) loopCopy.textContent = data.copy;
      if (loopProof) loopProof.textContent = data.proof;
    });
  });

  // ==========================================================================
  // 7. CHAPTER 02: MBA FOCUS & ROLE LENSES
  // ==========================================================================
  const trackData = {
    ops: {
      badge: 'PRIMARY MBA SPECIALISATION · CONFIRMED MAJOR',
      title: 'End-to-End Supply Chain, Sourcing & Distribution Execution',
      desc: 'Designing resilient supply chains from supplier factory gates to retail shelves—focusing on procurement economics, inventory replenishment cycles, warehouse flow, and last-mile territory reliability.',
      pills: [
        'Supply Chain & Network Planning',
        'Inventory Replenishment & Fill-Rate Sync',
        'International Sourcing & Import Logistics',
        'Vendor RFQ & Landed-Cost Modeling',
        'Last-Mile Beat & Route Optimization',
        'Process SOPs & Working-Capital Control'
      ],
      proof: 'Real-World Proof: Backed by managing a high-frequency beat of 50+ retail outlets at CavinKare and executing cross-border import logistics at Only Solar.'
    },
    pm: {
      badge: 'COMPLEMENTARY MINOR TRACK A · TECH + OPS BRIDGE',
      title: 'Translating Field & Supply Chain Friction into Digital Systems',
      desc: 'Leveraging my B.Tech in Computer Science Engineering (75.8%, LPU) and analytics stack (SQL, Power BI, Python) to bridge physical operations with DMS/SFA workflows, internal tools, and automated exception alerts.',
      pills: [
        'B.Tech CS Systems Architecture',
        'DMS / SFA Field Workflow Design',
        'Retailer & Internal User Discovery',
        'KPI Instrumentation (Fill Rate, Strike Rate)',
        'Relational SQL & Power BI Modeling',
        'PRDs & Exception-First Alert Specs'
      ],
      proof: 'Real-World Proof: Backed by a B.Tech in CS (LPU, 2024), verified SQL/Power BI/ML credentials, and hands-on field workflow discovery.'
    },
    sales: {
      badge: 'COMPLEMENTARY MINOR TRACK B · COMMERCIAL & GTM ENGINE',
      title: 'Ground-Truth Channel Strategy, Trade Marketing & Revenue Growth',
      desc: 'Connecting supply availability with demand generation—using frontline General Trade/Modern Trade execution, tiered channel margin design, and B2B relationship management to move inventory profitably.',
      pills: [
        'FMCG General Trade & Supermarket Execution',
        'Go-to-Market & Tiered Pricing Strategy',
        'Trade Schemes & Planogram Compliance',
        'B2B Distributor Onboarding & ROI',
        'New Account Prospecting (+20% Base Growth)',
        'Competitor & Market Intelligence'
      ],
      proof: 'Real-World Proof: Backed by +30% MoM focus-category lift at CavinKare and 0-to-1 B2B commercial GTM as Co-Founder of Only Solar.'
    }
  };

  const lensTabs = $$('.lens-tab');
  const trackBadge = $('#trackBadge');
  const trackTitle = $('#trackTitle');
  const trackDesc = $('#trackDesc');
  const trackPills = $('#trackPills');
  const trackProof = $('#trackProof');

  lensTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const track = tab.dataset.track;
      const data = trackData[track];
      if (!data) return;

      lensTabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });

      if (trackBadge) trackBadge.textContent = data.badge;
      if (trackTitle) trackTitle.textContent = data.title;
      if (trackDesc) trackDesc.textContent = data.desc;
      if (trackPills) {
        trackPills.innerHTML = data.pills.map((p) => `<div class="competency-pill">${p}</div>`).join('');
      }
      if (trackProof) trackProof.innerHTML = `<strong>Real-World Proof:</strong> ${data.proof.replace('Real-World Proof: ', '')}`;
    });
  });

  // ==========================================================================
  // 8. CHAPTER 04: WORK FILTERING & FULL CASE STUDY DOSSIERS
  // ==========================================================================
  const filterPills = $$('.filter-pill');
  const caseCards = $$('.case-card');

  filterPills.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.toggle('is-active', p === btn));
      const filter = btn.dataset.filter;
      caseCards.forEach((card) => {
        const tags = (card.dataset.tags || '').split(' ');
        card.style.display = filter === 'all' || tags.includes(filter) ? 'flex' : 'none';
      });
    });
  });

  // Case Dossier Data
  const dossiers = {
    fmcg: {
      kicker: 'CASE 01 · FIELD OPERATIONS & ROUTE INTELLIGENCE (CAVINKARE)',
      title: 'Optimizing High-Frequency FMCG Retail Distribution & Replenishment in Mumbai',
      sections: [
        {
          title: 'Role & Operating Scope',
          content: 'Sales Representative — CavinKare (Third-Party Payroll) · Oct 2025 – Feb 2026 · Territory: Andheri to Bandra, Mumbai (50+ General Trade outlets, supermarkets, and local distributors).'
        },
        {
          title: 'Operational & Commercial Bottleneck',
          content: 'High outlet density, tight retailer working capital, and asynchronous reorder cycles between field order booking and distributor dispatch risked stockouts on fast-moving SKUs and stagnant reach in underserved sub-beats.'
        },
        {
          title: '3-Step Execution Architecture',
          content: '1. Beat Segmentation & Route Engineering: Sequenced 50+ outlets by velocity and credit reliability while carving out prospecting windows that acquired 10+ new GT accounts in Month 1 (+20% active base).\n2. Replenishment Sync: Coordinated primary and secondary booking directly with distributor closing stock to protect fill rates.\n3. Merchandising & Trade Schemes: Secured prime "Hot Spot" shelf visibility and deployed targeted trade schemes, delivering a +30% MoM revenue increase in focus categories.'
        },
        {
          title: 'Operations + Product + GTM Takeaway',
          content: 'Demonstrates how frontline sales growth depends on replenishment reliability (Operations) and highlights where automated beat-level reorder alerts (Product Management) can eliminate stockouts.'
        }
      ]
    },
    solar: {
      kicker: 'CASE 02 · 0-TO-1 SUPPLY CHAIN & B2B LAUNCH (ONLY SOLAR)',
      title: 'End-to-End International Sourcing, Landed-Cost Modeling & B2B Channel Launch',
      sections: [
        {
          title: 'Role & Operating Scope',
          content: 'Co-Founder & Business Head — Only Solar (Import & Export) · 2024 – Early 2025 · Mumbai, India · Commercial Solar, Street, and Flood Lighting.'
        },
        {
          title: 'Operational & Commercial Bottleneck',
          content: 'Launching an import-distribution lighting venture required solving overseas supplier lead times and freight/customs duty volatility on the supply side while preserving competitive multi-tier distributor margins on the demand side.'
        },
        {
          title: '3-Step Execution Architecture',
          content: '1. Supplier Vetting & RFQ Negotiation: Evaluated international manufacturers across defect tolerance, MOQ flexibility, and FOB unit pricing.\n2. Landed-Cost & Margin Modeling: Built unit-economics models combining FOB price, freight, customs duties, and buffer inventory cost to structure B2B distributor price tiers.\n3. Channel Operations & P&L Control: Led B2B buyer relationships, distributor onboarding, working-capital cycles, and quality assurance.'
        },
        {
          title: 'Operations + Product + GTM Takeaway',
          content: 'Connects cross-border procurement and landed-cost math (Operations) directly to channel pricing, positioning, and B2B conversion (Sales & Marketing).'
        }
      ]
    },
    visibility: {
      kicker: 'CASE 03 · TECH + OPS SYSTEMS BLUEPRINT (SQL + POWER BI)',
      title: 'Field-to-Distributor Replenishment & Sales Intelligence Architecture',
      sections: [
        {
          title: 'Role & Operating Scope',
          content: 'Applied Systems & Analytics Blueprint synthesizing B.Tech CS (LPU, 2024), SQL/Power BI data modeling, and Mumbai FMCG distribution workflows.'
        },
        {
          title: 'Operational & Commercial Bottleneck',
          content: 'In General Trade distribution, field reps book orders without real-time visibility into distributor warehouse stock, while supply planners only see aggregated primary sales—causing phantom stockouts and lost secondary sales.'
        },
        {
          title: '3-Step Execution Architecture',
          content: '1. Relational SQL Schema: Linked Outlet Master, Beat Visit Logs, SKU Order Bookings, and Distributor Closing Inventory into one unified model.\n2. Power BI KPI Layer: Instrumented Beat Strike Rate, Outlet Drop Size, SKU Fill-Rate Gap, and Days-Since-Last-Order.\n3. Exception Workflow Rules: Specified lightweight SFA/DMS alerts that flag high-velocity outlets at risk of stockout before the morning beat.'
        },
        {
          title: 'Operations + Product + GTM Takeaway',
          content: 'Showcases how Computer Science and BI tools (Product/Tech) solve physical inventory replenishment and territory sales bottlenecks (Operations & Commercial).'
        }
      ]
    },
    dashboard: {
      kicker: 'CASE 04 · OPERATIONS ANALYTICS & INVENTORY CONCEPT',
      title: 'Exceptions First: Inventory Turnover, ABC Segmentation & SLA Triage Dashboard',
      sections: [
        {
          title: 'Scope & Framing',
          content: 'Independent operations analytics concept using simulated SKU movement data to model warehouse-to-retail replenishment health.'
        },
        {
          title: 'Operational Problem',
          content: 'Operations teams often drown in static monthly reports while a handful of Class-A SKUs silently breach safety-stock thresholds or lock up working capital in slow-moving Class-C inventory.'
        },
        {
          title: 'Analytical Architecture',
          content: '1. ABC × XYZ Velocity Matrix: Classifies SKUs by revenue contribution and demand volatility.\n2. Reorder Point (ROP) & Days-of-Cover Engine: Calculates dynamic safety stock against supplier lead-time variance.\n3. Exception-First UI: Surfaces only the routes, POs, and SKUs requiring action today.'
        }
      ]
    }
  };

  const caseDialog = $('#caseDialog');
  const caseKicker = $('#caseDialogKicker');
  const caseTitle = $('#caseDialogTitle');
  const caseBody = $('#caseDialogBody');
  const closeCaseBtn = $('#closeCaseDialog');
  const doneCaseBtn = $('#doneCaseDialog');

  function openCase(caseId) {
    const data = dossiers[caseId];
    if (!data || !caseDialog) return;
    if (caseKicker) caseKicker.textContent = data.kicker;
    if (caseTitle) caseTitle.textContent = data.title;
    if (caseBody) {
      caseBody.innerHTML = data.sections
        .map((sec) => `<section><h4>${sec.title}</h4><p>${sec.content.replace(/\n/g, '<br>')}</p></section>`)
        .join('');
    }
    caseDialog.showModal();
  }

  caseCards.forEach((card) => {
    card.addEventListener('click', () => openCase(card.dataset.caseId));
  });

  closeCaseBtn?.addEventListener('click', () => caseDialog?.close());
  doneCaseBtn?.addEventListener('click', () => caseDialog?.close());

  // Profile Dialog
  const profileDialog = $('#profileDialog');
  const profileTrigger = $('#profileTrigger');
  const closeProfileBtn = $('#closeProfileDialog');
  const doneProfileBtn = $('#doneProfileDialog');

  profileTrigger?.addEventListener('click', () => profileDialog?.showModal());
  closeProfileBtn?.addEventListener('click', () => profileDialog?.close());
  doneProfileBtn?.addEventListener('click', () => profileDialog?.close());

  function closeAllModals() {
    caseDialog?.close();
    profileDialog?.close();
  }

  // ==========================================================================
  // 9. CHAPTER 05: INTERACTIVE DECISION STUDIO (Two Functional Simulators)
  // ==========================================================================
  // Simulator 1: Landed-Cost Sourcing Calculator
  const inputFob = $('#inputFob');
  const inputFreight = $('#inputFreight');
  const inputRisk = $('#inputRisk');
  const outFob = $('#outFob');
  const outFreight = $('#outFreight');
  const outRisk = $('#outRisk');
  const supPriceA = $('#supPriceA');
  const supBreakA = $('#supBreakA');
  const supCardA = $('#supCardA');
  const supCardB = $('#supCardB');
  const simVerdictText = $('#simVerdictText');

  function updateLandedCost() {
    if (!inputFob || !inputFreight || !inputRisk) return;
    const fob = Number(inputFob.value);
    const freight = Number(inputFreight.value);
    const risk = Number(inputRisk.value);
    const totalA = fob + freight + risk;
    const baselineB = 160; // Regional baseline: ₹142 + ₹14 + ₹4

    if (outFob) outFob.textContent = `₹${fob}`;
    if (outFreight) outFreight.textContent = `₹${freight}`;
    if (outRisk) outRisk.textContent = `₹${risk}`;
    if (supPriceA) supPriceA.textContent = `₹${totalA}`;
    if (supBreakA) supBreakA.textContent = `₹${fob} FOB + ₹${freight + risk} Freight/Risk`;

    const diff = Math.abs(totalA - baselineB);
    const aWins = totalA < baselineB;

    if (supCardA && supCardB) {
      supCardA.classList.toggle('is-winner', aWins);
      supCardB.classList.toggle('is-winner', !aWins);
    }

    if (simVerdictText) {
      if (aWins) {
        simVerdictText.innerHTML = `<strong>Executive Verdict:</strong> Supplier A achieves a <strong>₹${diff}/unit lower landed cost</strong> (₹${totalA} vs ₹${baselineB}), making overseas import economically viable under these shipping assumptions.`;
      } else if (totalA === baselineB) {
        simVerdictText.innerHTML = `<strong>Executive Verdict:</strong> Landed cost is identical at <strong>₹${totalA}/unit</strong>. Regional Supplier B is favored for lower lead-time variance and working capital risk.`;
      } else {
        simVerdictText.innerHTML = `<strong>Executive Verdict:</strong> Despite an apparent factory quote of ₹${fob}, Supplier A costs <strong>₹${diff}/unit MORE</strong> in risk-adjusted landed cost (₹${totalA} vs ₹${baselineB}). Regional Supplier B protects channel margin.`;
      }
    }
  }

  [inputFob, inputFreight, inputRisk].forEach((slider) => {
    slider?.addEventListener('input', updateLandedCost);
  });
  updateLandedCost();

  // Simulator 2: Operations Exception Triage Queue
  const qBtns = $$('.q-btn');
  const queueRows = $$('.queue-row');

  qBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      qBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      const filter = btn.dataset.qfilter;
      queueRows.forEach((row) => {
        const priority = (row.dataset.priority || '').split(' ');
        row.style.display = filter === 'all' || priority.includes(filter) ? 'block' : 'none';
      });
    });
  });

  queueRows.forEach((row) => {
    const trigger = $('.queue-row-btn', row);
    const content = $('.queue-expanded-content', row);
    const indicator = $('.queue-indicator', row);

    trigger?.addEventListener('click', () => {
      const isExpanded = row.classList.contains('is-expanded');
      row.classList.toggle('is-expanded', !isExpanded);
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (content) content.hidden = isExpanded;
      if (indicator) indicator.textContent = isExpanded ? '+' : '−';
    });
  });

  // ==========================================================================
  // 10. CHAPTER 06: JOURNEY SCRUBBER
  // ==========================================================================
  const milestoneData = [
    {
      badge: 'TECHNICAL FOUNDATION',
      title: 'Bachelor of Technology — Computer Science & Engineering',
      inst: 'Lovely Professional University (LPU), Phagwara, Punjab · Graduated 2024 (75.8%)',
      year: '2020-24',
      desc: 'Rigorous training in Database Management Systems (SQL), Data Structures & Algorithms, Statistical Analysis, and Python. Built the mental models to perceive physical supply chains as stateful relational systems.',
      takeaway: 'Key Systems Takeaway: Operations is fundamentally an information architecture problem. When data at the retail counter is structured cleanly, logistics bottlenecks become solvable.'
    },
    {
      badge: '0-TO-1 SOURCING VENTURE',
      title: 'Co-Founder & Business Head — Only Solar',
      inst: 'Mumbai, India · Commercial Solar & Flood Lighting Distribution · 2024 to early 2025',
      year: '2024-25',
      desc: 'Owned international supplier discovery, RFQ vendor negotiations, and import customs logistics while modeling landed unit costs to structure distributor margin tiers across India.',
      takeaway: 'Key Commercial Takeaway: Sourcing is not finding the cheapest factory; it is finding the manufacturer whose quality tolerance and lead-time predictability protect your P&L.'
    },
    {
      badge: 'FRONTLINE FMCG SALES',
      title: 'Sales Representative — CavinKare',
      inst: 'Andheri to Bandra, Mumbai · Third-Party Payroll · Oct 2025 to Feb 2026',
      year: '2025-26',
      desc: 'Managed a high-frequency route of 50+ General Trade retail accounts and supermarkets. Onboarded 10+ new accounts in Month 1 (+20% base) and achieved +30% MoM revenue growth in focus categories.',
      takeaway: 'Key Frontline Takeaway: Secondary sales in General Trade depend on distributor stock replenishment trust. When the delivery arrives on schedule, the retailer gives you shelf space.'
    },
    {
      badge: 'POSTGRADUATE MASTERY',
      title: 'Master of Business Administration (MBA) — Operations & Logistics',
      inst: 'Lovely Professional University (LPU), Phagwara, Punjab · 2026 to 2028 (Pursuing)',
      year: '2026-28',
      desc: 'Confirmed Major in Operations & Logistics, pairing quantitative supply chain modeling with dual-track minor fluency across Product Management and Sales & Marketing.',
      takeaway: 'Strategic Goal: Connecting ground-level execution and engineering principles to build scalable, resilient supply networks for high-growth enterprises.'
    }
  ];

  const scrubberBtns = $$('.scrubber-btn');
  const mBadge = $('#mBadge');
  const mTitle = $('#mTitle');
  const mInst = $('#mInst');
  const mYear = $('#mYear');
  const mDesc = $('#mDesc');
  const mTakeaway = $('#mTakeaway');

  scrubberBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.milestone);
      const data = milestoneData[idx];
      if (!data) return;

      scrubberBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });

      if (mBadge) mBadge.textContent = data.badge;
      if (mTitle) mTitle.textContent = data.title;
      if (mInst) mInst.textContent = data.inst;
      if (mYear) mYear.textContent = data.year;
      if (mDesc) mDesc.textContent = data.desc;
      if (mTakeaway) mTakeaway.innerHTML = `<strong>${data.takeaway.split(':')[0]}:</strong>${data.takeaway.slice(data.takeaway.indexOf(':') + 1)}`;
    });
  });

  // ==========================================================================
  // 11. CHAPTER 08: CONTACT COMMAND CENTER & ONE-CLICK EMAIL COPY
  // ==========================================================================
  const copyEmailBtn = $('#copyEmailBtn');
  copyEmailBtn?.addEventListener('click', async () => {
    const email = copyEmailBtn.dataset.email || 'jayeshsingh9b@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      const kbd = copyEmailBtn.querySelector('.kbd-badge');
      if (kbd) {
        kbd.textContent = 'COPIED! ✓';
        kbd.style.background = 'var(--teal)';
        kbd.style.color = '#ffffff';
        setTimeout(() => {
          kbd.textContent = '⌘C';
          kbd.style.background = '';
          kbd.style.color = '';
        }, 2500);
      }
    } catch (err) {
      window.location.href = `mailto:${email}`;
    }
  });

  const contactForm = $('#contactForm');
  const formStatusMsg = $('#formStatusMsg');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cName')?.value || 'Visitor';
    const email = $('#cEmail')?.value || '';
    const topic = $('#cTopic')?.value || 'Discussion';
    const msg = $('#cMessage')?.value || '';

    const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${topic} — ${name}`);
    const mailtoBody = encodeURIComponent(`From: ${name} (${email})\nTopic: ${topic}\n\nMessage:\n${msg}`);

    if (formStatusMsg) {
      formStatusMsg.textContent = 'Preparing email dispatch... opening mail client.';
      formStatusMsg.style.color = 'var(--teal)';
    }

    setTimeout(() => {
      window.location.href = `mailto:jayeshsingh9b@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      if (formStatusMsg) {
        formStatusMsg.textContent = 'Draft opened in your email client. Thank you for reaching out!';
      }
      contactForm.reset();
    }, 400);
  });

  // ==========================================================================
  // 12. CUSTOM CURSOR WITH MAGNETIC HOVER & CONTEXT LABELS
  // ==========================================================================
  const cursorDot = $('#cursorDot');
  const cursorRing = $('#cursorRing');
  const cursorLabel = $('#cursorLabel');

  if (cursorDot && cursorRing && finePointer) {
    document.body.classList.add('has-pointer');
    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;

    window.addEventListener('pointermove', (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
    }, { passive: true });

    function renderCursor() {
      ringX += (dotX - ringX) * 0.18;
      ringY += (dotY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Magnetic and Label Hovers
    $$('[data-cursor]').forEach((el) => {
      el.addEventListener('pointerenter', () => {
        document.body.classList.add('cursor-hover');
        if (cursorLabel) cursorLabel.textContent = el.dataset.cursor || '';
      });
      el.addEventListener('pointerleave', () => {
        document.body.classList.remove('cursor-hover');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });

    $$('a, button, [role="tab"]').forEach((interactive) => {
      interactive.addEventListener('pointerenter', () => {
        if (!interactive.hasAttribute('data-cursor')) {
          cursorRing.style.transform = 'translate(-50%, -50%) scale(1.35)';
        }
      });
      interactive.addEventListener('pointerleave', () => {
        if (!interactive.hasAttribute('data-cursor')) {
          cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
        }
      });
    });
  }

  // ==========================================================================
  // 13. INTERSECTION OBSERVER FOR SCROLL REVEALS
  // ==========================================================================
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal-up').forEach((el) => revealObserver.observe(el));
  } else {
    $$('.reveal-up').forEach((el) => el.classList.add('is-visible'));
  }
})();
