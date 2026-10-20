(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const root = document.documentElement;
  const list = $('#list');
  const selectView = $('#select');
  const titleView = $('#title');
  const preview = $('#preview');
  const reduce = { get matches() { return window.Settings.reduced(); } }; // Settings > Reduced motion (or the system)

  const DEFAULT = { a: '#DDAACC', b: '#BB88EE', ink: '#DDAACC' };
  const { esc, pad, jacket, chips, vars } = window.SiteRender;

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

  /* ---------- build ---------- */
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

  // slugs type themselves: backspace the old text, then type the new
  function makeTyper(el) {
    let timer = 0;
    return (to) => {
      const box = el.parentNode;
      clearTimeout(timer);
      box.classList.remove('typing');
      if (!el.dataset.on || reduce.matches || !window.Settings.get('typing')) { el.dataset.on = '1'; el.textContent = to; return; } // first paint is instant
      box.classList.add('typing'); // holds the cursor solid while moving
      const step = () => {
        const cur = el.textContent;
        if (!to.startsWith(cur)) el.textContent = cur.slice(0, -1);
        else if (cur.length < to.length) el.textContent = to.slice(0, cur.length + 1);
        else return box.classList.remove('typing');
        timer = setTimeout(step, 28);
      };
      step();
    };
  }
  const typeSlug = makeTyper($('#slug'));

  let heavyTimer;
  function select(i, { scroll = false, instant = false, hash = true, arg = '', defer = false } = {}) {
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
      typeSlug(s.id);
      $('#counter').innerHTML = `${pad(i + 1)}<small>/${pad(SONGS.length)}</small>`;
      document.title = `etan://${s.id}`;
      const heavy = () => {
        renderDetail(s, i, arg);
        preview.style.cssText = vars(s);
        preview.innerHTML = `
        <div class="pv-jacket" role="button" tabindex="-1" aria-label="Open info for ${esc(s.title)}">${jacket(s)}<span class="pv-open">Info &rsaquo;</span></div>
        <h2 class="pv-title">${esc(s.title)}</h2>
        <p class="pv-sub">${esc(s.sub)}</p>
        <div class="pv-chips">${chips(s)}</div>
        <p class="pv-hint"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> browse &middot; <kbd>Enter</kbd> / click jacket for info &middot; <kbd>Esc</kbd> home</p>`;
      };
      clearTimeout(heavyTimer);
      // mid-scroll: keep frames cheap, rebuild the panels once scrolling pauses
      if (defer) heavyTimer = setTimeout(heavy, 90); else heavy();
    }
    if (scroll) scrollToItem(i, instant);
    if (hash) writeHash(s.id);
  }

  function renderDetail(s, i, messageId = '') {
    detailEl.style.cssText = vars(s);
    dScroll.innerHTML = window.SiteRender.detailHTML(s, i, SONGS.length);
    window.SiteRender.mount(dScroll, s, { messageId, active: detailOpen });
    dScroll.scrollTop = 0;
  }

  const fullBtn = $('#d-full');
  let fullOn = false;
  function setFull(on, { instant = false } = {}) {
    on = on && detailOpen;
    if (on === fullOn) return;
    fullOn = on;
    // morph the panel between its docked and fullscreen boxes where supported
    if (!instant && document.startViewTransition && !reduce.matches) {
      document.documentElement.classList.add('vt-full');
      const t = document.startViewTransition(() => applyFull(on));
      t.finished.finally(() => document.documentElement.classList.remove('vt-full'));
    } else applyFull(on);
  }
  function applyFull(on) {
    body.dataset.full = on ? '1' : '';
    fullBtn.setAttribute('aria-pressed', on);
    fullBtn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Fullscreen panel');
    for (const el of [$('.s-head'), list, preview, $('.s-bar')]) el.inert = on || (el === list && detailOpen && !wide.matches);
  }
  fullBtn.addEventListener('click', () => { setFull(!fullOn); fullBtn.focus({ preventScroll: true }); });

  $('#d-close').addEventListener('click', () => closeDetail());

  function setDetail(open, { focus = true } = {}) {
    if (open === detailOpen) return;
    detailOpen = open;
    if (!open) setFull(false);
    body.dataset.detail = open ? 'open' : '';
    detailEl.inert = !open;
    list.inert = open && !wide.matches;
    $('#home .lbl').textContent = open ? 'Back' : 'Home';
    if (open && window.kickStats) window.kickStats(dScroll);
    if (focus) (open ? dScroll : list).focus({ preventScroll: true });
  }
  wide.addEventListener('change', () => { list.inert = !!body.dataset.full || (detailOpen && !wide.matches); });

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
    if (!lock && best !== sel) select(best, { defer: true });
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
    const [id, sub, arg = ''] = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
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
      typeSlug('home');
      document.title = 'etan://home';
      settle();
      return;
    }
    const entering = view !== 'select';
    view = 'select';
    body.dataset.view = 'select';
    titleView.inert = true;
    selectView.inert = false;
    select(i, { scroll: true, instant: true, hash: false, arg });
    if (sub !== 'info') pushedDetail = false;
    setDetail(sub === 'info');
    try { // Message.html redirects set this: open the panel already fullscreen, no morph
      if (sessionStorage.getItem('etan-fs')) { sessionStorage.removeItem('etan-fs'); if (sub === 'info') setFull(true, { instant: true }); }
    } catch (e) {}
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
  $('#settings').addEventListener('click', () => {
    if (detailOpen && SONGS[sel].id === 'settings') return closeDetail();
    pushedDetail = true;
    location.hash = '#/settings/info';
  });
  $('#home').addEventListener('click', (e) => { if (detailOpen) { e.preventDefault(); closeDetail(); } });

  addEventListener('keydown', (e) => {
    if (document.activeElement?.closest?.('#con') || document.activeElement?.matches?.('input, textarea, select') || view !== 'select' || e.altKey || e.ctrlKey || e.metaKey) return;
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
      case 'f': if (d) { e.preventDefault(); setFull(!fullOn); } break;
      case 'Escape': e.preventDefault(); if (fullOn) setFull(false); else if (d) closeDetail(); else location.hash = '#/'; break;
      case 'Enter': if (!d && !typing) { e.preventDefault(); openDetail(); } break;
    }
  });

  route();
})();
