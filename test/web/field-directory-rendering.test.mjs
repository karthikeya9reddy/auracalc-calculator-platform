import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FIELD_DIRECTORY } from '../../catalog/field-directory.mjs';
import { createFieldToolIndex } from '../../catalog/field-tool-index.mjs';
import { fieldRoute } from '../../catalog/field-route.mjs';
import { publicDefinitions } from '../../catalog/public/index.mjs';

test('generated field pages group and link every matching calculator exactly once', async () => {
  const index = createFieldToolIndex(publicDefinitions);
  for (const field of FIELD_DIRECTORY) {
    const html = await readFile(new URL(`../../web${fieldRoute(field)}index.html`, import.meta.url), 'utf8');
    const expected = index.get(field);
    assert.equal((html.match(/data-field-tool data-search=/g) || []).length, expected.length, field);
    assert.equal((html.match(/data-field-group/g) || []).length, new Set(expected.map(tool => tool.category)).size, field);
    for (const definition of expected) assert.ok(html.includes(`/calculators/${encodeURIComponent(definition.id)}/`), `${field}: ${definition.id}`);
  }
});
