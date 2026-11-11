import { generateCalculatorPages } from './generate-pages-lib.mjs';
import { generateMeasurePages } from './generate-measure-pages.mjs';
import { fileURLToPath } from 'node:url';

const generated = await generateCalculatorPages();
await generateMeasurePages(fileURLToPath(new URL('..', import.meta.url)));
console.log(`Generated ${generated.calculators} formula calculator pages and ${generated.converters} converter pages.`);
await import('./dev-server.mjs');
