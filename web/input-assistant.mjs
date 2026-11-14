import { createWorkflowHandoff, dimensionsEqual, executeCalculation, getUnit } from '../src/calculation-core/index.mjs';
import { configureNumericInput } from './numeric-input.mjs';
import { matchesSearchText } from './unified-search.mjs';

const number = (value, locale) => new Intl.NumberFormat(locale || 'en-US', { maximumFractionDigits: 6 }).format(value);
const words = value => new Set(String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter(word => word.length > 2));
const sharedWords = (left, right) => [...words(left)].filter(word => words(right).has(word)).length;

function scalarKind(field) {
  const text = `${field.id} ${field.label}`.toLowerCase();
  if (/amount|currency|price|cost|revenue|income|loan|debt|cash|payment|profit|principal|saving|sale|fee|budget|capital|commission|expenditure|expense|subtotal|tax amount|estimated tax/.test(text)) return 'money';
  if (/percent|percentage|ratio|fraction|rate|margin|share|yield|efficiency|utilization|tax rate/.test(text)) return 'ratio';
  if (/count|number of|items|people|workers|units|pixels|frames|tokens|requests|samples|steps|cycles|teeth|rows|columns/.test(text)) return 'count';
  if (/time|duration|period|years|months|seconds|minutes|hours/.test(text)) return 'time';
  return null;
}

function scalarSemanticsCompatible(output, input) {
  const hasPhysicalDimension = field => Object.values(field.dimension || {}).some(exponent => exponent !== 0);
  if (hasPhysicalDimension(output) || hasPhysicalDimension(input)) return true;
  const outputKind = scalarKind(output);
  const inputKind = scalarKind(input);
  if (outputKind && inputKind) return outputKind === inputKind;
  if (outputKind || inputKind) return sharedWords(`${output.id} ${output.label}`, `${input.id} ${input.label}`) > 0;
  return true;
}

function isMonetaryQuantity(definition, field) {
  if (Object.values(field.dimension || {}).some(exponent => exponent !== 0)) return false;
  const context = `${definition.category} ${definition.discipline} ${(definition.fields || []).join(' ')}`.toLowerCase();
  const financeContext = /finance|business|accounting|tax|money|budget|real estate|mortgage|household|travel|energy and household|economics/.test(context);
  return financeContext && /currency|amount|price|cost|revenue|income|loan|debt|cash|payment|profit|principal|saving|sale|fee|budget|capital|commission|expenditure|expense|subtotal|tax amount|fuel price|tariff/i.test(`${field.id} ${field.label} ${field.unitLabel || ''}`);
}

function element(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
}

