import assert from 'node:assert/strict';
import test from 'node:test';
import {resolveMeasuredSourceDecoderProfile as resolve} from '../src/measured-source-decoder-profiles-v1';
const binding={sourceSha256:'15578b29985566e60245259470926550a22f31435bc56e5bd3d2a739e4588bb5',sourceBytes:347360,sampleRate:22050,channels:1 as const,decodedSamples:1539072,pcmSha256:'039068574f980a0b164d3439c697bd8f8fe1c9b4fa3f39e54f382a271ee3e087'};
const measured='635a80ec488a5f5b15a07f4d037dfbdcd8e24f5abeff0328b46e5669c43a6593';
test('exact measured Chrome156 profile changes only expected full PCM digest',()=>{
 for(const agent of ['Chrome/156.0.8078.47','Mozilla/5.0 HeadlessChrome/156.0.0.0 Safari/537.36'])assert.deepEqual(resolve(binding,agent),{...binding,pcmSha256:measured});
 assert.equal(binding.pcmSha256,'039068574f980a0b164d3439c697bd8f8fe1c9b4fa3f39e54f382a271ee3e087');
});
test('unmeasured versions and other engines preserve their existing exact digest',()=>{
 for(const agent of ['Chrome/155.0.0.0','Chrome/157.0.0.0','Firefox/156.0','NotChrome/156.0',''])assert.equal(resolve(binding,agent),binding);
});
test('other source, format, size, length or unrecognized declared digest never selects profile',()=>{
 for(const change of [{sourceSha256:'a'.repeat(64)},{sourceBytes:1},{sampleRate:48000},{channels:2 as const},{decodedSamples:123},{pcmSha256:'b'.repeat(64)}]){
  const changed={...binding,...change};assert.equal(resolve(changed,'Chrome/156.0.8078.47'),changed);
 }
});
test('P040 exact measured source has a distinct bound PCM profile',()=>{
 const p040={sourceSha256:'bf6cbc0d490526ed4dec3b7566204cb22057a09a37be6fbe61d2367143caaaad',sourceBytes:78260,sampleRate:22050,channels:1 as const,decodedSamples:346752,pcmSha256:'fa46206bcba3c6ad8edb38739a0c84ee791058c126eed5fdc7064834a2083eb9'};
 assert.equal(resolve(p040,'Chrome/156.0.8078.47').pcmSha256,'d7dfc9dcd175f32857debb33ca6279df7be3497115c6defa97cb7d935747df7a');
});
