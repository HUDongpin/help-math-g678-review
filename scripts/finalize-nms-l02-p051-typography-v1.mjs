import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const T='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222',id='shared-nms002-l02-p051';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const abs=p=>path.resolve(R,p),read=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
function pin(p){const f=abs(p),s=fs.lstatSync(f);assert.ok(s.isFile()&&!s.isSymbolicLink());const b=fs.readFileSync(f);return {path:f.startsWith(R+'/')?path.relative(R,f):f,bytes:b.length,sha256:sha(b)};}
const external=n=>path.join(T,n),result=n=>JSON.parse(fs.readFileSync(external(n),'utf8').split('### Result\n')[1].split('\n')[0]);
const freezePath='catalog/product-bridge-calibrations/g678-nms-l02-p051-native-fraction-match-current-js-v1-compile-v8.json',freeze=read(freezePath);
assert.equal(pin(freezePath).sha256,'b7f8de87124f5bfe4072d77bef545414f856f3d9c1a85bfdbdbd9532eb8c670a');
for(const p of [...freeze.inputs,...freeze.outputs])assert.deepEqual(pin(p.path),p);
const prior=read('catalog/product-bridge-calibrations/g678-nms-l02-p051-native-fraction-match-current-js-v1-compile-v7.json');
const changed=['packages/demos/src/nms-l02-p051-practice-view-v1.tsx','packages/demos/src/nms-l02-p051-player-v1.tsx'];
for(const p of prior.outputs.filter(p=>p.path.startsWith('packages/demos/')||p.path.startsWith('apps/web/')))if(!changed.includes(p.path))assert.deepEqual(pin(p.path),p,'Prior evidence reuse requires unchanged dependencies');
const checksReceipt=read(external('p051-current-checks-NlbP0E/results.json'));
assert.equal(checksReceipt.passed,true);assert.equal(checksReceipt.results.length,20);
for(const row of checksReceipt.results){assert.equal(row.exitCode,0);for(const expected of [row.script,row.log]){const actual=pin(expected.path);assert.equal(abs(actual.path),abs(expected.path));assert.equal(actual.bytes,expected.bytes);assert.equal(actual.sha256,expected.sha256);}}
const semantics=read(external('p051-v8-es-semantic-current.json'));assert.equal(semantics.passed,true);assert.equal(semantics.rows.length,9);assert.ok(semantics.rows.every(r=>!r.missing.length&&!r.extra.length));
const en=result('p051-v8-en-modal-completion-replay.md'),es=result('p051-v8-es-modal-regression.md');
for(const r of [en.modal,es]){assert.equal(r.rows.length,6);assert.ok(r.rows.every(r=>r.pass&&r.modalStack.outer&&r.modalStack.nested&&r.restored.term===r.term&&r.after.item==='1'));}
assert.equal(en.complete,'503');assert.equal(en.replay.frame,'1');assert.ok(en.readingOrder.includes('math "7/8"'));
const responsive=read(external('p051-v8-responsive-modal.json')),touch=read(external('p051-v8-touch-density.json')),lifecycle=read(external('p051-v8-lifecycle-current.json'));
assert.ok(responsive.passed&&responsive.rows.length===20&&responsive.rows.every(r=>!r.overflow.length&&r.modal));
assert.ok(touch.passed&&touch.rows.length===6&&touch.rows.every(r=>r.locked&&r.solved==='0.1'));
assert.ok(lifecycle.passed&&lifecycle.rows.length===4&&lifecycle.rows.filter(r=>r.edge==='next').every(r=>r.contexts.every(c=>c==='closed')));
for(const n of ['p051-v7-en-practice-matrix.md','p051-v7-es-intro-paused-matrix.md']){const rows=result(n);assert.equal(rows.length,10);assert.ok(rows.every(r=>!r.overflow.length));}
const fallback=result('p051-v7-complete-font-fallback.md');assert.equal(fallback.rows.length,10);assert.ok(fallback.rows.every(r=>!r.overflow.length));assert.equal(fallback.fallback.math.length,5);assert.equal(fallback.fallback.overflow.length,0);
const timing=result('p051-v7-local-timing-probe.md');assert.equal(timing.backtracks,0);assert.ok(Math.abs(timing.advance-timing.expectedAdvance)<2);
const times=[read(external('p051-v7-replay-readiness-sample1.json')),result('p051-v7-replay-readiness-sample2.md')];assert.ok(times.every(t=>Math.abs(t.elapsedMs-t.sourceNominalMs)<1000));
const production=read(external('p051-production-negative-EQMB7L/receipt.json'));assert.equal(production.status,'PASS');assert.equal(production.freeze.sha256,pin(freezePath).sha256);assert.equal(production.routes.length,19);assert.ok(production.routes.every(r=>r.status===404));assert.equal(production.payloadHits.length,0);assert.equal(production.pointerRestored,true);
assert.equal(read(external('p051-v8-current-tests-typecheck.json')).exitCode,0);
const bindingPath='catalog/typography-v1/g678-page-bindings/'+id+'.json',recordPath='catalog/typography-v1/g678-checks/'+id+'.json',dest='migrations/'+id+'/evidence/typography-current-js-v1';
assert.ok(!fs.existsSync(abs(bindingPath))&&!fs.existsSync(abs(recordPath))&&!fs.existsSync(abs(dest)));
const binding=read('catalog/typography-v1/g678-page-bindings/'+id+'.prepared-v1.json');
const implementation=new Map(freeze.outputs.filter(p=>p.path.startsWith('apps/web/')||p.path.startsWith('packages/demos/')).map(p=>[p.path,p]));
for(const p of read('catalog/typography-v1/g678-integration.json').sharedFiles){assert.equal(pin(p.path).sha256,p.sha256);implementation.set(p.path,pin(p.path));}
const gate=pin('apps/web/lib/g678-nms-l02-p051-freeze-v1.ts');implementation.set(gate.path,gate);
binding.implementation={files:[...implementation.values()]};delete binding.preparationOnly;binding.unresolved=[];
const names=['p051-v8-es-semantic-current.json','p051-v8-en-modal-completion-replay.md','p051-v8-es-modal-regression.md','p051-v8-responsive-modal.json','p051-v8-touch-density.json','p051-v8-lifecycle-current.json','p051-v8-current-tests-typecheck.json','p051-v8-registry-scope.json','p051-v7-en-practice-matrix.md','p051-v7-es-intro-paused-matrix.md','p051-v7-complete-font-fallback.md','p051-v7-local-timing-probe.md','p051-v7-replay-readiness-sample1.json','p051-v7-replay-readiness-sample2.md','p051-v7-semantic-browser-en.md','p051-v7-semantic-fixtures.json','p051-production-negative-EQMB7L/receipt.json','p051-current-checks-NlbP0E/results.json'];
const sources=[...names.map(external),...checksReceipt.results.map(r=>r.log.path)];
fs.mkdirSync(abs(dest),{recursive:true});const artifacts=[];
for(const [i,p] of sources.entries()){const f=dest+'/'+String(i).padStart(3,'0')+'-'+path.basename(p);fs.writeFileSync(abs(f),fs.readFileSync(p),{flag:'wx'});artifacts.push(pin(f));}
for(const n of new Set(Object.values(binding.sourceRiskEvidence).flat()))artifacts.push(pin('migrations/'+id+'/audit/'+n));
for(const f of [freezePath,'scripts/check-nms-l02-p051-semantic-dom-v1.tsx','scripts/check-nms-l02-p051-modal-browser-v2.js','scripts/check-nms-l02-p051-modal-suspension-v1.tsx','scripts/check-g678-versioned-test-successors-v1.mjs','scripts/nms-l02-p046-unit-css-hook.mjs','packages/demos/tsconfig.current-tests-v1.json','packages/demos/tests/nms-l02-p044-audio-pcm-v2.test.ts','packages/demos/tests/nms-l02-p046-module-v2.test.ts','output/playwright/p051-v8-nested-es-320-32.png'])artifacts.push(pin(f));
const basis={
 sourceBinding:'Exact current source/freeze523 bindings; shared source parser rechecks source catalog and IDs.',
 semanticText:'2464 current SSR multiset states, current ES9 browser states; unchanged EN copy plus v8 EN AX snapshot and retained v7 EN9-state content probe.',
 mathSemantics:'Five fraction math labels and decimal targets, source-bound state/answer-order checks, complete503 and Replay1.',
 timingAndReplay:'Source12fps/frame boundaries, current EN/ES completion and Replay; unchanged clock/session timing probes retained.',
 teachingTextDisposition:'133 shape roles,13 bitmap intake roles, source text inclusion/exclusion and54 native bilingual roles are pinned.',
 hostIntegration:'Actual registered v8 EN/ES My Lesson interactions, current two-cycle Next/Previous lifecycle; production isolation.',
 responsiveTypography:'Current20 modal width/font cases and6 density/orientation profiles; unchanged CSS/intro/outro prior10-case matrices and forced-font fallback reused only for those scopes.',
 accessibility:'Current12 keyboard nested-modal cases, focus restoration, semantic table/math reading order, reduced motion and emulated touch. Not a screenreader or physical-device certification.',
 bilingualPolicy:'English source teaching content; maintained Spanish teaching translation/source XML glossary; English source narration is explicitly labeled.',
 performance:'Repeated fixed-profile v7 first-ready measurements and10sec frame/rAF sample bind unchanged clock/audio code; v8 repeated input/modal and navigation do not duplicate players or contexts. No cross-device performance guarantee.',
 lifecycle:'Current touch/orientation/zoom retains solved state; nested modals retain outer modality; leaving closes contexts and returning mounts one active context.',
 resourceStability:'Current v8 production build,19 private404 routes,698 static JS scanned with0 marker hits; source/audio/loader checks and lifecycle pass.'
};
const record={kind:'g678-lesson-typography-check-v1',placementId:id,sourceSwfSha256:binding.sourceSwfSha256,bindingSha256:'',checkedAt:new Date().toISOString(),checks:Object.fromEntries(Object.keys(basis).map(k=>[k,'passed'])),checkBasis:basis,languagePolicy:{en:'source',es:'translated'},resolvedSourceRisks:Object.keys(binding.sourceRiskEvidence),sourceRiskDisposition:binding.sourceRiskEvidence,technicalScope:'Local native Current-JS typography engineering only. No original-runtime fidelity, named listening, human/Owner, strict completion, release or publication acceptance.',candidateScope:{freeze:pin(freezePath),boundedDeltaFromV7:changed,evidenceReuse:'Only unchanged content/layout/timing scopes reused; changed modal/input behavior rechecked under v8.',limitations:['Native matching adapts unresolved outer instance3 alias; no Flash parity claim.','Source decorative audio entry/listening remains independently pending.','Default frozen demos tsconfig retains two historical test typing errors; versioned strict current test config passes with all assertions preserved.','DOM multisets are not full screenreader certification; screenshot inspection was performed by the agent, not a named human.']},independentPending:binding.independentPending,humanReviewPassed:0,artifacts};
const out=JSON.stringify(binding,null,2)+'\n';record.bindingSha256=sha(out);
fs.writeFileSync(abs(bindingPath),out,{flag:'wx'});fs.writeFileSync(abs(recordPath),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({binding:pin(bindingPath),record:pin(recordPath),implementationFiles:implementation.size,artifacts:artifacts.length}));
