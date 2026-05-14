'use strict';

document.documentElement.classList.add('js-enabled');

const LANGS = ['fr', 'en', 'zh'];
let lang = localStorage.getItem('lang') || 'fr';

function applyLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l === 'zh' ? 'zh-Hans' : l;

  const selectEl = document.getElementById('lang-select');
  if (selectEl) selectEl.value = l;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === l);
  });

  document.querySelectorAll('[data-fr]').forEach(el => {
    const val = el.dataset[l];
    if (!val) return;
    if (el.tagName === 'INPUT') { el.placeholder = val; return; }
    el.innerHTML = val;
  });

  document.querySelectorAll('textarea[data-placeholder-fr]').forEach(el => {
    const key = 'placeholder' + l.charAt(0).toUpperCase() + l.slice(1);
    el.placeholder = el.dataset[key] || el.dataset.placeholderFr;
  });
}

const selectEl = document.getElementById('lang-select');
if (selectEl) selectEl.addEventListener('change', e => applyLang(e.target.value));

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

/* ── navbar scroll ────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ── contact form ─────────────────────────────────────── */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = form.querySelector('.btn-submit');
    const span = btn.querySelector('span');
    const orig = span.innerHTML;

    btn.disabled   = true;
    span.innerHTML = lang === 'zh' ? '发送中…' : lang === 'fr' ? 'Envoi…' : 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        success.textContent = success.dataset['ok' + lang.charAt(0).toUpperCase() + lang.slice(1)] || success.dataset.okFr;
        setTimeout(() => { success.textContent = ''; }, 6000);
      } else {
        span.innerHTML = lang === 'zh' ? '出错了 — 请重试' : lang === 'fr' ? 'Erreur — réessayez' : 'Error — try again';
        btn.disabled = false;
        return;
      }
    } catch {
      span.innerHTML = lang === 'zh' ? '网络错误' : lang === 'fr' ? 'Erreur réseau' : 'Network error';
      btn.disabled = false;
      return;
    }

    span.innerHTML = orig;
    btn.disabled = false;
  });
}

applyLang(lang);

/* ── hamburger menu ───────────────────────────────────── */
const navHamburger   = document.getElementById('nav-hamburger');
const mainMobileMenu = document.getElementById('main-mobile-menu');
if (navHamburger && mainMobileMenu) {
  navHamburger.addEventListener('click', () => {
    const open = navHamburger.classList.toggle('open');
    mainMobileMenu.classList.toggle('open', open);
    navHamburger.setAttribute('aria-expanded', String(open));
  });
  mainMobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navHamburger.classList.remove('open');
      mainMobileMenu.classList.remove('open');
      navHamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── scroll reveal ────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll('.section-top, .contact-text, #contact-form').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  /* stagger grids */
  document.querySelectorAll('.templates-grid, .steps').forEach(el => {
    el.classList.add('reveal-stagger');
    revealObserver.observe(el);
  });
}

/* ── stat price counter ───────────────────────────────── */
const priceEl = document.querySelector('.stat-price[data-count-to]');
if (priceEl) {
  const target = parseInt(priceEl.dataset.countTo, 10);
  const duration = 1500;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  priceEl.textContent = '0 $';

  /* start after hero fades in */
  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      priceEl.textContent = Math.round(easeOut(p) * target) + ' $';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, 900);
}

/* ── floating particles in hero ───────────────────────── */
function spawnParticles() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const colors = [
    'rgba(201,144,58,',   /* golden wheat */
    'rgba(196,83,28,',    /* terracotta   */
    'rgba(220,170,90,',   /* warm gold    */
  ];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'hero-particle';
    const size    = 2 + Math.random() * 3.5;
    const opacity = 0.09 + Math.random() * 0.2;
    const color   = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = [
      `left:${5 + Math.random() * 90}%`,
      `width:${size}px`,
      `height:${size}px`,
      `opacity:${opacity}`,
      `animation-duration:${10 + Math.random() * 16}s`,
      `animation-delay:${Math.random() * 12}s`,
      `background:${color}1)`,
    ].join(';');
    hero.appendChild(p);
  }
}
spawnParticles();

/* ── 3D card tilt on hover ────────────────────────────── */
document.querySelectorAll('.tpl-card.live').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = (e.clientX - r.left)  / r.width  - 0.5;
    const y  = (e.clientY - r.top)   / r.height - 0.5;
    card.style.transform   = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 6}deg) translateY(-6px) scale(1.01)`;
    card.style.transition  = 'transform .06s ease-out';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1)';
  });
});
