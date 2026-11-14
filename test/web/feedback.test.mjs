import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { receiveFeedback } from '../../src/feedback/service.mjs';
import { diskFeedbackStore, readFeedback } from '../../scripts/feedback-local.mjs';

const entry = { id: '6d646ed9-5ae2-4077-9c75-d1318fc12466', type: 'calculation', message: 'The result needs a clearer explanation.', page: '/calculators/ohms-law/', contact: '' };
function request(body = entry, origin = 'https://example.org') {
  return new Request('https://example.org/api/feedback', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
test('feedback is acknowledged only after durable storage and owner retrieval; retries do not duplicate it', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'auracalc-feedback-'));
  try {
    const options = { store: diskFeedbackStore(folder), throttle: async () => true };
    for (let i = 0; i < 2; i++) {
      const response = await receiveFeedback(request(), options);
      assert.equal(response.status, 201);
      assert.equal((await response.json()).id, entry.id);
    }
    const received = await readFeedback(folder);
    assert.equal(received.length, 1);
    assert.equal(received[0].message, entry.message);
    assert.equal(received[0].page, entry.page);
    assert.equal(received[0].status, 'new');
  } finally { await rm(folder, { recursive: true, force: true }); }
});
test('feedback rejects cross-origin, invalid data, excessive messages, quota failures and unavailable storage', async () => {
  let writes = 0;
  const options = { store: async () => { writes++; }, throttle: async () => true };
  assert.equal((await receiveFeedback(request(entry, 'https://attacker.example'), options)).status, 403);
  for (const body of [{ ...entry, message: 'short' }, { ...entry, type: 'invalid' }, { ...entry, contact: 'bad' }, { ...entry, page: '//other.example/' }, { ...entry, id: '../escape' }]) {
    assert.equal((await receiveFeedback(request(body), options)).status, 400);
  }
  assert.equal((await receiveFeedback(request({ ...entry, message: 'x'.repeat(9000) }), options)).status, 413);
  assert.equal((await receiveFeedback(request(), { ...options, throttle: async () => false })).status, 429);
  assert.equal((await receiveFeedback(request(), {})).status, 503);
  assert.equal((await receiveFeedback(request(), { ...options, store: async () => { throw new Error('Disk full'); } })).status, 503);
  assert.equal(writes, 0);
});
