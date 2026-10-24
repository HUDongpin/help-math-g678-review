#!/usr/bin/env node
/** Reproducible engineering disposition of P004's five source-catalog text risks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const TARGET='migrations/shared-alg001-l06-p004/audit/text-risks-v4.json';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const CATALOG='migrations/shared-alg001-l06-p004/audit/source-text-v1.json';
const PRIOR='migrations/shared-alg001-l06-p004/audit/text-risks-v3.json';
const CENSUS='output/alg-l06-p004-shape-census-v1/census-v1.json';
const ROLES='output/alg-l06-p004-source-role-review-v1.json';
const BITMAP='output/alg-l06-p004-bitmap-role-review-v1.md';
const OUTLINE='output/alg-l06-p004-outline-emphasis-disposition-v1.md';
const MASK='output/alg-l06-p004-mask-disposition-v1.json';
const BEHAVIOR='output/alg-l06-p004-behavior-text-risk-disposition-v1.md';
const DECISION='output/alg-l06-p004-substitution-implementation-v1/decision.json';
const ROOT_VERIFICATION='output/alg-l06-p004-substitution-implementation-v1/root-verification.json';
const CAPTURE='output/alg-l06-p004-substitution-capture-v1/receipt.json';
const RISK_KINDS=[
 'shape-text-unclassified',
 'bitmap-text-unclassified',
 'button-runtime-state-and-actions-not-interpreted',
 'actionscript-visibility-and-values-not-interpreted',
 'mask-filter-blend-semantics-unresolved',
];
const EXPECTED_SOURCE_SHA='514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function absolute(file){return path.isAbsolute(file)?file:path.join(ROOT,file);}
function pin(file){
 const full=absolute(file);
 assert.equal(fs.realpathSync(full),full,`physical evidence ${file}`);
 const before=fs.lstatSync(full,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary evidence ${file}`);
 const bytes=fs.readFileSync(full),after=fs.lstatSync(full,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])
  assert.equal(before[key],after[key],`stable evidence ${file}:${key}`);
 return {path:file,bytes:bytes.length,sha256:sha(bytes)};
}
const json=file=>JSON.parse(fs.readFileSync(absolute(file),'utf8'));
const text=file=>fs.readFileSync(absolute(file),'utf8');
function verifyPins(rows){for(const row of rows)assert.deepEqual(pin(row.path),row,`evidence drift ${row.path}`);}
function build(){
 const source=pin(SOURCE),catalogPin=pin(CATALOG),priorPin=pin(PRIOR);
 assert.equal(source.sha256,EXPECTED_SOURCE_SHA);
 const catalog=json(CATALOG),prior=json(PRIOR),census=json(CENSUS),roles=json(ROLES);
 const mask=json(MASK),decision=json(DECISION),verification=json(ROOT_VERIFICATION),capture=json(CAPTURE);
 assert.equal(catalog.sourceSha256,source.sha256);
 assert.equal(catalog.kind,'swf-text-source-catalog-v1');
 assert.deepEqual(catalog.risks.map(row=>row.kind),RISK_KINDS,'exact five source risk kinds');
 assert.deepEqual(catalog.summary,{fontRecords:10,textDefinitions:28,staticTextDefinitions:28,
  dynamicFields:0,textRuns:42,decodedRuns:42,unresolvedRuns:0,timelines:3,
  placementInstances:539,placementEvents:837,buttonDefinitions:8,
  buttonStatePlacements:8,shapeDefinitions:49,bitmapDefinitions:7,unparsedTags:0});
 assert.equal(prior.kind,'alg-l06-p004-text-risk-inventory-v3');
 assert.equal(prior.sourceCatalog.sha256,catalogPin.sha256);
 assert.equal(census.kind,'alg-l06-p004-source-shape-census-v1');
 assert.equal(census.definitionCount,49);assert.equal(census.rows.length,49);
 assert.equal(census.isolatedCaptures.length,49);
 assert.deepEqual(census.errors,[]);assert.deepEqual(census.requests,[]);
 assert.equal(roles.kind,'p004-root-source-role-review-v1');
 assert.equal(roles.shapeRows.length,49);
 const definitions=new Map(catalog.shapeDefinitions.map(row=>[row.characterId,row.sourceTagSha256]));
 assert.equal(definitions.size,49);
 for(const set of [census.rows,roles.shapeRows]){
  assert.deepEqual(new Set(set.map(row=>row.characterId)),new Set(definitions.keys()));
  for(const row of set)assert.equal(row.sourceTagSha256,definitions.get(row.characterId));
 }
 verifyPins(census.sourcePins);
 for(const item of roles.evidence.filter(row=>[CENSUS,BITMAP].includes(row.path)))
  assert.deepEqual(pin(item.path),item,'current source-role evidence');
 const roleById=new Map(roles.shapeRows.map(row=>[row.characterId,row]));
 for(const id of [49,50])assert.equal(roleById.get(id).role,'outlined-rule');
 assert.equal(roleById.get(67).role,'outlined-substitution-transition');
 assert.equal(roleById.get(97).role,'outlined-auxiliary-title');
 for(const id of [69,70,71,72,73,74,75])
  assert.equal(roleById.get(id).role,'outlined-worked-emphasis');
 for(const id of [87,88,89,90,91,92,94])
  assert.equal(roleById.get(id).role,'outlined-rule-emphasis');
 const outline=text(OUTLINE),bitmap=text(BITMAP),behavior=text(BEHAVIOR);
 for(const id of [69,70,71,72,73,74,75,87,88,89,90,91,92,94])
  assert(outline.includes(`| ${id} |`),`outline source anchor ${id}`);
 assert(outline.includes('frame 367')&&outline.includes('Canvas'));
 assert(bitmap.includes('AI engineering observation')&&bitmap.includes('BROWN BEAR CAFE'));
 for(const id of [2,3,11,12,13,14,15])assert(bitmap.includes(`| ${id} |`));
 assert(behavior.includes('`output`')&&behavior.includes('49 个 shape')&&behavior.includes('7 个 bitmap'));
 assert.equal(mask.kind,'p004-mask-native-disposition-v1');
 assert.equal(mask.source.sha256,source.sha256);
 assert.equal(mask.maskCount,5);assert.equal(mask.masks.length,5);
 assert.deepEqual(new Set(mask.masks.map(row=>row.instanceId)),new Set([
  'sprite-95/depth-1/generation-1','sprite-95/depth-70/generation-1',
  'sprite-95/depth-75/generation-1','sprite-95/depth-82/generation-6',
  'sprite-95/depth-92/generation-1']));
 assert(Object.values(mask.flags).every(value=>value===0),'no parsed filter/blend/visibility placement flags');
 assert.deepEqual(mask.masks.filter(row=>row.characterId===76).map(row=>row.lastUpdate.frame),[611,684]);
 verifyPins(mask.evidence);
 assert.equal(decision.kind,'p004-substitution-boundary-decision-v1');
 assert.equal(decision.sourceSwfSha256,source.sha256);
 assert.deepEqual(pin(decision.capture),{path:decision.capture,bytes:pin(CAPTURE).bytes,
  sha256:decision.captureSha256});
 assert.deepEqual(capture.frames.map(row=>row.frame),[306,307,310,313,314,315]);
 verifyPins(capture.frames.map(row=>row.image));
 assert(decision.decision.includes('shape67 at314')&&decision.decision.includes('Answer stays367'));
 assert.equal(verification.status,'source-confirmed-substitution-boundary-implemented');
 assert.equal(verification.binding,'alg-l06-p004-substitution-v5');
 assert.equal(verification.P004Registered,false);assert.equal(verification.acceptanceEffect,'none');
 assert.equal(verification.tests.scopedTypeScript,'pass');
 verifyPins(verification.evidence);
 const oldActions=prior.rows.find(row=>row.id==='actionscript-visibility-values');
 const oldButtons=prior.rows.find(row=>row.id==='buttons-and-hit-only-states');
 assert.equal(oldActions.evidence.length,3);
 assert.equal(oldButtons.evidence.buttons.length,8);
 assert.equal(oldButtons.evidence.hitRegionCount,9);
 const evidence={source,catalog:catalogPin,predecessor:priorPin,shapeCensus:pin(CENSUS),
  shapeRoleReview:pin(ROLES),bitmapRoleReview:pin(BITMAP),outlineEmphasis:pin(OUTLINE),
  maskDisposition:pin(MASK),behaviorTextRisk:pin(BEHAVIOR),substitutionDecision:pin(DECISION),
  substitutionVerification:pin(ROOT_VERIFICATION),substitutionCapture:pin(CAPTURE),
  semanticText:pin('packages/demos/src/alg-l06-p004-semantic-text-v1.ts'),
  equationPresentation:pin('packages/demos/src/alg-l06-p004-equation-presentation-v1.ts'),
  nativeText:pin('packages/demos/src/alg-l06-p004-native-text-v1.tsx'),
  retainedCanvasModule:pin('packages/demos/src/modules/shared-alg001-l06-p004.tsx'),
  hostRuntime:pin('apps/web/components/g678-alg-l06-p004-runtime-v1.tsx'),
  typographyChecker:pin('scripts/check-g678-lesson-typography-v1.mjs')};
 return {schemaVersion:1,kind:'alg-l06-p004-text-risk-disposition-v4',
  animationId:'shared-alg001-l06-p004',status:'five-source-risk-kinds-assessed-for-modern-native-reading',
  claimBoundary:'Bounded AI engineering source-role and modern native-readable-text disposition with original Canvas retained. This is not an original Flash run, pixel fidelity, listening, named-human review, formal typography pass, admission, or release.',
  sourceRisks:catalog.risks,evidence,
  presentationPolicy:{sourceCanvas:'retained and unsuppressed',nativeCompanion:'source-bound semantic reading from the same frame',
   textSuppression:'none',scope:'modern readable teaching text and student-facing source actions'},
  rows:[
   {kind:RISK_KINDS[0],sourceFacts:{shapeDefinitions:49,classifications:roles.shapeRows.length,
    outlinedRule:[49,50],substitutionShape:67,workedEmphasis:[69,70,71,72,73,74,75],
    ruleEmphasis:[87,88,89,90,91,92,94],auxiliaryTitleOutline:97},
    engineeringDisposition:'All 49 shapes have bounded source-role classifications. Rule and worked values are readable in native semantic rows; complete substitution starts at source frame 314, hands to DefineText at 315, and the result waits until 367. Source Canvas retains the outline emphasis and auxiliary title outline.',
    limits:['The emphasis shapes do not all appear as sourceShapeIds on native rows; Canvas preserves their visual emphasis.','The sampled safe-Canvas frames do not prove every original Flash pixel or attention cue.']},
   {kind:RISK_KINDS[1],sourceFacts:{bitmapDefinitions:7,incidentalSignageBitmap:3,
    sceneObjectBitmapIds:[2,11,12,13,14,15]},
    engineeringDisposition:'Seven image exports have bounded engineering roles. Bitmap 3 has incidental photographed cafe signage, not lesson title, price, variable, or function text; the other images supply scene objects with no identified required teaching words. Canvas retains them.',
    limits:['AI engineering observation is not named-human image review.','Small incidental markings are not proven absent in every composed frame.']},
   {kind:RISK_KINDS[2],sourceFacts:{buttonDefinitions:8,sourcePlacements:9,
    repeatedButtonId:79,lowercaseSourceKey:'output'},
    engineeringDisposition:'The modern host exposes nine occurrence-specific companion controls and explicit glossary lookup, including both Function placements and the reviewed lowercase output to Output crosswalk; open pauses, close retains pause, and Replay resets.',
    limits:['Current all-nine EN/ES browser execution is a separate check, not supplied by this source-risk artifact.','Hit-test-only source records do not reconstruct original up, over, or down artwork or AVM1 action execution.']},
   {kind:RISK_KINDS[3],sourceFacts:{staticTextDefinitions:28,decodedRuns:42,
    dynamicFields:0,unresolvedRuns:0,timelineDoActions:3},
    engineeringDisposition:'The audited page text is static; the three timeline DoAction records stop or enter the source animation, and button release actions are represented by an explicit modern host adapter. Native text has source-frame states and held Replay without manufacturing a dynamic text value.',
    limits:['Static analysis does not execute original AVM1 or establish original host-dependent visibility and value behavior.']},
   {kind:RISK_KINDS[4],sourceFacts:{actualMaskInstances:5,parsedFilterBlendVisibilityFlags:mask.flags,
    completeSentenceFrames:[611,684],priceSignMasks:2,sceneViewportMasks:1},
    engineeringDisposition:'All five parsed masks have a bounded native-text decision. Price labels are complete source-backed native pairs from frame 1; sentence 78/83 complete native rows wait until source mask-complete frames 611/684; viewport clipping and progressive partial glyphs remain in Canvas. No filter, blend, or visible placement flag was found in this parsed source.',
    limits:['Native reflow is intentionally not original pixel clipping or mask-sweep equivalence.','Original Flash compositing and full-frame fidelity remain unverified.']},
  ],
  sourceRiskKindsDispositioned:RISK_KINDS,
  formalTypographyCheck:{registeredPage:false,bindingAndCheckRecordWritten:false,
   resolvedSourceRisksClaimedForFormalChecker:[],allTwelveChecksPassed:false,
   note:'This artifact records bounded source-risk decisions; the formal typography checker requires its own exact binding, evidence and check record for a registered page.'},
  independentPending:['current all-nine glossary browser result and lifecycle/resource checks',
   'original Flash runtime and visual fidelity','audio listening and original host association',
   'named-human and Owner acceptance','strict completion, release and publication'],
  acceptanceEffect:'none'};
}
const mode=process.argv[2];
assert(process.argv.length===3&&['--write','--check'].includes(mode),'Usage: --write | --check');
const output=Buffer.from(JSON.stringify(build(),null,2)+'\n');
if(mode==='--write')fs.writeFileSync(absolute(TARGET),output,{flag:'wx'});
else assert.deepEqual(fs.readFileSync(absolute(TARGET)),output,'risk disposition drift');
console.log(JSON.stringify({status:'pass',mode,pin:pin(TARGET),acceptanceEffect:'none'}));
