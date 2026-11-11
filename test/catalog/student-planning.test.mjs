import test from 'node:test';
import assert from 'node:assert/strict';
import {studentPlanning} from '../../catalog/public/student-planning.mjs';
import {executeCalculation} from '../../src/calculation-core/index.mjs';
const run=(i,v)=>executeCalculation(studentPlanning[i],v);
test('final grade solver handles known cases, bounds, impossible targets and inverse reconstruction',()=>{
  assert.equal(run(0,{current:84,target:80,weight:25}).outputs.required.value,.68);
  assert.equal(run(0,{current:80,target:90,weight:50}).outputs.required.value,1);
  assert.ok(run(0,{current:10,target:100,weight:10}).warnings.length);
  assert.ok(run(0,{current:100,target:10,weight:10}).outputs.required.value<0);
  assert.equal(run(0,{current:13,target:75,weight:100}).outputs.required.value,.75);
  assert.throws(()=>run(0,{current:80,target:80,weight:0}));assert.throws(()=>run(0,{current:101,target:80,weight:20}));
  for(let weight=1;weight<=100;weight++){const r=run(0,{current:73,target:82,weight});assert.ok(Math.abs(73*(1-weight/100)+r.outputs.required.value*weight-82)<1e-9);}
});
test('GPA target solver accounts for credits and explicitly rejects inconsistent scales',()=>{
  const v={current:3,completed:60,target:3.2,future:30,scale:4};assert.ok(Math.abs(run(1,v).outputs.required.value-3.6)<1e-12);
  assert.equal(run(1,{...v,completed:0}).outputs.required.value,3.2);
  assert.ok(run(1,{...v,target:4,future:1}).warnings.length);
  assert.throws(()=>run(1,{...v,future:0}));assert.throws(()=>run(1,{...v,scale:2}));
});
