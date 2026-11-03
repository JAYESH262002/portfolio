# Jayesh Singh — Portfolio V27
## Emergency Functional Fixes, Cursor Performance & Contact Page Refinement

**Location:** `/Users/rajput/Documents/main decision/jayesh-portfolio-next/`  
**Identity:** Operations, Logistics & Commercial Systems  
**Core Thesis:** *Show less initially. Reveal more when someone is interested.*  
**Live Target Reference:** `https://jayesh-singh-portfolio.vercel.app/`  
**Primary Career Source:** `Jayesh-Singh-Resume.pdf`

---

## 1. Executive Summary & V27 Priority Solutions

Portfolio V27 systematically solves the three critical interaction issues reported in user testing:

```
                            PORTFOLIO V27 RESOLUTION MATRIX
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │ PRIORITY 1: PIPELINE OUTSIDE-CLICK COLLAPSE & DEFAULT STATE RESET (CRITICAL FIX)       │
   │    • Root Cause: Previous reset listeners used bubbling click events that could be     │
   │      intercepted or canceled by child elements, or delayed by 220ms timers that       │
   │      created race conditions during rapid user clicks.                                 │
   │    • Solution:                                                                         │
   │      - Outer container explicitly bounded with [data-pipeline-root] attribute.         │
   │      - Capture-phase (useCapture: true) pointerdown and click listeners attached to     │
   │        document to intercept interactions before any child element can stop bubbling. │
   │      - Immediate DOM reset via resetPipelineToDefault(): deselects all 6 stage nodes, │
   │        hides telemetry panel, closes scenario details and explore drawers, resets      │
   │        scenario to Steady state, and restores forward feedback loop.                   │
   │      - Clicks inside [data-pipeline-root] remain interactive; any click or tap outside  │
   │        (navigation, hero, other cards, page backdrop) instantly collapses to default. │
   ├────────────────────────────────────────────────────────────────────────────────────────┤
   │ PRIORITY 2: CUSTOM CIRCULAR CURSOR PERFORMANCE & ZERO-LAG POINTER TRACKING             │
   │    • Root Cause: Lerp (linear interpolation) formula caused the cursor ring to trail   │
   │      noticeably behind fast mouse movements, creating a perception of sluggishness.   │
   │    • Solution:                                                                         │
   │      - Direct coordinate tracking batched via requestAnimationFrame:                   │
   │        transform = translate3d(${latestX}px, ${latestY}px, 0) translate(-50%, -50%).   │
   │      - Removed CSS transition on transform to eliminate artificial position lag.       │
   │      - Maintained signature 20px hollow circular geometry with 1.25px outline and      │
   │        transparent center.                                                             │
   │      - Added .is-input detection to fade the custom ring over text inputs/textareas,    │
   │        preserving the native OS I-beam text editing cursor.                            │
   │      - Disabled completely on coarse touch devices via !matchMedia('(pointer: coarse)').│
   ├────────────────────────────────────────────────────────────────────────────────────────┤
   │ PRIORITY 3: CONTACT PAGE DIRECT CHANNELS REBUILD & BALANCED EDITORIAL DIRECTORY        │
   │    • Root Cause: Contact grid stretched both columns to match the ~750px form height,   │
   │      leaving Direct Channels looking empty and artificially elongated.                 │
   │    • Solution:                                                                         │
   │      - Set .contact-grid { align-items: start; } for natural content-driven card height│
   │      - Headline updated to: "Start an operational conversation."                       │
   │      - Rebuilt Direct Channels into a balanced editorial directory with 4 clean rows:  │
   │        1. Email Address: jayeshsingh9b@gmail.com with instant Copy Email button.       │
   │        2. Professional Profile: linkedin.com/in/jsingh26 with View Profile ↗ link.    │
   │        3. Location Base: Mumbai, India with Primary Base status indicator.             │
   │        4. Download Profile: Jayesh-Singh-Resume.pdf with Download (PDF) ↓ button.      │
   │      - Bottom metadata: Mumbai IST time zone (UTC+5:30) and operational cadence note.  │
   │      - Inquiry form: 5 category chips, auto-suggested subject, card border tinting,    │
   │        and redirection to prefilled Gmail compose URL addressed to verified recipient. │
   └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Verification & Automated Test Matrix

All tests run via headless Google Chrome with Chrome DevTools Protocol:

| Test Suite | Purpose | Assertions | Status |
|---|---|---|---|
| **`verify_portfolio_v27.js`** | Portfolio V27 Priority Verification (Outside-Click, Zero-lag Cursor, Direct Channels) | 50 assertions | **50 / 50 PASSED (100%)** |
| **`audit_portfolio_final.js`** | End-to-End QA Audit (Nav, Pipeline, Projects, Milestones, Lab, Contact, Responsive) | 63 assertions | **63 / 63 PASSED (100%)** |
| **`verify_portfolio_v26.js`** | Portfolio V26 Feature Suite (Translucent Glass Header, Profile Identity Card) | 43 assertions | **43 / 43 PASSED (100%)** |
| **`verify_portfolio_v25.js`** | Portfolio V25 Feature Suite (Cursor Geometry, Pipeline Discovery, Contact Workflow) | 67 assertions | **67 / 67 PASSED (100%)** |
| **Total Automated Assertions** | **Comprehensive Regression & Verification Suite** | **223 assertions** | **223 / 223 PASSED (100%)** |

### Verified Production Screenshots (V27)
- `v27-pipeline-reset-1440.png`: Operations Pipeline collapsed to clean minimal state after outside click.
- `v27-contact-desktop-1440.png`: Rebuilt Contact section showing balanced Direct Channels directory and inquiry form.
- `v27-contact-mobile-390.png`: Mobile 390px viewport showing stacked contact cards with zero horizontal overflow.

---

# Jayesh Singh — Portfolio V26 (Historical Archive)

**Location:** `/Users/rajput/Documents/main decision/jayesh-portfolio-next/`  
**Identity:** Operations, Logistics & Commercial Systems  
**Core Thesis:** *Show less initially. Reveal more when someone is interested.*  
**Live Target Reference:** `https://jayesh-singh-portfolio.vercel.app/`  
**Primary Career Source:** `Jayesh-Singh-Resume.pdf`

