import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p047-behavior-source-v1/native-quiz-source-data-v2.json';
const inputSha = '18fbafaa51fb5eb0dd0bd8a61c3a2a472f9a13b14ee6c74bc25f24ec38eb6164';
const bytes = await readFile(input);
if (createHash('sha256').update(bytes).digest('hex') !== inputSha) throw new Error('P047 semantic source input drifted');
const data = JSON.parse(bytes);
const roleBytes = await readFile(path.join(path.dirname(input), 'dynamic-text-role-disposition-v1.json'));
if (createHash('sha256').update(roleBytes).digest('hex') !== '7f32b44a5c55e7d3997439b3c37d07dd8068058775e963536a2154fff6beb1b1') throw new Error('P047 text role source drifted');
data.dynamicRoleTextIds = {};
for (const row of JSON.parse(roleBytes).rows) (data.dynamicRoleTextIds[row.role] ??= []).push(row.sourceTextId);
const mathBytes = await readFile(path.join(path.dirname(input), 'question-mathematics-source-qualification-v1.json'));
if (createHash('sha256').update(mathBytes).digest('hex') !== 'aa29928cb2f213881f95a5a7540a4808e8be9992c6efc89f40008391251fce77') throw new Error('P047 mathematical source qualification drifted');
const math = JSON.parse(mathBytes);
const audioBytes = await readFile(path.join(path.dirname(input), 'audio-browser-decode-v1/receipt.json'));
if (createHash('sha256').update(audioBytes).digest('hex') !== '4e9db539d07dc630d408dfb7af785602266337abbcfed4d44695d5d1dad23b7e') throw new Error('P047 native audio measurement drifted');
const audioMeasurement = JSON.parse(audioBytes);
for (const asset of data.audio) {
  const record = audioMeasurement.records.find(record => record.question === asset.question && record.language === asset.language && record.choice === asset.choice);
  if (!record || record.source.sha256 !== asset.sha256 || record.source.bytes !== asset.bytes || record.native.sampleRate !== 44100 || record.native.channels !== 1) throw new Error('P047 audio measurement binding mismatch');
  asset.samples = record.native.samples; asset.sampleRate = 44100; asset.channels = 1;
}
data.figureText = [];
function figureText(question, key, text, sourceTextIds, sourceShapeIds = []) {
  data.figureText.push({question, text, binding: {id: `q${question}-${key}`, sourceTextIds,
    ...(sourceShapeIds.length ? {sourceShapeIds} : {}), role: 'label', language: 'en',
    readingOrder: 200 + data.figureText.length, valueSource: 'maintained-page-state'}});
}
for (const question of data.questions) {
  const figure = question.figure;
  if (figure?.kind === 'number-line') {
    for (let number = -9; number <= 9; number++) figureText(question.id, `tick-${number}`, String(number).replace('-', '−'),
      [`character-${number < 0 ? 34 - number : 25 + number}`], number < 0 ? figure.sourceShapeIds : []);
    figureText(question.id, 'point-label', 'P', ['character-45']);
  }
  if (figure?.kind === 'temperature-table') {
    const texts = math.rows[question.id - 1].rawSourceTexts;
    const header = texts.findIndex(text => text.characterId === 186);
    const city = texts.find(text => text.text === figure.city);
    if (!city || header < 0) throw new Error('P047 table source structure changed');
    figureText(question.id, 'city', figure.city, [city.sourceTextId]);
    figureText(question.id, 'month-heading', 'Month', ['character-172']);
    figureText(question.id, 'temperature-heading', 'Average Temperature (° F)', ['character-186'], figure.sourceShapeIds);
    for (let index = 0; index < 12; index++) {
      const value = texts[header + 1 + index];
      if (Number(value.text) !== figure.values[index]) throw new Error('P047 table value source drifted');
      figureText(question.id, `month-${index}`, figure.months[index], [`character-${173 + index}`]);
      figureText(question.id, `temperature-${index}`, String(figure.values[index]), [value.sourceTextId]);
    }
  }
}
for (const [question, characterId, sha256, label] of [
  [25, 441, '20b6ed5c8628b9cc43164ef2dac4dc06a137adbbda2c5eb4eb007a800e554973', 'Illustration of a jar of marbles'],
  [26, 456, 'ddba2d804587dfbb6b50328588fce7b17ac1fba4bde91dea496497bb7c310e25', 'Illustration of a quarter'],
  [27, 471, '8e7d9d3050b22327632fac63de131f435396402303e2959874ba5f512a131bcd', 'Illustration of tennis rackets and a basket of tennis balls'],
]) {
  const svgBytes = await readFile(path.join(path.dirname(input), `source/audit/shapes/${characterId}.svg`));
  if (createHash('sha256').update(svgBytes).digest('hex') !== sha256) throw new Error(`P047 source shape ${characterId} drifted`);
  let svg = svgBytes.toString('utf8');
  if (/<(?:script|foreignObject|text)\b|\son[a-z]+\s*=/i.test(svg)
    || [...svg.matchAll(/(?:xlink:)?href="([^"]*)"/g)].some(match => !match[1].startsWith('#') && !match[1].startsWith('data:image/'))) {
    throw new Error('P047 source illustration has unsupported content');
  }
  const width = Number(svg.match(/<svg\b[^>]*\bwidth="([\d.]+)px"/)[1]);
  const height = Number(svg.match(/<svg\b[^>]*\bheight="([\d.]+)px"/)[1]);
  if (!(width > 0 && height > 0) || /<svg\b[^>]*\bviewBox=/.test(svg)) throw new Error('P047 source illustration bounds changed');
  svg = svg.replace(/<\?xml[^>]+>\s*/, '').replace('<svg ', `<svg viewBox="0 0 ${width} ${height}" `);
  data.questions[question - 1].figure = {kind: 'source-illustration', sourceShapeIds: [characterId],
    sourceSvgSha256: sha256, width, height, label, source: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`};
}
const source = await readFile('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L1/FQ/L1FQ02.swf');
if (createHash('sha256').update(source).digest('hex') !== data.sourceSwfSha256) throw new Error('P047 source SWF drifted');
if (data.questions.length !== 27 || data.audio.length !== 270 || data.sessionQuestionCount !== 10) throw new Error('P047 source cardinality changed');
const output = path.join(root, 'packages/demos/src/nms-l01-p047-source-data-v1.ts');
const text = `// Generated by scripts/generate-nms-l01-p047-quiz-data-v1.mjs; do not edit.
// Source semantic input SHA-256: ${inputSha}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
}
export const P047_SOURCE = freeze(${JSON.stringify(data)} as const);
`;
if (process.argv.includes('--check')) {
  if (await readFile(output, 'utf8') !== text) throw new Error('P047 generated data is stale');
} else await writeFile(output, text);
console.log(JSON.stringify({output, bytes: Buffer.byteLength(text), sourceQuestions: 27, sourceAudioFiles: 270, registered: false}));
