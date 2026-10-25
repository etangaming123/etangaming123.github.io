// Friend Pages: "songs" made by other people, as .json. Adds the hardcoded "friend-pages" song (just above Settings)
// and the model behind the #/pages section. Also loaded by page-editor.html, which only needs sanitize + the image gate.
//   Pages.sanitize(raw)      untrusted object -> safe song (throws Error with a readable reason)
//   Pages.init()             fetch the built-in list (CENTRAL) + this browser's saved pages
//   Pages.list()             built-in songs + every loaded page, in wheel order
//   Pages.add(text, save)    import a "user/gistid", a gist/https URL, or pasted .json
//   Pages.gateHTML(src, alt) <img>, or a "click to load" placeholder, depending on the host
// Nothing runs from a page: it is data only. Text is escaped by render.js; images go through the gate below.
(() => {
  // The central gist: a list of "username/gistid" entries, e.g. [alice/1a2b3c4d..., bob/9f8e7d6c...]
  const CENTRAL = 'etangaming123/82541e609a2a91ac34a5bdc8f8a42669';

  const BG = '#051631';
  const KEYS = { pages: 'etan:pages', trust: 'etan:trust' };
  const MAX_JSON = 200000;
  const MAX_CENTRAL = 40;
  const MAX_SAVED = 30;
  const MAX_TRUST = 100;
  const PATTERNS = ['split', 'letter', 'block', 'disc', 'checker', 'chevron', 'stripes', 'grid', 'slash', 'rings', 'rays', 'zig'];
  const HEX = /^#[0-9a-f]{6}$/i;
  const USER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
  const GIST_RE = /^[0-9a-f]{8,40}$/i;

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- storage (memory fallback when localStorage is blocked) ---------- */
  const mem = {};
  const read = (k, d) => {
    try { const v = localStorage.getItem(k); return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; }
  };
  const write = (k, v) => { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  let pokeT;
  const poke = () => { clearTimeout(pokeT); pokeT = setTimeout(() => window.dispatchEvent(new CustomEvent('etan:pages')), 30); };

  /* ---------- colour ---------- */
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; })
      .reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  const lighten = (hex, t) => {
    const n = parseInt(hex.slice(1), 16);
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  // site rule: every song colour needs 4.5:1 against the background. Too dark? Nudge it toward white until it passes.
  function fixColor(v, fallback) {
    if (typeof v !== 'string' || !HEX.test(v)) return fallback;
    let c = v.toUpperCase();
    for (let i = 0; i < 14 && ratio(c, BG) < 4.5; i++) c = lighten(c, .12);
    return c;
  }

  /* ---------- sanitize: the only way untrusted JSON becomes a song ---------- */
  const clip = (v, n) => (typeof v === 'string' ? v.replace(/\r/g, '').slice(0, n) : '');
  const list = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
  const paras = (v) => list(v, 30).map((p) => clip(p, 3000).trim()).filter(Boolean);
  const href = (v) => { v = clip(v, 600).trim(); return /^https?:\/\/[^\s"<>]+$/i.test(v) ? v : ''; };
  const SECTIONS = ['info', 'notes', 'links'];

  function sanitizeBlock(b) {
    if (!b || typeof b !== 'object') return null;
    const img = (o) => ({ image: clip(o.image, 600).trim(), alt: clip(o.alt, 200), caption: clip(o.caption, 300) });
    switch (b.type) {
      case 'banner': return { type: 'banner', ...img(b), height: b.height === 'tall' ? 'tall' : 'short' };
      case 'heading': case 'sub': return { type: b.type, text: clip(b.text, 120) };
      case 'text': return { type: 'text', paras: paras(b.paras) };
      case 'media': return { type: 'media', ...img(b), side: b.side === 'right' ? 'right' : 'left', paras: paras(b.paras) };
      case 'quote': return { type: 'quote', text: clip(b.text, 600), cite: clip(b.cite, 100) };
      case 'gallery': return { type: 'gallery', images: list(b.images, 24).filter((g) => g && typeof g === 'object').map((g) => ({ src: clip(g.src, 600).trim(), alt: clip(g.alt, 200), caption: clip(g.caption, 300) })) };
      case 'divider': return { type: 'divider' };
      case 'code': return { type: 'code', text: clip(b.text, 6000), caption: clip(b.caption, 200) };
      case 'section': return SECTIONS.includes(b.name) ? { type: 'section', name: b.name } : null;
      default: return null;
    }
  }

  function sanitize(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('A page is one JSON object, { ... }.');
    const title = clip(raw.title, 60).trim();
    if (!title) throw new Error('A page needs a "title".');
    const a = fixColor(raw.a, '#DDAACC');
    const b = fixColor(raw.b, '#BB88EE');
    const ink = fixColor(raw.ink, a);
    const j = raw.jacket && typeof raw.jacket === 'object' ? raw.jacket : {};
    const d = raw.detail && typeof raw.detail === 'object' ? raw.detail : {};
    const jacket = {
      pattern: PATTERNS.includes(j.pattern) ? j.pattern : 'letter',
      text: clip(j.text, 12).trim() || title.slice(0, 6).toUpperCase(),
    };
    const image = clip(j.image, 600).trim();
    if (image) jacket.image = image;
    const dropped = [];
    const blocks = list(d.blocks, 80).map((x) => { const s = sanitizeBlock(x); if (!s) dropped.push(x && x.type); return s; }).filter(Boolean);
    return {
      custom: true,
      id: '',
      title,
      sub: clip(raw.sub, 140),
      chips: list(raw.chips, 6).map((c) => clip(c, 24).trim()).filter(Boolean),
      a, b, ink,
      jacket,
      detail: {
        info: list(d.info, 20).filter(Array.isArray).map((p) => [clip(p[0], 60), clip(p[1], 140)]).filter((p) => p[0] || p[1]),
        body: paras(d.body),
        links: list(d.links, 12).filter((l) => l && typeof l === 'object').map((l) => ({ label: clip(l.label, 60) || 'Link', href: href(l.href) })).filter((l) => l.href),
        blocks,
      },
      dropped: dropped.filter(Boolean),
    };
  }

  const parseSong = (text) => {
    let raw;
    try { raw = JSON.parse(text.replace(/^﻿/, '')); } catch (e) { throw new Error(`Not valid JSON (${e.message}).`); }
    return sanitize(raw);
  };

  /* ---------- image gate ---------- */
  // github / gist hosts load by themselves. Everything else shows a placeholder until you click, or trust the host.
  const AUTO = (h) => h === 'github.com' || h === 'gist.github.com' || h === 'githubusercontent.com' || h.endsWith('.githubusercontent.com');
  const trustList = () => (read(KEYS.trust, []) || []).filter((h) => typeof h === 'string');
  const trust = {
    list: trustList,
    has: (h) => trustList().includes(h),
    add(h) { const all = trustList(); if (!all.includes(h) && all.length < MAX_TRUST) { all.push(h); write(KEYS.trust, all); } },
    remove(h) { write(KEYS.trust, trustList().filter((x) => x !== h)); },
    clear() { write(KEYS.trust, []); },
  };
  function imgInfo(src) {
    let u;
    try { u = new URL(String(src || '').trim()); } catch (e) { return { state: 'bad', why: 'The image needs to be a full https:// link.' }; }
    if (u.protocol !== 'https:') return { state: 'bad', why: 'Only https:// images can load.' };
    if (u.username || u.password) return { state: 'bad', why: 'Links with a login in them are not allowed.' };
    const host = u.hostname.toLowerCase();
    return { state: AUTO(host) || trust.has(host) ? 'ok' : 'ask', host, href: u.href };
  }
  const imgOK = (src) => imgInfo(src).state === 'ok';
  function gateHTML(src, alt) {
    const i = imgInfo(src);
    if (i.state === 'ok') return `<img src="${esc(i.href)}" alt="${esc(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-pgimg>`;
    const what = alt ? `<p class="ig-t">${esc(alt)}</p>` : '';
    if (i.state === 'bad') return `<div class="img-gate ig-bad"><span class="ig-k">Image not loaded</span>${what}<p class="ig-t">${esc(i.why)}</p></div>`;
    return `<div class="img-gate" data-src="${esc(i.href)}" data-alt="${esc(alt)}" data-host="${esc(i.host)}"><span class="ig-k">Image not loaded</span>${what}`
      + `<div class="ig-btns"><button type="button" class="dw-btn dw-alt" data-ig="load">Click to load image from ${esc(i.host)}</button>`
      + `<button type="button" class="dw-btn dw-alt" data-ig="trust">Trust ${esc(i.host)}</button></div></div>`;
  }
  function reveal(g) {
    const im = new Image();
    im.alt = g.dataset.alt || '';
    im.loading = 'lazy'; im.decoding = 'async'; im.referrerPolicy = 'no-referrer';
    im.addEventListener('error', () => {
      const n = document.createElement('div');
      n.className = 'img-gate ig-bad';
      n.textContent = 'This image could not be loaded.';
      im.replaceWith(n);
    });
    im.src = g.dataset.src;
    g.replaceWith(im);
  }
  // pages can only link out over http(s); anything else loses its href
  function lock(root) {
    root.querySelectorAll('a[href]').forEach((a) => {
      const h = a.getAttribute('href');
      if (/^https?:\/\//i.test(h)) { a.target = '_blank'; a.rel = 'noopener noreferrer nofollow'; } else a.removeAttribute('href');
    });
  }

  /* ---------- sources ---------- */
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
  const gistKey = (user, id) => `${user.toLowerCase()}~${id.toLowerCase()}`;
  const gistRaw = (user, id) => `https://gist.githubusercontent.com/${user}/${id}/raw`;

  // "user/gistid", gist.github.com/user/gistid, any other https URL -> a source spec, or null
  function parseRef(t) {
    t = String(t || '').trim();
    let m = t.match(/^@?([A-Za-z0-9-]+)\/([0-9a-f]{8,40})$/i);
    if (!m) {
      m = t.match(/^https:\/\/gist\.github\.com\/([A-Za-z0-9-]+)\/([0-9a-f]{8,40})(?:[/?#].*)?$/i)
        || t.match(/^https:\/\/gist\.githubusercontent\.com\/([A-Za-z0-9-]+)\/([0-9a-f]{8,40})\/raw\/?$/i);
    }
    if (m && USER_RE.test(m[1]) && GIST_RE.test(m[2])) return { kind: 'gist', user: m[1], gist: m[2], key: gistKey(m[1], m[2]), ref: `${m[1]}/${m[2]}` };
    if (/^https:\/\/[^\s"<>]+$/i.test(t)) return { kind: 'url', ref: t, key: `u-${hash(t)}` };
    return null;
  }

  async function fetchText(url, max) {
    let r;
    try { r = await fetch(url); } catch (e) { throw new Error('Could not reach that address (the host may block other sites, or you are offline).'); }
    if (!r.ok) throw new Error(r.status === 404 ? 'Not found (404). Check the name and that the gist is public.' : `The server said ${r.status}.`);
    const t = await r.text();
    if (t.length > max) throw new Error('That file is too big.');
    return t;
  }
  const specURL = (s) => (s.kind === 'gist' ? gistRaw(s.user, s.gist) : s.ref);

  /* ---------- state ---------- */
  const loaded = new Map();   // key -> { song, spec, text, stale }
  const errors = new Map();   // key -> reason  (central + saved entries that failed)
  let central = [];           // keys, list order
  let session = [];           // keys imported this visit
  let pending = 0;
  let started = false;
  const cstat = { state: 'idle', why: '', refs: [] };

  const savedList = () => (read(KEYS.pages, []) || []).filter((e) => e && typeof e.key === 'string' && ['gist', 'url', 'json'].includes(e.kind));
  const isSaved = (key) => savedList().some((e) => e.key === key);

  function put(spec, song, text, stale = false) {
    song.id = spec.key;
    loaded.set(spec.key, { song, spec, text, stale });
    errors.delete(spec.key);
  }
  function track(spec) {
    pending++;
    (async () => {
      try {
        const text = await fetchText(specURL(spec), MAX_JSON);
        put(spec, parseSong(text), text);
        const all = savedList(), e = all.find((x) => x.key === spec.key);
        if (e && text.length <= 150000 && e.raw !== text) { e.raw = text; write(KEYS.pages, all); }
      } catch (err) {
        const cached = savedList().find((x) => x.key === spec.key)?.raw;
        let ok = false;
        if (cached) { try { put(spec, parseSong(cached), cached, true); ok = true; } catch (e) {} }
        if (!ok) errors.set(spec.key, err.message);
      } finally { pending--; poke(); }
    })();
  }

  function init() {
    if (started) return;
    started = true;
    for (const e of savedList()) {
      const spec = e.kind === 'gist' ? parseRef(e.ref) : e.kind === 'url' ? { kind: 'url', ref: e.ref, key: e.key } : { kind: 'json', key: e.key };
      if (!spec) continue;
      if (e.kind === 'json') { try { put(spec, parseSong(e.raw || ''), e.raw); } catch (err) { errors.set(e.key, err.message); } } else track(spec);
    }
    cstat.state = 'loading';
    pending++;
    (async () => {
      try {
        const [user, gist] = CENTRAL.split('/'); // not run through parseRef: this id is mine, not user input
        const text = await fetchText(specURL({ kind: 'gist', user, gist }), 20000);
        const seen = new Set();
        const refs = [];
        for (const m of text.matchAll(/([A-Za-z0-9][A-Za-z0-9-]{0,38})\/([0-9a-f]{8,40})/gi)) {
          const r = parseRef(`${m[1]}/${m[2]}`);
          if (r && !seen.has(r.key)) { seen.add(r.key); refs.push(r); }
        }
        cstat.refs = refs.slice(0, MAX_CENTRAL);
        central = cstat.refs.map((r) => r.key);
        cstat.state = 'ok';
        for (const r of cstat.refs) if (!loaded.has(r.key)) track(r);
      } catch (err) { cstat.state = 'fail'; cstat.why = err.message; } finally { pending--; poke(); }
    })();
  }

  async function add(input, save = false) {
    const t = String(input || '').trim();
    if (!t) throw new Error('Nothing to import. Paste a user/gistid, a link, or the .json itself.');
    let spec;
    if (t[0] === '{') {
      if (t.length > MAX_JSON) throw new Error('That is too big.');
      spec = { kind: 'json', key: `j-${hash(t)}` };
      put(spec, parseSong(t), t);
    } else {
      spec = parseRef(t);
      if (!spec) throw new Error('Not sure what that is. Use user/gistid, a gist link, an https:// link to a .json, or paste the .json.');
      const text = await fetchText(specURL(spec), MAX_JSON);
      put(spec, parseSong(text), text);
    }
    if (!central.includes(spec.key) && !session.includes(spec.key)) session.push(spec.key);
    if (save) saveKey(spec.key);
    poke();
    return spec.key;
  }

  function saveKey(key) {
    const l = loaded.get(key);
    if (!l) return false;
    const all = savedList();
    if (all.some((e) => e.key === key)) return true;
    if (all.length >= MAX_SAVED) return false;
    const e = { key, kind: l.spec.kind, savedAt: Date.now() };
    if (l.spec.kind !== 'json') e.ref = l.spec.ref;
    if (l.text && l.text.length <= 150000) e.raw = l.text;
    all.push(e);
    write(KEYS.pages, all);
    poke();
    return true;
  }
  function removeKey(key) {
    write(KEYS.pages, savedList().filter((e) => e.key !== key));
    session = session.filter((k) => k !== key);
    if (!central.includes(key)) loaded.delete(key);
    errors.delete(key);
    poke();
  }

  /* ---------- the list the section shows ---------- */
  const built = () => BUILTIN;
  function songs() {
    const order = [...central, ...savedList().map((e) => e.key), ...session];
    const out = [];
    for (const key of [...new Set(order)]) {
      const l = loaded.get(key);
      if (!l) continue;
      const where = central.includes(key) ? 'central' : isSaved(key) ? 'saved' : 'session';
      l.song.origin = { key, where, kind: l.spec.kind, user: l.spec.user, gist: l.spec.gist, ref: l.spec.ref, stale: l.stale };
      out.push(l.song);
    }
    return out;
  }
  const all = () => [...built(), ...songs()];

  const hostOf = (u) => { try { return new URL(u).hostname; } catch (e) { return ''; } };
  function originHTML(s) {
    const o = s.origin;
    if (!o) return '';
    const link = (h, t) => `<a class="b-a" href="${esc(h)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`;
    const src = o.kind === 'gist' ? `gist ${link(`https://gist.github.com/${o.user}/${o.gist}`, `${o.user}/${o.gist}`)}`
      : o.kind === 'url' ? `a file on ${esc(hostOf(o.ref))}` : 'a pasted or uploaded .json';
    const where = { central: 'On the built-in list.', saved: 'Saved in this browser.', session: 'Only imported for this visit.' }[o.where];
    const btn = (act, label) => `<button type="button" class="dw-btn dw-alt" data-pg="${act}" data-key="${esc(o.key)}">${label}</button>`;
    const acts = o.where === 'saved' ? btn('remove', 'Remove from this browser') : o.where === 'session' ? btn('save', 'Save to this browser') + btn('remove', 'Discard') : '';
    return `<aside class="pg-origin"><p><b>Not made by etangaming123.</b> It belongs to whoever wrote it. Source: ${src}. ${where}${o.stale ? ' (Could not reach the source, so this is your saved copy.)' : ''}</p>${acts ? `<div class="pg-acts">${acts}</div>` : ''}</aside>`;
  }

  // end of a gist page: a link that opens it straight away (see params.js)
  function footHTML(s) {
    const o = s.origin;
    if (!o || o.kind !== 'gist') return '';
    return `<div class="pg-foot"><button type="button" class="dw-btn dw-alt" data-pglink="${esc(`${o.user}/${o.gist}`)}">Copy link</button></div>`;
  }

  function status() {
    const refs = cstat.refs;
    return {
      state: cstat.state, why: cstat.why, pending,
      total: refs.length,
      ok: refs.filter((r) => loaded.has(r.key)).length,
      failed: refs.filter((r) => errors.has(r.key)).map((r) => ({ ref: r.ref, why: errors.get(r.key) })),
      savedFailed: savedList().filter((e) => errors.has(e.key)).map((e) => ({ ref: e.ref || 'pasted .json', key: e.key, why: errors.get(e.key) })),
    };
  }

  // Settings > Reset all
  addEventListener('etan:store', (e) => {
    if (e.detail !== 'pages') return;
    for (const k of Object.values(KEYS)) delete mem[k];
    session = [];
    for (const k of [...loaded.keys()]) if (!central.includes(k)) loaded.delete(k);
    poke();
  });

  /* ---------- clicks: image gate, copy buttons, save/remove (works on any page that loads this file) ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest?.('[data-ig], [data-copy], [data-pglink], [data-pg]');
    if (!t) return;
    if (t.dataset.ig) {
      const g = t.closest('.img-gate');
      if (!g) return;
      if (t.dataset.ig === 'trust') {
        const host = g.dataset.host;
        trust.add(host);
        document.querySelectorAll('.img-gate[data-host]').forEach((x) => { if (x.dataset.host === host) reveal(x); });
        poke(); // wheel jackets may be showable now
      } else reveal(g);
    } else if (t.dataset.copy != null) {
      const code = t.closest('.b-code')?.querySelector('code');
      if (!code) return;
      const done = (m) => { t.textContent = m; setTimeout(() => { t.textContent = 'Copy'; }, 1500); };
      navigator.clipboard?.writeText(code.textContent).then(() => done('Copied'), () => done('Blocked')) || done('Blocked');
    } else if (t.dataset.pglink) {
      const url = `${location.origin}${location.pathname}?cuspage=${t.dataset.pglink}`;
      const done = (m) => { t.textContent = m; setTimeout(() => { t.textContent = 'Copy link'; }, 1500); };
      navigator.clipboard?.writeText(url).then(() => done('Copied'), () => done('Blocked')) || done('Blocked');
    } else if (t.dataset.pg === 'save') { if (!saveKey(t.dataset.key)) t.textContent = 'Saved list is full'; }
    else if (t.dataset.pg === 'remove') removeKey(t.dataset.key);
  });

  /* ---------- built-in songs (the Friend Pages section) ---------- */
  const EXAMPLE = `{
  "format": "etan-page",
  "title": "My page",
  "sub": "One-line tagline.",
  "chips": ["Hello", "World"],
  "a": "#57E1E6",
  "b": "#F395F6",
  "ink": "#57E1E6",
  "jacket": { "pattern": "checker", "text": "HELLO" },
  "detail": {
    "info": [["Name", "you"], ["Likes", "things"]],
    "body": ["Plain paragraphs go here."],
    "links": [{ "label": "My site", "href": "https://example.com" }],
    "blocks": [
      { "type": "heading", "text": "About me" },
      { "type": "text", "paras": ["Supports **bold**, *italic* and [links](https://example.com)."] },
      { "type": "banner", "image": "https://raw.githubusercontent.com/you/repo/main/banner.png", "alt": "a banner" }
    ]
  }
}`;

  const BUILTIN = [
    {
      id: 'about',
      title: 'About Friend Pages',
      sub: 'Pages made by friends, and whoever else.',
      chips: ['Read first', 'Not mine'],
      a: '#B8DB7E', b: '#57E1E6', ink: '#B8DB7E',
      jacket: { pattern: 'letter', text: 'INFO' },
      detail: {
        info: [['Made by', 'Not me'], ['Format', '.json'], ['Lives on', 'GitHub gists, mostly'], ['Code in pages', 'None, ever']],
        blocks: [
          { type: 'quote', text: 'These are not controlled by etangaming123! They are by friends or others.', cite: 'the important bit' },
          { type: 'heading', text: 'What is this' },
          { type: 'text', paras: ['This is a side wing of the song select. Every entry here is a page somebody else wrote: a friend, a friend of a friend, or a stranger who imported something. For fun!', 'Browse through pages visible to all (eventually), or paste in one that someone made!'] },
          { type: 'heading', text: 'What a page can do' },
          { type: 'text', paras: ['Almost everything that my own pages can do. Just no widgets, stats, or messages. :)', 'Please do view the pages at your own risk! They are not monitored by etangaming123, and links could potentially lead to unwanted content.', 'watch out on the internet!'] },
          { type: 'heading', text: 'Images' },
          { type: 'text', paras: ['Images hosted on **GitHub** or **gists** load by themselves. Any other host gets a "click to load image from ..." button first, because loading an image tells that host you are here.', 'Hit **Trust** next to a host and its images load automatically from then on (kept in this browser). Settings > Reset all forgets them.'] },
          { type: 'heading', text: 'Where entries come from' },
          { type: 'text', paras: ['**The built-in list** is a gist of mine that lists other people\'s gists as username/gistid. Everyone sees those.', '**Your imports** (gist, link, file or pasted .json) live in this tab only, unless you choose to save them in this browser.'] },
          { type: 'pages', name: 'status' },
          { type: 'heading', text: 'Something bad in a page?' },
          { type: 'text', paras: ['If a page on the built-in list is rude, broken or sketchy, tell me and I will take it off the list. For everything you imported yourself, hit Remove or Discard on its panel, and maybe knock some sense into whoever told you to import it. (dont actually do that, just best to ignore em and move on.)'] },
        ],
        links: [],
      },
    },
    {
      id: 'guide',
      title: 'Make your own',
      sub: 'Write a .json, put it on a gist, share the link.',
      chips: ['Guide', 'JSON', 'Gists'],
      a: '#F395F6', b: '#FBD796', ink: '#F395F6',
      jacket: { pattern: 'rays', text: 'MAKE' },
      detail: {
        info: [['Time', 'About 5 minutes'], ['You need', 'A GitHub account'], ['Or', 'A static json hoster?'], ['Cost', '$9.99/mo. (just kidding! free)'], ['Editor', 'Optional']],
        blocks: [
          { type: 'heading', text: '1. Write it' },
          { type: 'text', paras: ['Easiest: open the [page editor](page-editor.html). Fill in the form, watch the live preview, then copy or download your .json.', 'Prefer to write by hand? A page looks like this. Only "title" is required; everything else has a default.'] },
          { type: 'code', text: EXAMPLE, caption: 'my-page.json' },
          { type: 'heading', text: 'What goes in it' },
          { type: 'sub', text: 'The song' },
          { type: 'text', paras: ['**title** (60 chars), **sub** (140), **chips** (up to 6 tags), **a** / **b** / **ink** (hex colours like #57E1E6). Colours too dark for the background get brightened automatically so text stays readable.', '**jacket** is the cover: pattern is one of split, letter, block, disc, checker, chevron, stripes, grid, slash, rings, rays, zig; text is the giant word on it; image is an optional https:// link that replaces the cover.'] },
          { type: 'sub', text: 'The panel' },
          { type: 'text', paras: ['**info** is [label, value] pairs. **body** is plain paragraphs. **links** is { label, href } and href must start with https://.', '**blocks** is the rich stuff, shown in order: banner, heading, sub, text, media (image beside text), quote, gallery, divider and code. Text supports **bold**, *italic* and [links](https://example.com). You can also drop a { "type": "section", "name": "info" | "notes" | "links" } block to move those sections around.', 'Anything else (widgets, messages, scripts) is ignored on purpose.'] },
          { type: 'heading', text: '2. Publish it' },
          { type: 'text', paras: ['Go to [gist.github.com](https://gist.github.com), paste your JSON into one file (call it something like my-page.json) and create a **public** gist. Secret gists work too if you only share the link.', 'Your gist URL looks like gist.github.com/**username**/**1a2b3c4d5e...**. That username/gistid is your address.', 'Share username/gistid, not a link to one revision, so later edits to your gist show up here.'] },
          { type: 'heading', text: '3. Share it' },
          { type: 'text', paras: ['Anyone can open the **Import a page** entry, type username/gistid (or paste a gist link, a link to any .json, or the file itself) and load it. They can choose to save it in their browser.', 'Not on GitHub? Host the .json anywhere that serves it over https and allows other sites to fetch it (CORS), or just send the file around.'] },
          { type: 'heading', text: '4. Get on the built-in list' },
          { type: 'text', paras: ['Pages on the built-in list show up for everyone without importing. Send me your username/gistid and I may add it. It is my call, and I can remove entries any time.'] },
          { type: 'heading', text: 'Images' },
          { type: 'text', paras: ['Host images on GitHub (a repo, or a gist file) and use the raw link, e.g. https://raw.githubusercontent.com/you/repo/main/pic.png. They load for everyone with no clicking. Images from anywhere else ask the viewer first.', 'Limits: 200 KB per page, 80 blocks, 24 images per gallery.'] },
        ],
        links: [{ label: 'Open the page editor', href: 'page-editor.html' }, { label: 'Make a gist', href: 'https://gist.github.com' }],
      },
    },
    {
      id: 'import',
      title: 'Import a page',
      sub: 'Load a page from a gist, a link or a file.',
      chips: ['Gist', 'URL', 'File'],
      a: '#57E1E6', b: '#DDAACC', ink: '#57E1E6',
      jacket: { pattern: 'grid', text: 'LOAD' },
      detail: { blocks: [{ type: 'pages', name: 'import' }] },
    },
  ];

  window.Pages = { CENTRAL, PATTERNS, parseRef, sanitize, parseSong, ratio, fixColor, init, list: all, add, save: saveKey, remove: removeKey, isSaved, trust, imgInfo, imgOK, gateHTML, originHTML, footHTML, lock, status, loading: () => pending > 0 };

  // the hardcoded song on the main wheel, just above Settings. Opening it goes to the section instead of a panel.
  if (typeof SONGS !== 'undefined') {
    SONGS.push({
      id: 'friend-pages',
      title: 'Friend Pages',
      sub: 'Pages made by friends. Make your own.',
      chips: ['Community', 'JSON', 'Gists'],
      a: '#FBD796',
      b: '#F395F6',
      ink: '#FBD796',
      jacket: { pattern: 'checker', text: 'FRIENDS' },
      go: '#/pages',
      detail: { info: [['Section', 'Friend Pages'], ['Made by', 'Not only me']], body: ['Opens the Friend Pages section.'] },
    });
  }
})();