---

## 1. Executive Summary & V26 Key Implementations

Portfolio V26 delivers two focused signature upgrades to the portfolio:

```
                            PORTFOLIO V26 ENHANCEMENT SUITE
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │ 1. REIMAGINED COMPACT DIGITAL IDENTITY CARD (#profileDialog)                           │
   │    • Compact modal frame (max 660px wide, ~75–80vh max height, comfortably centered)   │
   │    • Hero Section: 58px avatar with 1.15x hover scale, animated JAYESH SINGH wordmark, │
   │      subtitle OPERATIONS / COMMERCIAL SYSTEMS, verified email, Mumbai location         │
   │    • Short authentic intro: "MBA student specialising in Operations & Logistics, with   │
   │      a Computer Science background, FMCG field-sales experience and entrepreneurial    │
   │      exposure through import-export."                                                  │
   │    • Segmented Tab Navigation: OVERVIEW | JOURNEY | INTERESTS                          │
   │      - OVERVIEW: MBA in Operations & Logistics (LPU 2026–2028), B.Tech CS (LPU 2024),  │
   │        and Core Foundation synthesis banner.                                           │
   │      - JOURNEY: Interactive 4-step chapter timeline (01 CS, 02 Only Solar, 03 CavinKare│
   │        Sales with verified 50+ outlets / +30% lift, 04 MBA Operations).                │
   │      - INTERESTS: 5 selectable topic pills with authentic, grounded rationale.         │
   │    • Full keyboard accessibility (Arrow keys tab navigation, Escape, click backdrop)    │
   │    • Mobile transformation: converts into an elegant bottom sheet with rounded top     │
   │    • Strict privacy audit: ZERO public phone numbers anywhere on page or in modal      │
   ├────────────────────────────────────────────────────────────────────────────────────────┤
   │ 2. PREMIUM TRANSLUCENT FLOATING GLASS HEADER                                           │
   │    • Increased transparency: background rgba(250, 248, 245, 0.48) in light mode,        │
   │      rgba(14, 19, 28, 0.48) in dark mode, allowing underlying page content to be      │
   │      visibly passing through the glass surface as the user scrolls                     │
   │    • Heavy frosted backdrop filter: blur(28px) saturate(175%) for smooth, high-legibility│
   │    • Specular top rim light + delicate translucent pointer sheen (z-index: 2)          │
   │    • Scroll-responsive state: transitions to rgba(250, 248, 245, 0.60) / blur(32px)     │
   │      when scrolled past 30px, with content softly visible behind it                    │
   │    • Preserves circular photo 50% hover scale & animated JAYESH SINGH wordmark         │
   └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Verification & Automated Test Matrix

All features were verified using headless Chrome DevTools Protocol (`verify_portfolio_v26.js` and `verify_portfolio_v25.js`):

| Test Suite | Coverage & Assertions | Status |
|---|---|---|
| **Portfolio V26 Suite 1: Translucent Glass Header** | Fixed floating header, z-index layering, blur(28px) saturate(175%), rgba transparency, scroll responsiveness, underlying content visible. | **7 / 7 PASS** |
| **Portfolio V26 Suite 2: Profile Identity Card** | Compact dimensions (<= 720px), intro text, avatar, 3 tabs (Overview, Journey, Interests), 4 interactive journey chapters with authentic CavinKare achievements, 5 interest topics, close button & Escape key. | **27 / 27 PASS** |
| **Portfolio V26 Suite 3: Strict Privacy Audit** | Zero public phone numbers found anywhere across the page or modals. | **1 / 1 PASS** |
| **Portfolio V26 Suite 4: Mobile Viewport Bottom Sheet** | 390px mobile viewport, clean slide-up, rounded top corners, zero horizontal overflow. | **8 / 8 PASS** |
| **Portfolio V25 Regression Suite** | Signature circular cursor (20px), minimal-by-default pipeline (6 nodes, 3 scenarios, reverse loop), interactive contact section (5 chips, Gmail compose). | **67 / 67 PASS** |
| **Total Automated Assertions** | **End-to-End Headless Chrome Test Suites** | **110 / 110 PASS (100%)** |

---

## 3. Visual Artifacts Generated

The following production screenshots were captured and inspected via Chrome DevTools Protocol:
- `v26-header-top-1440.png`: Floating translucent glass header at page top.
- `v26-header-scrolled-1440.png`: Header while scrolling, showing underlying hero content visibly passing through the glass.
- `v26-profile-overview-1440.png`: Compact digital identity card modal showing the default Overview tab.
- `v26-profile-journey-1440.png`: Profile card showing the interactive 4-chapter Journey timeline.
- `v26-profile-interests-1440.png`: Profile card showing the 5 selectable topic pills and grounded rationale.
- `v26-profile-mobile-390.png`: Mobile 390px viewport showing the card converted into an elegant bottom sheet.

---

# Jayesh Singh — Portfolio V25 (Historical Archive)

**Location:** `/Users/rajput/Documents/main decision/jayesh-portfolio-next/`  
**Identity:** Operations, Logistics & Commercial Systems  
**Core Thesis:** *Show less initially. Reveal more when someone is interested.*  
**Live Target Reference:** `https://jayesh-singh-portfolio.vercel.app/#contact`  
**Primary Career Source:** `Jayesh-Singh-Resume.pdf`

