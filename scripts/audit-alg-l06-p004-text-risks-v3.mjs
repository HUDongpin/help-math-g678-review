/** Current implementation inventory; preserves unresolved source risks and old observations. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target='migrations/shared-alg001-l06-p004/audit/text-risks-v3.json';
const predecessor='migrations/shared-alg001-l06-p004/audit/text-risks-v2.json';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=p=>fs.readFileSync(path.join(root,p));
const pin=p=>({path:p,bytes:bytes(p).length,sha256:sha(bytes(p))});
const priorPin=pin(predecessor);
assert.equal(priorPin.sha256,'6c5b0cfabe20fe6f1b4a58c8bf72c7891537c9541b114ee132d878ec04db724c');
const prior=JSON.parse(bytes(predecessor));
const oldSemantic='output/alg-l06-p004-reading-order-v1/predecessor/alg-l06-p004-semantic-text-v1.ts';
assert.equal(pin(oldSemantic).sha256,prior.implementedNativeSemanticPin.sha256);
for(const p of [prior.sourceCatalog,...prior.composedEvidence,prior.bitmapReviewPin])
  assert.deepEqual(pin(p.path),p,'unchanged structural/composed evidence');
const added=[
  'packages/demos/src/modules/shared-alg001-l06-p004.tsx',
  'packages/demos/src/alg-l06-p004-text-presentation-v1.tsx',
  'packages/demos/tests/alg-l06-p004-text-presentation-v1.test.tsx',
  'apps/web/tests/alg-l06-p004-text-presentation-integration.test.tsx',
];
const currentFiles=[...new Set([...prior.nativeInputPins.map(p=>p.path),...added])].sort().map(pin);
const result={schemaVersion:1,kind:'alg-l06-p004-text-risk-inventory-v3',animationId:prior.animationId,
 status:'current-presentation-and-unique-reading-orders-implemented-source-risks-still-open',
 predecessor:priorPin,sourcePins:prior.sourcePins,sourceCatalog:prior.sourceCatalog,
 composedEvidence:prior.composedEvidence,bitmapReviewPin:prior.bitmapReviewPin,
 nativeInputPins:currentFiles,
 implementedNativeSemanticPin:pin(prior.implementedNativeSemanticPin.path),
 preservedSemanticInput:pin(oldSemantic),
 sourceMaskSentencePolicy:prior.sourceMaskSentencePolicy,
 readingOrderDecision:{policy:'unique spaced source-instance orders; semantic equation occupies the intervening slot at its first constituent',
  reason:'The formal typography checker requires unique language/order pairs even for hidden blocks.',
  test:pin('packages/demos/src/alg-l06-p004-semantic-text-v1.test.ts'),
  observation:pin('output/alg-l06-p004-reading-order-v1/tests-final.log'),
  boundary:'All831 visible block sequences equal the pre-existing source semantic sequence; spatial grouping remains unresolved.'},
 presentationDecision:{policy:'original Canvas plus native companion; shared existing-clock snapshot',
  observation:pin('output/alg-l06-p004-presentation-integration-v1/verification.json'),
  applicability:'The preceding focused browser evidence is historical after this reading-order metadata change; it is not a full current matrix.'},
 rows:prior.rows,
 nextGap:'Resolve source teaching-layout risks, full technical matrix and current production validation before formal typography/admission.',
 gates:prior.gates};
const output=Buffer.from(JSON.stringify(result,null,2)+'\n');
const mode=process.argv[2];assert(['--prepare','--check'].includes(mode)&&process.argv.length===3);
if(mode==='--prepare')fs.writeFileSync(path.join(root,target),output,{flag:'wx'});
else assert.deepEqual(bytes(target),output,'current risk inventory drift');
console.log(JSON.stringify({status:'pass',mode,pin:pin(target),acceptanceEffect:'none'}));
