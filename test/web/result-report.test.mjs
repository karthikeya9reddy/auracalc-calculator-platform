import test from 'node:test';
import assert from 'node:assert/strict';
import { createResultReport } from '../../web/result-report.mjs';

test('readable result reports include inputs, method, steps, outputs and sources', () => {
  const report = createResultReport({ definition: { title: 'Rectangle area', version: '1', inputs: [{ id: 'length', label: 'Length' }], outputs: [{ id: 'area', label: 'Area' }], method: { description: 'Area = length × width' }, assumptions: ['Flat plane'], limitations: ['Estimate'], references: [{ citation: 'Geometry reference', url: 'https://example.org/' }] }, result: { calculatedAt: '2026-01-01', unitRegistryVersion: 'test', inputs: { length: { enteredValue: 5, enteredUnit: 'm' } }, outputs: { area: { value: 10, unit: 'm2' } }, intermediates: { steps: ['Multiply 5 by 2.'] }, warnings: [] }, unitSymbol: unit => unit, formatOutput: (_, value) => `${value.value} ${value.unit}` });
  for (const part of ['Length: 5 m', 'Area = length × width', 'Multiply 5 by 2.', 'Area: 10 m2', 'Flat plane', 'Geometry reference']) assert.ok(report.includes(part), part);
  assert.ok(!report.startsWith('{'));
});
