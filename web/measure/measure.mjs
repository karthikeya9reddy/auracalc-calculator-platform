import { pixelDistance, scaleFromReference, scaledArea, scaledDistance, angleAt } from '../measurement-core.mjs';
import { listPublicCalculators } from '../../catalog/public/formulas.mjs';
import { convertValue, dimensionsEqual, getUnit } from '../../src/calculation-core/index.mjs';
import { deviceSpeed } from './speed-core.mjs';
import { setupAR } from './ar.mjs';
import { measurementMode } from '../measurement-search.mjs';

const $ = selector => document.querySelector(selector);
const units = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254, ft: 0.3048 };
const imageInput = $('#photo-file');
const image = $('#measurement-image');
const video = $('#camera-video');
const canvas = $('#capture-canvas');
const overlay = $('#measurement-overlay');
const stage = $('#measurement-stage');
const layer = $('#measurement-layer');
const referenceLength = $('#reference-length');
const referenceUnit = $('#reference-unit');
const status = $('#measure-status');
const output = $('#measurement-output');
const outputValue = $('#measurement-value');
const outputNote = $('#measurement-note');
const handoffList = $('#measurement-handoffs');
const coordinates = { x: $('#point-x'), y: $('#point-y') };
let stream = null;
let cameraGeneration = 0;
let objectUrl = null;
let mode = null;
let points = [];
let calibration = null;
let history = [];
let imageWidth = 0;
let imageHeight = 0;
let locale = 'en-US';
let visionRequest = null;
let visionConfig = 'checking';
let selectedMeasurement = null;

function visionMessage() {
  if (visionConfig === 'checking') return 'Checking the AI connection…';
  if (visionConfig === 'unconfigured') return 'Photo AI is not enabled by this site yet. You can still measure locally with a known reference.';
  if (visionConfig === 'unavailable') return 'Photo AI is unavailable right now. Local photo measurement is still available.';
  return imageWidth ? 'AI is configured. Add a question if you like, then choose Analyze.' : 'AI is configured. Choose a photo to begin.';
}
async function checkVisionConnection() {
  visionConfig = 'checking'; $('#vision-status').textContent = visionMessage();
  try {
    const response = await fetch('/api/vision/status', { cache: 'no-store', ...(typeof AbortSignal.timeout === 'function' ? { signal: AbortSignal.timeout(5000) } : {}) });
    if (!response.ok) throw new Error();
    const data = await response.json();
    visionConfig = data.configured === true ? 'ready' : 'unconfigured';
  } catch { visionConfig = 'unavailable'; }
  $('#vision-status').textContent = visionMessage();
}
$('#vision-check').addEventListener('click', checkVisionConnection);
checkVisionConnection();

function setStatus(message, kind = 'info') {
  status.textContent = message;
  status.dataset.kind = kind;
}

function stopCamera() {
  cameraGeneration++;
  stream?.getTracks().forEach(track => track.stop());
  stream = null;
  video.pause();
  video.srcObject = null;
  video.hidden = true;
  $('#capture-frame').hidden = true;
}

function setImageSource(source, width, height) {
  visionRequest?.abort();
  $('#vision-answer').hidden = true;
  image.src = source;
  imageWidth = width;
  imageHeight = height;
  $('#vision-status').textContent = visionMessage();
  image.hidden = false;
  $('#measure-empty').hidden = true;
  stage.hidden = false;
  layer.style.width = '100%';
  $('#measure-zoom').value = '1';
  $('#measure-zoom-value').value = '1×';
  layer.style.aspectRatio = `${width} / ${height}`;
  overlay.setAttribute('viewBox', `0 0 ${width} ${height}`);
  overlay.replaceChildren();
  points = [];
  calibration = null;
  mode = null;
  history = [];
  output.hidden = true;
  handoffList.hidden = true;
  renderMeasurements();
  updateControls();
  setStatus('Photo ready. Set a known reference length in the same plane before measuring real-world dimensions.');
}

