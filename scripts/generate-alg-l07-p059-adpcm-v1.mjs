import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import{decodeSwfAdpcmBlocks,encodePcm16LeWav}from'./lib/swf-adpcm.mjs';
const B='migrations/shared-alg001-l07-p059',V='/Volumes/American Dream/.g6p5960a1/shared-alg001-l07-p059/source-v1';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),s=JSON.parse(fs.readFileSync(B+'/native-v1/adpcm-source-v1.json'));
const raw=fs.readFileSync(V+'/stream-67.adpcm.bin');assert.equal(sha(raw),s.sourceSha256);
const blocks=s.blocks.map(b=>({bytes:Buffer.from(b.hex,'hex'),sampleCountPerChannel:b.sampleCountPerChannel}));assert.deepEqual(Buffer.concat(blocks.map(b=>b.bytes)),raw);
const d=decodeSwfAdpcmBlocks(blocks,{channels:1});assert.equal(d.sampleCountPerChannel,5967);
assert(d.decodedBlocks.every(b=>b.codeSizeBits===5&&b.packetCount===1&&b.paddingBitCount===6&&b.paddingValue===0));
const wav=encodePcm16LeWav(d.pcm16,{sampleRateHz:5512,channels:1});
function put(p,b){if(process.argv.includes('--check')||fs.existsSync(p))assert.deepEqual(fs.readFileSync(p),b);else fs.writeFileSync(p,b,{flag:'wx'});}
put(V+'/stream-67.wav',wav);
const report={pass:true,spriteId:67,source:s.sourceSha256,sourceSampleRate:5512,sourceNominalRate:5512.5,sourceSamples:5967,blockFrames:s.blocks.map(b=>b.frame),sourceBytes:wav.length,sourceSha256:sha(wav),browserSampleRate:22050,browserMeasured:false,hostEntryFrame:2,entryTargetSample:Math.ceil(459*22050/5512),resamplerPhaseVerified:false,listeningAccepted:false,decoder:{path:'scripts/lib/swf-adpcm.mjs',sha256:sha(fs.readFileSync('scripts/lib/swf-adpcm.mjs'))}};
put(B+'/native-v1/adpcm-decode-v1.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));console.log(JSON.stringify(report));
