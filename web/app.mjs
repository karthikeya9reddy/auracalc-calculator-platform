import { listPublicCalculators } from '/catalog/public/formulas.mjs';
import { connectFeedback } from './feedback-client.mjs';
import {
  BASE_DIMENSIONS,
  CalculationError,
  convertValue,
  createWorkflowHandoff,
  dimensionLabel,
  dimensionsEqual,
  executeCalculation,
  getUnit,
  listUnits,
  parseLocalizedNumber,
  UNIT_REGISTRY_VERSION,
} from '/src/calculation-core/index.mjs';
import {
  clearHistory,
  deleteHistoryRecord,
  exportFeedback,
  getHistory,
  historyEnabled,
  saveHistoryRecord,
  setHistoryEnabled,
} from './storage.mjs';
import { mountSponsoredPlacements } from './ads.mjs';
import { configureNumericInput } from './numeric-input.mjs';
import { numberToEnglishWords } from './number-words.mjs';
import { renderCalculationVisual } from './visual-system.mjs';
import { compatibleNextSteps, recommendNextSteps } from './next-step-engine.mjs';
import { InputAssistant } from './input-assistant.mjs';
import { createResultReport } from './result-report.mjs';
import { openResultReport } from './report-view.mjs';
import { formatResultNumber } from './result-number.mjs';
import { historyRecordUsable, historyRecordRoute } from './history-record.mjs';
import { attachConversionQuery } from './conversion-query.mjs';
import { outputConversionPayload } from './conversion-handoff.mjs';
import { makeSearchIndex, searchIndex, searchTokens, matchesSearchText } from './unified-search.mjs';

const calculators = listPublicCalculators();
const calculatorById = new Map(calculators.map(definition => [definition.id, definition]));
let converterCatalogRequest;
let converterById = new Map();

function loadConverters() {
  converterCatalogRequest ??= import('/catalog/public/converters.mjs')
    .then(({ listPublicConverters }) => {
      const converters = listPublicConverters();
      converterById = new Map(converters.map(definition => [definition.id, definition]));
      return converters;
    })
    .catch(error => {
      converterCatalogRequest = null;
      throw error;
    });
  return converterCatalogRequest;
}

function findTool(id) {
  return calculatorById.get(id) || converterById.get(id);
}

let inputAssistant;
const historyDialog = document.querySelector('#historyDialog');
const recordDialog = document.querySelector('#historyRecordDialog');
const toastElement = document.querySelector('#toast');
const DEFAULT_LOCALE = 'en-US';
const SUPPORTED_LOCALES = new Set(['en-US', 'en-GB', 'de-DE', 'fr-FR', 'hi-IN']);
const FALLBACK_CURRENCIES = ['USD','EUR','GBP','INR','CAD','AUD','JPY','CNY','CHF','NZD','SGD','HKD','KRW','BRL','MXN','ZAR','AED','SAR','TRY','SEK','NOK','DKK','PLN','THB','IDR','MYR','PHP','PKR','LKR','NPR','BDT','NGN','KES','EGP','ILS','TWD','RUB','VND','ARS','CLP','COP','PEN','CZK','HUF','RON','UAH'];
const CURRENCY_CODES = new Set(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : FALLBACK_CURRENCIES);
let locale = getInitialLocale();
let activeCurrencyCode = getInitialCurrencyCode();
let workflowContext = null;
let pendingHandoff = null;
let currentHistoryRecord = null;
let currentCalculation = null;
let toastTimer;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function getInitialLocale() {
  try {
    const stored = localStorage.getItem('nexora.locale.v1');
    if (SUPPORTED_LOCALES.has(stored)) return stored;
  } catch { /* Browser storage may be disabled. */ }
  const browserLocale = navigator.language;
  return SUPPORTED_LOCALES.has(browserLocale) ? browserLocale : DEFAULT_LOCALE;
}

function getInitialCurrencyCode() {
  try {
    const stored = localStorage.getItem('auracalc.currency.v1');
    if (CURRENCY_CODES.has(stored)) return stored;
  } catch { /* Browser storage may be disabled. */ }
  return ({ 'en-US': 'USD', 'en-GB': 'GBP', 'de-DE': 'EUR', 'fr-FR': 'EUR', 'hi-IN': 'INR' })[locale] || ({ 'en-US': 'USD', 'en-GB': 'GBP', 'de-DE': 'EUR', 'fr-FR': 'EUR', 'hi-IN': 'INR' })[navigator.language] || 'USD';
}

function hasPhysicalDimension(field) {
  return Object.values(field.dimension || {}).some(exponent => exponent !== 0);
}

function isMonetaryQuantity(definition, field) {
  if (hasPhysicalDimension(field)) return false;
  const context = `${definition.category} ${definition.discipline} ${(definition.fields || []).join(' ')}`.toLowerCase();
  const financeContext = /finance|business|accounting|tax|money|budget|real estate|mortgage|household|travel|energy and household|economics/.test(context);
  const fieldText = `${field.id} ${field.label} ${field.unitLabel || ''}`.toLowerCase();
  const moneyTerm = /currency|amount|price|cost|revenue|income|loan|debt|cash|payment|profit|principal|saving|sale|fee|budget|capital|commission|expenditure|expense|subtotal|tax amount|fuel price|tariff/.test(fieldText);
  return financeContext && moneyTerm;
}

function currencyDisplay(value, code = activeCurrencyCode) {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency: code, maximumFractionDigits: 6 }).format(value); }
  catch { return `${formatNumber(value)} ${code}`; }
}

function currencyName(code) {
  try { return `${code} · ${new Intl.DisplayNames([locale], { type: 'currency' }).of(code)}`; }
  catch { return code; }
}

function formatNumber(value, options = {}) {
  return formatResultNumber(value, locale, options);
}

function normaliseText(value) {
  return String(value || '').toLocaleLowerCase(locale).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function showToast(message) {
  if (!toastElement) return;
  toastElement.textContent = message;
  toastElement.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove('show'), 3200);
}