function updateControls() {
  const hasImage = imageWidth > 0 && imageHeight > 0;
  $('#set-scale').disabled = !hasImage;
  $('#vision-analyze').disabled = !hasImage;
  $('#measure-length').disabled = !hasImage;
  $('#measure-area').disabled = !hasImage;
  $('#measure-angle').disabled = !hasImage;
  $('#finish-area').disabled = mode !== 'area' || points.length < 3;
  $('#undo-point').disabled = points.length === 0;
  $('#cancel-points').disabled = !mode;
  $('#export-measurements').disabled = history.length === 0;
  $('#scale-record').textContent = calibration ? `Reference: ${format(calibration.length)} ${calibration.unit} · ${format(calibration.pixels)} px` : 'No reference set · length is in pixels';
  for (const id of ['set-scale','measure-length','measure-area','measure-angle']) $('#'+id).setAttribute('aria-pressed',String(mode === ({'set-scale':'scale','measure-length':'length','measure-area':'area','measure-angle':'angle'})[id]));
  $('#clear-marks').disabled = points.length === 0 && history.length === 0 && !calibration;
  $('#place-coordinate').disabled = !mode;
}

function renderMeasurements() {
  overlay.replaceChildren();
  overlay.style.setProperty('--label-size', `${Math.max(14,imageWidth / 45)}px`);
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}, text = null) => {
    const el = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
    if (text !== null) el.textContent = text;
    return el;
  };
  if (calibration) {
    overlay.append(make('line', { x1: calibration.points[0].x, y1: calibration.points[0].y, x2: calibration.points[1].x, y2: calibration.points[1].y, class: 'scale-line' }));
    overlay.append(make('text', { x: (calibration.points[0].x + calibration.points[1].x) / 2, y: (calibration.points[0].y + calibration.points[1].y) / 2 - 12, class: 'marker-label' }, `REF · ${format(calibration.length)} ${calibration.unit}`));
    calibration.points.forEach((point, index) => overlay.append(make('circle', { cx: point.x, cy: point.y, r: Math.max(5, imageWidth * 0.006), class: 'scale-point' }), make('text', { x: point.x + 9, y: point.y - 9, class: 'marker-label' }, `R${index + 1}`)));
  }
  for (const item of history) {
    if (item.kind === 'length' || item.kind === 'pixel-length') {
      overlay.append(make('line', { x1: item.points[0].x, y1: item.points[0].y, x2: item.points[1].x, y2: item.points[1].y, class: 'measure-line' }));
      overlay.append(make('text', { x: (item.points[0].x + item.points[1].x) / 2, y: (item.points[0].y + item.points[1].y) / 2 - 12, class: 'marker-label' }, `${format(item.value)} ${item.unit}`));
    } else if (item.kind === 'angle') {
      overlay.append(make('polyline', {points:item.points.map(p=>`${p.x},${p.y}`).join(' '),class:'measure-line',fill:'none'}));
      overlay.append(make('text', {x:item.points[1].x+imageWidth*.02,y:item.points[1].y-imageWidth*.02,class:'marker-label'},`${format(item.value)}°`));
    } else {
      overlay.append(make('polygon', { points: item.points.map(point => `${point.x},${point.y}`).join(' '), class: 'measure-polygon' }));
      const center = item.points.reduce((sum, point) => ({ x: sum.x + point.x / item.points.length, y: sum.y + point.y / item.points.length }), { x: 0, y: 0 });
      overlay.append(make('text', { x: center.x, y: center.y, class: 'marker-label' }, `${format(item.value)} ${item.unit}`));
    }
  }
  if (mode === 'length' && points.length) {
    overlay.append(make('circle', { cx: points[0].x, cy: points[0].y, r: Math.max(5, imageWidth * 0.006), class: 'measure-point' }));
    if (points[1]) overlay.append(make('line', { x1: points[0].x, y1: points[0].y, x2: points[1].x, y2: points[1].y, class: 'measure-line measure-line-active' }));
  } else if ((mode === 'area' || mode === 'angle') && points.length) {
    overlay.append(make(mode==='angle'?'polyline':'polygon', { points: points.map(point => `${point.x},${point.y}`).join(' '), class: 'measure-polygon measure-polygon-active' }));
  }
  points.forEach((point, index) => overlay.append(make('circle', { cx: point.x, cy: point.y, r: Math.max(5, imageWidth * 0.006), class: 'measure-point' }), make('text', { x: point.x + 9, y: point.y - 9, class: 'marker-label' }, String(index + 1))));
  updateControls();
  renderNotebook();
}

