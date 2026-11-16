import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export async function generateStudioPage(root) {
  const file=resolve(root,'web/builder/index.html');
  let html=await readFile(file,'utf8');
  const main=await readFile(resolve(root,'scripts/templates/studio-main.html'),'utf8');
  html=html.replace(/<main[\s\S]*?<\/main>/,main).replace('/builder/builder.mjs','/builder/studio.mjs');
  if (!html.includes('/builder/studio.css')) html=html.replace('</head>','<link rel="stylesheet" href="/builder/studio.css"></head>');
  html=html.replace('<title>Formula builder | AuraCalc</title>','<title>Formula Studio — Build your own calculator | AuraCalc</title>');
  html=html.replace('Create a personal calculator from an arithmetic formula and save it in your browser.','Build personal calculators with scientific functions, scenario comparisons and input exploration. Save them privately in your browser.');
  await writeFile(file,html,'utf8');
}