function safeStorageSet(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast('This browser could not save the workflow details. The calculation still works.');
    return false;
  }
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = node('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = node('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function calculatorPath(id) {
  if (converterById.has(id)) return `/converters/${encodeURIComponent(id)}/`;
  return `/calculators/${encodeURIComponent(id)}/`;
}

function setupLocaleControl() {
  const select = document.querySelector('#localeSelect');
  if (!select) return;
  select.value = locale;
  select.addEventListener('change', () => {
    if (!SUPPORTED_LOCALES.has(select.value)) return;
    locale = select.value;
    try { localStorage.setItem('nexora.locale.v1', locale); } catch { /* Optional preference. */ }
    document.dispatchEvent(new CustomEvent('nexora:locale-change'));
  });
}

function setupThemeControl() {
  const button = document.querySelector('#themeButton');
  if (!button) return;
  let theme = 'light';
  try { theme = localStorage.getItem('nexora.theme.v1') || 'light'; } catch { /* Optional preference. */ }
  document.body.dataset.theme = theme;
  button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  button.addEventListener('click', () => {
    theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = theme;
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    try { localStorage.setItem('nexora.theme.v1', theme); } catch { /* Optional preference. */ }
  });
}

function setupMobileMenu() {
  const button = document.querySelector('#mobileMenuButton');
  const menu = document.querySelector('#mobileMenu');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    menu.hidden = isOpen;
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

function setupGeneratedPageMenu() {
  const button = document.querySelector('#calculatorPageMenu');
  const menu = document.querySelector('#calculatorPageNavigation');
  if (!button || !menu) return;
  const closeMenu = () => {
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation menu');
    button.textContent = '☰';
  };
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu();
    else {
      menu.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close navigation menu');
      button.textContent = '×';
    }
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
}

function inputHelp(field) {
  const hints = [];
  if (field.required === false) hints.push('Optional — leave blank if this is the value you want to solve for');
  const rangeUnit = field.unitLabel || getUnit(field.range?.unit || field.canonicalUnit).symbol;
  if (field.range?.min !== undefined) hints.push(`Minimum ${formatNumber(field.range.min)} ${rangeUnit}`);
  if (field.range?.max !== undefined) hints.push(`Maximum ${formatNumber(field.range.max)} ${rangeUnit}`);
  if (field.integer) hints.push('Whole number');
  if (field.allowMagnitudeWords) hints.push('Scale words: thousand, million, billion, trillion, lakh, crore (or 5k)');
  return hints.join(' · ');
}

function buildQuantityControl(field, initial = undefined, definition, form) {
  const wrapper = node('div', 'quantity-control');
  const inputId = `input-${field.id}`;
  const label = node('label', '', field.required === false ? `${field.label} (optional)` : field.label);
  label.htmlFor = inputId;
  const input = configureNumericInput(node('input'), { allowMagnitudeWords: field.allowMagnitudeWords === true });
  input.id = inputId;
  input.name = field.id;
  input.required = field.required !== false;
  input.setAttribute('aria-describedby', `${inputId}-help`);
  input.setAttribute('data-field-id', field.id);
  if (initial && initial.value !== undefined) input.value = typeof initial.value === 'number'
    ? new Intl.NumberFormat(locale, { useGrouping: false, maximumSignificantDigits: 17 }).format(initial.value)
    : String(initial.value);
  let unitControl;
  if (field.unitLabel) {
    const currencyCode = form.elements.namedItem('display-currency')?.value || activeCurrencyCode;
    const unitLabel = isMonetaryQuantity(definition, field) ? `${field.unitLabel} · ${currencyCode}` : field.unitLabel;
    unitControl = node('span', 'quantity-unit-label', unitLabel);
    unitControl.setAttribute('aria-label', `${field.label}: ${unitLabel}`);
    if (isMonetaryQuantity(definition, field)) unitControl.dataset.moneyUnitField = field.id;
  } else {
    unitControl = node('select');
    unitControl.id = `unit-${field.id}`;
    unitControl.name = `${field.id}-unit`;
    unitControl.setAttribute('aria-label', `${field.label} unit`);
    for (const unitId of field.acceptedUnits) {
      const unit = getUnit(unitId);
      const option = node('option', '', `${unit.symbol} (${unit.id})`);
      option.value = unitId;
      option.selected = initial?.unit === unitId || (!initial?.unit && unitId === field.canonicalUnit);
      unitControl.append(option);
    }
  }
  wrapper.append(label, input, unitControl);
  const helpText = inputHelp(field) || `Canonical unit: ${getUnit(field.canonicalUnit).symbol}`;
  const guidanceRow = node('div', 'field-guidance-row');
  const guidance = node('small', 'field-help', helpText);
  guidance.id = `${inputId}-help`;
  guidanceRow.append(guidance);
  if (definition.catalogKind !== 'converter') {
    inputAssistant ??= new InputAssistant({
      calculators, loadConverters, getLocale: () => locale, getCurrencyCode: () => activeCurrencyCode,
    });
    guidanceRow.append(inputAssistant.createHelpButton(form, definition, field, { path: [definition.id] }));
  }
  wrapper.append(guidanceRow);
  return wrapper;
}

function buildCurrencyControl(definition) {
  const monetaryFields = [...definition.inputs, ...definition.outputs].filter(field => isMonetaryQuantity(definition, field));
  if (!monetaryFields.length) return null;
  const wrapper = node('div', 'currency-context-control');
  const copy = node('div', 'currency-context-copy');
  const label = node('label', '', 'Currency for this calculation');
  label.htmlFor = 'calculatorCurrency';
  copy.append(label, node('small', '', 'Use one currency for all money inputs in this run.'));
  const select = node('select');
  select.id = 'calculatorCurrency';
  select.name = 'display-currency';
  select.setAttribute('aria-label', 'Currency used for this calculation');
  const codes = [...CURRENCY_CODES];
  if (activeCurrencyCode && !CURRENCY_CODES.has(activeCurrencyCode)) codes.push(activeCurrencyCode);
  codes.sort((left, right) => left === activeCurrencyCode ? -1 : right === activeCurrencyCode ? 1 : currencyName(left).localeCompare(currencyName(right), locale));
  for (const code of codes) {
    const option = node('option', '', `${currencyName(code)} (${code})`);
    option.value = code;
    option.selected = code === activeCurrencyCode;
    select.append(option);
  }
  wrapper.append(copy, select, node('p', 'currency-context-note', 'All entered amounts are assumed to use this one currency and the same time basis. Selection only labels and formats values; it does not convert exchange rates, adjust for inflation, set local tax, or supply market prices.'));
  return wrapper;
}

function readRawInputs(form, definition) {
  const inputs = {};
  for (const field of definition.inputs) {
    const input = form.elements.namedItem(field.id);
    const unit = form.elements.namedItem(`${field.id}-unit`);
    inputs[field.id] = { value: input.value.trim(), unit: unit?.value || field.canonicalUnit };
  }
  return inputs;
}

function renderCalculatorPage(definition, runtime) {
  const restoration = takeSessionValue('nexora.restore.v1');
  const workflowPayload = takeSessionValue('nexora.pending-workflow.v1');
  const measurementPayload = takeSessionValue('auracalc.visual-measurement.v1');
  let restoredInputs = null;
  let restorationNotice = null;
  let pendingMeasurement = null;
  if (restoration?.calculatorId === definition.id) {
    restoredInputs = restoration.inputs;
    if (restoration.methodVersion && restoration.methodVersion !== definition.version) {
      restorationNotice = `Inputs restored from ${restoration.methodVersion}. This is a new run on method ${definition.version}; the saved result remains unchanged in history.`;
    }
  }
  if (workflowPayload?.handoff?.targetCalculatorId === definition.id) {
    pendingHandoff = workflowPayload.handoff;
    workflowContext = workflowPayload.context || null;
    const carriedCurrency = workflowContext?.currencyCode || pendingHandoff.currencyCode;
    if (CURRENCY_CODES.has(carriedCurrency)) activeCurrencyCode = carriedCurrency;
    restoredInputs = { ...(restoredInputs || {}), [pendingHandoff.targetInputId]: { value: pendingHandoff.value, unit: pendingHandoff.unit } };
  }
  if (measurementPayload?.calculatorId === definition.id && Number.isFinite(Number(measurementPayload.value))) {
    const inputField = definition.inputs.find(field => field.id === measurementPayload.inputId);
    const sourceUnit = (() => { try { return getUnit(measurementPayload.unit); } catch { return null; } })();
    const targetUnit = inputField && getUnit(inputField.canonicalUnit);
    if (inputField && sourceUnit && targetUnit && dimensionsEqual(sourceUnit.dimension, targetUnit.dimension)) {
      try {
        const carriedValue = convertValue(Number(measurementPayload.value), measurementPayload.unit, inputField.canonicalUnit);
        restoredInputs = { ...(restoredInputs || {}), [inputField.id]: { value: carriedValue, unit: inputField.canonicalUnit } };
        pendingMeasurement = { source: 'Visual Measurement Lab', method: String(measurementPayload.method || 'Photo-based estimate from a known reference and user-marked points.'), measuredAt: measurementPayload.measuredAt || null };
        workflowContext = { ...(workflowContext || {}), visualMeasurement: pendingMeasurement };
      } catch { /* Ignore invalid or incompatible measurement payloads and keep the calculator usable. */ }
    }
  }

  runtime.replaceChildren();
  const formCard = node('section', 'calculator-form-card');
  const formHeading = node('div', 'runtime-card-heading');
  const headingCopy = node('div');
  headingCopy.append(node('h2', '', 'Your inputs'), node('p', '', `Enter values and choose a unit for each quantity. Number format: ${locale}.`));
  formHeading.append(headingCopy, node('span', 'risk-label', `${definition.riskClass} · ${definition.release.status.toUpperCase()}`));
  formCard.append(formHeading);

  if (workflowContext?.steps?.length) {
    const workflowNote = node('div', 'workflow-provenance', `Workflow in progress · ${workflowContext.steps.length} completed step${workflowContext.steps.length === 1 ? '' : 's'}. Carried values remain editable.`);
    formCard.append(workflowNote);
  }
  if (pendingHandoff) {
    const source = pendingHandoff.source;
    const carriedCurrency = pendingHandoff.currencyCode ? ` · ${pendingHandoff.currencyCode}` : '';
    const handoffBanner = node('div', 'workflow-provenance', `Filled from ${findTool(source.calculatorId)?.title || source.calculatorId} · ${formatNumber(pendingHandoff.value)} ${getUnit(pendingHandoff.unit).symbol}${carriedCurrency}. Check or edit this value before continuing.`);
    formCard.append(handoffBanner);
  }
  if (pendingMeasurement) {
    const measurementBanner = node('div', 'workflow-provenance visual-measurement-provenance', `Filled from ${pendingMeasurement.source}. ${pendingMeasurement.method} Check or edit this estimate before calculating.`);
    formCard.append(measurementBanner);
  }

  const form = node('form', 'calculator-form');
  form.noValidate = true;
  const currencyControl = buildCurrencyControl(definition);
  if (currencyControl) form.append(currencyControl);
  for (const field of definition.inputs) form.append(buildQuantityControl(field, restoredInputs?.[field.id], definition, form));
  const updateCurrencyLabels = () => {
    const currencyCode = currencyControl?.querySelector('select')?.value || activeCurrencyCode;
    form.querySelectorAll('[data-money-unit-field]').forEach(unit => {
      const field = definition.inputs.find(item => item.id === unit.dataset.moneyUnitField);
      if (!field) return;
      unit.textContent = `${field.unitLabel} · ${currencyCode}`;
      unit.setAttribute('aria-label', `${field.label}: ${field.unitLabel} · ${currencyCode}`);
    });
  };
  updateCurrencyLabels();
  const actions = node('div', 'form-actions');
  const calculate = node('button', 'button button-primary', 'Calculate result');
  calculate.type = 'submit';
  const clear = node('button', 'button button-quiet', 'Clear inputs');
  clear.type = 'reset';
  actions.append(calculate, clear);
  if (workflowContext?.steps?.length || pendingHandoff || pendingMeasurement) {
    const clearWorkflow = node('button', 'button button-quiet', 'Clear workflow');
    clearWorkflow.type = 'button';
    clearWorkflow.addEventListener('click', () => {
      workflowContext = null;
      pendingHandoff = null;
      renderCalculatorPage(definition, runtime);
    });
    actions.append(clearWorkflow);
  }
  const error = node('p', 'calculation-error');
  error.hidden = true;
  error.setAttribute('role', 'alert');
  form.append(actions, error);
  formCard.append(form);

  const resultCard = node('section', 'result-card');
  resultCard.setAttribute('aria-live', 'polite');
  resultCard.setAttribute('aria-label', 'Calculation result');
  resultCard.append(renderEmptyResult());
  runtime.append(formCard, resultCard);

  const clearFieldError = () => {
    const invalid = form.querySelector('[aria-invalid="true"]');
    if (!invalid) return;
    invalid.removeAttribute('aria-invalid');
    invalid.setAttribute('aria-describedby', `${invalid.id}-help`);
    invalid.parentElement.querySelector('.field-error')?.remove();
  };
  form.addEventListener('input', event => {
    if (event.target.getAttribute('aria-invalid') !== 'true') return;
    clearFieldError();
    error.hidden = true;
  });
  form.addEventListener('reset', () => {
    clearFieldError();
    error.hidden = true;
    currentCalculation = null;
    pendingHandoff = null;
    resultCard.replaceChildren(renderEmptyResult());
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearFieldError();
    error.hidden = true;
    const rawInputs = readRawInputs(form, definition);
    try {
      const result = executeCalculation(definition, rawInputs, { locale });
      const currencyCode = currencyControl?.querySelector('select')?.value || activeCurrencyCode;
      currentCalculation = { definition, result, rawInputs, handoff: pendingHandoff, workflowContext, currencyCode };
      const currentStep = { calculatorId: definition.id, methodVersion: definition.version, inputs: rawInputs, result };
      const steps = workflowContext?.steps ? [...workflowContext.steps] : [];
      if (steps.at(-1)?.calculatorId === definition.id) steps[steps.length - 1] = currentStep;
      else steps.push(currentStep);
      workflowContext = { ...(workflowContext || {}), steps, ...(currencyControl ? { currencyCode } : workflowContext?.currencyCode ? { currencyCode: workflowContext.currencyCode } : {}) };
      currentCalculation.workflowContext = workflowContext;
      renderCalculationResult(definition, result, rawInputs, resultCard, pendingHandoff, workflowContext);
      resultCard.tabIndex = -1;
      resultCard.focus({ preventScroll: true });
      const bounds = resultCard.getBoundingClientRect();
      if (bounds.top < 100 || bounds.top > innerHeight - 160) {
        resultCard.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      }
    } catch (calculationError) {
      currentCalculation = null;
      const message = calculationError instanceof CalculationError
        ? calculationError.message
        : 'This input could not be processed. Check the values and try again.';
      const field = form.elements.namedItem(calculationError?.details?.fieldId || '');
      error.replaceChildren();
      if (field instanceof HTMLInputElement && field.hasAttribute('data-field-id')) {
        const inline = node('p', 'field-error', message);
        inline.id = `${field.id}-error`;
        field.parentElement.append(inline);
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${field.id}-help ${inline.id}`);
        const link = node('a', '', message);
        link.href = `#${field.id}`;
        link.addEventListener('click', event => {
          event.preventDefault();
          field.focus();
        });
        error.append(link);
      } else error.textContent = message;
      error.hidden = false;
      error.tabIndex = -1;
      error.focus({ preventScroll: true });
      error.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      resultCard.replaceChildren(renderEmptyResult('No result was produced. Fix the issue above and calculate again.'));
    }
  });
  if (currencyControl) {
    const select = currencyControl.querySelector('select');
    select.addEventListener('change', () => {
      activeCurrencyCode = select.value;
      try { localStorage.setItem('auracalc.currency.v1', activeCurrencyCode); } catch { /* Keep the current choice for this page. */ }
      updateCurrencyLabels();
      if (currentCalculation?.definition.id === definition.id) {
        currentCalculation.currencyCode = activeCurrencyCode;
        workflowContext = { ...(workflowContext || {}), currencyCode: activeCurrencyCode };
        currentCalculation.workflowContext = workflowContext;
        renderCalculationResult(definition, currentCalculation.result, currentCalculation.rawInputs, resultCard, currentCalculation.handoff, workflowContext);
      }
    });
  }
  if (restoredInputs) showToast(restorationNotice || (restoration ? 'Inputs restored. Recalculate to create a new result.' : 'A workflow value was carried forward. Review it, then calculate.'));
}

function takeSessionValue(key) {
  try {
    const value = sessionStorage.getItem(key);
    if (!value) return null;
    sessionStorage.removeItem(key);
    return JSON.parse(value);
  } catch { return null; }
}

function renderEmptyResult(message = 'Your result and its method will appear here.') {
  const empty = node('div', 'result-empty');
  empty.append(node('span', 'result-empty-icon', '∑'), node('strong', '', 'Ready when you are'), node('p', '', message));
  return empty;
}

function formatOutput(definition, outputField, outputRecord, unitId = outputRecord.unit, currencyCode = activeCurrencyCode) {
  if (outputField.display?.format === 'percent') {
    return `${formatNumber(outputRecord.value * 100)}%`;
  }
  if (outputField.display?.format === 'scalar') return formatNumber(outputRecord.value);
  const value = unitId === outputRecord.unit ? outputRecord.value : convertValue(outputRecord.value, outputRecord.unit, unitId);
  if (isMonetaryQuantity(definition, outputField) && outputRecord.unit === '1') return currencyDisplay(value, currencyCode);
  return `${formatNumber(value)} ${getUnit(unitId).symbol}`;
}

function numericOutput(outputField, outputRecord, unitId = outputRecord.unit) {
  if (outputField.display?.format === 'percent') return outputRecord.value * 100;
  if (outputField.display?.format === 'scalar') return outputRecord.value;
  return unitId === outputRecord.unit ? outputRecord.value : convertValue(outputRecord.value, outputRecord.unit, unitId);
}

function renderOutputRow(definition, outputField, result, primary, selectedUnits, currencyCode = activeCurrencyCode) {
  const record = result.outputs[outputField.id];
  const preferredUnit = selectedUnits[outputField.id] || outputField.canonicalUnit;
  const row = node('div', primary ? 'result-main' : 'result-subitem');
  row.append(node('span', primary ? 'result-main-label' : '', outputField.label));
  const value = node('strong', '', formatOutput(definition, outputField, record, preferredUnit, currencyCode));
  row.append(value);
  const words = node('small', 'result-in-words');
  const updateWords = unitId => {
    const spelling = numberToEnglishWords(numericOutput(outputField, record, unitId));
    words.textContent = spelling ? `In English words: ${spelling}${isMonetaryQuantity(definition, outputField) ? ` (${currencyCode})` : ''}` : '';
    words.hidden = !spelling;
  };
  updateWords(preferredUnit);
  row.append(words);
  if (outputField.acceptedUnits.length > 1 && !outputField.display?.format) {
    const control = node('div', 'output-unit-control');
    const label = node('label', '', 'Display unit');
    const select = node('select');
    select.setAttribute('aria-label', `${outputField.label} display unit`);
    for (const unitId of outputField.acceptedUnits) {
      const option = node('option', '', `${getUnit(unitId).symbol} (${unitId})`);
      option.value = unitId;
      option.selected = unitId === preferredUnit;
      select.append(option);
    }
    select.addEventListener('change', () => {
      selectedUnits[outputField.id] = select.value;
      value.textContent = formatOutput(definition, outputField, record, select.value, currencyCode);
      updateWords(select.value);
    });
    control.append(label, select);
    row.append(control);
  }
  return row;
}

function renderCalculationResult(definition, result, rawInputs, resultCard, handoff, context) {
  const currencyCode = context?.currencyCode || activeCurrencyCode;
  const selectedUnits = {};
  resultCard.replaceChildren();
  resultCard.append(node('div', 'result-ready-label', '✓ Calculation complete'));
  const outputs = definition.outputs;
  if (outputs[0]) resultCard.append(renderOutputRow(definition, outputs[0], result, true, selectedUnits, currencyCode));
  if (outputs.length > 1) {
    const subgrid = node('div', 'result-subgrid');
    for (const outputField of outputs.slice(1)) subgrid.append(renderOutputRow(definition, outputField, result, false, selectedUnits, currencyCode));
    resultCard.append(subgrid);
  }
  const answerEnd = resultCard.lastElementChild;
  const visual = renderCalculationVisual(definition, result, locale);
  if (visual) resultCard.append(visual);
  if (handoff) {
    const sourceTitle = findTool(handoff.source.calculatorId)?.title || handoff.source.calculatorId;
    resultCard.append(node('div', 'workflow-provenance', `This step used a value from ${sourceTitle} (${handoff.source.methodVersion}). The workflow record is saved with this result.`));
  }
  for (const warning of result.warnings) resultCard.append(node('p', 'result-warnings', warning));

  const everyCompatibleStep = compatibleNextSteps(definition, result, calculators);
  const recommendations = recommendNextSteps(definition, result, calculators, everyCompatibleStep);
  if (recommendations.length) {
    const nextSteps = node('section', 'smart-next-steps');
    nextSteps.setAttribute('aria-label', 'Suggested next calculations');
    nextSteps.append(node('span', 'eyebrow', 'SMART NEXT STEP'), node('h3', '', 'Where this result can take you next'));
    nextSteps.append(renderHandoffOptions(recommendations, definition, result, rawInputs, context));
    const visibleCompatibleCount = recommendations.filter(option => option.handoff).length;
    if (everyCompatibleStep.length > visibleCompatibleCount) {
      nextSteps.append(renderHandoffChooser(everyCompatibleStep, definition, result, rawInputs, context));
    }
    resultCard.append(nextSteps);
  }

  const actions = node('div', 'result-actions');
  const save = node('button', 'button button-secondary', 'Save to history');
  save.type = 'button';
  save.addEventListener('click', () => saveCalculationToHistory(definition, result, rawInputs, context, handoff));
  const reportOptions = () => ({
    definition, result, currencyCode: context?.currencyCode,
    unitSymbol: id => { try { return getUnit(id).symbol; } catch { return id || ''; } },
    formatOutput: (field, record) => formatOutput(definition, field, record, selectedUnits[field.id] || record.unit, currencyCode),
  });
  const print = node('button', 'button button-secondary', 'Print / PDF');
  print.type = 'button';
  print.addEventListener('click', () => { if (!openResultReport(reportOptions())) showToast('Allow a new tab for the report, or download the text version.'); });
  const copy = node('button', 'button button-quiet', 'Copy answer');
  copy.type = 'button';
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(definition.outputs.map(field => `${field.label}: ${reportOptions().formatOutput(field, result.outputs[field.id])}`).join('\n')); showToast('Answer copied with its units.'); }
    catch { showToast('Copy is unavailable. You can download the report instead.'); }
  });
  const exportButton = node('button', 'button button-quiet', 'Download text');
  exportButton.type = 'button';
  exportButton.addEventListener('click', () => downloadText(`${definition.id}-${new Date(result.calculatedAt).toISOString().slice(0, 10)}.txt`, createResultReport(reportOptions())));
  const report = node('a', 'button button-quiet', 'Report an issue');
  report.href = `/?feedback=calculation&calculator=${encodeURIComponent(definition.id)}#feedback`;
  actions.append(save, print, copy, exportButton, report);
  resultCard.insertBefore(actions, answerEnd.nextSibling);

  if (definition.catalogKind !== 'converter') {
    const options = definition.outputs.map(field => ({ field, payload: outputConversionPayload(result.outputs[field.id], definition.title, field.label) })).filter(item => item.payload);
    if (options.length) {
      const conversion = node('div', 'result-conversion');
      conversion.append(node('strong', '', 'Need this in another unit?'));
      for (const { field, payload } of options) {
        const link = node('button', 'button button-secondary', `Convert ${field.label.toLowerCase()} ↗`);
        link.type = 'button';
        link.addEventListener('click', () => { try { if (safeStorageSet(sessionStorage, 'auracalc.convert-output.v1', payload)) location.href = '/converters/'; } catch { showToast('This browser cannot transfer the result. Please enter it in the converter.'); } });
        conversion.append(link);
      }
      resultCard.append(conversion);
    }
    const money = definition.outputs.filter(field => isMonetaryQuantity(definition, field) && result.outputs[field.id]?.unit === '1' && !/\bper\b|\/|ratio|rate|fraction/i.test(`${field.label} ${field.unitLabel || ''}`));
    if (money.length) {
      const exchange = node('div', 'result-conversion');
      exchange.append(node('strong', '', 'Convert this currency?'));
      for (const field of money) {
        const button = node('button', 'button button-secondary', `Exchange ${field.label.toLowerCase()} ↗`); button.type = 'button';
        button.addEventListener('click', () => { try { if (safeStorageSet(sessionStorage, 'auracalc.exchange-output.v1', { value: result.outputs[field.id].value, currency: currencyCode, title: definition.title, label: field.label })) location.href = '/currency/'; } catch { showToast('This browser cannot transfer the result. Please enter it in the currency converter.'); } });
        exchange.append(button);
      }
      resultCard.append(exchange);
    }
  }

  const details = node('div', 'result-details');
  details.append(makeDetails('Method and working', detailMethod(definition, result)));
  details.append(makeDetails('Assumptions and limits', detailLimitations(definition)));
  details.append(makeDetails('Sources and review', detailSources(definition, result)));
  resultCard.append(details);
}

