import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {visibleControl,enterCourse} from './g678-course-technical-collector-v1.mjs';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function controlsFixture() {
 const states=new Map(),counts=new Map();
 const page={locator(selector){return {
  async count(){counts.set(selector,(counts.get(selector)??0)+1);return states.get(selector)?.attached?1:0;},
  nth(){return {
   async isVisible(){return states.get(selector).visible;},
   async isEnabled(){return states.get(selector).enabled;},
  };},
 };}};
 return {states,counts,page};
}

test('waits for an asynchronously attached, visible and enabled public control',async()=>{
 const f=controlsFixture(),control={attached:false,visible:false,enabled:false};f.states.set('#delayed',control);
 const timers=[setTimeout(()=>{control.attached=true;},5),setTimeout(()=>{control.visible=true;},15),setTimeout(()=>{control.enabled=true;},25)];
 try {
  const result=await visibleControl(f.page,'#delayed',200);
  assert.equal(await result.isVisible(),true);assert.equal(await result.isEnabled(),true);
  assert(f.counts.get('#delayed')>1,'control was re-observed after its initial absence');
 } finally {timers.forEach(clearTimeout);}
});

test('a persistently disabled visible control fails within the bounded wait',async()=>{
 const f=controlsFixture();f.states.set('#disabled',{attached:true,visible:true,enabled:false});const before=Date.now();
 await assert.rejects(visibleControl(f.page,'#disabled',45),/PUBLIC_CONTROL_NOT_VISIBLE_OR_ENABLED: #disabled/);
 assert(Date.now()-before>=40,'disabled state must be retried before timeout');
 assert(f.counts.get('#disabled')>1);
});

test('a missing selector remains an explicit bounded failure',async()=>{
 const f=controlsFixture(),before=Date.now();
 await assert.rejects(visibleControl(f.page,'#missing',45),/PUBLIC_CONTROL_NOT_VISIBLE_OR_ENABLED: #missing/);
 assert(Date.now()-before>=40,'absence must be retried before timeout');assert(f.counts.get('#missing')>1);
});

const prior='shared-alg001-l06-p039',target='shared-alg001-l06-p040';
const priorSelector=`button[data-animation-id="${prior}"]`,targetSelector=`button[data-animation-id="${target}"]`;
const mapSelector='[data-responsive-focus-key="map"]',nextSelector='[data-lesson-nav="footer-next"]';
function navigationFixture({initial='shared-alg001-l06-p001',mapRequired=false,neverCommit=false,normalEntry=true,touch=false,hydrated=true,hydrateAfterMs=null}={}) {
 const state={current:initial,mapOpen:!mapRequired,url:'about:blank',hydrated,hydrationWaits:0,events:[],actions:[],commits:[],waits:[],timers:[]};
 const schedule=(callback,ms=12)=>state.timers.push(setTimeout(callback,ms));
 const player={getAttribute(name){return name==='data-current-animation-id'?state.current:null;}};
 const document={querySelector(selector){if(selector==='[data-lesson-player][data-hydrated="true"]')return state.hydrated?player:null;assert.equal(selector,'[data-lesson-player]');return player;}};
 const window={__g678TechnicalObserver:{records:{events:state.events}}};
 const performance={now:()=>globalThis.performance.now(),getEntriesByType:()=>[{name:state.url,type:'navigate',startTime:0,responseEnd:1,domContentLoadedEventEnd:2}]};
 const node=selector=>({tagName:'BUTTON',id:'',textContent:selector,getAttribute(name){return name==='data-responsive-focus-key'&&selector===mapSelector?'map':name==='data-animation-id'&&selector===priorSelector?prior:name==='data-animation-id'&&selector===targetSelector?target:null;}});
 const present=selector=>selector===mapSelector||selector===nextSelector||selector===targetSelector||selector===priorSelector&&state.mapOpen;
 const activate=(selector,method,args)=>{
  assert.equal(args.length,0,'public click/tap receives no force option');
  state.actions.push({selector,method,current:state.current,hydrated:state.hydrated});
  state.events.push({sequence:state.events.length+1,trusted:true,synthetic:false});
  if(!state.hydrated)return; // Visible SSR controls do not yet have their React handlers.
  if(selector===mapSelector){schedule(()=>{state.mapOpen=true;});return;}
  if(selector===nextSelector)assert.equal(state.current,prior,'Next may run only after the previous selection committed');
  const id=selector===priorSelector?prior:target;
  if(!neverCommit)schedule(()=>{state.current=id;state.commits.push(id);});
 };
 const page={
  async goto(url){state.url=url;if(hydrateAfterMs!==null)schedule(()=>{state.hydrated=true;},hydrateAfterMs);return {status:()=>200};},url:()=>state.url,
  async evaluate(callback,arg){return vm.runInNewContext(`(${callback.toString()})(arg)`,{document,window,performance,arg});},
  locator(selector){
   if(selector==='[data-lesson-player]')return {async getAttribute(name){return player.getAttribute(name);}};
   return {async count(){return present(selector)?1:0;},nth(){return {
    async isVisible(){return present(selector);},async isEnabled(){return true;},async evaluate(callback){return callback(node(selector));},
    async click(...args){activate(selector,'click',args);},async tap(...args){activate(selector,'tap',args);},
   };}};
  },
  async waitForFunction(callback,arg,{timeout}){
   if(arg===null)state.hydrationWaits++;else state.waits.push(arg);const deadline=Date.now()+timeout;
   do {if(await this.evaluate(callback,arg))return;await sleep(2);}while(Date.now()<deadline);
   throw Error(arg===null?'Lesson host hydration timed out':'Selection did not commit: '+arg);
  },
 };
 const parameters={route:'/{locale}/migration-status/g678-course/alg001/6',actions:{next:nextSelector},...(normalEntry?{normalEntry:{fromAnimationId:prior}}:{})};
 const config={origin:'http://127.0.0.1:3331',timeouts:{controlMs:50,selectionMs:80,readyMs:160}};
 const cell={locale:'en',touch},trace=[],diagnostics=[];
 return {page,state,trace,diagnostics,enter:()=>enterCourse(page,parameters,target,config,cell,trace,diagnostics),cleanup:()=>state.timers.forEach(clearTimeout)};
}

test('waits for prior-page commit before Next and target commit before returning',async()=>{
 const f=navigationFixture();
 try {
  const entry=await f.enter();assert.equal(entry.responseStatus,200);assert.equal(entry.sourceActionsCalled,false);assert.equal(entry.sourceStateWritten,false);
  assert.deepEqual(f.state.actions.map(a=>a.selector),[priorSelector,nextSelector]);
  assert.deepEqual(f.state.commits,[prior,target]);assert.deepEqual(f.state.waits,[prior,target]);
  assert.equal(f.state.current,target);assert(f.trace.every(t=>t.executed&&t.force===false&&t.method==='click'));
 } finally {f.cleanup();}
});

test('waits for asynchronous Map contents and keeps touch dispatch public and unforced',async()=>{
 const f=navigationFixture({mapRequired:true,touch:true});
 try {
  await f.enter();assert.deepEqual(f.state.actions.map(a=>a.selector),[mapSelector,priorSelector,nextSelector]);
  assert.deepEqual(f.state.commits,[prior,target]);assert.equal(f.diagnostics.length,0);
  assert(f.trace.every(t=>t.executed&&t.force===false&&t.method==='tap'));
 } finally {f.cleanup();}
});

test('direct public target selection waits for asynchronous host commit',async()=>{
 const f=navigationFixture({normalEntry:false});
 try {await f.enter();assert.deepEqual(f.state.actions.map(a=>a.selector),[targetSelector]);assert.deepEqual(f.state.waits,[target]);assert.equal(f.state.current,target);}
 finally {f.cleanup();}
});

test('a public click without a selection commit fails without dispatching Next',async()=>{
 const f=navigationFixture({neverCommit:true});
 try {
  await assert.rejects(f.enter(),/Selection did not commit/);
  assert.deepEqual(f.state.actions.map(a=>a.selector),[priorSelector]);assert.equal(f.state.commits.length,0);
 } finally {f.cleanup();}
});

test('an already selected target retains the existing no-extra-input behavior',async()=>{
 const f=navigationFixture({initial:target});
 try {await f.enter();assert.equal(f.state.actions.length,0);assert.equal(f.trace.length,0);}
 finally {f.cleanup();}
});


test('delayed hydration is observed before a visible SSR Map receives public input',async()=>{
 const f=navigationFixture({mapRequired:true,hydrated:false,hydrateAfterMs:90});
 try {
  await f.enter();assert.equal(f.state.hydrationWaits,1);
  assert.deepEqual(f.state.actions.map(a=>a.selector),[mapSelector,priorSelector,nextSelector]);
  assert(f.state.actions.every(a=>a.hydrated===true),'no input may be dispatched to unhydrated SSR controls');
  assert(f.trace.every(t=>t.executed&&t.force===false));assert.equal(f.state.current,target);
 } finally {f.cleanup();}
});

test('never-hydrated host times out without dispatching any public input',async()=>{
 const f=navigationFixture({mapRequired:true,hydrated:false});
 try {
  await assert.rejects(f.enter(),/Lesson host hydration timed out/);
  assert.equal(f.state.hydrationWaits,1);assert.equal(f.state.actions.length,0);assert.equal(f.trace.length,0);
  assert.equal(f.state.events.length,0);assert.equal(f.state.waits.length,0);
 } finally {f.cleanup();}
});
