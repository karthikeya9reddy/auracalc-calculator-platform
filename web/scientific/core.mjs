import { parseFormula, evaluateFormula } from '../builder-core.mjs';

export function calculateExpression(expression, { degrees = true, answer = 0, memory = 0 } = {}) {
  const parsed = parseFormula(expression.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('π', 'pi').replaceAll('−', '-'));
  const values = { pi: Math.PI, e: Math.E, ans: answer, M: memory };
  for (const name of parsed.variables) if (!Object.hasOwn(values, name)) throw new Error(`Unknown name ${name}. Use pi, e, ans or M.`);
  function transform(tree) {
    if (tree.type === 'call') {
      const args = tree.args.map(transform);
      if (tree.name === 'tan') {
        const angle = evaluateFormula(args[0], values);
        const period = degrees ? 180 : Math.PI;
        if (Math.abs(angle % period) === period / 2) throw new Error('Tangent is undefined at this angle.');
      }
      if (degrees && ['sin', 'cos', 'tan'].includes(tree.name)) {
        // tan(90 + 180k) is undefined; floating-point cos would hide the pole.
        args[0] = { type: 'binary', operator: '*', left: args[0], right: { type: 'number', value: Math.PI / 180 } };
      }
      const call = { ...tree, args };
      if (degrees && ['asin', 'acos', 'atan'].includes(tree.name)) return { type: 'binary', operator: '*', left: call, right: { type: 'number', value: 180 / Math.PI } };
      return call;
    }
    if (tree.type === 'binary') return { ...tree, left: transform(tree.left), right: transform(tree.right) };
    if (tree.type === 'unary') return { ...tree, operand: transform(tree.operand) };
    return tree;
  }
  const value = evaluateFormula(transform(parsed.tree), values);
  return Object.is(value, -0) ? 0 : value;
}
