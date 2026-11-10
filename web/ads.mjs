export const SPONSORED_PLACEMENTS = Object.freeze([
  Object.freeze({ id: 'catalog-support', selector: '[data-sponsored-slot="catalog-support"]', context: 'catalog' }),
]);

export async function mountSponsoredPlacements(root = document, environment = window) {
  const consent = environment.NEXORA_CONSENT_STATE;
  const adapter = environment.NEXORA_ADAPTER;
  if (consent?.advertising !== 'allowed' || !adapter || typeof adapter.mount !== 'function') {
    return { mounted: 0, state: 'disabled-or-unconfigured' };
  }

  let mounted = 0;
  for (const placement of SPONSORED_PLACEMENTS) {
    const container = root.querySelector(placement.selector);
    if (!container) continue;
    try {
      await adapter.mount({ slotId: placement.id, context: placement.context, container });
      if (container.childNodes.length) {
        container.classList.add('ad-placement-active');
        container.hidden = false;
        mounted += 1;
      }
    } catch {
      container.replaceChildren();
      container.hidden = true;
    }
  }
  return { mounted, state: 'consented' };
}