---

## 1. Executive Summary & V25 Key Implementations

Portfolio V25 completes three signature enhancements requested for the portfolio:

```
                            PORTFOLIO V25 ENHANCEMENT SUITE
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │ 1. SIGNATURE CIRCULAR CURSOR                                                           │
   │    • Small 20px diameter hollow circle (noticeably smaller than reference halo)       │
   │    • Thin 1.25px outline (muted lavender / soft violet rgba(168, 155, 184, 0.85))      │
   │    • 100% transparent center, zero solid fill, zero shadow, zero trailing particles     │
   │    • Tight lerp factor (0.42) for crisp, responsive tracking with zero drag            │
   │    • Contextual states: scale(1.35) on interactive hover; scale(0.85) click compression│
   ├────────────────────────────────────────────────────────────────────────────────────────┤
   │ 2. MINIMAL-BY-DEFAULT OPERATIONS PIPELINE                                              │
   │    • Initially displays clean 6-node SVG track without large panels auto-expanded       │
   │    • Status strip with scenario pill & discovery hint ("Click any stage (01–06)...")   │
   │    • "Scenario Details ↓" drawer button to inspect deep system mechanics on demand      │
   │    • Clicking any node reveals compact telemetry card (Stage tag, title, focus area)    │
   │    • "Explore this stage ↓" button expands scenario impact and demand feedback on demand│
   ├────────────────────────────────────────────────────────────────────────────────────────┤
   │ 3. INTERACTIVE CONTACT SECTION ("CLEAR SIGNAL")                                        │
   │    • Closing composition headline: "Every good conversation starts with a clear signal"│
   │    • "SIGNAL ACTIVE" pulsing beacon badge                                              │
   │    • 5 conversation category chips with smart subject pre-fill & contextual notes       │
   │    • Direct-to-Gmail compose workflow (mail.google.com/mail/?view=cm) with mailto fallback│
   │    • Strict privacy audit: verified email jayeshsingh9b@gmail.com; ZERO phone numbers   │
   └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Verification & Automated Test Matrix

All features were verified using headless Chrome DevTools Protocol (`verify_portfolio_v25.js`):

| Test Suite | Coverage & Assertions | Status |
|---|---|---|
| **Suite 1: Signature Circular Cursor** | 20px width/height, 1.25px outline, 50% radius, pointer-events: none, transparent background, interactive hover scale & click compression. | **8 / 8 PASS** |
| **Suite 2: Minimal Pipeline & Discovery** | Clean initial nodes, status strip, scenario details drawer toggle, node 01-06 click activation & data sync, explore stage drawer toggle, Steady/Delay/Surge dynamics, feedback loop reversal. | **28 / 28 PASS** |
| **Suite 3: Interactive Contact Section** | Closing headline, 5 category chips, topic selection, smart subject update, form validation (empty & email check), Gmail URL construction, verified email check, mailto fallback, friendly status. | **15 / 15 PASS** |
| **Suite 4: Strict Privacy Audit** | Zero public phone numbers found anywhere across the entire page DOM or text content. | **1 / 1 PASS** |
| **Suite 5: Viewport Audits & Visual Proof** | Desktop 1440px, Desktop 1920px, Tablet 768px, Mobile 390px (zero horizontal overflow guaranteed). | **15 / 15 PASS** |
| **Total Automated Assertions** | End-to-end headless Chrome verification suite | **67 / 67 PASS (100%)** |

---

## 3. Visual Artifacts Generated

The following production screenshots were captured and inspected via Chrome DevTools Protocol:
- `v25-desktop-1440.png`: Full desktop hero with circular cursor, glossy header, and minimal pipeline.
- `v25-contact-1440.png`: Contact section with closing headline, category chips, and prefilled inquiry card.
- `v25-desktop-1920.png`: Expansive desktop composition.
- `v25-tablet-768.png`: Tablet portrait layout.
- `v25-mobile-390.png`: Mobile 390px viewport with zero horizontal overflow.

---

# Jayesh Singh — Portfolio V23.1 (Historical Archive)

**Location:** `/Users/rajput/Documents/main decision/jayesh-portfolio-next/`  
**Identity:** Operations, Logistics & Commercial Systems  
**Core Thesis:** *Show less initially. Reveal more when someone is interested.*  
**Live Target Reference:** `https://jayesh-singh-portfolio.vercel.app/#contact`  
**Primary Career Source:** `Jayesh-Singh-Resume.pdf`

