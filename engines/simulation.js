'use strict';
function day(s) {
  requireOffice(s);
  if(s.over) fail('insolvent');
  s.day++;
  economyDay(s); supplyDay(s);
  const companies=makers(s), rivals=companies.filter(f=>f!==s.player && !f.retired);
  // Rotating purchase priority prevents a permanent first mover in a shortage.
  const offset=rivals.length ? s.day%rivals.length : 0, ordered=rivals.slice(offset).concat(rivals.slice(0,offset));
  for(const f of ordered) strategy(s,f);
  for(const f of companies) { f.volume=0; f.sold=blank(); f.exportUsed=blank(); }
  logisticsDay(s);
  for(const f of ordered) operateAI(s,f);
  runReorders(s); runWorkPlan(s);
  for(const f of companies) if(!f.retired) productionDay(s,f);
  marketDay(s);
  for(const f of companies) {
    if(f.retired) continue;
    const fixed=facility(s,f).daily, interest=Math.ceil(f.debt*DB.finance.annualInterest/DB.finance.year);
    if(f.id==='player' && f.cash<fixed+interest) {
      const credit=Math.min(DB.finance.creditLimit-f.debt, Math.ceil((fixed+interest-f.cash)/DB.finance.loanUnit)*DB.finance.loanUnit);
      if(credit) {cash(s,f,credit,T.autoLoan);f.debt+=credit;}
    }
    cash(s,f,-fixed,T.expenses); cash(s,f,-interest,T.interestPaid);
    f.profit-=fixed+interest;
    if(f!==s.player && f.cash<0) {
      f.retired=true; f.reason='retired';
      news(s,'typeCompany',firmName(f.id)+' · '+T.restructure,T.insolvencyDetail);
    }
  }
  const p=s.player;
  p.milestones[5] ||= p.profit>=DB.finance.goalProfit;
  if(p.cash<0) {s.over=true;news(s,'typeOps',T.insolvent,T.failedHelp);}
}