function fieldGuidance(definition, field) {
  if (definition.id === 'lawn-seed-mass' && field.id === 'area') {
    return {
      title: 'What lawn area means',
      body: 'Lawn area is the ground surface you plan to seed. For a rectangular lawn, measure length and width and use the area calculator below. For an irregular shape, split it into simple sections and add their areas.',
      source: 'Use the same area for every section and check whether the seed label gives its rate per square meter, hectare, or another area unit.',
    };
  }
  if (definition.id === 'lawn-seed-mass' && field.id === 'sowing-rate') {
    return {
      title: 'Find the rate on the seed label',
      body: 'The sowing rate is the product maker’s recommended seed mass per unit of ground area. It is usually printed on the seed packaging or product sheet. Enter that stated rate; AuraCalc cannot choose a suitable rate for a seed type or lawn condition.',
      source: 'If the label uses g/m², kg/ha, lb/acre, or oz/yd², select that unit beside the input. The calculator converts it to kg/m² before multiplying by lawn area.',
    };
  }

  const unit = getUnit(field.canonicalUnit);
  const quantityName = field.unitLabel || unit.symbol;
  const label = field.label.toLowerCase();
  let source = 'Check the measuring instrument, product label, drawing, specification sheet, or source record that defines this quantity. Keep the original unit and select it before calculating.';
  if (/area|surface|floor|lawn|plan/.test(`${field.id} ${label}`)) source = 'Measure the boundary or dimensions of the surface. If it is made from regular shapes, use the matching geometry tool below and add the sections. Do not treat an irregular site estimate as a surveyed measurement.';
  else if (/rate|per |density|concentration|capacity|consumption/.test(`${field.id} ${label}`)) source = 'Look for the amount per unit, density, concentration, or rate on the relevant label, specification, measured sample, or record. Confirm that numerator and denominator use the same meaning as the displayed unit.';
  else if (/time|duration|period/.test(`${field.id} ${label}`)) source = 'Use a clock, timestamp, instrument record, or stated interval. Check whether the method asks for elapsed time, a repeating period, or calendar time.';
  else if (/length|width|height|depth|distance|diameter|radius|thickness/.test(`${field.id} ${label}`)) source = 'Measure the named dimension from the correct reference points using a ruler, tape, drawing, or specification. Check whether the method expects a horizontal, vertical, internal, or external measurement.';
  else if (field.dimension && Object.values(field.dimension).every(exponent => exponent === 0)) source = 'This is a plain number, count, percentage, or rate with no physical unit attached. Check the calculator’s formula and use the value from the record or decision you are analyzing.';
  return {
    title: `Understand ${field.label.toLowerCase()}`,
    body: `${field.label} is an input to “${definition.title}.” Its calculator unit is ${quantityName}. The result depends on using a value that matches this definition and unit.`,
    source,
  };
}

export class InputAssistant {
  constructor({
    calculators,
    loadConverters = async () => [],
    getLocale = () => 'en-US',
    getCurrencyCode = () => 'USD',
  }) {
    this.calculators = calculators;
    this.loadConverters = loadConverters;
    this.getLocale = getLocale;
    this.getCurrencyCode = getCurrencyCode;
    this.stack = [];
    this.counter = 0;
    this.dialog = null;
  }

