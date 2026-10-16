/* ui.js — behaviour shared by every page: header, footer, favicon, reveals, hover glow */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

export function initUI(){
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
  favicon(); header(); menu(); reveal(); spotlight(); shortcutHints();
}

/* favicon follows the system theme, live */
function favicon(){
  const links = $$('link[rel="icon"],link[rel="apple-touch-icon"]');
  const q = matchMedia('(prefers-color-scheme: light)');
  const apply = light => links.forEach(l => l.href = light ? '/assets/img/logo_light.png' : '/assets/img/logo.png');
  apply(q.matches); q.addEventListener('change', e => apply(e.matches));
}

function header(){
  const h = $('.site-header'); if (!h) return;
  const on = () => h.classList.toggle('is-scrolled', scrollY > 24);
  on(); addEventListener('scroll', on, { passive:true });
}

/* mobile menu: real button, aria-expanded, Esc closes and returns focus */
function menu(){
  const btn = $('.menu-btn'), panel = $('#mobile-nav'); if (!btn || !panel) return;
  const set = open => {
    panel.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.inert = !open;
  };
  panel.inert = true;
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')){ set(false); btn.focus(); } });
  document.addEventListener('click', e => { if (!panel.contains(e.target) && !btn.contains(e.target)) set(false); });
  matchMedia('(min-width:901px)').addEventListener('change', e => e.matches && set(false));
}

/* scroll reveals — IntersectionObserver, no library */
let io;
export function reveal(root = document){
  const els = $$('[data-reveal]:not(.is-in)', root);
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches){
    els.forEach(e => e.classList.add('is-in')); return;
  }
  io ||= new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin:'0px 0px -8% 0px', threshold:.08 });
  els.forEach(e => io.observe(e));
}

/* soft glow that follows the cursor on cards and panels */
function spotlight(){
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.addEventListener('pointermove', e => {
    const el = e.target.closest?.('.card,.panel'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive:true });
}

/* show ⌘K on Apple devices, Ctrl K elsewhere */
function shortcutHints(){
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$('[data-kbd]').forEach(k => k.textContent = mac ? '⌘K' : 'Ctrl K');
}
