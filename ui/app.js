'use strict';
const saveKey='portside.company.v'+DB.version;
function restore(){
  try {
    const s=JSON.parse(localStorage.getItem(saveKey));
    if(s?.version===DB.version && s.player?.milestones && s.market && s.firms && Array.isArray(s.cargos)) {
      s.setup??={...foundingDefaults(),sector:Catalog.startup.legacySector};restoreIndustry(s);return s;
    }
  } catch {}
  return null;
}
let S=restore(), timer=null, toastTimer=null, founding=!S, draft=foundingDefaults();
const U={page:null,site:'office',material:DB.raw[0],buyer:DB.ai.firms.find(d=>!d.raw).id,contractQty:DB.operations.batch[0],resaleQty:DB.trade.lots[0],raw:DB.raw[0],product:S?.player.catalog[0],sku:S?.player.catalog[0],tab:'raw',route:'road',qty:DB.trade.lots[0],batch:DB.operations.batch[0],exportQty:DB.trade.lots[0],firm:DB.ai.firms[0].id,speed:0};
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
function nav(id) {
  if(id==='design') stopClock();
  U.focusWindow=U.page!==id;
  U.page=id;
}
function render() {
  const focus=document.activeElement, prior=root.contains(focus)?focus.dataset:{};
  if(founding) {
    root.innerHTML=foundingScreen(draft,!!S);
    Harbor.mount(document.getElementById('found-canvas'),()=>({s:{player:{sites:[]}},id:'office'}),()=>{});
    return;
  }
  const opening=U.focusWindow;
  renderWorld();
  if(opening) return;
  const field=prior.field?'[data-field="'+prior.field+'"]':prior.tech?'[data-tech="'+prior.tech+'"]':null;
  const action=prior.act?'[data-act="'+prior.act+'"]'+(prior.id?'[data-id="'+prior.id+'"]':''):null;
  const selector=field||action;
  if(selector) root.querySelector(selector)?.focus({preventScroll:true});
}
function closeWindow() {
  const previous=U.page;
  U.page=null;render();
  const opener=root.querySelector('.world-dock [data-id="'+previous+'"]');
  (opener||document.getElementById('map-canvas')).focus({preventScroll:true});
}
function updateGuide(step) {
  S.guideStep=DB.tutorial[step]?step:null;
  U.guideMoved=true;
  save();
}
async function toggleFullscreen() {
  try {
    if(document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
    render();
  }catch{notice(T.fullUnavailable);}
}
function doGoal() {
  const index=S.player.milestones.findIndex(v=>!v);
  if(index<0) return;
  if(index===0||index===4||(index===2 && DB.sector.mode==='assembly' && !S.player.milestones[4])){
    U.site=index===0?'office':'works';Harbor.focus(U.site);nav('site');return;
  }
  if(!S.player.catalog.length && (index===1||index===2)) {nav('design');return;}
  if(index===1||index===3) U.tab=index===1?'raw':'products';
  nav(T.goalNav[index]);
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
  if(e.target.name==='designName')U.design.name=e.target.value;
  if(e.target.name==='designRatio'){
    const r=DB.development;
    U.design.margin=e.target.value===''?NaN:U.priceBasis==='costRatio'?r.percent-e.target.valueAsNumber:e.target.valueAsNumber;
    document.getElementById('design-numbers').innerHTML=designNumbers(U.design);
  }
  if(e.target.name==='companyName'){draft.name=e.target.value;e.target.setCustomValidity('');}
});
root.addEventListener('submit',e=>{
  if(e.target.id==='design-form'){
    e.preventDefault();
    try{
      if(S.over)fail('insolvent');
      const id=registerDesign(S,U.design);
      U.sku=id;U.product=id;U.design=defaultDesign();save();nav('production');render();notice(T.designSaved);
    }catch(err){notice(err.message);}
    return;
  }
  if(e.target.id!=='found-form')return;
  e.preventDefault();
  const name=draft.name.trim(),field=e.target.elements.companyName;
  if(!name){field.setCustomValidity(T.setupValidation);field.reportValidity();return;}
  if(S && !confirm(T.resetConfirm))return;
  const settings={...draft,name};
  S=newGame(Date.now()>>>0,settings);founding=false;stopClock();
  Object.assign(U,{design:null,priceBasis:'targetMargin',node:null,batch:DB.operations.batch[0],exportQty:DB.trade.lots[0],qty:DB.trade.lots[0],resaleQty:DB.trade.lots[0],contractQty:DB.operations.batch[0],route:'road',raw:DB.raw[0],product:null,sku:null,material:DB.raw[0],site:'office',tab:'raw',speed:0});
  Harbor.focus('office');nav(null);save();render();
});
root.addEventListener('change',e=>{
  if(founding){
    if(['sector','funding','climate'].includes(e.target.name)){
      draft[e.target.name]=e.target.value;
      if(e.target.name==='sector'){render();root.querySelector('input[name="sector"]:checked')?.focus({preventScroll:true});}
    }
    return;
  }
  const tech=e.target.dataset.tech;
  if(tech){
    U.design.techs=e.target.checked?[...U.design.techs,tech]:U.design.techs.filter(id=>id!==tech);
    render();return;
  }
  const key=e.target.dataset.field;if(!key)return;
  if(['family','subtype','tier','finish','priceBasis'].includes(key)){
    if(key==='priceBasis')U.priceBasis=e.target.value;
    else {
      U.design[key]=key==='subtype'?Number(e.target.value):e.target.value;
      if(key==='family')U.design.subtype=0;
    }
    render();return;
  }
  if(key==='channel'){
    if(!S.over){S.player.channel=Number(e.target.value);save();}
    render();return;
  }
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
      project:()=>startProject(S,id),acquire:()=>acquire(S,id),build:()=>improve(S,'build'),lines:()=>improve(S,'lines'),docks:()=>improve(S,'docks'),
      contract:()=>contract(S,U.product,U.buyer,U.contractQty),resell:()=>resell(S,U.raw,U.resaleQty),order:()=>purchase(S,p,U.raw,U.route,U.qty),make:()=>enqueue(S,p,U.sku,U.batch),
      export:()=>shipExport(S,p,U.product,U.exportQty),borrow:()=>bank(S,true),repay:()=>bank(S,false)
    };
    if(commands[action]){
      if(S.over)fail('insolvent');commands[action]();save();
      const msg={project:'researchStarted',contract:'contractBtn',resell:'buyback',order:'purchased',make:'queue',export:'exportBtn',borrow:'borrow',repay:'repay',acquire:id==='office'?'leased':'acquired',build:'builtNews',lines:'upgrade',docks:'upgrade'};
      notice(T[msg[action]]);
    } else switch(action){
      case 'nav':if(U.page===id){closeWindow();return;}nav(id);break;
      case 'closeWindow':closeWindow();return;
      case 'treeNode':U.node=id;break;
      case 'guideStart':if(currentGuide()) updateGuide(null);else updateGuide(0);break;
      case 'guideSkip':updateGuide(null);break;
      case 'guideBack':updateGuide(S.guideStep-1);break;
      case 'guideNext':updateGuide(S.guideStep+1);break;
      case 'guideOpen':openGuideTarget();break;
      case 'fullscreen':void toggleFullscreen();return;
      case 'siteList':nav('site');break;
      case 'clock':if(timer)stopClock();else runClock();break;
      case 'speed':U.speed=(U.speed+1)%DB.calendar.speeds.length;if(timer){stopClock();runClock();}break;
      case 'next':tick();return;
      case 'save':save(true);return;
      case 'download':void downloadGame();return;
      case 'reset':stopClock();draft=foundingDefaults();founding=true;Harbor.focus('office');break;
      case 'cancelSetup':founding=false;break;
      case 'focus':U.site='office';Harbor.focus('office');nav('site');break;
      case 'zoomIn':Harbor.zoom(1);return;
      case 'zoomOut':Harbor.zoom(-1);return;
      case 'good':U.tab=DB.raw.includes(id)?'raw':'products';U[U.tab==='raw'?'raw':'product']=id;nav('market');break;
      case 'marketTab':U.tab=id;break;
      case 'designedSku':U.sku=id;nav('production');break;
      case 'sku':U.sku=id;break;
      case 'firm':U.firm=id;nav('firms');break;
      case 'firmMap':U.site=DB.sites.find(a=>a.firm===U.firm).id;Harbor.focus(U.site);nav('site');break;
      case 'goal':doGoal();break;
    }
    render();
  }catch(err){notice(err.message);}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && !founding && U.page){e.preventDefault();closeWindow();}
});
document.addEventListener('fullscreenchange',()=>{if(!founding) render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden && timer){stopClock();save();render();}});
render();
