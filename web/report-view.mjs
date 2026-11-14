import { createResultReport } from './result-report.mjs';

const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const sections = new Set(['INPUTS', 'METHOD', 'WORKING', 'RESULTS', 'PRECISION AND ROUNDING', 'WARNINGS', 'ASSUMPTIONS', 'LIMITATIONS', 'SOURCES']);

export function resultReportHtml(options) {
  const lines = createResultReport(options).trim().split('\n');
  const title = lines.shift();
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} — AuraCalc report</title><link rel="stylesheet" href="/report.css"></head><body><header><button id="print-report" type="button">Print / Save as PDF</button><span>Choose “Save as PDF” in your browser’s print destination.</span></header><main><div class="brand">AURACALC / CALCULATION RECORD</div><h1>${escape(title)}</h1>${lines.filter(Boolean).map(line => sections.has(line) ? `<h2>${escape(line)}</h2>` : `<p>${escape(line)}</p>`).join('')}<footer>Generated from the recorded calculation. A report does not certify the formula or its suitability for a particular application.</footer></main></body></html>`;
}

export function openResultReport(options, browser = window) {
  const popup = browser.open('', '_blank');
  if (!popup) return false;
  popup.opener = null;
  popup.document.open();
  popup.document.write(resultReportHtml(options));
  popup.document.close();
  popup.document.querySelector('#print-report').addEventListener('click', () => popup.print());
  return true;
}
