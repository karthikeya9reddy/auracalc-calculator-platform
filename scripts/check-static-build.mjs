import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stat } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
const read = name => readFile(new URL(name, output), 'utf8');
const xml = await read('sitemap.xml');
const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url));
assert.ok(routes.length > 0, 'Sitemap must list the public pages');
const origin = routes[0].origin;
const knownRoutes = new Set(routes.map(url => url.pathname));
assert.equal(knownRoutes.size, routes.length, 'Sitemap routes must be unique');
assert.ok(knownRoutes.has('/') && knownRoutes.has('/calculators/ohms-law/'));
assert.ok(knownRoutes.has('/converters/convert-kilometers-to-meters/'));
assert.ok(knownRoutes.has('/builder/') && knownRoutes.has('/measure/ar/'));
assert.ok((await read('robots.txt')).split(/\r?\n/).includes(`Sitemap: ${origin}/sitemap.xml`));

const assets = new Set();
for (const route of routes) {
  assert.equal(route.origin, origin);
  assert.equal(route.protocol, 'https:');
  const file = route.pathname.slice(1) + 'index.html';
  const page = await read(file);
  const canonicals = [...page.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
  assert.deepEqual(canonicals.map(([, href]) => href), [route.href], file);
  assert.match(page, /<title>[^<]+<\/title>/, file);
  assert.match(page, /<meta name="description" content="[^"]+"/, file);
  for (const [, value] of page.matchAll(/\b(?:href|src)="(\/[^"]*)"/g)) {
    const target = new URL(value.replaceAll('&amp;', '&'), route);
    assert.equal(target.origin, origin, file);
    assets.add(target.pathname);
  }
  for (const [, json] of page.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)) {
    assert.ok(JSON.parse(json)['@type'], file);
  }
}
for (const pathname of assets) {
  const asset = pathname.slice(1) + (pathname.endsWith('/') ? 'index.html' : '');
  assert.ok((await stat(new URL(asset, output))).isFile(), pathname);
}

for (const file of ['google107c576fa62d0500.html', 'BingSiteAuth.xml']) {
  const original = await readFile(new URL(`../web/${file}`, import.meta.url));
  assert.deepEqual(await readFile(new URL(file, output)), original, `${file} must be preserved byte for byte`);
}
assert.match(await read('404.html'), /<h1>Page not found<\/h1>/);
const headers = await read('_headers');
assert.match(headers, /^\s*Content-Security-Policy-Report-Only:.*object-src 'none'/m);
assert.match(headers, /^\s*X-Content-Type-Options: nosniff/m);
console.log(`Verified ${routes.length} canonical pages, ${assets.size} linked local paths, search verification files, 404 page and security headers.`);
