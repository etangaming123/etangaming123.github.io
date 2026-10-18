/*
  All site content lives here. Add a song = add one object.
  a / b   : the song's colour pair (jacket + accent + background tint)
  ink     : readable accent on dark bg (use the lighter colour if one is #552B9D)
  jacket  : CSS-only cover. pattern = split | checker | chevron | stripes | grid | slash | rings | rays | zig
            text = giant word on the cover
  chips   : tech / tags, shown as difficulty-style chips
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
  },
  {
    id: 'games',
    title: 'Games',
    sub: 'I tap buttons on arcade game.',
    chips: ['Rhythm', 'Backlog', 'TODO'],
    a: '#57E1E6', b: '#F395F6', ink: '#94E649',
    jacket: { pattern: 'checker', text: 'GAMES' },
  },
  {
    id: 'social-media',
    title: 'Social media',
    sub: 'Cooked upload schedule.',
    chips: ['Links', 'Procrastination'],
    a: '#E46883', b: '#FAE85A', ink: '#81FCFD',
    jacket: { pattern: 'chevron', text: 'SOCIAL' },
  },
  {
    id: 'hurstville-lurkers',
    title: 'Hurstville Lurkers',
    sub: 'Discord server - for local community, rhythm games, and a mix of both.',
    chips: ['Community', 'Local', 'TODO'],
    a: '#BB88EE', b: '#FFBB00', ink: '#DDAACC',
    jacket: { pattern: 'stripes', text: 'LURK' },
  },
  {
    id: 'etan-bot',
    title: 'etan bot',
    sub: 'Open source Discord bot that has a bunch of features.',
    chips: ['Discord', 'Python', 'Online-ish'],
    a: '#8649D7', b: '#c5fb31', ink: '#57E1E6',
    jacket: { pattern: 'grid', text: 'BOT' },
  },
  {
    id: 'automatic-link-cleaner',
    title: 'Automatic link cleaner',
    sub: 'Cleans and fixes links in Discord messages.',
    chips: ['Links', 'Embeds', '?tracker=somecode'],
    a: '#0000EE', b: '#551A8B', ink: '#dc3545',
    jacket: { pattern: 'slash', text: 'CLEAN' },
  },
  {
    id: 'circle-chiffon',
    title: 'CiRCLE Chiffon',
    sub: 'Yet another maimai DX NET Discord Bot.',
    chips: ['maimai DX NET', 'Discord'],
    a: '#FBD796', b: '#B8DB7E', ink: '#57E1E6',
    jacket: { pattern: 'rings', text: 'CIRCLE' },
  },
  {
    id: 'nightcord',
    title: 'Nightcord',
    sub: 'Parody of Discord.',
    chips: ['Messaging', 'Web App'],
    a: '#884499', b: '#DDAACC', ink: '#CCAA88',
    jacket: { pattern: 'rays', text: 'NIGHT' },
  },
  {
    id: 'katsune',
    title: 'Katsune',
    sub: 'Discord bot made for Catulus\' Cat Tree.',
    chips: ['Discord', 'Catulus'],
    a: '#FF0000', b: '#FF0000', ink: '#FF0000',
    jacket: { pattern: 'zig', text: 'KATSUNE' },
  },
];
