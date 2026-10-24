#!/usr/bin/env node
/** Bind maintained P024 presentation logic to frozen source/native/geometry evidence. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(REPO,'output/alg-l06-p024-presentation-v1');
const MODULE=path.join(REPO,'packages/demos/src/alg-l06-p024-presentation-v1.ts');
const INPUTS=[
 ['nativeReport','output/alg-l06-p024-native-text-v1/text-state-source-v1.json','fe27c245d012df7740daf26fec68a53d84bd1bf8bba55635aa80233699146796'],
 ['nativeModule','packages/demos/src/alg-l06-p024-native-text-v1.ts','7dadb39215bf60fff4c2da497b5ea7803fa0bc50a01a8bae4c3c883da6f29801'],
 ['geometry','output/alg-l06-p024-text-geometry-v1/text-geometry-v1.json','a8a4f89e64b730bf3349b50a11979e08e544ae5503473afd49ce0d1312f67966'],
 ['state','packages/demos/src/alg-l06-p024-state-v1.ts','2b2fd48af888cc26b0778863a2f7426734cf3d19b1bced2399e4a732749941e9']
];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
function stableRead(rel,expected){const p=path.join(REPO,rel);
 assert.equal(fs.realpathSync(p),p,`physical ${rel}`);
 const a=fs.statSync(p,{bigint:true}),b=fs.readFileSync(p),c=fs.statSync(p,{bigint:true});
 for(const k of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])assert.equal(a[k],c[k],`stable ${rel}`);
 assert.equal(a.nlink,1n);assert.equal(sha(b),expected,`SHA ${rel}`);return b;
}
const byId=(rows,id)=>{const item=rows.find(row=>row.instanceId===id);assert(item,`instance ${id}`);return item;};
export function binding(){
 const read=new Map(INPUTS.map(([name,rel,digest])=>[name,stableRead(rel,digest)]));
 const native=JSON.parse(read.get('nativeReport')),geometry=JSON.parse(read.get('geometry'));
 assert.equal(native.source.sha256,geometry.source.sha256);
 assert.equal(geometry.pins.native.sha256,INPUTS[0][2]);
 assert.equal(native.inventory.staticTextDefinitions,40);
 assert.equal(native.inventory.dynamicFields,3);
 assert.deepEqual(native.frameDomains.find(x=>x.id==='sprite-208'),{id:'sprite-208',frames:381});
 assert.deepEqual(geometry.masks.map(x=>[x.frame,x.depth,x.clipDepth]),[[67,11,18],[124,19,24]]);
 assert.equal(geometry.table.firstCompleteGeometryFrame,7);
 assert.equal(geometry.tableParagraph.firstCompleteInkFrame,109);
 assert.equal(geometry.question.firstCompleteInkFrame,142);
 const keys=['Range','Function','Output','Set','Function table'];
 assert.deepEqual(native.glossary.map(g=>g.key),keys);
 const gates=geometry.glossary.map((g,index)=>{
  assert.equal(g.firstSourceReadyFrame,[7,7,7,7,80,109,134][index]);
  const s=g.firstSourceReadySample;assert(s?.sourceReady&&s.overlapRatio>=0.95);
  const label=byId(native.textInstances,s.labelId);
  assert.equal(label.domainId,'sprite-208');
  if(index<5){const n=native.glossary[index];
   assert.equal(n.buttonInstanceId,s.buttonId);assert.equal(n.labelInstanceId,s.labelId);}
  return {key:index<5?keys[index]:index===5?'Function':'Range',context:g.key,
   buttonInstanceId:s.buttonId,labelInstanceId:s.labelId,labelSourceTextId:label.sourceTextId,
   firstFrame:g.firstSourceReadyFrame,readyIntervals:g.sourceReadyIntervals};
 });
 const tableIds=geometry.table.firstCompleteSnapshot.rows.map(r=>{
  const id=`sprite-208/depth-${r.depth}/generation-1`,item=byId(native.textInstances,id);
  assert.equal(item.text,r.text);return id;
 });
 assert.deepEqual(tableIds,[...native.table.headers,
  ...native.table.sourceOrder.map(r=>r.inputInstanceId),
  ...native.table.sourceOrder.map(r=>r.outputInstanceId)]);
 const paragraph=byId(native.textInstances,'sprite-208/depth-13/generation-1');
 const question=byId(native.textInstances,'sprite-208/depth-21/generation-1');
 assert.equal(paragraph.text,geometry.tableParagraph.text);
 assert.equal(question.text,geometry.question.text);
 assert.deepEqual([paragraph.sourceTextId,question.sourceTextId],[37,41]);
 const popup=[['sprite-69','sprite-65',64],['sprite-83','sprite-80',79],['sprite-97','sprite-94',93]]
  .map(([feedbackId,popupId,textId])=>{
   const rows=native.textInstances.filter(x=>x.domainId===popupId&&x.kind==='dynamic-field');
   assert.equal(rows.length,1);assert.equal(rows[0].sourceTextId,textId);
   return {feedbackId,popupId,dynamicInstanceId:rows[0].instanceId,dynamicSourceTextId:textId};
  });
 const answers=native.answers.map((a,index)=>{
  assert.equal(a.label,['A','B','C','D'][index]);
  const label=byId(native.textInstances,a.labelInstanceId),value=byId(native.textInstances,a.valueInstanceId);
  assert(label.answerOption&&value.answerOption);
  return {label:a.label,labelInstanceId:a.labelInstanceId,valueInstanceId:a.valueInstanceId,
   labelSourceTextId:label.sourceTextId,valueSourceTextId:value.sourceTextId};
 });
 return {schemaVersion:1,kind:'alg-l06-p024-presentation-binding-v1',
  source:{swfSha256:native.source.sha256,mainDomain:'sprite-208',mainFrames:381,quizFrame:154},
  pins:Object.fromEntries(INPUTS.map(([name,rel,digest])=>[name,{path:rel,bytes:read.get(name).length,sha256:digest}])),
  sourceLanguage:'en',localePolicy:'source-en-fallback',
  gates,table:{firstFrame:7,instanceIds:tableIds},
  paragraph:{firstFrame:109,instanceId:paragraph.instanceId,sourceTextId:paragraph.sourceTextId},
  question:{firstFrame:142,instanceId:question.instanceId,sourceTextId:question.sourceTextId},
  answers,popup};
}
const START='/* P024_SOURCE_BINDING_START */';
const END='/* P024_SOURCE_BINDING_END */';
function generatedBlock(b){return `${START}\nexport const P024_PRESENTATION_BINDING = ${JSON.stringify(b,null,2)} as const;\n${END}`;}
export function outputs(){const b=binding();return new Map([['presentation-binding-v1.json',json(b)]]);}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];assert(['--build','--check'].includes(mode)&&process.argv.length===3);
 const b=binding(),map=outputs();
 const source=fs.readFileSync(MODULE,'utf8');
 const a=source.indexOf(START),z=source.indexOf(END);
 assert(a>=0&&z>a&&source.indexOf(START,a+1)<0&&source.indexOf(END,z+1)<0,'one source-binding region');
 const updated=source.slice(0,a)+generatedBlock(b)+source.slice(z+END.length);
 if(mode==='--build'){
  fs.mkdirSync(OUT,{recursive:true});for(const [name,data] of map)fs.writeFileSync(path.join(OUT,name),data);
  fs.writeFileSync(MODULE,updated);
 }else{
  assert.equal(source,updated,'maintained module binding drift');
  for(const [name,data] of map)assert(fs.readFileSync(path.join(OUT,name)).equals(data),`evidence drift ${name}`);
 }
 console.log(JSON.stringify({status:mode==='--check'?'verified':'built',
  output:[...map].map(([name,data])=>({name,bytes:data.length,sha256:sha(data)})),
  module:{path:path.relative(REPO,MODULE),sha256:sha(Buffer.from(updated))}}));
}
