export class CalculationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CalculationError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function fail(code, message, details = {}) {
  throw new CalculationError(code, message, details);
}
