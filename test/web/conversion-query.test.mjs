import test from 'node:test';
import assert from 'node:assert/strict';
import { conversionQuery } from '../../web/conversion-query.mjs';
import { listPublicConverters } from '../../catalog/public/index.mjs';
test('explicit conversion quantities prefill only the exact directed converter',()=>{
  const tool=listPublicConverters().find(x=>x.id==='convert-newtons-to-pounds-force');
  assert.equal(conversionQuery(tool,'500 N to lbf').inputs.value.value,500);
  assert.equal(conversionQuery(tool,'-2e3 newtons to pounds-force').inputs.value.value,-2000);
  for(const query of ['500 lbf to N','500 N to kg','5,000 N to lbf','1e999 N to lbf','500 newtoms to pounds-force']) assert.equal(conversionQuery(tool,query),null,query);
});
