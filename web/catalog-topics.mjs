const PREFERRED = ['Percentages', 'Geometry', 'Motion', 'Everyday money', 'Mechanics', 'Energy', 'Electrical basics'];

export function catalogTopics(calculators, active = 'All tools') {
  const counts = new Map();
  for (const item of calculators) if (item.category) counts.set(item.category, (counts.get(item.category) || 0) + 1);
  const all = [...counts.keys()].sort((a, b) => a.localeCompare(b));
  const preferred = PREFERRED.filter(topic => counts.has(topic));
  const ranked = [...all].sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
  const featured = [...preferred, ...ranked.filter(topic => !preferred.includes(topic))].slice(0, 7);
  if (active !== 'All tools' && counts.has(active) && !featured.includes(active)) featured.push(active);
  return { all, featured, counts };
}
