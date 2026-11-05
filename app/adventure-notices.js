/*! © 2026 getClassHero — 86 Studio. */
(function () {
  'use strict';
  let installed = false, panel = null, dismissTimer = 0;
  // These cards have acknowledgement actions or choices in the original renderer.
  // In particular, brick acknowledgement starts moDrop; leave that path intact.
  const separate = new Set(['slime', 'king', 'quiet', 'circus', 'brick']);
  const passive = o => o && !o.ia && !o.qz && !o.brick && !separate.has(o.k);
  function dismissSummary() {
    clearTimeout(dismissTimer);
    if (panel) panel.remove();
    panel = null;
  }
  function install() {
    if (installed) return true;
    if (typeof advShow !== 'function' || typeof advQ === 'undefined' ||
        typeof undoStack === 'undefined') return false;
    const original = advShow;
    advShow = function (o) {
      if (!passive(o)) { dismissSummary(); return original.apply(this, arguments); }
      const cards = [o];
      // Only consume the adjacent passive run: an interactive card remains a barrier.
      // Check every record, just as advPump does, before including its notice.
      while (advQ.length) {
        const next = advQ[0];
        if (next.rec && !undoStack.includes(next.rec)) { advQ.shift(); continue; }
        if (!passive(next)) break;
        cards.push(advQ.shift());
      }
      const en = document.documentElement.classList.contains('i18n-en');
      const title = en ? 'Adventure summary' : '探險結果總覽';
      const label = en ? 'Close' : '關閉';
      const translate = text => en && typeof Lo === 'function' ? Lo(text) : text;
      const rows = cards.map(card => '<li style="margin:10px 0">' +
        '<strong>' + esc((card.ic || '🧭') + ' ' + translate(card.nm || '')) + '</strong>' +
        '<div>' + esc(translate(card.t || '')) + '</div></li>').join('');
      dismissSummary();
      panel = document.createElement('aside');
      panel.id = 'chAdventureSummary';
      panel.setAttribute('role', 'status');
      panel.setAttribute('aria-live', 'polite');
      const dock = document.getElementById('dock');
      const bottom = 12 + Math.max(0, dock ? dock.getBoundingClientRect().height : 0);
      panel.style.cssText = 'position:fixed;right:12px;bottom:calc(' + bottom + 'px + env(safe-area-inset-bottom));width:min(360px,calc(100vw - 24px));max-height:min(40vh,calc(100dvh - ' + (bottom + 80) + 'px));overflow:auto;z-index:850;background:var(--paper,#211636);color:var(--ink,#fff);border:1px solid var(--line,#8e78aa);border-radius:12px;padding:12px;box-shadow:0 4px 20px #0005';
      panel.innerHTML = '<strong>🧭 ' + title + ' · ' + cards.length +
        '</strong><button type="button" class="nb" style="float:right">' + label +
        '</button><details><summary>' + (en ? 'View details' : '查看明細') +
        '</summary><ul style="text-align:left;padding:0 8px 0 24px">' + rows + '</ul></details>';
      const current = panel;
      const dismiss = () => { current.remove(); if (panel === current) panel = null; };
      panel.querySelector('button').onclick = dismiss;
      document.body.appendChild(panel);
      dismissTimer = setTimeout(dismiss, 12000);
      // Notification acknowledgement never gates scoring or the next actual choice.
      setTimeout(advPump, 150);
    };
    if (typeof undo === 'function') {
      const originalUndo = undo;
      undo = function () {
        const result = originalUndo.apply(this, arguments);
        if (result) dismissSummary();
        return result;
      };
    }
    installed = true;
    return true;
  }
  window.CH_ADVENTURE_NOTICES = { install };
})();