function pickPoint(event) {
  if (!mode) return;
  const rect = overlay.getBoundingClientRect();
  const point = {
    x: Math.max(0, Math.min(imageWidth, (event.clientX - rect.left) / rect.width * imageWidth)),
    y: Math.max(0, Math.min(imageHeight, (event.clientY - rect.top) / rect.height * imageHeight)),
  };
  addPoint(point);
}


function addPoint(point) {
  if(!mode)return;
  if(points.length>=200){setStatus('Use at most 200 boundary points.','error');return;}
  points.push(point);
  try {
    if(mode==='scale' && points.length===2) {
      const pixels=pixelDistance(...points), length=Number(referenceLength.value);
      if(pixels<20)throw new Error('Mark a reference at least 20 image pixels long.');
      calibration={points:[...points],pixels,length,unit:referenceUnit.value,metresPerPixel:scaleFromReference(pixels,length,referenceUnit.value)};
      points=[];mode=null;setStatus('Scale set. Keep measured points on the same plane as this reference.','success');
    } else if(mode==='length' && points.length===2) {
      const pixels=pixelDistance(...points);
      if(!pixels)throw new Error('Choose two distinct endpoints.');
      const measured=calibration?scaledDistance(...points,calibration.metresPerPixel,calibration.unit):null;
      saveMeasurement({kind:measured?'length':'pixel-length',points:[...points],pixels,value:measured?measured.value:pixels,unit:measured?measured.unit:'px',canonicalValue:measured?measured.metres:null,canonicalUnit:measured?'m':null});
    } else if(mode==='angle' && points.length===3) {
      const value=angleAt(...points);saveMeasurement({kind:'angle',points:[...points],value,unit:'°',canonicalValue:value,canonicalUnit:'deg'});
    } else setStatus(mode==='area'?points.length+' boundary points. Trace in order, then finish the area.':mode==='angle'?(points.length===1?'Mark the corner (the vertex).':'Mark the end of the second arm.'):'Mark the second endpoint.');
  }catch(error){points.pop();setStatus(error.message,'error');}
  renderMeasurements();
}
function format(value,maximumFractionDigits=4){return new Intl.NumberFormat(locale,{maximumFractionDigits,maximumSignificantDigits:7}).format(value);}
function finishArea() {
  if(mode!=='area'||points.length<3)return;
  try {
    if(!calibration)throw new Error('Set a reference on the same plane first.');
    const measured=scaledArea(points,calibration.metresPerPixel,calibration.unit);
    saveMeasurement({kind:'area',points:[...points],value:measured.value,unit:measured.unit,canonicalValue:measured.squareMetres,canonicalUnit:'m2'});
  }catch(error){setStatus(error.message,'error');}
}
function saveMeasurement(item) {
  if(history.length>=40)throw new Error('This photo has 40 readings. Remove a reading before adding another.');
  item.id=crypto.randomUUID();item.reference=calibration&&item.kind!=='angle'?structuredClone(calibration):null;item.at=new Date().toISOString();
  history.push(item);selectedMeasurement=item.id;points=[];mode=null;renderMeasurements();showMeasurement(item);
  setStatus('Reading saved. Keep measuring or continue in a calculator.','success');
}
function showMeasurement(item){
  output.hidden=false;outputValue.textContent=format(item.value)+' '+item.unit;
  outputNote.textContent=item.kind==='pixel-length'?'Pixels only. Set a known reference for physical dimensions.':item.kind==='angle'?'Angle in the image plane. Perspective can change the apparent angle.': 'Image estimate · recorded reference '+format(item.reference.length)+' '+item.reference.unit+' across '+format(item.reference.pixels)+' px. This reading keeps its original scale.';
  renderHandoffs(item);
}
function renderNotebook(){
  const list=$('#measurement-notebook');list.replaceChildren();$('#notebook-count').textContent=String(history.length);
  if(!history.length){const p=document.createElement('p');p.className='notebook-empty';p.textContent='Your lengths, areas and angles stay together here for this photo.';list.append(p);return;}
  history.forEach((item,index)=>{
    const row=document.createElement('div');row.className='notebook-row';
    const select=document.createElement('button');select.type='button';select.className='notebook-reading';select.setAttribute('aria-pressed',String(selectedMeasurement===item.id));
    const title=document.createElement('strong');title.textContent=(index+1)+'. '+format(item.value)+' '+item.unit;
    const note=document.createElement('span');note.textContent=item.kind==='angle'?'Image-plane angle':item.reference?'Reference '+format(item.reference.length)+' '+item.reference.unit:'Pixels · no scale';
    select.append(title,note);select.addEventListener('click',()=>{selectedMeasurement=item.id;showMeasurement(item);renderNotebook();});
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.className='notebook-remove';remove.setAttribute('aria-label','Remove reading '+(index+1));
    remove.addEventListener('click',()=>{history=history.filter(r=>r.id!==item.id);if(selectedMeasurement===item.id){const next=history.at(-1);selectedMeasurement=next?.id;if(next)showMeasurement(next);else{output.hidden=true;handoffList.hidden=true;}}renderMeasurements();});
    row.append(select,remove);list.append(row);
  });
}
function renderHandoffs(item, target = handoffList) {
  target.replaceChildren();
  if (item.canonicalValue == null || !getUnit(item.canonicalUnit)) {
    target.hidden = true;
    return;
  }
  const dimension = getUnit(item.canonicalUnit).dimension;
  const candidates = listPublicCalculators().flatMap(definition => definition.inputs
    .filter(field => Object.entries(dimension).every(([key, exponent]) => Number(field.dimension?.[key] || 0) === exponent)
      && Object.entries(field.dimension || {}).every(([key, exponent]) => Number(dimension[key] || 0) === exponent))
    .filter(field => {
      try {
        const value=convertValue(item.canonicalValue,item.canonicalUnit,field.canonicalUnit);
        return Number.isFinite(value) && (field.range?.min == null || value >= field.range.min) && (field.range?.max == null || value <= field.range.max);
      } catch { return false; }
    })
    .map(field => ({ definition, field })));
  const unique = candidates.filter((candidate, index) => candidates.findIndex(item => item.definition.id === candidate.definition.id && item.field.id === candidate.field.id) === index);
  if (!unique.length) {
    target.hidden = true;
    return;
  }
  target.hidden = false;
  const heading = document.createElement('h3');
  heading.textContent = 'Continue with this measurement';
  target.append(heading);
  const help = document.createElement('p');
  help.textContent = 'Choose an input whose meaning matches what you measured. Matching units alone do not establish that relationship. The value stays editable.';
  target.append(help);
  const search = document.createElement('input');search.type='search';search.placeholder='Find a calculator for this reading';search.setAttribute('aria-label','Search measurement destinations');
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Choose a compatible calculator and input');
  const populate=()=>{const words=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);select.replaceChildren();unique.forEach(({definition,field},index)=>{const haystack=`${definition.title} ${definition.category} ${field.label} ${(definition.keywords||[]).join(' ')}`.toLowerCase();if(!words.every(w=>haystack.includes(w)))return;const option=document.createElement('option');option.value=String(index);option.textContent=`${definition.title} — ${field.label}`;select.append(option);});};
  populate();
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'measure-button measure-button-secondary'; button.textContent = 'Continue with this value';
  button.addEventListener('click', () => {if(!select.options.length)return; const { definition, field } = unique[Number(select.value)]; carryToCalculator(definition, field, item); });
  search.addEventListener('input',()=>{populate();button.disabled=!select.options.length;help.textContent=select.options.length?'Choose where this measurement belongs. Matching units alone do not establish that a measured length is a radius, height or other specific quantity.':'No matching inputs. Try a shorter or different search.';});
  target.append(search,select, button);
}

