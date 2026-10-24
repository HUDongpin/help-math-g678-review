#!/usr/bin/env node
/** Source-only P004 audit; continuous bytes do not prove original playback alignment. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseSwfSourceFacts} from './build-g4-l3-machine-source-audits.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l06-p004',SWF='G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const SHA='514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e';
const OUT='migrations/shared-alg001-l06-p004/audit';
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
export function auditP004(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const file=path.join(SOURCE_ROOT,SWF);assert.equal(fs.realpathSync(file),file);
 const before=fs.statSync(file,{bigint:true}),bytes=fs.readFileSync(file);
 assert.equal(before.mode&0o222n,0n);assert.equal(bytes.length,1115626);assert.equal(hash(bytes),SHA);
 const catalogFile='catalog/g678-shared-catalog.v1.json',catalogBytes=fs.readFileSync(path.join(ROOT,catalogFile));
 const pages=JSON.parse(catalogBytes).lessons.flatMap(l=>l.pages).filter(p=>p.animationId===ID);
 assert.equal(pages.length,1);const page=pages[0];
 assert.equal(page.viewPath,SWF);assert.equal(page.sourceSha256,SHA);
 assert.equal(page.globalOrdinal,4);assert.equal(page.sectionCode,'RW');assert.equal(page.sectionPageOrdinal,3);
 const facts=parseSwfSourceFacts(bytes),text=collectSwfTextSourceCatalog(bytes),stream=extractTerminalStream(bytes,'sprite-95');
 assert.deepEqual(facts.frameDomains.domains.map(d=>[d.domainId,d.declaredFrameCount]),[['root',10],['sprite-95',831],['sprite-98',1]]);
 assert.equal(facts.header.fps,12);assert.equal(facts.tagCounts.DefineButton2,8);
 assert.equal(stream.blocks.length,796);assert.equal(stream.mp3.length,329030);
 assert.deepEqual(stream.heads,[{domain:'sprite-95',frame:1,hex:'0a2a2d078906'}]);
 assert.deepEqual(stream.actions.filter(a=>a.domain==='sprite-95').map(a=>[a.frame,a.hex]),[[831,'0700']]);
 const sa=page.audioCueCandidates;assert.equal(sa.length,1);
 const saBytes=fs.readFileSync(path.join(SOURCE_ROOT,sa[0].viewPath));assert.equal(hash(saBytes),sa[0].sha256);
 const after=fs.statSync(file,{bigint:true});for(const key of ['dev','ino','size','mtimeNs','ctimeNs'])assert.equal(before[key],after[key]);
 const report={schemaVersion:1,kind:'alg-l06-p004-source-audit-v1',animationId:ID,
  source:{path:SWF,bytes:bytes.length,sha256:SHA},catalog:{path:catalogFile,bytes:catalogBytes.length,sha256:hash(catalogBytes)},
  placement:{globalOrdinal:4,sectionCode:'RW',sectionPageOrdinal:3},header:facts.header,
  frameDomains:facts.frameDomains,buttons:8,
  stream:{heads:stream.heads,blocks:stream.blocks,actions:stream.actions,
   mp3:{bytes:stream.mp3.length,sha256:hash(stream.mp3)},packetGapsAreNotAudibleSilence:true},
  optionalSpanish:{path:sa[0].viewPath,bytes:saBytes.length,sha256:hash(saBytes),
   disposition:'separate-host-control-requires-host-applicability-audit'},
  text:text.textDefinitions.map(d=>({characterId:d.characterId,text:d.runs.map(r=>r.text).join('')})),
  unresolved:['button occurrence and hit regions','host glossary binding','original natural playback and audio alignment','Spanish host applicability'],
  acceptance:{currentJsRegistered:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false}};
 return new Map([['source-audit-v1.json',json(report)],['source-facts-v1.json',json(facts)],
  ['source-text-v1.json',json(text)],['continuous-source-v1.mp3',stream.mp3]]);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(['--prepare','--check'].includes(process.argv[2])&&process.argv.length===3);
 const outputs=auditP004();for(const [name,bytes] of outputs){const target=path.join(ROOT,OUT,name);
  if(process.argv[2]==='--prepare'&&!fs.existsSync(target))fs.writeFileSync(target,bytes,{flag:'wx'});
  assert.deepEqual(fs.readFileSync(target),bytes);}
 console.log(JSON.stringify({status:'source-audit-verified-not-registered',outputs:[...outputs].map(([name,b])=>({name,bytes:b.length,sha256:hash(b)}))}));
}
