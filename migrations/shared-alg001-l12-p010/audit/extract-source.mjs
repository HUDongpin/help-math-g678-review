#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const SCRIPT=fileURLToPath(import.meta.url),AUDIT=path.dirname(SCRIPT),ROOT=path.resolve(AUDIT,'../../..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE=SOURCE_ROOT+'/G6-G8-shared/ALG001/L12/VB/L12VB05.swf';
const SOURCE_SHA='a846950547f7c3ab7b0445dfc2118d534565ffd352b6e9687ba8211e5d4a3fcd';
const JAVA='/Users/peter/Library/Application Support/HELP Math Flash Workbench/temurin-jre-21.0.11+10/Contents/Home/bin/java';
const JAR='/Users/peter/Applications/FFDec.app/Contents/Resources/ffdec.jar';
const PREFIX=['-Djava.net.preferIPv4Stack=true','-Djna.nosys=true','-Djava.util.Arrays.useLegacyMergeSort=true','-Xmx512m','-Djava.awt.headless=true','-jar',JAR];
const COPY=AUDIT+'/source-input.swf',sha=b=>createHash('sha256').update(b).digest('hex');
const rel=p=>p.startsWith(ROOT+path.sep)?path.relative(ROOT,p).split(path.sep).join('/'):p;
const json=v=>JSON.stringify(v,null,2)+'\n';
function physical(p){const absolute=path.resolve(p);let current=path.parse(absolute).root;for(const part of absolute.split(path.sep).filter(Boolean)){current=path.join(current,part);assert(!fs.lstatSync(current).isSymbolicLink(),`Physical path required: ${current}`);}assert.equal(fs.realpathSync(absolute),absolute);return fs.lstatSync(absolute,{bigint:true});}
function read(p){const before=physical(p);assert(before.isFile()&&before.nlink===1n);const data=fs.readFileSync(p),after=physical(p);for(const key of ['dev','ino','size','mode','mtimeNs','ctimeNs','nlink'])assert.equal(before[key],after[key]);assert.equal(after.size,BigInt(data.length));return data;}
function pin(p){const data=read(p);return {path:rel(p),bytes:data.length,sha256:sha(data)};}
function expected(p,pinValue){const value=pin(p);assert.equal(value.bytes,pinValue.bytes);assert.equal(value.sha256,pinValue.sha256);}
function write(p,data){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,data,{flag:'wx'});}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name<b.name?-1:1).flatMap(d=>{const p=path.join(dir,d.name);assert(!d.isSymbolicLink());return d.isDirectory()?files(p):(assert(d.isFile()),[p]);});}
function execute(label,command,args,{probe=false,allowMissing=false}={}){
  const startedAt=new Date().toISOString(),r=spawnSync(command,args,{encoding:null,timeout:60000,maxBuffer:16*1024*1024});
  const stdout=r.stdout??Buffer.alloc(0),stderr=r.stderr??Buffer.alloc(0);
  const stdoutPath=AUDIT+'/source-ffdec-'+label+'.stdout.txt',stderrPath=AUDIT+'/source-ffdec-'+label+'.stderr.txt';write(stdoutPath,stdout);write(stderrPath,stderr);
  const receipt={schemaVersion:1,kind:'p010-public-source-extraction-command-v1',label,startedAt,finishedAt:new Date().toISOString(),command,args,exitCode:r.status,signal:r.signal,error:r.error?{code:r.error.code??null,message:r.error.message}:null,stdout:pin(stdoutPath),stderr:pin(stderrPath)};
  write(AUDIT+'/source-extraction-'+label+'.json',json(receipt));
  if(!allowMissing){assert.equal(r.status,0,stderr.toString());assert.equal(r.error,undefined);}
  if(!probe)assert.equal(stderr.length,0);
  return receipt;
}
function check(){
  const receipt=JSON.parse(read(AUDIT+'/public-extraction-receipt.json'));
  assert.equal(receipt.source.sha256,SOURCE_SHA);assert.equal(receipt.source.bytes,183770);
  for(const p of [receipt.source,receipt.generator,...receipt.toolchainInputs,...receipt.artifacts])expected(p.path.startsWith('/')?p.path:ROOT+'/'+p.path,p);
  const tc=JSON.parse(read(AUDIT+'/source-toolchain.json'));assert.equal(tc.version,'JPEXS Free Flash Decompiler 26.2.1');
  for(const c of receipt.commands){assert.equal(c.exitCode,0);assert.equal(c.error,null);expected(ROOT+'/'+c.stdout.path,c.stdout);expected(ROOT+'/'+c.stderr.path,c.stderr);assert.equal(c.stderr.bytes,0);}
  assert.deepEqual(read(COPY),read(SOURCE));console.log('P010_PUBLIC_SOURCE_EXTRACTION_CHECK_PASS');
}
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'Explicit real AWS source-root opt-in required');physical(SOURCE_ROOT);
assert.equal(sha(read(SOURCE)),SOURCE_SHA);assert.equal(read(SOURCE).length,183770);
assert.deepEqual(process.argv.slice(2),[process.argv[2]]);assert(['--extract','--check'].includes(process.argv[2]));
if(process.argv[2]==='--check')check();
else{
  assert(!fs.existsSync(AUDIT+'/public-extraction-receipt.json'),'Do not overwrite completed extraction; use --check');
  write(COPY,read(SOURCE));
  const javaPin=pin(JAVA),jarPin=pin(JAR),classPath=files(path.dirname(JAR)+'/lib').filter(p=>p.endsWith('.jar')).map(pin);
  const javaProbe=execute('java-version',JAVA,['-version'],{probe:true});
  const help=execute('help',JAVA,[...PREFIX,'-help'],{probe:true});
  const helpExport=execute('help-export',JAVA,[...PREFIX,'-help','-export'],{probe:true});
  const helpXml=execute('help-xml',JAVA,[...PREFIX,'-help','-swf2xml'],{probe:true});
  assert(read(ROOT+'/'+help.stdout.path).toString().includes('JPEXS Free Flash Decompiler v.26.2.1'));
  const swfmill=spawnSync('swfmill',['--version'],{encoding:'utf8',timeout:10000});
  const toolchain={schemaVersion:1,kind:'p010-current-public-source-toolchain-v1',checkedAt:new Date().toISOString(),version:'JPEXS Free Flash Decompiler 26.2.1',source:pin(SOURCE),workingCopy:pin(COPY),java:javaPin,ffdecJar:jarPin,classPath,invocation:{command:JAVA,prefix:PREFIX},probes:[javaProbe,help,helpExport,helpXml],swfmill:{available:swfmill.status===0,exitCode:swfmill.status,errorCode:swfmill.error?.code??null,stdout:swfmill.stdout??'',stderr:swfmill.stderr??'',disposition:'Optional parser unavailable is not invented; FFDec public exports and maintained byte parser supply this source audit'}};
  write(AUDIT+'/source-toolchain.json',json(toolchain));
  const options=['-config','packJavaScripts=false','-onerror','abort','-timeout','45','-exportTimeout','45'];
  const commands=[execute('xml',JAVA,[...PREFIX,'-swf2xml',COPY,AUDIT+'/movie.xml'])];
  for(const [label,format,kind,destination] of [['as','script:as','script','actionscript/as'],['pcode','script:pcodehex','script','actionscript/pcode'],['text','text:plain','text','text']])commands.push(execute(label,JAVA,[...PREFIX,...options,'-format',format,'-export',kind,AUDIT+'/'+destination,COPY]));
  const tags=execute('tags',JAVA,[...PREFIX,'-dumpSWF',COPY]);commands.push(tags);write(AUDIT+'/source-tags.txt',read(ROOT+'/'+tags.stdout.path));
  const artifacts=files(AUDIT).filter(p=>p!==SCRIPT&&p!==AUDIT+'/public-extraction-receipt.json').map(pin);
  const receipt={schemaVersion:1,kind:'p010-public-source-extraction-receipt-v1',animationId:'shared-alg001-l12-p010',checkedAt:new Date().toISOString(),source:pin(SOURCE),generator:pin(SCRIPT),toolchainInputs:[javaPin,jarPin,...classPath],commands,artifacts,claimBoundary:'Public extraction and byte custody only; no AVM1 execution, rendering, registration, source-runtime, audio decoding/listening or acceptance'};
  write(AUDIT+'/public-extraction-receipt.json',json(receipt));check();console.log(JSON.stringify({source:receipt.source,rawArtifacts:artifacts.length,commands:commands.map(c=>({label:c.label,exitCode:c.exitCode}))}));
}
