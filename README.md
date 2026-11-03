# Jayesh Singh — Portfolio V21
## Final Content Accuracy, Contact Experience & December Redesign Preparation

**Location:** `/Users/rajput/Documents/main decision/jayesh-portfolio-next/`  
**Identity:** Operations, Logistics & Commercial Systems  
**Core Thesis:** *Show less initially. Reveal more when someone is interested.*  
**Live Target Reference:** `https://jayesh-singh-portfolio.vercel.app/#contact`  
**Primary Career Source:** `Jayesh-Singh-Resume.pdf`

---

## 1. Executive Summary & V21 Content Audit

The V21 release executes a comprehensive factual audit of Jayesh Singh's professional portfolio, preserves genuine achievements, aligns academic and entrepreneurial timelines, classifies conceptual projects transparently, guarantees absolute phone privacy, and provides a direct, reliable Gmail contact experience.

### Real Professional Trajectory
$$\text{Computer Science (B.Tech 2024)} \longrightarrow \text{Entrepreneurship (Only Solar 2024–2025)} \longrightarrow \text{FMCG Field Sales (CavinKare 2025–2026)} \longrightarrow \text{MBA in Operations \& Logistics (2026–2028 Pursuing)}$$

---

## 2. Content Audit & Factual Grounding Matrix

| Professional Domain | Previous Portfolio Draft | V21 Factual Correction | Status |
|---|---|---|---|
| **CavinKare Achievements** | Present | **100% Preserved & Retained**: 50+ retail outlets covered across Andheri to Bandra (Mumbai); 10+ General Trade accounts onboarded in Month 1; +20% active retailer-base expansion; +30% MoM focus-category revenue growth; primary/secondary sales support, distributor replenishment, merchandising, planograms, trade schemes, competitor feedback. | **Genuine & Confirmed** |
| **CavinKare Employment Terms** | Generalized | Explicitly designated as **Sales Representative (Third-Party Payroll)**, **Oct 2025 – Feb 2026**. | **Accurate** |
| **Only Solar Scope** | Exaggerated metrics, arbitrary savings claims | Position: **Co-Founder & Business Head**, **2024 – Early 2025**. Sourced and distributed commercial solar, street, and flood lighting. Authentic responsibilities: international supplier sourcing, vendor negotiations, import logistics, sales strategy, pricing approach, GTM planning, customer/distributor relationships, daily operations, P&L decisions. All unsupported percentages and volume claims purged. | **Factual Grounding** |
| **Education: MBA** | 2024–2026 / Sales Minor claimed | **Lovely Professional University (LPU)**, **2026–2028 | Pursuing**. Confirmed Major: **Operations & Logistics**. Minor: **Undecided** (no false claim of Product Management or Sales minor). | **Verified** |
| **Education: B.Tech** | 2019–2023 / "75.8%" | **B.Tech — Computer Science Engineering**, Lovely Professional University (LPU), **Graduated 2024**. Unverified `75.8%` aggregate removed. | **Verified** |
| **Skills & Capabilities** | Uniform "expert" percentages | Classified strictly into verified categories: **Sales & Distribution**, **Management & Operations**, **Core Strengths**. Technical tools (SQL, Power BI, Advanced Excel, Python) classified honestly by proficiency (Demonstrated, Familiar with, Foundational). | **Honest Classification** |
| **External Certifications** | Unverified dates & credentials | Purged unverified external certificates; focused on core degree curriculum and applied competencies. | **Cleaned** |
| **Project 01: Beat Expansion** | Ambiguous classification | `Making a Beat Work Harder` — Explicitly tagged as `PROFESSIONAL EXPERIENCE // CAVINKARE`. Showcases genuine field sales execution. | **Preserved** |
| **Project 02: Sourcing Pipeline** | Ambiguous scale | `From Supplier to Shelf` — Explicitly tagged as `ENTREPRENEURSHIP // ONLY SOLAR`. Showcases authentic sourcing, import logistics, and distribution. | **Preserved** |
| **Project 03: Inventory Model** | Implied live production system | `See the Whole Flow` — Explicitly tagged as `INDEPENDENT ANALYTICAL CONCEPT`. Labeled as built on synthetic datasets and conceptual schema. | **Transparent** |
| **Project 04: Exceptions Triage** | Implied live enterprise feed | `Exceptions First` — Explicitly tagged as `INDEPENDENT OPERATIONS ANALYTICS CONCEPT`. Labeled as an illustrative framework using synthetic operational scenarios. | **Transparent** |
| **Operations Lab Tools** | Implied actual transaction telemetry | **Decision Studio**: Labeled as *"Illustrative Landed-Cost Sourcing Simulator — Synthetic Numerical Assumptions"*. **Operations Signal Board**: Labeled as *"Illustrative Operations Exception Board — Synthetic Scenarios"*. | **Transparent** |
| **Phone Privacy** | Publicly visible in header, hero, contact, footer, and PDF | **ZERO public phone numbers**. Removed from all HTML, JS, CSS, modals, and PDF text layers. | **100% Private** |
| **Email Address** | Inconsistent addresses | Single verified contact email: `jayeshsingh9b@gmail.com`. | **Verified** |
| **Contact Form Workflow** | Generic mailto or simulated send | Directly constructs prefilled Gmail Web compose URL (`https://mail.google.com/mail/?view=cm&fs=1&to=jayeshsingh9b@gmail.com&su=...&body=...`), opens in a new tab, displays clear redirect notice, and provides an immediate fallback card. | **Functional** |
| **Downloadable PDF** | Redacted file had phone in text layer | Clean vector PDF compiled at `assets/Jayesh-Singh-Resume.pdf` using headless Chrome. Zero phone number in both visual rendering and underlying text stream. | **Verified** |

