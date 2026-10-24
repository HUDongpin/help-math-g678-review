import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {build,candidateSuppressionForRows,run}
 from './prepare-alg-l06-p025-native-text-v1.mjs';

const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const inputs=()=>[
 readFileSync(`${SOURCE}/G6-G8-shared/ALG001/L6/VB/L6VB18.swf`),
 readFileSync('output/alg-l06-p025-source-audit-v1/source-audit-v1.json'),
 readFileSync('output/alg-l06-p025-source-audit-v1/timeline-text-v1.json'),
 readFileSync('output/alg-l06-p025-text-geometry-v1/text-geometry-v1.json'),
 readFileSync('output/alg-l06-p025-text-geometry-v1/frame-states-v1.json'),
 readFileSync('scripts/prepare-alg-l06-p025-native-text-v1.mjs')];
const report=()=>JSON.parse(readFileSync('output/alg-l06-p025-native-text-v1/text-state-source-v1.json'));

test('source-locked 8 definitions, 16 runs, 24 instances and 299 frames reproduce',()=>{
 const result=run('--check'),text=report();
 assert.deepEqual(result.inventory,{staticTextDefinitions:8,decodedRuns:16,
  staticTextInstances:24,sourceMasks:2,glossaryControls:4});
 assert.deepEqual(text.textDefinitions.map(row=>[row.characterId,row.runs.length]),
  [[5,7],[10,1],[11,1],[12,1],[13,1],[15,3],[18,1],[20,1]]);
 assert.equal(text.textInstances.length,24);
 assert.equal(text.frames.length,299);
 assert.deepEqual(text.nativeGroups.map(row=>[row.characterId,row.firstCompleteInkFrame]),
  [[5,50],[15,295]]);
 assert.equal(text.textDefinitions.find(row=>row.characterId===5).text,
  'The independent variable is the input variable for a function.');
 assert.equal(text.textDefinitions.find(row=>row.characterId===15).text,
  'The independent variable is the variable for the domain.');
 assert.deepEqual(text.languagePolicy,{sourceTextLanguage:'en',es:'source-en-fallback',
  authoredSpanishTextAbsent:true,doNotInventTranslation:true});
});

test('glossary readiness follows full blue ink and full hit, never button placement',()=>{
 const text=report();
 assert.deepEqual(text.glossaryControls.map(row=>
  [row.key,row.buttonCharacterId,row.firstButtonPlacementFrame,
   row.firstSourceGeometryReadyFrame]),[
   ['Independent variable',7,2,28],['Input variable',9,2,41],
   ['Function',8,2,50],['Domain',16,52,295]]);
 assert.deepEqual(text.frames[27].sourceGeometryReadyGlossaryKeys,['Independent variable']);
 assert.deepEqual(text.frames[40].sourceGeometryReadyGlossaryKeys,
  ['Independent variable','Input variable']);
 assert.deepEqual(text.frames[49].sourceGeometryReadyGlossaryKeys,
  ['Independent variable','Input variable','Function']);
 assert.deepEqual(text.frames[294].sourceGeometryReadyGlossaryKeys,
  ['Independent variable','Input variable','Function','Domain']);
 assert(text.glossaryControls.every(row=>row.originalHostClickObserved===false));
});

test('native glyph eligibility requires every active same-ID instance complete',()=>{
 const text=report();
 assert.deepEqual(text.frames[48].candidateSuppressibleSourceTextIds,[]);
 assert.deepEqual(text.frames[49].candidateSuppressibleSourceTextIds,[5]);
 assert.deepEqual(text.frames[293].candidateSuppressibleSourceTextIds,[5]);
 assert.deepEqual(text.frames[294].candidateSuppressibleSourceTextIds,[5,15]);
 assert(text.frames[1].sourceFallbackInstanceIds.includes('sprite-21/depth-3/generation-1'));
 assert(text.frames[293].sourceFallbackInstanceIds.includes('sprite-21/depth-13/generation-1'));
 assert(text.frames[294].sourceFallbackInstanceIds.includes('sprite-21/depth-21/generation-1'),
  'long-lived separate in glyph remains Canvas fallback');
 const mixed=[{role:'static-text',characterId:5,completeInk:true,alpha:1},
  {role:'static-text',characterId:5,completeInk:false,alpha:1},
  {role:'static-text',characterId:15,completeInk:true,alpha:1}];
 assert.deepEqual(candidateSuppressionForRows(mixed),[15]);
 assert.deepEqual(candidateSuppressionForRows([{...mixed[0],alpha:0}]),[]);
 assert.equal(text.suppressionPolicy.status,'candidate-only-no-product-suppression');
 assert.equal(text.suppressionPolicy.requiresActualNativeRenderedInstances,true);
});

test('source and geometry tampering fail; two independent builds are byte-identical',()=>{
 const args=inputs(),first=build(...args).outputs[0][1],second=build(...args).outputs[0][1];
 assert(first.equals(second));
 assert(first.equals(readFileSync('output/alg-l06-p025-native-text-v1/text-state-source-v1.json')));
 for(const index of [0,1,2,3,4]){
  const changed=args.map(bytes=>Buffer.from(bytes));
  changed[index][Math.min(100,changed[index].length-1)]^=1;
  assert.throws(()=>build(...changed),/Expected values to be strictly equal|SHA-256/);
 }
});
