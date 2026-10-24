#!/usr/bin/env node
/** Source-bound P015 glossary and optional-SA host crosswalk. No product writes. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseSwfSourceFacts} from './build-g4-l3-machine-source-audits.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {resolveSourceGlossary} from './build-g678-alg-l11-instructional-successor-glossary.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const PRIVATE_ROOT='/Volumes/WestWorld/HELP MATH Related Files';
const HOST_ROOT='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1';
const ID='shared-alg001-l06-p015';
const SWF='G6-G8-shared/ALG001/L6/VB/L6VB06.swf';
const LESSON='G6-G8-shared/ALG001/L6/index.xml';
const SA='G6-G8-shared/ALG001/L6/SA/L6VB06.mp3';
const OUTPUT='migrations/shared-alg001-l06-p015/audit/glossary-v1/six-term-crosswalk-v1.json';
const PROBE='output/alg-l06-p015-glossary-probe-v1/ffdec-scripts';
const P004='migrations/shared-alg001-l06-p004/audit/source-glossary-v1.json';
const HOST_SCRIPT='scripts/scripts/frame_35/DoAction.as';
const HOST_SA_RELEASE='scripts/scripts/DefineButton2_273/BUTTONCONDACTION on(release).as';
const TERMS=[
  {key:'Function',id:'function',characterId:36,firstFrame:164,depth:4},
  {key:'Value',id:'value',characterId:37,firstFrame:164,depth:6},
  {key:'Relation',id:'relation',characterId:38,firstFrame:164,depth:8},
  {key:'Rule',id:'rule',characterId:45,firstFrame:271,depth:14},
  {key:'Input',id:'input',characterId:46,firstFrame:271,depth:16},
  {key:'Output',id:'output',characterId:47,firstFrame:271,depth:18},
];
const SHA={swf:'d0f395f5410353733b42ae29198caa86fae6b6eebd0e2a71830a203d969868b1',
 lesson:'9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c',
 sa:'55ae5c2c9d5aa5b3a00f3fd30e642f6410dcaf6b9e66f1bf77ee349cce2bf434',
 p004:'0cb0789f117db00855a5be1c1123121cdd64b7eba03b2f64ddce3d7f81f999e0',
 host:'380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74',
 saRelease:'c177d473fd8a90ab61ed17bc4b63a895cee9fedc1f316658af43e8984dd43f33',
 en:'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b',
 es:'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const encode=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
function readPinned(location,expectedSha){
  assert.equal(fs.realpathSync(location),location,`physical source: ${location}`);
  const before=fs.lstatSync(location,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary source: ${location}`);
  const bytes=fs.readFileSync(location),after=fs.lstatSync(location,{bigint:true});
  for(const key of ['dev','ino','size','mtimeNs','nlink'])
    assert.equal(before[key],after[key],`source drift ${key}: ${location}`);
  assert.equal(hash(bytes),expectedSha,`source SHA-256: ${location}`);
  return bytes;
}
const pin=(location,bytes)=>({path:location,bytes:bytes.length,sha256:hash(bytes)});
function section(script,name){
  const start=script.indexOf(`function ${name}()`);
  assert(start>=0,`host function ${name}`);
  const next=script.indexOf('\nfunction ',start+1);
  return script.slice(start,next<0?undefined:next);
}
export function parseP015GlossaryRelease(text){
  const normalized=text.replace(/\r\n/g,'\n');
  const match=/^on\(release\)\{\n   _global\.KeyAttribute = "([A-Za-z]+)";\n   _root\.DoHyperLinks\(\);\n   _root\.animation_mc\.animation\.stop\(\);\n\}\n?$/u.exec(normalized);
  assert(match,'P015 exact glossary release sequence');
  assert(TERMS.some(row=>row.key===match[1]),'P015 exact glossary release key');
  return match[1];
}
function freshExport(){
  const scratch=fs.mkdtempSync(path.join(ROOT,'output/alg-l06-p015-glossary-probe-v1/.scratch-'));
  try{
    const target=path.join(scratch,'scripts');
    const result=spawnSync('ffdec',['-onerror','abort','-export','script',target,path.join(SOURCE_ROOT,SWF)],
      {encoding:'utf8',maxBuffer:8*1024*1024});
    assert.equal(result.error,undefined,result.error?.message);
    assert.equal(result.status,0,result.stderr);
    assert(result.stdout.includes('JPEXS Free Flash Decompiler v.26.2.1'),'FFDec version');
    const files=[];
    function visit(dir){
      for(const item of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
        const full=path.join(dir,item.name);
        assert(!item.isSymbolicLink(),'export symlink');
        if(item.isDirectory())visit(full);
        else{assert(item.isFile(),'export ordinary file');
          const relative=path.relative(target,full).split(path.sep).join('/');
          const bytes=fs.readFileSync(full);
          const retained=readPinned(path.join(ROOT,PROBE,relative),hash(bytes));
          assert(bytes.equals(retained),`retained FFDec export: ${relative}`);
          files.push(pin(`${PROBE}/${relative}`,bytes));}
      }
    }
    visit(target);
    assert.equal(files.length,8,'six buttons plus two frame scripts');
    return files;
  }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}
const productFields=({id,sourceKeyAttribute,labels,definitions,source})=>
 ({id,sourceKeyAttribute,labels,definitions,source});

export function buildP015GlossaryAudit(){
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'real AWS source root');
  const swf=readPinned(path.join(SOURCE_ROOT,SWF),SHA.swf);
  const xml=readPinned(path.join(SOURCE_ROOT,LESSON),SHA.lesson).toString('utf8');
  const sa=readPinned(path.join(SOURCE_ROOT,SA),SHA.sa);
  const priorBytes=readPinned(path.join(ROOT,P004),SHA.p004),prior=JSON.parse(priorBytes);
  const hostPath=path.join(HOST_ROOT,HOST_SCRIPT),hostBytes=readPinned(hostPath,SHA.host);
  const host=hostBytes.toString('utf8').replace(/\r\n/g,'\n');
  const saReleasePath=path.join(HOST_ROOT,HOST_SA_RELEASE);
  const saReleaseBytes=readPinned(saReleasePath,SHA.saRelease);
  const saRelease=saReleaseBytes.toString('utf8').replace(/\r\n/g,'\n');
  assert(xml.includes('<Section SName="VB" SNumber="3"'));
  assert(xml.includes('<Page Title="Function (Input-Output Concept)" RandomAudio="" BGText="">VB/L6VB06.swf</Page>'));
  assert(xml.includes('<English>HELP_KEYTERMS/KT/XML/L1KTE01.xml</English>'));
  assert(xml.includes('<Spanish>HELP_KEYTERMS/KT/XML/L1KTS01.xml</Spanish>'));
  const facts=parseSwfSourceFacts(swf),catalog=collectSwfTextSourceCatalog(swf);
  assert.deepEqual([facts.header.signature,facts.header.version,facts.header.fps,
    facts.header.stage.width,facts.header.stage.height,facts.header.rootFrameCount],
    ['CWS',6,12,800,600,10]);
  assert.equal(facts.header.uncompressedSha256,'0618229e9cce8df1aabd5ea312339218e78ad0449dcc47244e2136df65144700');
  assert.equal(facts.actionScript.version,'AS1/2');
  assert.deepEqual(facts.frameDomains.domains.map(row=>[row.domainId,row.declaredFrameCount]),
    [['root',10],['sprite-270',914]]);
  const rootTimeline=catalog.timelines.find(row=>row.timelineId==='root');
  const main=catalog.timelines.find(row=>row.timelineId==='sprite-270');
  assert(rootTimeline&&main);
  const rootPlacement=rootTimeline.events.find(row=>row.kind==='place'&&row.characterId===270);
  assert.deepEqual([rootPlacement.frame,rootPlacement.depth,rootPlacement.name.text],[6,2,'animation']);
  const exported=freshExport();
  const actionFiles=exported.filter(row=>row.path.includes('/DefineButton2_'));
  assert.equal(actionFiles.length,6,'all source buttons accounted for');
  const buttons=TERMS.map(wanted=>{
    const actionPath=`${PROBE}/scripts/DefineButton2_${wanted.characterId}/BUTTONCONDACTION on(release).as`;
    const actionPin=actionFiles.find(row=>row.path===actionPath);
    assert(actionPin,`button ${wanted.characterId} export`);
    const sourceAction=fs.readFileSync(path.join(ROOT,actionPath),'utf8');
    assert.equal(parseP015GlossaryRelease(sourceAction),wanted.key);
    const events=main.events.filter(row=>row.depth===wanted.depth);
    assert.deepEqual(events.map(row=>[row.kind,row.frame,row.characterId]),
      [['place',wanted.firstFrame,wanted.characterId]],`button ${wanted.key} source window`);
    assert.equal(events[0].name.text,'AnsBtn1');
    return {sourceKeyAttribute:wanted.key,entryId:wanted.id,characterId:wanted.characterId,
      domain:'sprite-270',firstFrame:wanted.firstFrame,lastFrameExclusive:915,
      depth:wanted.depth,instanceName:'AnsBtn1',event:'release',actionPin,
      decompiledAction:sourceAction.replace(/\r\n/g,'\n').trim(),
      sourceEffects:['set exact _global.KeyAttribute','call _root.DoHyperLinks',
        'stop _root.animation_mc.animation regardless of Key Terms setting']};
  });
  const bankPins={en:prior.dictionaries.en,es:prior.dictionaries.es};
  assert.deepEqual([bankPins.en.sha256,bankPins.es.sha256],[SHA.en,SHA.es]);
  const banks=Object.fromEntries(['en','es'].map(locale=>[locale,
    readPinned(bankPins[locale].path,bankPins[locale].sha256).toString('utf8')]));
  const dictionarySource={en:{assetId:'G678L1KTE01.xml',path:'HELP_KEYTERMS/KT/XML/L1KTE01.xml',sha256:SHA.en},
    es:{assetId:'G678L1KTS01.xml',path:'HELP_KEYTERMS/KT/XML/L1KTS01.xml',sha256:SHA.es}};
  const resolved=resolveSourceGlossary(banks,TERMS.map(row=>row.key),dictionarySource);
  const entries=TERMS.map(wanted=>{
    const actual=resolved.find(row=>row.id===wanted.id);
    const old=prior.entries.find(row=>row.id===wanted.id&&row.sourceKeyAttribute===wanted.key);
    assert(actual&&old,`exact bilingual entry: ${wanted.key}`);
    assert.equal(actual.sourceKeyAttribute,wanted.key);
    assert.deepEqual(productFields(actual),productFields(old));
    assert.deepEqual(actual.sourceEntrySha256,old.sourceEntrySha256);
    assert.deepEqual(actual.extractionLfNormalizedEntrySha256,old.extractionLfNormalizedEntrySha256);
    return {id:actual.id,sourceKeyAttribute:wanted.key,labels:actual.labels,
      definitions:actual.definitions,source:actual.source,
      sourceEntrySha256:actual.sourceEntrySha256,
      extractionLfNormalizedEntrySha256:actual.extractionLfNormalizedEntrySha256,
      exactP004SourceEntryReuse:true};
  });
  const glossaryHost=section(host,'DoHyperLinks');
  for(const phrase of ['dtfKTLesson.text.toUpperCase() != "OFF"','_loc2_.Pause = true',
    '_loc2_.Play = false','_loc2_.KeyAttribute += "~English"',
    '_loc1_.m_c.doGetSubLink(_loc2_.KeyAttribute)'])assert(glossaryHost.includes(phrase));
  assert(glossaryHost.indexOf('KeyAttribute += "~English"')<glossaryHost.indexOf('doGetSubLink'));
  const saPlayHost=section(host,'doPlaySpanishAudio'),saCheckHost=section(host,'doCheckSpanishAudio');
  for(const phrase of ['_global.Pause = true','_root.animation_mc.animation.stop()',
    '"/SA/"','new Sound()','loadSound(SndFName,false)','spanSoundMp3.start(0)'])
    assert(saPlayHost.includes(phrase),`SA host ${phrase}`);
  for(const phrase of ['dtfSPANISH.text.toUpperCase() == "ON"','spanSound != true',
    'tempString.toUpperCase() != "01.SWF"'])assert(saCheckHost.includes(phrase));
  assert(saRelease.includes('_root.doPlaySpanishAudio();'));
  return {schemaVersion:1,kind:'alg-l06-p015-six-term-glossary-crosswalk-v1',
    animationId:ID,status:'static-source-crosswalk-only; no P015 product or original-runtime claim',
    inputs:{swf:pin(SWF,swf),lessonXml:pin(LESSON,Buffer.from(xml)),
      separateSpanishAudio:pin(SA,sa),ffdecExportedScripts:exported,
      oldHostFunctions:pin(hostPath,hostBytes),oldHostSaRelease:pin(saReleasePath,saReleaseBytes),
      dictionaryBanks:bankPins,p004Glossary:pin(P004,priorBytes)},
    sourcePlacement:{globalOrdinal:15,section:'VB',sectionNumber:3,
      sectionPageOrdinal:5,sourceReference:'VB/L6VB06.swf',rootEntryFrame:6,
      mainDomain:'sprite-270',mainFrameCount:914},
    sourceButtons:buttons,dictionaryReference:{en:dictionarySource.en.path,es:dictionarySource.es.path},
    terms:entries,
    oldHostStaticPath:{keyTermsEnabledBranch:'dtfKTLesson != OFF',
      pausesHost:true,lookupSuffix:'~English',calls:'m_c.doGetSubLink',
      sourceStopsMainEvenWhenKeyTermsOff:true,actualLaunchObserved:false,
      spanishLocaleSelectingSpanishDefinitionObserved:false},
    separateSpanishAudio:{sourceRole:'separate optional page audio; not an embedded main track',
      source:pin(SA,sa),derivedUrlTemplate:'<ServerRoot>/HELP_COURSES/ALG001/L6/SA/L6VB06.mp3',
      legacyHostVisibilityCondition:'dtfSPANISH ON, no active SA, eligible section, page basename not 01.SWF',
      p015StaticGate:'VB sectionNumber 3 and suffix 06.SWF meet the conditional section and basename tests',
      explicitSourceTrigger:'indexMI button273 on(release) calls doPlaySpanishAudio',
      hostLoad:'separate Sound.loadSound(...,false), successful current onLoad starts at zero',
      localeEsAutoplayEvidence:false,actualLaunchOrLoadObserved:false,spokenLanguageVerified:false},
    reuse:{sixExactBilingualEntriesMatchP004Audit:true,
      existingEntryIds:['function','value','relation','rule','input','output'],
      newDefinitionOrConceptAliasRequired:false},
    gaps:['No authoritative old host launch/settings/glossary popup or return trace for P015',
      'No evidence that locale es automatically selects Spanish legacy definition or SA',
      'No original spoken-language, listening, synchronization, keyboard or responsive result'],
    acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,audio:false,
      listening:false,human:false,owner:false,strictComplete:false,published:false}};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const mode=process.argv[2];assert(['--write','--check'].includes(mode)&&process.argv.length===3,
    'usage: node scripts/audit-alg-l06-p015-glossary-v1.mjs --write|--check');
  const bytes=encode(buildP015GlossaryAudit()),target=path.join(ROOT,OUTPUT);
  if(mode==='--write'){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});}
  else assert(fs.readFileSync(target).equals(bytes),'P015 glossary audit reproducibility');
  process.stdout.write(`${JSON.stringify({mode,output:pin(OUTPUT,bytes)})}\n`);
}
