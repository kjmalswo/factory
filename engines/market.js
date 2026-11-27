'use strict';
function askingPrice(s,f,k) {
  const g=DB.goods[k];
  if(f.id!=='player') return Math.round(f.quotes[k]);
  const target=g.family ? quoteDesign(s,g).price : marketPrice(s,k);
  return Math.round(target*f.quotes[k]);
}
const makers = s => [s.player,...values(s.firms).filter(f=>!profile(f.id).raw)];
function demandFor(s,k) {
  k=familyOf(k);
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
  const models=productKeys().filter(id=>familyOf(id)===k);
  const offers=[];
  for(const f of makers(s)) {
    const channel=channelFor(f);
    for(const id of models) {
      if(!f.stock[id]||!f.quotes[id]) continue;
      const ask=askingPrice(s,f,id);
      const quality=(DB.goods[id].quality??1)*(f.id==='player' ? DB.operations.qualityBase+f.lines*DB.operations.qualityStep : profile(f.id).quality);
      const weight=channel.reach*Math.exp(-cfg.priceSensitivity*(ask/g.base-1))*Math.pow(quality,cfg.qualityWeight)*(1+f.loyalty[id]);
      offers.push({f,id,ask,quantity:Math.ceil(f.stock[id]*(f.retailShare?.[id]??1)),sold:0,weight});
    }
  }
  const stock=sum(offers.map(o=>o.quantity));
  // Substitutable models share customers and their seller's daily channel allocation.
  for(let n=0;n<demand;n++) {
    const active=offers.filter(o=>o.sold<o.quantity && (o.f.channelSales||0)<channelCapacity(o.f));
    let draw=random(s)*(cfg.outsideShare+sum(active.map(o=>o.weight)));
    for(const o of active) {
      if((draw-=o.weight)<0) {o.sold++;o.f.channelSales=(o.f.channelSales||0)+1;break;}
    }
  }
  for(const o of offers) {
    const {f,id}=o, net=Math.round(o.ask*(1-channelFor(f).fee));
    f.stock[id]-=o.sold; f.volume+=o.sold; f.sold[id]+=o.sold;
    cash(s,f,net*o.sold,T.sold+' · '+DB.goods[id].short);
    f.profit+=(net-f.basis[id])*o.sold;
    if(f.id==='player' && o.sold) f.milestones[3]=true;
  }
  for(const f of makers(s)) for(const id of models) f.loyalty[id]+=(f.sold[id]/demand-f.loyalty[id])*cfg.loyaltyRate;
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
