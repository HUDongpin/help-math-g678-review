import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {build,candidateDecodedSampleAtFrame,run}
 from './extract-alg-l06-p025-audio-v1.mjs';

const ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const source=()=>readFileSync(`${ROOT}/G6-G8-shared/ALG001/L6/VB/L6VB18.swf`);
const spanish=()=>readFileSync(`${ROOT}/G6-G8-shared/ALG001/L6/SA/L6VB18.mp3`);
const prior=()=>readFileSync('output/alg-l06-p025-source-audit-v1/source-audit-v1.json');
const blocks=()=>readFileSync('output/alg-l06-p025-source-audit-v1/audio-stream-blocks-v1.json');
const priorMp3=()=>readFileSync('output/alg-l06-p025-source-audit-v1/sprite-21-embedded-source-v1.mp3');
const script=()=>readFileSync('scripts/extract-alg-l06-p025-audio-v1.mjs');

test('physical sprite-21 is one contiguous 298-block MP3 with exact empty frame 3',()=>{
 const check=run('--check');
 assert.deepEqual([check.mainBlocks,check.mainSamples,check.separateSaSamples],
  [298,547200,593280]);
 const audit=JSON.parse(readFileSync('output/alg-l06-p025-audio-v1/audio-source-audit-v1.json'));
 assert.deepEqual(audit.domains.map(d=>[d.id,d.declaredFrames,d.blockCount,d.trailer]),
  [['root',10,0,null],['sprite-21',299,298,null]]);
 assert.deepEqual(audit.main.packets.map(p=>p.frame),
  Array.from({length:298},(_,i)=>i+2));
 assert.equal(audit.main.packets.reduce((n,p)=>n+p.declaredSamples,0),547200);
 assert.deepEqual(audit.main.zeroPayloadBlocks.map(p=>
  [p.frame,p.mp3PayloadBytes,p.declaredSamples,p.seekSamples]),[[3,0,0,0]]);
 assert.deepEqual(audit.main.negativeSeekBlocks,[]);
 assert.deepEqual([audit.main.packets[0].seekSamples,
  audit.main.packets.at(-1).frame],[1673,299]);
 assert.equal(audit.main.extractedMp3.sha256,
  'e6122c6402e0000f810b82a6f91b76b50a918a44b75709194b2cec3834a201c4');
 assert(readFileSync(audit.main.extractedMp3.path).equals(priorMp3()),
  'exact source MP3 payload; no synthetic silence');
});

test('sample boundary preserves the visual tail without a second audio range',()=>{
 const plan=JSON.parse(readFileSync('output/alg-l06-p025-audio-v1/audio-domain-plan-v1.json'));
 assert.deepEqual(plan.main.blockRange,[2,299]);
 assert.equal(plan.main.frameDomain,'sprite-21');
 assert.equal(plan.main.fps,12);
 assert.equal(plan.policy.singleMainRange,true);
 assert.equal(plan.policy.noInventedSilence,true);
 assert.equal(candidateDecodedSampleAtFrame(1),null);
 assert.equal(candidateDecodedSampleAtFrame(2),1673);
 assert.equal(candidateDecodedSampleAtFrame(298),545573);
 assert.equal(candidateDecodedSampleAtFrame(299),547200);
 assert(plan.main.candidateNativeEndFrame>298&&plan.main.candidateNativeEndFrame<299);
 assert(plan.main.visualTailFrames>0&&plan.main.visualTailFrames<1);
 assert.equal(plan.policy.browserDecodeObserved,false);
 assert.equal(plan.policy.originalRuntimeSyncAccepted,false);
 assert.throws(()=>candidateDecodedSampleAtFrame(300));
});

test('independent SA is copied exactly, explicit-only, and never joined with the source',()=>{
 const plan=JSON.parse(readFileSync('output/alg-l06-p025-audio-v1/audio-domain-plan-v1.json'));
 const sa=plan.optionalSpanishAudio;
 assert.equal(sa.asset.sha256,
  '295dcabe0549764ffe03ecc4e6a332a5cb85d05329095be079ad32bdac6a044e');
 assert(readFileSync(sa.asset.path).equals(spanish()));
 assert.equal(sa.ffmpegDecode.samples,593280);
 assert.deepEqual([sa.activation,sa.localeAutoplay,sa.joinedWithMain],
  ['explicit-user-only',false,false]);
 assert.equal(plan.policy.listeningAccepted,false);
 assert.equal(plan.policy.audioAccepted,false);
});

test('SWF, SA, or audited block tampering fails before emitting candidate output',()=>{
 const args=[source(),spanish(),prior(),blocks(),priorMp3(),script()];
 const wrongSwf=Buffer.from(args[0]);wrongSwf[40]^=1;
 assert.throws(()=>build(wrongSwf,...args.slice(1)),/SHA-256|Expected values to be strictly equal/);
 const wrongSa=Buffer.from(args[1]);wrongSa[40]^=1;
 assert.throws(()=>build(args[0],wrongSa,...args.slice(2)),/SHA-256|Expected values to be strictly equal/);
 const wrongBlocks=Buffer.from(args[3]);wrongBlocks[100]^=1;
 assert.throws(()=>build(args[0],args[1],args[2],wrongBlocks,args[4],args[5]),
  /SHA-256|Expected values to be strictly equal/);
});
