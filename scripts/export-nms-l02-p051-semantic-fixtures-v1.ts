import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {p051ModuleFrame} from '../packages/demos/src/nms-l02-p051-frame-v1';
import {p051TextSnapshot} from '../packages/demos/src/nms-l02-p051-text-snapshot-v1';
const normalize=(s:string)=>s.replace(/\u00ad/g,'').replace(/\s+/g,' ').trim();
const languages:Record<string,Record<string,string[]>>={};
for(const lang of ['en','es'] as const){
 const ready=p051ModuleFrame(485,{frame:485,frameDomain:'sprite-257',scenario:'practice',lang,seed:0});
 const wrong=p051ModuleFrame(2,{frame:2,frameDomain:'sprite-248',scenario:'wrong-feedback',lang,seed:0});
 const complete=p051ModuleFrame(503,{frame:503,frameDomain:'sprite-257',scenario:'all-correct-outro',lang,seed:0});
 const snapshots={ready:p051TextSnapshot(ready),'selection-1':p051TextSnapshot(ready,{selection:1}),'selection-4':p051TextSnapshot(ready,{selection:4}),column:p051TextSnapshot(ready,{glossary:'column'}),'equivalent-decimal':p051TextSnapshot(ready,{glossary:'equivalent-decimal'}),wrong:p051TextSnapshot(wrong),'wrong-fraction':p051TextSnapshot(wrong,{glossary:'fraction'}),'wrong-equivalent':p051TextSnapshot(wrong,{glossary:'equivalent'}),complete:p051TextSnapshot(complete)};
 languages[lang]=Object.fromEntries(Object.entries(snapshots).map(([key,snapshot])=>[key,snapshot.blocks.filter(b=>b.visible).map(b=>normalize(b.text)).filter(Boolean).sort()]));
}
const inputs=['packages/demos/src/nms-l02-p051-text-snapshot-v1.ts','packages/demos/src/nms-l02-p051-frame-v1.ts','packages/demos/src/nms-l02-p051-practice-v1.ts','packages/demos/src/nms-l02-p051-text-v1.ts','packages/demos/src/generated/nms-l02-p051-glossary-v1.ts','scripts/export-nms-l02-p051-semantic-fixtures-v1.ts'].map(path=>{const b=readFileSync(path);return {path,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};});
console.log(JSON.stringify({kind:'p051-bidirectional-native-text-fixtures',inputs,languages}));