function carryToCalculator(definition, field, item) {
  const sourceUnit = item.canonicalUnit;
  const targetUnit = field.canonicalUnit;
  const source = getUnit(sourceUnit);
  const target = getUnit(targetUnit);
  if (!source || !target || !dimensionsEqual(source.dimension, target.dimension)) {
    setStatus('This calculator input uses a different unit dimension. Choose another compatible tool.', 'error');
    return;
  }
  const carried = convertValue(item.canonicalValue, sourceUnit, targetUnit);
  try {
    sessionStorage.setItem('auracalc.visual-measurement.v1', JSON.stringify({
      calculatorId: definition.id,
      inputId: field.id,
      value: carried,
      unit: targetUnit,
      source: item.kind === 'speed' ? 'Device speedometer' : item.kind === 'ar-length' ? 'AR surface measurement' : 'Visual Measurement Lab',
      method: item.kind === 'speed' ? 'Device-reported location speed; subject to sensor availability and delay.' : item.kind === 'ar-length' ? 'Distance between two WebXR tracked surface points; subject to tracking drift.' : 'Known reference length and manually selected image points; planar estimate.',
      measuredAt: new Date().toISOString(),
    }));
    location.href = `/calculators/${encodeURIComponent(definition.id)}/`;
  } catch {
    setStatus('This browser could not prepare the calculator handoff. Your measurement is still shown above.', 'error');
  }
}

