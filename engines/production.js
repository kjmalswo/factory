'use strict';
const recipeCost = (s,k) => DB.goods[k].conversion + sum(entries(DB.goods[k].bom).map(([i,n])=>n*marketPrice(s,i)));
const possible = (f,k) => Math.min(...entries(DB.goods[k].bom).map(([i,n])=>Math.floor(f.stock[i]/n)));
const workLeft = f => sum(f.jobs.map(j=>j.qty*DB.goods[j.k].work-j.progress));
function research(s,f,k) {
  if(f.id==='player') requireOffice(s);
  if(!DB.products.includes(k)) fail('invalid');
  if(f.unlocked.includes(k)) fail('duplicate');
  const cost=DB.goods[k].research || DB.ai.launchCost;
  afford(f,cost); cash(s,f,-cost,T.research); f.profit-=cost; f.unlocked.push(k);
  f.quotes[k]=f.id==='player' ? 1 : marketPrice(s,k);
}
function enqueue(s,f,k,qty) {
  if(f.id==='player') requireOffice(s);
  if(!f.unlocked.includes(k)) fail('locked');
  if(!Number.isInteger(qty) || qty<1) fail('invalid');
  if(qty>possible(f,k)) fail('missing');
  const g=DB.goods[k];
  if(workLeft(f)+qty*g.work>DB.operations.wipLimit) fail('queueFull');
  afford(f,g.conversion*qty);
  cash(s,f,-g.conversion*qty,T.conversion+' · '+g.short);
  let cost=g.conversion;
  for(const [i,n] of entries(g.bom)) { cost+=f.basis[i]*n; f.stock[i]-=n*qty; }
  f.jobs.push({k,qty,progress:0,cost});
}
function productionDay(s,f) {
  let budget=facility(s,f).work*outputFactor(s,f.id);
  while(budget>0 && f.jobs.length) {
    const j=f.jobs[0], g=DB.goods[j.k];
    const space=spaceFor(s,f,j.k);
    if(space<=0) break;
    const progress=Math.min(budget,Math.min(space,j.qty)*g.work-j.progress);
    j.progress+=progress; budget-=progress;
    const done=Math.floor(j.progress/g.work);
    if(done) {
      addStock(f,j.k,done,done*j.cost); j.qty-=done; j.progress-=done*g.work;
      if(f.id==='player') {f.milestones[2]=true; news(s,'typeOps',T.manufactured,g.short+' × '+done);}
    }
    if(!j.qty) f.jobs.shift();
  }
}
function runWorkPlan(s) {
  const p=s.player;
  for(const [k,batch] of entries(p.plans||{})) {
    if(!batch) continue;
    const g=DB.goods[k], queued=sum(p.jobs.filter(j=>j.k===k).map(j=>j.qty));
    const qty=Math.min(batch-queued,possible(p,k),Math.floor(p.cash/g.conversion),Math.floor((DB.operations.wipLimit-workLeft(p))/g.work));
    if(qty>0) enqueue(s,p,k,qty);
  }
}
