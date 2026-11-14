import { receiveFeedback } from '../../src/feedback/service.mjs';

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.FEEDBACK_DB;
  if (!db || !env.FEEDBACK_RATE_SECRET) return receiveFeedback(request, {});
  const hour = Math.floor(Date.now() / 3600000);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  // Rotating, keyed identifiers avoid retaining IP addresses in the database.
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.FEEDBACK_RATE_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${hour}:${ip}`));
  const bucket = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
  return receiveFeedback(request, {
    throttle: async () => {
      const row = await db.prepare('INSERT INTO feedback_quota (bucket, hour, count) VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET count = count + 1 RETURNING count').bind(bucket, hour).first();
      context.waitUntil(db.prepare('DELETE FROM feedback_quota WHERE hour < ?').bind(hour - 1).run());
      return row.count <= 5;
    },
    store: async entry => {
      await db.prepare('INSERT INTO feedback (id, category, message, contact, page, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(entry.id, entry.type, entry.message, entry.contact, entry.page, entry.createdAt, entry.status).run();
    },
  });
}
