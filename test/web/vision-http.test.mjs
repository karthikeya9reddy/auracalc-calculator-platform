import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';

test('local server serves Measure and reports unavailable AI configuration without exposing a key', async t => {
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ['scripts/dev-server.mjs'], { env: { ...process.env, OPENAI_API_KEY: '', AURACALC_PORT: String(port), AURACALC_HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(() => { throw new Error('Local server exited early'); }), new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('Local server did not start')), 10000); timer.unref(); })]);
    const base = `http://127.0.0.1:${port}`;
    const page = await fetch(`${base}/measure/`);
    assert.equal(page.status, 200);
    const markup = await page.text();
    assert.match(markup, /data-measure-mode="ar"/);
    assert.match(markup, /vision-analyze/);
    const availability = await fetch(`${base}/api/vision/status`);
    assert.equal(availability.status, 200);
    assert.deepEqual(await availability.json(), { configured: false });
    const result = await fetch(`${base}/api/vision/analyze`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ image: 'data:image/jpeg;base64,YWJj', question: 'How can I measure this?' }) });
    assert.equal(result.status, 503);
    assert.match((await result.json()).error, /not configured/i);
    const crossOrigin = await fetch(`${base}/api/vision/analyze`, { method: 'POST', headers: { Origin: 'https://example.invalid', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(crossOrigin.status, 403);
  } catch (error) {
    if (error?.cause?.code === 'EACCES' || error?.cause?.code === 'EPERM') { t.skip('Loopback connections are unavailable in this environment.'); return; }
    throw error;
  } finally { child.kill(); }
});
