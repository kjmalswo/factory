const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('industry founding, custom design, research and first wholesale settlement survive a save', () => {
  const root = path.resolve(__dirname, '..');
  const context = vm.createContext({assert, window: {addEventListener() {}}});
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const [, name] of html.matchAll(/<script src="([^"]+)"/g)) {
    const script = new vm.Script(fs.readFileSync(path.join(root, name), 'utf8'), {filename: name});
    if (name !== 'ui/app.js') script.runInContext(context);
  }

  vm.runInContext(`
    const settings = {...foundingDefaults(), name:'나무와 사람들', sector:'apparel', funding:'lean', climate:'slump'};
    const form=foundingScreen(settings,false);
    assert.ok(form.includes('value="apparel" checked'));
    assert.equal((form.match(/name="sector"/g)||[]).length,6);
    assert.ok(!form.includes('value="furniture"'));
    for(const id of Catalog.startup.selectable){
      const industry=Catalog.sectors[id];
      assert.ok(industry.channels.length>1);
      assert.ok(industry.products.every(k=>industry.categories[k].length>1));
    }
    const S = newGame(4312, settings), p=S.player;
    assert.equal(DB.company, settings.name);
    const U={tab:'products',product:null,sku:null,page:null};
    assert.deepEqual(p.catalog,[]);
    assert.deepEqual(p.unlocked,[]);
    assert.ok(marketView().includes(T.emptyCatalog));
    assert.ok(!marketView().includes('data-act="good"'));
    assert.ok(productionView().includes(T.designFirst));
    assert.ok(guideCard().includes(T.tutorial));
    assert.ok(worldShell().includes('id="map-canvas"'));
    assert.ok(menuBar().includes('data-id="development"'));
    assert.ok(projectView().includes('role="tooltip"'));
    assert.ok(projectView().includes('<path class="" d="M'));
    assert.equal(p.cash, Catalog.startup.funding.lean.cash);
    assert.equal(S.demand, eventDef(S.events[0]).factor);
    const [cloth,,buttons] = DB.raw, [top]=DB.products;
    assert.equal(S.firms[supplierOf(cloth).id].product, cloth);
    acquire(S,'office');
    const supplier=S.firms[supplierOf(cloth).id], previous=supplier.stock[cloth];
    const fabricQuote=quote(S,cloth,'road',10), fittings=quote(S,buttons,'express',5);
    const before=p.cash;
    purchase(S,p,cloth,'road',10); purchase(S,p,buttons,'express',5);
    assert.equal(p.cash,before-fabricQuote.total-fittings.total);
    assert.equal(supplier.stock[cloth],previous-10);
    assert.ok(fittings.tariff>0);
    day(S);
    assert.equal(p.stock[cloth],facility(S).dock);
    assert.equal(p.stock[buttons],0);
    assert.ok(S.cargos.some(c=>c.owner===p.id && c.due<=S.day));
    improve(S,'docks');
    S.day++;logisticsDay(S);
    assert.equal(p.stock[cloth],10);
    assert.equal(p.stock[buttons],5);
    const design={...defaultDesign(),family:top,name:'바람 <셔츠>',techs:['process'],margin:35};
    assert.throws(()=>registerDesign(S,design));
    assert.throws(()=>startProject(S,'integration'));
    startProject(S,'lab');S.day=p.project.due;advanceProject(S);
    startProject(S,'process');S.day=p.project.due;advanceProject(S);
    const sku=registerDesign(S,design);
    assert.equal(familyOf(sku),top);
    U.product=sku;U.sku=sku;U.buyer=DB.ai.firms.find(f=>!f.raw).id;U.exportQty=DB.trade.lots[0];U.contractQty=DB.operations.batch[0];
    assert.ok(marketView().includes('바람 &lt;셔츠&gt;'));
    assert.ok(!marketView().includes('data-id="'+top+'"'));
    assert.ok(productionView().includes('바람 &lt;셔츠&gt;'));
    assert.ok(DB.goods[sku].work<DB.goods[top].work);
    assert.equal(askingPrice(S,p,sku),quoteDesign(S,DB.goods[sku]).price);
    enqueue(S,p,sku,2); productionDay(S,p);
    assert.equal(p.stock[sku],2);
    const buyer=DB.ai.firms.find(d=>d.product===DB.products[2]).id, deal=contractQuote(S,sku,buyer);
    const cashBefore=p.cash;
    contract(S,sku,buyer,2);
    assert.equal(p.stock[sku],0);
    assert.equal(p.cash,cashBefore+deal.unit*2);
    assert.ok(S.cargos.some(c=>c.owner===buyer && c.from===p.id && c.k===sku && c.qty===2));
    const restored=JSON.parse(JSON.stringify(S));
    restoreIndustry(restored);
    assert.equal(DB.company,settings.name);
    assert.equal(DB.goods[sku].name,design.name);
    assert.ok(restored.player.completed.includes('process'));
    assert.deepEqual(restored.player.catalog,[sku]);
    // Existing inventory still has a sales route after a migration.
    delete restored.player.catalog;
    restored.player.unlocked.push(top,DB.products[1]);
    restored.player.stock[top]=1;
    restoreIndustry(restored);
    assert.deepEqual(restored.player.catalog,[sku,top,DB.products[1]]);
    assert.ok(restored.player.milestones.slice(0,4).every(Boolean));
  `, context);
});
