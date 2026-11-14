const PREFERRED = ['Percentages', 'Geometry', 'Motion', 'Everyday money', 'Mechanics', 'Energy', 'Electrical basics'];

// A tool keeps its specialist category and can also appear in broader topics.
// Match titles/categories, not incidental words buried in warnings or references.
const CROSS_TOPICS = [
  ['Percentages', /\b(percent(?:age)?s?|discount|markup|margin|sales tax|tip)\b/i],
  ['Geometry', /\b(geometry|area|perimeter|volume|triangle|circle|sphere|cone|prism|rectangle|polygon)\b/i],
  ['Motion', /\b(kinematics|speed|velocity|acceleration|projectile|momentum|rotational motion)\b/i],
  ['Energy', /\b(energy|work and power|heat transfer|electrical power)\b/i],
];
export function topicsForTool(tool) {
  const topics = new Set([tool.category, ...(tool.topics || [])].filter(Boolean));
  const text = `${tool.title || ''} ${tool.category || ''}`;
  for (const [topic, pattern] of CROSS_TOPICS) if (pattern.test(text)) topics.add(topic);
  return [...topics];
}

export function catalogTopics(calculators, active = 'All tools') {
  const counts = new Map();
  for (const item of calculators) for (const topic of topicsForTool(item)) counts.set(topic, (counts.get(topic) || 0) + 1);
  const all = [...counts.keys()].sort((a, b) => a.localeCompare(b));
  const preferred = PREFERRED.filter(topic => counts.has(topic));
  const ranked = [...all].sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
  const featured = [...preferred, ...ranked.filter(topic => !preferred.includes(topic))].slice(0, 7);
  if (active !== 'All tools' && counts.has(active) && !featured.includes(active)) featured.push(active);
  return { all, featured, counts };
}