function makeDetails(title, content) {
  const details = node('details');
  const summary = node('summary', '', title);
  details.append(summary, content);
  return details;
}

function detailMethod(definition, result) {
  const wrapper = node('div', 'details-copy');
  wrapper.append(node('p', '', definition.method.description));
  wrapper.append(node('p', '', `Method version ${definition.version}; unit registry ${result.unitRegistryVersion}.`));
  const known = node('ul', 'intermediate-list');
  for (const field of definition.inputs) {
    const input = result.inputs[field.id];
    if (!input) continue;
    const entered = input.enteredText ?? formatNumber(input.enteredValue);
    const enteredUnit = field.unitLabel || getUnit(input.enteredUnit).symbol;
    let description = `${field.label}: ${entered} ${enteredUnit}`;
    if (input.enteredText && input.enteredText.trim() !== String(input.enteredValue)) {
      description += ` (parsed as ${formatNumber(input.enteredValue)})`;
    }
    if (input.enteredUnit !== input.canonicalUnit || input.enteredValue !== input.canonicalValue) {
      description += ` → ${formatNumber(input.canonicalValue)} ${getUnit(input.canonicalUnit).symbol} after unit normalization`;
    }
    known.append(node('li', '', description));
  }
  if (known.childElementCount) {
    wrapper.append(node('strong', '', 'Given values'));
    wrapper.append(known);
  }
  const steps = result.intermediates?.steps;
  if (Array.isArray(steps) && steps.length) {
    wrapper.append(node('strong', '', 'Working steps'));
    const ordered = node('ol', 'intermediate-list');
    for (const step of steps) ordered.append(node('li', '', step));
    wrapper.append(ordered);
  }
  const list = node('ul', 'intermediate-list');
  list.append(node('li', '', `Numeric model: ${definition.precision.numericModel}.`));
  if (result.intermediates && typeof result.intermediates === 'object') {
    for (const [key, value] of Object.entries(result.intermediates)) {
      if (key === 'formula' || key === 'steps') continue;
      if (typeof value === 'object' && value !== null) continue;
      list.append(node('li', '', `${key}: ${typeof value === 'number' ? formatNumber(value) : String(value)}`));
    }
  }
  if (list.childElementCount) wrapper.append(list);
  return wrapper;
}

