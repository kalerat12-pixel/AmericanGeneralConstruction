/**
 * Assembles the static export into ONE self-contained HTML page, so the
 * storefront can be published as an Artifact and viewed without a host.
 *
 * The markup, CSS and copy are the real build — routes are lifted straight
 * out of `out/`. What React was doing at runtime (routing, cart, filters,
 * accordion, age gate) is re-implemented in vanilla JS at the bottom, because
 * Next's chunks can't load from a single inlined file.
 *
 *   npm run build && npm run build:preview     (needs output:'export')
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { products, CATEGORIES } from '../data/products';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');

const ROUTES = [
  '/', '/shop', '/quality', '/about', '/faq', '/contact', '/cart',
  '/terms', '/privacy', '/shipping-returns', '/404',
  ...products.map((p) => `/shop/${p.slug}`),
];

const fileFor = (route: string) =>
  route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;

/* ---------------- images → data URIs ---------------- */

const WIDTHS: [RegExp, number][] = [
  [/hero-coast/, 1800],
  [/-0[12]\.jpg$/, 620],          // product plates
  [/textures\//, 700],
  [/founder-portrait|spa-interior/, 900],
  [/./, 1200],
];

const cache = new Map<string, string>();
async function dataUri(publicPath: string) {
  if (cache.has(publicPath)) return cache.get(publicPath)!;
  const abs = path.join(OUT, publicPath.replace(/^\//, ''));
  if (!fs.existsSync(abs)) return publicPath;
  const width = WIDTHS.find(([re]) => re.test(publicPath))![1];
  const buf = await sharp(abs)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 70, mozjpeg: true })
    .toBuffer();
  const uri = `data:image/jpeg;base64,${buf.toString('base64')}`;
  cache.set(publicPath, uri);
  return uri;
}

async function inlineImages(html: string) {
  const refs = new Set<string>();
  for (const m of html.matchAll(/["'(](\/(?:images|textures)\/[^"')]+\.(?:jpg|png))["')]/g)) {
    refs.add(m[1]);
  }
  let out = html;
  for (const ref of refs) {
    const uri = await dataUri(ref);
    out = out.split(ref).join(uri);
  }
  return out;
}

/* ---------------- extract the parts of the export we keep ---------------- */

const grab = (html: string, tag: string) => {
  const open = html.indexOf(`<${tag}`);
  if (open === -1) return '';
  const start = html.indexOf('>', open) + 1;
  const close = html.lastIndexOf(`</${tag}>`);
  return html.slice(start, close);
};

/** Framer renders its `initial` state into the SSR markup; the reveal is
 *  re-driven by an IntersectionObserver below, so those styles come off. */
const stripFramerHidden = (html: string) =>
  html
    .replace(/style="opacity:0;transform:translateY\(\d+px\)"/g, 'data-reveal')
    .replace(/style="transform-origin:left;opacity:0;transform:scaleX\(0\)"/g,
             'style="transform-origin:left" data-reveal')
    .replace(/opacity:0;transform:translateY\(\d+px\);?/g, '')
    .replace(/opacity:0;transform:scaleX\(0\);?/g, '');

const stripScripts = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<template[\s\S]*?<\/template>/g, '');

