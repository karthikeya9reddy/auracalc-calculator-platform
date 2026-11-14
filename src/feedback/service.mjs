const categories = new Set(['general', 'bug', 'calculation', 'conversion', 'idea', 'usability', 'accessibility', 'performance', 'review']);
export function validateFeedback(body, origin) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid feedback.');
  if (!categories.has(body.type)) throw new Error('Choose a feedback category.');
  if (typeof body.message !== 'string' || body.message.trim().length < 10 || body.message.length > 1200) throw new Error('Write between 10 and 1,200 characters.');
  if (typeof body.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.id)) throw new Error('Invalid submission identifier.');
  const contact = body.contact || '';
  if (typeof contact !== 'string' || contact.length > 254 || (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))) throw new Error('Enter a valid email address or leave it blank.');
  const page = new URL(body.page || '/', origin);
  if (page.origin !== origin || page.pathname.length > 500) throw new Error('Use an AuraCalc page URL.');
  return { id: body.id, type: body.type, message: body.message.trim(), contact, page: page.pathname, createdAt: new Date().toISOString(), status: 'new' };
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

// Storage and quota operations are injected so the same contract is exercised
// with local disk and Cloudflare D1. No browser-side acceptance is simulated.
export async function receiveFeedback(request, { store, throttle }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return json({ error: 'Request origin rejected.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON required.' }, 415);
  if (!store || !throttle) return json({ error: 'Feedback delivery is not configured yet. Your message has not been sent.' }, 503);
  try {
    // Enforce the byte limit while streaming, even without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Message required.' }, 400);
    const chunks = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); return json({ error: 'Message too large.' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let body;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'Invalid JSON.' }, 400); }
    let entry;
    try { entry = validateFeedback(body, origin); } catch (error) { return json({ error: error.message }, 400); }
    if (!await throttle()) return json({ error: 'Too many submissions. Try again in an hour.' }, 429);
    await store(entry);
    return json({ accepted: true, id: entry.id }, 201);
  } catch {
    return json({ error: 'Delivery failed. Your message is still here; please try again.' }, 503);
  }
}
