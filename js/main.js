'use strict';

const LANGS = ['fr', 'en', 'zh'];

let lang = localStorage.getItem('lang') || 'fr';

function applyLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l === 'zh' ? 'zh-Hans' : l;
  document.getElementById('lang-select').value = l;

  document.querySelectorAll('[data-fr]').forEach(el => {
    const val = el.dataset[l];
    if (!val) return; // gracefully keeps current text if no translation yet
    if (el.tagName === 'INPUT') { el.placeholder = val; return; }
    el.innerHTML = val;
  });

  document.querySelectorAll('textarea[data-placeholder-fr]').forEach(el => {
    const key = 'placeholder' + l.charAt(0).toUpperCase() + l.slice(1);
    el.placeholder = el.dataset[key] || el.dataset.placeholderFr;
  });
}

document.getElementById('lang-select').addEventListener('change', e => {
  applyLang(e.target.value);
});

/* navbar scroll */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* contact form */
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
