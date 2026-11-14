/*! © 2026 getClassHero — 86 Studio. */
(function () {
  'use strict';
  let installed = false;
  let refitFrame = 0, applying = false, lastGrid = null, lastLayout = '';
  function layoutSignature(sg) {
    const wrap = sg.parentElement, rect = sg.getBoundingClientRect();
    const dock = document.getElementById('dock'), dr = dock && dock.getBoundingClientRect();
    const host = document.getElementById('v-seat'), board = host && host.querySelector('.board');
    const br = board && board.getBoundingClientRect(), vp = window.visualViewport;
    return [wrap && wrap.clientWidth, Math.round(rect.top * 2) / 2, innerHeight,
      vp && vp.height, vp && vp.offsetTop, dr && Math.round(dr.top * 2) / 2, dr && Math.round(dr.height),
      br && Math.round(br.height), S.grid && S.grid.c, S.grid && S.grid.r, S.seatSz || 0,
      S.seatOnePage !== false, S.seatNm || 0, !!S.flip,
      document.body.classList.contains('narrow'), document.body.classList.contains('nwtools'),
      document.documentElement.classList.contains('i18n-en')].join('|');
  }
  const watched = new WeakSet();
  let sizeObserver;
  function refit() {
    if (refitFrame) return;
    refitFrame = requestAnimationFrame(() => {
      refitFrame = 0;
      if (typeof S !== 'undefined' && S && document.getElementById('sg')) seatZoom(true);
    });
  }
  // Measure the displayed viewport, including the dock's real top edge. The
  // core fitter only accounts for width, and its auto-size is not its CSS zoom.
  function applyLayout() {
    const sg = document.getElementById('sg');
    if (applying || !sg || !sg.offsetWidth || typeof S === 'undefined' || !S) return;
    const wrap = sg.parentElement;
    if (!wrap || !wrap.clientWidth) return;
    applying = true;
    document.body.classList.add('ch-seat-measuring');
    try {
      const columns = Math.max(1, +(S.grid || {}).c || 1);
      sg.style.zoom = '1';
      sg.style.width = Math.max(wrap.clientWidth, columns * 86 + (columns - 1) * 10) + 'px';
      sg.style.maxWidth = 'none';
      sg.style.gridTemplateColumns = 'repeat(' + columns + ',minmax(0,1fr))';
      sg.style.gridTemplateRows = '';
      sg.style.setProperty('--sz', '1');
      sg.style.setProperty('--fn', '17px');
      sg.style.setProperty('--fl', '12.5px');
      sg.style.setProperty('--fne', '13.94px');
      sg.classList.add('slim');
      wrap.style.maxHeight = '';
      wrap.style.overflowY = '';
      const rect = sg.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportBottom = viewport ? viewport.offsetTop + viewport.height : innerHeight;
      const dock = document.getElementById('dock');
      const dr = dock && dock.getBoundingClientRect();
      let bottom = viewportBottom - 8;
      if (dr && dr.height > 0 && dr.width > 0 && dr.top >= 0 && dr.top < bottom) bottom = dr.top - 8;
      const host = document.getElementById('v-seat');
      const board = host && host.querySelector('.board');
      const br = board && board.getBoundingClientRect();
      if (br && br.height && br.top >= rect.bottom - 1) bottom -= br.height + 12;
      const available = Math.max(1, bottom - rect.top);
      const fit = S.seatOnePage !== false && !S.seatSz;
      const zoom = fit ? Math.min(1, wrap.clientWidth / Math.max(1, sg.offsetWidth), available / Math.max(1, sg.offsetHeight)) : Math.max(.05, Math.min(2.4, +S.seatSz || 1));
      sg.style.zoom = String(zoom);
      if (typeof fitNames === 'function') fitNames(sg);
      // Recheck after font fitting and pixel rounding so the last row stays clear.
      if (fit && sg.getBoundingClientRect().bottom > bottom + .5) {
        const actual = sg.getBoundingClientRect();
        sg.style.zoom = String(zoom * Math.max(.01, (bottom - actual.top) / Math.max(1, actual.height)));
      }
      if (sizeObserver) {
        [dock, document.querySelector('header'), document.getElementById('chClassTools'), document.getElementById('chSeatControls'), document.getElementById('fcBar')].forEach(el => {
          if (el && !watched.has(el)) { watched.add(el); sizeObserver.observe(el); }
        });
      }
    } finally {
      document.body.classList.remove('ch-seat-measuring');
      applying = false;
    }
  }
  function changeSize(direction) {
    const sg = document.getElementById('sg');
    if (!sg) return;
    const current = parseFloat(sg.style.zoom) || 1;
    if (direction < 0 && current <= .05) return;
    S.seatSz = Math.max(.05, Math.min(2.4, current * (direction < 0 ? .85 : 1 / .85)));
    // Keep the compact seating shell; explicit seatSz is the manual zoom.
    // Turning seatOnePage off also expands unrelated adventure/tool panels.
    S.seatOnePage = true;
    save();
    renderSeat();
  }
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
          if (!button.disabled) changeSize(id === 'chSeatSmaller' ? -1 : 1);
        } else if (id === 'chSeatFit') {
          S.seatSz = 0;
          S.seatOnePage = true;
          if (document.body.classList.contains('narrow')) DB.narrowSeat = 'fit';
          save();
          if (typeof applyNarrow === 'function') applyNarrow();
          window.scrollTo({ top: 0, behavior: 'instant' });
          renderSeat();
          refit();
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
    const smaller = document.getElementById('seSzM'), larger = document.getElementById('seSzP');
    if (smaller) smaller.onclick = () => changeSize(-1);
    if (larger) larger.onclick = () => changeSize(1);
    const en = english(), narrow = document.body.classList.contains('narrow');
    const fit = narrow ? (typeof nwSeatMode === 'function' && nwSeatMode() === 'fit') : S.seatOnePage !== false && !S.seatSz;
    const nativeFit = document.getElementById('seFit');
    if (nativeFit) { nativeFit.classList.toggle('on', !!fit); nativeFit.onclick = () => document.getElementById('chSeatFit').click(); }
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
    style.textContent = 'body.ch-seat-measuring #sg,body.ch-seat-measuring #sg *{transition:none!important}#chSeatControls{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:4px 0 6px;font-size:12px;line-height:1.3}#chSeatControls .nb{min-height:32px;padding:5px 9px;font-size:12px;white-space:nowrap}#chSeatControls [hidden]{display:none!important}#chSeatControls button:focus-visible{outline:3px solid var(--cyan,#21b6d7);outline-offset:2px}@media(max-width:639px){#chSeatControls{gap:4px}#chSeatControls .nb{min-height:36px;padding:5px 8px}}';
    document.head.appendChild(style);
    if (typeof ResizeObserver === 'function') sizeObserver = new ResizeObserver(refit);
    const originalZoom = seatZoom;
    seatZoom = function () {
      const sg = document.getElementById('sg');
      if (!sg || !sg.offsetWidth || typeof S === 'undefined' || !S) return;
      // The native ResizeObserver watches the seat wrapper. Never reset its
      // zoom to 1 on a stable layout: that can wake the observer indefinitely.
      const signature = layoutSignature(sg);
      if (lastGrid === sg && lastLayout === signature) return;
      const result = originalZoom.apply(this, arguments);
      applyLayout();
      lastGrid = sg;
      lastLayout = layoutSignature(sg);
      return result;
    };
    const original = renderSeat;
    renderSeat = function () { const result = original.apply(this, arguments); sync(); seatZoom(true); refit(); return result; };
    addEventListener('resize', () => { sync(); if (document.getElementById('sg')) seatZoom(true); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', refit);
    sync();
    refit();
    return true;
  }
  window.CH_SEAT_CONTROLS = { install, sync, refit };
})();


