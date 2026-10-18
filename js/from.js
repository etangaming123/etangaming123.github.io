/* ?from=<platform> / ?qr=true / ?nfc=true greeting under the etan:// logo */
(() => {
  const el = document.getElementById('from');
  if (!el) return;
  const q = new URLSearchParams(location.search);
  const from = (q.get('from') || '').toLowerCase();
  const platforms = ['discord', 'youtube', 'github', 'instagram', 'bluesky', 'steam', 'roblox', 'osu', 'guilded', 'twitter', 'monkeytype', 'ollama', 'raycast', 'tiktok'];

  let text = '';
  if (q.get('qr') === 'true') text = 'Did you like my qr code? :P';
  if (q.get('nfc') === 'true') text = 'Did you like my nfc tag? :P';
  if (platforms.includes(from)) text = `Hello from ${from[0].toUpperCase()}${from.slice(1)}!`;

  if (text) {
    el.textContent = text;
    el.hidden = false;
  }
})();
