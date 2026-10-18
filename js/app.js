(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const root = document.documentElement;
  const list = $('#list');
  const selectView = $('#select');
  const titleView = $('#title');
  const preview = $('#preview');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const DEFAULT = { a: '#DDAACC', b: '#BB88EE', ink: '#DDAACC' };
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let sel = 0;
  let view = 'title';
  let lock = 0;       // programmatic scroll in flight: don't let scroll events change selection
  let lockTimer;
  let hashTimer;
  let frame = 0;
  let detailOpen = false;
  let pushedDetail = false;
  const detailEl = $('#detail');
  const dScroll = $('#d-scroll');
  const wide = matchMedia('(min-width: 860px)');
  const arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4M5 4h7v7" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';

  /* ---------- build ---------- */
  const jacket = (s) => s.jacket.image
    ? `<div class="jacket j-img"><img src="${esc(s.jacket.image)}" alt="" decoding="async"></div>`
    : `<div class="jacket j-${s.jacket.pattern}" style="--len:${s.jacket.text.length}"><span class="jt">${esc(s.jacket.text)}</span></div>`;
  const chips = (s) => `<div class="chips">${s.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>`;
  const vars = (s) => `--sa:${s.a};--sb:${s.b};--si:${s.ink}`;

  list.innerHTML = SONGS.map((s, i) => `
    <li class="song" id="song-${s.id}" role="option" aria-selected="false" data-i="${i}" style="${vars(s)}">
      <div class="card"><div class="card-in">
        ${jacket(s)}
        <div class="c-body">
          <span class="c-no">${pad(i + 1)}</span>
          <span class="c-title">${esc(s.title)}</span>
          <span class="c-sub">${esc(s.sub)}</span>
          ${chips(s)}
        </div>
      </div></div>
    </li>`).join('');
  const items = [...list.children];

  /* ---------- selection ---------- */
  // each song gets its own streak angle / position / width / stripe spacing
  const STREAKS = [[115, 58, 14, 26], [98, 40, 22, 20], [128, 66, 10, 34], [84, 30, 18, 24], [122, 52, 26, 30], [106, 62, 12, 18], [136, 44, 16, 28], [92, 70, 20, 22], [118, 36, 12, 32]];
  function applyTheme(c, i) {
    const [ang, s1, sw, gap] = STREAKS[i % STREAKS.length] || STREAKS[0];
    root.style.setProperty('--ang', `${i == null ? 115 : ang}deg`);
    root.style.setProperty('--s1', `${i == null ? 58 : s1}%`);
    root.style.setProperty('--sw', `${i == null ? 14 : sw}%`);
    root.style.setProperty('--gap', `${i == null ? 26 : gap}px`);
    root.style.setProperty('--a', c.a);
    root.style.setProperty('--b', c.b);
    root.style.setProperty('--ink', c.ink);
  }

  function select(i, { scroll = false, instant = false, hash = true } = {}) {
    i = Math.max(0, Math.min(SONGS.length - 1, i));
    const s = SONGS[i];
    if (i !== sel || instant) {
      items[sel]?.classList.remove('is-sel');
      items[sel]?.setAttribute('aria-selected', 'false');
      sel = i;
      items[i].classList.add('is-sel');
      items[i].setAttribute('aria-selected', 'true');
      list.setAttribute('aria-activedescendant', items[i].id);
      applyTheme(s, i);
      $('#ghost').textContent = s.jacket.text;
      $('#slug').textContent = s.id;
      $('#counter').innerHTML = `${pad(i + 1)}<small>/${pad(SONGS.length)}</small>`;
      document.title = `etan://${s.id}`;
      renderDetail(s, i);
      preview.style.cssText = vars(s);
      preview.innerHTML = `
        <div class="pv-jacket" role="button" tabindex="-1" aria-label="Open info for ${esc(s.title)}">${jacket(s)}<span class="pv-open">Info &rsaquo;</span></div>
        <h2 class="pv-title">${esc(s.title)}</h2>
        <p class="pv-sub">${esc(s.sub)}</p>
        <div class="pv-chips">${chips(s)}</div>
        <p class="pv-hint"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> browse &middot; <kbd>Enter</kbd> / click jacket for info &middot; <kbd>Esc</kbd> home</p>`;
    }
    if (scroll) scrollToItem(i, instant);
    if (hash) writeHash(s.id);
  }

  function renderDetail(s, i) {
    const d = s.detail || {};
    const info = (d.info || []).map(([k, v]) => `<div class="stat"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    const paras = (d.body || []).map((t) => `<p>${esc(t)}</p>`).join('');
    const links = (d.links || []).map((l) => `<a class="d-link" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}${arrow}</a>`).join('');
    detailEl.style.cssText = vars(s);
    dScroll.innerHTML = `
      <div class="d-hero">
        <div class="d-jacket">${jacket(s)}</div>
        <div class="d-head">
          <span class="d-no">NO. ${pad(i + 1)} / ${pad(SONGS.length)}</span>
          <h2 class="d-title">${esc(s.title)}</h2>
          <p class="d-sub">${esc(s.sub)}</p>
          ${chips(s)}
        </div>
      </div>
      ${info ? `<section class="d-sec"><h3 class="d-h">Chart info</h3><dl class="d-stats">${info}</dl></section>` : ''}
      ${paras ? `<section class="d-sec"><h3 class="d-h">Notes</h3><div class="d-body">${paras}</div></section>` : ''}
      ${d.stats ? `<section class="d-sec"><h3 class="d-h">${esc(d.stats.label || 'Stats')}</h3><div class="mm" id="mm"></div></section>` : ''}
      ${d.list ? `<section class="d-sec"><h3 class="d-h">${esc(d.list.label || 'Also')}</h3><ul class="d-list">${d.list.items.map(([n, t, h]) => `<li>${h ? `<a class="d-li-n" href="${esc(h)}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>` : `<span class="d-li-n">${esc(n)}</span>`}<span class="d-li-t">${esc(t)}</span></li>`).join('')}</ul></section>` : ''}
      ${d.widget ? '<section class="d-sec"><h3 class="d-h">Server widget</h3><div class="dw" id="dw"></div></section>' : ''}
      ${links ? `<section class="d-sec"><h3 class="d-h">Links</h3><div class="d-links">${links}</div></section>` : ''}
      <p class="d-hint">&larr; &rarr; next song &middot; Esc back</p>`;
    if (d.stats && window.mountStats) { window.mountStats($('#mm'), d.stats); if (detailOpen) window.kickStats(dScroll); }
    if (d.widget && window.mountDiscordWidget) window.mountDiscordWidget($('#dw'), d.widget);
    dScroll.scrollTop = 0;
  }

  function setDetail(open, { focus = true } = {}) {
    if (open === detailOpen) return;
    detailOpen = open;
    body.dataset.detail = open ? 'open' : '';
    detailEl.inert = !open;
    list.inert = open && !wide.matches;
    $('#home .lbl').textContent = open ? 'Back' : 'Home';
    if (open && window.kickStats) window.kickStats(dScroll);
    if (focus) (open ? dScroll : list).focus({ preventScroll: true });
  }
  wide.addEventListener('change', () => { list.inert = detailOpen && !wide.matches; });

  function openDetail() {
    if (detailOpen) return;
    pushedDetail = true;
    location.hash = `#/${SONGS[sel].id}/info`;
  }
  function closeDetail() {
    if (!detailOpen) return;
    clearTimeout(hashTimer); // a pending replaceState would rewrite the hash back to /info
    // always land on the list with the current song, never via history (the song may have changed in the panel)
    location.hash = `#/${SONGS[sel].id}`;
  }

  function scrollToItem(i, instant) {
    const el = items[i];
    const top = el.offsetTop - (list.clientHeight - el.offsetHeight) / 2;
    lock = 1;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => { lock = 0; measure(); }, instant || reduce.matches ? 60 : 480);
    list.scrollTo({ top, behavior: instant || reduce.matches ? 'instant' : 'smooth' });
  }

  // scrolling through the wheel replaces the hash (no history spam)
  function writeHash(id) {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      const h = `#/${id}${detailOpen ? '/info' : ''}`;
      if (view === 'select' && location.hash !== h) history.replaceState(null, '', h);
    }, 140);
  }

  /* ---------- wheel: every card curves away from the centre ---------- */
  function measure() {
    frame = 0;
    if (view !== 'select') return;
    const mid = list.scrollTop + list.clientHeight / 2;
    const half = list.clientHeight / 2;
    let best = sel, bestD = Infinity;
    items.forEach((el, i) => {
      const d = Math.abs(el.offsetTop + el.offsetHeight / 2 - mid);
      el.style.setProperty('--ad', Math.min(d / half, 1.3).toFixed(3));
      if (d < bestD) { bestD = d; best = i; }
    });
    if (!lock && best !== sel) select(best);
  }
  const queue = () => { if (!frame) frame = requestAnimationFrame(measure); };
  list.addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { if (view === 'select') { scrollToItem(sel, true); } });

  /* ---------- routing ---------- */
  // Jumping routes mid-transition can strand a screen half-visible. Snap every
  // running transition to its end, then (after the new ones should be done)
  // force each screen's visibility to match its inert state.
  let settleTimer;
  function resetTransitions() {
    clearTimeout(settleTimer);
    for (const el of [titleView, selectView, detailEl]) {
      el.getAnimations().forEach((a) => a.finish());
      el.style.visibility = '';
    }
  }
  function settle() {
    settleTimer = setTimeout(() => {
      titleView.style.visibility = titleView.inert ? 'hidden' : '';
      selectView.style.visibility = selectView.inert ? 'hidden' : '';
      detailEl.style.visibility = detailEl.inert ? 'hidden' : '';
    }, 700);
  }

  function route() {
    clearTimeout(hashTimer);
    resetTransitions();
    const [id, sub] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
    const i = SONGS.findIndex((s) => s.id === id);
    if (i < 0) {
      view = 'title';
      body.dataset.view = 'title';
      selectView.inert = true;
      titleView.inert = false;
      pushedDetail = false;
      setDetail(false, { focus: false });
      applyTheme(DEFAULT);
      $('#ghost').textContent = 'ETAN';
      document.title = 'etan://home';
      settle();
      return;
    }
    const entering = view !== 'select';
    view = 'select';
    body.dataset.view = 'select';
    titleView.inert = true;
    selectView.inert = false;
    select(i, { scroll: true, instant: true, hash: false });
    if (sub !== 'info') pushedDetail = false;
    setDetail(sub === 'info');
    if (entering && sub !== 'info') list.focus({ preventScroll: true });
    measure();
    settle();
  }
  addEventListener('hashchange', route);

  /* ---------- input ---------- */
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.song');
    if (!li) return;
    const i = +li.dataset.i;
    if (i !== sel) select(i, { scroll: true });
    else openDetail();
  });
  preview.addEventListener('click', (e) => { if (e.target.closest('.pv-jacket, .pv-title')) openDetail(); });
  $('#prev').addEventListener('click', () => select(sel - 1, { scroll: true }));
  $('#next').addEventListener('click', () => select(sel + 1, { scroll: true }));
  $('#open').addEventListener('click', openDetail);
  $('#home').addEventListener('click', (e) => { if (detailOpen) { e.preventDefault(); closeDetail(); } });

  addEventListener('keydown', (e) => {
    if (document.activeElement?.closest?.('#con') || view !== 'select' || e.altKey || e.ctrlKey || e.metaKey) return;
    const go = (n) => { e.preventDefault(); select(n, { scroll: true }); };
    const d = detailOpen; // in the panel, up/down/page keys scroll it; left/right switch song
    const typing = !['BODY', 'UL'].includes(document.activeElement?.tagName) && !document.activeElement?.matches?.('.d-scroll');
    switch (e.key) {
      case 'ArrowRight': case 'j': go(sel + 1); break;
      case 'ArrowLeft': case 'k': go(sel - 1); break;
      case 'ArrowDown': if (!d) go(sel + 1); break;
      case 'ArrowUp': if (!d) go(sel - 1); break;
      case 'PageDown': if (!d) go(sel + 3); break;
      case 'PageUp': if (!d) go(sel - 3); break;
      case 'Home': if (!d) go(0); break;
      case 'End': if (!d) go(SONGS.length - 1); break;
      case 'Escape': e.preventDefault(); if (d) closeDetail(); else location.hash = '#/'; break;
      case 'Enter': if (!d && !typing) { e.preventDefault(); openDetail(); } break;
    }
  });

  route();
})();
