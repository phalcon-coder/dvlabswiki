/* article.js — everything a post page needs beyond its HTML:
   table of contents, heading anchors, copy buttons, reading time/progress,
   related + prev/next posts, lazy comments. */
import { getPosts, cardHtml, postUrl, esc } from './posts.js';
import { reveal } from './ui.js';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const slugify = s => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

export async function init(){
  const body = $('.prose'); if (!body) return;
  headings(body); codeBlocks(body); tables(body); readingTime(body); progress(); comments();
  await related();
}

/* ids + permalink anchors + table of contents with scroll-spy */
function headings(body){
  const hs = $$('h2, h3', body), toc = $('#toc'), box = $('.toc');
  const used = new Set();
  hs.forEach(h => {
    if (!h.id){ let id = slugify(h.textContent), n = 2; const base = id; while (used.has(id) || document.getElementById(id)) id = `${base}-${n++}`; h.id = id; }
    used.add(h.id);
    h.insertAdjacentHTML('beforeend', ` <a class="anchor" href="#${h.id}" aria-label="Link to this section: ${h.textContent.replace(/"/g, '')}">#</a>`);
  });
  if (!toc || hs.length < 2){ box?.remove(); return; }
  toc.innerHTML = hs.map(h => `<li class="${h.tagName === 'H3' ? 'toc-sub' : ''}"><a href="#${h.id}">${h.firstChild.textContent.trim()}</a></li>`).join('');

  const links = new Map($$('a', toc).map(a => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.removeAttribute('aria-current'));
    links.get(e.target.id)?.setAttribute('aria-current', 'location');
  }), { rootMargin:'-18% 0px -72% 0px' });
  hs.forEach(h => spy.observe(h));

  const wide = matchMedia('(min-width:1001px)'); const sync = () => box.open = wide.matches;
  sync(); wide.addEventListener('change', sync);
}

function codeBlocks(body){
  $$('pre', body).forEach(pre => {
    pre.tabIndex = 0; pre.setAttribute('role', 'region'); pre.setAttribute('aria-label', 'Code sample');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'copy-btn'; b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText); b.textContent = 'Copied'; }
      catch { b.textContent = 'Press Ctrl+C'; }
      setTimeout(() => b.textContent = 'Copy', 1800);
    });
    pre.append(b);
  });
}

function tables(body){
  $$('table', body).forEach(t => {
    const w = document.createElement('div'); w.className = 'table-wrap'; w.tabIndex = 0; w.setAttribute('role', 'region'); w.setAttribute('aria-label', 'Scrollable table');
    t.replaceWith(w); w.append(t);
  });
}

function readingTime(body){
  const mins = Math.max(1, Math.round(body.innerText.trim().split(/\s+/).length / 220));
  $$('[data-readtime]').forEach(e => e.textContent = `${mins} min read`);
}

function progress(){
  const bar = $('.progress i'), art = $('.post-layout'); if (!bar || !art) return;
  const upd = () => {
    const r = art.getBoundingClientRect(), total = r.height - innerHeight * .6;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, -r.top / total))})`;
  };
  upd(); addEventListener('scroll', upd, { passive:true }); addEventListener('resize', upd);
}

/* related posts + newer/older navigation, from posts.json */
async function related(){
  const slug = document.body.dataset.slug, posts = await getPosts();
  const i = posts.findIndex(p => p.slug === slug), me = posts[i];
  if (!me){ $('#related')?.remove(); $('#post-nav')?.remove(); return; }

  const score = p => (p.category === me.category ? 2 : 0) + (p.tags || []).filter(t => (me.tags || []).includes(t)).length;
  const rel = posts.filter(p => p !== me).sort((a, b) => score(b) - score(a)).slice(0, 3);
  const relEl = $('#related');
  if (rel.length) $('#related-grid').innerHTML = rel.map(cardHtml).join(''); else relEl?.remove();

  const newer = posts[i - 1], older = posts[i + 1], nav = $('#post-nav');
  if (nav){
    if (!newer && !older) nav.remove();
    else nav.innerHTML =
      (older ? `<a class="prev" href="${postUrl(older)}" rel="prev"><span class="label">← Older post</span><span class="title">${esc(older.title)}</span></a>` : '<span></span>') +
      (newer ? `<a class="next" href="${postUrl(newer)}" rel="next"><span class="label">Newer post →</span><span class="title">${esc(newer.title)}</span></a>` : '');
  }
  reveal();
}

/* GitHub Discussions comments (giscus), loaded only when scrolled near, theme follows the system */
function comments(){
  const host = $('#giscus-container'); if (!host) return;
  const load = () => {
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js'; s.async = true; s.crossOrigin = 'anonymous';
    Object.entries({
      'data-repo':'phalcon-coder/dvlabswiki', 'data-repo-id':'R_kgDOUe29yw', 'data-category':'Comments', 'data-category-id':'DIC_kwDOUe29y84DGl_w',
      'data-mapping':'pathname', 'data-strict':'0', 'data-reactions-enabled':'1', 'data-emit-metadata':'0', 'data-input-position':'top',
      'data-theme':'preferred_color_scheme', 'data-lang':'en', 'data-loading':'lazy',
    }).forEach(([k, v]) => s.setAttribute(k, v));
    host.append(s);
  };
  if (!('IntersectionObserver' in window)) return load();
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting){ io.disconnect(); load(); } }, { rootMargin:'600px 0px' });
  io.observe(host);
}
