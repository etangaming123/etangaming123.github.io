// Live stat card fed by a plain-text gist (same source as the old maimai page).
// Format it understands:  first line  "Headline" [tag]   ·   "KEY: value" lines become stat plates
//                         other lines become nameplate rows ("Name [Tag]")   ·   "Version:" / "Last Updated" go in header/footer.
(() => {
  const cache = {};
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const URL_RE = /(https?:\/\/[^\s<>"']+)/g;

  // text with clickable https links, built as DOM (never innerHTML)
  function linked(text) {
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(URL_RE)) {
      frag.append(text.slice(last, m.index));
      const a = el('a', 'mm-link', m[0]);
      a.href = m[0]; a.target = '_blank'; a.rel = 'noopener noreferrer';
      frag.append(a);
      last = m.index + m[0].length;
    }
    frag.append(text.slice(last));
    return frag;
  }

  function parse(raw) {
    const out = { headline: '', tag: '', version: '', plates: [], stats: [], rating: null, updated: '', notes: [], extra: [] };
    const lines = raw.replace(/\r/g, '').split('\n').map((l) => l.trim());
    let first = true;
    for (const line of lines) {
      if (!line) continue;
      if (first) {
        first = false;
        const m = line.match(/^["“]?(.*?)["”]?\s*(?:\[([^\]]+)\])?$/);
        out.headline = (m?.[1] || line).trim();
        out.tag = m?.[2] || '';
        continue;
      }
      if (/^\(.*\)$/.test(line)) { out.notes.push(line.slice(1, -1)); continue; }
      const kv = line.match(/^([^:：]{1,48}?)\s*[:：]\s*(.+)$/);
      if (kv && !/^https?$/i.test(kv[1])) {
        const key = kv[1].replace(/でらっくす/g, 'DX').trim();
        const val = kv[2].trim();
        if (/^version$/i.test(key)) out.version = val;
        else if (/^last updated/i.test(key)) out.updated = val;
        else if (/rating/i.test(key) && !out.rating) out.rating = { key, val };
        else out.stats.push({ key, val });
        continue;
      }
      const np = line.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
      if (np) out.plates.push({ name: np[1], tag: np[2] });
      else out.plates.push({ name: line, tag: '' });
    }
    return out;
  }

  function render(box, cfg, raw, when) {
    const d = parse(raw);
    const parts = [];

    const head = el('div', 'mm-head');
    const t = el('div', 'mm-titles');
    t.append(el('span', 'mm-kicker', d.version || 'Player card'));
    t.append(el('h4', 'mm-title', d.headline || 'Stats'));
    head.append(t);
    if (d.tag) head.append(el('span', 'mm-date', d.tag));
    parts.push(head);

    if (d.plates.length) {
      const wrap = el('div', 'mm-plates');
      d.plates.forEach((p, i) => {
        const row = el('div', `mm-plate p${i % 3}`);
        row.append(el('span', 'mm-pname', p.name));
        if (p.tag) row.append(el('span', 'mm-ptag', p.tag));
        wrap.append(row);
      });
      parts.push(wrap);
    }

    const grid = el('div', 'mm-grid');
    if (d.rating) {
      const r = el('div', 'mm-rating');
      r.append(el('span', 'mm-rk', d.rating.key), el('b', 'mm-rv', d.rating.val));
      grid.append(r);
    }
    const stats = el('dl', 'mm-stats');
    d.stats.forEach((s) => {
      const c = el('div', 'mm-stat');
      c.append(el('dt', '', s.key), el('dd', '', s.val));
      stats.append(c);
    });
    grid.append(stats);
    parts.push(grid);

    if (d.extra.length) parts.push(el('p', 'mm-extra', d.extra.join(' ')));

    const foot = el('div', 'mm-foot');
    const upd = d.updated ? `updated ${d.updated}` : `fetched ${when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const note = d.notes.length ? ` · ${d.notes.join(' · ')}` : '';
    const f = el('span', 'mm-upd');
    f.append(linked(upd + note));
    const refresh = el('button', 'mm-btn', 'Refresh');
    refresh.type = 'button';
    refresh.addEventListener('click', () => { delete cache[cfg.url]; start(box, cfg); });
    foot.append(f, refresh);
    parts.push(foot);

    box.replaceChildren(...parts);
    box.dataset.state = 'ready';
  }

  function fail(box, cfg, msg) {
    box.dataset.state = 'error';
    const retry = el('button', 'mm-btn', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => { delete cache[cfg.url]; start(box, cfg); });
    box.replaceChildren(el('p', 'mm-msg', msg), retry);
  }

  async function start(box, cfg) {
    const hit = cache[cfg.url];
    if (hit) return render(box, cfg, hit.raw, hit.when);
    box.dataset.state = 'loading';
    box.replaceChildren(el('p', 'mm-msg', 'Loading stats...'));
    try {
      const r = await fetch(cfg.url, { cache: 'no-cache' });
      if (!r.ok) return fail(box, cfg, `Failed to load stats. Status: ${r.status}`);
      const raw = await r.text();
      cache[cfg.url] = { raw, when: new Date() };
      render(box, cfg, raw, cache[cfg.url].when);
    } catch (e) {
      fail(box, cfg, 'Failed to load stats due to an error. (Offline, or the gist is blocked.)');
    }
  }

  // the box shows a placeholder; fetching starts only once the panel is actually open (kickStats)
  window.mountStats = (box, cfg) => {
    box.dataset.state = 'idle';
    box.replaceChildren(el('p', 'mm-msg', 'Loading stats...'));
    box._start = () => { box._start = null; start(box, cfg); };
    if (cache[cfg.url]) box._start();
  };
  window.kickStats = (root) => root.querySelectorAll('.mm')?.forEach((b) => b._start && b._start());
})();
