#!/usr/bin/env node

// P055 only: a conditional, source-pinned L1 bank candidate for the modern host.
// The lesson XML still declares unrecovered L2 banks. This script never changes
// application code, registration, or any earlier source/fidelity decision.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseRecoveredKeyTerm} from './audit-g678-ts02-l1-keyterms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = 'output/nms-l02-host-successor-20260927/glossary/p055-conditional-l1-host-bank.json';
const SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files';
const HOST_ROOT = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts';
const CAS_ROOT = `${SOURCE_ROOT}/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1/objects/sha256`;
const PINS = Object.freeze({
  english: {path: `${SOURCE_ROOT}/HELP_OnlineKeyTerms_XML/MI/L1KTE01.xml`, bytes: 345838, sha256: '14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b', reference: 'HELP_KEYTERMS/KT/XML/L1KTE01.xml', assetId: 'G678L1KTE01.xml'},
  spanish: {path: `${SOURCE_ROOT}/HELP_OnlineKeyTerms_XML/MI/L1KTS01.xml`, bytes: 344456, sha256: '3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407', reference: 'HELP_KEYTERMS/KT/XML/L1KTS01.xml', assetId: 'G678L1KTS01.xml'},
  lessonXml: {path: `${SOURCE_ROOT}/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/index.xml`, bytes: 12845, sha256: '550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'},
  pageSwf: {path: `${SOURCE_ROOT}/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TS/L2TS02.swf`, bytes: 149059, sha256: '8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e'},
  hostSwf: {path: `${CAS_ROOT}/27/275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`, bytes: 689006, sha256: '275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9', logicalPath: 'NewHelpProgram/HELP_COURSES/indexMI.swf'},
  hostFrame2: {path: `${HOST_ROOT}/frame_2/DoAction.as`, bytes: 14489, sha256: '3e0dd52444cfa5daa05a771aa4c00172a498192e634c6bef5a8815a02f51ce8a'},
  hostFrame35: {path: `${HOST_ROOT}/frame_35/DoAction.as`, bytes: 104008, sha256: '380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74'},
  hostFrame50: {path: `${HOST_ROOT}/frame_50/DoAction.as`, bytes: 1622, sha256: 'd267b54cf74f3aae4167e8bcbc1f803df3228630869d089dee53abbd3b162483'},
  visualReceipt: {path: 'output/nms-l02-ts-family-20260927/visual/source-native-visual-receipt.json', sha256: '26d394cb458818e6e6e59ba774c11ebd6adc01c28abe5aaeafac619ce358aae5'},
  recoveryAudit: {path: 'catalog/g678-ts02-l1-keyterm-recovery-v1.json', sha256: '2d965fb35a009b290c86e97f0da6531e551decbf6d9350655842c766cb96d98e'},
  hostPrecedenceAudit: {path: 'output/nms-l02-ts-family-20260927/glossary-dependency/HOST_XML_KEYTERM_PRECEDENCE_2026-09-27.md', sha256: '42dfa457a3cc359c3d49cad9589589e26f4e4c336142fe4265acbd285110aeb4'},
  hostBindingAudit: {path: 'output/nms-l02-ts-family-20260927/glossary-dependency/HOST_KEYTERM_BINDING_AUDIT_2026-09-27.md', sha256: '24df5b094ae8444b413f1c0c9657466a466d753404b0d5a80de11974a4723b33'},
  parser: {path: 'scripts/audit-g678-ts02-l1-keyterms.mjs', sha256: 'c7277b10a342c02217608f9e2da3b23ec32c1dc72117b1e9b6c5b5e56c323eaa'},
  p006Precedent: {path: 'migrations/shared-nms002-l02-p006/MIGRATION_BRIEF.md', sha256: '5ea5804d9673f9c551555fc53e8e7989362f8e72e2502a1dbe1a62714b142782'},
  p034Precedent: {path: 'migrations/shared-nms002-l02-p034/audit/source-specification-v1.json', sha256: 'dac72f0a01efedd7eb6e1feddb57e2b0867d60a9da05b1db62803af83821fa87'},
  p050Precedent: {path: 'migrations/shared-nms002-l02-p050/audit/source-glossary-v1.json', sha256: '1314eb1cee6c79b357920fcb8d9847d075efebb18f357c920a4c35f4ec8594bc'},
});
const KEYS = ['Restate', 'Question', 'Problem'];
const digest = value => createHash('sha256').update(value).digest('hex');
const stable = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