function detailLimitations(definition) {
  const wrapper = node('div', 'details-copy');
  for (const label of ['assumptions', 'exclusions', 'limitations', 'warnings']) {
    const entries = definition[label] || [];
    if (!entries.length) continue;
    wrapper.append(node('strong', '', `${label[0].toUpperCase()}${label.slice(1)}`));
    const list = node('ul', 'intermediate-list');
    for (const entry of entries) list.append(node('li', '', entry));
    wrapper.append(list);
  }
  return wrapper;
}

function detailSources(definition, result) {
  const wrapper = node('div', 'details-copy');
  wrapper.append(node('p', '', `Risk class ${result.provenance.riskClass}; release status ${result.provenance.releaseStatus}.`));
  const list = node('ul', 'intermediate-list');
  for (const reference of definition.references) {
    const item = node('li');
    if (reference.url) {
      const link = node('a', '', reference.citation);
      link.href = reference.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      item.append(link);
    } else item.textContent = reference.citation;
    list.append(item);
  }
  wrapper.append(list);
  wrapper.append(node('p', '', `Verification record: ${definition.release.evidenceIds.join(', ')}. Review record: ${definition.release.reviewers.map(item => item.qualification).join('; ')}.`));
  return wrapper;
}

function renderHandoffOptions(options, sourceDefinition, sourceResult, rawInputs, context) {
  const wrapper = node('div', 'details-copy');
  wrapper.append(node('p', '', 'Choose a compatible next step. Carried inputs remain editable and the original method version is retained.'));
  const list = node('div', 'handoff-list');
  for (const option of options) {
    const button = node('button', 'handoff-button');
    button.type = 'button';
    const copy = node('span', 'handoff-copy');
    copy.append(node('strong', '', option.handoff ? `Use ${option.outputField.label} in ${option.targetDefinition.title}` : `Explore ${option.targetDefinition.title}`));
    copy.append(node('small', '', option.handoff ? `${option.reason} The value will be filled into “${option.inputField.label}”; review or edit it before calculating.` : `${option.reason} Choose it freely; the previous value will not be inserted.`));
    button.append(copy, node('span', 'handoff-arrow', '→'));
    button.addEventListener('click', () => {
      if (option.handoff) startWorkflowHandoff(option, sourceDefinition, sourceResult, rawInputs, context);
      else location.href = calculatorPath(option.targetDefinition.id);
    });
    list.append(button);
  }
  wrapper.append(list);
  return wrapper;
}

