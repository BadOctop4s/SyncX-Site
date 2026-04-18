/* ═══════════════════════════════════════════════
   SyncX — main.js
   Canvas · Cursor · Scroll · Interactions
═══════════════════════════════════════════════ */

'use strict';

/* ── EVIL EYE — Perlin flame canvas ── */
(function initEvilEye() {
  const canvas = document.getElementById('x-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let mx = window.innerWidth/2, my = window.innerHeight/2;

  // ── Perlin noise (Ken Perlin improved) ──
  const P = new Uint8Array(512);
  (function seedPerm(){
    const p = [...Array(256)].map((_,i)=>i);
    for(let i=255;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
    for(let i=0;i<512;i++) P[i]=p[i&255];
  })();
  function fade(t){return t*t*t*(t*(t*6-15)+10);}
  function lerp(a,b,t){return a+(b-a)*t;}
  function grad(h,x,y,z){
    const u=h<8?x:y, v=h<4?y:h===12||h===14?x:z;
    return ((h&1)?-u:u)+((h&2)?-v:v);
  }
  function perlin(x,y,z){
    const X=Math.floor(x)&255, Y=Math.floor(y)&255, Z=Math.floor(z)&255;
    x-=Math.floor(x); y-=Math.floor(y); z-=Math.floor(z);
    const u=fade(x),v=fade(y),w=fade(z);
    const A=P[X]+Y,AA=P[A]+Z,AB=P[A+1]+Z,B=P[X+1]+Y,BA=P[B]+Z,BB=P[B+1]+Z;
    return lerp(
      lerp(lerp(grad(P[AA],x,y,z),grad(P[BA],x-1,y,z),u),
           lerp(grad(P[AB],x,y-1,z),grad(P[BB],x-1,y-1,z),u),v),
      lerp(lerp(grad(P[AA+1],x,y,z-1),grad(P[BA+1],x-1,y,z-1),u),
           lerp(grad(P[AB+1],x,y-1,z-1),grad(P[BB+1],x-1,y-1,z-1),u),v),w
    );
  }
  function fbm(x,y,z,oct){
    let v=0,a=0.5,f=1;
    for(let i=0;i<oct;i++){v+=a*perlin(x*f,y*f,z*f);a*=0.5;f*=2.1;}
    return v;
  }

  function resize(){
    W=canvas.width=window.innerWidth;
    H=canvas.height=window.innerHeight;
  }
  window.addEventListener('resize',resize);
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  document.addEventListener('touchmove',e=>{mx=e.touches[0].clientX;my=e.touches[0].clientY;},{passive:true});

  // Off-screen flame texture
  let flameCanvas, flamCtx;
  function buildFlameTexture(t){
    const size=512;
    if(!flameCanvas){flameCanvas=document.createElement('canvas');flameCanvas.width=flameCanvas.height=size;}
    flamCtx=flamCtx||flameCanvas.getContext('2d');
    const id=flamCtx.createImageData(size,size);
    const d=id.data;
    for(let y=0;y<size;y++){
      for(let x=0;x<size;x++){
        const nx=(x/size)*2-1, ny=(y/size)*2-1;
        const dist=Math.sqrt(nx*nx+ny*ny);
        // Flame fbm distortion
        const warp=fbm(nx*1.2+t*0.3, ny*1.2+t*0.25, t*0.1, 4)*0.55;
        const warp2=fbm(nx*2.1-t*0.2, ny*2.1+t*0.15, t*0.08+5, 3)*0.3;
        const d2=dist+warp+warp2;
        // Flame shape: ellipse-ish, brighter at centre
        const raw=fbm(nx*1.6+warp*1.4, ny*1.6+warp2*1.4, t*0.18, 5);
        let v=raw*(1-Math.pow(Math.max(0,d2-0.05),0.7)*1.4);
        v=Math.max(0,v);
        const i=(y*size+x)*4;
        // Colour ramp: black→dark red→orange→yellow→white
        const c=Math.min(1,v*2.2);
        d[i]  =Math.floor(Math.min(255, Math.pow(c,0.55)*255));
        d[i+1]=Math.floor(Math.min(255, Math.pow(Math.max(0,c-0.25),0.7)*200));
        d[i+2]=Math.floor(Math.min(255, Math.pow(Math.max(0,c-0.6),1.2)*120));
        d[i+3]=Math.floor(Math.min(255, Math.pow(c,0.45)*255));
      }
    }
    flamCtx.putImageData(id,0,0);
    return flameCanvas;
  }

  let time=0;
  function draw(){
    time+=0.008;
    ctx.clearRect(0,0,W,H);

    const eyeX=W/2, eyeY=H/2;
    const eyeR=Math.min(W,H)*0.32;
    const irisR=eyeR*0.55;
    const pupilR=irisR*0.38;

    // ── Flame texture (drawn with screen blend) ──
    const flameTex=buildFlameTexture(time);
    const fSize=eyeR*3.2;
    ctx.save();
    ctx.globalCompositeOperation='screen';
    ctx.globalAlpha=0.82;
    ctx.drawImage(flameTex, eyeX-fSize/2, eyeY-fSize/2, fSize, fSize);
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=1;
    ctx.restore();

    // ── Dark sclera over flame ──
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    const scl=ctx.createRadialGradient(eyeX,eyeY,irisR*0.1,eyeX,eyeY,eyeR*1.05);
    scl.addColorStop(0,  'rgba(6,2,2,0)');
    scl.addColorStop(0.45,'rgba(6,2,2,0)');
    scl.addColorStop(0.72,'rgba(4,1,1,0.55)');
    scl.addColorStop(0.88,'rgba(3,0,0,0.82)');
    scl.addColorStop(1,  'rgba(0,0,0,0.95)');
    ctx.beginPath(); ctx.arc(eyeX,eyeY,eyeR*1.05,0,Math.PI*2);
    ctx.fillStyle=scl; ctx.fill();
    ctx.restore();

    // ── Clip to eye circle ──
    ctx.save();
    ctx.beginPath(); ctx.arc(eyeX,eyeY,eyeR,0,Math.PI*2); ctx.clip();

    // Second flame layer inside eye (more intense)
    const fTex2=buildFlameTexture(time*1.15+3.5);
    const f2=eyeR*2.1;
    ctx.globalCompositeOperation='screen';
    ctx.globalAlpha=0.65;
    ctx.drawImage(fTex2, eyeX-f2/2, eyeY-f2/2, f2, f2);
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=1;

    // Iris darkening ring
    const iRing=ctx.createRadialGradient(eyeX,eyeY,irisR*0.05,eyeX,eyeY,irisR);
    iRing.addColorStop(0,  'rgba(5,1,1,0.15)');
    iRing.addColorStop(0.7,'rgba(5,1,1,0.1)');
    iRing.addColorStop(1,  'rgba(0,0,0,0.35)');
    ctx.beginPath(); ctx.arc(eyeX,eyeY,irisR,0,Math.PI*2);
    ctx.fillStyle=iRing; ctx.fill();

    ctx.restore(); // end clip

    // ── Pupil tracking ──
    const dx=mx-eyeX, dy=my-eyeY;
    const dist=Math.sqrt(dx*dx+dy*dy)||1;
    const maxOff=irisR*0.25;
    const str=Math.min(dist/(eyeR*1.2),1)*1.5;
    const px=eyeX+(dx/dist)*Math.min(dist*str*0.3,maxOff);
    const py=eyeY+(dy/dist)*Math.min(dist*str*0.3,maxOff);

    // Pupil distorted with noise
    ctx.save();
    ctx.beginPath();
    const SEGS=80;
    for(let i=0;i<=SEGS;i++){
      const ang=(i/SEGS)*Math.PI*2;
      const n=fbm(Math.cos(ang)*0.8+time*0.4, Math.sin(ang)*0.8+time*0.3, time*0.15, 3);
      const r=pupilR*(1+n*0.08);
      const x=px+Math.cos(ang)*r, y=py+Math.sin(ang)*r;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();
    const pGrad=ctx.createRadialGradient(px-pupilR*0.2,py-pupilR*0.2,0,px,py,pupilR);
    pGrad.addColorStop(0,'#0c0303');
    pGrad.addColorStop(0.6,'#050101');
    pGrad.addColorStop(1,'#000000');
    ctx.fillStyle=pGrad; ctx.fill();
    ctx.restore();

    // Pupil inner shine
    const sh=ctx.createRadialGradient(px-pupilR*0.25,py-pupilR*0.3,0,px-pupilR*0.25,py-pupilR*0.3,pupilR*0.22);
    sh.addColorStop(0,'rgba(255,90,30,0.28)'); sh.addColorStop(1,'rgba(255,50,0,0)');
    ctx.beginPath(); ctx.arc(px-pupilR*0.25,py-pupilR*0.3,pupilR*0.22,0,Math.PI*2);
    ctx.fillStyle=sh; ctx.fill();

    // ── Outer vignette ──
    const vig=ctx.createRadialGradient(eyeX,eyeY,eyeR*0.75,eyeX,eyeY,eyeR*1.6);
    vig.addColorStop(0,'rgba(0,0,0,0)');
    vig.addColorStop(0.5,'rgba(0,0,0,0.3)');
    vig.addColorStop(1,'rgba(0,0,0,0.85)');
    ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

    // ── Pulsing glow rim ──
    const p2=0.18+Math.sin(time*1.3)*0.07;
    ctx.beginPath(); ctx.arc(eyeX,eyeY,eyeR+1,0,Math.PI*2);
    ctx.strokeStyle=`rgba(230,60,10,${p2})`;
    ctx.lineWidth=2+Math.sin(time*0.9)*1;
    ctx.shadowBlur=24+Math.sin(time*1.1)*8;
    ctx.shadowColor='rgba(220,40,5,0.5)';
    ctx.stroke(); ctx.shadowBlur=0;

    animId=requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) cancelAnimationFrame(animId);
    else { animId=requestAnimationFrame(draw); }
  });
  resize(); draw();
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
