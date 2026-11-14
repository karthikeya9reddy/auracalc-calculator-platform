import { estimatePlanarVideoSpeed } from './video-speed-core.mjs';
const $ = id => document.getElementById(id);
const file = $('motion-video-file'), video = $('motion-video');
const status = $('motion-status'), value = $('motion-result');
let sourceUrl = null, mode = null, scalePoints = [], start = null, end = null;
function setMode(next, message) { mode = next; status.textContent = message; }
function clearResult() { value.hidden = true; $('motion-handoffs').hidden = true; }
file.addEventListener('change', () => {
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = null; video.pause(); video.removeAttribute('src'); video.load();
  scalePoints = []; start = end = null; clearResult();
  const selected = file.files?.[0];
  if (!selected) return;
  if (!selected.type.startsWith('video/')) { status.textContent = 'Choose a video file.'; file.value = ''; return; }
  if (selected.size > 250 * 1024 * 1024) { status.textContent = 'Choose a video smaller than 250 MB.'; file.value = ''; return; }
  sourceUrl = URL.createObjectURL(selected); video.src = sourceUrl;
  video.hidden = false; $('motion-player').hidden = false;
  status.textContent = 'Video loaded locally. Pause at a frame, then mark a reference line in the same plane as the moving object.';
});
$('motion-mark-scale').addEventListener('click', () => {
  if (video.readyState < 2) { status.textContent = 'Load a video first.'; return; }
  scalePoints = []; setMode('scale', 'Click the two ends of a known length on this paused frame. Use a reference in the same plane as the moving object.');
});
$('motion-mark-start').addEventListener('click', () => {
  if (!scalePoints.length) { status.textContent = 'Set the scale first.'; return; }
  start = null; end = null; clearResult(); setMode('start', 'Pause on the first useful frame and click the center of the moving object.');
});
$('motion-mark-end').addEventListener('click', () => {
  if (!start) { status.textContent = 'Mark the first object position first.'; return; }
  end = null; clearResult(); setMode('end', 'Pause at a later frame and click the same object. The camera must remain fixed.');
});
video.addEventListener('click', event => {
  if (!mode || video.paused === false) { if (mode) status.textContent = 'Pause the video before marking a point.'; return; }
  const bounds = video.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const point = { x: (event.clientX - bounds.left) / bounds.width * video.videoWidth, y: (event.clientY - bounds.top) / bounds.height * video.videoHeight, time: video.currentTime };
  if (mode === 'scale') {
    scalePoints.push(point);
    if (scalePoints.length === 1) status.textContent = 'Scale point one saved. Click the other end of the known length.';
    else { mode = null; status.textContent = 'Scale marked. Enter the known length and mark the same moving object in two frames.'; }
  } else if (mode === 'start') { start = point; mode = null; status.textContent = `Start position saved at ${point.time.toFixed(3)} s. Seek forward, pause, then mark the end position.`; }
  else if (mode === 'end') { end = point; mode = null; status.textContent = `End position saved at ${point.time.toFixed(3)} s. Calculate the estimate.`; }
});
$('motion-calculate').addEventListener('click', () => {
  try {
    if (scalePoints.length !== 2 || !start || !end) throw new Error('Mark the reference endpoints and the object in two frames first.');
    const scalePixels = Math.hypot(scalePoints[1].x-scalePoints[0].x, scalePoints[1].y-scalePoints[0].y);
    const result = estimatePlanarVideoSpeed({ scalePixels, knownDistance: Number($('motion-known-length').value), unit: $('motion-known-unit').value, start, end });
    const unit = $('motion-output-unit').value;
    const factors = { 'm/s': 1, 'km/h': 3.6, mph: 2.2369362920544, 'ft/s': 3.2808398950131 };
    const speed = result.speed * factors[unit];
    $('motion-result-value').textContent = `${Number(speed.toPrecision(6))} ${unit}`;
    $('motion-result-detail').textContent = `Moved ${result.pixelTravel.toFixed(1)} px over ${result.elapsedSeconds.toFixed(3)} s. Estimate assumes a fixed camera and constant scale in the marked plane.`;
    value.hidden = false;
    const handoffs = $('motion-handoffs'); handoffs.hidden = false;
    handoffs.replaceChildren();
    const card = document.createElement('p'); card.textContent = `Carry speed estimate: ${result.speed.toPrecision(6)} m/s into compatible calculators.`; handoffs.append(card);
    status.textContent = 'Estimate calculated. Perspective and manual point selection affect its accuracy.';
  } catch (error) { status.textContent = error.message; }
});
$('motion-reset').addEventListener('click', () => { video.pause(); file.value = ''; video.removeAttribute('src'); video.load(); video.hidden = true; $('motion-player').hidden = true; scalePoints = []; start = end = mode = null; clearResult(); status.textContent = 'Choose a clip to begin.'; if (sourceUrl) URL.revokeObjectURL(sourceUrl); sourceUrl = null; });
window.addEventListener('pagehide', () => { video.pause(); if (sourceUrl) URL.revokeObjectURL(sourceUrl); });
