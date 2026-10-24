/** Reviewable P004 G6–G8 typography binding/check proposal.
 * --plan is read-only. --write is guarded by current registration, all twelve
 * supported technical checks, and absent canonical targets. Run with node. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readP004CanonicalSource} from '../lib/alg-l06-p004-admission-semantics-v1.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const exactSourceExternal=new Set(readP004CanonicalSource(ROOT).external.map(item=>path.join(item.root,item.pin.path)));
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p004';
const BINDING=`catalog/typography-v1/g678-page-bindings/${ID}.json`;
const CHECK=`catalog/typography-v1/g678-checks/${ID}.json`;
const HISTORICAL_PRODUCTION='output/alg-l06-p004-production-v6/build-receipt-v6.json';
const REQUIRED=['sourceBinding','semanticText','mathSemantics','timingAndReplay',
 'teachingTextDisposition','hostIntegration','responsiveTypography','accessibility',
 'bilingualPolicy','performance','lifecycle','resourceStability'];
const SHA=/^[a-f0-9]{64}$/;
const mode=process.argv[2];
assert(['--plan','--write'].includes(mode),
 'Usage: node scripts/finalize-alg-l06-p004-typography-v1.mjs --plan|--write [--production-receipt <successor-path>] [--host-receipt <current-path>]');
const args=process.argv.slice(3);
assert(args.length%2===0,'Options require values');
const options=new Map();
for(let i=0;i<args.length;i+=2){
 assert(['--production-receipt','--host-receipt'].includes(args[i])&&!options.has(args[i]),
  `Unknown or duplicate option: ${args[i]}`);
 options.set(args[i],args[i+1]);
}
const productionPath=options.get('--production-receipt')??HISTORICAL_PRODUCTION;
const hostReceiptPath=options.get('--host-receipt')??
 'output/playwright/alg-l06-p004-semantic-panel-v5/substitution-v5-current/result.json';
const successor=productionPath!==HISTORICAL_PRODUCTION;
const productionVersion=/^output\/alg-l06-p004-production-v(\d+)\/build-receipt-v\1\.json$/.exec(productionPath)?.[1];
assert(productionVersion&&(!successor||Number(productionVersion)>6),
 'Production receipt must be the v6 historical path or an explicit v7+ successor');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const bytes=relative=>{
 assert(typeof relative==='string'&&relative,`unsafe path ${relative}`);
 const absolute=path.isAbsolute(relative);
 if(absolute)assert([SOURCE_ROOT,'/Volumes/American Dream/hudongpin'].some(base=>
  relative.startsWith(base+path.sep))||exactSourceExternal.has(relative),`external pin outside source/evidence roots: ${relative}`);
 else assert(!relative.split(/[\\/]/).some(part=>!part||part==='.'||part==='..'),`unsafe path ${relative}`);
 const full=absolute?relative:path.join(ROOT,relative),stat=fs.lstatSync(full);
 assert(stat.isFile()&&!stat.isSymbolicLink()&&
  (absolute?fs.realpathSync(full)===full:fs.realpathSync(full).startsWith(ROOT+path.sep)),relative);
 return fs.readFileSync(full);
};
const json=relative=>JSON.parse(bytes(relative));
const pin=relative=>{const data=bytes(relative);return {path:relative,bytes:data.length,sha256:sha(data)};};
const verify=reference=>{
 assert(reference&&typeof reference.path==='string'&&SHA.test(reference.sha256),'invalid evidence pin');
 const actual=pin(reference.path);assert.equal(actual.sha256,reference.sha256,reference.path);
 if(reference.bytes!==undefined)assert.equal(actual.bytes,reference.bytes,reference.path);
 return actual;
};
const stableReceipt=(relative,status)=>{
 const receipt=json(relative);assert.equal(receipt.status,status,relative);
 assert.equal(receipt.inputsStable,true,relative);assert.equal(receipt.browserClosed,true,relative);
 assert.deepEqual(receipt.errors,[],relative);return receipt;
};
const proposedBytes=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const checks=Object.fromEntries(REQUIRED.map(key=>[key,'not-run']));
const evidenceCoverage={};
function passed(key,condition,explanation){
 assert(REQUIRED.includes(key));assert(condition,`${key}: ${explanation}`);
 checks[key]='passed';evidenceCoverage[key]=explanation;
}
function pending(key,reason){assert(REQUIRED.includes(key));checks[key]='not-run';evidenceCoverage[key]=reason;}

// The prepared v3 binding was generated from the actual maintained snapshot and
// checked over all 831 frames. Rehash its source/implementation closure here.
const preparedPath='output/alg-l06-p004-typography-prepared-v3/binding.prepared-v3.json';
const prepared=JSON.parse(bytes(preparedPath));
const preparedCheck=json('output/alg-l06-p004-typography-prepared-v3/checks.prepared-v3.json');
assert.equal(preparedCheck.bindingSha256,sha(bytes(preparedPath)));
assert.equal(prepared.version,'alg-l06-p004-substitution-v5');
assert.equal(prepared.animationId,ID);assert.equal(prepared.placementId,ID);
assert.equal(preparedCheck.status,'prepared-incomplete-not-admitted');
assert.deepEqual(preparedCheck.registryChanged,false);
const sourcePath=path.join(SOURCE_ROOT,prepared.sourceRelativePath);
assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
assert(fs.realpathSync(sourcePath).startsWith(SOURCE_ROOT+path.sep));
const sourceBytes=fs.readFileSync(sourcePath);
assert.equal(sha(sourceBytes),prepared.sourceSwfSha256);
const sourceCatalog=collectSwfTextSourceCatalog(sourceBytes);
assert.equal(sha(Buffer.from(JSON.stringify(sourceCatalog))),prepared.sourceCatalogContentSha256);
assert.deepEqual(sourceCatalog,json('migrations/shared-alg001-l06-p004/audit/source-text-v1.json'));
assert.equal(sourceCatalog.unparsedTags.length,0);
const manifest=json('catalog/g678-page-only-release-manifest.v1.json');
const members=manifest.releases.flatMap(release=>release.members);
const member=members.find(row=>row.placementId===ID);
assert(member&&member.animationId===ID);
assert.equal(member.ordinal,4);assert.equal(member.sectionCode,'RW');
assert.equal(member.source.sha256,prepared.sourceSwfSha256);
assert.equal(member.source.path,'HELP_COURSES/ALG001/L6/RW/L6RW04.swf');
const textIds=new Set(sourceCatalog.textDefinitions.flatMap(def=>
 [def.sourceTextId,...def.runs.map(run=>run.sourceTextId)]));
const shapeHashes=new Map(sourceCatalog.shapeDefinitions.map(shape=>
 [shape.characterId,shape.sourceTagSha256]));
assert(prepared.blocks.length>0);
for(const block of prepared.blocks){
 assert(block.sourceTextIds.every(id=>textIds.has(id)),block.id);
 for(const id of block.sourceShapeIds??[])assert(shapeHashes.has(id),`${block.id}: shape ${id}`);
}
assert.equal(new Set(prepared.blocks.map(block=>block.id)).size,prepared.blocks.length);
assert.equal(new Set(prepared.blocks.map(block=>`${block.language}:${block.readingOrder}`)).size,prepared.blocks.length);
passed('sourceBinding',true,'Exact SWF, release-manifest member, parsed source text catalog, source IDs and shapes agree.');

const historicalProduction=json(HISTORICAL_PRODUCTION);
assert.equal(historicalProduction.kind,'alg-l06-p004-candidate-local-production-build-v6');
assert.equal(historicalProduction.inputsStable,true);
const production=json(productionPath);
assert.equal(production.kind,`alg-l06-p004-candidate-local-production-build-v${productionVersion}`);
assert.equal(production.exitCode,0);assert.equal(production.inputsStable,true);
const productionPins=new Map(production.inputsAfter.map(reference=>[reference.path,reference]));
assert.equal(productionPins.size,production.inputsAfter.length);
const productionDrift=production.inputsAfter.filter(reference=>{
 try{verify(reference);return false;}catch{return true;}
}).map(reference=>reference.path);
if(successor)assert.deepEqual(productionDrift,[],
 'Explicit successor production receipt must pin the current bytes');
const oldPins=new Map(historicalProduction.inputsAfter.map(reference=>[reference.path,reference]));
const successorChangedPaths=successor?production.inputsAfter.filter(reference=>
 oldPins.has(reference.path)&&oldPins.get(reference.path).sha256!==reference.sha256).map(reference=>reference.path):[];
const ALLOWED_GATEWAY_DELTA=new Set([
 'apps/web/next.config.ts',
 'apps/web/lib/alg-l06-p004-local-request-v1.ts',
 'apps/web/lib/alg-l06-p004-predecessor-request-v1.ts',
 'apps/web/lib/alg-l06-p004-resources-v1.server.ts',
 'apps/web/proxy.ts',
]);
const unexpectedProductionDrift=productionDrift.filter(file=>!ALLOWED_GATEWAY_DELTA.has(file));
const changedSemantic=successorChangedPaths.filter(file=>
 /(?:semantic-text|equation-presentation|native-text|text-presentation|text-snapshot|text-occurrences|semantic-pairs|lesson-typography(?:-host)?\.css|globals\.css)/.test(file));
const changedPlayback=successorChangedPaths.filter(file=>
 /(?:alg-l06-p004-(?:runtime|candidate-player|continuous|optional-spanish)|shared-alg001-l06-p004|source-static-canvas-candidate|decoded-source-stream-transport)/.test(file)
 &&!ALLOWED_GATEWAY_DELTA.has(file));
const productionReviewPath=`output/alg-l06-p004-production-v${productionVersion}/root-final-verification.json`;
const productionReview=json(productionReviewPath);
assert.equal(productionReview.status,'root-independently-verified');
assert.equal(productionReview.productionInputs,production.inputsAfter.length);
assert.equal(productionReview.buildConfigRestored,true);
const productionPlanPath=`output/alg-l06-p004-production-v${productionVersion}/root-plan.json`;
const productionPlan=json(productionPlanPath);
assert.deepEqual(productionPlan.sourceModes,['unset','real-root']);
assert(Number.isSafeInteger(productionPlan.casesPerMode)&&productionPlan.casesPerMode>0);
assert.equal(productionPlan.expectedCases,productionPlan.casesPerMode*2);
for(const mode of ['unset','real-root']){
 const route=json(`output/alg-l06-p004-production-v${productionVersion}/p004-candidate-v${productionVersion}-${mode}.json`);
 assert.equal(route.status,'technical-pass-not-deployment');
 assert.equal(route.expectedCases,productionPlan.casesPerMode);
 assert.equal(route.results.length,productionPlan.casesPerMode);
 assert.equal(route.inputsStable,true);assert(route.results.every(row=>row.pass===true));
}

const browser=stableReceipt(hostReceiptPath,'pass');
assert.deepEqual(browser.results.map(row=>row.locale),['en','es']);
if(successor&&options.has('--host-receipt')){
 const hostPins=new Map(browser.inputsAfter.map(reference=>[reference.path,reference]));
 assert(production.inputsAfter.every(reference=>hostPins.get(reference.path)?.sha256===reference.sha256),
  'Successor host receipt does not cover the current production input closure');
 // The runner records semantic rows after asserting the formal route marker,
 // actual 21/60 UI count and status 200. Bind the root's typed projection to the
 // immutable raw result rather than retroactively adding fields to that result.
 const witness=json('output/alg-l06-p004-admission-v1/formal-host-verification.json');
 assert.equal(witness.kind,'g678-host-verification-v1');
 assert.deepEqual(verify(witness.hostEvidence),pin(hostReceiptPath));
 assert.equal(witness.inputCount,production.inputsAfter.length);
 assert.deepEqual(witness.pageErrors,[]);
 assert.deepEqual(witness.results.map(row=>row.locale),['en','es']);
 assert(witness.results.every(row=>row.animationId===ID&&row.status===200&&
  row.formal===true&&row.ready===true&&row.lessonRegistered===21&&row.lessonTotal===60));
 const runner='scripts/probe-alg-l06-p004-formal-host-v2.mjs';
 verify(hostPins.get(runner));
 assert.equal(sha(bytes(runner)),sha(bytes(path.join(path.dirname(hostReceiptPath),'runner.mjs'))));
 assert(browser.results.every(row=>row.predecessorPlaybackAndReturn&&row.ReplayRestoresCoherentRule),
  'Successor host receipt must verify navigation and Replay in both locales');
}
assert(browser.results.every(row=>row.workedEquationSequence&&row.ReplayRestoresCoherentRule
 &&row.predecessorPlaybackAndReturn&&row.variableAssociations&&row.sourceMaskSentenceSequence
 &&row.sourcePricePairs.length===2));
const formalSaPath='output/alg-l06-p004-formal-sa-return-v2/admission-v2/result.json';
if(successor&&options.has('--host-receipt')){
 const formalSa=stableReceipt(formalSaPath,'pass');verify(formalSa.runner);
 assert.deepEqual(formalSa.inputsAfter,production.inputsAfter,'Formal SA probe binds the current production closure');
 assert.equal(formalSa.steps[0].label,'SA-return-resumes-retained-main');
 assert.equal(formalSa.steps[0].held.sa,'playing');
 assert.equal(formalSa.steps[0].resumed.sa,'idle');
 assert.equal(formalSa.steps[0].resumed.phase,'playing');
 assert.equal(formalSa.steps[1].label,'navigation-cancels-delayed-SA-new-page-stays-idle');
 assert.equal(formalSa.steps[1].frame,1);assert.equal(formalSa.steps[1].selected,'false');
 assert.equal(formalSa.steps[1].sa,'idle');
}
const glossary=stableReceipt('output/alg-l06-p004-all-glossary-v3/substitution-v5-a3/result.json',
 'technical-pass-not-original-runtime-or-listening');
assert.deepEqual(glossary.locales.map(row=>[row.locale,row.occurrences.length]),[['en',9],['es',9]]);
const accessibility=stableReceipt('output/alg-l06-p004-accessibility-v1/substitution-v5-a2/result.json','pass');
assert.equal(accessibility.results.length,4);
assert(accessibility.results.every(row=>row.status==='pass'&&row.focusReturned===true));
assert.deepEqual(accessibility.results.map(row=>row.configuredDpr),[1,2,2,3]);
const terminal={};
for(const locale of ['en','es']){
 const result=stableReceipt(`output/playwright/alg-l06-p004-terminal-v2/substitution-v5-${locale}/result.json`,'pass');
 assert.deepEqual(result.inputsBefore,historicalProduction.inputsAfter);
 assert.deepEqual(result.inputsAfter,historicalProduction.inputsAfter);
 assert.equal(result.productionBuildReceipt.sha256,pin(HISTORICAL_PRODUCTION).sha256);
 assert.equal(result.nativeTerminal.frame,831);
 assert(result.nativeTerminal.blocks.includes('equation93'));
 assert(!result.nativeTerminal.blocks.some(id=>id.startsWith('equation-worked-')));
 assert(result.nativeTerminal.text.includes('M = $0.50 × C'));
 assert.deepEqual(result.observations.map(row=>row.label),[
  'SA-natural-end-resumes-main','natural-main-terminal','explicit-SA-return-preserves-terminal',
  'natural-SA-end-preserves-terminal','trusted-close-focus-return',
  'Replay-after-terminal-SA-clears-state']);
 assert.equal(result.observations[1].frame,831);
 assert.equal(result.observations.at(-1).frame,1);
 assert.equal(result.observations.at(-1).phase,'ready');
 assert.deepEqual(result.responsesFailed,[]);
 terminal[locale]=result;
}
const sa=stableReceipt('output/alg-l06-p004-sa-return-v2/substitution-v5-a1/result.json','pass');
assert.deepEqual(sa.inputsBefore,historicalProduction.inputsAfter);
assert.deepEqual(sa.inputsAfter,historicalProduction.inputsAfter);
assert.deepEqual(sa.steps.map(step=>step.label),[
 'SA-return-resumes-retained-main','navigation-cancels-delayed-SA-new-page-stays-idle']);
const postflight=json('output/alg-l06-p004-terminal-refresh-v2/root-postflight.json');
assert.equal(postflight.status,'current-host-terminal-touch-interaction-and-allocation-observations-verified');
assert.equal(postflight.binding,prepared.version);
assert.equal(postflight.terminalNativeRuleAndTwoSentences.en,'verified-at831');
assert.equal(postflight.terminalNativeRuleAndTwoSentences.es,'verified-at831');
assert.equal(postflight.terminalNativeRuleAndTwoSentences.workedRowsAbsent,true);
assert.equal(postflight.implementationChanged,false);
for(const reference of postflight.verifiedReceipts)verify(reference.receipt);
passed('semanticText',browser.results.length===2&&terminal.en.nativeTerminal.blocks.includes('equation93'),
 'Prepared 831-frame native snapshot, current EN/ES semantic browser states and terminal native rows are bound.');
assert(prepared.sourceRoleDecisions.some(row=>row.sourceShapeHashes?.some(shape=>shape.characterId===49)));
assert(prepared.sourceRoleDecisions.some(row=>row.sourceShapeHashes?.some(shape=>shape.characterId===50)));
assert(prepared.sourceRoleDecisions.some(row=>row.sourceShapeHashes?.some(shape=>shape.characterId===67)));
for(const decision of prepared.sourceRoleDecisions)
 for(const shape of decision.sourceShapeHashes??[])
  assert.equal(shapeHashes.get(shape.characterId),shape.sourceTagSha256);
passed('mathSemantics',browser.results.every(row=>row.workedEquationSequence),
 'Source-hashed outline 49/50 and substitution 67, 314/315 handoff and answer at 367 are checked in current equations.');
passed('timingAndReplay',Object.keys(terminal).length===2&&sa.steps.length===2,
 'Natural EN/ES source terminal 831, separate SA completion/return, delayed-SA navigation cancellation and Replay are observed.');

const risk=json('migrations/shared-alg001-l06-p004/audit/text-risks-v4.json');
assert.equal(risk.kind,'alg-l06-p004-text-risk-disposition-v4');
assert.equal(risk.evidence.source.sha256,prepared.sourceSwfSha256);
assert.deepEqual(risk.sourceRiskKindsDispositioned,sourceCatalog.risks.map(row=>row.kind));
assert.equal(risk.rows.length,5);
assert.equal(risk.presentationPolicy.sourceCanvas,'retained and unsuppressed');
assert.equal(risk.presentationPolicy.textSuppression,'none');
for(const reference of Object.values(risk.evidence)){
 if(reference.path.startsWith(ROOT+path.sep))verify({...reference,path:path.relative(ROOT,reference.path)});
 else if(reference.path.startsWith(SOURCE_ROOT+path.sep)){
  const data=fs.readFileSync(reference.path);assert.equal(sha(data),reference.sha256);
 }else verify(reference);
}
passed('teachingTextDisposition',risk.rows.length===sourceCatalog.risks.length,
 'Five generic source risks have source-pinned modern-reading dispositions; Canvas remains unsuppressed.');
passed('hostIntegration',productionReview.productionInputs===production.inputsAfter.length,
 'Production-v6 two-mode 822-route checks and actual-module local My Lesson EN/ES playback/navigation pass.');
assert(browser.results.every(row=>row.reflow.length===10));
passed('responsiveTypography',true,
 'Current EN/ES 320/390/768/1280/1920 at 100/200% root font and responsive control geometry are measured.');
passed('accessibility',accessibility.results.every(row=>row.focusReturned),
 'Current four-cell keyboard/DPR1-3/font-fallback/focus matrix and real mobile touch interaction pass.');
passed('bilingualPolicy',glossary.locales.length===2,
 'EN source text and explicit ES source-fallback are stated; all nine glossary occurrences are checked in both locales.');

const lifecycle=stableReceipt('output/alg-l06-p004-lifecycle-v4/substitution-v5-a4/result.json','pass');
assert.deepEqual(lifecycle.results.map(row=>row.cycles.length),[3,1]);
for(const row of lifecycle.results)for(const cycle of row.cycles){
 assert.equal(cycle.media.contextLosses,0);
 assert(cycle.afterUnmount.contexts.filter(context=>context.scopeAtCreate==='p004-visible')
  .every(context=>context.closed===true));
 assert(cycle.afterUnmount.outstandingRaf.every(raf=>raf.createdScope!=='p004-visible'));
 assert.equal(cycle.replay.frame,1);
}
passed('lifecycle',lifecycle.results.every(row=>row.status==='pass'),
 'Three EN mounts and one ES fallback mount observe Replay, navigation, DPR/font changes and P004 audio/RAF cleanup.');

const touch={};
for(const version of [1,2]){
 const result=stableReceipt(`output/alg-l06-p004-touch-allocation-v${version}/substitution-v5-a${version}/result.json`,'pass');
 assert.deepEqual(result.results.map(row=>row.cycles.length),[3,1]);
 assert(result.results.every(row=>row.status==='pass'&&row.contextClosed===true));
 for(const row of result.results)for(const cycle of row.cycles){
  assert(cycle.paints.length>=100);
  assert(cycle.paints.every(sample=>sample.stagingCanvasCreates===6));
  assert.equal(cycle.unmounted.activeP004CanvasCount,0);
  assert(cycle.interactions.every(event=>event.isTrusted&&Number.isFinite(event.latencyMs)));
 }
 touch[version]=result;
}
const enIdle=touch[2].results[0].cycles.map(cycle=>cycle.afterIdle.liveP004CreatedCanvases.detached);
const esIdle=touch[2].results[1].cycles[0].afterIdle.liveP004CreatedCanvases.detached;
assert.deepEqual(enIdle,[0,0,0]);assert.equal(esIdle,6);
assert.equal(postflight.resourceInterpretation.persistentLeakEstablished,false);
assert.equal(postflight.resourceInterpretation.absoluteLeakFreeEstablished,false);
const stats=values=>{
 assert(values.length&&values.every(value=>Number.isFinite(value)&&value>=0));
 const sorted=[...values].sort((a,b)=>a-b);
 return {count:sorted.length,medianMs:sorted[Math.floor((sorted.length-1)/2)],
  p95Ms:sorted[Math.ceil(sorted.length*.95)-1],maxMs:sorted.at(-1)};
};
const firstReadyMs=lifecycle.results.flatMap(row=>row.cycles.map(cycle=>cycle.readyMs));
const trustedCommitMs=touch[2].results.flatMap(row=>row.cycles.flatMap(cycle=>
 cycle.interactions.map(event=>event.latencyMs)));
const firstReady=stats(firstReadyMs),trustedCommit=stats(trustedCommitMs);
const latePath='output/alg-l06-p004-late-allocation-v2/substitution-v5-late-a2/result.json';
let late=null,lateCounts=null,lateFrameCallbacks=null;
if(fs.existsSync(path.join(ROOT,latePath))){
 late=stableReceipt(latePath,'pass');
 assert.equal(late.results.length,1);assert.equal(late.results[0].status,'pass');
 assert.deepEqual(late.results[0].failedRequests,[]);
 assert.deepEqual(late.results[0].pageErrors,[]);
 const cycle=late.results[0].cycles[0];
 assert.equal(cycle.unmounted.activeP004CanvasCount,0);
 assert.equal(cycle.afterIdle.liveP004CreatedCanvases.detached,0);
 assert.equal(Math.max(...cycle.paints.map(sample=>sample.frame)),831);
 lateCounts=Object.fromEntries([6,8,10].map(count=>[count,
  cycle.paints.filter(sample=>sample.stagingCanvasCreates===count).length]));
 assert(Object.values(lateCounts).every(count=>count>0));
 lateFrameCallbacks=Object.fromEntries([6,8,10].map(count=>[count,
  stats(cycle.paints.filter(sample=>sample.stagingCanvasCreates===count)
   .map(sample=>sample.callbackDurationMs))]));
}
if(late){
 passed('performance',lateCounts[6]>0&&lateCounts[8]>0&&lateCounts[10]>0,
  `Repeated first-ready/interactions and frame-changing RAF samples to 831 include 6/8/10 staging branches (${JSON.stringify(lateCounts)}); local observation only, no visual-latency or heap guarantee.`);
 passed('resourceStability',enIdle.every(count=>count===0)&&late.results[0].cycles[0].afterIdle.liveP004CreatedCanvases.detached===0,
  'P004 audio contexts/RAF close on unmount; three EN remounts and late 831 run show zero detached WeakRefs after idle. ES has six weakly live detached canvases at one checkpoint, with neither leak nor leak-free conclusion.');
}else{
 pending('performance','Late 6/8/10 staging branches through 831 have no passing current receipt.');
 pending('resourceStability','Late-branch post-unmount resource observation has no passing current receipt.');
}
if(successor){
 // The v6 terminal, touch and lifecycle receipts remain historical. A new
 // registration/build does not make them current-host observations by fiat.
 if(!options.has('--host-receipt'))
  pending('hostIntegration','Successor production inputs need a fresh registered My Lesson EN/ES browser receipt.');
 if(successorChangedPaths.some(file=>ALLOWED_GATEWAY_DELTA.has(file))&&!options.has('--host-receipt'))
  pending('timingAndReplay','Gateway changes need current formal-host EN/ES delivery, Replay and navigation evidence; source clock/controller bytes are unchanged.');
 if(changedSemantic.length){
  for(const key of ['semanticText','mathSemantics','teachingTextDisposition',
   'responsiveTypography','accessibility','bilingualPolicy'])
   pending(key,`Successor changed semantic/layout dependencies (${changedSemantic.join(', ')}); rerun affected evidence.`);
 }
 if(changedPlayback.length){
  for(const key of ['timingAndReplay','performance','lifecycle','resourceStability'])
   pending(key,`Successor changed playback/resource dependencies (${changedPlayback.join(', ')}); rerun affected current-browser evidence.`);
 }
}
if(productionDrift.length){
 // A previously passing receipt remains historical when its inputs change.
 if(unexpectedProductionDrift.length){
  for(const key of ['semanticText','mathSemantics','timingAndReplay','teachingTextDisposition',
   'hostIntegration','responsiveTypography','accessibility','bilingualPolicy',
   'performance','lifecycle','resourceStability'])
   pending(key,`Selected production receipt has unexpected changed inputs: ${unexpectedProductionDrift.join(', ')}; classify dependencies and rerun affected evidence.`);
 }else{
  for(const key of ['hostIntegration','timingAndReplay'])
   pending(key,`Only resource/admission gateway paths changed (${productionDrift.join(', ')}); successor production and formal-host EN/ES delivery/Replay/navigation are required.`);
  evidenceCoverage.performance+=' Resource/admission gateway drift does not change the measured drawing, clock, Canvas or CSS bytes; current host delivery remains a separate check.';
  evidenceCoverage.lifecycle+=' The changed paths are access policy, not the measured player lifecycle implementation.';
  evidenceCoverage.resourceStability+=' Passive Canvas/audio cleanup evidence remains applicable to unchanged runtime bytes; new gateway delivery remains unverified.';
 }
}

// Include the exact drawing and audio bytes served by the current host; v3's
// source-code-only implementation list omitted these and the candidate manifest.
const canvasManifest=json('output/alg-l06-p004-canvas-candidate-v1/candidate-manifest.json');
assert.equal(canvasManifest.sourceSha256,prepared.sourceSwfSha256);
const canvasOutput=canvasManifest.outputs.find(row=>row.name==='canvas-renderer.js');
assert(canvasOutput);
const canvasPin=pin('output/alg-l06-p004-canvas-candidate-v1/canvas-renderer.js');
assert.equal(canvasPin.sha256,canvasOutput.sha256);
const audioPin=pin('migrations/shared-alg001-l06-p004/audit/continuous-source-v1.mp3');
assert.equal(audioPin.sha256,'e8f5307618bd63789f468c7a056cf80ae7828f17b665a24893fafc3ad8bb7f7e');
const shared=json('catalog/typography-v1/g678-integration.json').sharedFiles;
shared.forEach(verify);
const implementationPaths=[...production.inputsAfter.filter(reference=>
 /^(apps|packages)\//.test(reference.path)&&!reference.path.includes('/tests/')
 &&!reference.path.includes('.test.')).map(reference=>reference.path),
 ...shared.map(reference=>reference.path),
 canvasPin.path,audioPin.path,'output/alg-l06-p004-canvas-candidate-v1/candidate-manifest.json'];
const implementationFiles=[...new Set(implementationPaths)].sort().map(pin);
assert(implementationFiles.some(row=>row.path==='packages/demos/src/modules/shared-alg001-l06-p004.tsx'));
assert(implementationFiles.some(row=>row.path===canvasPin.path));
assert(implementationFiles.some(row=>row.path===audioPin.path));
const artifacts=[...new Set([...preparedCheck.artifacts.map(row=>row.path),
 'output/alg-l06-p004-typography-prepared-v3/checks.prepared-v3.json',
 'output/alg-l06-p004-terminal-refresh-v2/root-postflight.json',
 HISTORICAL_PRODUCTION,productionPath,productionReviewPath,productionPlanPath,
 hostReceiptPath,
 ...(successor&&options.has('--host-receipt')?[formalSaPath,'scripts/probe-alg-l06-p004-formal-sa-return-v2.mjs','output/alg-l06-p004-admission-v1/formal-host-verification.json']:[]),
 'output/playwright/alg-l06-p004-terminal-v2/substitution-v5-en/result.json',
 'output/playwright/alg-l06-p004-terminal-v2/substitution-v5-es/result.json',
 'output/alg-l06-p004-sa-return-v2/substitution-v5-a1/result.json',
 'output/alg-l06-p004-touch-allocation-v1/substitution-v5-a1/result.json',
 'output/alg-l06-p004-touch-allocation-v2/substitution-v5-a2/result.json',
 'output/alg-l06-p004-lifecycle-v4/substitution-v5-a4/result.json',
 'output/alg-l06-p004-canvas-candidate-v1/validation-receipt.json',
 ...(late?[latePath]:[]),'scripts/finalize-alg-l06-p004-typography-v1.mjs'])].sort().map(pin);
const unresolved=REQUIRED.filter(key=>checks[key]!=='passed').map(key=>`${key}: ${evidenceCoverage[key]}`);
const binding={...prepared,
 implementation:{status:'candidate',closure:`current production-v${productionVersion} runtime, shared typography files, served Canvas/audio bytes and source candidate manifest`,files:implementationFiles},
 unresolved,
 independentPending:['original Flash runtime and visual fidelity','source-bound human listening',
  'named-human visual review','Owner acceptance','strict completion','release and publication']};
const bindingData=proposedBytes(binding);
const record={schemaVersion:1,kind:'g678-lesson-typography-check-v1',placementId:ID,
 sourceSwfSha256:prepared.sourceSwfSha256,bindingSha256:sha(bindingData),
 checkedAt:new Date().toISOString(),checks,evidenceCoverage,
 artifacts,languagePolicy:{en:'source',es:'source-fallback'},
 resolvedSourceRisks:[...risk.sourceRiskKindsDispositioned],
 sourceRiskResolution:'All five generic source risks have bounded modern native-reading dispositions in text-risks-v4; retained Canvas carries scene, masks and emphasis. This is not Flash fidelity.',
 performanceBoundary:'Fixed local browser profiles: frame-changing RAF callback and trusted click to first DOM state commit, not exact render time, final visual latency, retained heap, or an absolute leak-free guarantee.',
 performanceMeasurements:{firstReadyMs:firstReady,trustedStateCommitMs:trustedCommit,
  lateFrameChangingRafCallbacksMs:lateFrameCallbacks,
  repeatedEarlyFrameStagingCreatesPerPaint:6,lateStagingCreateCounts:lateCounts},
 resourceBoundary:{enDetachedWeakRefsAfterIdle:enIdle,esDetachedWeakRefsAfterIdle:esIdle,
  lateDetachedWeakRefsAfterIdle:late?.results[0].cycles[0].afterIdle.liveP004CreatedCanvases.detached??null,
  forcedGc:false,persistentLeakEstablished:false,absoluteLeakFreeEstablished:false},
 technicalScope:'Local current-JS native typography with retained source Canvas in My Lesson; original runtime, listening, human/Owner review, strict completion, release and publication are separate.',
 fullTechnicalPass:unresolved.length===0,humanReviewed:false,ownerAccepted:false,
 originalRuntimeAccepted:false,audioAccepted:false,strictComplete:false,published:false};
assert.deepEqual(Object.keys(checks),REQUIRED);
const registry=json('packages/demos/private-current-js-registry.json');
const entry=registry.calibrations.flatMap(calibration=>calibration.entries).find(row=>row.key===ID);
const registeredModuleCurrent=Boolean(entry&&implementationFiles.some(row=>
 row.path===entry.artifacts?.module?.path&&row.sha256===entry.artifacts.module.sha256));
// A complete evidence proposal is not a formal current-page pass until its
// exact module is registered and the canonical checker can assess the pair.
record.allTwelveTechnicalChecksSupported=unresolved.length===0;
record.fullTechnicalPass=record.allTwelveTechnicalChecksSupported&&registeredModuleCurrent;
if(mode==='--write'){
 assert(successor,'Historical pre-registration v6 evidence cannot write the canonical pair');
 assert.equal(unresolved.length,0,`Mandatory technical checks remain incomplete: ${unresolved.join('; ')}`);
 assert(registeredModuleCurrent,'Register the exact P004 module and reverify the candidate before canonical write');
 for(const target of [BINDING,CHECK])assert(!fs.existsSync(path.join(ROOT,target)),`canonical target exists: ${target}`);
 fs.writeFileSync(path.join(ROOT,BINDING),bindingData,{flag:'wx'});
 fs.writeFileSync(path.join(ROOT,CHECK),proposedBytes(record),{flag:'wx'});
}
console.log(JSON.stringify({mode,status:mode==='--write'?'canonical-pair-written':'reviewable-proposal-only',
 binding:BINDING,check:CHECK,bindingSha256:sha(bindingData),blocks:binding.blocks.length,
 implementationFiles:implementationFiles.length,artifacts:artifacts.length,checks,
 unresolved,registeredModuleCurrent,allTwelveTechnicalChecksSupported:record.allTwelveTechnicalChecksSupported,
 fullTechnicalPass:record.fullTechnicalPass,
 productionReceipt:productionPath,productionDrift,successorChangedPaths,
 formalAdmitted:false,
 performanceBoundary:record.performanceBoundary,resourceBoundary:record.resourceBoundary,
 acceptanceEffect:'none'},null,2));
