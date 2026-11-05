# Jayesh Singh — Executive Portfolio

A bespoke, responsive portfolio inspired by the architectural craft and interaction design of [therishithakor.com](https://therishithakor.com/).

Zero external runtime dependencies. Built with vanilla HTML5, modern CSS custom properties with View Transitions, and native JavaScript physics.

## Quick Local Preview

Run any local web server:

```bash
# Using Python 3
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Key Features & Refinements

1. **Re-Animated Profile Feature**
   - **Interactive Canvas Aura & Liquid Spark Tracers**: High-DPI canvas overlay (`#figCanvas`) renders a warm radiant aura and interactive spark trails following pointer movement.
   - **3D Parallax Tilt**: Portrait responds dynamically in 3D space (`perspective: 1000px; rotateX; rotateY`) on mouse move and springs back smoothly on leave.
   - **Dual Ability Card Triggers**: Clicking the hero portrait (`#fig`), the pill button (`#holoOpen`), or the header avatar (`#profileTrigger`) opens the **3D Holographic Ability Card**.

2. **Mechanical Desk Flip-Calendar (`#cal`)**
   - Dynamic width sizing and automatic generation of wire spiral binding rings (`.cal__rings`) and punched holes (`.cal__holes`).
   - 3D folding leaf with realistic layered paper stack drop shadows and smooth page flipping every 3.2s (with manual click-to-flip override).

3. **Verlet Physics Pull-Cord Light / Dark Switch**
   - Interactive rope hanging from the top right simulated with 24-segment Verlet integration and gravity.
   - Pulling past threshold snaps the switch with haptic feedback, triggering a smooth View Transition between warm linen parchment (`#E8E4E0`) and charcoal noir (`#1A1818`).

4. **3D Architectural Doorways ("Execution Happens Behind the Doors")**
   - 4 Arched doorway portals with fluted wood texture, embossed brass plates, brass levers, light spills, and floor reflections:
     * **Door 01**: Frontline FMCG Distribution (*CavinKare*)
     * **Door 02**: Global Sourcing & Cross-Border Trade (*Only Solar*)
     * **Door 03**: Supply Chain Decision Analytics (*Power BI & SQL*)
     * **Door 04**: Product Systems & Tech Interoperability (*B.Tech CS + MBA Operations*)
   - Hover swings the door open (`rotateY(-58deg)`) and dynamically updates the HUD (`#dinfo`).
   - Clicking any door opens the **Deep Domain Vault Chamber Modal** with case evidence, route planning, and verified metrics.

5. **Decision Studio**
   - **Landed-Cost Simulator**: Real-time cross-border pricing engine modeled after *Only Solar* (FOB, ocean freight, customs tariffs, distributor margins, breakeven volume) with live track fills.
   - **FMCG Beat Exception Queue**: Modeled after *CavinKare* Mumbai territory operations (Andheri to Bandra), with real-time triage and resolution feedback.

6. **"Let's Go Back in Time" (Interactive Story & Chronology)**
   - Concentric canvas clock dials that turn backwards into history as you scroll.
   - Mechanical rolling digit year display (**2026 → 2025 → 2024 → 2020**).
   - Scroll-linked traveling dot tracking your exact position along the vertical rail.

7. **3D Holographic Ability Card (`#holo`)**
   - Interactive 3D mouse tilt with iridescent foil sheen and double-sided flip.
   - Verified ratings across FMCG Route-to-Market, Cross-Border Sourcing, Power BI & SQL, and Systems Architecture.

8. **Screen-Filling Edge-to-Edge Fluid Name Footer (`.sf`)**
   - Massive typographic wordmark `JAYESH SINGH` that dynamically scales via JavaScript to span 100% of viewport width without page overflow.
   - Live Mumbai IST clock, quick contact modal, and one-click copy email button with clipboard toast notification.

## Automated Verification Suite

To run the automated headless browser verification suite:

```bash
"/Users/rajput/Library/Application Support/com.raycast.macos/NodeJS/runtime/22.22.2/bin/node" test_portfolio.js
```

Full-resolution desktop and mobile test screenshots are stored in `screenshots/`.
