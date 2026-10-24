#!/usr/bin/env node
/** Seal reviewed current host inputs independently of page registration. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor} from '../lib/nms-l02-successor-proof.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const NMS_HOST_FILES=Object.freeze([
 'lib/nms-l02-successor-proof.mjs','lib/g678-admission-proof.mjs',
 'scripts/prepare-nms-l02-successor-host.mjs',
 'apps/web/lib/nms-l02-successor-admission.server.ts',
 'apps/web/lib/nms-l02-successor.production-stub.tsx',
 'apps/web/lib/nms-l02-ts-pilot-assets.server.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p055/page.tsx',
 'apps/web/app/migration-assets/nms-l02-ts-pilot/[asset]/route.ts',
 'apps/web/components/g678-nms-l02-successor-lesson.tsx',
 'apps/web/components/nms-l02-p055-host.css',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'scripts/prepare-nms-l02-successor-wrapper.mjs','scripts/prepare-nms-l02-successor-wrapper.test.mjs',
 'scripts/prepare-nms-l02-candidate-player.mjs','scripts/prepare-nms-l02-candidate-player.test.mjs',
 'output/nms-l02-host-successor-20260927/wrapper/source-preservation-receipt.json',
 'output/nms-l02-host-successor-20260927/wrapper/candidate-player-source-preservation.json',
 'apps/web/components/source-glossary-lesson-runtime.tsx',
 'apps/web/tests/source-glossary-optional-spanish.test.tsx',
 'packages/demos/src/source-glossary-controls.tsx','packages/demos/src/source-glossary-session.ts',
 'packages/demos/src/source-linear-audio.ts','packages/demos/src/alg-l12-glossary-pair-audio-loader.ts',
 'packages/demos/src/contract.ts','packages/demos/src/lesson-text-contract.ts','packages/demos/src/lesson-text-snapshot.ts',
 'apps/web/lib/g678-alg-l12-p006-admission-access.ts',
 'apps/web/lib/dat-l02-p002-source-audio-access.ts','apps/web/lib/dat-l02-p002-symbol-access.ts',
 'apps/web/lib/nms-l02-p052-audio-access.ts',
 'apps/web/tests/nms-l02-p055-predecessor-audio-access.test.ts',
 'packages/demos/tests/nms-l02-p052-audio-access-v1.test.ts',
 'output/nms-l02-host-successor-20260927/host-extra-transitions.json',
 'output/nms-l02-host-successor-20260927/registry-predecessor/snapshots.json',
]);
function main(argv){
 assert(argv.length===4&&argv[0]==='--witness'&&argv[2]==='--version'&&/^v[1-9][0-9]*$/.test(argv[3]),
  'use --witness <relative witness JSON> --version vN');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local host only');
 const witnessPin=pinFile(root,argv[1]),witness=readJsonPin(root,witnessPin);
 const closure=readJsonPin(root,witness.closure);
 assert.deepEqual(closure.unresolved,[],'original bytes accounted for');
 const transitions=closure.recovered.map(item=>{
  readPin(root,item.snapshot);
  assert.deepEqual(pinFile(root,item.current.path),item.current,'reviewed current transition unchanged');
  return {original:item.original,current:item.current,snapshot:item.snapshot,reason:item.method};
 });
 const extra='output/nms-l02-host-successor-20260927/host-extra-transitions.json';
 if(fs.existsSync(path.join(root,extra))){
  const additional=JSON.parse(fs.readFileSync(path.join(root,extra),'utf8'));
  assert(Array.isArray(additional)&&additional.length===1,'one explicit P052 audio successor transition');
  assert(additional[0].original.path==='apps/web/lib/nms-l02-p052-audio-access.ts','exact additional host input');
  transitions.push(...additional);
 }
 assert(new Set(transitions.map(item=>item.original.path)).size===transitions.length,'unique host transitions');
 const files=uniquePins(NMS_HOST_FILES.map(file=>pinFile(root,file)));
 const host={schemaVersion:1,kind:'nms-l02-successor-host-v1',contract:'nms-l02-source-bound-host-v1',
  predecessor:witnessPin,files,transitions,acceptanceEffect:'none'};
 const file=`catalog/nms-l02-admission-v1/host-${argv[3]}.json`;
 fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});
 fs.writeFileSync(path.join(root,file),JSON.stringify(host,null,2)+'\n',{flag:'wx'});
 const hostPin=pinFile(root,file);
 const state=verifyNmsL02Predecessor(root,witnessPin,hostPin);
 console.log(JSON.stringify({host:hostPin,predecessor:witnessPin,
  pages:state.descriptor.pages.length,registered:state.descriptor.productBridge.registeredAnimationCount,
  registrationEffect:'none',acceptanceEffect:'none'}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2));
