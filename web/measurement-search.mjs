export const MEASUREMENT_TOOLS = Object.freeze([
  { id: 'photo', title: 'Photo measurement and AI guidance', description: 'Measure lengths and areas in an image with a reference or ask the photo assistant.', category: 'Measurement', keywords: ['image photo ruler dimensions length area upload analyze ai camera reference'], fields: [], href: '/measure/photo/' },
  { id: 'ar', title: 'Live AR distance measurement', description: 'Measure the distance between two tracked surface points using a supported camera.', category: 'Measurement', keywords: ['augmented reality ar live camera measure distance dimensions length surface'], fields: [], href: '/measure/ar/' },
  { id: 'speed', title: 'Device speedometer', description: 'See device speed using the location sensor.', category: 'Measurement', keywords: ['gps speedometer device speed vehicle moving car location travel'], fields: [], href: '/measure/speed/' },
]);
export function measurementMode(search, pageDefault = 'photo') {
  const mode = new URLSearchParams(search).get('mode') || pageDefault;
  return MEASUREMENT_TOOLS.some(tool => tool.id === mode) ? mode : 'photo';
}
