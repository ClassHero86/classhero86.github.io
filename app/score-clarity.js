/*! © 2026 getClassHero — 86 Studio. Display-only award previews. */
(()=>{
  'use strict';
  const en=()=>document.documentElement.classList.contains('i18n-en');
  const t=(zh,english)=>en()?english:zh;
  const put=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text;};
  const range=values=>{const a=Math.min(...values),b=Math.max(...values);return a===b?'+'+a:'+'+a+'–'+b;};
  function amount(st,base){
    let value=Math.round(base*bonusOf(st).m);
    if(S.fade===1)value=Math.max(1,Math.round(value/2));else if(S.fade>=2)value=0;
    return value;
  }
  function label(el,base){
    // Keep the already-localised reward name; remove only this button's score suffix.
    const raw=el.textContent.replace(/\s*[+−]\d+(?:–\d+)?(?:\s*▾)?\s*$/,'').trim();
    return raw||String(base.n||'');
  }
  function refresh(){
    if(typeof S==='undefined'||!S||typeof bonusOf!=='function')return;
    const notice=document.getElementById('modal');
    // The native class-bonus notice has this unique confirmation button. Never
    // rewrite arbitrary modal text (for example teacher-authored quiz content).
    if(notice&&notice.querySelector('#partyModeOk')){
      const heading=notice.querySelector('h2'),detail=notice.querySelector('.center');
      if(heading&&/^(🎉 )?(狂歡模式已開啟|Party Mode is on|全班加倍已開啟|Class bonus is on)$/.test(heading.textContent.trim())){
        put(heading,t('🎉 全班加倍已開啟','🎉 Class bonus is on'));
        put(detail,t('全班加倍：課堂加分及所得金幣 ×2','Class bonus: classroom points and the coins earned from them ×2'));
      }
    }
    const dbl=document.getElementById('btnDbl');
    put(dbl,S.dbl?t('全班加倍：開 ×2','Class bonus: On ×2'):t('全班加倍：關','Class bonus: Off'));
    if(dbl)dbl.title=t('只控制全班加倍；每日首次獎勵是另一項規則。','Controls the class-wide bonus only. Daily first-award bonuses are separate.');
    const dock=document.getElementById('dock'),pick=document.getElementById('pickCur');
    if(!dock||!pick)return;
    const normal=(typeof view!=='undefined'&&(view==='seat'||view==='class'))&&!(typeof minusMode!=='undefined'&&minusMode);
    let note=document.getElementById('chScoreSummary');
    if(!normal){if(note)note.remove();return;}
    const rule=S.rewards&&S.rewards[typeof actR==='undefined'?0:actR];
    if(!rule)return;
    const students=Array.isArray(S.students)?S.students:[];
    function preview(button,r){
      if(!button||!r||!Number.isFinite(Number(r.e)))return;
      const name=label(button,r),score=students.length?range(students.map(st=>amount(st,Number(r.e)))):'+'+r.e;
      put(button,name+' '+score+(button.id==='pickCur'?' ▾':''));
      const title=t('基本分數 +','Base points +')+r.e+t('；顯示範圍依學生目前獎勵計算。','; the displayed range depends on each student’s current bonuses.');
      if(button.title!==title)button.title=title;
    }
    preview(pick,rule);
    dock.querySelectorAll('.rchip[data-r]').forEach(button=>preview(button,S.rewards[Number(button.dataset.r)]));
    const first=students.filter(st=>!joined(st)),rest=students.filter(st=>joined(st));
    let text=t('基本 +','Base +')+rule.e+' · '+(S.dbl?t('全班加倍 ×2','Class bonus ×2'):t('全班加倍關閉','Class bonus off'));
    if(first.length)text+=' · '+t('每日首次 ×2（'+first.length+' 人）：','Daily first ×2 ('+first.length+' students): ')+range(first.map(st=>amount(st,Number(rule.e))));
    if(rest.length)text+=' · '+t('已參與學生：','Already participated: ')+range(rest.map(st=>amount(st,Number(rule.e))));
    if(!students.length)text+=' · '+t('每日首次獎勵另計 ×2','Daily first award adds a separate ×2');
    if(S.fade)text+=' · '+t('已計入淡出設定','Includes fading settings');
    if(students.some(st=>bonusOf(st).tags.some(tag=>!['🌟首次×2','⚡×2'].includes(tag))))text+=' · '+t('已計入個人加成','Includes individual bonuses');
    if(!note){note=document.createElement('div');note.id='chScoreSummary';note.className='ch-score-summary';pick.after(note);}
    put(note,text);
    // Replace the older fixed +5→+10 example with the live preview above.
    dock.querySelectorAll('.hintbar').forEach(h=>{if(h.textContent.includes('首次')||h.textContent.includes('first award'))h.hidden=true;});
  }
  const style=document.createElement('style');style.textContent='#chScoreSummary{flex-basis:100%;font-size:13px;line-height:1.45;font-weight:600;padding:2px 8px;color:#4d351c}';document.head.appendChild(style);
  let pending=false;
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refresh();});}
  const observer=new MutationObserver(schedule);
  const app=document.getElementById('app');if(app)observer.observe(app,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',schedule);document.addEventListener('click',schedule,true);
  schedule();
})();
