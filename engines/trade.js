'use strict';
const supplierOf = k => DB.ai.firms.find(d=>d.raw === k);
function quote(s, k, route, qty, buyer='player') {
  const t = DB.trade, r = t.routes[route], foreign = route !== 'road';
  if (!DB.raw.includes(k) || !r || !Number.isInteger(qty) || qty < 1) fail('invalid');
  const supplier = supplierOf(k), seller = s.firms[supplier.id];
  const unit = Math.round(foreign ? DB.goods[k].base*t.importCost*s.fx/t.fx : marketPrice(s,k));
  const tariff = foreign ? Math.round(unit*t.tariff) : 0;
  const facilitySite = buyer === 'player' ? site('office') : DB.sites.find(a=>a.firm === buyer);
  const sourceSite = DB.sites.find(a=>a.firm === seller.id);
  const distance = Math.abs(sourceSite.x-facilitySite.x)+Math.abs(sourceSite.y-facilitySite.y);
  const freight = Math.round(r.freight*(foreign ? 1 : 1 + distance / DB.map.width));
  const days = r.days + (!foreign && distance > DB.map.width/DB.trade.crossDock ? 1 : 0);
  return {qty, k, route, seller:foreign ? 'foreign' : seller.id, stock:foreign ? s.foreign[k] : seller.stock[k], unit, tariff, freight, landed:unit+tariff+freight, total:qty*(unit+tariff+freight), days};
}
function purchase(s,f,k,route,qty) {
  if (f.id==='player') requireOffice(s);
  const q = quote(s,k,route,qty,f.id);
  if(qty > q.stock) fail('outOfStock');
  afford(f,q.total);
  cash(s,f,-q.total,T.purchased+' · '+DB.goods[k].short);
  if(q.seller === 'foreign') s.foreign[k] -= qty;
  else {
    const supplier = s.firms[q.seller];
    supplier.stock[k] -= qty; cash(s,supplier,qty*q.unit,T.sale);
    s.market[k].bought += qty;
  }
  s.cargos.push({owner:f.id, k, qty, cost:q.landed, from:q.seller, due:s.day+q.days, route});
  if(f.id === 'player') f.milestones[1] = true;
}
function exportQuote(s,k) {
  return Math.round(marketPrice(s,k)*DB.trade.exportPremium*s.fx/DB.trade.fx)-DB.trade.exportFee;
}
function exportLimit(s,k) {
  const group=productKeys().filter(id=>familyOf(id)===familyOf(k));
  const used=sum(makers(s).map(f=>sum(group.map(id=>f.exportUsed[id]||0))));
  return Math.max(0,Math.floor(DB.goods[k].demand*s.demand*DB.trade.exportDemand)-used);
}
function shipExport(s,f,k,qty) {
  if(f.id==='player') requireOffice(s);
  if(!productKeys().includes(k) || !Number.isInteger(qty) || qty<1) fail('invalid');
  if(qty>f.stock[k]) fail('exportEmpty');
  if(qty>exportLimit(s,k)) fail('exportLimit');
  f.stock[k]-=qty; f.exportUsed[k]+=qty;
  s.cargos.push({owner:f.id,k,qty,cost:f.basis[k],receivable:exportQuote(s,k),from:f.id,route:DB.sector.mode==='digital'?'export':'loading',due:s.day+1});
}
function buybackQuote(s,k) {
  const f=s.firms[supplierOf(k).id], unit=Math.round(marketPrice(s,k)*DB.trade.resaleDiscount);
  return {unit,limit:Math.max(0,Math.min(spaceFor(s,f,k),Math.floor(f.cash/unit)))};
}
function resell(s,k,qty) {
  requireOffice(s);
  if(!DB.raw.includes(k)||!Number.isInteger(qty)||qty<1) fail('invalid');
  const p=s.player, f=s.firms[supplierOf(k).id], q=buybackQuote(s,k);
  if(qty>p.stock[k]) fail('missing');
  if(qty>q.limit) fail('noBuyer');
  const total=q.unit*qty;
  p.stock[k]-=qty; p.profit+=qty*(q.unit-p.basis[k]);
  addStock(f,k,qty,total); cash(s,f,-total,T.rawSpend); cash(s,p,total,T.buyback+' · '+DB.goods[k].short);
}
function contractQuote(s,k,id) {
  const buyer=s.firms[id], d=profile(id);
  if(!productKeys().includes(k)||!d||d.raw) fail('invalid');
  const unit=Math.round(Math.min(marketPrice(s,k),buyer.quotes[k]||marketPrice(s,k))*DB.trade.contractDiscount);
  const group=productKeys().filter(i=>familyOf(i)===familyOf(k));
  const competitors=makers(s).filter(f=>f.id!==id && (f.product===familyOf(k) || group.some(i=>f.stock[i]>0))).length;
  const target=Math.ceil(demandFor(s,k)*d.quality*DB.trade.wholesaleCoverage/(1+competitors));
  const expected=sum(group.map(i=>buyer.stock[i]+pendingInput(s,buyer,i)))+sum(buyer.jobs.filter(j=>familyOf(j.k)===familyOf(k)).map(j=>j.qty));
  const funds=Math.floor((buyer.cash-DB.ai.reserve)/(unit+DB.trade.routes.road.freight));
  const limit=buyer.retired || DB.sector.mode==='service' ? 0 : Math.max(0,Math.min(target-expected,funds,spaceFor(s,buyer,k)));
  return {unit,limit};
}
function contract(s,k,id,qty) {
  requireOffice(s);
  const p=s.player,buyer=s.firms[id],q=contractQuote(s,k,id);
  if(!Number.isInteger(qty)||qty<1) fail('invalid');
  if(qty>p.stock[k]) fail('exportEmpty');
  if(qty>q.limit) fail('noBuyer');
  const landed=q.unit+DB.trade.routes.road.freight;
  cash(s,buyer,-landed*qty,T.contract);cash(s,p,q.unit*qty,T.contract+' · '+firmName(id));
  p.stock[k]-=qty;p.profit+=(q.unit-p.basis[k])*qty;p.milestones[3]=true;
  buyer.quotes[k]??=marketPrice(s,k);
  s.cargos.push({owner:id,k,qty,cost:landed,from:'player',route:'road',due:s.day+DB.trade.contractLead});
  news(s,'typeCompany',T.contract,firmName(id)+' · '+DB.goods[k].short+' × '+qty);
}
