// The Geolocation API may report null when the device cannot supply speed.
export function deviceSpeed(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
