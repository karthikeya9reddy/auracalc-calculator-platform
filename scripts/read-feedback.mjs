import { fileURLToPath } from 'node:url';
import { readFeedback } from './feedback-local.mjs';
const rows = await readFeedback(fileURLToPath(new URL('../.local-feedback/', import.meta.url)));
console.log(JSON.stringify(rows, null, 2));
