import { generateCalculatorPages } from './generate-pages-lib.mjs';

const count = await generateCalculatorPages();
console.log(`Generated ${count} calculator information pages.`);
