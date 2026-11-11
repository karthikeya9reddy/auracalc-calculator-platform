import { matchesSearchText } from './unified-search.mjs';

const input = document.querySelector('#field-directory-search');
const grid = document.querySelector('#field-directory-grid');
const status = document.querySelector('#field-directory-status');
const empty = document.querySelector('#field-directory-empty');
const cards = [...(grid?.querySelectorAll('[data-field-name]') || [])];

function normalize(value) {
  return String(value || '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

input?.addEventListener('input', () => {
  const query = normalize(input.value);
  let visible = 0;
  for (const card of cards) {
    const matches = matchesSearchText(card.dataset.fieldName, query);
    card.hidden = !matches;
    if (matches) visible += 1;
  }
  if (status) status.textContent = query ? `${visible} ${visible === 1 ? 'field' : 'fields'} match “${input.value.trim()}”.` : `Showing all ${cards.length} fields.`;
  if (empty) empty.hidden = visible > 0;
});

const menuButton = document.querySelector('#fieldDirectoryMenu');
const navigation = document.querySelector('#fieldDirectoryNavigation');
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
