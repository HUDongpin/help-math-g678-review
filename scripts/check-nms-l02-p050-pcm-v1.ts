import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {P050_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p050-audio-plan-v1';
import {p050PrepareSourcePcm, type P050AudioDomain} from '../packages/demos/src/nms-l02-p050-audio-pcm-v1';
const inventory = JSON.parse(readFileSync('migrations/shared-nms002-l02-p050/audit/source-pcm-inventory-v1.json', 'utf8'));
let preserved = 0, insertedSilence = 0;
for (const domain of Object.keys(P050_AUDIO_PLANS) as P050AudioDomain[]) {
  const row = inventory.streams.find((x: {domain: string}) => x.domain === `sprite-${domain}`);
  const bytes = readFileSync(row.pcm.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), row.pcm.sha256);
  const samples = new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const original = samples.slice(), plan = P050_AUDIO_PLANS[domain];
  const prepared = p050PrepareSourcePcm(domain, samples);
  assert.deepEqual(samples, original);
  let end = 0, cursor = plan.latencySamples as number;
  for (const segment of plan.segments) {
    assert.equal(segment.sourceStart, cursor);
    assert.ok(prepared.subarray(end, segment.outputStart).every(x => x === 0));
    assert.deepEqual(prepared.subarray(segment.outputStart, segment.outputEnd), samples.subarray(segment.sourceStart, segment.sourceEnd));
    preserved += segment.sourceEnd - segment.sourceStart;
    insertedSilence += segment.outputStart - end;
    cursor = segment.sourceEnd; end = segment.outputEnd;
  }
  assert.equal(cursor, samples.length); assert.equal(end, prepared.length);
  assert.throws(() => p050PrepareSourcePcm(domain, samples.subarray(1)), /LENGTH/);
  const invalid = samples.slice(); invalid[1700] = NaN;
  assert.throws(() => p050PrepareSourcePcm(domain, invalid), /NONFINITE/);
  assert.throws(() => p050PrepareSourcePcm(domain, new Float32Array(samples.length)), /SILENT/);
  if (domain === '91') assert.ok(prepared.subarray(34912).some(x => x !== 0), 'correct feedback tail retained');
}
assert.throws(() => p050PrepareSourcePcm('93' as P050AudioDomain, new Float32Array()), /DOMAIN/);
console.log(JSON.stringify({status: 'PASS', streams: 3, preservedPostLatencySamples: preserved, insertedSilence, sourceUnchanged: true, scope: 'Real decoded source buffers; not browser or listening acceptance.'}));