$('#camera-start').addEventListener('click', async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus('Camera access is unavailable here. Open the site on HTTPS or localhost, or choose a photo instead.', 'error');
    return;
  }
  try {
    stopCamera();
    const generation = cameraGeneration;
    const acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    if (generation !== cameraGeneration) { acquired.getTracks().forEach(track => track.stop()); return; }
    stream = acquired;
    video.srcObject = stream;
    visionRequest?.abort(); imageWidth = 0; imageHeight = 0; calibration = null; points = []; history = []; mode = null; output.hidden = true; handoffList.hidden = true; overlay.replaceChildren(); updateControls();
    $('#vision-answer').hidden = true; $('#vision-status').textContent = 'Capture a frame before requesting AI analysis.';
    video.hidden = false;
    image.hidden = true;
    stage.hidden = false;
    $('#measure-empty').hidden = true;
    $('#capture-frame').hidden = false;
    await video.play();
    if (generation !== cameraGeneration) return;
    if (video.videoWidth && video.videoHeight) layer.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    setStatus('Camera ready. Capture one clear frame, then mark a known length and your measurement points.');
  } catch (error) {
    stopCamera();
    setStatus(error.name === 'NotAllowedError' ? 'Camera permission was denied. Choose a photo instead or allow camera access in your browser.' : 'The camera could not start on this device. Choose a photo instead.', 'error');
  }
});

$('#capture-frame').addEventListener('click', () => {
  if (!video.videoWidth || !video.videoHeight) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, canvas.width, canvas.height);
  const captured = canvas.toDataURL('image/jpeg', 0.92);
  stopCamera();
  setImageSource(captured, canvas.width, canvas.height);
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  if(file.size>20*1024*1024){setStatus('Choose an image smaller than 20 MB.','error');return;}
  stopCamera();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  const selectedUrl = objectUrl;
  const probe = new Image();
  probe.onload = () => {if(objectUrl!==selectedUrl)return;if(probe.naturalWidth*probe.naturalHeight>40_000_000){setStatus('Choose a photo with fewer than 40 million pixels.','error');return;}setImageSource(selectedUrl,probe.naturalWidth,probe.naturalHeight);};
  probe.onerror = () => setStatus('This image could not be opened. Try a different photo format.', 'error');
  probe.src = objectUrl;
});

$('#set-scale').addEventListener('click', () => {
  const length = Number(referenceLength.value);
  if (!Number.isFinite(length) || length <= 0) {
    setStatus('Enter the real-world length of the reference before marking its endpoints.', 'error');
    referenceLength.focus();
    return;
  }
  mode = 'scale';
  points = [];
  renderMeasurements();
  setStatus('Tap the two ends of a known length that lies on the same surface as the object you want to measure.');
});

$('#measure-length').addEventListener('click', () => {
  mode = 'length';
  points = [];
  renderMeasurements();
  setStatus(calibration ? 'Tap two endpoints on the same plane as your reference.' : 'No scale is set. You can measure pixels only, or set a known reference length first.');
});

$('#measure-area').addEventListener('click', () => {
  if (!calibration) {
    setStatus('Set a known same-plane reference length before calculating real-world area.', 'error');
    return;
  }
  mode = 'area';
  points = [];
  renderMeasurements();
  setStatus('Tap around the boundary in order. Use at least three points, then finish the area.');
});

