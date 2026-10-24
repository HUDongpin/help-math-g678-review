// Bounded P014 source-glossary resolver. Retains original raw-entry hashes.
// The exact Equivalent Decimal entry contains &#x00BD; (Unicode one half).
// Existing frozen successor generator and its numeric allowlist remain intact.
import {createHash} from 'node:crypto';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const exact = (a,b) => JSON.stringify(a) === JSON.stringify(b);
function requireFact(value, message) {
  if (!value) throw new Error(`BLOCKED_SUCCESSOR_GLOSSARY: ${message}`);
}
// Legacy element names contain ~LNG~ and are not XML-name compliant. Apply
// the frozen audit's bounded record grammar; never repair or rewrite source.
export function decodeGlossaryText(value) {
  const named = {nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>'};
  const numeric = {'003c': '<', '003e': '>', '2260': '≠', '2264': '≤', '2265': '≥', '00b0': '°', '00b3': '³', '00bd': '½'};
  return value.replace(/&(?:#x([a-f0-9]+)|(#\d+)|([a-z]+));/giu, (entity, hex, decimal, name) => {
    const result = hex ? numeric[hex.toLowerCase()] : decimal ? undefined : named[name];
    requireFact(result !== undefined, `unsupported source entity ${entity}`);
    return result;
  }).replace(/\s+/gu, ' ').trim();
}
const normalize = (value) => decodeGlossaryText(value).toLowerCase();
const termId = (key) => normalize(key).replace(/[^a-z0-9]+/gu, '-').replace(/(^-|-$)/gu, '');
export function resolveSourceGlossary(xmlByLanguage, keys, source) {
  const selected = {};
  for (const lang of ['en', 'es']) {
    selected[lang] = new Map();
    for (const match of xmlByLanguage[lang].matchAll(/<([^\s>]+~LNG~[^\s>]+)\s+([^>]*)>([\s\S]*?)<\/\1\s*>/gu)) {
      const attrs = Object.fromEntries([...match[2].matchAll(/([A-Za-z]+)\s*=\s*"([^"]*)"/gu)].map((row) => [row[1], row[2]]));
      const key = attrs.ScreenkeyTerm;
      if (!key || !keys.some((requested) => normalize(requested) === normalize(key))) continue;
      const labels = match[1].split('~LNG~').map((label) => decodeGlossaryText(label.replaceAll('~', ' ')));
      if (normalize(labels[0]) !== normalize(key)) continue;
      const definitions = match[3].split('~LNG~');
      requireFact(definitions.length === 2 && attrs.ExFileName?.endsWith('.swf'), `${key}: malformed legacy entry`);
      const bucket = selected[lang].get(normalize(key)) ?? [];
      bucket.push({key, labels: {en: key, es: labels[1]},
        definitions: {en: decodeGlossaryText(definitions[0]), es: decodeGlossaryText(definitions[1])},
        sha256: hash(Buffer.from(match[0])),
        lfNormalizedSha256: hash(Buffer.from(match[0].replace(/\r\n?/gu, '\n')))});
      selected[lang].set(normalize(key), bucket);
    }
  }
  return [...new Set(keys.map(normalize))].sort().map((key) => {
    const left = selected.en.get(key), right = selected.es.get(key);
    requireFact(left?.length === 1 && right?.length === 1, `${key}: missing or ambiguous exact bilingual entry`);
    requireFact(exact(left[0].labels, right[0].labels) && exact(left[0].definitions, right[0].definitions), `${key}: bilingual source definition/label disagreement`);
    return {id: termId(key), sourceKeyAttribute: left[0].key, labels: left[0].labels,
      definitions: left[0].definitions, source,
      sourceEntrySha256: {en: left[0].sha256, es: right[0].sha256},
      extractionLfNormalizedEntrySha256: {en: left[0].lfNormalizedSha256, es: right[0].lfNormalizedSha256}};
  });
}
