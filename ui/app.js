'use strict';
const saveKey='portside.company.v'+DB.version;
function restore(){
  try {
    const s=JSON.parse(localStorage.getItem(saveKey));
    if(s?.version===DB.version && s.player?.milestones && s.market && s.firms && Array.isArray(s.cargos)) {
      s.setup??=foundingDefaults();configureCompany(s.setup);return s;
    }
  } catch {}
  return null;
}
let S=restore(), timer=null, toastTimer=null, founding=!S, draft=foundingDefaults();
const U={page:'overview',site:'office',material:DB.raw[0],buyer:DB.ai.firms.find(d=>!d.raw).id,contractQty:DB.operations.batch[0],resaleQty:DB.trade.lots[0],raw:DB.raw[0],product:DB.products[0],sku:DB.products[0],tab:'raw',route:'road',qty:DB.trade.lots[0],batch:DB.operations.batch[0],exportQty:DB.operations.batch[0],firm:DB.ai.firms[0].id,speed:0,menu:false};
const root=document.getElementById('app');
document.title=T.title;
function notice(msg) {
  const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);
}
function save(announce=false){
  try{localStorage.setItem(saveKey,JSON.stringify(S));if(announce)notice(T.saved);}
  catch{notice(T.saveFail);}
}
function stopClock(){clearInterval(timer);timer=null;}
function tick() {
  try {day(S);if(S.over)stopClock();save();render();}
  catch(error){stopClock();notice(error.message);render();}
}
function runClock(){
  requireOffice(S);if(S.over)fail('insolvent');
  timer=setInterval(tick,DB.calendar.speeds[U.speed]);
}
const nav=(id)=>{U.page=id;U.menu=false;window.scrollTo(0,0);};
function sidebar() {
  const logo=brandIcon;
  return '<aside class="sidebar '+(U.menu?'opened':'')+'"><div class="brand">'+logo+'<div><strong>'+DB.brand+'</strong><small>'+T.kicker+'</small></div></div><nav aria-label="'+T.navigation+'">'+T.navGroups.map((group,i)=>'<div class="nav-group"><div class="nav-label">'+T.groupNames[i]+'</div>'+group.map(id=>navbtn(id,icon(id)+'<span>'+T[id]+'</span>'+(id===U.page?'<i></i>':''),id===U.page?'nav-item active':'nav-item')).join('')+'</div>').join('')+'</nav><div class="side-bottom">'+btn('save',icon('save',16)+T.save,'utility')+btn('download',icon('down',16)+T.download,'utility')+btn('reset',icon('reset',16)+T.reset,'utility')+'<div class="connection"><i></i>'+T.systemOnline+'</div></div></aside>'+(U.menu?btn('menu','','scrim','aria-label="'+T.close+'"'):'');
}
function header() {
  const date=new Date(Date.parse(DB.calendar.epoch)+(S.day-1)*DB.calendar.dayMs).toISOString().slice(0,10).replaceAll('-','.');
  return '<header class="topbar"><div class="top-place">'+ib('menu','menu',T.mobileMenu)+'<span class="port-icon">'+icon('anchor',18)+'</span><strong>'+DB.region+'</strong><span class="slash">/</span><span class="company-name" title="'+esc(S.setup.name)+'">'+esc(S.setup.name)+'</span></div><div class="time-controls"><span class="date">'+icon('calendar',15)+date+'</span><span class="day">'+T.dayTag+' '+String(S.day).padStart(3,'0')+'</span><div class="transport">'+ib('clock',timer?'pause':'play',timer?T.pause:T.play)+btn('speed',DB.calendar.speedLabels[U.speed],'speed','title="'+T.speed+'" aria-label="'+T.speed+'"')+ib('next','forward',T.next)+'</div></div></header>';
}
function stats() {
  const idx=100*sum(Object.keys(DB.goods).map(k=>marketPrice(S,k)/DB.goods[k].base))/Object.keys(DB.goods).length;
  const tiles=[['cash',T.cashShort,won(S.player.cash),'gold'],['finance',T.income,won(S.player.profit),'mint'],['market',T.marketSummary,idx.toFixed(1),'blue'],['production',T.status,T[S.over?'insolvent':bottleneck(S)],'lavender']];
  return '<div class="stats">'+tiles.map(([ic,name,val,col])=>'<div class="stat"><div class="stat-top"><span class="stat-icon '+col+'">'+icon(ic,16)+'</span><span>'+name+'</span></div><strong>'+val+'</strong></div>').join('')+'</div>';
}
function newsView(){
  return panel(T.events,S.events.length?S.events.map(e=>row(e.name,(e.target?firmName(e.target)+' · ':'')+T.eventsUntil+' '+T.dayPrefix+e.end)).join(''):empty(T.normal))+ '<section class="panel feed">'+head(T.journal,T.feedTag)+feed(DB.finance.logLimit)+'</section>';
}
function render() {
  const focus=document.activeElement, prior=focus && root.contains(focus) ? {act:focus.dataset.act,id:focus.dataset.id,field:focus.dataset.field} : null;
  Harbor.stop();
  if(founding) {
    root.innerHTML=foundingScreen(draft,!!S);
    Harbor.mount(document.getElementById('found-canvas'),()=>({s:{player:{sites:[]}},id:'office'}),()=>{});
    return;
  }
  const pages={overview,map:()=>'<div class="dashboard map-view"><div class="main-col">'+mapPanel()+'</div><aside class="right-col">'+inspector()+'</aside></div>',market:marketView,production:productionView,logistics:logisticsView,finance:financeView,firms:firmsView,news:newsView};
  root.innerHTML=sidebar()+'<div class="workarea">'+header()+'<main><div class="page-title"><div><div class="eyebrow title-eyebrow"><i></i>'+(U.page==='overview'?T.overviewEn:T.navEnglish[U.page])+'</div><h1>'+T[U.page]+'</h1></div><span class="phase"><i class="'+(timer?'running':'')+'"></i>'+(S.over?T.bankruptMsg:timer?T.live:T.pauseLabel)+'</span></div>'+(S.over?'<div class="failure">'+T.failedHelp+' '+btn('reset',T.reset,'subtle')+'</div>':'')+(U.page==='overview'?stats():'')+pages[U.page]()+'</main></div>';
  if(prior?.field) root.querySelector('[data-field="'+prior.field+'"]')?.focus({preventScroll:true});
  else if(prior?.act) root.querySelector('[data-act="'+prior.act+'"]'+(prior.id?'[data-id="'+prior.id+'"]':''))?.focus({preventScroll:true});
  const map=document.getElementById('map-canvas');
  if(map) {
    Harbor.mount(map,()=>({s:S,id:U.site}),id=>{U.site=id;render();document.getElementById('map-canvas')?.focus({preventScroll:true});});
    const a=site(U.site);
    Harbor.preview(document.getElementById('preview'),S.player.built && a.id==='plot'?{...a,type:'factory'}:a);
  }
}
function doGoal(){
  const i=S.player.milestones.findIndex(v=>!v);
  if(i<0)return;
  if(i===0||i===4){U.site=i===0?'office':'works';Harbor.focus(U.site);}
  if(i===1||i===3)U.tab=i===1?'raw':'products';
  nav(T.goalNav[i]);
}
async function downloadGame(){
  try{
    const doc=document.implementation.createHTMLDocument(T.title);
    doc.documentElement.lang=document.documentElement.lang;
    doc.head.innerHTML=document.head.innerHTML;
    const link=doc.querySelector('link[rel=stylesheet]');
    async function source(url){const r=await fetch(url);if(!r.ok)throw Error();return r.text();}
    if(link){
      const style=doc.createElement('style');style.textContent=await source(new URL(link.getAttribute('href'),document.baseURI));link.replaceWith(style);
    }
    doc.body.innerHTML='<div id="app"></div><div id="toast" role="status" aria-live="polite"></div>';
    const scripts=await Promise.all([...document.scripts].map(async el=>el.src?source(el.src):el.textContent));
    for(const code of scripts){const el=doc.createElement('script');el.textContent=code.replace(/<\/script/gi,'<\\/script');doc.body.append(el);}
    const url=URL.createObjectURL(new Blob(['<!doctype html>\n',doc.documentElement.outerHTML],{type:'text/html;charset=utf-8'})),a=document.createElement('a');
    a.href=url;a.download=T.downloadName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch{notice(T.downloadFail);}
}
root.addEventListener('input',e=>{
  if(e.target.name==='companyName'){draft.name=e.target.value;e.target.setCustomValidity('');}
});
root.addEventListener('submit',e=>{
  if(e.target.id!=='found-form')return;
  e.preventDefault();
  const name=draft.name.trim(),field=e.target.elements.companyName;
  if(!name){field.setCustomValidity(T.setupValidation);field.reportValidity();return;}
  if(S && !confirm(T.resetConfirm))return;
  const settings={...draft,name};
  S=newGame(Date.now()>>>0,settings);founding=false;stopClock();
  Object.assign(U,{raw:DB.raw[0],product:DB.products[0],sku:DB.products[0],material:DB.raw[0],site:'office',tab:'raw',speed:0});
  Harbor.focus('office');nav('overview');save();render();
});
root.addEventListener('change',e=>{
  if(founding){
    if(['sector','funding','climate'].includes(e.target.name)){
      draft[e.target.name]=e.target.value;
      if(e.target.name==='sector'){render();root.querySelector('input[name="sector"]:checked')?.focus({preventScroll:true});}
    }
    return;
  }
  const key=e.target.dataset.field;if(!key)return;
  if(key==='rate'||key==='retailShare') {
    if(S.over){render();return;}
    const policy=key==='rate'?S.player.quotes:(S.player.retailShare??={});
    policy[U.product]=Number(e.target.value);save();
  } else if(['repeat','target','ceiling','priority'].includes(key)){
    try {
      requireOffice(S);
      if(S.over)fail('insolvent');
      if(key==='repeat'){
        if(!S.player.unlocked.includes(U.sku))fail('locked');
        (S.player.plans??={})[U.sku]=Number(e.target.value);
      } else {
        const rule=(S.player.reorder??={})[U.material]??={target:0,ceiling:DB.planning.initialCeiling,priority:DB.planning.routes[0]};
        rule[key]=key==='priority'?e.target.value:Number(e.target.value);
      }
      save();
    }catch(err){notice(err.message);}
  } else if(key==='site'){U.site=e.target.value;Harbor.focus(U.site);}
  else U[key]=['route','buyer','material'].includes(key)?e.target.value:Number(e.target.value);
  render();
});
root.addEventListener('click',e=>{
  const button=e.target.closest('button[data-act]');if(!button)return;
  const action=button.dataset.act,id=button.dataset.id,p=S?.player;
  try{
    const commands={
      acquire:()=>acquire(S,id),build:()=>improve(S,'build'),lines:()=>improve(S,'lines'),docks:()=>improve(S,'docks'),
      contract:()=>contract(S,U.product,U.buyer,U.contractQty),resell:()=>resell(S,U.raw,U.resaleQty),order:()=>purchase(S,p,U.raw,U.route,U.qty),make:()=>enqueue(S,p,U.sku,U.batch),research:()=>research(S,p,U.sku),
      export:()=>shipExport(S,p,U.product,U.exportQty),borrow:()=>bank(S,true),repay:()=>bank(S,false)
    };
    if(commands[action]){
      if(S.over)fail('insolvent');commands[action]();save();
      const msg={contract:'contractBtn',resell:'buyback',order:'purchased',make:'queue',research:'ready',export:'exportBtn',borrow:'borrow',repay:'repay',acquire:id==='office'?'leased':'acquired',build:'builtNews',lines:'upgrade',docks:'upgrade'};
      notice(T[msg[action]]);
    } else switch(action){
      case 'nav':nav(id);break;
      case 'menu':U.menu=!U.menu;break;
      case 'clock':if(timer)stopClock();else runClock();break;
      case 'speed':U.speed=(U.speed+1)%DB.calendar.speeds.length;if(timer){stopClock();runClock();}break;
      case 'next':tick();return;
      case 'save':save(true);return;
      case 'download':void downloadGame();return;
      case 'reset':stopClock();draft=foundingDefaults();founding=true;U.menu=false;Harbor.focus('office');break;
      case 'cancelSetup':founding=false;break;
      case 'focus':U.site='office';Harbor.focus('office');break;
      case 'zoomIn':Harbor.zoom(1);return;
      case 'zoomOut':Harbor.zoom(-1);return;
      case 'good':U.tab=DB.raw.includes(id)?'raw':'products';U[U.tab==='raw'?'raw':'product']=id;nav('market');break;
      case 'marketTab':U.tab=id;break;
      case 'sku':U.sku=id;break;
      case 'firm':U.firm=id;nav('firms');break;
      case 'firmMap':U.site=DB.sites.find(a=>a.firm===U.firm).id;Harbor.focus(U.site);nav('map');break;
      case 'goal':doGoal();break;
    }
    render();
  }catch(err){notice(err.message);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden && timer){stopClock();save();render();}});
render();
