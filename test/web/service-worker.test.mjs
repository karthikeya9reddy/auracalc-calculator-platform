import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('offline cache installs a small shell, bypasses APIs and bounds visited resources',async()=>{
  const events=new Map(),stores=new Map();let downloaded=[],online=true;
  const normalize=r=>typeof r==='string'?r:new URL(r.url).pathname;
  const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {async addAll(routes){downloaded=[...routes];for(const route of routes)data.set(route,new Response(route));},async put(r,v){data.set(normalize(r),v);},async keys(){return [...data.keys()];},async delete(r){return data.delete(normalize(r));}};},async keys(){return [...stores.keys()];},async delete(name){return stores.delete(name);},async match(r){for(const s of stores.values())if(s.has(normalize(r)))return s.get(normalize(r));}};
  vm.runInNewContext(await readFile(new URL('../../web/sw.js',import.meta.url),'utf8'),{URL,Response,caches,fetch:async()=>{if(!online)throw new Error('Offline');return new Response('live');},self:{location:{origin:'https://test.local'},addEventListener:(n,f)=>events.set(n,f),skipWaiting:async()=>{},clients:{claim:async()=>{}}}});
  let done;events.get('install')({waitUntil:p=>done=p});await done;
  assert.ok(downloaded.length<100,`Installed ${downloaded.length} resources`);
  assert.ok(downloaded.includes('/builder/studio.mjs'));
  assert.ok(!downloaded.some(r=>r.startsWith('/calculators/')||r.startsWith('/converters/')&&r!=='/converters/'));
  let intercepted=false;
  events.get('fetch')({request:{url:'https://test.local/api/vision/status',method:'GET'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
  async function request(path,mode='navigate'){let result,work;events.get('fetch')({request:{url:'https://test.local'+path,method:'GET',mode},respondWith:p=>result=p,waitUntil:p=>work=p});await work;return result;}
  for(let i=0;i<185;i++)await request('/tool-'+i);
  assert.equal(stores.get('auracalc-runtime-v8').size,180);
  online=false;assert.equal(await (await request('/not-yet-visited')).text(),'/offline.html');
  assert.equal(await (await request('/tool-184')).text(),'live');
});