async function pinned(name, spec) {
  const absolute = path.isAbsolute(spec.path) ? spec.path : path.join(ROOT, spec.path);
  const bytes = await readFile(absolute);
  assert.equal(bytes.length, spec.bytes ?? bytes.length, `${name} byte length`);
  assert.equal(digest(bytes), spec.sha256, `${name} SHA-256`);
  return {bytes, text: bytes.toString('utf8')};
}

function rawEntry(xml, key) {
  const matches = [...xml.matchAll(new RegExp(`<${key}~LNG~[^\\s>]+\\s+[^>]*ScreenkeyTerm="${key}"[^>]*>[\\s\\S]*?<\\/${key}~LNG~[^>]+>`, 'gu'))];
  assert.equal(matches.length, 1, `${key} exact entry multiplicity`);
  return matches[0][0];
}

function bankRows(xml) {
  // The host indexes every child node by its bilingual element name. One
  // retained L1 English row lacks ScreenkeyTerm, so label uniqueness must
  // include it as well; filtering on the attribute would weaken this check.
  return [...xml.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>/gu)].map(match => {
    const [english, spanish] = match[1].split('~LNG~');
    assert.ok(english && spanish, 'bilingual bank label');
    return {
      english: english.replaceAll('~', ' ').toLowerCase(),
      spanish: spanish.replaceAll('~', ' ').toLowerCase(),
      key: /ScreenkeyTerm="([^"]+)"/u.exec(match[2])?.[1] ?? null,
    };
  });
}

export function extractP055Terms(english, spanish) {
  const banks = {en: english, es: spanish};
  const rows = {en: bankRows(english), es: bankRows(spanish)};
  assert.equal(rows.en.length, 659, 'complete English retained L1 bank');
  assert.equal(rows.es.length, 659, 'complete Spanish retained L1 bank');
  return KEYS.map(key => {
    const source = Object.fromEntries(Object.entries(banks).map(([locale, xml]) => {
      const parsed = parseRecoveredKeyTerm(xml, key);
      const raw = rawEntry(xml, key);
      assert.equal(parsed.exactEntrySha256, digest(raw), `${locale} ${key} exact raw entry`);
      const candidates = rows[locale].filter(row => row.key === key);
      assert.equal(candidates.length, 1, `${locale} ${key} ScreenkeyTerm uniqueness`);
      assert.equal(rows[locale].filter(row => row.english === parsed.labels.en.toLowerCase()).length, 1, `${locale} ${key} English host lookup uniqueness`);
      assert.equal(rows[locale].filter(row => row.spanish === parsed.labels.es.toLowerCase()).length, 1, `${locale} ${key} Spanish host lookup uniqueness`);
      return [locale, {parsed, rawSha256: digest(raw), normalizedEntrySha256: digest(raw.replaceAll('\r\n', '\n'))}];
    }));
    assert.deepEqual(source.en.parsed.labels, source.es.parsed.labels, `${key} cross-bank labels`);
    assert.deepEqual(source.en.parsed.definitions, source.es.parsed.definitions, `${key} cross-bank definitions`);
    assert.deepEqual(source.en.parsed.legacyCompanionReferences, source.es.parsed.legacyCompanionReferences, `${key} cross-bank companions`);
    const selected = source.en.parsed;
    return {
      id: selected.id,
      sourceKeyAttribute: key,
      labels: selected.labels,
      definitions: selected.definitions,
      source: {
        en: {assetId: PINS.english.assetId, path: PINS.english.reference, sha256: PINS.english.sha256},
        es: {assetId: PINS.spanish.assetId, path: PINS.spanish.reference, sha256: PINS.spanish.sha256},
      },
      sourceEntrySha256: {en: source.en.rawSha256, es: source.es.rawSha256},
      extractionLfNormalizedEntrySha256: {en: source.en.normalizedEntrySha256, es: source.es.normalizedEntrySha256},
      legacyCompanionReferences: selected.legacyCompanionReferences,
      matching: {englishHostLabelOccurrences: 1, spanishHostLabelOccurrences: 1, screenKeyTermOccurrencesPerBank: 1},
    };
  });
}