$('#finish-area').addEventListener('click', finishArea);
$('#measure-angle').addEventListener('click',()=>{mode='angle';points=[];renderMeasurements();setStatus('Mark three points: first arm, corner, then second arm. This measures the angle in the image plane.');});
$('#cancel-points').addEventListener('click',()=>{mode=null;points=[];renderMeasurements();setStatus('Selection cancelled. Your saved readings are unchanged.');});
for(const control of [referenceLength,referenceUnit])control.addEventListener('input',()=>{if(!calibration)return;calibration=null;points=[];mode=null;renderMeasurements();setStatus('Reference changed. Mark its endpoints again. Previous readings keep their original reference.');});
$('#load-demo').addEventListener('click',()=>{
  stopCamera();if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}imageInput.value='';
  referenceLength.value='100';referenceUnit.value='cm';setImageSource('/measure/demo.svg',1000,700);
  calibration={points:[{x:250,y:590},{x:750,y:590}],pixels:500,length:100,unit:'cm',metresPerPixel:.002};renderMeasurements();
  setStatus('Practice board: scale is set to 100 cm across the ruler. The tabletop is 100 × 60 cm. Try a length, area (0.6 m²), or a corner (90°).','success');
});
$('#export-measurements').addEventListener('click',()=>{
  const lines=['AuraCalc · Photo measurement report',new Date().toISOString(),`Image: ${imageWidth} × ${imageHeight} pixels`,'Estimates from user-marked points. Perspective, reference placement and image resolution affect accuracy.'];
  history.forEach((item,i)=>lines.push('',`Reading ${i+1} · ${item.kind}`,`Answer: ${item.value} ${item.unit}`,`Image points: ${item.points.map(p=>`(${p.x}, ${p.y})`).join(' → ')}`,item.reference?`Reference: ${item.reference.length} ${item.reference.unit} across ${item.reference.pixels} pixels · scale ${item.reference.metresPerPixel} m/px`:'No physical scale used.',item.kind==='area'?'Method: simple polygon area × scale²':item.kind==='angle'?'Method: angle between vectors at the middle point (image plane)':'Method: endpoint pixel distance × reference scale (if set).',`Recorded: ${item.at}`));
  const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='auracalc-photo-measurements.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('#undo-point').addEventListener('click', () => {
  if (points.length) points.pop();
  else if (history.length) history.pop();
  renderMeasurements();
});
$('#clear-marks').addEventListener('click', () => {
  points = [];
  history = [];
  calibration = null;
  mode = null;
  output.hidden = true;
  handoffList.hidden = true;
  renderMeasurements();
  setStatus('Marks and scale cleared.');
});
$('#measurement-overlay').addEventListener('click', pickPoint);

$('#place-coordinate').addEventListener('click', () => {
  const xPercent = Number(coordinates.x.value);
  const yPercent = Number(coordinates.y.value);
  if (!coordinates.x.value.trim() || !coordinates.y.value.trim() || !Number.isFinite(xPercent) || !Number.isFinite(yPercent) || xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) {
    setStatus('Enter X and Y positions between 0 and 100 percent.', 'error');
    return;
  }
  const point = { x: imageWidth * xPercent / 100, y: imageHeight * yPercent / 100 };
  addPoint(point);
  renderMeasurements();
});

$('#localeSelect').addEventListener('change', event => { locale = event.target.value; renderMeasurements(); const item=history.find(r=>r.id===selectedMeasurement);if(item)showMeasurement(item);showSpeed(); });
$('#measure-zoom').addEventListener('input', event => {
  const zoom = Number(event.target.value);
  layer.style.width = `${zoom * 100}%`;
  $('#measure-zoom-value').value = `${format(zoom, 2)}×`;
});
$('#reset-measurement').addEventListener('click', () => {
  visionRequest?.abort();
  stopCamera();
  imageInput.value = '';
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  image.removeAttribute('src');
  image.hidden = true;
  stage.hidden = true;
  layer.style.width = '100%';
  $('#measure-zoom').value = '1';
  $('#measure-zoom-value').value = '1×';
  $('#measure-empty').hidden = false;
  imageWidth = 0;
  imageHeight = 0;
  points = [];
  history = [];
  calibration = null;
  mode = null;
  output.hidden = true;
  handoffList.hidden = true;
  $('#vision-answer').hidden = true;
  $('#vision-status').textContent = visionMessage();
  renderMeasurements();
  setStatus('Choose a photo or camera frame to begin.');
});

