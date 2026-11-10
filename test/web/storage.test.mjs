import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearHistory,
  deleteHistoryRecord,
  getFeedback,
  getHistory,
  historyEnabled,
  saveFeedback,
  saveHistoryRecord,
  setHistoryEnabled,
} from '../../web/storage.mjs';

function memoryStorage({ failWrites = false } = {}) {
  const data = new Map();
  return {
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) {
      if (failWrites) {
        const error = new Error('storage full');
        error.name = 'QuotaExceededError';
        throw error;
      }
      data.set(key, String(value));
    },
    removeItem(key) { data.delete(key); },
  };
}

test('local history saves, restores, deletes, pauses, and clears records', () => {
  const storage = memoryStorage();
  assert.equal(historyEnabled(storage), true);
  assert.equal(saveHistoryRecord({ id: 'h1', inputs: { value: 4 } }, storage).saved, true);
  assert.equal(getHistory(storage)[0].id, 'h1');
  assert.equal(deleteHistoryRecord('h1', storage), true);
  assert.equal(getHistory(storage).length, 0);
  assert.equal(setHistoryEnabled(false, storage), true);
  assert.deepEqual(saveHistoryRecord({ id: 'h2' }, storage), { saved: false, reason: 'paused' });
  assert.equal(clearHistory(storage), true);
});

test('local feedback records are retained for manual export', () => {
  const storage = memoryStorage();
  assert.equal(saveFeedback({ id: 'f1', message: 'A missing tool' }, storage).saved, true);
  assert.equal(getFeedback(storage)[0].message, 'A missing tool');
});

test('unavailable and full browser storage fail visibly without crashing', () => {
  assert.equal(historyEnabled(null), false);
  assert.deepEqual(saveHistoryRecord({ id: 'h1' }, null), { saved: false, reason: 'unavailable' });
  assert.deepEqual(saveFeedback({ id: 'f1' }, null), { saved: false, reason: 'unavailable' });
  const fullStorage = memoryStorage({ failWrites: true });
  assert.deepEqual(saveHistoryRecord({ id: 'h2' }, fullStorage), { saved: false, reason: 'storage-full' });
  assert.deepEqual(saveFeedback({ id: 'f2' }, fullStorage), { saved: false, reason: 'storage-full' });
});
