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
    sub: 'Player 1. Has opinions, mostly about fonts.',
    chips: ['Human', 'Nocturnal', 'TODO'],
    a: '#DDAACC', b: '#BB88EE', ink: '#DDAACC',
    jacket: { pattern: 'split', text: 'ABOUT' },
  },
  {
    id: 'games',
    title: 'Games',
    sub: 'Where the sleep goes. TODO: favourites.',
    chips: ['Rhythm', 'Backlog', 'TODO'],
    a: '#57E1E6', b: '#F395F6', ink: '#57E1E6',
    jacket: { pattern: 'checker', text: 'GAMES' },
  },
  {
    id: 'social-media',
    title: 'Social media',
    sub: 'Find me. Please be normal about it.',
    chips: ['Links', 'TODO'],
    a: '#F395F6', b: '#552B9D', ink: '#F395F6',
    jacket: { pattern: 'chevron', text: 'SOCIAL' },
  },
  {
    id: 'hurstville-lurkers',
    title: 'Hurstville Lurkers',
    sub: 'Local group chat energy. TODO: what it is.',
    chips: ['Community', 'Local', 'TODO'],
    a: '#BB88EE', b: '#57E1E6', ink: '#BB88EE',
    jacket: { pattern: 'stripes', text: 'LURK' },
  },
  {
    id: 'etan-bot',
    title: 'etan bot',
    sub: 'A bot that does things. Mostly the right ones.',
    chips: ['Bot', 'TODO stack', 'Online-ish'],
    a: '#57E1E6', b: '#552B9D', ink: '#57E1E6',
    jacket: { pattern: 'grid', text: 'BOT' },
  },
  {
    id: 'automatic-link-cleaner',
    title: 'Automatic link cleaner',
    sub: 'Scrubs the tracking gunk off your links.',
    chips: ['Privacy', 'Tool', 'TODO'],
    a: '#DDAACC', b: '#57E1E6', ink: '#DDAACC',
    jacket: { pattern: 'slash', text: 'CLEAN' },
  },
  {
    id: 'circle-chiffon',
    title: 'CiRCLE Chiffon',
    sub: 'TODO: what is this. Sounds delicious.',
    chips: ['TODO', 'TODO'],
    a: '#F395F6', b: '#DDAACC', ink: '#F395F6',
    jacket: { pattern: 'rings', text: 'CIRCLE' },
  },
  {
    id: 'nightcord',
    title: 'Nightcord',
    sub: 'TODO: describe. Probably after midnight.',
    chips: ['TODO', 'TODO'],
    a: '#552B9D', b: '#BB88EE', ink: '#BB88EE',
    jacket: { pattern: 'rays', text: 'NIGHT' },
  },
  {
    id: 'katsune',
    title: 'Katsune',
    sub: 'TODO: describe. Not a typo. Maybe.',
    chips: ['TODO', 'TODO'],
    a: '#DDAACC', b: '#F395F6', ink: '#DDAACC',
    jacket: { pattern: 'zig', text: 'KATSUNE' },
  },
];
