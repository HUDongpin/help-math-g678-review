#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeFileSync,readFileSync} from 'node:fs';
import {readOrdinary,sha256} from '../lib/g678-admission-proof.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const SHA='514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e';
const AUDIT='migrations/shared-alg001-l06-p004/audit/source-text-v1.json';
const AUDIT_SHA='c6f15d46da49019e359a44f407cb0577f7cfb6a7a0c1b68ab06d43084aa3adc6';
const OUTPUT='migrations/shared-alg001-l06-p004/audit/equation-geometry-v1.json';
export function auditP004Equation(swf=readOrdinary(SOURCE_ROOT,SOURCE),auditBytes=readOrdinary(ROOT,AUDIT)){
 assert.equal(sha256(swf),SHA,'exact source SWF');assert.equal(sha256(auditBytes),AUDIT_SHA,'exact source catalog bytes');
 const catalog=collectSwfTextSourceCatalog(swf);assert.deepEqual(catalog,JSON.parse(auditBytes),'independent source decode');
 const main=catalog.timelines.find(t=>t.timelineId==='sprite-95');
 const objects=[52,39].map(id=>{
  const definition=catalog.textDefinitions.find(d=>d.characterId===id);
  const instances=main.instances.filter(i=>i.characterId===id&&i.firstFrame===93&&i.lastFrameExclusive===832);
  assert.equal(instances.length,1);const instance=instances[0];assert.equal(instance.updates.length,1,'no later geometry updates');
  const event=main.events.find(e=>e.eventId===instance.createdByEventId);
  assert.deepEqual(definition.matrix,[1,0,0,1,0,0]);assert.deepEqual(event.matrix.slice(0,4),[1,0,0,1]);
  assert.equal(definition.runs.length,1);const run=definition.runs[0];let x=run.xOffsetTwips??0;
  const glyphs=run.glyphs.map((glyph,index)=>{
   assert.equal(glyph.status,'embedded-unicode-code-table');const localStart=x;x+=glyph.advanceTwips;
   return {index,character:glyph.unicode,code:glyph.code,advanceTwips:glyph.advanceTwips,localStartTwips:localStart,
    mainStartTwips:localStart+event.matrix[4],mainEndTwips:x+event.matrix[4],mainBaselineTwips:run.yOffsetTwips+event.matrix[5],
    rootStartPixels:(localStart+event.matrix[4]+7390)/20,rootBaselinePixels:(run.yOffsetTwips+event.matrix[5]+5060)/20};
  });
  const font=catalog.fonts.find(f=>f.characterId===run.fontId&&f.tagName==='DefineFont2');
  return {characterId:id,instanceId:instance.instanceId,sourceTextId:run.sourceTextId,range:[93,831],text:run.text,
   textMatrix:definition.matrix,placementMatrix:event.matrix,declaredTextBoundsTwips:definition.boundsTwips,
   sourceTagSha256:definition.sourceTagSha256,placementTagSha256:event.sourceTagSha256,
   font:{characterId:run.fontId,name:font.name.text,fontHeightTwips:run.fontHeightTwips,sourceTagSha256:font.sourceTagSha256},glyphs};
 });
 const [formula,operator]=objects;assert.equal(formula.text,'M = $0.50   C');assert.equal(operator.text,'x');
 const gap=formula.glyphs.slice(9,12);assert(gap.every(g=>g.character===' '));
 const start=gap[0].mainStartTwips,end=gap.at(-1).mainEndTwips,x=operator.glyphs[0];
 const fits=x.mainStartTwips>=start&&x.mainEndTwips<=end;
 const baselineDifferenceTwips=x.mainBaselineTwips-formula.glyphs[0].mainBaselineTwips;
 const compatible=Math.abs(baselineDifferenceTwips)<=Math.min(formula.font.fontHeightTwips,operator.font.fontHeightTwips)*0.1;
 assert(fits&&compatible,'operator advance interval and baseline must fit the source gap');
 return {schemaVersion:1,kind:'alg-l06-p004-equation-geometry-v1',sourcePins:[
  {root:SOURCE_ROOT,path:SOURCE,bytes:swf.length,sha256:SHA},{path:AUDIT,bytes:auditBytes.length,sha256:AUDIT_SHA}],
  frameDomain:'sprite-95',rootPlacementTwips:[7390,5060],objects,
  geometry:{gapGlyphIndices:[9,10,11],gapMainTwips:[start,end],operatorAdvanceMainTwips:[x.mainStartTwips,x.mainEndTwips],
   operatorAdvanceContainedInGap:fits,baselineDifferenceTwips,baselineDifferencePixels:baselineDifferenceTwips/20,
   baselineCompatibilityCriterion:'absolute difference <=10% of smaller source font height; explicit engineering tolerance, not original-runtime authority',
   baselineCompatible:compatible,qualification:'glyph origin/advance geometry, not exact glyph ink bounds; declared text bounds retained separately'},
  semanticDecision:{status:'source-geometry-supported-modern-interpretation',semanticMath:'M = $0.50 × C',range:[93,831],
   reason:'Source glyph x occupies only the three-space gap between scalar $0.50 and variable C with compatible baselines; replacement uses mathematical multiplication sign for accessible meaning. This is an explicit semantic interpretation, not a claim that source Unicode was ×.',
   sourceCharacter:'x',sourceUnicode:120,modernUnicode:215,scope:'only these two exact unchanged instances; later cloned/tweened equation instances are not inferred from this decision'},
  initialFrames:{range:[1,92],status:'unresolved-decomposed-symbol-teaching-animation',semanticMath:null},
  visibilityBoundary:'source membership and placement geometry; alpha/masks/occlusion/pixel visibility not established',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===3&&['--generate','--check'].includes(process.argv[2]));const text=JSON.stringify(auditP004Equation(),null,2)+'\n';
 if(process.argv[2]==='--check')assert.equal(readFileSync(path.join(ROOT,OUTPUT),'utf8'),text);
 else writeFileSync(path.join(ROOT,OUTPUT),text,{flag:'wx'});
 console.log(JSON.stringify({path:OUTPUT,bytes:Buffer.byteLength(text),sha256:sha256(text)}));
}
