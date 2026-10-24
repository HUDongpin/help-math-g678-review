import {createHash} from 'node:crypto';
import {lstat, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {P064_PRESENTATION_DATA as presentation} from '../packages/demos/src/nms-l02-p064-presentation-data-v1.ts';

// Structural text reconciliation only: no runtime visibility, translation,
// teaching semantics, audio, human review, or My Lesson admission is asserted.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelativePath = 'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf';
const sourceSha = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c';
const irSha = 'ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350';
const activeSha = '34f152e4a002b38931c57f9be29c1759a48da232a400c4544a4f34d1be51deb8';
const presentationSha = '518c44531318be4295f26afce53336e27c07f4799459b8d317f41a209dd8cc0e';
const output = path.join(root, 'migrations/shared-nms002-l02-p064/audit/source-text-reconciliation-v1.json');
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const requireFact = (value: unknown, message: string): asserts value => {
  if (!value) throw Error(message);
};
const normalize = (value: string) => value.replace(/\s+/gu, ' ').trim();
const fractionPrompt: Record<number, {textId: number; numerator: string; denominator: string}> = {
  7: {textId: 150, numerator: '1', denominator: '10'},
  20: {textId: 335, numerator: '1', denominator: '2'},
  21: {textId: 348, numerator: '3', denominator: '4'},
};

async function pinnedJson(relativePath: string, expectedSha: string) {
  const bytes = await readFile(path.join(root, relativePath));
  requireFact(sha(bytes) === expectedSha, `${relativePath} drifted`);
  return JSON.parse(bytes.toString('utf8'));
}

async function main() {
  const mode = process.argv[2];
  requireFact((mode === '--build' || mode === '--check') && process.argv.length === 3,
    'use --build or --check');
  requireFact(process.env.HELP_MATH_G678_SOURCE_ROOT === sourceRoot, 'exact real source root required');
  const sourceStat = await lstat(sourceRoot);
  requireFact(sourceStat.isDirectory() && !sourceStat.isSymbolicLink(),
    'Source must be a real directory, not symlink');
  const swf = await readFile(path.join(sourceRoot, sourceRelativePath));
  requireFact(sha(swf) === sourceSha, 'P064 source SWF drifted');
  const presentationBytes = await readFile(path.join(root,
    'packages/demos/src/nms-l02-p064-presentation-data-v1.ts'));
  requireFact(sha(presentationBytes) === presentationSha && presentation.sourceSwfSha256 === sourceSha,
    'P064 presentation input drifted');
  const ir = await pinnedJson('migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json', irSha);
  const active = await pinnedJson('migrations/shared-nms002-l02-p064/audit/active-display-list-v1.json', activeSha);
  const catalog = collectSwfTextSourceCatalog(swf);
  requireFact(catalog.unparsedTags.length === 0 && catalog.textDefinitions.length === 649,
    'P064 source text parser coverage changed');
  const textById = new Map(catalog.textDefinitions.map(row => [row.characterId, row]));
  const shapeById = new Map(catalog.shapeDefinitions.map(row => [row.characterId, row]));
  const getText = (id: number) => {
    const row = textById.get(id);
    requireFact(row?.kind === 'static-text' && row.runs.every(run => typeof run.text === 'string'),
      `P064 source text ${id} is not statically decoded`);
    return row;
  };
  requireFact(presentation.questions.length === 35 && ir.questions.length === 35 && active.questions.length === 35,
    'P064 question count changed');
  const prompts = [];
  const options = [];
  for (const question of presentation.questions) {
    const sourceQuestion = ir.questions[question.id - 1];
    const sourceDisplay = active.questions[question.id - 1];
    requireFact(sourceQuestion.questionId === question.id && sourceDisplay.questionId === question.id,
      `Q${question.id} source identity changed`);
    const promptDefinition = getText(question.sourcePromptTextId);
    const sourceText = promptDefinition.runs.map(run => run.text).join('');
    let projected = normalize(sourceText);
    let disposition = sourceText === question.prompt ? 'exact' : 'whitespace-normalized';
    let separateFraction = null;
    const fraction = fractionPrompt[question.id];
    if (fraction) {
      const fractionDefinition = getText(fraction.textId);
      requireFact(fractionDefinition.runs.map(run => run.text.trim()).join('/') ===
        `${fraction.numerator}/${fraction.denominator}`, `Q${question.id} fraction source changed`);
      requireFact(sourceDisplay.activePlacements.some(row => row.symbolId === fraction.textId &&
        row.kind === 'DefineText'), `Q${question.id} fraction is not in effective display`);
      projected = projected.replace(/\s+\?$/u, ` ${fraction.numerator}/${fraction.denominator}?`);
      disposition = 'separate-source-fraction-inserted';
      separateFraction = {sourceTextId: `character-${fraction.textId}`,
        sourceTagSha256: fractionDefinition.sourceTagSha256,
        numerator: fraction.numerator, denominator: fraction.denominator};
    } else if (question.id === 9) {
      requireFact(projected.includes('fractioncircle'), 'Q9 source word boundary changed');
      projected = projected.replace('fractioncircle', 'fraction circle');
      disposition = 'source-word-boundary-normalized';
    }
    requireFact(projected === question.prompt, `Q${question.id} candidate prompt diverges from source`);
    requireFact((sourceText !== question.prompt) === [7, 9, 20, 21, 26].includes(question.id),
      `Q${question.id} prompt normalization set changed`);
    prompts.push({questionId: question.id, questionFrame: question.questionFrame,
      sourceTextId: promptDefinition.sourceTextId,
      sourceTagSha256: promptDefinition.sourceTagSha256,
      sourceText, candidateText: question.prompt, disposition, separateFraction});
    for (const [index, option] of question.options.entries()) {
      const sourceOption = sourceQuestion.options[index];
      requireFact(sourceOption.option === index + 1 && option.letter === 'ABCD'[index],
        `Q${question.id} option identity changed`);
      const letterPlacement = sourceOption.children.find(row => row.kind === 'DefineText' &&
        row.rawText?.trim() === option.letter);
      requireFact(letterPlacement, `Q${question.id}${option.letter} source letter missing`);
      const letterDefinition = getText(letterPlacement.symbolId);
      requireFact(normalize(letterDefinition.runs.map(run => run.text).join('')) === option.letter,
        `Q${question.id}${option.letter} source letter changed`);
      const common = {questionId: question.id, letter: option.letter,
        sourceOptionSpriteId: option.sourceSpriteId,
        sourceLetterTextId: letterDefinition.sourceTextId,
        sourceLetterTagSha256: letterDefinition.sourceTagSha256};
      if (option.value === null) {
        const graphics = sourceOption.children.filter(row => row.kind?.startsWith('DefineShape'))
          .map(row => {
            const sourceShape = shapeById.get(row.symbolId);
            requireFact(sourceShape, `Q${question.id}${option.letter} source shape missing`);
            return {characterId: row.symbolId, sourceTagSha256: sourceShape.sourceTagSha256};
          });
        requireFact(graphics.length === 2 && option.picture && option.pictureAlt,
          `Q${question.id}${option.letter} picture option changed`);
        options.push({...common, kind: 'source-vector-candidate', sourceGraphics: graphics,
          altCandidate: option.pictureAlt});
      } else {
        const valuePlacements = sourceOption.children.filter(row => row.kind === 'DefineText' &&
          row.rawText && !/^[ABCD]$/u.test(row.rawText.trim()));
        requireFact(valuePlacements.length === 1, `Q${question.id}${option.letter} value is not unique`);
        const valueDefinition = getText(valuePlacements[0].symbolId);
        const runs = valueDefinition.runs.map(run => run.text.trim());
        const projectedValue = runs.length === 2 && runs.every(run => /^\d+$/u.test(run))
          ? runs.join('/') : normalize(runs.join(''));
        requireFact(projectedValue === option.value, `Q${question.id}${option.letter} value diverges from source`);
        options.push({...common, kind: 'source-text', sourceValueTextId: valueDefinition.sourceTextId,
          sourceValueTagSha256: valueDefinition.sourceTagSha256, candidateValue: option.value,
          disposition: runs.length === 2 ? 'native-fraction' : 'whitespace-normalized'});
      }
    }
  }
  requireFact(options.length === 140 && options.filter(row => row.kind === 'source-text').length === 124 &&
    options.filter(row => row.kind === 'source-vector-candidate').length === 16,
  'P064 option kinds changed');
  const report = {schemaVersion: 1, kind: 'g678-p064-source-text-reconciliation-v1',
    placementId: 'shared-nms002-l02-p064', sourceRelativePath, sourceSwfSha256: sourceSha,
    sourceCatalogContentSha256: sha(JSON.stringify(catalog)),
    questionContentIrSha256: irSha, activeDisplaySha256: activeSha, presentationDataSha256: presentationSha,
    sourceSummary: catalog.summary,
    unresolvedSourceRiskKinds: [...new Set(catalog.risks.map(row => row.kind))].sort(),
    claims: {structuralTextAndOptionBinding: true, runtimeVisibilityEstablished: false,
      originalRuntimeObserved: false, semanticAndBilingualAcceptance: false,
      typographyHostIntegration: false, audioAcceptance: false},
    prompts, options};
  const bytes = JSON.stringify(report, null, 2) + '\n';
  if (mode === '--check') requireFact(await readFile(output, 'utf8') === bytes,
    'P064 source text reconciliation drifted');
  else await writeFile(output, bytes, {flag: 'wx'});
  console.log(JSON.stringify({status: 'PASS', mode, sha256: sha(bytes),
    prompts: prompts.length, textOptions: 124, pictureOptions: 16,
    sourceCatalogContentSha256: report.sourceCatalogContentSha256}));
}

await main();