---

## 1. Executive Summary & V23.1 Functional Fixes

Portfolio V23.1 delivers a comprehensive, functional reconstruction of the signature **Operations Pipeline & Demand Loop** component. All 6 nodes, 3 scenarios (Steady / Delay / Surge), and the Reverse Demand Feedback Loop are now 100% interactive, responsive, and synchronized through an authoritative reactive state machine.

```
                         OPERATIONS PIPELINE & DEMAND LOOP
   ┌────────────────────────────────────────────────────────────────────────┐
   │ [ Steady ]  [ Delay (Bottleneck) ]  [ Surge (Throughput) ]            │
   │                                                                        │
   │  (01) ───► (02) ───► (03) ───► (04) ───► (05) ───► (06)               │
   │ Supplier  Sourcing  Inventory Warehouse  Distrib.   Retail            │
   │             [HOLD]                                  [LIFT]             │
   │                                                                        │
   │      ◄────────────────────────────────────────────────────             │
   │         [ ↺ REVERSE DEMAND FEEDBACK LOOP (Interactive Toggle) ]        │
   └────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Updates synchronously
   ┌────────────────────────────────────────────────────────────────────────┐
   │ TELEMETRY PANEL                                                        │
   │ • Status Banner: STEADY / BOTTLENECK ALERT / DEMAND SURGE              │
   │ • Feedback Loop Pill: Standard Latency vs Upstream Pull Engaged        │
   │ • Stage Tag & Grounding: Verified Only Solar / CavinKare context       │
   │ • Title & Operational Description                                      │
   │ • Dynamic Impact Card: Scenario Impact + Real-time Demand Feedback     │
   │ • Metadata Row: Focus Area + Grounding Context                         │
   └────────────────────────────────────────────────────────────────────────┘
```

### Root Causes Diagnosed & Resolved

1. **JavaScript Syntax Error**: A duplicate `const finePointer` declaration was crashing script execution before pipeline event handlers could bind. Removed duplicate and unified matchMedia queries.
2. **Missing SVG Click Implementation**: In Chrome and Safari, `SVGGraphicsElement` does not inherit `HTMLElement.prototype.click()`. Added native SVG click polyfill and pointer event delegation so all nodes and loops respond instantly on desktop and touch devices.
3. **SVG Transform Collisions**: CSS `:hover` / `:focus-visible` transforms (`translateY(-4px)`) previously wiped out inline SVG `transform="translate(x, y)"` coordinates. Re-architected hover animations to target inner `.node-ring` and `.node-halo` elements, maintaining 100% stable node alignment along the pipeline track.
4. **State Clobbering**: `mouseenter` was previously overwriting user-selected stages on cursor movement. Replaced with authoritative click/tap/keyboard state (`pipelineState = { stage, scenario, isReversed }`) ensuring all three state axes operate independently without clobbering each other.
5. **Static Feedback Loop**: Converted static loop label into a fully accessible interactive toggle button with state persistence, directional pulse reversal, and upstream demand pull telemetry.

---

## 2. V23.1 Verification & Acceptance Matrix

