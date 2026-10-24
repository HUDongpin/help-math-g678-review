import assert from 'node:assert/strict';
import test from 'node:test';
import {prepareP027Audio,proposedP027Audio,P027_AUDIO_OUTPUTS}
 from './prepare-alg-l06-p027-audio-v1.mjs';

const physical='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const withSource=fn=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=physical;
 try{return fn();}finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
};

test('P027 audio plan re-extracts the physical 769-block stream and separate SA',()=>withSource(()=>{
 const {manifest,main,sa,blocks}=proposedP027Audio();
 assert.equal(blocks.length,769);
 assert.deepEqual(blocks.map(row=>row.frame),Array.from({length:769},(_,i)=>i+2));
 assert.deepEqual(blocks[1],{frame:3,samples:0,seek:0,mp3Bytes:0,mp3Offset:780});
 assert.equal(blocks.reduce((sum,row)=>sum+row.samples,0),1412352);
 assert.equal(main.length,318760);assert.equal(sa.length,381360);
 assert.deepEqual(manifest.main.asset.path,P027_AUDIO_OUTPUTS.main);
 assert.equal(manifest.main.ffmpegPcmCandidate.samples,1412352);
 assert.equal(manifest.optionalSpanishAudio.ffmpegPcmCandidate.samples,1307520);
 assert.equal(manifest.main.browserBinding,null);
 assert.equal(manifest.optionalSpanishAudio.browserBinding,null);
 assert.equal(manifest.optionalSpanishAudio.localeAutoplay,false);
 assert.equal(manifest.optionalSpanishAudio.joinedWithMain,false);
 assert(Object.values(manifest.limits).every(value=>value===false));
}));

test('P027 source audio extraction fails closed on a compatibility root',()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH 2.0/HELP Math AWS/HELPMATH';
 try{assert.throws(()=>prepareP027Audio('--plan'),/explicit physical AWS source root/);}
 finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
});

test('P027 immutable technical audio outputs recheck from current physical bytes',()=>withSource(()=>{
 const checked=prepareP027Audio('--check');
 assert.equal(checked.status,'source-audio-technical-extraction-verified');
 assert.equal(checked.blocks,769);
 assert.equal(checked.browserDecodeObserved,false);
 assert.equal(checked.registered,false);
}));
