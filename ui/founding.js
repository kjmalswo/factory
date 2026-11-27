'use strict';
const brandIcon='<svg class="brand-icon" aria-hidden="true" viewBox="0 0 36 36" shape-rendering="crispEdges"><rect width="36" height="36" rx="7" fill="#e9b863"/><path fill="#27322d" d="M6 26V15l7 3v-6l8 5V8h4v3h2v15z"/><path fill="#e9b863" d="M9 21h3v2H9zm6 0h3v2h-3zm6 0h3v2h-3z"/></svg>';
function sectorSprite(key){
  const parts={
    chip:[['#273a36','M4 11h7v-4h17v3h4v13h-5v4H9v-3H4z'],['#d1b16c','M1 12h4v2H1zm0 5h4v2H1zm0 5h4v2H1zm30-11h4v2h-4zm0 5h4v2h-4zm0 5h4v2h-4zM10 4h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2zM10 25h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2z'],['#88ad91','M6 10h23v14H6z'],['#405e50','M8 12h19v10H8z'],['#b4c6a2','M10 14h4v2h-4zm5 0h9v2h-9zm-5 4h8v2h-8z']],
    chair:[['#493a2d','M6 7h19v12h7v5h-3v6h-3v-6H12v6H9v-6H6z'],['#ab7950','M7 6h17v12H7z'],['#d8ae76','M7 5h17v3H7zm0 4h14v4H7z'],['#8b694a','M8 16h16v3H8z'],['#e2bb86','M7 18h20v2h4v3H7z'],['#ab8057','M9 24h3v5H9zm17-1h3v6h-3z']],
    jar:[['#483e31','M11 4h15v6h2v3h2v14h-2v2H9v-2H7V13h2v-3h2z'],['#92a38d','M11 4h15v5H11z'],['#c2c3a0','M11 4h15v2H11z'],['#b2684a','M10 11h16v3h2v12H9V14h1z'],['#d48a61','M11 12h14v3H11zm-1 3h3v9h-3z'],['#e4cf9c','M9 17h19v6H9z'],['#738060','M16 18h5v1h2v2h-2v1h-5z']]
  }[key];
  return '<svg class="sector-sprite" aria-hidden="true" viewBox="0 0 36 32" shape-rendering="crispEdges">'+parts.map(([c,d])=>'<path fill="'+c+'" d="'+d+'"/>').join('')+'</svg>';
}
function foundingScreen(form,existing) {
  const t=Catalog.ui,d=Catalog.startup,sector=Catalog.sectors[form.sector];
  const selections=Object.entries(Catalog.sectors).map(([id,v])=>'<label class="sector-card '+v.color+'"><input type="radio" name="sector" value="'+id+'" '+(id===form.sector?'checked':'')+'><span class="sector-tile">'+sectorSprite(v.icon)+'</span><span>'+v.label+'</span><i></i></label>').join('');
  const capital=selectStart('funding',t.funding,options(Object.keys(d.funding),form.funding,k=>d.funding[k].name+' · '+won(d.funding[k].cash??Catalog.finance.startingCash)));
  const climate=selectStart('climate',t.climate,options(Object.keys(d.climates),form.climate,k=>d.climates[k].name));
  return '<div class="founding"><header class="found-header"><div class="brand">'+brandIcon+'<div><strong>'+Catalog.brand+'</strong><small>'+Catalog.subtitle+'</small></div></div><div class="found-region">'+icon('anchor',17)+Catalog.region+'</div></header><main class="found-main"><div class="page-title"><div><div class="eyebrow title-eyebrow"><i></i>'+t.setupEn+'</div><h1>'+t.setupTitle+'</h1><p>'+t.setupHint+'</p></div></div><div class="found-layout"><form id="found-form" class="panel found-form"><label class="name-label" for="company-name">'+t.companyName+'</label><input id="company-name" name="companyName" autocomplete="organization" maxlength="'+d.nameLength+'" required placeholder="'+esc(t.placeholder)+'" value="'+esc(form.name)+'"><fieldset><legend>'+t.sector+'</legend><div class="sector-grid">'+selections+'</div><p class="sector-desc">'+sector.description+'</p></fieldset><div class="found-finance">'+capital+climate+'</div><button type="submit" class="primary found-submit">'+t.establish+icon('arrow',18)+'</button>'+(existing?btn('cancelSetup',t.cancelSetup,'wide text-link'):'')+'</form><section class="panel found-map"><div class="found-map-top"><div class="eyebrow">'+t.mapTag+'</div><h2>'+t.previewTitle+'</h2></div><div class="found-scene"><canvas id="found-canvas" aria-label="'+t.previewTitle+'"></canvas><div class="map-stamp"><i></i>'+t.sceneCode+'</div></div><div class="found-profile">'+row(t.startingSite,Catalog.sites.find(a=>a.id==='office').name)+row(t.sectorOverview,sector.chain)+'</div></section></div></main></div>';
}
function selectStart(id,title,opts) {
  return '<label>'+title+'<select name="'+id+'">'+opts+'</select></label>';
}
