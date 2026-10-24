import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=path.join(root,'migrations/shared-nms002-l02-p052');
const read=n=>JSON.parse(fs.readFileSync(path.join(workspace,'audit',n)));
const sha=b=>createHash('sha256').update(b).digest('hex');
function verify(p){const f=path.resolve(root,p.path);assert.ok(fs.lstatSync(f).isFile());const b=fs.readFileSync(f);assert.equal(b.length,p.bytes);assert.equal(sha(b),p.sha256);}
const identity=read('source-identity-v1.json'),audio=read('source-audio-streams-v1.json'),pcm=read('source-pcm-inventory-v1.json'),catalog=read('source-text-catalog-v1.json'),exported=read('ffdec-export-v1.json'),visual=read('source-visual-audit-v1.json');
verify(identity.source);verify(identity.preservedCopy);
for(const j of [audio,pcm,catalog,visual])assert.equal(j.sourceSha256,identity.source.sha256);
const audioRows=[],assets=[],frames=[];
const starts={
 'sprite-8':'Button down-state click: help153; Reset307; Done310; help-close337. Legacy unplaced button9 shares symbol. Runtime pointer/key policy pending.',
 'sprite-318':'Wrong-close button319 down state; source click stream.',
 'sprite-327':'Right-close button328 down state; source click stream.',
 'sprite-347':'Correct answer starts Coach_audio_2 at local frame2; callback at20; decoded tail scheduling pending.',
 'sprite-349':'Wrong answer starts random S1=3 S2=18 S3=31 S4=40; jumps to1 at16/27/36/54. Decode whole stream before scheduling.',
 'sprite-350':'Main first block15; exercise stop115; right-close resumes116; terminal host adaptation pending.'
};
for(const s of pcm.streams){
 verify(s.source);verify(s.pcm);const a=audio.streams.find(a=>a.domain===s.domain);assert.ok(a);
 audioRows.push({cue_id:s.domain,language:'undetermined',source_file:s.source.path,sha256:s.source.sha256,start_frame:a.blocks[0].frame,start_frame_domain_id:s.domain,start_semantics:starts[s.domain],duration_ms:s.seconds*1000,format:'mp3',channels:s.channels,sample_rate_hz:s.sampleRate,source_character_id:s.domain.slice(7),notes:'Whole decoded duration before latency trim. No listening or synchronization acceptance. EN/ES host routing unresolved.'});
 for(const [kind,p]of [['audio',s.source],['pcm',s.pcm]])assets.push({asset_id:`${s.domain}-${kind}`,swf_character_id:s.domain.slice(7),library_symbol:s.domain,type:kind,source_file:identity.source.path,source_frame:a.blocks[0].frame,exported_file:p.path,sha256:p.sha256,format:kind==='pcm'?'f32le':'mp3',dimensions_or_bounds:`${s.sampleRate} Hz mono`,transformation:kind==='pcm'?'Whole source stream decode; untrimmed':'Concatenate original MP3 payloads after four-byte SWF header removal',confidence:'verified',license_or_provenance:'owner-provided',notes:starts[s.domain]});
}
const shapes=exported.files.filter(f=>f.path.includes('/as/shapes/')&&f.path.endsWith('.svg'));
assert.equal(shapes.length,catalog.shapeDefinitions.length);
for(const p of shapes){verify(p);const id=Number(path.basename(p.path,'.svg')),s=catalog.shapeDefinitions.find(s=>s.characterId===id);assert.ok(s);assets.push({asset_id:`shape-${id}`,swf_character_id:id,type:'vector',source_file:identity.source.path,exported_file:p.path,sha256:p.sha256,format:'svg',dimensions_or_bounds:JSON.stringify(s.boundsTwips??s.bounds??{}),transformation:'FFDec source SVG export',confidence:'verified',license_or_provenance:'owner-provided',notes:`Raw structural asset; not all symbols selected for runtime. Source tag ${s.sourceTagSha256}`});}
assets.push({asset_id:'preserved-swf',type:'source-evidence',source_file:identity.source.path,exported_file:identity.preservedCopy.path,sha256:identity.source.sha256,format:'swf',dimensions_or_bounds:'800x600; root10; 12fps',transformation:'Byte-identical read-only copy',confidence:'verified',license_or_provenance:'owner-provided',notes:'Evidence only; not a product renderer'});
const beats=[['root','source-inspection',[[1,'Preloader stop'],[6,'Root begin; main placement'],[10,'Root end inspection only']]],['sprite-350','source-intro',[[1,'Empty main display list'],[2,'Prompt fade begins at alpha0'],[7,'Prompt visible; controls enter'],[15,'First main audio block'],[23,'Authored shape171 enters'],...visual.digitChanges.filter(r=>r.text).map(r=>[r.frame,`Authored digit value ${r.text}`]),[99,'Shape293 replaces shape160 at depth1'],[114,'Last intro frame']]],['sprite-350','practice',[[115,'Create100cells; ready at zero; hide feedback/help']]],['sprite-350','outro',[[116,'Remove controls and dialogs; retain solved state'],[156,'Final source frame; no local stop action']]],['sprite-322','wrong-feedback',[[1,'Stopped hidden initial state'],[2,'First-wrong feedback starts'],[15,'Wait for explicit close']]],['sprite-331','right-feedback',[[1,'Stopped initial state'],[2,'Correct or revealed-answer feedback'],[35,'Return to frame1 action']]],['sprite-347','correct-audio',[[2,'First source audio block'],[20,'Return to1; audio tail boundary pending']]],['sprite-349','wrong-audio',[[3,'S1'],[16,'S1 return'],[18,'S2'],[27,'S2 return'],[31,'S3'],[36,'S3 return'],[40,'S4'],[54,'S4 return']]]];
for(const [domain,scenario,rows]of beats)for(const [frame,state]of rows)for(const language of ['en','es'])frames.push({frame,frame_domain_id:domain,time_ms:(frame-1)*1000/12,scenario,language,kind:'planned-source-inspection',expected_state:state,trigger:'Authored frame or explicit interaction; deterministic traces pending',evidence_source:'audit/source-visual-audit-v1.json; audit/SOURCE_SPEC_V1.md',notes:'Planned keyframe only; no capture, original-runtime authority, metrics or human review.'});
const headers={
 'audio-inventory.csv':'cue_id,language,source_file,sha256,start_frame,start_frame_domain_id,start_semantics,duration_ms,format,channels,sample_rate_hz,source_character_id,notes',
 'asset-inventory.csv':'asset_id,swf_character_id,library_symbol,type,source_file,source_frame,exported_file,sha256,format,dimensions_or_bounds,font_glyphs,transformation,confidence,license_or_provenance,notes',
 'keyframes.csv':'frame,requirement_id,frame_domain_id,trace_id,entry_state_sha256,time_ms,scenario,language,kind,expected_state,trigger,baseline_file,baseline_sha256,implementation_file,implementation_sha256,diff_file,diff_sha256,normalized_rmse,timing_result,visual_result,evidence_source,reviewer,notes'
};
const q=x=>`"${String(x??'').replaceAll('"','""')}"`;
const outputs=Object.entries({'audio-inventory.csv':audioRows,'asset-inventory.csv':assets,'keyframes.csv':frames}).map(([name,rows])=>({name,data:headers[name]+'\n'+rows.map(r=>headers[name].split(',').map(k=>q(r[k])).join(',')).join('\n')+'\n'}));
// Only populate pristine scaffold headers; never overwrite later authored inventories.
for(const o of outputs){const old=fs.readFileSync(path.join(workspace,o.name),'utf8');assert.ok(old===o.data||(!process.argv.includes('--check')&&old===headers[o.name]+'\n'),`Unexpected inventory content: ${o.name}`);}
for(const o of outputs){const f=path.join(workspace,o.name);if(fs.readFileSync(f,'utf8')!==o.data)fs.writeFileSync(f,o.data);}
console.log(JSON.stringify({status:'PASS',audio:audioRows.length,assets:assets.length,plannedKeyframes:frames.length,acceptanceChanged:false}));
