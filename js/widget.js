// Custom Discord server widget. Nothing is requested until the visitor clicks.
// Data: https://discord.com/api/guilds/<id>/widget.json (needs "Server Widget" enabled in server settings).
(() => {
  const cache = {};
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const safeImg = (u) => typeof u === 'string' && u.startsWith('https://cdn.discordapp.com/');

  function loading(box) {
    box.replaceChildren(el('p', 'dw-msg', 'Just a sec...'));
  }

  function failed(box, cfg, why) {
    box.replaceChildren();
    box.append(el('p', 'dw-msg dw-err', why));
    const row = el('div', 'dw-row');
    const retry = el('button', 'dw-btn', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => load(box, cfg));
    row.append(retry);
    if (cfg.invite) {
      const a = el('a', 'dw-btn dw-alt', 'Open in Discord');
      a.href = cfg.invite; a.target = '_blank'; a.rel = 'noopener noreferrer';
      row.append(a);
    }
    box.append(row);
  }

  function render(box, cfg, d, when) {
    const chans = new Map((d.channels || []).map((c) => [c.id, c.name]));
    const countCh = (d.channels || []).find((c) => /^Members:\s*\d+/i.test(c.name));
    const voice = (d.channels || []).filter((c) => c !== countCh);
    const members = d.members || [];

    const head = el('div', 'dw-head');
    const titles = el('div', 'dw-titles');
    titles.append(el('span', 'dw-kicker', 'Discord server'), el('h4', 'dw-name', d.name || 'Server'));
    const stats = el('p', 'dw-stats');
    stats.append(el('b', '', String(d.presence_count ?? members.length)), ' online');
    if (countCh) stats.append(' · ', el('b', '', countCh.name.replace(/^Members:\s*/i, '')), ' members');
    titles.append(stats);
    head.append(titles);
    const invite = d.instant_invite || cfg.invite;
    if (invite) {
      const join = el('a', 'dw-btn', 'Join');
      join.href = invite; join.target = '_blank'; join.rel = 'noopener noreferrer';
      head.append(join);
    }

    const memberItem = (m, inVc) => {
      const li = el('li', 'dw-m');
      const av = el('span', 'dw-av');
      if (safeImg(m.avatar_url)) {
        const img = new Image();
        img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; img.src = m.avatar_url;
        av.append(img);
      }
      const dot = el('i', `dw-dot s-${/^(online|idle|dnd)$/.test(m.status) ? m.status : 'online'}`);
      dot.title = m.status || '';
      av.append(dot);
      const who = el('span', 'dw-who');
      who.append(el('span', 'dw-un', m.nick || m.username || '?'));
      const sub = inVc
        ? [m.self_deaf || m.deaf ? 'Deafened' : (m.self_mute || m.mute ? 'Muted' : ''), m.game?.name ? `Playing ${m.game.name}` : ''].filter(Boolean).join(' · ')
        : m.game?.name ? `Playing ${m.game.name}` : (m.channel_id && chans.get(m.channel_id)) ? `In ${chans.get(m.channel_id)}` : '';
      if (sub) who.append(el('span', 'dw-sub', sub));
      li.append(av, who);
      return li;
    };

    const sec = (label) => el('h5', 'dw-h', label);
    const parts = [head];

    if (voice.length) {
      parts.push(sec('Voice channels'));
      voice.sort((a, b) => a.position - b.position);
      const inVc = (c) => members.filter((m) => m.channel_id === c.id);
      const wrap = el('div', 'dw-vcs');
      const idle = el('ul', 'dw-chans');
      for (const c of voice) {
        const here = inVc(c);
        if (!here.length) { idle.append(el('li', '', c.name)); continue; }
        const box2 = el('div', 'dw-vc');
        const h = el('div', 'dw-vch');
        h.append(el('span', 'dw-vcn', c.name), el('span', 'dw-vcc', String(here.length)));
        const ul = el('ul', 'dw-vcm');
        here.forEach((m) => ul.append(memberItem(m, true)));
        box2.append(h, ul);
        wrap.append(box2);
      }
      if (wrap.children.length) parts.push(wrap);
      if (idle.children.length) parts.push(idle);
    }

    parts.push(sec(`Online - ${members.length}`));
    if (!members.length) parts.push(el('p', 'dw-msg', 'Nobody visible right now. Spooky.'));
    else {
      const ul = el('ul', 'dw-members');
      for (const m of members) ul.append(memberItem(m, false));
      parts.push(ul);
    }

    const foot = el('div', 'dw-row dw-foot');
    const refresh = el('button', 'dw-btn dw-alt', 'Refresh');
    refresh.type = 'button';
    refresh.addEventListener('click', () => { delete cache[cfg.id]; load(box, cfg); });
    foot.append(refresh, el('span', 'dw-time', `updated ${when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`));
    parts.push(foot);

    box.replaceChildren(...parts);
  }

  async function load(box, cfg) {
    const hit = cache[cfg.id];
    if (hit) return render(box, cfg, hit.data, hit.when);
    loading(box);
    try {
      const r = await fetch(`https://discord.com/api/guilds/${encodeURIComponent(cfg.id)}/widget.json`, { cache: 'no-store' });
      if (r.status === 403) return failed(box, cfg, 'The server has its widget switched off.');
      if (!r.ok) return failed(box, cfg, `Discord said ${r.status}.`);
      const data = await r.json();
      cache[cfg.id] = { data, when: new Date() };
      render(box, cfg, data, cache[cfg.id].when);
    } catch (e) {
      failed(box, cfg, "Couldn't reach Discord (offline, or something is blocking it).");
    }
  }

  // box is an empty element inside the detail panel
  window.mountDiscordWidget = (box, cfg) => {
    if (cache[cfg.id] || window.Settings?.get('autoload')) return load(box, cfg);
    const btn = el('button', 'dw-load', 'Load live server widget');
    btn.type = 'button';
    const note = el('p', 'dw-note', 'grabs online server members - contacts discord api!');
    btn.addEventListener('click', () => load(box, cfg));
    box.replaceChildren(btn, note);
  };
})();
