'use strict';
function askingPrice(s,f,k) {
  return Math.round(f.id === 'player' ? marketPrice(s,k)*f.quotes[k] : f.quotes[k]);
}
const makers = s => [s.player,...values(s.firms).filter(f=>!profile(f.id).raw)];
function demandFor(s,k) {
  const chipShock = k === DB.products[0] ? s.events.filter(e=>e.id==='shortage').reduce((v,e)=>v*eventDef(e).factor,1) : 1;
  return Math.max(1,Math.round(DB.goods[k].demand*s.demand*chipShock));
}
function updatePrice(s,k,target) {
  const m=s.market[k], g=DB.goods[k], rule=DB.market;
  target=clamp(target,g.base*rule.minPrice,g.base*rule.maxPrice);
  m.price=Math.round(m.price+(target-m.price)*rule.smooth);
  m.history.push(m.price);
  if(m.history.length>rule.trendPoints) m.history.shift();
}
function clearRetail(s,k) {
  const g=DB.goods[k], cfg=DB.market, demand=demandFor(s,k);
  const offers=makers(s).filter(f=>f.stock[k]>0 && f.quotes[k]).map(f=>{
    const ask=askingPrice(s,f,k), quality=f.id==='player' ? DB.operations.qualityBase+f.lines*DB.operations.qualityStep : profile(f.id).quality;
    return {f,ask,quantity:Math.ceil(f.stock[k]*(f.retailShare?.[k] ?? 1)),sold:0,weight:Math.exp(-cfg.priceSensitivity*(ask/g.base-1))*Math.pow(quality,cfg.qualityWeight)*(1+f.loyalty[k])};
  });
  const stock=sum(offers.map(o=>o.quantity));
  // Each buyer can defer purchase. A sold-out firm leaves the choice set.
  for(let n=0;n<demand;n++) {
    let draw=random(s)*(cfg.outsideShare+sum(offers.filter(o=>o.sold<o.quantity).map(o=>o.weight)));
    for(const o of offers) {
      if(o.sold===o.quantity) continue;
      if((draw-=o.weight)<0) {o.sold++;break;}
    }
  }
  for(const o of offers) {
    const f=o.f;
    f.stock[k]-=o.sold; f.volume+=o.sold; f.sold[k]+=o.sold;
    cash(s,f,o.ask*o.sold,T.sold+' · '+g.short);
    f.profit+=(o.ask-f.basis[k])*o.sold;
    if(f.id==='player' && o.sold) f.milestones[3]=true;
  }
  for(const f of makers(s)) f.loyalty[k]+=(f.sold[k]/demand-f.loyalty[k])*cfg.loyaltyRate;
  const pressure=clamp((demand-stock)/demand,-1,1);
  const costRatio=recipeCost(s,k)/(g.conversion+sum(entries(g.bom).map(([i,n])=>DB.goods[i].base*n)));
  updatePrice(s,k,g.base*costRatio*Math.pow(s.demand,1/g.elasticity)*(1+pressure*cfg.retailPressure));
  s.market[k].demand=demand;
}
function marketDay(s) {
  for(const k of DB.raw) {
    const m=s.market[k], g=DB.goods[k], cfg=DB.market;
    const onHand=s.firms[supplierOf(k).id].stock[k];
    m.use+=(m.bought-m.use)*cfg.rawDemandMemory;
    const ratio=(m.use*cfg.stockDays+g.supply)/(onHand+g.supply);
    updatePrice(s,k,g.base*Math.pow(Math.max(cfg.minRatio,ratio),cfg.scarcity));
    m.demand=m.bought; m.bought=0;
  }
  DB.products.forEach(k=>clearRetail(s,k));
}
