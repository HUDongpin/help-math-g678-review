import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {collectSwfTextSourceCatalog} from '../../../scripts/lib/swf-text-source-catalog.mjs';
const B='migrations/shared-alg001-l07-p006',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(p),src=read(B+'/source-v1/L7RW06.swf');
assert.equal(sha(src),'72c7f3e0d0fd0a5251214c3511262bf164d983837a5c52e9f1e56d4de96df155');
const catalog=collectSwfTextSourceCatalog(src);assert.deepEqual(catalog,JSON.parse(read(B+'/source-v1/source-text-catalog-v1.json')));
const main=catalog.timelines.find(t=>t.timelineId==='sprite-223'),root=catalog.timelines.find(t=>t.timelineId==='root');
assert.equal(main.declaredFrameCount,1845);assert.equal(main.events.filter(e=>e.kind==='action-bytes').length,0);
const rootPoses=root.events.filter(e=>e.kind==='place');assert.deepEqual(rootPoses.map(e=>[e.frame,e.depth,e.characterId]),[[6,1,223],[6,110,226],[6,113,227]]);
const events=new Map();for(const event of main.events){if(!events.has(event.frame))events.set(event.frame,[]);events.get(event.frame).push(event);}
const live=new Map(),frames=[];
for(let frame=1;frame<=1845;frame++){
 for(const e of events.get(frame)??[]){if(e.kind==='remove'){assert(live.has(e.depth));live.delete(e.depth);}
 else if(e.kind==='place'){const pose=e.move?{...live.get(e.depth)}:{matrix:[1,0,0,1,0,0],depth:e.depth};
  for(const key of ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId'])if(key in e)pose[key]=e[key];assert(pose.characterId);live.set(e.depth,pose);}}
 frames.push([...live.values()].map(x=>({...x})));
}
const ranges=id=>{const output=[];for(let index=0;index<frames.length;index++)if(frames[index].some(p=>p.characterId===id&&(!p.colorTransform||p.colorTransform.multiply?.[3]!==0))){const frame=index+1;if(output.at(-1)?.[1]===frame-1)output.at(-1)[1]=frame;else output.push([frame,frame]);}return output;};
const buttons=[{characterId:220,key:'Linear function'},{characterId:221,key:'Nonlinear function'}].map(b=>({...b,frameRanges:ranges(b.characterId)}));
for(const b of buttons){const script=read(`${B}/source-v1/ffdec/scripts/DefineButton2_${b.characterId}/BUTTONCONDACTION on(release).as`).toString();
 assert(script.includes(`_global.KeyAttribute = "${b.key}"`)&&script.includes('_root.DoHyperLinks();')&&script.includes('_root.animation_mc.animation.stop();'));b.scriptSha256=sha(script);}
const texts=catalog.textDefinitions.map(t=>({characterId:t.characterId,sourceTextId:t.sourceTextId,sourceTagSha256:t.sourceTagSha256,boundsTwips:t.boundsTwips,text:t.runs.map(r=>r.text).join(''),frameRanges:ranges(t.characterId)}));
const masks=main.events.filter(e=>e.kind==='place'&&e.clipDepth).map(e=>({characterId:e.characterId,frame:e.frame,depth:e.depth,clipDepth:e.clipDepth,matrix:e.matrix}));
assert.deepEqual(masks.map(m=>[m.characterId,m.frame,m.depth,m.clipDepth]),[[1,1,1,108],[216,1760,81,88],[222,1836,81,88]]);
const model={schemaVersion:1,animationId:'shared-alg001-l07-p006',source:{path:'G6-G8-shared/ALG001/L7/RW/L7RW06.swf',bytes:src.length,sha256:sha(src)},
 xml:{bytes:read(B+'/source-v1/index.xml').length,sha256:sha(read(B+'/source-v1/index.xml'))},stage:{width:800,height:600,backgroundColor:'#b8d8f7'},fps:12,rootFrameCount:10,rootEntryFrame:6,
 frameDomain:'sprite-223',frameCount:1845,rootPlacements:rootPoses,texts,glossaryButtons:buttons,masks,frames,
 behavior:{scenario:'cell-phone-service-monthly-bill',sourceTerminal:'no-child-stop; ordinary sprite wrap after1845',playbackMode:'loop',sourceRootHost:'InternalPreloader.jump_check',glossaryRelease:'set-KeyAttribute-call-DoHyperLinks-stop-animation',replay:'modern complete reset; original host parity unverified',sourceHasInputExercise:false,sourceHasRandom:false},
 sourceCatalogContentSha256:sha(JSON.stringify(catalog)),independentPending:['authoritative-original-runtime','fidelity','listening','human-review','Owner','strict-completion','publication']};
const output=JSON.stringify(model,null,2)+'\n',dest=B+'/native-v1/source-model-v1.json';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(dest,'utf8'),output);else fs.writeFileSync(dest,output,{flag:'wx'});
console.log(JSON.stringify({pass:true,bytes:Buffer.byteLength(output),texts:texts.map(t=>({id:t.characterId,text:t.text,ranges:t.frameRanges})),buttons,masks,playbackMode:model.behavior.playbackMode}));
