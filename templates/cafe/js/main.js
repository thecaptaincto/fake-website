'use strict';
const LANGS = ['fr', 'en'];
let lang = (() => { const l = localStorage.getItem('lang'); return LANGS.includes(l) ? l : 'fr'; })();

function applyLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l;
  document.getElementById('lang-select').value = l;
  document.querySelectorAll('[data-fr]').forEach(el => {
    const val = el.dataset[l];
    if (!val) return;
    if (el.tagName === 'INPUT') { el.placeholder = val; return; }
    if (el.tagName === 'OPTION') { el.textContent = val; return; }
    el.innerHTML = val;
  });
  document.querySelectorAll('textarea[data-placeholder-fr]').forEach(el => {
    const key = 'placeholder' + l.charAt(0).toUpperCase() + l.slice(1);
    el.placeholder = el.dataset[key] || el.dataset.placeholderFr;
  });
  renderCart();
}

document.getElementById('lang-select').addEventListener('change', e => {
  applyLang(e.target.value);
  closeMobileMenu();
});

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
}
hamburger.addEventListener('click', () => {
  const o = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open');
  mobileMenu.setAttribute('aria-hidden', String(!o));
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

const hero = document.getElementById('hero');
if (hero) {
  requestAnimationFrame(() => hero.classList.add('loaded'));
  window.addEventListener('scroll', () => {
    const p = Math.min(window.scrollY / window.innerHeight, 1);
    const bg = hero.querySelector('.hero-bg');
    if (bg) bg.style.transform = `scale(${1 + p * 0.05}) translateY(${p * 30}px)`;
  }, { passive: true });
}

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── CART ─────────────────────────────────────────────── */
let cart = [];

const cartFab      = document.getElementById('cart-fab');
const cartDrawer   = document.getElementById('cart-drawer');
const cartOverlay  = document.getElementById('cart-overlay');
const cartClose    = document.getElementById('cart-close');
const cartCountEl  = document.getElementById('cart-count');
const cartItemsEl  = document.getElementById('cart-items');
const cartEmptyEl  = document.getElementById('cart-empty');
const cartFooterEl = document.getElementById('cart-footer');
const cartTotalEl  = document.getElementById('cart-total-val');

function openCart()  { cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); }
function closeCart() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); }

cartFab.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

const orderCta = document.getElementById('order-cta');
if (orderCta) orderCta.addEventListener('click', openCart);

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = count;
  cartCountEl.hidden = count === 0;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  cartItemsEl.innerHTML = cart.map(item => {
    const name = lang === 'fr' ? item.nameFr : item.nameEn;
    return `<div class="cart-item">
      <span class="ci-name">${name}</span>
      <span class="ci-qty">&times;${item.qty}</span>
      <span class="ci-price">${(item.price * item.qty).toFixed(2)}&nbsp;$</span>
      <button class="ci-remove" onclick="cartRemove(${JSON.stringify(item.nameFr)})" aria-label="Retirer">&#x2715;</button>
    </div>`;
  }).join('');
  cartTotalEl.textContent = total.toFixed(2) + ' $';
  cartFooterEl.hidden = cart.length === 0;
  cartEmptyEl.hidden  = cart.length > 0;
  const orderItemsEl = document.getElementById('order-items');
  if (orderItemsEl) {
    orderItemsEl.value = cart.map(i =>
      `${lang === 'fr' ? i.nameFr : i.nameEn} x${i.qty} = ${(i.price * i.qty).toFixed(2)} $`
    ).join('\n') + `\nTotal : ${total.toFixed(2)} $`;
  }
}

function cartAdd(nameFr, nameEn, price) {
  const ex = cart.find(i => i.nameFr === nameFr);
  if (ex) ex.qty++;
  else cart.push({ nameFr, nameEn, price: parseFloat(price), qty: 1 });
  renderCart();
}

function cartRemove(nameFr) {
  cart = cart.filter(i => i.nameFr !== nameFr);
  renderCart();
}

/* Auto-inject "Add" buttons into every menu card */
document.querySelectorAll('.panel .card').forEach(card => {
  const h3 = card.querySelector('h3');
  const priceEl = card.querySelector('.price');
  if (!h3 || !priceEl) return;
  const nameFr = h3.dataset.fr || h3.textContent.trim();
  const nameEn = h3.dataset.en || h3.textContent.trim();
  const price  = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
  if (isNaN(price)) return;
  const btn = document.createElement('button');
  btn.className = 'btn-add';
  btn.dataset.fr = 'Ajouter';
  btn.dataset.en = 'Add';
  btn.textContent = 'Ajouter';
  btn.addEventListener('click', () => { cartAdd(nameFr, nameEn, price); openCart(); });
  card.querySelector('.card-body').appendChild(btn);
});

/* ─── ORDER FORM ────────────────────────────────────────── */
const orderForm    = document.getElementById('order-form');
const orderSuccess = document.getElementById('order-success');
if (orderForm) {
  orderForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = orderForm.querySelector('.btn-submit');
    const span = btn.querySelector('span');
    const orig = span.innerHTML;
    btn.disabled = true;
    span.innerHTML = lang === 'fr' ? 'Envoi…' : 'Sending…';
    try {
      const res = await fetch(orderForm.action, { method: 'POST', body: new FormData(orderForm), headers: { Accept: 'application/json' } });
      if (res.ok) {
        orderForm.reset(); cart = []; renderCart();
        const key = 'ok' + lang.charAt(0).toUpperCase() + lang.slice(1);
        orderSuccess.textContent = orderSuccess.dataset[key] || orderSuccess.dataset.okFr;
        setTimeout(() => { orderSuccess.textContent = ''; }, 8000);
      } else { span.innerHTML = lang === 'fr' ? 'Erreur — réessayez' : 'Error — try again'; btn.disabled = false; return; }
    } catch { span.innerHTML = lang === 'fr' ? 'Erreur réseau' : 'Network error'; btn.disabled = false; return; }
    span.innerHTML = orig; btn.disabled = false;
  });
}

/* ─── CONTACT FORM ──────────────────────────────────────── */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');
if (form) {
  const di = document.getElementById('date'); if (di) di.min = new Date().toISOString().split('T')[0];
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit'); const span = btn.querySelector('span'); const orig = span.innerHTML;
    btn.disabled = true; span.innerHTML = lang === 'fr' ? 'Envoi…' : 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) {
        form.reset();
        const key = 'ok' + lang.charAt(0).toUpperCase() + lang.slice(1);
        success.textContent = success.dataset[key] || success.dataset.okFr;
        setTimeout(() => { success.textContent = ''; }, 6000);
      } else { span.innerHTML = lang === 'fr' ? 'Erreur — réessayez' : 'Error — try again'; btn.disabled = false; return; }
    } catch { span.innerHTML = lang === 'fr' ? 'Erreur réseau' : 'Network error'; btn.disabled = false; return; }
    span.innerHTML = orig; btn.disabled = false;
  });
}

applyLang(lang);
renderCart();
