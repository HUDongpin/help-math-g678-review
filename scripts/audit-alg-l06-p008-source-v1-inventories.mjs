#!/usr/bin/env node
/** Source-only P008 inventories from immutable machine extraction; no captures. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='migrations/shared-alg001-l06-p008';
const AUDIT=`${BASE}/audit/source-v1`;
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW07.swf';
const SHA='6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=name=>fs.readFileSync(path.join(ROOT,`${AUDIT}/${name}`));
const parsed=name=>JSON.parse(read(name));
const json=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
const csv=v=>`"${String(v??'').replaceAll('"','""')}"`;
const line=row=>row.map(csv).join(',')+'\n';

function make(){
 const report=parsed('source-audit-v1.json'),facts=parsed('source-facts-v1.json');
 const text=parsed('source-text-v1.json'),composition=parsed('source-composition-v1.json');
 const stream=parsed('source-stream-v1.json'),exports=parsed('ffdec-export-manifest-v1.json');
 assert.equal(report.source.sha256,SHA);assert.equal(text.sourceSha256,SHA);
 assert.equal(composition.main.domainId,'sprite-507');
 const rows=[];
 function add(definition,type,exportGroup,content=''){
  const id=definition.characterId;
  const exported=exportGroup?exports.files.find(e=>e.name.startsWith(`${exportGroup}/${id}.`)):null;
  if(exportGroup)assert(exported,`FFDec ${exportGroup}/${id}`);
  const mask=composition.main.masks.find(m=>m.event.characterId===id);
  const notes=[`${definition.tagName} source tag offset ${definition.sourceTagOffset}`,
   'SHA-256 of canonical source tag code and payload',
   exported?`FFDec export ${exported.name} SHA-256 ${exported.sha256}`:'',
   mask?`source mask at depth ${mask.event.depth} clipDepth ${mask.event.clipDepth} main frames ${mask.instance.firstFrame}..${mask.instance.lastFrameExclusive-1}`:'',
   content?`source text ${JSON.stringify(content)}`:'',
   'source structure only; rendered visibility and original-runtime fidelity pending'].filter(Boolean).join('; ');
  rows.push([`swf-tag-${id}`,id,'',type,SOURCE,'',
   exported?`${AUDIT}/ffdec-export-v1.json.gz#${exported.name}`:'',
   definition.sourceTagSha256,'canonical-swf-tag-code-and-payload','','','',
   'verified-structural','owner-provided SWF',notes]);
 }
 for(const item of text.shapeDefinitions)add(item,'shape','shapes');
 for(const item of text.bitmapDefinitions)add(item,'bitmap','images');
 for(const item of text.textDefinitions)add(item,'static-text','texts',
  item.runs?.map(run=>run.text).join('')??'');
 for(const item of text.fonts.filter(item=>item.tagName==='DefineFont2'))
  add(item,'embedded-font',null,item.name?.text??'');
 const domains=facts.frameDomains.domains.filter(d=>d.kind==='sprite');
 for(const domain of domains)rows.push([`swf-sprite-${domain.spriteId}`,domain.spriteId,'','sprite-timeline',SOURCE,'',
  '',domain.domainFingerprintSha256,'structural-domain-fingerprint',
  `${domain.declaredFrameCount} frames`,'','','verified-structural','owner-provided SWF',
  `Source sprite frame domain ${domain.domainId}; parents ${domain.parentDomainIds.join(',')}; not a source-tag payload hash`]);
 rows.push(['swf-sprite-507-audio','','','embedded-stream-audio',SOURCE,'19',
  `${AUDIT}/source-stream-v1.mp3`,stream.mp3.sha256,'MP3 extracted from SoundStreamBlock',
  '911 blocks','','concatenated MP3 payload','verified-structural','owner-provided SWF',
  'Sprite-507 blocks start frame19; nine absent frames and one negative seek; audio alignment and listening pending']);
 rows.sort((a,b)=>Number(a[1]||507)-Number(b[1]||507)||a[0].localeCompare(b[0]));
 assert.equal(rows.length,512);
 const assetHeader=['asset_id','swf_character_id','library_symbol','type','source_file',
  'source_frame','exported_file','sha256','format','dimensions_or_bounds','font_glyphs',
  'transformation','confidence','license_or_provenance','notes'];
 const assets=Buffer.from(assetHeader.join(',')+'\n'+rows.map(line).join(''));
 const evidence={sourceFacts:{path:`${AUDIT}/source-facts-v1.json`,bytes:read('source-facts-v1.json').length,
  sha256:hash(read('source-facts-v1.json'))},
  sourceText:{path:`${AUDIT}/source-text-v1.json`,bytes:read('source-text-v1.json').length,
   sha256:hash(read('source-text-v1.json'))},
  sourceComposition:{path:`${AUDIT}/source-composition-v1.json`,bytes:read('source-composition-v1.json').length,
   sha256:hash(read('source-composition-v1.json'))}};
 const domainsDisposition={schemaVersion:1,animationId:'shared-alg001-l06-p008',
  status:'source-structural-disposition-only',sourceSwfSha256:SHA,evidence,
  domains:facts.frameDomains.domains.map(domain=>({
   frameDomainId:domain.domainId,sourceFrameCount:domain.declaredFrameCount,
   observedShowFrameCount:domain.observedShowFrameCount,
   rootReachableByStaticPlacements:domain.staticallyRootReachable,
   parentFrameDomainIds:domain.parentDomainIds,
   sourcePlacements:domain.domainId==='root'?[]:
    text.timelines.flatMap(t=>t.instances.filter(i=>i.characterId===domain.spriteId)
     .map(i=>({parentTimelineId:t.timelineId,sourceInstanceId:i.instanceId,
      firstFrame:i.firstFrame,lastFrameExclusive:i.lastFrameExclusive,depth:i.depth}))),
   disposition:'separate-declared-source-frame-domain',
   originalRuntimeEstablished:false,
  })),
  rootMainRelation:{rootEntryFrame:6,mainDomainId:'sprite-507',
   sourceTransformTwips:composition.main.rootPlacement.matrix,
   rootStopsAtFrame:6,mainSourceStopFrame:938},
  limits:['Static placement reachability is not natural playback proof.',
   'Audio block gaps and negative seek require separate timing work.',
   'Original runtime, human visual review and acceptance are not established.']};
 const disposition=json(domainsDisposition);
 const keyHeader=['frame','requirement_id','frame_domain_id','trace_id','entry_state_sha256',
  'time_ms','scenario','language','kind','expected_state','trigger','baseline_file',
  'baseline_sha256','implementation_file','implementation_sha256','diff_file','diff_sha256',
  'normalized_rmse','timing_result','visual_result','evidence_source','reviewer','notes'];
 const beats=[
  ['root',1,'root calls InternalPreloader.jump_check and stops','source-frame-action','source-audit-v1.json'],
  ['root',6,'begin label; main sprite507 and separate title placed; root stops','source-frame-action','source-composition-v1.json'],
  ['root',10,'declared root bound; natural reachability unverified','source-declared-bound','source-facts-v1.json'],
  ['sprite-20',1,'first declared nested sprite frame','source-declared-bound','source-facts-v1.json'],
  ['sprite-20',22,'last declared nested sprite frame','source-declared-bound','source-facts-v1.json'],
  ['sprite-194',1,'first declared nested sprite frame','source-declared-bound','source-facts-v1.json'],
  ['sprite-194',22,'last declared nested sprite frame','source-declared-bound','source-facts-v1.json'],
  ['sprite-507',1,'main begins; shape1 mask depth1 clips through depth498','source-mask-boundary','source-composition-v1.json'],
  ['sprite-507',18,'first sprite20 instance final visible frame','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',19,'first embedded MP3 block; first sprite20 instance gone','source-audio-boundary','source-stream-v1.json'],
  ['sprite-507',449,'sprite20 returns at depth73','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',463,'sprite20 second instance final visible frame','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',464,'sprite20 second instance removed','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',568,'source MP3 block has negative seek','source-audio-boundary','source-stream-v1.json'],
  ['sprite-507',569,'nine-frame MP3 block gap begins','source-audio-boundary','source-stream-v1.json'],
  ['sprite-507',577,'nine-frame MP3 block gap ends','source-audio-boundary','source-stream-v1.json'],
  ['sprite-507',578,'MP3 blocks resume','source-audio-boundary','source-stream-v1.json'],
  ['sprite-507',636,'sprite194 enters at depth318','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',645,'sprite194 final visible frame','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',646,'sprite194 removed','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',791,'shape428 mask depth388 clips through depth403','source-mask-boundary','source-composition-v1.json'],
  ['sprite-507',853,'shape428 mask final visible frame','source-mask-boundary','source-composition-v1.json'],
  ['sprite-507',854,'shape428 mask removed','source-mask-boundary','source-composition-v1.json'],
  ['sprite-507',936,'sprite20 returns at depth73','source-nested-boundary','source-composition-v1.json'],
  ['sprite-507',938,'main source stop; last MP3 block and last declared frame','source-terminal-boundary','source-stream-v1.json'],
  ['sprite-510',1,'single-frame title sprite contains shape509','source-declared-bound','source-composition-v1.json'],
 ];
 for(const [domain,frame] of beats)assert(frame>=1&&frame<=facts.frameDomains.domains.find(d=>d.domainId===domain).declaredFrameCount);
 const keyframes=Buffer.from(keyHeader.join(',')+'\n'+beats.map(([domain,frame,state,kind,file])=>
  line([frame,'',domain,'','',((frame-1)*1000/12).toFixed(6),'source','undetermined',
   kind,state,'source timeline','','','','','','','','pending','pending',
   `${AUDIT}/${file}`,'','Structural beat only; no requirement trace, original runtime or capture claim'])).join(''));
 const versionResult=spawnSync('swfmill',['--version'],{encoding:'utf8'});
 assert.equal(versionResult.status,0);
 const combined=`${versionResult.stdout??''}\n${versionResult.stderr??''}`;
 const swfmillVersion=combined.match(/swfmill\s+\d+\.\d+\.\d+/)?.[0];
 assert.equal(swfmillVersion,'swfmill 0.3.6');
 const toolVersions=json({schemaVersion:1,kind:'alg-l06-p008-public-tool-versions-v1',
  sourceSwfSha256:SHA,swfmill:{command:['swfmill','--version'],
   version:swfmillVersion,channel:versionResult.stderr.includes(swfmillVersion)?'stderr':'stdout'},
  ffdec:{version:report.tools.ffdec,source:'ffdec -help first line'},
  sourceAudit:{path:`${AUDIT}/source-audit-v1.json`,bytes:read('source-audit-v1.json').length,
   sha256:hash(read('source-audit-v1.json'))}});
 return new Map([[`${BASE}/asset-inventory.csv`,assets],[`${BASE}/keyframes.csv`,keyframes],
  [`${BASE}/audit/frame-domain-disposition.json`,disposition],
  [`${AUDIT}/tool-versions-v1.json`,toolVersions]]);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===3&&['--prepare','--check'].includes(process.argv[2]));
 const outputs=make();
 for(const [name,bytes] of outputs){const absolute=path.join(ROOT,name);
  if(process.argv[2]==='--prepare')fs.mkdirSync(path.dirname(absolute),{recursive:true});
  if(process.argv[2]==='--prepare')fs.writeFileSync(absolute,bytes);
  assert.deepEqual(fs.readFileSync(absolute),bytes,`source-only inventory ${name}`);
 }
 console.log(JSON.stringify({status:'P008_SOURCE_ONLY_INVENTORIES_VERIFIED',
  outputs:[...outputs].map(([name,bytes])=>({path:name,bytes:bytes.length,sha256:hash(bytes)}))}));
}
