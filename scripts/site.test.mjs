import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const site = readFileSync(new URL('../assets/site.js', import.meta.url), 'utf8');

function redirectsFrom(url) {
  const { pathname, search, hash } = new URL(url, 'https://flisk.si');
  const redirects = [];
  runInNewContext(site, {
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      cookie: 'flisk_lang=nl',
      documentElement: { lang: 'en' },
    },
    location: { pathname, search, hash, replace: (next) => redirects.push(next) },
  });
  return redirects;
}

test('language redirects preserve the query and fragment', () => {
  assert.deepEqual(redirectsFrom('/?flisk_theme=forest&utm_source=flisk.sh#catalog'), [
    '/nl/?flisk_theme=forest&utm_source=flisk.sh#catalog',
  ]);
});

test('an explicit language query still skips the redirect', () => {
  assert.deepEqual(redirectsFrom('/?lang=en#catalog'), []);
});
