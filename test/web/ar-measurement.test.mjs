import test from 'node:test';
import assert from 'node:assert/strict';
import { distance3d } from '../../web/measure/ar-core.mjs';
import { setupAR } from '../../web/measure/ar.mjs';

test('AR distance uses three-dimensional metres and rejects invalid tracking points', () => {
  assert.equal(distance3d({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 12 }), 13);
  assert.throws(() => distance3d({ x: 0, y: 0, z: 0 }, { x: NaN, y: 0, z: 0 }));
});

test('AR session requires tracking before points can be selected and returns the measured distance', async () => {
  const previous = Object.fromEntries(['document', 'navigator', 'window', 'XRWebGLLayer'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const elements = new Map();
  for (const id of ['ar-overlay', 'ar-status', 'ar-live-status', 'ar-live-value', 'ar-place', 'ar-start', 'ar-exit']) elements.set(`#${id}`, { textContent: '', disabled: false, hidden: true, addEventListener(type, fn) { this[type] = fn; } });
  const gl = { FRAMEBUFFER: 1, COLOR_BUFFER_BIT: 2, DEPTH_BUFFER_BIT: 4, makeXRCompatible: async () => {}, bindFramebuffer() {}, clearColor() {}, clear() {} };
  const hitSource = { cancel() { throw new Error('Already ended'); } };
  const localSpace = { addEventListener(type, fn) { this[type] = fn; } };
  const session = { renderState: { baseLayer: { framebuffer: null } }, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; }, updateRenderState() {}, requestReferenceSpace: async type => type === 'local' ? localSpace : {}, requestHitTestSource: async () => hitSource, requestAnimationFrame(fn) { this.frame = fn; }, async end() { this.listeners.end?.(); } };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { querySelector: id => elements.get(id), createElement: () => ({ getContext: () => gl }) } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { isSecureContext: true, addEventListener() {} } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { xr: { requestSession: async () => session } } });
  Object.defineProperty(globalThis, 'XRWebGLLayer', { configurable: true, value: class {} });
  try {
    let result;
    setupAR({ onResult: value => { result = value; } });
    await elements.get('#ar-start').click();
    const frame = p => ({ getHitTestResults: () => p ? [{ getPose: () => ({ transform: { position: p } }) }] : [] });
    session.frame(0, frame(null));
    assert.equal(elements.get('#ar-place').disabled, true);
    session.frame(0, frame({ x: 0, y: 0, z: 0 }));
    elements.get('#ar-place').click();
    localSpace.reset();
    assert.equal(elements.get('#ar-place').disabled, true);
    assert.equal(elements.get('#ar-place').textContent, 'Set first point');
    session.frame(0, frame({ x: 0, y: 0, z: 0 }));
    elements.get('#ar-place').click();
    session.frame(0, frame({ x: 3, y: 4, z: 0 }));
    elements.get('#ar-place').click();
    assert.equal(result, 5);
    assert.equal(elements.get('#ar-overlay').hidden, true);
  } finally {
    for (const [key, descriptor] of Object.entries(previous)) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
});
