/* =========================================================================
   LIFTING4GAINS
   Plain browser JavaScript. No build step, no dependencies.

   What this file does:
     1. reads videos.json
     2. builds the filter buttons from the tags it finds there
     3. draws a lightweight card for each video
     4. only loads the real (heavy) TikTok embed when you tap a card
   ========================================================================= */

(function () {
  'use strict';

  /* ---- The only thing you might want to change in this file -------------- */
  var PROFILE_URL = 'https://www.tiktok.com/@lifting4gains';
  var HANDLE      = '@lifting4gains';
  /* ----------------------------------------------------------------------- */

  var grid      = document.getElementById('videoGrid');
  var filterBar = document.getElementById('filters');
  var status    = document.getElementById('filterStatus');

  var videos     = [];
  var activeTag  = 'all';

  /* =======================================================================
     LOADING THE VIDEO LIST
     videos.json is the real list. Browsers block reading it when you open
     index.html straight from your desktop (the file:// security rule), so
     in that one case we fall back to the copy inside index.html.
     ======================================================================= */

  function loadVideos() {
    return fetch('videos.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        return { list: data, offline: false };
      })
      .catch(function () {
        var el = document.getElementById('videosFallback');
        if (!el) throw new Error('no fallback data');
        return { list: JSON.parse(el.textContent), offline: true };
      });
  }

  /* Pull the numeric id out of a TikTok URL. */
  function videoIdFrom(url) {
    var m = String(url).match(/\/video\/(\d+)/);
    return m ? m[1] : '';
  }

  function tidy(entry) {
    return {
      url:     typeof entry.url === 'string' ? entry.url.trim() : '',
      caption: typeof entry.caption === 'string' ? entry.caption.trim() : '',
      tag:     (typeof entry.tag === 'string' ? entry.tag.trim() : 'other').toLowerCase(),
      cover:   typeof entry.cover === 'string' ? entry.cover.trim() : ''
    };
  }

  function titleCase(s) {
    return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  /* =======================================================================
     BUILDING A CARD
     ======================================================================= */

  function buildCard(video) {
    var li = document.createElement('li');
    li.className = 'video-card';
    li.setAttribute('data-tag', video.tag);

    /* --- the lightweight placeholder --- */
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'video-trigger';
    trigger.setAttribute('aria-label',
      'Play TikTok video' + (video.caption ? ': ' + video.caption : ''));

    if (video.cover) {
      var cover = document.createElement('img');
      cover.className = 'video-cover';
      cover.src = video.cover;
      cover.alt = '';
      cover.loading = 'lazy';
      cover.decoding = 'async';
      trigger.appendChild(cover);
    } else {
      var ghost = document.createElement('span');
      ghost.className = 'video-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      ghost.textContent = titleCase(video.tag);
      trigger.appendChild(ghost);
    }

    var play = document.createElement('span');
    play.className = 'video-play';
    play.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>';
    trigger.appendChild(play);

    trigger.addEventListener('click', function () {
      activate(trigger, video);
    });

    li.appendChild(trigger);

    /* --- caption, tag chip and a plain link that works no matter what --- */
    var meta = document.createElement('div');
    meta.className = 'video-meta';

    var chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.textContent = titleCase(video.tag);
    meta.appendChild(chip);

    if (video.caption) {
      var cap = document.createElement('p');
      cap.className = 'video-caption';
      cap.textContent = video.caption;
      meta.appendChild(cap);
    }

    var link = document.createElement('a');
    link.className = 'video-link';
    link.href = video.url || PROFILE_URL;
    link.rel = 'noopener';
    link.textContent = 'Open on TikTok';
    meta.appendChild(link);

    li.appendChild(meta);
    return li;
  }

  /* =======================================================================
     SWAPPING THE PLACEHOLDER FOR THE REAL EMBED
     ======================================================================= */

  function activate(trigger, video) {
    var id = videoIdFrom(video.url);

    var holder = document.createElement('div');
    holder.className = 'video-embed';
    holder.tabIndex = -1;
    holder.setAttribute('aria-label',
      'TikTok video' + (video.caption ? ': ' + video.caption : ''));

    /* This is TikTok's own official embed markup. */
    var quote = document.createElement('blockquote');
    quote.className = 'tiktok-embed';
    quote.setAttribute('cite', video.url);
    if (id) quote.setAttribute('data-video-id', id);
    quote.style.maxWidth = '605px';
    quote.style.minWidth = '325px';

    var section = document.createElement('section');
    var anchor  = document.createElement('a');
    anchor.href = video.url || PROFILE_URL;
    anchor.rel  = 'noopener';
    anchor.title = HANDLE;
    anchor.textContent = video.caption || HANDLE;
    section.appendChild(anchor);
    quote.appendChild(section);
    holder.appendChild(quote);

    trigger.replaceWith(holder);
    holder.focus();

    renderEmbed(quote);
  }

  /* embed.js is fetched once, the first time somebody taps a card. */
  var scriptState = 'idle'; /* idle | loading | ready */

  function renderEmbed(node) {
    var lib = window.tiktokEmbed && window.tiktokEmbed.lib;
    if (lib && typeof lib.render === 'function') {
      lib.render([node]);
      return;
    }
    loadEmbedScript();
  }

  function loadEmbedScript() {
    if (scriptState === 'loading') return;

    /* Already loaded but no render helper? Re-run it — that rescans the page. */
    var old = document.getElementById('tiktokEmbedScript');
    if (old) old.remove();

    scriptState = 'loading';
    var s = document.createElement('script');
    s.id = 'tiktokEmbedScript';
    s.async = true;
    s.src = 'https://www.tiktok.com/embed.js';
    s.onload  = function () { scriptState = 'ready'; };
    s.onerror = function () { scriptState = 'idle'; };
    document.body.appendChild(s);
  }

  /* =======================================================================
     FILTERS
     ======================================================================= */

  function buildFilters(tags) {
    filterBar.textContent = '';

    ['all'].concat(tags).forEach(function (tag) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.textContent = tag === 'all' ? 'All' : titleCase(tag);
      btn.setAttribute('data-tag', tag);
      btn.setAttribute('aria-pressed', String(tag === activeTag));
      btn.addEventListener('click', function () { applyFilter(tag); });
      filterBar.appendChild(btn);
    });
  }

  function applyFilter(tag) {
    activeTag = tag;
    var shown = 0;

    Array.prototype.forEach.call(grid.querySelectorAll('.video-card'), function (card) {
      var match = tag === 'all' || card.getAttribute('data-tag') === tag;
      card.hidden = !match;
      if (match) shown++;
    });

    Array.prototype.forEach.call(filterBar.querySelectorAll('.filter-btn'), function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-tag') === tag));
    });

    status.textContent = 'Showing ' + shown + ' ' +
      (tag === 'all' ? '' : titleCase(tag) + ' ') +
      (shown === 1 ? 'video' : 'videos') + '.';
  }

  /* =======================================================================
     START
     ======================================================================= */

  function offlineNotice() {
    var li = document.createElement('li');
    li.className = 'grid-note';
    li.innerHTML =
      '<strong>Local preview.</strong> Your browser won&rsquo;t read <code>videos.json</code> ' +
      'from a file opened off your desktop, so these cards come from the backup copy at the ' +
      'bottom of <code>index.html</code>. Once the site is online, <code>videos.json</code> ' +
      'is always what gets used.';
    return li;
  }

  function errorNotice() {
    var li = document.createElement('li');
    li.className = 'grid-note';
    li.innerHTML =
      '<strong>Couldn&rsquo;t load the video list.</strong> Check that <code>videos.json</code> ' +
      'sits next to <code>index.html</code> and is valid JSON &mdash; a stray comma is the usual ' +
      'culprit. In the meantime, everything is on ' +
      '<a href="' + PROFILE_URL + '" rel="noopener">TikTok</a>.';
    return li;
  }

  function start() {
    loadVideos()
      .then(function (result) {
        videos = (Array.isArray(result.list) ? result.list : [])
          .map(tidy)
          .filter(function (v) { return v.url !== ''; });

        grid.textContent = '';

        if (!videos.length) {
          grid.appendChild(errorNotice());
          return;
        }

        if (result.offline) grid.appendChild(offlineNotice());

        var tags = [];
        videos.forEach(function (v) {
          if (tags.indexOf(v.tag) === -1) tags.push(v.tag);
          grid.appendChild(buildCard(v));
        });

        buildFilters(tags);
        status.textContent = 'Showing ' + videos.length +
          (videos.length === 1 ? ' video.' : ' videos.');
      })
      .catch(function (err) {
        grid.textContent = '';
        grid.appendChild(errorNotice());
        if (window.console) console.error('[lifting4gains]', err);
      });
  }

  /* Copyright year, so you never have to touch it. */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  if (grid && filterBar && status) start();
})();
