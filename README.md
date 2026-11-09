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

## Run it locally

```bash
bundle install
```

```bash
bundle exec jekyll serve
```

Plain Jekyll, one page, no plugins. MIT licensed.
