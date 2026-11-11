import { distance3d } from './ar-core.mjs';

export function setupAR({ onResult }) {
  const $ = selector => document.querySelector(selector);
  const root = $('#ar-overlay');
  const status = $('#ar-status');
  const live = $('#ar-live-status');
  const value = $('#ar-live-value');
  const place = $('#ar-place');
  let session = null, hitSource = null, hit = null, first = null, generation = 0;
  const reset = () => { try { hitSource?.cancel(); } catch {} hitSource = null; session = null; hit = null; first = null; root.hidden = true; place.disabled = true; place.textContent = 'Set first point'; value.textContent = ''; };
  root.addEventListener('beforexrselect', event => event.preventDefault());
  $('#ar-start').addEventListener('click', async () => {
    if (!window.isSecureContext || !navigator.xr) { status.textContent = 'AR is unavailable. Use HTTPS or localhost on a supported mobile browser.'; return; }
    $('#ar-start').disabled = true;
    root.hidden = false;
    const currentGeneration = ++generation;
    try {
      const active = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test', 'dom-overlay'], domOverlay: { root } });
      if (currentGeneration !== generation) { try { await active.end(); } catch {} return; }
      session = active;
      active.addEventListener('end', () => { if (session === active) { reset(); status.textContent = 'AR session ended. Start again to measure another distance.'; } });
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl', { xrCompatible: true, alpha: true });
      if (!gl) throw new Error('WebGL is unavailable.');
      await gl.makeXRCompatible();
      active.updateRenderState({ baseLayer: new XRWebGLLayer(active, gl) });
      const space = await active.requestReferenceSpace('local');
      const viewer = await active.requestReferenceSpace('viewer');
      space.addEventListener?.('reset', () => { first = null; hit = null; place.disabled = true; place.textContent = 'Set first point'; value.textContent = ''; live.textContent = 'Tracking changed. Find a surface and set the first point again.'; });
      hitSource = await active.requestHitTestSource({ space: viewer });
      const frameLoop = (time, frame) => {
        if (session !== active) return;
        active.requestAnimationFrame(frameLoop);
        const layer = active.renderState.baseLayer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const pose = frame.getHitTestResults(hitSource)[0]?.getPose(space);
        const p = pose?.transform.position;
        hit = p && [p.x, p.y, p.z].every(Number.isFinite) ? { x: p.x, y: p.y, z: p.z } : null;
        place.disabled = !hit;
        const message = hit ? (first ? 'Aim at the second point.' : 'Surface found. Aim at the first point.') : 'Looking for a surface. Move the camera slowly.';
        if (live.textContent !== message) live.textContent = message;
        value.textContent = first && hit ? `About ${distance3d(first, hit).toFixed(3)} m` : '';
      };
      active.requestAnimationFrame(frameLoop);
    } catch {
      const active = session;
      if (active) { try { await active.end(); } catch {} }
      reset(); status.textContent = 'Could not start AR. Your device must support immersive AR, surface hit testing, and on-screen controls; allow camera permission or use photo measurement.';
    } finally { $('#ar-start').disabled = false; }
  });
  place.addEventListener('click', () => {
    if (!session || !hit) return;
    if (!first) { first = { ...hit }; place.textContent = 'Set second point'; return; }
    const metres = distance3d(first, hit);
    onResult(metres);
    session.end().catch(() => {});
  });
  const stop = () => { generation++; root.hidden = true; return session?.end().catch(() => {}); };
  $('#ar-exit').addEventListener('click', stop);
  window.addEventListener('pagehide', stop);
  return { stop };
}
