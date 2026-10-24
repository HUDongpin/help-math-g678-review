import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE_RELATIVE = 'G6-G8-shared/NMS002/L2/GS/L2GS02.swf';
const XML_PATH = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq/movie.xml';
const SCRIPT_ROOT = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq/scripts';
const OUT_BASE = 'migrations/shared-nms002-l02-p053/audit/native-display-product-v1';
const EXPECTED = Object.freeze({sourceSha256:'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf',sourceBytes:236774,xmlSha256:'058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1',catalogSha256:'4b92f48d2416025e423aefb70ecd5873212fe697da3af6e2322a527f1733eb9e',scriptInventorySha256:'d5bd4c87891e03bd0b8a987b3cca78330c51330ff1be7c6fae794d8aa1f6ace2'});
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const stableJson = value => `${JSON.stringify(value, null, 2)}\n`;

function readPinnedFile(file, expectedHash, expectedBytes) {
  const before = fs.lstatSync(file, {bigint:true});
  assert(before.isFile() && !before.isSymbolicLink(), `not a physical file: ${file}`);
  const bytes = fs.readFileSync(file);
  const after = fs.lstatSync(file, {bigint:true});
  for (const key of ['dev','ino','size','mtimeNs','mode']) assert.equal(after[key], before[key], `changed during read: ${file}`);
  if (expectedBytes !== undefined) assert.equal(bytes.length, expectedBytes, `byte length: ${file}`);
  if (expectedHash !== undefined) assert.equal(sha256(bytes), expectedHash, `SHA-256: ${file}`);
  return bytes;
}

function listScripts(directory, base = directory) {
  const out = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    assert(!entry.isSymbolicLink(), `source script symlink: ${entry.name}`);
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...listScripts(full,base));
    else { assert(entry.isFile() && entry.name.endsWith('.as'), `unexpected script entry: ${full}`); out.push({path:path.relative(base,full).split(path.sep).join('/'),full}); }
  }
  return out;
}

function xmlCount(xpath) {
  return Number(execFileSync('xmllint',['--nonet','--xpath',`count(${xpath})`,XML_PATH],{encoding:'utf8',maxBuffer:1024*1024}).trim());
}

export function validateP053XmlCounts(counts) {
  assert.deepEqual(counts, {rootFrames:10,sprites:76,mainFrames:694,staticText:38,dynamicText:1,popupFrames:1,rootMainPlacement:1}, 'SWF/XML structural agreement');
  return true;
}

function sourceText(definition) {
  return definition.kind === 'static-text' ? definition.runs.map(run=>run.text).join('') : definition.initialText?.text ?? null;
}

function stateEvent(event) {
  const result={frame:event.frame,sourceTagOffset:event.sourceTagOffset,sourceTagSha256:event.sourceTagSha256};
  for(const key of ['characterId','matrix','colorTransform','clipDepth','ratio','visible','blendMode','filters','clipActions']) {
    if(event[key]!==undefined) result[key]=event[key];
  }
  if(event.name?.text!==undefined) result.name=event.name.text;
  return result;
}

