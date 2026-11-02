/* Seat presentation boundary: reward producers always run synchronously. */
(()=>{
const label=(zh,en)=>L10N()?en:zh;
const list=()=>S.seatNotices||(S.seatNotices=[]);
function add(data,rec,room=S){
 const n={...data,id:'sn-'+crypto.randomUUID()};
 (room.seatNotices||(room.seatNotices=[])).push(n);
 if(rec){(rec.seatNoticeIds||(rec.seatNoticeIds=[])).push(n.id)}
 save();paint();return n;
}
function remove(id){S.seatNotices=list().filter(n=>n.id!==id);save();paint()}
function paint(){
 let b=document.getElementById('seatNoticeSummary');
 if(view!=='seat'){if(b)b.remove();return}
 const host=document.querySelector('#v-seat');if(!host)return;
 if(!b){b=document.createElement('button');b.id='seatNoticeSummary';b.className='nb';b.type='button';host.prepend(b);b.onclick=details}
 b.textContent='🔔 '+list().length+(L10N()?' notifications':' 個通知');
 b.setAttribute('aria-label',L10N()?'Open scoring summary':'打開計分摘要');
 b.setAttribute('aria-expanded',String(!!document.getElementById('seatNoticePanel')));
}
function details(){
 document.getElementById('seatNoticePanel')?.remove();
 const room=S,p=document.createElement('section');p.id='seatNoticePanel';p.dataset.room=room.id;p.setAttribute('aria-label',label('計分摘要','Scoring summary'));
 p.style.cssText='position:fixed;right:12px;top:70px;max-height:70vh;overflow:auto;width:min(360px,90vw);z-index:900;background:#211636;color:white;border:1px solid #8e78aa;border-radius:12px;padding:12px';
 const h=document.createElement('b');h.textContent=label('計分摘要','Scoring summary');p.append(h);
 const close=document.createElement('button');close.className='nb';close.textContent=L10N()?'Close':'關閉';close.onclick=()=>{p.remove();paint();document.getElementById('seatNoticeSummary')?.focus()};p.append(close);
 for(const n of list()){
  const row=document.createElement('div');row.style.cssText='padding:8px 0;border-top:1px solid #ffffff25';
  const text=document.createElement('p');text.textContent=n.kind==='job'?(S.students.find(s=>s.id===n.sid)?.name||'')+' · '+label('選擇職業','Choose a job'):LoUI(n.text);row.append(text);
  const b=document.createElement('button');b.className='nb';b.textContent=n.kind==='event'||n.kind==='job'?(L10N()?'Review':'處理'):(L10N()?'Dismiss':'移除');
  b.onclick=()=>{
   if(S!==room){p.remove();return}
   if(n.kind!=='event'&&n.kind!=='job'){remove(n.id);details();return}
   p.remove();
   if(n.kind==='job'){
    const st=S.students.find(s=>s.id===n.sid);if(!st||st.br){remove(n.id);return}
    jobModal(st,()=>{if(st.br){pendingJob=pendingJob.filter(id=>id!==st.id);remove(n.id)}});
    document.querySelector('#modal .box')?.addEventListener('click',e=>{if(S!==room)e.stopImmediatePropagation()},true);
   }else{
    const st=S.students.find(s=>s.id===n.sid);
    advShow({...n.event,st,el:null,seatQuestionPick:n.questionPick,seatQuestion:n.question});
    // Only a teacher's outcome consumes the descriptor. Backdrop/close preserves it.
    const box=document.querySelector('#modal .box');
    box?.addEventListener('click',e=>{
     if(S!==room){e.stopImmediatePropagation();return}
     const b=e.target.closest('button');if(!b||b.id==='evqA'||b.id==='advAns'||b.classList.contains('adv-qa'))return;
     if(!/^(evq[YN]|adv(Yes|No|Qy|Qn|Kr|Ok|Go))$/.test(b.id)&&!b.classList.contains('adv-kb'))return;
     if(!list().some(x=>x.id===n.id)){e.stopImmediatePropagation();return}
     const previous=mgTop();remove(n.id);
     box.addEventListener('click',()=>{const rec=mgTop();if(rec&&rec!==previous)rec.seatResolved=n},{once:true});
    },true);
   }
   paint();
  };row.append(b);p.append(row);
 }
 document.body.append(p);paint();close.focus();
}
const card=advCard;advCard=function(o){
 if(view!=='seat')return card.apply(this,arguments);
 const {st,el,rec,...event}=o;
 if(o.qz)event.qz={...o.qz}; // Arrays carry oral/u/msg properties; JSON arrays would discard them.
 const interactive=!!o.qz||!!o.ia||o.k==='quiet'||o.k==='circus';
 const frozen={};if(o.k==='slime'){const q=window.__seatQuizPick();frozen.questionPick=q.pick;frozen.question=q.question}
 add({kind:interactive?'event':'info',sid:st?.id,text:(o.nm?o.nm+'：':'')+(o.t||''),...(interactive?{event,...frozen}: {})},advRec);
};
const nc=nqCard;nqCard=function(o){if(view!=='seat')return nc.apply(this,arguments);add({kind:'info',text:[o.ic,o.t,o.s].filter(Boolean).join(' ')},mgTop())};
const badges=bdFlush;bdFlush=function(){if(view!=='seat')return badges.apply(this,arguments);for(const x of bdQ.splice(0)){
 const room=DB.rooms.find(r=>r.students.includes(x.st));if(!room)continue;
 const rec=[...undoStack].reverse().find(r=>r.rid===room.id&&r.bdNew?.some(b=>b.sid===x.st.id&&b.bid===x.b.id));
 add({kind:'info',text:(x.b.ic||'🏅')+' '+x.st.name+' 獲得徽章『'+x.b.n+'』',sid:x.st.id,bid:x.b.id},rec,room);
}};
const na=nqAdd;nqAdd=function(o,front){if(view!=='seat')return na.apply(this,arguments);
 if(o.k==='job'){if(!list().some(n=>n.kind==='job'&&n.sid===o.sid))add({kind:'job',sid:o.sid,text:(nqStu(o.sid)?.name||'')+' · '+(L10N()?'Choose a job':'選擇職業')},mgTop());return}
 if(o.k==='evo'){const st=nqStu(o.sid);if(st)add({kind:'info',text:st.name+' · '+stageName(st)},mgTop());return}
 if(o.k==='info'){add({kind:'info',text:label('可在設定中選擇慶祝效果','Celebration effects are available in settings')});return}
 return na.apply(this,arguments);
};
const tt=toast;toast=function(t){if(view==='seat'){add({kind:'info',text:String(t)},seatAwardDepth?mgTop():null);return}return tt.apply(this,arguments)};
const cf=confetti;confetti=function(){if(view==='seat')return;return cf.apply(this,arguments)};
const lf=lvUpFx;lvUpFx=function(el,st){if(view==='seat'){add({kind:'info',text:st.name+' · Lv.'+lvOf(st.exp).lv},mgTop());return}return lf.apply(this,arguments)};
const daily=wxDaily;wxDaily=function(){if(view!=='seat')return daily.apply(this,arguments);if(!advOn())return;const w=wxS(),key=w.day+'#'+w.dn;if(w.seen===key||wxSeenRO===key)return;if(roNow())wxSeenRO=key;else w.seen=key;add({kind:'info',text:WX[w.id].ic+' '+WX[w.id].n+' · '+WX[w.id].fx})};
const rr=render;render=function(){const panel=document.getElementById('seatNoticePanel'),keep=panel&&panel.dataset.room===S.id&&view==='seat';const r=rr.apply(this,arguments);panel?.remove();paint();if(keep)details();return r};
const rs=renderSeat;renderSeat=function(){const r=rs.apply(this,arguments);paint();return r};
const un=undo;undo=function(){const rec=mgTop(),room=rec&&DB.rooms.find(r=>r.id===rec.rid),r=un.apply(this,arguments);if(r&&room){if(rec.seatNoticeIds)room.seatNotices=(room.seatNotices||[]).filter(n=>!rec.seatNoticeIds.includes(n.id));if(rec.seatResolved)(room.seatNotices||(room.seatNotices=[])).push(rec.seatResolved);save();paint()}return r};
let language=L10N();setInterval(()=>{if(language===L10N())return;language=L10N();const open=!!document.getElementById('seatNoticePanel');paint();if(open)details()},200);
const changeLanguage=window.__i18n?.set;if(changeLanguage)window.__i18n.set=function(){if(document.getElementById('seatNoticePanel'))sessionStorage.setItem('seat-summary-language',S.id);return changeLanguage.apply(this,arguments)};
paint();
if(sessionStorage.getItem('seat-summary-language')===S.id){sessionStorage.removeItem('seat-summary-language');if(view==='seat')details()}
})();
