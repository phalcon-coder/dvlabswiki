/* main.js — single entry point for every page.
   <body data-page="home|post|404"> decides which page module loads. */
import { initUI } from './modules/ui.js';
import { initSearch } from './modules/search.js';

window.__wikiOk = true;
initUI();
initSearch();

const page = document.body.dataset.page;
if (page === 'home') (await import('./modules/home.js')).init();
if (page === 'post') (await import('./modules/article.js')).init();