export function deriveP053NativeDisplay(catalog, scriptPins, xmlCounts) {
  validateP053XmlCounts(xmlCounts);
  assert.equal(catalog.sourceSha256, EXPECTED.sourceSha256);
  assert.equal(sha256(JSON.stringify(catalog)), EXPECTED.catalogSha256);
  assert.equal(catalog.header.version, 6);
  assert.equal(catalog.header.signature, 'CWS');
  assert.equal(catalog.header.frameCount, 10);
  assert.equal(catalog.header.frameRate, 12);
  assert.deepEqual(catalog.header.stageBoundsTwips, {left:0,right:16000,top:0,bottom:12000});
  assert.deepEqual([catalog.summary.textDefinitions,catalog.summary.textRuns,catalog.summary.decodedRuns,catalog.summary.dynamicFields,catalog.summary.unparsedTags],[39,44,44,1,0]);
  assert.equal(scriptPins.length,59,'all exported AVM1 scripts pinned');
  assert.equal(sha256(JSON.stringify(scriptPins)), EXPECTED.scriptInventorySha256,'FFDec script inventory drift');
  const timelines = new Map(catalog.timelines.map(t=>[t.timelineId,t]));
  const buttons = new Map(catalog.buttonDefinitions.map(b=>[b.characterId,b]));
  const textById = new Map(catalog.textDefinitions.map(t=>[t.characterId,t]));
  const root = timelines.get('root');
  const main = timelines.get('sprite-187');
  assert.equal(main.declaredFrameCount,694);
  assert.equal(main.observedFrameCount,694);
  const rootMain = root.instances.filter(i=>i.characterId===187);
  assert.equal(rootMain.length,1);
  assert.deepEqual([rootMain[0].firstFrame,rootMain[0].lastFrameExclusive,rootMain[0].depth],[6,11,3]);

  // Traverse definitions, never pretend that a child clip's local clock equals
  // sprite 187's clock. Button states are separate source state domains.
  const queue=['root'], reachableTimelines=new Set(), reachableButtons=new Set(), reachableText=new Set();
  while(queue.length) {
    const id=queue.shift();
    if(id.startsWith('button-')) {
      const characterId=Number(id.slice(7));
      if(reachableButtons.has(characterId)) continue;
      reachableButtons.add(characterId);
      for(const placement of buttons.get(characterId).statePlacements) {
        const child=placement.characterId;
        if(textById.has(child)) reachableText.add(child);
        if(timelines.has(`sprite-${child}`)) queue.push(`sprite-${child}`);
        if(buttons.has(child)) queue.push(`button-${child}`);
      }
    } else {
      if(reachableTimelines.has(id)) continue;
      reachableTimelines.add(id);
      const timeline=timelines.get(id);
      assert(timeline,`missing sprite ${id}`);
      for(const instance of timeline.instances) {
        const child=instance.characterId;
        if(textById.has(child)) reachableText.add(child);
        if(timelines.has(`sprite-${child}`)) queue.push(`sprite-${child}`);
        if(buttons.has(child)) queue.push(`button-${child}`);
      }
    }
  }
  assert.equal(reachableTimelines.size,13);
  assert.deepEqual([...reachableButtons],[101]);
  assert.equal(reachableText.size,37);
  assert.deepEqual([...textById.keys()].filter(id=>!reachableText.has(id)).sort((a,b)=>a-b),[14,15]);
  assert.equal(sourceText(textById.get(15)).includes('Inequalities Match Game'),true);
  assert.equal(sourceText(textById.get(103)).includes('Fractions, Decimals, and Percents Match Game'),true);
  assert.equal(sourceText(textById.get(178)).includes('Fractions, Decimals, and Percents Match Game'),true);

  const domains=[...reachableTimelines].sort((a,b)=>a==='root'?-1:b==='root'?1:Number(a.slice(7))-Number(b.slice(7))).map(id=>{
    const timeline=timelines.get(id), eventById=new Map(timeline.events.map(e=>[e.eventId,e]));
    const placements=timeline.instances.filter(i=>textById.has(i.characterId)||timelines.has(`sprite-${i.characterId}`)||buttons.has(i.characterId)).map(instance=>{
      const characterId=instance.characterId;
      const end=eventById.get(instance.removedByEventId??instance.replacedByEventId);
      return {
        instanceId:instance.instanceId, characterId, kind:textById.has(characterId)?'text':buttons.has(characterId)?'button':'sprite',
        depth:instance.depth, firstFrame:instance.firstFrame, lastFrameExclusive:instance.lastFrameExclusive,
        createdByEventId:instance.createdByEventId, removedByEventId:instance.removedByEventId??null,
        replacedByEventId:instance.replacedByEventId??null,
        endSourceTagSha256:end?.sourceTagSha256??null,
        // Every placement/update carries its own original matrix and color
        // transform. Omitted fields inherit prior local state; no AVM1 edits.
        stateEvents:instance.updates.map(eventId=>stateEvent(eventById.get(eventId)))
      };
    });
    return {id,frameCount:timeline.declaredFrameCount,placements,
      actionTags:timeline.events.filter(e=>e.kind==='action-bytes').map(e=>({frame:e.frame,sourceTagOffset:e.sourceTagOffset,sourceTagSha256:e.sourceTagSha256,bytes:e.bytes})),
      frameLabels:timeline.events.filter(e=>e.kind==='frame-label').map(e=>({frame:e.frame,label:e.label.text,sourceTagSha256:e.sourceTagSha256}))};
  });
  const mainDomain=domains.find(d=>d.id==='sprite-187');
  const one=(id,first,depth)=>{const found=mainDomain.placements.filter(p=>p.characterId===id&&p.firstFrame===first&&p.depth===depth);assert.equal(found.length,1,`source placement ${id}@${first}/${depth}`);return found[0];};
  const earlyStart=one(136,1,24),lateStart=one(136,693,43),popup=one(104,693,47),mainTitle=one(178,586,20);
  assert.equal(earlyStart.lastFrameExclusive,7);
  assert.equal(earlyStart.stateEvents[0].colorTransform.multiply[3],0);
  assert.equal(earlyStart.stateEvents.at(-1).colorTransform.multiply[3],256);
  assert.equal(lateStart.lastFrameExclusive,695);
  assert.equal(popup.lastFrameExclusive,694);
  assert.equal(mainTitle.lastFrameExclusive,695);
  assert.equal(domains.find(d=>d.id==='sprite-104').placements.some(p=>p.characterId===103),true);
  assert.equal(domains.find(d=>d.id==='sprite-104').placements.some(p=>p.characterId===102),true);
  assert.equal(domains.find(d=>d.id==='sprite-187').placements.some(p=>p.characterId===103),false);
  assert.equal(mainDomain.frameLabels.some(l=>l.frame===3&&l.label==='RepeatDirection'),true);
  assert.equal(mainDomain.frameLabels.some(l=>l.frame===693&&l.label==='SelectLevel'),true);
  const scriptsByPath=new Map(scriptPins.map(p=>[p.path,p]));
  for(const name of ['DefineSprite_187/frame_693/DoAction.as','DefineButton2_101/BUTTONCONDACTION on(release).as','DefineSprite_187/frame_693/PlaceObject2_186_32/CLIPACTIONRECORD on(release).as']) assert(scriptsByPath.has(name),`missing script ${name}`);

  const textDefinitions=catalog.textDefinitions.filter(definition=>reachableText.has(definition.characterId)).map(definition=>({
    characterId:definition.characterId,kind:definition.kind,sourceTagOffset:definition.sourceTagOffset,
    sourceTagSha256:definition.sourceTagSha256,
    visibilityClass:'static-placement-reachable-runtime-visibility-unestablished',
    sourceText:sourceText(definition),boundsTwips:definition.boundsTwips,
    textMatrix:definition.matrix??null,variableName:definition.variableName?.text??null,
    runtimeValueResolved:definition.kind==='dynamic-field'?false:null,
    runs:definition.runs?.map(run=>({runIndex:run.runIndex,text:run.text,decodeStatus:run.decodeStatus,
      fontId:run.fontId,fontHeightTwips:run.fontHeightTwips,colorRgba:run.colorRgba,
      xOffsetTwips:run.xOffsetTwips,yOffsetTwips:run.yOffsetTwips,
      advanceTwips:run.glyphs.map(g=>g.advanceTwips)}))??[]
  }));
  const buttonStates=[...reachableButtons].sort((a,b)=>a-b).map(id=>({characterId:id,
    sourceTagSha256:buttons.get(id).sourceTagSha256,actions:buttons.get(id).actions,
    placements:buttons.get(id).statePlacements.map(p=>({characterId:p.characterId,depth:p.depth,matrix:p.matrix,colorTransform:p.colorTransform,states:p.states}))}));
  const selectedActions={
    selectLevelEntry:scriptsByPath.get('DefineSprite_187/frame_693/DoAction.as'),
    popupClose:scriptsByPath.get('DefineButton2_101/BUTTONCONDACTION on(release).as'),
    skipDirections:scriptsByPath.get('DefineSprite_187/frame_693/PlaceObject2_186_32/CLIPACTIONRECORD on(release).as')
  };
  return {
    schemaVersion:1,kind:'nms-l02-p053-native-display-source-ir-v1',animationId:'shared-nms002-l02-p053',
    source:{physicalRoot:SOURCE_ROOT,relativePath:SOURCE_RELATIVE,bytes:EXPECTED.sourceBytes,sha256:EXPECTED.sourceSha256,
      swfVersion:6,stagePixels:[800,600],fps:12,rootFrames:10,rootMainPlacement:{spriteId:187,rootFrame:6,depth:3},mainFrames:694},
    extraction:{movieXml:{path:XML_PATH,sha256:EXPECTED.xmlSha256,counts:xmlCounts},catalog:{producer:'scripts/lib/swf-text-source-catalog.mjs',jsonSha256:EXPECTED.catalogSha256},
      scriptsRoot:SCRIPT_ROOT,scriptInventorySha256:EXPECTED.scriptInventorySha256,scriptPins},
    summary:{textDefinitions:39,decodedRuns:44,reachableTextDefinitions:37,unplacedDefinitionIds:[14,15],reachableTimelineDomains:13,reachableButtonDefinitions:1},
    textDefinitions,
    excludedUnplacedTextDefinitions:catalog.textDefinitions.filter(definition=>!reachableText.has(definition.characterId)).map(definition=>({characterId:definition.characterId,sourceTagSha256:definition.sourceTagSha256,reason:'not-reachable-from-root-placement-or-button-state'})),
    domains,buttonStates,
    sourceAssociations:{earlyStart:{characterId:136,mainFrames:[1,7],depth:24,alphaNumerators:earlyStart.stateEvents.map(e=>[e.frame,e.colorTransform?.multiply[3]??null])},
      laterStart:{characterId:136,mainFrames:[693,695],depth:43},mainTitle:{characterId:178,firstMainFrame:586},
      directionsPopup:{spriteId:104,mainFrames:[693,694],depth:47,sourceTitleTextId:103,scoringTextId:102,closeButtonId:101},
      selectedActions},
    boundary:{localFrameIntervalsAreHalfOpen:true,childTimelineSynchronizationEstablished:false,
      sourcePlacementIsNotRuntimeVisibility:true,scriptAlphaVisibilityNavigationInterpreted:false,
      buttonHitStateIsNotProofOfInteraction:true,maskAndShapeGlyphReviewPending:true,
      historicalHostAssociationEstablished:false,originalRuntimeParity:false,audioAccepted:false,
      humanVisualAccepted:false,ownerAccepted:false,strictComplete:false,published:false}
  };
}

