import { reference, r0Release, sciencePrecision, scienceRounding } from './science-helpers.mjs';

/** Shared metadata shape for low-risk, equation-based learning tools. */
export function educationalDefinition({
  id,
  catalogKind = 'calculator',
  title,
  discipline,
  fields,
  category,
  description,
  keywords,
  formula,
  assumptions,
  exclusions,
  limitations,
  citation,
  sourceUrl,
  verificationCases,
  visualization,
  nextSteps = [],
  inputs,
  outputs,
  calculate,
  warnings = [],
  intendedAudience = ['Learners', 'General educational use'],
}) {
  return Object.freeze({
    id,
    catalogKind,
    version: '1.0.0',
    title,
    discipline,
    fields: Object.freeze([...fields]),
    category,
    description,
    keywords: Object.freeze([...keywords]),
    purpose: `Use ${title.toLowerCase()} for educational calculation or a clearly scoped arithmetic estimate.`,
    intendedAudience: Object.freeze([...intendedAudience]),
    riskClass: 'R0',
    visibility: 'public',
    method: Object.freeze({ type: 'equation', description: formula }),
    precision: sciencePrecision,
    rounding: scienceRounding,
    assumptions: Object.freeze([...assumptions]),
    exclusions: Object.freeze([...exclusions]),
    warnings: Object.freeze([...warnings]),
    limitations: Object.freeze([...limitations]),
    references: Object.freeze([reference(`${id}-source`, citation, sourceUrl)]),
    verificationCases: Object.freeze([...verificationCases]),
    ...(visualization ? { visualization: Object.freeze({ ...visualization }) } : {}),
    nextSteps: Object.freeze(nextSteps.map(step => Object.freeze({ ...step }))),
    release: r0Release(`${id}-independent-reference-cases-v1`),
    inputs: Object.freeze([...inputs]),
    outputs: Object.freeze([...outputs]),
    calculate,
  });
}

export function calculated(outputs, formula, steps, warnings = []) {
  return { outputs, intermediates: { formula, steps }, warnings };
}
