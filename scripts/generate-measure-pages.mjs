import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function generateMeasurePages(root) {
  const original = await readFile(resolve(root, 'web', 'measure', 'index.html'), 'utf8');
  const modes = [
    { id: 'photo', title: 'Photo measurement and AI guidance', description: 'Measure a photo with a known reference and ask for AI guidance.' },
    { id: 'ar', title: 'Live AR distance measurement', description: 'Measure between two tracked surface points on a supported AR device.' },
    { id: 'speed', title: 'Device speedometer', description: 'View device speed from the location sensor and use it in a calculator.' },
  ];
  for (const mode of modes) {
    const folder = resolve(root, 'web', 'measure', mode.id);
    await mkdir(folder, { recursive: true });
    const page = original.replace('<body class="measure-page">', `<body class="measure-page" data-measure-default="${mode.id}">`)
      .replace('<title>Visual Measurement Lab | AuraCalc</title>', `<title>${mode.title} | AuraCalc</title>`)
      .replace('content="Explore photo measurements, optional AI guidance, live AR distance and device speed in AuraCalc."', `content="${mode.description}"`)
      .replace('<link rel="icon"', `<link rel="canonical" href="/measure/${mode.id}/">\n  <link rel="icon"`);
    await writeFile(resolve(folder, 'index.html'), page, 'utf8');
  }
  return modes.length;
}
