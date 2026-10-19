// Shared renderer for song jackets, chips and the info panel. Used by app.js and the (untracked) editor.html.
// detail.blocks: [{ type, ... }] - see the schema comment in songs.js.
(() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4M5 4h7v7" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';

  const jacket = (s) => s.jacket.image
    ? `<div class="jacket j-img"><img src="${esc(s.jacket.image)}" alt="" decoding="async"></div>`
    : `<div class="jacket j-${esc(s.jacket.pattern)}" style="--len:${(s.jacket.text || '').length}"><span class="jt">${esc(s.jacket.text)}</span></div>`;
  const chips = (s) => `<div class="chips">${(s.chips || []).map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>`;
  const vars = (s) => `--sa:${s.a};--sb:${s.b};--si:${s.ink}`;

  // **bold**, *italic*, [label](https://link). Escape first, then apply a tiny whitelist.
  const SAFE_URL = /^(https?:\/\/[^\s"<>]+|\/[^\s"<>]*|#[^\s"<>]*|[\w.-]+(?:\/[\w.\-~%]+)*(?:\?[^\s"<>]*)?)$/;
  function inline(text) {
    return esc(text)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
        const raw = url.replace(/&amp;/g, '&');
        if (!SAFE_URL.test(raw) || /^(javascript|data|vbscript):/i.test(raw)) return m;
        const ext = /^https?:/i.test(raw);
        return `<a class="b-a" href="${url}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>');
  }
  const paras = (a) => (a || []).map((t) => `<p>${inline(t)}</p>`).join('');
  const img = (src, alt) => `<img src="${esc(src)}" alt="${esc(alt || '')}" loading="lazy" decoding="async">`;

  function block(b) {
    switch (b.type) {
      case 'banner':
        return `<figure class="b-banner b-${b.height === 'tall' ? 'tall' : 'short'}">${img(b.image, b.alt)}${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ''}</figure>`;
      case 'heading':
        return `<h3 class="d-h b-head">${esc(b.text)}</h3>`;
      case 'sub':
        return `<h4 class="b-sub">${esc(b.text)}</h4>`;
      case 'text':
        return `<div class="d-body b-text">${paras(b.paras)}</div>`;
      case 'media':
        return `<div class="b-media b-${b.side === 'left' ? 'left' : 'right'}"><figure>${img(b.image, b.alt)}${b.caption ? `<figcaption>${inline(b.caption)}</figcaption>` : ''}</figure><div class="d-body">${paras(b.paras)}</div></div>`;
      case 'quote':
        return `<blockquote class="b-quote"><p>${inline(b.text)}</p>${b.cite ? `<cite>${esc(b.cite)}</cite>` : ''}</blockquote>`;
      case 'gallery':
        return `<div class="b-gal">${(b.images || []).map((g) => `<figure>${img(g.src, g.alt)}${g.caption ? `<figcaption>${inline(g.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
      case 'divider':
        return '<hr class="b-hr">';
      case 'markdown':
        return `<div class="b-md" data-md="${esc(b.src)}"><p class="msg-note">Loading...</p></div>`;
      case 'message':
        return '<div class="msgbox" data-msg></div>';
      case 'settings':
        return '<div class="setbox" data-settings></div>';
      default:
        return '';
    }
  }
  // Markdown subset: # (skipped, the song title covers it), ##/### headings, paragraphs, > quotes, - lists, --- rules,
  // plus the inline set above. Wrapped lines join into one paragraph.
  function mdHTML(md) {
    const out = [];
    let para = [], list = [];
    const flush = () => {
      if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
      if (list.length) out.push(`<ul class="b-ul">${list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`);
      para = []; list = [];
    };
    for (const raw of md.replace(/\r/g, '').split('\n')) {
      const line = raw.trim();
      let m;
      if (!line) flush();
      else if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        flush();
        if (m[1].length === 1) continue;
        out.push(m[1].length === 2 ? `<h3 class="d-h b-head">${inline(m[2])}</h3>` : `<h4 class="b-sub">${inline(m[2])}</h4>`);
      } else if (/^(-{3,}|\*{3,})$/.test(line)) { flush(); out.push('<hr class="b-hr">'); }
      else if ((m = line.match(/^>\s?(.*)$/))) { flush(); out.push(`<blockquote class="b-quote"><p>${inline(m[1])}</p></blockquote>`); }
      else if ((m = line.match(/^[-*]\s+(.*)$/))) { if (para.length) flush(); list.push(m[1]); }
      else { if (list.length) flush(); para.push(line); }
    }
    flush();
    return out.join('');
  }
  const mdCache = {};
  function loadMd(el) {
    const src = el.dataset.md;
    mdCache[src] ||= fetch(src).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); });
    mdCache[src].then((t) => { el.innerHTML = mdHTML(t); })
      .catch(() => { delete mdCache[src]; el.innerHTML = '<p class="msg-note msg-err">Could not load this page.</p>'; });
  }

  // The built-in sections. Each returns the inner HTML (heading + content) or '' when the song has none.
  const SECTIONS = {
    info: (d) => (d.info || []).length ? `<h3 class="d-h">Chart info</h3><dl class="d-stats">${d.info.map(([k, v]) => `<div class="stat"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '',
    notes: (d) => (d.body || []).length ? `<h3 class="d-h">Notes</h3><div class="d-body">${d.body.map((t) => `<p>${esc(t)}</p>`).join('')}</div>` : '',
    stats: (d) => d.stats ? `<h3 class="d-h">${esc(d.stats.label || 'Stats')}</h3><div class="mm" id="mm"></div>` : '',
    list: (d) => d.list ? `<h3 class="d-h">${esc(d.list.label || 'Also')}</h3><ul class="d-list">${d.list.items.map(([n, t, h]) => `<li>${h ? `<a class="d-li-n" href="${esc(h)}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>` : `<span class="d-li-n">${esc(n)}</span>`}<span class="d-li-t">${esc(t)}</span></li>`).join('')}</ul>` : '',
    widget: (d) => d.widget ? '<h3 class="d-h">Server widget</h3><div class="dw" id="dw"></div>' : '',
    links: (d) => (d.links || []).length ? `<h3 class="d-h">Links</h3><div class="d-links">${d.links.map((l) => `<a class="d-link" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}${arrow}</a>`).join('')}</div>` : '',
  };
  const SECTION_NAMES = Object.keys(SECTIONS);
  const sec = (name, d) => { const h = SECTIONS[name]?.(d); return h ? `<section class="d-sec">${h}</section>` : ''; };

  // { type:'section', name } blocks place a built-in section (info/notes/stats/list/widget/links) among the blocks;
  // a section placed that way is not rendered again in its default spot.
  const blocksHTML = (blocks, d = {}) => (blocks || []).map((b) => {
    if (b.type !== 'section') return block(b);
    const h = SECTIONS[b.name]?.(d);
    return h ? `<div class="b-sec">${h}</div>` : '';
  }).join('');

  function detailHTML(s, i, total) {
    const d = s.detail || {};
    const placed = new Set((d.blocks || []).filter((b) => b.type === 'section').map((b) => b.name));
    const top = (n) => (placed.has(n) ? '' : sec(n, d));
    const blocks = blocksHTML(d.blocks, d);
    return `
      <div class="d-hero">
        <div class="d-jacket">${jacket(s)}</div>
        <div class="d-head">
          <span class="d-no">NO. ${pad(i + 1)} / ${pad(total)}</span>
          <h2 class="d-title">${esc(s.title)}</h2>
          <p class="d-sub">${esc(s.sub)}</p>
          ${chips(s)}
        </div>
      </div>
      ${top('info')}${top('notes')}
      ${blocks ? `<section class="d-sec d-blocks">${blocks}</section>` : ''}
      ${top('stats')}${top('list')}${top('widget')}${top('links')}
      <p class="d-hint">&larr; &rarr; next song &middot; Esc back</p>`;
  }

  // live parts of a rendered panel: stat card, Discord widget, message loader
  function mount(root, s, { messageId = '', active = false } = {}) {
    const d = s.detail || {};
    const mm = root.querySelector('#mm');
    if (d.stats && mm && window.mountStats) { window.mountStats(mm, d.stats); if (active && window.kickStats) window.kickStats(root); }
    const dw = root.querySelector('#dw');
    if (d.widget && dw && window.mountDiscordWidget) window.mountDiscordWidget(dw, d.widget);
    root.querySelectorAll('[data-md]').forEach(loadMd);
    root.querySelectorAll('[data-settings]').forEach((el) => { if (window.mountSettings) window.mountSettings(el); });
    root.querySelectorAll('[data-msg]').forEach((el) => { if (window.mountMessages) window.mountMessages(el, messageId); });
  }

  window.SiteRender = { esc, pad, arrow, jacket, chips, vars, inline, SECTION_NAMES, blocksHTML, mdHTML, detailHTML, mount };
})();
