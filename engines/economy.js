'use strict';
function economyDay(s) {
  for (const event of s.events.filter(e => e.end <= s.day)) news(s,'typeMarket',T.marketRecovery,event.name);
  s.events = s.events.filter(e => e.end > s.day);
  const e = DB.economy;
  if (s.day >= s.nextEvent) {
    let roll = random(s) * sum(e.events.map(x=>x.weight));
    const def = e.events.find(x=>(roll -= x.weight) < 0) || e.events.at(-1);
    const pool = DB.ai.firms.filter(f => def.id === 'fire' || f.raw);
    const target = ['glut','fire'].includes(def.id) ? pool[Math.floor(random(s)*pool.length)].id : null;
    s.events.push({id:def.id, name:def.name, target, end:s.day+def.duration});
    news(s,'typeMarket',def.name,target ? firmName(target) + ' · ' + def.detail : def.detail);
    const [min,max] = e.interval;
    s.nextEvent = s.day + min + Math.floor(random(s)*(max-min+1));
  }
  s.demand = (e.base + Math.sin(s.day/e.cycleLength*Math.PI*2)*e.cycleAmplitude) * s.events.reduce((v,x) => ['boom','slump','crash'].includes(x.id) ? v*eventDef(x).factor : v,1);
  const t = DB.trade;
  s.fx = Math.round(s.fx + (t.fx-s.fx)*t.fxPull + (random(s)*2-1)*t.fxNoise*s.fx);
}
const eventDef = x => DB.economy.events.find(e=>e.id === x.id);
const outputFactor = (s,id) => s.events.filter(e=>e.target === id).reduce((v,e)=>v*eventDef(e).factor,1);
function supplyDay(s) {
  for (const d of DB.ai.firms.filter(d=>d.raw)) {
    const f = s.firms[d.id], k = d.raw, unit = DB.goods[k].base * DB.ai.extractionCost;
    const qty = Math.max(0,Math.min(Math.floor(f.cash/unit),Math.floor(f.capacity*outputFactor(s,f.id)),spaceFor(s,f,k)));
    addStock(f,k,qty,qty*unit);
    cash(s,f,-qty*unit-Math.min(DB.ai.mineDaily,Math.max(0,f.cash-qty*unit)),T.expenses);
    f.reason = 'supplyReason';
    if (k === DB.raw[0]) for (const e of s.events.filter(x=>x.id==='shortage')) {
      const bought = Math.min(f.stock[k],eventDef(e).drain);
      f.stock[k] -= bought; cash(s,f,bought*marketPrice(s,k),T.sale); s.market[k].bought += bought;
    }
    s.foreign[k] = Math.min(DB.trade.importStock,s.foreign[k]+DB.trade.importOutput);
  }
}
