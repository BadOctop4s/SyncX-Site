/* ═══════════════════════════════════════════════
   SyncX — main.js
   Canvas · Cursor · Scroll · Interactions
═══════════════════════════════════════════════ */

'use strict';

/* ── CANVAS PARTICLES ── */
(function initCanvas() {
  const canvas = document.getElementById('x-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  const COUNT = 70;
  const MAX_DIST = 130;
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  Math.random() * 1.4 + 0.4,
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) particles.push(mkParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224,32,32,0.5)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const a = (1 - d / MAX_DIST) * 0.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(224,32,32,${a})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  // Pause when tab not visible for performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else draw();
  });

  window.addEventListener('resize', resize);
  init();
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
