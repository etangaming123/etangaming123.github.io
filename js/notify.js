// Global message banner: a Win98-style toast fed by a gist. Shown after "Let's do this!" is clicked,
// once per gist revision (a hash of the text is kept in localStorage). Clicking it opens a resizable
// window that "prints" the markdown in like an old browser. Remote text only ever goes in via textContent.
(() => {
  const GIST = 'f3a82f85c64a27e120899107a7b5eb94';
  const USER = 'etangaming123';
  const RAW = `https://gist.githubusercontent.com/${USER}/${GIST}/raw`;
  const PAGE = `https://gist.github.com/${USER}/${GIST}`;
  const KEY = 'etan:notice';
  const DELAY = 2200;
  const DESC_MAX = 120;
  const LEAD = 1100; // "connecting" pause before the cover starts moving
  const SVG = 'http://www.w3.org/2000/svg';

  const reduced = () => document.documentElement.dataset.reduce === '1';
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const icon = (cls, d) => { // static, trusted path data
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', '0 0 16 16');
    s.setAttribute('class', cls);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('shape-rendering', 'crispEdges');
    s.innerHTML = d;
    return s;
  };
  const ENVELOPE = '<path fill="#fff" stroke="#000" d="M1.5 3.5h13v9h-13z"/><path fill="none" stroke="#000" d="M1.5 3.5l6.5 5.5 6.5-5.5"/><path fill="#552B9D" d="M2 4h12v1H2z" opacity=".0"/>';
  const PAGEICON = '<path fill="#fff" stroke="#000" d="M3.5 1.5h6l3 3v10h-9z"/><path fill="#bb88ee" d="M5 6h6v1H5zM5 8h6v1H5zM5 10h4v1H5z"/>';

  /* ---------- storage ---------- */
  const seen = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const remember = (h) => { try { localStorage.setItem(KEY, h); } catch (e) {} };
  // cyrb53: tiny, no secure-context needed
  function hash(s) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  /* ---------- markdown (the small useful subset) -> DOM ---------- */
  const INLINE = /\\([\\`*_{}\[\]()#+\-.!>~|])|(`+)([\s\S]+?)\2|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|\*([^\s*][\s\S]*?)\*|(?<![\w])_([^\s_][\s\S]*?)_(?![\w])|~~([\s\S]+?)~~|(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)])|(  +\n|\\\n)/g;
  const safeUrl = (u) => /^(https?:|mailto:)/i.test(u) ? u : null;
  function inline(text, parent) {
    let last = 0;
    for (const m of text.matchAll(INLINE)) {
      if (m.index > last) parent.append(text.slice(last, m.index));
      last = m.index + m[0].length;
      if (m[1] != null) parent.append(m[1]);
      else if (m[3] != null) parent.append(el('code', null, m[3].trim()));
      else if (m[5] != null) {
        const u = safeUrl(m[5]);
        if (u && /^https?:/i.test(u)) { const i = el('img'); i.src = u; i.alt = m[4]; i.loading = 'lazy'; parent.append(i); }
        else parent.append(m[4]);
      } else if (m[7] != null) {
        const u = safeUrl(m[7]);
        if (u) { const a = el('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer'; inline(m[6], a); parent.append(a); }
        else inline(m[6], parent);
      } else if (m[8] != null || m[9] != null) { const b = el('strong'); inline(m[8] ?? m[9], b); parent.append(b); }
      else if (m[10] != null || m[11] != null) { const i = el('em'); inline(m[10] ?? m[11], i); parent.append(i); }
      else if (m[12] != null) { const d = el('del'); inline(m[12], d); parent.append(d); }
      else if (m[13] != null) { const a = el('a', null, m[13]); a.href = m[13]; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.append(a); }
      else parent.append(el('br'));
    }
    if (last < text.length) parent.append(text.slice(last));
  }

  // returns an array of block elements
  function blocks(md) {
    const lines = md.replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;
    const blank = (l) => !l.trim();
    const special = (l) => /^(#{1,6}\s|>|\s*([-*+]|\d+[.)])\s|```|\s*([-*_]\s*){3,}$)/.test(l);
    while (i < lines.length) {
      const l = lines[i];
      if (blank(l)) { i++; continue; }
      let m;
      if (/^```/.test(l)) {
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        const pre = el('pre'); pre.append(el('code', null, buf.join('\n')));
        out.push(pre);
      } else if ((m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l))) {
        const h = el('h' + m[1].length); inline(m[2], h); out.push(h); i++;
      } else if (/^\s*([-*_]\s*){3,}$/.test(l)) {
        out.push(el('hr')); i++;
      } else if (/^>/.test(l)) {
        const buf = [];
        while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
        const q = el('blockquote');
        for (const b of blocks(buf.join('\n'))) q.append(b);
        out.push(q);
      } else if (/^\s*([-*+]|\d+[.)])\s/.test(l)) {
        const ordered = /^\s*\d/.test(l);
        const list = el(ordered ? 'ol' : 'ul');
        while (i < lines.length && /^\s*([-*+]|\d+[.)])\s/.test(lines[i])) {
          const li = el('li'); inline(lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, ''), li); list.append(li); i++;
        }
        out.push(list);
      } else {
        const buf = [];
        while (i < lines.length && !blank(lines[i]) && (buf.length === 0 || !special(lines[i]))) buf.push(lines[i++]);
        const p = el('p'); inline(buf.join('\n').replace(/([^ \\\n])\n(?=.)/g, '$1 '), p); out.push(p);
      }
    }
    return out;
  }

  /* ---------- gist -> { title, desc, md, h } ---------- */
  function parse(md) {
    const lines = md.split('\n');
    const at = lines.findIndex((l) => l.trim());
    const head = el('div');
    inline(lines[at].replace(/^\s*#{1,6}\s*/, '').trim(), head);
    const title = head.textContent.trim() || 'New message';
    const rest = el('div');
    for (const b of blocks(lines.slice(at + 1).join('\n'))) rest.append(b);
    let desc = [...rest.children].map((b) => b.textContent.trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ');
    if (desc.length > DESC_MAX) desc = desc.slice(0, DESC_MAX).replace(/\s+\S*$/, '').replace(/[\s,;:.\-]+$/, '') + '...';
    return { title, desc, md, h: hash(md) };
  }

  let data = null;
  let ready = null;
  function load() {
    if (ready) return ready;
    ready = fetch(RAW, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => { t = t.trim(); data = t ? parse(t) : null; return data; })
      .catch(() => { ready = null; return null; });
    return ready;
  }

  /* ---------- toast ---------- */
  let toast = null;
  function closeToast() {
    if (!toast) return;
    toast.remove();
    toast = null;
  }
  function showToast(d) {
    closeToast();
    const t = el('div', 'nt-toast');
    t.setAttribute('role', 'status');

    const bar = el('div', 'nt-bar');
    bar.append(icon('nt-ico', ENVELOPE), el('span', 'nt-bar-t', 'New message'));
    const x = el('button', 'nt-btn nt-x');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss notification');
    x.append(icon('nt-g', '<path d="M3 3l10 10M13 3L3 13" stroke="#000" stroke-width="2" fill="none"/>'));
    x.addEventListener('click', closeToast);
    bar.append(x);

    const body = el('button', 'nt-body');
    body.type = 'button';
    body.append(icon('nt-big', ENVELOPE));
    const txt = el('span', 'nt-txt');
    txt.append(el('b', 'nt-title', d.title));
    if (d.desc) txt.append(el('span', 'nt-desc', d.desc));
    txt.append(el('span', 'nt-hint', 'Click to read'));
    body.append(txt);
    body.addEventListener('click', () => { closeToast(); openWindow(d, { print: true }); });

    t.append(bar, body);
    document.body.append(t);
    toast = t;
    remember(d.h);
  }

  /* ---------- window ---------- */
  let win = null;
  let printed = false; // only the first open "loads"; later ones are instant
  const MIN_W = 240, MIN_H = 160;

  function openWindow(d, { print = false } = {}) {
    if (win) { win.el.focus(); return; }
    const el_ = el('div', 'nt-win');
    el_.setAttribute('role', 'dialog');
    el_.setAttribute('aria-modal', 'false');
    el_.setAttribute('aria-label', d.title);
    el_.tabIndex = -1;

    const bar = el('div', 'nt-bar nt-drag');
    bar.append(icon('nt-ico', PAGEICON), el('span', 'nt-bar-t', `${d.title} - Message`));
    const mk = (cls, label, path) => {
      const b = el('button', 'nt-btn ' + cls);
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.append(icon('nt-g', path));
      return b;
    };
    const max = mk('nt-max', 'Maximize', '<path d="M3.5 3.5h9v9h-9z" stroke="#000" stroke-width="1" fill="none"/><path d="M3 3h10v2H3z" fill="#000"/>');
    const close = mk('nt-x', 'Close', '<path d="M3 3l10 10M13 3L3 13" stroke="#000" stroke-width="2" fill="none"/>');
    const btns = el('span', 'nt-btns');
    btns.append(max, close);
    bar.append(btns);

    const addr = el('div', 'nt-addr');
    addr.append(el('span', 'nt-addr-l', 'Address'));
    const url = el('a', 'nt-addr-f', PAGE);
    url.href = PAGE; url.target = '_blank'; url.rel = 'noopener noreferrer';
    const throb = el('span', 'nt-throb');
    throb.setAttribute('aria-hidden', 'true');
    addr.append(url, throb);

    const view = el('div', 'nt-view');
    view.tabIndex = 0;
    view.setAttribute('aria-label', 'Message contents');
    const page = el('div', 'nt-page');
    view.append(page);

    const status = el('div', 'nt-status');
    const msg = el('span', 'nt-cell nt-msg');
    msg.setAttribute('role', 'status');
    const prog = el('span', 'nt-cell nt-prog');
    const fill = el('i');
    prog.append(fill);
    prog.setAttribute('aria-hidden', 'true');
    const zone = el('span', 'nt-cell nt-zone', 'Internet');
    status.append(msg, prog, zone);

    const grips = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].map((d_) => {
      const g = el('div', 'nt-rz nt-rz-' + d_);
      g.dataset.dir = d_;
      g.setAttribute('aria-hidden', 'true');
      return g;
    });
    const wrap = el('div', 'nt-wrap');
    wrap.append(view);
    el_.append(bar, addr, wrap, status, ...grips);
    document.body.append(el_);

    // size + place: roomy on desktop, nearly full on a phone; each open staggers a little
    const vw = innerWidth, vh = innerHeight;
    const w = Math.min(560, vw - 16), h = Math.min(440, Math.round(vh * .78));
    place(el_, Math.round((vw - w) / 2), Math.max(8, Math.round((vh - h) / 2) - 10), w, h);

    const st = { el: el_, max: false, saved: null, stop: null };
    win = st;

    const doClose = () => {
      st.stop?.();
      el_.remove();
      win = null;
      removeEventListener('resize', fit);
    };
    const fit = () => { if (!st.max) clamp(el_); };
    addEventListener('resize', fit);
    close.addEventListener('click', doClose);
    el_.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); doClose(); } });

    const toggleMax = () => {
      if (st.max) {
        st.max = false;
        el_.classList.remove('is-max');
        place(el_, ...st.saved);
        max.setAttribute('aria-label', 'Maximize');
      } else {
        const r = el_.getBoundingClientRect();
        st.saved = [r.left, r.top, r.width, r.height];
        st.max = true;
        el_.classList.add('is-max');
        max.setAttribute('aria-label', 'Restore');
      }
    };
    max.addEventListener('click', toggleMax);
    bar.addEventListener('dblclick', (e) => { if (!e.target.closest('.nt-btn')) toggleMax(); });

    // drag by title bar
    bar.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.nt-btn') || st.max) return;
      const r = el_.getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => place(el_, ev.clientX - dx, ev.clientY - dy, r.width, r.height);
      const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });

    // resize from any edge / corner
    for (const g of grips) {
      g.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || st.max) return;
        e.preventDefault();
        const dir = g.dataset.dir;
        const r = el_.getBoundingClientRect();
        const sx = e.clientX, sy = e.clientY;
        g.setPointerCapture(e.pointerId);
        const move = (ev) => {
          let { left, top, width, height } = r;
          const ddx = ev.clientX - sx, ddy = ev.clientY - sy;
          if (dir.includes('e')) width = Math.min(r.width + ddx, innerWidth - r.left);
          if (dir.includes('s')) height = Math.min(r.height + ddy, innerHeight - r.top);
          if (dir.includes('w')) { const nl = Math.max(0, Math.min(r.left + ddx, r.right - MIN_W)); width = r.right - nl; left = nl; }
          if (dir.includes('n')) { const nt = Math.max(0, Math.min(r.top + ddy, r.bottom - MIN_H)); height = r.bottom - nt; top = nt; }
          place(el_, left, top, Math.max(MIN_W, width), Math.max(MIN_H, height));
        };
        const up = () => { g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up); };
        g.addEventListener('pointermove', move);
        g.addEventListener('pointerup', up);
        g.addEventListener('pointercancel', up);
      });
    }

    const instant = !print || printed || reduced();
    printed = true;
    for (const b of blocks(d.md)) page.append(b);
    const finish = () => {
      cover?.remove();
      page.removeAttribute('aria-busy');
      msg.textContent = 'Done';
      fill.style.animation = 'none';
      fill.style.width = '100%';
      throb.classList.remove('is-busy');
      throb.classList.add('is-done');
      el_.classList.remove('is-wiping');
      st.stop = null;
    };
    let cover = null;
    if (instant) finish();
    else {
      // everything is already there; a cover over it slides down, like a page painting in
      cover = el('div', 'nt-cover');
      wrap.append(cover);
      page.setAttribute('aria-busy', 'true');
      msg.textContent = 'Connecting to gist.githubusercontent.com...';
      throb.classList.add('is-busy');
      const t = setTimeout(() => { msg.textContent = `Opening page ${PAGE}...`; el_.classList.add('is-wiping'); }, LEAD);
      cover.addEventListener('animationend', finish);
      st.stop = () => clearTimeout(t);
    }
    el_.focus({ preventScroll: true });
  }

  function place(n, left, top, w, h) {
    w = Math.min(Math.max(w, Math.min(MIN_W, innerWidth)), innerWidth);
    h = Math.min(Math.max(h, Math.min(MIN_H, innerHeight)), innerHeight);
    left = Math.max(0, Math.min(left, innerWidth - w));
    top = Math.max(0, Math.min(top, innerHeight - h));
    Object.assign(n.style, { left: left + 'px', top: top + 'px', width: w + 'px', height: h + 'px' });
  }
  function clamp(n) {
    const r = n.getBoundingClientRect();
    place(n, r.left, r.top, r.width, r.height);
  }

  /* ---------- wiring ---------- */
  // faint little button, bottom right, to bring the message back
  let again = null;
  function showAgain() {
    if (again) return;
    again = el('button', 'nt-again');
    again.type = 'button';
    again.setAttribute('aria-label', 'Reopen global message');
    again.title = 'Reopen global message';
    again.append(icon('nt-g', ENVELOPE));
    again.addEventListener('click', () => load().then((d) => { if (d) { closeToast(); openWindow(d, { print: true }); } }));
    document.body.append(again);
  }

  let armed = false;
  function onStart() {
    if (armed) return;
    armed = true;
    load().then((d) => { if (d) showAgain(); });
    Promise.all([load(), new Promise((r) => setTimeout(r, DELAY))]).then(([d]) => {
      armed = false;
      if (!d || d.h === seen()) return;
      showToast(d);
    });
  }
  const start = document.getElementById('start');
  if (start) start.addEventListener('click', onStart);
  load(); // warm it so the toast isn't waiting on the network

  // handy from the console: Notify.reset() forgets the seen hash, Notify.open() opens the window
  window.Notify = {
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} },
    open() { load().then((d) => d && openWindow(d, { print: true })); },
  };
})();
