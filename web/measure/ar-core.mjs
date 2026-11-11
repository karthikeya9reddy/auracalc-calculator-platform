export function distance3d(a, b) {
  const coordinates = [a?.x, a?.y, a?.z, b?.x, b?.y, b?.z];
  if (!coordinates.every(value => typeof value === 'number' && Number.isFinite(value))) throw new TypeError('Two valid tracked points are required.');
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}
