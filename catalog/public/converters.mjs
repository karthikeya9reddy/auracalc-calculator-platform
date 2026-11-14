import { CalculatorRegistry } from '../../src/calculation-core/index.mjs';
import { unitConversionCalculators } from './unit-conversion-expansion.mjs';

export const publicConverterDefinitions = unitConversionCalculators;
export const converterRegistry = new CalculatorRegistry();
for (const definition of publicConverterDefinitions) converterRegistry.register(definition);

export function listPublicConverters() {
  return converterRegistry.listPublished();
}
