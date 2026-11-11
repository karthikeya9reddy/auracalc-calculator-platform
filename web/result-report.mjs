export function createResultReport({ definition, result, currencyCode, formatOutput, unitSymbol }) {
  const lines = [definition.title, 'AuraCalc calculation report', `Calculated: ${result.calculatedAt || 'Not recorded'}`, `Method version: ${definition.version}`, `Unit registry: ${result.unitRegistryVersion || 'Not recorded'}`, '', 'INPUTS'];
  for (const field of definition.inputs) {
    const input = result.inputs?.[field.id];
    if (!input) continue;
    const value = input.enteredText ?? input.enteredValue;
    const unit = field.unitLabel || unitSymbol(input.enteredUnit) || '';
    lines.push(`${field.label}: ${value}${unit && unit !== '1' ? ` ${unit}` : ''}`);
  }
  if (currencyCode) lines.push(`Currency context: ${currencyCode}`);
  lines.push('', 'METHOD', definition.method.description, '', 'WORKING');
  const steps = result.intermediates?.steps || [];
  if (steps.length) steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  else lines.push('No additional working steps were recorded.');
  lines.push('', 'RESULTS');
  for (const field of definition.outputs) if (result.outputs?.[field.id]) lines.push(`${field.label}: ${formatOutput(field, result.outputs[field.id])}`);
  lines.push('', 'PRECISION AND ROUNDING', definition.precision?.numericModel || 'Numeric model not recorded.', definition.precision?.note || '', definition.rounding?.policy || 'Rounding policy not recorded.', 'Displayed units may differ from the stored result units. Small nonzero values may be shown in scientific notation.');
  if (result.warnings?.length) lines.push('', 'WARNINGS', ...result.warnings.map(item => `- ${item}`));
  if (definition.assumptions?.length) lines.push('', 'ASSUMPTIONS', ...definition.assumptions.map(item => `- ${item}`));
  if (definition.limitations?.length) lines.push('', 'LIMITATIONS', ...definition.limitations.map(item => `- ${item}`));
  if (definition.references?.length) lines.push('', 'SOURCES', ...definition.references.map(item => `- ${item.citation}${item.url ? ` (${item.url})` : ''}`));
  return `${lines.join('\n')}\n`;
}