function markdown(ir) {
  const assoc=ir.sourceAssociations;
  return `# P053 native display source specification\n\n`+
    `This is a source-locked structural input for a maintained native teaching renderer. It is not an executed Flash trace or a Current-JS admission. Reproduce with \`node scripts/audit-nms-l02-p053-native-display-v1.mjs --check\`.\n\n`+
    `- Physical SWF: \`${ir.source.relativePath}\`, ${ir.source.bytes} bytes, SHA-256 \`${ir.source.sha256}\`; SWF 6, root ${ir.source.rootFrames} frames, 800×600 at 12 fps. Main sprite ${ir.source.rootMainPlacement.spriteId} is placed on root frame ${ir.source.rootMainPlacement.rootFrame}, depth ${ir.source.rootMainPlacement.depth}, and has ${ir.source.mainFrames} local frames.\n`+
    `- Existing swfmill XML: \`${ir.extraction.movieXml.path}\`, SHA-256 \`${ir.extraction.movieXml.sha256}\`. Binary text catalog JSON SHA-256 \`${ir.extraction.catalog.jsonSha256}\`. All ${ir.extraction.scriptPins.length} FFDec AVM1 exports are individually pinned in the JSON.\n`+
    `- Source has ${ir.summary.textDefinitions} text definitions and ${ir.summary.decodedRuns} decoded runs. ${ir.summary.reachableTextDefinitions} definitions are structurally reachable from the root (including button states). Text 14 and text 15 live in unplaced sprite 17; text 15's Inequalities title must not become the P053 title.\n\n`+
    `The JSON records each reachable local timeline's text, sprite, and button placement intervals as half-open frame ranges, with depth, source tag hash, matrix, color transform, alpha, clip depth, and update events. Child clip frames and main sprite frames are **different clocks**. A child placement does not establish its live local frame or on-screen visibility. Shapes and masks remain source-visual review work.\n\n`+
    `| Source association | Structural finding |\n| --- | --- |\n`+
    `| Main title | Text 178 first placed in sprite 187 frame ${assoc.mainTitle.firstMainFrame}. |\n`+
    `| Directions popup | Sprite 104 placed at main frame ${assoc.directionsPopup.mainFrames[0]} depth 47 and removed at ${assoc.directionsPopup.mainFrames[1]}; title text 103 and score text 102 are inside it, with Close button 101. |\n`+
    `| Early Start | Character 136 at depth 24 main frames 1–6, with source alpha 0/256 at frame 1 and 256/256 by frame 6; removed at frame 7. |\n`+
    `| Later Start | Character 136 at depth 43 main frames 693–694. It is a distinct placement generation. |\n`+
    `| Labels and controls | \`RepeatDirection\` is at main frame 3 and \`SelectLevel\` at 693. The static label is not proof of a natural stop or user outcome. |\n\n`+
    `At frame 693 the exported DoAction calls \`stop()\` and sets \`Mc_Popup._visible = false\`. Skip and Close scripts alter control state; Close ends with \`this._visible = false\`, whose receiver and whole-popup result remain unverified. The source may also change alpha, visibility, playhead, and dynamic score text at runtime. Therefore source placement is not a blanket visible-text snapshot. An original-runtime click trace, math/visual review, audio listening, and Owner acceptance remain separate.\n`;
}

