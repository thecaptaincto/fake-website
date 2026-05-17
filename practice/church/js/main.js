(() => {
  'use strict';

  /* ── LANGUAGE ──────────────────────────────────── */
  const STORAGE_KEY = 'fim-lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    document.documentElement.lang = lang === 'zh' ? 'zh' : lang === 'fr' ? 'fr' : 'en';

    document.querySelectorAll('[data-en],[data-fr],[data-zh]').forEach(el => {
      const val = el.dataset[lang];
      if (val === undefined) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function switchLang(lang) {
    const targets = document.querySelectorAll('[data-en],[data-fr],[data-zh]');
    targets.forEach(el => el.classList.add('lang-switching'));
    setTimeout(() => {
      applyLang(lang);
      targets.forEach(el => el.classList.remove('lang-switching'));
    }, 150);
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLang(btn.dataset.lang));
  });

  applyLang(currentLang);

  /* ── NAV SCROLL ────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* ── HAMBURGER ─────────────────────────────────── */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── CLOSE MENU ON OUTSIDE CLICK ───────────────── */
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── SCROLL REVEAL ─────────────────────────────── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll(
    '.event-card, .life-card, .study-card, .stat, .gospel-verse, .about-text, .contact-block'
  ).forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

})();
