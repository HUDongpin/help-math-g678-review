import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(path.join(dir,'source-text-catalog-v1.json')),j=JSON.parse(bytes);
assert.equal(j.sourceSha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const timelines=new Map(j.timelines.map(t=>[t.timelineId,t]));
const text=new Map(j.textDefinitions.map(t=>[t.characterId,t]));
const buttons=new Map(j.buttonDefinitions.map(t=>[t.characterId,t]));
const main=timelines.get('sprite-350');assert.equal(main.declaredFrameCount,156);
const stateFields=['characterId','matrix','colorTransform','ratio','name','clipDepth','blendMode','filters','visible','instanceId'];
function snapshots(t){
 const depths=new Map(),frames=[];
 for(let frame=1;frame<=t.declaredFrameCount;frame++){
  for(const e of t.events.filter(e=>e.frame===frame)){
   if(e.kind==='remove')depths.delete(e.depth);
   if(e.kind==='place'){
    if(e.move)assert.ok(depths.has(e.depth),`${t.timelineId}:${frame}:${e.depth} orphan move`);
    const row=e.move?{...depths.get(e.depth)}:{depth:e.depth,matrix:[1,0,0,1,0,0],colorTransform:{multiply:[256,256,256,256],add:[0,0,0,0],divisor:256}};
    for(const k of stateFields)if(e[k]!==undefined)row[k]=e[k];
    assert.ok(Number.isInteger(row.characterId));depths.set(e.depth,row);
   }
  }
  frames.push({frame,placements:[...depths.values()].sort((a,b)=>a.depth-b.depth)});
 }
 return frames;
}
const frames=snapshots(main),digitChanges=[];let previous=null;
for(const {frame,placements}of frames.filter(f=>f.frame<115)){
 const digits=placements.filter(p=>text.get(p.characterId)?.kind==='dynamic-field').sort((a,b)=>a.matrix[4]-b.matrix[4]);
 const value=digits.map(p=>text.get(p.characterId).initialText?.text??'').join('');
 if(value!==previous){digitChanges.push({frame,text:value,characterIds:digits.map(p=>p.characterId)});previous=value;}
}
assert.equal(digitChanges.find(x=>x.frame===32).text,'001');
assert.equal(digitChanges.find(x=>x.frame===47).text,'016');
assert.equal(digitChanges.find(x=>x.frame===77).text,'000');
const removedAt116=main.events.filter(e=>e.frame===116&&e.kind==='remove').map(e=>e.depth);
assert.deepEqual(removedAt116,[23,27,32,39,50,61]);
assert.deepEqual(frames[115].placements,frames[155].placements,'Source display list must be stable across outro116-156');
const reachable=new Set(),visitedButtons=new Set();
function visitCharacter(id){
 if(timelines.has(`sprite-${id}`))visitTimeline(`sprite-${id}`);
 if(buttons.has(id)&&!visitedButtons.has(id)){visitedButtons.add(id);for(const p of buttons.get(id).statePlacements)visitCharacter(p.characterId);}
}
function visitTimeline(id){if(reachable.has(id))return;reachable.add(id);for(const e of timelines.get(id).events)if(e.kind==='place'&&e.characterId!==undefined)visitCharacter(e.characterId);}
visitTimeline('root');
const domains=j.timelines.map(t=>({id:t.timelineId,frames:t.declaredFrameCount,structurallyRootReachable:reachable.has(t.timelineId),
 actions:t.events.filter(e=>e.kind==='action-bytes').map(e=>({frame:e.frame,tagSha256:e.sourceTagSha256})),
 labels:t.events.filter(e=>e.kind==='frame-label').map(e=>({frame:e.frame,label:e.label.text})),
 disposition:reachable.has(t.timelineId)?'structurally-reachable-runtime-visibility-pending':'unplaced-library-not-a-runtime-exclusion-proof'}));
const named=main.events.filter(e=>e.kind==='place'&&e.name).map(e=>({frame:e.frame,characterId:e.characterId,name:e.name.text,matrix:e.matrix,sourceTagSha256:e.sourceTagSha256}));
const common={schemaVersion:1,animationId:'shared-nms002-l02-p052',sourceSha256:j.sourceSha256,catalogSha256:sha(bytes),
 claim:'Static display-list/tag evidence only. ActionScript visibility, dynamic duplicate cells, child playheads and runtime acceptance are not simulated.'};
const outputs={
 'source-display-list-v1.json':{...common,domain:'sprite-350',frames},
 'source-visual-audit-v1.json':{...common,digitChanges,named,removedAt116,outro:{frames:[116,156],staticDisplayListUnchanged:true,digits:'Retain runtime exercise values; initial-text zero is not a post-answer runtime observation.',grid:'Dynamic duplicated cells are outside the static display list; do not discard them at116.'},fonts:j.fonts.map(f=>({characterId:f.characterId,name:f.name.text})),
  intro:'Author-authored digits rise001 to016 at32-47, hold through61, descend015 to000 at62-77. Do not substitute a75-percent answer demo.'},
 'source-domain-reachability-v1.json':{...common,domains,structurallyReachableCount:reachable.size,total:domains.length}
};
for(const [name,obj]of Object.entries(outputs)){
 const file=path.join(dir,name),data=JSON.stringify(obj,null,2)+'\n';
 if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8'),data);else if(process.argv.includes('--check'))throw Error(`Missing ${file}`);else fs.writeFileSync(file,data,{flag:'wx'});
}
console.log(JSON.stringify({status:'PASS',mainFrames:frames.length,digitChanges:digitChanges.length,domains:domains.length,structurallyReachable:reachable.size,removedAt116,outroStatic:true,acceptance:false}));
