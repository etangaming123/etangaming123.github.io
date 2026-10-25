/* ?cuspage=<username>/<gistid>  ->  adds that Friend Page for this visit and opens its panel (not fullscreen).
   Only gists are accepted here: a link must not be able to make the site fetch arbitrary addresses.
   Not saved to the browser; the visitor can hit "Save to this browser" on the panel. */
(() => {
  const P = window.Pages;
  const ref = new URLSearchParams(location.search).get('cuspage');
  if (!P || !ref) return;
  const at = location.hash.replace(/^#\/?/, '');
  if (at) return; // a deep link in the hash wins

  const spec = P.parseRef(ref);
  (async () => {
    try {
      if (!spec || spec.kind !== 'gist') throw new Error('?cuspage= needs a gist, like ?cuspage=username/gistid');
      P.init();
      const key = await P.add(spec.ref, false);
      location.hash = `#/pages/${encodeURIComponent(key)}/info`;
    } catch (err) { // land on the Import panel, which shows what went wrong
      P.lastError = { ref, message: err.message };
      location.hash = '#/pages/import/info';
    }
  })();
})();
