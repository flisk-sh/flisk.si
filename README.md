# flisk.si

One page that links to everything the [Flisk](https://flisk.sh) org builds: products, MCP servers, plugins, templates and examples.

## Change the list

Every link is one entry in [`_data/catalog.yml`](_data/catalog.yml): `name`, `url` and one plain sentence in `text`. Add `bar: true` to show it in the shared bar.

## Checks

Every other Flisk site loads `assets/bar.js`, which is built from the catalog, so a mistake goes live everywhere. Pull requests run `.github/workflows/ci.yml`: `ruby scripts/check_catalog.rb` (the YAML parses, each item has a name, url, text and an icon that exists in `assets/icons`), `bundle exec jekyll build`, and `node --check _site/assets/bar.js`. Run the first locally before you push.

## Languages

The home page is in English (`/`), Dutch (`/nl/`) and German (`/de/`). All three come from one template, `_includes/home.html`; the Dutch and German words live in `_data/i18n/nl.yml` and `de.yml` (interface strings, section titles and texts, and each item's sentence keyed by its url). An item with no translation falls back to the English text from `catalog.yml`. When you add a catalog item, add its sentence to both files. Each page has `hreflang` links, a canonical URL and a sitemap entry, and the footer switcher remembers the choice in a `flisk_lang` cookie so the English home page forwards to it next time (there is no redirect from the browser language: the site is static). `ruby scripts/check_i18n.rb` checks the data files, and `--built` checks the built pages after `jekyll build`. The shared bar (`assets/bar.js`) translates its own labels from the `<html lang>` of the page it sits on; product names and the sentences under them stay English.

## For agents: llms.txt and Markdown

`/llms.txt` ([llmstxt.org](https://llmstxt.org)) and the Markdown copies of the home page (`/index.md`, `/nl/index.md`, `/de/index.md`) are built from `_data/catalog.yml` and `_data/i18n/`, so a new catalog item shows up in all of them with no extra edit. The Markdown comes from `_includes/home_md.txt`. The per-product page lists in `llms.txt` come from `_data/pages.yml`, which `ruby scripts/build_pages.rb` writes by reading each product site's `/llms.txt` and `/sitemap.xml` (needs network; run it when a product adds pages, then commit the file). The site is static, so there is no `Accept: text/markdown` switch: agents use the `.md` addresses.

## The Flisk bar

Any Flisk site can show the same slim strip of product links at the top of its page:

```html
<script src="https://flisk.si/assets/bar.js" defer></script>
```

It sits in the page flow, keeps its styles to itself, and marks the site it is on.

Its right end has a pink ♥ Help us explore more button to GitHub Sponsors. To restyle the rest of the bar (say, a colourless look), target `flisk-bar::part(tone)`: every part except that button carries it, so `flisk-bar::part(tone) { filter: grayscale(1) }` greys the bar and keeps the button pink.

Next to it sits a green key pill, `Get a free API key`, which links to `https://inference.flisk.si/?section=keys&utm_source=<the site's host>&utm_medium=bar&utm_campaign=free-key` (analytics shows Source=<site>, Channel=bar, Campaign=free-key). It is opt-in: a site shows it only when its script tag carries `data-free-key` (sites that use keys, such as fleet and chat); every other site, pages.flisk.si included, gets no pill. A site that hands out its own keys (fleet) adds `data-key-url="/console?section=keys"`, a path on its own origin, and the pill goes there instead; a value that is not on the site's own origin is ignored. It is also left out on inference.flisk.si itself. On the compact bar (phones, and any window where the full bar does not fit) the pill is hidden and the same entry sits at the top of the Products menu. `ruby scripts/check_bar.rb` checks it.

## The share card

`og.png` (1200x630) is the image link previews show. It is built from `scripts/og.py`, which inlines the mark and product icons from `assets/`:

```bash
python3 scripts/og.py && rsvg-convert -w 1200 -h 630 scripts/og.svg -o og.png
```

## The address: flisk.si

GitHub Pages serves this repo at `flisk.si` (the `CNAME` file). The domain's DNS lives in Cloudflare, zone `flisk.si`:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (four records) | DNS only until the certificate is issued |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` (optional) | same |
| CNAME | `www` | `flisk-sh.github.io` | DNS only |

Delete the old `A` records for `@` (`216.24.57.16` and `216.24.57.18`, Render) first: while they exist the apex shows Cloudflare error 1000. Then turn on **Enforce HTTPS** in the repo's Pages settings.

## Run it locally

```bash
bundle install
```

```bash
bundle exec jekyll serve
```

Plain Jekyll, one page, no plugins. MIT licensed.
