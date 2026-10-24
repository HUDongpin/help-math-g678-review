import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const audit=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const hash=b=>createHash('sha256').update(b).digest('hex');
const source=fs.readFileSync(path.join(audit,'preserved-source-v1.swf'));
assert.equal(hash(source),'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const c=collectSwfTextSourceCatalog(source),timelines=new Map(c.timelines.map(t=>[t.timelineId,t]));
const buttons=new Map(c.buttonDefinitions.map(b=>[b.characterId,b]));
const receipt=JSON.parse(fs.readFileSync(path.join(audit,'ffdec-export-v1.json')));
const xml=path.join(receipt.output,'source.xml'),pin=receipt.files.find(p=>p.path===xml);
assert.ok(pin);assert.equal(hash(fs.readFileSync(xml)),pin.sha256);
const ruby=spawnSync('ruby',['-rrexml/document','-rjson','-e',
 'd=REXML::Document.new(File.read(ARGV[0])); s=REXML::XPath.first(d,%q{//item[@shapeId="7"]}); b=s.elements["shapeBounds"]; puts JSON.generate({bounds: %w[Xmin Ymin Xmax Ymax].map{|k|Integer(b.attributes[k])},lineWidths: REXML::XPath.match(s,%q{.//item[@type="LINESTYLE"]}).map{|x|Integer(x.attributes["width"])}})',xml],{encoding:'utf8'});
assert.equal(ruby.status,0,ruby.stderr);const shape=JSON.parse(ruby.stdout);
assert.deepEqual(shape,{bounds:[-230,-250,230,250],lineWidths:[1]});
const targetBounds=new Map([[7,[-250,-270,250,270]]]); // conservative 1px padding beyond authored bounds
for(const id of [346,348]){const b=c.textDefinitions.find(t=>t.characterId===id).boundsTwips;
 targetBounds.set(id,[b.left-20,b.top-20,b.right+20,b.bottom+20]);}
const identity=[1,0,0,1,0,0];
const compose=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
function states(t){const state=new Map(),unique=new Map();for(let frame=1;frame<=t.declaredFrameCount;frame++){
 for(const e of t.events.filter(e=>e.frame===frame)){
  if(e.kind==='remove')state.delete(e.depth);
  if(e.kind==='place'){const old=e.move?state.get(e.depth):{matrix:identity};assert.ok(old);
   state.set(e.depth,{...old,...e,matrix:e.matrix??old.matrix});}
 }
 const placements=[...state.values()].map(p=>({characterId:p.characterId,matrix:p.matrix,depth:p.depth}));
 const key=JSON.stringify(placements);if(!unique.has(key))unique.set(key,{frame,placements});
}return [...unique.values()];}
const snapshots=new Map([...timelines].map(([id,t])=>[id,states(t)]));
const results=new Map();
function visit(id,matrix,route,ancestors){
 if(targetBounds.has(id)){
  const [l,t,r,b]=targetBounds.get(id),points=[[l,t],[r,t],[l,b],[r,b]].map(([x,y])=>[(matrix[0]*x+matrix[2]*y+matrix[4])/20,(matrix[1]*x+matrix[3]*y+matrix[5])/20]);
  const bounds={left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
  const row={characterId:id,route,stageMatrixTwips:matrix,paddedStageBoundsPx:bounds,outsideStage:bounds.right<0||bounds.left>800||bounds.bottom<0||bounds.top>600};
  results.set(JSON.stringify([id,route,matrix]),row);return;
 }
 const key=typeof id==='string'?id:`sprite-${id}`;
 if(ancestors.includes(key))throw Error('P052_RECURSIVE_TIMELINE');
 if(snapshots.has(key))for(const snapshot of snapshots.get(key))for(const p of snapshot.placements)
  visit(p.characterId,compose(matrix,p.matrix),[...route,`${key}/depth-${p.depth}`],[...ancestors,key]);
 if(buttons.has(id))for(const p of buttons.get(id).statePlacements)
  visit(p.characterId,compose(matrix,p.matrix??identity),[...route,`button-${id}/record-${p.recordIndex}`],ancestors);
}
visit('root',identity,[],[]);
const rows=[...results.values()];assert.equal(rows.length,13);assert.ok(rows.every(r=>r.outsideStage));
assert.equal(rows.filter(r=>r.characterId===7).length,11);
const report={schemaVersion:1,sourceSha256:hash(source),sourceXmlSha256:pin.sha256,stage:[800,600],shape7:shape,rows,
 finding:'All thirteen structurally root-reachable placements of shape7 and coach labels are outside the authored stage, with conservative padding. Includes five direct button-state shape7 placements as well as six click children and two coach labels.',
 boundary:'Static source transforms across all distinct timeline display states and button records only; not original-runtime observation or strict disposition. Script-driven relocation, clipping and host changes are not simulated.',
 implementationDecision:'Do not draw these offstage authoring markers in the modern teaching stage. Retain their source/audio identity and validate actual cue playback separately.'};
const out=path.join(audit,'audio-visual-placement-v1.json'),bytes=JSON.stringify(report,null,2)+'\n';
if(fs.existsSync(out))assert.equal(fs.readFileSync(out,'utf8'),bytes);else if(process.argv.includes('--check'))throw Error('Missing placement audit');else fs.writeFileSync(out,bytes,{flag:'wx'});
console.log(JSON.stringify({status:'PASS',placements:rows.length,allOutsideStage:true,maxRightPx:Math.max(...rows.map(r=>r.paddedStageBoundsPx.right)),sha256:hash(bytes)}));
