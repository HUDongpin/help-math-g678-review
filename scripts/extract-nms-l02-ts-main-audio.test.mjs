import test from 'node:test';
import assert from 'node:assert/strict';
import {buildP055Audio} from './extract-nms-l02-ts-main-audio.mjs';

test('P055 source stream preserves SWF block semantics separately from decoded MP3',()=>{
  const {index,files}=buildP055Audio();
  assert.equal(index.source.sha256,
    '8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e');
  assert.equal(index.frameDomain.id,'sprite-26');
  assert.equal(index.frameDomain.declaredFrames,351);
  assert.equal(index.blockCount,347);
  assert.deepEqual(index.framesWithoutBlock,[1,2,3,4]);
  assert.deepEqual(index.emptyPayloadBlockFrames,[6]);
  assert.deepEqual(index.negativeSeekBlocks,[]);
  assert.equal(index.blocks[0].localFrame,5);
  assert.equal(index.blocks.at(-1).localFrame,351);
  assert.equal(index.streamHead.mp3LatencySeek,1673);
  assert.equal(index.declaredBlockHeaderSamples,637056);
  assert.equal(index.decode.decodedSamples,637056);
  assert.equal(index.mp3.sha256,
    'ca2a80e75f1fc25d4ff0696af4cc1ccfcec87a1518bbc88eda998b855865a20b');
  assert.notEqual(index.mp3.sha256,index.separateLessonSaCandidate.sha256);
  assert.equal(index.qualifications.audioAccepted,false);
  assert.equal(files[0].bytes.length,index.mp3.bytes);
});
