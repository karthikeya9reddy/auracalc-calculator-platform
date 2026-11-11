import { listPublicCalculators, listPublicConverters } from '/catalog/public/index.mjs';
import { FIELD_DIRECTORY } from '/catalog/field-directory.mjs';
import { createFieldToolIndex } from '/catalog/field-tool-index.mjs';
import { fieldRoute } from '/catalog/field-route.mjs';
import {
  CalculationError,
  convertValue,
  executeCalculation,
  getUnit,
} from '/src/calculation-core/index.mjs';
import { saveHistoryRecord } from './storage.mjs';
import { configureNumericInput } from './numeric-input.mjs';
import { numberToEnglishWords } from './number-words.mjs';
import { renderCalculationVisual } from './visual-system.mjs';
import { compatibleNextSteps, recommendNextSteps } from './next-step-engine.mjs';
import { InputAssistant } from './input-assistant.mjs';
import { catalogTopics } from './catalog-topics.mjs';
import { makeSearchIndex, searchIndex, searchTokens, matchesSearchText } from './unified-search.mjs';
import { MEASUREMENT_TOOLS } from './measurement-search.mjs';

const calculators = listPublicCalculators();
const converters = listPublicConverters();
const converterSearchIndex = makeSearchIndex(converters);
const measurementSearchIndex = makeSearchIndex(MEASUREMENT_TOOLS);
const inputAssistant = new InputAssistant({
  calculators,
  converters,
  getLocale: () => locale,
  getCurrencyCode: () => {
    try { return localStorage.getItem('auracalc.currency.v1') || ({ 'en-IN': 'INR', 'en-GB': 'GBP', 'de-DE': 'EUR', 'fr-FR': 'EUR' })[navigator.language] || 'USD'; }
    catch { return 'USD'; }
  },
});
const calculatorById = new Map(calculators.map(definition => [definition.id, definition]));
const fieldToolMap = createFieldToolIndex(calculators);
const localeSelect = document.querySelector('#localeSelect');
const localeSupported = new Set(['en-US', 'en-GB', 'de-DE', 'fr-FR', 'hi-IN']);
const favoriteKey = 'auracalc.favorites.v1';
const CATALOG_PAGE_SIZE = 10;
const fieldHighlights = [
  'Everyday conversions, cooking, and household projects',
  'Mathematics and arithmetic',
  'Personal and corporate finance',
  'Education, assessment, and learning',
  'Civil engineering',
  'Physics, astronomy, astrophysics, and cosmology',
];
const accentById = {
  'percentage-change': 'pink',
  'rectangle-area': 'lime',
  'rectangular-prism-volume': 'violet',
  'average-speed': 'cyan',
  'compound-interest': 'lime',
  'age-in-days': 'orange',
};
const iconMarkupByName = {
  percent: '<circle cx="9" cy="9" r="3.5"/><circle cx="39" cy="39" r="3.5"/><path d="M39 9 9 39"/>',
  rectangle: '<rect x="7" y="10" width="34" height="28" rx="1"/><path d="M15 17h18M15 24h18M15 31h10"/>',
  cube: '<path d="m24 5 17 9.5v19L24 43 7 33.5v-19L24 5Z"/><path d="m7 14.5 17 10 17-10M24 25v18M15.5 10l17 10"/>',
  speed: '<path d="M7 35a18 18 0 1 1 34 0"/><path d="m24 27 10-10M13 35h22"/><circle cx="24" cy="27" r="2"/>',
  growth: '<path d="M7 38 19 26l8 7 14-17M30 16h11v11"/>',
  calendar: '<rect x="7" y="10" width="34" height="31" rx="2"/><path d="M15 6v8M33 6v8M7 19h34M16 27h4M28 27h4M16 34h4"/>',
  calculator: '<rect x="10" y="5" width="28" height="38" rx="3"/><path d="M16 12h16v7H16zM17 26h2M24 26h2M31 26h2M17 33h2M24 33h2M31 33h2"/>',
  heart: '<path d="M24 40S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22Z"/>',
  arrow: '<path d="M12 36 36 12M17 12h19v19"/>',
  search: '<circle cx="21" cy="21" r="12"/><path d="m30 30 10 10"/>',
  history: '<path d="M8 15a17 17 0 1 1-2 13M8 7v9h9M24 14v11l8 5"/>',
  menu: '<path d="M7 12h34M7 24h34M7 36h34"/>',
  close: '<path d="m12 12 24 24M36 12 12 36"/>',
};
const iconById = {
  'percentage-change': 'percent',
  'rectangle-area': 'rectangle',
  'rectangular-prism-volume': 'cube',
  'average-speed': 'speed',
  'compound-interest': 'growth',
  'age-in-days': 'calendar',
};

let locale = getInitialLocale();
let activeCategory = 'All tools';
let activeQuery = '';
let favoritesOnly = false;
let catalogVisibleLimit = CATALOG_PAGE_SIZE;
let showAllFields = false;
let currentDefinition = null;
let currentInputs = null;
let currentResult = null;
let revealObserver = null;