  createDialog() {
    const dialog = element('dialog', 'input-assistant-dialog');
    dialog.setAttribute('aria-labelledby', 'inputAssistantTitle');
    dialog.setAttribute('data-lenis-prevent', '');
    const panel = element('div', 'input-assistant-panel');
    const header = element('header', 'input-assistant-header');
    const heading = element('div');
    heading.append(element('p', 'eyebrow', 'GUIDED INPUT · PRIVATE ON THIS DEVICE'));
    heading.append(element('h2', '', 'Find a value'));
    heading.lastElementChild.id = 'inputAssistantTitle';
    const close = element('button', 'input-assistant-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close value guide');
    close.addEventListener('click', () => dialog.close());
    header.append(heading, close);
    const body = element('div', 'input-assistant-body');
    panel.append(header, body);
    dialog.append(panel);
    dialog.addEventListener('close', () => {
      this.stack = [];
      body.replaceChildren();
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    document.body.append(dialog);
    this.body = body;
    return dialog;
  }

  createHelpButton(form, definition, field, { path = [definition.id], ownerScreen = null } = {}) {
    const button = element('button', 'input-help-link', 'Need help finding this value?');
    button.type = 'button';
    button.setAttribute('aria-label', `Get help finding ${field.label} for ${definition.title}`);
    button.addEventListener('click', () => this.openHelp({ form, definition, field, path, ownerScreen }));
    return button;
  }

  openHelp(destination) {
    this.ensureOpen();
    const screen = element('section', 'input-assistant-screen');
    if (destination.ownerScreen) {
      const back = element('button', 'input-assistant-back input-assistant-guidance-back', `← Back to ${destination.definition.title}`);
      back.type = 'button';
      back.addEventListener('click', () => this.returnToOwner(destination.ownerScreen));
      screen.append(back);
    }
    const guidance = fieldGuidance(destination.definition, destination.field);
    screen.append(element('p', 'input-assistant-eyebrow', `INPUT GUIDE · ${destination.definition.discipline}`));
    screen.append(element('h3', 'input-assistant-screen-title', guidance.title));
    screen.append(element('p', 'input-assistant-copy', guidance.body));
    screen.append(element('div', 'input-assistant-source', guidance.source));
    const tabs = element('div', 'input-assistant-tabs');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Choose help type');
    const calculatorsTab = element('button', 'input-assistant-tab active', 'Find a value');
    const convertersTab = element('button', 'input-assistant-tab', 'Convert a known value');
    for (const [button, selected] of [[calculatorsTab, true], [convertersTab, false]]) {
      button.type = 'button';
      button.setAttribute('aria-pressed', String(selected));
    }
    tabs.append(calculatorsTab, convertersTab);
    const content = element('div', 'input-assistant-choice-content');
    screen.append(tabs, content);

    let choiceRevision = 0;
    const renderChoices = async mode => {
      const revision = ++choiceRevision;
      const isConverter = mode === 'converter';
      content.replaceChildren();
      let candidates;
      if (isConverter) {
        const status = element('p', 'input-assistant-status', 'Loading unit conversions…');
        status.setAttribute('role', 'status');
        content.append(status);
        try {
          const converters = await this.loadConverters();
          if (revision !== choiceRevision || !screen.isConnected) return;
          candidates = this.getCompatibleConverters(destination, converters);
        } catch {
          status.textContent = 'Could not load conversions. Reconnect and choose this option again.';
          return;
        }
        content.replaceChildren();
      } else {
        candidates = this.getCompatibleTools(destination);
      }
      content.append(element('p', 'input-assistant-copy', isConverter
        ? 'A converter changes the units of a value you already know. It cannot find an unknown quantity such as velocity. For that, choose Find a value.'
        : 'Choose a formula calculator that can produce this kind of value. For example, velocity can be calculated from distance and elapsed time. If you are missing one of those inputs, open that calculator and ask for help again.'));
      const searchLabel = element('label', 'input-assistant-search-label', isConverter ? 'Search compatible unit conversions' : 'Find a calculator for this value');
      const search = element('input', 'input-assistant-search');
      search.type = 'search';
      search.placeholder = isConverter ? `Search ${candidates.length} conversions` : `Search ${candidates.length} calculators`;
      search.autocomplete = 'off';
      search.setAttribute('aria-label', searchLabel.textContent);
      const results = element('div', 'input-assistant-tools');
      const resultStatus = element('p', 'input-assistant-status');
      const renderMatches = () => {
        const query = search.value.trim().toLowerCase();
        const matches = (query
          ? candidates.filter(tool => matchesSearchText(`${tool.definition.title} ${tool.definition.discipline} ${tool.definition.category} ${tool.output.label} ${tool.definition.description}`, query))
          : candidates.slice(0, 18));
        results.replaceChildren();
        resultStatus.textContent = candidates.length
          ? (query ? `${matches.length} matching ${isConverter ? 'conversions' : 'calculators'}.` : `Showing ${matches.length} of ${candidates.length}. Search to narrow the list.`)
          : isConverter
            ? 'No converter in the registry changes this value into a compatible unit.'
            : 'No released calculator currently produces this type of value. Use the guidance above to find a measurement or source.';
        for (const candidate of matches) {
          const button = element('button', 'input-assistant-tool');
          button.type = 'button';
          const copy = element('span', 'input-assistant-tool-copy');
          copy.append(element('strong', '', candidate.definition.title));
          copy.append(element('small', '', `${candidate.output.label} · ${candidate.definition.category}`));
          button.append(copy, element('span', 'input-assistant-arrow', '↗'));
          button.addEventListener('click', () => this.openCalculator(candidate.definition, destination, [...destination.path, candidate.definition.id]));
          results.append(button);
        }
        if (query && !matches.length) results.append(element('p', 'input-assistant-empty', 'Try a different unit, calculator name, or topic.'));
      };
      search.addEventListener('input', renderMatches);
      renderMatches();
      content.append(searchLabel, search, resultStatus, results);
      content.append(element('p', 'input-assistant-footnote', isConverter
        ? 'Conversion preserves the measured quantity. Review the source and destination units before transferring the result.'
        : 'You choose the calculator and decide when to transfer its result. Filled values stay editable. This guide uses the local catalog; it sends no values to an AI service.'));
    };
    for (const [button, mode] of [[calculatorsTab, 'calculator'], [convertersTab, 'converter']]) {
      button.addEventListener('click', () => {
        for (const option of [calculatorsTab, convertersTab]) {
          option.classList.toggle('active', option === button);
          option.setAttribute('aria-pressed', String(option === button));
        }
        renderChoices(mode);
      });
    }
    renderChoices('calculator');
    this.push(screen);
    screen.querySelector('.input-assistant-search')?.focus();
  }

  getCompatibleTools(destination) {
    const targetUnit = getUnit(destination.field.canonicalUnit);
    const candidates = [];
    for (const definition of this.calculators) {
      if (destination.path.includes(definition.id)) continue;
      for (const output of definition.outputs) {
        if (!dimensionsEqual(output.dimension, destination.field.dimension)) continue;
        const outputUnit = getUnit(output.canonicalUnit);
        if (outputUnit.temperatureKind !== targetUnit.temperatureKind) continue;
        if (!scalarSemanticsCompatible(output, destination.field)) continue;
        const relatedness = sharedWords(`${destination.definition.title} ${destination.definition.category} ${destination.definition.discipline} ${destination.field.label}`, `${definition.title} ${definition.category} ${definition.discipline} ${output.label}`);
        candidates.push({ definition, output, score: relatedness });
      }
    }
    return candidates.sort((a, b) => b.score - a.score || a.definition.title.localeCompare(b.definition.title));
  }

  getCompatibleConverters(destination, converters) {
    const targetUnit = getUnit(destination.field.canonicalUnit);
    const candidates = [];
    for (const definition of converters) {
      for (const output of definition.outputs) {
        if (!dimensionsEqual(output.dimension, destination.field.dimension)) continue;
        if (getUnit(output.canonicalUnit).temperatureKind !== targetUnit.temperatureKind) continue;
        if (!scalarSemanticsCompatible(output, destination.field)) continue;
        const relatedness = sharedWords(`${destination.definition.title} ${destination.field.label}`, `${definition.title} ${definition.category} ${output.label}`);
        candidates.push({ definition, output, score: relatedness });
      }
    }
    return candidates.sort((a, b) => b.score - a.score || a.definition.title.localeCompare(b.definition.title));
  }

  openCalculator(definition, destination, path) {
    const screen = element('section', 'input-assistant-screen input-assistant-calculator');
    const top = element('div', 'input-assistant-tool-heading');
    const back = element('button', 'input-assistant-back', '← Back to guidance');
    back.type = 'button';
    back.addEventListener('click', () => this.popScreen(screen));
    top.append(back, element('span', 'input-assistant-badge', definition.discipline));
    screen.append(top, element('h3', 'input-assistant-screen-title', definition.title));
    screen.append(element('p', 'input-assistant-copy', definition.description));
    const form = element('form', 'input-assistant-form');
    const resultArea = element('section', 'input-assistant-result');
    resultArea.hidden = true;
    const fieldNodes = new Map();
    for (const field of definition.inputs) {
      const row = element('div', 'input-assistant-field');
      const id = `assistant-${++this.counter}-${field.id}`;
      const label = element('label', '', field.required === false ? `${field.label} (optional)` : field.label);
      label.htmlFor = id;
      const input = configureNumericInput(element('input'), { allowMagnitudeWords: field.allowMagnitudeWords === true });
      input.id = id;
      input.name = field.id;
      input.required = field.required !== false;
      input.placeholder = `Enter ${field.label.toLocaleLowerCase(this.getLocale())}`;
      input.setAttribute('aria-label', field.label);
      let unitControl = null;
      if (!field.unitLabel && field.acceptedUnits.length > 1) {
        unitControl = element('select');
        unitControl.name = `${field.id}-unit`;
        unitControl.setAttribute('aria-label', `${field.label} unit`);
        for (const unitId of field.acceptedUnits) {
          const option = element('option', '', `${getUnit(unitId).symbol} (${unitId})`);
          option.value = unitId;
          option.selected = unitId === field.canonicalUnit;
          unitControl.append(option);
        }
      } else if (field.unitLabel) {
        const unitLabel = isMonetaryQuantity(definition, field) ? `${field.unitLabel} · ${this.getCurrencyCode()}` : field.unitLabel;
        row.append(label, element('span', 'input-assistant-unit', unitLabel));
      }
      if (!field.unitLabel) row.append(label);
      const controls = element('div', 'input-assistant-controls');
      controls.append(input);
      if (unitControl) controls.append(unitControl);
      else if (!field.unitLabel) controls.append(element('span', 'input-assistant-unit', getUnit(field.canonicalUnit).symbol));
      row.append(controls);
      if (field.range?.min !== undefined || field.range?.max !== undefined) {
        const limits = [field.range.min !== undefined ? `Minimum ${number(field.range.min, this.getLocale())}` : '', field.range.max !== undefined ? `Maximum ${number(field.range.max, this.getLocale())}` : ''].filter(Boolean).join(' · ');
        row.append(element('small', 'input-assistant-hint', limits));
      }
      if (definition.catalogKind !== 'converter') {
        const help = this.createHelpButton(form, definition, field, { path, ownerScreen: screen });
        row.append(help);
      }
      form.append(row);
      fieldNodes.set(field.id, { input, unitControl });
    }
    const actions = element('div', 'input-assistant-actions');
    const calculate = element('button', 'input-assistant-calculate', 'Calculate value →');
    calculate.type = 'submit';
    const reset = element('button', 'input-assistant-reset', 'Clear');
    reset.type = 'reset';
    actions.append(calculate, reset);
    form.append(actions);
    form.addEventListener('input', () => { resultArea.hidden = true; resultArea.replaceChildren(); });
    form.addEventListener('reset', () => { resultArea.hidden = true; resultArea.replaceChildren(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const raw = {};
      for (const field of definition.inputs) {
        const controls = fieldNodes.get(field.id);
        raw[field.id] = { value: controls.input.value.trim(), unit: controls.unitControl?.value || field.canonicalUnit };
      }
      try {
        const result = executeCalculation(definition, raw, { locale: this.getLocale() });
        this.renderCandidateResult(resultArea, definition, result, destination);
      } catch (error) {
        resultArea.replaceChildren();
        resultArea.hidden = false;
        resultArea.append(element('p', 'input-assistant-error', error?.message || 'No result was produced. Check the values and try again.'));
      }
    });
    screen.append(form, resultArea);
    this.push(screen);
    form.querySelector('input')?.focus();
  }

  renderCandidateResult(container, definition, result, destination) {
    container.replaceChildren();
    container.hidden = false;
    container.append(element('p', 'input-assistant-result-label', definition.catalogKind === 'converter'
      ? 'CONVERTED · SAME QUANTITY, NEW UNIT'
      : 'CALCULATED · CHECK THE METHOD BEFORE TRANSFERRING'));
    for (const output of definition.outputs) {
      const record = result.outputs[output.id];
      const row = element('div', 'input-assistant-output');
      let value;
      if (isMonetaryQuantity(definition, output)) {
        try { value = new Intl.NumberFormat(this.getLocale(), { style: 'currency', currency: this.getCurrencyCode(), maximumFractionDigits: 6 }).format(record.value); }
        catch { value = `${number(record.value, this.getLocale())} ${this.getCurrencyCode()}`; }
      } else value = `${number(record.value, this.getLocale())} ${getUnit(record.unit).symbol}`;
      const copy = element('span', 'input-assistant-output-copy');
      copy.append(element('strong', '', output.label));
      copy.append(element('span', '', value));
      row.append(copy);
      const matching = dimensionsEqual(output.dimension, destination.field.dimension)
        && getUnit(record.unit).temperatureKind === getUnit(destination.field.canonicalUnit).temperatureKind
        && scalarSemanticsCompatible(output, destination.field);
      if (matching) {
        const transfer = element('button', 'input-assistant-transfer', `Use this for ${destination.field.label}`);
        transfer.type = 'button';
        transfer.addEventListener('click', () => this.transfer({ definition, result, outputId: output.id, destination }));
        row.append(transfer);
      }
      container.append(row);
    }
    const details = element('details', 'input-assistant-method');
    details.append(element('summary', '', 'Review formula and working'));
    details.append(element('p', '', definition.method.description));
    for (const step of result.intermediates?.steps || []) details.append(element('p', '', step));
    container.append(details);
    const source = definition.references?.[0];
    if (source) {
      const link = element('a', 'input-assistant-reference', `Source: ${source.citation} ↗`);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      container.append(link);
    }
  }

  transfer({ definition, result, outputId, destination }) {
    try {
      const handoff = createWorkflowHandoff({ sourceDefinition: definition, sourceResult: result, outputId, targetDefinition: destination.definition, inputId: destination.field.id });
      const { input, unitControl } = this.findTargetControls(destination);
      if (!input) throw new Error('The target input is no longer available. Close this guide and try again.');
      if (destination.field.integer && !Number.isInteger(handoff.value)) throw new Error(`This result is not a whole number and cannot fill ${destination.field.label}.`);
      if (destination.field.range?.min !== undefined && handoff.value < destination.field.range.min) throw new Error(`This value is below the minimum allowed for ${destination.field.label}.`);
      if (destination.field.range?.max !== undefined && handoff.value > destination.field.range.max) throw new Error(`This value is above the maximum allowed for ${destination.field.label}.`);
      input.value = String(handoff.value);
      if (unitControl) unitControl.value = handoff.unit;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      this.returnToOwner(destination.ownerScreen);
    } catch (error) {
      const active = this.stack.at(-1);
      if (active) active.append(element('p', 'input-assistant-error', error?.message || 'This value could not be transferred.'));
    }
  }

  findTargetControls(destination) {
    const input = destination.form.elements.namedItem(destination.field.id);
    const unitControl = destination.form.elements.namedItem(`${destination.field.id}-unit`);
    return { input, unitControl };
  }

  returnToOwner(ownerScreen) {
    if (!ownerScreen) {
      this.dialog.close();
      return;
    }
    const ownerIndex = this.stack.indexOf(ownerScreen);
    if (ownerIndex < 0) {
      this.dialog.close();
      return;
    }
    for (const screen of this.stack.slice(ownerIndex + 1)) screen.remove();
    this.stack = this.stack.slice(0, ownerIndex + 1);
    ownerScreen.hidden = false;
    this.body.scrollTop = 0;
    ownerScreen.querySelector('input:not([type=hidden])')?.focus();
  }

  ensureOpen() {
    this.dialog ??= this.createDialog();
    if (!this.dialog.open) this.dialog.showModal();
  }

  push(screen) {
    const active = this.stack.at(-1);
    if (active) active.hidden = true;
    this.stack.push(screen);
    this.body.append(screen);
    this.body.scrollTop = 0;
  }

  popScreen(screen) {
    const index = this.stack.indexOf(screen);
    if (index < 0) return;
    for (const item of this.stack.slice(index)) item.remove();
    this.stack = this.stack.slice(0, index);
    const previous = this.stack.at(-1);
    if (previous) {
      previous.hidden = false;
      this.body.scrollTop = 0;
      previous.querySelector('input:not([type=hidden])')?.focus();
    } else this.dialog.close();
  }
}