async function main() {
  if (!fs.existsSync(OUT)) {
    console.error(
      "No out/ directory. This script reads the static export, which needs\n" +
      "output:'export' and images.unoptimized:true in next.config.mjs — both\n" +
      'are deliberately off on this branch so next/image optimisation stays on.\n' +
      'Set them, run `npm run build`, then re-run this script.',
    );
    process.exit(1);
  }
  const cssFile = fs
    .readdirSync(path.join(OUT, '_next/static/css'))
    .find((f) => f.endsWith('.css'))!;
  const css = fs.readFileSync(path.join(OUT, '_next/static/css', cssFile), 'utf8');

  const home = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  const homeBody = stripScripts(grab(home, 'body'));

  // Header and footer are identical on every route — keep one copy.
  const headerStart = homeBody.indexOf('<header');
  const headerEnd = homeBody.indexOf('</header>') + '</header>'.length;
  const header = homeBody.slice(headerStart, headerEnd);
  const footer = homeBody.slice(homeBody.indexOf('<footer'));
  const skip = homeBody.slice(0, headerStart);

  const views: string[] = [];
  for (const route of ROUTES) {
    const file = path.join(OUT, fileFor(route));
    if (!fs.existsSync(file)) {
      console.warn('  ! missing', fileFor(route));
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    const main = stripFramerHidden(stripScripts(grab(html, 'main')));
    views.push(
      `<div class="view" data-route="${route}" hidden>${main}</div>`,
    );
  }

  // Slim catalogue for the cart and the shop filters.
  const catalogue = products.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, category: p.category,
    purity: p.purity, featured: p.featured,
    image: p.images[0].src, imageAlt: p.images[0].alt,
    image2: p.images[1] ? p.images[1].src : p.images[0].src,
    sizes: p.sizes,
  }));

  let page = TEMPLATE
    .replace('/*CSS*/', css)
    .replace('<!--SKIP-->', skip)
    .replace('<!--HEADER-->', header)
    .replace('<!--VIEWS-->', views.join('\n'))
    .replace('<!--FOOTER-->', footer)
    .replace('/*CATALOGUE*/', JSON.stringify(catalogue))
    .replace('/*CATEGORIES*/', JSON.stringify(CATEGORIES));

  page = await inlineImages(page);

  const dest = path.join(ROOT, '.preview', 'storefront.html');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, page);
  console.log(
    `wrote ${path.relative(ROOT, dest)} — ${(page.length / 1024 / 1024).toFixed(2)} MB, ${views.length} routes`,
  );
}

