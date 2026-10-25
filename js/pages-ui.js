// Friend Pages panels: the Import form + saved pages + trusted hosts, and the built-in-list status line.
// Mounted by render.js for { type:'pages', name:'import' | 'status' } blocks.
(() => {
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
  // keep a panel in step with the store for as long as it is on the page
  const live = (box, paint) => {
    const on = () => { if (!box.isConnected) removeEventListener('etan:pages', on); else paint(); };
    addEventListener('etan:pages', on);
    paint();
  };

  function mountStatus(box) {
    live(box, () => {
      const s = window.Pages.status();
      let t;
      if (s.state === 'loading' || s.state === 'idle') t = 'Built-in list: loading...';
      else if (s.state === 'fail') t = `Built-in list: could not load (${s.why})`;
      else t = `Built-in list: ${s.ok} of ${s.total} page${s.total === 1 ? '' : 's'} loaded${s.pending ? ', still fetching...' : '.'}`;
      const p = el('p', 'msg-note' + (s.state === 'fail' ? ' msg-err' : ''), t);
      p.setAttribute('role', 'status');
      const out = [p];
      if (s.failed.length) {
        const ul = el('ul', 'pg-fails');
        for (const f of s.failed) ul.append(el('li', null, `${f.ref}: ${f.why}`));
        out.push(el('p', 'msg-note', 'These could not be loaded and are skipped:'), ul);
      }
      box.replaceChildren(...out);
    });
  }

  function mountImport(box) {
    const P = window.Pages;
    box.replaceChildren();
    const status = el('p', 'msg-note pg-status');
    status.setAttribute('role', 'status');
    const say = (t, bad) => { status.textContent = t; status.classList.toggle('msg-err', !!bad); };

    const keep = el('input');
    keep.type = 'checkbox'; keep.id = 'pg-keep';
    const keepL = el('label', 'pg-keep');
    keepL.htmlFor = keep.id;
    keepL.append(keep, el('span', null, 'Save it in this browser (so it is here next time)'));

    async function load(text, from) {
      say('Loading...');
      try {
        const key = await P.add(text, keep.checked);
        const s = P.list().find((x) => x.id === key);
        say(`Loaded "${s.title}".${s.dropped?.length ? ` Ignored unsupported blocks: ${[...new Set(s.dropped)].join(', ')}.` : ''}`);
        location.hash = `#/pages/${encodeURIComponent(key)}/info`;
      } catch (err) { say(err.message, true); }
      if (from) from.value = '';
    }

    /* gist / link */
    const form = el('form', 'msg-form');
    form.autocomplete = 'off';
    const label = el('label', 'msg-label', 'Gist or link');
    const input = el('input', 'msg-in');
    input.type = 'text'; input.id = 'pg-ref'; input.placeholder = 'username/gistid  or  https://...';
    input.spellcheck = false; input.autocapitalize = 'off';
    label.htmlFor = input.id;
    const go = el('button', 'dw-btn', 'Load page');
    go.type = 'submit';
    form.append(label, input, go);
    form.addEventListener('submit', (e) => { e.preventDefault(); load(input.value); });

    /* file / paste */
    const file = el('input');
    file.type = 'file'; file.accept = '.json,application/json'; file.hidden = true;
    file.addEventListener('change', async () => {
      const f = file.files[0];
      file.value = '';
      if (!f) return;
      if (f.size > 200000) { say('That file is too big (200 KB max).', true); return; }
      load(await f.text());
    });
    const paste = el('textarea', 'pg-paste');
    paste.id = 'pg-paste'; paste.rows = 5; paste.spellcheck = false; paste.placeholder = '{ "title": "My page", ... }';
    const pasteL = el('label', 'msg-label', 'Or paste the .json');
    pasteL.htmlFor = paste.id;
    const acts = el('div', 'msg-acts');
    acts.append(btn('Load pasted .json', () => load(paste.value, paste)), btn('Choose a .json file', () => file.click()), file);

    const hint = el('p', 'set-desc', 'Pages are only data: no code from them ever runs. Their images wait for a click unless they are hosted on GitHub.');

    /* saved + trusted */
    const savedBox = el('div', 'set-box');
    const trustBox = el('div', 'set-box');
    const group = (title, ...kids) => { const g = el('section', 'set-group'); g.append(el('h4', 'b-sub', title), ...kids); return g; };

    const paint = () => {
      const saved = P.list().filter((s) => s.origin && s.origin.where === 'saved');
      savedBox.replaceChildren();
      if (!saved.length) savedBox.append(el('p', 'set-empty', 'Nothing saved. Tick the box above when you import a page.'));
      else {
        const ul = el('ul', 'set-recent');
        for (const s of saved) {
          const li = el('li');
          const a = el('a', 'set-id', s.title);
          a.href = `#/pages/${encodeURIComponent(s.id)}/info`;
          li.append(a, el('span', 'set-when', s.origin.kind === 'gist' ? s.origin.ref : s.origin.kind === 'url' ? s.origin.ref : 'pasted .json'));
          const row = el('div', 'set-acts');
          row.append(btn('Remove', () => P.remove(s.id)));
          li.append(row);
          ul.append(li);
        }
        savedBox.append(ul);
      }
      const hosts = P.trust.list();
      trustBox.replaceChildren();
      if (!hosts.length) trustBox.append(el('p', 'set-empty', 'No trusted image hosts. GitHub images always load; others ask first.'));
      else {
        const ul = el('ul', 'set-recent');
        for (const h of hosts) {
          const li = el('li');
          li.append(el('span', 'set-id', h));
          const row = el('div', 'set-acts');
          row.append(btn('Stop trusting', () => { P.trust.remove(h); paint(); }));
          li.append(row);
          ul.append(li);
        }
        trustBox.append(ul);
      }
    };
    live(box, paint);

    if (P.lastError) { // arrived from a failed ?cuspage= link
      input.value = P.lastError.ref;
      say(`Could not open that link's page: ${P.lastError.message}`, true);
      P.lastError = null;
    }

    box.append(
      group('Load a page', form, hint, el('div', 'pg-or'), pasteL, paste, acts, keepL, status),
      group('Saved in this browser', savedBox),
      group('Trusted image hosts', trustBox),
    );
  }

  window.mountPages = (box, kind) => {
    if (kind === 'status') mountStatus(box);
    else if (kind === 'import') mountImport(box);
  };
})();
