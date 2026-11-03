# Jayesh Singh — Portfolio V23.1
## Critical Functional Fix: Interactive Operations Pipeline & Demand Feedback Loop

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

## 4. How to Run Locally

```bash
cd "/Users/rajput/Documents/main decision/jayesh-portfolio-next"

# Option 1: Python HTTP Server
python3 -m http.server 8080

# Option 2: Direct browser opening
open index.html
```
Visit `http://localhost:8080` in any browser.
