import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { analyzeVisionPhoto, handleLocalVision, handleVisionStatus } from '../../scripts/vision-service.mjs';

const photo = { image: 'data:image/jpeg;base64,YWJj', question: 'How do I measure the table?' };

test('vision service requires configuration and rejects malformed input', async () => {
  assert.equal((await analyzeVisionPhoto(photo)).status, 503);
  assert.equal((await analyzeVisionPhoto({ ...photo, image: 'https://example.com/photo' }, { apiKey: 'test' })).status, 400);
  assert.equal((await analyzeVisionPhoto({ ...photo, question: '' }, { apiKey: 'test' })).status, 400);
});

test('vision service sends a user-requested photo and returns plain guidance', async () => {
  let sent;
  const result = await analyzeVisionPhoto(photo, { apiKey: 'test', fetcher: async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ output: [{ content: [{ type: 'output_text', text: 'Use a known reference.' }] }] }) };
  } });
  assert.equal(result.answer, 'Use a known reference.');
  assert.equal(sent.body.store, false);
  assert.equal(sent.body.input[0].content[1].image_url, photo.image);
  assert.match(sent.body.instructions, /Never infer or claim real-world sizes/);
  assert.equal((await analyzeVisionPhoto(photo, { apiKey: 'test', fetcher: async () => ({ ok: false }) })).status, 502);
  assert.match((await analyzeVisionPhoto(photo, { apiKey: 'test', fetcher: async () => ({ ok: false, status: 401 }) })).error, /rejected the API key/);
  assert.match((await analyzeVisionPhoto(photo, { apiKey: 'test', fetcher: async () => ({ ok: false, status: 429 }) })).error, /quota limit/);
});

test('configuration status reports only whether a local server has a key', () => {
  const response = { writeHead(code) { this.status = code; }, end(body) { this.body = JSON.parse(body); } };
  handleVisionStatus({ headers: { host: 'localhost:4173' }, socket: { remoteAddress: '127.0.0.1' } }, response, 'private');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { configured: true });
  handleVisionStatus({ headers: { host: 'example.com' }, socket: { remoteAddress: '192.0.2.1' } }, response, 'private');
  assert.equal(response.status, 403);
  assert.ok(!JSON.stringify(response.body).includes('private'));
});

test('vision endpoint rejects cross-origin and non-local requests', async () => {
  async function call(origin, address) {
    const request = Readable.from([JSON.stringify(photo)]);
    request.headers = { host: 'localhost:4173', origin, 'content-type': 'application/json' };
    request.socket = { remoteAddress: address };
    const response = { writeHead(code) { this.status = code; }, end(body) { this.body = body; } };
    await handleLocalVision(request, response, {});
    return response.status;
  }
  assert.equal(await call('https://attacker.example', '127.0.0.1'), 403);
  assert.equal(await call('http://localhost:4173', '192.0.2.1'), 403);
  assert.equal(await call('http://localhost:4173', '127.0.0.1'), 503);
});
