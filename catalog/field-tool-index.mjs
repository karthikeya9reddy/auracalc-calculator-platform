import { FIELD_DIRECTORY } from './field-directory.mjs';

/** Build a complete field-to-live-calculator index from calculator metadata. */
export function createFieldToolIndex(definitions, fieldDirectory = FIELD_DIRECTORY) {
  const knownFields = new Set(fieldDirectory);
  const index = new Map(fieldDirectory.map(field => [field, []]));

  for (const definition of definitions) {
    if (!Array.isArray(definition.fields) || definition.fields.length === 0) {
      throw new TypeError(`Published calculator ${definition.id} must declare at least one research field.`);
    }
    if (new Set(definition.fields).size !== definition.fields.length) {
      throw new TypeError(`Published calculator ${definition.id} lists a research field more than once.`);
    }
    for (const field of definition.fields) {
      if (!knownFields.has(field)) {
        throw new TypeError(`Published calculator ${definition.id} references an unknown research field: ${field}.`);
      }
      index.get(field).push(definition);
    }
  }

  return index;
}
