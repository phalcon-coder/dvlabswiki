/* posts.js — the single source of truth for post data.
   Everything (home grid, search, related posts, prev/next) reads posts/posts.json. */

let cache;

export async function getPosts(){
  if (!cache){
    cache = fetch('/posts/posts.json', { headers:{ Accept:'application/json' } })
      .then(r => { if (!r.ok) throw new Error('posts.json ' + r.status); return r.json(); })
      .then(d => d.posts.slice().sort((a,b) => b.date.localeCompare(a.date)))
      .catch(err => { console.error(err); return []; });
  }
  return cache;
}

export const postUrl  = p => `/posts/${p.slug}/`;
export const thumbUrl = p => `/posts/${p.slug}/thumbnail.jpg`;
export const catUrl   = c => `/?category=${encodeURIComponent(c)}`;
export const tagUrl   = t => `/?tag=${encodeURIComponent(t)}`;

export function formatDate(iso){
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
}
export const readTime = p => `${p.readingMinutes || 1} min read`;

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* One card template, reused by the home grid, related posts and (via cardHtml) anywhere else. */
export function cardHtml(p, i = 0){
  return `<li data-reveal style="--i:${i}"><article class="card">
    <div class="card__media"><img src="${thumbUrl(p)}" alt="" width="1200" height="675" loading="lazy" decoding="async"></div>
    <div class="card__body">
      <p class="meta"><span class="chip">${esc(p.category)}</span><time datetime="${p.date}">${formatDate(p.date)}</time></p>
      <h3><a class="stretched" href="${postUrl(p)}">${esc(p.title)}</a></h3>
      <p class="card__desc">${esc(p.description)}</p>
      <p class="card__foot meta">Author: ${esc(p.author)}<span class="dot">${readTime(p)}</span></p>
    </div></article></li>`;
}

export function featureHtml(p){
  return `<article class="feature" data-reveal>
    <img class="feature__img" src="${thumbUrl(p)}" alt="" width="1200" height="675" fetchpriority="high" decoding="async">
    <div class="feature__body">
      <p class="meta"><span class="chip">${esc(p.category)}</span><time datetime="${p.date}">${formatDate(p.date)}</time></p>
      <h3><a class="stretched" href="${postUrl(p)}">${esc(p.title)}</a></h3>
      <p>${esc(p.description)}</p>
      <p class="meta">Author: ${esc(p.author)}<span class="dot">${readTime(p)}</span></p>
    </div></article>`;
}