function getInitialLocale() {
  try {
    const stored = localStorage.getItem('nexora.locale.v1');
    if (localeSupported.has(stored)) return stored;
  } catch { /* Locale formatting is optional. */ }
  return localeSupported.has(navigator.language) ? navigator.language : 'en-US';
}

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function makeIcon(name, className = 'ui-icon') {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 48 48');
  icon.setAttribute('class', className);
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '2');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.innerHTML = iconMarkupByName[name] || iconMarkupByName.calculator;
  return icon;
}

function calculatorIcon(definition, className = 'calc-icon') {
  return makeIcon(iconById[definition.id] || 'calculator', className);
}

function normalize(value) {
  return String(value ?? '').toLocaleLowerCase(locale).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function formatNumber(value, options = {}) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 6, ...options }).format(value);
}

function readFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
    return Array.isArray(parsed) ? parsed.filter(id => calculatorById.has(id)) : [];
  } catch { return []; }
}

let favorites = readFavorites();

function storeFavorites() {
  try { localStorage.setItem(favoriteKey, JSON.stringify(favorites)); } catch { showToast('This browser could not save your favorite tools.'); }
}

function calculatorPath(id) {
  return `/calculators/${encodeURIComponent(id)}/`;
}

function matchesQuery(definition, query) {
  if (!query) return true;
  if (!searchTokens(query).length) return !/convert|conversion/i.test(query);
  const text = normalize([
    definition.title, definition.id, definition.discipline, definition.category,
    definition.description, definition.purpose, definition.method.description,
    ...(definition.fields || []),
    ...(definition.keywords || []),
  ].join(' '));
  return matchesSearchText(text, query);
}

function matchingCalculators() {
  return calculators.filter(definition => {
    if (activeCategory !== 'All tools' && definition.category !== activeCategory) return false;
    if (favoritesOnly && !favorites.includes(definition.id)) return false;
    return matchesQuery(definition, activeQuery);
  });
}

function renderCategories() {
  const container = document.querySelector('#categoryFilters');
  if (!container) return;
  const { all, featured, counts } = catalogTopics(calculators, activeCategory);
  container.replaceChildren();
  const label = node('span', 'catalog-category-label', 'Browse by topic');
  container.append(label);
  const makeTopic = category => {
    const button = node('button', `category topic-chip${activeCategory === category ? ' active' : ''}`, category);
    button.type = 'button'; button.dataset.topic = category;
    button.setAttribute('aria-pressed', String(activeCategory === category));
    button.addEventListener('click', () => {
      activeCategory = category; catalogVisibleLimit = CATALOG_PAGE_SIZE; renderCatalog();
      [...document.querySelectorAll('#categoryFilters .topic-chip')].find(item => item.dataset.topic === category)?.focus();
    });
    return button;
  };
  const featuredRow = node('div', 'topic-featured');
  for (const category of ['All tools', ...featured]) featuredRow.append(makeTopic(category));
  container.append(featuredRow);
  const fields = node('a', 'catalog-fields-link', 'Browse all fields ↗');
  fields.href = '/fields/';
  const details = node('details', 'topic-disclosure');
  const summary = node('summary', 'topic-summary', `More topics · ${all.length}`);
  const panel = node('div', 'topic-panel');
  const searchLabel = node('label', 'topic-search-label', 'Find a topic'); searchLabel.htmlFor = 'topic-search';
  const search = node('input', 'topic-search'); search.id = 'topic-search'; search.type = 'search'; search.placeholder = 'Search topics, e.g. gears or chemistry'; search.autocomplete = 'off';
  const list = node('div', 'topic-list');
  const result = node('p', 'topic-result'); result.setAttribute('role', 'status');
  const filter = () => {
    const matching = all.filter(category => matchesSearchText(category, search.value));
    list.replaceChildren();
    for (const category of matching) { const chip = makeTopic(category); chip.title = `${counts.get(category)} calculators`; list.append(chip); }
    result.textContent = matching.length ? `${matching.length} ${matching.length === 1 ? 'topic' : 'topics'}` : 'No topics found. Try another word.';
  };
  search.addEventListener('input', filter);
  details.addEventListener('toggle', () => { if (details.open && !list.childElementCount) filter(); });
  panel.append(searchLabel, search, result, list, fields); details.append(summary, panel); container.append(details);
}

