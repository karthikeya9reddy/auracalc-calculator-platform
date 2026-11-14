import { listPublicCalculators } from '/catalog/public/formulas.mjs';
import { FIELD_DIRECTORY } from '/catalog/field-directory.mjs';
import { createFieldToolIndex } from '/catalog/field-tool-index.mjs';
import { fieldRoute } from '/catalog/field-route.mjs';
import { catalogTopics } from './catalog-topics.mjs';
import { makeSearchIndex, searchIndex, searchTokens, matchesSearchText } from './unified-search.mjs';
import { MEASUREMENT_TOOLS } from './measurement-search.mjs';
import { attachConversionQuery } from './conversion-query.mjs';

const calculators = listPublicCalculators();
let converterSearchIndex;
let converterSearchRequest;
let converterSearchUnavailable = false;
let calculatorSearchIndex;
let measurementSearchIndex;

function loadConverterSearch() {
  if (converterSearchRequest) return;
  converterSearchUnavailable = false;
  converterSearchRequest = import('/catalog/public/converters.mjs')
    .then(({ listPublicConverters }) => {
      converterSearchIndex = makeSearchIndex(listPublicConverters());
    })
    .catch(() => {
      converterSearchUnavailable = true;
      converterSearchRequest = null;
    })
    .then(() => {
      if (activeQuery) renderSearchAdditions();
    });
}

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

