import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { generateMeasurePages } from '../../scripts/generate-measure-pages.mjs';

test('measurement tools generate distinct direct pages with the correct default mode', async () => {
  const root = await mkdtemp(join(tmpdir(), 'auracalc-measure-'));
  assert.equal(resolve(dirname(root)), resolve(tmpdir()));
  try {
    await mkdir(join(root, 'web', 'measure'), { recursive: true });
    const source = await readFile(new URL('../../web/measure/index.html', import.meta.url), 'utf8');
    await writeFile(join(root, 'web', 'measure', 'index.html'), source);
    assert.equal(await generateMeasurePages(root), 3);
    for (const mode of ['photo', 'ar', 'speed']) {
      const html = await readFile(join(root, 'web', 'measure', mode, 'index.html'), 'utf8');
      assert.ok(html.includes(`data-measure-default="${mode}"`));
      assert.ok(html.includes(`rel="canonical" href="/measure/${mode}/"`));
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});
