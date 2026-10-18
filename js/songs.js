/*
  All site content lives here. Add a song = add one object.
  a / b   : the song's colour pair (jacket + accent + background tint)
  ink     : readable accent on dark bg (use the lighter colour if one is #552B9D)
  jacket  : CSS-only cover. pattern = split | checker | chevron | stripes | grid | slash | rings | rays | zig
            text = giant word on the cover
  chips   : tech / tags, shown as difficulty-style chips
  detail  : chart info panel. info = [label, value] stat plates, body = paragraphs,
            links = [{ label, href }] (opens in a new tab). Empty arrays are simply not shown.
  TODO    : placeholder copy, replace freely
*/
const SONGS = [
  {
    id: 'about-me',
    title: 'About me',
    sub: 'I make things. I do things. I like things.',
    chips: ['Personal', 'Sleepless', 'What?'],
    a: '#DDAACC', b: '#BB88EE', ink: '#DDAACC',
    jacket: { pattern: 'split', text: 'ABOUT' },
    detail: {
      info: [
        ["Name", "etan"],
        ["Handle", "etangaming123"],
        ["Class", "Builder"],
        ["Base", "Sydney, AU"],
        ["Sleep", "[NOT FOUND]"],
      ],
      body: [
        "TODO: the real about-me. How you got into bots, rhythm games, what you do all day, whatever you want strangers to know.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'games',
    title: 'Games',
    sub: 'I tap buttons on arcade game.',
    chips: ['Rhythm', 'Backlog', 'TODO'],
    a: '#57E1E6', b: '#F395F6', ink: '#94E649',
    jacket: { pattern: 'checker', text: 'GAMES' },
    detail: {
      info: [
        ["Main", "Arcade rhythm games"],
        ["Input", "Tapping buttons"],
        ["Favourite", "TODO"],
        ["Backlog", "Infinite"],
      ],
      body: [
        "TODO: which games, what ratings, what you're grinding right now, cabinet locations if you want people to find you.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'social-media',
    title: 'Social media',
    sub: 'Cooked upload schedule.',
    chips: ['Links', 'Procrastination'],
    a: '#E46883', b: '#FAE85A', ink: '#81FCFD',
    jacket: { pattern: 'chevron', text: 'SOCIAL' },
    detail: {
      info: [
        ["Upload schedule", "Cooked"],
        ["Reliability", "Low"],
        ["Platforms", "TODO"],
      ],
      body: [
        "TODO: where to find you, and what to expect when you get there.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'hurstville-lurkers',
    title: 'Hurstville Lurkers',
    sub: 'Discord server - for local community, rhythm games, and a mix of both.',
    chips: ['Community', 'Local', 'TODO'],
    a: '#BB88EE', b: '#FFBB00', ink: '#DDAACC',
    jacket: { pattern: 'stripes', text: 'LURK' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Topic", "Local community + rhythm games"],
        ["Members", "TODO"],
        ["Vibe", "Lurk-friendly"],
      ],
      body: [
        "TODO: who it's for, how to join, the rules of lurking.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'etan-bot',
    title: 'etan bot',
    sub: 'Open source Discord bot that has a bunch of features.',
    chips: ['Discord', 'Python', 'Online-ish'],
    a: '#8649D7', b: '#c5fb31', ink: '#57E1E6',
    jacket: { pattern: 'grid', text: 'BOT' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Language", "Python"],
        ["Source", "Open"],
        ["Status", "Online-ish"],
      ],
      body: [
        "TODO: the actual feature list, how to invite it, how to host it, where the repo lives.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'automatic-link-cleaner',
    title: 'Automatic link cleaner',
    sub: 'Cleans and fixes links in Discord messages.',
    chips: ['Links', 'Embeds', '?tracker=somecode'],
    a: '#0000EE', b: '#551A8B', ink: '#dc3545',
    jacket: { pattern: 'slash', text: 'CLEAN' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Does", "Cleans + fixes links"],
        ["Targets", "Tracking params, broken embeds"],
        ["Side effects", "Cleaner chats"],
      ],
      body: [
        "TODO: which sites it supports, an example of before/after, how to add it.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'circle-chiffon',
    title: 'CiRCLE Chiffon',
    sub: 'Yet another maimai DX NET Discord Bot.',
    chips: ['maimai DX NET', 'Discord'],
    a: '#FBD796', b: '#B8DB7E', ink: '#57E1E6',
    jacket: { pattern: 'rings', text: 'CIRCLE' },
    detail: {
      info: [
        ["Game", "maimai DX NET"],
        ["Platform", "Discord"],
        ["Type", "Bot"],
      ],
      body: [
        "TODO: what it does (scores? ratings? recommendations?), commands, invite link.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'nightcord',
    title: 'Nightcord',
    sub: 'Parody of Discord.',
    chips: ['Messaging', 'Web App'],
    a: '#884499', b: '#DDAACC', ink: '#CCAA88',
    jacket: { pattern: 'rays', text: 'NIGHT' },
    detail: {
      info: [
        ["Type", "Web app"],
        ["Category", "Messaging"],
        ["Inspired by", "Discord (lovingly)"],
      ],
      body: [
        "TODO: what's real, what's a joke, a screenshot, a link to try it.",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
  {
    id: 'katsune',
    title: 'Katsune',
    sub: 'Discord bot made for Catulus\' Cat Tree.',
    chips: ['Discord', 'Catulus'],
    a: '#FF0000', b: '#FF0000', ink: '#FF0000',
    jacket: { pattern: 'zig', text: 'KATSUNE' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Made for", "Catulus' Cat Tree"],
        ["Type", "Bot"],
      ],
      body: [
        "TODO: what it does for the server, features, who Catulus is (optional).",
      ],
      links: [], // { label: 'GitHub', href: 'https://...' }
    },
  },
];
