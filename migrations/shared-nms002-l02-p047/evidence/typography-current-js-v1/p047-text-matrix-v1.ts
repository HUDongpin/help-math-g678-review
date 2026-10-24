import assert from 'node:assert/strict';
import {p047ModuleFrame,P047_FRAME_DOMAINS} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-frame-v1';
import {p047TextSnapshot} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-text-v1';
import {p047Initial,p047FinishPhase,p047Select,p047Drop,p047Help,P047_CARDS} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-practice-v1';
const finish=s=>p047FinishPhase(s,s.phaseToken);let count=0;const seen=new Set();
function check(state,options={}){const x=p047TextSnapshot(state,options);assert.equal(x.status,'ready');assert.deepEqual(x.blockers,[]);assert.equal(x.blocks.length,68);for(const b of x.blocks)if(b.visible){assert(b.text.trim());seen.add(b.id);}count++;return x;}
const defaults={root:'source-inspection','sprite-81':'source-inspection','sprite-76':'celebration','sprite-78':'first-correct','sprite-80':'first-wrong','sprite-35':'help-example'};
for(const lang of ['en','es'])for(const seed of [0,1,4294967295]){
 for(const [domain,end]of Object.entries(P047_FRAME_DOMAINS))for(let frame=1;frame<=end;frame++){const s=p047ModuleFrame(frame,{frame,frameDomain:domain,scenario:defaults[domain],lang,seed});check(s);check(s,{reducedMotion:true});}
 let state=finish(p047Initial(seed));const base=p047ModuleFrame(140,{frame:140,frameDomain:'sprite-81',scenario:'source-inspection',lang,seed});
 const live=()=>({...base,state});
 for(const card of P047_CARDS){state=p047Select(state,card.id);check(live());state=p047Drop(state,0);check(live());state=finish(state);state=p047Help(state,true);for(const term of ['fraction','number-line','part','whole'])check(live(),{glossary:term});state=p047Help(state,false);state=p047Drop(p047Select(state,card.id),card.tick);check(live());state=finish(state);check(live());}
 state=finish(state);check(live());state=finish(state);check(live());
 for(const term of ['fraction','number-line','position'])check(base,{glossary:term});
}
console.log(JSON.stringify({status:'PASS',snapshots:count,visibleRoles:seen.size,roleIds:[...seen].sort(),scope:'Snapshot completeness over deterministic domains and reachable practice states; not DOM visual comparison.'}));