export async function buildP055ConditionalGlossary() {
  const inputs = {};
  for (const [name, spec] of Object.entries(PINS)) inputs[name] = await pinned(name, spec);
  const lesson = inputs.lessonXml.text;
  assert.match(lesson, /<English>HELP_KEYTERMS\/KT\/XML\/L2KTE01\.xml<\/English>/u);
  assert.match(lesson, /<Spanish>HELP_KEYTERMS\/KT\/XML\/L2KTS01\.xml<\/Spanish>/u);
  assert.match(lesson, /TS\/L2TS02\.swf/u);
  assert.ok(!/KEYTERMS|KeyTermVar|KTFile/u.test(inputs.hostFrame2.text), 'host frame-2 parser has no keyterm override');
  assert.match(inputs.hostFrame35.text, /function doInitKeyTerms\(\)[\s\S]*?KeyTermVar = _loc2_\.xmlPath \+ "XML\/L1KTE01\.xml";/u);
  assert.match(inputs.hostFrame35.text, /KeyTermVar = _loc2_\.xmlPath \+ "XML\/L1KTS01\.xml";/u);
  assert.match(inputs.hostFrame35.text, /KeyAttribute \+= "~English";/u);
  assert.match(inputs.hostFrame35.text, /F_X\.load\(_loc1_\.KeyTermVar\);/u);
  assert.match(inputs.hostFrame50.text, /_root\.doInitKeyTerms\(\);/u);
  const visual = JSON.parse(inputs.visualReceipt.text);
  assert.equal(visual.animationId, 'shared-nms002-l02-p055');
  assert.deepEqual(visual.sourceButtons.map(button => button.key), KEYS);
  const recovery = JSON.parse(inputs.recoveryAudit.text);
  const terms = extractP055Terms(inputs.english.text, inputs.spanish.text);
  for (const term of terms) {
    const prior = recovery.terms.find(item => item.id === term.id);
    assert.ok(prior, `${term.id} recovered TS02 precedent`);
    assert.deepEqual(prior.labels, term.labels);
    assert.deepEqual(prior.definitions, term.definitions);
    assert.deepEqual(prior.sourceEntrySha256, term.sourceEntrySha256);
  }
  return {
    schemaVersion: 1,
    kind: 'nms-l02-p055-conditional-identified-host-l1-glossary-v1',
    animationId: 'shared-nms002-l02-p055',
    status: 'conditional-modern-host-data-candidate',
    sourceSelection: 'identified-indexMI-export-literal-L1-bank-path',
    originalL2XmlResolved: false,
    historicalHostAssociationEstablished: false,
    originalRuntimeLookupVerified: false,
    sourceAudioOrVisualAcceptance: false,
    lessonXmlDeclaredBanks: {en: 'HELP_KEYTERMS/KT/XML/L2KTE01.xml', es: 'HELP_KEYTERMS/KT/XML/L2KTS01.xml', recovered: false},
    identifiedHostBanks: {en: PINS.english.reference, es: PINS.spanish.reference},
    hostLookup: 'DoHyperLinks appends ~English; doCreateSKTSubLink searches English and Spanish parsed labels case-insensitively. Each selected label and key is unique within each retained bank.',
    inputs: Object.fromEntries(Object.entries(PINS).map(([name, spec]) => [name, spec])),
    terms,
    limits: [
      'Conditional modern-host use of the identified host export only; the L02 lesson XML still declares missing L2 banks.',
      'No historical launcher-to-host association, successful original XML load, original button result, or L2 definition was observed.',
      'No Current-JS admission, original-runtime parity, audio listening, human or Owner acceptance, strict completion, release, or publication follows from this data.',
    ],
  };
}

export async function prepareP055ConditionalGlossary({check = false} = {}) {
  const data = await buildP055ConditionalGlossary();
  const bytes = stable(data);
  const target = path.join(ROOT, OUT);
  if (check) assert.deepEqual(await readFile(target), bytes, 'P055 conditional glossary candidate drift');
  else {
    await mkdir(path.dirname(target), {recursive: true});
    await writeFile(target, bytes, {flag: 'wx'});
  }
  return {output: OUT, bytes: bytes.length, sha256: digest(bytes), checked: check, status: data.status};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  assert.ok(process.argv.length === 3 && ['--prepare', '--check'].includes(arg), 'usage: prepare-nms-l02-ts-glossary.mjs --prepare|--check');
  prepareP055ConditionalGlossary({check: arg === '--check'})
    .then(result => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
    .catch(error => {process.stderr.write(`${error.stack ?? error.message}\n`); process.exitCode = 1;});
}
