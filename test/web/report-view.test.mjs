import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resultReportHtml, openResultReport } from '../../web/report-view.mjs';
import { formatResultNumber } from '../../web/result-number.mjs';
const options = { definition: { title: '<script>alert(1)</script>', version: '1', inputs: [], outputs: [], method: { description: 'x < 2 & y > 3' }, precision: {numericModel:'IEEE-754 binary64'}, rounding:{policy:'Display only'} }, result:{intermediates:{steps:['<img src=x onerror=alert(1)>']}, outputs:{}}, unitSymbol:x=>x, formatOutput:()=>'' };
test('print report escapes all data and includes recorded precision and working', async () => {
  const html = resultReportHtml(options);
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img'));
  for (const text of ['&lt;script&gt;', 'IEEE-754 binary64', 'Display only', 'Print / Save as PDF', 'href="/report.css"', 'WORKING']) assert.ok(html.includes(text), text);
  const stylesheet = await readFile(new URL('../../web/report.css', import.meta.url), 'utf8');
  assert.match(stylesheet, /@media\s+print/);
  assert.equal(openResultReport(options, {open:()=>null}), false);
});
test('small nonzero results remain distinguishable from zero in all supported locales', () => {
  for(const locale of ['en-US','en-GB','de-DE','fr-FR','hi-IN']) {
    assert.match(formatResultNumber(1e-15,locale), /E-15/);
    assert.match(formatResultNumber(-2e20,locale), /E20/);
    assert.equal(formatResultNumber(0,locale),'0');
  }
  assert.equal(formatResultNumber(1020),'1,020');
  assert.equal(formatResultNumber(1.23456789),'1.234568');
});