| Requirement | Implementation in V23.1 | Test Result & Status |
|---|---|---|
| **Stage 01 (Supplier)** | Active node styling, "Supplier Sourcing & Negotiations" title, Only Solar grounding, MOQ/vendor negotiation focus. | **PASS** (Suite 2) |
| **Stage 02 (Sourcing)** | "Import Logistics & Landed-Cost Modeling" title, Only Solar import logistics grounding. Displays amber bottleneck aura & badge during Delay scenario. | **PASS** (Suite 2 & 3) |
| **Stage 03 (Inventory)** | "Safety Stock & Replenishment Planning" title, Analytical Operations Model grounding, buffer cover telemetry. | **PASS** (Suite 2) |
| **Stage 04 (Warehouse)** | "Depot Storage & Product Availability Flow" title, order staging and availability telemetry. | **PASS** (Suite 2) |
| **Stage 05 (Distribution)** | "Territory Beat Routing & Fulfillment" title, CavinKare Andheri–Bandra territory grounding. Displays cyan surge aura during Surge scenario. | **PASS** (Suite 2 & 3) |
| **Stage 06 (Retail)** | "Retail Availability & General Trade Execution" title, CavinKare 50+ retail counters, 10+ GT accounts in M1, +20% active base, +30% MoM focus category lift. | **PASS** (Suite 2 & 3) |
| **Steady Scenario** | Restores 5s nominal pulse speed, nominal status indicator, clears bottlenecks and surges, returns balanced cadence. | **PASS** (Suite 3) |
| **Delay Scenario** | Slows pulses to 10s, highlights Sourcing as primary bottleneck (`HOLD +12D`), updates status banner to Bottleneck Alert, explains downstream buffer depletion. | **PASS** (Suite 3) |
| **Surge Scenario** | Accelerates pulses to 2.2s, highlights Distribution & Retail with cyan throughput glow (`+40% LIFT`), updates status banner to Demand Surge. | **PASS** (Suite 3) |
| **Feedback Loop Toggle** | Clickable badge toggles `is-active`, updates badge text to `↺ DEMAND PULL ACTIVE // UPSTREAM SIGNAL ON`, reverses pulse direction, updates telemetry loop pill. | **PASS** (Suite 4) |
| **Independent State Machine** | Changing scenario never resets the active stage; changing stage never resets feedback loop. All 3 state variables operate in complete harmony. | **PASS** (Suite 5) |
| **Keyboard Accessibility** | Full Left/Right Arrow navigation between stages, Enter/Space activation, and visible focus rings. | **PASS** (Suite 6) |
| **Zero Overflow & Touch** | Scaled SVG viewport with 72x96px touch hit targets on nodes, zero horizontal overflow on mobile (500px). | **PASS** (Suite 7) |
| **Automated CDP Test Suite** | 79 automated assertions executed via Chrome DevTools Protocol in headless Chrome: **79 PASSED, 0 FAILED**. | **79 / 79 PASS** |

---

# Jayesh Singh — Portfolio V22 (Historical Archive)
## Refinement Pass: Personal Identity, Spacing, Minimalism & Interaction Quality

**Location:** `/Users/rajput/Documents/main decision/jayesh-portfolio-next/`  
**Identity:** Operations, Logistics & Commercial Systems  
**Core Thesis:** *Show less initially. Reveal more when someone is interested.*  
**Live Target Reference:** `https://jayesh-singh-portfolio.vercel.app/#contact`  
**Primary Career Source:** `Jayesh-Singh-Resume.pdf`

---

## 1. Executive Summary & V22 Refinements

Portfolio V22 elevates the portfolio into a more spacious, minimalist, artistic, and professionally polished experience, preserving the creative direction while making key upgrades to personal identity, header interactions, page width, and cursor smoothness.

```
       [ Personal Identity ]                         [ Primary Navigation ]
   ┌───────────────────────────┐                 ┌─────────────────────────────┐
   │ 👤 Photo  JAYESH SINGH    │                 │ Home  Approach  Work ... 🌙 │
   │ (50% hover) (50% hover)   │                 └─────────────────────────────┘
   └─────────────┬─────────────┘
                 │ (Click)
                 ▼
   ┌────────────────────────────────────────────────────────┐
   │ 📇 Personal Briefing Profile Modal                    │
   │ • MBA Candidate (Operations & Logistics)               │
   │ • CavinKare Field Sales + Only Solar Sourcing          │
   │ • B.Tech Computer Science (Graduated 2024)             │
   │ • Areas of Interest & Verified Contact                 │
   └────────────────────────────────────────────────────────┘
```

---

## 2. Detailed V22 Refinement Matrix

