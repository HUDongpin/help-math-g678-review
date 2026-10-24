import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {decompressSwf} from '../build-g4-l3-swf-asset-definition-census.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
/** Read each SWF timeline separately. Preserve bytes after End as evidence, never as tags. */
export function extractDomainAudio(source){
 const {bytes}=decompressSwf(source);
 assert.equal(bytes.readUInt32LE(4),bytes.length,'declared decompressed size');
 const rectBytes=Math.ceil((5+4*(bytes[8]>>3))/8);
 const domains=[];
 function walk(start,end,id,declaredFrames){
  assert(!domains.some(d=>d.id===id),'unique domain');
  const domain={id,declaredFrames,heads:[],blocks:[],observedFrames:0,trailer:null};
  domains.push(domain);let cursor=start,frame=1,ended=false;
  while(cursor<end){
   assert(cursor+2<=end,'truncated tag header');
   const offset=cursor,header=bytes.readUInt16LE(cursor);cursor+=2;
   const code=header>>6;let length=header&63;
   if(length===63){assert(cursor+4<=end,'truncated long tag header');length=bytes.readUInt32LE(cursor);cursor+=4;}
   assert(cursor+length<=end,'tag crosses timeline boundary');
   const body=bytes.subarray(cursor,cursor+length);cursor+=length;
   if(code===0){assert.equal(length,0,'End length');ended=true;
    if(cursor<end){const trailing=bytes.subarray(cursor,end);domain.trailer={offset:cursor,bytes:trailing.length,sha256:hash(trailing),hex:trailing.toString('hex')};}
    break;
   }
   if(code===1){assert.equal(length,0,'ShowFrame length');frame++;domain.observedFrames++;}
   if(code===39){assert(length>=4,'DefineSprite header');walk(cursor-length+4,cursor,`sprite-${body.readUInt16LE(0)}`,body.readUInt16LE(2));}
   if(code===18||code===45){assert(length>=4,'stream head');domain.heads.push({frame,offset,hex:body.toString('hex')});}
   if(code===19){assert(length>=4,'MP3 block header');domain.blocks.push({frame,offset,samples:body.readUInt16LE(0),seek:body.readInt16LE(2),payload:Buffer.from(body.subarray(4))});}
  }
  assert(ended,`missing End in ${id}`);
  assert.equal(domain.observedFrames,declaredFrames,`frame count in ${id}`);
 }
 walk(8+rectBytes+4,bytes.length,'root',bytes.readUInt16LE(8+rectBytes+2));
 return domains;
}
