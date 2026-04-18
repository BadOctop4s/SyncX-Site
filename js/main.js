/* ═══════════════════════════════════════════════
   SyncX — main.js
   Canvas · Cursor · Scroll · Interactions
═══════════════════════════════════════════════ */

'use strict';

/* ── EVIL EYE CANVAS ── */
(function initEvilEye() {
  const canvas = document.getElementById('x-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let mouseX = -9999, mouseY = -9999;
  let eyeX, eyeY, eyeR;

  // Vein seeds
  const veins = Array.from({length: 70}, () => ({
    angle:  Math.random() * Math.PI * 2,
    speed:  0.003 + Math.random() * 0.006,
    r:      0.5 + Math.random() * 0.6,
    amp:    0.3 + Math.random() * 0.7,
    phase:  Math.random() * Math.PI * 2,
  }));

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    eyeX = W / 2;
    eyeY = H / 2;
    eyeR = Math.min(W, H) * 0.28;
  }

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  document.addEventListener('touchmove', e => {
    mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY;
  }, { passive: true });

  // Layered noise
  function noise(x, y, t) {
    return (
      Math.sin(x * 2.1 + t)         * Math.cos(y * 1.7 + t * 0.8)  * 0.5 +
      Math.sin(x * 3.7 + t * 1.3)   * Math.cos(y * 2.9 + t * 0.6)  * 0.3 +
      Math.sin(x * 1.1 + y * 1.3 + t * 0.5) * 0.2
    );
  }

  let time = 0;

  function draw() {
    time += 0.011;
    ctx.clearRect(0, 0, W, H);

    const irisR  = eyeR * 0.60;
    const pupilR = irisR * 0.40;
    const SEGS   = 120;

    // ── ambient red glow ──
    const bg = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeR * 2.2);
    bg.addColorStop(0,   'rgba(180,8,8,0.13)');
    bg.addColorStop(0.45,'rgba(140,4,4,0.05)');
    bg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ── sclera ──
    const scl = ctx.createRadialGradient(eyeX, eyeY - eyeR*0.05, eyeR*0.04, eyeX, eyeY, eyeR);
    scl.addColorStop(0,   '#161010');
    scl.addColorStop(0.55,'#0d0808');
    scl.addColorStop(1,   '#060303');
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI*2);
    ctx.fillStyle = scl;
    ctx.fill();

    // ── iris (distorted edge) ──
    const irisGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, irisR * 1.05);
    irisGrad.addColorStop(0,    'rgba(245,35,10,0.97)');
    irisGrad.addColorStop(0.28, 'rgba(210,18,5,0.93)');
    irisGrad.addColorStop(0.60, 'rgba(145,6,2,0.88)');
    irisGrad.addColorStop(0.82, 'rgba(70,2,0,0.65)');
    irisGrad.addColorStop(1,    'rgba(10,0,0,0)');

    ctx.beginPath();
    for (let i = 0; i <= SEGS; i++) {
      const ang = (i / SEGS) * Math.PI * 2;
      const nx = Math.cos(ang) * 1.2, ny = Math.sin(ang) * 1.2;
      const n  = noise(nx, ny, time * 0.75);
      const fl = noise(nx * 0.9, ny * 0.9 + time * 0.45, time * 1.1);
      const r  = irisR * (1 + n * 0.055 + Math.max(0, fl) * 0.11);
      const x  = eyeX + Math.cos(ang) * r;
      const y  = eyeY + Math.sin(ang) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // ── iris radial lines ──
    ctx.save();
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * Math.PI * 2 + time * 0.04;
      const n   = noise(Math.cos(ang), Math.sin(ang), time);
      ctx.beginPath();
      ctx.moveTo(eyeX + Math.cos(ang)*irisR*0.20, eyeY + Math.sin(ang)*irisR*0.20);
      ctx.lineTo(eyeX + Math.cos(ang)*irisR*(0.85 + n*0.07), eyeY + Math.sin(ang)*irisR*(0.85 + n*0.07));
      ctx.strokeStyle = `rgba(255,${55+Math.floor(n*35)},0,0.55)`;
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }
    ctx.restore();

    // ── pupil follow cursor ──
    const dx   = mouseX - eyeX, dy = mouseY - eyeY;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const maxO = irisR * 0.26;
    const str  = Math.min(dist / (eyeR * 1.4), 1) * 1.6;
    const px   = eyeX + (dx/dist) * Math.min(dist * str * 0.33, maxO);
    const py   = eyeY + (dy/dist) * Math.min(dist * str * 0.33, maxO);

    const pupGrad = ctx.createRadialGradient(px-pupilR*0.18, py-pupilR*0.18, 0, px, py, pupilR);
    pupGrad.addColorStop(0, '#0a0202');
    pupGrad.addColorStop(1, '#000000');

    ctx.beginPath();
    for (let i = 0; i <= SEGS; i++) {
      const ang = (i / SEGS) * Math.PI * 2;
      const n   = noise(Math.cos(ang)*1.4, Math.sin(ang)*1.4, time*1.05 + 8);
      const r   = pupilR * (1 + n * 0.035);
      const x   = px + Math.cos(ang) * r;
      const y   = py + Math.sin(ang) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = pupGrad;
    ctx.fill();

    // ── pupil shine ──
    const shGrad = ctx.createRadialGradient(
      px-pupilR*0.28, py-pupilR*0.32, 0,
      px-pupilR*0.28, py-pupilR*0.32, pupilR*0.26
    );
    shGrad.addColorStop(0, 'rgba(255,110,70,0.32)');
    shGrad.addColorStop(1, 'rgba(255,70,30,0)');
    ctx.beginPath();
    ctx.arc(px-pupilR*0.28, py-pupilR*0.32, pupilR*0.26, 0, Math.PI*2);
    ctx.fillStyle = shGrad;
    ctx.fill();

    // ── sclera veins ──
    ctx.save();
    ctx.globalAlpha = 0.11;
    for (const v of veins) {
      v.angle += v.speed;
      const ang    = v.angle;
      const inner  = irisR * 1.06;
      const outer  = eyeR  * (0.86 + v.amp * 0.1);
      const mid    = inner + (outer - inner) * 0.5;
      const perp   = ang + Math.PI/2;
      const bend   = v.amp * 5;
      ctx.beginPath();
      ctx.moveTo(eyeX + Math.cos(ang)*inner, eyeY + Math.sin(ang)*inner);
      ctx.quadraticCurveTo(
        eyeX + Math.cos(perp)*bend + Math.cos(ang)*mid,
        eyeY + Math.sin(perp)*bend + Math.sin(ang)*mid,
        eyeX + Math.cos(ang)*outer, eyeY + Math.sin(ang)*outer
      );
      ctx.strokeStyle = `rgba(210,18,18,${0.28 + v.amp * 0.28})`;
      ctx.lineWidth = v.r * 0.65;
      ctx.stroke();
    }
    ctx.restore();

    // ── outer ring / limbus gradient ──
    const ring = ctx.createRadialGradient(eyeX, eyeY, eyeR*0.86, eyeX, eyeY, eyeR);
    ring.addColorStop(0, 'rgba(170,8,4,0)');
    ring.addColorStop(0.55,'rgba(150,6,3,0.32)');
    ring.addColorStop(1,   'rgba(90,3,1,0.55)');
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI*2);
    ctx.fillStyle = ring;
    ctx.fill();

    // ── pulsing outer glow ──
    const pulse = 0.14 + Math.sin(time * 1.4) * 0.06;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR + 1.5, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(220,18,8,${pulse})`;
    ctx.lineWidth = 2.5 + Math.sin(time*0.9) * 1.2;
    ctx.shadowBlur   = 28 + Math.sin(time) * 10;
    ctx.shadowColor  = 'rgba(210,10,10,0.55)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    animId = requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else { animId = requestAnimationFrame(draw); }
  });
  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ── CUSTOM CURSOR ── */
(function initCursor() {
  const dot  = document.getElementById('x-cursor');
  const ring = document.getElementById('x-cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  // Hover state
  document.querySelectorAll('a, button, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Click state
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
})();

/* ── NAV SCROLL EFFECT ── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link highlight
  const links = nav.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...links].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ── MOBILE MENU ── */
(function initMobileMenu() {
  const btn   = document.getElementById('mobile-menu-btn');
  const menu  = document.getElementById('mobile-menu');
  const close = document.getElementById('mobile-menu-close');
  if (!btn || !menu) return;

  const open  = () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const shut  = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };

  btn.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
})();

/* ── SCROLL REVEAL ── */
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => io.observe(el));
})();

/* ── SPOTLIGHT EFFECT ON CARDS ── */
(function initSpotlight() {
  document.querySelectorAll('.card').forEach(card => {
    const sp = card.querySelector('.spotlight');
    if (!sp) return;

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = ((e.clientX - r.left) / r.width)  * 100;
      const y  = ((e.clientY - r.top)  / r.height) * 100;
      card.style.setProperty('--x', x + '%');
      card.style.setProperty('--y', y + '%');
    });
  });
})();

/* ── STAT COUNTER ANIMATION ── */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseFloat(el.dataset.count);
      const dur = 1200;
      const suffix = el.dataset.suffix || '';
      const start  = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4); // ease out quart
        const val  = end < 10 ? (end * ease).toFixed(1) : Math.floor(end * ease);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => io.observe(el));
})();

/* ── COPY LOADSTRING ── */
function copyLoadstring(btn) {
  const code = SYNCX_CONFIG.downloads.royalhub_loadstring;
  navigator.clipboard.writeText(code).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = btn.innerHTML.replace(/Copiar Loadstring|Copy/, '✓ Copiado!');
    btn.style.background = '#16a34a';
    btn.style.boxShadow  = '0 0 20px rgba(34,197,94,0.3)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.boxShadow  = '';
    }, 2200);
  }).catch(() => {
    prompt('Copie o loadstring:', code);
  });
}

function copyCode(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copiado!';
    btn.style.color = 'var(--green)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 2000);
  });
}

/* ── SMOOTH ANCHOR SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
