'use strict';
const developmentCost = amount => Math.round(amount*(DB.sector.capitalScale??1));
const techNames = () => DB.sector.technologies||DB.development.techNames;
const nodeName = node => typeof node.tech==='number' ? techNames()[node.tech] : node.name;
const variants = family => DB.sector.categories?.[family] || DB.development.legacySubtype;
function channelFor(f) {
  const channel=DB.channels[f.channel??0];
  return {...channel,fee:Math.max(0,channel.fee-companyEffect(f,'feeDiscount')),
    reach:channel.reach+companyEffect(f,'reach')};
}
const channelCapacity = f => DB.channels[f.channel??0].capacity+companyEffect(f,'capacity');
function startProject(s,id) {
  requireOffice(s);
  const p=s.player,node=DB.development.nodes[id];
  if(!node) fail('invalid');
  if(p.project) fail('projectBusy');
  if(p.completed?.includes(id)) fail('duplicate');
  if(!node.needs.every(n=>p.completed?.includes(n))) fail('noTech');
  const cost=developmentCost(node.cost);
  afford(p,cost);cash(s,p,-cost,nodeName(node));p.profit-=cost;
  p.project={id,due:s.day+node.days};
}
function advanceProject(s) {
  const p=s.player;
  if(!p.project || p.project.due>s.day) return;
  const id=p.project.id;
  (p.completed??=[]).push(id);p.project=null;
  news(s,'typeOps',T.doneProject,nodeName(DB.development.nodes[id]));
}
function defaultDesign() {
  return {name:'',family:DB.products[0],subtype:0,tier:Object.keys(DB.development.tiers)[0],finish:Object.keys(DB.development.finishes)[0],techs:[],margin:DB.development.defaultMargin};
}
function blueprint(d) {
  const rules=DB.development, base=DB.goods[d.family], tier=rules.tiers[d.tier], finish=rules.finishes[d.finish], sub=rules.subtypes[d.subtype];
  if(!DB.products.includes(d.family)||!tier||!finish||!Number.isInteger(d.subtype)||!variants(d.family)[d.subtype]||!sub) fail('invalid');
  const factors=d.techs.map(id=>rules.nodes[id]);
  if(factors.some(n=>!n?.tech)) fail('noTech');
  const multiplier=key=>factors.reduce((v,node)=>v*(node[key]??1),1);
  const bom={...base.bom};
  if(tier.extraMaterial) bom[DB.raw[0]]=(bom[DB.raw[0]]||0)+tier.extraMaterial;
  const materialSavings=sum(factors.map(node=>node.materialSaving||0));
  for(let i=0;i<materialSavings;i++){
    const [material, units]=entries(bom).reduce((largest,item)=>item[1]>largest[1]?item:largest);
    if(units<=1) break;
    bom[material]--;
  }
  const work=Math.max(1,Math.round(base.work*tier.work*finish.work*sub.work*multiplier('work')*rules.roundWork))/rules.roundWork;
  const conversion=Math.round(base.conversion*tier.cost*finish.cost*sub.cost*multiplier('costFactor'));
  return {...base,name:d.name,short:d.name,family:d.family,bom,work,conversion,quality:tier.quality*finish.quality*sub.quality*multiplier('quality'),margin:d.margin};
}
function quoteDesign(s,g) {
  const cost=g.conversion+sum(entries(g.bom).map(([k,n])=>n*marketPrice(s,k)));
  const unit=DB.sector.licenseRun ? cost/DB.sector.licenseRun : cost;
  return {cost,unit,price:Math.round(unit/(1-g.margin/DB.development.percent))};
}
function registerDesign(s,draft) {
  requireOffice(s);
  const rules=DB.development,p=s.player;
  const d={...draft,name:draft.name.trim(),techs:[...new Set(draft.techs)]};
  if(!d.name||d.name.length>rules.nameLimit) fail('invalidName');
  if(values(DB.goods).some(g=>g.name===d.name)) fail('sameName');
  if(!Number.isFinite(d.margin)||d.margin<rules.marginMin||d.margin>rules.marginMax) fail('badMargin');
  if(d.techs.length>rules.techSlots) throw new Error(T.techLimit.replace('{count}',rules.techSlots));
  if(d.techs.some(id=>!p.completed?.includes(id))) fail('noTech');
  const g=blueprint(d), fee=developmentCost(rules.designFee), id=T.skuPrefix+(Object.keys(s.designs||{}).length+1);
  afford(p,fee);
  cash(s,p,-fee,T.newDesign);p.profit-=fee;
  (s.designs??={})[id]=d;DB.goods[id]=g;
  for(const f of [p,...values(s.firms)]) {
    for(const key of ['stock','basis','sold','loyalty','exportUsed']) f[key][id]=0;
  }
  p.unlocked.push(id);p.catalog.push(id);p.quotes[id]=1;p.retailShare[id]=DB.operations.retailShares[0];
  news(s,'typeOps',T.newDesign,d.name);
  return id;
}
function restoreIndustry(s) {
  configureCompany(s.setup);
  for(const [id,d] of entries(s.designs||{})) DB.goods[id]=blueprint(d);
  const p=s.player;
  if(!p.catalog){
    // Keep legacy lines with an economic history; the old unused starter is removed.
    const legacy=DB.products.filter(id=>p.unlocked.includes(id) && (
      id!==DB.products[0] || p.stock[id]>0 || p.basis[id]>0 || p.plans?.[id] ||
      p.releases?.[id] || p.jobs.some(job=>job.k===id) ||
      s.cargos.some(cargo=>cargo.owner===p.id && cargo.k===id)
    ));
    p.catalog=[...Object.keys(s.designs||{}),...legacy];
    p.unlocked=p.unlocked.filter(id=>p.catalog.includes(id));
  }
}
