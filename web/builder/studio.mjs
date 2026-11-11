import { parseFormula, evaluateFormulaDetailed, sampleFormula } from '../builder-core.mjs';
import { parseLocalizedNumber } from '/src/calculation-core/index.mjs';
import { saveHistoryRecord } from '../storage.mjs';
import { formatResultNumber } from '../result-number.mjs';

const $ = id => document.getElementById(id);
const key = 'auracalc.personal-formulas.v1';
const formula = $('builder-formula'), name = $('builder-name'), form = $('builder-inputs'), status = $('builder-status');
let compiled, lastResult, activeExpression = '', scenarios = [], locale = 'en-US';
try { const l = localStorage.getItem('nexora.locale.v1'); if (['en-US','en-GB','de-DE','fr-FR','hi-IN'].includes(l)) locale=l; } catch {}
const fmt = n => formatResultNumber(n, locale);
const inputFmt = n => new Intl.NumberFormat(locale,{useGrouping:false,maximumSignificantDigits:17}).format(n);
const templates = [
  ['Blank canvas','',{}],
  ['Room area','length * width',{length:5,width:4}],
  ['Circle area','pi() * radius^2',{radius:3}],
  ['Hypotenuse','sqrt(a^2 + b^2)',{a:3,b:4}],
  ['Price with margin','cost / (1 - margin / 100)',{cost:80,margin:20}],
  ['Compound growth','principal * (1 + rate / 100)^years',{principal:1000,rate:5,years:10}],
];
function node(tag,text,className) { const el=document.createElement(tag); if(text!==undefined)el.textContent=text;if(className)el.className=className;return el; }
function readSaved() { try { const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data.filter(r=>typeof r?.name==='string' && typeof r.expression==='string').slice(0,20):[]; }catch{return [];} }
function rawValues() { return Object.fromEntries([...form.querySelectorAll('input')].map(i=>[i.name,i.value])); }
function invalidate() {lastResult=null;$('builder-result').textContent='—';for(const id of ['builder-history','builder-pin','builder-export'])$(id).disabled=true;$('builder-steps').replaceChildren();$('builder-sweep-result').replaceChildren();}
function prepare(preset=null) {
  const previous=preset || rawValues(); invalidate();
  try {
    const next=parseFormula(formula.value); compiled=next;activeExpression=formula.value;
    form.replaceChildren();
    next.variables.forEach(variable=>{const label=node('label',variable);const input=node('input');input.name=variable;input.id=`variable-${variable}`;input.inputMode='decimal';input.type='text';input.autocomplete='off';input.placeholder=`Enter ${variable}`;input.value=typeof previous[variable]==='number'?inputFmt(previous[variable]):previous[variable]||'';input.addEventListener('input',()=>{invalidate();status.textContent='Values changed. Calculate to update the result.';});label.append(input);form.append(label);});
    $('builder-input-count').textContent=`${next.variables.length} inputs`;
    $('builder-sweep-variable').replaceChildren(...next.variables.map(v=>{const o=node('option',v);o.value=v;return o;}));
    $('builder-sweep').disabled=!next.variables.length;
    status.textContent=next.variables.length?`Ready for your values · ${locale} number format.`:'No inputs needed. Calculate the expression.';
    return true;
  }catch(error){compiled=null;status.textContent=error.message;return false;}
}
function values(except=null) {const result=Object.create(null);for(const v of compiled.variables) if(v!==except)result[v]=parseLocalizedNumber(form.elements.namedItem(v).value,locale);return result;}
function run() {
  if(activeExpression!==formula.value || !compiled)if(!prepare())return;
  try {
    const inputs=values();const result=evaluateFormulaDetailed(compiled.tree,inputs);
    lastResult={...result,values:inputs,expression:formula.value,at:new Date().toISOString()};
    $('builder-result').textContent=fmt(result.value);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) $('builder-result').animate([{opacity:.35,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
    $('builder-steps').replaceChildren(...result.steps.map(step=>node('li',`${step.expression} = ${fmt(step.value)}`)));
    for(const id of ['builder-history','builder-pin','builder-export'])$(id).disabled=false;
    status.textContent='Result ready. Inspect the working, compare a scenario, or save your calculator.';
  }catch(error){invalidate();status.textContent=error.message;}
}
function renderSaved() {
  const list=$('builder-saved');list.replaceChildren();const records=readSaved();
  $('builder-saved-count').textContent=String(records.length);
  if(!records.length){list.append(node('p','Your reusable calculators will appear here.','studio-empty'));return;}
  for(const record of records){const row=node('article',undefined,'studio-saved');const open=node('button');open.type='button';open.className='studio-saved-open';open.append(node('strong',record.name),node('code',record.expression));open.addEventListener('click',()=>{name.value=record.name;formula.value=record.expression;scenarios=[];renderScenarios();prepare(record.values||{});$('builder-sweep-result').replaceChildren();formula.focus();});const remove=node('button','Remove','studio-text-button');remove.type='button';remove.setAttribute('aria-label',`Remove saved ${record.name}`);remove.addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify(readSaved().filter(r=>r.name!==record.name)));renderSaved();}catch{status.textContent='Your browser could not update saved calculators.';}});row.append(open,remove);list.append(row);}
}
function renderScenarios(){
  const target=$('builder-scenarios');target.replaceChildren();
  if(!scenarios.length){target.append(node('p','Calculate, then pin up to four variations to compare their inputs and answers.','studio-empty'));return;}
  scenarios.forEach((s,index)=>{const article=node('article',undefined,'scenario-tile');article.append(node('span',`SCENARIO ${index+1}`),node('strong',fmt(s.value)),node('code',s.expression));const dl=node('dl');for(const [k,v]of Object.entries(s.values))dl.append(node('dt',k),node('dd',fmt(v)));const restore=node('button','Use these inputs','studio-text-button');restore.type='button';restore.addEventListener('click',()=>{formula.value=s.expression;prepare(s.values);run();});article.append(dl,restore);target.append(article);});
}
function download(text,filename){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=node('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('builder-prepare').addEventListener('click',()=>prepare());
$('builder-run').addEventListener('click',run);
form.addEventListener('submit',e=>{e.preventDefault();run();});
formula.addEventListener('input',()=>{invalidate();$('builder-sweep-result').replaceChildren();status.textContent='Formula edited. Set up inputs or calculate; matching input values are retained.';});
formula.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run();}});
$('builder-template').addEventListener('change',e=>{const [title,expression,preset]=templates[Number(e.target.value)];name.value=title==='Blank canvas'?'':title;formula.value=expression;scenarios=[];renderScenarios();prepare(preset);$('builder-sweep-result').replaceChildren();});
$('builder-pin').addEventListener('click',()=>{if(!lastResult)return;if(scenarios.length===4){status.textContent='Four scenarios are pinned. Clear the comparison to start another.';return;}scenarios.push(structuredClone(lastResult));renderScenarios();status.textContent=`Scenario ${scenarios.length} pinned. Change inputs and calculate another.`;});
$('builder-clear-scenarios').addEventListener('click',()=>{scenarios=[];renderScenarios();});
$('builder-save').addEventListener('click',()=>{
  try {parseFormula(formula.value);const title=name.value.trim();if(!title)throw new Error('Give your calculator a name first.');const records=readSaved();const item={name:title,expression:formula.value.trim(),values:rawValues(),version:2};const index=records.findIndex(r=>r.name.toLowerCase()===title.toLowerCase());if(index>=0)records[index]=item;else{if(records.length>=20)throw new Error('You can save 20 personal calculators on this device.');records.push(item);}localStorage.setItem(key,JSON.stringify(records));renderSaved();status.textContent='Calculator and current inputs saved on this device.';}catch(error){status.textContent=error.message;}
});
$('builder-history').addEventListener('click',()=>{if(!lastResult)return;const r=lastResult;const rawInputs=Object.fromEntries(Object.entries(r.values).map(([k,v])=>[k,{value:v,unit:'1'}]));const outcome=saveHistoryRecord({id:crypto.randomUUID(),kind:'personal-formula',calculatorId:'personal-formula',calculatorTitle:name.value.trim()||'Personal formula',formula:r.expression,methodVersion:'Personal formula',calculatedAt:r.at,rawInputs,result:{outputs:{result:{value:r.value,unit:'1'}}},summary:`${r.expression} = ${r.value}`,route:'/builder/'});status.textContent=outcome.saved?'Result saved to history.':outcome.reason==='paused'?'History saving is paused.':'Unable to save history on this device.';});
$('builder-export').addEventListener('click',()=>{if(!lastResult)return;const r=lastResult;download([name.value||'AuraCalc personal calculation',r.at,'FORMULA',r.expression,'INPUTS',...Object.entries(r.values).map(([k,v])=>`${k}: ${v}`),'WORKING',...r.steps.map(s=>`${s.expression} = ${s.value}`),'RESULT',String(r.value),'User-authored formula. Numeric arithmetic; units and suitability are not verified.'].join('\n'),'auracalc-formula-report.txt');status.textContent='Text report downloaded.';});
$('builder-sweep').addEventListener('click',()=>{
  try{
    if(activeExpression!==formula.value||!compiled)if(!prepare())return;
    const variable=$('builder-sweep-variable').value;const data=sampleFormula(compiled.tree,values(variable),variable,parseLocalizedNumber($('builder-from').value,locale),parseLocalizedNumber($('builder-to').value,locale));
    const target=$('builder-sweep-result');target.replaceChildren();const valid=data.filter(p=>p.y!==null);if(valid.length<2)throw new Error('Fewer than two valid results in this range. Choose a different range.');
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 620 220');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Sampled result against ${variable}; exact samples listed below.`);
    const ys=valid.map(p=>p.y),low=Math.min(...ys),high=Math.max(...ys);const scale=Math.max(Math.abs(low),Math.abs(high),1);const span=high/scale-low/scale;
    let d='';data.forEach((p,i)=>{if(p.y===null)return;const x=35+i/(data.length-1)*550,y=span===0?100:180-(p.y/scale-low/scale)/span*150;d+=`${i===0||data[i-1].y===null?'M':'L'}${x},${y} `;});const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke','#b8ff3d');path.setAttribute('stroke-width','3');svg.append(path);target.append(svg,node('p',`${variable}: ${fmt(data[0].x)} → ${fmt(data.at(-1).x)} · Result: ${fmt(low)} → ${fmt(high)}. 21 sampled points; not a continuous solution.`));
    const details=node('details');details.append(node('summary','Inspect all samples'));const table=node('table');const head=node('tr');head.append(node('th',variable),node('th','Result'));table.append(head);for(const p of data){const row=node('tr');row.append(node('td',fmt(p.x)),node('td',p.y===null?`Undefined: ${p.error}`:fmt(p.y)));table.append(row);}details.append(table);target.append(details);
  }catch(error){$('builder-sweep-result').replaceChildren(node('p',error.message));}
});
$('builderMenu').addEventListener('click',e=>{const open=e.currentTarget.getAttribute('aria-expanded')!=='true';e.currentTarget.setAttribute('aria-expanded',String(open));$('builderNavigation').classList.toggle('open',open);});
templates.forEach(([title],i)=>{const o=node('option',title);o.value=i;$('builder-template').append(o);});
let restore;
try{const item=JSON.parse(sessionStorage.getItem('nexora.restore.v1')||'null');if(item?.kind==='personal-formula'){restore=item;sessionStorage.removeItem('nexora.restore.v1');name.value=String(item.title||'').slice(0,80);formula.value=String(item.formula||'').slice(0,400);}}catch{}
prepare(restore?Object.fromEntries(Object.entries(restore.rawInputs||{}).map(([k,v])=>[k,v?.value])):null);renderSaved();renderScenarios();
