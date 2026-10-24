import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDomainAudio} from './swf-domain-audio-v1.mjs';
const tag=(code,body=Buffer.alloc(0))=>{const h=Buffer.alloc(2);h.writeUInt16LE((code<<6)|body.length);return Buffer.concat([h,body]);};
const block=value=>tag(19,Buffer.from([1,0,255,255,value]));
function swf(tags){const header=Buffer.from([70,87,83,6,0,0,0,0,8,0,0,12,1,0]);const out=Buffer.concat([header,...tags]);out.writeUInt32LE(out.length,4);return out;}
test('isolates root and nested audio, signed seek and post-End bytes',()=>{
 const nested=tag(39,Buffer.concat([Buffer.from([7,0,1,0]),block(22),tag(1),tag(0),Buffer.from([99,88])]));
 const d=extractDomainAudio(swf([nested,block(11),tag(1),tag(0)]));
 assert.equal(d[0].blocks[0].payload[0],11);assert.equal(d[1].blocks[0].payload[0],22);
 assert.equal(d[1].blocks[0].seek,-1);assert.equal(d[1].trailer.hex,'6358');
});
test('rejects tag crossing its own timeline and absent End',()=>{
 assert.throws(()=>extractDomainAudio(swf([Buffer.from([0xff,4,10,0,0,0])])),/boundary/);
 assert.throws(()=>extractDomainAudio(swf([tag(1)])),/missing End/);
});
