---
---
/* The Flisk bar: one slim strip that every Flisk site can put at the top of its page, so moving between our sites feels
   like one site. Add it with one line:  <script src="https://flisk.si/assets/bar.js" defer></script>
   It sits in the page flow (it never covers content), keeps its styles to itself, and lists the products marked
   `bar: true` in _data/catalog.yml. The page it is on is marked as current. */
(function () {
  if (window.top !== window.self || document.querySelector('flisk-bar')) return;
  const HOME = {{ site.url | jsonify }};
  const LINKS = [
    {%- for section in site.data.catalog.sections %}{% for item in section.items %}{% if item.bar %}
    [{{ item.name | jsonify }}, {{ item.url | jsonify }}],
    {%- endif %}{% endfor %}{% endfor %}
  ];
  const here = window.location.hostname.replace(/^www\./, '');
  const host = document.createElement('flisk-bar');
  host.style.cssText = 'display:block;position:relative;z-index:2147483000';
  const root = host.attachShadow({ mode: 'open' });
  const items = LINKS.map(([name, url]) => {
    const current = new URL(url).hostname.replace(/^www\./, '') === here ? ' aria-current="page"' : '';
    return `<a href="${url}"${current}>${name}</a>`;
  }).join('');
  root.innerHTML = `
    <style>
      :host { all: initial; }
      nav { display: flex; align-items: center; gap: 1.1rem; padding: 0 1rem; height: 2.25rem; overflow-x: auto; scrollbar-width: none;
            background: #0a0a0e; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(236,236,241,0.62);
            font: 500 12px/1 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
      nav::-webkit-scrollbar { display: none; }
      a { color: inherit; text-decoration: none; }
      a:hover, a[aria-current] { color: #6ee7a0; }
      a:focus-visible { outline: 2px solid #4dd0ff; outline-offset: 2px; }
      .home { display: inline-flex; align-items: center; gap: 0.45rem; color: #ececf1; font-weight: 600; }
      .mark { display: grid; place-items: center; width: 1.25rem; height: 1.25rem; border-radius: 0.25rem; background: #22c55e; color: #0a0a0e; font-size: 9px; font-weight: 700; }
      .all { margin-left: auto; padding-left: 1rem; color: #ececf1; }
    </style>
    <nav aria-label="Flisk products">
      <a class="home" href="${HOME}/"><span class="mark" aria-hidden="true">&gt;_</span>flisk</a>
      ${items}
      <a class="all" href="${HOME}/">All products</a>
    </nav>`;
  const mount = () => document.body.insertBefore(host, document.body.firstChild);
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
