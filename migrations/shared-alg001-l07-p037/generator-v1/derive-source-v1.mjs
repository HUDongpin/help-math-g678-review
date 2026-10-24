import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const M='migrations/shared-alg001-l07-p037';
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=path=>{const b=fs.readFileSync(path);return{path,bytes:b.length,sha256:sha(b)}};
const custody=JSON.parse(fs.readFileSync(`${M}/audit-v1/source-custody-v1.json`));
for(const p of custody.sourceFiles){assert.equal(fs.realpathSync(p.source),p.source);assert.equal(pin(p.source).sha256,p.sha256);assert.equal(pin(p.source).bytes,p.bytes);assert.deepEqual(fs.readFileSync(p.copy),fs.readFileSync(p.source));}
assert.equal(custody.sourceFiles[0].sha256,'153f74f637e433d4f2c8707bc7f8e7012040c0d02ee279572f990265b3e9447a');
const catalog=JSON.parse(fs.readFileSync(`${M}/source-v1/source-text-catalog-v1.json`));
const timelines=catalog.timelines.map(t=>{const live=new Map(),frames=[];for(let f=1;f<=t.declaredFrameCount;f++){for(const e of t.events.filter(e=>e.frame===f)){if(e.kind==='remove'){assert(live.has(e.depth));live.delete(e.depth);}else if(e.kind==='place'){const p=e.move?{...live.get(e.depth)}:{matrix:[1,0,0,1,0,0],depth:e.depth,placedFrame:f};for(const k of['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId'])if(k in e)p[k]=e[k];assert(p.characterId);live.set(e.depth,p);}}frames.push([...live.values()].map(p=>({...p})));}return{...t,frames};});
assert.deepEqual(timelines.map(t=>[t.timelineId,t.declaredFrameCount]),[['root',10],['sprite-28',1],['sprite-30',1],['sprite-32',1],['sprite-34',1],['sprite-53',1],['sprite-55',20],['sprite-57',20],['sprite-85',474]]);
const inv=JSON.parse(fs.readFileSync(`${M}/audit-v1/source-behavior-inventory-v1.json`));
for(const s of inv.scripts){assert.deepEqual(pin(s.file.path),s.file);assert.equal(fs.readFileSync(s.file.path,'utf8').replace(/\r\n/g,'\n'),s.source);}
assert.equal(inv.scripts.length,12);
const scripts=inv.scripts,source=p=>scripts.find(s=>s.file.path===`${M}/source-v1/ffdec/scripts/${p}`).source;
const main=timelines.find(t=>t.timelineId==='sprite-85');
const named=main.frames[214].filter(p=>p.name).map(p=>({characterId:p.characterId,name:p.name.text,depth:p.depth,matrix:p.matrix,instanceId:p.instanceId}));
assert.deepEqual(named.map(p=>[p.name,p.characterId]),[['Ans_mc0',28],['Ans_mc1',30],['Ans_mc2',32],['Ans_mc3',34],['Done_btn',39],['Popfeed_mc',53],['Coach_audio_1',55],['Audio_FB',57]]);
assert(!main.frames[215].some(p=>named.some(n=>n.instanceId===p.instanceId)));
const inputFields=[28,30,32,34].map((spriteId,i)=>{const p=timelines.find(t=>t.timelineId===`sprite-${spriteId}`).frames[0][0],t=catalog.textDefinitions.find(t=>t.characterId===p.characterId);assert.equal(p.name.text,'Ans1');assert.equal(t.kind,'dynamic-field');for(const k of['readOnly','multiline','wordWrap','hasMaxLength','noSelect','hasText'])assert.equal(t.flags[k],false);return{index:i,spriteId,instanceName:`Ans_mc${i}`,sourceFieldName:p.name.text,scriptFieldName:'ans1',textId:t.characterId,maxLength:t.maxLength,flags:t.flags,expected:['-1','0','1','8'][i]};});
const glossary=[[24,'Table'],[26,'Output']].map(([characterId,term])=>{const s=source(`DefineButton2_${characterId}/BUTTONCONDACTION on(release).as`);assert.equal(s.replace(/\s/g,''),`on(release){_global.KeyAttribute="${term}";_root.DoHyperLinks();_root.animation_mc.animation.stop();}`);return{characterId,term};});
assert.equal(source('DefineSprite_57/frame_20/DoAction.as').replace(/\s/g,''),'_parent.enableButton();_global.quizSection=false;_parent.play();');
assert.equal(source('DefineSprite_85/frame_474/DoAction.as').trim(),'stop();');
assert(!scripts.some(s=>s.source.includes('Coach_audio_1')));assert(!scripts.some(s=>s.source.includes('function enableButton')));
const model={schemaVersion:1,animationId:custody.animationId,source:pin(custody.sourceFiles[0].source),spanishAudio:pin(custody.sourceFiles[1].source),placement:custody.placement,header:catalog.header,stage:{width:800,height:600},fps:12,rootEntryFrame:6,mainSpriteId:85,mainFrameCount:474,quizFrame:215,postQuizFrame:216,terminalStop:474,namedAtQuiz:named,inputFields,glossary,scripts,timelines,texts:catalog.textDefinitions,shapes:catalog.shapeDefinitions,bitmaps:catalog.bitmapDefinitions,risks:catalog.risks,findings:{
 inputType:'Four single-line selectable input text fields, no authored maxlength, restrict or initial text.',
 stringPredicate:'SWF EqualTyped compares TextField.text strings against explicitly assigned string answers. Both operands are strings; accept exact characters, with no numeric conversion, trim, normalization or Unicode-minus substitution.',
 caseBinding:'SWF version6; placed Ans1 is addressed as ans1 by authored AVM1. Bind the same source field by sprite and character identity; no second field is invented.',
 submitOrder:['lock four inputs and disable Done','read original empty status','clear wrong nonempty fields, retaining correct values','wrong before empty before correct'],
 wrong:'Increment attempts on Done; first wrong includes Try again.; later wrong omits it. No source wrong-audio call.',
 empty:'Exact empty string only; show authored empty message without incrementing attempts.',
 correct:'Named Audio_FB is sprite57; gotoAndPlay(2). Frame20 calls undefined local enableButton, clears quizSection, plays main. Frame216 removes quiz objects.',
 popupClose:'Inside sprite53: this._visible=false, restore four inputs/selectability and Done; attempt>=2 clears quizSection and plays main.',
 coach55:'Placed at215 and stopped at1. No authored call starts Coach_audio_1. Preserve stream in source audit; do not play it as wrong feedback.',
 undefinedHostCall:'enableButton has no page-local definition; do not invent an input re-enable or independent host advancement. Correct completion immediately resumes parent and removes inputs at216.',
 sourceHintMismatch:inv.sourceFacts.sourceHintMismatch,
 terminal:'Main474 stops; no natural wrap and no legacy lesson-completion call.',
 modernContract:'Replay resets all input strings, attempts, popup, feedback clock, glossary, audio ownership and terminal state; keyboard focus/labels are modern accessibility behavior.'
},pending:['Native source decode, visual/glyph intervals, modern maintained input state and real My Lesson integration.'],registered:false,originalRuntimeAccepted:false};
fs.mkdirSync(`${M}/native-v1`,{recursive:true});const path=`${M}/native-v1/source-model-v1.json`,b=Buffer.from(JSON.stringify(model,null,2)+'\n');if(fs.existsSync(path)||process.argv.includes('--check'))assert.deepEqual(fs.readFileSync(path),b);else fs.writeFileSync(path,b,{flag:'wx'});
console.log(JSON.stringify({model:pin(path),domains:timelines.length,inputFields,glossary,registered:false}));
