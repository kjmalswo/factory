'use strict';
const Harbor = (() => {
  const m=DB.map, t=m.tile, h=t/2, scale=m.renderScale;
  const iso=(x,y,z=0)=>[(x-y)*t,(x+y)*h-z];
  const noise=(x,y,n=0)=>{const a=Math.sin(x*127.1+y*311.7+n*74.7+m.seed)*43758.5453;return a-Math.floor(a);};
  let ctx, origin=[0,0], atlas, atlasSector, atlasOffset, canvas, state, pick, hover, hovered, hot=[], frame, last=0;
  let center=m.center.slice(), zi=m.initialZoom, drag=null;
  const keys=new Set();
  function poly(color,pts) {
    ctx.fillStyle=color;ctx.beginPath();
    pts.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](Math.round(x+origin[0]),Math.round(y+origin[1])));
    ctx.closePath();ctx.fill();
  }
  function rect(color,x,y,w,height) {ctx.fillStyle=color;ctx.fillRect(Math.round(x+origin[0]),Math.round(y+origin[1]),Math.round(w),Math.round(height));}
  function plane(x,y,w,d,z,c) {poly(c,[iso(x,y,z),iso(x+w,y,z),iso(x+w,y+d,z),iso(x,y+d,z)]);}
  function box(x,y,w,d,z,height,colors) {
    const top=z+height;
    poly(colors[1],[iso(x,y+d,top),iso(x+w,y+d,top),iso(x+w,y+d,z),iso(x,y+d,z)]);
    poly(colors[2],[iso(x+w,y,top),iso(x+w,y+d,top),iso(x+w,y+d,z),iso(x+w,y,z)]);
    plane(x,y,w,d,top,colors[0]);
  }
  const cream=['#dfd9bb','#c0b793','#928d77'], blue=['#74939d','#516f7c','#354f60'], steel=['#99a7a2','#727e7b','#505d61'], brick=['#d49063','#b57451','#86523e'], white=['#e2e2cf','#bdbfa9','#919982'];
  function building(x,y,type,variant=0) {
    const mode=DB.sector?.mode;
    if(mode==='service' && ['office','factory','rival'].includes(type)) {
      box(x-1.2,y-.9,2.4,1.8,0,9,cream);
      box(x-1.3,y-1,2.6,2,9,2,brick);
      for(let i=0;i<6;i++) box(x-1.2+i*.4,y+.84,.4,.48,6,1.5,i%2?cream:brick);
      for(let i=0;i<3;i++) box(x-.96+i*.71,y+.9,.42,.04,1,4,blue);
      return;
    }
    if(mode==='digital' && ['factory','rival'].includes(type)) type='office';
    const industrial=['factory','supplier','rival','warehouse','terminal'].includes(type);
    if(type==='land') {
      plane(x-1.25,y-1.22,2.7,2.55,0,'#9e9272');
      for(let j=0;j<3;j++) for(let i=0;i<3;i++) box(x-1+i*.89,y-1+j*.92,.08,.08,0,2,cream);
      for(let i=0;i<4;i++) box(x-.65+i*.23,y-.1,.19,.82,0,2,brick);
      return;
    }
    const w=industrial?2.66:1.84,d=industrial?1.75:1.52,z=type==='office'?15:industrial?11:7+variant*3;
    const a=x-w/2,b=y-d/2,wall=type==='office'?cream:industrial?(variant%2?steel:white):cream;
    plane(a+.32,b+.32,w+.18,d+.19,0,'#657565');
    box(a-.13,b-.13,w+.26,d+.26,0,2,steel);
    box(a,b,w,d,2,z,wall);
    if(industrial) {
      if(type==='supplier'||type==='factory'||type==='rival') {
        for(let i=0;i<3;i++) {
          const st=a+w*i/3,span=w/3;
          poly(i%2?'#83a5a6':'#99b1ab',[iso(st,b,z+3),iso(st+span,b,z+7),iso(st+span,b+d,z+7),iso(st,b+d,z+3)]);
          poly('#455f69',[iso(st+span,b,z+7),iso(st+span,b+d,z+7),iso(st+span,b+d,z+3),iso(st+span,b,z+3)]);
          poly('#708786',[iso(st,b+d,z+3),iso(st+span,b+d,z+7),iso(st+span,b+d,z+3)]);
        }
        if(variant%2===0) {
          box(a+.23,b+.26,.31,.31,z+3,12,brick);
          box(a+.23,b+.26,.31,.31,z+11,2,white);
          box(a+.19,b+.22,.39,.39,z+15,1,steel);
        }
      } else {
        box(a-.08,b-.08,w+.16,d+.16,z+2,2,blue);
        for(let i=0;i<7;i++) plane(a+i*w/7,b,.055,d,z+4,'#abc0b7');
      }
      for(let i=0;i<5;i++) {
        box(a+.14+i*.48,b+d,.29,.035,6,3,blue);
        box(a+.14+i*.48,b+d,.29,.035,7,.8,white);
      }
      box(a+w,b+.32,.04,.84,2,6,steel);
      for(let i=0;i<3;i++) box(a+w,b+.32,.055,.84,3+i*1.6,.5,blue);
    } else {
      box(a-.06,b-.06,w+.12,d+.12,z+2,2,white);
      plane(a+.08,b+.08,w-.16,d-.16,z+4,'#a7aaa0');
      box(a+.22,b+.23,.65,.47,z+4,3,steel);
      box(a+.31,b+.27,.36,.24,z+7,1,blue);
      for(let level=0;level<Math.floor(z/5);level++) {
        for(let i=0;i<4;i++) box(a+.12+i*.45,b+d,.29,.035,3+level*5,2.7,blue);
        for(let i=0;i<3;i++) box(a+w,b+.13+i*.46,.035,.29,3+level*5,2.7,blue);
      }
      if(type==='office') box(a+.17,b+d,.8,.24,5,1.6,['#eaba68','#b48d48','#997a44']);
    }
    if(industrial) {box(a+w-.6,b+d+.25,.46,.35,0,3,brick);box(a+w-.13,b+d+.32,.36,.35,0,2,cream);}
  }
  function tree(x,y) {
    const [a,b]=iso(x,y);
    plane(x-.1,y+.06,.6,.5,0,'#72836a');
    rect('#686852',a-1,b-6,2,7);
    rect('#456852',a-3,b-9,7,5);rect('#50765a',a-4,b-11,7,5);
    rect('#659061',a-3,b-13,6,5);rect('#80a26d',a-2,b-13,3,3);
  }
  function container(x,y,c) {
    const cols=[['#b66c50','#a55944','#824837'],['#73999c','#547c86','#416670'],['#d3af6e','#b38f55','#907046']][c];
    box(x,y,1.24,.52,0,3.5,cols);
    for(let j=0;j<5;j++) plane(x+.1+j*.23,y+.03,.04,.45,3.5,'#ded0aa');
  }
  function crane(x,y) {
    box(x,y,.23,.23,0,23,brick);box(x+.68,y,.23,.23,0,21,brick);
    box(x-.25,y-.24,1.4,.64,20,3,brick);
    box(x+.1,y+.05,.23,3,24,2.5,['#e1b65d','#c8954e','#926b3e']);
    const [a,b]=iso(x+.22,y+2.9,24);
    rect('#596861',a,b,1,12);rect('#ca9c50',a-1,b+11,3,2);
  }
  function vessel(x,y) {
    poly('#344f60',[[0,.46],[.62,0],[3.85,0],[4.5,.52],[3.85,1.05],[.6,1.05]].map(([a,b])=>iso(x+a,y+b,1)));
    box(x+.4,y+.18,.7,.68,1,5,white);
    for(let i=0;i<2;i++) container(x+1.2+i*1.22,y+.2,i);
  }
  function makeAtlas() {
    const pad=100;
    atlas=document.createElement('canvas');
    atlas.width=(m.width+m.height)*t+pad*2;atlas.height=(m.width+m.height)*h+pad*2;
    atlasOffset=[m.height*t+pad,pad];origin=atlasOffset;ctx=atlas.getContext('2d');
    const rx=x=>m.roadsX.includes(x), ry=y=>m.roadsY.includes(y);
    const objs=[];
    for(let x=0;x<m.width;x++) for(let y=0;y<m.height;y++) {
      const n=noise(x,y);
      const water=x>=m.waterX || y>=m.waterY;
      if(water) {
        plane(x,y,1.03,1.04,0,['#508b90','#528e92','#528d91','#548f94'][Math.floor(n*4)]);
        const [a,b]=iso(x+.3,y+.3);
        if(n>.45) {rect(n>.7?'#78a9a6':'#659a9c',a,b,3+n*5,1);if(n>.88) rect('#a0bfaf',a-2,b+1,3,1);}
        continue;
      }
      if(x===m.waterX-1 || y===m.waterY-1) {
        box(x,y,1.02,1.02,-3,4,['#b3b39c','#727e7b','#667477']);
        if((x+y)%3===0) box(x+.2,y+.2,.14,.14,1,1.6,blue);
      } else if(rx(x)||ry(y)) {
        plane(x,y,1.04,1.04,0,'#777f7c');
        if(rx(x)&&!ry(y)) {plane(x,y,.07,1,0,'#c4c4ad');plane(x+.93,y,.07,1,0,'#c4c4ad');plane(x+.49,y+.15,.04,.42,0,'#d7c6a0');}
        if(ry(y)&&!rx(x)) {plane(x,y,1,.07,0,'#c4c4ad');plane(x,y+.93,1,.07,0,'#c4c4ad');plane(x+.16,y+.49,.42,.04,0,'#d7c6a0');}
        if(rx(x)&&ry(y)) for(let j=0;j<4;j++){plane(x+.1+j*.22,y,.12,.19,0,'#d9d7ba');plane(x,y+.11+j*.22,.18,.12,0,'#d9d7ba');}
      } else if(y===m.railY) {
        plane(x,y,1.03,1.03,0,'#90917d');
        for(let i=0;i<3;i++) plane(x+i/3,y+.19,.1,.6,0,'#696858');
        for(const v of [.28,.65]) plane(x,y+v,1,.07,0,'#bec0aa');
      } else {
        const quay=y>=m.roadsY.at(-1)||x>=m.roadsX.at(-2);
        const paved=quay||DB.sites.some(a=>Math.abs(a.x-x)<2 && Math.abs(a.y-y)<2);
        const colors=paved?['#adb19a','#aeb29e','#afb39f']:['#94a784','#95a987','#9bad89'];
        plane(x,y,1.05,1.05,0,colors[Math.floor(n*3)]);
        if(!paved && n>.63) objs.push([x+y,()=>tree(x+.23,y+.38)]);
        if(quay && x%3===0 && y%2===0 && n>.21 && !DB.sites.some(a=>Math.abs(a.x-x)<2&&Math.abs(a.y-y)<2)) objs.push([x+y,()=>container(x,y,Math.floor(n*3))]);
        if(!paved && n<.08 && !rx(x+1)&&!ry(y+1)) objs.push([x+y+1,()=>building(x+.5,y+.55,'house',Math.floor(n*35))]);
      }
    }
    for(const a of DB.sites) objs.push([a.x+a.y,()=>building(a.x,a.y,a.type,DB.sites.indexOf(a))]);
    for(const x of [7,18,25,29]) objs.push([x+m.waterY-1,()=>crane(x,m.waterY-1.6)]);
    for(const x of [4,19]) objs.push([x+m.waterY+2,()=>vessel(x,m.waterY+1.4)]);
    objs.sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
  }
  function draw(now) {
    if(!canvas || !canvas.isConnected) return;
    const dt=Math.min(m.maxFrame,(now-last)/1000);last=now;
    const dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    const dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
    if(dx||dy) move(dx*m.pan*dt,dy*m.pan*dt);
    const w=Math.max(1,Math.round(canvas.clientWidth/scale)),height=Math.max(1,Math.round(canvas.clientHeight/scale));
    if(canvas.width!==w||canvas.height!==height){canvas.width=w;canvas.height=height;}
    ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const zoom=m.zoom[zi], [cx,cy]=iso(...center);
    const ox=Math.round(w/2-cx*zoom),oy=Math.round(height/2-cy*zoom);
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#4d858a';ctx.fillRect(0,0,w,height);
    ctx.setTransform(zoom,0,0,zoom,ox,oy);ctx.drawImage(atlas,-atlasOffset[0],-atlasOffset[1]);
    origin=[0,0];
    if(state().s.player.built) {const a=site('plot');building(a.x,a.y,'factory');}
    for(let i=0;i<m.roadsY.length;i++){
      const y=m.roadsY[i],x=(now/3200+i*7)%(m.waterX-2);
      box(x,y+.2,.55,.27,0,1.8,i%2?brick:white);
    }
    hot=[];
    const {s,id,hint}=state();
    for(const a of DB.sites) {
      const active=id===a.id||hovered===a.id||hint===a.id;
      const owned=s.player.sites.includes(a.id),ownColor='#9fd5a8',openColor='#f5a759';
      const color=owned?ownColor:a.firm?'#afc8d5':openColor;
      if(active) {
        const pts=[[a.x-1.65,a.y-1.45],[a.x+1.65,a.y-1.45],[a.x+1.65,a.y+1.5],[a.x-1.65,a.y+1.5]].map(p=>iso(...p));
        ctx.strokeStyle=openColor;ctx.lineWidth=1.5;ctx.beginPath();pts.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x,y));ctx.closePath();ctx.stroke();
      }
      const [x,y]=iso(a.x,a.y),pinY=y-(a.type==='land'?6:26);
      rect('#243536',x-4,pinY-6,9,9);rect(color,x-3,pinY-5,7,6);
      poly('#243536',[[x-3,pinY+2],[x+3,pinY+2],[x,pinY+5]]);
      rect('#314545',x-2,pinY-3,5,1);
      if(!a.firm) rect('#314545',x,pinY-5,1,5);
      hot.push({id:a.id,x:x*zoom+ox,y:pinY*zoom+oy,base:y*zoom+oy,zoom});
    }
    frame=requestAnimationFrame(draw);
  }
  function move(x,y){clearHover();center=[clamp(center[0]+x+y,0,m.width-1),clamp(center[1]-x+y,0,m.height-1)];}
  function hitAt(point) {
    const rect=canvas.getBoundingClientRect();
    const x=(point.clientX-rect.left)*canvas.width/rect.width;
    const y=(point.clientY-rect.top)*canvas.height/rect.height;
    const hits=hot.filter(p=>Math.abs(x-p.x)<17*p.zoom && y>=p.y-8*p.zoom && y<=p.base+8*p.zoom);
    const distance=p=>Math.hypot(p.x-x,(p.y+p.base)/2-y);
    return hits.sort((a,b)=>distance(a)-distance(b))[0]?.id;
  }
  function clearHover() {
    if(!hovered) return;
    hovered=null;hover?.(null);
    if(canvas) canvas.classList.remove('map-hit');
  }
  function mount(el,read,onPick,onHover) {
    stop();canvas=el;state=read;pick=onPick;hover=onHover;
    if(!atlas || atlasSector!==DB.sector){atlasSector=DB.sector;makeAtlas();}
    canvas.onpointerdown=e=>{
      clearHover();canvas.setPointerCapture(e.pointerId);
      drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};
    };
    canvas.onpointermove=e=>{
      if(!drag){
        if(!hover || e.pointerType==='touch') return;
        const id=hitAt(e);
        if(!id){clearHover();return;}
        hovered=id;canvas.classList.add('map-hit');
        hover(id,{x:e.clientX,y:e.clientY});
        return;
      }
      move((drag.x-e.clientX)/(2*t*scale*m.zoom[zi]),(drag.y-e.clientY)/(2*h*scale*m.zoom[zi]));
      drag.x=e.clientX;drag.y=e.clientY;
    };
    canvas.onpointerup=e=>{
      const id=drag && Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5 && hitAt(e);
      drag=null;
      if(id) pick(id);
    };
    canvas.onpointercancel=()=>{drag=null;clearHover();};
    canvas.onpointerleave=clearHover;
    canvas.onwheel=e=>{e.preventDefault();zoom(Math.sign(-e.deltaY));};
    frame=requestAnimationFrame(draw);
  }
  function zoom(delta){clearHover();zi=clamp(zi+delta,0,m.zoom.length-1);}
  function focus(id){clearHover();const a=site(id);center=[a.x,a.y];}
  function stop(){clearHover();cancelAnimationFrame(frame);keys.clear();drag=null;canvas=null;}
  function preview(el,a){
    const prev=ctx,old=origin;el.width=114;el.height=56;ctx=el.getContext('2d');origin=[57,38];
    plane(-2,-1.65,4,3.3,0,'#718b79');plane(-1.8,-1.45,3.6,2.9,0,'#9ba797');building(0,0,a.type,DB.sites.indexOf(a));ctx=prev;origin=old;
  }
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(!canvas || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input,select,textarea,[contenteditable]')) return;
    const directional=['arrowup','arrowdown','arrowleft','arrowright'].includes(k);
    if(['w','a','s','d'].includes(k) || (directional && (e.target===canvas || e.target===document.body))){
      keys.add(k);e.preventDefault();
    }
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>keys.clear());
  return {mount,stop,focus,zoom,preview};
})();
