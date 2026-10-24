import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

export const SOURCE_GLOSSARY_SHA256 =
  "1314eb1cee6c79b357920fcb8d9847d075efebb18f357c920a4c35f4ec8594bc";
export const DECISIONS_SHA256 =
  "fc454fedae638cc1f07a963c8366493d393e333d4ff776579a4d84568a9345be";
export const PAGE_SOURCE_SHA256 =
  "28600adb8cd9a280e5052a25e448b7c71fc4b85ac4a5e89f6a73f23d7768a197";
export const ANIMATION_ID = "shared-nms002-l02-p050";
export const ENTRY_IDS = [
  "decimal",
  "fraction",
  "number-line",
  "part",
  "place-verb",
  "whole",
];
export const BUTTON_MAPPINGS = [
  {buttonId: 11, requestedKey: "Number line", id: "number-line"},
  {buttonId: 12, requestedKey: "Fraction", id: "fraction"},
  {buttonId: 13, requestedKey: "Place (verb)", id: "place-verb"},
  {buttonId: 16, requestedKey: "Part", id: "part"},
  {buttonId: 17, requestedKey: "Whole", id: "whole"},
  {buttonId: 24, requestedKey: "Decimal", id: "decimal"},
];

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const defaultSourcePath = path.join(
  projectRoot,
  "migrations/shared-nms002-l02-p050/audit/source-glossary-v1.json",
);
const defaultDecisionsPath = path.join(
  projectRoot,
  "migrations/shared-nms002-l02-p050/audit/glossary-presentation-decisions-v1.json",
);
const defaultOutputPath = path.join(
  projectRoot,
  "packages/demos/src/generated/nms-l02-p050-glossary-v1.ts",
);
const generatorReference = "scripts/generate-nms-l02-p050-glossary-v1.mjs";

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function readExact(filePath, expectedSha256, label) {
  const bytes = fs.readFileSync(filePath);
  const digest = sha256(bytes);
  assert.equal(
    digest,
    expectedSha256,
    label + " SHA-256 " + digest + " does not match " + expectedSha256,
  );
  return bytes;
}

function localizedText(value, label) {
  assert.equal(typeof value?.en, "string", label + ".en must be a string");
  assert.equal(typeof value?.es, "string", label + ".es must be a string");
  assert.equal(Object.keys(value).length, 2, label + " must contain only en and es");
  return {en: value.en, es: value.es};
}

export function buildP050Glossary({sourceBytes, decisionsBytes} = {}) {
  const sourceDigest = sha256(sourceBytes);
  const decisionsDigest = sha256(decisionsBytes);
  assert.equal(sourceDigest, SOURCE_GLOSSARY_SHA256, "source glossary bytes drifted");
  assert.equal(decisionsDigest, DECISIONS_SHA256, "presentation decision bytes drifted");

  const source = JSON.parse(sourceBytes.toString("utf8"));
  const decisions = JSON.parse(decisionsBytes.toString("utf8"));
  assert.equal(decisions.sourceGlossarySha256, SOURCE_GLOSSARY_SHA256);
  assert.equal(source.animationId, ANIMATION_ID);
  assert.equal(source.sourceSha256, PAGE_SOURCE_SHA256);
  assert.equal(source.entries.length, 6);
  assert.equal(decisions.entries, 6);

  const entryIds = source.entries.map((entry) => entry.id);
  assert.deepEqual([...entryIds].sort(), ENTRY_IDS);
  assert.deepEqual(entryIds, ENTRY_IDS);

  assert.equal(source.buttons.length, 6);
  assert.deepEqual(
    source.buttons.map(({buttonId, requestedKey}) => ({buttonId, requestedKey})),
    BUTTON_MAPPINGS.map(({buttonId, requestedKey}) => ({buttonId, requestedKey})),
  );
  const entriesBySourceKey = new Map(
    source.entries.map((entry) => [entry.sourceKeyAttribute, entry.id]),
  );
  for (const mapping of BUTTON_MAPPINGS) {
    const resolvedId = mapping.id === "place-verb"
      ? entriesBySourceKey.get("Place (Verb)")
      : entriesBySourceKey.get(mapping.requestedKey);
    assert.equal(resolvedId, mapping.id, "button " + mapping.buttonId + " mapping drifted");
  }

  assert.deepEqual(
    decisions.corrections.map((correction) => correction.id),
    ["whole"],
  );
  const correction = decisions.corrections[0];
  assert.equal(
    correction.en,
    "The entire object, quantity, or group being considered. A fraction can represent part of that whole.",
  );
  assert.equal(
    correction.es,
    "El objeto, la cantidad o el grupo completo que se considera. Una fracción puede representar una parte de ese todo.",
  );
  assert.deepEqual(decisions.notation, {
    en: "This activity uses a decimal point, as in 0.8.",
    es: "En esta actividad usamos el punto decimal, como en 0.8.",
  });

  const glossary = source.entries.map((entry) => {
    const labels = localizedText(entry.labels, entry.id + " labels");
    const sourceDefinitions = localizedText(
      entry.definitions,
      entry.id + " definitions",
    );
    const corrected = correction.id === entry.id;
    if (corrected) {
      assert.notDeepEqual(sourceDefinitions, {
        en: correction.en,
        es: correction.es,
      });
    }
    return {
      id: entry.id,
      labels,
      definitions: corrected
        ? {en: correction.en, es: correction.es}
        : sourceDefinitions,
    };
  });

  const text = "// Generated by " + generatorReference + "; do not edit.\n"
    + "export const P050_GLOSSARY=" + JSON.stringify(glossary) + " as const;\n"
    + "export const P050_DECIMAL_NOTATION=" + JSON.stringify(decisions.notation) + " as const;\n";
  assert.equal(text.includes("migrations/"), false);
  assert.equal(text.includes("receipt"), false);
  assert.equal(text.includes("/Volumes/"), false);
  assert.equal(text.includes("HELP_KEYTERMS"), false);
  return {glossary, notation: decisions.notation, text};
}

export function renderP050Glossary(options = {}) {
  const sourceBytes = readExact(
    options.sourcePath ?? defaultSourcePath,
    SOURCE_GLOSSARY_SHA256,
    "source glossary",
  );
  const decisionsBytes = readExact(
    options.decisionsPath ?? defaultDecisionsPath,
    DECISIONS_SHA256,
    "presentation decisions",
  );
  return buildP050Glossary({sourceBytes, decisionsBytes});
}

function parseMode(argv) {
  const modes = argv.filter((arg) => arg === "--write" || arg === "--check");
  assert.equal(modes.length, 1, "choose exactly one of --write or --check");
  return modes[0];
}

export function runCli(argv = process.argv.slice(2), options = {}) {
  const mode = parseMode(argv);
  const outputPath = options.outputPath ?? defaultOutputPath;
  const rendered = renderP050Glossary(options);
  if (mode === "--check") {
    const current = fs.readFileSync(outputPath, "utf8");
    assert.equal(current, rendered.text, "P050 glossary output drifted");
    return {status: "PASS", mode, entries: 6, explicitCorrections: ["whole"]};
  }

  if (fs.existsSync(outputPath)) {
    const current = fs.readFileSync(outputPath, "utf8");
    assert.equal(
      current,
      rendered.text,
      "existing P050 glossary differs; write a versioned successor instead of replacing it",
    );
    return {status: "PASS", mode, entries: 6, explicitCorrections: ["whole"], unchanged: true};
  }
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, rendered.text, {flag: "wx"});
  return {status: "PASS", mode, entries: 6, explicitCorrections: ["whole"], created: true};
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = runCli();
  console.log(JSON.stringify(result));
}
