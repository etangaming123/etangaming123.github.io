// "HisPath" window: the St in Stuff (or the backtick key) opens a resizable Win98 browser window on
// HisPath.html. Same chrome, resizing and cover animation as the global message window (notify.js / notify.css).
(() => {
  const SRC = 'HisPath.html';
  const PAGE = 'https://etangaming.xyz/HisPath.html';
  const TITLE = 'Following His path once again';
  const LEAD = 1100;
  const MIN_W = 240, MIN_H = 160;
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
  const PAGEICON = '<path fill="#fff" stroke="#000" d="M3.5 1.5h6l3 3v10h-9z"/><path fill="#bb88ee" d="M5 6h6v1H5zM5 8h6v1H5zM5 10h4v1H5z"/>';

  let win = null;
  let printed = false; // only the first open "loads"; later ones are instant
  let returnTo = null;

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

  function openWindow() {
    if (win) { win.el.focus(); return; }
    returnTo = document.activeElement;
    const el_ = el('div', 'nt-win');
    el_.setAttribute('role', 'dialog');
    el_.setAttribute('aria-modal', 'false');
    el_.setAttribute('aria-label', TITLE);
    el_.tabIndex = -1;

    const bar = el('div', 'nt-bar nt-drag');
    bar.append(icon('nt-ico', PAGEICON), el('span', 'nt-bar-t', `${TITLE} - HisPath`));
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
    url.href = SRC; url.target = '_blank'; url.rel = 'noopener';
    const throb = el('span', 'nt-throb');
    throb.setAttribute('aria-hidden', 'true');
    addr.append(url, throb);

    const view = el('div', 'nt-view nt-frame');
    const frame = el('iframe');
    frame.src = SRC;
    frame.title = TITLE;
    frame.setAttribute('loading', 'eager');
    view.append(frame);

    const status = el('div', 'nt-status');
    const msg = el('span', 'nt-cell nt-msg');
    msg.setAttribute('role', 'status');
    const prog = el('span', 'nt-cell nt-prog');
    const fill = el('i');
    prog.append(fill);
    prog.setAttribute('aria-hidden', 'true');
    status.append(msg, prog, el('span', 'nt-cell nt-zone', 'Internet'));

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

    // roomy on desktop, nearly full on a phone
    const vw = innerWidth, vh = innerHeight;
    const w = Math.min(560, vw - 16), h = Math.min(440, Math.round(vh * .78));
    place(el_, Math.round((vw - w) / 2), Math.max(8, Math.round((vh - h) / 2) - 10), w, h);

    const st = { el: el_, max: false, saved: null, stop: null };
    win = st;

    const fit = () => { if (!st.max) clamp(el_); };
    const doClose = () => {
      st.stop?.();
      el_.remove();
      win = null;
      removeEventListener('resize', fit);
      if (returnTo && returnTo.focus && document.contains(returnTo)) returnTo.focus();
    };
    addEventListener('resize', fit);
    close.addEventListener('click', doClose);
    el_.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); doClose(); } });
    st.close = doClose;

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

    // drag by title bar. the iframe swallows pointer events, so park a shield over it while dragging/resizing
    const shield = (on) => { frame.style.pointerEvents = on ? 'none' : ''; };
    bar.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.nt-btn') || st.max) return;
      const r = el_.getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      bar.setPointerCapture(e.pointerId);
      shield(true);
      const move = (ev) => place(el_, ev.clientX - dx, ev.clientY - dy, r.width, r.height);
      const up = () => { shield(false); bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
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
        shield(true);
        const move = (ev) => {
          let { left, top, width, height } = r;
          const ddx = ev.clientX - sx, ddy = ev.clientY - sy;
          if (dir.includes('e')) width = Math.min(r.width + ddx, innerWidth - r.left);
          if (dir.includes('s')) height = Math.min(r.height + ddy, innerHeight - r.top);
          if (dir.includes('w')) { const nl = Math.max(0, Math.min(r.left + ddx, r.right - MIN_W)); width = r.right - nl; left = nl; }
          if (dir.includes('n')) { const nt = Math.max(0, Math.min(r.top + ddy, r.bottom - MIN_H)); height = r.bottom - nt; top = nt; }
          place(el_, left, top, Math.max(MIN_W, width), Math.max(MIN_H, height));
        };
        const up = () => { shield(false); g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up); };
        g.addEventListener('pointermove', move);
        g.addEventListener('pointerup', up);
        g.addEventListener('pointercancel', up);
      });
    }

    // cover animation: the page is already there; a cover slides down like it is painting in
    const instant = printed || reduced();
    printed = true;
    let cover = null;
    const finish = () => {
      cover?.remove();
      msg.textContent = 'Done';
      fill.style.animation = 'none';
      fill.style.width = '100%';
      throb.classList.remove('is-busy');
      throb.classList.add('is-done');
      el_.classList.remove('is-wiping');
      st.stop = null;
    };
    if (instant) finish();
    else {
      cover = el('div', 'nt-cover');
      wrap.append(cover);
      msg.textContent = 'Connecting to etangaming.xyz...';
      throb.classList.add('is-busy');
      const t = setTimeout(() => { msg.textContent = `Opening page ${PAGE}...`; el_.classList.add('is-wiping'); }, LEAD);
      cover.addEventListener('animationend', finish);
      st.stop = () => clearTimeout(t);
    }
    el_.focus({ preventScroll: true });
  }

  document.getElementById('sh').addEventListener('click', openWindow);
  addEventListener('keydown', (e) => {
    if (e.key === '`' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      win ? win.close() : openWindow();
    }
  });
})();
