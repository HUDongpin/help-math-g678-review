#!/usr/bin/env node
/** P014 source-locked semantic text companion. Structural evidence, not runtime acceptance. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF='G6-G8-shared/ALG001/L6/VB/L6VB05.swf';
const SWF_SHA='aed0f7755d4f691cefcc28c815acc6b9d083fdfaae88ff385f22d3b32ba07603';
const BASE='migrations/shared-alg001-l06-p014/audit';
const GENERATED='packages/demos/src/generated/alg-l06-p014-text-state-v1.ts';
const OUTPUT=`${BASE}/text-state-v1`;
const INPUTS=[
  [`${BASE}/source-v1/source-audit-v1.json`,'008dd6f28d312f41c48ab389efce2e58452aef83c98312fa981c5aa88d69eb13'],
  [`${BASE}/source-v1/source-composition-v1.json`,'a7615710e2bcf05a97f5fc2714d69be07935b5cf61d1bf6c0554126a715d8013'],
  [`${BASE}/source-v1/source-text-v1.json`,'cdc0d97c661e1bf749fb9465ceee7de73f36541cebffcc574feb4c539cad39a9'],
  [`${BASE}/source-v1/public-tool-scripts-v1.json`,'ca982898eaa94a1744a63c6aa1df1c2adb909446d8f50dc3e884d7e1cf37a8a5'],
  [`${BASE}/source-v1/swfmill-v1.xml.gz`,'644522709cb6d1efcba4c55c5116360b9a81bb761f0ad112bee32d96fb35a61b'],
];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));
const pin=relative=>({path:relative,bytes:read(relative).length,sha256:hash(read(relative))});
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const one=(items,predicate,label)=>{const found=items.filter(predicate);assert.equal(found.length,1,label);return found[0];};
const rect=(bounds,matrix,root=[1,0,0,1,0,0])=>({
  left:bounds.left*matrix[0]+matrix[4]+root[4],right:bounds.right*matrix[0]+matrix[4]+root[4],
  top:bounds.top*matrix[3]+matrix[5]+root[5],bottom:bounds.bottom*matrix[3]+matrix[5]+root[5]});
const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
function shapeBounds(xml,id){
  const match=xml.match(new RegExp('<DefineShape(?:2|3|4)? objectID="'+id+'">\\s*<bounds>\\s*'
    +'<Rectangle left="(-?\\d+)" right="(-?\\d+)" top="(-?\\d+)" bottom="(-?\\d+)"'));
  assert(match,`shape ${id} bounds`);
  return {left:+match[1],right:+match[2],top:+match[3],bottom:+match[4]};
}
function sourceState(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
  const swfPath=path.join(SOURCE_ROOT,SWF),stat=fs.lstatSync(swfPath);
  assert(stat.isFile()&&!stat.isSymbolicLink(),'ordinary source SWF required');
  const swf=fs.readFileSync(swfPath);
  assert.equal(swf.length,566603);assert.equal(hash(swf),SWF_SHA);
  for(const [relative,sha] of INPUTS)assert.equal(pin(relative).sha256,sha,`pin ${relative}`);
  const [audit,composition,sourceText,scripts]=INPUTS.slice(0,4).map(([relative])=>JSON.parse(read(relative)));
  const xml=gunzipSync(read(INPUTS[4][0])).toString('utf8');
  assert.equal(audit.kind,'alg-l06-p014-source-audit-v1');
  assert.equal(audit.source.sha256,SWF_SHA);
  assert.equal(sourceText.sourceSha256,SWF_SHA);
  assert.equal(scripts.sourceSwfSha256,SWF_SHA);
  assert.equal(sourceText.summary.unresolvedRuns,0);
  assert.equal(sourceText.summary.dynamicFields,3);
  assert.equal(composition.main.domainId,'sprite-227');
  assert.equal(composition.main.declaredFrames,449);
  assert.equal(composition.main.rootEntryFrame,6);
  const rootMatrix=composition.main.rootPlacement.matrix;
  assert.deepEqual(rootMatrix,[1,0,0,1,8248,5666]);
  const main=one(sourceText.timelines,t=>t.timelineId==='sprite-227','main text timeline');
  const eventMap=new Map(main.events.map(e=>[e.eventId,e]));
  const event=id=>{const found=eventMap.get(id);assert(found,`event ${id}`);return found;};
  const definition=id=>one(sourceText.textDefinitions,d=>d.characterId===id,`text ${id}`);
  const text=id=>definition(id).runs.map(run=>run.text).join('');
  const instance=(id,depth)=>one(main.instances,i=>i.characterId===id&&
    (depth===undefined||i.depth===depth),`instance ${id}/${depth}`);
  const script=p=>one(scripts.files,f=>f.path===p,`script ${p}`).text;
  const wrongAction=script('scripts/DefineButton2_214/BUTTONCONDACTION on(release).as');
  const wrongStrings=[...wrongAction.matchAll(/_global\.WrongFeed = "([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(wrongStrings,[
    'Substitute 25 for the variable C, which is the input for the formula to find the output, F.',
    'Substitute 25 for the variable C, which is the input for the formula to find the output, F. Try again.']);
  assert.match(script('scripts/DefineButton2_213/BUTTONCONDACTION on(release).as'),/showRightFeed\(\)/);
  assert.match(script('scripts/DefineSprite_227/frame_120/DoAction.as'),/quizSection = true/);
  for(const id of [24,168,183]){
    const d=definition(id);
    assert.equal(d.kind,'dynamic-field');assert.equal(d.initialText,null);
    assert.equal(d.variableName.text,'');assert.equal(d.runtimeValueResolved,false);
  }
  for(const id of [25,169,184])
    assert.match(script(`scripts/DefineSprite_${id}/frame_1/DoAction.as`),/txtFeed\.text = _global\.WrongFeed/);
  const expectedTexts=new Map([[30,'If the input for the formula shown is 25 degrees Celsius, what will the output be?'],
    [35,'A'],[36,'57°F'],[38,'B'],[39,'70°F'],[41,'C'],[42,'72°F'],
    [44,'D'],[45,'77°F'],[47,'F =     x C+ 32'],[48,'95'],[208,'Input'],
    [209,'Output'],[210,'?'],[215,'25'],[216,'25°C '],[217,'25'],
    [218,'95'],[219,'45'],[221,'32'],[222,'45'],[224,'= 77°F']]);
  for(const [id,value] of expectedTexts)assert.equal(text(id),value,`source glyph ${id}`);
  assert.equal(text(226),'770F','authored output glyph decoding; normalized from result 224');
  const fraction=definition(48).runs;
  assert.deepEqual(fraction.map(r=>r.text),['9','5']);
  assert(fraction[1].yOffsetTwips>fraction[0].yOffsetTwips,'authored stacked fraction');
  const alphaTiming=(id,depth)=>{
    const i=instance(id,depth),events=i.updates.map(event);
    const alpha=e=>e.colorTransform?.multiply?.[3]??256;
    assert.equal(alpha(events[0]),0,`initial alpha ${id}`);
    const first=events.find(e=>alpha(e)>0),full=events.find(e=>alpha(e)===256);
    assert(first&&full);
    return {placedFrame:i.firstFrame,firstVisibleFrame:first.frame,fullAlphaFrame:full.frame,
      alphaUpdates:events.filter(e=>e.colorTransform).map(e=>({frame:e.frame,alpha:alpha(e)}))};
  };
  const promptTiming=alphaTiming(30,2),formulaTiming=alphaTiming(47,7),resultTiming=alphaTiming(224,13);
  assert.deepEqual([promptTiming.placedFrame,promptTiming.fullAlphaFrame,
    formulaTiming.placedFrame,formulaTiming.fullAlphaFrame,
    resultTiming.placedFrame,resultTiming.fullAlphaFrame],[2,7,8,11,422,425]);
  assert.deepEqual([alphaTiming(48,8).fullAlphaFrame,
    ...[35,36,38,39,41,42,44,45].map(id=>alphaTiming(id).fullAlphaFrame)],
  Array(9).fill(7).map((v,i)=>i===0?11:v));
  const stage={left:0,right:16000,top:0,bottom:12000};
  const boundsAt=(id,depth,frame)=>{
    const i=instance(id,depth),events=i.updates.map(event).filter(e=>e.frame<=frame);
    const m=events.filter(e=>e.matrix).at(-1)?.matrix;
    assert(m,`matrix ${id}`);
    return rect(definition(id).boundsTwips,m,rootMatrix);
  };
  const boundsInitial=(id,depth)=>boundsAt(id,depth,instance(id,depth).firstFrame);
  const optionSpecs=[['A',35,36,214,135,'AnsBtn1','wrong'],
    ['B',38,39,214,137,'AnsBtn4','wrong'],
    ['C',41,42,214,139,'AnsBtn3','wrong'],
    ['D',44,45,213,133,'AnsBtn2','right']];
  const hitBounds=shapeBounds(xml,212),glossaryBounds=shapeBounds(xml,31);
  assert.deepEqual(hitBounds,{left:-1518,right:1517,top:-205,bottom:204});
  assert.deepEqual(glossaryBounds,{left:-1031,right:1032,top:-311,bottom:310});
  const options=optionSpecs.map(([letter,labelId,valueId,buttonId,depth,instanceName,role])=>{
    const button=one(sourceText.buttonDefinitions,b=>b.characterId===buttonId,`button ${buttonId}`);
    assert.equal(button.statePlacements.length,1);
    assert.deepEqual(button.statePlacements[0].states,{up:false,over:false,down:false,hitTest:true});
    assert.equal(button.statePlacements[0].characterId,212);
    const sourceInstance=instance(buttonId,depth),placement=event(sourceInstance.createdByEventId);
    assert.equal(sourceInstance.firstFrame,120);assert.equal(sourceInstance.lastFrameExclusive,121);
    assert.equal(placement.name.text,instanceName);
    const hit=rect(hitBounds,placement.matrix,rootMatrix),label=boundsAt(labelId,undefined,120),
      value=boundsAt(valueId,undefined,120);
    assert(intersects(hit,label)&&intersects(hit,value),`hit covers option ${letter}`);
    assert([hit,label,value].every(r=>r.left>=stage.left&&r.right<=stage.right&&
      r.top>=stage.top&&r.bottom<=stage.bottom),`option ${letter} onstage`);
    const scriptText=script(`scripts/DefineButton2_${buttonId}/BUTTONCONDACTION on(release).as`);
    assert.match(scriptText,role==='right'?/showRightFeed\(\)/:/showWrongFeed\(\)/);
    return {letter,label:text(labelId),value:text(valueId),labelId,valueId,
      sourceInstance:instanceName,buttonId,buttonDepth:depth,role,
      sourceActionSha256:button.actions.sha256,hitStageBoundsTwips:hit,
      labelStageBoundsTwips:label,valueStageBoundsTwips:value,
      placedFrame:2,fullAlphaFrame:7,interactiveFrame:120};
  });
  for(let a=0;a<options.length;a++)for(let b=a+1;b<options.length;b++)
    assert(!intersects(options[a].hitStageBoundsTwips,options[b].hitStageBoundsTwips),
      `answer hit boxes ${a}/${b} disjoint`);
  const glossary=[['Input',32,3],['Output',33,5]].map(([key,buttonId,depth])=>{
    const b=one(sourceText.buttonDefinitions,v=>v.characterId===buttonId,`glossary ${key}`),
      i=instance(buttonId,depth),placement=event(i.createdByEventId),
      action=script(`scripts/DefineButton2_${buttonId}/BUTTONCONDACTION on(release).as`);
    assert.equal(i.firstFrame,2);assert.equal(i.lastFrameExclusive,450);
    assert.deepEqual([alphaTiming(buttonId,depth).firstVisibleFrame,
      alphaTiming(buttonId,depth).fullAlphaFrame],[3,7]);
    assert.equal(b.statePlacements.length,1);assert.equal(b.statePlacements[0].characterId,31);
    assert.deepEqual(b.statePlacements[0].states,{up:false,over:false,down:false,hitTest:true});
    assert.match(action,new RegExp(`KeyAttribute = "${key}"`));
    assert.match(action,/DoHyperLinks\(\)/);
    const hit=rect(glossaryBounds,placement.matrix,rootMatrix);
    assert(hit.left>=stage.left&&hit.right<=stage.right&&hit.top>=stage.top&&hit.bottom<=stage.bottom);
    return {key,buttonId,depth,sourceActionSha256:b.actions.sha256,
      placedFrame:2,firstVisibleFrame:3,fullAlphaFrame:7,
      hitStageBoundsTwips:hit,visualState:'hit-test-only'};
  });
  const diagramMask=instance(207,54),diagramMaskEvents=diagramMask.updates.map(event);
  assert.equal(diagramMask.firstFrame,108);
  assert.equal(diagramMaskEvents[0].clipDepth,59);
  assert.equal(diagramMaskEvents.at(-1).frame,114);
  const diagramMaskBounds=shapeBounds(xml,207);
  assert.deepEqual(diagramMaskBounds,{left:-1163,right:47,top:-355,bottom:421});
  const finalDiagramMask=rect(diagramMaskBounds,diagramMaskEvents.at(-1).matrix,rootMatrix);
  const diagram=[208,209,210].map(id=>{
    const i=instance(id),placement=event(i.createdByEventId);
    assert.equal(i.firstFrame,108);assert.equal(placement.colorTransform?.multiply?.[3]??256,256);
    const finalBounds=boundsAt(id,undefined,114);
    assert(intersects(finalBounds,finalDiagramMask));
    const clippedBottomTwips=Math.max(0,finalBounds.bottom-finalDiagramMask.bottom);
    assert(id===209?clippedBottomTwips>9&&clippedBottomTwips<11:clippedBottomTwips===0);
    return {characterId:id,text:text(id),placedFrame:108,semanticCompanionFrame:114,
      initialStageBoundsTwips:boundsInitial(id),finalStageBoundsTwips:finalBounds,
      finalMaskStageBoundsTwips:finalDiagramMask,clippedBottomTwips};
  });
  const exactMainInstance=(id,depth,first,last)=>{
    const i=instance(id,depth);
    assert.deepEqual([i.firstFrame,i.lastFrameExclusive],[first,last],`text span ${id}`);
    return i;
  };
  exactMainInstance(216,133,188,450);
  exactMainInstance(217,10,254,304);
  exactMainInstance(217,12,304,311);
  const intermediate=exactMainInstance(219,12,311,450);
  const intermediatePlacement=event(intermediate.createdByEventId);
  assert.equal(intermediatePlacement.move,true);
  assert.equal(intermediatePlacement.matrix,undefined);
  assert.equal(text(216),'25°C ');
  assert.equal(text(217),'25');
  assert.equal(text(219),'45');
  exactMainInstance(221,135,362,386);
  exactMainInstance(222,136,362,370);
  exactMainInstance(222,137,370,386);
  const outputValue=exactMainInstance(226,135,422,450);
  const outputCover=exactMainInstance(225,134,422,450);
  const coverPlacement=event(outputCover.createdByEventId);
  const outputCoverBounds=rect(shapeBounds(xml,225),coverPlacement.matrix,rootMatrix);
  const questionBounds=boundsAt(210,58,422);
  assert(intersects(outputCoverBounds,questionBounds),'result overlays old question region');
  const outputValueBounds=boundsAt(226,135,422);
  assert(intersects(outputValueBounds,questionBounds),'result text replaces question area');
  assert.equal(outputValue.firstFrame,resultTiming.placedFrame);
  const formulaStages=[
    {key:'general',fromFrame:formulaTiming.fullAlphaFrame,
      text:'F = (9/5) × C + 32',sourceTextIds:[47,48]},
    {key:'substitution',fromFrame:254,
      text:'F = (9/5) × 25 + 32',sourceTextIds:[48,217,50,51,52,55,56]},
    {key:'intermediate',fromFrame:311,
      text:'F = 45 + 32',sourceTextIds:[219,50,51,52,55,56]},
  ];
  const feedback=[{domain:28,kind:'wrong',title:'incorrect!',textId:6,fieldId:24,
      titleTextIds:[6,7,10],titleFirstVisibleFrame:2,titleSemanticFrame:6,
      dynamicSemanticFrame:20},
    {domain:173,kind:'wrong',title:'OH! NO',textId:165,fieldId:168,
      titleTextIds:[165,166],titleFirstVisibleFrame:9,titleSemanticFrame:9,
      dynamicSemanticFrame:22},
    {domain:187,kind:'wrong',title:'Try Again!',textId:180,fieldId:183,
      titleTextIds:[180],titleFirstVisibleFrame:7,titleSemanticFrame:7,
      dynamicSemanticFrame:23},
    {domain:83,kind:'right',title:'YOU GOT IT!',textId:72,
      titleTextIds:[72,73],titleFirstVisibleFrame:6,titleSemanticFrame:6},
    {domain:115,kind:'right',title:'Excellent!',textId:112,
      titleTextIds:[112,113],titleFirstVisibleFrame:9,titleSemanticFrame:9},
    {domain:148,kind:'right',title:'Awesome!',textId:142,
      titleTextIds:[142,143,144],titleFirstVisibleFrame:12,titleSemanticFrame:12},
    {domain:156,kind:'right',title:'Excellent!',textId:113,
      titleTextIds:[112,113],titleFirstVisibleFrame:5,titleSemanticFrame:5}].map(spec=>{
      assert.equal(text(spec.textId),spec.title);
      const domain=one(sourceText.timelines,t=>t.timelineId===`sprite-${spec.domain}`,
        `feedback domain ${spec.domain}`);
      const titleInstances=domain.instances.filter(i=>spec.titleTextIds.includes(i.characterId));
      assert.deepEqual([...new Set(titleInstances.map(i=>i.characterId))].sort((a,b)=>a-b),
        [...spec.titleTextIds].sort((a,b)=>a-b));
      assert(titleInstances.every(i=>text(i.characterId)===spec.title));
      const titleEvents=new Map(domain.events.map(e=>[e.eventId,e]));
      const titleAlpha=titleInstances.flatMap(i=>i.updates.map(id=>titleEvents.get(id)))
        .map(e=>({frame:e.frame,alpha:e.colorTransform?.multiply?.[3]??256}));
      const firstVisible=Math.min(...titleAlpha.filter(e=>e.alpha>0).map(e=>e.frame));
      const firstFull=Math.min(...titleAlpha.filter(e=>e.alpha===256).map(e=>e.frame));
      assert.equal(firstVisible,spec.titleFirstVisibleFrame);
      assert.equal(firstFull,spec.titleSemanticFrame);
      assert(!domain.events.some(e=>e.clipDepth&&titleInstances.some(i=>
        e.depth<i.depth&&i.depth<=e.clipDepth)),`feedback title ${spec.domain} unmasked`);
      if(spec.fieldId){
        const popupId=spec.domain===28?25:spec.domain===173?169:184;
        const popup=one(domain.instances,i=>i.characterId===popupId,`field popup ${popupId}`);
        const popupEvents=popup.updates.map(id=>titleEvents.get(id));
        assert.equal(popupEvents[0].colorTransform.multiply[3],0);
        assert.equal(popupEvents.at(-1).colorTransform.multiply[3],256);
        assert.equal(popupEvents.at(-1).frame,spec.dynamicSemanticFrame);
        const nested=one(sourceText.timelines,t=>t.timelineId===`sprite-${popupId}`,
          `field timeline ${popupId}`);
        assert(nested.instances.some(i=>i.characterId===spec.fieldId&&i.firstFrame===1),
          `dynamic field ${spec.fieldId} at popup frame 1`);
      }
      return {...spec,frameCount:domain.declaredFrameCount};
    });
  assert.equal(text(16),'Close');
  const acknowledgments=[{domain:28,popup:25,buttonId:21,placedFrame:13,holdFrame:20,nextFrame:21},
    {domain:173,popup:169,buttonId:167,placedFrame:16,holdFrame:22,nextFrame:23},
    {domain:187,popup:184,buttonId:182,placedFrame:16,holdFrame:23,nextFrame:24}]
    .map(spec=>{
      const domain=one(sourceText.timelines,t=>t.timelineId===`sprite-${spec.domain}`,
        `ack domain ${spec.domain}`);
      const popup=one(domain.instances,i=>i.characterId===spec.popup,`popup ${spec.popup}`);
      const popupEvents=new Map(domain.events.map(e=>[e.eventId,e]));
      const placement=popupEvents.get(popup.createdByEventId);
      assert.equal(placement?.name?.text,'Mc_Feed_Popup');
      assert.equal(popup.firstFrame,spec.placedFrame);
      const alphaUpdates=popup.updates.map(id=>popupEvents.get(id)).map(e=>({
        frame:e.frame,alpha:e.colorTransform?.multiply?.[3]??256}));
      assert.equal(alphaUpdates[0].alpha,0);
      assert.equal(alphaUpdates.at(-1).alpha,256);
      assert.equal(alphaUpdates.at(-1).frame,spec.holdFrame);
      const nested=one(sourceText.timelines,t=>t.timelineId===`sprite-${spec.popup}`,
        `nested popup ${spec.popup}`);
      assert(nested.instances.some(i=>i.characterId===spec.buttonId));
      const button=one(sourceText.buttonDefinitions,b=>b.characterId===spec.buttonId,
        `ack button ${spec.buttonId}`);
      const label=one(button.statePlacements,p=>p.characterId===16,`ack label ${spec.buttonId}`);
      assert(label.states.up&&label.states.over&&label.states.down);
      const labelRect=rect(definition(16).boundsTwips,label.matrix);
      const hitShapes=button.statePlacements.filter(p=>p.states.hitTest).map(p=>({
        characterId:p.characterId,boundsTwips:rect(shapeBounds(xml,p.characterId),p.matrix)}));
      assert.deepEqual(hitShapes.map(s=>s.characterId),[11,20]);
      assert(hitShapes.some(shape=>intersects(shape.boundsTwips,labelRect)));
      const action=script(`scripts/DefineButton2_${spec.buttonId}/BUTTONCONDACTION on(release).as`);
      assert.match(action,new RegExp(`gotoAndPlay\\(${spec.nextFrame}\\)`));
      assert.match(script(`scripts/DefineSprite_${spec.domain}/frame_${spec.holdFrame}/DoAction.as`),
        /stop\(\)/);
      return {...spec,firstVisibleFrame:alphaUpdates.find(e=>e.alpha>0).frame,
        fullAlphaFrame:alphaUpdates.at(-1).frame,alphaUpdates,label:'Close',labelTextId:16,
        labelBoundsTwips:labelRect,hitShapes,actionSha256:button.actions.sha256};
    });
  assert.equal(text(224),'= 77°F');
  return {schemaVersion:1,animationId:'shared-alg001-l06-p014',sourceSwfSha256:SWF_SHA,
    frameDomain:'sprite-227',frameCount:449,frameRate:12,rootFrame:6,rootMatrix,
    prompt:{text:text(30),sourceTextId:30,timing:promptTiming},
    formula:{text:formulaStages[0].text,sourceTextIds:formulaStages[0].sourceTextIds,
      timing:formulaTiming,stages:formulaStages,
      fractionSourceRuns:fraction.map(r=>({text:r.text,yOffsetTwips:r.yOffsetTwips}))},
    options,glossary,diagram,
    diagramValues:{input:{text:text(216).trim(),sourceTextId:216,fromFrame:188},
      output:{text:text(224).replace(/^=\s*/,''),sourceTextIds:[224,226],fromFrame:425,
        placementFrame:outputValue.firstFrame,outputCoverBounds,outputValueBounds}},
    result:{text:text(224),sourceTextId:224,timing:resultTiming},
    feedback:{domains:feedback,wrongStrings,dynamicFieldIds:[24,168,183],acknowledgments},
    policy:{canvasGlyphs:'preserved',nativeRole:'semantic-companion',
      language:'source-en-only',promptAndChoices:'full-alpha-frame-7',
      glossary:'exact-Input-Output-at-full-prompt',
      diagram:'semantic-companion-after-final-transform-114; Output-static-bounds-still-clipped-10-twips',
      equation:'substitution-254-retained-as-semantic-step-through-fraction-fade-300-302-and-multiply-removal-304; 45-stage-311; result-full-425',
      output:'old-question-glyph-persists-structurally-but-covered-by-higher-depth-result-artwork-422; semantic-resolution-at-full-result-425',
      quiz:'hold-frame-120-plus-state-gate',
      feedback:'state-branch-only; source-Close-at-full-alpha-feedback-hold',originalRuntimeAccepted:false,
      xmlScope:'shape-bounds-through-End-only; sprite-83-tail-unresolved'}};
}

