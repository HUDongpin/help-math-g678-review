import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {deriveP038MaskSuccessor} from './prepare-alg-l06-p038-canvas-v1.mjs';

const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IN/L6IN10.swf';
const BASE=new URL('../work/g678-shared-page-factory/alg-l06-p038-maintained-canvas-v1-20261001-v1/canvas-renderer-draft.js',import.meta.url);
const PLAN=new URL('../migrations/shared-alg001-l06-p038/native-v1/source-clip-plan-v1.json',import.meta.url);
const OUT=new URL('../migrations/shared-alg001-l06-p038/canvas-v1/canvas-renderer.js',import.meta.url);
const MANIFEST=new URL('../migrations/shared-alg001-l06-p038/canvas-v1/mask-repair-manifest-v1.json',import.meta.url);
const METADATA=new URL('../migrations/shared-alg001-l06-p038/canvas-v1/canvas-metadata-v1.json',import.meta.url);
const raw=readFileSync(BASE,'utf8');
const xml=execFileSync('swfmill',['-n','swf2xml',SOURCE,'stdout'],
  {maxBuffer:16*1024*1024}).toString('utf8');
const plan=JSON.parse(readFileSync(PLAN,'utf8'));

test('physical XML binds every one of ten shape45 clips and one exact fill changes',()=>{
  const {successor,placements}=deriveP038MaskSuccessor(raw,xml,plan);
  assert.equal(placements.length,10);
  assert.deepEqual(placements.map(row=>row.depth),
    [80,86,95,98,104,107,113,116,119,125]);
  assert.equal(successor,readFileSync(OUT,'utf8'));
  assert.equal(successor,raw.replace(
    'ctx.fillStyle=tocolor(ctrans.apply([153,255,0,0.6901961]));',
    'ctx.fillStyle="rgba(0,0,0,1)";'));
  const manifest=JSON.parse(readFileSync(MANIFEST,'utf8'));
  assert.deepEqual(manifest.sourceShape.authoredFillRGBA,[153,255,0,176]);
  assert.deepEqual(manifest.sourceShape.sourceClipPlacements,placements);
  assert.equal(manifest.browserVisualCalibration,false);
  const metadata=JSON.parse(readFileSync(METADATA,'utf8'));
  assert.equal(metadata.assetSha256,manifest.successor.sha256);
  assert.equal(metadata.sourceClipMasks.sourceOnlyOpaqueMaskNormalization,true);
});

test('a physical placement that loses clipDepth fails closed',()=>{
  const tag=[...xml.matchAll(/<PlaceObject2\s+[^>]*objectID="45"[^>]*>/gu)][0]?.[0];
  assert(tag?.includes('clipDepth="85"'));
  const changed=xml.replace(tag,tag.replace('clipDepth="85"',''));
  assert.throws(()=>deriveP038MaskSuccessor(raw,changed,plan),
    /fresh XML has exactly these ten shape45 placements/);
});

test('a visible extra shape45 placement and a changed authored fill fail closed',()=>{
  const tag=[...xml.matchAll(/<PlaceObject2\s+[^>]*objectID="45"[^>]*>/gu)][0]?.[0];
  assert(tag);
  const changed=xml.replace(tag,tag+tag.replace(/clipDepth="[0-9]+"/u,''));
  assert.throws(()=>deriveP038MaskSuccessor(raw,changed,plan),
    /fresh XML has exactly these ten shape45 placements/);
  assert.throws(()=>deriveP038MaskSuccessor(
    raw.replace('ctx.fillStyle=tocolor(ctrans.apply([153,255,0,0.6901961]));',
      'ctx.fillStyle=tocolor(ctrans.apply([153,255,0,1]));'),xml,plan),
    /exact source mask fill/);
});

test('a reordered or unreviewed clip plan fails closed',()=>{
  const altered=structuredClone(plan);
  altered.maskInstances.reverse();
  assert.throws(()=>deriveP038MaskSuccessor(raw,xml,altered),
    /ten source clip placements/);
});
