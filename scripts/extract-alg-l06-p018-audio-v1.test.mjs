import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAudit,run} from './extract-alg-l06-p018-audio-v1.mjs';

const source='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6';
const swf=()=>readFileSync(`${source}/VB/L6VB11.swf`);
const sa=()=>readFileSync(`${source}/SA/L6VB11.mp3`);

test('P018 extracts one exact contiguous sprite-32 stream and keeps SA separate',()=>{
 const {report,outputs}=buildAudit(swf(),sa());
 assert.equal(report.domainCount,3);
 assert.equal(report.streamCount,1);
 assert.equal(report.trailers.length,0);
 const main=report.streams[0];
 assert.equal(main.domain,'sprite-32');
 assert.equal(main.declaredFrames,648);
 assert.equal(main.streamHead.hex,'0a2a2d078906');
 assert.equal(main.blockCount,647);
 assert.equal(main.declaredSamples,1188288);
 assert.deepEqual(main.contiguousRanges.map(r=>[r.firstFrame,r.lastFrame]),[[2,648]]);
 assert.deepEqual(main.absentBlockFrames,[]);
 assert.deepEqual(main.zeroPayloadBlocks.map(r=>r.frame),[3]);
 assert.equal(main.packets[0].rawSeekSamples,1673);
 assert.equal(main.packets.at(-1).rawSeekSamples,554);
 assert(main.packets.every(r=>r.rawSeekSamples>=0));
 assert.equal(main.extractedMp3.bytes,268190);
 assert.equal(main.extractedMp3.sha256,'dbdb6229947cde1d0353c3ccc41e05514ac988559b49d26c9f8f52d637a59770');
 assert.equal(main.decode.samples,1188288);
 assert.equal(report.separateSa.copy.sha256,'1d6f1de82903f62e5c642ce0e51b1baa03ec30c1fbfbcd46f135e2c4d5538057');
 assert.equal(report.separateSa.decode.samples,1056384);
 assert.deepEqual(outputs.map(([path])=>path),[
  'migrations/shared-alg001-l06-p018/audit/audio-v1/sprite-32-source-v1.mp3',
  'migrations/shared-alg001-l06-p018/audit/audio-v1/separate-sa-source-v1.mp3',
  'migrations/shared-alg001-l06-p018/audit/audio-v1/audio-source-audit-v1.json']);
 assert.equal(report.limits.audioAccepted,false);
 assert.equal(report.limits.separateSaSplicedIntoMain,false);
 assert.equal(report.limits.localeChangeStartsSa,false);
});

test('P018 physical source pins fail closed',()=>{
 assert.throws(()=>buildAudit(Buffer.alloc(1),sa()));
 assert.throws(()=>buildAudit(swf(),Buffer.alloc(1)));
});

test('P018 immutable generated outputs reproduce exactly',()=>{
 const result=run('--check');
 assert.equal(result.outputs.length,3);
 assert.equal(result.audioAccepted,false);
});
