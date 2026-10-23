// "cheats" console. Opened by the Sh in Shit, or the backtick key.
(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const con = $('#con');
  const log = $('#con-log');
  const form = $('#con-form');
  const input = $('#con-in');
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
    help: { pub: 1, desc: 'list commands, or describe one: help [command]', run: (a) => {
      const name = (a[0] || '').toLowerCase();
      if (name) {
        const c = CMDS[name];
        if (c && (c.pub || c.desc)) print(`${name}: ${c.desc}`);
        else print(`help: no help for '${a[0]}'. try 'help'.`, 'err');
        return;
      }
      const pub = Object.keys(CMDS).filter((k) => CMDS[k].pub && Object.keys(CMDS).find((j) => CMDS[j] === CMDS[k]) === k);
      const w = Math.max(...pub.map((k) => k.length)) + 2;
      print(['commands:', ...pub.map((k) => `  ${k.padEnd(w)}${CMDS[k].desc}`), '', "aliases: pages=ls, man/?=help, quit=exit, cls=clear, hi=hello", 'tip: Tab completes, Up/Down recalls history, Ctrl+L clears.'], 'dim');
    } },
    goto: { pub: 1, desc: 'jump to a page: goto [page]', run: (a) => {
      const r = resolve(a.join(' '));
      if (r.id) {
        print(`catching a train to etan://${r.id === 'home' ? 'home' : r.id} ...`, 'ok');
        setTimeout(() => { location.hash = r.id === 'home' ? '#/' : `#/${r.id}`; }, 250);
      } else if (r.many) print(`ambiguous. did you mean: ${r.many.join(', ')}?`, 'err');
      else if (r.none) print(['usage: goto [page]', `pages: ${PAGES.join(', ')}`], 'dim');
      else print(`404: no such chart "${a.join(' ')}". try 'ls'.`, 'err');
    } },
    ls: { pub: 1, desc: 'list every page', run: () => print(PAGES.map((p, i) => `${String(i).padStart(2, '0')}  etan://${p}`)) },
    whois: { pub: 1, desc: 'who runs this place?', run: () => print('access denied. [insufficient permissions]', 'err') },
    whoami: { pub: 1, desc: 'show current user', run: () => print(['guest', 'permissions: read-only. look, don\'t touch.'], 'ok') },
    lastseen: { pub: 1, desc: 'when was etan last seen?', run: () => print(pick([
      'last seen: 4 minutes ago, resizing a div by 2px.',
      'last seen: staring at the backlog. the backlog stared back.',
      'last seen: pushing to main. regrets pending.',
      'last seen: touching grass. (unverified)',
      'last seen: three tabs deep in a rabbit hole nobody asked about.',
      'last seen: "just one more credit".',
      'last seen: asleep. probably. check discord.',
      'last seen: 2 minutes ago, asking Fable 5.1 on Ultracode with dangerous permissions "who is json?"',
      'last seen: 3 hours ago, [redacted]',
    ]), 'ok') },
    status: { pub: 1, desc: 'player stats', run: () => print([
      'PLAYER ....... guest',
      'CLASS ........ idk what you do bro',
      'STATUS ....... empty',
      'SLEEP ........ few hours?',
      `TODOs ........ ${todoCount()} and counting`,
    ], 'ok') },
    todo: { pub: 1, desc: 'count the TODOs left', run: () => {
      const n = todoCount();
      print(n ? [`${n} TODO${n > 1 ? 's' : ''} left in songs.js.`, 'no pressure.'] : ['zero TODOs. who are you and what did you do with etan?'], n ? 'hl' : 'ok');
    } },
    fortune: { pub: 1, desc: 'get your fortune', run: () => print(pick([
      'your next commit will contain exactly one typo.',
      'a rhythm game will eat your evening. you will say it was worth it.',
      'the bug is in the line you were sure was fine.',
      'good news: it works on your machine.',
      'you will lose a combo to a single stray note. as is tradition.',
      'someone in the server is about to say "wait, is the bot down?"',
    ]), 'hl') },
    credits: { pub: 1, desc: 'who made this', run: () => print([
      'design + code ... Claude 😁😁😁',
      'fonts ........... Dela Gothic One, Chakra Petch, Atkinson Hyperlegible, Share Tech Mono',
      'frameworks ...... none. we do not talk about frameworks.',
      'real arcade games harmed ... 0',
    ]) },
    date: { pub: 1, desc: 'print the date and time', run: () => print(new Date().toString()) },
    uptime: { pub: 1, desc: 'time spent here', run: () => { const s = Math.round((performance.now() - t0) / 1000); print(`you have wasted ${s} second${s === 1 ? '' : 's'} here. thank you.`); } },
    clear: { pub: 1, desc: 'clear the screen', run: () => { log.textContent = ''; } },
    exit: { pub: 1, desc: 'close the console', run: () => close() },

    // hidden
    sudo: { run: () => print(['guest is not in the sudoers file.', 'this incident will be reported. (to nobody. it is a static site.)'], 'err') },
    rm: { run: () => print('deleting guest c drive...', 'err') },
    ping: { run: (a) => print(`pong${a[0] ? ` from ${a[0]}` : ''} (eventually)`, 'ok') },
    sleep: { run: () => print(['sleep: command not found', 'sleep: also not found on user.'], 'err') },
    coffee: { run: () => print(['brewing...', 'error: 418 i am a teapot'], 'hl') },
    rating: { run: () => print('rating: [REDACTED]. it is lower than you think. and higher than it was last week.', 'hl') },
    backlog: { run: () => print('games in backlog: yes.', 'hl') },
    konami: { run: () => print('controller not connected, or not found. sorry.', 'hl') },
    cheats: { run: () => print('you are already in cheats. this is the cheat. congratulations.', 'ok') },
    secret: { run: () => print('access denied. [insufficient permissions]', 'err') },
    hello: { run: () => print(pick(['hi.', 'hello, player 2.', 'o/', 'sup. try "help".'])) },
    echo: { run: (a) => print(a.join(' ')) },
    reboot: { run: () => { print('ctrl + r or command + r', 'ok'); setTimeout(() => { location.hash = '#/'; }, 400); } },
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
    print(`C:\\guest>${line}`);
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

  /* ---------- open / close / drag ---------- */
  const bar = $('#con-bar');
  const pos = { x: 0, y: 0 };
  let placed = false;
  let drag = null;

  const apply = () => {
    const w = con.offsetWidth, h = con.offsetHeight;
    pos.x = Math.round(Math.min(Math.max(pos.x, 0), Math.max(0, innerWidth - w)));
    pos.y = Math.round(Math.min(Math.max(pos.y, 0), Math.max(0, innerHeight - h)));
    con.style.setProperty('--cx', pos.x + 'px');
    con.style.setProperty('--cy', pos.y + 'px');
  };
  const save = () => { try { sessionStorage.setItem('etan-con', JSON.stringify(pos)); } catch (e) { /* no storage, fine */ } };
  function place() {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('etan-con')); } catch (e) { /* ignore */ }
    if (saved && Number.isFinite(saved.x)) Object.assign(pos, saved);
    else if (innerWidth >= 860) { pos.x = innerWidth - con.offsetWidth - 36; pos.y = innerHeight - con.offsetHeight - 36; }
    else { pos.x = (innerWidth - con.offsetWidth) / 2; pos.y = 56; }
    apply();
    placed = true;
  }

  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.button > 0) return;
    drag = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    bar.setPointerCapture(e.pointerId);
    con.classList.add('dragging');
  });
  bar.addEventListener('pointermove', (e) => {
    if (!drag) return;
    pos.x = e.clientX - drag.dx;
    pos.y = e.clientY - drag.dy;
    apply();
  });
  const drop = () => { if (drag) { drag = null; con.classList.remove('dragging'); save(); } };
  bar.addEventListener('pointerup', drop);
  bar.addEventListener('pointercancel', drop);
  bar.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 96 : 24;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    pos.x += d[0]; pos.y += d[1];
    apply(); save();
  });
  addEventListener('resize', () => { if (!con.hidden) apply(); });

  function open() {
    if (!con.hidden) { input.focus(); return; }
    returnTo = document.activeElement;
    con.hidden = false;
    if (!placed) place(); else apply();
    if (!booted) {
      booted = true;
      print(['etangaming123 Shell console', '(c) no one - 20xx', '', 'logged in as guest.', "type 'help' for commands."]);
    }
    input.focus({ preventScroll: true });
  }
  function close(restore = true) {
    if (con.hidden) return;
    con.hidden = true;
    if (restore && returnTo && returnTo.focus && document.contains(returnTo)) returnTo.focus();
  }

  opener.addEventListener('click', open);
  $('#con-x').addEventListener('click', () => close());
  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });

  con.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.target === input) {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = history[--hi]; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hi < history.length - 1 ? history[++hi] : ((hi = history.length), ''); }
      else if (e.key === 'Tab' && !e.shiftKey && input.value.trim()) { e.preventDefault(); complete(); }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); log.textContent = ''; }
    }
  });

  addEventListener('keydown', (e) => {
    if (e.key === '`' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      con.hidden ? open() : close();
    }
  });
})();
