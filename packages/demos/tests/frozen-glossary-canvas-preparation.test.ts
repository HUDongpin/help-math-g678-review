import assert from 'node:assert/strict';
import test from 'node:test';
import {prepareFrozenGlossaryCanvas} from '../src/frozen-glossary-canvas-preparation';

let ordinal=0;
function environment(){
 const old=Object.fromEntries(['document','window','location'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const scripts:any[]=[],registry=Object.create(null),id=`shared-alg001-l05-p${String(++ordinal).padStart(3,'0')}`;
 const config={animationId:id,assetSource:`/flash-assets/g678-local/${id}/canvas-renderer.js`,assetSha256:'a'.repeat(64),sourceSwfSha256:'b'.repeat(64)};
 const doc={baseURI:'http://127.0.0.1:3326/en/',querySelectorAll:()=>scripts.filter(s=>s.isConnected),
  createElement:()=>({dataset:{},isConnected:false,onload:null,onerror:null,remove(){this.isConnected=false;}}),
  head:{appendChild(s:any){s.isConnected=true;scripts.push(s);}}};
 Object.defineProperty(globalThis,'document',{configurable:true,value:doc});Object.defineProperty(globalThis,'window',{configurable:true,value:{HELP_MATH_CANVAS_ASSETS:registry}});
 Object.defineProperty(globalThis,'location',{configurable:true,value:{origin:'http://127.0.0.1:3326'}});
 return{config,scripts,registry,register(ready=()=>Promise.resolve(),overrides={}){const value={metadata:{animationId:id,sourceSwfSha256:config.sourceSwfSha256,...overrides},ready,render(){}};Object.defineProperty(registry,id,{value,configurable:false,writable:false});return value;},restore(){for(const[k,v]of Object.entries(old))if(v)Object.defineProperty(globalThis,k,v);else Reflect.deleteProperty(globalThis,k);}};
}
test('module admission awaits real readiness, concurrent calls share the same script, and completed reuse stays ready',async()=>{
 const env=environment();try{
  let release!:()=>void;const ready=new Promise<void>(r=>{release=r;});
  const a=prepareFrozenGlossaryCanvas(env.config),b=prepareFrozenGlossaryCanvas(env.config);assert.equal(a,b);assert.equal(env.scripts.length,1);
  let resolved=false;a.then(()=>{resolved=true;});env.register(()=>ready);env.scripts[0].onload();await new Promise(r=>setImmediate(r));assert.equal(resolved,false);
  release();const receipt=await a;assert.equal(receipt.loaderAwaitedReady,true);assert.equal(receipt.sourceSwfSha256,env.config.sourceSwfSha256);
  assert.equal(await prepareFrozenGlossaryCanvas(env.config),receipt);assert.equal(env.scripts.length,1);
 }finally{env.restore();}
});
test('wrong source registration rejects even after a successful script load',async()=>{
 const env=environment();try{const p=prepareFrozenGlossaryCanvas(env.config);env.register(undefined,{sourceSwfSha256:'c'.repeat(64)});env.scripts[0].onload();await assert.rejects(p,/immutable source identity mismatch/);}finally{env.restore();}
});
test('script identity drift while image readiness is pending rejects admission',async()=>{
 const env=environment();try{let release!:()=>void;const ready=new Promise<void>(r=>{release=r;});const p=prepareFrozenGlossaryCanvas(env.config);env.register(()=>ready);env.scripts[0].onload();await new Promise(r=>setImmediate(r));env.scripts[0].integrity='sha256-wrong';release();await assert.rejects(p,/integrity binding changed/);}finally{env.restore();}
});
test('script loading failure removes its own node and allows a fresh successful retry',async()=>{
 const env=environment();try{const first=prepareFrozenGlossaryCanvas(env.config);env.scripts[0].onerror();await assert.rejects(first,/failed integrity or network/);assert.equal(env.scripts[0].isConnected,false);
 const retry=prepareFrozenGlossaryCanvas(env.config);assert.equal(env.scripts.length,2);env.register();env.scripts[1].onload();await retry;}finally{env.restore();}
});
test('unknown pending script handlers are never replaced',async()=>{
 const env=environment();try{const handler=()=>{};env.scripts.push({isConnected:true,src:`http://127.0.0.1:3326${env.config.assetSource}?sha256=${env.config.assetSha256}`,integrity:'sha256-'+Buffer.from(env.config.assetSha256,'hex').toString('base64'),crossOrigin:'anonymous',dataset:{helpMathCanvasSha256:env.config.assetSha256},onload:handler});
 await assert.rejects(prepareFrozenGlossaryCanvas(env.config),/already pending outside/);assert.equal(env.scripts[0].onload,handler);}finally{env.restore();}
});
test('unbound or external source requests fail before any script is inserted',async()=>{
 const env=environment();try{await assert.rejects(prepareFrozenGlossaryCanvas({...env.config,assetSha256:undefined}),/Exact source/);await assert.rejects(prepareFrozenGlossaryCanvas({...env.config,assetSource:'https://example.org/asset.js'}),/same-origin/);assert.equal(env.scripts.length,0);}finally{env.restore();}
});
