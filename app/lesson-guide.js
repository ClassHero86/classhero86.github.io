/*! © 2026 getClassHero — 86 Studio. */
(function () {
  'use strict';
  let installed = false, panel, trigger, step = 0, active = false;
  const key = () => 'ch:first-lesson-guide:v1:' + (window.CH && window.CH.profile && window.CH.profile.user_id ? 'account:' + window.CH.profile.user_id : 'device');
  let journey = false, journeyKey = '', initialRooms = null, roomScope = '';
  const knownClassScopes = new Set();
  const historyKey = () => key() + ':has-class';
  const demo = r => r && (r.demo === true || r.isDemo === true);
  function eligible() {
    const scope = key();
    if (roomScope !== scope) { roomScope = scope; initialRooms = null; }
    if (journey && journeyKey !== scope) journey = false;
    let hadClass = knownClassScopes.has(scope);
    try { hadClass = hadClass || localStorage.getItem(historyKey()) === '1'; } catch (_) {}
    if (hadClass) knownClassScopes.add(scope);
    const db = typeof DB !== 'undefined' && DB;
    if (!db || !Array.isArray(db.rooms)) return false;
    const rooms = db.rooms.filter(r => r && !demo(r));
    const ids = rooms.map(r => r.id).filter(Boolean);
    const added = initialRooms && ids.some(id => !initialRooms.has(id));
    if (!initialRooms) initialRooms = new Set(ids);
    const defaults = /^(我的班級|新班別|班別|my class|new class|class)?$/i;
    const used = r => !defaults.test(String(r.name || '').trim()) ||
      ['students', 'removed', 'qMy', 'quests', 'hist'].some(p => Array.isArray(r[p]) && r[p].length > 0) ||
      !!(r.lastAct || r.prevAct || r.lastWin);
    if (added || rooms.length > 1 || rooms.some(used) ||
        (Array.isArray(db.arch) && db.arch.some(r => r && !demo(r)))) {
      hadClass = true;
      knownClassScopes.add(scope);
      try { localStorage.setItem(historyKey(), '1'); } catch (_) {}
    }
    return !hadClass;
  }
  function syncAvailability() {
    const allow = eligible() || (journey && journeyKey === key());
    if (!allow) active = false;
    if (trigger) trigger.hidden = !allow || active;
    if (panel) panel.hidden = !allow || !active;
    return allow;
  }
  const en = () => document.documentElement.classList.contains('i18n-en');
  const t = (zh, english) => en() ? english : zh;
  const steps = [
    ['加入學生', 'Add students', '開啟「學生」，貼上名單並儲存。已有學生可直接繼續。', 'Open Students, paste your class list and save. If students are already here, continue.', '開啟學生名單', 'Open Students', '我已確認學生名單', 'I have checked the class list'],
    ['調整座位', 'Arrange seats', '可先用「全班一頁」及「座位大小」調整顯示。需要換位時，進入排位模式，點選學生再點目標位置，完成後按「排完」。排位模式不會加分。', 'Use Fit class and Seat size to adjust the view. To move students, enter seating mode, select a student and then a destination, and finish seating when ready. Seating mode does not award points.', '開啟排位模式', 'Arrange seats', '我已確認座位', 'I have checked the seats'],
    ['選擇加分規則', 'Choose an award', '先完成排位，再從底部獎勵列選擇規則。選擇規則不會加分；點學生才會發放。', 'Finish seating, then choose an award from the bottom bar. Choosing an award does not give points; clicking a student does.', '查看加分規則', 'Show awards', '我已選好規則', 'I have chosen an award'],
    ['練習加分與撤銷', 'Try an award and undo', '如要練習，請自行點一位學生加分，再立即按底部「撤銷」。這會更改真實學生資料，指引不會代你操作。不想練習可直接略過。', 'To practise, click one student to award points, then immediately click Undo in the bottom bar. This changes real student data; the guide will not do it for you. You can skip this practice.', '返回座位練習', 'Go to seats', '我已完成練習，返回座位', 'I have finished; return to seats']
  ];
  function remember() { try { localStorage.setItem(key(), 'seen'); } catch (_) {} }
  function seen() { try { return !!localStorage.getItem(key()); } catch (_) { return false; } }
  function seats() { if (typeof setView === 'function') setView('seat'); }
  function action() {
    if (step === 0) { const b = document.getElementById('btnAdd'); if (b) b.click(); }
    else {
      seats();
      if (step === 1 && typeof seatEdit !== 'undefined' && !seatEdit) { const b = document.getElementById('seEdit'); if (b) b.click(); }
      if (step === 1 && !document.body.classList.contains('nwtools')) { const b = document.getElementById('chSeatTools'); if (b) b.click(); }
      if (step === 2 || step === 3) {
        if (typeof seatEdit !== 'undefined' && seatEdit) { const b = document.getElementById('seDone') || document.getElementById('seEdit'); if (b) b.click(); }
        if (step === 2) { const b = document.getElementById('pickCur'); if (b) { b.scrollIntoView({ block: 'nearest' }); b.focus(); } }
      }
    }
    // Keep the class visible while the teacher carries out the actual action.
    close(false, false);
    trigger.textContent = t('繼續課堂指引', 'Continue lesson guide');
  }
  function close(finish, restoreFocus) {
    remember(); active = false; panel.hidden = true; trigger.hidden = false;
    if (finish) {
      seats();
      if (typeof seatEdit !== 'undefined' && seatEdit) { const b = document.getElementById('seDone') || document.getElementById('seEdit'); if (b) b.click(); }
      step = 0;
      journey = false;
    }
    syncAvailability();
    if (restoreFocus !== false && !trigger.hidden) trigger.focus();
  }
  function draw() {
    if (!panel) return;
    if (!syncAvailability()) return;
    trigger.textContent = t('？教學', '? Help');
    trigger.setAttribute('aria-label', t('開啟第一堂課指引', 'Open first lesson guide'));
    if (!active) return;
    const s = steps[step];
    panel.innerHTML = '<div class="ch-lg-head"><strong id="chLgTitle"></strong><button type="button" data-lg="close"></button></div><p id="chLgText"></p><p class="ch-lg-note"></p><div class="ch-lg-actions"><button type="button" data-lg="action"></button><button type="button" data-lg="next"></button></div><div class="ch-lg-foot"><button type="button" data-lg="back"></button><button type="button" data-lg="skip"></button></div>';
    panel.querySelector('strong').textContent = (step + 1) + '/4 · ' + t(s[0], s[1]);
    panel.querySelector('#chLgText').textContent = t(s[2], s[3]);
    panel.querySelector('.ch-lg-note').textContent = t('各步由你確認；開啟畫面不代表已完成。', 'You confirm each step; opening a screen does not mark it complete.');
    const labels = {close: t('收起', 'Minimize'), action: t(s[4], s[5]), next: t(s[6], s[7]), back: t('上一步', 'Back'), skip: t('略過指引，返回座位', 'Skip guide; go to seats')};
    panel.querySelectorAll('[data-lg]').forEach(b => { b.textContent = labels[b.dataset.lg]; b.onclick = () => {
      const a = b.dataset.lg;
      if (a === 'action') action();
      else if (a === 'close') close(false);
      else if (a === 'skip') close(true);
      else if (a === 'back') { step = Math.max(0, step - 1); draw(); panel.querySelector('[data-lg="next"]').focus(); }
      else if (step === 3) close(true);
      else { step++; draw(); panel.querySelector('[data-lg="next"]').focus(); }
    }; });
    panel.querySelector('[data-lg="back"]').disabled = step === 0;
  }
  function open() {
    if (!panel) mount();
    if (!panel) return;
    if (!syncAvailability()) return false;
    journey = true; journeyKey = key();
    remember(); active = true; panel.hidden = false; trigger.hidden = true; draw();
    panel.querySelector('[data-lg="action"]').focus();
  }
  function mount() {
    if (panel || !document.body || !document.getElementById('app')) return;
    const style = document.createElement('style');
    style.textContent = '#chLessonGuide[hidden],#chLessonHelp[hidden]{display:none!important}#chLessonHelp{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:1100;padding:7px 12px;background:#26125e;color:#fff;border:2px solid #ffd23d;border-radius:12px;font:inherit;cursor:pointer}#chLessonGuide{position:fixed;right:12px;top:82px;width:min(360px,calc(100vw - 24px));max-height:calc(100dvh - 100px);overflow:auto;box-sizing:border-box;z-index:1100;background:#26125e;color:#fff;border:2px solid #ffd23d;border-radius:14px;padding:14px;font:15px/1.5 system-ui,sans-serif;box-shadow:0 4px 0 #160930}#chLessonGuide p{margin:10px 0}#chLessonGuide .ch-lg-head,#chLessonGuide .ch-lg-actions,#chLessonGuide .ch-lg-foot{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#chLessonGuide .ch-lg-head{justify-content:space-between}#chLessonGuide .ch-lg-note{font-size:12px;color:#ddd2ff}#chLessonGuide button{font:inherit;line-height:1.3;padding:8px 10px;border:1px solid #bca5ff;border-radius:7px;background:#392070;color:#fff;cursor:pointer;min-height:36px}#chLessonGuide [data-lg=action]{background:#ffd23d;color:#26125e;border-color:#ffd23d;font-weight:700}#chLessonGuide .ch-lg-foot{margin-top:10px;justify-content:space-between}#chLessonGuide .ch-lg-foot button{font-size:12px;background:transparent}#chLessonGuide button:disabled{opacity:.4;cursor:default}#chLessonGuide button:focus-visible,#chLessonHelp:focus-visible{outline:3px solid #48e5ff;outline-offset:3px}@media(max-width:600px){#chLessonGuide{top:62px;max-height:calc(100dvh - 80px)}}@media print{#chLessonGuide,#chLessonHelp{display:none!important}}';
    document.head.appendChild(style);
    // Reserve the entire dock height so Help never covers awards or Undo.
    style.textContent += '#chLessonHelp{bottom:calc(var(--ch-guide-dock, 110px) + 12px + env(safe-area-inset-bottom))}';
    const dock = document.getElementById('dock');
    const positionHelp = () => {
      const height = dock ? dock.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty('--ch-guide-dock', Math.max(0, height) + 'px');
    };
    positionHelp();
    if (dock && typeof ResizeObserver !== 'undefined') new ResizeObserver(positionHelp).observe(dock);
    trigger = document.createElement('button'); trigger.id = 'chLessonHelp'; trigger.type = 'button'; trigger.hidden = true; trigger.onclick = open;
    panel = document.createElement('aside'); panel.id = 'chLessonGuide'; panel.hidden = true; panel.setAttribute('aria-labelledby', 'chLgTitle'); panel.setAttribute('aria-label', t('第一堂課指引', 'First lesson guide'));
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(false); } });
    document.body.append(trigger, panel); draw();
    if (syncAvailability() && !seen()) {
      remember();
      // Invitation only: never open a modal or change classroom state on startup.
      trigger.textContent = t('第一堂課？開始指引', 'First lesson? Start guide');
    }
    new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  function install() {
    if (installed) return true;
    installed = true;
    // Account state may change on a class switch, import, creation or deletion.
    for (const name of ['save', 'render']) {
      const original = window[name];
      if (typeof original === 'function') window[name] = function () {
        const result = original.apply(this, arguments);
        syncAvailability();
        return result;
      };
    }
    const post = window.CH_POST;
    window.CH_POST = function () { const result = typeof post === 'function' ? post.apply(this, arguments) : undefined; mount(); return result; };
    return true;
  }
  window.CH_LESSON_GUIDE = { install: install, open: open };
})();
