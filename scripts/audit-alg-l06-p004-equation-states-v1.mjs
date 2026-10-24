/** Source-bound equation-state audit. Run with tsx; captures only the local safe Canvas export. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {P004_TEXT_OCCURRENCES} from '../packages/demos/src/alg-l06-p004-text-occurrences-v2.generated.ts';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT='output/alg-l06-p004-equation-states-v1';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const CATALOG='migrations/shared-alg001-l06-p004/audit/source-text-v1.json';
const OCCURRENCES='packages/demos/src/alg-l06-p004-text-occurrences-v2.generated.ts';
const CANVAS='output/alg-l06-p004-canvas-candidate-v1/canvas-renderer.js';
const EXPECTED=Object.freeze({
 [SOURCE]:'514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e',
 [CATALOG]:'c6f15d46da49019e359a44f407cb0577f7cfb6a7a0c1b68ab06d43084aa3adc6',
 [OCCURRENCES]:'93502eece3aa977c8394d75c7def87db643bab0537938788c57518f08b6dc9c4',
 [CANVAS]:'6b6f124262c8b90517151ea77eee43a30843c170211d4cd76404e584c876c2d8',
});
const FRAMES=Object.freeze([1,76,77,83,84,91,92,93,287,288,298,306,307,315,
 359,360,364,366,367,373,374,388,396,409,455,456,461,462,463,
 744,745,753,767,768,773,781,800,808,816,829,830,831]);
const SHA=bytes=>createHash('sha256').update(bytes).digest('hex');
const file=name=>path.isAbsolute(name)?name:path.join(ROOT,name);
function pin(name){const data=fs.readFileSync(file(name));const result={path:name,bytes:data.length,sha256:SHA(data)};
 assert.equal(result.sha256,EXPECTED[name]??result.sha256,`source pin drift: ${name}`);return result;}
function exact(name,data){const target=file(name);fs.mkdirSync(path.dirname(target),{recursive:true});
 if(fs.existsSync(target))assert.deepEqual(fs.readFileSync(target),data,`preserve ${name}`);
 else fs.writeFileSync(target,data,{flag:'wx'});return pin(name);}
function writeJson(name,value){return exact(name,Buffer.from(JSON.stringify(value,null,2)+'\n'));}
function compose(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],
 a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],
 a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
function transform(m,x,y){return [(m[0]*x+m[2]*y+m[4])/20,(m[1]*x+m[3]*y+m[5])/20];}
function bbox(m,b){const points=[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]]
 .map(([x,y])=>transform(m,x,y));return {left:Math.min(...points.map(p=>p[0])),
 right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),
 bottom:Math.max(...points.map(p=>p[1]))};}
function sourceInputs(){const pins=[SOURCE,CATALOG,OCCURRENCES,CANVAS].map(pin);
 const catalog=JSON.parse(fs.readFileSync(file(CATALOG),'utf8'));
 assert.equal(catalog.sourceSha256,pins[0].sha256);
 assert.deepEqual(collectSwfTextSourceCatalog(fs.readFileSync(SOURCE)),catalog,
  'current catalog must match independent source decode');
 assert.deepEqual(catalog.timelines.map(t=>[t.timelineId,t.declaredFrameCount]),
  [['root',10],['sprite-95',831],['sprite-98',1]]);
 const root=catalog.timelines[0],main=catalog.timelines[1];
 const spritePlace=root.events.find(e=>e.frame===6&&e.characterId===95);
 assert.deepEqual(spritePlace.matrix,[1,0,0,1,7390,5060]);
 const texts=new Map(catalog.textDefinitions.map(d=>[d.characterId,d]));
 const original=[...root.instances,...main.instances].filter(i=>texts.has(i.characterId));
 assert.equal(P004_TEXT_OCCURRENCES.length,original.length);
 const sourceById=new Map(original.map(i=>[i.instanceId,i]));
 for(const row of P004_TEXT_OCCURRENCES){const instance=sourceById.get(row.instanceId);
  assert(instance&&instance.characterId===row.characterId);
  const events=(row.timelineId==='root'?root:main).events;
  assert.deepEqual(row.placementEvents.map(e=>[e.eventId,e.sourceTagSha256]),
   instance.updates.map(id=>{const event=events.find(e=>e.eventId===id);return [id,event?.sourceTagSha256];}));
  assert.equal(row.text,texts.get(row.characterId).runs.map(r=>r.text).join(''));
 }
 return {pins,catalog,main,spritePlace,texts};}
function cohort(row){if(row.timelineId!=='sprite-95')return null;
 const f=row.firstFrame,last=row.lastFrameExclusive,d=row.depth,id=row.characterId;
 if(f===1&&last===84&&[31,32,33,34,35,36,37,39].includes(id))return 'intro-glyphs';
 if(f===93&&last===832&&[52,39].includes(id))return 'stable-rule';
 if(f===288&&last===307&&[52,39].includes(id))return 'moving-rule-copy';
 if(f>=307&&last<=463&&d>=82&&d<=91)return 'worked-example';
 if(f>=388&&last<=427&&d>=113&&d<=117)return 'worked-emphasis-copies';
 if(f>=745&&last<=830&&d>=113&&d<=117)return 'outro-emphasis-copies';
 return null;}
function appearance(row,frame,rootMatrix){const events=row.placementEvents.filter(e=>e.frame<=frame);
 assert(events.length>0,`no placement ${row.instanceId}@${frame}`);
 let matrix,alpha=256,alphaEvent=null,matrixEvent=null;
 for(const e of events){if(e.matrix){matrix=e.matrix;matrixEvent=e;}
  if(e.colorTransform){alpha=e.colorTransform.multiply[3]+e.colorTransform.add[3];alphaEvent=e;}}
 assert(matrix,`no matrix ${row.instanceId}`);
 const parent=row.timelineId==='sprite-95'?rootMatrix:[1,0,0,1,0,0];
 const bounds=bbox(compose(parent,compose(matrix,row.textMatrix)),row.boundsTwips);
 return {id:row.instanceId,characterId:row.characterId,text:row.text,
  cohort:cohort(row),bounds,centerY:(bounds.top+bounds.bottom)/2,
  alpha,alphaSourceTagSha256:alphaEvent?.sourceTagSha256??null,
  matrixSourceTagSha256:matrixEvent.sourceTagSha256,
  matrix,sourceTextIds:row.sourceTextIds};}
function frameState(frame,rootMatrix){const rows=P004_TEXT_OCCURRENCES.filter(r=>r.firstFrame<=frame&&frame<r.lastFrameExclusive&&cohort(r))
 .map(r=>appearance(r,frame,rootMatrix));
 const groups=Object.entries(Object.groupBy(rows,row=>row.cohort)).map(([id,members])=>({
  id,instanceIds:members.map(m=>m.id),alphaPositiveIds:members.filter(m=>m.alpha>0).map(m=>m.id),
  bounds:{left:Math.min(...members.map(m=>m.bounds.left)),right:Math.max(...members.map(m=>m.bounds.right)),
   top:Math.min(...members.map(m=>m.bounds.top)),bottom:Math.max(...members.map(m=>m.bounds.bottom))}}));
 // Cluster actual transformed text geometry, including co-located clones, by
 // vertical band. This does not infer a reading equation from glyph strings.
 const bands=[];for(const row of [...rows].filter(r=>r.alpha>0).sort((a,b)=>a.centerY-b.centerY||a.bounds.left-b.bounds.left)){
  const band=bands.find(b=>Math.abs(b.centerY-row.centerY)<=18);
  if(band){band.instanceIds.push(row.id);band.cohorts.push(row.cohort);band.centerY=(band.centerY*(band.instanceIds.length-1)+row.centerY)/band.instanceIds.length;}
  else bands.push({centerY:row.centerY,instanceIds:[row.id],cohorts:[row.cohort]});
 }
 return {frame,groups,spatialBands:bands.map(b=>({centerY:b.centerY,
  instanceIds:b.instanceIds,cohorts:[...new Set(b.cohorts)]})),instances:rows};}
function analyze(){const input=sourceInputs(),rootMatrix=input.spritePlace.matrix;
 const cohorts=Object.groupBy(P004_TEXT_OCCURRENCES.filter(r=>cohort(r)),cohort);
 const ids=Object.keys(cohorts).sort();assert.deepEqual(ids,['intro-glyphs','moving-rule-copy',
  'outro-emphasis-copies','stable-rule','worked-emphasis-copies','worked-example']);
 const shapeAnchors=[49,50].map(id=>{const definition=input.catalog.shapeDefinitions.find(d=>d.characterId===id);
  const instances=input.main.instances.filter(i=>i.characterId===id);
  assert(definition&&instances.length===1);
  const event=input.main.events.find(e=>e.eventId===instances[0].createdByEventId);
  return {characterId:id,sourceTagSha256:definition.sourceTagSha256,
   instanceId:instances[0].instanceId,firstFrame:instances[0].firstFrame,
   lastFrame:instances[0].lastFrameExclusive,placementTagSha256:event.sourceTagSha256,
   placementMatrix:event.matrix};});
 assert.deepEqual(shapeAnchors.map(x=>[x.firstFrame,x.lastFrame]),[[84,92],[92,93]]);
 const members=ids.map(id=>({id,instances:cohorts[id].map(row=>({id:row.instanceId,
  characterId:row.characterId,sourceTextIds:row.sourceTextIds,text:row.text,
  firstFrame:row.firstFrame,lastFrame:row.lastFrameExclusive,
  placementTagSha256:row.placementEvents[0].sourceTagSha256}))}));
 const keyframes=FRAMES.map(frame=>frameState(frame,rootMatrix));
 const frameSignatures=[];
 for(let frame=1;frame<=831;frame++){
  const state=frameState(frame,rootMatrix),signature=JSON.stringify(state.groups.map(g=>[g.id,g.instanceIds,g.alphaPositiveIds]));
  const last=frameSignatures.at(-1);if(last?.signature===signature)last.lastFrame=frame;
  else frameSignatures.push({firstFrame:frame,lastFrame:frame,signature});
 }
 const segments=frameSignatures.map(s=>({firstFrame:s.firstFrame,lastFrame:s.lastFrame,
  groups:JSON.parse(s.signature)}));
 const result={schemaVersion:1,kind:'alg-l06-p004-equation-source-states-v1',
  claimBoundary:'Source placement/transforms/direct alpha plus safe generated Canvas only; no AVM1/original-runtime visibility, audio, fidelity or acceptance claim.',
  sourcePins:input.pins,frameDomain:'sprite-95',rootEntryFrame:6,rootPlacementMatrix:rootMatrix,
  geometryMethod:'source DefineText bounds through current text, placement and root matrices; displayed pixels, masks and occlusion are separately inspected',
  alphaMethod:'latest direct PlaceObject color-transform alpha multiplier/addition carried forward; zero is withheld; masks and clipping are not inferred',
  shapeAnchors,members,segments,keyframes,
  sourceBoundaries:{introGlyphs:[1,83],outlinedShape49:[84,91],outlinedShape50:[92,92],stableRule:[93,831],
   movingRuleCopy:[288,306],workedExamplePlacement:[307,462],
   workedResult:{instanceId:'sprite-95/depth-91/generation-1',placedZeroAlpha:360,
    partialAlpha:[361,366],fullAlpha:[367,455],fadingAlpha:[456,461],zeroAlpha:462,removed:463},
   workedEmphasisCopies:[388,426],outroEmphasisCopies:[745,829]},
  candidateDecision:'Group only source-anchored instructional states after visual review; no native grouping is changed by this audit.',
 };
 const result68=keyframes.find(r=>r.frame===367).instances.find(r=>r.id==='sprite-95/depth-91/generation-1');
 assert.equal(result68?.alpha,256);
 for(const [frame,alpha] of [[360,0],[361,37],[366,219],[367,256],[455,256],[456,219],[461,37],[462,0]])
  assert.equal(frameState(frame,rootMatrix).instances.find(r=>r.id===result68.id)?.alpha,alpha);
 return result;}
async function capture(){const analysis=analyze(),analysisPin=writeJson(`${OUT}/source-analysis-v1.json`,analysis);
 const browser=await chromium.launch({channel:'chrome',headless:true,
  args:['--mute-audio','--autoplay-policy=document-user-activation-required']});
 const errors=[],requests=[],records=[];
 try{const page=await browser.newPage({viewport:{width:820,height:620},deviceScaleFactor:1});
  page.on('pageerror',error=>errors.push(String(error)));
  page.on('request',request=>requests.push(request.url()));
  await page.setContent('<!doctype html><html><body style="margin:0"><canvas id="stage" width="800" height="600"></canvas></body></html>');
  await page.addScriptTag({content:fs.readFileSync(file(CANVAS),'utf8')});
  await page.evaluate(async()=>{const asset=globalThis.HELP_MATH_CANVAS_ASSETS?.['shared-alg001-l06-p004'];
   if(!asset)throw Error('P004 canvas absent');await asset.ready();});
  const canvas=page.locator('#stage');
  for(const frame of FRAMES){const state=await page.evaluate(frame=>{
    const canvas=document.getElementById('stage');
    const result=globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p004']
     .render(canvas,{frame,scenario:'source-static-frame',lang:'en',seed:0});
    return {localFrame:result.localFrame,rootFrame:result.rootFrame,
     frameDomain:canvas.dataset.flashFrameDomain};},frame);
   assert.deepEqual(state,{localFrame:frame,rootFrame:6,frameDomain:'sprite-95'});
   const image=await canvas.screenshot();
   const screenshot=exact(`${OUT}/frames/frame-${String(frame).padStart(3,'0')}.png`,image);
   records.push({frame,state,screenshot});
  }
  assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith('data:')));
  const receipt={schemaVersion:1,kind:'alg-l06-p004-equation-safe-canvas-capture-v1',
   sourceAnalysis:analysisPin,sourcePins:analysis.sourcePins,
   browser:{name:'Chrome',version:browser.version()},frameDomain:'sprite-95',
   scope:'Offscreen local safe Canvas only; no source SWF/AVM1 execution, host, original-runtime parity or acceptance.',
   frames:records,errors,requests};
  const report=writeJson(`${OUT}/capture-v1.json`,receipt);
  console.log(JSON.stringify({sourceAnalysis:analysisPin,capture:report,frames:records.length}));
 }finally{await browser.close();}}
function teachingDecision(){const analysis=JSON.parse(fs.readFileSync(file(`${OUT}/source-analysis-v1.json`),'utf8'));
 const capture=JSON.parse(fs.readFileSync(file(`${OUT}/capture-v1.json`),'utf8'));
 const captured=new Map(capture.frames.map(row=>[row.frame,row.screenshot]));
 const evidence=(frames,observation)=>({frames:frames.map(frame=>{
  assert(captured.has(frame));return captured.get(frame);}),observation});
 const members=id=>analysis.members.find(row=>row.id===id).instances.map(row=>row.id);
 const intro=analysis.keyframes.find(row=>row.frame===1).instances.filter(row=>row.cohort==='intro-glyphs')
  .sort((a,b)=>a.bounds.left-b.bounds.left);
 assert.equal(intro.map(row=>row.text).join(''),'M=$0.50xC');
 assert.equal(analysis.keyframes.find(row=>row.frame===83).instances.filter(row=>row.cohort==='intro-glyphs')
  .sort((a,b)=>a.bounds.left-b.bounds.left).map(row=>row.text).join(''),'M=$0.50xC');
 const result={schemaVersion:1,kind:'alg-l06-p004-equation-teaching-decision-v1',
  analysis:pin(`${OUT}/source-analysis-v1.json`),capture:pin(`${OUT}/capture-v1.json`),
  scope:'Engineering interpretation of source geometry/direct alpha and local safe Canvas; no original Flash runtime, source-audio, human review, fidelity or acceptance.',
  sourceAnchors:{introGlyphs:members('intro-glyphs'),outlinedTransitions:analysis.shapeAnchors,
   stableRule:members('stable-rule'),movingRuleCopy:members('moving-rule-copy'),
   workedExample:members('worked-example'),workedEmphasisCopies:members('worked-emphasis-copies'),
   outroEmphasisCopies:members('outro-emphasis-copies')},
  visualObservations:[
   evidence([1,83],'The early handwritten line reads M = $0.50 x C as one formula; all nine source text glyphs share its spatial line and move together near frame 83.'),
   evidence([84,91,92,93],'The outlined formula morph is partial at frame 84, nearly restored by frame 91, and complete at frame 92; frame 93 uses the stable DefineText pair. Shapes 49 and 50 are distinct source generations.'),
   evidence([288,298,307,315],'A copy of the rule moves into a second line; frame 307 has an unfinished M = $0.50 x, and frame 315 first shows the full substitution M = $0.50 x 5.'),
   evidence([360,364,366,367,374],'The answer is absent at alpha zero on frame 360, fades in on 361–366, and is fully opaque by frame 367. Frame 374 removes the second-line M and equals sign, leaving $0.50 x 5 = $2.50.'),
   evidence([388,409,455,456,461,462,463],'Brief colored glyph copies emphasize values, then the worked line fades; by frame 462 its direct text alpha is zero, and frame 463 removes the instances.'),
   evidence([744,745,753,768,773,781,808,816,829,830,831],'Late one-frame/repeated copies color the price, C and M on the persistent formula; they add no new mathematical value.'),
  ],
  conservativeNativeProposal:{
   persistentRule:{frames:[1,831],text:'M = $0.50 × C',sourceBasis:'intro glyph x ordering, outlined-shape transition, stable text52/x39 geometry; × is an explicit modern multiplication interpretation',
    treatment:'One coherent native equation throughout; do not present nine initial glyphs, the transient outlines or moving duplicate as separate reading blocks.'},
   workedSubstitution:{frames:[315,366],text:'M = $0.50 × 5',sourceBasis:'second-line glyphs with added 5 at frame 315; result text68 is alpha zero at 360 and partial through 366'},
   workedResultWithM:{frames:[367,373],text:'M = $0.50 × 5 = $2.50',sourceBasis:'text68 direct alpha reaches 256/256 at 367; second-line M and equals persist through 373'},
   workedResultCalculation:{frames:[374,461],text:'$0.50 × 5 = $2.50',sourceBasis:'second-line M and equals removed at 374; result is fully opaque through 455 and remains nonzero through the 456–461 source fade, so the modern readable value remains available'},
   workedRetirement:{fromFrame:462,sourceBasis:'the worked line reaches direct alpha zero at 462 and is removed at 463; retire the whole native value on the zero-alpha boundary'},
   redundantNativeCopies:{instanceIds:[...members('moving-rule-copy'),...members('worked-emphasis-copies'),...members('outro-emphasis-copies')],
    treatment:'Keep the source Canvas motion/highlights; omit the copied glyph instances from native reading once the persistent rule and worked equation represent their meaning.'},
   incompleteSecondLine:{frames:[288,314],treatment:'Keep the persistent rule; the moving duplicate and incomplete substitution do not yet create a second native equation.'},
  },
  unresolved:'This is a candidate modern teaching policy, not a pixel-visibility or AVM1 trace. Stage masks, occlusion and the design of the separate price/diagram labels still need scoped review before typography acceptance.',
 };
 return result;}
function check(){const analysis=analyze();
 const expected=Buffer.from(JSON.stringify(analysis,null,2)+'\n');
 assert.deepEqual(fs.readFileSync(file(`${OUT}/source-analysis-v1.json`)),expected);
 const receipt=JSON.parse(fs.readFileSync(file(`${OUT}/capture-v1.json`),'utf8'));
 assert.deepEqual(receipt.sourceAnalysis,pin(`${OUT}/source-analysis-v1.json`));
 assert.deepEqual(receipt.frames.map(r=>r.frame),FRAMES);
 for(const row of receipt.frames)assert.deepEqual(row.screenshot,pin(row.screenshot.path));
 assert.deepEqual(receipt.errors,[]);assert(receipt.requests.every(url=>url.startsWith('data:')));
 const decision=teachingDecision();
 assert.deepEqual(fs.readFileSync(file(`${OUT}/teaching-decision-v1.json`)),
  Buffer.from(JSON.stringify(decision,null,2)+'\n'));
 console.log(JSON.stringify({sourceAnalysis:receipt.sourceAnalysis,capture:pin(`${OUT}/capture-v1.json`),frames:FRAMES.length}));}
const option=process.argv[2];
if(option==='--analyze')console.log(JSON.stringify(writeJson(`${OUT}/source-analysis-v1.json`,analyze())));
else if(option==='--capture')await capture();
else if(option==='--review')console.log(JSON.stringify(writeJson(`${OUT}/teaching-decision-v1.json`,teachingDecision())));
else if(option==='--check')check();
else throw Error('Use --analyze, --capture, --review or --check');
