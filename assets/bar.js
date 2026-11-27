---
---
/* The Flisk bar: one slim strip that every Flisk site can put at the top of its page, so moving between our sites feels
   like one site. Add it with one line:  <script src="https://flisk.si/assets/bar.js" defer></script>
   It sits in the page flow (it never covers content), keeps its styles to itself, and is built from the `bar:` block of
   _data/catalog.yml: the flagship first, then a few menus, each item with its icon and one plain sentence.
   The page it is on is marked as current.
   A site can also show its own logo card in the bar, with a "from Flisk" line, its sibling products and tooltips:
   <script src="https://flisk.si/assets/bar.js" data-product="GEL" data-icon="gel" data-accent="#b49cff" data-text="One plain sentence about the site" defer></script> */
/* A page can restyle every part of the bar except the sponsor button with flisk-bar::part(tone), for example
   flisk-bar::part(tone) { filter: grayscale(1) } for a colourless look that still keeps the button pink. */
(function () {
  const OPT = (document.currentScript && document.currentScript.dataset) || {};
  if (window.top !== window.self || document.querySelector('flisk-bar')) return;
  const HOME = {{ site.url | jsonify }};
  {%- assign bar = site.data.catalog.bar %}
  const FIRST = [
    {%- for section in site.data.catalog.sections %}{% for item in section.items %}{% if item.name == bar.first %}
    {{ bar.first_label | default: item.name | jsonify }}, {{ item.url | jsonify }},
    {%- endif %}{% endfor %}{% endfor %}
  ];
  const MENUS = [
    {%- for menu in bar.menus %}
    [{{ menu.label | jsonify }}, [
      {%- for name in menu.items %}{% for section in site.data.catalog.sections %}{% for item in section.items %}{% if item.name == name %}
      [{{ item.name | jsonify }}, {{ item.url | jsonify }}, {{ item.icon | jsonify }}, {{ item.text | jsonify }}],
      {%- endif %}{% endfor %}{% endfor %}{% endfor %}
    ]],
    {%- endfor %}
  ];
  const THEMES = {{ site.data.bar_themes | jsonify }};
  // The profile icon at the far right shows only on a site listed here, so it can roll out one site at a time. The bar never touches a
  // site's sign-in: signIn is the site's own sign-in link, signOut replays its own sign-out (a same-origin form POST, or a plain GET),
  // login is a CSS selector of an element the site already renders with the login name (without it the menu offers Sign in), and
  // console is where the Console item goes (default: the fleet console).
  //   'chat.flisk.si': { signIn: '/auth/start', signOut: { url: '/auth/signout', method: 'GET' }, login: '#who' },
  const ACCOUNT = {
    'fleet.flisk.si': { signIn: '/console', signOut: { url: '/auth/signout', method: 'POST' }, login: '[data-flisk-login]' },
    'host.flisk.si': { signIn: '/console', signOut: { url: '/auth/signout', method: 'POST' }, login: '[data-flisk-login]' },
    'learn.flisk.si': { signIn: '/auth/login', signOut: { url: '/auth/logout', method: 'POST' }, login: '[data-flisk-login]', console: '/practice' },
    'analytics.flisk.si': { signIn: '/auth/login', signOut: { url: '/logout', method: 'POST' }, login: '[data-flisk-login]', console: '/' },
    'chat.flisk.si': { signIn: '/auth/start', signOut: { url: '/auth/signout', method: 'GET' }, login: '[data-flisk-login]', console: '/reviews' },
    'inference.flisk.si': { signIn: '/auth/github', signOut: { url: '/auth/logout', method: 'GET' }, login: '[data-flisk-login]', console: '/?section=keys' },
    'grow.flisk.si': { signIn: '/auth/start', signOut: { url: '/auth/out', method: 'GET' }, login: '[data-flisk-login]', console: '/me' },
    'traces.flisk.si': { signIn: '/auth/start', signOut: { url: '/auth/signout', method: 'GET' }, login: '[data-flisk-login]', console: '/' },
    'roadmap.flisk.si': { signIn: 'https://publish.flisk.si/auth/github?return=https%3A%2F%2Froadmap.flisk.si%2F', signOut: { event: 'flisk:signout' }, login: '[data-flisk-login]', console: '/portfolio/' },
    'ranker.flisk.si': { signIn: '/login', signOut: { url: '/logout', method: 'GET' }, login: '[data-flisk-login]', console: '/submit' },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  // The bar's own words follow the language of the page it sits on (<html lang>). Product names and the sentences under them stay English.
  const WORDS = {
    nl: { 'AI chat': 'AI-chat', 'AI cloud': 'AI-cloud', 'AI growth': 'AI-groei', 'AI locally': 'AI lokaal', 'AI learn': 'AI leren', 'AI tools': 'AI-tools',
          'Products': 'Producten', 'All products': 'Alle producten', 'Every Flisk product →': 'Elk Flisk-product →', 'Flisk products': 'Flisk-producten',
          'Talk to a human engineer': 'Praat met een echte engineer', 'Talk to a human engineer on Discord': 'Praat op Discord met een engineer',
          'Get a free API key': 'Haal een gratis API-sleutel', 'Help us explore more': 'Help ons verder verkennen', 'Help us explore more: sponsor Flisk on GitHub': 'Help ons verder verkennen: sponsor Flisk op GitHub', 'Sponsor Flisk on GitHub': 'Sponsor Flisk op GitHub',
          'Find a tool': 'Zoek een tool', 'Your tools': 'Jouw tools', 'Pin': 'Maak vast', 'Unpin': 'Maak los', 'No tool matches that.': 'Geen tool gevonden.',
          'Star a tool to pin it. The last tools you opened show up here too.': 'Geef een tool een ster om hem vast te maken. Je laatst geopende tools staan hier ook.',
          'Account': 'Account', 'Sign in': 'Inloggen', 'Signed in as': 'Ingelogd als', 'Console': 'Console', 'Log out': 'Uitloggen' },
    de: { 'AI chat': 'KI-Chat', 'AI cloud': 'KI-Cloud', 'AI growth': 'KI-Wachstum', 'AI locally': 'KI lokal', 'AI learn': 'KI lernen', 'AI tools': 'KI-Tools',
          'Products': 'Produkte', 'All products': 'Alle Produkte', 'Every Flisk product →': 'Jedes Flisk-Produkt →', 'Flisk products': 'Flisk-Produkte',
          'Talk to a human engineer': 'Sprich mit einem echten Engineer', 'Talk to a human engineer on Discord': 'Sprich auf Discord mit einem Engineer',
          'Get a free API key': 'Hol dir einen kostenlosen API-Key', 'Help us explore more': 'Hilf uns, mehr zu entdecken', 'Help us explore more: sponsor Flisk on GitHub': 'Hilf uns, mehr zu entdecken: Flisk auf GitHub sponsern', 'Sponsor Flisk on GitHub': 'Flisk auf GitHub sponsern',
          'Find a tool': 'Tool suchen', 'Your tools': 'Deine Tools', 'Pin': 'Anpinnen', 'Unpin': 'Lösen', 'No tool matches that.': 'Kein Tool gefunden.',
          'Star a tool to pin it. The last tools you opened show up here too.': 'Markiere ein Tool mit dem Stern, um es anzupinnen. Zuletzt geöffnete Tools erscheinen hier auch.',
          'Account': 'Konto', 'Sign in': 'Anmelden', 'Signed in as': 'Angemeldet als', 'Console': 'Console', 'Log out': 'Abmelden' },
  };
  const words = WORDS[(document.documentElement.lang || '').slice(0, 2).toLowerCase()] || {};
  const t = (text) => words[text] || text;
  const here = window.location.hostname.replace(/^www\./, '');
  const isHere = (url) => new URL(url).hostname.replace(/^www\./, '') === here;
  // Count visits on every site that shows the bar, unless the page already has Flisk Analytics. data-domain is the site's own host.
  if (!document.querySelector('script[src*="flisk.sh/a.js"]')) {
    const stat = document.createElement('script');
    stat.defer = true;
    stat.dataset.domain = here;
    stat.src = 'https://flisk.sh/a.js';
    document.head.appendChild(stat);
  }
  // One Flisk look across every site. The chosen look travels in the ?flisk_theme= link parameter (so it crosses to flisk.sh)
  // and in a cookie on .flisk.si (so every *.flisk.si site sees it). The bar themes itself from it and marks <html data-flisk-theme>,
  // so a site can adopt the same tokens from flisk-themes. With no look chosen, the bar follows the colour of the page it is on.
  const KEY = 'flisk_theme';
  const onFlisk = /(^|\.)flisk\.si$/.test(here);
  const readCookie = () => (document.cookie.match(/(?:^|;\s*)flisk_theme=([a-z-]{2,24})/) || [])[1];
  let theme = (new URLSearchParams(location.search).get(KEY) || '').toLowerCase();
  if (!THEMES[theme]) theme = readCookie() || '';
  if (!THEMES[theme]) theme = '';
  if (theme) {
    try { document.cookie = `${KEY}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${onFlisk ? '; Domain=.flisk.si' : ''}${location.protocol === 'https:' ? '; Secure' : ''}`; } catch (e) { /* cookies blocked: the link parameter still carries the look */ }
    document.documentElement.dataset.fliskTheme = theme;
  }
  const carry = (url) => !theme ? url : `${url}${url.includes('?') ? '&' : '?'}${KEY}=${theme}`;
  // The flagship link says which Flisk site sent the visitor, so analytics.flisk.si can show which site brings Chat its users.
  const tracked = (url) => isHere(url) ? url : `${url}${url.includes('?') ? '&' : '?'}utm_source=${encodeURIComponent(here)}&utm_medium=bar&utm_campaign=flisk-bar`;
  // The free inference key: one entry for sites with no key of their own, except on inference.flisk.si itself. The link says which
  // Flisk site sent the visitor (utm_source is this page's host), so analytics shows Source=<site>, Channel=bar, Campaign=free-key.
  // Opt-in: only sites that use keys (script tag has data-free-key) show the button; every other site gets none.
  const keyUrl = !('freeKey' in OPT) || here === 'inference.flisk.si' ? '' : carry(`https://inference.flisk.si/?section=keys&utm_source=${encodeURIComponent(here)}&utm_medium=bar&utm_campaign=free-key`);
  // flisk.si and flisk.sh already show the flisk brand in their own header, so the bar leaves its brand out there.
  const ownsBrand = here === 'flisk.si' || here === 'flisk.sh';
  const host = document.createElement('flisk-bar');
  host.style.cssText = 'display:block;position:relative;z-index:2147483000';
  /* Inter ExtraLight, the same face as the Ranker headline. Web fonts load from the page, not the shadow root. */
  if (!document.querySelector('link[data-flisk-bar-font]')) {
    const f = document.createElement('link');
    f.rel = 'stylesheet'; f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Space+Grotesk:wght@700&display=swap'; f.setAttribute('data-flisk-bar-font', '');
    document.head.appendChild(f);
  }
  const root = host.attachShadow({ mode: 'open' });
  // Product mode: the site's own logo card, its sibling products, and tooltips on the small controls.
  const PRODUCT = OPT.product || '';
  const find = (name) => MENUS.flatMap(([, items]) => items).find(([n]) => n === name);
  const iconSrc = (i) => /^(https?:|\/|data:)/.test(i) ? i : `${HOME}/assets/icons/${i}.svg`;
  const tip = (title, text) => ` data-tip="${esc(text ? title + '\n' + text : title)}"`;
  // Siblings come from the catalog: the two nearest products in this product's own bar menu (matched by icon, then name).
  // A product that is in no menu (the flagship, or one not listed yet) shows none; data-siblings is no longer read.
  const neighbours = () => {
    for (const [, items] of MENUS) {
      const at = items.findIndex(([n, , i]) => (OPT.icon && i === OPT.icon) || n === PRODUCT);
      if (at < 0) continue;
      return items.map((it, k) => [Math.abs(k - at), k, it]).filter(([d]) => d > 0).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, 2).map(([, , it]) => it);
    }
    return null;
  };
  const siblings = !PRODUCT ? [] : (neighbours() || []);
  const card = !PRODUCT ? '' : `<div class="card" part="tone">
      <a class="pil" href="${esc(location.origin + '/')}" tabindex="-1" aria-hidden="true"><img class="pi" src="${esc(iconSrc(OPT.icon || 'flisk-cli'))}" alt="" width="40" height="40"></a>
      <a class="pn"${tip(PRODUCT, OPT.text)} href="${esc(location.origin + '/')}">${esc(PRODUCT)}</a>
      <a class="fl"${tip('All Flisk products', 'AI chat, cloud, growth, locally, learn and tools')} href="${esc(carry(HOME + '/'))}">from <img src="${HOME}/assets/icons/flisk-cli.svg" alt="" width="14" height="14"><strong translate="no">Flisk</strong></a></div>
    <span class="sibs">${siblings.map(([n, u, i, t]) => `<a class="sib" part="tone"${tip(n, t)} href="${esc(carry(u))}"><img src="${HOME}/assets/icons/${esc(i)}.svg" alt="" width="26" height="26"><span class="sr">${esc(n)}</span></a>`).join('')}</span>`;

  // In the wide panels each item also gets a pin button next to its link (a sibling, never nested inside the link).
  const panel = (items, pins) => items.map(([name, url, icon, text]) => {
    const link = `<a class="item" href="${esc(carry(url))}"${isHere(url) ? ' aria-current="page"' : ''}>
       <img src="${HOME}/assets/icons/${esc(icon)}.svg" alt="" width="28" height="28">
       <span><b>${esc(name)}</b><small>${esc(text)}</small></span></a>`;
    return pins ? `<div class="it" data-icon="${esc(icon)}">${link}<button class="pin" type="button" aria-pressed="false" data-name="${esc(name)}" aria-label="${esc(t('Pin'))} ${esc(name)}">☆</button></div>` : link;
  }).join('');
  // The top of a wide panel: a search box, the visitor's pinned and recent tools, and the empty-search message.
  const finder = `<div class="find"><input type="search" placeholder="${esc(t('Find a tool'))}" aria-label="${esc(t('Find a tool'))}" autocomplete="off"><span class="cnt" aria-live="polite"></span></div>
      <div class="mine"><p>${esc(t('Your tools'))}</p><p class="hint">${esc(t('Star a tool to pin it. The last tools you opened show up here too.'))}</p><div class="mineList"></div></div>
      <p class="none" hidden>${esc(t('No tool matches that.'))}</p>`;
  const menus = MENUS.map(([label, items], i) => {
    const current = items.some(([, url]) => isHere(url)) ? ' data-current' : '';
    return `<div class="menu">
      <button part="tone" type="button" aria-expanded="false" aria-controls="m${i}"${current}>${esc(t(label))}<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button>
      <div class="panel" part="tone" id="m${i}" hidden>${panel(items)}</div></div>`;
  }).join('');
  // On the compact bar the pill is hidden and the same entry sits at the top of the Products menu (it is hidden on the full bar).
  const keyIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="11" r="2.75"/><path d="M7 9l6.5-6.5M11 4.5l1.75 1.75M9.5 6l1.5 1.5"/></svg>';
  const keyItem = !keyUrl ? '' : `<a class="item keyitem" href="${esc(keyUrl)}" target="_blank" rel="noopener">${keyIcon}<span><b>${esc(t('Get a free API key'))}</b></span></a>`;
  const switcher = !PRODUCT ? '' : `<div class="menu all-menu sw">
      <button part="tone" type="button" aria-expanded="false" aria-controls="msw" aria-label="${esc(t('All Flisk products'))}"${tip(t('All Flisk products'), t('Switch to any Flisk product'))}><svg class="gr" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h3.5v3.5H2zM6.25 2h3.5v3.5h-3.5zM10.5 2H14v3.5h-3.5zM2 6.25h3.5v3.5H2zM6.25 6.25h3.5v3.5h-3.5zM10.5 6.25H14v3.5h-3.5zM2 10.5h3.5V14H2zM6.25 10.5h3.5V14h-3.5zM10.5 10.5H14V14h-3.5z"/></svg></button>
      <div class="panel wide mega" part="tone" id="msw" hidden>${keyItem}${finder}${MENUS.map(([label, items]) => `<div class="grp"><p>${esc(t(label))}</p>${panel(items, true)}</div>`).join('')}
        <a class="every" href="${esc(carry(HOME + '/'))}">${esc(t('Every Flisk product →'))}</a></div></div>`;
  const all = PRODUCT ? '' : `<div class="menu all-menu always">
      <button part="tone" type="button" aria-expanded="false" aria-controls="mall">${esc(t('Products'))}<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button>
      <div class="panel wide mega" part="tone" id="mall" hidden>${keyItem}${finder}${MENUS.map(([label, items]) => `<div class="grp"><p>${esc(t(label))}</p>${panel(items, true)}</div>`).join('')}
        ${here === 'flisk.si' ? '' : `<a class="every" href="${esc(carry(HOME + '/'))}">${esc(t('Every Flisk product →'))}</a>`}</div></div>`;
  const [firstName, firstUrl] = FIRST;
  const acct = ACCOUNT[here];

  root.innerHTML = `
    <style>
      :host { all: initial; }
      /* Every colour comes from these tokens. They default to the dark Flisk look; the script below overrides them from the shared Flisk theme, or from the page's own colour. */
      nav { --bg: #0a0a0e; --panel: #111116; --ink: #ececf1; --line: rgba(255,255,255,0.1); --acc: #22c55e; --hi: #6ee7a0; --on: #0a0a0e;
            --dim: color-mix(in srgb, var(--ink) 66%, transparent); --faint: color-mix(in srgb, var(--ink) 45%, transparent); --wash: color-mix(in srgb, var(--ink) 7%, transparent);
            display: flex; align-items: center; gap: 0.35rem; padding: 0 1rem; height: 2.5rem;
            background: var(--bg); border-bottom: 1px solid var(--line); color: var(--dim);
            font: 200 14px/1 Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; letter-spacing: -0.02em; white-space: nowrap; }
      a { color: inherit; text-decoration: none; }
      a:focus-visible, button:focus-visible { outline: 2px solid #4dd0ff; outline-offset: 2px; }
      .home { display: inline-flex; align-items: center; gap: 0.45rem; margin-right: 0.6rem; color: var(--ink); font: 600 12px/1 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0; }
      .mark { display: grid; place-items: center; width: 1.25rem; height: 1.25rem; border-radius: 0.25rem; background: var(--acc); color: var(--on); font-size: 9px; font-weight: 700; }
      .first { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.7rem; border-radius: 999px;
               background: color-mix(in srgb, var(--acc) 16%, transparent); color: var(--hi); font-weight: 300; margin-right: 0.35rem; }
      .first::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 25%, transparent); }
      .first:hover, .first[aria-current] { background: var(--acc); color: var(--on); }
      .first[aria-current]::before, .first:hover::before { background: var(--on); box-shadow: none; }
      button { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.55rem; border-radius: 0.3rem; }
      button svg { width: 8px; height: 6px; fill: none; stroke: currentColor; stroke-width: 1.6; transition: transform .15s; }
      button:hover, button[aria-expanded="true"] { color: var(--ink); background: var(--wash); }
      button[aria-expanded="true"] svg { transform: rotate(180deg); }
      button[data-current] { color: var(--hi); }
      .menu { position: relative; }
      .all-menu { display: none; margin-left: auto; }
      /* A site without its own logo card shows one Products menu, the same panel as the product switcher, instead of five small ones. */
      .all-menu.always { display: block; position: static; }
      nav { position: relative; }
      .sw button[aria-expanded="true"]::after { display: none; }
      .menu.sw { display: block; margin: 0 0.3rem 0 0; }
      .sw button { padding: 0.45rem; } .sw .gr { width: 16px; height: 16px; fill: currentColor; stroke: none; }
      .sw button svg { transform: none; }
      .panel.mega:not([hidden]) { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: 0 0.4rem; width: min(58rem, 92vw); }
      .mega .grp p:first-child { margin-top: 0.4rem; } .mega .every { grid-column: 1 / -1; }
      .every-link { margin-left: auto; padding: 0.4rem 0.2rem; color: var(--ink); }
      .every-link:hover { color: var(--hi); }
      /* The sponsor link: GitHub Sponsors pink on every look, so it reads as the one ask on the bar. */
      .give { display: inline-flex; align-items: center; gap: 0.35rem; margin-left: 0.5rem; padding: 0.4rem 0.7rem; border-radius: 999px;
              border: 1px solid color-mix(in srgb, #ea4aaa 55%, transparent); color: #ea4aaa; font-weight: 600; }
      .give svg { width: 12px; height: 12px; fill: currentColor; }
      .give:hover { background: #ea4aaa; color: #fff; }
      /* Get a free API key: a green pill that sits left of the chat icon. The compact bar hides it and shows .keyitem in the Products menu. */
      .key { display: inline-flex; align-items: center; gap: 0.35rem; margin-left: 0.5rem; padding: 0.4rem 0.7rem; border-radius: 999px;
             border: 1px solid color-mix(in srgb, var(--acc) 55%, transparent); color: var(--hi); font-weight: 400; }
      .key svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
      .key:hover { background: var(--acc); color: var(--on); }
      nav.prod .key { margin-left: auto; } nav.prod .key ~ .help { margin-left: 0.4rem; }
      .item.keyitem { display: none; grid-column: 1 / -1; align-items: center; }
      .keyitem svg { flex: none; width: 28px; height: 20px; fill: none; stroke: var(--hi); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
      .keyitem b { color: var(--hi); }
      /* Talk to a human: a small chat icon that names itself on hover or focus, and opens the Flisk Discord. */
      .help { position: relative; display: inline-grid; place-items: center; width: 1.9rem; height: 1.9rem; margin-left: 0.4rem; border-radius: 50%; color: var(--dim); }
      .help svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linejoin: round; }
      .help:hover, .help:focus-visible { color: var(--ink); background: var(--wash); }
      .help::after { content: attr(data-tip); position: absolute; top: calc(100% + 0.45rem); right: 0; padding: 0.45rem 0.7rem; border-radius: 0.4rem;
                     background: var(--panel); border: 1px solid var(--line); color: var(--ink); font: 400 12px/1.2 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
                     letter-spacing: 0; box-shadow: 0 10px 24px rgba(0,0,0,0.25); opacity: 0; pointer-events: none; transition: opacity .12s; }
      .help:hover::after, .help:focus-visible::after { opacity: 1; }
      /* Product mode (data-product): the site's logo card with "from Flisk", its sibling products, and one tooltip style for the small controls. */
      nav.prod { --pa: var(--acc); height: 4rem; gap: 0.2rem; background: radial-gradient(22rem 8rem at 0 0, color-mix(in srgb, var(--pa) 18%, transparent), transparent), var(--bg); }
      .card { display: grid; grid-template-columns: auto 1fr; column-gap: 0.65rem; align-items: center; padding: 0.3rem 0.9rem 0.3rem 0.3rem; margin-right: 0.2rem; border-radius: 1rem;
              background: var(--panel); box-shadow: 0 0 0 1px color-mix(in srgb, var(--pa) 55%, transparent), 0 8px 22px -10px var(--pa); }
      .card .pil { grid-row: span 2; display: block; line-height: 0; }
      .card .pi { width: 2.5rem; height: 2.5rem; border-radius: 0.7rem; transition: transform .25s; }
      .card:hover .pi { transform: rotate(-6deg) scale(1.06); }
      .pn { color: var(--ink); font: 700 1.35rem/1 'Space Grotesk', Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.03em; align-self: end; }
      .fl { display: inline-flex; align-items: center; gap: 0.3rem; align-self: start; margin-top: 0.3rem; color: var(--faint); font: 500 0.78rem/1 Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: 0; }
      .fl img { width: 14px; height: 14px; border-radius: 4px; }
      .fl strong { font-weight: 600; background: linear-gradient(100deg, var(--faint) 20%, var(--pa) 42%, var(--ink) 50%, var(--pa) 58%, var(--faint) 80%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer 4s linear infinite; }
      @keyframes shimmer { to { background-position: -300% 0; } }
      @media (prefers-reduced-motion: reduce) { .fl strong { animation: none; } }
      .sibs { display: inline-flex; gap: 0.1rem; margin: 0 0.4rem 0 0.2rem; padding-left: 0.5rem; border-left: 1px solid var(--line); }
      .sib { display: inline-grid; place-items: center; padding: 0.3rem; border-radius: 0.6rem; }
      .sib img { width: 26px; height: 26px; border-radius: 7px; transition: transform .2s; }
      .sib:hover { background: var(--wash); } .sib:hover img { transform: scale(1.1) rotate(-4deg); }
      .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
      nav.prod .first { margin-left: 0.2rem; }
      nav.prod .help { margin-left: auto; }
      /* Tooltips: a name, then one plain sentence. They appear on hover and keyboard focus, and never take the pointer. */
      [data-tip] { position: relative; }
      [data-tip]::after { content: attr(data-tip); position: absolute; top: calc(100% + 0.5rem); left: 50%; transform: translate(-50%, 4px); z-index: 5; width: max-content; max-width: 16rem; padding: 0.5rem 0.75rem;
                          border-radius: 0.5rem; background: var(--panel); border: 1px solid var(--line); color: var(--dim); white-space: pre-line; text-align: left;
                          font: 400 12px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; letter-spacing: 0; box-shadow: 0 12px 28px rgba(0,0,0,0.35);
                          opacity: 0; pointer-events: none; transition: opacity .14s .15s, transform .14s .15s; }
      [data-tip]:hover::after, [data-tip]:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }
      .pn[data-tip]::after, .fl[data-tip]::after { left: 0; transform: translate(0, 4px); }
      .pn[data-tip]:hover::after, .fl[data-tip]:hover::after, .pn[data-tip]:focus-visible::after, .fl[data-tip]:focus-visible::after { transform: translate(0, 0); }
      .help[data-tip]::after { left: auto; right: 0; transform: none; }
      .give[data-tip]::after { left: auto; right: 0; transform: translate(0, 4px); } .give[data-tip]:hover::after { transform: translate(0, 0); }
      @media (hover: none) { [data-tip]::after { display: none; } }
      .panel { position: absolute; top: calc(100% + 0.45rem); left: 0; width: 22rem; padding: 0.4rem; box-sizing: border-box;
               background: var(--panel); border: 1px solid var(--line); border-radius: 0.6rem;
               box-shadow: 0 18px 40px rgba(0,0,0,0.3); white-space: normal; }
      .panel[hidden] { display: none; }
      /* An invisible bridge over the gap between the button and its panel, so the pointer never leaves the menu on the way down. */
      .panel::before { content: ''; position: absolute; left: 0; right: 0; top: -0.6rem; height: 0.6rem; }
      .item { display: flex; align-items: flex-start; gap: 0.7rem; padding: 0.55rem 0.6rem; border-radius: 0.4rem; }
      .item img { flex: none; width: 28px; height: 28px; border-radius: 6px; }
      .item span { display: grid; gap: 0.3rem; }
      .item b { color: var(--ink); font-weight: 400; }
      .item small { color: var(--dim); font: 400 12px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
      .item:hover { background: var(--wash); }
      .item[aria-current] b { color: var(--hi); }
      .panel p { margin: 0.6rem 0.6rem 0.2rem; color: var(--faint); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
      .grp[hidden], .it[hidden], .mine[hidden], .none[hidden], .mine .hint[hidden] { display: none; }
      .find, .mine, .none { grid-column: 1 / -1; }
      .find { display: flex; align-items: center; gap: 0.5rem; margin: 0.2rem 0.2rem 0.5rem; padding: 0 0.7rem; border: 1px solid var(--line); border-radius: 0.4rem; }
      .find:focus-within { border-color: var(--acc); }
      .find input { flex: 1; min-width: 0; min-height: 2.5rem; padding: 0; border: 0; background: transparent; color: var(--ink); font: 400 13px/1.2 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; letter-spacing: 0; outline: none; }
      .find input::placeholder { color: var(--faint); }
      .cnt { color: var(--dim); font: 400 12px/1 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; letter-spacing: 0; }
      .mine { margin: 0 0.2rem 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--line); }
      .mine p { margin: 0.2rem 0.4rem 0.3rem; color: var(--hi); }
      .mine .hint { margin: 0.1rem 0.4rem; color: var(--dim); font: 400 12px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; text-transform: none; letter-spacing: 0; }
      .none { margin: 0.4rem 0.6rem; color: var(--dim); font-size: 12px; text-transform: none; letter-spacing: 0; }
      .mineList { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0.2rem; }
      .mineList a { display: flex; align-items: center; gap: 0.45rem; min-height: 2.2rem; padding: 0 0.8rem 0 0.5rem; border: 1px solid var(--line); border-radius: 0.4rem; color: var(--ink); }
      .mineList a:hover { background: var(--wash); }
      .mineList img { width: 20px; height: 20px; border-radius: 4px; }
      .it { position: relative; }
      .it .item { padding-right: 2.6rem; }
      .panel.wide { overflow-y: auto; }
      .pin { position: absolute; top: 0.3rem; right: 0.3rem; width: 2.2rem; height: 2.2rem; padding: 0; justify-content: center; color: var(--dim); font-size: 16px; }
      .pin[aria-pressed="true"] { color: var(--hi); }
      @media (hover: hover) { .pin[aria-pressed="false"] { opacity: 0; } .it:hover .pin, .pin:focus-visible { opacity: 1; } }
      @media (hover: none) { .find input { font-size: 16px; } .item { padding-right: 2.8rem; } }
      /* The profile icon: a round button like .help, always the last item of the bar. Signed out it is a person outline; signed in it is
         the GitHub avatar over the login's initials (the initials stay when the image cannot load). Its panel hangs from the right edge. */
      .menu.acct { margin-left: 0.4rem; }
      .me { position: relative; width: 1.9rem; height: 1.9rem; padding: 0; justify-content: center; border-radius: 50%; color: var(--dim); font: 600 11px/1 Inter, ui-sans-serif, system-ui, sans-serif; letter-spacing: 0; text-transform: uppercase; }
      .me svg, .me[aria-expanded="true"] svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; transform: none; }
      .me .av { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
      .me[data-in] { box-shadow: 0 0 0 1px var(--line); color: var(--ink); background: var(--wash); }
      .acct .panel { left: auto; right: 0; width: 15rem; }
      .acct .item { width: 100%; box-sizing: border-box; align-items: center; }
      .acct .item b { font-weight: 400; }
      .acct .panel p.who { margin: 0.4rem 0.6rem 0.3rem; text-transform: none; letter-spacing: 0; font: 400 12px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; overflow-wrap: anywhere; }
      .acct .who b { color: var(--ink); font-weight: 600; }
      .every { display: block; margin-top: 0.3rem; padding: 0.7rem 0.6rem; border-top: 1px solid var(--line); color: var(--ink); }
      /* The compact bar: one Products menu and a heart-only sponsor button. Phones get it from the media query;
         wider windows get it from the .tight class the script sets when the full bar does not fit (a site with
         many menus, or a 768-980px window), so the bar never makes the page wider than the window. */
      @media (max-width: 760px) {
        .menu:not(.all-menu):not(.acct), .every-link, .key { display: none; }
        .item.keyitem { display: flex; }
        .all-menu { display: block; }
        .give span { display: none; }
        .give { padding: 0.4rem 0.5rem; }
        .panel.wide { position: fixed; top: 2.9rem; left: 0.5rem; right: 0.5rem; width: auto; overflow-y: auto; }
      }
      /* Phones up to 420px (320px, and 375-414px iPhones with a product chip and an extra icon): tighter spacing so the sponsor heart is not cut off the right edge. */
      @media (max-width: 420px) {
        nav { padding: 0 0.5rem; gap: 0.1rem; }
        .home { margin-right: 0.2rem; }
        .first { padding: 0.4rem 0.5rem; }
        button { padding: 0.4rem 0.35rem; }
        .give { margin-left: 0.2rem; }
        .sibs { display: none; } /* a product bar keeps its card, the switcher and the profile icon on a phone */
      }
      /* Touch screens: every control gets a hit area of at least 40px (the two stacked product-name links at least 24px, the
         WCAG 2.2 minimum), so a thumb does not miss. Only coarse pointers: a mouse sees the same bar as before. */
      @media (pointer: coarse) {
        .help { min-width: 1.5rem; height: 2.5rem; margin-left: 0; border-radius: 0.8rem; }
        .me { width: 2.5rem; height: 2.5rem; }
        .sw button { min-height: 2.5rem; }
        .give, .first { min-height: 2.5rem; }
        .pn, .fl { display: inline-flex; align-items: center; min-height: 1.5rem; margin-top: 0; }
        .card { padding-right: 0.5rem; margin-right: 0; }
      }
      nav.tight .menu:not(.all-menu):not(.acct), nav.tight .every-link, nav.tight .key { display: none; }
      nav.tight .item.keyitem { display: flex; }
      nav.tight .all-menu { display: block; }
      nav.tight .give span { display: none; }
      nav.tight .give { padding: 0.4rem 0.5rem; }
      nav.tighter .sibs { display: none; }
      /* A signed-in-capable product bar on a 375-390px phone still ran a few px past the edge (chat.flisk.si, the profile icon):
         the margins between the controls go next, and on 360px and narrower the first-product chip too (it stays in the Products menu). */
      nav.tighter .menu.sw, nav.tighter .first, nav.tighter .help, nav.tighter .give, nav.tighter .menu.acct { margin-left: 0; margin-right: 0; }
      nav.tightest .first { display: none; }
      nav.tight .panel.wide { position: fixed; top: 2.9rem; left: 0.5rem; right: 0.5rem; width: auto; overflow-y: auto; }
    </style>
    <nav aria-label="${esc(t('Flisk products'))}"${PRODUCT ? ' class="prod"' : ''}>
      ${card}
      ${switcher}
      ${ownsBrand || PRODUCT ? '' : `<a class="home" part="tone" href="${esc(carry(HOME + '/'))}"><span class="mark" aria-hidden="true">&gt;_</span>flisk</a>`}
      ${firstUrl ? `<a class="first" part="tone" href="${esc(carry(tracked(firstUrl)))}"${isHere(firstUrl) ? ' aria-current="page"' : ''}>${esc(t(firstName))}</a>` : ''}
      ${PRODUCT ? menus : ''}
      ${here === 'flisk.si' || PRODUCT ? '' : `<a class="every-link" part="tone" href="${esc(carry(HOME + '/'))}">${esc(t('All products'))}</a>`}
      ${all}
      ${keyUrl ? `<a class="key" part="tone" href="${esc(keyUrl)}" target="_blank" rel="noopener">${keyIcon}<span>${esc(t('Get a free API key'))}</span></a>` : ''}
      <a class="help" part="tone" href="https://discord.gg/qMu5Xn8Kaq" target="_blank" rel="noopener" data-tip="${esc(t('Talk to a human engineer'))}" aria-label="${esc(t('Talk to a human engineer on Discord'))}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"/></svg></a>
      <a class="give" href="https://github.com/sponsors/flisk-sh" target="_blank" rel="noopener" aria-label="${esc(t('Help us explore more: sponsor Flisk on GitHub'))}"${PRODUCT ? tip(t('Help us explore more'), t('Sponsor Flisk on GitHub')) : ` title="${esc(t('Sponsor Flisk on GitHub'))}"`}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14.25s-5.75-3.4-5.75-7.6A3.15 3.15 0 0 1 8 4.7a3.15 3.15 0 0 1 5.75 1.95c0 4.2-5.75 7.6-5.75 7.6z"/></svg><span>${esc(t('Help us explore more'))}</span></a>
      ${acct ? `<div class="menu acct"><button class="me" part="tone" type="button" aria-expanded="false" aria-controls="macct" aria-label="${esc(t('Account'))}"></button><div class="panel" part="tone" id="macct" hidden></div></div>` : ''}
    </nav>`;

  // A site whose CSP blocks images from flisk.si still gets a working menu, just without the icons.
  root.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.remove(); }, true);
  const buttons = [...root.querySelectorAll('.menu > button')];
  const close = (except) => buttons.forEach((b) => {
    if (b === except) return;
    b.setAttribute('aria-expanded', 'false');
    root.getElementById(b.getAttribute('aria-controls')).hidden = true;
  });
  const timers = new Map();
  // A wide panel fits the window it is in: as wide as the window allows (58rem at most), kept between the window's edges,
  // and no taller than the space under the bar, so a long list scrolls inside the panel instead of running off the page.
  // The compact bar's fixed panel gets only the height.
  const fitPanel = (p) => {
    p.style.maxHeight = ''; p.style.width = ''; p.style.left = ''; p.style.right = '';
    p.style.maxHeight = `${Math.max(240, window.innerHeight - p.getBoundingClientRect().top - 8)}px`;
    if (getComputedStyle(p).position === 'fixed' || !p.offsetParent) return;
    const gap = 8, width = Math.min(p.getBoundingClientRect().width, window.innerWidth - 2 * gap);
    const x = Math.max(gap, Math.min(p.parentElement.getBoundingClientRect().left, window.innerWidth - width - gap));
    p.style.width = `${width}px`; p.style.left = `${x - p.offsetParent.getBoundingClientRect().left}px`; p.style.right = 'auto';
  };
  const setOpen = (b, open) => {
    clearTimeout(timers.get(b));
    // Opening one menu closes the others; closing a menu leaves the others alone, so a late close
    // timer from the menu the pointer just left cannot shut the menu it moved onto.
    if (open) close(b);
    b.setAttribute('aria-expanded', String(open));
    const p = root.getElementById(b.getAttribute('aria-controls'));
    p.hidden = !open;
    if (!open) { const q = p.querySelector('.find input'); if (q && q.value) { q.value = ''; q.dispatchEvent(new Event('input')); } }
    if (open && p.classList.contains('wide')) fitPanel(p);
    if (open && b.classList.contains('me')) paintAccount();
    if (open && !p.classList.contains('wide') && !b.classList.contains('me')) {
      // Keep the menu inside the window when its button sits near the right edge.
      p.style.left = '0';
      const over = p.getBoundingClientRect().right - (window.innerWidth - 8);
      if (over > 0) p.style.left = `${-over}px`;
    }
  };
  const canHover = window.matchMedia('(hover: hover)').matches;
  let hoverOpened = null;
  buttons.forEach((b) => b.addEventListener('click', (e) => {
    // A click on a menu the pointer already opened keeps it open instead of toggling it shut.
    // Keyboard clicks (detail 0) and touch still toggle.
    if (e.detail > 0 && hoverOpened === b) { setOpen(b, true); return; }
    setOpen(b, b.getAttribute('aria-expanded') !== 'true');
  }));
  // With a mouse, a menu also opens when the pointer rests on it and closes shortly after the pointer leaves. Touch keeps tap to open.
  if (canHover) {
    root.querySelectorAll('.menu').forEach((m) => {
      const b = m.querySelector('button');
      m.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        timers.forEach((t) => clearTimeout(t));
        timers.clear();
        hoverOpened = b;
        setOpen(b, true);
      });
      m.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'touch') return;
        if (hoverOpened === b) hoverOpened = null;
        timers.set(b, setTimeout(() => setOpen(b, false), 300));
      });
    });
  }
  // Search, pins and recent tools in the wide panels. Pins and recents are two small cookies, shared by every *.flisk.si site
  // like the look; they are written only when the visitor pins a tool or opens one. Without cookies the search still works.
  const cookie = (k) => ((document.cookie.match(new RegExp('(?:^|;\\s*)' + k + '=([a-z0-9,-]*)')) || [])[1] || '').split(',').filter(Boolean);
  const keep = (k, list) => { try { document.cookie = `${k}=${list.join(',')}; Path=/; Max-Age=31536000; SameSite=Lax${onFlisk ? '; Domain=.flisk.si' : ''}${location.protocol === 'https:' ? '; Secure' : ''}`; } catch (e) { /* cookies blocked: nothing is remembered */ } };
  const wide = [...root.querySelectorAll('.panel.wide')];
  const paintTools = () => {
    const pins = cookie('flisk_pins'), rec = cookie('flisk_recent').filter((i) => !pins.includes(i)).slice(0, 4);
    wide.forEach((p) => {
      const linkOf = (i) => p.querySelector(`.it[data-icon="${CSS.escape(i)}"] .item`);
      const list = [...pins, ...rec].filter(linkOf), box = p.querySelector('.mineList');
      box.replaceChildren(...list.map((i) => {
        const src = linkOf(i), a = document.createElement('a'), im = document.createElement('img'), s = document.createElement('span');
        a.href = src.href; a.dataset.icon = i; im.src = src.querySelector('img').src; im.alt = ''; im.width = 20; im.height = 20; s.textContent = src.querySelector('b').textContent;
        a.append(im, s); return a;
      }));
      p.querySelector('.mine .hint').hidden = list.length > 0;
      p.querySelectorAll('.pin').forEach((b) => {
        const on = pins.includes(b.closest('.it').dataset.icon);
        b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '★' : '☆'; b.setAttribute('aria-label', `${t(on ? 'Unpin' : 'Pin')} ${b.dataset.name}`);
      });
    });
  };
  wide.forEach((p) => {
    const input = p.querySelector('.find input'), cnt = p.querySelector('.cnt'), none = p.querySelector('.none'), its = [...p.querySelectorAll('.it')];
    const run = () => {
      const v = input.value.trim().toLowerCase();
      let n = 0;
      its.forEach((el) => { const hit = !v || el.textContent.toLowerCase().includes(v); el.hidden = !hit; if (hit) n += 1; });
      p.querySelectorAll('.grp').forEach((g) => { g.hidden = ![...g.querySelectorAll('.it')].some((el) => !el.hidden); });
      p.querySelector('.mine').hidden = !!v;
      cnt.textContent = v ? `${n} / ${its.length}` : '';
      none.hidden = n > 0;
    };
    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) { input.value = ''; run(); e.stopPropagation(); }
      if (e.key === 'Enter') { const a = p.querySelector('.it:not([hidden]) .item'); if (a) a.click(); }
    });
  });
  root.addEventListener('click', (e) => {
    const el = e.composedPath()[0];
    const pin = el.closest && el.closest('.pin');
    if (pin) {
      const icon = pin.closest('.it').dataset.icon, pins = cookie('flisk_pins');
      keep('flisk_pins', pins.includes(icon) ? pins.filter((i) => i !== icon) : [...pins, icon]);
      paintTools();
      return;
    }
    const link = el.closest && el.closest('.it .item, .mineList a');
    if (link) { const icon = link.dataset.icon || link.closest('.it').dataset.icon; keep('flisk_recent', [icon, ...cookie('flisk_recent').filter((i) => i !== icon)].slice(0, 8)); }
  });
  paintTools();
  // The profile menu. The login is read only from the element the site already renders (ACCOUNT[host].login) and only if it looks like a
  // GitHub login; on any doubt the menu shows the signed-out view. Log out replays the site's own sign-out, it never reads or clears a cookie.
  const me = root.querySelector('.me'), mePanel = root.getElementById('macct');
  const person = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="5.5" r="2.75"/><path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5"/></svg>';
  const readLogin = () => {
    try {
      const v = ((acct.login && document.querySelector(acct.login)) || {}).textContent;
      const m = String(v || '').trim().replace(/^@/, '').match(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/);
      return m ? m[0] : '';
    } catch (e) { return ''; }
  };
  const logOut = () => {
    try {
      const so = acct.signOut;
      // A site that keeps its session in the page (no sign-out URL) listens for this event and clears it itself.
      if (so.event) { document.dispatchEvent(new CustomEvent(so.event)); return; }
      const url = new URL(so.url, location.origin);
      if (so.method !== 'POST') { location.assign(url.href); return; }
      if (url.origin !== location.origin) return;
      const f = document.createElement('form');
      f.method = 'POST'; f.action = url.href; f.hidden = true;
      document.body.appendChild(f); f.submit();
    } catch (e) { /* no sign-out to replay: the menu stays as it is */ }
  };
  let shown;
  const paintAccount = () => {
    if (!me) return;
    const login = readLogin();
    if (login === shown) return;
    shown = login;
    const a = (href, text) => `<a class="item" href="${esc(href)}"><b>${esc(t(text))}</b></a>`;
    try {
      if (!login) {
        me.removeAttribute('data-in'); me.innerHTML = person;
        mePanel.innerHTML = a(new URL(acct.signIn, location.origin).href, 'Sign in');
        return;
      }
      me.dataset.in = ''; me.innerHTML = `${esc(login.slice(0, 2))}<img class="av" src="https://github.com/${esc(login)}.png?size=60" alt="" width="30" height="30" referrerpolicy="no-referrer">`;
      mePanel.innerHTML = `<p class="who">${esc(t('Signed in as'))} <b>${esc(login)}</b></p>${a(acct.console || 'https://fleet.flisk.si/console', 'Console')}<button class="item out" type="button"><b>${esc(t('Log out'))}</b></button>`;
      mePanel.querySelector('.out').addEventListener('click', logOut);
    } catch (e) { shown = undefined; }
  };
  paintAccount();
  window.addEventListener('load', paintAccount);
  // Single-page sites draw the login element after their own /api/me call, usually after `load`. Repaint when the DOM changes, at most every 50 ms.
  if (acct && acct.login && window.MutationObserver) {
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      setTimeout(() => { queued = false; paintAccount(); }, 50);
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
  window.addEventListener('resize', () => wide.forEach((p) => { if (!p.hidden) fitPanel(p); }));
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(host)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const nav = root.querySelector('nav');
  // Switch to the compact bar when the full one would run past the right edge. Measures the bar's own items
  // (open menu panels are absolute, so they do not count), and again on resize and once the fonts load.
  const fit = () => {
    nav.classList.remove('tight', 'tighter', 'tightest');
    const edge = nav.getBoundingClientRect().right;
    const over = () => [...nav.children].some((c) => c.getBoundingClientRect().right > edge + 0.5);
    // Still too wide after the compact bar (a product bar with a card, a switcher, help, heart and the profile icon): drop the sibling icons.
    for (const step of ['tight', 'tighter', 'tightest']) { if (!over()) break; nav.classList.add(step); }
  };
  fit();
  if (window.ResizeObserver) new ResizeObserver(fit).observe(host); else window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  const set = (k, v) => nav.style.setProperty(`--${k}`, v);
  // Colour helpers for paint(): parse #hex or rgb()/rgba(), lay a colour over a background, and measure WCAG contrast.
  const rgb = (c) => {
    if (c[0] === '#') { let h = c.slice(1); if (h.length === 3) h = [...h].map((x) => x + x).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1); }
    const m = c.match(/[\d.]+/g).map(Number); return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1];
  };
  const over = (f, b) => f.slice(0, 3).map((v, i) => Math.round(v * f[3] + b[i] * (1 - f[3])));
  const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const x = lum(a.slice(0, 3)), y = lum(b.slice(0, 3)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const css = (c) => `rgb(${c.slice(0, 3).join(', ')})`;
  // The first candidate that reads at 4.5:1 on every background, else the best one pulled toward the text colour until it does.
  const readable = (cands, bgs, ink) => {
    const worst = (c) => Math.min(...bgs.map((b) => ratio(c, b)));
    const hit = cands.find((c) => worst(c) >= 4.5); if (hit) return hit;
    const best = cands.reduce((a, c) => (worst(c) > worst(a) ? c : a));
    for (let k = 1; k <= 10; k++) { const m = best.map((v, i) => Math.round(v + (ink[i] - v) * k / 10)); if (worst(m) >= 4.5) return m; }
    return ink;
  };
  const paint = () => {
    if (OPT.accent) nav.style.setProperty('--pa', OPT.accent);
    const t = THEMES[theme];
    if (t) {
      // A chosen look: its own tokens, made safe to read. A see-through surface (geist-glass) is laid over the bar colour so
      // the menu panel is solid, and the accent text and the text on the accent pill are kept at 4.5:1 or better.
      const bg = rgb(t.bg), ink = rgb(t.ink), acc = rgb(t.accent);
      const panel = over(rgb(t.surface), bg);
      const first = t.mode === 'dark' ? [t.accentInk, t.accent] : [t.accent, t.accentInk];
      set('bg', t.bg); set('panel', css(panel)); set('ink', t.ink); set('line', t.line); set('acc', t.accent);
      const tint = over([acc[0], acc[1], acc[2], 0.16], bg); // the pill behind accent text (.first)
      set('hi', css(readable(first.map((c) => over(rgb(c), bg)), [bg, panel, tint], ink)));
      set('on', css([rgb(t.onAccent), [255, 255, 255, 1], [0, 0, 0, 1]].map((c) => c.slice(0, 3))
        .reduce((a, c) => (ratio(a, acc) >= 4.5 || ratio(a, acc) >= ratio(c, acc) ? a : c))));
      return;
    }
    // No look chosen: when the page behind the bar is light, use its colour and dark text.
    for (const el of [document.body, document.documentElement]) {
      const m = el && getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!m || (m.length > 3 && +m[3] === 0)) continue;
      const [r, g, b] = m.map(Number);
      if (0.2126 * r + 0.7152 * g + 0.0722 * b > 160) {
        set('bg', `rgb(${r}, ${g}, ${b})`); set('panel', '#fff'); set('ink', '#141418'); set('line', 'rgba(0,0,0,0.12)');
        set('acc', '#15803d'); set('hi', '#15803d'); set('on', '#fff');
      }
      return;
    }
  };
  const mount = () => { document.body.insertBefore(host, document.body.firstChild); paint(); };
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