| Feature | Prior Version (V21) | Refinement in V22 | Verification & Impact |
|---|---|---|---|
| **Circular Brand Badge** | Generic "N"-like SVG network icon | Replaced with **genuine transparent profile photograph** (`assets/jayesh-singh.png`). Perfectly centered face (`object-position: 50% 16%`), circular border, glossy rim, subtle glow, and emerald status dot. | Inspected visually in desktop & mobile. Natural, elegant integration. |
| **Profile Photo Hover** | No hover response | **Mandatory 50% enlargement** (`transform: scale(1.5)`), smooth cubic-bezier transition, elevated layered shadow (`box-shadow: 0 10px 26px rgba(95, 75, 120, 0.35)`), stays circular, layers above without clipping or shifting layout. | Tested via simulated hover screenshot (`v22-header-hover-test.png`). Zero layout shift. |
| **Header Name Hover** | Static size | **Mandatory 50% enlargement** (`transform: scale(1.48)`), `transform-origin: left center`, subtle drop shadow, zero layout shift, leaves ample space before navigation. | Tested via hover screenshot. Independent of photo hover. |
| **Header Name Animation** | 7 soft mineral pastel tones | **100% Preserved & Maintained**: ~1-second smooth gradient drift across soft sage, muted blue-grey, muted lavender, dusty rose, light terracotta, warm champagne, and soft olive. Both words animated with harmonic phase offset. Also rendered in profile modal! | Non-flickering, smooth, readable. |
| **Glossy Header Sheen** | 9-second cycle | **Frequency doubled (interval reduced by 50%)**: `animation: headerSheenSweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`. Elegant, subtle reflective sweep. | Sheen sweeps every 4.5s without being distracting. |
| **Profile Briefing Popup** | Did not exist | **Interactive `<dialog id="profileDialog">`**: Opens on clicking profile photo. Displays photo, animated name, concise professional briefing, verified education (MBA LPU 2026-28 Pursuing, B.Tech CS Graduated 2024), experience (CavinKare, Only Solar), 5 areas of interest, email, and close handlers. | Accessible via click, keyboard (Esc), backdrop click, and close button. |
| **Header Layout & Segmentation** | Centered navigation with empty right gap | Two clearly separated groups: **LEFT (Personal Identity)** with avatar, name, and subtitle flush-left; **RIGHT (Navigation & Controls)** with primary links and theme toggle grouped cleanly. | Eliminates awkward empty space at far right. |
| **Page Width & Canvas** | 1200px max container (cramped center) | **Expanded canvas**: `--container-max: min(94vw, 1560px)` with `clamp(1.25rem, 3.5vw, 3.25rem)` gutters. Hero grid widened (`1fr 1.18fr`), giving the operations visual card breathing room. | Spacious, architectural, balanced on 1920x1080 and 1440x900 displays. |
| **Hero Left Column** | Cluttered with heavy metric block and meta bar | **Streamlined to 5 essential elements**: 1. Small operational eyebrow line; 2. Strong headline (`I make complex operations clearer.`); 3. Concise intro; 4. Primary CTA (`Explore Selected Work ↘`); 5. Secondary CTA (`Download Résumé ↓`). | Calmer, more editorial, no information overload. |
| **Operations Visual** | Crowded with bulky two-column metric cards | **Clean sculptural pipeline**: 6 distinct stages (`Supplier → Sourcing → Inventory → Warehouse → Distribution → Retail`), reverse feedback loop, interactive nodes, Steady/Delay/Surge toggles, and streamlined telemetry readout. | Artistic, quiet when untouched, rich when explored. |
| **Cursor Smoothing** | Dual elements updating `left`/`top` directly on `pointermove` (choppy/laggy) | **Silk-smooth GPU-accelerated halo** (`translate3d` via `requestAnimationFrame` lerp interpolation at `0.22` factor). Native system pointer retained for zero-latency clicks. Automatically disabled on touch screens and reduced-motion preferences. | 100% choppiness eliminated. 60/120fps fluid glide. |
| **Factual Accuracy & Privacy** | Verified in V21 | **100% Preserved**: CavinKare genuine achievements, Only Solar genuine responsibilities, verified degrees, transparent synthetic project labeling, zero public phone numbers. | Grep audit: 0 phone numbers found. |

---

## 3. Visual Verification Across Viewports

- **1920 × 1080 (Expansive Desktop)**: [`v22-desktop-1920.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v22-desktop-1920.png)
- **1440 × 900 (Standard Desktop)**: [`v22-desktop-1440.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v22-desktop-1440.png)
- **Header Hover States (Photo & Name 50% Scale)**: [`v22-header-hover-test.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v22-header-hover-test.png)
- **Profile Briefing Modal**: [`v22-profile-modal.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v22-profile-modal.png)
- **768 × 1024 (Tablet Portrait)**: [`v22-tablet-768.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v22-tablet-768.png)
- **500 × 900 (Mobile Viewport)**: [`v22-mobile-500.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v22-mobile-500.png)

---

## 5. Phase 11 — Comprehensive Final Portfolio Audit & Quality Polish

A comprehensive, end-to-end quality assurance audit was conducted across 12 distinct functional and aesthetic domains using automated Chrome DevTools Protocol testing (`audit_portfolio_final.js`):

### Final Audit Summary: **63 PASSED, 0 FAILED (100% Pass Rate)**