function renderCatalog() {
  const grid = document.querySelector('#auraCalculatorGrid');
  if (!grid) return;
  renderCategories();
  const items = matchingCalculators();
  const additions = document.querySelector('#unified-search-additions');
  let extraMatches = 0;
  if (additions) {
    additions.replaceChildren();
    const query = activeQuery.trim();
    additions.hidden = !query || favoritesOnly;
    if (query && !favoritesOnly) {
      const matchingFields = FIELD_DIRECTORY.filter(field => searchTokens(query).length && matchesSearchText(field, query)).slice(0, 6);
      const matchingConversions = searchIndex(converterSearchIndex, query, 8);
      const matchingMeasurements = searchIndex(measurementSearchIndex, query, 3);
      const currencyMatch = /currency|exchange|forex|\b(?:usd|eur|inr|gbp|jpy|dollar|rupee|euro|yen)\b/i.test(query);
      const builderMatch = /builder|build (?:a |my |your )?calculator|custom (?:formula|calculator)|create (?:a |my |your )?calculator/i.test(query);
      if (matchingMeasurements.length) { const section = node('section', 'search-result-group'); section.append(node('h3', '', 'Measurement tools')); const links = node('div', 'search-result-links'); for (const tool of matchingMeasurements) { const link = node('a', '', tool.title); link.href = tool.href; links.append(link); } section.append(links); additions.append(section); extraMatches += matchingMeasurements.length; }
      if (builderMatch) { const section = node('section', 'search-result-group'); section.append(node('h3', '', 'Build your own')); const links = node('div', 'search-result-links'); const link = node('a', '', 'Personal formula builder'); link.href = '/builder/'; links.append(link); section.append(links); additions.append(section); extraMatches++; }
      if (matchingFields.length) {
        const section = node('section', 'search-result-group'); section.append(node('h3', '', 'Fields'));
        const links = node('div', 'search-result-links');
        for (const field of matchingFields) { const link = node('a', '', field); link.href = fieldRoute(field); links.append(link); }
        section.append(links); additions.append(section); extraMatches += matchingFields.length;
      }
      if (matchingConversions.length || currencyMatch || /convert|conversion/i.test(query)) {
        const section = node('section', 'search-result-group'); section.append(node('h3', '', 'Converters'));
        const links = node('div', 'search-result-links');
        if (currencyMatch) { const currency = node('a', '', 'Currency exchange rates'); currency.href = '/currency/'; links.append(currency); extraMatches++; }
        for (const conversion of matchingConversions) { const link = node('a', '', conversion.title); link.href = `/converters/${encodeURIComponent(conversion.id)}/`; links.append(link); }
        const all = node('a', 'search-all-converters', 'Browse all converters ↗'); all.href = '/converters/'; links.append(all);
        section.append(links); additions.append(section); extraMatches += matchingConversions.length + 1;
      }
      additions.hidden = !additions.childElementCount;
    }
  }
  const visibleItems = items.slice(0, catalogVisibleLimit);
  if (revealObserver) grid.querySelectorAll('[data-scroll-reveal]').forEach(item => revealObserver.unobserve(item));
  grid.replaceChildren();
  visibleItems.forEach((definition, index) => {
    const wrapper = node('div', 'card-shell reveal-card');
    wrapper.dataset.scrollReveal = '';
    wrapper.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 55}ms`);
    const card = node('a', `calc-card accent-${accentById[definition.id] || 'lime'}`);
    card.href = calculatorPath(definition.id);
    card.setAttribute('aria-label', `Open ${definition.title} calculator`);
    card.style.setProperty('--card-hover-rotation', definition.id === 'compound-interest' ? '-1deg' : '1deg');
    card.setAttribute('data-testid', `calculator-card-${definition.id}`);

    const top = node('span', 'card-top');
    top.append(node('span', 'card-tag', `${definition.riskClass} · ${definition.category}`));
    const arrow = node('span', 'card-arrow');
    arrow.append(makeIcon('arrow', 'ui-icon'));
    top.append(arrow);
    const symbol = node('span', 'card-symbol');
    symbol.append(calculatorIcon(definition));
    const name = node('span', 'card-name', definition.title);
    const description = node('span', 'card-description', definition.description);
    const footer = node('span', 'card-footer');
    footer.append(node('span', '', `${definition.inputs.length} inputs · source linked`), node('span', '', 'Open calculator →'));
    card.append(top, symbol, name, description, footer);
    const isFavorite = favorites.includes(definition.id);
    const favorite = node('button', `card-favorite${isFavorite ? ' liked' : ''}`);
    favorite.type = 'button';
    favorite.append(makeIcon('heart', 'ui-icon'));
    favorite.setAttribute('aria-label', isFavorite ? `Remove ${definition.title} from saved tools` : `Save ${definition.title}`);
    favorite.setAttribute('aria-pressed', String(isFavorite));
    favorite.setAttribute('data-testid', `favorite-${definition.id}`);
    favorite.addEventListener('click', () => toggleFavorite(definition.id));

    wrapper.append(card, favorite);
    grid.append(wrapper);
    revealObserver?.observe(wrapper);
  });
  const pagination = document.querySelector('#catalog-pagination');
  const pageStatus = document.querySelector('#catalog-page-status');
  const loadMore = document.querySelector('#catalog-load-more');
  const remaining = items.length - visibleItems.length;
  if (pagination) pagination.hidden = remaining <= 0;
  if (pageStatus) pageStatus.textContent = `Showing ${visibleItems.length} of ${items.length} calculators.`;
  if (loadMore) {
    const nextBatch = Math.min(CATALOG_PAGE_SIZE, remaining);
    loadMore.textContent = `Show ${nextBatch} more ${nextBatch === 1 ? 'tool' : 'tools'}`;
    loadMore.setAttribute('aria-label', `Show ${nextBatch} more calculators`);
  }
  const count = document.querySelector('#search-count');
  if (count) count.textContent = activeQuery || favoritesOnly || activeCategory !== 'All tools'
    ? `${items.length} ${items.length === 1 ? 'calculator' : 'calculators'}${extraMatches ? ` · ${extraMatches} more suggestions` : ''}`
    : `${calculators.length} live formula ${calculators.length === 1 ? 'calculator' : 'calculators'}`;
  const empty = document.querySelector('#empty-state');
  if (empty) {
    empty.hidden = items.length > 0 || extraMatches > 0;
    const message = empty.querySelector('p');
    if (message) message.textContent = 'No live calculator matches that search yet.';
  }
  const clear = document.querySelector('#clear-search');
  if (clear) clear.hidden = !activeQuery;
  const favoritesButton = document.querySelector('#favorites-filter');
  if (favoritesButton) {
    favoritesButton.setAttribute('aria-pressed', String(favoritesOnly));
    favoritesButton.replaceChildren(makeIcon('heart', 'ui-icon'), document.createTextNode(' Saved tools '));
    const countBadge = node('span', 'favorites-count', favorites.length);
    favoritesButton.append(countBadge);
  }
  const toolCount = document.querySelector('#hero-tool-count');
  if (toolCount) toolCount.textContent = formatNumber(calculators.length, { maximumFractionDigits: 0 });
  const liveStatus = document.querySelector('#hero-catalog-status');
  if (liveStatus) liveStatus.textContent = `${calculators.length} live formula calculators · ${FIELD_DIRECTORY.length} research fields mapped`;
  const catalogLabel = document.querySelector('#catalog-live-label');
  if (catalogLabel) catalogLabel.textContent = `${calculators.length} LIVE FORMULA CALCULATORS`;
  const truth = document.querySelector('#catalog-truth-text');
  if (truth) truth.textContent = `${calculators.length} formula-based calculators are currently in the live catalog. Unit converters are listed separately and are not included in this count.`;
}

function setupScrollReveals() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });
  document.documentElement.classList.add('scroll-reveal-ready');
  document.querySelectorAll('[data-scroll-reveal]').forEach(item => revealObserver.observe(item));
}

function setupCardHighlight() {
  const grid = document.querySelector('#auraCalculatorGrid');
  if (!grid || matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let activeCard = null;
  let point = null;
  let frame = 0;

  const reset = card => {
    if (!card) return;
    card.style.removeProperty('--pointer-x');
    card.style.removeProperty('--pointer-y');
    card.classList.remove('is-pointer-active');
  };

  grid.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !event.isPrimary) return;
    const target = event.target instanceof Element ? event.target.closest('.calc-card') : null;
    if (!target || !grid.contains(target)) {
      reset(activeCard);
      activeCard = null;
      point = null;
      return;
    }
    if (activeCard && activeCard !== target) reset(activeCard);
    activeCard = target;
    point = [event.clientX, event.clientY];
    activeCard.classList.add('is-pointer-active');
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!activeCard || !point) return;
      const rect = activeCard.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (point[0] - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (point[1] - rect.top) / rect.height));
      activeCard.style.setProperty('--pointer-x', `${x * 100}%`);
      activeCard.style.setProperty('--pointer-y', `${y * 100}%`);
    });
  }, { passive: true });

  grid.addEventListener('pointerout', event => {
    const leaving = event.target instanceof Element ? event.target.closest('.calc-card') : null;
    if (!leaving || leaving.contains(event.relatedTarget)) return;
    reset(leaving);
    if (activeCard === leaving) {
      activeCard = null;
      point = null;
    }
  }, { passive: true });
}

function toggleFavorite(id) {
  favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
  storeFavorites();
  renderCatalog();
}

function renderFields() {
  const grid = document.querySelector('#field-grid');
  const status = document.querySelector('#field-status');
  const toggle = document.querySelector('#toggle-fields');
  if (!grid) return;
  const query = normalize(activeQuery);
  const visibleFields = FIELD_DIRECTORY.filter(name => {
    const linkedTools = fieldToolMap.get(name) || [];
    const toolWords = linkedTools.map(definition => `${definition.title} ${definition.description} ${(definition.keywords || []).join(' ')}`).join(' ');
    const text = normalize(`${name} ${toolWords}`);
    return !query || matchesSearchText(text, query);
  });
  const shown = activeQuery || showAllFields ? visibleFields : visibleFields.filter(name => fieldHighlights.includes(name));
  grid.replaceChildren();
  for (const [index, name] of FIELD_DIRECTORY.entries()) {
    if (!shown.includes(name)) continue;
    const linked = fieldToolMap.get(name) || [];
    const card = node('a', `field-card${linked.length ? ' has-tools' : ''}`);
    card.href = fieldRoute(name);
    card.setAttribute('aria-label', `Open ${name} field page with ${linked.length} currently released ${linked.length === 1 ? 'calculator' : 'calculators'}`);
    card.append(node('span', 'field-index', String(index + 1).padStart(2, '0')));
    const copy = node('span', 'field-copy');
    copy.append(node('strong', '', name));
    copy.append(node('small', '', linked.length ? `${linked.length} related general-purpose ${linked.length === 1 ? 'tool' : 'tools'}` : 'Research map · no live tool yet'));
    card.append(copy);
    grid.append(card);
  }
  if (status) status.textContent = activeQuery
    ? `${visibleFields.length} research ${visibleFields.length === 1 ? 'field' : 'fields'} match this search.`
    : showAllFields ? `Showing all ${FIELD_DIRECTORY.length} research field groups.` : 'Showing six highlighted research groups.';
  if (toggle) {
    toggle.hidden = Boolean(activeQuery);
    toggle.setAttribute('aria-expanded', String(showAllFields));
    toggle.innerHTML = showAllFields ? 'Show highlights <span aria-hidden="true">↑</span>' : `View all ${FIELD_DIRECTORY.length} fields <span aria-hidden="true">↓</span>`;
  }
}

function openCalculator(definition) {
  currentDefinition = definition;
  currentInputs = null;
  currentResult = null;
  const toolSymbol = document.querySelector('#tool-symbol');
  toolSymbol.className = `modal-symbol accent-${accentById[definition.id] || 'lime'}`;
  toolSymbol.replaceChildren(calculatorIcon(definition, 'calc-icon'));
  document.querySelector('#tool-eyebrow').textContent = `${definition.discipline} / ${definition.riskClass} · RELEASED`;
  document.querySelector('#tool-title').textContent = definition.title;
  document.querySelector('#tool-description').textContent = definition.description;
  document.querySelector('#tool-error').hidden = true;
  const result = document.querySelector('#tool-result');
  result.hidden = true;
  result.replaceChildren();
  const sources = document.querySelector('#tool-sources');
  sources.hidden = true;
  sources.replaceChildren();
  const form = document.querySelector('#tool-form');
  const fields = document.querySelector('#tool-inputs');
  fields.replaceChildren();
  for (const field of definition.inputs) {
    const fieldLabel = field.required === false ? `${field.label} (optional)` : field.label;
    const wrap = node('div', 'tool-input-field');
    const label = node('label', '', fieldLabel);
    const controls = node('span', 'field-unit');
    const input = configureNumericInput(node('input'), { allowMagnitudeWords: field.allowMagnitudeWords === true });
    input.id = `tool-input-${definition.id}-${field.id}`;
    input.name = field.id;
    input.required = field.required !== false;
    input.setAttribute('aria-label', fieldLabel);
    label.htmlFor = input.id;
    input.setAttribute('data-testid', `input-${field.id}`);
    input.placeholder = `Enter ${field.label.toLocaleLowerCase(locale)}`;
    let unit;
    if (field.unitLabel) {
      unit = node('span', 'quantity-unit-label', field.unitLabel);
      unit.setAttribute('aria-label', `${field.label}: ${field.unitLabel}`);
    } else {
      unit = node('select');
      unit.name = `${field.id}-unit`;
      unit.setAttribute('aria-label', `${field.label} unit`);
      for (const unitId of field.acceptedUnits) {
        const option = node('option', '', `${getUnit(unitId).symbol} (${unitId})`);
        option.value = unitId;
        option.selected = unitId === field.canonicalUnit;
        unit.append(option);
      }
    }
    controls.append(input);
    if (field.unitLabel || field.acceptedUnits.length > 1) controls.append(unit);
    else unit.hidden = true;
    wrap.append(label, controls);
    const rangeUnit = field.unitLabel || getUnit(field.range?.unit || field.canonicalUnit).symbol;
    const hints = [];
    if (field.required === false) hints.push('Optional — leave blank if this is the value you want to solve for');
    if (field.range?.min !== undefined) hints.push(`Minimum ${formatNumber(field.range.min)} ${rangeUnit}`);
    if (field.range?.max !== undefined) hints.push(`Maximum ${formatNumber(field.range.max)} ${rangeUnit}`);
    if (field.integer) hints.push('Whole number');
    if (field.allowMagnitudeWords) hints.push('Scale words: thousand, million, billion, trillion, lakh, crore (or 5k)');
    const hint = hints.join(' · ') || `Canonical unit: ${getUnit(field.canonicalUnit).symbol}`;
    wrap.append(node('small', 'field-help', hint));
    wrap.append(inputAssistant.createHelpButton(form, definition, field, { path: [definition.id] }));
    fields.append(wrap);
  }
  form.reset();
  form.onsubmit = event => runCalculation(event, definition);
  form.oninput = () => {
    currentResult = null;
    result.hidden = true;
    document.querySelector('#tool-error').hidden = true;
  };
  const dialog = document.querySelector('#tool-dialog');
  if (!dialog.open) dialog.showModal();
  requestAnimationFrame(() => form.querySelector('input')?.focus());
}

function runCalculation(event, definition) {
  event.preventDefault();
  const form = event.currentTarget;
  const error = document.querySelector('#tool-error');
  const resultSection = document.querySelector('#tool-result');
  error.hidden = true;
  if (!form.reportValidity()) return;
  const rawInputs = {};
  for (const field of definition.inputs) {
    const input = form.elements.namedItem(field.id);
    const unit = form.elements.namedItem(`${field.id}-unit`);
    rawInputs[field.id] = { value: input.value.trim(), unit: unit?.value || field.canonicalUnit };
  }
  try {
    const result = executeCalculation(definition, rawInputs, { locale });
    currentInputs = rawInputs;
    currentResult = result;
    renderResult(definition, rawInputs, result, resultSection);
  } catch (calculationError) {
    error.textContent = calculationError instanceof CalculationError
      ? calculationError.message
      : 'The calculation could not be completed. No result was produced.';
    error.hidden = false;
    resultSection.hidden = true;
    resultSection.replaceChildren();
  }
}

function displayOutput(definition, field, record, unitId = record.unit) {
  if (field.display?.format === 'percent') return `${formatNumber(record.value * 100)}%`;
  if (field.display?.format === 'scalar') return formatNumber(record.value);
  const value = unitId === record.unit ? record.value : convertValue(record.value, record.unit, unitId);
  return `${formatNumber(value)} ${getUnit(unitId).symbol}`;
}

function numericOutput(definition, field, record, unitId = record.unit) {
  if (field.display?.format === 'percent') return record.value * 100;
  if (field.display?.format === 'scalar') return record.value;
  return unitId === record.unit ? record.value : convertValue(record.value, record.unit, unitId);
}

function renderResult(definition, rawInputs, result, container) {
  container.replaceChildren();
  container.hidden = false;
  container.append(node('p', 'tool-result-heading', '✓ RESULT · METHOD VERSION ' + definition.version));
  const selectedUnits = {};
  for (const field of definition.outputs) {
    const record = result.outputs[field.id];
    const row = node('div', 'tool-output');
    row.append(node('span', 'tool-output-label', field.label));
    const output = node('div', 'tool-output-value');
    const value = node('strong', '', displayOutput(definition, field, record));
    const words = node('small', 'result-in-words');
    const updateWords = unitId => {
      const spelling = numberToEnglishWords(numericOutput(definition, field, record, unitId));
      words.textContent = spelling ? `In English words: ${spelling}` : '';
      words.hidden = !spelling;
    };
    updateWords(record.unit);
    output.append(value, words);
    if (field.acceptedUnits.length > 1 && !field.display?.format) {
      const select = node('select');
      select.setAttribute('aria-label', `${field.label} display unit`);
      for (const unitId of field.acceptedUnits) {
        const option = node('option', '', getUnit(unitId).symbol);
        option.value = unitId;
        option.selected = unitId === field.canonicalUnit;
        select.append(option);
      }
      select.addEventListener('change', () => {
        selectedUnits[field.id] = select.value;
        value.textContent = displayOutput(definition, field, record, select.value);
        updateWords(select.value);
      });
      output.append(select);
    }
    row.append(output);
    container.append(row);
  }
  const visual = renderCalculationVisual(definition, result, locale);
  if (visual) container.append(visual);
  const allOptions = compatibleNextSteps(definition, result, calculators);
  const recommendations = recommendNextSteps(definition, result, calculators, allOptions);
  if (recommendations.length) {
    const nextSteps = node('section', 'smart-next-steps');
    nextSteps.setAttribute('aria-label', 'Suggested next calculations');
    nextSteps.append(node('span', 'eyebrow', 'SMART NEXT STEP'), node('h3', '', 'Continue with this result'));
    for (const suggestion of recommendations) nextSteps.append(makeSuggestedStep(definition, rawInputs, result, suggestion));
    const visibleCompatibleCount = recommendations.filter(option => option.handoff).length;
    if (allOptions.length > visibleCompatibleCount) nextSteps.append(makeHandoffChooser(definition, rawInputs, result, allOptions));
    container.append(nextSteps);
  }
  const details = node('div', 'tool-result-details');
  const methodDetails = methodWorkingBlock(definition, result);
  methodDetails.id = 'tool-method-details';
  details.append(methodDetails);
  details.append(detailListBlock('Assumptions and limitations', [...definition.assumptions, ...definition.exclusions, ...definition.limitations]));
  details.append(detailReferences(definition));
  if (result.warnings.length) details.append(detailListBlock('Warnings', result.warnings));

  const actions = node('div', 'tool-result-actions');
  const save = node('button', 'button button-secondary', 'Save result to history');
  save.type = 'button';
  save.addEventListener('click', () => saveResult(definition, rawInputs, result));
  const methodButton = node('button', 'button button-quiet', 'Show method details ↓');
  methodButton.type = 'button';
  methodButton.setAttribute('aria-controls', methodDetails.id);
  methodButton.setAttribute('aria-expanded', 'false');
  methodDetails.addEventListener('toggle', () => {
    methodButton.textContent = methodDetails.open ? 'Hide method details ↑' : 'Show method details ↓';
    methodButton.setAttribute('aria-expanded', String(methodDetails.open));
  });
  methodButton.addEventListener('click', () => {
    if (methodDetails.open) {
      methodDetails.open = false;
      return;
    }
    methodDetails.open = true;
    methodDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    methodDetails.querySelector('summary')?.focus({ preventScroll: true });
  });
  actions.append(save, methodButton);
  container.append(actions);
  container.append(details);
}

function makeSuggestedStep(definition, rawInputs, result, suggestion) {
  const button = node('button', 'smart-next-step-button');
  button.type = 'button';
  button.append(node('strong', '', suggestion.handoff ? suggestion.targetDefinition.title : `Explore ${suggestion.targetDefinition.title}`), node('span', '', suggestion.handoff ? `${suggestion.reason} “${suggestion.inputField.label}” will be prefilled and remain editable.` : `${suggestion.reason} This is an optional related tool, with no automatic value transfer.`));
  button.addEventListener('click', () => {
    if (suggestion.handoff) continueRecommendedWorkflow(definition, rawInputs, result, suggestion);
    else location.href = calculatorPath(suggestion.targetDefinition.id);
  });
  return button;
}

function makeHandoffChooser(definition, rawInputs, result, options) {
  const details = node('details', 'handoff-chooser');
  details.append(node('summary', '', `Choose from ${options.length} compatible next steps`));
  const content = node('div', 'handoff-chooser-content');
  content.append(node('p', '', 'Choose a calculator and input that fit your next question. The selected result will be carried into that input, where you can review or change it.'));
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
  const reason = node('p', 'handoff-selected-reason', 'Choose a step to see why it may help.');
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
    reason.textContent = option ? `${option.reason} The value will fill “${option.inputField.label}” and stay editable.` : 'Choose a step to see why it may help.';
  });
  carry.addEventListener('click', () => {
    const option = options[Number(select.value)];
    if (option) continueRecommendedWorkflow(definition, rawInputs, result, option);
  });
  content.append(search, select, reason, carry);
  details.append(content);
  return details;
}

function detailBlock(title, copy) {
  const details = node('details');
  details.append(node('summary', '', title));
  details.append(node('p', '', copy));
  return details;
}

function methodWorkingBlock(definition, result) {
  const details = node('details');
  details.append(node('summary', '', 'Method and working'));
  const content = node('div', 'details-copy');
  content.append(node('p', '', definition.method.description));
  content.append(node('p', '', `Method version ${definition.version}; unit registry ${result.unitRegistryVersion}; numeric model ${definition.precision.numericModel}.`));
  const known = node('ul', 'intermediate-list');
  for (const field of definition.inputs) {
    const input = result.inputs[field.id];
    if (!input) continue;
    const entered = input.enteredText ?? formatNumber(input.enteredValue);
    const enteredUnit = field.unitLabel || getUnit(input.enteredUnit).symbol;
    let description = `${field.label}: ${entered} ${enteredUnit}`;
    if (input.enteredText && input.enteredText.trim() !== String(input.enteredValue)) description += ` (parsed as ${formatNumber(input.enteredValue)})`;
    if (input.enteredUnit !== input.canonicalUnit || input.enteredValue !== input.canonicalValue) {
      description += ` → ${formatNumber(input.canonicalValue)} ${getUnit(input.canonicalUnit).symbol} after unit normalization`;
    }
    known.append(node('li', '', description));
  }
  if (known.childElementCount) {
    content.append(node('strong', '', 'Given values'));
    content.append(known);
  }
  if (Array.isArray(result.intermediates?.steps) && result.intermediates.steps.length) {
    content.append(node('strong', '', 'Working steps'));
    const ordered = node('ol', 'intermediate-list');
    for (const step of result.intermediates.steps) ordered.append(node('li', '', step));
    content.append(ordered);
  }
  details.append(content);
  return details;
}

function detailListBlock(title, items) {
  const details = node('details');
  details.append(node('summary', '', title));
  const list = node('ul');
  for (const item of items) list.append(node('li', '', item));
  details.append(list);
  return details;
}

function detailReferences(definition) {
  const details = node('details');
  details.append(node('summary', '', 'Sources and review record'));
  const list = node('ul');
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
  details.append(list);
  const release = definition.release;
  details.append(node('p', '', `Release record: ${release.status}; risk class ${definition.riskClass}. ${release.reviewers?.map(item => item.qualification).join('; ') || 'Review record unavailable.'}`));
  return details;
}

function resultSummary(definition, result) {
  return definition.outputs.map(field => `${field.label}: ${displayOutput(definition, field, result.outputs[field.id])}`).join(' · ');
}

function saveResult(definition, rawInputs, result) {
  const outcome = saveHistoryRecord({
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: 'calculator', calculatorId: definition.id, calculatorTitle: definition.title,
    methodVersion: definition.version, calculatedAt: result.calculatedAt, locale,
    rawInputs, result, workflow: null, route: calculatorPath(definition.id),
    summary: resultSummary(definition, result),
  });
  if (outcome.saved) showToast('Saved to this device’s calculation history.');
  else if (outcome.reason === 'limit') showToast('History has reached its 100-entry limit. Delete an entry before saving another.');
  else if (outcome.reason === 'paused') showToast('History saving is paused in your settings.');
  else if (outcome.reason === 'storage-full') showToast('This browser’s local storage is full. Delete saved entries and try again.');
  else showToast('This browser could not save local history.');
}

function continueRecommendedWorkflow(sourceDefinition, rawInputs, sourceResult, suggestion) {
  const { targetDefinition, handoff } = suggestion;
  const context = { steps: [{ calculatorId: sourceDefinition.id, methodVersion: sourceDefinition.version, inputs: rawInputs, result: sourceResult }] };
  try {
    sessionStorage.setItem('nexora.pending-workflow.v1', JSON.stringify({ handoff, context }));
    location.href = calculatorPath(targetDefinition.id);
  } catch {
    showToast('This browser could not open the next workflow step. You can still use the volume calculator directly.');
  }
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function setupSearch() {
  const input = document.querySelector('#catalog-search');
  const form = document.querySelector('#calculatorSearchForm');
  input?.addEventListener('input', () => {
    activeQuery = input.value.trim();
    activeCategory = 'All tools';
    favoritesOnly = false;
    catalogVisibleLimit = CATALOG_PAGE_SIZE;
    renderCatalog();
    renderFields();
  });
  form?.addEventListener('submit', event => {
    event.preventDefault();
    document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.querySelector('#clear-search')?.addEventListener('click', clearSearch);
  document.querySelector('#reset-search')?.addEventListener('click', clearSearch);
  document.querySelector('#focus-search')?.addEventListener('click', () => {
    document.querySelector('#catalog-search')?.focus();
    document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.querySelector('#favorites-filter')?.addEventListener('click', () => {
    favoritesOnly = !favoritesOnly;
    catalogVisibleLimit = CATALOG_PAGE_SIZE;
    renderCatalog();
  });
  document.querySelector('#catalog-load-more')?.addEventListener('click', () => {
    catalogVisibleLimit += CATALOG_PAGE_SIZE;
    renderCatalog();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== '/' && !(event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
    event.preventDefault();
    document.querySelector('#catalog-search')?.focus();
  });
}

function clearSearch() {
  activeQuery = '';
  favoritesOnly = false;
  activeCategory = 'All tools';
  catalogVisibleLimit = CATALOG_PAGE_SIZE;
  const input = document.querySelector('#catalog-search');
  if (input) input.value = '';
  renderCatalog();
  renderFields();
  input?.focus();
}

function setupNavigation() {
  const button = document.querySelector('#mobile-menu-button');
  const nav = document.querySelector('#main-navigation');
  button?.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
    button.replaceChildren(makeIcon(expanded ? 'menu' : 'close', 'ui-icon'));
    nav?.classList.toggle('open', !expanded);
  });
  nav?.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    nav.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    button?.setAttribute('aria-label', 'Open navigation menu');
    if (button) button.replaceChildren(makeIcon('menu', 'ui-icon'));
  });
  document.querySelector('#close-tool-dialog')?.addEventListener('click', () => document.querySelector('#tool-dialog')?.close());
  document.querySelector('#tool-dialog')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  document.querySelector('#toggle-fields')?.addEventListener('click', () => {
    showAllFields = !showAllFields;
    renderFields();
  });
}

function setupLocale() {
  if (localeSelect && localeSupported.has(locale)) localeSelect.value = locale;
  localeSelect?.addEventListener('change', () => {
    if (localeSupported.has(localeSelect.value)) locale = localeSelect.value;
    renderCatalog();
    renderFields();
  });
  document.addEventListener('nexora:locale-change', () => {
    const value = localeSelect?.value;
    if (localeSupported.has(value)) locale = value;
    renderCatalog();
    renderFields();
  });
}

function setupFeedbackPrefill() {
  const params = new URLSearchParams(location.search);
  const feedbackType = document.querySelector('#feedbackType');
  const message = document.querySelector('#feedbackMessage');
  if (params.has('feedback') && feedbackType) {
    const requested = params.get('feedback');
    feedbackType.value = ['idea', 'usability', 'calculation', 'accessibility'].includes(requested) ? requested : 'calculation';
    const calculatorId = params.get('calculator');
    if (message && calculatorId && calculatorById.has(calculatorId)) message.value = `Possible issue with ${calculatorById.get(calculatorId).title}: `;
    const field = params.get('field');
    if (message && field && FIELD_DIRECTORY.includes(field)) message.value = `Calculator suggestion for ${field}: `;
    setTimeout(() => document.querySelector('#feedback')?.scrollIntoView({ behavior: 'smooth' }), 150);
  }
}

setupSearch();
setupNavigation();
setupLocale();
setupFeedbackPrefill();
setupScrollReveals();
setupCardHighlight();
renderCatalog();
renderFields();
