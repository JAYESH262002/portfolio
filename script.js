/**
 * JAYESH SINGH — EXECUTIVE PORTFOLIO ENGINE
 * Inspired by therishithakor.com
 * Features:
 * - Liquid Canvas & Particle Aura Profile Feature with 3D Parallax Tilt
 * - Profile Ability Card (#holo) Trigger via Portrait & Avatar
 * - Mechanical Desk Flip-Calendar with Dynamic Spiral Rings & Holes
 * - Verlet Physics Pull-Cord Light/Dark Switch
 * - 3D Architectural Doorways with Spring Swing & Chamber Modal
 * - Interactive Cross-Border Landed Cost Simulator
 * - FMCG Beat Exception Queue Resolver
 * - Scroll-Linked Rotating Clock Tunnel Canvas
 * - Rolling Mechanical Digit Year & Vertical Rail Dot Tracker
 * - Screen-Filling Edge-to-Edge Fluid Name Footer
 * - Navigation Scroll Spy & Copy Toast
 */

(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     CUSTOM FOLLOWER CURSOR (MINIMALIST PURPLE/SLATE CIRCULAR RING)
     ========================================================================== */
  const cursorRing = $('#cursorRing');
  const cursorLabel = $('#cursorLabel');
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (finePointer && !isReduced && cursorRing) {
    document.body.classList.add('has-pointer');
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let isVisible = false;

    window.addEventListener('pointermove', e => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        cursorRing.style.opacity = '1';
      }
    }, { passive: true });

    window.addEventListener('pointerleave', () => {
      isVisible = false;
      cursorRing.style.opacity = '0';
    });

    const animateCursor = () => {
      // Snappy, agile 0.48 lerp rate for instant feather-light tracking
      ringX += (pointerX - ringX) * 0.48;
      ringY += (pointerY - ringY) * 0.48;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Hover triggers for interactive elements
    const hoverSelectors = 'a, button, .doorway, .kpi-chip, .pill, [role="tab"], [role="button"], .tab-btn, .fig, .cord__hit, .unit, .chrono__dial-circle, .chrono__pill';
    $$(hoverSelectors).forEach(el => {
      el.addEventListener('pointerenter', () => {
        document.body.classList.add('cursor-hover');
        if (cursorLabel) {
          const custom = el.dataset.cursor || (el.classList.contains('chrono__dial-circle') ? 'Scrub' : (el.classList.contains('chrono__pill') ? 'Seek' : (el.classList.contains('doorway') ? 'Open' : (el.tagName === 'A' ? 'Visit' : ''))));
          cursorLabel.textContent = custom;
        }
      });
      el.addEventListener('pointerleave', () => {
        document.body.classList.remove('cursor-hover');
        if (cursorLabel) cursorLabel.textContent = '';
      });
    });
  }

  /* ==========================================================================
     TACTILE AUDIO SYNTHESIZER (ZERO-DEPENDENCY WEB AUDIO API)
     ========================================================================== */
  let audioCtx = null;
  let soundMuted = false;
  try {
    soundMuted = localStorage.getItem('jayesh-sound-mute') === 'true';
  } catch(e) {}

  const sndToggle = $('#sndToggle');
  function updateSoundUI() {
    if (!sndToggle) return;
    sndToggle.classList.toggle('muted', soundMuted);
    sndToggle.title = soundMuted ? 'Unmute tactile sound effects' : 'Mute tactile sound effects';
    const onIcon = sndToggle.querySelector('.snd-on');
    const offIcon = sndToggle.querySelector('.snd-off');
    if (onIcon) onIcon.hidden = soundMuted;
    if (offIcon) offIcon.hidden = !soundMuted;
  }
  updateSoundUI();

  if (sndToggle) {
    sndToggle.addEventListener('click', () => {
      soundMuted = !soundMuted;
      try { localStorage.setItem('jayesh-sound-mute', soundMuted); } catch(e) {}
      updateSoundUI();
      if (!soundMuted) playSound('click');
    });
  }

  function getAudioContext() {
    if (soundMuted) return null;
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playSound(type) {
    if (soundMuted || isReduced) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.03);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.035);
      } else if (type === 'switch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.07);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      } else if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.1);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.11);
      } else if (type === 'door') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.28);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.035);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      }
    } catch (e) {}
  }

  /* ==========================================================================
     01. REAL-TIME CLOCK (IST / MUMBAI) & FOOTER YEAR
     ========================================================================== */
  function updateTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));
    let h = ist.getHours();
    const m = String(ist.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    const timeStr = `${h}:${m}${ampm}`;

    $$('[data-ftime]').forEach(el => el.textContent = timeStr);
    $$('[data-fyear]').forEach(el => el.textContent = now.getFullYear());
  }
  updateTime();
  setInterval(updateTime, 20000);

  /* ==========================================================================
     02. PAGE LOADER PROGRESS
     ========================================================================== */
  const loader = $('#loader');
  const ldFill = $('#ldFill');
  const ldCount = $('#ldCount');

  function runLoader() {
    const start = performance.now();
    const duration = 3000; // Exact 3-second authentic loading sequence

    function frame(now) {
      const elapsed = now - start;
      const rawProgress = Math.min(1, elapsed / duration);

      // Organic operational pacing curve: smooth start, steady domain loading, clean arrival at 100%
      let progress;
      if (rawProgress < 0.6) {
        progress = (rawProgress / 0.6) * 0.58;
      } else if (rawProgress < 0.85) {
        progress = 0.58 + ((rawProgress - 0.6) / 0.25) * 0.32;
      } else {
        progress = 0.90 + ((rawProgress - 0.85) / 0.15) * 0.10;
      }
      progress = Math.min(1, Math.max(0, progress));

      const loadPct = Math.min(100, Math.round(progress * 100));

      if (ldFill) ldFill.style.width = `${loadPct}%`;
      if (ldCount) ldCount.textContent = `${loadPct}%`;

      if (rawProgress < 1) {
        requestAnimationFrame(frame);
      } else {
        if (ldFill) ldFill.style.width = '100%';
        if (ldCount) ldCount.textContent = '100%';

        setTimeout(() => {
          if (loader) {
            loader.classList.add('out');
            setTimeout(() => {
              loader.style.display = 'none';
              try { loader.remove(); } catch (e) {}
            }, 600);
          }
          document.body.classList.add('ready');
          fitFooterWord();
        }, 150);
      }
    }
    requestAnimationFrame(frame);
  }

  // Failsafe: Ensure loader lifts even if tab was backgrounded or inactive
  setTimeout(() => {
    if (loader && loader.parentNode) {
      loader.classList.add('out');
      setTimeout(() => {
        loader.style.display = 'none';
        try { loader.remove(); } catch (e) {}
      }, 600);
    }
    document.body.classList.add('ready');
    fitFooterWord();
  }, 4200);

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

  /* ==========================================================================
     03. PULL CORD: VERLET ROPE PHYSICS & LIGHT/DARK SWITCH
     ========================================================================== */
  const cord = $('#cord');
  const cv = cord ? cord.querySelector('.cord__cv') : null;
  const hit = $('#cordHit');
  const themeToggleBtn = $('#themeToggleBtn');
  const MODE_KEY = 'jayesh-theme';

  function updateThemeUI(mode) {
    const isDark = mode === 'dark';
    if (hit) hit.setAttribute('aria-checked', String(isDark));
    if (themeToggleBtn) {
      const sun = themeToggleBtn.querySelector('.theme-sun');
      const moon = themeToggleBtn.querySelector('.theme-moon');
      if (sun) {
        if (isDark) sun.removeAttribute('hidden');
        else sun.setAttribute('hidden', '');
      }
      if (moon) {
        if (isDark) moon.setAttribute('hidden', '');
        else moon.removeAttribute('hidden');
      }
      themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      themeToggleBtn.removeAttribute('title');
    }
  }

  function getTheme() {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return root.dataset.mode || 'light';
  }

  function setTheme(mode) {
    root.dataset.mode = mode;
    updateThemeUI(mode);
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}

    document.body.classList.remove('theme-switch-anim');
    void document.body.offsetWidth;
    document.body.classList.add('theme-switch-anim');
  }

  let lastToggleTime = 0;
  function toggleTheme() {
    const now = performance.now();
    if (now - lastToggleTime < 300) return;
    lastToggleTime = now;
    const current = root.dataset.mode === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    playSound('switch');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }
  updateThemeUI(root.dataset.mode || 'light');

  if (cv && hit) {
    const ctx = cv.getContext('2d');
    const N = 28;
    const G = 4200;
    let W = window.innerWidth, H = window.innerHeight, dpr = 1;
    let L = 210, HIDDEN = 80, seg = 10, ax = W - 80;
    let pts = [];
    let ext = 0, extV = 0;
    let dragging = false;
    let target = { x: 0, y: 0 };
    let toggledThisPull = false;
    let startTipY = 0;

    function resizeCord() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
      // Position inward so it's comfortably reachable away from screen edges & scrollbars
      let offset = Math.max(4.2 * rem, Math.min(6.2 * rem, vw * 0.065));
      L = Math.min(220, Math.max(160, vh * 0.22));
      W = vw;
      H = vh;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);

      ax = W - offset;
      const total = L + HIDDEN;
      seg = total / N;

      if (pts.length === 0) {
        pts = [];
        for (let i = 0; i <= N; i++) {
          const x = ax, y = -HIDDEN + i * seg;
          pts.push({ x, y, px: x, py: y, w: i === 0 ? 0 : i === N ? 0.2 : 1 });
        }
      } else {
        pts[0].x = ax;
      }
    }
    resizeCord();
    window.addEventListener('resize', resizeCord);

    function stepCord(dt) {
      if (!dragging) {
        const K = 440, C = 16;
        extV += (-K * ext - C * extV) * dt;
        ext += extV * dt;
        if (Math.abs(ext) < 0.2 && Math.abs(extV) < 0.2) { ext = 0; extV = 0; }
      }

      pts[0].x = ax;
      pts[0].y = -HIDDEN + ext;

      for (let i = 1; i <= N; i++) {
        const p = pts[i];
        if (i === N && dragging) {
          p.x = target.x;
          p.y = target.y;
          continue;
        }
        const vx = (p.x - p.px) * 0.965;
        const vy = (p.y - p.py) * 0.98 + G * dt * dt;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy;
      }

      // Elastic dynamic segment length: allows unlimited flexible dragging across screen!
      let curSeg = seg;
      if (dragging) {
        const dragDist = Math.hypot(target.x - pts[0].x, target.y - pts[0].y);
        // Expand segment distance smoothly when pulled far so the rope stretches elastically
        curSeg = Math.max(seg, (dragDist * 1.01) / N);
      }

      for (let k = 0; k < 14; k++) {
        for (let i = 0; i < N; i++) {
          const a = pts[i], b = pts[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1e-4;
          const diff = (dist - curSeg) / dist;
          const wa = a.w / (a.w + b.w + 1e-5);
          const wb = b.w / (a.w + b.w + 1e-5);
          if (a.w > 0) { a.x += dx * diff * wa; a.y += dy * diff * wa; }
          if (b.w > 0 && !(i + 1 === N && dragging)) { b.x -= dx * diff * wb; b.y -= dy * diff * wb; }
        }
      }

      // Trigger switch mid-drag if pulled past comfortable threshold
      if (dragging && !toggledThisPull) {
        const pullDistY = pts[N].y - startTipY;
        const pullDistTotal = Math.hypot(pts[N].x - ax, pts[N].y - startTipY);
        if (pullDistY > 38 || pullDistTotal > 50) {
          toggleTheme();
          toggledThisPull = true;
          if (navigator.vibrate) navigator.vibrate(25);
        }
      }

      const tip = pts[N];
      hit.style.transform = `translate3d(${tip.x}px, ${tip.y}px, 0)`;
    }

    function drawCord() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const isDark = root.dataset.mode === 'dark';
      const cordColor = isDark ? '#D5CDCA' : '#5A4E4E';
      const knobColor = isDark ? '#E8E4E0' : '#2A2424';

      // Drop shadow path (+4, +4 offset)
      ctx.beginPath();
      ctx.moveTo(pts[0].x + 4, pts[0].y + 4);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2 + 4;
        const yc = (pts[i].y + pts[i + 1].y) / 2 + 4;
        ctx.quadraticCurveTo(pts[i].x + 4, pts[i].y + 4, xc, yc);
      }
      ctx.lineTo(pts[N].x + 4, pts[N].y + 4);
      ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.14)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Main cord line (smooth quadratic curve through points)
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[N].x, pts[N].y);
      ctx.strokeStyle = cordColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      const tip = pts[N];
      const prev = pts[N - 1];
      const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x);

      // Draw matching drop shadow for knob aligned with cord shadow (+4, +4)
      ctx.save();
      ctx.translate(tip.x + 4, tip.y + 4);
      ctx.rotate(angle - Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, 14, 11, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.14)';
      ctx.fill();
      ctx.restore();

      // Draw enlarged, tactile teardrop knob
      ctx.save();
      ctx.translate(tip.x, tip.y);
      ctx.rotate(angle - Math.PI / 2);

      // Metallic connector collar / ferrule at top junction
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-4.5, -1, 9, 5, 2);
      } else {
        ctx.rect(-4.5, -1, 9, 5);
      }
      ctx.fillStyle = isDark ? '#B3ABA6' : '#6A5E5E';
      ctx.fill();

      // Main enlarged teardrop knob body (11px x 18px)
      ctx.beginPath();
      ctx.ellipse(0, 14, 11, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = knobColor;
      ctx.fill();

      // Primary specular 3D highlight (curved reflection)
      ctx.beginPath();
      ctx.ellipse(-3.5, 12, 3, 11, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.32)';
      ctx.fill();

      // Subtle ambient rim highlight on right
      ctx.beginPath();
      ctx.ellipse(4, 15, 1.5, 9, 0.1, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)';
      ctx.fill();

      ctx.restore();
    }

    let lastTime = performance.now();
    function loopCord(now) {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;
      stepCord(dt);
      drawCord();
      requestAnimationFrame(loopCord);
    }
    requestAnimationFrame(loopCord);

    let startX = 0, startY = 0;
    let didDrag = false;
    let lastPointerTime = 0;

    function onPointerDown(e) {
      lastPointerTime = performance.now();
      dragging = true;
      didDrag = false;
      toggledThisPull = false;
      startX = e.clientX;
      startY = e.clientY;
      startTipY = pts[N].y;
      cord.classList.add('dragging');
      target.x = e.clientX;
      target.y = e.clientY;
      try {
        hit.setPointerCapture(e.pointerId);
      } catch (err) {}
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > 4 || dy > 4) didDrag = true;
      // Allow unrestricted dragging across the entire screen!
      target.x = Math.max(10, Math.min(W - 10, e.clientX));
      target.y = Math.max(10, Math.min(H - 10, e.clientY));
    }

    function onPointerUp(e) {
      lastPointerTime = performance.now();
      cord.classList.remove('dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      try {
        hit.releasePointerCapture(e.pointerId);
      } catch (err) {}
      dragging = false;

      const pullDistTotal = Math.hypot(pts[N].x - ax, pts[N].y - startTipY);

      // If theme did not trigger mid-drag (e.g. quick click, tap, or short pull), trigger once now!
      if (!toggledThisPull) {
        toggleTheme();
        extV = 320;
      } else {
        // High-elasticity snap back into position after long pull (already toggled mid-drag!)
        ext = Math.min(50, pullDistTotal * 0.25);
        extV = -400;
        pts[N].py = pts[N].y + 25;
      }
      toggledThisPull = false;
    }

    hit.addEventListener('pointerdown', onPointerDown);
    hit.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      // If triggered by a synthetic .click() call without pointerdown, toggle cleanly
      if (performance.now() - lastPointerTime > 600) {
        toggleTheme();
        extV = 320;
      }
    });
    hit.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
        extV = 320;
      }
    });
  }

  /* ==========================================================================
     04. RE-ANIMATED PROFILE FEATURE (PORTRAIT AURA & 3D PARALLAX TILT)
     ========================================================================== */
  function initProfileFeature() {
    const fig = $('#fig');
    const figCanvas = $('#figCanvas');
    const figBase = $('#figBase');
    if (!fig || !figCanvas || !figBase) return;

    const ctx = figCanvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    let particles = [];
    let sparks = [];
    let mouse = { x: -1000, y: -1000, isHover: false };

    function resizeFigCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = fig.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      figCanvas.width = Math.round(W * dpr);
      figCanvas.height = Math.round(H * dpr);

      // Create ambient particles around silhouette
      particles = [];
      const count = W < 400 ? 24 : 45;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          r: 1.2 + Math.random() * 2,
          alpha: 0.15 + Math.random() * 0.45
        });
      }
    }

    resizeFigCanvas();
    window.addEventListener('resize', resizeFigCanvas);
    figBase.addEventListener('load', resizeFigCanvas);

    // Mouse tracking on fig with 3D perspective tilt & cursor spotlight
    fig.addEventListener('pointerenter', () => {
      mouse.isHover = true;
      fig.classList.add('tilting');
    });
    fig.addEventListener('pointerleave', () => {
      mouse.isHover = false;
      mouse.x = -1000;
      mouse.y = -1000;
      fig.classList.remove('tilting');
      fig.style.transform = '';
      fig.style.setProperty('--mx', '-500px');
      fig.style.setProperty('--my', '-500px');
    });

    fig.addEventListener('pointermove', e => {
      mouse.isHover = true;
      fig.classList.add('tilting');
      const rect = fig.getBoundingClientRect();
      const scaleX = rect.width ? (W / rect.width) : 1;
      const scaleY = rect.height ? (H / rect.height) : 1;
      mouse.x = (e.clientX - rect.left) * scaleX;
      mouse.y = (e.clientY - rect.top) * scaleY;

      // Update cursor spotlight position so only hovered area lights up!
      fig.style.setProperty('--mx', `${mouse.x.toFixed(1)}px`);
      fig.style.setProperty('--my', `${mouse.y.toFixed(1)}px`);

      // 3D Parallax subtle tilt on hover
      if (!isReduced) {
        const normX = (mouse.x / W - 0.5) * 2;
        const normY = (mouse.y / H - 0.5) * 2;
        const rotY = normX * 8;
        const rotX = -normY * 6;
        fig.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
      } else {
        fig.style.transform = 'scale(1.02)';
      }

      // Add sparks at cursor
      if (sparks.length < 35) {
        sparks.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5 - 0.8,
          r: 1.8 + Math.random() * 2.2,
          life: 1.0,
          decay: 0.025 + Math.random() * 0.03
        });
      }
    });

    // Animate canvas aura and particles
    function renderAura() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const isDark = root.dataset.mode === 'dark';
      const particleColor = isDark ? '224, 122, 95' : '139, 69, 19';

      // 1. Ambient particles & subtle constellation connections (soft edge-fading to ensure zero visible boundaries)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce within bounds
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // Interaction with mouse
        if (mouse.isHover) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 90) {
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * 1.5;
            p.y += Math.sin(angle) * 1.5;
          }
        }

        const distFromEdge = Math.min(p.x, p.y, W - p.x, H - p.y);
        const edgeFade = Math.max(0, Math.min(1, distFromEdge / 35));
        const effectiveAlpha = p.alpha * edgeFade;

        if (effectiveAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${particleColor}, ${effectiveAlpha})`;
          ctx.fill();

          // Connect nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const d = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (d < 65) {
              const p2Dist = Math.min(p2.x, p2.y, W - p2.x, H - p2.y);
              const p2Fade = Math.max(0, Math.min(1, p2Dist / 35));
              const lineAlpha = (1 - d / 65) * 0.15 * Math.min(edgeFade, p2Fade);
              if (lineAlpha > 0.01) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${particleColor}, ${lineAlpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }
      }

      // 3. Render sparks
      for (let k = sparks.length - 1; k >= 0; k--) {
        const sp = sparks[k];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= sp.decay;

        if (sp.life <= 0) {
          sparks.splice(k, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${sp.life * 0.8})`;
        ctx.fill();
      }

      requestAnimationFrame(renderAura);
    }
    requestAnimationFrame(renderAura);

    // Clicking portrait opens Ability Card
    fig.addEventListener('click', e => {
      // If click was on or inside the button itself, holoOpen's own handler will trigger
      openHoloCard();
    });
  }
  initProfileFeature();

  // Header avatar trigger -> Operator Profile Summary Card
  const profileTrigger = $('#profileTrigger');
  const profileDialog = $('#profileDialog');
  const profileDialogClose = $('#profileDialogClose');
  const profileCardContact = $('#profileCardContact');
  const profileCardHolo = $('#profileCardHolo');

  function openProfileSummary() {
    if (!profileDialog) return;
    playSound('door');
    profileDialog.showModal();
  }

  function closeProfileSummary() {
    if (!profileDialog || !profileDialog.open) return;
    profileDialog.close();
  }

  if (profileTrigger) profileTrigger.addEventListener('click', openProfileSummary);
  if (profileDialogClose) profileDialogClose.addEventListener('click', closeProfileSummary);
  if (profileDialog) {
    profileDialog.addEventListener('click', e => {
      if (e.target === profileDialog) closeProfileSummary();
    });
  }

  if (profileCardContact) {
    profileCardContact.addEventListener('click', () => {
      closeProfileSummary();
      openContactModal();
    });
  }

  if (profileCardHolo) {
    profileCardHolo.addEventListener('click', () => {
      closeProfileSummary();
      openHoloCard();
    });
  }

  /* ==========================================================================
     05a. HERO CONSTELLATION PLAYGROUND (INTERACTIVE BACKGROUND GAME)
     ========================================================================== */
  function initHeroGame() {
    const hero = $('#home');
    const canvas = $('#heroGameCanvas');
    const blastCounter = $('#gameBlastCounter');
    const comboEl = $('#gameCombo');
    if (!hero || !canvas) return;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    let particles = [];
    let shockwaves = [];
    let embers = [];
    let blastCount = 0;
    let comboStreak = 0;
    let lastBlastTime = 0;
    let comboTimer = null;
    let heroInView = true;

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
      down: false,
      wellRadius: 0
    };

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = hero.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      // Re-init particles with density matching screen width
      const targetCount = Math.min(95, Math.max(50, Math.floor(W / 15)));
      particles = [];
      for (let i = 0; i < targetCount; i++) {
        const speed = 0.35 + Math.random() * 0.45;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          baseVx: Math.cos(angle) * speed,
          baseVy: Math.sin(angle) * speed,
          radius: 1.8 + Math.random() * 2.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          tier: Math.random() > 0.8 ? 'accent' : (Math.random() > 0.5 ? 'secondary' : 'neutral'),
          mass: 0.8 + Math.random() * 0.6
        });
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track hero visibility so loop uses 0% CPU when scrolled past
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        heroInView = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      heroObserver.observe(hero);
    }

    // Pointer events on hero
    function updateMousePos(e) {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    hero.addEventListener('pointerenter', updateMousePos);
    hero.addEventListener('pointermove', updateMousePos);

    hero.addEventListener('pointerleave', () => {
      mouse.active = false;
      mouse.down = false;
      mouse.x = -1000;
      mouse.y = -1000;
    });

    hero.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button, [role="button"], input, select, .fig__card, .kpi-chip, .typer__badge, .typer__skip')) return;
      updateMousePos(e);
      mouse.down = true;
    });

    window.addEventListener('pointerup', () => {
      mouse.down = false;
    });

    function triggerBlast(x, y) {
      blastCount++;
      if (blastCounter) blastCounter.textContent = `${blastCount} Blast${blastCount === 1 ? '' : 's'}`;

      const now = performance.now();
      if (now - lastBlastTime < 1300) {
        comboStreak++;
      } else {
        comboStreak = 1;
      }
      lastBlastTime = now;

      // Update combo badge
      if (comboEl && comboStreak >= 2) {
        clearTimeout(comboTimer);
        const titles = ['', '', '💥 2x Blast!', '⚡ 3x Quantum Surge!', '🌟 4x Supernova!', '🔥 5x Hyperdrive!'];
        const title = titles[Math.min(comboStreak, titles.length - 1)] || `🚀 ${comboStreak}x Megablast!`;
        comboEl.textContent = title;
        comboEl.classList.remove('active');
        void comboEl.offsetWidth; // re-trigger animation
        comboEl.classList.add('active');
        comboTimer = setTimeout(() => {
          comboEl.classList.remove('active');
        }, 1600);
      }

      // Add expanding shockwave ring
      shockwaves.push({
        x,
        y,
        radius: 12,
        maxRadius: 260,
        speed: 14,
        alpha: 1
      });

      // Blast nearby particles with outward impulse
      for (const p of particles) {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 260) {
          const force = (1 - dist / 260) * 22 / p.mass;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Spawn glowing firework spark embers
      const sparkCount = 18 + Math.floor(Math.random() * 10);
      const isDark = document.documentElement.getAttribute('data-mode') === 'dark';
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.5 + Math.random() * 6.5;
        embers.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 2.5,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.025,
          color: isDark ? (Math.random() > 0.4 ? '#E58A4E' : '#38BDF8') : (Math.random() > 0.4 ? '#C2410C' : '#0284C7')
        });
      }

      // Tactile sound effect
      playSound('click');
    }

    hero.addEventListener('click', (e) => {
      if (e.target.closest('a, button, [role="button"], input, select, .fig__card, .kpi-chip, .typer__badge, .typer__skip')) return;
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      triggerBlast(x, y);
    });

    // 60FPS Game Loop
    function renderGame() {
      requestAnimationFrame(renderGame);
      if (!heroInView) return;

      const isDark = document.documentElement.getAttribute('data-mode') === 'dark';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Mouse Gravity Well vortex when mouse button held
      if (mouse.down && mouse.active) {
        mouse.wellRadius = Math.min(260, mouse.wellRadius + 14);

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.wellRadius * 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(229, 138, 78, 0.45)' : 'rgba(194, 65, 12, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.wellRadius * 0.75, 0, Math.PI * 2);
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.3)';
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        mouse.wellRadius = Math.max(0, mouse.wellRadius - 20);
      }

      // Render shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha -= 0.028;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(229, 138, 78, ${sw.alpha * 0.85})`
          : `rgba(194, 65, 12, ${sw.alpha * 0.8})`;
        ctx.lineWidth = Math.max(1, 4 * (1 - sw.radius / sw.maxRadius));
        ctx.stroke();

        // Secondary inner shock ring
        if (sw.radius > 30) {
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius * 0.7, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(56, 189, 248, ${sw.alpha * 0.5})`
            : `rgba(2, 132, 199, ${sw.alpha * 0.45})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Render & update spark embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const em = embers[i];
        em.x += em.vx;
        em.y += em.vy;
        em.vx *= 0.94;
        em.vy = (em.vy * 0.94) + 0.12;
        em.alpha -= em.decay;

        if (em.alpha <= 0) {
          embers.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size * em.alpha, 0, Math.PI * 2);
        ctx.fillStyle = em.color;
        ctx.globalAlpha = Math.max(0, em.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Breathing pulse
        p.pulse += p.pulseSpeed;
        const curRadius = p.radius + Math.sin(p.pulse) * 0.5;

        // Apply friction returning velocity toward ambient drift
        p.vx = p.vx * 0.98 + p.baseVx * 0.02;
        p.vy = p.vy * 0.98 + p.baseVy * 0.02;

        // Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy) || 1;

          if (mouse.down) {
            // Gravity well pull & planetary orbital swirl
            if (dist < 260) {
              const pullForce = (1 - dist / 260) * 1.8;
              p.vx += (dx / dist) * pullForce + (-dy / dist) * 0.45;
              p.vy += (dy / dist) * pullForce + (dx / dist) * 0.45;
            }
          } else {
            // Gentle cursor repulsion
            if (dist < 90) {
              const repel = (1 - dist / 90) * 1.2;
              p.vx -= (dx / dist) * repel;
              p.vy -= (dy / dist) * repel;
            }
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Edge bounce
        if (p.x < 15) { p.x = 15; p.vx = Math.abs(p.vx); }
        if (p.x > W - 15) { p.x = W - 15; p.vx = -Math.abs(p.vx); }
        if (p.y < 15) { p.y = 15; p.vy = Math.abs(p.vy); }
        if (p.y > H - 15) { p.y = H - 15; p.vy = -Math.abs(p.vy); }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
        if (p.tier === 'accent') {
          ctx.fillStyle = isDark ? '#E58A4E' : '#C2410C';
        } else if (p.tier === 'secondary') {
          ctx.fillStyle = isDark ? '#38BDF8' : '#0284C7';
        } else {
          ctx.fillStyle = isDark ? 'rgba(226, 232, 240, 0.65)' : 'rgba(51, 65, 85, 0.65)';
        }
        ctx.fill();

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 115) {
            const lineAlpha = (1 - d / 115) * (isDark ? 0.32 : 0.22);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark
              ? `rgba(229, 138, 78, ${lineAlpha})`
              : `rgba(194, 65, 12, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor with interactive laser tether
        if (mouse.active) {
          const dMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dMouse < 160) {
            const tetherAlpha = (1 - dMouse / 160) * (isDark ? 0.75 : 0.65);
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${tetherAlpha})`
              : `rgba(2, 132, 199, ${tetherAlpha})`;
            ctx.lineWidth = 1.35;
            ctx.stroke();

            // Glow ring on tethered particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, curRadius + 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${tetherAlpha * 0.7})`
              : `rgba(2, 132, 199, ${tetherAlpha * 0.7})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Cursor reticle when active
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#38BDF8' : '#0284C7';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    }

    renderGame();
  }
  initHeroGame();

  /* ==========================================================================
     05b. DYNAMIC EXECUTIVE TYPEWRITER
     ========================================================================== */
  function initTypewriter() {
    const typerText = $('#typerText');
    const typerCount = $('#typerCount');
    const typerBadge = $('#typerBadge');
    const typerSkip = $('#typerSkip');
    if (!typerText) return;

    const ROLES = [
      'Frontline FMCG Strategist',
      'Global Sourcing & Trade Architect',
      'Supply Chain Analytics Modeler',
      'Operations & Logistics Leader',
      'B.Tech CS + MBA Synthesis'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeTimer = null;

    function updateCount() {
      if (typerCount) {
        typerCount.textContent = `${String(roleIdx + 1).padStart(2, '0')} / ${String(ROLES.length).padStart(2, '0')}`;
      }
    }

    function typeStep() {
      const currentRole = ROLES[roleIdx];

      if (!isDeleting) {
        charIdx++;
        typerText.textContent = currentRole.slice(0, charIdx);
        if (charIdx % 4 === 0) playSound('click');

        if (charIdx === currentRole.length) {
          isDeleting = true;
          typeTimer = setTimeout(typeStep, 2300);
          return;
        }
        const speed = 65 + Math.random() * 45;
        typeTimer = setTimeout(typeStep, speed);
      } else {
        charIdx--;
        typerText.textContent = currentRole.slice(0, charIdx);

        if (charIdx === 0) {
          isDeleting = false;
          roleIdx = (roleIdx + 1) % ROLES.length;
          updateCount();
          typeTimer = setTimeout(typeStep, 380);
          return;
        }
        typeTimer = setTimeout(typeStep, 32);
      }
    }

    function skipToNext() {
      clearTimeout(typeTimer);
      playSound('click');
      roleIdx = (roleIdx + 1) % ROLES.length;
      updateCount();
      isDeleting = false;
      charIdx = 0;
      typerText.textContent = '';
      typeStep();
    }

    updateCount();
    typeTimer = setTimeout(typeStep, 700);

    if (typerBadge) {
      typerBadge.addEventListener('click', skipToNext);
      typerBadge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skipToNext();
        }
      });
    }
    if (typerSkip) {
      typerSkip.addEventListener('click', skipToNext);
    }
  }
  initTypewriter();

  /* ==========================================================================
     05. FLIP CALENDAR (MECHANICAL DESK CALENDAR DESIGN)
     ========================================================================== */
  const cal = $('#cal');
  if (cal) {
    const SKILLS = [
      'Operations Leader',
      'FMCG Distribution',
      'Global Sourcing',
      'Supply Chain Analytics',
      'Product Systems'
    ];
    let curIdx = 0;
    const n = SKILLS.length;
    const body = $('.cal__body', cal);
    const leaf = $('.cal__leaf', cal);
    const under = $('[data-under]', cal);
    const face = $('.cal__face', cal);
    const measure = $('.cal__measure', cal);
    const rings = $('.cal__rings', cal);
    let flipping = false;

    function paint(page, idx) {
      const wEl = $('.cal__word', page);
      const nEl = $('.cal__no', page);
      if (wEl) wEl.textContent = SKILLS[idx];
      if (nEl) nEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    }

    paint(face, 0);
    paint(under, 1);

    // Dynamically fit width and inject spiral rings & punch holes
    function fitCal() {
      if (!measure || !body) return;
      cal.style.fontSize = '';
      const baseFs = parseFloat(getComputedStyle(cal).fontSize) || 28;
      const heroLeft = cal.closest('.hero__left');
      const availW = Math.min(window.innerWidth * 0.88, (heroLeft ? heroLeft.clientWidth : 600) - 20);

      let maxW = 0;
      for (const w of SKILLS) {
        measure.textContent = w;
        maxW = Math.max(maxW, measure.getBoundingClientRect().width);
      }

      const neededW = maxW + (baseFs * 1.5);
      if (neededW > availW && availW > 100) {
        const scale = availW / neededW;
        cal.style.fontSize = `${Math.max(14, (baseFs * scale)).toFixed(1)}px`;
      }

      const curFs = parseFloat(getComputedStyle(cal).fontSize) || baseFs;
      const wEm = (maxW / curFs) + 1.35;
      body.style.setProperty('--cal-w', `${wEm.toFixed(3)}em`);
      cal.style.setProperty('--cal-w', `${wEm.toFixed(3)}em`);

      const count = Math.max(5, Math.round((wEm - 0.6) / 0.75) + 1);
      if (rings) rings.innerHTML = '<i></i>'.repeat(count);
      cal.querySelectorAll('.cal__holes').forEach(h => {
        h.innerHTML = '<i></i>'.repeat(count);
      });
    }

    fitCal();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitCal);
    }
    window.addEventListener('resize', fitCal);

    function nextFlip() {
      if (flipping) return;
      flipping = true;
      playSound('flip');
      const nextIdx = (curIdx + 1) % n;
      paint(under, nextIdx);

      cal.classList.add('flipping');
      setTimeout(() => {
        curIdx = nextIdx;
        paint(face, curIdx);
        cal.classList.remove('flipping');
        paint(under, (curIdx + 1) % n);
        flipping = false;
      }, 650);
    }

    let calTimer = setInterval(nextFlip, 3200);
    cal.addEventListener('click', () => {
      clearInterval(calTimer);
      nextFlip();
      calTimer = setInterval(nextFlip, 3500);
    });
  }

  /* ==========================================================================
     06. 3D ARCHITECTURAL DOORS & DYNAMIC HUD
     ========================================================================== */
  const doors = $$('.doors__row .unit');
  const dinfo = $('#dinfo');
  const dinfoH = $('.dinfo__h', dinfo);
  const dinfoT = $('.dinfo__t', dinfo);
  const dinfoP = $('.dinfo__p', dinfo);
  const doorDots = $$('.doors__dots i');

  const DOOR_DATA = [
    {
      title: 'Making a Beat Work Harder',
      territory: 'CavinKare · Mumbai General Trade (Andheri to Bandra)',
      points: [
        '50+ Active General Trade & Supermarket Accounts',
        '+20% Month 1 Retailer Network Expansion',
        '+30% MoM Focus Personal Care Category Lift'
      ]
    },
    {
      title: 'From Supplier to Shelf',
      territory: 'Only Solar · 0-to-1 Commercial Import Venture',
      points: [
        'Direct Overseas Factory RFQs & QA Contract Terms',
        'Customs Clearance, Port Handling & Ocean Logistics',
        'Unit-Level Landed-Cost Architecture & Channel Pricing'
      ]
    },
    {
      title: 'See the Whole Flow',
      territory: 'Supply Chain Decision Analytics · Power BI & SQL',
      points: [
        'Multi-Echelon Inventory & Lead-Time Variance Models',
        'Economic Order Quantity (EOQ) & Safety Stock Tuning',
        'Structured Exception Triage & Service Level SLAs'
      ]
    },
    {
      title: 'Exceptions First',
      territory: 'Product Systems & Tech Interop · B.Tech CS + MBA',
      points: [
        'Warehouse Management System (WMS) & ERP Logic',
        'Relational Database Schemas & Automated Replenishment',
        'Bridging Frontline Execution with Software Engineering'
      ]
    }
  ];

  let doorGraceTimer = null;

  function closeAllDoors() {
    if (doorGraceTimer) {
      clearTimeout(doorGraceTimer);
      doorGraceTimer = null;
    }
    doors.forEach(u => u.classList.remove('on'));
    doorDots.forEach(dot => dot.classList.remove('on'));
  }

  function scheduleDoorClose(delayMs = 2000) {
    if (doorGraceTimer) clearTimeout(doorGraceTimer);
    doorGraceTimer = setTimeout(() => {
      closeAllDoors();
    }, delayMs);
  }

  function openDoor(idx) {
    if (doorGraceTimer) {
      clearTimeout(doorGraceTimer);
      doorGraceTimer = null;
    }

    if (idx < 0 || idx >= doors.length) {
      closeAllDoors();
      return;
    }

    doors.forEach((u, k) => u.classList.toggle('on', k === idx));
    doorDots.forEach((dot, k) => dot.classList.toggle('on', k === idx));

    const data = DOOR_DATA[idx];
    if (data && dinfoH && dinfoT && dinfoP) {
      dinfoH.textContent = data.title;
      dinfoT.textContent = data.territory;
      dinfoP.innerHTML = data.points.map(pt => `<li>${pt}</li>`).join('');
    }
  }

  doors.forEach((unit, idx) => {
    unit.addEventListener('mouseenter', () => {
      // Stays open while cursor is on it!
      openDoor(idx);
    });
    unit.addEventListener('mouseleave', () => {
      // Stays open for 2 seconds after cursor leaves, then closes!
      scheduleDoorClose(2000);
    });
    unit.addEventListener('focusin', () => {
      openDoor(idx);
    });
    unit.addEventListener('focusout', () => {
      scheduleDoorClose(2000);
    });
    unit.addEventListener('click', () => {
      closeAllDoors();
      openChamber(idx);
    });
  });

  const doorsRow = $('#doorsRow');
  if (doorsRow) {
    doorsRow.addEventListener('mouseleave', () => {
      scheduleDoorClose(2000);
    });
  }

  /* ==========================================================================
     07. DEEP DOMAIN VAULT MODAL (CHAMBER DIALOG)
     ========================================================================== */
  const chamberModal = $('#chamberModal');
  const chamberTitle = $('#chamberTitle');
  const chamberLead = $('#chamberLead');
  const chamberTag = $('#chamberTag');
  const chamberBody = $('#chamberBody');
  const chamberClose = $('#chamberClose');
  const chamberDone = $('#chamberDone');

  const CHAMBER_DETAILS = [
    {
      tag: '01 · FIELD OPERATIONS',
      title: 'Frontline FMCG Retail Distribution (CavinKare)',
      lead: 'Hands-on territory execution across Mumbai’s dense retail landscape: 50+ General Trade grocers, local supermarkets, and distribution points between Andheri and Bandra.',
      sections: [
        {
          h: 'Territory Coverage & Route Beat Optimization',
          p: 'Managed daily order booking and inventory replenishment schedules. Designed structured weekly beat routes across high-traffic retail pockets (SV Road, Linking Road, Hill Road, Lokhandwala) to maximize distributor drop efficiency.',
          stats: [
            { stat: '50+', label: 'Active Retail Accounts' },
            { stat: '+20%', label: 'Month 1 Onboarding Lift' },
            { stat: '4 Days', label: 'Order-to-Delivery SLA' }
          ]
        },
        {
          h: 'Merchandising & Focus Category Sales Acceleration',
          p: 'Enforced planogram compliance on prime eye-level shelves, audited competitor stockouts, and negotiated high-visibility primary placements. Leveraged targeted trade schemes to drive a <strong>+30% MoM sales lift</strong> in focus personal-care categories.',
          stats: [
            { stat: '+30%', label: 'MoM Focus Category Growth' },
            { stat: '96%', label: 'Planogram Compliance' },
            { stat: '100%', label: 'Verified Trade Schemes' }
          ]
        }
      ]
    },
    {
      tag: '02 · ENTREPRENEURSHIP',
      title: 'Global Sourcing & Supply Chain Economics (Only Solar)',
      lead: 'Co-founded and spearheaded an import-export venture importing commercial solar lighting hardware, handling direct international manufacturer negotiations, landed-cost modeling, and B2B distributor networks.',
      sections: [
        {
          h: 'Cross-Border Procurement & Supplier Negotiations',
          p: 'Led end-to-end supplier discovery and RFQ bidding across overseas manufacturers in China. Formulated contract terms, sample testing QA protocols, and container freight terms (FOB/CIF).',
          stats: [
            { stat: '0-to-1', label: 'Commercial Build' },
            { stat: '100%', label: 'Customs & Port Compliance' },
            { stat: '18%', label: 'Procurement Savings' }
          ]
        },
        {
          h: 'Landed-Cost Financial Architecture & Channel Pricing',
          p: 'Developed unit-level economic formulas incorporating ocean freight, port container handling, basic customs duty, IGST, inland transport, and distributor margins to protect gross profitability.',
          stats: [
            { stat: '22%', label: 'Distributor Gross Margin' },
            { stat: 'FOB to Door', label: 'Complete Unit Economics' },
            { stat: 'B2B', label: 'Institutional Distribution' }
          ]
        }
      ]
    },
    {
      tag: '03 · DECISION SYSTEMS',
      title: 'Supply Chain Decision Analytics & Optimization',
      lead: 'Connecting operational frontline reality with quantitative rigor: Power BI dashboards, SQL databases, safety stock algorithms, and automated exception queues.',
      sections: [
        {
          h: 'Inventory Theory & Multi-Echelon Replenishment',
          p: 'Applying classical inventory formulations: Economic Order Quantity (EOQ), reorder point modeling under lead-time variance, and service-level safety stocks to balance working capital against stockout risks.',
          stats: [
            { stat: 'Simplilearn', label: 'Power BI Certified' },
            { stat: 'Udemy', label: 'SQL Analytics Certified' },
            { stat: '99%', label: 'Target Service Level' }
          ]
        },
        {
          h: 'Operational Exception Management',
          p: 'Replacing chaotic manual spreadsheets with structured exception queues. Categorizing stockout alerts, pricing disputes, credit holds, and transit delays into prioritized triage workflows.',
          stats: [
            { stat: '<2 Hrs', label: 'Exception Triage SLA' },
            { stat: 'Automated', label: 'Threshold Triggers' },
            { stat: 'Audit-Ready', label: 'Complete Data Trail' }
          ]
        }
      ]
    },
    {
      tag: '04 · SYSTEMS SYNTHESIS',
      title: 'Systems Architecture & Enterprise Interoperability',
      lead: 'Leveraging a B.Tech in Computer Science (75.8%) alongside an MBA in Operations to bridge engineering teams and supply chain operators.',
      sections: [
        {
          h: 'Algorithmic Systems & Data Pipelines',
          p: 'Engineering automated Python scripts to parse sales order records, sync inventory across warehouse nodes, and compute supplier replenishment schedules without manual data entry.',
          stats: [
            { stat: 'Python & SQL', label: 'Core Technical Stack' },
            { stat: '75.8%', label: 'B.Tech CSE Aggregate' },
            { stat: 'Zero-Waste', label: 'Automated Pipeline Sync' }
          ]
        },
        {
          h: 'Warehouse Management & ERP Interop',
          p: 'Designing relational schemas, API payloads, and database constraints for modern logistics software: from purchase order generation to dispatch barcoding and delivery reconciliation.',
          stats: [
            { stat: 'Schema Design', label: 'Relational Database Eng' },
            { stat: 'APM Ready', label: 'Product & Tech Synthesis' },
            { stat: 'End-to-End', label: 'Data & Physical Flow' }
          ]
        }
      ]
    }
  ];

  function openChamber(idx) {
    playSound('door');
    const data = CHAMBER_DETAILS[idx] || CHAMBER_DETAILS[0];
    if (chamberTag) chamberTag.textContent = data.tag;
    if (chamberTitle) chamberTitle.textContent = data.title;
    if (chamberLead) chamberLead.textContent = data.lead;

    if (chamberBody) {
      chamberBody.innerHTML = data.sections.map(sec => `
        <div class="chamber-section">
          <h3 class="cs__h">${sec.h}</h3>
          <p class="cs__p">${sec.p}</p>
          <div class="cs__grid">
            ${sec.stats.map(s => `
              <div class="cs__card">
                <span class="cs__stat">${s.stat}</span>
                <span class="cs__label">${s.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
    }

    if (chamberModal) {
      chamberModal.showModal();
    }
  }

  if (chamberClose) chamberClose.addEventListener('click', () => chamberModal.close());
  if (chamberDone) chamberDone.addEventListener('click', () => chamberModal.close());
  if (chamberModal) {
    chamberModal.addEventListener('click', e => {
      if (e.target === chamberModal) {
        chamberModal.close();
      }
    });
  }

  /* ==========================================================================
     08. DECISION STUDIO: LANDED COST CALCULATOR
     ========================================================================== */
  const fobInput = $('#fobInput');
  const freightInput = $('#freightInput');
  const dutyInput = $('#dutyInput');
  const marginInput = $('#marginInput');

  const fobVal = $('#fobVal');
  const freightVal = $('#freightVal');
  const dutyVal = $('#dutyVal');
  const marginVal = $('#marginVal');

  const dspVal = $('#dspVal');
  const landedVal = $('#landedVal');
  const profitVal = $('#profitVal');
  const beVal = $('#beVal');
  const landedBar = $('#landedBar');
  const profitBar = $('#profitBar');
  const calcInsight = $('#calcInsight');

  const USD_INR = 84.50;
  const PORT_HANDLING_INR = 180;
  const INLAND_FREIGHT_INR = 120;

  function updateSliderFill(input) {
    if (!input) return;
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty('--val', `${pct}%`);
  }

  function updateCostCalc() {
    if (!fobInput) return;
    const fob = parseFloat(fobInput.value) || 28;
    const freight = parseFloat(freightInput.value) || 4.5;
    const dutyPct = parseFloat(dutyInput.value) || 12.5;
    const marginPct = parseFloat(marginInput.value) || 22;

    [fobInput, freightInput, dutyInput, marginInput].forEach(updateSliderFill);

    if (fobVal) fobVal.textContent = `$${fob.toFixed(2)}`;
    if (freightVal) freightVal.textContent = `$${freight.toFixed(2)}`;
    if (dutyVal) dutyVal.textContent = `${dutyPct.toFixed(1)}%`;
    if (marginVal) marginVal.textContent = `${marginPct.toFixed(0)}%`;

    const cifUSD = fob + freight;
    const cifINR = cifUSD * USD_INR;
    const dutyINR = cifINR * (dutyPct / 100);
    const totalLandedINR = Math.round(cifINR + dutyINR + PORT_HANDLING_INR + INLAND_FREIGHT_INR);

    const marginDecimal = marginPct / 100;
    const targetDSPINR = Math.round(totalLandedINR / Math.max(0.01, 1 - marginDecimal));
    const grossProfitINR = targetDSPINR - totalLandedINR;
    const breakevenUnits = Math.round(100000 / Math.max(1, grossProfitINR));

    if (dspVal) dspVal.textContent = `₹${targetDSPINR.toLocaleString('en-IN')}`;
    if (landedVal) landedVal.textContent = `₹${totalLandedINR.toLocaleString('en-IN')}`;
    if (profitVal) profitVal.textContent = `₹${grossProfitINR.toLocaleString('en-IN')}`;
    if (beVal) beVal.textContent = `${breakevenUnits} units`;

    const landedPct = Math.min(100, Math.round((totalLandedINR / targetDSPINR) * 100));
    const profitBarPct = 100 - landedPct;
    if (landedBar) landedBar.style.width = `${landedPct}%`;
    if (profitBar) profitBar.style.width = `${profitBarPct}%`;

    if (calcInsight) {
      if (marginPct >= 30) {
        calcInsight.textContent = `High margin tier (${marginPct}%): Ensure premium positioning or institutional RFP specifications to sustain dealer demand above ₹${targetDSPINR.toLocaleString('en-IN')}.`;
      } else if (fob > 80) {
        calcInsight.textContent = `High-spec hardware unit: Breakeven reached at only ${breakevenUnits} units per month, minimizing warehouse carrying cost exposure.`;
      } else {
        calcInsight.textContent = `Balanced commercial model: ₹${targetDSPINR.toLocaleString('en-IN')} retail price maintains healthy channel traction while yielding ₹${grossProfitINR.toLocaleString('en-IN')} net contribution per box.`;
      }
    }
  }

  [fobInput, freightInput, dutyInput, marginInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updateCostCalc);
  });
  updateCostCalc();

  /* ==========================================================================
     09. DECISION STUDIO: 3-WAY TAB SWITCHER & BEAT DISPATCH ENGINE
     ========================================================================== */
  const tabCost = $('#tab-cost');
  const tabExc = $('#tab-exc');
  const tabBeat = $('#tab-beat');
  const panelCost = $('#panel-cost');
  const panelExc = $('#panel-exc');
  const panelBeat = $('#panel-beat');

  function switchStudioTab(targetTab, targetPanel) {
    [tabCost, tabExc, tabBeat].forEach(t => {
      if (t) {
        const isActive = t === targetTab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    });
    [panelCost, panelExc, panelBeat].forEach(p => {
      if (p) {
        const isActive = p === targetPanel;
        p.classList.toggle('active', isActive);
        p.hidden = !isActive;
      }
    });
    playSound('click');
    if (targetTab === tabBeat) {
      setTimeout(initBeatSimulator, 60);
    }
  }

  if (tabCost) tabCost.addEventListener('click', () => switchStudioTab(tabCost, panelCost));
  if (tabExc) tabExc.addEventListener('click', () => switchStudioTab(tabExc, panelExc));
  if (tabBeat) tabBeat.addEventListener('click', () => switchStudioTab(tabBeat, panelBeat));

  // Connect capability matrix chips to live decision surfaces (Neha Yadav inspired)
  $$('.stack-chip[data-tab-hint]').forEach(chip => {
    chip.addEventListener('click', () => {
      const hint = chip.dataset.tabHint;
      if (hint === 'tab-cost') switchStudioTab(tabCost, panelCost);
      else if (hint === 'tab-exc') switchStudioTab(tabExc, panelExc);
      else if (hint === 'tab-beat') switchStudioTab(tabBeat, panelBeat);
      const studioTabs = $('.studio__tabs');
      if (studioTabs) {
        studioTabs.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  /* --- MUMBAI ROUTE BEAT SIMULATOR ENGINE --- */
  let beatInitialized = false;

  function initBeatSimulator() {
    const canvas = $('#beatCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = rect.width || 600;
    const H = 320;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    let activeZone = 'andheri';
    const corridorCards = $$('.corridor-card');
    corridorCards.forEach(card => {
      card.addEventListener('click', () => {
        corridorCards.forEach(c => {
          c.classList.remove('active');
          const st = c.querySelector('.corr-status');
          if (st) { st.textContent = 'STANDBY'; st.classList.remove('live'); }
        });
        card.classList.add('active');
        const st = card.querySelector('.corr-status');
        if (st) { st.textContent = '● ACTIVE BEAT'; st.classList.add('live'); }
        activeZone = card.dataset.corr;
        playSound('click');
      });
    });

    const hub = { x: W * 0.15, y: H * 0.5, name: 'Andheri Central Hub' };
    const zones = {
      andheri: {
        color: '#E07A5F',
        nodes: [
          { x: W * 0.32, y: H * 0.35, name: 'Lokhandwala Grocers', dropped: false },
          { x: W * 0.45, y: H * 0.28, name: '4 Bungalows Mart', dropped: false },
          { x: W * 0.62, y: H * 0.38, name: 'Versova Link Kirana', dropped: false },
          { x: W * 0.78, y: H * 0.32, name: 'Seven Bungalows Retail', dropped: false }
        ]
      },
      bandra: {
        color: '#4A90E2',
        nodes: [
          { x: W * 0.35, y: H * 0.65, name: 'Linking Road Store', dropped: false },
          { x: W * 0.52, y: H * 0.72, name: 'Hill Road Provision', dropped: false },
          { x: W * 0.70, y: H * 0.62, name: 'Pali Naka Superette', dropped: false },
          { x: W * 0.85, y: H * 0.70, name: 'Turner Road Retailers', dropped: false }
        ]
      },
      khar: {
        color: '#EBB338',
        nodes: [
          { x: W * 0.38, y: H * 0.48, name: 'SV Road Khar Mart', dropped: false },
          { x: W * 0.58, y: H * 0.52, name: 'Santacruz West Depot', dropped: false },
          { x: W * 0.76, y: H * 0.50, name: 'Milan Subway Grocers', dropped: false }
        ]
      },
      juhu: {
        color: '#4CAF50',
        nodes: [
          { x: W * 0.40, y: H * 0.20, name: 'Tara Road Coastal Stores', dropped: false },
          { x: W * 0.65, y: H * 0.18, name: 'JVPD Supermarket', dropped: false }
        ]
      }
    };

    let vans = [
      { id: 1, x: hub.x, y: hub.y, targetIdx: 0, progress: 0, zone: 'andheri', speed: 0.008 },
      { id: 2, x: hub.x, y: hub.y, targetIdx: 0, progress: 0, zone: 'bandra', speed: 0.007 },
      { id: 3, x: hub.x, y: hub.y, targetIdx: 0, progress: 0, zone: 'khar', speed: 0.009 }
    ];

    let isRunning = false;
    let completedDrops = 0;

    function renderBeat(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 36) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 36) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Draw route spines
      Object.keys(zones).forEach(zKey => {
        const z = zones[zKey];
        const isSel = zKey === activeZone;
        ctx.beginPath();
        ctx.moveTo(hub.x, hub.y);
        z.nodes.forEach(nd => ctx.lineTo(nd.x, nd.y));
        ctx.strokeStyle = isSel ? z.color : 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = isSel ? 2.5 : 1.2;
        ctx.setLineDash(isSel ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw Hub
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#E07A5F';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '600 10px var(--mono)';
      ctx.fillText('DISPATCH HUB', hub.x - 35, hub.y - 14);

      // Draw Store Nodes
      Object.keys(zones).forEach(zKey => {
        const z = zones[zKey];
        const isSel = zKey === activeZone;
        z.nodes.forEach((nd, i) => {
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, nd.dropped ? 7 : 5, 0, Math.PI * 2);
          ctx.fillStyle = nd.dropped ? '#4CAF50' : (isSel ? z.color : 'rgba(255, 255, 255, 0.35)');
          ctx.fill();

          if (isSel || nd.dropped) {
            ctx.strokeStyle = nd.dropped ? '#4CAF50' : z.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(nd.x, nd.y, 9 + Math.sin(now * 0.005 + i) * 2, 0, Math.PI * 2);
            ctx.stroke();
          }

          if (isSel) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = '500 9px var(--mono)';
            ctx.fillText(nd.name.split(' ')[0], nd.x - 12, nd.y + 16);
          }
        });
      });

      // Move delivery vans
      if (isRunning) {
        vans.forEach(van => {
          const z = zones[van.zone];
          if (!z) return;
          const target = z.nodes[van.targetIdx];
          if (!target) return;

          const startPt = van.targetIdx === 0 ? hub : z.nodes[van.targetIdx - 1];
          van.progress += van.speed;

          if (van.progress >= 1) {
            van.progress = 0;
            target.dropped = true;
            completedDrops++;
            playSound('tick');

            const cartonsEl = $('#beatCartons');
            if (cartonsEl) cartonsEl.textContent = `${142 + completedDrops * 3} Cases`;

            if (van.targetIdx < z.nodes.length - 1) {
              van.targetIdx++;
            } else {
              van.targetIdx = 0;
            }
          }

          van.x = startPt.x + (target.x - startPt.x) * van.progress;
          van.y = startPt.y + (target.y - startPt.y) * van.progress;

          ctx.beginPath();
          ctx.arc(van.x, van.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = z.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(van.x, van.y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.stroke();
        });
      }

      requestAnimationFrame(renderBeat);
    }

    if (!beatInitialized) {
      beatInitialized = true;
      requestAnimationFrame(renderBeat);

      const runBtn = $('#runBeatBtn');
      const resetBtn = $('#resetBeatBtn');
      const vehiclesEl = $('#beatVehicles');
      const compEl = $('#beatCompliance');

      if (runBtn) {
        runBtn.addEventListener('click', () => {
          isRunning = true;
          playSound('door');
          const pillIn = runBtn.querySelector('.pill__in');
          if (pillIn) pillIn.textContent = '⚡ Beat In Transit...';
          runBtn.style.opacity = '0.85';
          if (vehiclesEl) vehiclesEl.textContent = '3 Vans Dispatched';
          if (compEl) compEl.textContent = '98.4% Syncing';
          showToast('08:00 AM FMCG Route Dispatched across 4 Mumbai Corridors!');
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          isRunning = false;
          completedDrops = 0;
          playSound('click');
          vans.forEach(v => { v.x = hub.x; v.y = hub.y; v.targetIdx = 0; v.progress = 0; });
          Object.keys(zones).forEach(k => zones[k].nodes.forEach(n => n.dropped = false));
          if (runBtn) {
            const pillIn = runBtn.querySelector('.pill__in');
            if (pillIn) pillIn.textContent = '▶ Run 08:00 AM Dispatch';
            runBtn.style.opacity = '1';
          }
          if (vehiclesEl) vehiclesEl.textContent = '3 Vans Active';
          const cartonsEl = $('#beatCartons');
          if (cartonsEl) cartonsEl.textContent = '142 Cases';
          if (compEl) compEl.textContent = '96.0% Verified';
          showToast('Corridor routes reset to baseline standby.');
        });
      }
    }
  }

  const qFilters = $$('.q-filter');
  const qCards = $$('.q-card');

  qFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      qFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sev = btn.dataset.sev;

      qCards.forEach(card => {
        if (sev === 'all' || card.classList.contains(sev)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  $$('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.q-card');
      const status = card.querySelector('.q-status');
      const badge = card.querySelector('.q-badge');

      btn.disabled = true;
      btn.textContent = 'Resolved ✓';
      btn.style.background = '#4CAF50';
      btn.style.color = '#fff';

      if (status) {
        status.textContent = 'Resolved & Logged into Beat SLA';
        status.style.color = '#4CAF50';
      }
      if (badge) {
        badge.className = 'q-badge resolved';
        badge.textContent = 'CLEARED';
      }
      showToast('Action executed and synchronized to beat dispatcher!');
    });
  });

  /* ==========================================================================
     10. STORY & TIMELINE ("Let's go back in time")
     ========================================================================== */
  const storySec = $('#about');
  if (storySec) {
    const list = $('.story__list', storySec);
    const chs = $$('.ch', list);
    const cols = $$('.dg__c', storySec);
    const when = $('.story__when', storySec);
    const count = $('.story__count', storySec);
    const dot = $('.story__dot', storySec);
    const barFill = $('#storyBarFill');
    const cvClock = $('.story__bg', storySec);
    const ctxClock = cvClock ? cvClock.getContext('2d') : null;
    let shownIdx = -1;

    function setYearDigits(yearStr) {
      const digits = String(yearStr).split('');
      digits.forEach((d, k) => {
        if (cols[k]) cols[k].style.setProperty('--d', d);
      });
    }

    const ERA_TITLES = [
      'MBA, Operations & Logistics (Major)',
      'Sales Representative (CavinKare FMCG)',
      'Co-Founder & Business Head (Only Solar)',
      'B.Tech Computer Science & Engineering'
    ];

    function activateChapter(idx) {
      if (idx === shownIdx || !chs[idx]) return;
      const isInitial = shownIdx === -1;
      shownIdx = idx;

      chs.forEach((c, k) => c.classList.toggle('on', k === idx));
      const targetCh = chs[idx];
      setYearDigits(targetCh.dataset.y);
      if (when) when.textContent = targetCh.dataset.when;
      if (count) count.textContent = String(idx + 1).padStart(2, '0');
      if (barFill) barFill.style.width = `${((idx + 1) / chs.length) * 100}%`;
      const eraTitle = $('#chronoEraTitle');
      const eraIdx = $('#chronoEraIdx');
      if (eraIdx) eraIdx.textContent = `${String(idx + 1).padStart(2, '0')} / 04`;
      if (eraTitle && ERA_TITLES[idx]) {
        eraTitle.style.opacity = '0';
        setTimeout(() => {
          eraTitle.textContent = ERA_TITLES[idx];
          eraTitle.style.opacity = '1';
        }, 150);
      }

      // Synchronize interactive era navigation pills
      const eraPills = $$('.chrono__pill', storySec);
      eraPills.forEach((p, k) => p.classList.toggle('on', k === idx));

      if (!isInitial) {
        playSound('tick');
        const storyYr = $('.story__yr', storySec);
        if (storyYr) {
          storyYr.classList.remove('pulse');
          void storyYr.offsetWidth;
          storyYr.classList.add('pulse');
        }
      }

      if (dot) {
        const chTop = targetCh.offsetTop;
        dot.style.top = `${chTop + 24}px`;
      }
    }

    let storyScrollProgress = 0;
    let targetScrollProgress = 0;

    function checkStoryScroll() {
      const mid = window.innerHeight * 0.5;
      let activeI = 0;
      chs.forEach((ch, i) => {
        const rect = ch.getBoundingClientRect();
        if (rect.top <= mid) {
          activeI = i;
        }
      });
      activateChapter(activeI);

      // Compute precise continuous progress through the timeline scrollytelling runway
      if (storySec) {
        const secRect = storySec.getBoundingClientRect();
        const startOffset = window.innerHeight * 0.3;
        const totalTravel = storySec.offsetHeight - window.innerHeight * 0.7;
        if (totalTravel > 0) {
          targetScrollProgress = Math.max(0, Math.min(1, (startOffset - secRect.top) / totalTravel));
        }
      }
    }
    window.addEventListener('scroll', checkStoryScroll, { passive: true });
    checkStoryScroll();

    // Interactive Era Quick-Pills Navigation
    const eraPills = $$('.chrono__pill', storySec);
    eraPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const era = parseInt(pill.dataset.era, 10);
        if (chs[era]) {
          chs[era].scrollIntoView({ behavior: 'smooth', block: 'center' });
          activateChapter(era);
          playSound('tick');
        }
      });
    });

    // Precision Swiss Horology Chronometer Engine & Interactive Dial
    if (cvClock && ctxClock && !isReduced) {
      let W = 0, H = 0, dpr = 1;
      const dialCircle = $('#chronoDial') || cvClock.parentElement;

      function resizeClock() {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = cvClock.clientWidth; H = cvClock.clientHeight;
        cvClock.width = W * dpr; cvClock.height = H * dpr;
      }
      resizeClock();
      window.addEventListener('resize', resizeClock);

      let currentSweepAngle = -Math.PI / 2;
      let isDraggingDial = false;
      let hoveredEra = -1;

      // Era Milestones: 12 o'clock = 2026, 3 o'clock = 2025, 6 o'clock = 2024, 9 o'clock = 2020
      const eraAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
      const eraLabels = ["'26", "'25", "'24", "'20"];

      function seekToProgress(progress) {
        if (!storySec) return;
        const storyTop = storySec.offsetTop;
        const totalTravel = storySec.offsetHeight - window.innerHeight * 0.7;
        const targetY = storyTop - window.innerHeight * 0.3 + progress * totalTravel;
        window.scrollTo({ top: targetY, behavior: 'auto' });
      }

      function getAngleAndDist(e) {
        const rect = cvClock.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        const ang = Math.atan2(y, x);
        const dist = Math.hypot(x, y);
        return { ang, dist };
      }

      function handleDialPointer(e) {
        const { ang } = getAngleAndDist(e);
        // Map angle from -PI/2 (top, 0) clockwise to +PI (left, 1) across 270 degrees
        let norm = ang + Math.PI / 2;
        if (norm < 0) norm += Math.PI * 2;
        const maxSweep = Math.PI * 1.5;
        const progress = Math.max(0, Math.min(1, norm / maxSweep));
        seekToProgress(progress);
      }

      if (dialCircle) {
        dialCircle.addEventListener('pointerdown', e => {
          isDraggingDial = true;
          dialCircle.classList.add('is-scrubbing');
          handleDialPointer(e);
          playSound('tick');
          window.addEventListener('pointermove', onDialPointerMove);
          window.addEventListener('pointerup', onDialPointerUp);
          window.addEventListener('pointercancel', onDialPointerUp);
        });

        function onDialPointerMove(e) {
          if (!isDraggingDial) return;
          handleDialPointer(e);
        }

        function onDialPointerUp() {
          isDraggingDial = false;
          dialCircle.classList.remove('is-scrubbing');
          window.removeEventListener('pointermove', onDialPointerMove);
          window.removeEventListener('pointerup', onDialPointerUp);
          window.removeEventListener('pointercancel', onDialPointerUp);
        }

        dialCircle.addEventListener('pointermove', e => {
          if (isDraggingDial) return;
          const { ang, dist } = getAngleAndDist(e);
          const R_bezel = Math.min(W, H) * 0.46;
          // Check proximity to the 4 milestone nodes
          let foundEra = -1;
          eraAngles.forEach((a, idx) => {
            const nx = Math.cos(a) * (R_bezel - 12);
            const ny = Math.sin(a) * (R_bezel - 12);
            const rect = cvClock.getBoundingClientRect();
            const px = e.clientX - (rect.left + rect.width / 2);
            const py = e.clientY - (rect.top + rect.height / 2);
            if (Math.hypot(px - nx, py - ny) <= 22) {
              foundEra = idx;
            }
          });
          hoveredEra = foundEra;

          if (hoveredEra !== -1) {
            dialCircle.style.cursor = 'pointer';
            if (cursorLabel) cursorLabel.textContent = `Seek ${eraLabels[hoveredEra]}`;
          } else if (dist >= 75 && dist <= R_bezel + 15) {
            dialCircle.style.cursor = 'grab';
            if (cursorLabel) cursorLabel.textContent = 'Scrub';
          } else {
            dialCircle.style.cursor = 'default';
          }
        });

        dialCircle.addEventListener('pointerleave', () => {
          hoveredEra = -1;
          if (dialCircle) dialCircle.style.cursor = 'grab';
        });

        dialCircle.addEventListener('click', e => {
          const { ang, dist } = getAngleAndDist(e);
          // If clicked near a milestone or outer dial sector, jump to that era
          if (dist >= 60) {
            let norm = ang + Math.PI / 2;
            if (norm < 0) norm += Math.PI * 2;
            const frac = norm / (Math.PI * 1.5);
            let targetEra = 0;
            if (frac > 0.16 && frac <= 0.5) targetEra = 1;
            else if (frac > 0.5 && frac <= 0.83) targetEra = 2;
            else if (frac > 0.83) targetEra = 3;

            if (chs[targetEra]) {
              chs[targetEra].scrollIntoView({ behavior: 'smooth', block: 'center' });
              activateChapter(targetEra);
              playSound('tick');
            }
          }
        });
      }

      function renderClock() {
        ctxClock.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctxClock.clearRect(0, 0, W, H);

        // Smoothly interpolate scroll progress for liquid horological sweep pointer physics
        storyScrollProgress += (targetScrollProgress - storyScrollProgress) * 0.14;

        const cx = W * 0.5;
        const cy = H * 0.5;
        const isDark = root.dataset.mode === 'dark';

        const R_bezel = Math.min(W, H) * 0.46;
        const R_railOuter = R_bezel - 8;
        const R_railInner = R_railOuter - 14;
        const R_centerDisc = 82;

        // 1. Soft atmospheric center glow
        const glowColor = isDark ? '240, 154, 91' : '229, 138, 78';
        const centerGlow = ctxClock.createRadialGradient(cx, cy, 0, cx, cy, R_bezel * 1.15);
        centerGlow.addColorStop(0, `rgba(${glowColor}, ${isDark ? 0.22 : 0.14})`);
        centerGlow.addColorStop(0.6, `rgba(${glowColor}, ${isDark ? 0.06 : 0.03})`);
        centerGlow.addColorStop(1, `rgba(${glowColor}, 0)`);
        ctxClock.fillStyle = centerGlow;
        ctxClock.beginPath();
        ctxClock.arc(cx, cy, R_bezel * 1.15, 0, Math.PI * 2);
        ctxClock.fill();

        // 2. Machined Fluted / Knurled Outer Bezel Ring (120 precision micro-teeth)
        const bezelStroke = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)';
        const bezelFill = isDark ? 'rgba(30, 26, 24, 0.5)' : 'rgba(245, 240, 235, 0.5)';
        ctxClock.beginPath();
        ctxClock.arc(cx, cy, R_bezel, 0, Math.PI * 2);
        ctxClock.fillStyle = bezelFill;
        ctxClock.fill();
        ctxClock.strokeStyle = bezelStroke;
        ctxClock.lineWidth = 1;
        ctxClock.stroke();

        // Fluted micro-notches (watchmaker knurling)
        const knurlCount = 120;
        ctxClock.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)';
        ctxClock.lineWidth = 0.75;
        for (let k = 0; k < knurlCount; k++) {
          const a = (k / knurlCount) * Math.PI * 2;
          const x1 = cx + Math.cos(a) * (R_bezel - 3.5);
          const y1 = cy + Math.sin(a) * (R_bezel - 3.5);
          const x2 = cx + Math.cos(a) * R_bezel;
          const y2 = cy + Math.sin(a) * R_bezel;
          ctxClock.beginPath();
          ctxClock.moveTo(x1, y1);
          ctxClock.lineTo(x2, y2);
          ctxClock.stroke();
        }

        // 3. Railway Minute Track (Chemin de Fer)
        ctxClock.beginPath();
        ctxClock.arc(cx, cy, R_railOuter, 0, Math.PI * 2);
        ctxClock.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.18)';
        ctxClock.lineWidth = 1;
        ctxClock.stroke();

        ctxClock.beginPath();
        ctxClock.arc(cx, cy, R_railInner, 0, Math.PI * 2);
        ctxClock.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
        ctxClock.lineWidth = 1;
        ctxClock.stroke();

        // 60 Precision Minute & Telemetry Calibration Ticks
        const accentColor = isDark ? 'rgba(240, 154, 91, 0.95)' : 'rgba(215, 110, 50, 0.95)';
        const accentSoft = isDark ? 'rgba(240, 154, 91, 0.4)' : 'rgba(215, 110, 50, 0.35)';
        const tickBase = isDark ? 'rgba(240, 235, 230, 0.65)' : 'rgba(40, 35, 30, 0.6)';
        const tickMuted = isDark ? 'rgba(240, 235, 230, 0.22)' : 'rgba(40, 35, 30, 0.2)';

        for (let t = 0; t < 60; t++) {
          const a = (t / 60) * Math.PI * 2;
          const isCardinal = (t % 15 === 0);
          const isFive = (t % 5 === 0);

          let r1 = R_railInner;
          let r2 = R_railOuter;
          let w = 0.8;
          let col = tickMuted;

          if (isCardinal) {
            r1 = R_railInner - 2;
            r2 = R_railOuter + 2;
            w = 2.2;
            col = accentColor;
          } else if (isFive) {
            w = 1.4;
            col = tickBase;
          }

          ctxClock.beginPath();
          ctxClock.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          ctxClock.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
          ctxClock.strokeStyle = col;
          ctxClock.lineWidth = w;
          ctxClock.stroke();
        }

        // 4. Living Automatic Movement: Sub-Seconds Escapement Satellite
        // Orbiting at 1 revolution per 60 seconds
        const subSecAngle = ((Date.now() % 60000) / 60000) * Math.PI * 2 - Math.PI / 2;
        const R_orbit = (R_railInner + R_centerDisc) * 0.5;
        
        ctxClock.save();
        ctxClock.beginPath();
        ctxClock.setLineDash([2, 5]);
        ctxClock.arc(cx, cy, R_orbit, 0, Math.PI * 2);
        ctxClock.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)';
        ctxClock.lineWidth = 1;
        ctxClock.stroke();
        ctxClock.restore();

        // Orbiting satellite jewel with comet glow
        const satX = cx + Math.cos(subSecAngle) * R_orbit;
        const satY = cy + Math.sin(subSecAngle) * R_orbit;
        ctxClock.beginPath();
        ctxClock.arc(satX, satY, 2.5, 0, Math.PI * 2);
        ctxClock.fillStyle = accentColor;
        ctxClock.fill();
        ctxClock.beginPath();
        ctxClock.arc(satX, satY, 6, 0, Math.PI * 2);
        ctxClock.strokeStyle = accentSoft;
        ctxClock.lineWidth = 1;
        ctxClock.stroke();

        // 5. Four Cardinal Era Milestone Nodes ('26, '25, '24, '20)
        const R_node = (R_railOuter + R_railInner) * 0.5;

        eraAngles.forEach((ang, idx) => {
          const nx = cx + Math.cos(ang) * R_node;
          const ny = cy + Math.sin(ang) * R_node;
          const isActive = (idx === shownIdx);
          const isHovered = (idx === hoveredEra);

          // Outer bearing collar
          ctxClock.beginPath();
          ctxClock.arc(nx, ny, isActive ? 8 : (isHovered ? 7 : 5.5), 0, Math.PI * 2);
          ctxClock.fillStyle = isDark ? '#1C1816' : '#FFFFFF';
          ctxClock.fill();
          ctxClock.strokeStyle = isActive ? accentColor : (isHovered ? accentSoft : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'));
          ctxClock.lineWidth = isActive ? 2 : 1.2;
          ctxClock.stroke();

          // Center jewel pip
          ctxClock.beginPath();
          ctxClock.arc(nx, ny, isActive ? 4 : (isHovered ? 3.5 : 2.5), 0, Math.PI * 2);
          ctxClock.fillStyle = isActive ? accentColor : (isHovered ? accentColor : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)'));
          ctxClock.fill();

          if (isActive) {
            // Luminous pulsing aura
            ctxClock.beginPath();
            ctxClock.arc(nx, ny, 13, 0, Math.PI * 2);
            ctxClock.strokeStyle = accentSoft;
            ctxClock.lineWidth = 1.2;
            ctxClock.stroke();
          }

          // Micro badge numeral outside the rail
          const labelDist = R_bezel + 11;
          const lx = cx + Math.cos(ang) * labelDist;
          const ly = cy + Math.sin(ang) * labelDist;

          ctxClock.save();
          ctxClock.fillStyle = isActive ? (isDark ? 'rgba(240, 154, 91, 0.18)' : 'rgba(229, 138, 78, 0.15)') : 'transparent';
          ctxClock.beginPath();
          if (ctxClock.roundRect) {
            ctxClock.roundRect(lx - 12, ly - 7, 24, 14, 4);
          } else {
            ctxClock.rect(lx - 12, ly - 7, 24, 14);
          }
          ctxClock.fill();
          if (isActive) {
            ctxClock.strokeStyle = accentSoft;
            ctxClock.lineWidth = 1;
            ctxClock.stroke();
          }

          ctxClock.font = `${isActive ? '800' : '600'} 10px 'DM Mono', monospace`;
          ctxClock.fillStyle = isActive ? accentColor : (isDark ? 'rgba(240, 235, 230, 0.7)' : 'rgba(40, 35, 30, 0.7)');
          ctxClock.textAlign = 'center';
          ctxClock.textBaseline = 'middle';
          ctxClock.fillText(eraLabels[idx], lx, ly);
          ctxClock.restore();
        });

        // 6. Main Chronograph Sweep Needle & Progress Trail Arc
        const targetAngle = -Math.PI / 2 + storyScrollProgress * (Math.PI * 1.5);
        currentSweepAngle += (targetAngle - currentSweepAngle) * 0.16;

        // Glowing trajectory arc
        if (currentSweepAngle > -Math.PI / 2) {
          ctxClock.beginPath();
          ctxClock.arc(cx, cy, R_node, -Math.PI / 2, currentSweepAngle, false);
          ctxClock.strokeStyle = accentColor;
          ctxClock.lineWidth = 2.8;
          ctxClock.lineCap = 'round';
          ctxClock.stroke();

          ctxClock.beginPath();
          ctxClock.arc(cx, cy, R_node, -Math.PI / 2, currentSweepAngle, false);
          ctxClock.strokeStyle = accentSoft;
          ctxClock.lineWidth = 6;
          ctxClock.lineCap = 'round';
          ctxClock.stroke();
        }

        // Chrono Hand Needle
        const needleLen = R_railOuter - 3;
        const nx = cx + Math.cos(currentSweepAngle) * needleLen;
        const ny = cy + Math.sin(currentSweepAngle) * needleLen;
        const tailLen = 18;
        const tx = cx - Math.cos(currentSweepAngle) * tailLen;
        const ty = cy - Math.sin(currentSweepAngle) * tailLen;

        ctxClock.beginPath();
        ctxClock.moveTo(tx, ty);
        ctxClock.lineTo(nx, ny);
        ctxClock.strokeStyle = accentColor;
        ctxClock.lineWidth = 2;
        ctxClock.stroke();

        ctxClock.beginPath();
        ctxClock.arc(nx, ny, 3.8, 0, Math.PI * 2);
        ctxClock.fillStyle = isDark ? '#FFFFFF' : '#1C1816';
        ctxClock.fill();
        ctxClock.strokeStyle = accentColor;
        ctxClock.lineWidth = 2;
        ctxClock.stroke();

        ctxClock.beginPath();
        ctxClock.arc(tx, ty, 3, 0, Math.PI * 2);
        ctxClock.fillStyle = isDark ? '#1C1816' : '#FFFFFF';
        ctxClock.fill();
        ctxClock.strokeStyle = accentColor;
        ctxClock.lineWidth = 1.5;
        ctxClock.stroke();

        // 7. Sapphire Crystal Lens Sheen (Curved Reflection)
        const glassSheen = ctxClock.createLinearGradient(cx - R_bezel, cy - R_bezel, cx + R_bezel, cy + R_bezel);
        glassSheen.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.35)');
        glassSheen.addColorStop(0.35, isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)');
        glassSheen.addColorStop(0.5, 'transparent');
        ctxClock.save();
        ctxClock.beginPath();
        ctxClock.arc(cx, cy, R_bezel - 1, 0, Math.PI * 2);
        ctxClock.fillStyle = glassSheen;
        ctxClock.fill();
        ctxClock.restore();

        requestAnimationFrame(renderClock);
      }
      requestAnimationFrame(renderClock);
    }
  }

  /* ==========================================================================
     11. 3D HOLOGRAPHIC ABILITY CARD (MODAL & TILT)
     ========================================================================== */
  const holo = $('#holo');
  const holoOpen = $('#holoOpen');
  const holoClose = $('#holoClose');
  const hc = $('#hc');
  const openHoloFromFooter = $('#openHoloFromFooter');

  function openHoloCard() {
    if (holo) {
      playSound('door');
      holo.hidden = false;
      document.body.style.overflow = 'hidden';
      if (hc) {
        hc.classList.remove('flipped');
        hc.style.transform = 'none';
      }
      setTimeout(() => {
        $$('.hc__meter i', holo).forEach(bar => {
          const target = bar.getAttribute('data-pct') || '90%';
          bar.style.width = target;
        });
      }, 120);
    }
  }

  function closeHoloCard() {
    if (holo) {
      holo.hidden = true;
      document.body.style.overflow = '';
      if (hc) {
        hc.classList.remove('flipped');
        hc.style.transform = 'none';
      }
      $$('.hc__meter i', holo).forEach(bar => {
        bar.style.width = '0%';
      });
    }
  }

  if (holoOpen) holoOpen.addEventListener('click', openHoloCard);
  if (openHoloFromFooter) openHoloFromFooter.addEventListener('click', openHoloCard);
  if (holoClose) holoClose.addEventListener('click', closeHoloCard);
  if (holo) {
    holo.addEventListener('click', e => {
      if (e.target === holo) closeHoloCard();
    });
  }

  const hcEmailCopy = $('#hcEmailCopy');
  if (hcEmailCopy) {
    hcEmailCopy.addEventListener('click', e => {
      e.stopPropagation();
      copyEmailAction();
    });
  }

  if (hc) {
    hc.addEventListener('click', () => {
      hc.classList.toggle('flipped');
    });

    if (!isReduced) {
      hc.addEventListener('pointermove', e => {
        const rect = hc.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = -y * 24;
        const rotY = x * 24;

        hc.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`);
        hc.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`);
        hc.style.setProperty('--foil-opacity', `${Math.min(0.6, Math.hypot(x, y) * 1.2)}`);

        if (!hc.classList.contains('flipped')) {
          hc.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        } else {
          hc.style.transform = `rotateX(${rotX}deg) rotateY(${rotY + 180}deg)`;
        }
      });

      hc.addEventListener('pointerleave', () => {
        if (!hc.classList.contains('flipped')) {
          hc.style.transform = 'rotateX(0deg) rotateY(0deg)';
        } else {
          hc.style.transform = 'rotateX(0deg) rotateY(180deg)';
        }
      });
    }
  }

  /* ==========================================================================
     12. FLUID EDGE-TO-EDGE NAME FOOTER RESIZING
     ========================================================================== */
  function fitFooterWord() {
    const word = $('.sf__word');
    if (!word) return;
    const span = [...word.children].find(s => getComputedStyle(s).display !== 'none');
    if (!span) return;

    word.style.removeProperty('--wf');
    const containerW = word.parentElement.clientWidth;
    const currentW = span.scrollWidth;
    if (currentW > 0 && containerW > 0) {
      const ratio = containerW / currentW;
      const computedFont = parseFloat(getComputedStyle(word).fontSize) || 16;
      const targetSize = Math.floor(computedFont * ratio * 0.98);
      word.style.setProperty('--wf', `${targetSize}px`);
    }
  }
  window.addEventListener('resize', fitFooterWord);
  window.addEventListener('load', fitFooterWord);

  /* ==========================================================================
     13. CONTACT / REQUEST MODAL & COPY TOAST
     ========================================================================== */
  const modal = $('#modal');
  const mClose = $('#mClose');
  const mDone = $('#mDone');
  const reqForm = $('#reqForm');
  const mFormWrap = $('#mFormWrap');
  const mSuccess = $('#mSuccess');
  const toast = $('#toast');
  const toastText = $('#toastText');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    if (toastText) toastText.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function openContactModal() {
    if (modal) {
      modal.hidden = false;
      if (mFormWrap) mFormWrap.hidden = false;
      if (mSuccess) mSuccess.hidden = true;
      document.body.style.overflow = 'hidden';
    }
  }

  function closeContactModal() {
    if (modal) {
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  }

  $$('[data-contact]').forEach(b => b.addEventListener('click', openContactModal));
  if (mClose) mClose.addEventListener('click', closeContactModal);
  if (mDone) mDone.addEventListener('click', closeContactModal);
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeContactModal();
    });
  }

  if (reqForm) {
    reqForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#f-name').value;
      const email = $('#f-email').value;
      const role = $('#f-role').value;
      const project = $('#f-project').value;

      const subject = encodeURIComponent(`Inquiry from ${name} (${role})`);
      const body = encodeURIComponent(`Hi Jayesh,\n\nName: ${name}\nEmail: ${email}\nOpportunity: ${role}\n\nScope / Message:\n${project}\n\nBest regards,\n${name}`);
      window.location.href = `mailto:jayeshsingh9b@gmail.com?subject=${subject}&body=${body}`;

      if (mFormWrap) mFormWrap.hidden = true;
      if (mSuccess) mSuccess.hidden = false;
    });
  }

  function copyEmailAction() {
    const email = 'jayeshsingh9b@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Copied jayeshsingh9b@gmail.com to clipboard! ✓');
    }).catch(() => {
      showToast('Email: jayeshsingh9b@gmail.com');
    });
  }

  const copyEmailBtn = $('#copyEmailBtn');
  const mCopyEmail = $('#mCopyEmail');
  if (copyEmailBtn) copyEmailBtn.addEventListener('click', copyEmailAction);
  if (mCopyEmail) mCopyEmail.addEventListener('click', copyEmailAction);

  // Mobile menu
  const menuBtn = $('#menuBtn');
  const navm = $('#navm');
  const navClose = $('#navClose');

  function openMobileMenu() {
    if (!navm) return;
    navm.hidden = false;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    playSound('door');
  }

  function closeMobileMenu() {
    if (!navm) return;
    navm.hidden = true;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMobileMenu);
  if (navClose) navClose.addEventListener('click', closeMobileMenu);
  if (navm) {
    navm.addEventListener('click', e => {
      if (e.target === navm) closeMobileMenu();
    });
  }

  // Section navigation buttons & Scroll Spy (Home -> Work -> Operations Lab -> Journey -> Contact)
  const navButtons = $$('.nav button');
  const spyTargets = [
    { id: 'contact', btnTarget: 'contact', railTarget: 'about' },
    { id: 'about', btnTarget: 'about', railTarget: 'about' },
    { id: 'studio', btnTarget: 'studio', railTarget: 'studio' },
    { id: 'works', btnTarget: 'works', railTarget: 'works' },
    { id: 'home', btnTarget: 'home', railTarget: 'home' }
  ];

  function updateNavSpy() {
    // When near top of home page (< 140px scroll), unconditionally anchor to 'home'
    if (window.scrollY < 140) {
      navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.go === 'home');
      });
      $$('.side-rail__dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.railTo === 'home');
      });
      document.body.classList.remove('scrolled');
      const railProgress = $('#railProgress');
      if (railProgress) railProgress.style.height = '0%';
      return;
    }

    document.body.classList.toggle('scrolled', window.scrollY > 150);
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) : 0;
    const railProgress = $('#railProgress');
    if (railProgress) railProgress.style.height = `${(progress * 100).toFixed(1)}%`;

    // When near bottom of page (< 80px remaining), anchor to 'contact'
    if (maxScroll > 0 && window.scrollY >= maxScroll - 80) {
      navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.go === 'contact');
      });
      $$('.side-rail__dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.railTo === 'about');
      });
      return;
    }

    const scrollPos = window.scrollY + 220;
    let activeTarget = 'home';
    let activeRailTarget = 'home';

    for (const target of spyTargets) {
      const el = document.getElementById(target.id);
      if (el) {
        const docTop = el.getBoundingClientRect().top + window.scrollY;
        if (docTop <= scrollPos) {
          activeTarget = target.btnTarget;
          activeRailTarget = target.railTarget || target.btnTarget;
          break;
        }
      }
    }

    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.go === activeTarget);
    });

    // Update side-rail active dots
    $$('.side-rail__dot').forEach(dot => {
      const rTarget = dot.dataset.railTo;
      dot.classList.toggle('active', rTarget === activeRailTarget);
    });
  }
  window.updateNavSpy = updateNavSpy;
  window.addEventListener('scroll', updateNavSpy, { passive: true });
  updateNavSpy();

  $$('[data-rail-to]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.railTo;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        playSound('tick');
      }
    });
  });

  $$('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.go;
      const el = document.getElementById(targetId);
      if (el) {
        closeMobileMenu();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  $$('.navm a, .navm [data-contact]').forEach(item => {
    item.addEventListener('click', closeMobileMenu);
  });

  $$('[data-door]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.door, 10);
      const works = $('#works');
      if (works) {
        works.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { setActiveDoor(idx); }, 500);
      }
    });
  });

  const toTopBtn = $('#toTopBtn');
  if (toTopBtn) {
    window.addEventListener('scroll', () => {
      toTopBtn.hidden = window.scrollY < 600;
    }, { passive: true });
    toTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     13. COMMAND PALETTE CONTROLLER (⌘K) & GLOBAL SHORTCUTS
     ========================================================================== */
  const cmdDialog = $('#cmdDialog');
  const cmdBtn = $('#cmdBtn');
  const cmdInput = $('#cmdInput');
  const cmdList = $('#cmdList');
  const cmdEsc = $('#cmdEsc');
  const cmdItems = $$('.cmd-item', cmdList);
  let selectedCmdIdx = 0;

  function openCommandPalette() {
    if (!cmdDialog) return;
    playSound('click');
    cmdDialog.showModal();
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
    }
    filterCmdItems('');
  }

  function closeCommandPalette() {
    if (!cmdDialog || !cmdDialog.open) return;
    cmdDialog.close();
  }

  function executeCmdAction(action) {
    closeCommandPalette();
    playSound('click');
    switch (action) {
      case 'go-home': {
        const el = $('#home');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'go-works': {
        const el = $('#works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'go-studio': {
        const el = $('#studio');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'go-about': {
        const el = $('#about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'open-holo':
        openHoloCard();
        break;
      case 'open-contact':
        openContactModal();
        break;
      case 'copy-email':
        copyEmailAction();
        break;
      case 'toggle-theme':
        toggleTheme();
        break;
      case 'download-cv':
        window.open('assets/Jayesh-Singh-Resume.pdf', '_blank', 'noopener,noreferrer');
        break;
    }
  }

  function filterCmdItems(query) {
    const q = query.trim().toLowerCase();
    const visibleItems = [];

    $$('.cmd-group', cmdList).forEach(group => {
      let groupHasMatch = false;
      $$('.cmd-item', group).forEach(item => {
        const text = (item.textContent || '').toLowerCase();
        const matches = !q || text.includes(q);
        item.style.display = matches ? 'flex' : 'none';
        item.classList.remove('selected');
        if (matches) {
          visibleItems.push(item);
          groupHasMatch = true;
        }
      });
      group.style.display = groupHasMatch ? 'flex' : 'none';
    });

    selectedCmdIdx = 0;
    if (visibleItems.length > 0) {
      visibleItems[0].classList.add('selected');
    }
  }

  function getVisibleCmdItems() {
    return $$('.cmd-item', cmdList).filter(item => item.style.display !== 'none');
  }

  function selectCmdItem(idx) {
    const visible = getVisibleCmdItems();
    if (visible.length === 0) return;
    visible.forEach(it => it.classList.remove('selected'));
    selectedCmdIdx = (idx + visible.length) % visible.length;
    visible[selectedCmdIdx].classList.add('selected');
    visible[selectedCmdIdx].scrollIntoView({ block: 'nearest' });
  }

  const railCmdBtn = $('#railCmdBtn');
  if (cmdBtn) cmdBtn.addEventListener('click', openCommandPalette);
  if (railCmdBtn) railCmdBtn.addEventListener('click', openCommandPalette);
  if (cmdEsc) cmdEsc.addEventListener('click', closeCommandPalette);

  if (cmdDialog) {
    cmdDialog.addEventListener('click', e => {
      if (e.target === cmdDialog) closeCommandPalette();
    });
  }

  if (cmdInput) {
    cmdInput.addEventListener('input', e => {
      filterCmdItems(e.target.value);
    });

    cmdInput.addEventListener('keydown', e => {
      const visible = getVisibleCmdItems();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectCmdItem(selectedCmdIdx + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectCmdItem(selectedCmdIdx - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (visible[selectedCmdIdx]) {
          const action = visible[selectedCmdIdx].dataset.action;
          if (action) executeCmdAction(action);
        }
      } else if (e.key === 'Escape') {
        closeCommandPalette();
      }
    });
  }

  cmdItems.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (action) executeCmdAction(action);
    });
  });

  window.addEventListener('keydown', e => {
    const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (cmdDialog && cmdDialog.open) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (profileDialog && profileDialog.open) closeProfileSummary();
      if (cmdDialog && cmdDialog.open) closeCommandPalette();
      if (chamberModal && chamberModal.open) chamberModal.close();
      closeHoloCard();
      closeContactModal();
      if (navm) navm.hidden = true;
      return;
    }

    if (!isInput) {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'c' || e.key === 'C') {
        openContactModal();
      } else if (e.key === 'e' || e.key === 'E') {
        copyEmailAction();
      } else if (e.key === 'd' || e.key === 'D') {
        toggleTheme();
      } else if (e.key === 'r' || e.key === 'R') {
        window.open('assets/Jayesh-Singh-Resume.pdf', '_blank', 'noopener,noreferrer');
      } else if (e.key === ' ') {
        e.preventDefault();
        openHoloCard();
      }
    }
  });

})();
