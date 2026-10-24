import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin} from '../lib/g678-admission-proof.mjs';
import {resolveSourceGlossary} from './build-g678-alg-l11-instructional-successor-glossary.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const base='migrations/shared-alg001-l06-p014/audit';
const output=`${base}/glossary-v1/input-output-crosswalk-v1.json`;
const oldPin={path:'migrations/shared-alg001-l06-p013/audit/glossary-v1/input-output-crosswalk-v1.json',bytes:9423,sha256:'7a6d26e663d948f77833378ee1c2c5e60130e55aa6299bc7b0eacf070b091e2e'};
const sourcePin={path:`${base}/source-v1/source-audit-v1.json`,bytes:10839,sha256:'008dd6f28d312f41c48ab389efce2e58452aef83c98312fa981c5aa88d69eb13'};
const fields=({id,sourceKeyAttribute,labels,definitions,source})=>({id,sourceKeyAttribute,labels,definitions,source});
export function buildP014Glossary(){
 const predecessor=readJsonPin(ROOT,oldPin),source=readJsonPin(ROOT,sourcePin);
 const compositionPin=source.artifacts.find(p=>p.path.endsWith('/source-composition-v1.json'));
 const scriptsPin=source.artifacts.find(p=>p.path.endsWith('/public-tool-scripts-v1.json'));
 assert(compositionPin&&scriptsPin);
 const composition=readJsonPin(ROOT,compositionPin),scripts=readJsonPin(ROOT,scriptsPin);
 readPin(SOURCE_ROOT,source.source);
 const xml=readPin(SOURCE_ROOT,source.lessonXml).toString();
 assert.equal(source.animationId,'shared-alg001-l06-p014');
 assert(xml.includes('VB/L6VB05.swf'));
 for(const ref of Object.values(predecessor.dictionaryReference))assert(xml.includes(ref));
 const buttons=[['input','Input',32,3],['output','Output',33,5]].map(([id,key,characterId,depth])=>{
  const actual=composition.buttons.find(b=>b.characterId===characterId);
  const prior=predecessor.sourceButtons.find(b=>b.sourceKeyAttribute===key);
  assert(actual&&prior);assert.equal(actual.actions.sha256,prior.actionSha256);
  assert.deepEqual(actual.placements,[{domain:'sprite-227',firstFrame:2,lastFrameExclusive:450,depth}]);
  const action=scripts.files.find(f=>f.path===`scripts/DefineButton2_${characterId}/BUTTONCONDACTION on(release).as`);
  assert(action);assert.equal(action.text.replace(/\r\n/g,'\n').trim(),prior.decompiledAction.trim());
  return {id,key,characterId,depth,firstFrame:2,lastFrameExclusive:450,
   actionSha256:actual.actions.sha256,action:action.text.replace(/\r\n/g,'\n').trim()};
 });
 const banks={};
 for(const locale of ['en','es']){
  const pin=predecessor.inputs.dictionaryBanks[locale];
  banks[locale]=readPin(path.dirname(pin.path),{...pin,path:path.basename(pin.path)}).toString();
 }
 const dictionarySource=Object.fromEntries(['en','es'].map(locale=>[locale,{
  assetId:`G678L1KT${locale==='en'?'E':'S'}01.xml`,path:predecessor.dictionaryReference[locale],
  sha256:predecessor.inputs.dictionaryBanks[locale].sha256}]));
 const resolved=resolveSourceGlossary(banks,['Input','Output'],dictionarySource);
 assert.deepEqual(resolved.map(e=>e.id),['input','output']);
 for(const entry of resolved){
  const prior=predecessor.terms.find(t=>t.entryId===entry.id);assert(prior);
  assert.deepEqual(entry.labels,prior.labels);assert.deepEqual(entry.definitions,prior.definitions);
  assert.deepEqual(entry.sourceEntrySha256,prior.sourceEntrySha256);
 }
 return {schemaVersion:1,kind:'alg-l06-p014-input-output-glossary-crosswalk-v1',
  animationId:source.animationId,source:source.source,lessonXml:source.lessonXml,
  inputs:{source:pinFile(ROOT,sourcePin.path),composition:compositionPin,scripts:scriptsPin,
   predecessor:oldPin,dictionaryBanks:predecessor.inputs.dictionaryBanks},
  buttons,terms:resolved.map(fields),dictionaryReference:predecessor.dictionaryReference,
  reuse:'exact P014 release actions and raw bilingual dictionary entries match P013; reuse existing input/output IDs',
  originalHost:{actualLaunchObserved:false,localeSelectsSpanishDefinitionObserved:false},
  acceptanceEffects:{originalRuntime:false,fidelity:false,audio:false,human:false,owner:false,strictComplete:false,published:false}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];assert(['--write','--check'].includes(mode));
 const bytes=Buffer.from(JSON.stringify(buildP014Glossary(),null,2)+'\n'),file=path.join(ROOT,output);
 if(mode==='--write'){mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,bytes,{flag:'wx'});}
 else assert(readFileSync(file).equals(bytes));
 console.log(JSON.stringify({mode,output:pinFile(ROOT,output)}));
}
