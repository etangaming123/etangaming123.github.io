/*
  All site content lives here. Add a song = add one object.
  a / b   : the song's colour pair (jacket + accent + background tint)
  NOTE    : keep a, b and ink at 4.5:1 or better (a, b against #051631 dark text; ink as text on the dark bg)
  ink     : readable accent on dark bg (use the lighter colour if one is #552B9D)
  jacket  : CSS-only cover. pattern = split | letter | block | disc | checker | chevron | stripes | grid | slash | rings | rays | zig
            text = giant word on the cover
  chips   : tech / tags, shown as difficulty-style chips
  detail  : chart info panel. info = [label, value] stat plates, body = paragraphs,
            links = [{ label, href }] (opens in a new tab). Empty arrays are simply not shown.
            list   = { label, items: [[name, tagline, optional href]] } short rows for lesser games
            stats  = optional live stat card from a plain-text gist (KEY: value lines)
            widget = optional live Discord widget, loaded on click (needs widgets enabled on the server)
*/
const SONGS = [
  {
    id: 'about-me',
    title: 'About me',
    sub: 'I make things. I do things. I like things.',
    chips: ['Personal', 'Sleepless', 'What?'],
    a: '#DDAACC', b: '#BB88EE', ink: '#DDAACC',
    jacket: { pattern: 'letter', text: 'ABOUT' },
    detail: {
      info: [
        ["Name", "etan"],
        ["Also known as", "etangaming123 / etangamingxyz"],
        ["Class", "Rhythm game casual, Python coder"],
        ["Base", "Sydney, Australia"],
        ["Build", "Jack of all trades, master of none"],
      ],
      body: [
        "I'm etan, etangaming123, etangamingxyz, \"the rafisol pfp\", or whatever you know me as.",
        "Amateur coder: I make Python projects and upload some of them to GitHub. etan bot is the main one.",
        "Content creator: sometimes I post gaming videos. You may have seen me playing maimai.",
        "\"Gamer\": hence the \"gaming\" in etangaming123. Casual on rhythm games and stacker (Tetris, if you're not from here).",
        "Get in touch: me [at] etangaming [dot] xyz. Spam, marketing and \"we'll help you grow your business!\" get ignored. Hellos are welcome.",
      ],
      links: [
        { label: "GitHub", href: "https://github.com/etangaming123" },
      ],
    },
  },
  {
    id: 'games',
    title: 'Games',
    sub: 'My name has "gaming" dude',
    chips: ['Rhythm', 'Casual', 'Niche'],
    a: '#57E1E6', b: '#F395F6', ink: '#94E649',
    jacket: { pattern: 'checker', text: 'GAMES' },
    detail: {
      info: [
        ["Main", "maimai DX"],
        ["Cabinet", "Arcade"],
      ],
      body: [
        "I LOVE maimai. for more than the game, I've met a whole bunch of cool people at my local arcade :)",
      ],
      list: {
        label: 'Other games',
        items: [
          // [name, tagline, optional link]
          ['TETR.IO', 'I stack blocks, sometimes.', 'https://ch.tetr.io/u/bug'],
          ['Denshattack!', 'DENSHATTACK!!!'],
          ['Project SEKAI', 'bum rhythm game'],
          ['Arcaea', 'finger [Content Deleted]'],
          ['Phigros', 'Phigros'],
        ],
      },
      stats: { label: 'maimai DX stats', url: 'https://gist.githubusercontent.com/etangaming123/43e1c2ee943cca54945b0e018823ccfb/raw/' },
      links: [
        { label: "Steam", href: "https://steamcommunity.com/id/etangaming123" },
      ],
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
        ["Discord", "@etangaming123"],
        ["Bluesky", "@bsky.etangaming.xyz"],
        ["Everywhere else", "@etangaming123"],
        ["Upload schedule", "Cooked"],
      ],
      body: [
        "Every account listed here is confirmed mine. If you see one of these, it's me. Not all of my accounts are listed, though.",
        "I can't DM on Bluesky (age restrictions, sorry). Instagram: @etangamingxyz is public, @etangaming123 is private and I only accept people I know irl.",
        "YouTube is for videos I couldn't be bothered making longer.",
      ],
      links: [
        { label: "YouTube", href: "https://youtube.com/@etangaming123" },
        { label: "TikTok", href: "https://tiktok.com/@etangaming123" },
        { label: "Instagram", href: "https://instagram.com/etangamingxyz" },
        { label: "Twitter", href: "https://twitter.com/etangaming123" },
        { label: "Bluesky", href: "https://bsky.app/profile/bsky.etangaming.xyz" },
        { label: "GitHub", href: "https://github.com/etangaming123" },
        { label: "Steam", href: "https://steamcommunity.com/id/etangaming123" },
        { label: "Ollama", href: "https://ollama.com/etangaming123" },
      ],
    },
  },
  {
    id: 'hurstville-lurkers',
    title: 'Hurstville Lurkers',
    sub: 'Discord server - for local community, rhythm games, and a mix of both.',
    chips: ['Community', 'Local', 'Lurkers'],
    a: '#BB88EE', b: '#FFBB00', ink: '#DDAACC',
    jacket: { pattern: 'block', text: 'LURK' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Where", "Hurstville, NSW"],
        ["For", "Study, gym, arcade"],
        ["Topics", "Hurstville + rhythm games"],
      ],
      body: [
        "Your one stop for Hurstville & Rhythm Games.",
        "Hurstville Lurkers is a Discord server / community, formerly for those who go to Hurstville often, now focusing more on Rhythm Games and their audience!",
        "Meet up with friends in Hurstville, or somewhere else! Find others who play rhythm games, like maimai or Project SEKAI!"
      ],
      links: [
        { label: "Join the server", href: "https://discord.gg/hurstville" },
        { label: "HVL webpage", href: "https://hvl.etangaming.xyz" },
        { label: "hvlbot source", href: "https://github.com/etangaming123/hvlbot" },
      ],
      widget: { type: 'discord', id: '1477464211981603040', invite: 'https://discord.gg/hurstville' },
    },
  },
  {
    id: 'etan-bot',
    title: 'etan bot',
    sub: 'Open source Discord bot that has a bunch of features.',
    chips: ['Discord', 'Python', 'Online-ish'],
    a: '#A56BEA', b: '#c5fb31', ink: '#57E1E6',
    jacket: { pattern: 'grid', text: 'BOT' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Language", "Python"],
        ["Source", "Open"],
        ["Works", "Almost everywhere"],
      ],
      body: [
        "A funny Discord bot you add to your account and use almost anywhere in Discord. Profile picture by Shoebill Studios.",
        "Fun commands: 8ball, coinflip, predictions and more.",
        "\"Useful\" commands: a URL cleaner, so messy links get cleaned up and stop tracing back to you.",
        "Cosmetic commands: a profile editor. Write an about me, add your social links, send it to your friends."
      ],
      links: [
        { label: "Add to Discord", href: "https://discord.com/oauth2/authorize?client_id=1505906056222605352" },
        { label: "Website", href: "https://etanbot.etangaming.xyz" },
        { label: "GitHub", href: "https://github.com/etangaming123/etanbot" },
        { label: "Report an issue", href: "https://github.com/etangaming123/etanbot/issues" },
      ],
    },
  },
  {
    id: 'automatic-link-cleaner',
    title: 'Automatic link cleaner',
    sub: 'Cleans and fixes links in Discord messages.',
    chips: ['Links', 'Embeds', '?tracker=somecode'],
    a: '#6B7BFF', b: '#9B6BFF', ink: '#FF6B6B',
    jacket: { pattern: 'slash', text: 'CLEAN' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Language", "Python"],
        ["Does", "Cleans + fixes links"],
        ["Side effects", "Cleaner chats"],
      ],
      body: [
        "A Discord bot that automatically cleans links in messages.",
        "Strips the tracking junk and fixes broken embeds, so what lands in chat is the link and nothing else.",
      ],
      links: [
        { label: "Website", href: "https://alc.etangaming.xyz" },
        { label: "GitHub", href: "https://github.com/etangaming123/automaticlinkcleaner" },
      ],
    },
  },
  {
    id: 'circle-chiffon',
    title: 'CiRCLE Chiffon',
    sub: 'Yet another maimai DX NET Discord Bot.',
    chips: ['maimai DX NET', 'Discord'],
    a: '#FBD796', b: '#B8DB7E', ink: '#57E1E6',
    jacket: { pattern: 'disc', text: 'CIRCLE' },
    detail: {
      info: [
        ["Game", "maimai DX NET"],
        ["Platform", "Discord"],
        ["Language", "Python"],
        ["Aka", "mai bot 2.0"],
      ],
      body: [
        "Yet another maimai DX NET Discord bot. Think of it as a homemade mimi xd / mai bot 2.0.",
      ],
      links: [
        { label: "Website", href: "https://cc.etangaming.xyz" },
        { label: "GitHub", href: "https://github.com/etangaming123/circlechiffon" },
      ],
    },
  },
  {
    id: 'nightcord',
    title: 'Nightcord',
    sub: 'Parody of Discord.',
    chips: ['Messaging', 'Web App'],
    a: '#B06CC4', b: '#DDAACC', ink: '#CCAA88',
    jacket: { pattern: 'rays', text: 'NIGHT' },
    detail: {
      info: [
        ["Type", "Web app"],
        ["Language", "JavaScript"],
        ["Hosting", "Self-hostable"],
        ["Inspired by", "Discord (lovingly)"],
      ],
      body: [
        "A web-based messaging app, built for selfhosting. A parody of Discord.",
      ],
      links: [
        { label: "Try it", href: "https://nightcord.etangaming.xyz" },
        { label: "GitHub", href: "https://github.com/etangaming123/nightcord" },
      ],
    },
  },
  {
    id: 'katsune',
    title: 'Katsune',
    sub: 'Discord bot made for Catulus\' Cat Tree.',
    chips: ['Discord', 'Catulus'],
    a: '#FF4D4D', b: '#FF8A5A', ink: '#FF6B6B',
    jacket: { pattern: 'zig', text: 'KATSUNE' },
    detail: {
      info: [
        ["Platform", "Discord"],
        ["Language", "Python"],
        ["Made for", "Catulus' Cat Tree"],
      ],
      body: [
        "The Discord bot for Catulus' Cat Tree!",
      ],
      links: [
        { label: "GitHub", href: "https://github.com/etangaming123/katsune" },
      ],
    },
  },
];
