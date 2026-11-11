import { matchesSearchText } from './unified-search.mjs';

const search = document.querySelector('#field-calculator-search');
const status = document.querySelector('#field-calculator-status');
const more = document.querySelector('#field-tools-more');
const cards = [...document.querySelectorAll('[data-field-tool]')];
const pageSize = 20;
let query = '';
let visibleCount = pageSize;

function render() {
  const matching = cards.filter(card => !query || matchesSearchText(card.dataset.search, query));
  for (const card of cards) card.hidden = !matching.slice(0, visibleCount).includes(card);
  for (const group of document.querySelectorAll('[data-field-group]')) group.hidden = ![...group.querySelectorAll('[data-field-tool]')].some(card => !card.hidden);
  const shown = Math.min(matching.length, visibleCount);
  if (status) status.textContent = query
    ? `Showing ${shown} of ${matching.length} matching calculators (${cards.length} in this field).`
    : `Showing ${shown} of ${cards.length} calculators.`;
  if (more) {
    more.hidden = shown >= matching.length;
    more.textContent = `Show next ${Math.min(pageSize, matching.length - shown)} calculators`;
  }
}

search?.addEventListener('input', () => {
  query = search.value.toLocaleLowerCase().trim();
  visibleCount = pageSize;
  render();
});
more?.addEventListener('click', () => {
  visibleCount += pageSize;
  render();
});

render();

const menuButton = document.querySelector('#calculatorPageMenu');
const navigation = document.querySelector('#calculatorPageNavigation');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  navigation?.classList.toggle('open', open);
});
navigation?.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  navigation.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation menu');
});
