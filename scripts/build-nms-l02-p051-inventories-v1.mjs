import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workspace=path.join(root,'migrations/shared-nms002-l02-p051');
const read=name=>JSON.parse(fs.readFileSync(path.join(workspace,'audit',name),'utf8'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const source=read('source-identity-v1.json');
const expected='9c4c9857bb497497b4301a7b1cfec475b5f7bdf9d2cecabcd779fbd887de5d1f';
function verify(pin){
 const absolute=path.resolve(root,pin.path),stat=fs.lstatSync(absolute);
 assert.ok(stat.isFile()&&!stat.isSymbolicLink(),pin.path);
 const bytes=fs.readFileSync(absolute);
 assert.equal(bytes.length,pin.bytes,pin.path);assert.equal(sha(bytes),pin.sha256,pin.path);
}
assert.equal(source.source.sha256,expected);verify(source.source);verify(source.preservedCopy);
const pcm=read('source-pcm-inventory-v1.json'),routes=read('audio-route-intake-v1.json');
const bitmaps=read('bitmap-visual-intake-v1.json');
for(const audit of [pcm,routes,bitmaps])assert.equal(audit.sourceSha256,expected);
assert.equal(pcm.streams.length,8);assert.equal(bitmaps.rows.length,13);
const audio=[],assets=[];
for(const stream of pcm.streams){
 const route=routes.streams.find(row=>row.domain===stream.domain);assert.ok(route);
 verify(stream.source);verify(stream.pcm);
 audio.push({cue_id:stream.domain,language:'en',source_file:stream.source.path,sha256:stream.source.sha256,
  start_frame:route.selected?(stream.domain==='sprite-257'?24:2):route.firstBlockFrame,
  start_frame_domain_id:stream.domain,
  start_semantics:route.selected?routes.selectedStarts[stream.domain]:'unselected; original-runtime entry unresolved',
  duration_ms:stream.seconds*1000,format:'mp3',channels:stream.channels,sample_rate_hz:stream.sampleRate,
  source_character_id:stream.domain.slice(7),
  notes:'Full decoded duration before candidate latency/scheduling; not listening acceptance.'});
 for(const [kind,pin]of [['audio',stream.source],['pcm',stream.pcm]])assets.push({
  asset_id:`${stream.domain}-${kind}`,swf_character_id:stream.domain.slice(7),library_symbol:stream.domain,
  type:kind,source_file:source.source.path,source_frame:route.firstBlockFrame,exported_file:pin.path,sha256:pin.sha256,
  format:kind==='pcm'?'f32le':'mp3',dimensions_or_bounds:`${stream.sampleRate} Hz; ${stream.channels} channel`,
  transformation:kind==='pcm'?'Full-stream decode; no encoded-byte splitting':'Embedded stream extraction',
  confidence:'source-bound',license_or_provenance:'owner-provided',notes:route.selected?'Selected candidate stream':'Retained evidence; excluded from candidate playback'});
}
for(const bitmap of bitmaps.rows){verify(bitmap.export);assets.push({
 asset_id:`bitmap-${bitmap.characterId}`,swf_character_id:bitmap.characterId,type:'bitmap',source_file:source.source.path,
 exported_file:bitmap.export.path,sha256:bitmap.export.sha256,format:'png',transformation:'Source bitmap export',
 confidence:'source-bound',license_or_provenance:'owner-provided',notes:`${bitmap.visualRole}; audit export, not runtime inclusion; source tag ${bitmap.sourceTagSha256}`});}
for(const name of fs.readdirSync(path.join(root,'packages/demos/src/generated')).filter(x=>x.startsWith('nms-l02-p051-')).sort()){
 const relative=`packages/demos/src/generated/${name}`;
 assets.push({asset_id:name,type:'generated-runtime-data',source_file:source.source.path,exported_file:relative,
 sha256:sha(fs.readFileSync(path.join(root,relative))),format:path.extname(name).slice(1),
 transformation:'Maintained source extraction generator',confidence:'candidate',license_or_provenance:'owner-provided',
 notes:'Behavior and semantics require separate audits; no fidelity acceptance.'});
}
const frames=[];
for(const [domain,scenario,beats]of [
 ['root','source-inspection',[[1,'Before main placement'],[6,'Main placed; root holds'],[10,'Root inspection only']]],
 ['sprite-257','source-inspection',[[1,'Intro begins'],[11,'Answer border alpha zero'],[12,'Answer border fade begins'],[22,'Answer border fully visible'],[24,'First main audio block'],[484,'Last intro frame'],[485,'Exercise holds']]],
 ['sprite-248','wrong-feedback',[[2,'Wrong feedback begins'],[15,'Wait for explicit close']]],
 ['sprite-250','correct-feedback',[[2,'Correct feedback begins'],[20,'Callback boundary; retain audio tail']]],
 ['sprite-256','completion-feedback',[[1,'Five matches solved'],[25,'Completion feedback ends']]],
 ['sprite-257','all-correct-outro',[[486,'Outro begins'],[503,'Terminal stop']]],
])for(const [frame,description]of beats)for(const language of ['en','es'])frames.push({frame,frame_domain_id:domain,
 time_ms:(frame-1)*1000/12,scenario,language,kind:'planned-inspection',expected_state:description,
 trigger:'Deterministic candidate query; natural trace separately required',
 evidence_source:'audit/structural-summary-v1.json; audit/native-behavior-decisions-v1.json',
 notes:'No original-runtime capture, entry-state authority, comparison or human review supplied.'});
const columns={
 'audio-inventory.csv':'cue_id,language,source_file,sha256,start_frame,start_frame_domain_id,start_semantics,duration_ms,format,channels,sample_rate_hz,source_character_id,notes',
 'asset-inventory.csv':'asset_id,swf_character_id,library_symbol,type,source_file,source_frame,exported_file,sha256,format,dimensions_or_bounds,font_glyphs,transformation,confidence,license_or_provenance,notes',
 'keyframes.csv':'frame,requirement_id,frame_domain_id,trace_id,entry_state_sha256,time_ms,scenario,language,kind,expected_state,trigger,baseline_file,baseline_sha256,implementation_file,implementation_sha256,diff_file,diff_sha256,normalized_rmse,timing_result,visual_result,evidence_source,reviewer,notes',
};
const quote=value=>`"${String(value??'').replaceAll('"','""')}"`;
const outputs=Object.entries({'audio-inventory.csv':audio,'asset-inventory.csv':assets,'keyframes.csv':frames}).map(([name,rows])=>{
 const header=columns[name],keys=header.split(',');
 return [path.join(workspace,name),header+'\n'+rows.map(row=>keys.map(k=>quote(row[k])).join(',')).join('\n')+'\n'];
});
// Recheck every source before changing any derived inventory; never write acceptance records.
for(const [file,content]of outputs){if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),content,file);else fs.writeFileSync(file,content);}
console.log(JSON.stringify({status:'PASS',mode:process.argv.includes('--check')?'check':'build',sourceSha256:expected,audioStreams:audio.length,assets:assets.length,plannedKeyframes:frames.length,acceptanceChanged:false}));
