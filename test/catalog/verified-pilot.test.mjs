import test from 'node:test';
import assert from 'node:assert/strict';
import { verifiedPilot } from '../../catalog/public/verified-pilot.mjs';
import { publicDefinitions } from '../../catalog/public/index.mjs';
import { executeCalculation, createWorkflowHandoff } from '../../src/calculation-core/index.mjs';
const [radiation,sound]=verifiedPilot;
const run=(definition,values)=>executeCalculation(definition,Object.fromEntries(definition.inputs.map(f=>[f.id,typeof values[f.id]==='object'?values[f.id]:{value:values[f.id],unit:f.canonicalUnit}])));
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<=1e-10*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);
test('radiation textbook cases, sign symmetry, mixed temperature units and emissivity bounds',()=>{
  const v={area:1,emissivity:1,surface:100,surroundings:0};
  close(run(radiation,v).outputs.power.value,5.67);
  close(run(radiation,{...v,surface:0,surroundings:100}).outputs.power.value,-5.67);
  close(run(radiation,{...v,surface:{value:26.85,unit:'degC'},surroundings:300}).outputs.power.value,0);
  close(run(radiation,{...v,emissivity:0}).outputs.power.value,0);
  assert.throws(()=>run(radiation,{...v,emissivity:1.01}));
  assert.throws(()=>run(radiation,{...v,surface:{value:-274,unit:'degC'}}));
  for(let area=1;area<=20;area++) close(run(radiation,{...v,area}).outputs.power.value,5.67*area);
});
test('sound logarithmic reference cases, small values and scalar handoff restrictions',()=>{
  close(run(sound,{intensity:1e-12}).outputs.level.value,0);
  close(run(sound,{intensity:1e-4}).outputs.level.value,80);
  close(run(sound,{intensity:1e-13}).outputs.level.value,-10);
  close(run(sound,{intensity:2e-4}).outputs.level.value,83.01029995663981);
  assert.ok(Number.isFinite(run(sound,{intensity:1e300}).outputs.level.value));
  assert.throws(()=>run(sound,{intensity:0}));
  const target=publicDefinitions.find(x=>x.id==='percentage-of-amount');
  assert.throws(()=>createWorkflowHandoff({sourceDefinition:sound,sourceResult:run(sound,{intensity:1e-4}),outputId:'level',targetDefinition:target,inputId:target.inputs[0].id}),{code:'WORKFLOW_SEMANTIC_MISMATCH'});
});
