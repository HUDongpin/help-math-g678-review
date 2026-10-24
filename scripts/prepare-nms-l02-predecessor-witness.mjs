#!/usr/bin/env node
/** Read-only frozen-chain audit. Writes only new evidence under predecessor/. */
import {createHash} from 'node:crypto';
import {existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'output/nms-l02-host-successor-20260927/predecessor');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const pin = (file, bytes) => ({path:file, bytes:bytes.length, sha256:sha(bytes)});
function demand(ok, message) {if (!ok) throw Error(`NMS_PREDECESSOR_WITNESS:${message}`);}
function physical(file) {
  const before=lstatSync(file,{bigint:true});
  demand(before.isFile() && before.nlink===1n && realpathSync(file)===file,`physical:${file}`);
  const bytes=readFileSync(file), after=lstatSync(file,{bigint:true});
  demand(['dev','ino','size','mtimeNs','mode','nlink'].every(key=>before[key]===after[key]),`stable:${file}`);
  return bytes;
}
function readPinned(p) {
  demand(Number.isSafeInteger(p.bytes) && p.bytes>=0 && /^[a-f0-9]{64}$/.test(p.sha256),`pin:${p.path}`);
  const file=path.resolve(root,p.path);
  demand(file.startsWith(`${root}${path.sep}`) || file.startsWith('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/') || file.startsWith('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/') || file.startsWith('/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI/') || file.startsWith('/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1/objects/sha256/'),`scope:${p.path}`);
  const bytes=physical(file);
  return {bytes, current:pin(p.path,bytes), matches:bytes.length===p.bytes && sha(bytes)===p.sha256};
}
function writeExact(rel,bytes) {
  const file=path.join(out,rel);
  demand(file.startsWith(`${out}${path.sep}`),`output-scope:${rel}`);
  mkdirSync(path.dirname(file),{recursive:true});
  if(existsSync(file)) demand(physical(file).equals(bytes),`output-drift:${rel}`);
  else writeFileSync(file,bytes,{flag:'wx',mode:0o444});
  return pin(path.relative(root,file),bytes);
}
function freezePin(server) {
  const name=path.basename(server), number=Number(name.match(/p(\d{3})/u)?.[1]);
  demand(Number.isInteger(number),`server:${name}`);
  const source=physical(server).toString();
  const basename=number===5 ? null : source.match(/from '\.\/(g678-nms-l02-p\d{3}-freeze-v\d+)'/u)?.[1];
  demand(number===5 || basename,`freeze-import:${name}`);
  const pointerSource=basename ? physical(path.join(root,'apps/web/lib',`${basename}.ts`)).toString() : source;
  const match=pointerSource.match(/["']?path["']?\s*:\s*["']([^"']+)["']\s*,\s*["']?bytes["']?\s*:\s*(\d+)\s*,\s*["']?sha256["']?\s*:\s*["']([a-f0-9]{64})["']/u);
  demand(match,`freeze-shape:${name}`);
  const predecessor=number===5 ? null : source.match(/nmsL2P(\d{3})Descriptor.*from '\.\/g678-nms-l02-p\d{3}\.server'/u)?.[1];
  demand(number===5 || predecessor,`predecessor-import:${name}`);
  return {number, predecessor:predecessor ? Number(predecessor) : null, pointerModule:basename&&`apps/web/lib/${basename}.ts`, packet:{path:match[1],bytes:Number(match[2]),sha256:match[3]}};
}

const servers=new Map();
for(const name of ['001','002','003','004','005','006','007','008','009','010','011','012','013','014','015','016','017','018','021','022','023','024','025','026','027','028','029','030','031','032','033','034','035','036','037','038','039','040','042','043','044','045','046','047','048','049','050','051','052']) {
  const entry=freezePin(path.join(root,`apps/web/lib/g678-nms-l02-p${name}.server.ts`));
  servers.set(entry.number,entry);
}
demand(servers.size===49,'exact-active-chain-size');
const chain=[];let next=52;
while(next!==null){
  demand(servers.has(next) && !chain.some(entry=>entry.number===next),`chain:${next}`);
  const entry=servers.get(next), result=readPinned(entry.packet);
  demand(result.matches,`packet-identity:${entry.packet.path}`);
  const packet=JSON.parse(result.bytes);
  demand(packet.schemaVersion===1 && packet.deploymentScope==='local-only' && packet.selectedPages?.length===1 && packet.selectedPages[0].animationId===`shared-nms002-l02-p${String(next).padStart(3,'0')}` && Array.isArray(packet.inputs) && Array.isArray(packet.outputs),`packet-shape:${next}`);
  chain.push({number:entry.number, predecessor:entry.predecessor, pointerModule:entry.pointerModule, packet:entry.packet, selectedPage:packet.selectedPages[0].animationId, inputCount:packet.inputs.length, outputCount:packet.outputs.length, data:packet});
  next=entry.predecessor;
}
demand(chain.length===49 && chain.at(-1).number===5,'complete-chain');

const identities=new Map(),memberships=new Map();
for(const entry of chain)for(const [role,items] of [['input',entry.data.inputs],['output',entry.data.outputs]])for(const p of items){
  demand(typeof p.path==='string',`pin-path:${entry.number}`);
  const key=JSON.stringify([p.path,p.bytes,p.sha256]);
  if(!identities.has(key))identities.set(key,{path:p.path,bytes:p.bytes,sha256:p.sha256});
  if(!memberships.has(p.path))memberships.set(p.path,new Set());
  memberships.get(p.path).add(key);
}
const mixed=[...memberships].filter(([,set])=>set.size>1).map(([name,set])=>({path:name,identities:[...set].map(key=>identities.get(key))}));
// A future mixed-version chain must retain every tuple, never collapse by path.
const union=[...identities.values()].sort((a,b)=>a.path.localeCompare(b.path)||a.sha256.localeCompare(b.sha256));
const drift=[];let matched=0;
for(const p of union){const result=readPinned(p);if(result.matches)matched++;else drift.push({original:p,current:result.current});}

const expectedDrift=new Map([
  ['apps/web/lib/g678-preview-policy.ts',['3836','f205c7ea6d1b6609e56ec74145403083afa0ecfd1d01f25e318b83196e621308']],
  ['apps/web/proxy.ts',['13151','8c295f89c038b25729e8e549a9b243334e06aed9f999f3dbe50c3398708fd55f']],
  ['packages/demos/tests/nms-l02-p044-audio-pcm-v1.test.ts',['2367','e79eccd4717f816615f3ba791728b73efd8b088b286082b22f3dff52cbae0e3a']],
  ['packages/demos/tests/nms-l02-p046-module-v1.test.ts',['975','05a9e9f4151e365f33a67b8ae1087252519d16f24047ed6aac8bbcb9f694eb8b']],
]);
demand(drift.length===4 && drift.every(item=>{const wanted=expectedDrift.get(item.original.path);return wanted&&item.original.bytes===Number(wanted[0])&&item.original.sha256===wanted[1];}),`unexpected-drift:${drift.map(item=>item.original.path).join(',')}`);

const recovered=[];
function recover(rel,original,method,transform) {
  const driftItem=drift.find(item=>item.original.path===rel);
  demand(driftItem,`drift-missing:${rel}`);
  const bytes=transform(physical(path.join(root,rel)));
  demand(bytes.length===driftItem.original.bytes && sha(bytes)===driftItem.original.sha256,`recover-hash:${rel}`);
  const snapshot=writeExact(`snapshots/${rel}`,bytes);
  recovered.push({original:driftItem.original,current:driftItem.current,snapshot,method});
}
recover('apps/web/lib/g678-preview-policy.ts',null,'Remove exactly three later whole-line special calibration-route clauses from the current file; resulting SHA must equal the frozen P052 pin.',current=>{
  const clauses=[
    "  if (pathname === '/migration-status/g678-calibration/shared-geo001-l06-p002/host') return true;\n",
    "  if (pathname === '/migration-status/g678-calibration/shared-geo001-l07-p003-candidate') return true;\n",
    "  if (pathname === '/migration-status/g678-calibration/shared-dat001-l02-p002-candidate') return true;\n",
  ];
  let text=current.toString();
  for(const clause of clauses){demand(text.split(clause).length===2,`policy-clause:${clause}`);text=text.replace(clause,'');}
  return Buffer.from(text);
});

const proxyOriginalPath='work/g678-shared-host-successors/p047-quiz-proxy-v1/predecessor/apps/web/proxy.ts';
const proxyOriginal=readPinned({path:proxyOriginalPath,bytes:12925,sha256:'4a969febd1d80ff852e28cc49aaf04f8975d4c043413cc686966eafa35cd71ad'});
demand(proxyOriginal.matches,'p047-original-witness');
recover('apps/web/proxy.ts',null,`Apply the exact P047 proxy import and guarded branch transformation from g678-p047-proxy-host-successor.server.ts to pinned predecessor ${proxyOriginalPath}.`,()=>{
  const importLine="import {isP047AudioRequest,P047_AUDIO_PREFIX} from './lib/nms-l01-p047-audio-access';\n";
  const branch="  if(pathname.startsWith('/flash-assets/g678-local/'+DAT_L05_SOURCE_AUDIO_ID+'/interactive-audio/'))";
  const prior=proxyOriginal.bytes.toString();
  demand(!prior.includes(importLine)&&prior.split(branch).length===2,'p047-transform-anchor');
  const replacement="  if(pathname.startsWith(P047_AUDIO_PREFIX))return isP047AudioRequest({method:request.method,url:request.nextUrl,headers:request.headers});\n"+branch;
  return Buffer.from(importLine+prior.replace(branch,replacement));
});
recover('packages/demos/tests/nms-l02-p044-audio-pcm-v1.test.ts',null,'Remove exactly the later `: number` annotation from `let last` in the P044 PCM test; resulting SHA must equal its frozen pin.',current=>{
  const before='let last: number=',after='let last=';const text=current.toString();
  demand(text.split(before).length===2,'p044-test-transform-anchor');
  return Buffer.from(text.replace(before,after));
});
const p046TypedTestPath='packages/demos/tests/nms-l02-p046-module-v2.test.ts';
const p046TypedTestPin={path:p046TypedTestPath,bytes:1159,sha256:'ba9be24717e79dc7ccc1b4f5aaf69f65fdfed38d552dafe8ec0c0f924883f67d'};
const p046TypedTest=readPinned(p046TypedTestPin);
demand(p046TypedTest.matches,'p046-typed-successor-identity');
recover('packages/demos/tests/nms-l02-p046-module-v1.test.ts',null,`Reconstruct frozen v1 from exact retained typed v2 ${p046TypedTestPath}: remove its first explanatory comment and only the second inline runtime-context argument on getSnapshot; require frozen 975-byte SHA.`,()=>{
  let text=p046TypedTest.bytes.toString();
  const first='// Current typed successor; preserve all v1 behavior assertions and pass the shared runtime context.\n';
  demand(text.startsWith(first)&&text.split(first).length===2,'p046-typed-comment');
  text=text.slice(first.length);
  const context=",{frame:706,frameDomain:'sprite-205',scenario:'source-inspection',lang:'en',seed:0}";
  demand(text.split(context).length===3,'p046-two-contexts');
  const snapshotCall=`getSnapshot(state${context})`;
  demand(text.split(snapshotCall).length===2,'p046-snapshot-context');
  return Buffer.from(text.replace(snapshotCall,'getSnapshot(state)'));
});
recovered.at(-1).supportingInput=p046TypedTestPin;

const registryPath='packages/demos/private-current-js-registry.json';
const registryBytes=physical(path.join(root,registryPath)), registry=JSON.parse(registryBytes);
demand(registry.schemaVersion===2 && registry.registryScope==='private-engineering','registry-shape');
const registrations=registry.calibrations.flatMap(calibration=>calibration.entries.filter(entry=>/^shared-nms002-l02-p\d{3}$/u.test(entry.key)&&entry.key!=='shared-nms002-l02-p055').map(entry=>({calibrationId:calibration.calibrationId,freezeManifest:calibration.freezeManifest,entry})));
demand(registrations.length===54 && new Set(registrations.map(item=>item.entry.key)).size===54,'registration-54');
const registrationSubsetBytes=Buffer.from(`${JSON.stringify(registrations,null,2)}\n`);
const registrationSubset=writeExact('registration-subset-v1.json',registrationSubsetBytes);
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
demand(chain[0].data.source.path.startsWith(`${sourceRoot}/G6-G8-shared/NMS002/L2/`),'exact-source-root');
const previousClosure={path:'output/nms-l02-host-successor-20260927/predecessor/closure-v1.json',bytes:3587421,sha256:'7a86b8d7fd73b9c623c4f68555004da75d04082cc1b9dde48af60c9f79f6ee11'};
demand(readPinned(previousClosure).matches,'previous-closure-preserved');
const closure={schemaVersion:1,kind:'nms-l02-predecessor-closure-v2',animationId:'shared-nms002-l02-p052',descriptorWitnessStatus:'ready-for-original-execution',previousClosure,sourceRoot,packetChain:chain.map(({number,predecessor,pointerModule,packet,selectedPage,inputCount,outputCount})=>({number,predecessor,pointerModule,packet,selectedPage,inputCount,outputCount})),unionPins:union,mixedVersionPaths:mixed,inventory:{packetCount:chain.length,unionPinCount:union.length,mixedVersionPathCount:mixed.length,currentMatchedCount:matched,currentDriftCount:drift.length},registration:{sourceRegistry:pin(registryPath,registryBytes),subset:registrationSubset,count:54},recovered,unresolved:drift.filter(item=>!recovered.some(x=>x.original.path===item.original.path)),finding:'All four drifted original byte sequences are recovered and hash-match their retained frozen pins. The original descriptor chain must still execute before a descriptor witness is established.'};
demand(closure.unresolved.length===0,'all-original-pins-recovered');
const closureBytes=Buffer.from(`${JSON.stringify(closure,null,2)}\n`);
const closurePin=writeExact('closure-v2.json',closureBytes);
process.stdout.write(`${JSON.stringify({closure:closurePin,inventory:closure.inventory,recovered:recovered.map(x=>x.original.path),unresolved:closure.unresolved.map(x=>x.original.path)})}\n`);
