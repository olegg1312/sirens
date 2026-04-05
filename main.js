'use strict';

/* ---- THEME TOGGLE ---- */
(function () {
  const html = document.documentElement;
  const btn  = document.querySelector('[data-theme-toggle]');
  const moon = btn?.querySelector('.icon-moon');
  const sun  = btn?.querySelector('.icon-sun');
  const sys  = matchMedia('(prefers-color-scheme: dark)').matches;
  let theme  = sys ? 'dark' : 'light';
  apply();

  btn?.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; apply(); });

  function apply() {
    html.setAttribute('data-theme', theme);
    if (moon && sun) {
      moon.style.display = theme === 'dark' ? 'block' : 'none';
      sun.style.display  = theme === 'dark' ? 'none'  : 'block';
    }
  }
})();


/* ---- HEADER: scroll & hide ---- */
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  let lastY = 0, ticking = false;

  function update() {
    const y = window.scrollY;
    header.classList.toggle('header--scrolled', y > 10);
    if (y > 200) header.classList.toggle('header--hidden', y > lastY + 6);
    else header.classList.remove('header--hidden');
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
})();


/* ---- ACTIVE NAV LINK ---- */
(function () {
  const links = document.querySelectorAll('.nav__link');
  const sections = [...links].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = [...links].find(l => l.getAttribute('href') === '#' + e.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();


/* ---- BURGER MENU ---- */
(function () {
  const burger = document.querySelector('.burger');
  const nav    = document.getElementById('mobile-nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    nav.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }));
})();


/* ---- HERO FADE-UP ---- */
(function () {
  const els = document.querySelectorAll('.fade-up');
  requestAnimationFrame(() => setTimeout(() => els.forEach(el => el.classList.add('visible')), 60));
})();


/* ---- SCROLL REVEAL ---- */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => obs.observe(el));
})();


/* ---- SMOOTH ANCHORS ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


/* ---- COUNTER ANIMATION ---- */
(function () {
  const nums = document.querySelectorAll('[data-target]');
  if (!nums.length) return;

  function animate(el) {
    const target   = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimal || '0');
    const duration = 1100;
    const start    = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const val      = eased * target;
      el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const bar = document.querySelector('.hero__metrics');
  if (!bar) return;
  let fired = false;
  const obs = new IntersectionObserver(es => {
    if (es[0].isIntersecting && !fired) { fired = true; nums.forEach(animate); }
  }, { threshold: 0.4 });
  obs.observe(bar);
})();


/* ---- PARALLAX GLOWS ---- */
(function () {
  if (matchMedia('(hover: none)').matches) return;
  const g1 = document.querySelector('.hero__glow--1');
  const g2 = document.querySelector('.hero__glow--2');
  if (!g1 || !g2) return;
  let t = false;
  window.addEventListener('scroll', () => {
    if (t) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      g1.style.transform = `translateY(${y * 0.14}px)`;
      g2.style.transform = `translateY(${y * 0.08}px)`;
      t = false;
    });
    t = true;
  }, { passive: true });
})();


/* ---- FLOATING PARTICLES (canvas) ---- */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.reset = function () {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.a  = Math.random() * 0.4 + 0.1;
    };
    this.reset();
  }

  function init() {
    resize();
    particles = Array.from({ length: 70 }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(42,171,238,${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) p.reset();
    });
    raf = requestAnimationFrame(draw);
  }

  init(); draw();
  window.addEventListener('resize', () => { resize(); }, { passive: true });
})();


/* ---- CHAT MESSAGES staggered appear ---- */
(function () {
  const msgs = document.querySelectorAll('.msg');
  msgs.forEach((m, i) => {
    m.style.opacity = '0';
    m.style.transform = 'translateY(8px)';
    m.style.transition = 'opacity .4s ease, transform .4s ease';
    setTimeout(() => { m.style.opacity = '1'; m.style.transform = 'translateY(0)'; }, 700 + i * 380);
  });
})();


/* ---- STEP HIGHLIGHT ON SCROLL (process section) ---- */
(function () {
  const steps = document.querySelectorAll('.step');
  if (!steps.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // stagger inner cards
        const idx = parseInt(e.target.dataset.step || '1') - 1;
        setTimeout(() => {
          e.target.classList.add('visible');
        }, idx * 120);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

  steps.forEach(s => obs.observe(s));
})();


/* ---- CURSOR GLOW ---- */
(function () {
  if (matchMedia('(hover: none)').matches) return;
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999; border-radius:50%;
    width:350px; height:350px;
    background:radial-gradient(circle, rgba(42,171,238,.07) 0%, transparent 70%);
    transform:translate(-50%,-50%);
    transition:opacity .5s ease;
    mix-blend-mode:screen;
  `;
  document.body.appendChild(el);

  let mx = -800, my = -800, cx = -800, cy = -800;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; el.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { el.style.opacity = '0'; });

  (function loop() {
    cx += (mx - cx) * 0.07;
    cy += (my - cy) * 0.07;
    el.style.left = cx + 'px';
    el.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  })();
})();
