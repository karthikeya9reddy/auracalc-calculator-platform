import test from 'node:test';
import assert from 'node:assert/strict';
import { historyRecordUsable, historyRecordRoute } from '../../web/history-record.mjs';
test('saved entries are validated without modifying original data or following stored URLs',()=>{
  const record={id:'1',calculatorId:'average-speed',route:'javascript:alert(1)',rawInputs:{},result:{outputs:{speed:{value:4,unit:'m/s'}}}};
  assert.equal(historyRecordUsable(record),true);
  assert.equal(historyRecordRoute(record),'/calculators/average-speed/');
  assert.equal(record.route,'javascript:alert(1)');
  assert.equal(historyRecordUsable({id:'broken'}),false);
  assert.equal(historyRecordUsable({...record,result:{outputs:{speed:{value:4,unit:'unknown'}}}}),false);
  assert.equal(historyRecordUsable({...record,result:{outputs:{speed:null}}}),false);
  assert.throws(()=>historyRecordRoute({calculatorId:'../../'}));
  assert.equal(historyRecordRoute({kind:'currency-conversion'}),'/currency/');
});
