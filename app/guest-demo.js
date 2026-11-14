/* getClassHero guest sandbox. Loaded before any application script. */
(function () {
  'use strict';
  const enabled = new URLSearchParams(location.search).get('demo') === '1';
  if (!enabled) return;
  const en = new URLSearchParams(location.search).get('lang') === 'en';
  const t = (zh, english) => en ? english : zh;
  function memoryStorage() {
    const values = new Map();
    return { get length() { return values.size; }, key(i) { return Array.from(values.keys())[i] || null; },
      getItem(k) { return values.has(String(k)) ? values.get(String(k)) : null; },
      setItem(k, v) { values.set(String(k), String(v)); }, removeItem(k) { values.delete(String(k)); }, clear() { values.clear(); } };
  }
  let isolated = false;
  try {
    const local = memoryStorage(), session = memoryStorage();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: local });
    Object.defineProperty(window, 'sessionStorage', { configurable: true, value: session });
    isolated = window.localStorage === local && window.sessionStorage === session;
  } catch (_) {}
  function ownClass() { location.assign('app.html?lang=' + (en ? 'en' : 'zh') + '&firstLesson=1'); }
  window.CH_GUEST = { enabled: true, isolated, ownClass };
  window.CH = { mode: 'guest', profile: null, api: null, lang: en ? 'en' : 'zh',
    canWrite: () => true, entitlement: () => ({ kind: 'guest', paid: false, write: false }),
    accountPage: ownClass, upgradeCard: ownClass };
  window.CH_GUEST.start = async function () {
    if (!isolated) {
      document.body.textContent = t('此瀏覽器無法安全開啟示範。請使用其他瀏覽器，或返回首頁登入。', 'This browser cannot safely open the demo. Please use another browser or sign in from the home page.');
      return;
    }
    window.CH_LESSON_GUIDE = { install() {} };
    window.CH_USAGE = { installHooks() {} };
    window.CH_PRE = function () {
      window.fromLocal = () => null;
      for (const name of ['fileTouch', 'fileStat', 'askLinkOnce', 'fileBoot', 'appBoot', 'appTouch', 'offDeviceCheck', 'queue']) window[name] = function () {};
      window.save = function () { DB.ts = Date.now(); };
      const originalBoot = window.boot;
      window.boot = function () {
        DB = blank(); DB.lang = en ? 'en' : 'zh'; DB.askedFx = true; DB.noRoll = true;
        DB.sound = true; DB.cur = 0;
        S = DB.rooms[0]; S.name = t('冒險示範班（虛構學生）', 'Adventure demo (fictional students)');
        S.demo = true; S.gender = 'mix'; S.grid = { c: 4, r: 3 }; S.seatOnePage = true; S.flip = true;
        const names = en ? ['Alex','Mia','Leo','Zoe','Kai','Emma','Ryan','Lily','Noah','Ivy','Ben','Amy'] : ['子朗','心晴','樂言','雅琳','宇軒','詠恩','俊熙','芷晴','承希','思穎','柏言','曉彤'];
        const exp = Array.from({ length: LV_T2 - 1 }, (_, i) => need(i + 1)).reduce((a, b) => a + b, 0);
        S.students = names.map((name, i) => Object.assign(NEWSTU(name), { g: i % 2 ? 'f' : 'm', br: BR[Math.floor(i / 2) % BR.length].id, exp, coins: 100, seat: [i % 4, Math.floor(i / 4)] }));
        document.getElementById('DBSTATE').textContent = JSON.stringify(DB);
        return originalBoot.apply(this, arguments);
      };
    };
    window.CH_POST = function () {
      setView('seat');
      const bar = document.createElement('section'); bar.id = 'chGuestBar'; bar.setAttribute('data-notr', '');
      bar.innerHTML = '<strong></strong><span id="chGuestHint" role="status"></span><nav aria-label="Demo activities"><button data-demo="seat"></button><button data-demo="boss"></button><button data-demo="quiet"></button><button data-demo="save" class="primary"></button></nav>';
      bar.querySelector('strong').textContent = t('免登入示範 · 放心試玩', 'Try it freely · No sign-in');
      const hint = bar.querySelector('#chGuestHint');
      hint.textContent = t('點一位學生加分。資料只留在本頁，重新整理即可重玩。', 'Click a student to award points. This demo resets when you reload.');
      const labels = { seat: t('① 試加分', '① Award points'), boss: t('② 挑戰 BOSS', '② Battle a BOSS'), quiet: t('③ 靜音看世界', '③ Quiet World'), save: t('建立並儲存自己的班級 → 登入', 'Create & save my class → Sign in') };
      bar.querySelectorAll('button').forEach(button => {
        const action = button.dataset.demo; button.textContent = labels[action];
        button.onclick = () => {
          if (action === 'save') return ownClass();
          if (typeof closeM === 'function') closeM();
          if (action !== 'quiet') document.getElementById('qw-exit')?.click();
          if (action === 'seat') { setView('seat'); hint.textContent = t('點學生即可加分；也可以在底部選擇其他獎勵。', 'Click a student to award points, or choose another award below.'); }
          if (action === 'boss') { setView('boss'); hint.textContent = t('選擇一個 BOSS 開戰，再點學生發動攻擊。', 'Choose a BOSS to begin, then click students to attack.'); }
          if (action === 'quiet') { document.getElementById('qw-open')?.click(); hint.textContent = t('開啟麥克風後保持安靜，讓秘境朋友現身；聲音不會上傳。', 'Enable the microphone and stay quiet to welcome visitors. Audio stays on this device.'); }
        };
      });
      document.body.prepend(bar);
      const style = document.createElement('style');
      style.textContent = '#chGuestBar{position:relative;z-index:51;background:#173e38;color:#fff7dd;padding:10px 16px;display:flex;gap:8px 16px;align-items:center;flex-wrap:wrap;font:14px/1.5 system-ui}#chGuestBar strong{color:#ffe08a}#chGuestHint{flex:1;min-width:220px}#chGuestBar nav{display:flex;gap:6px;flex-wrap:wrap}#chGuestBar button{border:1px solid #ccdbc1;border-radius:9px;background:#fffbee;color:#203b32;padding:8px 11px;font:inherit;cursor:pointer}#chGuestBar .primary{background:#ffe08a;font-weight:700}#chGuestBar button:focus-visible{outline:3px solid #ffab66;outline-offset:2px}#chGuestBar~header{position:relative!important;top:auto!important}#chLgOpen,#chSync{display:none!important}';
      document.head.appendChild(style);
      const compact = document.createElement('style');
      compact.textContent = '#chGuestBar{position:sticky;top:0;padding:7px 12px;gap:4px 12px;font-size:13px}#chGuestBar strong{font-size:13px}#chGuestBar button{padding:6px 9px}#chGuestBar~#app header,header{display:none!important}#v-seat .seatbar,#v-seat .seathint,#v-seat>#advBan,#v-seat>#atStrip,#fcBar,#rbTools{display:none!important}#dock .hintbar,#dock .rchip,#dock #minusBtn,#dock .hw-dock{display:none!important}#dock{min-height:0!important;padding:5px!important}#dock #pickCur{display:inline-flex!important}#v-seat .board{padding:3px;font-size:13px;margin:3px}#sg{gap:8px!important}';
      document.head.appendChild(compact);
      compact.textContent += '#dock>:not(#pickCur):not(#undoBtn){display:none!important}';
      window.dispatchEvent(new Event('resize'));
      try { dirty = false; fileDirty = false; } catch (_) {}
    };
    try {
      const response = await fetch('guest-art.json');
      if (response.ok) document.getElementById('ARTDATA').textContent = await response.text();
    } catch (_) { /* Built-in character artwork remains available. */ }
    document.getElementById('chLoad')?.remove();
    const script = document.createElement('script'); script.textContent = document.getElementById('APPMAIN').textContent;
    const addListener = window.addEventListener;
    window.addEventListener = function (name, fn, options) {
      if (name === 'DOMContentLoaded' || name === 'load') { setTimeout(fn, 0); return; }
      return addListener.call(this, name, fn, options);
    };
    try { document.body.appendChild(script); } finally { window.addEventListener = addListener; }
    const seat = document.getElementById('SEATMODULE');
    if (seat) { const s = document.createElement('script'); s.src = seat.dataset.src; document.body.appendChild(s); }
    window.dispatchEvent(new Event('resize'));
  };
})();
