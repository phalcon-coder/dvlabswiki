# DarkvoyagerLabs Wiki

A static wiki — no build step. Serve the folder with any static host (Netlify, GitHub Pages) or locally with `npx serve .`
(paths are root-absolute, so open it through a server rather than as `file://`).

```
.
├── index.html              Home: featured post, filterable grid, categories, tags
├── 404.html
├── posts/
│   ├── posts.json          ← single source of truth for every post (home, search, related, prev/next)
│   └── getting-started/
│       ├── index.html      the post
│       ├── thumbnail.jpg   card + hero image (16:9, 1200×675)
│       └── image1.jpg      any other images, referenced relatively: <img src="image1.jpg">
├── templates/post/         copy this folder to start a new post
├── assets/
│   ├── css/                tokens → base → layout → components → article
│   ├── js/
│   │   ├── main.js         entry for every page
│   │   └── modules/        posts · ui · search · home · article
│   ├── fonts/  img/
├── tools/sitemap.mjs       regenerates sitemap.xml from posts.json
├── _redirects  CNAME  robots.txt  sitemap.xml  site.webmanifest
```

## Adding a post

1. Copy `templates/post/` to `posts/<your-slug>/`.
2. Edit `index.html` (title, description, date, author, category, tags, body, and the `data-slug` on `<body>`), and replace `thumbnail.jpg` / `image1.jpg`.
3. Add an entry to `posts/posts.json` (copy the existing one).
4. Optional: `node tools/sitemap.mjs`.

The home page, search, related posts and newer/older links all update from `posts.json`. Headings in a post become its table of contents automatically.

## Accessibility notes

Skip link, landmarks, a single `h1` per page, visible focus, 44px touch targets, WCAG AA contrast in both themes, native `<dialog>` search with a combobox/listbox pattern and live result count, `prefers-reduced-motion`, `prefers-contrast` and forced-colors support, descriptive alt text (decorative images use `alt=""`), underlined links in articles.
