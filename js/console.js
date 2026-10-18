// "cheats" console. Opened by the Sh in Shit, or the backtick key.
(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const con = $('#con');
  const log = $('#con-log');
  const form = $('#con-form');
  const input = $('#con-in');
  const quick = $('#con-quick');
  const opener = $('#sh');
  const t0 = performance.now();

  const PAGES = ['home', ...SONGS.map((s) => s.id)];
  const ALIAS = { about: 'about-me', me: 'about-me', lurkers: 'hurstville-lurkers', hurstville: 'hurstville-lurkers', bot: 'etan-bot', links: 'automatic-link-cleaner', cleaner: 'automatic-link-cleaner', circle: 'circle-chiffon', chiffon: 'circle-chiffon', social: 'social-media' };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  let history = [];
  let hi = 0;
  let booted = false;
  let returnTo = null;

  const print = (lines, cls = '') => {
    for (const t of [].concat(lines)) {
      const d = document.createElement('div');
      d.className = `ln ${cls}`;
      d.textContent = t;
      log.appendChild(d);
    }
    log.scrollTop = log.scrollHeight;
  };

  function resolve(q) {
    q = q.toLowerCase().replace(/^etan:\/\//, '').replace(/^#?\//, '').trim();
    if (!q) return { none: true };
    if (q === 'title') q = 'home';
    if (ALIAS[q]) q = ALIAS[q];
    if (PAGES.includes(q)) return { id: q };
    const hits = PAGES.filter((p) => p.includes(q) || SONGS.find((s) => s.id === p)?.title.toLowerCase().includes(q));
    if (hits.length === 1) return { id: hits[0] };
    return hits.length ? { many: hits } : { none: false };
  }

  const todoCount = () => (JSON.stringify(SONGS).match(/TODO/g) || []).length;

  const CMDS = {
    help: { pub: 1, run: () => print([
      'available cheats:',
      '  goto [page]    warp to a page (try: goto bot)',
      '  ls             list every page',
      '  whois [user]   look somebody up',
      '  whoami         who, me?',
      '  lastseen       where has etan been',
      '  status         player data',
      '  todo           how unfinished is this site',
      '  fortune        a prophecy, probably wrong',
      '  credits        who made this',
      '  date / uptime  the usual',
      '  clear / exit   tidy up / leave',
      '',
      'there are more. i am not telling you where.',
    ]) },
    goto: { pub: 1, run: (a) => {
      const r = resolve(a.join(' '));
      if (r.id) {
        print(`warping to etan://${r.id === 'home' ? 'home' : r.id} ...`, 'ok');
        setTimeout(() => { close(false); location.hash = r.id === 'home' ? '#/' : `#/${r.id}`; }, 380);
      } else if (r.many) print(`ambiguous. did you mean: ${r.many.join(', ')}?`, 'err');
      else if (r.none) print(['usage: goto [page]', `pages: ${PAGES.join(', ')}`], 'dim');
      else print(`404: no such chart "${a.join(' ')}". try 'ls'.`, 'err');
    } },
    ls: { pub: 1, run: () => print(PAGES.map((p, i) => `${String(i).padStart(2, '0')}  etan://${p}`)) },
    whois: { pub: 1, run: () => print('Access denied. [Insufficient permissions]', 'err') },
    whoami: { pub: 1, run: () => print(['guest (player 2)', 'permissions: look, tap, do not touch'], 'ok') },
    lastseen: { pub: 1, run: () => print(pick([
      'last seen: 4 minutes ago, resizing a div by 2px.',
      'last seen: staring at the backlog. the backlog stared back.',
      'last seen: pushing to main. regrets pending.',
      'last seen: touching grass. (unverified)',
      'last seen: three tabs deep in a rabbit hole nobody asked about.',
      'last seen: "just one more credit".',
      'last seen: asleep. probably. check discord.',
    ]), 'ok') },
    status: { pub: 1, run: () => print([
      'PLAYER ....... Etan',
      'CLASS ........ builder of bots, tools, questionable web pages',
      'STATUS ....... online. probably.',
      'SLEEP ........ [NOT FOUND]',
      `TODOs ........ ${todoCount()} and counting`,
    ], 'ok') },
    todo: { pub: 1, run: () => {
      const n = todoCount();
      print(n ? [`${n} TODO${n > 1 ? 's' : ''} left in songs.js.`, 'no pressure.'] : ['zero TODOs. who are you and what did you do with etan?'], n ? 'hl' : 'ok');
    } },
    fortune: { pub: 1, run: () => print(pick([
      'your next commit will contain exactly one typo.',
      'a rhythm game will eat your evening. you will say it was worth it.',
      'the bug is in the line you were sure was fine.',
      'good news: it works on your machine.',
      'you will lose a combo to a single stray note. as is tradition.',
      'someone in the server is about to say "wait, is the bot down?"',
    ]), 'hl') },
    credits: { pub: 1, run: () => print([
      'design + code ... etan',
      'fonts ........... Dela Gothic One, Chakra Petch, Atkinson Hyperlegible, Share Tech Mono',
      'frameworks ...... none. we do not talk about frameworks.',
      'real arcade games harmed ... 0',
    ]) },
    date: { pub: 1, run: () => print(new Date().toString()) },
    uptime: { pub: 1, run: () => { const s = Math.round((performance.now() - t0) / 1000); print(`you have wasted ${s} second${s === 1 ? '' : 's'} here. thank you.`); } },
    clear: { pub: 1, run: () => { log.textContent = ''; } },
    exit: { pub: 1, run: () => close() },

    // hidden
    sudo: { run: () => print(['guest is not in the sudoers file.', 'this incident will be reported. (to nobody. it is a static site.)'], 'err') },
    rm: { run: () => print('nice try. nothing deleted. there is barely anything here to delete.', 'err') },
    ping: { run: (a) => print(`pong${a[0] ? ` from ${a[0]}` : ''} (eventually)`, 'ok') },
    sleep: { run: () => print(['sleep: command not found', 'sleep: also not found on user.'], 'err') },
    coffee: { run: () => print(['brewing...', 'error: 418 i am a teapot'], 'hl') },
    rating: { run: () => print('rating: [REDACTED]. it is lower than you think. and higher than it was last week.', 'hl') },
    backlog: { run: () => print('games in backlog: yes.', 'hl') },
    konami: { run: () => print('UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A. +0 lives. we do not do lives here.', 'hl') },
    cheats: { run: () => print('you are already in cheats. this is the cheat. congratulations.', 'ok') },
    secret: { run: () => print('Access denied. [Insufficient permissions]', 'err') },
    hello: { run: () => print(pick(['hi.', 'hello, player 2.', 'o/', 'sup. try "help".'])) },
    echo: { run: (a) => print(a.join(' ')) },
    reboot: { run: () => { print('rebooting arcade...', 'ok'); setTimeout(() => { close(false); location.hash = '#/'; }, 500); } },
    matrix: { run: () => print(['wake up, player 2...', 'the combo has you.', 'follow the white notes.'], 'ok') },
    bot: { run: () => print('etan bot: online-ish. ask it nicely.', 'ok') },
  };
  CMDS.pages = CMDS.ls;
  CMDS.man = CMDS.help;
  CMDS['?'] = CMDS.help;
  CMDS.quit = CMDS.exit;
  CMDS.hi = CMDS.hello;
  CMDS.cls = CMDS.clear;

  function run(line) {
    line = line.trim();
    if (!line) return;
    print(`$ ${line}`, 'cmd');
    history.push(line);
    hi = history.length;
    const [name, ...args] = line.split(/\s+/);
    const c = CMDS[name.toLowerCase()];
    if (c) c.run(args);
    else print(`etan: command not found: ${name}. try 'help'.`, 'err');
  }

  function complete() {
    const parts = input.value.split(/\s+/);
    const pool = parts.length < 2
      ? Object.keys(CMDS).filter((k) => CMDS[k].pub)
      : parts[0].toLowerCase() === 'goto' ? PAGES : [];
    const word = parts[parts.length - 1].toLowerCase();
    const hits = pool.filter((p) => p.startsWith(word));
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      input.value = parts.join(' ') + (parts.length < 2 && hits[0] === 'goto' ? ' ' : '');
    } else if (hits.length > 1) print(hits.join('  '), 'dim');
  }

  /* ---------- open / close ---------- */
  function open() {
    if (!con.hidden) return;
    returnTo = document.activeElement;
    con.hidden = false;
    body.classList.add('con-open');
    if (!booted) {
      booted = true;
      print(['ETAN//BEAT cheat console v0.1', "type 'help'. or tap a shortcut below.", ''], 'ok');
    }
    input.focus();
  }
  function close(restore = true) {
    if (con.hidden) return;
    con.hidden = true;
    body.classList.remove('con-open');
    if (restore && returnTo && returnTo.focus) returnTo.focus();
  }

  ['help', 'ls', 'lastseen', 'whois etan', 'goto home'].forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', () => { run(c); input.focus({ preventScroll: true }); });
    quick.appendChild(b);
  });

  opener.addEventListener('click', open);
  $('#con-x').addEventListener('click', () => close());
  con.addEventListener('click', (e) => { if (e.target === con) close(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });

  con.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.target === input) {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = history[--hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hi < history.length - 1 ? history[++hi] : ((hi = history.length), ''); }
      else if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); complete(); }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); log.textContent = ''; }
    }
    if (e.key === 'Tab') { // keep focus inside the window
      const f = [...con.querySelectorAll('button, input')].filter((x) => !x.disabled);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last && e.target !== input) { e.preventDefault(); first.focus(); }
    }
  });

  addEventListener('keydown', (e) => {
    if (e.key === '`' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      con.hidden ? open() : close();
    }
  });
})();
