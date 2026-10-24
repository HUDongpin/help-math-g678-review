/** Explicit two-stage predecessor provider: real live base proof, then copied-page proof. */
import {createHash} from 'node:crypto';
import {lstatSync,readFileSync,realpathSync} from 'node:fs';
import path from 'node:path';

const ROOT='/Volumes/WestWorld/HELP MATH 2.0-g678-implementation';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const PHASE='frozen16-continuous-audio-provisional-browser-qa';
const WITNESS={path:'output/nms-l02-host-successor-20260927/predecessor/base-witness-v2/base-witness.json',
  bytes:3744,sha256:'9222705bbee9dd99e9ee6fbd68d1fc4f0326a1e593e4709d9ee7cb5c36ea53d8'};
const BASE_FREEZE={path:'catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v26.json',
  bytes:2650947,sha256:'21bde88b4beabe7ce6ea4f01c61e5c1a98b1d60dd8c5d6e0be9db48d569cf825'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function demand(ok,label){if(!ok)throw Error(`NMS_L02_BASE_WITNESS_INVALID:${label}`);}
function actual(p,system){
  const file=p.startsWith('G6-G8-shared/')?path.resolve(SOURCE_ROOT,p):path.resolve(ROOT,p);
  demand(file.startsWith(ROOT+path.sep)||file.startsWith(SOURCE_ROOT+path.sep)||
    file.startsWith('/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1'+path.sep)||
    file.startsWith('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f'+path.sep)||
    file.startsWith('/Volumes/WestWorld/HELP MATH 2.0/node_modules'+path.sep)||system.has(file),`scope:${p}`);
  return file;
}
function readPin(p,system=new Set()){
  demand(typeof p?.path==='string'&&Number.isSafeInteger(p.bytes)&&p.bytes>=0&&/^[a-f0-9]{64}$/u.test(p.sha256),'pin-shape');
  const file=actual(p.path,system),before=lstatSync(file,{bigint:true});
  demand(before.isFile()&&before.nlink===1n&&realpathSync(file)===file,`physical:${p.path}`);
  const bytes=readFileSync(file),after=lstatSync(file,{bigint:true});
  demand(['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'].every(k=>before[k]===after[k])&&
    bytes.length===p.bytes&&sha(bytes)===p.sha256,`pin-drift:${p.path}`);
  return bytes;
}
function parsePin(p,system){const bytes=readPin(p,system),value=JSON.parse(bytes.toString());
  demand(Buffer.from(JSON.stringify(value,null,2)+'\n').equals(bytes),`canonical-json:${p.path}`);return value;}

export function g678PartialCalibrationSnapshot(){
  demand(process.env.NODE_ENV!=='production'&&process.env.HELP_MATH_G678_SOURCE_ROOT===SOURCE_ROOT&&
    process.env.HELP_MATH_G678_CALIBRATION_PHASE===PHASE,'exact-local-base-env');
  const witness=parsePin(WITNESS);
  demand(witness.schemaVersion===1&&witness.kind==='nms-l02-live-base-descriptor-witness-v2'&&
    witness.execution?.method==='unmodified-live-root-reader'&&witness.execution.root===ROOT&&
    witness.execution.sourceRoot===SOURCE_ROOT&&witness.execution.phase===PHASE&&
    witness.execution.entry==='g678PartialCalibrationSnapshot'&&
    witness.execution.observed?.status==='ready'&&witness.execution.observed.error===null&&
    witness.execution.observed.descriptorCount===44&&witness.execution.observed.registeredPlacementCount===379&&
    exact(witness.baseFreeze,BASE_FREEZE)&&witness.fullDescriptorArray?.bytes===2565475&&
    witness.fullDescriptorArray.sha256==='d6774a9e951e9997461752adb5b764781d6b317be6f55fb8f95595f04dc72118'&&
    witness.fullSnapshot?.bytes===2705930&&
    witness.fullSnapshot.sha256==='4b147c26a4ce7b590dc2c18822e518d44940d20953233086800343bdb30e0d59'&&
    witness.selectedDescriptor?.bytes===61267&&
    witness.selectedDescriptor.sha256==='8c344a9b5dfdfa0890bc92271f8a76db783798fdc8b288935bce125ba958e02f'&&
    Object.values(witness.acceptanceEffects??{}).length===7&&Object.values(witness.acceptanceEffects).every(v=>v===false),
    'frozen-base-witness-contract');
  readPin(witness.predecessorWitness);readPin(witness.execution.script);readPin(witness.execution.reader);
  const closure=parsePin(witness.closure);
  demand(closure.schemaVersion===1&&closure.kind==='nms-l02-live-base-effective-closure-v1'&&
    closure.auditCounts?.unionPins===1776&&closure.pins?.length===1776&&closure.conflicts?.length===0,
    'effective-base-closure');
  const system=new Set(closure.pins.filter(p=>p.path.startsWith('/')&&!p.path.startsWith('/Volumes/')&&
    closure.categories?.[JSON.stringify([p.path,p.bytes,p.sha256])]?.includes('p042-effective-host-closure'))
    .map(p=>p.path));
  demand(system.size===42,'exact-p042-system-tool-scope');
  const seen=new Set();for(const p of closure.pins){const key=JSON.stringify([p.path,p.bytes,p.sha256]);
    demand(!seen.has(key),'duplicate-effective-pin');seen.add(key);readPin(p,system);}
  readPin(BASE_FREEZE);
  const snapshot=parsePin(witness.snapshot),nms=parsePin(witness.descriptor);
  const compact=Buffer.from(JSON.stringify(snapshot));
  demand(compact.length===witness.fullSnapshot.bytes&&sha(compact)===witness.fullSnapshot.sha256&&
    snapshot.status==='ready'&&snapshot.error===null&&snapshot.descriptors?.length===44&&
    snapshot.registeredPlacementCount===379&&snapshot.frozenCalibrationPlacementCount===2282&&
    snapshot.registrationStatus==='private-current-js-calibration-partial', 'actual-full-snapshot');
  const descriptors=Buffer.from(JSON.stringify(snapshot.descriptors));
  demand(descriptors.length===witness.fullDescriptorArray.bytes&&sha(descriptors)===witness.fullDescriptorArray.sha256,
    'all44-descriptors');
  const matches=snapshot.descriptors.filter(d=>d.course?.moduleCode==='NMS002'&&d.course?.lesson===2);
  demand(matches.length===1&&exact(matches[0],nms)&&nms.pages?.length===64&&
    nms.productBridge?.registeredAnimationCount===5,'exact-nms-l02-base');
  const selected=Buffer.from(JSON.stringify(nms));
  demand(selected.length===witness.selectedDescriptor.bytes&&sha(selected)===witness.selectedDescriptor.sha256,
    'nms-descriptor-compact');
  return Object.freeze(snapshot);
}
