/** Complete structural mask inventory, with bounded native-text dispositions. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(path.resolve(root,p));
const pin=p=>({path:p,bytes:read(p).length,sha256:hash(read(p))});
const raw=read(source);assert.equal(hash(raw),'514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e');
const catalog=collectSwfTextSourceCatalog(raw);
assert.deepEqual(catalog,JSON.parse(read('migrations/shared-alg001-l06-p004/audit/source-text-v1.json')));
assert.equal(catalog.unparsedTags.length,0);
const timeline=catalog.timelines.find(t=>t.timelineId==='sprite-95');
const flags=['hasFilterList','hasBlendMode','hasVisible','hasOpaqueBackground','hasClipActions'];
const flagCounts=Object.fromEntries(flags.map(flag=>[flag,catalog.timelines.flatMap(t=>t.events).filter(e=>e.flags?.[flag]).length]));
assert(Object.values(flagCounts).every(n=>n===0));
const placements=catalog.timelines.flatMap(t=>t.events.filter(e=>e.clipDepth!==undefined));
assert.deepEqual(placements.map(e=>[e.frame,e.depth,e.clipDepth,e.characterId]),[
 [1,1,118,1],[1,70,73,22],[1,75,78,22],[508,82,91,76],[614,92,103,76],
]);
const nativeDisposition={
 1:'Scene viewport clipping remains in original Canvas. Native lesson text reflows outside fixed geometry; this is not original pixel clipping equivalence.',
 70:'Lemonade price sign clips only its static source text24/25. Native semantic pair gives the complete source price from frame1; no answer or progressive reveal is introduced.',
 75:'Orange juice price sign clips only static source text27/28. Native semantic pair gives the complete source price from frame1; no answer or progressive reveal is introduced.',
 82:'Progressive sentence78 remains in source Canvas; native complete sentence is withheld until final source mask update611.',
 92:'Progressive sentence83 remains in source Canvas; native complete sentence is withheld until final source mask update684.',
};
const rows=placements.map(event=>{
 const instance=timeline.instances.find(i=>i.instanceId===event.instanceId);
 const updates=instance.updates.map(id=>timeline.events.find(e=>e.eventId===id));
 assert(updates.every(Boolean));
 if(event.depth<=75)assert.equal(updates.length,1,'scene/price mask has no progressive updates');
 if(event.depth===82)assert.deepEqual([updates.at(-1).frame,updates.at(-1).matrix[0]],[611,1]);
 if(event.depth===92)assert.deepEqual([updates.at(-1).frame,updates.at(-1).matrix[0]],[684,0.8452606201171875]);
 const maskedText=timeline.instances.filter(i=>i.depth>event.depth&&i.depth<=event.clipDepth&&
  i.firstFrame<instance.lastFrameExclusive&&i.lastFrameExclusive>instance.firstFrame&&
  catalog.textDefinitions.some(d=>d.characterId===i.characterId));
 if(event.depth===70)assert.deepEqual(maskedText.map(i=>i.characterId),[24,25]);
 if(event.depth===75)assert.deepEqual(maskedText.map(i=>i.characterId),[27,28]);
 return {instanceId:instance.instanceId,characterId:event.characterId,firstFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive,
  depth:event.depth,clipDepth:event.clipDepth,placementTagSha256:event.sourceTagSha256,
  updateCount:updates.length,lastUpdate:{frame:updates.at(-1).frame,sourceTagSha256:updates.at(-1).sourceTagSha256},
  maskedTextInstanceIds:maskedText.map(i=>i.instanceId),nativeDisposition:nativeDisposition[event.depth]};
});
const result={schemaVersion:1,kind:'p004-mask-native-disposition-v1',source:pin(source),
 claimBoundary:'Complete parsed structural inventory for this SWF and explicit native readable-text decisions; no original Flash execution, pixel parity or acceptance.',
 flags:flagCounts,maskCount:rows.length,masks:rows,
 evidence:['migrations/shared-alg001-l06-p004/audit/source-text-v1.json','migrations/shared-alg001-l06-p004/audit/semantic-pairs-v1.json',
 'output/alg-l06-p004-composed-text-v1/visual-review-v1.json','packages/demos/src/alg-l06-p004-semantic-text-v1.ts',
 'packages/demos/src/alg-l06-p004-semantic-text-v1.test.ts','packages/demos/src/alg-l06-p004-semantic-pairs-v1.ts',
 'scripts/audit-alg-l06-p004-mask-disposition-v1.mjs'].map(pin),
 interpretation:'The generic source risk name includes filters/blends, but this exact parsed source has none of the corresponding placement flags. All five actual masks are classified above.',
 fullTypographyPass:false,acceptanceEffect:'none'};
const output='output/alg-l06-p004-mask-disposition-v1.json';
const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');
assert(['--write','--check'].includes(process.argv[2])&&process.argv.length===3);
if(process.argv[2]==='--write'&&!fs.existsSync(path.join(root,output)))fs.writeFileSync(path.join(root,output),bytes,{flag:'wx'});
assert.deepEqual(read(output),bytes,'exact current mask disposition');
console.log(JSON.stringify({status:'bounded-source-mask-disposition-current',maskCount:5,flags:flagCounts,output:pin(output)}));
