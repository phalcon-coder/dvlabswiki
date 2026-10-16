/* search.js — accessible command-palette search built on the native <dialog>.
   - Focus is trapped and restored by the browser (showModal / close)
   - input is an ARIA combobox; arrow keys move through a listbox
   - results count is announced through a polite live region */
import { getPosts, postUrl, thumbUrl, esc } from './posts.js';

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function highlight(text, tokens){
  if (!tokens.length) return esc(text);
  const re = new RegExp('(' + tokens.map(reEsc).join('|') + ')', 'gi');
  return text.split(re).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
}

export function initSearch(){
  const openers = [...document.querySelectorAll('[data-search-open]')];
  if (!openers.length) return;

  const dlg = document.createElement('dialog');
  dlg.className = 'search-dialog';
  dlg.setAttribute('aria-label', 'Search the wiki');
  dlg.innerHTML = `
    <div class="search-top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <label class="visually-hidden" for="search-input">Search posts, topics, content</label>
      <input id="search-input" type="search" role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Search posts, topics, content...">
      <button type="button" class="search-close" aria-label="Close search">Esc</button>
    </div>
    <ul id="search-results" class="search-results" role="listbox" aria-label="Search results" data-lenis-prevent></ul>
    <p class="visually-hidden" id="search-status" role="status" aria-live="polite"></p>
    <p class="search-foot" aria-hidden="true"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></p>`;
  document.body.append(dlg);

  const input = dlg.querySelector('input'), list = dlg.querySelector('#search-results'), status = dlg.querySelector('#search-status');
  let posts = [], hits = [], active = -1;

  const open = async () => {
    if (dlg.open) return;
    dlg.showModal(); input.value = ''; posts = await getPosts(); render('');
  };
  const close = () => dlg.open && dlg.close();

  function setActive(i){
    const opts = [...list.querySelectorAll('[role="option"]')];
    if (!opts.length) return;
    active = (i + opts.length) % opts.length;
    opts.forEach((o, n) => o.setAttribute('aria-selected', n === active));
    input.setAttribute('aria-activedescendant', opts[active].id);
    opts[active].scrollIntoView({ block:'nearest' });
  }

  function render(q){
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    hits = !tokens.length ? posts.slice(0, 6) : posts
      .map(p => {
        const title = p.title.toLowerCase(), hay = [p.title, p.description, p.category, ...(p.tags || [])].join(' ').toLowerCase();
        if (!tokens.every(t => hay.includes(t))) return null;
        return { p, score: tokens.reduce((s, t) => s + (title.includes(t) ? 3 : 0) + ((p.tags || []).some(x => x.toLowerCase().includes(t)) ? 2 : 1), 0) };
      })
      .filter(Boolean).sort((a, b) => b.score - a.score).map(h => h.p);

    if (!hits.length){
      list.innerHTML = `<li class="search-note" role="presentation">No matching posts found.</li>`;
      status.textContent = 'No matching posts found.'; input.removeAttribute('aria-activedescendant'); active = -1; return;
    }
    list.innerHTML = (tokens.length ? '' : `<li class="search-note" role="presentation">Start typing to search...</li>`) + hits.map((p, i) => `
      <li role="option" id="sr-${i}" aria-selected="false"><a href="${postUrl(p)}">
        <img src="${thumbUrl(p)}" alt="" width="64" height="44" loading="lazy">
        <span><h3>${highlight(p.title, tokens)}</h3><p>${highlight(p.description, tokens)}</p></span>
      </a></li>`).join('');
    status.textContent = tokens.length ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : '';
    setActive(0);
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter' && hits[active]){ e.preventDefault(); location.href = postUrl(hits[active]); }
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });   // backdrop
  dlg.querySelector('.search-close').addEventListener('click', close);
  openers.forEach(b => b.addEventListener('click', open));
  addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); dlg.open ? close() : open(); }
    else if (e.key === '/' && !typing && !dlg.open){ e.preventDefault(); open(); }
  });
}
