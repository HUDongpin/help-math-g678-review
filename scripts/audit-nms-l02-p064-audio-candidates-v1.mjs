import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelative = 'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf';
const sourceSha = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c';
const irPath = path.join(root, 'migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json');
const irSha = 'ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350';
const output = path.join(root, 'migrations/shared-nms002-l02-p064/audit/audio-source-candidates-v1.json');
const sha = data => createHash('sha256').update(data).digest('hex');

const mode = process.argv[2];
assert.ok(mode === '--build' || mode === '--check', 'Use --build or --check');
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot, 'Exact real G6-G8 source root required');
assert.ok(fs.lstatSync(sourceRoot).isDirectory() && fs.realpathSync(sourceRoot) === sourceRoot,
  'Source root must be a real directory');
const source = path.join(sourceRoot, sourceRelative);
assert.ok(fs.lstatSync(source).isFile(), 'Exact P064 SWF required');
assert.equal(sha(fs.readFileSync(source)), sourceSha, 'P064 SWF changed');
assert.equal(sha(fs.readFileSync(irPath)), irSha, 'P064 question IR changed');

const expectedNames = Array.from({length: 35}, (_, index) => {
  const questionId = index + 1;
  return [`Q${questionId}.mp3`, ...'ABCD'.split('').map(letter => `Q${questionId}${letter}.mp3`)];
}).flat();
const sortedNames = [...expectedNames].sort();
const folders = [];
const sourceMediaRows = [];
for (const [folderCode, languageCandidate] of [['EA', 'en'], ['SA', 'es']]) {
  const relativeFolder = `G6-G8-shared/NMS002/L2/FQ/${folderCode}`;
  const absoluteFolder = path.join(sourceRoot, relativeFolder);
  assert.ok(fs.lstatSync(absoluteFolder).isDirectory() && !fs.lstatSync(absoluteFolder).isSymbolicLink(),
    `${folderCode} must be a real source directory`);
  assert.deepEqual(fs.readdirSync(absoluteFolder).sort(), sortedNames,
    `${folderCode} must have exactly 35 question and 140 option MP3 names`);
  let totalBytes = 0;
  for (const name of expectedNames) {
    const file = path.join(absoluteFolder, name);
    assert.ok(fs.lstatSync(file).isFile() && !fs.lstatSync(file).isSymbolicLink(),
      `Unexpected media type: ${name}`);
    const bytes = fs.readFileSync(file);
    assert.ok(bytes.length > 0, `Empty source audio: ${name}`);
    totalBytes += bytes.length;
    const match = /^Q(\d+)([A-D])?\.mp3$/.exec(name);
    assert.ok(match, `Unexpected source audio name: ${name}`);
    sourceMediaRows.push({
      folderCode, languageCandidate,
      questionId: Number(match[1]),
      role: match[2] ? 'option' : 'question',
      option: match[2] ?? null,
      relativePath: `${relativeFolder}/${name}`,
      bytes: bytes.length,
      sha256: sha(bytes),
    });
  }
  folders.push({folderCode, languageCandidate, fileCount: expectedNames.length, totalBytes});
}
const rendered = JSON.stringify({
  schemaVersion: 1,
  animationId: 'shared-nms002-l02-p064',
  authority: 'source-media-candidate-index-only',
  source: {relativePath: sourceRelative, sha256: sourceSha},
  questionContentIrSha256: irSha,
  folders,
  sourceMediaRows,
  limitations: [
    'EA/SA folder names are candidate language labels, not verified spoken-language or listening acceptance.',
    'File presence and hash do not establish original-host reachability, timing, option-audio controls, or Replay.',
    'No audio file is copied into the application, registered, or marked as an accepted cue by this inventory.',
  ],
}, null, 2) + '\n';
if (mode === '--build') fs.writeFileSync(output, rendered, {flag: 'wx'});
else assert.equal(fs.readFileSync(output, 'utf8'), rendered, 'P064 source-media candidate index drift');
console.log(JSON.stringify({status: 'PASS', mode, sha256: sha(rendered), folders, rows: sourceMediaRows.length}));
