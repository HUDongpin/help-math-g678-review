/** Shared immutable input closure for the formal P003 browser probes. Read only. */
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readOrdinary,readJsonPin,readPin,readRegistryTransaction,readPageProof,verifyHostVersion,uniquePins} from '../lib/g678-admission-proof.mjs';
import {ID,ARTIFACTS,MEMBER,RUN,OPTIONAL_SPANISH,readP003CanonicalSource,validateP003AdmissionSemantics} from '../lib/alg-l06-p003-admission-semantics-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ACTIVATION='apps/web/lib/g678-admission-activation.ts';
export const FORMAL_INPUTS=Object.freeze([
 'scripts/probe-alg-l06-p003-formal-inputs-v1.mjs',
 'apps/web/lib/alg-l06-p003-formal-base-v1.server.ts',
 'apps/web/lib/alg-l06-p003-formal-admission-v1.server.ts',
 'apps/web/lib/alg-l06-p003-descriptor-extension-v1.ts',
 'lib/alg-l06-p003-admission-semantics-v1.mjs','lib/g678-admission-proof.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2/page.tsx',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/continuous-source-v2/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/canvas-renderer.js/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p003/optional-spanish-audio-v1/route.ts',
 'apps/web/lib/alg-l06-p003-optional-spanish-v1.server.ts',
 'apps/web/lib/alg-l06-p003-optional-spanish-access-v1.ts',
 'packages/demos/src/alg-l06-p003-optional-spanish-audio-v1.ts',
 'packages/demos/src/decoded-source-stream-transport.ts',
 'packages/demos/private-current-js-registry.json',
 'packages/demos/src/registry.local-only.generated.ts',
 'packages/demos/src/registry.local-only.metadata.generated.ts',ACTIVATION,
]);
export function formalInputPins(){
 const activation=readOrdinary(ROOT,ACTIVATION).toString();
 const match=activation.match(/export const G678_ADMISSION_INDEX\s*=\s*(\{[\s\S]*?\})\s*as const;/u);
 assert(match,'exact admission activation pin');
 const indexPin=JSON.parse(match[1]);
 assert.equal(indexPin.path,'catalog/g678-admission-v1/index-v18.json');
 const index=readJsonPin(ROOT,indexPin);
 assert.equal(index.host.path,'catalog/g678-admission-v1/host-v18.json');
 const host=verifyHostVersion(ROOT,index.host),transaction=readRegistryTransaction(ROOT);
 const entries=index.pages.filter(row=>row.animationId===ID);
 assert.equal(entries.length,1,'one actual formal P003 proof');
 const proofPin=entries[0].proof,proof=readJsonPin(ROOT,proofPin);
 const packet=readPageProof(ROOT,proofPin,host,transaction);
 const registration=transaction.registry.calibrations.find(row=>row.calibrationId===packet.calibrationId);
 validateP003AdmissionSemantics(packet,registration);readP003CanonicalSource(ROOT);
 const scoped=transaction.registry.calibrations.flatMap(row=>row.entries).filter(row=>row.key.startsWith('shared-alg001-l06-'));
 assert.equal(scoped.length,20,'20 actual registered ALG L6 pages');
 const pins=uniquePins([...FORMAL_INPUTS.map(file=>pinFile(ROOT,file)),indexPin,index.host,proofPin,
  ...host.files,...proof.files,packet.freezeManifest,...Object.values(ARTIFACTS),MEMBER,RUN,OPTIONAL_SPANISH.asset]);
 for(const pin of pins)readPin(ROOT,pin);
 const external=proof.external.map(item=>{readPin(item.root,item.pin);return {...item.pin,path:path.join(item.root,item.pin.path)};});
 return uniquePins([...pins,...external]);
}
export async function assertFormalHost(page){
 assert.equal(await page.locator('main[data-p003-host-probe]').getAttribute('data-p003-host-probe'),'registered-current-js');
 assert.equal(await page.locator('[data-lesson-player]').getAttribute('data-renderer-availability'),'registered');
 assert.equal(await page.locator('[data-lesson-player]').getAttribute('data-current-animation-id'),ID);
 const text=await page.locator('body').innerText();
 assert(text.includes('20/60'),'20 actual registered lesson pages');
 assert(!text.includes('1 unregistered candidate pages')&&!text.includes('1 páginas candidatas sin registrar'),'no simulated unregistered candidate disclosure');
}
