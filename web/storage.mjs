const HISTORY_KEY = 'nexora.history.v1';
const HISTORY_ENABLED_KEY = 'nexora.history.enabled.v1';
const FEEDBACK_KEY = 'nexora.feedback.v1';
const MAX_HISTORY = 100;
const MAX_FEEDBACK = 100;

function getStorage(override) {
  if (override !== undefined) return override;
  try { return globalThis.localStorage; } catch { return null; }
}

function readJson(key, fallback, storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function failedWriteReason(error) {
  return error?.name === 'QuotaExceededError' ? 'storage-full' : 'unavailable';
}

export function historyEnabled(storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return false;
  try { return storage.getItem(HISTORY_ENABLED_KEY) !== 'false'; } catch { return false; }
}

export function setHistoryEnabled(enabled, storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return false;
  try {
    storage.setItem(HISTORY_ENABLED_KEY, enabled ? 'true' : 'false');
    return true;
  } catch { return false; }
}

export function getHistory(storageOverride) {
  const records = readJson(HISTORY_KEY, [], storageOverride);
  return Array.isArray(records) ? records.filter(record => record && typeof record.id === 'string') : [];
}

export function saveHistoryRecord(record, storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return { saved: false, reason: 'unavailable' };
  if (!historyEnabled(storage)) return { saved: false, reason: 'paused' };
  const records = getHistory(storage);
  if (records.length >= MAX_HISTORY) return { saved: false, reason: 'limit' };
  try {
    records.unshift(JSON.parse(JSON.stringify(record)));
    storage.setItem(HISTORY_KEY, JSON.stringify(records));
    return { saved: true, count: records.length };
  } catch (error) { return { saved: false, reason: failedWriteReason(error) }; }
}

export function deleteHistoryRecord(id, storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return false;
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(getHistory(storage).filter(record => record.id !== id)));
    return true;
  } catch { return false; }
}

export function clearHistory(storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return false;
  try { storage.removeItem(HISTORY_KEY); return true; } catch { return false; }
}

export function getFeedback(storageOverride) {
  const records = readJson(FEEDBACK_KEY, [], storageOverride);
  return Array.isArray(records) ? records : [];
}

export function saveFeedback(record, storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return { saved: false, reason: 'unavailable' };
  const records = getFeedback(storage);
  if (records.length >= MAX_FEEDBACK) return { saved: false, reason: 'limit' };
  try {
    records.unshift(JSON.parse(JSON.stringify(record)));
    storage.setItem(FEEDBACK_KEY, JSON.stringify(records));
    return { saved: true, count: records.length };
  } catch (error) { return { saved: false, reason: failedWriteReason(error) }; }
}

export function exportFeedback(storageOverride) {
  return getFeedback(storageOverride);
}
