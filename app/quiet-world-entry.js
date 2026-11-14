/* Quiet World first-use presentation; the original microphone and world engine remain unchanged. */
(()=>{
  'use strict';
  const byId=id=>document.getElementById('qw-'+id);
  const overlay=byId('overlay'),panel=byId('panel'),controls=byId('controls'),toggle=byId('toggle');
  if(!overlay||!panel||!controls||!toggle||panel.dataset.simpleEntry)return;
  panel.dataset.simpleEntry='1';
  const intro=document.createElement('p');intro.id='qw-entry-steps';
  const expectation=document.createElement('p');expectation.id='qw-entry-expectation';
  const action=document.createElement('div');action.id='qw-entry-action';
  const timing=document.createElement('p');timing.id='qw-entry-timing';
  const unlock=document.createElement('p');unlock.id='qw-entry-unlocks';
  panel.insertBefore(intro,byId('mic-state'));
  panel.insertBefore(expectation,byId('mic-state'));
  panel.insertBefore(action,controls);
  action.append(byId('start'),byId('privacy'));
  controls.prepend(byId('live'),byId('habitat'),unlock,timing);
  const style=document.createElement('style');
  style.textContent=`
    #qw-panel[data-simple-entry]{width:min(560px,calc(100% - 32px))}
    #qw-panel[data-simple-entry].is-collapsed{position:relative;left:auto;bottom:auto;width:min(560px,calc(100% - 32px));margin:16px;padding:16px;display:block;overflow-y:auto;border-radius:18px}
    #qw-panel[data-simple-entry].is-collapsed #qw-bar{display:flex;flex-wrap:wrap;gap:6px}
    #qw-panel[data-simple-entry].is-collapsed #qw-bar h2{display:block;font-size:1.2em}
    #qw-panel[data-simple-entry].is-collapsed #qw-status{display:block;font-size:13px;min-height:0}
    #qw-panel[data-simple-entry].is-collapsed #qw-mic-state{font-size:13px;white-space:normal;margin:6px 0}
    #qw-entry-steps{font-weight:700;color:#ffe5a0}
    #qw-entry-action #qw-start{font-size:17px;min-height:48px;margin-left:0}
    #qw-entry-action #qw-privacy{font-size:12px;color:#c8d8df}
    #qw-entry-unlocks,#qw-entry-timing,#qw-entry-expectation{font-size:12px;color:#c8d8df}
    #qw-panel[data-simple-entry] #qw-controls{border-top:1px solid #536274;margin-top:12px;padding-top:8px}
    @media(max-width:480px){#qw-panel[data-simple-entry],#qw-panel[data-simple-entry].is-collapsed{width:calc(100% - 16px);margin:8px;padding:12px}#qw-entry-steps{font-size:14px}}
  `;
  document.head.appendChild(style);
  function labels(){
    let english=false;try{english=!!window.__i18n?.on()}catch{}
    intro.textContent=english?'1. Start the microphone → 2. Read quietly → 3. Welcome new friends':'① 開啟麥克風 → ② 安靜閱讀 → ③ 迎接秘境朋友';
    const firstSeconds=byId('pace').value==='reading'?15:5;
    expectation.textContent=english?`After calibration, stay quiet for about ${firstSeconds} seconds to start welcoming your first friend. More species unlock as quiet time grows.`:`開咪校準後，保持安靜約 ${firstSeconds} 秒開始迎接首位朋友；新物種會隨安靜時間逐步解鎖。`;
    timing.textContent=english?'After microphone calibration: short activity welcomes the first visitor in about 5 quiet seconds, then tries every 5–9 seconds. Reading starts after 15 seconds, then tries every 15–24 seconds. Arrivals need an available resident and space.':'麥克風校準後：短活動保持安靜約 5 秒迎接首位朋友，之後每 5–9 秒嘗試到訪；閱讀首位約 15 秒，之後每 15–24 秒。到訪需有可用居民和空位。';
    unlock.textContent=english?'The countdown above is for unlocking a new species, not the time until every arrival.':'上方倒數是解鎖新物種的時間，不是每次到訪的等待時間。';
  }
  function opened(){
    if(overlay.hidden)return;
    labels();
    // Use the original control so its internal state, ARIA and keyboard behavior agree.
    if(toggle.getAttribute('aria-expanded')==='true')toggle.click();
  }
  new MutationObserver(opened).observe(overlay,{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  byId('pace').addEventListener('change',labels);
  labels();
  if(!overlay.hidden)opened();
})();
