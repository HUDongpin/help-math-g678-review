/** Prepare an unregistered, explicitly incomplete typography binding from the
 * actual maintained snapshot. Run with tsx; never edits the registry or checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {P004_SEMANTIC_TEXT_BINDING as live} from '../packages/demos/src/alg-l06-p004-semantic-text-v1.ts';
import {P004_EQUATION_SOURCE_SHAPES_V1 as outlines} from '../packages/demos/src/alg-l06-p004-equation-presentation-v1.ts';
import {p004TextSnapshot} from '../packages/demos/src/alg-l06-p004-text-snapshot-v1.ts';
import {validateLessonTextBinding} from '../packages/demos/src/lesson-text-snapshot.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out='output/alg-l06-p004-typography-prepared-v2';
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
const production=json('output/alg-l06-p004-production-v5/build-receipt-v5.json');
assert.equal(production.exitCode,0);assert(production.inputsStable);production.inputsAfter.forEach(verify);
const browser=json('output/playwright/alg-l06-p004-semantic-panel-v4/pairs-controls-v23/result.json');
assert.equal(browser.status,'pass');assert(browser.inputsStable);browser.inputsAfter.forEach(verify);
const shared=json('catalog/typography-v1/g678-integration.json').sharedFiles;shared.forEach(verify);
// Use the reviewed production-scoped runtime closure, including host/predecessor
// dependencies, plus every required shared typography input. Test/evidence files
// are separately recorded below rather than passed off as runtime code.
const runtime=production.inputsAfter.filter(p=>/^(apps|packages)\//.test(p.path)&&!p.path.includes('/tests/')&&!p.path.includes('.test.'));
const files=[...new Map([...runtime,...shared].map(p=>[p.path,p])).values()].sort((a,b)=>a.path.localeCompare(b.path));
const sourceRoleDecisions=outlines.map(s=>{assert.equal(shapeById.get(s.characterId),s.sourceTagSha256);return {
 kind:'outlined-text',sourceShapeHashes:[{characterId:s.characterId,sourceTagSha256:s.sourceTagSha256}],role:'body',semanticValue:'M = $0.50 × C',
 reason:`Source-locked equation transition at ${s.firstFrame}..${s.lastFrameExclusive-1}; current native rule preserves its mathematical value.`,
 evidence:['output/alg-l06-p004-equation-states-v1/teaching-decision-v1.json','packages/demos/tests/alg-l06-p004-equation-presentation-v1.test.ts'].map(pin),
 };});
const binding={...live,sourceRelativePath,sourceCatalogContentSha256:sha(JSON.stringify(catalog)),sourceRoleDecisions,
 implementation:{status:'candidate',closure:'reviewed production-scoped runtime and shared typography files',files},
 unresolved:['Complete vector/bitmap and source-risk dispositions','Complete responsive/accessibility/font/DPR technical matrix','Measure current lifecycle, resource stability and performance'],
 independentPending:['original-runtime authority and fidelity','source-bound human listening','human visual review','Owner acceptance','strict completion','publication']};
const artifacts=[manifestPath,'migrations/shared-alg001-l06-p004/audit/source-text-v1.json','migrations/shared-alg001-l06-p004/audit/semantic-pairs-v1.json','output/alg-l06-p004-equation-states-v1/teaching-decision-v1.json','output/alg-l06-p004-semantic-pairs-v1/tests-final.log','output/alg-l06-p004-semantic-pairs-v1/integration.log','output/alg-l06-p004-semantic-pairs-v1/typecheck.log','output/playwright/alg-l06-p004-semantic-panel-v4/pairs-controls-v23/result.json','output/alg-l06-p004-production-v5/root-final-verification.json','scripts/prepare-alg-l06-p004-typography-evidence-v2.mjs'].map(pin);
const bindingPin=pinForData(`${out}/binding.prepared-v2.json`,binding);
function pinForData(p,value){const b=Buffer.from(JSON.stringify(value,null,2)+'\n');return {path:p,bytes:b.length,sha256:sha(b)};}
const checks=Object.fromEntries(required.map(key=>[key,key==='sourceBinding'?'passed':'not-run']));
const gaps={semanticText:'Current native values verified; complete source-role census still needed.',mathSemantics:'Coherent rule/worked states verified; finish classification of other shapes.',timingAndReplay:'All831 snapshot states and natural samples/Replay verified; full lifecycle matrix remains.',teachingTextDisposition:'Resolve all five extracted source-risk kinds with evidence; retained Canvas requires an explicit disposition.',hostIntegration:'Actual-module SSR and custom My Lesson browser verified; record full current host criteria.',responsiveTypography:'EN/ES five widths and100/200 percent root font verified; remaining matrix must be measured.',accessibility:'Source semantics/focus/target geometry verified; full keyboard/font/DPR checks remain.',bilingualPolicy:'Current browser verifies declared EN source fallback; formal record remains prepared.',performance:'No current bound performance measurement yet.',lifecycle:'No complete current lifecycle trace yet.',resourceStability:'No complete current repeated mount/navigation resource measurement yet.'};
const record={schemaVersion:1,kind:'g678-lesson-typography-check-prepared-v2',placementId:live.placementId,sourceSwfSha256:live.sourceSwfSha256,
 bindingSha256:bindingPin.sha256,status:'prepared-incomplete-not-admitted',checks,evidenceCoverage:gaps,
 resolvedSourceRisks:[],unresolvedSourceRisks:catalog.risks.map(r=>r.kind),languagePolicy:{en:'source',es:'source-fallback'},artifacts,
 fullTechnicalPass:false,registryChanged:false,acceptanceEffect:'none'};
assert.deepEqual(Object.keys(checks),required);assert(Object.values(checks).some(v=>v!=='passed'));
const mode=process.argv[2];assert(['--prepare','--check'].includes(mode));
if(mode==='--prepare'){write(bindingPin.path,binding);write(`${out}/checks.prepared-v2.json`,record);}
else {assert.deepEqual(read(bindingPin.path),Buffer.from(JSON.stringify(binding,null,2)+'\n'));assert.deepEqual(read(`${out}/checks.prepared-v2.json`),Buffer.from(JSON.stringify(record,null,2)+'\n'));}
console.log(JSON.stringify({status:mode==='--prepare'?'prepared-incomplete':'prepared-evidence-current',binding:bindingPin,blocks:live.blocks.length,implementationFiles:files.length,sourceRiskKinds:catalog.risks.map(r=>r.kind),all831Snapshots:true,registered:false,fullTechnicalPass:false}));