export function buildP053NativeDisplay() {
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT ?? SOURCE_ROOT,SOURCE_ROOT,'exact AWS source root required');
  const rootStat=fs.lstatSync(SOURCE_ROOT);
  assert(rootStat.isDirectory()&&!rootStat.isSymbolicLink());
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
  const source=readPinnedFile(path.join(SOURCE_ROOT,SOURCE_RELATIVE),EXPECTED.sourceSha256,EXPECTED.sourceBytes);
  const xml=readPinnedFile(XML_PATH,EXPECTED.xmlSha256);
  assert(xml.length>1_000_000,'truncated XML');
  const xmlCounts={rootFrames:xmlCount('/swf/Header/tags/ShowFrame'),sprites:xmlCount('/swf/Header/tags/DefineSprite'),mainFrames:xmlCount('/swf/Header/tags/DefineSprite[@objectID="187"]/tags/ShowFrame'),staticText:xmlCount('/swf/Header/tags/DefineText')+xmlCount('/swf/Header/tags/DefineText2'),dynamicText:xmlCount('/swf/Header/tags/DefineEditText'),popupFrames:xmlCount('/swf/Header/tags/DefineSprite[@objectID="104"]/tags/ShowFrame'),rootMainPlacement:xmlCount('/swf/Header/tags/PlaceObject2[@objectID="187"]')};
  const scriptPins=listScripts(SCRIPT_ROOT).map(file=>{const bytes=readPinnedFile(file.full);return {path:file.path,bytes:bytes.length,sha256:sha256(bytes)};});
  const catalog=collectSwfTextSourceCatalog(source);
  const ir=deriveP053NativeDisplay(catalog,scriptPins,xmlCounts);
  return {ir,json:stableJson(ir),markdown:markdown(ir)};
}

function main() {
  const mode=process.argv[2]??'--plan';
  assert(['--plan','--prepare','--check'].includes(mode),'use --plan, --prepare, or --check');
  const output=buildP053NativeDisplay();
  const files=[{path:path.join(ROOT,`${OUT_BASE}.json`),content:output.json},{path:path.join(ROOT,`${OUT_BASE}.md`),content:output.markdown}];
  if(mode==='--prepare') for(const file of files) fs.writeFileSync(file.path,file.content,{flag:'wx'});
  if(mode==='--check') for(const file of files) assert.equal(fs.readFileSync(file.path,'utf8'),file.content,`output drift: ${file.path}`);
  console.log(stableJson({status:'PASS',mode,animationId:output.ir.animationId,textDefinitions:output.ir.summary.textDefinitions,
    reachableTextDefinitions:output.ir.summary.reachableTextDefinitions,scriptPins:output.ir.extraction.scriptPins.length,
    outputs:files.map(f=>({path:path.relative(ROOT,f.path),bytes:Buffer.byteLength(f.content),sha256:sha256(f.content)}))}));
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main();