function renderHandoffChooser(options, sourceDefinition, sourceResult, rawInputs, context) {
  const details = node('details', 'handoff-chooser');
  const toolCount = new Set(options.map(option => option.targetDefinition.id)).size;
  details.append(node('summary', '', `Browse ${options.length} compatible input matches across ${toolCount} calculators`));
  const content = node('div', 'handoff-chooser-content');
  content.append(node('p', '', 'Pick the calculator and input that fit your next question. The selected result is carried into that input; you can review or change it before calculating.'));
  const search = node('input', 'handoff-search');
  search.type = 'search';
  search.placeholder = 'Filter compatible calculators';
  search.setAttribute('aria-label', 'Filter compatible calculators');
  const select = node('select', 'handoff-select');
  select.setAttribute('aria-label', 'Choose a calculator and input for this result');
  select.append(new Option('Choose a compatible next step…', ''));
  const groups = new Map();
  options.forEach((option, index) => {
    const category = option.targetDefinition.category || option.targetDefinition.discipline;
    if (!groups.has(category)) {
      const group = document.createElement('optgroup');
      group.label = category;
      groups.set(category, group);
      select.append(group);
    }
    const element = new Option(`${option.targetDefinition.title} · ${option.inputField.label} ← ${option.outputField.label}`, String(index));
    element.dataset.search = `${option.targetDefinition.title} ${option.targetDefinition.discipline} ${option.targetDefinition.fields.join(' ')} ${option.inputField.label} ${option.outputField.label}`.toLowerCase();
    groups.get(category).append(element);
  });
  const rationale = node('p', 'handoff-selected-reason', 'Choose a step to see why it may help.');
  const carry = node('button', 'button button-primary handoff-carry', 'Use this value →');
  carry.type = 'button';
  carry.disabled = true;
  search.addEventListener('input', () => {
    const query = search.value.toLowerCase().trim();
    for (const option of select.querySelectorAll('option[data-search]')) option.hidden = Boolean(query) && !matchesSearchText(option.dataset.search, query);
    for (const group of select.querySelectorAll('optgroup')) group.hidden = !group.querySelector('option:not([hidden])');
  });
  select.addEventListener('change', () => {
    const option = options[Number(select.value)];
    carry.disabled = !option;
    rationale.textContent = option ? `${option.reason} Your ${option.outputField.label.toLowerCase()} will fill “${option.inputField.label}” and stay editable.` : 'Choose a step to see why it may help.';
  });
  carry.addEventListener('click', () => {
    const option = options[Number(select.value)];
    if (option) startWorkflowHandoff(option, sourceDefinition, sourceResult, rawInputs, context);
  });
  content.append(search, select, rationale, carry);
  details.append(content);
  return details;
}

function startWorkflowHandoff(option, sourceDefinition, sourceResult, rawInputs, context) {
  const step = { calculatorId: sourceDefinition.id, methodVersion: sourceDefinition.version, inputs: rawInputs, result: sourceResult };
  const steps = context?.steps ? [...context.steps] : [];
  if (steps.at(-1)?.calculatorId === sourceDefinition.id) steps[steps.length - 1] = step;
  else steps.push(step);
  const currencyCode = context?.currencyCode || activeCurrencyCode;
  const carryCurrency = isMonetaryQuantity(sourceDefinition, option.outputField);
  const payload = {
    handoff: { ...option.handoff, ...(carryCurrency ? { currencyCode } : {}) },
    context: { steps, ...(context?.currencyCode ? { currencyCode: context.currencyCode } : {}) },
  };
  if (!safeStorageSet(sessionStorage, 'nexora.pending-workflow.v1', payload)) return;
  location.href = calculatorPath(option.targetDefinition.id);
}

function saveCalculationToHistory(definition, result, rawInputs, context, handoff) {
  try {
    const outcome = saveHistoryRecord({
      id: crypto.randomUUID(),
      kind: 'calculator',
      calculatorId: definition.id,
      calculatorTitle: definition.title,
      methodVersion: definition.version,
      calculatedAt: result.calculatedAt,
      locale,
      rawInputs,
      result,
      currencyCode: context?.currencyCode || activeCurrencyCode,
      workflow: context || null,
      handoff: handoff || null,
      route: calculatorPath(definition.id),
      summary: resultSummary(definition, result, context?.currencyCode || activeCurrencyCode),
    });
    if (!outcome.saved && outcome.reason === 'limit') showToast('History reached its 100-entry limit. Delete an entry before saving another.');
    else if (!outcome.saved && outcome.reason === 'paused') showToast('History saving is paused in your settings.');
    else if (!outcome.saved && outcome.reason === 'storage-full') showToast('This browser’s local storage is full. Export or delete saved entries before trying again.');
    else if (!outcome.saved) showToast('This browser could not save local history. You can still export the result.');
    else showToast('Saved to this device’s calculation history.');
  } catch {
    showToast('The result is ready, but browser storage could not save it. Export the result to keep a copy.');
  }
}

function resultSummary(definition, result, currencyCode = activeCurrencyCode) {
  return definition.outputs.map(field => `${field.label}: ${formatOutput(definition, field, result.outputs[field.id], result.outputs[field.id].unit, currencyCode)}`).join(' · ');
}

async function initCalculatorPage() {
  const runtime = document.querySelector('#calculatorRuntime');
  if (!runtime) return;
  if (runtime.dataset.catalogKind === 'converter') {
    try { await loadConverters(); }
    catch {
      runtime.textContent = 'Could not load this converter. Reconnect and reload the page.';
      return;
    }
  }
  const definition = runtime.dataset.catalogKind === 'converter'
    ? converterById.get(runtime.dataset.calculatorId)
    : calculatorById.get(runtime.dataset.calculatorId);
  if (!definition) {
    runtime.textContent = 'This calculator is not in the published catalog.';
    return;
  }
  renderCalculatorPage(definition, runtime);
  document.addEventListener('nexora:locale-change', () => {
    const localeHint = runtime.querySelector('.runtime-card-heading p');
    if (localeHint) localeHint.textContent = `Enter values and choose a unit for each quantity. Number format: ${locale}.`;
    if (currentCalculation?.definition.id === definition.id) {
      const resultCard = runtime.querySelector('.result-card');
      if (resultCard) renderCalculationResult(definition, currentCalculation.result, currentCalculation.rawInputs, resultCard, currentCalculation.handoff, workflowContext);
    }
  });
}

function unitGroupKey(unit) {
  return `${dimensionLabel(unit.dimension)}:${unit.temperatureKind}`;
}

