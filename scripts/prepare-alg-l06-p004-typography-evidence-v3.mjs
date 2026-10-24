/** Prepare an unregistered, explicitly incomplete typography binding from the
 * actual maintained snapshot. Run with tsx; never edits the registry or checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {P004_SEMANTIC_TEXT_BINDING as live} from '../packages/demos/src/alg-l06-p004-semantic-text-v1.ts';
import {P004_EQUATION_SOURCE_SHAPES_V1 as outlines,
 P004_SUBSTITUTION_SOURCE_SHAPE_V1 as substitutionShape} from '../packages/demos/src/alg-l06-p004-equation-presentation-v1.ts';
import {p004TextSnapshot} from '../packages/demos/src/alg-l06-p004-text-snapshot-v1.ts';
import {validateLessonTextBinding} from '../packages/demos/src/lesson-text-snapshot.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out='output/alg-l06-p004-typography-prepared-v3';
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelativePath='G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const required=['sourceBinding','semanticText','mathSemantics','timingAndReplay','teachingTextDisposition','hostIntegration','responsiveTypography','accessibility','bilingualPolicy','performance','lifecycle','resourceStability'];
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(path.resolve(root,p));
const json=p=>JSON.parse(read(p));
const pin=p=>{const b=read(p);return {path:p,bytes:b.length,sha256:sha(b)};};
const verify=p=>{assert.equal(pin(p.path).sha256,p.sha256,p.path);if(p.bytes!==undefined)assert.equal(pin(p.path).bytes,p.bytes,p.path);};
const write=(p,data)=>{const b=Buffer.from(JSON.stringify(data,null,2)+'\n');const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});if(fs.existsSync(f))assert.deepEqual(read(p),b,`immutable ${p}`);else fs.writeFileSync(f,b,{flag:'wx'});return pin(p);};
const sourceBytes=fs.readFileSync(path.join(sourceRoot,sourceRelativePath));
assert.equal(sha(sourceBytes),live.sourceSwfSha256);
assert.equal(fs.realpathSync(sourceRoot),sourceRoot,'physical source root');
const manifestPath='catalog/g678-page-only-release-manifest.v1.json';
const matches=[];
function findPlacement(value){if(Array.isArray(value))value.forEach(findPlacement);else if(value&&typeof value==='object'){if(value.animationId===live.animationId&&value.placementId===live.placementId)matches.push(value);else Object.values(value).forEach(findPlacement);}}
findPlacement(json(manifestPath));assert.equal(matches.length,1);
assert.equal(matches[0].source.sha256,live.sourceSwfSha256);
assert.equal(matches[0].source.path,'HELP_COURSES/ALG001/L6/RW/L6RW04.swf');
assert.equal(matches[0].ordinal,4);assert.equal(matches[0].sectionCode,'RW');
const catalog=collectSwfTextSourceCatalog(sourceBytes);
assert.deepEqual(catalog,json('migrations/shared-alg001-l06-p004/audit/source-text-v1.json'));
assert.equal(catalog.unparsedTags.length,0);
validateLessonTextBinding(live);
const ids=new Set(catalog.textDefinitions.flatMap(d=>[d.sourceTextId,...d.runs.map(r=>r.sourceTextId)]));
const shapeById=new Map(catalog.shapeDefinitions.map(s=>[s.characterId,s.sourceTagSha256]));
for(const block of live.blocks){assert(block.sourceTextIds.every(id=>ids.has(id)));for(const id of block.sourceShapeIds??[])assert(shapeById.has(id));}
assert.equal(new Set(live.blocks.map(b=>`${b.language}:${b.readingOrder}`)).size,live.blocks.length);
for(let frame=1;frame<=831;frame++){
 const snapshot=p004TextSnapshot({frame,frameDomain:'sprite-95',rootFrame:6,scenario:'source-static-frame',lang:'en',seed:0});
 assert.equal(snapshot.status,'ready');assert.equal(snapshot.blocks.length,live.blocks.length);
 assert.deepEqual(snapshot.suppressedInstances,[]);
}
const registry=json('packages/demos/private-current-js-registry.json');
assert(!registry.calibrations.flatMap(c=>c.entries).some(e=>e.key===live.animationId),'P004 remains unregistered');
assert.equal(live.version,'alg-l06-p004-substitution-v5');
assert(live.blocks.some(block=>block.id==='equation-worked-substitution'&&block.sourceShapeIds?.includes(67)));
const risk=json('migrations/shared-alg001-l06-p004/audit/text-risks-v4.json');
assert.equal(risk.kind,'alg-l06-p004-text-risk-disposition-v4');
assert.equal(risk.evidence.source.sha256,live.sourceSwfSha256);
assert.deepEqual(risk.sourceRiskKindsDispositioned,catalog.risks.map(row=>row.kind));
assert.equal(risk.formalTypographyCheck.allTwelveChecksPassed,false);
const production=json('output/alg-l06-p004-production-v6/build-receipt-v6.json');
assert.equal(production.exitCode,0);assert(production.inputsStable);production.inputsAfter.forEach(verify);
assert.equal(production.kind,'alg-l06-p004-candidate-local-production-build-v6');
const productionReview=json('output/alg-l06-p004-production-v6/root-final-verification.json');
assert.equal(productionReview.status,'root-independently-verified');
assert.equal(productionReview.productionInputs,production.inputsAfter.length);
assert.equal(productionReview.buildConfigRestored,true);
for(const mode of ['unset','real-root']){
 const denial=json(`output/alg-l06-p004-production-v6/p004-candidate-v6-${mode}.json`);
 assert.equal(denial.sourceMode,mode);assert.equal(denial.status,'technical-pass-not-deployment');
 assert.equal(denial.expectedCases,822);assert.equal(denial.results.length,822);
 assert.equal(denial.inputsStable,true);assert(denial.results.every(row=>row.pass===true));
}
const browser=json('output/playwright/alg-l06-p004-semantic-panel-v5/substitution-v5-current/result.json');
assert.equal(browser.status,'pass');assert(browser.inputsStable);browser.inputsAfter.forEach(verify);
assert.deepEqual(browser.results.map(row=>row.locale),['en','es']);
const accessibility=json('output/alg-l06-p004-accessibility-v1/substitution-v5-a2/result.json');
assert.equal(accessibility.status,'pass');assert(accessibility.inputsStable);
assert.equal(accessibility.results.length,4);
accessibility.inputsAfter.pins.forEach(verify);
const glossary=json('output/alg-l06-p004-all-glossary-v3/substitution-v5-a3/result.json');
assert.equal(glossary.status,'technical-pass-not-original-runtime-or-listening');
assert.equal(glossary.inputsStable,true);glossary.inputsAfter.forEach(verify);
assert.deepEqual(glossary.locales.map(row=>[row.locale,row.occurrences.length]),[['en',9],['es',9]]);
const shared=json('catalog/typography-v1/g678-integration.json').sharedFiles;shared.forEach(verify);
// Use the reviewed production-scoped runtime closure, including host/predecessor
// dependencies, plus every required shared typography input. Test/evidence files
// are separately recorded below rather than passed off as runtime code.
const runtime=production.inputsAfter.filter(p=>/^(apps|packages)\//.test(p.path)&&!p.path.includes('/tests/')&&!p.path.includes('.test.'));
const files=[...new Map([...runtime,...shared].map(p=>[p.path,p])).values()].sort((a,b)=>a.path.localeCompare(b.path));
const sourceRoleDecisions=[...outlines,substitutionShape].map(s=>{assert.equal(shapeById.get(s.characterId),s.sourceTagSha256);return {
 kind:'outlined-text',sourceShapeHashes:[{characterId:s.characterId,sourceTagSha256:s.sourceTagSha256}],role:'body',
 semanticValue:s.characterId===67?'M = $0.50 × 5':'M = $0.50 × C',
 reason:s.characterId===67
  ?'Complete source outline 5 at frame 314 has a native substituted equation; DefineText 61 takes over at 315.'
  :`Source-locked rule transition at ${s.firstFrame}..${s.lastFrameExclusive-1}; current native rule preserves its mathematical value.`,
 evidence:(s.characterId===67?['output/alg-l06-p004-substitution-implementation-v1/decision.json',
  'output/alg-l06-p004-substitution-implementation-v1/root-verification.json']:
  ['output/alg-l06-p004-equation-states-v1/teaching-decision-v1.json'])
  .concat('packages/demos/tests/alg-l06-p004-equation-presentation-v1.test.ts').map(pin),
 };});
const binding={...live,sourceRelativePath,sourceCatalogContentSha256:sha(JSON.stringify(catalog)),sourceRoleDecisions,
 implementation:{status:'candidate',closure:'reviewed production-scoped runtime and shared typography files',files},
 unresolved:['Complete current-browser/full-state applicability record and actual touch checks',
  'Complete responsive and accessibility technical matrix beyond focused EN/ES browser runs',
  'Measure staging allocation, interaction timings, lifecycle and resource stability'],
 independentPending:['original-runtime authority and fidelity','source-bound human listening','human visual review','Owner acceptance','strict completion','publication']};
const artifacts=[manifestPath,'migrations/shared-alg001-l06-p004/audit/source-text-v1.json',
 'migrations/shared-alg001-l06-p004/audit/semantic-pairs-v1.json',
 'migrations/shared-alg001-l06-p004/audit/text-risks-v4.json',
 'output/alg-l06-p004-shape-census-v1/census-v1.json',
 'output/alg-l06-p004-bitmap-role-review-v1.md',
 'output/alg-l06-p004-outline-emphasis-disposition-v1.md',
 'output/alg-l06-p004-mask-disposition-v1.json',
 'output/alg-l06-p004-substitution-implementation-v1/decision.json',
 'output/alg-l06-p004-substitution-implementation-v1/root-verification.json',
 'output/alg-l06-p004-semantic-pairs-v1/tests-final.log',
 'output/alg-l06-p004-semantic-pairs-v1/integration.log',
 'output/alg-l06-p004-semantic-pairs-v1/typecheck.log',
 'output/playwright/alg-l06-p004-semantic-panel-v5/substitution-v5-current/result.json',
 'output/alg-l06-p004-accessibility-v1/substitution-v5-a2/result.json',
 'output/alg-l06-p004-all-glossary-v3/substitution-v5-a3/result.json',
 'output/alg-l06-p004-production-v6/p004-candidate-v6-unset.json',
 'output/alg-l06-p004-production-v6/p004-candidate-v6-real-root.json',
 'output/alg-l06-p004-production-v6/root-final-verification.json',
 'scripts/prepare-alg-l06-p004-typography-evidence-v3.mjs'].map(pin);
const bindingPin=pinForData(`${out}/binding.prepared-v3.json`,binding);
function pinForData(p,value){const b=Buffer.from(JSON.stringify(value,null,2)+'\n');return {path:p,bytes:b.length,sha256:sha(b)};}
const scopedSupported=new Set(['sourceBinding','semanticText','mathSemantics','teachingTextDisposition',
 'hostIntegration','bilingualPolicy']);
const checks=Object.fromEntries(required.map(key=>[key,scopedSupported.has(key)?'scoped-supported':'incomplete']));
const gaps={
 sourceBinding:'Exact source SWF, placement ordinal/section, source catalog and production-v6 closure checked.',
 semanticText:'Current substitution-v5 semantic binding and all 831 source-frame snapshots checked; original Canvas is retained.',
 mathSemantics:'Shapes 49/50 and complete substitution shape 67 have source-hash role decisions; answer remains at 367, with current focused browser evidence.',
 timingAndReplay:'All 831 snapshots and focused natural playback/Replay and nine glossary interactions are checked; full-state current-browser applicability record remains incomplete.',
 teachingTextDisposition:'Current v4 engineering audit assesses all five generic source-risk kinds, five masks and 49 shapes for modern native reading; no formal source-risk acceptance claim.',
 hostIntegration:'Production-v6 two-mode denial, actual-module/local My Lesson and focused EN/ES browser paths are current; full host criteria record remains separate.',
 responsiveTypography:'EN/ES five widths at 100/200 percent root font were measured; full interaction/touch matrix remains incomplete.',
 accessibility:'Focused EN/ES keyboard, DPR and font-fallback matrix passed; actual touch and full state coverage remain incomplete.',
 bilingualPolicy:'Source drawing remains English fallback; EN/ES glossary definitions and all nine source occurrences were checked in current My Lesson.',
 performance:'No bound staging-allocation or interaction-timing measurements for this candidate.',
 lifecycle:'Current lifecycle probe is pending independent review; no completed lifecycle claim is incorporated.',
 resourceStability:'Repeated mount/navigation resource stability and full current lifecycle matrix remain incomplete.'};
const record={schemaVersion:1,kind:'g678-lesson-typography-check-prepared-v3',placementId:live.placementId,sourceSwfSha256:live.sourceSwfSha256,
 bindingSha256:bindingPin.sha256,status:'prepared-incomplete-not-admitted',checks,evidenceCoverage:gaps,
 sourceRiskKindsDispositioned:risk.sourceRiskKindsDispositioned,
 resolvedSourceRisks:[],unresolvedSourceRisks:catalog.risks.map(r=>r.kind),languagePolicy:{en:'source',es:'source-fallback'},artifacts,
 fullTechnicalPass:false,registryChanged:false,acceptanceEffect:'none'};
assert.deepEqual(Object.keys(checks),required);assert(Object.values(checks).some(v=>v!=='passed'));
const mode=process.argv[2];assert(['--prepare','--check'].includes(mode));
if(mode==='--prepare'){write(bindingPin.path,binding);write(`${out}/checks.prepared-v3.json`,record);}
else {assert.deepEqual(read(bindingPin.path),Buffer.from(JSON.stringify(binding,null,2)+'\n'));assert.deepEqual(read(`${out}/checks.prepared-v3.json`),Buffer.from(JSON.stringify(record,null,2)+'\n'));}
console.log(JSON.stringify({status:mode==='--prepare'?'prepared-incomplete':'prepared-evidence-current',binding:bindingPin,blocks:live.blocks.length,implementationFiles:files.length,sourceRiskKinds:catalog.risks.map(r=>r.kind),all831Snapshots:true,registered:false,fullTechnicalPass:false}));
