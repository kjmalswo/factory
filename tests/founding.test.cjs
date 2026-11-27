const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('custom founding terms survive a save and finance the first production and wholesale contract', () => {
  const root = path.resolve(__dirname, '..');
  const context = vm.createContext({assert, window: {addEventListener() {}}});
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const [, name] of html.matchAll(/<script src="([^"]+)"/g)) {
    const script = new vm.Script(fs.readFileSync(path.join(root, name), 'utf8'), {filename: name});
    if (name !== 'ui/app.js') script.runInContext(context);
  }

  vm.runInContext(`
    const settings = {...foundingDefaults(), name:'나무와 사람들', sector:'furniture', funding:'lean', climate:'slump'};
    assert.ok(foundingScreen(settings,false).includes('value="furniture" checked'));
    const S = newGame(4312, settings), p=S.player;
    assert.equal(DB.company, settings.name);
    assert.equal(p.cash, Catalog.startup.funding.lean.cash);
    assert.equal(S.demand, eventDef(S.events[0]).factor);
    const [wood,hardware] = DB.raw, [desk]=DB.products;
    assert.equal(S.firms[supplierOf(wood).id].product, wood);
    acquire(S,'office');
    const supplier=S.firms[supplierOf(wood).id], previous=supplier.stock[wood];
    const timber=quote(S,wood,'road',10), fittings=quote(S,hardware,'express',5);
    const before=p.cash;
    purchase(S,p,wood,'road',10); purchase(S,p,hardware,'express',5);
    assert.equal(p.cash,before-timber.total-fittings.total);
    assert.equal(supplier.stock[wood],previous-10);
    assert.ok(fittings.tariff>0);
    day(S);
    assert.equal(p.stock[wood],facility(S).dock);
    assert.equal(p.stock[hardware],0);
    assert.ok(S.cargos.some(c=>c.owner===p.id && c.due<=S.day));
    improve(S,'docks');
    S.day++;logisticsDay(S);
    assert.equal(p.stock[wood],10);
    assert.equal(p.stock[hardware],5);
    enqueue(S,p,desk,2); productionDay(S,p);
    assert.equal(p.stock[desk],2);
    const buyer=DB.ai.firms.find(d=>d.product===DB.products[2]).id, deal=contractQuote(S,desk,buyer);
    const cashBefore=p.cash;
    contract(S,desk,buyer,2);
    assert.equal(p.stock[desk],0);
    assert.equal(p.cash,cashBefore+deal.unit*2);
    assert.ok(S.cargos.some(c=>c.owner===buyer && c.from===p.id && c.k===desk && c.qty===2));
    const restored=JSON.parse(JSON.stringify(S));
    configureCompany(restored.setup);
    assert.equal(DB.company,settings.name);
    assert.deepEqual(DB.products,Object.keys(DB.goods).filter(k=>DB.goods[k].bom));
    assert.ok(restored.player.milestones.slice(0,4).every(Boolean));
  `, context);
});