function unitGroupName(unit) {
  const dimension = unit.dimension;
  if (dimensionsEqual(dimension, BASE_DIMENSIONS.length)) return 'Length';
  if (dimensionsEqual(dimension, BASE_DIMENSIONS.mass)) return 'Mass';
  if (dimensionsEqual(dimension, BASE_DIMENSIONS.time)) return 'Time';
  if (dimensionsEqual(dimension, BASE_DIMENSIONS.temperature)) return unit.temperatureKind === 'difference' ? 'Temperature difference' : 'Temperature';
  if (dimensionsEqual(dimension, BASE_DIMENSIONS.electricCurrent)) return 'Electric current';
  if (dimensionsEqual(dimension, BASE_DIMENSIONS.planeAngle)) return 'Angle';
  if (dimensionLabel(dimension) === 'dimensionless') return 'Dimensionless';
  const names = {
    'length^2': 'Area', 'length^3': 'Volume', 'length^1·time^-1': 'Speed',
    'length^1·time^-2': 'Acceleration', 'length^1·mass^1·time^-2': 'Force',
    'length^-1·mass^1·time^-2': 'Pressure', 'length^2·mass^1·time^-2': 'Energy',
    'length^2·mass^1·time^-3': 'Power', 'time^-1': 'Frequency',
    'length^3·time^-1': 'Volume flow',
  };
  return names[dimensionLabel(dimension)] || 'Other supported quantity';
}

