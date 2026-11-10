# flisk.si

One page that links to everything the [Flisk](https://flisk.sh) org builds: products, MCP servers, plugins, templates and examples.

## Change the list

Every link is one entry in [`_data/catalog.yml`](_data/catalog.yml): `name`, `url` and one plain sentence in `text`. Add `bar: true` to show it in the shared bar.

## The Flisk bar

Any Flisk site can show the same slim strip of product links at the top of its page:

```html
<script src="https://flisk.si/assets/bar.js" defer></script>
```

It sits in the page flow, keeps its styles to itself, and marks the site it is on.

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
