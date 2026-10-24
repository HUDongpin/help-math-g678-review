import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAudit} from './extract-alg-l06-p015-audio-v1.mjs';
const root='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6';
test('P015 stream preserves four disjoint source ranges and exact independently decoded PCM',()=>{
 const {report,outputs}=buildAudit(readFileSync(`${root}/VB/L6VB06.swf`),readFileSync(`${root}/SA/L6VB06.mp3`));
 assert.equal(report.domainCount,2);assert.equal(report.streams.length,1);
 const main=report.streams[0];assert.equal(main.domain,'sprite-270');
 assert.equal(main.declaredFrames,914);assert.equal(main.decode.samples,1608768);
 assert.deepEqual(main.contiguousRanges.map(r=>[r.firstFrame,r.lastFrame,r.decode.samples,r.firstPacket.rawSeekSamples]),[[2,622,1138752,1673],[646,702,103104,336],[712,849,251136,42],[852,914,115776,326]]);
 assert.deepEqual(report.trailers,[]);assert.equal(main.absentBlockFrames.length,34);
 assert.equal(outputs.length,7);assert.equal(report.separateSa.decode.samples,1247616);
 assert.equal(report.limits.audioAccepted,false);assert.equal(report.limits.separateSaSplicedIntoMain,false);assert.equal(report.limits.localeChangeStartsSa,false);
});
test('wrong source fails before decoding',()=>assert.throws(()=>buildAudit(Buffer.alloc(1),Buffer.alloc(1)),/Expected values/));