function initUnitConverter() {
  const runtime = document.querySelector('#unitConverterRuntime');
  if (!runtime) return;
  const unitMap = listUnits();
  const groups = new Map();
  for (const unit of unitMap) {
    const key = unitGroupKey(unit);
    if (!groups.has(key)) groups.set(key, { key, name: unitGroupName(unit), units: [] });
    groups.get(key).units.push(unit);
  }
  const groupList = [...groups.values()].sort((left, right) => left.name.localeCompare(right.name, locale));
  const form = node('form', 'unit-converter-form');
  form.noValidate = true;
  const categoryControl = node('div', 'unit-category-control');
  const categoryLabel = node('label', '', 'Physical quantity');
  categoryLabel.htmlFor = 'unitCategory';
  const category = node('select');
  category.id = 'unitCategory';
  for (const group of groupList) {
    const option = node('option', '', `${group.name}${group.units[0].temperatureKind === 'difference' ? ' (difference)' : ''}`);
    option.value = group.key;
    category.append(option);
  }
  categoryControl.append(categoryLabel, category);
  const quickCategories = node('div', 'converter-quick-categories');
  const commonGroups = ['Length', 'Temperature', 'Mass', 'Speed', 'Area', 'Volume', 'Pressure'];
  for (const name of commonGroups) {
    const group = groupList.find(item => item.name === name);
    if (!group) continue;
    const quick = node('button', 'converter-quick-category', name);
    quick.type = 'button';
    quick.setAttribute('aria-pressed', 'false');
    quick.addEventListener('click', () => selectGroup(group.key));
    quickCategories.append(quick);
  }

  const row = node('div', 'unit-row');
  const valueGroup = node('div', 'unit-group unit-value-group');
  const fromGroup = node('div', 'unit-group');
  const toGroup = node('div', 'unit-group');
  const valueLabel = node('label', '', 'Value to convert');
  valueLabel.htmlFor = 'unitValue';
  const valueInput = configureNumericInput(node('input'));
  valueInput.id = 'unitValue';
  valueInput.value = '1';
  valueInput.setAttribute('aria-describedby', 'unitInputHelp');
  const inputHelpText = node('small', 'field-help', `Enter a number using ${locale} format.`);
  inputHelpText.id = 'unitInputHelp';
  const fromLabel = node('label', '', 'From');
  fromLabel.htmlFor = 'unitFrom';
  const fromSelect = node('select');
  fromSelect.id = 'unitFrom';
  fromSelect.setAttribute('aria-label', 'Convert from unit');
  const toLabel = node('label', '', 'To');
  toLabel.htmlFor = 'unitTo';
  const toSelect = node('select');
  toSelect.id = 'unitTo';
  toSelect.setAttribute('aria-label', 'Convert to unit');
  valueGroup.append(valueLabel, valueInput, inputHelpText);
  fromGroup.append(fromLabel, fromSelect);
  toGroup.append(toLabel, toSelect);
  const swap = node('button', 'swap-units', '⇄');
  swap.type = 'button';
  swap.setAttribute('aria-label', 'Swap units');
  row.append(valueGroup, fromGroup, swap, toGroup);
  const result = node('div', 'unit-result');
  result.setAttribute('aria-live', 'polite');
  result.append(node('span', 'unit-result-label', 'Converted value'), node('strong', '', '—'));
  const resultSummary = node('small', 'unit-result-summary', 'Choose units to see the equivalent value.');
  const copyResult = node('button', 'unit-copy-result', 'Copy result');
  copyResult.type = 'button';
  copyResult.disabled = true;
  result.append(resultSummary, copyResult);
  const error = node('p', 'unit-error');
  error.setAttribute('role', 'alert');
  const actions = node('div', 'form-actions');
  const convert = node('button', 'button button-primary', 'Convert units');
  convert.type = 'button';
  convert.addEventListener('click', () => runConversion());
  const save = node('button', 'button button-secondary', 'Save to history');
  save.type = 'submit';
  const exportButton = node('button', 'button button-quiet', 'Export conversion');
  exportButton.type = 'button';
  exportButton.addEventListener('click', () => {
    const conversion = runConversion();
    if (!conversion) return;
    downloadText(`unit-conversion-${new Date().toISOString().slice(0, 10)}.txt`, `AuraCalc unit conversion\n\nInput: ${formatNumber(conversion.inputValue)} ${getUnit(fromSelect.value).symbol}\nResult: ${formatNumber(conversion.converted)} ${getUnit(toSelect.value).symbol}\n\nMethod: Convert between compatible units through the unit registry.\nRegistry: ${UNIT_REGISTRY_VERSION}\nReference: NIST Guide to the SI, SP 811 Appendix B.9\n`);
  });
  actions.append(convert, save, exportButton);
  form.append(categoryControl, quickCategories, row, error, actions, result);
  runtime.replaceChildren(form);

  function fillUnitSelect(select, group, selectedId = null) {
    select.replaceChildren();
    for (const unit of group.units) {
      const option = node('option', '', `${unit.symbol} (${unit.id})`);
      option.value = unit.id;
      option.selected = unit.id === selectedId;
      select.append(option);
    }
  }

  function selectGroup(key, preferredFrom = null, preferredTo = null) {
    const group = groupList.find(item => item.key === key) || groupList[0];
    if (!group) return;
    category.value = group.key;
    quickCategories.querySelectorAll('.converter-quick-category').forEach(button => {
      const active = button.textContent === group.name;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    fillUnitSelect(fromSelect, group, preferredFrom || (group.units.some(unit => unit.id === 'm') ? 'm' : group.units[0].id));
    const suggestedTo = fromSelect.value !== 'ft' && group.units.some(unit => unit.id === 'ft') ? 'ft'
      : fromSelect.value !== 'degF' && group.units.some(unit => unit.id === 'degF') ? 'degF'
        : group.units.find(unit => unit.id !== fromSelect.value)?.id || group.units[0].id;
    fillUnitSelect(toSelect, group, preferredTo || suggestedTo);
  }

  function runConversion({ save = false } = {}) {
    error.textContent = '';
    try {
      const inputValue = parseLocalizedNumber(valueInput.value, locale);
      if (!Number.isFinite(inputValue)) throw new CalculationError('INVALID_NUMBER', 'Enter a valid finite number in the selected number format.');
      const converted = convertValue(inputValue, fromSelect.value, toSelect.value);
      const outputText = `${formatNumber(converted)} ${getUnit(toSelect.value).symbol}`;
      result.querySelector('strong').textContent = outputText;
      resultSummary.textContent = `${formatNumber(inputValue)} ${getUnit(fromSelect.value).symbol} is the same quantity as ${outputText}.`;
      copyResult.disabled = false;
      if (save) {
        try {
          const record = {
            id: crypto.randomUUID(), kind: 'unit-conversion', calculatorId: 'unit-converter', calculatorTitle: 'Unit converter',
            methodVersion: UNIT_REGISTRY_VERSION, calculatedAt: new Date().toISOString(), locale,
            rawInputs: { value: inputValue, from: fromSelect.value, to: toSelect.value },
            result: { outputs: { converted: { value: converted, unit: toSelect.value } }, unitRegistryVersion: UNIT_REGISTRY_VERSION },
            summary: `${formatNumber(inputValue)} ${getUnit(fromSelect.value).symbol} = ${formatNumber(converted)} ${getUnit(toSelect.value).symbol}`,
            route: '/converters/',
          };
          const outcome = saveHistoryRecord(record);
          showToast(outcome.saved ? 'Conversion saved to this device’s history.' : outcome.reason === 'limit' ? 'History is full. Delete an entry before saving another.' : 'History saving is paused.');
        } catch { showToast('Conversion is ready, but browser storage could not save it.'); }
      }
      return { inputValue, converted };
    } catch (conversionError) {
      result.querySelector('strong').textContent = '—';
      resultSummary.textContent = 'Check the number and selected units.';
      copyResult.disabled = true;
      error.textContent = conversionError instanceof CalculationError ? conversionError.message : 'This conversion could not be completed.';
      return null;
    }
  }

  copyResult.addEventListener('click', async () => {
    const conversion = runConversion();
    if (!conversion) return;
    const text = `${formatNumber(conversion.inputValue)} ${getUnit(fromSelect.value).symbol} = ${formatNumber(conversion.converted)} ${getUnit(toSelect.value).symbol}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Conversion copied.');
    } catch { showToast('Clipboard access is unavailable in this browser.'); }
  });

  selectGroup(groupList.find(group => group.name === 'Length')?.key || groupList[0]?.key);
  const carried = takeSessionValue('auracalc.convert-output.v1');
  const restoration = takeSessionValue('nexora.restore.v1');
  if (carried && typeof carried.value === 'number' && Number.isFinite(carried.value) && typeof carried.unit === 'string') {
    const targetGroup = groupList.find(group => group.units.some(unit => unit.id === carried.unit));
    if (targetGroup && targetGroup.units.length > 1) {
      selectGroup(targetGroup.key, carried.unit);
      valueInput.value = new Intl.NumberFormat(locale, { useGrouping: false, maximumSignificantDigits: 17 }).format(carried.value);
      runConversion();
      const provenance = node('p', 'converter-carried', `Value from ${carried.title || 'your calculation'} · ${carried.label || 'result'}. Choose a compatible target unit.`);
      form.prepend(provenance);
    } else { runConversion(); showToast('The previous result uses a unit this converter cannot accept.'); }
  } else if (restoration?.kind === 'unit-conversion') {
    valueInput.value = String(restoration.rawInputs.value);
    const targetGroup = groupList.find(group => group.units.some(unit => unit.id === restoration.rawInputs.from));
    if (targetGroup) selectGroup(targetGroup.key, restoration.rawInputs.from, restoration.rawInputs.to);
    runConversion();
    showToast(restoration.methodVersion && restoration.methodVersion !== UNIT_REGISTRY_VERSION
      ? `Inputs restored from ${restoration.methodVersion}; conversion will use current registry ${UNIT_REGISTRY_VERSION}.`
      : 'Saved conversion restored.');
  } else runConversion();
  category.addEventListener('change', () => selectGroup(category.value));
  fromSelect.addEventListener('change', () => runConversion());
  toSelect.addEventListener('change', () => runConversion());
  valueInput.addEventListener('input', () => runConversion());
  swap.addEventListener('click', () => {
    const from = fromSelect.value;
    const to = toSelect.value;
    selectGroup(category.value, to, from);
    runConversion();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const conversion = runConversion({ save: true });
    if (!conversion) return;
  });
  const registryVersion = document.querySelector('#unitRegistryVersion');
  if (registryVersion) registryVersion.textContent = UNIT_REGISTRY_VERSION;
  document.addEventListener('nexora:locale-change', () => {
    inputHelpText.textContent = `Enter a number using ${locale} format.`;
    runConversion();
  });
  initConverterDirectory();
}

async function initConverterDirectory() {
  const grid = document.querySelector('#converterDirectoryGrid');
  const search = document.querySelector('#converterDirectorySearch');
  const count = document.querySelector('#converterDirectoryCount');
  const more = document.querySelector('#converterDirectoryMore');
  if (!grid || !search || !count || !more) return;
  const pageSize = 40;
  const currency = { id: 'currency-exchange', title: 'Currency converter', category: 'Money and currencies', discipline: 'Finance', description: 'Convert currency using the latest available dated reference rates.', keywords: ['currency', 'exchange', 'foreign exchange', 'forex', 'usd eur inr gbp jpy dollar rupee euro pound yen'], fields: [], href: '/currency/' };
  let converters = [];
  try { converters = await loadConverters(); }
  catch { showToast('The converter list is unavailable. Reconnect and reload to browse all unit pairs.'); }
  const directoryEntries = [currency, ...converters].sort((a, b) =>
    Number(b.id === 'currency-exchange') - Number(a.id === 'currency-exchange')
    || (a.category || a.discipline).localeCompare(b.category || b.discipline)
    || a.title.localeCompare(b.title));
  const categoryFilter = document.querySelector('#converterQuantityFilter');
  for (const category of new Set(directoryEntries.map(entry => entry.category))) {
    const option = node('option', '', category.replace(/ conversions$/, ''));
    option.value = category;
    categoryFilter?.append(option);
  }
  let index;
  let calculatorIndex;
  let visibleLimit = pageSize;
  const matching = () => {
    const query = normaliseText(search.value);
    if (!query || !searchTokens(query).length) return directoryEntries;
    return searchIndex(index ??= makeSearchIndex(directoryEntries), query, Infinity);
  };
  const render = () => {
    const category = categoryFilter?.value;
    const items = matching().filter(entry => !category || entry.category === category);
    const related = !category && searchTokens(search.value).length ? searchIndex(calculatorIndex ??= makeSearchIndex(calculators), search.value, 4) : [];
    const visible = items.slice(0, visibleLimit);
    count.textContent = `${formatNumber(items.length, { maximumFractionDigits: 0 })} ${items.length === 1 ? 'converter' : 'converters'}${related.length ? ` · ${related.length} related calculators` : ''}`;
    grid.replaceChildren();
    if (!items.length && !related.length) {
      grid.append(node('p', 'empty-state', 'No matching conversions. Try another unit or select All quantities.'));
    }
    const groups = new Map();
    for (const definition of visible) {
      const category = definition.category || definition.discipline;
      if (!groups.has(category)) {
        const section = node('section', 'directory-group');
        section.append(node('h3', '', category));
        const list = node('ul', 'directory-links');
        section.append(list); grid.append(section); groups.set(category, list);
      }
      const item = node('li');
      const link = node('a', '', definition.title);
      link.href = definition.href || calculatorPath(definition.id);
      attachConversionQuery(link, definition, search.value);
      item.append(link); groups.get(category).append(item);
    }
    if (related.length) {
      const section = node('section', 'directory-group'); section.append(node('h3', '', 'Related calculators'));
      const list = node('ul', 'directory-links');
      for (const definition of related) { const item = node('li'); const link = node('a', '', definition.title); link.href = calculatorPath(definition.id); item.append(link); list.append(item); }
      section.append(list); grid.append(section);
    }
    const remaining = items.length - visible.length;
    more.hidden = remaining <= 0;
    more.textContent = `Show ${Math.min(pageSize, remaining)} more ${remaining === 1 ? 'converter' : 'converters'}`;
  };
  search.addEventListener('input', () => { visibleLimit = pageSize; render(); });
  categoryFilter?.addEventListener('change', () => { visibleLimit = pageSize; render(); });
  more.addEventListener('click', () => { visibleLimit += pageSize; render(); });
  render();
}

function formatHistorySummary(record) {
  if (record.summary) return record.summary;
  const definition = findTool(record.calculatorId);
  if (definition && record.result?.outputs) return resultSummary(definition, record.result, record.currencyCode || record.workflow?.currencyCode || activeCurrencyCode);
  return 'Saved result';
}

function renderHistory() {
  const list = document.querySelector('#historyList');
  const enabled = document.querySelector('#historyEnabled');
  if (!list) return;
  try {
    if (enabled) enabled.checked = historyEnabled();
    const records = getHistory();
    list.replaceChildren();
    if (!records.length) {
      list.append(node('p', 'history-empty', 'No saved calculations yet. Run a calculator and choose “Save to history”.'));
      return;
    }
    const searchLabel = node('label', 'history-search-label', 'Search saved calculations');
    const search = node('input', 'history-search'); search.type = 'search'; search.placeholder = 'Search by tool or result'; search.autocomplete = 'off'; searchLabel.append(search);
    const searchStatus = node('p', 'history-search-status'); searchStatus.setAttribute('role', 'status');
    list.append(searchLabel, searchStatus);
    const entries = [];
    for (const record of records) {
      const usable = historyRecordUsable(record);
      const entry = node('article', 'history-entry');
      const top = node('div', 'history-entry-top');
      top.append(node('strong', '', record.calculatorTitle || record.calculatorId || 'Calculation'));
      const date = new Date(record.calculatedAt);
      top.append(node('small', '', Number.isFinite(date.getTime()) ? date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : 'Saved result'));
      let summary = 'This saved entry is incomplete or uses an unavailable unit. It has been kept unchanged.';
      if (usable) { try { summary = formatHistorySummary(record); } catch { summary = 'Saved result from an older tool version.'; } }
      entry.append(top, node('p', 'history-entry-summary', summary));
      const actions = node('div', 'history-entry-actions');
      const view = node('button', 'button button-secondary', 'View saved result');
      view.type = 'button';
      view.disabled = !usable;
      view.addEventListener('click', () => showHistoryRecord(record));
      const restore = node('button', 'button button-quiet', 'Restore inputs');
      restore.type = 'button';
      restore.disabled = !usable;
      restore.addEventListener('click', () => restoreHistoryRecord(record));
      const remove = node('button', 'button button-quiet', 'Delete');
      remove.type = 'button';
      remove.addEventListener('click', () => {
        const removed = deleteHistoryRecord(record.id);
        renderHistory();
        showToast(removed ? 'History entry deleted.' : 'This browser could not update local history.');
      });
      actions.append(view, restore, remove);
      entry.append(actions);
      list.append(entry);
      entries.push({ entry, text: `${record.calculatorTitle || ''} ${record.summary || ''} ${record.calculatedAt || ''}` });
    }
    const filterHistory = () => { let count = 0; for (const item of entries) { item.entry.hidden = !matchesSearchText(item.text, search.value); if (!item.entry.hidden) count++; } searchStatus.textContent = `Showing ${count} of ${entries.length} saved calculations.`; };
    search.addEventListener('input', filterHistory); filterHistory();
  } catch {
    list.replaceChildren(node('p', 'history-empty', 'This browser could not read local history. You can continue calculating and export each result.'));
  }
}

async function showHistoryRecord(record) {
  if (record.calculatorId?.startsWith('convert-') && !converterById.has(record.calculatorId)) {
    try { await loadConverters(); }
    catch { /* The recorded outputs can still be shown without catalog labels. */ }
    if (!historyDialog?.open) return;
  }
  currentHistoryRecord = record;
  const title = document.querySelector('#historyRecordTitle');
  const content = document.querySelector('#historyRecordContent');
  if (!content || !recordDialog) return;
  title.textContent = record.calculatorTitle || 'Saved calculation';
  content.replaceChildren();
  content.append(node('p', 'details-copy', `Original result · ${record.methodVersion || 'version unavailable'} · ${new Date(record.calculatedAt).toLocaleString(locale)}.`));
  const outputList = node('div', 'saved-result-list');
  const definition = findTool(record.calculatorId);
  if (definition && record.result?.outputs) {
    for (const field of definition.outputs) {
      const output = record.result.outputs[field.id];
      if (output) outputList.append(savedResultRow(field.label, formatOutput(definition, field, output)));
    }
  } else if (record.kind === 'currency-conversion' && record.result?.outputs?.converted) {
    outputList.append(savedResultRow('Converted amount', `${formatNumber(record.result.outputs.converted.value)} ${record.rawInputs?.to || ''}`));
    if (Number.isFinite(record.rate?.value)) outputList.append(savedResultRow('Rate used', `1 ${record.rawInputs.from} = ${formatNumber(record.rate.value, { maximumSignificantDigits: 10 })} ${record.rawInputs.to}`));
    if (record.rate?.date) outputList.append(savedResultRow('Reference rate date', record.rate.date));
  } else if (record.result?.outputs) {
    for (const [key, output] of Object.entries(record.result.outputs)) outputList.append(savedResultRow(key, `${formatNumber(output.value)} ${getUnit(output.unit).symbol}`));
  }
  content.append(outputList);
  if (record.kind === 'personal-formula' && record.formula) content.append(node('p', 'details-copy', `User-created formula: ${record.formula}`));
  const inputs = node('div', 'details-copy');
  inputs.append(node('strong', '', 'Original inputs'));
  const inputList = node('ul', 'intermediate-list');
  for (const [key, entry] of Object.entries(record.rawInputs || {})) {
    if (entry && typeof entry === 'object' && 'value' in entry) {
      const unit = entry.unit && (() => { try { return getUnit(entry.unit).symbol; } catch { return entry.unit; } })();
      inputList.append(node('li', '', `${definition?.inputs.find(field => field.id === key)?.label || key}: ${entry.value}${unit ? ` ${unit}` : ''}`));
    } else if (key === 'value' && record.kind === 'currency-conversion') {
      inputList.append(node('li', '', `${formatNumber(entry)} ${record.rawInputs.from} → ${record.rawInputs.to}`));
    } else if (key === 'value' && record.kind === 'unit-conversion') {
      inputList.append(node('li', '', `${formatNumber(entry)} ${getUnit(record.rawInputs.from).symbol} → ${getUnit(record.rawInputs.to).symbol}`));
    }
  }
  inputs.append(inputList);
  content.append(inputs);
  if (record.workflow?.steps?.length) content.append(node('p', 'workflow-provenance', `This saved result belongs to a ${record.workflow.steps.length}-step calculation workflow.`));
  historyDialog?.close();
  recordDialog.showModal();
}

function savedResultRow(label, value) {
  const row = node('div', 'saved-result-row');
  row.append(node('span', '', label), node('strong', '', value));
  return row;
}

function restoreHistoryRecord(record) {
  try {
    const payload = record.kind === 'personal-formula' ? { kind: record.kind, formula: record.formula, title: record.calculatorTitle, rawInputs: record.rawInputs }
      : record.kind === 'unit-conversion' || record.kind === 'currency-conversion'
      ? { kind: record.kind, methodVersion: record.methodVersion, rawInputs: record.rawInputs }
      : { calculatorId: record.calculatorId, methodVersion: record.methodVersion, inputs: record.rawInputs };
    sessionStorage.setItem('nexora.restore.v1', JSON.stringify(payload));
    recordDialog?.close();
    historyDialog?.close();
    location.href = historyRecordRoute(record);
  } catch {
    showToast('The browser could not restore these inputs. The original saved result is still available.');
  }
}

function setupHistory() {
  document.querySelector('#historyButton')?.addEventListener('click', () => {
    renderHistory();
    historyDialog?.showModal();
  });
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
  document.querySelector('#historyEnabled')?.addEventListener('change', event => {
    const enabled = event.target.checked;
    if (!setHistoryEnabled(enabled)) {
      event.target.checked = false;
      showToast('This browser could not update the history setting.');
      return;
    }
    showToast(enabled ? 'History saving is on for this browser.' : 'History saving is paused. Existing entries remain.');
  });
  document.querySelector('#clearHistory')?.addEventListener('click', () => {
    if (!getHistory().length) return;
    if (!window.confirm('Delete all saved calculation history on this device?')) return;
    if (!clearHistory()) {
      showToast('This browser could not clear local history.');
      return;
    }
    renderHistory();
    showToast('All local calculation history was deleted.');
  });
  document.querySelector('#restoreHistoryInputs')?.addEventListener('click', () => {
    if (currentHistoryRecord) restoreHistoryRecord(currentHistoryRecord);
  });
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  }
}

function setupFeedback() {
  const form = document.querySelector('#feedbackForm');
  if (!form) return;
  const status = document.querySelector('#feedbackStatus');
  const reported = new URLSearchParams(location.search).get('calculator');
  if (reported && /^[a-z0-9-]+$/.test(reported)) {
    form.elements.feedbackPage.value = `/calculators/${reported}/`;
    form.elements.feedbackType.value = 'calculation';
  }
  connectFeedback(form, status);
  document.querySelector('#exportFeedback')?.addEventListener('click', () => {
    const feedback = exportFeedback();
    if (!feedback.length) {
      if (status) status.textContent = 'There is no saved feedback to export.';
      return;
    }
    downloadJson(`nexora-feedback-${new Date().toISOString().slice(0, 10)}.json`, feedback);
    if (status) status.textContent = 'Feedback export downloaded.';
  });
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  try { await navigator.serviceWorker.register('/sw.js'); } catch { /* Offline support is an enhancement, not a calculator dependency. */ }
}

async function setupSponsoredPlacements() {
  await mountSponsoredPlacements();
}

setupLocaleControl();
setupThemeControl();
setupMobileMenu();
setupGeneratedPageMenu();
setupHistory();
setupFeedback();
initCalculatorPage();
initUnitConverter();
registerServiceWorker();
setupSponsoredPlacements();
