/* home.js — featured post, filterable grid, category + tag panels */
import { getPosts, cardHtml, featureHtml, catUrl, tagUrl, esc } from './posts.js';
import { reveal } from './ui.js';

const $ = (s, c = document) => c.querySelector(s);

export async function init(){
  const posts = await getPosts();
  const els = {
    featured: $('#featured'), featuredWrap: $('#featured-wrap'), grid: $('#post-grid'), latest: $('#latest'),
    title: $('#latest-title'), filters: $('#filters'), cats: $('#cat-list'), tags: $('#tag-list'), status: $('#result-status'),
  };
  const state = (() => { const q = new URLSearchParams(location.search); return { category:q.get('category') || '', tag:q.get('tag') || '' }; })();

  const categories = [...new Set(posts.map(p => p.category))].sort();
  const tags = [...new Set(posts.flatMap(p => p.tags || []))].sort();
  const count = c => posts.filter(p => p.category === c).length;

  /* side panels */
  els.cats.innerHTML = categories.map(c => `<li><a href="${catUrl(c)}" data-cat="${esc(c)}"><span>${esc(c)}</span><span class="count">${count(c)}<span class="visually-hidden"> posts</span></span></a></li>`).join('');
  els.tags.innerHTML = tags.map(t => `<li><a class="tag" href="${tagUrl(t)}" data-tag="${esc(t)}">${esc(t)}</a></li>`).join('');

  function setState(next){
    Object.assign(state, { category:'', tag:'' }, next);
    const q = new URLSearchParams(); if (state.category) q.set('category', state.category); if (state.tag) q.set('tag', state.tag);
    history.replaceState(null, '', q.toString() ? `/?${q}` : '/');
    render();
  }

  function render(){
    const filtered = !!(state.category || state.tag);
    const list = posts.filter(p => (!state.category || p.category === state.category) && (!state.tag || (p.tags || []).includes(state.tag)));
    const feat = !filtered ? (posts.find(p => p.featured) || posts[0]) : null;
    const rest = feat ? list.filter(p => p !== feat) : list;

    els.featuredWrap.hidden = !feat;
    if (feat) els.featured.innerHTML = featureHtml(feat);

    els.latest.hidden = !rest.length && !filtered;
    els.title.textContent = state.category || (state.tag ? `Tagged “${state.tag}”` : 'Latest posts');
    els.grid.innerHTML = rest.length ? rest.map(cardHtml).join('') : '';
    if (filtered && !rest.length) els.grid.innerHTML = `<li class="empty">No posts match this filter yet.</li>`;

    els.filters.innerHTML = ['', ...categories].map(c =>
      `<button type="button" class="chip-btn" data-filter="${esc(c)}" aria-pressed="${state.category === c && !state.tag}">${c ? esc(c) : 'All'}</button>`).join('');
    els.cats.querySelectorAll('a').forEach(a => a.dataset.cat === state.category ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));

    els.status.textContent = filtered ? `Showing ${list.length} post${list.length === 1 ? '' : 's'}` : '';
    reveal();
  }

  els.filters.addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (b) setState({ category:b.dataset.filter }); });
  els.cats.addEventListener('click', e => { const a = e.target.closest('[data-cat]'); if (a){ e.preventDefault(); setState({ category:a.dataset.cat }); $('#latest').scrollIntoView({ behavior:'smooth' }); } });
  els.tags.addEventListener('click', e => { const a = e.target.closest('[data-tag]'); if (a){ e.preventDefault(); setState({ tag:a.dataset.tag }); $('#latest').scrollIntoView({ behavior:'smooth' }); } });

  render();
}