const TYPES=String.raw`
export type P014GlossaryKey='Input'|'Output';
export type P014Option='A'|'B'|'C'|'D';
type Rect={left:number;right:number;top:number;bottom:number};
type Timing={placedFrame:number;firstVisibleFrame:number;fullAlphaFrame:number;
 alphaUpdates:Array<{frame:number;alpha:number}>};
type Option={letter:P014Option;label:string;value:string;labelId:number;valueId:number;
 sourceInstance:string;buttonId:number;buttonDepth:number;role:'right'|'wrong';
 sourceActionSha256:string;hitStageBoundsTwips:Rect;labelStageBoundsTwips:Rect;
 valueStageBoundsTwips:Rect;placedFrame:number;fullAlphaFrame:number;interactiveFrame:number};
type Glossary={key:P014GlossaryKey;buttonId:number;depth:number;sourceActionSha256:string;
 placedFrame:number;firstVisibleFrame:number;fullAlphaFrame:number;
 hitStageBoundsTwips:Rect;visualState:string};
type FeedbackDomain={domain:number;kind:'right'|'wrong';title:string;textId:number;
 fieldId?:number;titleTextIds:number[];titleFirstVisibleFrame:number;
 titleSemanticFrame:number;dynamicSemanticFrame?:number;frameCount:number};
type Acknowledgment={domain:number;popup:number;buttonId:number;placedFrame:number;
 holdFrame:number;nextFrame:number;firstVisibleFrame:number;fullAlphaFrame:number;
 alphaUpdates:Array<{frame:number;alpha:number}>;label:string;labelTextId:number;
 labelBoundsTwips:Rect;hitShapes:Array<{characterId:number;boundsTwips:Rect}>;
 actionSha256:string};
type FormulaStage={key:'general'|'substitution'|'intermediate';fromFrame:number;
 text:string;sourceTextIds:number[]};
type Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 frameDomain:string;frameCount:number;frameRate:number;rootFrame:number;rootMatrix:number[];
 prompt:{text:string;sourceTextId:number;timing:Timing};
 formula:{text:string;sourceTextIds:number[];timing:Timing;stages:FormulaStage[];
 fractionSourceRuns:Array<{text:string;yOffsetTwips:number}>};
 options:Option[];glossary:Glossary[];
 diagram:Array<{characterId:number;text:string;placedFrame:number;
 semanticCompanionFrame:number;initialStageBoundsTwips:Rect;
 finalStageBoundsTwips:Rect;finalMaskStageBoundsTwips:Rect;clippedBottomTwips:number}>;
 diagramValues:{input:{text:string;sourceTextId:number;fromFrame:number};
 output:{text:string;sourceTextIds:number[];fromFrame:number;placementFrame:number;
 outputCoverBounds:Rect;outputValueBounds:Rect}};
 result:{text:string;sourceTextId:number;timing:Timing};
 feedback:{domains:FeedbackDomain[];wrongStrings:string[];dynamicFieldIds:number[];
 acknowledgments:Acknowledgment[]};
 policy:{canvasGlyphs:string;nativeRole:string;language:string;promptAndChoices:string;
 glossary:string;diagram:string;equation:string;output:string;quiz:string;feedback:string;
 originalRuntimeAccepted:boolean;xmlScope:string}};
`;
const RUNTIME=String.raw`
export function p014TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P014_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P014_TEXT_FRAME_OUT_OF_RANGE');
 const source=P014_TEXT_STATE_SOURCE;
 const formulaStage=source.formula.stages.filter(stage=>frame>=stage.fromFrame).at(-1);
 return {animationId:source.animationId,sourceSwfSha256:source.sourceSwfSha256,
  frameDomain:source.frameDomain,frame,
  prompt:{text:source.prompt.text,sourceTextId:source.prompt.sourceTextId,
   visible:frame>=source.prompt.timing.fullAlphaFrame},
  formula:{text:formulaStage?.text??source.formula.text,
   sourceTextIds:formulaStage?.sourceTextIds??source.formula.sourceTextIds,
   stage:formulaStage?.key??null,
   visible:frame>=source.formula.timing.fullAlphaFrame},
  options:source.options.map(option=>({...option,
   visible:frame>=option.fullAlphaFrame&&frame<128,
   sourceInteractive:frame===option.interactiveFrame})),
  glossary:source.glossary.map(control=>({...control,
   available:frame>=control.fullAlphaFrame})),
  diagram:source.diagram.map(item=>({...item,
   visible:frame>=item.semanticCompanionFrame&&
    (item.characterId!==210||frame<source.diagramValues.output.fromFrame)})),
  diagramValues:{input:{...source.diagramValues.input,
   visible:frame>=source.diagramValues.input.fromFrame},
   output:{...source.diagramValues.output,
    visible:frame>=source.diagramValues.output.fromFrame}},
  result:{text:source.result.text,sourceTextId:source.result.sourceTextId,
   visible:frame>=source.result.timing.fullAlphaFrame},
  feedback:source.feedback,languagePolicy:'source-en-only' as const,
  canvasGlyphs:'preserved' as const};
}
`;
function outputs(){
  const source=sourceState();
  const generated=Buffer.from('/* Generated by scripts/build-alg-l06-p014-text-state-v1.mjs. Do not edit. */\n'
    +TYPES+'\nexport const P014_TEXT_STATE_SOURCE:Source=JSON.parse('
    +JSON.stringify(JSON.stringify(source))+');\n'+RUNTIME);
  const audit={schemaVersion:1,kind:'alg-l06-p014-text-state-audit-v1',
    animationId:source.animationId,sourceSwf:{path:path.join(SOURCE_ROOT,SWF),
      bytes:566603,sha256:SWF_SHA},inputs:INPUTS.map(([name])=>pin(name)),
    output:{path:GENERATED,bytes:generated.length,sha256:hash(generated)},
    semanticTiming:{promptFull:7,formulaFull:11,answerButtonsAtHold:120,
      diagramCompanionAfterFinalTransform:114,inputValue:188,substitution:254,
      intermediate:311,outputPlacement:422,resultFull:425,glossaryFirstEnabled:7},
    feedbackAcknowledgments:source.feedback.acknowledgments.map(({domain,popup,buttonId,
      placedFrame,firstVisibleFrame,fullAlphaFrame,holdFrame,nextFrame,label,
      labelTextId,hitShapes,actionSha256})=>({domain,popup,buttonId,placedFrame,
      firstVisibleFrame,fullAlphaFrame,holdFrame,nextFrame,label,labelTextId,
      hitShapes,actionSha256})),
    feedbackTextReveal:source.feedback.domains.map(({domain,kind,title,titleTextIds,
      titleFirstVisibleFrame,titleSemanticFrame,fieldId,dynamicSemanticFrame,frameCount})=>({
      domain,kind,title,titleTextIds,titleFirstVisibleFrame,titleSemanticFrame,frameCount,
      ...(fieldId?{fieldId,dynamicSemanticFrame}:{} )})),
    answerGeometry:source.options.map(o=>({option:o.letter,value:o.value,
      sourceInstance:o.sourceInstance,buttonId:o.buttonId,role:o.role,
      hitStageBoundsTwips:o.hitStageBoundsTwips,
      labelStageBoundsTwips:o.labelStageBoundsTwips,
      valueStageBoundsTwips:o.valueStageBoundsTwips})),
    limits:['Source structural timing only; no original runtime comparison or acceptance.',
      'Canvas retains source glyphs and geometry; native text is a semantic reading companion.',
      'Prompt, choices, and glossary wait for full source alpha. Quiz buttons require hold frame 120 and state gate.',
      'Dynamic feedback has no initial source text. Only exact source action strings may populate it after a branch.',
      'Native feedback titles and WrongFeed wait for full source alpha in their local feedback sprite; unknown local frame hides both.',
      'Source teaching text is English only; Spanish interface uses marked English fallback.',
      'Diagram companion waits through the final mask/scale transform at 114; Output static bounds still clip about 10 twips at the bottom.',
      'Equation companion retains the substituted 25 across the source fraction fade at 300-302 and multiply removal at 304, then advances to authored 45 at 311.',
      'Old question glyph 210 persists structurally after result artwork at 422; companion retires it at conservative full-result frame 425.',
      'swfmill shape bounds are scoped through End; sprite-83 has an unresolved 386-byte nonzero tail.']};
  return new Map([[GENERATED,generated],
    [`${OUTPUT}/source-ir-v1.json`,json(source)],
    [`${OUTPUT}/text-state-audit-v1.json`,json(audit)]]);
}
export {outputs as p014TextStateOutputs};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert(process.argv.length===3&&['--write','--check','--update'].includes(process.argv[2]),
    'Usage: --write | --check | --update');
  for(const [relative,content] of outputs()){
    const target=path.join(ROOT,relative);
    if(process.argv[2]==='--write'&&!fs.existsSync(target)){
      fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content,{flag:'wx'});
    }
    if(process.argv[2]==='--update'){
      fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);
    }
    assert.deepEqual(fs.readFileSync(target),content,`immutable P014 text state ${relative}`);
  }
  console.log('P014_SOURCE_TEXT_STATE_VERIFIED_NOT_ADMITTED');
}
