#!/usr/bin/env node
/** Read-only check of the P058 source-static intake. It never rewrites extracted evidence. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin} from '../lib/g678-admission-proof.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const RECEIPT={path:'output/nms-l02-p058-source-20260927/source-audit.json',bytes:22193,
 sha256:'de06df9ad2434071d8470d14694e2c79543ae5515fdd43df30f1f4809639047a'};
const same=(a,b,label)=>assert.deepStrictEqual(a,b,label);
export function checkP058SourceIntake({root=ROOT}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact physical source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical source root');
 const audit=readJsonPin(root,RECEIPT);
 assert.equal(audit.kind,'nms-l02-p058-source-static-audit-v1');
 assert.equal(audit.animationId,'shared-nms002-l02-p058');
 assert.equal(audit.status,'source-only-no-registration');
 assert.equal(audit.sourceRoot,SOURCE_ROOT);
 for(const pin of [audit.source,audit.sourceXml,audit.audio.separateLessonSa.pin])
  same(pinFile(SOURCE_ROOT,pin.path),pin,`external source ${pin.path}`);
 const xml=readPin(SOURCE_ROOT,audit.sourceXml).toString();
 assert.equal([...xml.matchAll(/<Page\b[^>]*>TS\/L2TS05\.swf<\/Page>/gu)].length,1,'exact XML placement');
 assert.equal(audit.placement.globalPageOrdinal,58);
 assert.equal(audit.placement.sectionPageOrdinal,4);
 assert.equal(audit.sourceStructure.teachingFrameCount,274);
 assert.equal(audit.sourceStructure.rootSprite.characterId,37);
 assert.equal(audit.sourceStructure.sourceChildTerminalStopPresent,false);
 assert.equal(audit.buttonActions.length,7);
 assert.equal(new Set(audit.buttonActions.map(row=>row.sourceKeyAttribute)).size,6);
 assert.equal(audit.buttonActions.filter(row=>row.sourceKeyAttribute==='Show').length,2);
 assert.deepStrictEqual(audit.buttonActions.filter(row=>row.sourceKeyAttribute==='Show')
  .map(row=>[row.characterId,row.firstPlacedFrame,row.lastFrameExclusive]),[[33,237,275],[36,242,243]]);
 assert.equal(audit.audio.embeddedStream.blockCount,265);
 assert.equal(audit.audio.embeddedStream.firstBlockFrame,10);
 assert.equal(audit.audio.embeddedStream.lastBlockFrame,274);
 assert.equal(audit.audio.embeddedStream.decodedSamples,486144);
 assert.equal(audit.audio.sourceAlignmentAccepted,false);
 assert.equal(audit.audio.listeningAccepted,false);
 const extraction=audit.extraction.files;
 assert.equal(extraction.length,27,'complete finite extraction');
 assert.equal(new Set(extraction.map(pin=>pin.path)).size,27,'unique extraction');
 for(const pin of extraction){
  assert(pin.path.startsWith('output/nms-l02-p058-source-20260927/extraction/'),'bounded output');
  readPin(root,pin);
 }
 const actual=[];const walk=dir=>{for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,ent.name);if(ent.isDirectory())walk(full);else if(ent.isFile())actual.push(path.relative(root,full));
  else throw Error(`unexpected extraction node: ${full}`);
 }};
 walk(path.join(root,'output/nms-l02-p058-source-20260927/extraction'));
 same(actual.sort(),extraction.map(pin=>pin.path).sort(),'no unpinned extraction file');
 for(const bank of Object.values(audit.glossary.identifiedHostL1Banks)){
  assert.equal(fs.realpathSync(bank.root),bank.root,'physical bank root');
  same(pinFile(bank.root,bank.pin.path),bank.pin,'conditional L1 bank pin');
  assert(Object.values(bank.matchingKeys).every(value=>value.openings===1&&value.completePairs===1),
   'exact six-key bank uniqueness');
 }
 for(const pin of Object.values(audit.glossary.identifiedHostSource)){
  const parent=path.dirname(pin.path);
  same(pinFile(parent,path.basename(pin.path)),{...pin,path:path.basename(pin.path)},'identified host evidence');
 }
 assert(Object.values(audit.acceptanceEffects).every(value=>value===false),'no acceptance effect');
 return {status:'P058_SOURCE_AUDIT_CHECKED_ONLY',receipt:RECEIPT,source:audit.source,
  extractionFiles:extraction.length,registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{assert.deepStrictEqual(process.argv.slice(2),['--check'],'use --check');
  console.log(JSON.stringify(checkP058SourceIntake()));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
