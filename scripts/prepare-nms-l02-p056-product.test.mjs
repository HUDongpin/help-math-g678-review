import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {buildP056ProductManifest,prepareP056Product,validateP056SourceIntake} from './prepare-nms-l02-p056-product.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const INTAKE=path.join(ROOT,'output/nms-l02-p056-source-intake-20260927/source-intake.json');

test('source intake validator rejects page alias, domain, bank, and acceptance drift',async()=>{
  const original=JSON.parse(await readFile(INTAKE,'utf8'));
  assert.equal(validateP056SourceIntake(original).animationId,'shared-nms002-l02-p056');
  for(const change of [
    value=>{value.source.sha256='8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e';},
    value=>{value.lessonXml.globalOrdinal=55;},
    value=>{value.sourceStructure.mainFrameDomain='sprite-26';},
    value=>{value.lessonXml.declaredKeyTermBanks.recovered=true;},
    value=>{value.acceptanceEffects.audioAccepted=true;},
  ]){
    const copy=structuredClone(original);change(copy);assert.throws(()=>validateP056SourceIntake(copy));
  }
});

test('producer binds real P056 source and existing projections to new product code without acceptance effects',async()=>{
  const manifest=await buildP056ProductManifest();
  assert.equal(manifest.source.bytes,100959);
  assert.equal(manifest.source.sha256,'a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be');
  assert.equal(manifest.sourceStructure.mainFrameCount,234);
  assert.equal(manifest.productFiles.length,6);
  assert.ok(manifest.existingInputs.length>=6);
  assert.equal(manifest.audio.productUrl,null);
  assert.ok(Object.values(manifest.acceptanceEffects).every(value=>value===false));
  assert.equal((await prepareP056Product('--dry-run')).status,'P056_PRODUCT_PREPARED');
  await assert.rejects(prepareP056Product('--invalid'));
});
