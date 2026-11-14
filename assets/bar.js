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
  // The flagship link says which Flisk site sent the visitor, so analytics.flisk.si can show which site brings Chat its users.
  const tracked = (url) => isHere(url) ? url : `${url}${url.includes('?') ? '&' : '?'}utm_source=${encodeURIComponent(here)}&utm_medium=bar&utm_campaign=flisk-bar`;
  // flisk.si and flisk.sh already show the flisk brand in their own header, so the bar leaves its brand out there.
  const ownsBrand = here === 'flisk.si' || here === 'flisk.sh';
  const host = document.createElement('flisk-bar');
  host.style.cssText = 'display:block;position:relative;z-index:2147483000';
  const root = host.attachShadow({ mode: 'open' });

  const panel = (items) => items.map(([name, url, icon, text]) =>
    `<a class="item" href="${esc(url)}"${isHere(url) ? ' aria-current="page"' : ''}>
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
        ${here === 'flisk.si' ? '' : `<a class="every" href="${HOME}/">Every Flisk product →</a>`}</div></div>`;
  const [firstName, firstUrl] = FIRST;

  root.innerHTML = `
    <style>
      :host { all: initial; }
      nav { display: flex; align-items: center; gap: 0.35rem; padding: 0 1rem; height: 2.5rem;
            background: #0a0a0e; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(236,236,241,0.66);
            font: 500 12px/1 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
      a { color: inherit; text-decoration: none; }
      a:focus-visible, button:focus-visible { outline: 2px solid #4dd0ff; outline-offset: 2px; }
      .home { display: inline-flex; align-items: center; gap: 0.45rem; margin-right: 0.6rem; color: #ececf1; font-weight: 600; }
      .mark { display: grid; place-items: center; width: 1.25rem; height: 1.25rem; border-radius: 0.25rem; background: #22c55e; color: #0a0a0e; font-size: 9px; font-weight: 700; }
      .first { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.7rem; border-radius: 999px;
               background: rgba(34,197,94,0.14); color: #6ee7a0; font-weight: 600; margin-right: 0.35rem; }
      .first::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.25); }
      .first:hover, .first[aria-current] { background: #22c55e; color: #0a0a0e; }
      .first[aria-current]::before, .first:hover::before { background: #0a0a0e; box-shadow: none; }
      button { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.55rem; border-radius: 0.3rem; }
      button svg { width: 8px; height: 6px; fill: none; stroke: currentColor; stroke-width: 1.6; transition: transform .15s; }
      button:hover, button[aria-expanded="true"] { color: #ececf1; background: rgba(255,255,255,0.06); }
      button[aria-expanded="true"] svg { transform: rotate(180deg); }
      button[data-current] { color: #6ee7a0; }
      .menu { position: relative; }
      .all-menu { display: none; margin-left: auto; }
      .every-link { margin-left: auto; padding: 0.4rem 0.2rem; color: #ececf1; }
      .every-link:hover { color: #6ee7a0; }
      .panel { position: absolute; top: calc(100% + 0.45rem); left: 0; width: 22rem; padding: 0.4rem; box-sizing: border-box;
               background: #111116; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.6rem;
               box-shadow: 0 18px 40px rgba(0,0,0,0.45); white-space: normal; }
      .panel[hidden] { display: none; }
      .item { display: flex; align-items: flex-start; gap: 0.7rem; padding: 0.55rem 0.6rem; border-radius: 0.4rem; }
      .item img { flex: none; width: 28px; height: 28px; border-radius: 6px; }
      .item span { display: grid; gap: 0.3rem; }
      .item b { color: #ececf1; font-weight: 600; }
      .item small { color: rgba(236,236,241,0.55); font: 400 12px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
      .item:hover { background: rgba(255,255,255,0.06); }
      .item[aria-current] b { color: #6ee7a0; }
      .panel p { margin: 0.6rem 0.6rem 0.2rem; color: rgba(236,236,241,0.4); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
      .every { display: block; margin-top: 0.3rem; padding: 0.7rem 0.6rem; border-top: 1px solid rgba(255,255,255,0.08); color: #ececf1; }
      @media (max-width: 760px) {
        .menu:not(.all-menu), .every-link { display: none; }
        .all-menu { display: block; }
        .panel.wide { position: fixed; top: 2.9rem; left: 0.5rem; right: 0.5rem; width: auto; max-height: calc(100vh - 3.5rem); overflow-y: auto; }
      }
    </style>
    <nav aria-label="Flisk products">
      ${ownsBrand ? '' : `<a class="home" href="${HOME}/"><span class="mark" aria-hidden="true">&gt;_</span>flisk</a>`}
      ${firstUrl ? `<a class="first" href="${esc(tracked(firstUrl))}"${isHere(firstUrl) ? ' aria-current="page"' : ''}>${esc(firstName)}</a>` : ''}
      ${menus}
      ${here === 'flisk.si' ? '' : `<a class="every-link" href="${HOME}/">All products</a>`}
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
      m.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; t = setTimeout(() => setOpen(b, false), 180); });
    });
  }
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(host)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const mount = () => document.body.insertBefore(host, document.body.firstChild);
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
