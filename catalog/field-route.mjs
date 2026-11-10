export function fieldSlug(fieldName) {
  const slug = String(fieldName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) throw new TypeError('A field name must produce a non-empty URL slug.');
  return slug;
}

export function fieldRoute(fieldName) {
  return `/fields/${fieldSlug(fieldName)}/`;
}
