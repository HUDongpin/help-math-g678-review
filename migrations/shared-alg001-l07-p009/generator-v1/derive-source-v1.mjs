import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {collectSwfTextSourceCatalog} from '../../../scripts/lib/swf-text-source-catalog.mjs';
const B='migrations/shared-alg001-l07-p009',OLD='migrations/shared-alg001-l07-p006/audit-v1/l7-p007-p009-compatibility-v1';
const read=p=>fs.readFileSync(p),sha=b=>crypto.createHash('sha256').update(b).digest('hex'),pin=p=>({path:p,bytes:read(p).length,sha256:sha(read(p))});
const audit=JSON.parse(read(OLD+'/compatibility-v1.json')).pages[1],source=audit.identity;
assert.equal(fs.realpathSync(source.path),source.path);assert.equal(sha(read(source.path)),source.sha256);assert.equal(sha(read(source.readOnlyCopy)),source.sha256);
for(const row of [...audit.sourceScripts,...audit.sourceTexts])assert.deepEqual(pin(row.file.path),row.file);
for(const row of audit.sourceEvidence)assert.deepEqual(pin(row.path),row);
const put=(p,b)=>{if(process.argv.includes('--check')||fs.existsSync(p))assert.deepEqual(read(p),Buffer.from(b));else fs.writeFileSync(p,b,{flag:'wx'});};
put(B+'/source-v1/L7VB04.swf',read(source.path));put(B+'/source-v1/index.xml',read('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L7/index.xml'));
const sa=audit.externalLessonSaCandidate[0];assert.deepEqual(pin(sa.path),{path:sa.path,bytes:sa.bytes,sha256:sa.sha256});put(B+'/source-v1/sa.mp3',read(sa.path));
const catalog=collectSwfTextSourceCatalog(read(source.path));
const timelines=catalog.timelines.map(t=>{const live=new Map(),frames=[];for(let frame=1;frame<=t.declaredFrameCount;frame++){
 for(const e of t.events.filter(e=>e.frame===frame)){if(e.kind==='remove')live.delete(e.depth);else if(e.kind==='place'){
 const p=e.move?{...live.get(e.depth)}:{matrix:[1,0,0,1,0,0],depth:e.depth,placedFrame:frame};
 for(const key of ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId'])if(key in e)p[key]=e[key];assert(p.characterId);live.set(e.depth,p);}}
 frames.push([...live.values()].map(p=>({...p})));}return {...t,frames};});
const main=timelines.find(t=>t.timelineId==='sprite-80');assert.equal(main.declaredFrameCount,604);assert.deepEqual(main.events.filter(e=>e.kind==='action-bytes').map(e=>e.frame),[1,600]);
assert.deepEqual(timelines.map(t=>[t.timelineId,t.declaredFrameCount]).sort(),[['root',10],['sprite-79',19],['sprite-80',604]]);
const range=(id,domain='sprite-80')=>{const out=[];for(const [i,poses]of timelines.find(t=>t.timelineId===domain).frames.entries())if(poses.some(p=>p.characterId===id)){if(out.at(-1)?.[1]===i)out.at(-1)[1]=i+1;else out.push([i+1,i+1]);}return out;};
const script=suffix=>audit.sourceScripts.find(x=>x.file.path.endsWith(suffix)).source;
const entry=script('DefineButton2_7_need/BUTTONCONDACTION on(release).as');for(const token of ['Entry_Btn.enabled = false;','Hint._visible = true;','Yinput * Xinput + Number(AddCon) == NaN','New_fn.enabled = true;'])assert(entry.includes(token));
const model={schemaVersion:1,animationId:source.animationId,source:pin(source.path),priorAudit:pin(OLD+'/compatibility-v1.json'),xml:pin(B+'/source-v1/index.xml'),spanishAudio:pin(sa.path),stage:{width:800,height:600},fps:12,rootFrameCount:10,rootEntryFrame:6,mainSpriteId:80,mainFrameCount:604,formFrame:600,hintSpriteId:79,
 behavior:{...audit.behavior,hintReachability:'Visible at sprite79 frame1 only: missing-input handler changes visibility but does not gotoAndPlay; no authored cue starts hint narration. All19frames remain queryable; natural form path does not start hint stream.',initialButtons:'No source script disables New_fn at first entry; both buttons initially enabled. New_fn becomes disabled after reset; Entry_Btn becomes disabled after submit until reset or hint close.',editAfterSubmit:'Inputs remain editable after submit, but Enter remains disabled until reset or hint close; output is retained while editing.',inputRestriction:'digits / . space minus only; source has no maxLength',numericPolicy:'Exact slash parsing parseFloat(first)/parseFloat(second); no-slash values retain Number coercion. Literal ==NaN never filters NaN. Modern result string reflects source JS-number semantics; original AVM1 edge conformance pending.',replay:'Full modern state/audio reset to main frame1, independent original-host acceptance',end:'No automatic next/completion; reachable interactive path holds600; forensic604 wrap remains queryable'},
 glossary:audit.glossary.map(g=>({...g,characterId:Number(g.script.path.match(/DefineButton2_(\d+)/)[1]),frameRanges:range(Number(g.script.path.match(/DefineButton2_(\d+)/)[1]))})),
 texts:catalog.textDefinitions.map(t=>({...t,text:t.runs?.map(r=>r.text).join('')??t.initialText??'',mainFrameRanges:range(t.characterId)})),timelines,
 reusedEvidence:[...audit.sourceEvidence,...audit.sourceScripts.map(s=>s.file)],streams:audit.streams,sourceScripts:audit.sourceScripts,originalRuntimeAccepted:false,registryModified:false};
put(B+'/native-v1/source-model-v1.json',JSON.stringify(model,null,2)+'\n');put(B+'/source-v1/source-text-catalog-v1.json',JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({pass:true,timelines:timelines.map(t=>({id:t.timelineId,frames:t.declaredFrameCount})),glossary:model.glossary.map(g=>({term:g.term,ranges:g.frameRanges})),texts:model.texts.map(t=>({id:t.characterId,text:t.text,ranges:t.mainFrameRanges})),root:timelines.find(t=>t.timelineId==='root').events.filter(e=>e.kind==='place'),risks:catalog.risks},null,2));
