import test from 'node:test';
import assert from 'node:assert/strict';
import {executeCalculation} from '../../src/calculation-core/index.mjs';
import {ohmsLaw} from '../../catalog/public/ohms-law.mjs';
import {rectangleArea} from '../../catalog/public/rectangle-area.mjs';

test('browser-shaped blank optional inputs solve all three Ohm law unknowns',()=>{
  const cases=[
    [{voltage:{value:'',unit:'mV'},current:{value:'32',unit:'A'},resistance:{value:'12',unit:'ohm'}},'voltage',384],
    [{voltage:{value:'12000',unit:'mV'},current:{value:'  ',unit:'mA'},resistance:{value:'3',unit:'ohm'}},'current',4],
    [{voltage:{value:'12',unit:'V'},current:{value:'4000',unit:'mA'},resistance:{value:null,unit:'kohm'}},'resistance',3],
  ];
  for(const [input,output,expected]of cases){const result=executeCalculation(ohmsLaw,input);assert.equal(result.outputs[output].value,expected);assert.ok(!Object.hasOwn(result.inputs,output));}
});
test('blank required fields still fail, zero is supplied, and overdetermined input is rejected',()=>{
  assert.throws(()=>executeCalculation(rectangleArea,{length:{value:' ',unit:'m'},width:{value:2,unit:'m'}}),e=>e.code==='MISSING_INPUT');
  assert.equal(executeCalculation(ohmsLaw,{voltage:{value:'',unit:'V'},current:{value:'0',unit:'A'},resistance:{value:10,unit:'ohm'}}).outputs.voltage.value,0);
  assert.throws(()=>executeCalculation(ohmsLaw,{voltage:{value:12,unit:'V'},current:{value:4,unit:'A'},resistance:{value:3,unit:'ohm'}}),e=>e.code==='OHMS_LAW_REQUIRES_TWO_VALUES');
  assert.throws(()=>executeCalculation(ohmsLaw,{voltage:{value:0,unit:'V'},current:{value:4,unit:'A'},resistance:{value:'',unit:'ohm'}}),e=>e.code==='POSITIVE_RESISTANCE_REQUIRED');
});
