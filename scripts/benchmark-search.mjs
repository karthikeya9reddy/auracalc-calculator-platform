import { performance } from 'node:perf_hooks';
import { execFileSync } from 'node:child_process';
import { listPublicCalculators, listPublicConverters } from '../catalog/public/index.mjs';
import * as current from '../web/unified-search.mjs';
const baselineSource = execFileSync('git',['show','1192b2c:web/unified-search.mjs'],{encoding:'utf8'});
const baseline = await import(`data:text/javascript;base64,${Buffer.from(baselineSource).toString('base64')}`);
const definitions = [...listPublicCalculators(), ...listPublicConverters()];
const queries=['rectangle area','m to km','force over area','beam bending','500 N to lbf','sound intensity','rectangel area','nothingmatchesxyz'];
function measure(api) {
  const index=api.makeSearchIndex(definitions), timings=[];
  for(let iteration=0;iteration<25;iteration++) for(const query of queries) {
    const start=performance.now(); api.searchIndex(index,query); const elapsed=performance.now()-start;
    if(iteration>=5) timings.push(elapsed);
  }
  timings.sort((a,b)=>a-b);
  return {medianMs:+timings[Math.floor(timings.length*.5)].toFixed(2),p95Ms:+timings[Math.floor(timings.length*.95)].toFixed(2)};
}
console.log(JSON.stringify({note:'Warm Node search-only timings; not browser INP or Core Web Vitals.',definitions:definitions.length,queries:queries.length,baseline:measure(baseline),current:measure(current)},null,2));
