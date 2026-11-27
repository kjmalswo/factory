'use strict';
function pendingInput(s,f,k) {
  return sum(s.cargos.filter(c=>c.owner===f.id && c.k===k && c.route!=='export').map(c=>c.qty));
}
function logisticsDay(s) {
  const remaining = {}, departed=[];
  for (const c of s.cargos) {
    if(c.due>s.day) continue;
    const f = c.owner==='player' ? s.player : s.firms[c.owner];
    if(c.route==='export') {
      cash(s,f,c.qty*c.receivable,T.shipped+' · '+DB.goods[c.k].short);
      f.profit+=c.qty*(c.receivable-c.cost); f.volume+=c.qty; f.sold[c.k]+=c.qty;
      if(f.id==='player') f.milestones[3]=true;
      c.qty=0; continue;
    }
    const cap = facility(s,f);
    remaining[f.id] ??= cap.dock;
    if(c.route==='loading') {
      const loaded=Math.min(c.qty,remaining[f.id]);
      if(loaded) departed.push({...c,qty:loaded,route:'export',due:s.day+DB.trade.exportDays});
      remaining[f.id]-=loaded; c.qty-=loaded;
      continue;
    }
    const n = Math.max(0,Math.min(c.qty,remaining[f.id],spaceFor(s,f,c.k)));
    if(!n) continue;
    addStock(f,c.k,n,n*c.cost); remaining[f.id]-=n; c.qty-=n;
    if(f.id==='player') news(s,'typeOps',T.delivered,DB.goods[c.k].short+' × '+n);
  }
  s.cargos=s.cargos.filter(c=>c.qty>0).concat(departed);
}
function bottleneck(s) {
  const p=s.player;
  if(!p.sites.length) return 'notStarted';
  if(occupied(s,p)>=facility(s).storage) return 'spaceBlock';
  if(s.cargos.some(c=>c.owner==='player' && c.route!=='export' && c.due<=s.day)) return 'portBlock';
  if(p.jobs.length) return 'loaded';
  return p.unlocked.some(k=>possible(p,k)>0) ? 'idle' : 'inputBlock';
}
function runReorders(s) {
  const f=s.player;
  for(const [k,rule] of entries(f.reorder||{})) {
    const need=rule.target-f.stock[k]-pendingInput(s,f,k);
    if(need<=0) continue;
    const options=Object.keys(DB.trade.routes).map(r=>quote(s,k,r,1)).filter(q=>q.stock>0 && q.landed<=rule.ceiling*DB.goods[k].base);
    options.sort((a,b)=>rule.priority==='time' ? a.days-b.days||a.landed-b.landed : a.landed-b.landed||a.days-b.days);
    const q=options[0];
    if(!q) continue;
    const expected=sum(s.cargos.filter(c=>c.owner===f.id && !['loading','export'].includes(c.route)).map(c=>c.qty*unitSpace(c.k)));
    const qty=Math.min(need,q.stock,Math.floor((facility(s).storage-occupied(s,f)-expected)/unitSpace(k)),Math.floor(f.cash/q.landed));
    if(qty>0) purchase(s,f,k,q.route,qty);
  }
}
