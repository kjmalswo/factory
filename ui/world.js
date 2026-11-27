'use strict';
const windowViews = {
  overview, site:inspector, market:marketView, production:productionView, logistics:logisticsView,
  finance:financeView, firms:firmsView, news:newsView, design:designView, development:projectView,
  system:settingsView
};
const menuTitle = id => T[id==='system'?'gameSettings':id];
function settingsView() {
  return '<div class="world-settings">'+btn('save',icon('save')+T.save,'subtle')+
    btn('download',icon('down')+T.download,'subtle')+btn('reset',icon('reset')+T.reset,'subtle')+'</div>';
}
function currentGuide() {
  return DB.tutorial[S.guideStep ?? -1];
}
function menuBar() {
  const target=currentGuide()?.target;
  return T.navGroups.map(group=>'<div class="dock-group">'+group.map(id=>{
    const guided=target===id || (target==='sales' && id==='market');
    const active=U.page===id;
    return btn('nav',icon(id,22)+'<span>'+menuTitle(id)+'</span>',
      'dock-item'+(active?' is-active':'')+(guided?' guide-target':''),
      'data-id="'+id+'" aria-pressed="'+active+'" title="'+menuTitle(id)+'"');
  }).join('')+'</div>').join('');
}
function worldShell() {
  const mapLabel=esc(T.mapTitle);
  return '<main class="world"><canvas id="map-canvas" tabindex="0" aria-label="'+mapLabel+'"></canvas>'+
    '<div class="world-shade"></div><div id="world-hud"></div><div id="window-slot"></div>'+
    '<div id="site-tooltip" class="site-tooltip" hidden></div><div id="guide-slot"></div>'+
    '<aside class="world-map-controls">'+ib('siteList','layers',T.siteMenu)+ib('zoomIn','plus',T.zoomIn)+ib('zoomOut','minus',T.zoomOut)+ib('focus','focus',T.center)+'</aside>'+
    '<footer class="world-footer"><div class="map-key"><kbd>'+T.keyHint+'</kbd> '+T.pan+' · '+T.drag+'</div><nav class="world-dock" aria-label="'+T.navigation+'"></nav></footer></main>';
}
function worldHud() {
  const date=new Date(Date.parse(DB.calendar.epoch)+(S.day-1)*DB.calendar.dayMs).toISOString().slice(0,10).replaceAll('-','.');
  const guide=currentGuide()?.target;
  return '<header class="world-hud"><div class="world-brand">'+brandIcon+'<div><strong>'+esc(S.setup.name)+'</strong><span>'+DB.region+' · '+DB.sector.name+'</span></div></div>'+
    '<div class="world-metrics"><div>'+icon('cash',18)+'<div><span>'+T.cashShort+'</span><strong>'+won(S.player.cash)+'</strong></div></div>'+
    '<div>'+icon('bars',18)+'<div><span>'+T.income+'</span><strong class="'+(S.player.profit<0?'down':'up')+'">'+won(S.player.profit)+'</strong></div></div>'+
    '<div>'+icon('production',18)+'<div><span>'+T.status+'</span><strong>'+T[S.over?'insolvent':bottleneck(S)]+'</strong></div></div></div>'+
    '<div class="world-controls"><div class="world-clock '+(guide==='clock'?'guide-target':'')+'"><div class="world-date"><strong>'+T.dayTag+' '+String(S.day).padStart(3,'0')+'</strong><span>'+date+'</span></div>'+
    ib('clock',timer?'pause':'play',(timer?T.pause:T.play)+' · '+T.spaceHint,'aria-keyshortcuts="Space"')+btn('speed',DB.calendar.speedLabels[U.speed],'speed','title="'+T.speed+'" aria-label="'+T.speed+'"')+ib('next','forward',T.next)+'</div>'+
    '<div class="world-tools">'+ib('guideStart','help',T.tutorial)+ib('fullscreen','screen',document.fullscreenElement?T.exitFullscreen:T.fullscreen)+
    btn('nav',icon('settings',16),'icon-btn '+(guide==='system'?'guide-target':''),'data-id="system" aria-label="'+T.gameSettings+'" title="'+T.gameSettings+'"')+'</div></div></header>'+
    (!timer?'<div class="world-paused">'+icon('pause',14)+T.paused+'</div>':'')+
    (S.over?'<div class="failure world-failure">'+T.failedHelp+' '+btn('reset',T.reset,'subtle')+'</div>':'');
}
function guideCard() {
  const step=currentGuide();
  if(!step) return '';
  const n=S.guideStep,last=n===DB.tutorial.length-1;
  let nearby='';
  if(step.target==='market' && S.player.catalog.length){
    const good=DB.goods[U.sku||S.player.catalog[0]];
    nearby='<div class="guide-note">'+T.guideMaterials+' · '+entries(good.bom).map(([k,qty])=>DB.goods[k].short+' '+fmt(qty*DB.operations.batch[0])).join(' / ')+'</div>';
  }
  if(step.target==='production' && DB.sector.mode==='assembly' && !S.player.milestones[4]){
    nearby='<div class="guide-note">'+T.guideFacility+' · '+site('works').name+'</div>';
  }
  const open=!['map','clock'].includes(step.target);
  return '<aside class="guide-box" aria-label="'+T.tutorial+'"><div class="guide-head"><span>'+icon('help',15)+T.tutorial+'</span>'+
    '<span aria-label="'+T.guideProgress+'">'+(n+1)+' / '+DB.tutorial.length+'</span></div>'+
    '<div role="status"><h2>'+step.title+'</h2><p>'+step.body+'</p>'+nearby+'</div>'+
    '<div class="guide-actions">'+btn('guideSkip',T.guideClose,'text-link')+
    (n>0?btn('guideBack',T.guideBack,'subtle'):'')+
    (open?btn('guideOpen',T.guideOpen,'subtle'):'')+
    btn('guideNext',(last?T.guideDone:T.guideNext)+icon('arrow',14),'primary')+'</div></aside>';
}
function showSiteTooltip(id,point) {
  const tip=document.getElementById('site-tooltip');
  if(!tip) return;
  tip.hidden=!id;
  if(!id) {delete tip.dataset.site;return;}
  const a=site(id),owned=S.player.sites.includes(id);
  if(tip.dataset.site!==id){
    tip.innerHTML='<strong>'+esc(a.name)+'</strong><span>'+T[a.type]+' · '+(a.firm?T.partner:owned?T.owned:T.available)+'</span>';
    tip.dataset.site=id;
  }
  tip.style.left=clamp(point.x+12,8,Math.max(8,innerWidth-tip.offsetWidth-8))+'px';
  tip.style.top=clamp(point.y-tip.offsetHeight-12,8,Math.max(8,innerHeight-tip.offsetHeight-8))+'px';
}
let windowDrag=null;
function placeWindow(dialog,position) {
  const world=dialog.closest('.world'), margin=8;
  const width=world.clientWidth,height=world.clientHeight;
  const left=clamp(position.x,margin,Math.max(margin,width-dialog.offsetWidth-margin));
  const top=clamp(position.y,margin,Math.max(margin,height-dialog.offsetHeight-margin));
  Object.assign(dialog.style,{left:left+'px',top:top+'px',right:'auto',bottom:'auto',height:dialog.offsetHeight+'px'});
  return {x:left,y:top};
}
function bindWindowDrag(dialog) {
  const title=dialog.querySelector('.window-title');
  const positions=U.windowPositions??={};
  const page=dialog.dataset.page;
  if(positions[page]) placeWindow(dialog,positions[page]);
  title.addEventListener('pointerdown',event=>{
    if(!event.isPrimary || event.button!==0 || event.target.closest('button')) return;
    const rect=dialog.getBoundingClientRect();
    windowDrag={id:event.pointerId,dx:event.clientX-rect.left,dy:event.clientY-rect.top};
    title.setPointerCapture(event.pointerId);
    title.classList.add('is-dragging');
    event.preventDefault();
  });
  title.addEventListener('pointermove',event=>{
    if(windowDrag?.id!==event.pointerId) return;
    const position={x:event.clientX-windowDrag.dx,y:event.clientY-windowDrag.dy};
    positions[page]=placeWindow(dialog,position);
  });
  function finishDrag(event) {
    if(windowDrag?.id!==event.pointerId) return;
    windowDrag=null;
    title.classList.remove('is-dragging');
    render();
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture']) title.addEventListener(type,finishDrag);
}
function renderWorld() {
  let map=document.getElementById('map-canvas');
  if(!map) {
    root.innerHTML=worldShell();
    map=document.getElementById('map-canvas');
    Harbor.mount(map,()=>({s:S,id:U.page==='site'?U.site:null,hint:guideSite()}),id=>{
      U.site=id;nav('site');showSiteTooltip(null);render();
    },showSiteTooltip);
  }
  const dock=root.querySelector('.world-dock'), offset=dock.scrollLeft;
  dock.innerHTML=menuBar();dock.scrollLeft=offset;
  if(U.guideMoved){
    const target=dock.querySelector('.guide-target');
    if(target) target.scrollIntoView({block:'nearest',inline:'nearest'});
    U.guideMoved=false;
  }
  document.getElementById('world-hud').innerHTML=worldHud();
  document.getElementById('guide-slot').innerHTML=guideCard();
  const world=root.querySelector('.world'),guide=root.querySelector('.guide-box');
  world.classList.toggle('with-guide',!!guide);
  world.classList.toggle('is-paused',!timer);
  if(guide) world.style.setProperty('--guide-height',guide.offsetHeight+'px');
  if(windowDrag) return;
  const slot=document.getElementById('window-slot'), prior=slot.querySelector('.world-window');
  const sameWindow=prior?.dataset.page===U.page;
  const scroll=sameWindow?prior.querySelector('.window-body').scrollTop:0;
  const treeScroll=new Map(sameWindow?[...prior.querySelectorAll('[data-tree]')].map(tree=>[tree.dataset.tree,tree.scrollLeft]):[]);
  const renderView=windowViews[U.page];
  slot.innerHTML=renderView?'<section role="dialog" aria-labelledby="window-title" tabindex="-1" data-page="'+U.page+'" class="world-window world-window--'+U.page+'"><header class="window-title" title="'+T.dragWindow+'"><div>'+icon(U.page==='site'?'office':U.page==='system'?'settings':U.page,19)+'<h2 id="window-title">'+menuTitle(U.page)+'</h2></div>'+ib('closeWindow','close',T.close)+'</header><div class="window-body">'+renderView()+'</div></section>':'';
  const dialog=slot.querySelector('.world-window');
  if(dialog){
    bindWindowDrag(dialog);
    dialog.querySelector('.window-body').scrollTop=scroll;
    for(const tree of dialog.querySelectorAll('[data-tree]')) tree.scrollLeft=treeScroll.get(tree.dataset.tree)||0;
  }
  const preview=document.getElementById('preview');
  if(preview) {
    const a=site(U.site);
    Harbor.preview(preview,S.player.built && a.id==='plot'?{...a,type:'factory'}:a);
  }
  if(U.focusWindow) {
    slot.firstElementChild?.focus({preventScroll:true});
    U.focusWindow=false;
  }
}
function guideSite() {
  const step=currentGuide()?.target;
  if(step==='site') return 'office';
  if(step==='production' && DB.sector.mode==='assembly' && !S.player.milestones[4]) return 'works';
  return null;
}
function openGuideTarget() {
  const step=currentGuide()?.target;
  if(step==='sales') {U.tab='products';nav('market');return;}
  if(step==='market') U.tab='raw';
  if(step==='site') {U.site='office';Harbor.focus(U.site);}
  if(step==='production' && guideSite()==='works') {
    U.site='works';Harbor.focus(U.site);nav('site');return;
  }
  if(windowViews[step]) nav(step);
}
function newsView(){
  return panel(T.events,S.events.length?S.events.map(e=>row(e.name,(e.target?firmName(e.target)+' · ':'')+T.eventsUntil+' '+T.dayPrefix+e.end)).join(''):empty(T.normal))+ '<section class="panel feed">'+head(T.journal,T.feedTag)+feed(DB.finance.logLimit)+'</section>';
}
