'use strict';
const brandIcon='<svg class="brand-icon" aria-hidden="true" viewBox="0 0 36 36" shape-rendering="crispEdges"><rect width="36" height="36" rx="7" fill="#e9b863"/><path fill="#27322d" d="M6 26V15l7 3v-6l8 5V8h4v3h2v15z"/><path fill="#e9b863" d="M9 21h3v2H9zm6 0h3v2h-3zm6 0h3v2h-3z"/></svg>';
function sectorSprite(key){
  const parts={
    car:[['#384844','M2 16h5l5-7h12l5 7h5v8H2z'],['#d1ae70','M3 16h6l5-6h9l5 6h4v5H3z'],['#719492','M12 15l3-4h7l3 4z'],['#212b28','M6 20h6v6H6zm18 0h6v6h-6z']],
    device:[['#314951','M9 2h17v28H9z'],['#92b0a9','M11 4h13v20H11z'],['#567a85','M12 16l5-7 6 7v6H12z'],['#d6d0a4','M16 26h4v2h-4z']],
    dining:[['#dbbd8f','M3 14h29v5H3zm3 5h23v4H6zm5 4h13v3H11z'],['#bd7051','M5 14h24v3H5z'],['#a8bf98','M9 9h3v5H9zm6-2h3v7h-3zm7 2h3v5h-3z']],
    shirt:[['#698c95','M3 10l8-6h14l8 6-4 6-5-3v15H11V13l-5 3z'],['#a4b9af','M11 5h4l3 4 3-4h4l-5 8h-4z'],['#486a74','M12 24h12v3H12z']],
    audio:[['#ac8f67','M7 3h21v26H7z'],['#37484a','M9 5h17v22H9z'],['#a7b5aa','M15 7h6v5h-6zm-2 9h10v8H13z'],['#5d7778','M15 18h6v4h-6z']],
    pad:[['#9dae9f','M6 9h23l4 6v11h-6l-5-6h-9l-5 6H2V15z'],['#50685e','M9 11h3v3h3v3h-3v3H9v-3H6v-3h3z'],['#be785b','M24 13h3v3h-3z'],['#c2a15d','M28 16h3v3h-3z']],
    chip:[['#273a36','M4 11h7v-4h17v3h4v13h-5v4H9v-3H4z'],['#d1b16c','M1 12h4v2H1zm0 5h4v2H1zm0 5h4v2H1zm30-11h4v2h-4zm0 5h4v2h-4zm0 5h4v2h-4zM10 4h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2zM10 25h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2zm5 0h2v4h-2z'],['#88ad91','M6 10h23v14H6z'],['#405e50','M8 12h19v10H8z'],['#b4c6a2','M10 14h4v2h-4zm5 0h9v2h-9zm-5 4h8v2h-8z']],
    chair:[['#493a2d','M6 7h19v12h7v5h-3v6h-3v-6H12v6H9v-6H6z'],['#ab7950','M7 6h17v12H7z'],['#d8ae76','M7 5h17v3H7zm0 4h14v4H7z'],['#8b694a','M8 16h16v3H8z'],['#e2bb86','M7 18h20v2h4v3H7z'],['#ab8057','M9 24h3v5H9zm17-1h3v6h-3z']],
    jar:[['#483e31','M11 4h15v6h2v3h2v14h-2v2H9v-2H7V13h2v-3h2z'],['#92a38d','M11 4h15v5H11z'],['#c2c3a0','M11 4h15v2H11z'],['#b2684a','M10 11h16v3h2v12H9V14h1z'],['#d48a61','M11 12h14v3H11zm-1 3h3v9h-3z'],['#e4cf9c','M9 17h19v6H9z'],['#738060','M16 18h5v1h2v2h-2v1h-5z']]
  }[key];
  return '<svg class="sector-sprite" aria-hidden="true" viewBox="0 0 36 32" shape-rendering="crispEdges">'+parts.map(([c,d])=>'<path fill="'+c+'" d="'+d+'"/>').join('')+'</svg>';
}
function foundingScreen(form,existing) {
  const t=Catalog.ui,d=Catalog.startup,sector=Catalog.sectors[form.sector];
  const selections=d.selectable.map(id=>[id,Catalog.sectors[id]]).map(([id,v])=>'<label class="sector-card '+v.color+'"><input type="radio" name="sector" value="'+id+'" '+(id===form.sector?'checked':'')+'><span class="sector-tile">'+sectorSprite(v.icon)+'</span><span>'+v.label+'</span><i></i></label>').join('');
  const capital=selectStart('funding',t.funding,options(Object.keys(d.funding),form.funding,k=>d.funding[k].name+' · '+won(initialCapital(sector,k))));
  const climate=selectStart('climate',t.climate,options(Object.keys(d.climates),form.climate,k=>d.climates[k].name));
  return '<div class="founding"><header class="found-header"><div class="brand">'+brandIcon+'<div><strong>'+Catalog.brand+'</strong><small>'+Catalog.subtitle+'</small></div></div><div class="found-region">'+icon('anchor',17)+Catalog.region+'</div></header><main class="found-main"><div class="page-title"><div><div class="eyebrow title-eyebrow"><i></i>'+t.setupEn+'</div><h1>'+t.setupTitle+'</h1><p>'+t.setupHint+'</p></div></div><div class="found-layout"><form id="found-form" class="panel found-form"><label class="name-label" for="company-name">'+t.companyName+'</label><input id="company-name" name="companyName" autocomplete="organization" maxlength="'+d.nameLength+'" required placeholder="'+esc(t.placeholder)+'" value="'+esc(form.name)+'"><fieldset><legend>'+t.sector+'</legend><div class="sector-grid">'+selections+'</div><p class="sector-desc">'+sector.description+'</p></fieldset><div class="found-finance">'+capital+climate+'</div><button type="submit" class="primary found-submit">'+t.establish+icon('arrow',18)+'</button>'+(existing?btn('cancelSetup',t.cancelSetup,'wide text-link'):'')+'</form><section class="panel found-map"><div class="found-map-top"><div class="eyebrow">'+t.mapTag+'</div><h2>'+t.previewTitle+'</h2></div><div class="found-scene"><canvas id="found-canvas" aria-label="'+t.previewTitle+'"></canvas><div class="map-stamp"><i></i>'+t.sceneCode+'</div></div><div class="found-profile">'+row(t.startingSite,(sector.siteNames?.office||Catalog.sites.find(a=>a.id==='office').name))+row(t.sectorOverview,sector.chain)+'</div></section></div></main></div>';
}
function selectStart(id,title,opts) {
  return '<label>'+title+'<select name="'+id+'">'+opts+'</select></label>';
}
