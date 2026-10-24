import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {lstat, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/** Static, source-bound candidate data. No audio, runtime, or review authority. */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelative = 'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf';
const swfSha = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c';
const irSha = 'ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350';
const activeSha = '34f152e4a002b38931c57f9be29c1759a48da232a400c4544a4f34d1be51deb8';
const output = path.join(root, 'packages/demos/src/nms-l02-p064-presentation-data-v1.ts');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const requireFact = (condition, message) => {if (!condition) throw new Error(message);};

// Source vectors were inspected as candidate teaching art. These descriptions
// are static interpretations, not original-host or named-human acceptance.
const figure = {
  1: [23, 'Circle divided into five equal parts; two parts are shaded.'],
  2: [70, 'Circle divided into five equal parts; four parts are shaded.'],
  3: [84, 'Figure divided into eight equal parts; three parts are shaded.'],
  8: [166, 'Circle divided into five equal parts; three parts are shaded.'],
  9: [182, 'Circle divided into six equal parts; four parts are shaded.'],
  10: [199, 'Square divided into four equal triangles; two are shaded.'],
  11: [215, 'Hundred-square grid; five cells are shaded.'],
  12: [230, 'Hundred-square grid; ninety cells are shaded.'],
  13: [245, 'Hundred-square grid; twenty-five cells are shaded.'],
  14: [261, 'Hundred-square grid; seventy-five cells are shaded.'],
  15: [273, 'Hundred-square grid; sixty cells are shaded.'],
  16: [287, 'Hundred-square grid; thirty cells are shaded.'],
};
const numberLine = {
  4: [100, 0, 1, 0.125, 8, 'A'],
  5: [100, 0, 1, 0.75, 8, 'A'],
  6: [100, 0, 1, 0.875, 8, 'A'],
  17: [100, 0, 1, 0.75, 8, 'A'],
  18: [100, 0, 1, 0.25, 8, 'A'],
  19: [100, 0, 1, 0.5, 8, 'A'],
  30: [477, 0, 2, 1.2, 20, 'T'],
  31: [477, 5, 7, 5.9, 20, 'K'],
  32: [515, 8, 11, 10.75, 12, 'C'],
};
// Reviewable candidate descriptions of the four source-picture choices.
const pictureValues = {
  7: ['One of nine equal bar parts shaded', 'One of ten equal bar parts shaded',
    'One of five equal bar parts shaded', 'One of three equal bar parts shaded'],
  8: ['One of five equal bar parts shaded', 'Three of five equal bar parts shaded',
    'Six of ten equal bar parts shaded', 'Six of eight equal bar parts shaded'],
  9: ['Three of six circle sectors shaded', 'Two of three circle sectors shaded',
    'Four of five circle sectors shaded', 'Five of six circle sectors shaded'],
  10: ['One of four square triangles shaded', 'Two of four square triangles shaded',
    'Three of four square triangles shaded', 'Four of four square triangles shaded'],
};
const specialPrompts = {
  7: ['Which picture shows 1/10?', '1\n--- RECORDSEPARATOR ---\n10'],
  20: ['Which decimal is equivalent to 1/2?', '1\n--- RECORDSEPARATOR ---\n2'],
  21: ['Which decimal means the same as 3/4?', '3\n--- RECORDSEPARATOR ---\n4'],
};

function normalizeText(value) {
  return value.replace(/\n--- RECORDSEPARATOR ---\n/g, ' ').replace(/\s+/g, ' ').trim();
}
function optionValue(children) {
  const values = children.filter(row => row.rawText && !/^[ABCD]$/.test(row.rawText.trim()))
    .map(row => row.rawText.trim());
  if (!values.length) return null;
  requireFact(values.length === 1, 'P064 option text is not uniquely sourced');
  return values[0].replace(/\s*--- RECORDSEPARATOR ---\s*/g, '/')
    .replace(/\s+/g, ' ').trim();
}
function safeSvg(bytes) {
  let svg = bytes.toString('utf8');
  requireFact(!/<(?:script|foreignObject|text)\b|\son[a-z]+\s*=/i.test(svg), 'unsafe source SVG element');
  requireFact(![...svg.matchAll(/(?:xlink:)?href="([^"]*)"/g)].some(match => !match[1].startsWith('#')),
    'external source SVG reference');
  const match = /<svg\b[^>]*\bwidth="([\d.]+)px"[^>]*>/.exec(svg);
  const width = Number(match?.[1]);
  const height = Number(/<svg\b[^>]*\bheight="([\d.]+)px"/.exec(svg)?.[1]);
  requireFact(width > 0 && height > 0 && !/<svg\b[^>]*\bviewBox=/.test(svg), 'source SVG bounds changed');
  svg = svg.replace(/<\?xml[^>]+>\s*/, '').replace('<svg ', `<svg viewBox="0 0 ${width} ${height}" `);
  return {source: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
    width, height, sha256: sha(bytes)};
}

async function pinnedJson(relativePath, expectedSha) {
  const bytes = await readFile(path.join(root, relativePath));
  requireFact(sha(bytes) === expectedSha, `${relativePath} drifted`);
  return JSON.parse(bytes);
}

async function main() {
  requireFact(['--build', '--check'].includes(process.argv[2]) && process.argv.length === 3,
    'use --build or --check');
  requireFact(process.env.HELP_MATH_G678_SOURCE_ROOT === sourceRoot, 'exact real source root required');
  const sourceRootStat = await lstat(sourceRoot);
  requireFact(sourceRootStat.isDirectory() && !sourceRootStat.isSymbolicLink(),
    'Source must be a real directory, not symlink');
  const source = path.join(sourceRoot, sourceRelative);
  const sourceBytes = await readFile(source);
  requireFact(sourceBytes.length === 55392 && sha(sourceBytes) === swfSha, 'P064 source SWF drifted');
  const ir = await pinnedJson('migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json', irSha);
  const active = await pinnedJson('migrations/shared-nms002-l02-p064/audit/active-display-list-v1.json', activeSha);
  requireFact(ir.questions.length === 35 && active.questions.length === 35, 'P064 question count changed');
  const shapeIds = Object.values(figure).map(row => row[0]);
  const spriteIds = ir.questions.slice(6, 10).flatMap(question => question.options.map(option => option.instance.symbolId));
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'g678-p064-presentation-'));
  try {
    const command = (ids, type) => execFileSync('ffdec', ['-selectid', ids.join(','), '-format', `${type}:svg`,
      '-export', type, temporary, source], {encoding: 'utf8', maxBuffer: 1024 * 1024});
    requireFact(command(shapeIds, 'shape').includes('JPEXS Free Flash Decompiler v.26.2.1'), 'FFDec version changed');
    requireFact(command(spriteIds, 'sprite').includes('JPEXS Free Flash Decompiler v.26.2.1'), 'FFDec version changed');
    const svgById = new Map();
    for (const id of shapeIds) svgById.set(id, safeSvg(await readFile(path.join(temporary, `${id}.svg`))));
    for (const id of spriteIds) svgById.set(id, safeSvg(await readFile(path.join(temporary, `DefineSprite_${id}`, '1.svg'))));
    const questions = ir.questions.map((question, index) => {
      const display = active.questions[index];
      requireFact(display.questionId === question.questionId && display.questionFrame === question.questionFrame,
        'P064 active frame mismatch');
      const prompts = display.activePlacements.filter(row => !row.name && row.rawText?.includes('?'));
      requireFact(prompts.length === 1, `Q${question.questionId} prompt is not unique`);
      const promptRow = prompts[0];
      const special = specialPrompts[question.questionId];
      if (special) requireFact(display.activePlacements.some(row => row.rawText === special[1]),
        `Q${question.questionId} fraction text changed`);
      const prompt = special ? special[0] : normalizeText(promptRow.rawText);
      const options = question.options.map(option => {
        const letter = String.fromCharCode(64 + option.option);
        const value = optionValue(option.children);
        const picture = pictureValues[question.questionId];
        requireFact((picture !== undefined) === (value === null), `Q${question.questionId} option kind changed`);
        return {letter, value, sourceInstance: option.instance.name, sourceSpriteId: option.instance.symbolId,
          ...(picture ? {pictureAlt: picture[option.option - 1], picture: svgById.get(option.instance.symbolId)} : {}),
          correct: option.option === question.correctOption};
      });
      const shape = figure[question.questionId];
      const line = numberLine[question.questionId];
      requireFact(!(shape && line), 'P064 figure has conflicting sources');
      if (shape || line) {
        const symbolId = (shape ?? line)[0];
        requireFact(display.activePlacements.some(row => row.symbolId === symbolId && row.kind.startsWith('DefineShape')),
          `Q${question.questionId} figure source symbol missing`);
      }
      const illustration = shape ? {kind: 'source-illustration', sourceShapeId: shape[0],
        alt: shape[1], ...svgById.get(shape[0])} : line ? {kind: 'number-line', sourceShapeId: line[0],
        minimum: line[1], maximum: line[2], point: line[3], intervals: line[4], pointLabel: line[5]} : null;
      if (line) requireFact(display.activePlacements.some(row => row.rawText?.trim() === line[5]),
        `Q${question.questionId} point label changed`);
      return {id: question.questionId, questionFrame: question.questionFrame, reviewFrame: question.reviewFrame,
        prompt, sourcePromptTextId: promptRow.symbolId, options, correctLetter: options[question.correctOption - 1].letter,
        illustration};
    });
    const payload = {schemaVersion: 1, animationId: 'shared-nms002-l02-p064', sourceSwfSha256: swfSha,
      sourceQuestionIrSha256: irSha, sourceActiveDisplaySha256: activeSha,
      semanticStatus: 'static-visual-candidate-not-original-runtime-or-human-reviewed',
      sessionQuestionCount: 10, questions};
    const text = `// Generated by scripts/build-nms-l02-p064-presentation-data-v1.mjs; do not edit.\n`
      + `// Static source candidate only; not Current-JS registration or acceptance.\n`
      + `import type {P064PresentationData} from './nms-l02-p064-presentation-types-v1';\n`
      + `export const P064_PRESENTATION_DATA = JSON.parse(${JSON.stringify(JSON.stringify(payload))}) as P064PresentationData;\n`;
    if (process.argv[2] === '--check') requireFact(await readFile(output, 'utf8') === text,
      'P064 presentation data drifted');
    else await writeFile(output, text, {flag: 'wx'});
    console.log(JSON.stringify({status: 'PASS', mode: process.argv[2], sha256: sha(text),
      bytes: Buffer.byteLength(text), questions: questions.length, pictureOptions: spriteIds.length}));
  } finally {
    await rm(temporary, {recursive: true});
  }
}

await main();
