#!/usr/bin/env node
/** P042-only source/native/behavior intake and deterministic checker. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const MIGRATION=path.resolve(HERE,'..');
const ROOT=path.resolve(MIGRATION,'../..');
const ID='shared-alg001-l06-p042';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6';
const SOURCE_SCRIPT_ROOT='output/g678-p042-source-intake-20261002-v1/extraction/ffdec/scripts';
const COPIES=[
 ['output/g678-p042-source-intake-20261002-v1/source-audit.json','audit-v1/source-audit.json','7f01b7022a3ee6ce789ee7aae307e64e16e512dc7280fc148c8ba94aedd08232'],
 ['output/g678-p042-source-intake-20261002-v1/extraction/swfmill.xml','audit-v1/swfmill.xml','40ea4ee818c50df1f5b55aeac764f056eb9e91f8aa770955415c558b903faf54'],
 ['output/g678-p042-native-canvas-preparation-20261002-v1/native-model-v1.json','native-v1/native-model-v1.json','746677e644824564427e48c4636f88fb407e65d1bc95a2b76f9d3426799432f0'],
 ['output/g678-p042-native-canvas-preparation-20261002-v1/canvas-extraction-plan-v1.json','native-v1/canvas-extraction-plan-v1.json','0c68474a6e8af35a5833f485015255d37b9e35703656d20e16b40d198319c643'],
 ['output/g678-p042-behavior-preparation-20261002-v1/behavior-ir-draft-v1.json','behavior-v1/historical-behavior-ir-draft-v1.json','6a93ad65872a91f1b8c1bf1be798728e4b6f87f32d743ed5cc3ef52c0ba157ca'],
 ['output/alg-l06-p042-behavior-state-draft-20261002-v2/source-pins-v2.json','behavior-v1/source-pins-v2.json','f67bface0163136baf849e6b5a9947735ca22e5e12bd7d53c5d5d25c54e4c9ad'],
 ['output/alg-l06-p042-behavior-state-draft-20261002-v2/state-machine-v2.mjs','behavior-v1/state-machine-v2.mjs','4fa7a081c5a19dfab354634821b4f703d6977d6651ff2d7e4c4fc386f8b3d0f5'],
 ['output/alg-l06-p042-behavior-state-draft-20261002-v2/state-machine-v2.test.mjs','behavior-v1/generator-input-state-machine-v2.test.mjs.txt','579b767e775f7970e5117bd38b715018a95d6d98e0a84099c820df7f99fe8c89'],
 ['output/g678-p042-maintained-renderer-plan-20261002-v1/state-test-vectors-v1.json','behavior-v1/state-test-vectors-v1.json','ac2aeba3fac0f2cdc62920970b0eaa684c7103b4162e13f07468aa10d1e2caf4']
];
const SWF_SHA='7df2077da472138df83a4485c0e15b7f3b1063aefcdcf2e3ded9232c98f68fcb';
const XML_SHA='9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c';
const SA_SHA='1af6e25217490b60e3bce052a5e29f3be3d5ce932389a48de14bde0369603907';
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
function readPhysical(file){
 const absolute=path.resolve(file);assert.equal(fs.realpathSync(absolute),absolute,`physical ${file}`);
 const before=fs.lstatSync(absolute,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${file}`);
 const bytes=fs.readFileSync(absolute),after=fs.lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])assert.equal(before[key],after[key],`${file}:${key}`);
 return bytes;
}
function copyOrCheck(from,to,hash,mode){
 const destination=path.join(MIGRATION,to);
 if(mode==='--write'&&!fs.existsSync(destination)){
  const source=path.join(ROOT,from),bytes=readPhysical(source);assert.equal(sha(bytes),hash,from);
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes,{flag:'wx'});
 }
 const bytes=readPhysical(destination);assert.equal(sha(bytes),hash,to);return bytes;
}
function output(name,bytes,mode){
 const file=path.join(MIGRATION,name);
 if(mode==='--write'&&!fs.existsSync(file)){
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx'});
 }
 assert.deepEqual(readPhysical(file),bytes,`${name} drift`);return {path:`migrations/${ID}/${name}`,bytes:bytes.length,sha256:sha(bytes)};
}
function replaceOnce(source,needle,replacement,label){
 const at=source.indexOf(needle);assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
 return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
const mode=process.argv[2];assert(['--write','--check'].includes(mode),'--write | --check');
const copied=new Map(COPIES.map(([from,to,hash])=>[to,copyOrCheck(from,to,hash,mode)]));
const sourcePins=JSON.parse(copied.get('behavior-v1/source-pins-v2.json'));
const native=JSON.parse(copied.get('native-v1/native-model-v1.json'));
const historical=JSON.parse(copied.get('behavior-v1/historical-behavior-ir-draft-v1.json'));
const audit=JSON.parse(copied.get('audit-v1/source-audit.json'));
const plan=JSON.parse(copied.get('native-v1/canvas-extraction-plan-v1.json'));
assert.equal(audit.identity.animationId,ID);assert.equal(native.animationId,ID);
assert.equal(historical.identity.animationId,ID);assert.equal(plan.animationId,ID);
assert.equal(sourcePins.extractions.nativeModel,sha(copied.get('native-v1/native-model-v1.json')));
assert.equal(sourcePins.extractions.swfmillXml,sha(copied.get('audit-v1/swfmill.xml')));
const physical=[['swf','TI/L6TI02.swf',SWF_SHA,907398],['lessonXml','index.xml',XML_SHA,13926],
 ['separateSaCandidate','SA/L6TI02.mp3',SA_SHA,239232]].map(([role,relativePath,expected,size])=>{
 const b=readPhysical(path.join(SOURCE_ROOT,relativePath));
 assert.equal(b.length,size,role);assert.equal(sha(b),expected,role);
 assert.equal(sourcePins.physical[role].sha256,expected,`${role} pin`);
 return {role,path:path.join(SOURCE_ROOT,relativePath),bytes:b.length,sha256:sha(b)};
});
const actionRecords=[];
for(const [relative,hash] of Object.entries(sourcePins.scripts)){
 assert(/^(?:DefineSprite_\d+\/frame_\d+\/DoAction\.as|DefineButton2_\d+\/BUTTONCONDACTION on\(release\)\.as)$/u.test(relative),`script path ${relative}`);
 const source=`${SOURCE_SCRIPT_ROOT}/${relative}`;
 const to=`audit-v1/actions/${relative}`;
 const b=copyOrCheck(source,to,hash,mode);
 actionRecords.push({path:`migrations/${ID}/${to}`,bytes:b.length,sha256:sha(b)});
}
assert.equal(actionRecords.length,16);
assert.equal(native.projectionProof.spriteFramesChecked+native.root.frames,712);
assert.equal(plan.frameCoverage.totalCases,712);

// The source display-list/native text-hit overlap resolves labels. This is a
// source-stage binding; no original-runtime launch or browser hit is inferred.
const options=native.quiz.answerPlacements.map(p=>({instance:p.instance,buttonId:p.buttonId,
 branch:p.branch,letter:p.sourceStageLetter?.text,value:p.sourceStageValue?.text,
 letterTextId:p.sourceStageLetter?.sourceTextId,valueTextId:p.sourceStageValue?.sourceTextId,
 sourceStageHitBoxPx:p.sourceStageHitBoxPx,letterBoxPx:p.sourceStageLetter?.stageBoxPx,
 valueBoxPx:p.sourceStageValue?.stageBoxPx,
 sourceStageLabelBindingAccepted:p.sourceStageLabelBindingAccepted,
 browserHitParityAccepted:p.browserHitParityAccepted}));
assert.deepEqual(options.map(x=>[x.instance,x.letter,x.value,x.buttonId,x.branch]),[
 ['AnsBtn1','B','3',169,'wrong'],['AnsBtn2','A','–3',171,'right'],
 ['AnsBtn3','C','10',170,'wrong'],['AnsBtn4','D','25',170,'wrong']]);
assert(options.every(x=>x.sourceStageLabelBindingAccepted===true&&x.browserHitParityAccepted===false));
const corrected=structuredClone(historical);
corrected.kind='g678-source-bound-behavior-ir-source-corrected-v2';
corrected.status='source-stage-bound-unregistered-original-runtime-open';
corrected.sourceEvidence={
 intakeAudit:`migrations/${ID}/audit-v1/source-audit.json`,
 swfXml:`migrations/${ID}/audit-v1/swfmill.xml`,
 nativeModel:`migrations/${ID}/native-v1/native-model-v1.json`,
 actionScriptRoot:`migrations/${ID}/audit-v1/actions`,
 behaviorSourcePins:`migrations/${ID}/behavior-v1/source-pins-v2.json`,
 historicalDraft:`migrations/${ID}/behavior-v1/historical-behavior-ir-draft-v1.json`,
 limitations:['swfmill emitted UnknownTag/nested-end/EOF warnings',
  'source-stage text/hit overlap binds answer labels but browser hit parity and original-runtime outcomes are unverified',
  'no same-stem FLA in physical Lesson 6 TI source']};
corrected.quiz.answerInstancePlacementsAtFrame279=options;
corrected.quiz.visibleAnswerLabels={status:'source-stage-bound',
 byLetter:Object.fromEntries(options.map(x=>[x.letter,{value:x.value,instance:x.instance,buttonId:x.buttonId,branch:x.branch}])),
 browserHitParityAccepted:false,originalRuntimeOutcomeVerified:false};
corrected.unresolved=corrected.unresolved.filter(x=>x!=='rendered answer labels and their association with AnsBtn1..4');
corrected.unresolved.unshift('browser hit parity, responsive label layout and original-runtime choice outcomes');
corrected.nextImplementationSlice[0]='Use source-stage label/instance binding; verify browser hit targets and original-runtime outcomes when available';
corrected.evidenceBoundary={sourceStageLabelBinding:true,browserHitParity:false,
 originalRuntimeLauncherBindingObserved:false,originalRuntimeOutcomeVerified:false,
 currentJsRegistered:false};
const behaviorBytes=json(corrected);

const mask=native.clipMasks;
assert.equal(mask.maskShapeId,182);assert.equal(mask.sourcePlacements.length,7);
assert.deepEqual(mask.sourcePlacements.map(x=>x.frame),[2,3,4,5,6,7,8]);
assert(mask.sourcePlacements.every(x=>x.spriteId===207&&x.shapeId===182&&x.depth===1&&x.clipDepth===7));
const shape=native.shapeDefinitions['182'];assert.equal(shape.tag,'DefineShape3');
const clipBytes=json({schemaVersion:1,kind:'p042-source-clip-depth-plan-v1',animationId:ID,
 physicalSwfSha256:SWF_SHA,nativeModelSha256:sha(copied.get('native-v1/native-model-v1.json')),
 swfmillXmlSha256:sha(copied.get('audit-v1/swfmill.xml')),
 mask:{shapeId:182,sourceTag:shape.tag,parentSpriteId:207,firstFrame:2,lastFrame:8,
  depth:1,clipDepth:7,sourceBoundsTwips:shape.boundsTwips,shapeXmlSha256:shape.sourceXmlSha256,
  sourcePlacements:mask.sourcePlacements},
 semantics:{sourceRole:'clipDepth-mask-not-blue-overlay',
  canvasOpaqueFillNormalizationImplemented:true,
  canvasAssetDrawSmokeCompleted:true,maskClipBrowserVerified:false,
  originalRuntimeClipVerified:false,
  feedback1ReachableFromObservedP042AnswerButtons:false},
 acceptanceEffects:{sourceFidelity:false,currentJsRegistered:false,human:false,owner:false}});
const testOriginal=copied.get('behavior-v1/generator-input-state-machine-v2.test.mjs.txt').toString();
const testBytes=Buffer.from(replaceOnce(testOriginal,
 '../g678-p042-native-canvas-preparation-20261002-v1/native-model-v1.json',
 '../native-v1/native-model-v1.json','canonical test native path'));
const generated=[
 output('native-v1/clip-plan-v1.json',clipBytes,mode),
 output('behavior-v1/behavior-ir-source-corrected-v2.json',behaviorBytes,mode),
 output('behavior-v1/state-machine-v2.test.mjs',testBytes,mode)];
const manifest=json({schemaVersion:1,kind:'p042-canonical-source-native-behavior-inputs-v1',
 status:'source-stage-bound-unregistered',animationId:ID,physical,
 copies:COPIES.map(([from,to,hash])=>({source:from,path:`migrations/${ID}/${to}`,bytes:copied.get(to).length,sha256:hash})),
 actions:actionRecords,generated,
 sourceStageChoices:options.map(x=>({letter:x.letter,value:x.value,instance:x.instance,
  buttonId:x.buttonId,branch:x.branch})),
 historicalDraft:{path:`migrations/${ID}/behavior-v1/historical-behavior-ir-draft-v1.json`,
  sha256:sha(copied.get('behavior-v1/historical-behavior-ir-draft-v1.json')),
  disposition:'preserved; visible labels unresolved in that dated draft'},
 originalRuntime:{launcherBindingObserved:false,choiceOutcomesVerified:false,
  labelAndHitParityVerified:false},
 acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,audio:false,
  listening:false,human:false,owner:false,strictComplete:false,publication:false}});
const manifestResult=output('behavior-v1/canonical-input-manifest-v1.json',manifest,mode);
console.log(JSON.stringify({mode,copies:COPIES.length,actions:actionRecords.length,
 generated:[...generated,manifestResult].map(x=>({path:x.path,sha256:x.sha256,bytes:x.bytes})),
 sourceStageChoices:options.map(x=>`${x.letter}=${x.value}`),originalRuntimeVerified:false}));
