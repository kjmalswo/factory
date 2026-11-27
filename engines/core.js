'use strict';
const Catalog = window.GAME_DB;
let DB = Catalog, T = DB.ui;
function foundingDefaults() {
  const d=Catalog.startup;
  return {name:Catalog.ui.defaultName,sector:d.defaultSector,funding:d.defaultFunding,climate:d.defaultClimate};
}
function initialCapital(sector,funding) {
  return Math.round((Catalog.startup.funding[funding].cash ?? Catalog.finance.startingCash)*(sector.capitalScale??1));
}
function configureCompany(settings) {
  const choice=Catalog.sectors[settings.sector];
  const goods=choice.goods||Catalog.goods,raw=choice.raw||Catalog.raw,products=choice.products||Catalog.products;
  const scale=choice.capitalScale??1;
  const firms=Catalog.ai.firms.map((f,i)=>{
    const item=f.raw?raw[Catalog.raw.indexOf(f.raw)]:products[Catalog.products.indexOf(f.product)];
    const identity=choice.firms?.[i];
    return {...f,[f.raw?'raw':'product']:item,...(identity?{name:identity[0],style:identity[1]}:{})};
  });
  const sites=Catalog.sites.map(a=>a.firm?{...a,name:firms.find(f=>f.id===a.firm).name}:{...a,name:choice.siteNames?.[a.id]||a.name,price:Math.round(a.price*scale),daily:Math.round(a.daily*scale)});
  const events=Catalog.economy.events.map(e=>e.id==='shortage'?{...e,...choice.shock}:e);
  const routes=Object.fromEntries(Object.entries(Catalog.trade.routes).map(([k,r],i)=>[k,{...r,name:choice.routes?.[i]||r.name,freight:Math.round(r.freight*(choice.freight??1))}]));
  T={...Catalog.ui,...choice.labels,missionHints:Catalog.ui.missionHints.map((hint,i)=>choice.labels?.missionHints?.[i]||hint)};
  DB={...Catalog,ui:T,sector:choice,company:settings.name,raw,products,goods:{...goods},sites,
    channels:choice.channels||Catalog.development.legacyChannels,
    finance:{...Catalog.finance,startingCash:initialCapital(choice,settings.funding),creditLimit:Catalog.finance.creditLimit*scale,loanUnit:Catalog.finance.loanUnit*scale,goalProfit:Catalog.finance.goalProfit*scale},
    operations:{...Catalog.operations,batch:choice.batch||Catalog.operations.batch},
    ai:{...Catalog.ai,firms,cash:Catalog.ai.cash*scale,supplierCash:Catalog.ai.supplierCash*scale,reserve:Catalog.ai.reserve*scale},
    economy:{...Catalog.economy,events},trade:{...Catalog.trade,...choice.trade,lots:choice.lots||Catalog.trade.lots,routes}};
}
const entries = Object.entries, values = Object.values;
const clamp = (v, low, high) => Math.min(high, Math.max(low, v));
const sum = xs => xs.reduce((a, b) => a + b, 0);
const blank = () => Object.fromEntries(Object.keys(DB.goods).map(k => [k, 0]));
const site = id => DB.sites.find(f => f.id === id);
const profile = id => DB.ai.firms.find(f => f.id === id);
const firmName = id => id === 'player' ? DB.company : profile(id)?.name || DB.trade.foreignName;
const familyOf = k => DB.goods[k].family || k;
const marketPrice = (s, k) => s.market[familyOf(k)].price;
const productKeys = () => Object.keys(DB.goods).filter(k=>DB.goods[k].bom);
const unitSpace = k => DB.sector.mode==='digital' && DB.goods[k].bom ? 0 : DB.goods[k].space ?? 1;
const storageUsed = f => sum(entries(f.stock).map(([k,n])=>n*unitSpace(k)));
const fail = key => { throw new Error(T[key]); };
function random(s) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function news(s, type, title, detail = '') {
  s.news.unshift({day:s.day, type, title, detail});
  s.news.length = Math.min(s.news.length, DB.finance.logLimit);
}
function cash(s, f, amount, label) {
  f.cash += amount;
  if (f.id === 'player' && amount) {
    s.ledger.unshift({day:s.day, amount, label, balance:f.cash});
    s.ledger.length = Math.min(s.ledger.length, DB.finance.logLimit);
  }
}
function addStock(f, k, qty, totalCost) {
  if (!qty) return;
  f.basis[k] = (f.basis[k] * f.stock[k] + totalCost) / (f.stock[k] + qty);
  f.stock[k] += qty;
}
function facility(s, f = s.player) {
  if (f.id !== 'player') return {work:f.capacity, dock:DB.ai.dock, storage:DB.ai.storage, daily:DB.ai.factoryDaily};
  const result = {work:f.lines * DB.operations.lineWork, dock:f.docks * DB.operations.dockGain, storage:0, daily:(f.lines + f.docks) * DB.operations.upgradeDaily};
  for (const asset of [...f.sites.map(site), ...(f.built ? [DB.build] : [])])
    for (const key of Object.keys(result)) result[key] += asset[key];
  for (const id of f.completed||[]) {
    const node=DB.development.nodes[id];
    if(node.tech) continue;
    for(const key of Object.keys(result)) result[key]+=node[key]||0;
  }
  return result;
}
function company(id, money) {
  return {id, cash:money, stock:blank(), basis:blank(), sold:blank(), loyalty:blank(), quotes:{}, retailShare:{}, unlocked:[], jobs:[], profit:0, debt:0, volume:0, exportUsed:blank()};
}
const occupied = (s,f) => storageUsed(f) + sum(s.cargos.filter(c=>c.owner===f.id && c.route==='loading').map(c=>c.qty*unitSpace(c.k)));
const spaceFor = (s,f,k) => unitSpace(k) ? Math.floor((facility(s,f).storage-occupied(s,f))/unitSpace(k)) : Infinity;
function newGame(seed = (Date.now() >>> 0), settings=foundingDefaults()) {
  configureCompany(settings);
  const p = Object.assign(company('player', DB.finance.startingCash), {sites:[], lines:0, docks:0, built:false, plans:{}, reorder:{}, unlocked:[DB.products[0]], milestones:DB.ui.missionSteps.map(() => false)});
  const s = {designs:{}, version:DB.version, setup:{...settings}, seed, day:1, player:p, firms:{}, foreign:blank(), market:{}, fx:DB.trade.fx, events:[], nextEvent:DB.economy.first, demand:1, cargos:[], ledger:[], news:[], over:false};
  for (const [k, g] of entries(DB.goods)) {
    s.market[k] = {price:g.base, history:[g.base], use:(g.supply || g.demand) * DB.market.initialRawUse, bought:0, demand:g.demand || 0};
    s.foreign[k] = DB.trade.importStock;
    if (g.bom) { p.quotes[k] = 1; p.retailShare[k] = DB.operations.retailShares[0]; }
  }
  for (const def of DB.ai.firms) {
    const f = Object.assign(company(def.id, def.raw ? DB.ai.supplierCash : DB.ai.cash), {capacity:def.capacity, product:def.product || def.raw, lastPlan:0, lastExpansion:0, lastLaunch:0, reason:'initialReason'});
    s.firms[f.id] = f;
    f.channel=DB.ai.firms.indexOf(def)%DB.channels.length;
    if (def.raw) addStock(f, def.raw, Math.ceil(def.capacity * DB.market.initialStockDays), def.capacity * DB.market.initialStockDays * DB.goods[def.raw].base * DB.ai.extractionCost);
    else {
      if(DB.sector.mode==='digital') f.releases={[def.product]:true};
      f.unlocked.push(def.product);
      f.quotes[def.product] = DB.goods[def.product].base;
      for (const k of DB.raw) addStock(f, k, DB.ai.initialInput, DB.ai.initialInput * DB.goods[k].base);
      addStock(f, def.product, DB.ai.initialProduct, DB.ai.initialProduct * unitRecipe(s,def.product));
    }
  }
  news(s, 'typeMarket', T.initialNews, T.initialDetail);
  const initial=DB.economy.events.find(e=>e.id===DB.startup.climates[settings.climate].event);
  if(initial){
    s.events.push({id:initial.id,name:initial.name,target:null,end:s.day+initial.duration});
    s.demand=initial.factor;news(s,'typeMarket',initial.name,initial.detail);
  }
  return s;
}
function requireOffice(s) { if (!s.player.sites.includes('office')) fail('requiresOffice'); }
function afford(f, cost) { if (f.cash < cost) fail('shortCash'); }
function acquire(s, id) {
  const a = site(id), p = s.player;
  if (!a || a.price == null) fail('invalid');
  if (id !== 'office') requireOffice(s);
  if (p.sites.includes(id)) fail('duplicate');
  afford(p, a.price);
  cash(s, p, -a.price, a.name); p.sites.push(id);
  p.milestones[0] = true;
  if (a.type === 'factory') p.milestones[4] = true;
  news(s,'typeOps',id === 'office' ? T.leased : T.acquired,a.name);
}
function improve(s, kind) {
  requireOffice(s);
  const p = s.player, o = DB.operations;
  if (kind === 'build') {
    if (!p.sites.includes('plot')) fail('needsLand');
    if (p.built) fail('duplicate');
    afford(p, DB.build.price); cash(s,p,-DB.build.price,T.builtNews);
    p.built = true; p.milestones[4] = true;
  } else {
    if (!['lines','docks'].includes(kind)) fail('invalid');
    if (kind === 'lines' && !p.milestones[4]) fail('capacityNeed');
    if (p[kind] >= o.maxUpgrade) fail('max');
    const cost = kind === 'lines' ? o.lineCost : o.dockCost;
    afford(p,cost); cash(s,p,-cost,T.upgrade); p[kind]++;
  }
}
function bank(s, borrow) {
  requireOffice(s);
  const p = s.player, b = DB.finance;
  const n = borrow ? Math.min(b.loanUnit,b.creditLimit-p.debt) : Math.min(b.loanUnit,p.debt);
  if (!n) fail(borrow ? 'limit' : 'noDebt');
  if (!borrow) afford(p,n);
  p.debt += borrow ? n : -n; cash(s,p,borrow ? n : -n,borrow ? T.borrow : T.repay);
}
