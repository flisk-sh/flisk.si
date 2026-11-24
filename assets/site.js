/* The filter: every link is in the HTML, so the page reads without this script. */
(function () {
  const input = document.getElementById('filter');
  const empty = document.getElementById('empty');
  const groups = Array.from(document.querySelectorAll('[data-group]'));
  if (!input) return;

  function apply() {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    groups.forEach((group) => {
      let inGroup = 0;
      group.querySelectorAll('[data-row]').forEach((row) => {
        const match = words.every((word) => row.dataset.text.includes(word));
        row.hidden = !match;
        if (match) inGroup += 1;
      });
      group.hidden = inGroup === 0;
      shown += inGroup;
    });
    empty.hidden = shown > 0;
  }

  input.addEventListener('input', apply);
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== input) {
      event.preventDefault();
      input.focus();
    } else if (event.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      apply();
    }
  });
  apply();
})();

/* Language: picking one in the footer is remembered in a cookie, so the next visit to the English home page goes to it.
   The pages are static, so there is no redirect from the browser language: search engines and first-time visitors always
   get the page they asked for (hreflang tells search engines about the other languages). */
(function () {
  const LANGS = ['en', 'nl', 'de'];
  const read = () => (document.cookie.match(/(?:^|;\s*)flisk_lang=(en|nl|de)/) || [])[1];
  const write = (lang) => {
    try { document.cookie = `flisk_lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`; } catch (e) { /* cookies blocked: the choice is just not remembered */ }
  };
  document.querySelectorAll('.foot .lang a[data-lang]').forEach((a) => {
    a.addEventListener('click', () => write(a.dataset.lang));
  });
  const wanted = read();
  const here = document.documentElement.lang;
  const isHome = location.pathname === '/' || location.pathname === '/index.html';
  if (isHome && !location.search.includes('lang=') && LANGS.includes(wanted) && wanted !== 'en' && here === 'en') {
    location.replace(`/${wanted}/${location.search}${location.hash}`);
  }
})();
