(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const dialog = $('#noticeDialog');
  const dialogTitle = $('#dialogTitle');
  const dialogText = $('#dialogText');
  const showDialog = (title, text) => {
    dialogTitle.textContent = title;
    dialogText.textContent = text;
    dialog.showModal();
  };

  const historyDialog = $('#historyDialog');
  const historyList = $('#historyList');
  const historyButton = $('#historyButton');
  const historyStatus = $('#historyStatus');
  const historyPreference = $('#historyEnabled');
  const historyStore = window.CalculationHistory;
  const historyToolNames = {
    'prototype.scenario-explorer': 'Scenario explorer',
    'prototype.camera-planar-measurement': 'Camera measurement demo',
  };
  function formatHistoryValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
  function formatHistoryFields(value) {
    if (Array.isArray(value)) return value.map(item => `${item.label || 'Value'}: ${formatHistoryValue(item.value)}`).join(' · ');
    if (!value || typeof value !== 'object') return formatHistoryValue(value);
    return Object.entries(value).map(([key, item]) => `${key}: ${formatHistoryValue(item)}`).join(' · ');
  }
  function updateHistoryCount() {
    const count = historyStore.list().length;
    $('#historyCount').textContent = String(count);
    historyButton.setAttribute('aria-label', `Calculation history, ${count} saved ${count === 1 ? 'entry' : 'entries'}`);
  }
  function renderHistory() {
    historyList.replaceChildren();
    const entries = historyStore.list();
    if (!entries.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'history-empty';
      emptyState.textContent = 'No saved runs yet. Complete a demo measurement or save a scenario example to see it here.';
      historyList.append(emptyState);
    }
    entries.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'history-item';
      const head = document.createElement('div');
      head.className = 'history-item-head';
      const title = document.createElement('h3');
      title.textContent = entry.title || historyToolNames[entry.toolId] || 'Saved calculation';
      const date = document.createElement('time');
      date.dateTime = entry.savedAt || '';
      date.textContent = entry.savedAt ? new Date(entry.savedAt).toLocaleString() : 'Saved on this device';
      head.append(title, date);
      const badge = document.createElement('span');
      badge.className = 'history-demo-badge';
      badge.textContent = entry.status === 'illustrative-demo' ? 'ILLUSTRATIVE DEMO' : 'SAVED RESULT';
      const inputs = document.createElement('p');
      inputs.className = 'history-fields';
      inputs.innerHTML = '<strong>Inputs</strong> ';
      inputs.append(document.createTextNode(formatHistoryFields(entry.inputs)));
      const result = document.createElement('p');
      result.className = 'history-result';
      result.innerHTML = '<strong>Saved answer</strong> ';
      const resultValue = entry.result && typeof entry.result === 'object'
        ? `${entry.result.label || 'Result'}: ${formatHistoryValue(entry.result.value)}`
        : formatHistoryValue(entry.result);
      result.append(document.createTextNode(resultValue));
      const note = document.createElement('p');
      note.className = 'history-note';
      note.textContent = entry.note || 'This entry is stored only in this browser on this device.';
      const actions = document.createElement('div');
      actions.className = 'history-item-actions';
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'history-restore';
      restore.textContent = 'Restore inputs';
      restore.addEventListener('click', () => restoreHistoryEntry(entry));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'history-delete';
      remove.textContent = 'Delete';
      remove.setAttribute('aria-label', `Delete ${title.textContent} history entry`);
      remove.addEventListener('click', () => {
        if (historyStore.remove(entry.id)) {
          renderHistory();
          updateHistoryCount();
          historyStatus.textContent = 'History entry deleted from this device.';
        } else {
          historyStatus.textContent = 'This browser could not delete the history entry.';
        }
      });
      actions.append(restore, remove);
      card.append(head, badge, inputs, result, note, actions);
      historyList.append(card);
    });
    historyPreference.checked = historyStore.isEnabled();
    updateHistoryCount();
  }
  function saveHistoryEntry(entry, statusElement) {
    const outcome = historyStore.record(entry);
    if (outcome.saved) {
      if (statusElement) statusElement.textContent = outcome.duplicate ? 'This exact run is already in history.' : 'Saved on this device.';
    } else if (statusElement) {
      statusElement.textContent = outcome.reason === 'paused'
        ? 'History saving is paused.'
        : outcome.reason === 'limit'
          ? 'History has 100 entries. Delete one before saving more.'
          : 'Could not save history in this browser.';
    }
    updateHistoryCount();
    return outcome;
  }
  function restoreHistoryEntry(entry) {
    if (entry.toolId === 'prototype.scenario-explorer') {
      range.value = String(entry.inputs.scenarioChange);
      updateScenarioDisplay();
      historyDialog.close();
      $('#workspace').scrollIntoView({ behavior: 'smooth' });
      showDialog('Scenario restored', 'The saved slider input and illustrative answer have been restored. This is a demo model, not a reviewed field calculation.');
      return;
    }
    if (entry.toolId === 'prototype.camera-planar-measurement') {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
        video.srcObject = null;
      }
      const restoredLength = Number(entry.inputs.referenceLength);
      knownDistance = Number.isFinite(restoredLength) && restoredLength > 0 ? restoredLength : 10;
      unitName = entry.inputs.referenceUnit || 'cm';
      calibration = null;
      calibrationPoints = [];
      measurementPoints = [];
      markMode = 'none';
      cameraView.classList.remove('marking');
      setCameraState('Saved values restored · recalibrate this view', 'demo');
      $('#scaleReadout').textContent = `${knownDistance} ${unitName} · reference length restored`;
      $('#distanceReadout').textContent = entry.result && typeof entry.result === 'object' ? formatHistoryValue(entry.result.value) : formatHistoryValue(entry.result);
      $('#qualityReadout').textContent = 'Historical demo estimate';
      showScanStatus('Saved numeric inputs and answer restored. Camera images and point marks were not saved; recalibrate before taking a new measurement.');
      historyDialog.close();
      $('#measure').scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }
  historyButton.addEventListener('click', () => {
    historyStatus.textContent = '';
    renderHistory();
    historyDialog.showModal();
  });
  $('#closeHistory').addEventListener('click', () => historyDialog.close());
  $('#doneHistory').addEventListener('click', () => historyDialog.close());
  $('#clearHistory').addEventListener('click', () => {
    if (historyStore.clear()) {
      renderHistory();
      historyStatus.textContent = 'All calculation history was deleted from this device.';
    } else {
      historyStatus.textContent = 'This browser could not clear its saved history.';
    }
  });
  historyPreference.addEventListener('change', () => {
    const saved = historyStore.setEnabled(historyPreference.checked);
    historyStatus.textContent = saved
      ? (historyPreference.checked ? 'New successful runs will be saved on this device.' : 'Saving is paused. Existing entries remain until you delete them.')
      : 'This browser could not update the history setting.';
  });
  window.addEventListener('storage', event => {
    if (event.key && event.key.startsWith('fieldwork.calculation-history.')) {
      updateHistoryCount();
      if (historyDialog.open) renderHistory();
    }
  });
  updateHistoryCount();

  // Local rules-based concept helper. No network or model call is made.
  const taskInput = $('#taskInput');
  const assistantResponse = $('#assistantResponse');
  const suggestions = [
    { terms: ['photo', 'camera', 'measure', 'dimension', 'size', 'length'], label: 'Camera measurement workspace', message: 'A measurement path looks relevant. Start with the camera demo, confirm a reference scale, then choose what you want to do with the dimension.' , link: '#measure' },
    { terms: ['compare', 'scenario', 'option', 'change', 'what if'], label: 'Scenario explorer', message: 'You want to compare possibilities. The scenario explorer is a good starting point; adjust one input at a time and review the assumptions.', link: '#workspace' },
    { terms: ['plan', 'steps', 'sequence', 'workflow', 'process'], label: 'Guided workspace', message: 'This sounds like a task with several steps. The workspace keeps each step editable and carries confirmed information forward.', link: '#workspace' },
    { terms: ['explain', 'learn', 'understand', 'why'], label: 'Field-aware guidance', message: 'A guided explanation may help. Choose a learning level below to see how the same workflow can be explained in different ways.', link: '.field-section' },
  ];
  function findTask() {
    const text = taskInput.value.trim().toLowerCase();
    if (!text) {
      assistantResponse.innerHTML = '<span class="sparkle">✳</span><span>Describe the task you have in mind, or choose one of the prompts.</span>';
      taskInput.focus();
      return;
    }
    const match = suggestions.find(item => item.terms.some(term => text.includes(term)));
    const suggestion = match || { label: 'Guided workspace', message: 'I can start with the guided workspace. The available prototype paths are camera measurement, step-by-step planning, scenario comparison, and field-aware explanations.', link: '#workspace' };
    assistantResponse.innerHTML = `<span class="sparkle">✳</span><span><strong>${suggestion.label}:</strong> ${suggestion.message} <a href="${suggestion.link}">Open path →</a><small class="prototype-tag">Local demo suggestion · no AI service connected</small></span>`;
  }
  $('#askButton').addEventListener('click', findTask);
  taskInput.addEventListener('keydown', event => { if (event.key === 'Enter') findTask(); });
  $$('.suggestions button').forEach(button => button.addEventListener('click', () => {
    taskInput.value = button.dataset.prompt;
    findTask();
  }));

  // A generic, calculator-free guided workflow shell.
  const steps = [
    { title: 'What are you starting with?', help: 'Choose how you want to provide information. This demo does not apply a field-specific formula.', html: '<div class="workflow-field"><select id="inputMode" aria-label="Starting information"><option>Enter a value</option><option>Use a confirmed camera measurement</option><option>Describe the task first</option></select><span class="unit">STEP INPUT</span></div>' },
    { title: 'What should happen next?', help: 'A real workflow would connect reviewed calculation methods here. For now, explore how steps and assumptions are carried forward.', html: '<div class="step-check"><input id="reviewChoice" type="checkbox"><label for="reviewChoice">I want to compare another option before reviewing the result.</label></div>' },
    { title: 'Review the handoff', help: 'A published workflow will include its method, sources, units, assumptions, and review status.', html: '<div class="step-check"><input id="confirmChoice" type="checkbox"><label for="confirmChoice">Show me the complete chain and what information came from me.</label></div>' },
  ];
  let stepIndex = 0;
  function renderStep() {
    const step = steps[stepIndex];
    $('#stepProgress').textContent = `STEP ${stepIndex + 1} OF ${steps.length}`;
    $('#progressBar').style.width = `${((stepIndex + 1) / steps.length) * 100}%`;
    $('#stepContent').innerHTML = `<div class="step-question">${step.title}</div><p class="step-help">${step.help}</p>${step.html}`;
    $('#backStep').disabled = stepIndex === 0;
    $('#backStep').style.opacity = stepIndex === 0 ? '.4' : '1';
    $('#nextStep').innerHTML = stepIndex === steps.length - 1 ? 'Review summary <span>→</span>' : 'Continue <span>→</span>';
  }
  $('#nextStep').addEventListener('click', () => {
    if (stepIndex < steps.length - 1) {
      stepIndex++;
      renderStep();
    } else {
      showDialog('Workflow summary', 'This concept shows how a real workflow could combine user-provided information, confirmed measurements, reviewed calculation methods, assumptions, and an exportable result. No field-specific calculation has been run.');
    }
  });
  $('#backStep').addEventListener('click', () => { if (stepIndex > 0) { stepIndex--; renderStep(); } });
  $('#resetWorkflow').addEventListener('click', () => { stepIndex = 0; renderStep(); });
  renderStep();

  // Generic scenario control demonstrates comparative interaction only.
  const range = $('#scenarioRange');
  const marker = $('#scenarioMarker');
  const dot = $('#scenarioDot');
  function updateScenarioDisplay() {
    const change = Number(range.value);
    const x = 75 + ((change + 40) / 100) * 350;
    const y = 98 - change * .65;
    $('#scenarioChange').textContent = `${change > 0 ? '+' : ''}${change}%`;
    $('#scenarioValue').textContent = String(100 + change);
    marker.setAttribute('x1', x); marker.setAttribute('x2', x);
    dot.setAttribute('cx', x); dot.setAttribute('cy', y);
    $('#chartScenarioLabel').setAttribute('x', Math.min(405, Math.max(370, x - 30)));
    $('#chartDesc').textContent = `Illustrative baseline index 100 and scenario index ${100 + change}, based on a fictional model.`;
  }
  range.addEventListener('input', updateScenarioDisplay);
  $('#saveScenario').addEventListener('click', () => {
    const change = Number(range.value);
    saveHistoryEntry({
      toolId: 'prototype.scenario-explorer',
      title: 'Scenario explorer',
      definitionVersion: 'illustrative-demo-1',
      status: 'illustrative-demo',
      inputs: { scenarioChange: change },
      result: { label: 'Scenario index', value: 100 + change },
      note: 'Illustrative demo only. This example does not apply a reviewed field calculation.',
    }, $('#scenarioHistoryStatus'));
  });

  // Camera session and editable two-point calibration/measurement overlays.
  const video = $('#cameraVideo');
  const cameraView = $('#cameraView');
  const empty = $('#cameraEmpty');
  const demoScene = $('#demoScene');
  const overlay = $('#measureOverlay');
  const scanStatus = $('#scanStatus');
  let mediaStream = null;
  let cameraMode = 'none';
  let markMode = 'none';
  let calibrationPoints = [];
  let measurementPoints = [];
  let calibration = null;
  let knownDistance = null;
  let unitName = 'cm';
  const showScanStatus = message => { scanStatus.textContent = message; scanStatus.classList.add('visible'); };
  function dimensions() {
    const rect = cameraView.getBoundingClientRect();
    overlay.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    overlay.setAttribute('preserveAspectRatio', 'none');
    return rect;
  }
  function paintPoints() {
    const rect = dimensions();
    const all = [...calibrationPoints, ...measurementPoints];
    let svg = '';
    const draw = (points, label, colorClass) => {
      if (!points.length) return;
      points.forEach(p => { svg += `<circle class="overlay-point ${colorClass}" cx="${p.x}" cy="${p.y}" r="7"/>`; });
      if (points.length === 2) {
        svg += `<line class="overlay-line ${colorClass}" x1="${points[0].x}" y1="${points[0].y}" x2="${points[1].x}" y2="${points[1].y}"/>`;
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2 - 10;
        svg += `<text class="overlay-label" x="${midX}" y="${midY}">${label}</text>`;
      }
    };
    draw(calibrationPoints, 'REFERENCE', 'reference-point');
    draw(measurementPoints, $('#distanceReadout').textContent === '—' ? 'MEASURE' : $('#distanceReadout').textContent, 'measure-point');
    overlay.innerHTML = svg;
  }
  function setCameraState(state, mode) {
    cameraMode = mode;
    empty.classList.add('hidden');
    video.classList.toggle('active', mode === 'camera');
    demoScene.classList.toggle('active', mode === 'demo');
    $('#cameraMode').textContent = mode === 'camera' ? 'LIVE CAMERA' : 'DEMO MODE';
    $('#cameraState').textContent = state;
    $('#cameraMode').className = `pill ${mode === 'demo' ? 'illustrative' : ''}`;
    paintPoints();
  }
  $('#startCamera').addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showDialog('Camera unavailable here', 'This browser or page context does not provide camera access. Try the demo scene or open this prototype from a secure local or hosted address.');
      return;
    }
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      video.srcObject = mediaStream;
      await video.play();
      setCameraState('Camera ready · no depth sensor connected', 'camera');
      showScanStatus('Camera preview is local. Add a known reference before converting pixels to dimensions.');
    } catch (error) {
      showDialog('Camera permission needed', 'Camera access was not started. Allow camera access in your browser settings and try again, or use the interactive demo scene. No image is uploaded by this prototype.');
    }
  });
  $('#useDemo').addEventListener('click', () => { setCameraState('Demo scene ready · choose two points', 'demo'); showScanStatus('Select “Set known reference” and click the two ends of the sample reference line.'); });
  function resetMarks() {
    calibrationPoints = []; measurementPoints = []; calibration = null; knownDistance = null;
    $('#scaleReadout').textContent = 'Not set'; $('#distanceReadout').textContent = '—'; $('#qualityReadout').textContent = 'Not assessed';
    paintPoints();
  }
  function activateMarkMode(mode) {
    if (cameraMode === 'none') {
      showDialog('Open a camera view first', 'Start the camera or choose the demo scene before placing measurement points.');
      return;
    }
    if (mode === 'calibrate') {
      const answer = prompt('Enter the known length between the two reference points (for example, 10):', String(knownDistance || 10));
      if (answer === null) return;
      const numeric = Number(answer);
      if (!Number.isFinite(numeric) || numeric <= 0) { showDialog('Check the reference length', 'Enter a positive number for the reference length.'); return; }
      const unit = prompt('Enter its unit (mm, cm, m, in, ft):', unitName || 'cm');
      if (unit === null || !unit.trim()) return;
      knownDistance = numeric; unitName = unit.trim(); calibrationPoints = []; calibration = null;
      $('#distanceReadout').textContent = '—'; $('#qualityReadout').textContent = 'Not assessed';
      markMode = 'calibrate'; cameraView.classList.add('marking');
      $('#scaleReadout').textContent = `${numeric} ${unitName} · mark 2 points`;
      showScanStatus('Click the two ends of your known reference. Put it on the same flat surface as the object.');
    } else {
      if (!calibration) { showDialog('Set a scale reference first', 'To estimate physical dimensions from image points, provide a known reference length and mark it in the view.'); return; }
      measurementPoints = []; markMode = 'measure'; cameraView.classList.add('marking');
      showScanStatus('Click two points to measure. This simple prototype assumes both points lie on the same plane as the reference.');
    }
  }
  $('#calibrateButton').addEventListener('click', () => activateMarkMode('calibrate'));
  $('#measureButton').addEventListener('click', () => activateMarkMode('measure'));
  cameraView.addEventListener('click', event => {
    if (!markMode) return;
    const rect = cameraView.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (markMode === 'calibrate') {
      calibrationPoints.push(point);
      if (calibrationPoints.length === 2) {
        const pixels = Math.hypot(calibrationPoints[1].x - calibrationPoints[0].x, calibrationPoints[1].y - calibrationPoints[0].y);
        if (pixels < 8) { calibrationPoints = []; showScanStatus('Those points are too close. Mark a longer reference.'); paintPoints(); return; }
        calibration = { pixels, distance: knownDistance, unit: unitName };
        $('#scaleReadout').textContent = `${knownDistance} ${unitName} · ${Math.round(pixels)} px`;
        $('#qualityReadout').textContent = 'Planar estimate';
        showScanStatus('Scale set. For this prototype, measurements are rough planar estimates only.');
        markMode = 'none'; cameraView.classList.remove('marking');
      }
    } else if (markMode === 'measure') {
      measurementPoints.push(point);
      if (measurementPoints.length === 2) {
        const pixels = Math.hypot(measurementPoints[1].x - measurementPoints[0].x, measurementPoints[1].y - measurementPoints[0].y);
        const value = (pixels / calibration.pixels) * calibration.distance;
        const rounded = Number(value.toPrecision(3));
        $('#distanceReadout').textContent = `${rounded} ${calibration.unit} (approx.)`;
        $('#qualityReadout').textContent = 'Low · demo calibration';
        showScanStatus('Approximate planar scaling only; no perspective correction or device depth data is used. Verify physically before relying on it.');
        saveHistoryEntry({
          toolId: 'prototype.camera-planar-measurement',
          title: 'Camera measurement demo',
          definitionVersion: 'illustrative-demo-1',
          status: 'illustrative-demo',
          inputs: {
            referenceLength: calibration.distance,
            referenceUnit: calibration.unit,
            referencePixels: calibration.pixels,
            measurementPixels: pixels,
            viewMode: cameraMode,
          },
          result: { label: 'Estimated measurement', value: `${rounded} ${calibration.unit} (approx.)` },
          note: 'Illustrative planar estimate. No image or camera frame was saved; recalibrate before measuring a new view.',
        }, $('#cameraHistoryStatus'));
        markMode = 'none'; cameraView.classList.remove('marking');
      }
    }
    paintPoints();
  });
  $('#clearMarks').addEventListener('click', () => { markMode = 'none'; cameraView.classList.remove('marking'); resetMarks(); showScanStatus('Points cleared.'); });
  $('#sendToWorkflow').addEventListener('click', () => {
    if ($('#distanceReadout').textContent === '—') {
      showDialog('No confirmed measurement yet', 'Open the demo scene, set a known reference length, and mark two measurement points. Then the confirmed value can be carried into the workspace.');
      return;
    }
    stepIndex = 0; renderStep(); $('#workspace').scrollIntoView({ behavior: 'smooth' });
    showDialog('Measurement ready to hand off', `${$('#distanceReadout').textContent} can be carried forward with its image source and planar-estimate limitation. A full workflow would keep the measurement provenance attached.`);
  });
  window.addEventListener('resize', () => { if (cameraMode !== 'none') paintPoints(); });
  window.addEventListener('beforeunload', () => { if (mediaStream) mediaStream.getTracks().forEach(track => track.stop()); });

  // Field-aware guidance adjusts explanations, never calculation methods.
  const roles = {
    learner: { icon: '✎', title: 'Build understanding as you go.', text: 'See what each input means, why a step is needed, and how the result connects to the idea.', points: ['Guided definitions', 'Expandable working', 'Try a practice scenario'] },
    professional: { icon: '⌘', title: 'Get the context you need to verify.', text: 'See units, method versions, assumptions, source references, and a concise handoff for review.', points: ['Provenance up front', 'Quick input validation', 'Export review notes'] },
    everyday: { icon: '⌂', title: 'Get a clear answer in plain language.', text: 'Follow short prompts, compare possibilities, and see what to check before acting on an estimate.', points: ['Plain-language prompts', 'Local units and terms', 'Easy scenario comparison'] },
  };
  $$('.role-option').forEach(button => button.addEventListener('click', () => {
    $$('.role-option').forEach(item => item.classList.toggle('active', item === button));
    const role = roles[button.dataset.role];
    $('#roleIcon').textContent = role.icon; $('#roleTitle').textContent = role.title; $('#roleDescription').textContent = role.text;
    $('#rolePoints').innerHTML = role.points.map(point => `<span>✓ ${point}</span>`).join('');
  }));

  // Interactive captioned demonstration with transcript.
  const demoSteps = [
    { title: 'Describe the task', caption: 'First, tell us what you want to do. The guide suggests a reviewed path and explains why.', visual: 'Describe the task' },
    { title: 'Confirm inputs and steps', caption: 'Next, confirm the information and see how each step connects. Edit or revisit a step whenever you need.', visual: 'Confirm inputs and steps' },
    { title: 'Review and export', caption: 'Finally, review the method, sources, assumptions, and limitations before exporting a traceable summary.', visual: 'Review and export' },
  ];
  let demoIndex = 0;
  function showDemoStep(index) {
    demoIndex = (index + demoSteps.length) % demoSteps.length;
    const step = demoSteps[demoIndex];
    $('#demoVisualStep').innerHTML = `<span class="demo-number">0${demoIndex + 1}</span><span>${step.visual}</span>`;
    $('#demoVisualStep').classList.add('visible'); $('#demoCaption').textContent = step.caption;
    $('#demoProgress').style.width = `${((demoIndex + 1) / demoSteps.length) * 100}%`;
    $('#demoTime').textContent = `${demoIndex + 1} / ${demoSteps.length}`;
    $$('.demo-step').forEach((button, i) => button.classList.toggle('active', i === demoIndex));
    $('#demoPlayMark').textContent = demoIndex === demoSteps.length - 1 ? '✓' : '▶';
  }
  $('#demoNext').addEventListener('click', () => showDemoStep(demoIndex + 1));
  $('#demoPlay').addEventListener('click', () => showDemoStep(demoIndex + 1));
  $('#demoPlayMark').addEventListener('click', () => showDemoStep(demoIndex + 1));
  $$('.demo-step').forEach(button => button.addEventListener('click', () => showDemoStep(Number(button.dataset.demoStep))));
  showDemoStep(0);

  function exportSummary() {
    const summary = [
      'FIELDWORK · PROTOTYPE SUMMARY',
      'Concept demonstration only — no reviewed field calculator was run.',
      '',
      `Task: ${taskInput.value.trim() || 'Not entered'}`,
      `Workspace step: ${stepIndex + 1} of ${steps.length}`,
      `Camera mode: ${cameraMode === 'none' ? 'Not used' : cameraMode}`,
      `Known scale: ${calibration ? `${knownDistance} ${unitName}` : 'Not set'}`,
      `Image measurement: ${$('#distanceReadout').textContent}`,
      `Limitations: ${calibration ? 'Low-confidence planar estimate; verify physically.' : 'No physical measurement.'}`,
      '',
      'A published calculation would include its reviewed method, source, version, assumptions and verification status.',
    ].join('\n');
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'fieldwork-prototype-summary.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('#exportButton').addEventListener('click', exportSummary);
  $('#privacyButton').addEventListener('click', () => showDialog('Private by default', 'Saved history stays in this browser on this device and can be paused or deleted from the History panel. Camera images and frames are never saved. The prototype does not connect an AI service or upload camera images.'));
  $('#provenanceButton').addEventListener('click', () => showDialog('Traceability is part of the result', 'A real published method should show its source, edition/version, assumptions, units, verification cases, reviewer status, and limitations. This prototype deliberately has no field-specific formula, so it shows the publish gate instead of a made-up citation.'));
  $('#closeDialog').addEventListener('click', () => dialog.close());
  $('#dialogOk').addEventListener('click', () => dialog.close());
})();
