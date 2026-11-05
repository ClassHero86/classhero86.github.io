/*! © 2026 86 Studio. First-lesson diagnostics: no student or classroom content. */
(function () {
  'use strict';
  if (window.CH_USAGE) return;
  const started = performance.now(), session = crypto.randomUUID();
  const queue = [], queued = new Set(), sent = new Set();
  let sb = null, userId = null, sending = false, disabled = false, installed = false, ready = false;
  let phase = 'startup', phaseAt = started, getState = null;
  const ms = n => Math.max(0, Math.min(3600000, Math.round(n)));
  const demo = room => !room || room.demo === true || room.isDemo === true ||
    /^(示範班級|示范班级|示範班|示范班|demo(?: class| classroom)?|sample class)$/i.test(String(room.name || '').trim());
  const day = () => new Date().toISOString().slice(0, 10);
  function key(row) { return row.event_name + ':' + (['award_day', 'class_created'].includes(row.event_name) ? day() : session + ':' + row.phase + ':' + row.error_code); }
  function record(event, duration, currentPhase = 'none', issue = 'none') {
    if (disabled) return;
    const row = { event_name: event, session_id: session, duration_ms: ms(duration), phase: currentPhase, error_code: issue };
    const k = key(row);
    if (queued.has(k) || sent.has(k) || queue.length >= 24) return;
    queued.add(k); queue.push({ k, row }); void flush();
  }
  async function flush() {
    if (!sb || !userId || sending || disabled) return;
    sending = true;
    try {
      while (queue.length && !disabled) {
        const item = queue.shift();
        // Insert-only access: never request a representation or read classmates' data.
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 5000);
        try {
          let query = sb.from('teacher_usage_events').insert(item.row);
          if (query.abortSignal) query = query.abortSignal(controller.signal);
          const result = await query;
          if (!result.error || result.error.code === '23505') sent.add(item.k);
          else if (['42P01', 'PGRST205', '42501'].includes(result.error.code)) disabled = true;
        } catch (_) { /* Diagnostics must never interrupt a lesson or block an award. */ }
        finally { clearTimeout(timer); queued.delete(item.k); }
      }
    } finally { sending = false; }
  }
  function classify(text) {
    if (/核實帳戶|Checking account access/i.test(text)) return 'access';
    if (/連接雲端|Connecting to the cloud/i.test(text)) return 'cloud';
    if (/讀取帳戶|Loading your account/i.test(text)) return 'account';
    if (/班級資料|共享班級|Loading (your classes|shared school class)/i.test(text)) return 'classes';
    if (/插畫|artwork/i.test(text)) return 'artwork';
    if (/付款處理|Processing payment/i.test(text)) return 'payment';
    return null;
  }
  function updatePhase(next) {
    if (!next || next === phase || ready) return;
    record('load_phase', performance.now() - phaseAt, phase);
    phase = next; phaseAt = performance.now();
  }
  function sample() {
    const msg = document.getElementById('chLoadMsg');
    const access = document.getElementById('chAccessGate');
    updatePhase(access ? 'access' : classify(msg ? msg.textContent : ''));
    const heading = document.querySelector('#chOv h2');
    if (!ready && heading && /^(載入失敗|Couldn.t load)$/.test(heading.textContent.trim())) record('load_issue', performance.now() - started, phase, 'failed');
    const client = window.CH && window.CH.api && window.CH.api.sb;
    if (!sb && client) {
      sb = client;
      // Session lookup is independent of app boot. An unauthenticated failure stays local.
      void sb.auth.getSession().then(r => { userId = r.data && r.data.session && r.data.session.user.id; void flush(); }).catch(() => {});
      sb.auth.onAuthStateChange((_event, current) => {
        const previous = userId;
        userId = current && current.user.id;
        if (previous && previous !== userId) { queue.length = 0; queued.clear(); sent.clear(); }
        else setTimeout(() => { void flush(); }, 0);
      });
    }
  }
  function appReady() {
    if (ready) return;
    record('load_phase', performance.now() - phaseAt, phase);
    ready = true; record('app_ready', performance.now() - started);
    clearInterval(poll); clearTimeout(slowTimer); observer.disconnect(); sample();
  }
  function installHooks(state) {
    if (installed) return; installed = true; getState = state;
    for (const name of ['award', 'awardMany']) {
      const original = window[name]; if (typeof original !== 'function') continue;
      window[name] = function () {
        const args = arguments, list = name === 'award' ? [args[0]] : args[0];
        const total = () => Array.isArray(list) ? list.reduce((n, st) => n + (Number(st && st.exp) || 0), 0) : 0;
        const before = total(), result = original.apply(this, args);
        try {
          const room = getState && getState().room;
          if (Number(args[1]) > 0 && total() > before && !demo(room)) record('award_day', 0);
        } catch (_) {}
        return result;
      };
    }
    const post = window.CH_POST;
    window.CH_POST = function () { const result = typeof post === 'function' ? post.apply(this, arguments) : undefined; appReady(); return result; };
  }
  window.CH_USAGE = Object.freeze({ installHooks, ready: appReady, classCreated(room) { if (!demo(room)) record('class_created', 0); } });
  const observer = new MutationObserver(sample);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  const poll = setInterval(sample, 1000);
  const slowTimer = setTimeout(() => { if (!ready) record('load_issue', performance.now() - started, phase, 'slow'); }, 45000);
  // Stop watching after two minutes; do not leave a permanent DOM observer on a failed boot.
  setTimeout(() => { clearInterval(poll); observer.disconnect(); }, 120000);
  sample();
})();
