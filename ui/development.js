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
function treeStatus(id,node,p) {
  if(p.completed?.includes(id)) return ['done',T.doneProject];
  if(p.project?.id===id) return ['active',T.underway];
  return node.needs.every(k=>p.completed?.includes(k)) ? ['ready',T.treeReady] : ['locked',T.treeLocked];
}
function technologyTree(title,ids,p) {
  const nodes=DB.development.nodes, positions=new Map();
  const depth=id=>Math.max(0,...nodes[id].needs.map(parent=>1+depth(parent)));
  const columns=Math.max(...ids.map(depth))+1;
  const lanes=Array.from({length:columns},()=>[]);
  for(const id of ids) lanes[depth(id)].push(id);
  const rows=Math.max(...lanes.map(lane=>lane.length));
  lanes.forEach((lane,col)=>lane.forEach((id,row)=>positions.set(id,{
    x:(col+.5)*100/columns, y:(row+(rows-lane.length+1)/2)*100/rows
  })));
  const edges=ids.flatMap(id=>nodes[id].needs.map(parent=>{
    const from=positions.get(parent),to=positions.get(id),mid=(from.x+to.x)/2;
    const complete=p.completed?.includes(parent);
    return '<path class="'+(complete?'lit':'')+'" d="M'+from.x+' '+from.y+' H'+mid+' V'+to.y+' H'+to.x+'"/>';
  })).join('');
  const controls=ids.map(id=>{
    const node=nodes[id], [state,label]=treeStatus(id,node,p), {x,y}=positions.get(id);
    const tip='<span class="node-tip" id="tip-'+id+'" role="tooltip"><strong>'+nodeName(node)+'</strong><span>'+node.desc+'</span><em>'+label+'</em></span>';
    return '<div class="tree-point" style="--x:'+x+'%;--y:'+y+'%">'+btn('treeNode',icon(node.icon,26),'tree-icon '+state,'data-id="'+id+'" aria-label="'+nodeName(node)+'" aria-describedby="tip-'+id+'" aria-pressed="'+(U.node===id)+'"')+
      '<span class="node-label">'+nodeName(node)+'</span>'+tip+'</div>';
  }).join('');
  return '<section class="tree-branch"><h3>'+title+'</h3><div class="tree-scroll"><div class="tree-grid" style="--cols:'+columns+';--rows:'+rows+'"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+edges+'</svg>'+controls+'</div></div></section>';
}
function projectView() {
  const p=S.player,nodes=DB.development.nodes,ids=Object.keys(nodes);
  const researchIds=ids.filter(id=>nodes[id].tech||nodes[id].department);
  const companyIds=ids.filter(id=>!researchIds.includes(id));
  const id=U.node||p.project?.id||ids[0], node=nodes[id], [state,label]=treeStatus(id,node,p);
  const launch=state==='ready'&&!p.project;
  const detail='<div class="tree-detail"><div>'+tag(label,state==='done'?'green':'amber')+'<h3>'+nodeName(node)+'</h3><p>'+node.desc+'</p></div>'+
    '<div class="tree-cost">'+row(T.prerequisites,node.needs.length?node.needs.map(k=>nodeName(nodes[k])).join(' + '):T.noRequirements)+
    row(T.projectPrice,won(developmentCost(node.cost)))+row(state==='active'?T.daysLeft:T.daysRequired,(state==='active'?p.project.due-S.day:node.days)+' '+T.dayUnit)+
    (launch?btn('project',T.startProject,'primary','data-id="'+id+'"'):'')+'</div></div>';
  return technologyTree(T.researchTree,researchIds,p)+technologyTree(T.companyTree,companyIds,p)+detail;
}