```
================================================================
  COMPREHENSIVE FINAL PORTFOLIO AUDIT SUMMARY
================================================================
  • Runtime & Console Errors:       2 / 2 PASSED (Zero exceptions, zero console errors)
  • Floating Glass Header & Nav:    11 / 11 PASSED (Position fixed, 6 targets exist, IST clock active, theme toggles)
  • Operations Pipeline & Loop:    10 / 10 PASSED (Minimal default, drawers toggle, Delay/Surge/Loop reactive)
  • Selected Work & Case Studies:   6 / 6 PASSED (4 cards, CavinKare & Only Solar, modal open/close verified)
  • Career Journey Milestones:      5 / 5 PASSED (4 milestones, 50+ retail outlets & +30% metrics verified)
  • Decision Studio & Ops Lab:      6 / 6 PASSED (Modal opens/closes, landed-cost dynamic calc, triage simulator)
  • Capabilities & Credentials:     2 / 2 PASSED (Both standalone inspection modals open/close cleanly)
  • Contact Section & Gmail Flow:   6 / 6 PASSED (5 chips update topic tint, valid Gmail URL to jayeshsingh9b@gmail.com)
  • Profile Digital Identity Card:  5 / 5 PASSED (Compact width <= 720px, 3 tabs reactive, close handlers verified)
  • Strict Privacy Audit:           1 / 1 PASSED (Zero public phone numbers on page or in modal content)
  • Cross-Device Responsive Layout: 6 / 6 PASSED (1920px, 1440px, 1024px, 768px, 390px, 360px all 0px overflow)
  • Mobile Navigation Drawer:       3 / 3 PASSED (Hamburger opens drawer, aria-expanded="true", link click closes)
================================================================
  TOTAL VERIFICATION ASSERTIONS:    63 PASSED, 0 FAILED
================================================================
```

### Visual Verification Screenshots (Phase 11 Audit)

- **1920 × 1080 (Widescreen Desktop)**: [`v26-final-1920.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-final-1920.png) — 0px overflow
- **1440 × 900 (Standard Desktop)**: [`v26-final-1440.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-final-1440.png) — 0px overflow
- **1024 × 768 (Small Desktop / Landscape Tablet)**: [`v26-final-1024.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-final-1024.png) — 0px overflow
- **768 × 1024 (Portrait Tablet)**: [`v26-final-768.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-final-768.png) — 0px overflow
- **390 × 844 (Standard Mobile iPhone)**: [`v26-final-390.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-final-390.png) — 0px overflow
- **360 × 800 (Compact Android Mobile)**: [`v26-final-360.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-final-360.png) — 0px overflow

---

## 6. Operations Pipeline — Outside-Click Reset Behaviour

Visitors can freely inspect stages, open Scenario Details, explore deep operational metrics, activate the reverse feedback loop, or toggle Delay / Surge scenarios. The moment they click or tap anywhere outside the complete Operations Pipeline container (`#operationsVisual`), the system quietly collapses all expanded disclosures and restores its minimalist default appearance:

```
    ┌────────────────────────────────────────────────────────────────────────┐
    │              OUTSIDE-CLICK BOUNDARY ARCHITECTURE                       │
    │                                                                        │
    │  Inside #operationsVisual Container:                                   │
    │  • 6 Stage Nodes (Supplier → Sourcing → Inventory → etc.)             │
    │  • Scenario Selectors (Steady / Delay / Surge)                         │
    │  • Reverse Demand Feedback Loop Toggle                                 │
    │  • Stage Telemetry Panel & Deep Explore Drawer                         │
    │  • Scenario Details Box                                                │
    │  ➔ Clicks/taps keep panels open and switch stages without collapsing.  │
    │                                                                        │
    │  Outside Boundary (Hero content, Nav, Header, Other sections, Body):   │
    │  ➔ Calls resetPipelineToDefault()                                      │
    │     1. Unselects all 6 stages (activeStage = null)                     │
    │     2. Smoothly collapses stage telemetry panel (is-collapsing 220ms) │
    │     3. Closes Scenario Details drawer                                  │
    │     4. Resets scenario to Steady (activeScenario = 'normal')           │
    │     5. Restores feedback loop direction to forward (isReversed = false)│
    │     6. Restores minimal status strip hint                              │
    │     7. Keyboard Escape key also resets pipeline                        │
    └────────────────────────────────────────────────────────────────────────┘
```

### Outside-Click Automated Verification Matrix (`verify_pipeline_outside_click.js`)
- **Suite 1:** Baseline Minimal Initial State — 5 / 5 PASSED
- **Suite 2:** Select Stage 01 (Supplier) & Expand Details — 4 / 4 PASSED
- **Suite 3:** Click Inside Telemetry Panel (Must Remain Expanded) — 3 / 3 PASSED
- **Suite 4:** Select Delay & Click Another Stage (Inventory Switch) — 5 / 5 PASSED
- **Suite 5:** Click Outside Pipeline Box (Collapse & Reset to Steady) — 6 / 6 PASSED
- **Suite 6:** Escape Key Reset Verification — 6 / 6 PASSED
- **Suite 7:** Outside Clicks on Nav Links & Page Background — 4 / 4 PASSED
- **Suite 8:** Mobile Viewport Tap Outside Reset (390 × 844) — 4 / 4 PASSED
- **Total Test Assertions:** **37 PASSED, 0 FAILED (100% Pass Rate)**

