'use strict';
function channelForm(p) {
  const c=channelFor(p);
  return select('channel',T.retailChannel,options(DB.channels.map((_,i)=>i),p.channel??0,i=>DB.channels[i].name))+
    row(T.channelFee,(c.fee*DB.development.percent).toFixed(1)+'%')+row(T.channelLimit,pcs(channelCapacity(p)))+row(T.channelReach,c.reach+'×')+'<p>'+T.retailInfo+'</p>';
}
function designSummary(d) {
  const rules=DB.development,technologies=[techNames()[0],...d.techs.map(k=>nodeName(rules.nodes[k]))];
  return row(T.family,DB.goods[d.family].name)+row(T.subtype,variants(d.family)[d.subtype])+row(T.tier,rules.tiers[d.tier].name)+row(T.finish,rules.finishes[d.finish].name)+row(T.appliedTech,technologies.join(' · '));
}
function designNumbers(d) {
  const g=blueprint(d),q=quoteDesign(S,g),r=DB.development;
  const valid=Number.isFinite(d.margin)&&d.margin>=r.marginMin&&d.margin<=r.marginMax;
  return entries(g.bom).map(([k,n])=>row(DB.goods[k].name,pcs(n))).join('')+
    row(T.workRequired,g.work)+row(T.conversion,won(g.conversion))+
    (DB.sector.licenseRun?row(T.digitalReference,pcs(DB.sector.licenseRun)):'')+
    row(T.previewCost,won(q.unit))+row(T.costRatio,valid?(r.percent-d.margin)+'%':'—')+
    row(T.targetMargin,valid?d.margin+'%':'—')+row(T.designPrice,valid?won(q.price):'—')+
    row(T.designFee,won(developmentCost(r.designFee)))+'<p>'+T.priceNote+'</p>';
}
function designView() {
  const d=U.design??=defaultDesign(), r=DB.development;
  const techs=entries(r.nodes).filter(([,n])=>n.tech).map(([id,n])=>{
    const unlocked=S.player.completed?.includes(id);
    return '<label class="tech-choice"><input type="checkbox" data-tech="'+id+'" '+(unlocked?'':'disabled')+' '+(d.techs.includes(id)?'checked':'')+'>'+nodeName(n)+'</label>';
  }).join('');
  const pricing=U.priceBasis==='costRatio'?'costRatio':'targetMargin';
  const min=pricing==='costRatio'?r.percent-r.marginMax:r.marginMin, max=pricing==='costRatio'?r.percent-r.marginMin:r.marginMax;
  const number=Number.isFinite(d.margin)?(pricing==='costRatio'?r.percent-d.margin:d.margin):'';
  const fields='<form id="design-form"><label class="field">'+T.designName+'<input name="designName" required maxlength="'+r.nameLimit+'" value="'+esc(d.name)+'"></label>'+
    select('family',T.family,options(DB.products,d.family,k=>DB.goods[k].name))+select('subtype',T.subtype,options(variants(d.family).map((_,i)=>i),d.subtype,i=>variants(d.family)[i]))+
    select('tier',T.tier,options(Object.keys(r.tiers),d.tier,k=>r.tiers[k].name))+select('finish',T.finish,options(Object.keys(r.finishes),d.finish,k=>r.finishes[k].name))+
    select('priceBasis',T.pricingBasis,options(['targetMargin','costRatio'],pricing,k=>T[k]))+'<label class="field">'+T.pricingValue+'<input type="number" required name="designRatio" min="'+min+'" max="'+max+'" value="'+number+'"></label>'+
    '<fieldset class="tech-set"><legend>'+T.appliedTech+'</legend>'+tag(techNames()[0],'green')+techs+'</fieldset><p>'+T.techHint+'</p><button class="wide primary" type="submit">'+T.newDesign+icon('arrow',16)+'</button></form>';
  const list=entries(S.designs||{}).map(([id,d])=>btn('designedSku',itemLogo(id)+'<span>'+esc(d.name)+'</span>'+tag(variants(d.family)[d.subtype]),'good','data-id="'+id+'"')).join('');
  return '<div class="two-col">'+panel(T.design,'<p>'+T.designHelp+'</p>'+fields)+panel(T.designPrice,'<div id="design-numbers">'+designNumbers(d)+'</div>')+'</div>'+panel(T.designReady,list?'<div class="goods-list">'+list+'</div>':empty(T.emptyDesign));
}
function projectView() {
  const p=S.player,nodes=DB.development.nodes;
  function branch(technical) {
    return entries(nodes).filter(([,n])=>Boolean(n.tech||n.department)===technical).map(([id,n])=>{
      const complete=p.completed?.includes(id), active=p.project?.id===id, ready=n.needs.every(k=>p.completed?.includes(k));
      return '<article class="project-card"><div><h3>'+nodeName(n)+'</h3>'+ (complete?tag(T.doneProject,'green'):active?tag(T.underway,'amber'):'')+'</div><p>'+n.desc+'</p>'+
        row(T.prerequisites,n.needs.length?n.needs.map(k=>nodeName(nodes[k])).join(' + '):T.noRequirements)+
        row(T.projectPrice,won(developmentCost(n.cost)))+row(active?T.daysLeft:T.daysRequired,(active?p.project.due-S.day:n.days)+' '+T.dayUnit)+
        (complete||active?'':btn('project',T.startProject,'subtle wide','data-id="'+id+'" '+(!ready||p.project?'disabled':'')))+'</article>';
    }).join('');
  }
  return '<div class="two-col">'+panel(T.researchTree,branch(true))+panel(T.companyTree,branch(false))+'</div>';
}
