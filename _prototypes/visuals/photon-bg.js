/* =========================================================================
   PHOTON BACKGROUND — animation playground
   Vanilla JS, zero dependencies. Owns a single full-screen <canvas> and
   swaps between four light/photon-themed background animations.

   Public API (window.PhotonBG):
     .setMode('wave' | 'motes' | 'streaks' | 'network' | 'off')
     .current  -> active mode string

   Cross-cutting behavior:
     - devicePixelRatio-aware sizing (crisp on retina, no blur on resize)
     - pauses the RAF loop when the tab is hidden (no runaway CPU)
     - honors prefers-reduced-motion (defaults to 'off')
     - palette pulled from the site's CSS variables
   ========================================================================= */
(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // ---- Palette (read from CSS variables, with sane fallbacks) -------------
  const css = getComputedStyle(document.documentElement);
  const v = (name, fallback) => (css.getPropertyValue(name).trim() || fallback);
  const PALETTE = {
    primary: v('--color-primary', '#8c1515'),   // Stanford cardinal
    accent: v('--color-link', '#6688ff'),        // blue
    gold: '#f0b429',                              // warm "photon" glow
    cyan: '#39c0c8',
  };

  // Parse a hex color to {r,g,b} for building rgba() strings with varying alpha.
  function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const rgba = (hex, a) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  };

  // ---- Canvas sizing ------------------------------------------------------
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // draw in CSS pixels
    if (active && active.onResize) active.onResize(W, H);
  }

  function clear() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
  }

  // =========================================================================
  //  Animation modules — each exposes { init(W,H), frame(t), onResize?(W,H) }
  //  `t` is elapsed seconds.
  // =========================================================================

  // 1) WAVE / INTERFERENCE — overlapping circular wavefronts from a few
  //    point sources produce moving interference fringes. Most on-brand for
  //    a photonics lab. Rendered on a coarse grid for performance.
  const Wave = (function () {
    let sources = [];
    const CELL = 14;          // grid resolution in px (bigger = faster)
    const k = 0.05;           // spatial frequency
    const speed = 2.2;        // temporal frequency
    function init(w, h) {
      sources = [
        { x: w * 0.28, y: h * 0.35 },
        { x: w * 0.72, y: h * 0.45 },
        { x: w * 0.50, y: h * 0.80 },
      ];
    }
    function frame(t) {
      clear();
      const cols = Math.ceil(W / CELL);
      const rows = Math.ceil(H / CELL);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * CELL, y = j * CELL;
          let amp = 0;
          for (const s of sources) {
            const d = Math.hypot(x - s.x, y - s.y);
            amp += Math.sin(d * k - t * speed);
          }
          // amp ranges roughly [-3,3]; map crests to faint glow.
          const norm = (amp / sources.length + 1) / 2; // 0..1
          const a = Math.pow(norm, 3) * 0.16;           // emphasize crests
          if (a < 0.01) continue;
          // blend cardinal -> gold across the field for warmth
          const hex = norm > 0.6 ? PALETTE.gold : PALETTE.primary;
          ctx.fillStyle = rgba(hex, a);
          ctx.fillRect(x, y, CELL, CELL);
        }
      }
    }
    return { init, frame, onResize: init };
  })();

  // 2) LIGHT MOTES — soft glowing dots drifting slowly, like dust in a beam.
  //    Subtle and very readable behind text.
  const Motes = (function () {
    let dots = [];
    function init(w, h) {
      const count = Math.round((w * h) / 26000); // density scales with area
      dots = [];
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          phase: Math.random() * Math.PI * 2,
          hex: Math.random() < 0.5 ? PALETTE.gold : PALETTE.accent,
        });
      }
    }
    function frame(t) {
      clear();
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
        if (d.y < -10) d.y = H + 10; if (d.y > H + 10) d.y = -10;
        const twinkle = 0.35 + 0.35 * Math.sin(t * 1.5 + d.phase);
        const R = d.r * 6;
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, R);
        g.addColorStop(0, rgba(d.hex, 0.5 * twinkle));
        g.addColorStop(1, rgba(d.hex, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, R, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return { init, frame, onResize: init };
  })();

  // 3) STREAKING PHOTONS — bright particles shooting across with motion-blur
  //    trails. We fade (not clear) each frame to leave trails.
  const Streaks = (function () {
    let ps = [];
    function spawn(w, h) {
      const fromLeft = Math.random() < 0.5;
      const speed = 3 + Math.random() * 5;
      return {
        x: fromLeft ? -20 : w + 20,
        y: Math.random() * h,
        vx: fromLeft ? speed : -speed,
        vy: (Math.random() - 0.5) * 1.5,
        len: 8 + Math.random() * 22,
        hex: Math.random() < 0.5 ? PALETTE.gold : PALETTE.cyan,
      };
    }
    function init(w, h) {
      const count = Math.round((w * h) / 38000);
      ps = [];
      for (let i = 0; i < count; i++) {
        const p = spawn(w, h);
        p.x = Math.random() * w; // scatter initial positions
        ps.push(p);
      }
    }
    function frame() {
      // Fade the previous frame instead of clearing -> trails.
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = 'rgba(254,254,254,0.14)'; // matches --color-bg-ish
      ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round';
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += p.vx; p.y += p.vy;
        const nx = p.x - p.vx * (p.len / Math.hypot(p.vx, p.vy));
        const ny = p.y - p.vy * (p.len / Math.hypot(p.vx, p.vy));
        ctx.strokeStyle = rgba(p.hex, 0.55);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        // bright head
        ctx.fillStyle = rgba(p.hex, 0.9);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        if (p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) {
          ps[i] = spawn(W, H);
        }
      }
    }
    return { init, frame, onResize: init };
  })();

  // 4) PARTICLE NETWORK — the Coleman "neuron" look: nodes + proximity lines,
  //    recolored to a light/optics palette.
  const Network = (function () {
    let nodes = [];
    const LINK = 130;         // link distance in px
    function init(w, h) {
      const count = Math.round((w * h) / 16000);
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
    }
    function frame() {
      clear();
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = rgba(PALETTE.accent, 0.12 * (1 - d / LINK));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const n of nodes) {
        ctx.fillStyle = rgba(PALETTE.primary, 0.5);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return { init, frame, onResize: init };
  })();

  // 5) NETWORK + PHOTONS — the particle network acts as the "medium" (nodes +
  //    proximity links); a SPARSE set of photons hops node-to-node along the
  //    network, drawn as slow comet streaks. Suggests interactions traveling
  //    through the medium.
  //    Options let us compare looks: `nodeR` = node ("atom") radius,
  //    `linkWidth` = connecting-line thickness, `linkAlpha` = line opacity.
  function makeNetworkPhotons(opts) {
    const nodeR = (opts && opts.nodeR) || 3.5;
    const linkWidth = (opts && opts.linkWidth) || 1;
    const linkAlpha = (opts && opts.linkAlpha) || 0.10;
    const photonTail = (opts && opts.photonTail) || 22;  // comet trail length (px)
    const photonHead = (opts && opts.photonHead) || 7;   // head glow radius (px)
    let nodes = [];
    let photons = [];
    const LINK = 130;       // link distance in px
    const HOP = LINK * 1.5; // a photon prefers to hop to a node within this range

    function pickTarget(from) {
      // Prefer a nearby node (travel "along" the network); else any node.
      const near = [];
      for (const n of nodes) {
        if (n === from) continue;
        if (Math.hypot(n.x - from.x, n.y - from.y) < HOP) near.push(n);
      }
      const pool = near.length ? near : nodes;
      return pool[Math.floor(Math.random() * pool.length)] || from;
    }

    function makePhoton() {
      const src = nodes[Math.floor(Math.random() * nodes.length)];
      return {
        x: src.x, y: src.y,
        target: pickTarget(src),
        dx: 0, dy: 0,                 // unit direction, for the comet tail
        speed: 1.1 + Math.random() * 0.8,
        hex: Math.random() < 0.5 ? PALETTE.gold : PALETTE.cyan,
      };
    }

    function init(w, h) {
      const count = Math.round((w * h) / 16000);
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
        });
      }
      // Sparse: only a handful of photons regardless of node count.
      const pcount = Math.max(3, Math.round(count / 14));
      photons = [];
      for (let i = 0; i < pcount; i++) photons.push(makePhoton());
    }

    function frame() {
      clear();
      // move nodes (the medium)
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = rgba(PALETTE.accent, linkAlpha * (1 - d / LINK));
            ctx.lineWidth = linkWidth;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes ("atoms") — soft glow + solid core, scaled by nodeR
      for (const n of nodes) {
        const gr = nodeR * 2.6;
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gr);
        ng.addColorStop(0, rgba(PALETTE.primary, 0.4));
        ng.addColorStop(1, rgba(PALETTE.primary, 0));
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(n.x, n.y, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(PALETTE.primary, 0.7);
        ctx.beginPath();
        ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
        ctx.fill();
      }
      // photons hopping along the network
      ctx.lineCap = 'round';
      for (const p of photons) {
        const t = p.target;
        const dx = t.x - p.x, dy = t.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 5) {
          // arrived: this node becomes the source, choose the next hop
          p.x = t.x; p.y = t.y;
          p.target = pickTarget(t);
        } else {
          p.dx = dx / d; p.dy = dy / d;
          p.x += p.dx * p.speed;
          p.y += p.dy * p.speed;
        }
        // comet tail: gradient line trailing behind the head
        const tx = p.x - p.dx * photonTail, ty = p.y - p.dy * photonTail;
        const grad = ctx.createLinearGradient(tx, ty, p.x, p.y);
        grad.addColorStop(0, rgba(p.hex, 0));
        grad.addColorStop(1, rgba(p.hex, 0.6));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        // soft head glow
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, photonHead);
        g.addColorStop(0, rgba(p.hex, 0.9));
        g.addColorStop(1, rgba(p.hex, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, photonHead, 0, Math.PI * 2);
        ctx.fill();
        // tiny bright core so a small head still reads as a sharp point
        ctx.fillStyle = rgba(p.hex, 0.95);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, photonHead * 0.28), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return { init, frame, onResize: init };
  }

  // Node sizes to compare: S (2px), M (3.5px), L (5px) — thin default lines.
  const NetworkPhotons = makeNetworkPhotons({ nodeR: 2 });
  const NetworkPhotonsM = makeNetworkPhotons({ nodeR: 3.5 });
  const NetworkPhotonsL = makeNetworkPhotons({ nodeR: 5 });
  // Line strengths to compare, at the M node size: medium and bold.
  const NetworkPhotonsLineMed = makeNetworkPhotons({ nodeR: 3.5, linkWidth: 1.5, linkAlpha: 0.20 });
  const NetworkPhotonsLineBold = makeNetworkPhotons({ nodeR: 3.5, linkWidth: 2.5, linkAlpha: 0.32 });
  // Combo: small nodes + medium lines (the chosen network look).
  const NetworkPhotonsSMed = makeNetworkPhotons({ nodeR: 2, linkWidth: 1.5, linkAlpha: 0.20 });
  // Photon-shape variants on that same network base, between streaks & current.
  const BASE = { nodeR: 2, linkWidth: 1.5, linkAlpha: 0.20 };
  const NetworkPhotonsSmallHead = makeNetworkPhotons({ ...BASE, photonTail: 24, photonHead: 4 });
  const NetworkPhotonsLongTail = makeNetworkPhotons({ ...BASE, photonTail: 40, photonHead: 5 });
  const NetworkPhotonsSlim = makeNetworkPhotons({ ...BASE, photonTail: 32, photonHead: 4.5 });

  const MODULES = {
    wave: Wave, motes: Motes, streaks: Streaks,
    network: Network,
    networkPhotons: NetworkPhotons,
    networkPhotonsM: NetworkPhotonsM,
    networkPhotonsL: NetworkPhotonsL,
    networkPhotonsLineMed: NetworkPhotonsLineMed,
    networkPhotonsLineBold: NetworkPhotonsLineBold,
    networkPhotonsSMed: NetworkPhotonsSMed,
    networkPhotonsSmallHead: NetworkPhotonsSmallHead,
    networkPhotonsLongTail: NetworkPhotonsLongTail,
    networkPhotonsSlim: NetworkPhotonsSlim,
  };

  // ---- Loop & control -----------------------------------------------------
  let active = null;
  let activeName = 'off';
  let rafId = null;
  let startTime = null;

  const prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  function loop(now) {
    if (startTime === null) startTime = now;
    const t = (now - startTime) / 1000;
    if (active) active.frame(t);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function start() {
    if (rafId === null && active) {
      startTime = null;
      rafId = requestAnimationFrame(loop);
    }
  }

  function setMode(name) {
    stop();
    activeName = name;
    if (name === 'off' || !MODULES[name]) {
      active = null;
      clear();
      return;
    }
    active = MODULES[name];
    active.init(W, H);
    clear();
    if (!document.hidden) start();
  }

  // Pause when the tab is hidden; resume when visible.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (active) start();
  });

  window.addEventListener('resize', resize);

  // ---- Boot ---------------------------------------------------------------
  resize();
  window.PhotonBG = {
    setMode,
    get current() { return activeName; },
    prefersReducedMotion,
  };

  // Default mode: respect reduced-motion (start Off), else show the
  // network+photons combo (the chosen direction) on first load.
  setMode(prefersReducedMotion ? 'off' : 'networkPhotonsSlim');
})();
