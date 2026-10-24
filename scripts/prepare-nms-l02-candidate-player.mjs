#!/usr/bin/env node
/** Exact, reviewable two-count projection of the pinned v3 player. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SCRIPT=fileURLToPath(import.meta.url);
const SOURCE='apps/web/components/g678-multi-page-lesson-player-v3.generated.tsx';
const TARGET='apps/web/components/g678-nms-l02-candidate-player.generated.tsx';
const RECEIPT='output/nms-l02-host-successor-20260927/wrapper/candidate-player-source-preservation.json';
const SOURCE_BYTES=53663;
const SOURCE_SHA='6ce7fa830208f76ac40c3c81a289e2c92dc587e13aa172e354a6fe5399f33522';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>`${JSON.stringify(value,null,2)}\n`;
function physical(file,expected){
 const full=path.resolve(ROOT,file),before=fs.lstatSync(full,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&fs.realpathSync(full)===full,`physical source required: ${file}`);
 const bytes=fs.readFileSync(full),after=fs.lstatSync(full,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs'])assert.equal(before[key],after[key],`source changed while reading: ${file}`);
 if(expected?.bytes!==undefined)assert.equal(bytes.length,expected.bytes,`source bytes changed: ${file}`);
 if(expected?.sha256)assert.equal(sha(bytes),expected.sha256,`source SHA changed: ${file}`);
 return {bytes,pin:{path:file,bytes:bytes.length,sha256:sha(bytes)}};
}
function replaceOnce(source,before,after){
 assert.equal(source.split(before).length,2,`one exact source marker required: ${before}`);
 return source.replace(before,after);
}
const TRANSFORMS=Object.freeze([
 ['export-name','export function G678MultiPageLessonPlayer({','export function G678NmsL02CandidatePlayer({'],
 ['destructured-prop','  reviewerMode = false,\n  strictCompleteMemberCount,',
  '  reviewerMode = false,\n  unregisteredCandidateIds = [],\n  strictCompleteMemberCount,'],
 ['prop-type','  reviewerMode?: boolean;\n  strictCompleteMemberCount: number;',
  '  reviewerMode?: boolean;\n  unregisteredCandidateIds?: readonly string[];\n  strictCompleteMemberCount: number;'],
 ['display-count-derivation',
  "  const totalPageCount = descriptor.pages.length;",
  "  const unregisteredCandidateIdSet = new Set(unregisteredCandidateIds);\n  const unregisteredCandidatePageCount = registeredPages.filter(\n    (page) => unregisteredCandidateIdSet.has(page.animationId),\n  ).length;\n  const displayedRegisteredPageCount =\n    registeredPages.length - unregisteredCandidatePageCount;\n  const candidateCountLabel = spanish\n    ? `${unregisteredCandidatePageCount} páginas candidatas sin registrar`\n    : `${unregisteredCandidatePageCount} unregistered candidate pages`;\n  const totalPageCount = descriptor.pages.length;"],
 ['whole-lesson-candidate-guard',
  '    registeredPages.length === descriptor.course.activePageCount &&',
  '    displayedRegisteredPageCount === descriptor.course.activePageCount &&\n    unregisteredCandidatePageCount === 0 &&'],
 ['reviewer-count-es',
  '${registeredPages.length}/${descriptor.pages.length} páginas current-JS;',
  '${displayedRegisteredPageCount}/${descriptor.pages.length} páginas current-JS; ${candidateCountLabel};'],
 ['reviewer-count-en',
  '${registeredPages.length}/${descriptor.pages.length} current-JS pages;',
  '${displayedRegisteredPageCount}/${descriptor.pages.length} current-JS pages; ${candidateCountLabel};'],
 ['release-boundary-count',
  '        currentJsPageCount: registeredPages.length,',
  '        currentJsPageCount: displayedRegisteredPageCount,'],
 ['package-count-schema2-es',
  'Puente privado page-only: ${registeredPages.length}/${descriptor.course.activePageCount} páginas registradas en el host moderno My Lesson;',
  'Puente privado page-only: ${displayedRegisteredPageCount}/${descriptor.course.activePageCount} páginas registradas en el host moderno My Lesson; ${candidateCountLabel};'],
 ['package-count-schema2-en',
  'Private page-only bridge: ${registeredPages.length}/${descriptor.course.activePageCount} pages registered in the modern My Lesson host;',
  'Private page-only bridge: ${displayedRegisteredPageCount}/${descriptor.course.activePageCount} pages registered in the modern My Lesson host; ${candidateCountLabel};'],
 ['package-count-schema1-es',
  'Interfaz funcional de auditoría con ${registeredPages.length}/${descriptor.course.activePageCount} páginas registradas y el candidato de shell JavaScript;',
  'Interfaz funcional de auditoría con ${displayedRegisteredPageCount}/${descriptor.course.activePageCount} páginas registradas y el candidato de shell JavaScript; ${candidateCountLabel};'],
 ['package-count-schema1-en',
  'Functional audit interface with ${registeredPages.length}/${descriptor.course.activePageCount} registered pages and the JavaScript shell candidate;',
  'Functional audit interface with ${displayedRegisteredPageCount}/${descriptor.course.activePageCount} registered pages and the JavaScript shell candidate; ${candidateCountLabel};'],
]);
export function buildNmsL02CandidatePlayer(){
 const original=physical(SOURCE,{bytes:SOURCE_BYTES,sha256:SOURCE_SHA});
 let generated=original.bytes.toString('utf8');
 for(const [,before,after] of TRANSFORMS)generated=replaceOnce(generated,before,after);
 let recovered=generated;
 for(const [,before,after] of [...TRANSFORMS].reverse())recovered=replaceOnce(recovered,after,before);
 assert.equal(recovered,original.bytes.toString('utf8'),'candidate player has only reviewed transformations');
 assert.equal((generated.match(/registeredPages\.length/g)??[]).length,2,
  'only base availability and derived candidate count retain raw registered length');
 const output=Buffer.from(generated);
 const receipt={schemaVersion:1,kind:'nms-l02-candidate-player-source-preservation-v1',
  source:original.pin,generator:physical(path.relative(ROOT,SCRIPT)).pin,
  generated:{path:TARGET,bytes:output.length,sha256:sha(output)},
  transforms:TRANSFORMS.map(([id,before,after])=>({id,beforeSha256:sha(before),afterSha256:sha(after)})),
  inverseTransformRecreatesSource:true,
  displayOnlyCandidateIdsProp:'unregisteredCandidateIds',
  preservedRuntimeAvailabilityAndNavigation:true,sourceFileModified:false,
  registrationClaimEffect:'exclude-specified-candidates-only',acceptanceEffect:'none'};
 return {source:original,output,receipt,transforms:TRANSFORMS};
}
export function prepareNmsL02CandidatePlayer(mode='--check'){
 assert(['--write','--check','--dry-run'].includes(mode));
 const built=buildNmsL02CandidatePlayer();
 const files=[[TARGET,built.output],[RECEIPT,Buffer.from(json(built.receipt))]];
 if(mode==='--write'){
  for(const [file] of files)assert(!fs.existsSync(path.join(ROOT,file)),`refuse overwrite: ${file}`);
  for(const [file,body] of files){const full=path.join(ROOT,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,body,{flag:'wx'});}
 }else if(mode==='--check')for(const [file,body] of files)
  assert.deepEqual(physical(file).bytes,body,`candidate player drift: ${file}`);
 return {status:mode==='--write'?'CANDIDATE_PLAYER_WRITTEN':mode==='--check'?'CANDIDATE_PLAYER_VERIFIED':'CANDIDATE_PLAYER_PREPARED',
  sourceSha256:SOURCE_SHA,generatedSha256:built.receipt.generated.sha256,transformCount:TRANSFORMS.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{assert.equal(process.argv.length,3,'usage: node prepare-nms-l02-candidate-player.mjs --write|--check|--dry-run');
  process.stdout.write(json(prepareNmsL02CandidatePlayer(process.argv[2])));
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
