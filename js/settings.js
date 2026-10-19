// Settings + local storage. Adds a hardcoded "settings" song (last in the wheel) and the stores behind it.
// Everything lives in this browser's localStorage under etan:*  -  nothing is ever sent anywhere.
//   Settings.get(key) / Settings.set(key, v)   display + behaviour prefs
//   Settings.saved / Settings.recent           message stores (see messages.js)
(() => {
  const KEYS = { prefs: 'etan:settings', saved: 'etan:saved', recent: 'etan:recent' };
  const ID_RE = /^[0-9a-f]{8,40}$/i;
  const MAX_TEXT = 20000;
  const MAX_SAVED = 200;
  const root = document.documentElement;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- storage (falls back to memory when localStorage is blocked) ---------- */
  const mem = {};
  const read = (k, d) => {
    try { const v = localStorage.getItem(k); return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; }
  };
  const write = (k, v) => {
    mem[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  };
  const drop = (k) => { delete mem[k]; try { localStorage.removeItem(k); } catch (e) {} };
  const poke = (what) => window.dispatchEvent(new CustomEvent('etan:store', { detail: what }));

  /* ---------- prefs ---------- */
  const DEFAULTS = { motion: 'sync', autoload: false, grain: true, typing: true, sat: 100, con: 100, bri: 100, text: 100 };
  const RANGE = { sat: [50, 150], con: [70, 130], bri: [60, 130], text: [85, 140] };
  let prefs = { ...DEFAULTS };
  function clean(raw) {
    const o = { ...DEFAULTS };
    if (!raw || typeof raw !== 'object') return o;
    if (['sync', 'on', 'off'].includes(raw.motion)) o.motion = raw.motion;
    for (const k of ['autoload', 'grain', 'typing']) if (typeof raw[k] === 'boolean') o[k] = raw[k];
    for (const k of Object.keys(RANGE)) {
      const n = Number(raw[k]);
      if (Number.isFinite(n)) o[k] = Math.max(RANGE[k][0], Math.min(RANGE[k][1], Math.round(n)));
    }
    return o;
  }
  prefs = clean(read(KEYS.prefs, null));

  const reduced = () => prefs.motion === 'on' || (prefs.motion === 'sync' && mq.matches);
  function apply() {
    root.dataset.reduce = reduced() ? '1' : '';
    root.dataset.grain = prefs.grain ? '' : 'off';
    root.style.setProperty('--ts', prefs.text / 100);
    // filter on <html>: leaves fixed children alone. Skip it entirely at defaults (a filter costs a repaint layer)
    const f = [];
    if (prefs.sat !== 100) f.push(`saturate(${prefs.sat}%)`);
    if (prefs.con !== 100) f.push(`contrast(${prefs.con}%)`);
    if (prefs.bri !== 100) f.push(`brightness(${prefs.bri}%)`);
    root.style.filter = f.join(' ');
  }
  mq.addEventListener('change', () => { apply(); poke('prefs'); });

  const Settings = {
    DEFAULTS, RANGE,
    get: (k) => prefs[k],
    all: () => ({ ...prefs }),
    reduced,
    set(k, v) {
      prefs = clean({ ...prefs, [k]: v });
      write(KEYS.prefs, prefs);
      apply();
      poke('prefs');
    },
    resetDisplay() {
      for (const k of ['sat', 'con', 'bri', 'text']) prefs[k] = DEFAULTS[k];
      write(KEYS.prefs, prefs);
      apply();
      poke('prefs');
    },
    resetAll() {
      prefs = { ...DEFAULTS };
      for (const k of Object.values(KEYS)) drop(k);
      apply();
      poke('prefs'); poke('saved'); poke('recent');
    },
  };

  /* ---------- saved messages: [{ id, savedAt, text?, cachedAt? }] ---------- */
  const goodEntry = (e) => e && typeof e.id === 'string' && ID_RE.test(e.id);
  const savedList = () => (read(KEYS.saved, []) || []).filter(goodEntry);
  const saved = {
    list: savedList,
    get: (id) => savedList().find((e) => e.id === id) || null,
    // text given -> also keep a local copy; omitted -> keep an existing copy untouched
    save(id, text) {
      if (!ID_RE.test(id)) return false;
      const all = savedList();
      let e = all.find((x) => x.id === id);
      if (!e) {
        if (all.length >= MAX_SAVED) return false;
        e = { id, savedAt: Date.now() };
        all.push(e);
      }
      if (typeof text === 'string') { e.text = text.slice(0, MAX_TEXT); e.cachedAt = Date.now(); }
      write(KEYS.saved, all);
      poke('saved');
      return true;
    },
    remove(id) { write(KEYS.saved, savedList().filter((e) => e.id !== id)); poke('saved'); },
    clear() { drop(KEYS.saved); poke('saved'); },
    export() {
      return JSON.stringify({ app: 'etan://', version: 1, exported: new Date().toISOString(), messages: savedList() }, null, 2);
    },
    // returns how many entries were new
    import(json) {
      let data;
      try { data = JSON.parse(json); } catch (e) { return -1; }
      const incoming = Array.isArray(data) ? data : data?.messages;
      if (!Array.isArray(incoming)) return -1;
      const all = savedList();
      let added = 0;
      for (const e of incoming) {
        if (!goodEntry(e) || all.length >= MAX_SAVED) continue;
        const text = typeof e.text === 'string' ? e.text.slice(0, MAX_TEXT) : undefined;
        const have = all.find((x) => x.id === e.id);
        if (have) { if (text != null && have.text == null) { have.text = text; have.cachedAt = Number(e.cachedAt) || Date.now(); } continue; }
        const n = { id: e.id, savedAt: Number(e.savedAt) || Date.now() };
        if (text != null) { n.text = text; n.cachedAt = Number(e.cachedAt) || Date.now(); }
        all.push(n);
        added++;
      }
      write(KEYS.saved, all);
      poke('saved');
      return added;
    },
  };

  /* ---------- recent messages: last 3 opened, newest first ---------- */
  const recentList = () => (read(KEYS.recent, []) || []).filter(goodEntry).slice(0, 3);
  const recent = {
    list: recentList,
    add(id) {
      if (!ID_RE.test(id)) return;
      write(KEYS.recent, [{ id, at: Date.now() }, ...recentList().filter((e) => e.id !== id)].slice(0, 3));
      poke('recent');
    },
    remove(id) { write(KEYS.recent, recentList().filter((e) => e.id !== id)); poke('recent'); },
    clear() { drop(KEYS.recent); poke('recent'); },
  };

  /* ---------- helpers ---------- */
  function download(name, text, type = 'text/plain') {
    const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const when = (t) => new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

  Object.assign(Settings, { saved, recent, download, when, ID_RE });
  window.Settings = Settings;
  apply();

  /* ---------- the hardcoded song ---------- */
  SONGS.push({
    id: 'settings',
    title: 'Settings',
    sub: 'Fine-tune the site to your liking.',
    chips: ['Local', 'No account needed'],
    a: '#F395F6',
    b: '#57E1E6',
    ink: '#57E1E6',
    jacket: { pattern: 'grid', text: 'SET' },
    detail: { blocks: [{ type: 'settings' }] },
  });

  /* ---------- panel UI ---------- */
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const btn = (label, onClick, alt = true) => {
    const b = el('button', `dw-btn${alt ? ' dw-alt' : ''}`, label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  };
  let uid = 0;

  function row(name, desc) {
    const r = el('div', 'set-row');
    r.append(el('div', 'set-name', name));
    if (desc) r.append(el('p', 'set-desc', desc));
    return r;
  }
  // segmented radio group: options = [[value, label], ...]
  function segment(name, options, current, onPick) {
    const fs = el('fieldset', 'seg');
    const lg = el('legend', 'sr', name);
    fs.append(lg);
    const group = `seg-${++uid}`;
    for (const [v, label] of options) {
      const l = el('label');
      const i = el('input');
      i.type = 'radio'; i.name = group; i.value = String(v);
      i.checked = String(v) === String(current);
      i.addEventListener('change', () => onPick(v));
      l.append(i, el('span', null, label));
      fs.append(l);
    }
    return fs;
  }
  const onOff = (name, current, onPick) => segment(name, [[false, 'Off'], [true, 'On']], current, (v) => onPick(v === true || v === 'true'));

  function slider(key, label) {
    const [min, max] = RANGE[key];
    const wrap = el('div', 'set-slider');
    const id = `rng-${key}`;
    const l = el('label', 'set-sl-l', label);
    l.htmlFor = id;
    const out = el('output', 'set-sl-o');
    out.htmlFor = id;
    const i = el('input');
    i.type = 'range'; i.id = id; i.min = min; i.max = max; i.step = 5; i.value = prefs[key];
    const show = () => { out.textContent = `${i.value}%`; i.setAttribute('aria-valuetext', `${i.value} percent`); };
    show();
    i.addEventListener('input', () => { show(); Settings.set(key, +i.value); });
    wrap.append(l, i, out);
    return wrap;
  }

  function savedTable(box) {
    const list = saved.list();
    box.replaceChildren();
    if (!list.length) {
      box.append(el('p', 'set-empty', 'Nothing saved yet. Open a message and hit "Save ID" or "Save + cache copy".'));
      return;
    }
    const t = el('table', 'set-table');
    t.append(el('caption', 'sr', 'Saved messages'));
    const hr = el('tr');
    for (const h of ['Message ID', 'Saved', 'Copy', '']) { const th = el('th', null, h); th.scope = 'col'; hr.append(th); }
    const head = el('thead'); head.append(hr);
    const tb = el('tbody');
    for (const e of list) {
      const tr = el('tr');
      const c = (label, content) => { const td = el('td'); td.dataset.label = label; td.append(content); tr.append(td); return td; };
      const a = el('a', 'set-id', e.id);
      a.href = `#/messages/info/${e.id}`;
      c('Message ID', a);
      c('Saved', document.createTextNode(when(e.savedAt)));
      c('Copy', document.createTextNode(e.text != null ? `Cached ${when(e.cachedAt || e.savedAt)}` : 'ID only'));
      const acts = el('div', 'set-acts');
      if (e.text != null) acts.append(btn('.txt', () => download(`message-${e.id}.txt`, e.text)));
      acts.append(btn('Delete', () => saved.remove(e.id)));
      c('', acts);
      tb.append(tr);
    }
    t.append(head, tb);
    box.append(t);
  }

  function recentList2(box) {
    const list = recent.list();
    box.replaceChildren();
    if (!list.length) { box.append(el('p', 'set-empty', 'No recent messages.')); return; }
    const ul = el('ul', 'set-recent');
    for (const e of list) {
      const li = el('li');
      const a = el('a', 'set-id', e.id);
      a.href = `#/messages/info/${e.id}`;
      li.append(a, el('span', 'set-when', when(e.at)));
      const acts = el('div', 'set-acts');
      if (!saved.get(e.id)) acts.append(btn('Save ID', () => saved.save(e.id)));
      acts.append(btn('Delete', () => recent.remove(e.id)));
      li.append(acts);
      ul.append(li);
    }
    box.append(ul);
  }

  window.mountSettings = (box) => {
    box.replaceChildren();
    const group = (title) => { const g = el('section', 'set-group'); g.append(el('h4', 'b-sub', title)); box.append(g); return g; };

    /* motion + behaviour */
    let g = group('Motion & loading');
    let r = row('Reduced motion', '"Sync" follows your device setting. Turning this on will disable animations and make scrolling instant.');
    r.append(segment('Reduced motion', [['off', 'Off'], ['on', 'On'], ['sync', 'Sync with system']], prefs.motion, (v) => Settings.set('motion', v)));
    const sysNote = el('p', 'set-desc set-sys');
    const sysText = () => { sysNote.textContent = `Your system currently says: ${mq.matches ? 'reduce motion' : 'no preference'}.`; };
    sysText();
    r.append(sysNote);
    g.append(r);
    r = row('Typing effect', 'The etan:// thingy at the top - and when it types... or something.');
    r.append(onOff('Typing effect', prefs.typing, (v) => Settings.set('typing', v)));
    g.append(r);
    r = row('Auto-load external content', 'Load Discord server widgets instantly (rather than you clicking a button). Contacts discord.com.');
    r.append(onOff('Auto-load external content', prefs.autoload, (v) => Settings.set('autoload', v)));
    g.append(r);

    /* display */
    g = group('Display');
    r = row('Colour & size', 'Applies to the whole site, go crazy!');
    r.append(slider('sat', 'Saturation'), slider('con', 'Contrast'), slider('bri', 'Brightness'), slider('text', 'Panel text size'));
    const rs = el('div', 'set-acts');
    rs.append(btn('Reset display', () => { Settings.resetDisplay(); window.mountSettings(box); }));
    r.append(rs);
    g.append(r);
    r = row('Grain & scanlines', 'The noisy overlay on top of everything.');
    r.append(onOff('Grain and scanlines', prefs.grain, (v) => Settings.set('grain', v)));
    g.append(r);

    /* recent */
    g = group('Recent messages');
    g.append(el('p', 'set-desc', 'The last 3 messages you opened in this browser.'));
    const recBox = el('div', 'set-box');
    g.append(recBox);
    const clr = el('div', 'set-acts');
    clr.append(btn('Clear recent', () => recent.clear()));
    g.append(clr);

    /* saved */
    g = group('Saved messages');
    g.append(el('p', 'set-desc', 'IDs you saved from the Messages page. A cached copy still opens if the gist is deleted.'));
    const savBox = el('div', 'set-box');
    g.append(savBox);
    const sv = el('div', 'set-acts');
    const status = el('p', 'set-desc set-status');
    status.setAttribute('role', 'status');
    const file = el('input');
    file.type = 'file'; file.accept = '.json,application/json'; file.hidden = true;
    file.addEventListener('change', async () => {
      const f = file.files[0];
      file.value = '';
      if (!f) return;
      if (f.size > 4e6) { status.textContent = 'That file is too big.'; return; }
      const n = saved.import(await f.text());
      status.textContent = n < 0 ? 'Could not read that file. Use a file exported from here.' : `Imported ${n} new message${n === 1 ? '' : 's'}.`;
    });
    sv.append(
      btn('Export all', () => {
        if (!saved.list().length) { status.textContent = 'Nothing to export yet.'; return; }
        download('etan-messages.json', saved.export(), 'application/json');
      }),
      btn('Import', () => file.click()),
      btn('Delete all', () => {
        if (!saved.list().length) return;
        saved.clear();
        status.textContent = 'Saved messages deleted.';
      }),
      file,
    );
    g.append(sv, status);

    /* reset */
    g = group('Reset');
    r = row('Reset everything', 'Puts every setting back and deletes all saved + recent messages from this browser.');
    const zone = el('div', 'set-acts');
    const arm = btn('Reset all', () => {
      zone.replaceChildren(el('span', 'set-warn', 'You sure?'),
        btn('Yes, reset', () => { Settings.resetAll(); window.mountSettings(box); }, false),
        btn('Cancel', () => zone.replaceChildren(arm)));
    });
    zone.append(arm);
    r.append(zone);
    g.append(r);

    const paint = () => { savedTable(savBox); recentList2(recBox); };
    paint();
    const onStore = (e) => {
      if (!box.isConnected) { removeEventListener('etan:store', onStore); return; }
      if (e.detail === 'prefs') sysText();
      else paint();
    };
    addEventListener('etan:store', onStore);
  };
})();
