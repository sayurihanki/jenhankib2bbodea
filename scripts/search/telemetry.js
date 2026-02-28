export function emitSearchTelemetry(eventName, detail = {}) {
  if (!eventName || typeof eventName !== 'string') return;

  const payload = {
    event: eventName,
    eventInfo: {
      ...detail,
      source: 'search-experience',
      timestamp: new Date().toISOString(),
    },
  };

  try {
    if (window.adobeDataLayer?.push) {
      window.adobeDataLayer.push(payload);
    }
  } catch (e) {
    // Ignore Adobe data layer failures.
  }

  try {
    window.dispatchEvent(new CustomEvent('bodea:search-telemetry', { detail: payload.eventInfo }));
  } catch (e) {
    // Ignore browser event dispatch failures.
  }
}
