/*! © 2026 getClassHero — 86 Studio. */
(function () {
  'use strict';
  let installed = false;
  function install() {
    if (installed) return true;
    if (typeof wxCard !== 'function' || typeof npcAsk !== 'function' ||
        typeof undo !== 'function' || typeof renderDock !== 'function') return false;
    installed = true;
    // Keep weather effects/rewards intact. Teachers open information when ready.
    if (typeof wxDaily === 'function') wxDaily = function () {};
    const weatherCard = wxCard;
    wxCard = function () {
      const result = weatherCard.apply(this, arguments);
      const close = document.getElementById('wxOk');
      if (close) { close.textContent = document.documentElement.classList.contains('i18n-en') ? 'Close' : '關閉'; close.onclick = closeM; }
      return result;
    };
    const questCard = npcAsk;
    npcAsk = function () {
      const result = questCard.apply(this, arguments);
      const close = document.getElementById('npcOk');
      if (close) {
        close.textContent = document.documentElement.classList.contains('i18n-en') ? 'Close' : '關閉';
        const card = document.querySelector('#modal .npc-cd');
        if (card) card.id = 'npcLiveCard';
      }
      return result;
    };
    const undoAward = undo;
    undo = function () {
      const result = undoAward.apply(this, arguments);
      if (result && typeof S !== 'undefined' && S) {
        if (typeof advOn === 'function' && advOn() && typeof advBanUpd === 'function') advBanUpd(false);
        const modal = document.getElementById('modal');
        if (modal && !modal.classList.contains('hide') && document.getElementById('npcLiveCard')) npcAsk();
      }
      return result;
    };
    const dock = renderDock;
    renderDock = function () {
      const result = dock.apply(this, arguments);
      const hint = document.querySelector('#dock .hintbar');
      if (!hint || document.querySelector('#dock [data-ch-first-double]') ||
          !/首次×2|first.{0,20}×2/i.test(hint.textContent) ||
          /每位學生每日首次加分會加倍|first award each day/.test(hint.textContent)) return result;
      const note = document.createElement('span');
      note.className = 'dim'; note.setAttribute('data-ch-first-double', '');
      note.textContent = document.documentElement.classList.contains('i18n-en')
        ? ": Each student's first award each day is doubled, e.g. +5 → +10"
        : '：每位學生每日首次加分會加倍，例如 +5 → +10';
      hint.appendChild(note);
      return result;
    };
    return true;
  }
  window.CH_FIRSTLESSON = { install: install };
})();