function formatNumber(value, options = {}) {
  return formatResultNumber(value, locale, options);
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

function matchingCalculators() {
  const hasTokens = searchTokens(activeQuery).length > 0;
  const candidates = hasTokens
    ? searchIndex(calculatorSearchIndex ??= makeSearchIndex(calculators), activeQuery, Infinity)
    : calculators;
  return candidates.filter(definition => {
    if (activeCategory !== 'All tools' && definition.category !== activeCategory) return false;
    if (favoritesOnly && !favorites.includes(definition.id)) return false;
    return hasTokens || !/convert|conversion/i.test(activeQuery);
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

function renderSearchAdditions(itemCount = matchingCalculators().length) {
  const additions = document.querySelector('#unified-search-additions');
  let extraMatches = 0;
  if (additions) {
    additions.replaceChildren();
    const query = activeQuery.trim();
    additions.hidden = !query || favoritesOnly;
    if (query && !favoritesOnly) {
      const matchingFields = FIELD_DIRECTORY.filter(field => searchTokens(query).length && matchesSearchText(field, query)).slice(0, 6);
      const matchingConversions = converterSearchIndex ? searchIndex(converterSearchIndex, query, 8) : [];
      if (!converterSearchIndex && !converterSearchUnavailable) loadConverterSearch();
      const matchingMeasurements = searchIndex(measurementSearchIndex ??= makeSearchIndex(MEASUREMENT_TOOLS), query, 3);
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
      if (matchingConversions.length || currencyMatch || /convert|conversion/i.test(query) || !converterSearchIndex) {
        const section = node('section', 'search-result-group'); section.append(node('h3', '', 'Converters'));
        const links = node('div', 'search-result-links');
        if (currencyMatch) { const currency = node('a', '', 'Currency exchange rates'); currency.href = '/currency/'; links.append(currency); extraMatches++; }
        for (const conversion of matchingConversions) { const link = node('a', '', conversion.title); link.href = `/converters/${encodeURIComponent(conversion.id)}/`; attachConversionQuery(link, conversion, query); links.append(link); }
        const all = node('a', 'search-all-converters', 'Browse all converters ↗'); all.href = '/converters/'; links.append(all);
        section.append(links);
        if (!converterSearchIndex) section.append(node('p', 'search-description', converterSearchUnavailable
          ? 'Converter search is unavailable. Use Browse all converters or try another search.'
          : 'Loading converter search…'));
        additions.append(section); extraMatches += matchingConversions.length + 1;
      }
      additions.hidden = !additions.childElementCount;
    }
  }
  updateSearchStatus(itemCount, extraMatches);
}

let renderedCategory;
function renderCatalog() {
  const grid = document.querySelector('#auraCalculatorGrid');
  if (!grid) return;
  if (renderedCategory !== activeCategory) {
    renderCategories();
    renderedCategory = activeCategory;
  }
  const items = matchingCalculators();
  renderSearchAdditions(items.length);
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
  const truth = document.querySelector('#catalog-truth-text');
  if (truth) truth.textContent = `${calculators.length} formula-based calculators are currently in the live catalog. Unit converters are listed separately and are not included in this count.`;
}

function updateSearchStatus(itemCount, extraMatches) {
  const count = document.querySelector('#search-count');
  if (count) count.textContent = activeQuery || favoritesOnly || activeCategory !== 'All tools'
    ? `${itemCount} ${itemCount === 1 ? 'calculator' : 'calculators'}${extraMatches ? ` · ${extraMatches} more suggestions` : ''}`
    : `${calculators.length} live formula ${calculators.length === 1 ? 'calculator' : 'calculators'}`;
  const empty = document.querySelector('#empty-state');
  if (empty) {
    empty.hidden = itemCount > 0 || extraMatches > 0;
    const message = empty.querySelector('p');
    if (message) message.textContent = 'No live calculator matches that search yet.';
  }
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
  const shown = showAllFields ? FIELD_DIRECTORY : FIELD_DIRECTORY.filter(name => fieldHighlights.includes(name));
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
  if (status) status.textContent = showAllFields
    ? `Showing all ${FIELD_DIRECTORY.length} research field groups.`
    : 'Showing six highlighted research groups.';
  if (toggle) {
    toggle.setAttribute('aria-expanded', String(showAllFields));
    toggle.innerHTML = showAllFields ? 'Show highlights <span aria-hidden="true">↑</span>' : `View all ${FIELD_DIRECTORY.length} fields <span aria-hidden="true">↓</span>`;
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
  const updateQuery = () => {
    converterSearchUnavailable = false;
    activeQuery = input.value.trim();
    activeCategory = 'All tools';
    favoritesOnly = false;
    catalogVisibleLimit = CATALOG_PAGE_SIZE;
    renderCatalog();
  };
  let pendingSearch;
  input?.addEventListener('input', event => {
    clearTimeout(pendingSearch);
    if (!event.isComposing) pendingSearch = setTimeout(updateQuery, 110);
  });
  form?.addEventListener('submit', event => {
    event.preventDefault();
    clearTimeout(pendingSearch);
    updateQuery();
    const results = document.querySelector('#catalog-title');
    results?.focus({ preventScroll: true });
    results?.scrollIntoView({ block: 'start' });
  });
  input?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      if (input.value.trim() !== activeQuery) {
        clearTimeout(pendingSearch);
        updateQuery();
      }
      const formula = document.querySelector('#auraCalculatorGrid .calc-card');
      const converter = document.querySelector('#unified-search-additions:not([hidden]) a[href^="/converters/convert-"]');
      const wantsConversion = /\b(?:to|into)\b/i.test(activeQuery);
      const first = (wantsConversion && converter) || formula || document.querySelector('#unified-search-additions:not([hidden]) a');
      if (first) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'Escape') {
      clearTimeout(pendingSearch);
      clearSearch();
    }
  });
  document.querySelector('#clear-search')?.addEventListener('click', clearSearch);
  document.querySelector('#reset-search')?.addEventListener('click', clearSearch);
  document.querySelector('#focus-search')?.addEventListener('click', () => {
    document.querySelector('#catalog-search')?.focus();
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
  document.querySelector('#toggle-fields')?.addEventListener('click', () => {
    showAllFields = !showAllFields;
    renderFields();
  });
}

function setupLocale() {
  if (localeSelect && localeSupported.has(locale)) localeSelect.value = locale;
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
