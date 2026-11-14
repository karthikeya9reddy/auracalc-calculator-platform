export function connectFeedback(form, status) {
  let pending = false, submission = null;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const data = {
      type: form.elements.feedbackType.value,
      message: form.elements.feedbackMessage.value.trim(),
      contact: form.elements.feedbackContact?.value.trim() || '',
      page: form.elements.feedbackPage?.value || location.pathname,
    };
    const fingerprint = JSON.stringify(data);
    if (submission?.fingerprint !== fingerprint) submission = { fingerprint, id: crypto.randomUUID() };
    const button = form.querySelector('[type="submit"]');
    pending = true; button.disabled = true; form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your feedback…';
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: submission.id }), signal: AbortSignal.timeout(15000),
      });
      let result;
      try { result = await response.json(); } catch { throw new Error('Feedback delivery is unavailable. Your message has not been confirmed; please try again later.'); }
      if (!response.ok || result.accepted !== true || result.id !== submission.id) throw new Error(result.error || 'Delivery was not confirmed. Please try again.');
      status.textContent = `Received. Your reference is ${result.id}. Thank you for helping improve AuraCalc.`;
      // Do not erase edits made while the request was in flight.
      if (form.elements.feedbackMessage.value.trim() === data.message) form.elements.feedbackMessage.value = '';
      submission = null;
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' ? 'Delivery timed out. Retry to confirm receipt; the same reference prevents duplicates.' : error.message;
    } finally { pending = false; button.disabled = false; form.removeAttribute('aria-busy'); }
  });
}
