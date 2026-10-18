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

  /* ---------- build ---------- */
  const jacket = (s) =>
    `<div class="jacket j-${s.jacket.pattern}" style="--len:${s.jacket.text.length}"><span class="jt">${esc(s.jacket.text)}</span></div>`;
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
  function applyTheme(c) {
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
      applyTheme(s);
      $('#ghost').textContent = s.jacket.text;
      $('#slug').textContent = s.id;
      $('#counter').innerHTML = `${pad(i + 1)}<small>/${pad(SONGS.length)}</small>`;
      document.title = `etan://${s.id}`;
      preview.style.cssText = vars(s);
      preview.innerHTML = `
        <div class="pv-jacket">${jacket(s)}</div>
        <h2 class="pv-title">${esc(s.title)}</h2>
        <p class="pv-sub">${esc(s.sub)}</p>
        <div class="pv-chips">${chips(s)}</div>
        <p class="pv-hint"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> browse &middot; <kbd>Esc</kbd> home</p>`;
    }
    if (scroll) scrollToItem(i, instant);
    if (hash) writeHash(s.id);
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
      if (view === 'select' && location.hash !== `#/${id}`) history.replaceState(null, '', `#/${id}`);
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
  function route() {
    const id = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const i = SONGS.findIndex((s) => s.id === id);
    if (i < 0) {
      view = 'title';
      body.dataset.view = 'title';
      selectView.inert = true;
      titleView.inert = false;
      applyTheme(DEFAULT);
      $('#ghost').textContent = 'ETAN';
      document.title = 'etan://home';
      return;
    }
    const entering = view !== 'select';
    view = 'select';
    body.dataset.view = 'select';
    titleView.inert = true;
    selectView.inert = false;
    select(i, { scroll: true, instant: true, hash: false });
    if (entering) list.focus({ preventScroll: true });
    measure();
  }
  addEventListener('hashchange', route);

  /* ---------- input ---------- */
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.song');
    if (!li) return;
    const i = +li.dataset.i;
    if (i !== sel) select(i, { scroll: true });
    // TODO(next step): clicking the selected song opens its chart info panel
  });
  $('#prev').addEventListener('click', () => select(sel - 1, { scroll: true }));
  $('#next').addEventListener('click', () => select(sel + 1, { scroll: true }));

  addEventListener('keydown', (e) => {
    if (document.activeElement?.closest?.('#con') || view !== 'select' || e.altKey || e.ctrlKey || e.metaKey) return;
    const go = (n) => { e.preventDefault(); select(n, { scroll: true }); };
    switch (e.key) {
      case 'ArrowDown': case 'ArrowRight': case 'j': go(sel + 1); break;
      case 'ArrowUp': case 'ArrowLeft': case 'k': go(sel - 1); break;
      case 'PageDown': go(sel + 3); break;
      case 'PageUp': go(sel - 3); break;
      case 'Home': go(0); break;
      case 'End': go(SONGS.length - 1); break;
      case 'Escape': e.preventDefault(); location.hash = '#/'; break;
      case 'Enter': /* TODO(next step): open detail panel */ break;
    }
  });

  route();
})();
