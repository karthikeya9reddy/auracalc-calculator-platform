import { generateCalculatorPages } from './generate-pages-lib.mjs';

const generated = await generateCalculatorPages();
console.log(`Generated ${generated.calculators} formula calculator pages and ${generated.converters} converter pages.`);
