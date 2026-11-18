/*! © 2026 getClassHero — 86 Studio. */
/* 座位表「一頁睇晒」永遠開（任何視窗大細）：
   版面 cw×ch 格由視窗實際剩餘空間直接計，格內公仔／名／Lv／金幣填滿格，唔再用 CSS zoom 將成張卡連字縮細。
   座位頁＋矮視窗（高 <=800）派獎列自動收成一行（同手動 ▼ 一樣，唔改存檔）；撳「答對 ▾」彈出全部獎勵。
   本檔自己帶齊版面 CSS／計算，唔依賴主程式（APPMAIN）有無 fitCompleteSeatGrid，所以可以單獨上線。
   座位工具開關＝橫額列嘅 🛠（#fcBar）。舊版「全班一頁／＋／−／字型」掣一律移除。 */
(function () {
  'use strict';
  let installed = false;
  let refitFrame = 0, lastGrid = null, lastLayout = '';
  const STYLE = "/* ===== 座位表「一頁睇晒」（body.fcC＝座位頁，任何闊度）：cw×ch 由 fitCompleteSeatGrid 按視窗計；變數 --ph 公仔高／--nf 名／--lf Lv·金幣 ===== */\nhtml body.narrow.fcC:has(#v-seat.on) main{padding:4px 2px 4px!important}\nhtml body.fcC #v-seat .board{font-size:11px;line-height:16px;padding:0 8px;border-width:2px;border-radius:6px;margin:3px auto 0;box-shadow:none;max-width:260px}\nhtml body.fcC #v-seat .editwarn{margin:0 0 4px;padding:3px 8px;font-size:12px}\nhtml body.fcC .seatwrap{scrollbar-gutter:auto;overflow:visible;transition:none}\nhtml body.fcC #seatNoticeSummary{padding:2px 10px;min-height:0;font-size:12px;margin:0 0 3px}\nhtml body.fcC .seat-preview-toggle,html body.fcC #chSeatControls{display:none!important}\nhtml body.fcC #sg.sfx{max-width:none;justify-content:center;align-content:start;grid-auto-rows:var(--ch,116px)}\nhtml body.fcC #sg.sfx .seat{min-height:0;padding:2px;border-width:2px;border-radius:8px;overflow:hidden;box-sizing:border-box;box-shadow:0 2px 0 #180b40;\n display:flex;flex-direction:column;align-items:stretch;justify-content:center}\nhtml body.fcC #sg.sfx .sav{flex:0 0 auto;height:var(--ph);display:flex;justify-content:center;align-items:flex-end;line-height:0}\nhtml body.fcC #sg.sfx .sav>img,html body.fcC #sg.sfx .sav>svg,html body.fcC #sg.sfx .sav .chb{height:var(--ph)!important;width:calc(var(--ph) * .7164)!important}\nhtml body.fcC #sg.sfx .snm{flex:0 0 auto;font-size:var(--nf);font-weight:900;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:clip;margin:0}\nhtml body.fcC #sg.sfx:not(.sf-rich) .snmen,html body.fcC #sg.sfx:not(.sf-rich) .slv .stars,html body.fcC #sg.sfx .sjob{display:none}\nhtml body.fcC #sg.sfx .snmen{flex:0 0 auto;font-size:var(--lf);line-height:1.1}\nhtml body.fcC #sg.sfx .slv{flex:0 0 auto;font-size:var(--lf);line-height:1.2;flex-wrap:nowrap;justify-content:center;gap:0 6px;overflow:hidden}\nhtml body.fcC #sg.sfx.sf-stack .slv{flex-direction:column;align-items:center;gap:0}\nhtml body.fcC #sg.sfx .slv .co{width:.95em;height:.95em;margin-right:2px}\nhtml body.fcC #sg.sfx .sbar{display:block;flex:0 0 3px;height:3px;margin:2px 4px 0;border:0;border-radius:2px}\nhtml body.fcC #sg.sfx.sf-lo .sbar{display:none}\nhtml body.fcC #sg.sfx .sinfo{width:calc(var(--lf) * 1.5);height:calc(var(--lf) * 1.5);line-height:calc(var(--lf) * 1.4);font-size:calc(var(--lf) * .9);left:0;top:0;border-width:1px;opacity:.85}\nhtml body.fcC #sg.sfx .sflag{font-size:calc(var(--lf) * .9);top:0;right:1px}\nhtml body.fcC #sg.sfx .adv-x2,html body.fcC #sg.sfx .adv-sh,html body.fcC #sg.sfx .adv-xp,html body.fcC #sg.sfx .adv-x1{font-size:9px;padding:0 2px;left:1px;bottom:5px;border-width:1px;border-radius:5px;line-height:1.2}\nhtml body.fcC #sg.sfx .adv-sh{left:auto;right:1px}body.fcC #sg .adv-xp{bottom:19px}body.fcC #sg .adv-x1{left:auto;right:1px;bottom:19px}\nhtml body.fcC #sg.sfx .seat.empty .splus{font-size:calc(var(--nf) * 1.3);line-height:1;margin:auto}\nhtml body.fcC #sg.sfx.sf-n2 .snm{white-space:normal;overflow-wrap:anywhere;word-break:break-all;line-height:1.1;height:calc(var(--nf) * 2.2);display:flex;align-items:center;justify-content:center;text-align:center}\nhtml body.fcC #sg.sfx.sf-badge .slv>span:first-child{position:absolute;left:2px;top:2px;z-index:2;font-size:var(--lf);line-height:1.1;padding:0 3px;border-radius:5px;background:#180b40e6;color:var(--gold)}\nhtml body.fcC #sg.sfx.sf-badge .sinfo{display:none}\nhtml body.fcC #sg.sfx.sf-badge .sflag{top:1px}\n/* 橫身格（闊 > 1.3×高）：公仔喺左、字喺右 */\nhtml body.fcC #sg.sfx.sf-row .sav{position:absolute;left:3px;top:50%;transform:translateY(-50%)}\nhtml body.fcC #sg.sfx.sf-row .snm,html body.fcC #sg.sfx.sf-row .snmen,html body.fcC #sg.sfx.sf-row .slv{margin-left:calc(var(--ph) * .7164 + 8px)}\nhtml body.fcC #sg.sfx.sf-row .snm{margin-right:calc(var(--lf) * 1.5 + 2px)}\nhtml body.fcC #sg.sfx.sf-row .sbar{margin-left:calc(var(--ph) * .7164 + 12px)}\nhtml body.fcC #sg.sfx.sf-row .sinfo{left:auto;right:0}\nhtml body.fcC #sg.sfx.sf-row .sflag{right:calc(var(--lf) * 1.6)}\nhtml body.fcC #v-seat .board{max-width:min(260px,calc(100vw - 230px))}\n#chAwardTab{position:fixed;left:6px;bottom:6px;z-index:44;display:none;align-items:center;justify-content:center;gap:4px;min-height:34px;padding:3px 11px;box-sizing:border-box;border-radius:12px;font:inherit;font-size:14px;font-weight:900;line-height:1.1;white-space:nowrap;cursor:pointer;background:#ffcf3d;color:#2a1d12;border:3px solid #1d0d4d;box-shadow:0 3px 0 #1d0d4d}\n#chAwardTab:active{transform:translateY(2px);box-shadow:0 1px 0 #1d0d4d}\n#chAwardTab:focus-visible{outline:3px solid #21b6d7;outline-offset:2px}\nbody.chTabOn #chAwardTab{display:flex}\nbody.chTabOpen #chAwardTab{z-index:60;background:#fff}\nbody.chDockPop #dock{display:flex!important;flex-wrap:wrap;position:fixed!important;left:0;right:0;top:auto!important;bottom:0;z-index:45;max-height:70vh;overflow-y:auto;overflow-x:hidden;padding:12px 12px 14px!important;box-sizing:border-box;border-radius:20px 20px 0 0;transform:none!important;pointer-events:auto!important}\nbody.chDockPop #dock .rchip{display:inline-block!important}\nbody.chDockPop #dock #chScoreSummary{display:block!important}\nhtml body.fcC #sg.sfx .slv{font-size:var(--lf)!important}\nhtml body.dockmin #dock #chScoreSummary{display:none!important}\nbody.ch-seat-measuring #sg,body.ch-seat-measuring #sg *{transition:none!important}\n";
  /* ---- 一頁睇晒版面：cw×ch 格由視窗實際剩餘空間計，格內公仔／名／Lv／金幣填滿格 ---- */
  function fitSeats(sg) {
    const wrap = sg.parentElement, g = S.grid || { c: 6, r: 5 };
    const C = Math.max(1, g.c | 0), R = Math.max(1, g.r | 0);
    if (!wrap) return;
    sg.classList.add('sfx');
    // zoom 固定 1：舊版 hover 預覽／narrow 規則靠 zoom 判斷；唔再用 zoom 縮細
    sg.style.zoom = '1'; sg.style.width = ''; sg.style.maxWidth = 'none'; sg.classList.remove('slim');
    wrap.style.maxHeight = ''; wrap.style.overflowY = '';
    const vp = window.visualViewport, vb = vp ? vp.offsetTop + vp.height : innerHeight;
    let bottom = Math.min(vb, innerHeight) - 6;
    const dk = document.getElementById('dock');
    if (dk && getComputedStyle(dk).display !== 'none') {
      const dr = dk.getBoundingClientRect();
      if (dr.height > 0 && dr.width > 0 && dr.top > 0 && dr.top < bottom) bottom = dr.top - 6;
    }
    let below = 0; const wr = wrap.getBoundingClientRect(), cs0 = getComputedStyle(wrap);
    for (let e = wrap.nextElementSibling; e; e = e.nextElementSibling) {
      if (getComputedStyle(e).display === 'none') continue;
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (r.top >= wr.top) below += r.height + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
    }
    below += (parseFloat(cs0.paddingBottom) || 0) + (parseFloat(cs0.marginBottom) || 0);
    const W = wrap.clientWidth - (parseFloat(cs0.paddingLeft) || 0) - (parseFloat(cs0.paddingRight) || 0);
    const top = sg.getBoundingClientRect().top;
    if (!W) return;
    const GAP = (W / C < 80 || (bottom - top) / R < 80) ? 3 : 6;
    const H = bottom - top - below;
    let cw = Math.floor((W - GAP * (C - 1)) / C), ch = Math.floor((H - GAP * (R - 1)) / R);
    cw = Math.max(34, Math.min(cw, 320)); ch = Math.max(30, Math.min(ch, 240));
    const row = cw / ch > 1.3, pad = 4, AR = .7164;
    const plan = (nl, badge) => {
      let nf, lf, ph; const stack = cw < 104 || row;
      const lines = badge ? 1 : (stack ? 2 : 1);
      if (row) {
        ph = Math.min(ch - pad - 2, (cw - pad) * .46 / AR);
        const tw = cw - pad - ph * AR - 8;
        nf = Math.max(11, Math.min(ch * .19, tw / 3.4, 26)); lf = Math.max(11, Math.min(nf * .82, 19));
        return { ph: Math.max(22, Math.floor(ph)), nf, lf, stack: true, ok: nl * nf * 1.15 + lines * lf * 1.2 + 6 <= ch };
      }
      nf = Math.max(11, Math.min(cw * .2, ch * .15, 24)); lf = Math.max(11, Math.min(cw * .15, ch * .115, 19));
      ph = ch - pad - nl * nf * 1.15 - lines * lf * 1.2 - (ch > 96 ? 5 : 1);
      ph = Math.min(ph, (cw - pad - 2) / AR);
      return { ph: Math.max(22, Math.floor(ph)), nf, lf, stack, ok: ph >= 22 };
    };
    const names = [].slice.call(sg.querySelectorAll('.snm'));
    const fitNm = (floor, two) => {
      let bad = 0;
      names.forEach(e => {
        e.style.fontSize = ''; let n = 0;
        const over = () => two ? e.scrollHeight > e.clientHeight + 1 : e.scrollWidth > e.clientWidth + 1;
        while (over() && n < 14) { const cur = parseFloat(getComputedStyle(e).fontSize) || 12; if (cur <= floor) break; e.style.fontSize = Math.max(floor, cur - .5) + 'px'; n++; }
        if (over()) bad++;
      });
      return bad;
    };
    const apply = (pl, nl, badge) => {
      const rich = (row ? ch >= 104 && cw >= 190 : ch >= 150 && cw >= 150) && !badge;
      sg.classList.toggle('sf-row', row); sg.classList.toggle('sf-stack', pl.stack); sg.classList.toggle('sf-rich', rich);
      sg.classList.toggle('sf-lo', ch < 70); sg.classList.toggle('sf-n2', nl === 2); sg.classList.toggle('sf-badge', badge);
      sg.style.setProperty('--cw', cw + 'px'); sg.style.setProperty('--ch', ch + 'px');
      sg.style.setProperty('--ph', pl.ph + 'px'); sg.style.setProperty('--nf', pl.nf.toFixed(1) + 'px'); sg.style.setProperty('--lf', pl.lf.toFixed(1) + 'px');
      sg.style.gap = GAP + 'px';
      sg.style.gridTemplateColumns = 'repeat(' + C + ',' + cw + 'px)'; sg.style.gridTemplateRows = 'repeat(' + R + ',' + ch + 'px)';
    };
    let nl = 1, badge = false, pl = plan(1, false);
    if (!row && pl.ph < 40) { badge = true; pl = plan(1, true); }
    apply(pl, 1, badge);
    if (fitNm(10.5, false)) {
      let p2 = plan(2, badge); if (!row && !badge && p2.ph < 40) { badge = true; p2 = plan(2, true); }
      if (p2.ok || p2.ph >= pl.ph * .6) { nl = 2; pl = p2; apply(pl, 2, badge); fitNm(10.5, true); }
    }
  }


  /* ---- 加分入口保險：派獎列被收埋／窄屏隱藏／縮到睇唔到時，右下角永遠有「⭐ 加分」掣，以浮層（唔推高座位）開關派獎列 ---- */
  const en = () => document.documentElement.classList.contains('i18n-en');
  const isOpen = () => document.body.classList.contains('nwsheet') || document.body.classList.contains('chDockPop');
  function dockReachable() {
    const dk = document.getElementById('dock');
    if (!dk) return false;
    const cs = getComputedStyle(dk); if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = dk.getBoundingClientRect();
    return r.height > 8 && r.width > 8 && r.top < innerHeight - 8 && r.bottom > 8;
  }
  function setOpen(on) {
    const B = document.body;
    if (B.classList.contains('narrow') && typeof nwSheet === 'function') { nwSheet(on); B.classList.remove('chDockPop'); }
    else B.classList.toggle('chDockPop', on);
    tabSync();
  }
  function tabSync() {
    const B = document.body;
    let t = document.getElementById('chAwardTab');
    if (!t) {
      t = document.createElement('button'); t.type = 'button'; t.id = 'chAwardTab';
      t.addEventListener('click', e => { e.stopPropagation(); setOpen(!isOpen()); });
      document.body.appendChild(t);
    }
    const open = isOpen();
    const need = B.classList.contains('nwhasdock') && !B.classList.contains('inhall') && !B.classList.contains('rdView') && (open || !dockReachable());
    B.classList.toggle('chTabOn', !!need); B.classList.toggle('chTabOpen', open);
    const label = open ? (en() ? '▼ Close' : '▼ 收埋') : (en() ? '⭐ Award ▲' : '⭐ 加分 ▲');
    if (t.textContent !== label) t.textContent = label;
    t.setAttribute('aria-expanded', String(open));
    t.title = en() ? 'Show / hide the award bar' : '展開／收埋加分列';
    if (open) { const dk = document.getElementById('dock'); if (dk) { const top = dk.getBoundingClientRect().top; t.style.bottom = Math.max(6, innerHeight - top + 6) + 'px'; } }
    else t.style.bottom = '';
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('chDockPop')) setOpen(false); });
  document.addEventListener('pointerdown', e => {
    if (!document.body.classList.contains('chDockPop')) return;
    const t = e.target; if (t && t.closest && (t.closest('#dock') || t.closest('#chAwardTab') || t.closest('#modal'))) return;
    setOpen(false);
  }, true);
  document.addEventListener('click', e => {
    if (!document.body.classList.contains('chDockPop')) return;
    const b = e.target && e.target.closest && e.target.closest('#dock .rchip,#dock #pickCur');
    if (b) setTimeout(() => setOpen(false), 0);
  }, true);
  function layoutSignature(sg) {
    const wrap = sg.parentElement, rect = sg.getBoundingClientRect();
    const dock = document.getElementById('dock'), dr = dock && dock.getBoundingClientRect();
    const host = document.getElementById('v-seat'), board = host && host.querySelector('.board');
    const br = board && board.getBoundingClientRect(), vp = window.visualViewport;
    const fc = document.getElementById('fcBar'), fr = fc && fc.getBoundingClientRect();
    return [wrap && wrap.clientWidth, Math.round(rect.top * 2) / 2, innerHeight,
      vp && vp.height, vp && vp.offsetTop, dr && Math.round(dr.top * 2) / 2, dr && Math.round(dr.height),
      br && Math.round(br.height), fr && Math.round(fr.height), S.grid && S.grid.c, S.grid && S.grid.r, S.seatNm || 0,
      !!S.flip, S.students && S.students.length,
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
  function observe() {
    if (!sizeObserver) return;
    [document.getElementById('dock'), document.querySelector('header'), document.getElementById('fcBar'),
      document.getElementById('seatNoticeSummary'), document.getElementById('chClassTools')].forEach(el => {
      if (el && !watched.has(el)) { watched.add(el); sizeObserver.observe(el); }
    });
  }
  function dockAuto() { try { return view === 'seat' && innerHeight <= 800; } catch (e) { return false; } }
  function sync() {
    // 舊版掣一律移除；舊存檔 seatSz／seatOnePage／窄屏座位模式正規化
    const old = document.getElementById('chSeatControls');
    if (old) old.remove();
    ['seSzM', 'seSzP', 'seSzA', 'seFit'].forEach(id => { const b = document.getElementById(id); if (b) b.remove(); });
    const t = document.getElementById('seSzT'); if (t && t.parentElement) t.parentElement.remove();
    if (typeof S !== 'undefined' && S) { if (S.seatSz) S.seatSz = 0; if (S.seatOnePage === false) S.seatOnePage = true; }
    try { if (typeof DB !== 'undefined' && DB && DB.narrowSeat && DB.narrowSeat !== 'fit') { DB.narrowSeat = 'fit'; if (typeof applyNarrow === 'function') applyNarrow(); } } catch (e) {}
    observe();
    tabSync();
  }
  function install() {
    if (installed) return true;
    if (typeof renderSeat !== 'function' || typeof seatZoom !== 'function') return false;
    installed = true;
    const style = document.createElement('style');
    style.id = 'chSeatFitCss';
    style.textContent = STYLE;
    document.head.appendChild(style);
    if (typeof ResizeObserver === 'function') sizeObserver = new ResizeObserver(refit);
    seatZoom = function () {
      const sg = document.getElementById('sg');
      if (!sg || !sg.offsetWidth || typeof S === 'undefined' || !S) return;
      // 版面簽名冇變就唔重算，避免 ResizeObserver 互相觸發
      const signature = layoutSignature(sg);
      if (lastGrid === sg && lastLayout === signature) return;
      document.body.classList.add('ch-seat-measuring');
      try { fitSeats(sg); } finally { document.body.classList.remove('ch-seat-measuring'); }
      lastGrid = sg;
      lastLayout = layoutSignature(sg);
    };
    // 主程式窄屏 resize 會直接叫 nwFit：一律轉去新版面
    if (typeof nwFit === 'function') nwFit = function (sg) { if (sg) { lastGrid = null; fitSeats(sg); } };
    if (typeof nwSet === 'function') { const o = nwSet; nwSet = function () { const r = o.apply(this, arguments); const b = document.getElementById('sNarrowSeat'); if (b) b.remove(); return r; }; }
    if (typeof applyDock === 'function') {
      const od = applyDock;
      applyDock = function () { const r = od.apply(this, arguments); try { if (dockAuto()) document.body.classList.add('dockmin'); } catch (e) {} return r; };
    }
    if (typeof render === 'function') {
      const orr = render;
      render = function () { try { applyDock(); } catch (e) {} return orr.apply(this, arguments); };
    }
    const original = renderSeat;
    renderSeat = function () { const result = original.apply(this, arguments); sync(); lastGrid = null; seatZoom(true); refit(); return result; };
    addEventListener('resize', () => { try { tabSync(); applyDock(); if (typeof syncPad === 'function') syncPad(); } catch (e) {} sync(); lastGrid = null; if (document.getElementById('sg')) seatZoom(true); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', refit);
    sync();
    refit();
    setInterval(tabSync, 600);
    return true;
  }
  window.CH_SEAT_CONTROLS = { install, sync, refit };
})();
