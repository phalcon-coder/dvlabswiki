// Regenerates sitemap.xml from posts/posts.json.
//   node tools/sitemap.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://wiki.darkvoyagerlabs.netlify.app';
const { posts } = JSON.parse(readFileSync(new URL('../posts/posts.json', import.meta.url), 'utf8'));

const url = (loc, extra) => `  <url>\n    <loc>${SITE}${loc}</loc>\n${extra}  </url>\n`;
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  url('/', '    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n') +
  posts.map(p => url(`/posts/${p.slug}/`, `    <lastmod>${p.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n`)).join('') +
  '</urlset>\n';

writeFileSync(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml written (${posts.length + 1} urls)`);