---

## 3. Contact Experience Specifications

### Fields & Action
- **Fields**: Full Name, Sender's Email, Subject, Message.
- **Action Button**: `Continue to Gmail →`
- **Help Note**: *"Your message will open in Gmail, where you can review and send it."*
- **Target URL Construction**:
  ```javascript
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=jayeshsingh9b@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  ```
- **Post-Action Banner**: *"Your message is ready in Gmail. Review it and press Send."*
- **Popup-Blocked Fallback Card**: Contains a pre-generated `mailto:` button with prefilled subject and body.

---

## 4. Visual Design & Progressive Disclosure Architecture

The V21 implementation retains the clean, balanced V17 minimal design:
- **Glossy iOS Glass Header**: `backdrop-filter: blur(34px) saturate(210%)` with top specular edge, dynamic pointer light, and ambient sheen.
- **Soft Light Header Wordmark**: 1-second muted pastel color shift across 7 mineral tones.
- **Signature Operations Pipeline Visual**: Replaces portraits with an interactive SVG pipeline (`Supplier → Sourcing → Inventory → Warehouse → Distribution → Retail` + `Reverse Feedback Loop ↺`) with 3 scenario switches (`Steady`, `Delay`, `Surge`).
- **Progressive Disclosure Modals**: Full-depth technical case dossiers, 4-stage operating loop, capabilities stack, academic records, and interactive operations lab.

---

## 5. Verification & Privacy Audit

All checks passed:
1. `grep -rnE "91374|89571|tel:" .` $\rightarrow$ **0 matches** (Passed).
2. Swift PDFKit text stream inspection of `assets/Jayesh-Singh-Resume.pdf`:
   - `PASS: Zero phone numbers found in PDF!`
   - `PASS: Verified email and LinkedIn present!`
3. Original resume `/Users/rajput/Documents/Jayesh-Singh-Resume.pdf` left strictly untouched.
4. Source folders `google`, `jayesh_singh_portfolio_repo`, `jayesh-portfolio-final` left strictly untouched.
5. All local changes contained strictly within `/Users/rajput/Documents/main decision/jayesh-portfolio-next`.

---

## 6. How to Run Locally

```bash
cd "/Users/rajput/Documents/main decision/jayesh-portfolio-next"

# Option 1: Python HTTP Server
python3 -m http.server 8080

# Option 2: Direct browser opening
open index.html
```
Visit `http://localhost:8080` in your browser.
