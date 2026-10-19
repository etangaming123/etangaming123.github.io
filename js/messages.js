// Messages: a note loaded from one of my gists, by id. Ported from the old site's Message.html.
// Deep link: #/messages/info/<gistId>   (old links: Message.html?id=<gistId> redirects here)
(() => {
  const USER = 'etangaming123';
  const ID_RE = /^[0-9a-f]{8,40}$/i;
  const URL_RE = /(https?:\/\/[^\s<>"']+)/g;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const link = (href, text) => {
    const a = el('a', 'mm-link', text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  };
  // text with clickable https links; line breaks kept by CSS (white-space: pre-wrap)
  function linked(text) {
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(URL_RE)) {
      frag.append(text.slice(last, m.index), link(m[0], m[0]));
      last = m.index + m[0].length;
    }
    frag.append(text.slice(last));
    return frag;
  }

  async function load(out, id) {
    const raw = `https://gist.githubusercontent.com/${USER}/${id}/raw`;
    out.replaceChildren(el('p', 'msg-note', 'Fetching...'));
    try {
      const res = await fetch(raw);
      if (!res.ok) {
        out.replaceChildren(el('p', 'msg-note msg-err', res.status === 404
          ? 'That message id does not exist. (If it worked before, it may have been deleted!)'
          : `Failed to get the message. Status: ${res.status}`));
        return;
      }
      const text = (await res.text()).trim();
      const meta = el('p', 'msg-meta');
      meta.append(link(raw, 'View raw'), ' // ', link(`https://gist.github.com/${USER}/${id}/revisions`, 'View update history'));
      if (/^https?:\/\/\S+$/.test(text)) {
        // the old page redirected silently; here you get asked first
        const box = el('div', 'msg-body');
        box.append(el('p', null, 'This message is a link to:'), link(text, text));
        out.replaceChildren(box, meta);
        return;
      }
      const body = el('div', 'msg-body');
      body.append(linked(text));
      out.replaceChildren(body, meta);
    } catch (err) {
      out.replaceChildren(el('p', 'msg-note msg-err', 'Could not reach GitHub. Check your connection and try again.'));
    }
  }

  window.mountMessages = (box, id) => {
    box.replaceChildren();
    const form = el('form', 'msg-form');
    form.autocomplete = 'off';
    const label = el('label', 'msg-label', 'Message ID');
    const input = el('input', 'msg-in');
    input.type = 'text'; input.id = 'msg-id'; input.placeholder = 'Enter your message ID';
    input.spellcheck = false; input.autocapitalize = 'off';
    label.htmlFor = input.id;
    const go = el('button', 'dw-btn', 'Load message');
    go.type = 'submit';
    form.append(label, input, go);
    const out = el('div', 'msg-out');
    out.setAttribute('aria-live', 'polite');
    box.append(form, out);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!ID_RE.test(v)) { out.replaceChildren(el('p', 'msg-note msg-err', 'Message IDs are hex, like 1a2b3c4d... (the end of a gist URL).')); return; }
      location.hash = `#/messages/info/${v}`;
    });

    if (id) {
      input.value = id;
      if (ID_RE.test(id)) load(out, id);
      else out.replaceChildren(el('p', 'msg-note msg-err', 'That does not look like a message ID.'));
    } else {
      out.append(el('p', 'msg-note', 'This page is for messages I want to send you. Enter the ID I gave you above.'));
    }
  };
})();
