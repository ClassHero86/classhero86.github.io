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
    ['建立自己的班級', 'Create your class', '填寫班名，再貼上名單；還沒有名單，也可以輸入人數，用座號先開始。', 'Name your class, then paste a list. No list yet? Enter the class size and start with numbered students.', '快速建立班級', 'Quick class setup', '下一步：看座位', 'Next: see seats'],
    ['全班一眼看清', 'See the whole class', '先用預設座位上課即可。需要時，用「全班一頁」或「座位大小」調整顯示；不用先完成排位。', 'Start with the default seats. Use Fit class or Seat size if needed; arranging seats can wait.', '查看全班座位', 'See the class', '下一步：試加分', 'Next: award points'],
    ['選規則，點學生加分', 'Choose an award, then a student', '從底部選擇加分規則，再點學生。若規則顯示「首次×2」，每日第一次 +5 會加成 +10，其後為 +5。按錯可按「撤銷」。其他玩法稍後再探索。', 'Choose an award below, then click a student. If First time ×2 is shown, the first +5 award each day becomes +10; later awards give +5. Use Undo if needed. Other games can wait.', '查看加分規則', 'See awards', '完成，開始上課', 'Done; start teaching']
  ];
  function remember() { try { localStorage.setItem(key(), 'seen'); } catch (_) {} }
  function seen() { try { return !!localStorage.getItem(key()); } catch (_) { return false; } }
  function seats() { if (typeof setView === 'function') setView('seat'); }
  function quickClass() {
    // Only the untouched starter class is eligible. Never replace an existing
    // class or copy the fictional guest roster into a signed-in account.
    if (!eligible() || typeof S === 'undefined' || !S || demo(S) || (S.students || []).length) return false;
    if (typeof modal !== 'function' || typeof parseNames !== 'function' || typeof addNames !== 'function' || typeof seatFit !== 'function' || typeof autoSeat !== 'function') return false;
    const room = S, scope = key();
    const encode = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    modal('<div data-notr><h2>' + t('建立自己的班級', 'Create your class') + '</h2>' +
      '<label for="chQuickName">' + t('班級名稱', 'Class name') + '</label><input id="chQuickName" maxlength="30" value="' + encode(room.name || '') + '" placeholder="' + t('例如：三年甲班', 'e.g. Class 3A') + '">' +
      '<div class="row" style="margin:12px 0"><button type="button" class="chip" id="chQuickList" aria-pressed="true">' + t('貼上名單', 'Paste a list') + '</button><button type="button" class="nb" id="chQuickNumbers" aria-pressed="false">' + t('先用座號', 'Use numbers') + '</button></div>' +
      '<div id="chQuickListFields"><label for="chQuickNames">' + t('每行一位學生，可直接貼上 Excel 名單', 'One student per line; you can paste from Excel') + '</label><textarea id="chQuickNames" rows="6" placeholder="' + t('小明\n小欣\n小宇', 'Alex\nMia\nLeo') + '"></textarea></div>' +
      '<div id="chQuickNumberFields" hidden><label for="chQuickCount">' + t('學生人數（1–60）', 'Number of students (1–60)') + '</label><input id="chQuickCount" type="number" min="1" max="60" step="1" value="30"><p>' + t('先建立 01、02、03…；之後可以換成姓名，保留分數與座位。', 'Start with 01, 02, 03… Replace these with names later, keeping points and seats.') + '</p></div>' +
      '<p>' + t('可以使用暱稱或座號，不必輸入真名。同名學生請加上座號；重複姓名只加入一次。其他設定稍後再調整。', 'Nicknames or numbers are fine. Add a number to distinguish students with the same name; duplicates are added once. Other settings can wait.') + '</p><p id="chQuickError" role="alert" style="color:#c62828"></p>' +
      '<div class="row"><button type="button" class="chip big2" id="chQuickSave">' + t('建立班級，查看座位', 'Create class & see seats') + '</button><button type="button" class="nb" id="chQuickCancel">' + t('稍後再建', 'Not now') + '</button></div></div>', () => {
        const $ = id => document.getElementById(id);
        let numbered = false, submitted = false;
        const choose = value => {
          numbered = value; $('chQuickListFields').hidden = value; $('chQuickNumberFields').hidden = !value;
          $('chQuickList').setAttribute('aria-pressed', String(!value)); $('chQuickNumbers').setAttribute('aria-pressed', String(value));
          $('chQuickError').textContent = ''; $(value ? 'chQuickCount' : 'chQuickNames').focus();
        };
        $('chQuickList').onclick = () => choose(false);
        $('chQuickNumbers').onclick = () => choose(true);
        $('chQuickCancel').onclick = () => closeM();
        $('chQuickSave').onclick = () => {
          if (submitted) return;
          const fail = message => { $('chQuickError').textContent = message; };
          if (scope !== key() || S !== room || !eligible() || (room.students || []).length) return fail(t('班級狀態已變更，請關閉此視窗後重新開始。', 'Your class changed. Close this window and start again.'));
          if (window.CH && typeof window.CH.canWrite === 'function' && !window.CH.canWrite()) return fail(t('目前無法儲存班級，請先檢查帳戶狀態。', 'Your account cannot save a class right now. Please check its status.'));
          const name = $('chQuickName').value.trim();
          if (!name) return fail(t('請先填寫班級名稱。', 'Please enter a class name.'));
          let list;
          if (numbered) {
            const count = Number($('chQuickCount').value);
            if (!Number.isInteger(count) || count < 1 || count > 60) return fail(t('請輸入 1 至 60 的整數。', 'Enter a whole number from 1 to 60.'));
            list = Array.from({length:count}, (_, i) => String(i + 1).padStart(2, '0'));
          } else {
            list = parseNames($('chQuickNames').value);
            if (!list.length) return fail(t('請貼上學生名單，或選擇「先用座號」。', 'Paste a student list or choose Use numbers.'));
            if (list.length > 200) return fail(t('一次最多加入 200 位學生，請縮短名單。', 'Add up to 200 students at a time. Please shorten the list.'));
            if (list.some(x => Object.prototype.hasOwnProperty.call(Object.prototype, String(x && x.n !== undefined ? x.n : x).slice(0, 40)))) return fail(t('名單有無法使用的名稱，請在名稱前加上座號再試。', 'The list contains a reserved name. Add a student number before it and try again.'));
          }
          submitted = true;
          room.name = name.slice(0, 30);
          addNames(list); // Existing app path creates, saves and renders students.
          // This is a brand-new empty class, so there is no teacher arrangement
          // to preserve. Use the existing auto-seat path and persist its result.
          room.grid = seatFit();
          autoSeat();
          seats(); step = 1;
          trigger.textContent = t('繼續：看座位與試加分', 'Continue: seats & points');
        };
        $('chQuickName').focus();
      });
    return true;
  }
  function action() {
    if (step === 0) { if (!quickClass()) { const b = document.getElementById('btnAdd'); if (b) b.click(); } }
    else {
      seats();
      if (typeof seatEdit !== 'undefined' && seatEdit) { const b = document.getElementById('seDone') || document.getElementById('seEdit'); if (b) b.click(); }
      if (step === 2) { const b = document.getElementById('pickCur'); if (b) { b.scrollIntoView({ block: 'nearest' }); b.focus(); } }
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
    panel.querySelector('strong').textContent = (step + 1) + '/' + steps.length + ' · ' + t(s[0], s[1]);
    panel.querySelector('#chLgText').textContent = t(s[2], s[3]);
    panel.querySelector('.ch-lg-note').textContent = t('可隨時收起指引，直接操作班級。', 'Minimize this guide at any time to work with your class.');
    const labels = {close: t('收起', 'Minimize'), action: t(s[4], s[5]), next: t(s[6], s[7]), back: t('上一步', 'Back'), skip: t('略過指引，返回座位', 'Skip guide; go to seats')};
    panel.querySelectorAll('[data-lg]').forEach(b => { b.textContent = labels[b.dataset.lg]; b.onclick = () => {
      const a = b.dataset.lg;
      if (a === 'action') action();
      else if (a === 'close') close(false);
      else if (a === 'skip') close(true);
      else if (a === 'back') { step = Math.max(0, step - 1); draw(); panel.querySelector('[data-lg="next"]').focus(); }
      else if (step === steps.length - 1) close(true);
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
    // This URL comes from the explicit "create my class" demo action.
    // Ordinary launches still show only an optional invitation.
    if (new URLSearchParams(location.search).get('firstLesson') === '1' && eligible()) {
      journey = true; journeyKey = key(); remember(); quickClass();
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
