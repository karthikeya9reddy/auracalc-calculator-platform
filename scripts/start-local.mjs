import { generateCalculatorPages } from './generate-pages-lib.mjs';

await generateCalculatorPages();
await import('./dev-server.mjs');