### Visual Verification Screenshots (Outside-Click Reset)
- **Desktop Viewport (1440 × 900):** [`v26-pipeline-reset-desktop.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-pipeline-reset-desktop.png)
- **Mobile Viewport (390 × 844):** [`v26-pipeline-reset-mobile-390.png`](file:///Users/rajput/Documents/main%20decision/jayesh-portfolio-next/v26-pipeline-reset-mobile-390.png)

---

## 7. How to Run Locally

```bash
cd "/Users/rajput/Documents/main decision/jayesh-portfolio-next"

# Option 1: Python HTTP Server
python3 -m http.server 8080

# Option 2: Direct browser opening
open index.html
```
Visit `http://localhost:8080` in any browser.

---

# Jayesh Singh — Portfolio V28
## Two-Section Experience Upgrade: Operating Principles × Selected Work

**Scope:** Focused exclusively on Section 02 (Operating Principles) and Section 03 (Selected Work). Retained existing header, hero, profile popup, Operations Pipeline, Journey, Operations Lab, and Contact sections untouched.

### 1. Section 02 // Operating Principles: The Three Operating Lenses
- **Interaction Architecture:** Replaced static 3-card grid with an interactive editorial exhibition.
- **Top Lens Selector Tabs:**
  - `01 // Walk the Beat First` (Field Execution · CavinKare FMCG Mumbai grounding)
  - `02 // True Landed Economics` (Commercial Sourcing · Only Solar import logistics grounding)
  - `03 // Practical Relational Systems` (Systems Architecture · B.Tech CS + MBA operations foundation)
- **Central Dynamic Visual Viewport:**
  - **Lens 01:** Interactive S-curve retail distribution route with animated traveling pulse and 5 clickable checkpoints (`Distributor Depot`, `Andheri Kirana Cluster`, `Linking Road Store`, `Bandra GT Outlets`, `Market Feedback Hub`).
  - **Lens 02:** Layered Landed Cost Waterfall with interactive tiers (`FOB Price 38%`, `Ocean Freight & Demurrage Reserve 24%`, `Customs & Clearance 22%`, `Inland Linehaul 16%`) and synthetic calculation model formula.
  - **Lens 03:** Relational flow network connecting `Retailer Store Demand` ➔ `Commercial Order Booking` ➔ `Warehouse Stock Allocation` ➔ `Replenishment Pull`.
- **Editorial Detail Column & Bridge Link:** Displays the core thesis, verified grounding, and direct bridge link (`HOW I THINK ↘ WHERE I APPLIED IT`) connecting each lens to its corresponding case study in Section 03 with smooth scrolling and highlight pulse.

### 2. Section 03 // Selected Work: The Interactive Project Exhibition
- **Exhibition Layout:** Replaced static 2x2 grid with an editorial directory index (left) + sticky dynamic live preview card (right).
- **Category Filter Tabs:**
  - `All Work (4)`
  - `Professional Experience (1)`
  - `Entrepreneurship (1)`
  - `Independent Concepts (2)`
  - Automatic fallback updates live preview if currently active project is filtered out.
- **Project Index Cards:**
  1. `Making a Beat Work Harder` (CavinKare: 50+ retail outlets, 10+ GT accounts in M1, +20% active expansion, +30% MoM lift).
  2. `From Supplier to Shelf` (Only Solar: 0 ➔ 1 commercial GTM, import sourcing & pricing).
  3. `See the Whole Flow` (Independent concept: 3NF SQL schema & Power BI replenishment dashboard).
  4. `Exceptions First` (Independent concept: 3-tier diagnostic warranty triage & reverse logistics model).
- **Live Preview Viewport:** Features domain-tailored SVG schematics (beat routing, landed cost waterfall, 3NF schema ER diagram, 3-tier triage routing), structured problem/action briefs, key metrics, and primary CTA (`#previewDossierBtn`) opening the full case study dossier.
- **Backwards Compatibility:** Retained `.project-card[data-project-id]` and `[data-open-case]` selectors ensuring 100% test suite compatibility.

### 3. Verification & QA Matrix
- **`verify_portfolio_v28.js`:** 100% PASSED (Section 02 lenses, Route SVG, Landed waterfall, Relational network, Bridge links, Section 03 exhibition, Filters, Live preview, Dossier modal, 5 responsive viewports 1920, 1440, 1024, 768, 390 with zero overflow).
- **`audit_portfolio_final.js`:** 63 / 63 PASSED (0 failed).
- **`verify_portfolio_v27.js`:** 50 / 50 PASSED (0 failed).
- **`verify_portfolio_v26.js`:** 43 / 43 PASSED (0 failed).
- **`verify_portfolio_v25.js`:** 67 / 67 PASSED (0 failed).
- **Total:** Over 223 automated test assertions passing with zero regressions.
