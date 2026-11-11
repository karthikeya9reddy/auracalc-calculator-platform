import { distance3d, createHitStabilizer } from './ar-core.mjs';

export function setupAR({ onResult }) {
  const $ = selector => document.querySelector(selector);
  const root = $('#ar-overlay');
  const status = $('#ar-status');
  const live = $('#ar-live-status');
  const value = $('#ar-live-value');
  const place = $('#ar-place');
  let session = null, hitSource = null, hit = null, first = null, generation = 0;
  const stabilizer=createHitStabilizer();
  const clearPoint=()=>{first=null;hit=null;stabilizer.reset();place.disabled=true;place.textContent='Set first point';value.textContent='';};
  $('#ar-reset-point')?.addEventListener('click',clearPoint);
  $('#ar-check')?.addEventListener('click',async()=>{
    try{status.textContent=window.isSecureContext&&await navigator.xr?.isSessionSupported('immersive-ar')?'Your browser supports AR sessions. Start to check surface tracking and request permission.':'AR sessions are unavailable on this device or browser. Use Photo + AI to measure a captured image.';}catch{status.textContent='AR support could not be checked. Photo measurement remains available.';}
  });
  const reset = () => { try { hitSource?.cancel(); } catch {} hitSource = null; session = null; clearPoint(); root.hidden = true; };
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
      space.addEventListener?.('reset', () => { clearPoint(); live.textContent = 'Tracking changed. Find a surface and set the first point again.'; });
      active.addEventListener('visibilitychange',()=>{if(active.visibilityState!=='visible')clearPoint();});
      hitSource = await active.requestHitTestSource({ space: viewer });
      if(currentGeneration!==generation||session!==active){hitSource?.cancel();return;}
      const frameLoop = (time, frame) => {
        if (session !== active) return;
        active.requestAnimationFrame(frameLoop);
        const layer = active.renderState.baseLayer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const pose = frame.getHitTestResults(hitSource)[0]?.getPose(space);
        const p = pose?.transform.position;
        hit = stabilizer.update(p && {x:p.x,y:p.y,z:p.z},time);
        place.disabled = !hit;
        const message = hit ? (first ? 'Aim steady. Save the second point.' : 'Aim steady. Set the first point.') : p ? 'Hold your aim steady for a moment…' : 'Looking for a surface. Move the camera slowly.';
        if (live.textContent !== message) live.textContent = message;
        value.textContent = first && hit ? `About ${distance3d(first, hit).toFixed(2)} m` : '';
      };
      active.requestAnimationFrame(frameLoop);
    } catch {
      if(currentGeneration!==generation)return;
      const active = session;
      if (active) { try { await active.end(); } catch {} }
      reset(); status.textContent = 'Could not start AR. Your device must support immersive AR, surface hit testing, and on-screen controls; allow camera permission or use photo measurement.';
    } finally { $('#ar-start').disabled = false; }
  });
  place.addEventListener('click', () => {
    if (!session || !hit) return;
    if (!first) { first = { ...hit }; hit=null;stabilizer.reset();place.disabled=true;place.textContent = 'Save distance'; return; }
    const metres = distance3d(first, hit);
    if(metres<.01){live.textContent='Choose points at least 1 cm apart. Very short distances are unsuitable for this tool.';return;}
    onResult(metres);
    clearPoint();live.textContent='Distance saved. Set another first point or finish AR.';
  });
  const stop = () => { generation++; root.hidden = true; return session?.end().catch(() => {}); };
  $('#ar-exit').addEventListener('click', stop);
  window.addEventListener('pagehide', stop);
  return { stop };
}
