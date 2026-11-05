/*! © 2026 getClassHero — 86 Studio. */
(function () {
  'use strict';
  let installed = false;
  const english = () => document.documentElement.classList.contains('i18n-en');
  function sync() {
    const host = document.getElementById('v-seat');
    if (!host || !document.getElementById('sg') || typeof S === 'undefined' || !S) return;
    let bar = document.getElementById('chSeatControls');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'chSeatControls';
      bar.setAttribute('role', 'group');
      bar.innerHTML = '<span id="chSeatSizeLabel"></span><button type="button" class="nb" id="chSeatSmaller">−</button><button type="button" class="nb" id="chSeatLarger">＋</button><button type="button" class="nb" id="chSeatFit"></button><button type="button" class="nb" id="chSeatTools"></button>';
      bar.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button || !bar.contains(button)) return;
        e.stopPropagation();
        const id = button.id;
        if (id === 'chSeatSmaller' || id === 'chSeatLarger') {
          const native = document.getElementById(id === 'chSeatSmaller' ? 'seSzM' : 'seSzP');
          if (native && !button.disabled) native.click();
        } else if (id === 'chSeatFit') {
          S.seatSz = 0;
          S.seatOnePage = true;
          if (document.body.classList.contains('narrow')) DB.narrowSeat = 'fit';
          save();
          if (typeof applyNarrow === 'function') applyNarrow();
          renderSeat();
        } else if (id === 'chSeatTools') {
          document.body.classList.toggle('nwtools');
          if (typeof fcSync === 'function') fcSync();
          sync();
          seatZoom(true);
        }
        const next = document.getElementById(id);
        if (next && !next.hidden) next.focus({ preventScroll: true });
      });
    }
    // Outside fcBar: its click handler opens the adventure panel for unknown targets.
    const anchor = document.getElementById('fcBar');
    host.insertBefore(bar, anchor ? anchor.nextSibling : host.firstChild);
    const en = english(), narrow = document.body.classList.contains('narrow');
    const fit = narrow ? (typeof nwSeatMode === 'function' && nwSeatMode() === 'fit') : S.seatOnePage !== false && !S.seatSz;
    bar.setAttribute('aria-label', en ? 'Seating display' : '座位顯示');
    document.getElementById('chSeatSizeLabel').textContent = narrow ? (en ? 'Auto size' : '自動尺寸') : (en ? 'Seat size' : '座位大小') + (S.seatSz ? ' ' + Math.round(S.seatSz * 100) + '%' : '');
    ['chSeatSmaller', 'chSeatLarger'].forEach((id, i) => {
      const b = document.getElementById(id);
      b.hidden = narrow; b.disabled = narrow;
      b.title = en ? (i ? 'Larger seats' : 'Smaller seats') : (i ? '放大座位' : '縮小座位');
      b.setAttribute('aria-label', b.title);
    });
    const fitButton = document.getElementById('chSeatFit');
    fitButton.textContent = en ? 'Fit class' : '全班一頁';
    fitButton.title = en ? 'Auto size to fit the whole class on one page' : '自動調整尺寸，一頁顯示全班';
    fitButton.classList.toggle('on', !!fit);
    fitButton.setAttribute('aria-pressed', String(!!fit));
    const tools = document.getElementById('chSeatTools');
    tools.textContent = en ? '🛠 Tools' : '🛠 座位工具';
    tools.setAttribute('aria-expanded', String(document.body.classList.contains('nwtools')));
  }
  function install() {
    if (installed) return true;
    if (typeof renderSeat !== 'function' || typeof seatZoom !== 'function') return false;
    installed = true;
    const style = document.createElement('style');
    style.textContent = '#chSeatControls{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:4px 0 6px;font-size:12px;line-height:1.3}#chSeatControls .nb{min-height:32px;padding:5px 9px;font-size:12px;white-space:nowrap}#chSeatControls [hidden]{display:none!important}#chSeatControls button:focus-visible{outline:3px solid var(--cyan,#21b6d7);outline-offset:2px}@media(max-width:639px){#chSeatControls{gap:4px}#chSeatControls .nb{min-height:36px;padding:5px 8px}}';
    document.head.appendChild(style);
    const original = renderSeat;
    renderSeat = function () { const result = original.apply(this, arguments); sync(); seatZoom(true); return result; };
    addEventListener('resize', () => { sync(); if (document.getElementById('sg')) seatZoom(true); });
    sync();
    return true;
  }
  window.CH_SEAT_CONTROLS = { install, sync };
})();


