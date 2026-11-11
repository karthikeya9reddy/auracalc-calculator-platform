import test from 'node:test';
import assert from 'node:assert/strict';
import { MEASUREMENT_TOOLS, measurementMode } from '../../web/measurement-search.mjs';
import { makeSearchIndex, searchIndex } from '../../web/unified-search.mjs';

test('measurement tools have distinct searchable routes', () => {
  const index = makeSearchIndex(MEASUREMENT_TOOLS);
  assert.equal(searchIndex(index, 'gps speedometer')[0].href, '/measure/speed/');
  assert.equal(searchIndex(index, 'ar distance')[0].href, '/measure/ar/');
  assert.equal(searchIndex(index, 'photo ruler')[0].href, '/measure/photo/');
  assert.equal(measurementMode('?mode=ar'), 'ar');
  assert.equal(measurementMode('', 'speed'), 'speed');
  assert.equal(measurementMode('?mode=unknown'), 'photo');
});
