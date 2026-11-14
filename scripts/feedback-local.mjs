import { mkdir, open, readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { receiveFeedback } from '../src/feedback/service.mjs';

export function diskFeedbackStore(directory) {
  return async entry => {
    await mkdir(directory, { recursive: true });
    let file;
    try { file = await open(resolve(directory, `${entry.id}.json`), 'wx', 0o600); }
    catch (error) { if (error.code === 'EEXIST') return; throw error; }
    try { await file.writeFile(JSON.stringify(entry)); await file.sync(); } finally { await file.close(); }
  };
}
export async function readFeedback(directory) {
  let names;
  try { names = await readdir(directory); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  return Promise.all(names.filter(name => /^[a-f0-9-]{36}\.json$/i.test(name)).map(async name => JSON.parse(await readFile(resolve(directory, name), 'utf8'))));
}

const quota = new Map();
export async function handleLocalFeedback(request, response, directory) {
  const host = request.headers.host;
  if (!host || !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) {
    response.writeHead(403).end('Local feedback requires localhost.'); return;
  }
  const ip = request.socket.remoteAddress;
  const hour = Math.floor(Date.now() / 3600000);
  const webRequest = new Request(`http://${host}/api/feedback`, { method: request.method, headers: request.headers, body: request, duplex: 'half' });
  const result = await receiveFeedback(webRequest, {
    store: diskFeedbackStore(directory),
    throttle: async () => {
      for (const [key, value] of quota) if (value.hour !== hour) quota.delete(key);
      const previous = quota.get(ip) || { hour, count: 0 };
      previous.count++; quota.set(ip, previous); return previous.count <= 5;
    },
  });
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end(await result.text());
}
