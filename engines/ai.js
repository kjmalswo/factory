'use strict';
function scoreProduct(s,f,k) {
  const cfg=DB.ai, d=profile(f.id), g=DB.goods[k];
  const rivals=makers(s).filter(other=>other.id!==f.id && (other.product===k || productKeys().some(i=>familyOf(i)===k && other.stock[i]>0))).length;
  const margin=(marketPrice(s,k)-unitRecipe(s,k))/g.base;
  const coverage=f.stock[k]/Math.max(1,demandFor(s,k)/(1+rivals));
  const risk=sum(entries(g.bom).map(([i,n])=>n*marketPrice(s,i)/g.base*(1-d.risk)));
  return margin*d.quality*Math.log1p(demandFor(s,k)/(1+rivals))/Math.sqrt(g.work)-coverage*cfg.coveragePenalty-risk*cfg.riskPenalty+(k===f.product ? cfg.switchCost : 0);
}
function strategy(s,f) {
  const cfg=DB.ai, days=cfg.strategyDays, d=profile(f.id);
  if(s.day-f.lastPlan<days) return;
  f.lastPlan=s.day;
  const ranked=DB.products.map(k=>({k,score:scoreProduct(s,f,k)})).sort((a,b)=>b.score-a.score);
  const best=ranked[0].k, cost=DB.goods[best].research || cfg.launchCost;
  if(!f.unlocked.includes(best) && s.day-f.lastLaunch>=cfg.launchDays && f.cash>cfg.reserve+cost+cfg.factoryDaily*cfg.financeDays) {
    research(s,f,best); f.lastLaunch=s.day; f.reason='launchReason';
    news(s,'typeCompany',d.name+' · '+DB.goods[best].short,T.launchReason);
  }
  const pick=ranked.find(r=>f.unlocked.includes(r.k)).k;
  if(pick!==f.product) {
    f.product=pick; f.reason='switchReason';
    news(s,'typeCompany',d.name+' · '+DB.goods[pick].short,T.switchReason);
  } else if(s.day-f.lastExpansion>=cfg.expandCooldown && f.sold[pick]*DB.goods[pick].work>=f.capacity*cfg.expandLoad && f.cash>cfg.expandCost+cfg.reserve/d.risk && marketPrice(s,pick)>unitRecipe(s,pick)*(1+cfg.minMargin)) {
    cash(s,f,-cfg.expandCost,T.upgrade); f.capacity+=cfg.expandWork; f.lastExpansion=s.day; f.reason='investReason';
    news(s,'typeCompany',d.name,T.investReason);
  }
}
function operateAI(s,f) {
  const cfg=DB.ai, d=profile(f.id), k=f.product, g=DB.goods[k];
  for(const sku of f.unlocked) {
    const coverage=f.stock[sku]/Math.max(1,demandFor(s,sku));
    const floor=(f.stock[sku] ? f.basis[sku] : unitRecipe(s,sku))*(1+cfg.minMargin);
    const target=Math.max(floor,marketPrice(s,sku)*d.markup/(1+coverage*cfg.priceAdjust));
    f.quotes[sku]+=(target-f.quotes[sku])*cfg.priceAdjust;
  }
  const digital=DB.sector.mode==='digital';
  if(digital && (f.releases?.[k] || f.jobs.some(j=>j.k===k))) return;
  const lots=digital ? 1 : Math.ceil(f.capacity/g.work), safety=lots*(cfg.stockTarget-d.risk);
  let spent=false;
  for(const [i,n] of entries(g.bom)) {
    const needed=Math.ceil(safety*n-f.stock[i]-pendingInput(s,f,i));
    if(needed<=0) continue;
    const quotes=Object.keys(DB.trade.routes).map(r=>quote(s,i,r,1,f.id)).filter(q=>q.stock>0);
    // Price delayed inventory by the contribution margin lost during a stockout.
    const runway=f.stock[i]/(lots*n);
    const penalty=q=>q.landed+Math.max(0,q.days-runway)*Math.max(0,marketPrice(s,k)-unitRecipe(s,k))*(1-d.risk)/n;
    quotes.sort((a,b)=>penalty(a)-penalty(b));
    const q=quotes[0];
    if(!q) continue;
    const qty=Math.min(needed,q.stock,cfg.maxOrder,Math.floor((f.cash-cfg.reserve*(1-d.risk))/q.landed));
    if(qty>0) {purchase(s,f,i,q.route,qty);spent=true;}
  }
  const scheduled=sum(f.jobs.filter(j=>j.k===k).map(j=>j.qty));
  const target=Math.ceil(Math.min(lots*cfg.inventoryTarget,demandFor(s,k)*cfg.stockTarget)/(1+f.stock[k]/Math.max(1,demandFor(s,k))));
  const qty=Math.min(lots,possible(f,k),Math.floor((DB.operations.wipLimit-workLeft(f))/g.work),target-scheduled-f.stock[k],Math.floor(f.cash/g.conversion));
  if(qty>0) enqueue(s,f,k,digital ? 1 : qty);
  if(f.lastPlan !== s.day) f.reason=qty<=0 && f.stock[k]>=target ? 'reduceReason' : spent ? 'orderReason' : f.cash<cfg.reserve ? 'waitReason' : f.reason;
  const available=Math.min(f.stock[k],exportLimit(s,k),Math.ceil(lots*cfg.exportRatio));
  if(available>0 && f.stock[k]>lots && exportQuote(s,k)>f.basis[k] && (exportQuote(s,k)>f.quotes[k] || f.stock[k]>=target)) shipExport(s,f,k,available);
}