$('#vision-analyze').addEventListener('click', async () => {
  if (!imageWidth || image.hidden) return;
  if (visionConfig !== 'ready') { $('#vision-status').textContent = visionMessage(); return; }
  const question = $('#vision-question').value.trim() || 'Identify the main object and explain how I can measure it.';
  visionRequest?.abort();
  const controller = new AbortController(); visionRequest = controller;
  const button = $('#vision-analyze'); button.disabled = true; $('#vision-answer').hidden = true;
  $('#vision-status').textContent = 'Sending the selected image and your question for analysis…';
  try {
    if (typeof image.decode === 'function') await image.decode();
    else if (!image.complete || !image.naturalWidth) await new Promise((resolve, reject) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', reject, { once: true }); });
    if (controller.signal.aborted) return;
    const resized = document.createElement('canvas');
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    resized.width = Math.max(1, Math.round(image.naturalWidth * scale)); resized.height = Math.max(1, Math.round(image.naturalHeight * scale));
    resized.getContext('2d').drawImage(image, 0, 0, resized.width, resized.height);
    const response = await fetch('/api/vision/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: resized.toDataURL('image/jpeg', .82), question }), signal: controller.signal });
    const result = await response.json().catch(() => ({}));
    if (controller.signal.aborted) return;
    if (!response.ok || !result.answer) throw new Error(result.error || 'AI analysis is not configured on this server.');
    $('#vision-answer').textContent = result.answer;
    $('#vision-answer').hidden = false;
    $('#vision-status').textContent = 'AI guidance is ready. Confirm the object and set a reference before measuring.';
  } catch (error) { if (error.name !== 'AbortError') $('#vision-status').textContent = error.message || 'Unable to analyze this image.'; }
  finally { if (visionRequest === controller) { visionRequest = null; button.disabled = !imageWidth; } }
});

const arReadings=[];
function showARReading(metres){
  $('#ar-result').hidden = false;
  $('#ar-value').textContent = `About ${format(metres)} m`;
  renderHandoffs({ kind: 'ar-length', canonicalValue: metres, canonicalUnit: 'm' }, $('#ar-handoffs'));
}
const ar = setupAR({ onResult: metres => {
  arReadings.push(metres);if(arReadings.length>20)arReadings.shift();showARReading(metres);
  $('#ar-notebook').replaceChildren(...arReadings.map((n,i)=>{const b=document.createElement('button');b.type='button';b.className='measure-button measure-button-secondary';b.textContent=`${i+1} · ${format(n)} m`;b.addEventListener('click',()=>showARReading(n));return b;}));
} });
for (const button of document.querySelectorAll('[data-measure-mode]')) button.addEventListener('click', () => {
  const selected = button.dataset.measureMode;
  for (const choice of document.querySelectorAll('[data-measure-mode]')) { const active = choice === button; choice.classList.toggle('active', active); choice.setAttribute('aria-pressed', String(active)); }
  for (const panel of document.querySelectorAll('[data-measure-panel]')) panel.hidden = panel.dataset.measurePanel !== selected;
  if (selected !== 'photo') { stopCamera(); visionRequest?.abort(); if (!imageWidth) { stage.hidden = true; $('#measure-empty').hidden = false; } $('#vision-status').textContent = visionMessage(); }
  if (selected !== 'ar') ar.stop();
  if (selected !== 'speed') { stopSpeed(); speedStatus.textContent = 'Stopped. Start again when you need a reading.'; }
});

let speedWatch = null;
let speedGeneration = 0;
let latestSpeed = null;
let speedItem = null;
let speedExpiry = null;
let lastSpeedAt = 0;
const speedStatus = $('#speed-status');
const speedHandoffs = $('#speed-handoffs');
function showSpeed() {
  const unit = $('#speed-unit').value;
  $('#speed-unit-label').textContent = unit;
  $('#speed-value').textContent = latestSpeed == null ? '—' : format(convertValue(latestSpeed, 'm/s', unit), 2);
}
function stopSpeed() {
  clearInterval(speedExpiry);speedExpiry=null;
  speedGeneration++;
  if (speedWatch !== null) navigator.geolocation.clearWatch(speedWatch);
  speedWatch = null;
  $('#speed-start').disabled = false;
  $('#speed-stop').disabled = true;
}
$('#speed-unit').addEventListener('change', showSpeed);
$('#speed-start').addEventListener('click', () => {
  if (!navigator.geolocation || !window.isSecureContext) { speedStatus.textContent = 'Location access is unavailable here. Use HTTPS or localhost on a supported device.'; return; }
  stopSpeed(); latestSpeed = null; speedItem = null; showSpeed(); speedHandoffs.hidden = true;
  $('#speed-start').disabled = true; $('#speed-stop').disabled = false;
  speedStatus.textContent = 'Waiting for a location reading and device-reported speed…';
  const generation = speedGeneration;
  try {
  speedWatch = navigator.geolocation.watchPosition(position => {
    if (generation !== speedGeneration) return;
    const speed = deviceSpeed(position.coords.speed);
    if (speed === null || !Number.isFinite(position.timestamp) || Date.now()-position.timestamp>15000 || position.timestamp-Date.now()>5000) {
      latestSpeed = null; speedItem = null; showSpeed(); speedHandoffs.hidden = true;
      speedStatus.textContent = 'Your device has not supplied a speed reading. Try outdoors with location enabled.';
      return;
    }
    lastSpeedAt=Date.now();latestSpeed = speed; showSpeed();
    const accuracy = position.coords.accuracy;
    speedStatus.textContent = `Updated ${new Date(position.timestamp).toLocaleTimeString(locale)} · location accuracy approximately ${format(accuracy, 0)} m. Speed accuracy is not provided.`;
    if (!speedItem) { speedItem = { kind: 'speed', canonicalValue: speed, canonicalUnit: 'm/s' }; renderHandoffs(speedItem, speedHandoffs); }
    else speedItem.canonicalValue = speed;
  }, error => {
    if (generation !== speedGeneration) return;
    latestSpeed = null; speedItem = null; showSpeed(); speedHandoffs.hidden = true;
    speedStatus.textContent = error.code === 1 ? 'Location permission was denied. Allow it in your browser settings to use the speedometer.' : 'A location reading is unavailable. Check your device location settings and try again.';
    stopSpeed();
  }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  speedExpiry=setInterval(()=>{if(latestSpeed!==null&&Date.now()-lastSpeedAt>15000){latestSpeed=null;speedItem=null;showSpeed();speedHandoffs.hidden=true;speedStatus.textContent='Reading expired. Waiting for a fresh location speed.';}},3000);
  } catch {
    stopSpeed(); speedStatus.textContent = 'Location access could not start. Check your browser and device settings.';
  }
});
$('#speed-stop').addEventListener('click', () => { stopSpeed(); speedStatus.textContent = 'Stopped. The last reading is no longer updating.'; });
$('#check-capabilities').addEventListener('click', async () => {
  const camera = window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
  const location = window.isSecureContext && !!navigator.geolocation;
  let ar = 'AR support unavailable';
  try { if (navigator.xr?.isSessionSupported) ar = await navigator.xr.isSessionSupported('immersive-ar') ? 'AR sessions supported by browser' : 'AR sessions not supported'; } catch { ar = 'AR support could not be checked'; }
  $('#capability-status').textContent = `${camera ? 'Camera API available' : 'Camera API unavailable'} · ${location ? 'Location API available' : 'Location API unavailable'} · ${ar}. Permissions and actual depth measurement support are separate.`;
});

window.addEventListener('pagehide', () => {
  stopCamera();
  stopSpeed();
  visionRequest?.abort();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});

$('#measurement-overlay').addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    mode = null;
    points = [];
    renderMeasurements();
    setStatus('Point selection cancelled.');
  }
});

const params = new URLSearchParams(location.search);
const initialMode = measurementMode(location.search, document.body.dataset.measureDefault || 'photo');
if (initialMode !== 'photo') document.querySelector(`[data-measure-mode="${initialMode}"]`)?.click();
if (['en-US','en-GB','de-DE','fr-FR','hi-IN'].includes(params.get('locale'))) {
  locale = params.get('locale');
  $('#localeSelect').value = locale;
}
setStatus('Choose a photo or camera frame to begin.');
renderMeasurements();
