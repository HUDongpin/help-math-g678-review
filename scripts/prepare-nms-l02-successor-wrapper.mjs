#!/usr/bin/env node
/** Generate one NMS L02 host wrapper while preserving the pinned P052 bindings. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SCRIPT=fileURLToPath(import.meta.url);
const SOURCE='apps/web/components/g678-nms-l02-p052-lesson.tsx';
const TARGET='apps/web/components/g678-nms-l02-successor-lesson.tsx';
const RECEIPT='output/nms-l02-host-successor-20260927/wrapper/source-preservation-receipt.json';
const SOURCE_BYTES=15545;
const SOURCE_SHA='8a51c768da62248218ab0cf70a8368fbb73210a79f30f686ec1d32e78a231d5a';
const OLD_TARGET_SHA='44f0d55a6ee0a7b1980112ac720e040abba85be7baac808f6cbf54a57b78b74f';
const OLD_RECEIPT_SHA='4ddba613c4a2d8bc330679e3bacc30a91f5bccf355aadbcf3f67656a195d6937';
const CANDIDATE_PLAYER='apps/web/components/g678-nms-l02-candidate-player.generated.tsx';
const CANDIDATE_PLAYER_SHA='6f6fbe94984ecf01f7169b9087a22697b3659d789cbe4c12465ce51bf7f71fec';
const P055_ID='shared-nms002-l02-p055';
const P055_COMPONENT='P055FourStepPlan';
const P055_MODULE='@/components/nms-l02-p055-lesson-runtime';
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
export function adapterBindings(source){
  const head=source.indexOf('const adapters = Object.freeze(['),tail=source.indexOf('\n]);',head);
  assert(head>=0&&tail>head,'frozen adapter table boundary absent');
  const table=source.slice(head,tail);
  const pattern=/Object\.freeze\(\{animationId:\s*'([^']+)',\s*audioEnabled:\s*(true|false),\s*Component:\s*([A-Za-z][A-Za-z0-9]*)\}\)/g;
  const matches=[...table.matchAll(pattern)];
  assert.equal((table.match(/Object\.freeze\(\{/g)??[]).length,matches.length,'unparsed adapter in table');
  const definitions=[...source.matchAll(/^const\s+([A-Za-z][A-Za-z0-9]*)\s*=/gm)]
    .map((match,index,array)=>({name:match[1],start:match.index,end:array[index+1]?.index??head}));
  const byName=new Map(definitions.filter(item=>item.name!=='adapters')
    .map(item=>[item.name,source.slice(item.start,item.end)]));
  const bindings=matches.map(match=>{
    const definition=byName.get(match[3]);
    assert(definition,`adapter component missing: ${match[3]}`);
    return {animationId:match[1],audioEnabled:match[2]==='true',component:match[3],
      definitionSha256:sha(definition),entrySha256:sha(match[0])};
  });
  assert.equal(new Set(bindings.map(item=>item.animationId)).size,bindings.length,'duplicate adapter animation ID');
  assert.equal(new Set(bindings.map(item=>item.component)).size,bindings.length,'duplicate adapter component');
  return bindings;
}
export function buildSuccessorWrapper(){
  const original=physical(SOURCE,{bytes:SOURCE_BYTES,sha256:SOURCE_SHA});
  const source=original.bytes.toString('utf8');
  const old=adapterBindings(source);
  assert.equal(old.length,49,'frozen P052 table must have 49 bindings');
  assert(!old.some(item=>item.animationId===P055_ID),'P055 already appears in source wrapper');
  assert(source.includes("import {G678MultiPageLessonPlayer} from './g678-multi-page-lesson-player-v3.generated';"),
    'v3 player binding changed');
  const candidatePlayer=physical(CANDIDATE_PLAYER,{sha256:CANDIDATE_PLAYER_SHA});
  const declaration=`const ${P055_COMPONENT} = process.env.NODE_ENV === 'production' ? () => null\n  : dynamic(() => import('${P055_MODULE}').then(m => m.NmsL02P055LessonRuntime), {ssr: false});\n`;
  const entry=` Object.freeze({animationId:'${P055_ID}',audioEnabled:true,Component:${P055_COMPONENT}}),\n`;
  let generated=source;
  generated=replaceOnce(generated,'const adapters = Object.freeze([',
    `${declaration}const adapters = Object.freeze([\n${entry.trimEnd()}`);
  generated=replaceOnce(generated,'export function G678NmsL2P052Lesson(',
    'export function G678NmsL02SuccessorLesson(');
  generated=replaceOnce(generated,
    "import {G678MultiPageLessonPlayer} from './g678-multi-page-lesson-player-v3.generated';",
    "import {G678NmsL02CandidatePlayer} from './g678-nms-l02-candidate-player.generated';");
  generated=replaceOnce(generated,'ComponentProps<typeof G678MultiPageLessonPlayer>',
    'ComponentProps<typeof G678NmsL02CandidatePlayer>');
  generated=replaceOnce(generated,'<G678MultiPageLessonPlayer {...props} privateRuntimeAdapters={adapters}/>',
    '<G678NmsL02CandidatePlayer {...props} privateRuntimeAdapters={adapters}/>');
  generated=replaceOnce(generated,
    '/** Successor wrapper preserves the frozen P051 adapter set without editing it.\n * Selection by a route still requires the independently frozen P052 descriptor. */',
    '/** Generated successor wrapper preserves all 49 pinned P052 adapter bindings.\n * The caller supplies the independently reviewed lesson descriptor. */');
  generated=replaceOnce(generated,'<div data-p051-lesson-host data-p052-lesson-host>',
    '<div data-p051-lesson-host data-p052-lesson-host data-p055-lesson-host>');
  const result=adapterBindings(generated);
  assert.equal(result.length,50,'successor must contain exactly 50 bindings');
  assert.deepEqual(result.slice(1),old,'all 49 prior adapters must remain byte-identical');
  assert.deepEqual(result[0],{animationId:P055_ID,audioEnabled:true,component:P055_COMPONENT,
    definitionSha256:sha(declaration),entrySha256:sha(entry.trim().replace(/,$/,''))});
  assert.equal(generated.split(P055_MODULE).length,2,'one P055 runtime import required');
  assert.equal(generated.split('privateRuntimeAdapters={adapters}').length,2,'one modern host binding required');
  assert.equal(generated.split('G678NmsL02CandidatePlayer').length,4,'import, prop type and element use candidate player');
  const output=Buffer.from(generated);
  const receipt={schemaVersion:1,kind:'nms-l02-p055-successor-wrapper-v1',source:original.pin,
    generator:physical(path.relative(ROOT,SCRIPT)).pin,
    generated:{path:TARGET,bytes:output.length,sha256:sha(output)},
    player:'g678-nms-l02-candidate-player.generated',candidatePlayer:candidatePlayer.pin,
    sourceAdapterCount:old.length,successorAdapterCount:result.length,
    preservedAdapterIdentitySha256:sha(JSON.stringify(old)),
    preservedBindings:old,p055Binding:result[0],
    sourceFileModified:false,existingPlayerModified:false,registryModified:false,
    productAdmissionAsserted:false,acceptanceEffect:'none'};
  return {source:original,output,receipt,old,result};
}
export function prepareNmsL02SuccessorWrapper(mode='--check'){
  assert(['--write','--refresh','--check','--dry-run'].includes(mode));
  const built=buildSuccessorWrapper();
  const files=[[TARGET,built.output],[RECEIPT,Buffer.from(json(built.receipt))]];
  if(mode==='--write'){
    for(const [file] of files)assert(!fs.existsSync(path.join(ROOT,file)),`refuse overwrite: ${file}`);
    for(const [file,body] of files){const full=path.join(ROOT,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,body,{flag:'wx'});}
  }else if(mode==='--refresh'){
    physical(TARGET,{sha256:OLD_TARGET_SHA});physical(RECEIPT,{sha256:OLD_RECEIPT_SHA});
    for(const [file,body] of files)fs.writeFileSync(path.join(ROOT,file),body);
  }else if(mode==='--check')for(const [file,body] of files)
    assert.deepEqual(physical(file).bytes,body,`successor wrapper drift: ${file}`);
  return {status:mode==='--write'||mode==='--refresh'?'SUCCESSOR_WRAPPER_WRITTEN':mode==='--check'?'SUCCESSOR_WRAPPER_VERIFIED':'SUCCESSOR_WRAPPER_PREPARED',
    sourceSha256:SOURCE_SHA,generatedSha256:built.receipt.generated.sha256,
    preservedBindings:built.old.length,successorBindings:built.result.length,p055:P055_ID,acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
  try{assert.equal(process.argv.length,3,'usage: node prepare-nms-l02-successor-wrapper.mjs --write|--refresh|--check|--dry-run');
    process.stdout.write(json(prepareNmsL02SuccessorWrapper(process.argv[2])));
  }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
