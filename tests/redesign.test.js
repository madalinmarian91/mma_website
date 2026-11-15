const test = require('./harness.js');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

test('caruselul rulează mai rapid și permite navigarea manuală', () => {
  function element() {
    return { hidden:false, attrs:{}, handlers:{}, classList:{toggle(){}}, addEventListener(name, fn){this.handlers[name]=fn;}, setAttribute(k,v){this.attrs[k]=v;}, removeAttribute(k){delete this.attrs[k];} };
  }
  const slides = Array.from({length:3},element), dots = Array.from({length:3},element), prev=element(), next=element(), carousel=element();
  carousel.querySelectorAll = selector => selector === '.slide' ? slides : dots;
  carousel.querySelector = selector => ({'[data-prev]':prev,'[data-next]':next})[selector];
  let pending; const media={matches:false,addEventListener(){}};
  const document={querySelector:()=>carousel,hidden:false,addEventListener(){}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'carousel.js'),'utf8'), {document,window:{matchMedia:()=>media},setTimeout(fn,delay){assert.equal(delay,3500); pending=fn; return 1;},clearTimeout(){pending=null;}});
  pending(); assert.deepEqual(slides.map(s=>s.hidden),[true,false,true]); assert.equal(dots[1].attrs['aria-current'],'true');
  carousel.handlers.mouseenter(); assert.equal(pending,null);
  next.handlers.click(); assert.deepEqual(slides.map(s=>s.hidden),[true,true,false]); assert.equal(pending,null);
  carousel.handlers.mouseleave(); assert.equal(typeof pending,'function');
  carousel.handlers.keydown({key:'ArrowRight',preventDefault(){}}); assert.deepEqual(slides.map(s=>s.hidden),[false,true,true]);
  carousel.handlers.touchstart({touches:[{clientX:200}]}); carousel.handlers.touchend({changedTouches:[{clientX:100}]}); assert.deepEqual(slides.map(s=>s.hidden),[true,false,true]);
  prev.handlers.click(); assert.deepEqual(slides.map(s=>s.hidden),[false,true,true]);
});

test('redarea automată este dezactivată când este activată mișcarea redusă', () => {
  const carousel = {querySelectorAll(){return [];}, querySelector(){return {addEventListener(){}};}, addEventListener(){}};
  let scheduled = false;
  vm.runInNewContext(fs.readFileSync(path.join(root,'carousel.js'),'utf8'), {document:{querySelector:()=>carousel,hidden:false,addEventListener(){}},window:{matchMedia:()=>({matches:true,addEventListener(){}})},setTimeout(){scheduled=true;},clearTimeout(){}});
  assert.equal(scheduled,false);
});

test('indicatorii cresc o singură dată până la valorile finale', () => {
  const counters = [14,50,20].map(count => ({dataset:{count:String(count)},textContent:`${count}+`}));
  const section = {querySelectorAll:()=>counters};
  let callback, frame, disconnected = false;
  function Observer(cb) { callback = cb; this.observe = () => {}; this.disconnect = () => { disconnected = true; }; }
  vm.runInNewContext(fs.readFileSync(path.join(root,'counters.js'),'utf8'), {
    document:{querySelector:()=>section}, window:{matchMedia:()=>({matches:false}),IntersectionObserver:Observer}, IntersectionObserver:Observer,
    requestAnimationFrame(fn){frame=fn;}
  });
  callback([{isIntersecting:true}]); assert.equal(disconnected,true);
  frame(0); assert.deepEqual(counters.map(c=>c.textContent),['0+','0+','0+']);
  frame(1400); assert.deepEqual(counters.map(c=>c.textContent),['14+','50+','20+']);
});

test('indicatorii rămân statici pentru mișcare redusă', () => {
  let observed = false;
  const section = {querySelectorAll:()=>[]};
  vm.runInNewContext(fs.readFileSync(path.join(root,'counters.js'),'utf8'), {
    document:{querySelector:()=>section},window:{matchMedia:()=>({matches:true}),IntersectionObserver:function(){observed=true;}}
  });
  assert.equal(observed,false);
});

test('legăturile locale și ancorele din paginile publice există', () => {
  for (const page of ['index.html','smart-systems/index.html','websites/index.html']) {
    const html=fs.readFileSync(path.join(root,page),'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value=match[1]; if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
      const [pathname,hash]=value.split('#'); const target=path.resolve(root,path.dirname(page),decodeURI((pathname || path.basename(page)).split('?')[0]));
      let file=target; if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
      assert.ok(fs.existsSync(file),`${page}: ${value}`);
      if(hash && /\.html$/.test(file)) assert.match(fs.readFileSync(file,'utf8'),new RegExp(`id=["']${hash}["']`),`${page}: ${value}`);
    }
  }
});

test('paginile publice nu includ proiectul retras sau informații despre prețuri', () => {
  for (const page of ['index.html','smart-systems/index.html','websites/index.html']) {
    const html = fs.readFileSync(path.join(root,page),'utf8');
    assert.doesNotMatch(html, /urologie\s+fundeni|preț(?:uri|ul)?|\b\d[\d.]*\s+lei\b|configurator|black friday|estimarea costurilor/i, page);
  }
  assert.equal(fs.existsSync(path.join(root,'websites/preturi/index.html')), false);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'), /websites\/preturi\//);
});
