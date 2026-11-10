(() => {
  const STORAGE_KEY = 'fieldwork.calculation-history.v1';
  const ENABLED_KEY = 'fieldwork.calculation-history.enabled.v1';
  const MAX_ENTRIES = 100;

  function readEntries() {
    try {
      const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value)
        ? value.filter(entry => entry && typeof entry.id === 'string' && typeof entry.toolId === 'string' && entry.inputs && typeof entry.inputs === 'object' && entry.result !== undefined)
        : [];
    } catch (error) {
      return [];
    }
  }

  function isEnabled() {
    try {
      return window.localStorage.getItem(ENABLED_KEY) !== 'false';
    } catch (error) {
      return false;
    }
  }

  function writeEntries(entries) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function signature(entry) {
    return JSON.stringify([entry.toolId, entry.definitionVersion, entry.inputs, entry.result, entry.sourceDataVersions]);
  }

  function record(entry) {
    if (!isEnabled()) return { saved: false, reason: 'paused' };
    if (!entry || typeof entry.toolId !== 'string' || typeof entry.title !== 'string') {
      return { saved: false, reason: 'invalid' };
    }

    let snapshot;
    try {
      snapshot = JSON.parse(JSON.stringify(entry));
    } catch (error) {
      return { saved: false, reason: 'invalid' };
    }

    const entries = readEntries();
    const key = signature(snapshot);
    const existing = entries.find(item => signature(item) === key);
    if (existing) return { saved: true, duplicate: true, entry: existing };
    if (entries.length >= MAX_ENTRIES) return { saved: false, reason: 'limit' };

    snapshot.id = window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `history-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    snapshot.savedAt = new Date().toISOString();
    entries.unshift(snapshot);
    if (!writeEntries(entries)) return { saved: false, reason: 'unavailable' };
    return { saved: true, duplicate: false, entry: snapshot };
  }

  function list(toolId) {
    const entries = readEntries();
    return toolId ? entries.filter(entry => entry.toolId === toolId) : entries;
  }

  function remove(id) {
    return writeEntries(readEntries().filter(entry => entry.id !== id));
  }

  function clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  function setEnabled(enabled) {
    try {
      window.localStorage.setItem(ENABLED_KEY, enabled ? 'true' : 'false');
      return true;
    } catch (error) {
      return false;
    }
  }

  window.CalculationHistory = Object.freeze({ record, list, remove, clear, isEnabled, setEnabled });
})();
