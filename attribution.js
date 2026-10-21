(() => {
  // Keep these campaign codes in sync with classhero-saas/web/saas.js (ACQ_CODES).
  const key = 'ch_acq_v1';
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  const codes = {
    source: ['threads', 'instagram', 'tiktok', 'x', 'facebook', 'youtube'],
    medium: ['organic_social'],
    campaign: ['primary_oct26', 'classroom_demo_oct26'],
    content: ['hk_rules', 'tw_seats', 'en_boss', 'hk_rewards', 'tw_house', 'en_demo', 'hk_video', 'tw_video', 'en_video'],
  };
  const params = new URLSearchParams(window.location.search);
  const tag = (name) => {
    const value = params.get(`utm_${name}`);
    const lower = value ? value.toLowerCase() : '';
    return codes[name].includes(lower) ? lower : '';
  };

  const source = tag('source');
  if (!source) return;

  try {
    const now = Date.now();
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(key));
    } catch (_) {
      // Replace a damaged record when a valid source arrives.
    }
    if (
      saved &&
      typeof saved.source === 'string' &&
      codes.source.includes(saved.source) &&
      typeof saved.at === 'number' &&
      now >= saved.at &&
      now - saved.at < maxAge
    ) return;

    localStorage.setItem(key, JSON.stringify({
      source,
      medium: tag('medium'),
      campaign: tag('campaign'),
      content: tag('content'),
      at: now,
    }));
  } catch (_) {
    // Storage may be unavailable; attribution must not interrupt the page.
  }
})();
