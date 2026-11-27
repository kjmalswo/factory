'use strict';
const paths={
 overview:'M3 3h7v7H3z M14 3h7v4h-7z M3 14h7v7H3z M14 11h7v10h-7z',
 map:'M3 5l6-2 6 3 6-3v16l-6 3-6-3-6 2z M9 3v16 M15 6v16',
 market:'M3 18V6 M3 18h18 M6 14l4-5 4 3 6-7 M16 5h4v4',
 production:'M3 20V9l6 3V8l6 3 1-8h3l2 17z M6 16h2 M11 16h2 M16 16h2',
 logistics:'M2 5h12v12H2z M14 10h4l4 4v3h-8 M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
 finance:'M3 6h16v14H3z M3 6l13-3v3 M14 11h7v5h-7z',
 firms:'M3 21V7h9v14 M12 11h8v10 M1 21h21 M6 10h2 M6 14h2 M15 14h2',
 news:'M3 4h14v15a2 2 0 0 0 4 0V8h-4 M3 4v15a2 2 0 0 0 2 2h14 M6 8h8 M6 12h8 M6 16h5',
 cash:'M3 6h18v13H3z M6 10h1 M17 15h1 M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
 goal:'M12 3a9 9 0 1 0 9 9 M12 7a5 5 0 1 0 5 5 M12 12l8-8 M17 3v4h4',
 office:'M5 21V3h13v18 M3 21h18 M8 7h2 M13 7h2 M8 11h2 M13 11h2 M10 21v-5h3v5',
 box:'M3 7l9-5 9 5v10l-9 5-9-5z M3 7l9 5 9-5 M12 12v10 M8 4l9 5',
 clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 6v6l4 2',
 pin:'M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0 M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
 focus:'M3 9V4h5 M16 4h5v5 M21 15v5h-5 M8 20H3v-5 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
 forward:'M4 6l9 6-9 6z M15 6v12',play:'M7 4l13 8-13 8z',pause:'M7 5v14 M17 5v14',arrow:'M5 12h14 M13 6l6 6-6 6',
 down:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',save:'M3 3h15l3 3v15H3z M7 3v6h10V3 M7 21v-8h10v8',
 reset:'M4 10a8 8 0 1 1 1 8 M4 4v6h6',bars:'M4 20V9 M10 20V4 M16 20v-7 M22 20V7',layers:'M2 8l10-5 10 5-10 5z M2 13l10 5 10-5 M2 18l10 5 10-5',menu:'M3 6h18 M3 12h18 M3 18h18',
 chevron:'M9 5l7 7-7 7',minus:'M5 12h14',plus:'M5 12h14 M12 5v14',check:'M3 12l6 6L21 5',calendar:'M3 6h18v15H3z M3 11h18 M7 3v5 M17 3v5',anchor:'M12 7v14 M4 14c1 8 15 8 16 0 M2 15l2-3 3 2 M17 14l3-2 2 3 M14 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0'
};
const icon=(name,size=18)=>'<svg aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="'+(paths[name]||paths.box)+'"/></svg>';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Math.round(v).toLocaleString(T.compactLocale), won=v=>T.currency+fmt(v), pcs=v=>fmt(v)+' '+T.units;
const btn=(action,label,cls='',attr='')=>'<button type="button" data-act="'+action+'" class="'+cls+'" '+attr+'>'+label+'</button>';
const navbtn=(id,label,cls='')=>btn('nav',label,cls,'data-id="'+id+'"');
const ib=(action,key,label,extra='')=>btn(action,icon(key),'icon-btn','aria-label="'+label+'" title="'+label+'" '+extra);
const tag=(txt,cl='')=>'<span class="tag '+cl+'">'+txt+'</span>';
const row=(label,value)=>'<div class="detail-row"><span>'+label+'</span><strong>'+value+'</strong></div>';
const head=(name,en,action='')=>'<div class="panel-head"><div><div class="eyebrow">'+en+'</div><h2>'+name+'</h2></div>'+action+'</div>';
const panel=(name,body)=>'<section class="panel section"><h2>'+name+'</h2>'+body+'</section>';
const empty=msg=>'<p class="empty">'+msg+'</p>';
const options=(arr,val,label=x=>x)=>arr.map(x=>'<option value="'+x+'" '+(String(val)===String(x)?'selected':'')+'>'+label(x)+'</option>').join('');
const select=(id,title,opts)=>'<label class="field">'+title+'<select data-field="'+id+'">'+opts+'</select></label>';
const qtyOptions=(arr,val)=>options(arr,val,pcs);
const tickerChange=k=>{
  const hist=S.market[familyOf(k)].history,prev=hist.at(-2)??hist[0];return (hist.at(-1)/prev-1)*100;
};
function delta(k) {
  const d=tickerChange(k);return '<span class="delta '+(d>0?'up':d<0?'down':'')+'">'+(d>0?'↗ ':d<0?'↘ ':'— ')+Math.abs(d).toFixed(1)+'%</span>';
}
function spark(k) {
  const a=S.market[familyOf(k)].history, low=Math.min(...a),range=Math.max(...a)-low;
  const points=a.length<2?'0,10 54,10':a.map((v,i)=>(i*54/(a.length-1)).toFixed(1)+','+(range?17-14*(v-low)/range:10).toFixed(1)).join(' ');
  return '<svg class="spark" aria-label="'+T.trend+'" viewBox="0 0 54 20"><polyline points="'+points+'" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
}
function itemLogo(k) {
  const pattern={
    wood:['........','...xxxx.','..x...xx','.x...x.x','xxxxx.x.','x...xx..','xxxxx...','........'],
    hardware:['..xxx...','.x...x..','xx.x.xxx','x..x...x','xx...xxx','.x...x..','..xxx...','........'],
    fabric:['........','..xxxxx.','.x...x.x','x...xx.x','x..x.xxx','.xx.x...','..xx....','........'],
    desk:['........','.xxxxxx.','xxxxxxxx','x......x','x.x..x.x','x.x..x.x','x......x','........'],
    chair:['..xxxx..','..x..x..','..xxxx..','..x..x..','.xxxxxx.','.x....x.','.x....x.','.x....x.'],
    sofa:['........','.xxxxxx.','.x.xx.x.','xx....xx','x.xxxx.x','xxxxxxxx','.x....x.','........'],
    grain:['...xx...','..x.xx..','..xx.x..','.x.xx...','..xxx...','.x.xx...','...x....','...x....'],
    pack:['..xxx...','.x...xx.','x.xxxx.x','xx...xxx','x.x...xx','x..xxx.x','.xxx.xx.','....xx..'],
    fruit:['....x...','...x.xx.','.xxxxxx.','xx....xx','xx....xx','.x....x.','..xxxx..','........'],
    snack:['.xxxxxx.','..x..x..','.xxxxxx.','.x....x.','.x.xx.x.','.x....x.','.xxxxxx.','.xxxxxx.'],
    bar:['.....xx.','....xxxx','...xx.xx','..xx.xx.','.xx.xx..','xx.xx...','xxxx....','.xx.....'],
    gift:['.xx..xx.','..xxxx..','xxxxxxxx','x..xx..x','xxxxxxxx','x..xx..x','x..xx..x','xxxxxxxx'],
    chip:['..xxxx..','.xxxxxx.','xx....xx','.x.xx.x.','xx.xx.xx','.x....x.','xxxxxxxx','..xxxx..'],
    board:['xxxxxxx.','x.x...xx','x.xx.x.x','x....x.x','x.xx...x','x.x.xx.x','x......x','xxxxxxxx'],
    case:['..xxxxx.','.x....xx','x....x.x','xxxxx..x','x...x..x','x.x.x.x.','x...xx..','xxxxx...'],
    ram:['........','.x.x.x..','xxxxxxxx','x.xx.xx.','x.xx.xxx','xxxxxxxx','.x.x.x..','........'],
    ssd:['.xxxxxx.','x......x','x.xxxx.x','x.x..x.x','x.xxxx.x','x......x','.xxxxxx.','..x.xx..'],
    pc:['.xxxxxx.','xx....xx','xx.xx.xx','xx....xx','xx.xx.xx','xx....xx','xxxxxxxx','..x..x..']
  }[k];
  if(!pattern) return '<span class="item-icon">'+(DB.raw.includes(k)?icon('box',18):sectorSprite(DB.sector.icon))+'</span>';
  let d='';pattern.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='x')d+='M'+x+' '+y+'h1v1h-1z';}));
  return '<span class="item-icon '+k+'"><svg viewBox="-1 -1 10 10" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="'+d+'"/></svg></span>';
}
function marketTable(keys,link=true) {
  return '<div class="table-wrap"><table><thead><tr>'+[T.item,T.price,T.change,T.trend].map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+keys.map(k=>'<tr><td>'+(link?btn('good',itemLogo(k)+esc(DB.goods[k].name),'item-link','data-id="'+k+'"'):esc(DB.goods[k].name))+'</td><td>'+won(marketPrice(S,k))+'</td><td>'+delta(k)+'</td><td>'+spark(k)+'</td></tr>').join('')+'</tbody></table></div>';
}
function mapPanel() {
  return '<section class="panel map-panel">'+head(T.mapTitle,T.mapTag,'<span class="map-region">'+icon('pin',14)+T.mapSub+'</span>')+
  '<div class="map-viewport"><canvas id="map-canvas" tabindex="0" aria-label="'+T.mapTitle+'"></canvas><div class="map-stamp"><i></i>'+T.sceneCode+'</div><div class="map-tools">'+ib('zoomIn','plus',T.zoomIn)+ib('zoomOut','minus',T.zoomOut)+ib('focus','focus',T.center)+'</div></div>'+
  '<div class="map-foot"><div class="legend"><span><i class="gold"></i>'+T.available+'</span><span><i class="mint"></i>'+T.owned+'</span><span><i class="blue"></i>'+T.partner+'</span></div><span class="key-hint"><kbd>'+T.keyHint+'</kbd> '+T.pan+' / '+T.drag+'</span></div></section>';
}
function inspector() {
  const a=site(U.site), p=S.player, owned=p.sites.includes(a.id),constructed=a.id==='plot' && p.built;
  const badge=a.firm?T.partner:owned?T.owned:T.available,cl=a.firm?'blue':owned?'green':'amber';
  const data=constructed ? {...a,work:DB.build.work,dock:DB.build.dock,storage:DB.build.storage,daily:a.daily+DB.build.daily} : a;
  let action='';
  if(a.firm) action=btn('firm',T.firmLink+icon('arrow',15),'wide subtle','data-id="'+a.firm+'"');
  else if(!owned) action=btn('acquire',(a.id==='office'?T.leaseBtn:T.buy)+icon('arrow',16),'wide primary','data-id="'+a.id+'"');
  else if(a.id==='plot'&&!constructed) action=btn('build',T.build+' · '+won(DB.build.price),'wide primary');
  else action=navbtn(a.type==='warehouse'||a.type==='terminal'?'logistics':'production',T.go+icon('arrow',15),'wide subtle');
  return '<section class="panel inspector">'+head(T.site,T.inspectorTag,icon('layers',19))+'<div class="preview-grid"><span class="plot-id">'+T.siteIdPrefix+String(DB.sites.indexOf(a)+1).padStart(2,'0')+'</span><canvas id="preview"></canvas>'+tag(badge,cl)+'</div><div class="inspect-body"><label class="facility-select"><select data-field="site" aria-label="'+T.pickSite+'">'+options(DB.sites.map(a=>a.id),a.id,id=>site(id).name)+'</select></label><h3 class="sr-only">'+a.name+'</h3><p class="location">'+icon('pin',13)+a.zone+'</p><p>'+T[a.type+'Desc']+'</p>'+
  (a.firm?row(T.activeProduct,DB.goods[S.firms[a.firm].product].name):row(a.id==='office'?T.lease:T.cost,won(a.price))+row(T.daily,won(data.daily))+row(T.capacity,fmt(data.work)+' '+T.workUnit)+row(T.storage,fmt(data.storage)+' '+T.warehouseUnit))+action+'</div></section>';
}
function mission() {
  const n=S.player.milestones.findIndex(x=>!x), max=T.missionSteps.length;
  return '<section class="panel mission">'+head(T.mission,T.goalTag,'<span class="counter">'+String(n<0?max:n+1).padStart(2,'0')+' / '+String(max).padStart(2,'0')+'</span>')+
    '<div class="mission-body"><div class="steps">'+S.player.milestones.map((v,i)=>'<i class="'+(v?'done':i===n?'current':'')+'"></i>').join('')+'</div><h3>'+icon('goal',18)+(n<0?T.complete:T.missionSteps[n])+'</h3><p>'+(n<0?T.finishState:T.missionHints[n])+'</p>'+(n<0?'':btn('goal',T.go+icon('arrow',14),'text-link'))+'</div></section>';
}
function feed(limit) {
  return S.news.slice(0,limit).map(n=>'<article class="news-entry"><span class="wire-dot '+n.type+'"></span><div><div class="news-meta">'+T[n.type]+' <b>·</b> '+T.dayTag+' '+String(n.day).padStart(3,'0')+'</div><strong>'+esc(n.title)+'</strong>'+(n.detail?'<p>'+esc(n.detail)+'</p>':'')+'</div></article>').join('');
}
function overview() {
  return '<div class="dashboard"><div class="main-col">'+mapPanel()+'<section class="panel">'+head(T.pulse,T.marketTag,navbtn('market',T.allMarket+icon('arrow',14),'text-link'))+marketTable([...DB.raw,DB.products[0]])+'</section></div><aside class="right-col">'+inspector()+mission()+'</aside></div><section class="panel feed">'+head(T.feed,T.feedTag,navbtn('news',T.allNews+icon('arrow',14),'text-link'))+feed(3)+'</section>';
}
function marketView() {
  const raw=U.tab==='raw',k=raw?U.raw:U.product, p=S.player;
  const tabs='<div class="tabs">'+['raw','products'].map((v,i)=>btn('marketTab',[T.rawTab,T.productTab][i],v===U.tab?'active':'','data-id="'+v+'"')).join('')+'</div>';
  const goods=(raw?DB.raw:productKeys()).map(i=>btn('good',itemLogo(i)+'<span>'+esc(DB.goods[i].name)+'</span><strong>'+won(marketPrice(S,i))+'</strong>'+delta(i),i===k?'good active':'good','data-id="'+i+'"')).join('');
  let form;
  if(raw) {
    const q=quote(S,k,U.route,U.qty);
    form=select('route',T.route,options(Object.keys(DB.trade.routes),U.route,v=>DB.trade.routes[v].name))+select('qty',T.amount,qtyOptions(DB.trade.lots,U.qty))+
      row(T.source,firmName(q.seller))+row(T.stock,pcs(q.stock))+row(T.unitPrice,won(q.unit))+row(T.freight,won(q.freight))+row(T.tariff,won(q.tariff))+row(T.landed,won(q.landed))+row(T.daysTo,q.days+' '+T.dayUnit)+row(T.total,won(q.total))+btn('order',T.order+icon('arrow',16),'primary wide');
  } else {
    const can=exportLimit(S,k);
    const ask=askingPrice(S,p,k),net=Math.round(ask*(1-channelFor(p).fee));
    form=channelForm(p)+row(T.stock,pcs(p.stock[k]))+row(T.listPrice,won(ask))+row(T.channelNet,won(net))+row(T.saleMargin,won(net-(p.stock[k]?p.basis[k]:unitRecipe(S,k))))+select('rate',T.pricePolicy,options(DB.market.priceWeights,p.quotes[k],v=>Math.round(v*DB.development.percent)+'%'));
    if(DB.sector.mode==='service') form+='<p>'+T.serviceHelp+'</p>';
    else form+=select('retailShare',T.shareTitle,options(DB.operations.retailShares,p.retailShare?.[k]??1,v=>T.shareLabels[DB.operations.retailShares.indexOf(v)]))+'<p>'+T.shareHelp+'</p><hr>'+row(T.exportPrice,won(exportQuote(S,k)))+row(T.exportLimit,pcs(can))+select('exportQty',T.amount,qtyOptions(DB.trade.lots,U.exportQty))+btn('export',T.exportBtn+icon('arrow',16),'primary wide')+'<p>'+T.exportHelp+'</p>';
  }
  const peer=contractQuote(S,U.product,U.buyer),back=buybackQuote(S,U.raw);
  const wholesale=raw?panel(T.buyback,'<p>'+T.buybackHelp+'</p>'+row(T.resaleUnit,won(back.unit))+row(T.buybackLimit,pcs(back.limit))+select('resaleQty',T.amount,qtyOptions(DB.trade.lots,U.resaleQty))+btn('resell',T.buyback,'wide subtle')):panel(T.contract,'<p>'+T.contractHelp+'</p>'+select('buyer',T.buyer,options(DB.ai.firms.filter(d=>!d.raw).map(d=>d.id),U.buyer,firmName))+row(T.contractUnit,won(peer.unit))+row(T.contractLimit,pcs(peer.limit))+select('contractQty',T.amount,qtyOptions(DB.operations.batch,U.contractQty))+btn('contract',T.contractBtn,'wide subtle'));
  return tabs+'<div class="two-col"><div>'+panel(raw?T.rawTab:T.productTab,'<p>'+ (raw?T.marketLead:T.priceHelp)+'</p><div class="goods-list">'+goods+'</div>'+row(T.holding,pcs(p.stock[k]))+row(T.unitSpace,unitSpace(k)+' '+T.warehouseUnit)+row(T.marketDemand,pcs(S.market[familyOf(k)].demand))+row(T.exchangeRate,fmt(S.fx)))+(raw||DB.sector.mode!=='service'?wholesale:'')+'</div>'+panel(esc(DB.goods[k].name),form)+'</div>';
}
function productionView() {
  const p=S.player, k=U.sku, g=DB.goods[k], cap=facility(S);
  const recipes=productKeys().map(i=>btn('sku',itemLogo(i)+'<span>'+esc(DB.goods[i].name)+'</span>'+tag(p.unlocked.includes(i)?T.ready:T.research,p.unlocked.includes(i)?'green':''),i===k?'good active':'good','data-id="'+i+'"')).join('');
  const form=(S.designs?.[k]?designSummary(S.designs[k]):'')+entries(g.bom).map(([i,n])=>row(esc(DB.goods[i].name),fmt(n)+' / '+pcs(p.stock[i]))).join('')+row(T.conversion,won(g.conversion))+row(T.unitCost,won(recipeCost(S,k)))+select('batch',T.amount,qtyOptions(DB.operations.batch,U.batch))+(p.releases?.[k]?tag(T.released,'green'):p.unlocked.includes(k)?btn('make',T.make+icon('arrow',16),'wide primary'):btn('research',T.research+' · '+won(g.research),'wide primary'));
  const repeat=select('repeat',T.dailyBatch,options([0,...DB.operations.batch],p.plans?.[k]||0,n=>n?pcs(n):T.disabled));
  return '<div class="two-col">'+panel(T.sku,navbtn('design',T.newDesign,'subtle')+'<div class="goods-list">'+recipes+'</div>'+row(T.capacity,fmt(cap.work)+' '+T.workUnit)+row(T.status,T[bottleneck(S)])+btn('lines',T.line+' · '+won(DB.operations.lineCost),'wide subtle'))+panel(esc(g.name),'<p>'+(DB.sector.mode==='digital'?T.digitalInfo:T.costHelp)+'</p>'+form)+'</div>'+(DB.sector.mode==='digital'?'':panel(T.repeatTitle,'<p>'+T.repeatHelp+'</p>'+repeat))+panel(T.queue,p.jobs.length?p.jobs.map(j=>row(esc(DB.goods[j.k].name),pcs(j.qty)+' · '+T.progress+' '+(j.qty*DB.goods[j.k].work-j.progress).toFixed(1))).join(''):empty(T.noJobs));
}
function logisticsView() {
  const p=S.player,cap=facility(S),cargo=S.cargos.filter(c=>c.owner==='player'),rule=p.reorder?.[U.material]||{};
  const orders=select('material',T.item,options(DB.raw,U.material,k=>esc(DB.goods[k].name)))+select('target',T.targetStock,options(DB.planning.targets,rule.target||0,v=>v?pcs(v):T.disabled))+select('ceiling',T.ceiling,options(DB.planning.ceilings,rule.ceiling||DB.planning.initialCeiling,v=>won(v*DB.goods[U.material].base)))+select('priority',T.route,options(DB.planning.routes,rule.priority||DB.planning.routes[0],v=>v==='cost'?T.costPriority:T.timePriority));

  return '<div class="two-col">'+panel(T.arrivalWork,'<p>'+T.logisticsHelp+'</p>'+row(T.dock,fmt(cap.dock)+' '+T.perday)+row(T.usedStorage,fmt(occupied(S,p))+' / '+fmt(cap.storage))+row(T.status,T[bottleneck(S)])+btn('docks',T.dockUpgrade+' · '+won(DB.operations.dockCost),'wide subtle'))+panel(T.stock,entries(p.stock).map(([i,n])=>row(esc(DB.goods[i].name),pcs(n))).join(''))+'</div>'+panel(T.replenish,'<p>'+T.replenishHelp+'</p>'+orders)+panel(T.shipment,'<p>'+T.spaceHelp+'</p>'+(cargo.length?cargo.map(c=>row(esc(DB.goods[c.k].short)+' · '+(c.route==='export'?T.export:c.route==='loading'?T.loading:DB.trade.routes[c.route].name),pcs(c.qty)+' · '+(c.due<=S.day?T.backlog:T.dayPrefix+c.due))).join(''):empty(T.noCargo)));
}
function financeView() {
  const p=S.player,b=DB.finance;
  return '<div class="two-col">'+panel(T.cashflow,row(T.balance,won(p.cash))+row(T.income,won(p.profit))+row(T.daily,won(facility(S).daily))+row(T.target,won(b.goalProfit))+'<p>'+T.profitHelp+'</p>')+panel(T.debt,row(T.debt,won(p.debt))+row(T.limit,won(b.creditLimit))+row(T.interest,(b.annualInterest*100).toFixed(1)+'%')+'<p>'+T.creditHelp+'</p><div class="actions">'+btn('borrow',T.borrow,'subtle')+btn('repay',T.repay,'subtle')+'</div>')+'</div>'+panel(T.ledger,S.ledger.length?'<div class="table-wrap"><table><thead><tr>'+[T.date,T.description,T.amountMoney,T.balance].map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+S.ledger.map(l=>'<tr><td>'+T.dayPrefix+l.day+'</td><td>'+esc(l.label)+'</td><td class="'+(l.amount>=0?'up':'')+'">'+won(l.amount)+'</td><td>'+won(l.balance)+'</td></tr>').join('')+'</tbody></table></div>':empty(T.noHistory));
}
function firmsView() {
  const d=profile(U.firm),f=S.firms[d.id];
  return '<div class="two-col">'+panel(T.firms,'<p>'+T.firmIntro+'</p><div class="goods-list">'+DB.ai.firms.map(x=>btn('firm',icon(x.raw?'box':'production')+'<span>'+x.name+'</span>'+tag(x.raw?T.supplier:T.rival),x.id===U.firm?'good active':'good','data-id="'+x.id+'"')).join('')+'</div>')+panel(d.name,'<p>'+d.style+'</p>'+row(T.activeProduct,DB.goods[f.product].name)+row(T.cash,won(f.cash))+row(T.capacityShort,fmt(f.capacity*outputFactor(S,f.id)))+row(T.stock,pcs(f.stock[f.product]))+(d.raw?'':row(T.sku,f.unlocked.map(k=>DB.goods[k].short).join(' · '))+row(T.volume,pcs(f.volume)))+row(T.reason,T[f.reason])+btn('firmMap',T.viewMap+icon('arrow',14),'subtle wide'))+'</div>';
}
