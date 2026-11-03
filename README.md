# Jayesh Singh — Portfolio V17: Minimal Operations
## A Simpler, More Intelligent Professional Experience

**Location:** `/Users/rajput/Documents/main decision/jayesh-portfolio-next/`  
**Identity:** Operations, Logistics & Commercial Systems  
**Core Thesis:** *Show less initially. Reveal more when someone is interested.*

---

## 1. Key Design Transformations in V17

| Requirement | Implementation in V17 | Verification |
|---|---|---|
| **Remove Profile Photograph** | **100% Removed** across the entire website. Zero portraits in hero, profile card, modals, footer, or assets. | Checked via regex & visual audit: 0 photo tags or portrait images. |
| **Signature Operations Visual** | **Replaced photograph** with an interactive SVG Operations Pipeline: `Supplier → Sourcing → Inventory → Warehouse → Distribution → Retail` + `Reverse Demand Feedback Loop ↺`. Includes animated pulses, 3 scenario selectors (`Steady`, `Delay`, `Surge`), and dynamic telemetry readout. | Fully interactive in hero column. |
| **Remove Oversized Hero Name** | Removed giant `JAYESH / SINGH` block. Replaced with a balanced, elegant editorial headline: `I make complex operations clearer.` paired with clear value proposition and 4 verified metric chips (`50+ Outlets`, `+20% Reach`, `0 → 1 Venture`, `Dual B.Tech CS + MBA`). | Balanced, spacious typography. |
| **1-Second Soft Light Name in Header** | `JAYESH SINGH` rendered in the glossy header with continuous 1-second color shifting across 7 soft mineral pastel tones: soft sage (`#7da68f`), muted blue-grey (`#85a3b2`), muted lavender (`#a89bb8`), dusty rose (`#c98a96`), light terracotta (`#c98370`), warm champagne (`#d9be9b`), and soft olive (`#8c9b78`). | Smooth, non-aggressive, harmonic transition. |
| **Preserve Glossy Header** | iOS frosted glass (`backdrop-filter: blur(34px) saturate(210%)`), top specular highlight, dynamic pointer specular glow, ambient crystal sheen sweep, and sliding segmented indicator. | Fully preserved and optimized. |
| **Progressive Disclosure Architecture** | Simplified visible page into 6 focused sections with 6 deep modal dialogs for technical dossiers, operating methodology, capabilities stack, academic records, and live simulators. | Minimal surface, rich interactive depth. |

---

## 2. Page & Progressive Disclosure Architecture

### Surface Level (6 Concise Sections)
1. **01 // Home (Hero)**:
   - Live Mumbai IST clock + availability badge.
   - Balanced editorial headline: `I make complex operations clearer.`
   - Value proposition bridging field FMCG, venture sourcing, and relational systems.
   - 2 primary CTAs (`Explore Selected Work ↘`, `Download Résumé ↓`).
   - Verified 4-metric strip.
   - Signature Interactive Operations Pipeline Visual.
2. **02 // Approach**:
   - 3 core operating principles (Walk the Line First, Unit Economics at the Gate, Single Source of Truth).
   - Control: `Explore 4-Stage Operating Loop & Methodology ⤢`.
3. **03 // Selected Work**:
   - 4 clean case study overviews with problem, action, and quantified impact.
   - Controls: `View Case Study Dossier ↗` on each card.
4. **04 // Journey & Trajectory**:
   - Compact 4-milestone timeline (MBA Candidate, Only Solar Co-Founder, CavinKare Sales Rep, B.Tech CS 75.8%).
   - Controls: `Capabilities & Tooling Stack ⤢` and `Verified Credentials & Academics ⤢`.
5. **05 // Operations Lab**:
   - Compact banner introducing Jayesh's mathematical tools.
   - Control: `Launch Operations Lab ⤢`.
6. **06 // Direct Contact**:
   - 1-click email copy button with toast notification + `⌘C` shortcut.
   - Direct phone, Mumbai location, LinkedIn, Résumé PDF download.
   - Validated inquiry note form with topic pills.

### Deep Level (6 Accessible `<dialog>` Modals)
- `#caseDialog`: Full-screen case dossiers for CavinKare, Only Solar, Relational Pipeline, and Reverse Logistics.
- `#loopDialog`: 4-stage operating loop breakdown (Observe → Model → Systematize → Feedback).
- `#capabilitiesDialog`: Tri-modal operational, analytical, and commercial toolkit.
- `#credentialsDialog`: Verified degrees (MBA Operations, B.Tech CS 75.8%) and technical coursework.
- `#milestoneDialog`: Milestone inspector with role context and highlights.
- `#labDialog`: Operations Laboratory with:
  1. **Sourcing Landed-Cost Simulator**: Real-time multi-variable sliders (Volume, FOB, Ocean Freight, Customs Duty, Inland Transit, Margin) calculating unit landed costs and breakeven pricing.
  2. **Exception Triage Board**: Live triage of port customs holds, FMCG beat stockouts, and distributor credit alerts.

---

## 3. Verified Career Foundation

- **Education**:
  - MBA Candidate (Operations & Logistics Major), Lovely Professional University (LPU), 2024–2026.
  - B.Tech in Computer Science & Engineering, Lovely Professional University (LPU), 2019–2023, **75.8% aggregate**.
- **Field & Commercial Experience**:
  - Co-Founder & Operations Lead, Only Solar (2023–2024): Cross-border sourcing, tier-1 vendor audits, container customs clearance, landed-cost modeling, and domestic B2B distribution.
  - Sales Representative, CavinKare (2023, Mumbai): 50+ General Trade retail outlets managed; expanded active retail base by +20% (10+ accounts) in Month 1; delivered +30% MoM focus category lift.
- **Contact**: `singhjayesh416@gmail.com` | `+91 91374 89209` | Mumbai, India.

---

## 4. How to Run Locally

```bash
cd "/Users/rajput/Documents/main decision/jayesh-portfolio-next"

# Option 1: Python HTTP Server
python3 -m http.server 8080

# Option 2: Direct browser opening
open index.html
```
Visit `http://localhost:8080` in any modern browser.
