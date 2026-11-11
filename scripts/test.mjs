import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

// Explicit discovery avoids scanning thousands of generated public pages and
// works on Windows without relying on shell glob expansion or newer Node globs.
const root=fileURLToPath(new URL('../test/',import.meta.url));
async function discover(folder){
  const files=[];
  for(const entry of await readdir(folder,{withFileTypes:true})){
    const path=resolve(folder,entry.name);
    if(entry.isDirectory())files.push(...await discover(path));
    else if(entry.name.endsWith('.test.mjs'))files.push(path);
  }
  return files.sort();
}
const files=await discover(root);
if(!files.length)throw new Error('No test files found.');
const child=spawn(process.execPath,['--test','--test-concurrency=2',...process.argv.slice(2),...files],{stdio:'inherit'});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
