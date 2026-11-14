---
---
/* The Flisk bar: one slim strip that every Flisk site can put at the top of its page, so moving between our sites feels
   like one site. Add it with one line:  <script src="https://flisk.si/assets/bar.js" defer></script>
   It sits in the page flow (it never covers content), keeps its styles to itself, and is built from the `bar:` block of
   _data/catalog.yml: the flagship first, then a few menus, each item with its icon and one plain sentence.
   The page it is on is marked as current. */
(function () {
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
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
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
  // flisk.si and flisk.sh already show the flisk brand in their own header, so the bar leaves its brand out there.
  const ownsBrand = here === 'flisk.si' || here === 'flisk.sh';
  const host = document.createElement('flisk-bar');
  host.style.cssText = 'display:block;position:relative;z-index:2147483000';
  const root = host.attachShadow({ mode: 'open' });

  const panel = (items) => items.map(([name, url, icon, text]) =>
    `<a class="item" href="${esc(carry(url))}"${isHere(url) ? ' aria-current="page"' : ''}>
       <img src="${HOME}/assets/icons/${esc(icon)}.svg" alt="" width="28" height="28" loading="lazy">
       <span><b>${esc(name)}</b><small>${esc(text)}</small></span></a>`).join('');
  const menus = MENUS.map(([label, items], i) => {
    const current = items.some(([, url]) => isHere(url)) ? ' data-current' : '';
    return `<div class="menu">
      <button type="button" aria-expanded="false" aria-controls="m${i}"${current}>${esc(label)}<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button>
      <div class="panel" id="m${i}" hidden>${panel(items)}</div></div>`;
  }).join('');
  const all = `<div class="menu all-menu">
      <button type="button" aria-expanded="false" aria-controls="mall">Products<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button>
      <div class="panel wide" id="mall" hidden>${MENUS.map(([label, items]) => `<p>${esc(label)}</p>${panel(items)}`).join('')}
        ${here === 'flisk.si' ? '' : `<a class="every" href="${esc(carry(HOME + '/'))}">Every Flisk product →</a>`}</div></div>`;
  const [firstName, firstUrl] = FIRST;

  root.innerHTML = `
    <style>
      :host { all: initial; }
      /* Every colour comes from these tokens. They default to the dark Flisk look; the script below overrides them from the shared Flisk theme, or from the page's own colour. */
      nav { --bg: #0a0a0e; --panel: #111116; --ink: #ececf1; --line: rgba(255,255,255,0.1); --acc: #22c55e; --hi: #6ee7a0; --on: #0a0a0e;
            --dim: color-mix(in srgb, var(--ink) 66%, transparent); --faint: color-mix(in srgb, var(--ink) 45%, transparent); --wash: color-mix(in srgb, var(--ink) 7%, transparent);
            display: flex; align-items: center; gap: 0.35rem; padding: 0 1rem; height: 2.5rem;
            background: var(--bg); border-bottom: 1px solid var(--line); color: var(--dim);
            font: 500 12px/1 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
      a { color: inherit; text-decoration: none; }
      a:focus-visible, button:focus-visible { outline: 2px solid #4dd0ff; outline-offset: 2px; }
      .home { display: inline-flex; align-items: center; gap: 0.45rem; margin-right: 0.6rem; color: var(--ink); font-weight: 600; }
      .mark { display: grid; place-items: center; width: 1.25rem; height: 1.25rem; border-radius: 0.25rem; background: var(--acc); color: var(--on); font-size: 9px; font-weight: 700; }
      .first { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.7rem; border-radius: 999px;
               background: color-mix(in srgb, var(--acc) 16%, transparent); color: var(--hi); font-weight: 600; margin-right: 0.35rem; }
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
      .every-link { margin-left: auto; padding: 0.4rem 0.2rem; color: var(--ink); }
      .every-link:hover { color: var(--hi); }
      .panel { position: absolute; top: calc(100% + 0.45rem); left: 0; width: 22rem; padding: 0.4rem; box-sizing: border-box;
               background: var(--panel); border: 1px solid var(--line); border-radius: 0.6rem;
               box-shadow: 0 18px 40px rgba(0,0,0,0.3); white-space: normal; }
      .panel[hidden] { display: none; }
      /* An invisible bridge over the gap between the button and its panel, so the pointer never leaves the menu on the way down. */
      .panel::before { content: ''; position: absolute; left: 0; right: 0; top: -0.6rem; height: 0.6rem; }
      .item { display: flex; align-items: flex-start; gap: 0.7rem; padding: 0.55rem 0.6rem; border-radius: 0.4rem; }
      .item img { flex: none; width: 28px; height: 28px; border-radius: 6px; }
      .item span { display: grid; gap: 0.3rem; }
      .item b { color: var(--ink); font-weight: 600; }
      .item small { color: var(--dim); font: 400 12px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
      .item:hover { background: var(--wash); }
      .item[aria-current] b { color: var(--hi); }
      .panel p { margin: 0.6rem 0.6rem 0.2rem; color: var(--faint); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
      .every { display: block; margin-top: 0.3rem; padding: 0.7rem 0.6rem; border-top: 1px solid var(--line); color: var(--ink); }
      @media (max-width: 760px) {
        .menu:not(.all-menu), .every-link { display: none; }
        .all-menu { display: block; }
        .panel.wide { position: fixed; top: 2.9rem; left: 0.5rem; right: 0.5rem; width: auto; max-height: calc(100vh - 3.5rem); overflow-y: auto; }
      }
    </style>
    <nav aria-label="Flisk products">
      ${ownsBrand ? '' : `<a class="home" href="${esc(carry(HOME + '/'))}"><span class="mark" aria-hidden="true">&gt;_</span>flisk</a>`}
      ${firstUrl ? `<a class="first" href="${esc(carry(tracked(firstUrl)))}"${isHere(firstUrl) ? ' aria-current="page"' : ''}>${esc(firstName)}</a>` : ''}
      ${menus}
      ${here === 'flisk.si' ? '' : `<a class="every-link" href="${esc(carry(HOME + '/'))}">All products</a>`}
      ${all}
    </nav>`;

  // A site whose CSP blocks images from flisk.si still gets a working menu, just without the icons.
  root.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.remove(); }, true);
  const buttons = [...root.querySelectorAll('button')];
  const close = (except) => buttons.forEach((b) => {
    if (b === except) return;
    b.setAttribute('aria-expanded', 'false');
    root.getElementById(b.getAttribute('aria-controls')).hidden = true;
  });
  const setOpen = (b, open) => {
    close(b);
    b.setAttribute('aria-expanded', String(open));
    const p = root.getElementById(b.getAttribute('aria-controls'));
    p.hidden = !open;
    if (open && !p.classList.contains('wide')) {
      // Keep the menu inside the window when its button sits near the right edge.
      p.style.left = '0';
      const over = p.getBoundingClientRect().right - (window.innerWidth - 8);
      if (over > 0) p.style.left = `${-over}px`;
    }
  };
  buttons.forEach((b) => b.addEventListener('click', () => setOpen(b, b.getAttribute('aria-expanded') !== 'true')));
  // With a mouse, a menu also opens when the pointer rests on it and closes shortly after the pointer leaves. Touch keeps tap to open.
  if (window.matchMedia('(hover: hover)').matches) {
    root.querySelectorAll('.menu').forEach((m) => {
      const b = m.querySelector('button');
      let t;
      m.addEventListener('pointerenter', (e) => { if (e.pointerType === 'touch') return; clearTimeout(t); setOpen(b, true); });
      m.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; t = setTimeout(() => setOpen(b, false), 300); });
    });
  }
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(host)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const nav = root.querySelector('nav');
  const set = (k, v) => nav.style.setProperty(`--${k}`, v);
  const paint = () => {
    const t = THEMES[theme];
    if (t) {
      // A chosen look: its own tokens. The accent text is the look's accentInk on dark looks and its accent on light ones.
      set('bg', t.bg); set('panel', t.surface); set('ink', t.ink); set('line', t.line);
      set('acc', t.accent); set('hi', t.mode === 'dark' ? t.accentInk : t.accent); set('on', t.onAccent);
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
