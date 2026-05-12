'use strict';
const LANGS = ['fr', 'en', 'zh'];
const NEXT_LABEL = { fr: 'EN', en: '中文', zh: 'FR' };
let lang = localStorage.getItem('lang') || 'fr';

function applyLang(l) {
  lang = l; localStorage.setItem('lang', l);
  document.documentElement.lang = l === 'zh' ? 'zh-Hans' : l;
  document.getElementById('lang-btn').textContent = NEXT_LABEL[l];
  document.querySelectorAll('[data-fr]').forEach(el => {
    const val = el.dataset[l]; if (!val) return;
    if (el.tagName === 'INPUT' || el.tagName === 'OPTION') { if (el.tagName === 'INPUT') el.placeholder = val; else el.textContent = val; return; }
    el.innerHTML = val;
  });
  document.querySelectorAll('textarea[data-placeholder-fr]').forEach(el => {
    const key = 'placeholder' + l.charAt(0).toUpperCase() + l.slice(1);
    el.placeholder = el.dataset[key] || el.dataset.placeholderFr;
  });
}

document.getElementById('lang-btn').addEventListener('click', () => {
  applyLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
  closeMobileMenu();
});

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
function closeMobileMenu() { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); mobileMenu.setAttribute('aria-hidden','true'); }
hamburger.addEventListener('click', () => { const o = mobileMenu.classList.toggle('open'); hamburger.classList.toggle('open'); mobileMenu.setAttribute('aria-hidden', String(!o)); });
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

const hero = document.getElementById('hero');
if (hero) requestAnimationFrame(() => hero.classList.add('loaded'));

const revealObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } }); }, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

const form = document.getElementById('contact-form');
const success = document.getElementById('form-success');
if (form) {
  const di = document.getElementById('date'); if (di) di.min = new Date().toISOString().split('T')[0];
  form.addEventListener('submit', async e => {
    e.preventDefault(); const btn = form.querySelector('.btn-submit'); const span = btn.querySelector('span'); const orig = span.innerHTML;
    btn.disabled = true; span.innerHTML = lang === 'zh' ? '发送中…' : lang === 'fr' ? 'Envoi…' : 'Sending…';
    try {
      const res = await fetch(form.action, { method:'POST', body: new FormData(form), headers:{ Accept:'application/json' } });
      if (res.ok) { form.reset(); success.textContent = success.dataset[lang] || success.dataset.fr; setTimeout(() => { success.textContent = ''; }, 6000); }
      else { span.innerHTML = lang === 'zh' ? '出错了 — 请重试' : lang === 'fr' ? 'Erreur — réessayez' : 'Error — try again'; btn.disabled = false; return; }
    } catch { span.innerHTML = lang === 'zh' ? '网络错误' : lang === 'fr' ? 'Erreur réseau' : 'Network error'; btn.disabled = false; return; }
    span.innerHTML = orig; btn.disabled = false;
  });
}
applyLang(lang);