const TEMPLATE = String.raw`<title>LIFTING4GAINS Storefront</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Inter:wght@400;500&display=swap">
<style>
/*CSS*/

/* next/font is replaced by the Google-hosted faces in this single-file build. */
:root{
  --font-display:'Cormorant Garamond';
  --font-sans:'Inter';
}
body{background:#F7F4EF;}

/* Scroll reveal, re-driven here because framer's runtime isn't in this build.
   The rule is scoped to .js so the page still reads with scripting off. */
.js [data-reveal]{opacity:0;transform:translateY(18px);}
.js [data-reveal].is-in{opacity:1;transform:none;
  transition:opacity .6s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1);}
@media (prefers-reduced-motion:reduce){
  .js [data-reveal]{opacity:1;transform:none;}
  .js [data-reveal].is-in{transition:none;}
}
.view[hidden]{display:none!important;}

/* A quiet banner so nobody mistakes the preview for the deployed site. */
/* Deliberately not sticky — the site header pins to top:0, and two
   sticky bars at the same offset overlap. */
#preview-note{
  position:relative;z-index:60;display:flex;gap:.75rem;justify-content:center;
  align-items:center;flex-wrap:wrap;
  background:#14181F;color:rgba(247,244,239,.72);
  font-family:'Inter',system-ui,sans-serif;font-size:11px;letter-spacing:.15em;
  text-transform:uppercase;padding:.6rem 1rem;text-align:center;
}
#preview-note b{color:#C9A961;font-weight:500;}
#preview-note button{
  background:none;border:1px solid rgba(247,244,239,.3);color:inherit;
  font:inherit;letter-spacing:.15em;padding:.25rem .6rem;cursor:pointer;
}
#preview-note button:hover{border-color:#C9A961;color:#C9A961;}
</style>

<div id="preview-note">
  <span><b>Preview</b> — static build of the storefront, running inside this page</span>
  <button type="button" id="preview-hide">Hide</button>
</div>

<!--SKIP-->
<!--HEADER-->
<main id="main" class="flex-1"><!--VIEWS--></main>
<!--FOOTER-->

<script>
(function () {
  var CATALOGUE = /*CATALOGUE*/;
  var CATEGORIES = /*CATEGORIES*/;
  var d = document;
  d.documentElement.classList.add('js');
  d.body.style.display = 'flex';
  d.body.style.flexDirection = 'column';
  d.body.style.minHeight = '100vh';

  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var byId = function (id) { return d.getElementById(id); };
  var views = [].slice.call(d.querySelectorAll('.view'));

  /* ---------------- cart ---------------- */
  var KEY = 'l4g-cart-preview';
  var lines = [];
  try { lines = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { lines = []; }
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {} };
  var count = function () { return lines.reduce(function (n, l) { return n + l.quantity; }, 0); };
  var subtotal = function () { return lines.reduce(function (n, l) { return n + l.price * l.quantity; }, 0); };

  function addLine(product, size, qty) {
    var key = product.id + ':' + size.sku;
    var hit = lines.filter(function (l) { return l.key === key; })[0];
    if (hit) hit.quantity = Math.min(20, hit.quantity + qty);
    else lines.push({
      key: key, slug: product.slug, name: product.name, image: product.image,
      imageAlt: product.imageAlt, amount: size.amount, sku: size.sku,
      price: size.price, quantity: Math.min(20, qty)
    });
    save(); syncCount(); renderCart();
  }

  function syncCount() {
    [].forEach.call(d.querySelectorAll('header a[href="/cart"] span[aria-hidden]'), function (el) {
      var n = count();
      el.textContent = n > 0 ? String(n).padStart(2, '0') : '00';
    });
  }

  /* ---------------- routing ---------------- */
  function show(route) {
    var found = false;
    views.forEach(function (v) {
      var match = v.getAttribute('data-route') === route;
      v.hidden = !match;
      if (match) found = true;
    });
    if (!found) {
      views.forEach(function (v) { v.hidden = v.getAttribute('data-route') !== '/404'; });
      route = '/404';
    }
    // Nav active state, which the export baked in per page.
    [].forEach.call(d.querySelectorAll('header nav a[href]'), function (a) {
      var href = a.getAttribute('href');
      var on = href === route || (href !== '/' && route.indexOf(href + '/') === 0);
      a.classList.toggle('text-charcoal', on);
      a.classList.toggle('text-charcoal/70', !on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      var bar = a.querySelector('span[aria-hidden]');
      if (bar) { bar.classList.toggle('scale-x-100', on); bar.classList.toggle('scale-x-0', !on); }
    });
    if (route === '/cart') renderCart();
    reveal();
    window.scrollTo(0, 0);
  }

  function routeFromHash() {
    var h = location.hash.replace(/^#/, '');
    return h && h.charAt(0) === '/' ? h : '/';
  }

  d.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '/' || href.indexOf('/coa/') === 0) return;
    e.preventDefault();
    var base = href.split('#')[0].split('?')[0];
    if (location.hash.replace(/^#/, '') === base) show(base);
    else location.hash = base;
  });
  window.addEventListener('hashchange', function () { show(routeFromHash()); });

  /* ---------------- scroll reveal ---------------- */
  var io = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;

  function reveal() {
    var visible = d.querySelector('.view:not([hidden])');
    if (!visible) return;
    [].forEach.call(visible.querySelectorAll('[data-reveal]'), function (el) {
      if (el.classList.contains('is-in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.1) el.classList.add('is-in');
      else if (io) io.observe(el);
      else el.classList.add('is-in');
    });
  }

  /* ---------------- shop ----------------
     /shop uses useSearchParams, so Next bails it out to client-side
     rendering and the export ships only the Suspense fallback. The grid,
     sidebar and sort control are rebuilt here from the catalogue. */
  function card(p) {
    var from = Math.min.apply(null, p.sizes.map(function (s) { return s.price; }));
    return '<article class="group relative">' +
      '<a href="/shop/' + p.slug + '" class="block focus:outline-none">' +
      '<div class="relative aspect-[4/5] overflow-hidden bg-bone">' +
      '<img src="' + p.image + '" alt="' + p.imageAlt + '" loading="lazy" class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-calm group-hover:opacity-0 group-focus-within:opacity-0">' +
      '<img src="' + p.image2 + '" alt="" aria-hidden="true" loading="lazy" class="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-0 transition-opacity duration-700 ease-calm group-hover:opacity-100 group-focus-within:opacity-100">' +
      '<div class="pointer-events-none absolute left-4 top-4">' +
      '<span class="inline-flex items-center border border-sage/50 bg-sage/10 px-2.5 py-1 font-sans text-[0.625rem] font-medium uppercase tracking-eyebrow text-[#4F5F50]">' + p.category + '</span>' +
      '</div></div>' +
      '<div class="pt-6"><div class="flex items-baseline justify-between gap-4">' +
      '<h3 class="font-display text-[1.375rem] font-light leading-tight text-charcoal transition-colors duration-500 ease-calm group-hover:text-champagne md:text-2xl">' +
      '<span class="absolute inset-0" aria-hidden="true"></span>' + p.name + '</h3>' +
      '<p class="shrink-0 font-sans text-[0.9375rem] tabular-nums text-charcoal/75">' + money(from) + '</p></div>' +
      '<p class="mt-2.5 font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">' +
      p.purity.toFixed(1) + '% purity · ' + p.sizes.map(function (s) { return s.amount; }).join(' / ') + '</p>' +
      '</div></a></article>';
  }

  var SORTS = [
    ['featured', 'Featured'], ['price-asc', 'Price, low to high'],
    ['price-desc', 'Price, high to low'], ['purity-desc', 'Purity, high to low'],
    ['name-asc', 'Name, A–Z']
  ];

  function buildShop() {
    var view = d.querySelector('.view[data-route="/shop"]');
    if (!view) return;
    var slot = view.querySelector('[aria-busy]') || view.querySelector('.container-content.section');
    if (!slot) return;
    slot.removeAttribute('aria-busy');

    var state = { cat: null, sort: 'featured' };

    function counts(c) {
      return CATALOGUE.filter(function (p) { return p.category === c; }).length;
    }
    function sideBtn(label, n, on) {
      return '<li><button type="button" data-cat="' + (label === 'All products' ? '' : label) + '" aria-pressed="' + on + '"' +
        ' class="flex w-full items-baseline justify-between gap-3 py-2.5 text-left font-sans text-[0.9375rem] transition-colors duration-500 ease-calm ' +
        (on ? 'text-charcoal' : 'text-charcoal/65') + '">' +
        '<span class="flex items-center gap-2.5"><span aria-hidden="true" class="h-px w-4 transition-all duration-500 ease-calm ' +
        (on ? 'bg-champagne' : 'bg-transparent') + '"></span>' + label + '</span>' +
        '<span class="font-sans text-[0.75rem] tabular-nums text-charcoal/65">' + n + '</span></button></li>';
    }

    function render() {
      var vis = CATALOGUE.filter(function (p) { return !state.cat || p.category === state.cat; });
      var from = function (p) { return Math.min.apply(null, p.sizes.map(function (s) { return s.price; })); };
      if (state.sort === 'price-asc') vis.sort(function (a, b) { return from(a) - from(b); });
      else if (state.sort === 'price-desc') vis.sort(function (a, b) { return from(b) - from(a); });
      else if (state.sort === 'purity-desc') vis.sort(function (a, b) { return b.purity - a.purity; });
      else if (state.sort === 'name-asc') vis.sort(function (a, b) { return a.name.localeCompare(b.name); });
      else vis.sort(function (a, b) { return Number(b.featured) - Number(a.featured); });

      slot.className = 'container-content section';
      slot.innerHTML =
        '<div class="grid gap-14 lg:grid-cols-[minmax(190px,220px)_1fr] lg:gap-20">' +
        '<aside aria-label="Filter by category" class="lg:sticky lg:top-32 lg:self-start">' +
        '<h2 class="eyebrow">Category</h2>' +
        '<span aria-hidden="true" class="mt-4 block h-px w-8 bg-champagne/50"></span>' +
        '<ul class="mt-6 space-y-1">' +
        sideBtn('All products', CATALOGUE.length, state.cat === null) +
        CATEGORIES.map(function (c) { return sideBtn(c, counts(c), state.cat === c); }).join('') +
        '</ul></aside><div>' +
        '<div class="flex flex-wrap items-end justify-between gap-6 border-b border-champagne/25 pb-6">' +
        '<p aria-live="polite" class="font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">' +
        vis.length + ' ' + (vis.length === 1 ? 'product' : 'products') + (state.cat ? ' in ' + state.cat : '') + '</p>' +
        '<div class="flex items-center gap-4">' +
        '<label for="sort" class="font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">Sort</label>' +
        '<select id="sort" class="cursor-pointer appearance-none border-0 bg-transparent py-0 pr-7 font-sans text-[0.9375rem] text-charcoal focus:outline-none">' +
        SORTS.map(function (s) {
          return '<option value="' + s[0] + '"' + (state.sort === s[0] ? ' selected' : '') + '>' + s[1] + '</option>';
        }).join('') + '</select></div></div>' +
        '<div class="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">' +
        vis.map(card).join('') + '</div></div></div>';

      [].forEach.call(slot.querySelectorAll('aside button'), function (b) {
        b.addEventListener('click', function () {
          var c = b.getAttribute('data-cat') || null;
          state.cat = state.cat === c ? null : c;
          render();
        });
      });
      slot.querySelector('#sort').addEventListener('change', function (e) {
        state.sort = e.target.value; render();
      });
    }
    render();
  }

  /* ---------------- product pages ---------------- */
  function wirePdp(view) {
    var slug = view.getAttribute('data-route').split('/').pop();
    var product = CATALOGUE.filter(function (c) { return c.slug === slug; })[0];
    if (!product) return;
    var sizeIndex = 0, qty = 1;
    var priceEl = view.querySelector('.font-display.lining-nums');
    var sizeBtns = [].slice.call(view.querySelectorAll('fieldset button'));
    var skuEl = sizeBtns.length ? view.querySelector('fieldset p') : null;
    var qtyEl = view.querySelector('[aria-live="polite"]');
    var stepBtns = [].slice.call(view.querySelectorAll('.border-charcoal\\/15 button'));
    var addBtn = [].slice.call(view.querySelectorAll('button')).filter(function (b) {
      return (b.textContent || '').trim() === 'Add to cart';
    })[0];

    function paint() {
      var s = product.sizes[sizeIndex];
      if (priceEl) priceEl.textContent = money(s.price);
      if (skuEl) skuEl.textContent = 'SKU ' + s.sku;
      sizeBtns.forEach(function (b, i) {
        var on = i === sizeIndex;
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('border-champagne', on);
        b.classList.toggle('bg-champagne/10', on);
        b.classList.toggle('text-charcoal', on);
        b.classList.toggle('border-charcoal/15', !on);
        b.classList.toggle('text-charcoal/70', !on);
      });
      if (qtyEl) qtyEl.textContent = String(qty);
    }
    sizeBtns.forEach(function (b, i) { b.addEventListener('click', function () { sizeIndex = i; paint(); }); });
    if (stepBtns[0]) stepBtns[0].addEventListener('click', function () { qty = Math.max(1, qty - 1); paint(); });
    if (stepBtns[1]) stepBtns[1].addEventListener('click', function () { qty = Math.min(20, qty + 1); paint(); });
    if (addBtn) addBtn.addEventListener('click', function () {
      addLine(product, product.sizes[sizeIndex], qty);
      var was = addBtn.innerHTML;
      addBtn.textContent = 'Added to cart';
      setTimeout(function () { addBtn.innerHTML = was; }, 2200);
    });

    // gallery thumbnails
    var frames = [].slice.call(view.querySelectorAll('.aspect-\\[4\\/5\\] img'));
    var thumbs = [].slice.call(view.querySelectorAll('button.aspect-square'));
    thumbs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        frames.forEach(function (f, j) {
          f.classList.toggle('opacity-100', i === j);
          f.classList.toggle('opacity-0', i !== j);
        });
        thumbs.forEach(function (o, j) {
          o.classList.toggle('ring-1', i === j);
          o.classList.toggle('ring-champagne', i === j);
          o.classList.toggle('ring-offset-4', i === j);
          o.classList.toggle('ring-offset-alabaster', i === j);
          o.classList.toggle('opacity-70', i !== j);
        });
      });
    });
    paint();
  }

  /* ---------------- cart view ---------------- */
  function renderCart() {
    var view = d.querySelector('.view[data-route="/cart"]');
    if (!view) return;
    var slot = view.querySelector('[aria-busy], #cart-slot');
    if (!slot) return;
    slot.removeAttribute('aria-busy');
    slot.id = 'cart-slot';

    if (!lines.length) {
      slot.className = 'container-content section';
      slot.innerHTML =
        '<div class="mx-auto max-w-md text-center">' +
        '<p class="eyebrow">Your cart</p>' +
        '<span aria-hidden="true" class="mx-auto mt-4 block h-px w-10 bg-champagne/55"></span>' +
        '<h2 class="mt-7 font-display text-display-xs font-light text-charcoal">Nothing here yet.</h2>' +
        '<p class="mt-6 text-[0.9375rem] leading-[1.85] text-charcoal/70">When you add a material, it will wait here until you are ready to send an order request.</p>' +
        '<a href="/shop" class="mt-10 inline-flex h-14 items-center justify-center bg-charcoal px-9 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-alabaster">Browse the catalogue</a>' +
        '</div>';
      return;
    }

    var rows = lines.map(function (l) {
      return '<li data-key="' + l.key + '">' +
        '<span aria-hidden="true" class="rule-hairline"></span>' +
        '<div class="grid grid-cols-[88px_1fr] gap-6 py-8 sm:grid-cols-[112px_1fr] sm:gap-8">' +
        '<a href="/shop/' + l.slug + '" class="relative block aspect-[4/5] overflow-hidden bg-bone">' +
        '<img src="' + l.image + '" alt="' + l.imageAlt + '" class="absolute inset-0 h-full w-full object-cover"></a>' +
        '<div class="flex flex-col justify-between gap-6">' +
        '<div class="flex items-start justify-between gap-4"><div>' +
        '<h3 class="font-display text-[1.375rem] font-light leading-tight text-charcoal">' +
        '<a href="/shop/' + l.slug + '" class="hover-gold">' + l.name + '</a></h3>' +
        '<p class="mt-2 font-sans text-eyebrow uppercase tracking-eyebrow text-charcoal/65">' + l.amount + ' · ' + l.sku + '</p>' +
        '</div><button type="button" data-act="remove" class="flex h-9 w-9 shrink-0 items-center justify-center text-charcoal/65 hover-gold">✕<span class="sr-only">Remove ' + l.name + '</span></button></div>' +
        '<div class="flex flex-wrap items-center justify-between gap-4">' +
        '<div class="flex items-center border border-charcoal/15">' +
        '<button type="button" data-act="dec" class="flex h-10 w-10 items-center justify-center text-charcoal/70 hover-gold">−<span class="sr-only">Decrease quantity of ' + l.name + '</span></button>' +
        '<span class="w-9 text-center font-sans text-[0.875rem] tabular-nums text-charcoal">' + l.quantity + '</span>' +
        '<button type="button" data-act="inc" class="flex h-10 w-10 items-center justify-center text-charcoal/70 hover-gold">+<span class="sr-only">Increase quantity of ' + l.name + '</span></button>' +
        '</div><p class="font-sans text-[0.9375rem] tabular-nums text-charcoal">' + money(l.price * l.quantity) + '</p>' +
        '</div></div></div></li>';
    }).join('');

    slot.className = 'container-content section';
    slot.innerHTML =
      '<div class="grid gap-16 lg:grid-cols-[1.35fr_1fr] lg:gap-20"><section>' +
      '<h2 class="eyebrow">' + count() + ' ' + (count() === 1 ? 'item' : 'items') + '</h2>' +
      '<span aria-hidden="true" class="mt-4 block h-px w-10 bg-champagne/55"></span>' +
      '<ul class="mt-10">' + rows + '</ul>' +
      '<span aria-hidden="true" class="rule-hairline"></span>' +
      '<div class="mt-10 flex items-baseline justify-between gap-6">' +
      '<p class="eyebrow-muted">Subtotal</p>' +
      '<p class="font-display text-[2rem] font-light lining-nums tabular-nums text-charcoal">' + money(subtotal()) + '</p></div>' +
      '<p class="mt-3 text-[0.8125rem] leading-relaxed text-charcoal/65">Shipping and any applicable tax are quoted when we confirm your request. Nothing is charged from this page.</p>' +
      '<a href="/shop" class="mt-10 inline-block font-sans text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-charcoal hover-gold">Continue browsing →</a>' +
      '</section>' +
      '<aside class="h-fit border border-champagne/35 bg-alabaster p-8 md:p-10 lg:sticky lg:top-32">' +
      '<h2 class="eyebrow">Request Order</h2>' +
      '<span aria-hidden="true" class="mt-4 block h-px w-10 bg-champagne/55"></span>' +
      '<p class="mt-6 text-[0.9375rem] leading-[1.85] text-charcoal/70">We confirm every order by hand before taking payment — availability, lot, shipping method and destination. Send the request and we will come back to you.</p>' +
      '<form class="mt-10 space-y-7" id="order-form">' +
      field('First name', 'text') + field('Email', 'email') + field('Institution or organisation', 'text') +
      '<div><label class="block font-sans text-eyebrow font-medium uppercase tracking-eyebrow text-charcoal/70" for="of-ship">Shipping address</label>' +
      '<textarea id="of-ship" required class="min-h-[110px] w-full border-0 border-b border-charcoal/20 bg-transparent px-0 py-3 font-sans text-[0.9375rem] text-charcoal focus:border-champagne focus:outline-none"></textarea></div>' +
      '<div class="flex items-start gap-3.5 pt-2"><input id="of-attest" type="checkbox" required class="mt-1 h-4 w-4 shrink-0 accent-[#C9A961]">' +
      '<label for="of-attest" class="text-[0.8125rem] leading-[1.75] text-charcoal/70">I am 21 or older, I am ordering on behalf of a qualified research entity, and I understand these materials are supplied for laboratory research use only and are not for human or veterinary consumption.</label></div>' +
      '<div class="flex items-baseline justify-between gap-6 border-t border-champagne/30 pt-7"><span class="eyebrow-muted">Subtotal</span>' +
      '<span class="font-sans text-[1.125rem] tabular-nums text-charcoal">' + money(subtotal()) + '</span></div>' +
      '<button type="submit" class="h-14 w-full bg-charcoal px-9 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-alabaster">Send order request</button>' +
      '<p class="text-[0.75rem] leading-relaxed text-charcoal/65">No payment is taken on this page. We reply with a quote and a secure payment link.</p>' +
      '</form></aside></div>';

    slot.querySelector('#order-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var ref = 'L4G-' + new Date().getFullYear() + String(Date.now()).slice(-5);
      lines = []; save(); syncCount();
      slot.querySelector('aside').innerHTML =
        '<h2 class="font-display text-[1.875rem] font-light leading-snug text-charcoal">Request received</h2>' +
        '<span aria-hidden="true" class="mt-6 block h-px w-10 bg-champagne/55"></span>' +
        '<p class="mt-6 text-[0.9375rem] leading-[1.85] text-charcoal/70">Your reference is <span class="tabular-nums text-charcoal">' + ref + '</span>. We will reply within one business day with availability, shipping and a payment link. Nothing has been charged.</p>';
      renderCartListOnly();
    });

    [].forEach.call(slot.querySelectorAll('li[data-key] button'), function (b) {
      b.addEventListener('click', function () {
        var key = b.closest('li').getAttribute('data-key');
        var l = lines.filter(function (x) { return x.key === key; })[0];
        if (!l) return;
        var act = b.getAttribute('data-act');
        if (act === 'inc') l.quantity = Math.min(20, l.quantity + 1);
        if (act === 'dec') l.quantity -= 1;
        if (act === 'remove' || l.quantity <= 0) lines = lines.filter(function (x) { return x.key !== key; });
        save(); syncCount(); renderCart();
      });
    });
  }

  function renderCartListOnly() {
    var section = d.querySelector('.view[data-route="/cart"] section');
    if (section) section.innerHTML =
      '<h2 class="eyebrow">Your cart</h2><span aria-hidden="true" class="mt-4 block h-px w-10 bg-champagne/55"></span>' +
      '<p class="mt-7 font-display text-display-xs font-light text-charcoal">Cart cleared.</p>';
  }

  function field(label, type) {
    var id = 'of-' + label.toLowerCase().replace(/[^a-z]+/g, '-');
    return '<div><label class="block font-sans text-eyebrow font-medium uppercase tracking-eyebrow text-charcoal/70" for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" type="' + type + '" required class="w-full border-0 border-b border-charcoal/20 bg-transparent px-0 py-3 font-sans text-[0.9375rem] text-charcoal focus:border-champagne focus:outline-none"></div>';
  }

  /* ---------------- accordion (FAQ) ---------------- */
  [].forEach.call(d.querySelectorAll('[data-state="closed"]'), function (el) {
    if (el.tagName !== 'BUTTON') return;
    var item = el.closest('div');
    var panel = item && item.nextElementSibling;
    el.addEventListener('click', function () {
      var open = el.getAttribute('data-state') === 'open';
      el.setAttribute('data-state', open ? 'closed' : 'open');
      el.setAttribute('aria-expanded', String(!open));
      if (panel) { panel.hidden = open; panel.setAttribute('data-state', open ? 'closed' : 'open'); }
    });
    if (panel) panel.hidden = true;
  });

  /* ---------------- carousel arrows ---------------- */
  (function () {
    var rail = d.querySelector('.view[data-route="/"] ul.no-scrollbar');
    if (!rail) return;
    var btns = [].slice.call(d.querySelectorAll('.view[data-route="/"] button[aria-label$="products"]'));
    btns.forEach(function (b) {
      b.disabled = false;
      b.addEventListener('click', function () {
        var dir = /Next/.test(b.getAttribute('aria-label')) ? 1 : -1;
        var card = rail.querySelector('li');
        rail.scrollBy({ left: (card ? card.getBoundingClientRect().width + 32 : 400) * dir, behavior: 'smooth' });
      });
    });
  })();

  /* ---------------- forms elsewhere ---------------- */
  [].forEach.call(d.querySelectorAll('form'), function (f) {
    if (f.id === 'order-form') return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = d.createElement('p');
      note.setAttribute('role', 'status');
      note.className = 'mt-6 font-sans text-[0.9375rem] text-charcoal/70';
      note.innerHTML = 'Thank you — this is a preview, so nothing was sent.';
      f.parentNode.replaceChild(note, f);
    });
  });

  /* ---------------- age gate ---------------- */
  (function () {
    var seen;
    try { seen = localStorage.getItem('l4g-age-verified-preview') === 'true'; } catch (e) { seen = false; }
    if (seen) return;
    var wrap = d.createElement('div');
    wrap.innerHTML =
      '<div class="fixed inset-0 z-[70] bg-midnight/70"></div>' +
      '<div role="dialog" aria-modal="true" aria-labelledby="ag-t" class="fixed left-1/2 top-1/2 z-[71] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 bg-alabaster p-8 text-center shadow-soft-lg sm:p-12">' +
      '<p class="eyebrow">Research Use Only — Not for Human Consumption</p>' +
      '<h2 id="ag-t" class="mt-5 font-display text-display-xs font-light tracking-[0.01em] text-charcoal md:text-[2.5rem]">Please confirm your age</h2>' +
      '<span aria-hidden="true" class="mx-auto mt-7 block h-px w-16 bg-champagne/60"></span>' +
      '<p class="mx-auto mt-7 max-w-md text-[0.9375rem] leading-[1.8] text-charcoal/70">Everything sold here is a chemical reference material for laboratory research use only — not for human or veterinary consumption. You must be 21 or older to browse this catalogue.</p>' +
      '<div class="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">' +
      '<button type="button" id="ag-yes" class="h-14 bg-charcoal px-9 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-alabaster sm:min-w-[200px]">I am 21 or older</button>' +
      '<button type="button" id="ag-no" class="h-14 border border-charcoal/25 px-9 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-charcoal sm:min-w-[200px]">I am under 21</button>' +
      '</div><div id="ag-msg"></div></div>';
    d.body.appendChild(wrap);
    var yes = byId('ag-yes'), no = byId('ag-no');
    yes.focus();
    yes.addEventListener('click', function () {
      try { localStorage.setItem('l4g-age-verified-preview', 'true'); } catch (e) {}
      wrap.remove();
    });
    no.addEventListener('click', function () {
      byId('ag-msg').innerHTML =
        '<p role="alert" class="mx-auto mt-9 max-w-md border border-champagne/40 px-6 py-5 text-[0.875rem] leading-[1.8] text-charcoal/70">You must be 21 or older to view this catalogue. Thank you for stopping by.</p>';
      yes.parentNode.remove();
    });
  })();

  byId('preview-hide').addEventListener('click', function () { byId('preview-note').remove(); });

  /* ---------------- boot ---------------- */
  views.forEach(function (v) { if (v.getAttribute('data-route').indexOf('/shop/') === 0) wirePdp(v); });
  buildShop();
  syncCount();
  show(routeFromHash());
})();
</script>`;

main();
