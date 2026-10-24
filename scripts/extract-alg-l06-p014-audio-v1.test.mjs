import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildAudit} from './extract-alg-l06-p014-audio-v1.mjs';
const root='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6';
test('exact source preserves feedback domains, quiz gap, signed seek and orphan trailer',()=>{
 const {report,outputs}=buildAudit(readFileSync(`${root}/VB/L6VB05.swf`),readFileSync(`${root}/SA/L6VB05.mp3`));
 assert.deepEqual(report.streams.map(s=>[s.domain,s.decode.samples]),[
  ['sprite-28',45504],['sprite-83',52992],['sprite-115',43776],['sprite-148',48960],
  ['sprite-156',47232],['sprite-173',52992],['sprite-187',51264],['sprite-227',795456]]);
 const main=report.streams.at(-1);
 assert.deepEqual(main.contiguousRanges.map(r=>[r.firstFrame,r.lastFrame]),[[2,110],[125,449]]);
 assert.deepEqual(main.zeroPayloadBlocks.map(b=>[b.frame,b.rawSeekSamples]),[[3,0],[110,-1924]]);
 assert.deepEqual(report.trailers.map(t=>[t.domain,t.bytes,t.sha256]),[
  ['sprite-83',386,'d14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0']]);
 assert.equal(outputs.length,12);assert.equal(report.separateSa.decode.samples,466560);
 assert.equal(report.limits.audioAccepted,false);assert.equal(report.limits.separateSaSplicedIntoMain,false);
});
test('wrong source fails before extraction or decoding',()=>{
 assert.throws(()=>buildAudit(Buffer.alloc(1),Buffer.alloc(1)),/Expected values/);
});
