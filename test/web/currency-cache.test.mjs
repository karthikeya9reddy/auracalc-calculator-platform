import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateCache } from '../../web/currency-core.mjs';
test('rates coalesce, expire, refresh and clearly mark outage fallback',async()=>{
  let now=1000,calls=0,fail=false;
  const read=createRateCache({clock:()=>now,ttl:500,load:async(base,quote)=>{ calls++; if(fail) throw Error('offline'); return {base,quote,rate:2,date:'2026-11-10'}; }});
  await Promise.all([read('USD','INR'),read('USD','INR')]); assert.equal(calls,1);
  assert.equal((await read('USD','INR')).cached,true); assert.equal(calls,1);
  await read('USD','INR',{refresh:true}); assert.equal(calls,2);
  now+=600; fail=true;
  const old=await read('USD','INR'); assert.equal(old.stale,true); assert.equal(old.checkedAt,1000);
  now+=24*60*60*1000; await assert.rejects(read('USD','INR'));
  fail=false; assert.equal((await read('USD','INR')).stale,false);
});
test('synchronous provider failures can be retried',async()=>{
  let fail=true; const read=createRateCache({load:()=>{if(fail)throw Error('fail');return {rate:1};}});
  await assert.rejects(read('USD','EUR')); fail=false; assert.equal((await read('USD','EUR')).rate,1);
});
