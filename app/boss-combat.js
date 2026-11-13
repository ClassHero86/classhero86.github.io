/* Cosmetic combat choreography. Damage/rewards remain owned by hit(). */
(() => {
  function install() {
  'use strict';
  if (window.__bossCombatInstalled || typeof hit !== 'function') return;
  window.__bossCombatInstalled = true;
  const actors = new Set();
  let context = null, group = null;
  const style = document.createElement('style');
  style.textContent = '.ch-combat-actor{position:fixed;pointer-events:none;z-index:1100;width:112px;text-align:center;filter:drop-shadow(0 8px 5px #30211b66)}.ch-combat-actor .ch-combat-sprite{height:112px;display:flex;align-items:center;justify-content:center}.ch-combat-actor img{max-width:112px;max-height:112px;object-fit:contain}.ch-combat-name{display:inline-block;background:#fff8db;color:#382916;border:2px solid #735029;border-radius:12px;padding:2px 9px;font-weight:bold;font-size:13px;white-space:nowrap}';
  document.head.appendChild(style);
  const enabled = () => typeof bfxOn !== 'function' || bfxOn();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const oldDmg = typeof bfxDmg === 'function' ? bfxDmg : null;
  if (oldDmg) bfxDmg = function (be, info) {
    if (context && enabled() && !reduced()) { context.effect = info; return; }
    return oldDmg.apply(this, arguments);
  };
  function present(job) {
    const be = document.getElementById('be');
    if (!be || S.boss !== job.boss || !enabled()) return;
    while (actors.size >= 3) actors.values().next().value.finish(true);
    const r = be.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'ch-combat-actor';
    const sprite = document.createElement('div');
    sprite.className = 'ch-combat-sprite';
    const label = document.createElement('span');
    label.className = 'ch-combat-name';
    label.textContent = job.student.name || '';
    el.append(sprite, label);
    // Render the same avatar as the roster, never a screenshot of its card.
    drawChar(sprite, job.student, 7);
    const start = Math.max(8, r.left - 132), top = Math.max(8, r.top + r.height * .42 - 56);
    const dx = Math.max(0, r.left + r.width * .38 - 75 - start);
    el.style.left = start + 'px'; el.style.top = top + 'px';
    document.body.appendChild(el);
    let impacted = false, timer, cleanup, movement;
    const valid = () => S.boss === job.boss && document.getElementById('be');
    const impact = () => {
      if (impacted) return; impacted = true;
      const target = valid();
      if (!target) return;
      if (job.effect && oldDmg) oldDmg(target, job.effect);
      if (!reduced()) target.animate([{transform:'translateX(0)'},{transform:'translateX(9px) rotate(3deg)'},{transform:'translateX(-4px)'},{transform:'translateX(0)'}], {duration:240});
    };
    const entry = { finish(flush) { if (flush) impact(); clearTimeout(timer); clearTimeout(cleanup); if(movement) movement.cancel(); el.remove(); actors.delete(entry); } };
    actors.add(entry);
    if (reduced()) { impact(); cleanup = setTimeout(() => entry.finish(false), 380); return; }
    movement = el.animate([
      {transform:'translate(0,0) rotate(-7deg)',opacity:0,offset:0},
      {transform:'translate(0,-8px) rotate(-7deg)',opacity:1,offset:.08},
      {transform:`translate(${dx}px,-12px) rotate(13deg)`,opacity:1,offset:.24},
      {transform:`translate(${dx-12}px,-3px) rotate(-8deg)`,opacity:1,offset:.4},
      {transform:'translate(0,0) rotate(0)',opacity:1,offset:.8},
      {transform:'translate(0,0)',opacity:0,offset:1}
    ], {duration:750,easing:'linear',fill:'forwards'});
    timer = setTimeout(impact, 180);
    cleanup = setTimeout(() => entry.finish(false), 760);
  }
  const oldHit = hit;
  hit = function (student, card, silent) {
    const boss = S.boss;
    if (!boss || !student || !enabled()) return oldHit.apply(this, arguments);
    const before = Number((boss.c || {})[student.id]) || 0;
    const job = { boss, student, effect:null }, previous = context;
    context = job;
    let result;
    try { result = oldHit.apply(this, arguments); }
    finally { context = previous; }
    if ((Number((boss.c || {})[student.id]) || 0) <= before) return result;
    if (silent) {
      // All-class attacks still apply to every student, with one visual representative.
      if (!group || group.boss !== boss) {
        group = job;
        setTimeout(() => { const next = group; group = null; if(next) present(next); }, 0);
      }
    } else present(job);
    return result;
  };
  const clear = () => { group = null; for(const entry of [...actors]) entry.finish(false); };
  if (typeof setView === 'function') {
    const oldView = setView;
    setView = function(name) { if(name !== 'boss') clear(); return oldView.apply(this, arguments); };
  }
  document.addEventListener('visibilitychange', () => { if(document.hidden) clear(); });
  }
  if (typeof hit === 'function') install();
  else {
    // SaaS executes APPMAIN only after login; observe its script insertion.
    const ready = new MutationObserver(() => {
      if (typeof hit === 'function') { ready.disconnect(); install(); }
    });
    ready.observe(document.body, {childList:true});
  }
})();
