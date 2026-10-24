#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPin,pinFile,sha256} from '../lib/g678-admission-proof.mjs';
import {resolveSourceGlossary} from './build-g678-alg-l11-instructional-successor-glossary.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const pins={en:{path:'L1KTE01.xml',bytes:345838,sha256:'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b'},
 es:{path:'L1KTS01.xml',bytes:344456,sha256:'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407'}};
const keys=['Set','Ordered pair','Function','X-coordinate'];
const planPin=pinFile(root,'migrations/shared-alg001-l06-p032/audit/source-planning-v1/source-plan-v1.json');
assert.equal(planPin.sha256,'593976a049450ddb17d0b344f8877ffe110c312c5324a3527358c62538f92d26');
const plan=JSON.parse(readPin(root,planPin));
assert.deepEqual(plan.actions.glossary.map(g=>g.keyAttribute),keys);
const sources=Object.fromEntries(['en','es'].map(lang=>[lang,{assetId:lang==='en'?'G678L1KTE01.xml':'G678L1KTS01.xml',
 path:lang==='en'?'HELP_KEYTERMS/KT/XML/L1KTE01.xml':'HELP_KEYTERMS/KT/XML/L1KTS01.xml',sha256:pins[lang].sha256}]));
const entries=resolveSourceGlossary(Object.fromEntries(['en','es'].map(lang=>[lang,readPin(sourceRoot,pins[lang]).toString('utf8')])),keys,sources);
const added=entries.find(entry=>entry.id==='x-coordinate');assert(added&&added.sourceKeyAttribute==='X-coordinate');
const packet={schemaVersion:1,kind:'alg-l06-p032-four-glossary-source-crosswalk-v1',animationId:'shared-alg001-l06-p032',
 sourcePlan:planPin,parser:pinFile(root,'scripts/build-g678-alg-l11-instructional-successor-glossary.mjs'),
 external:Object.values(pins).map(pin=>({root:sourceRoot,pin})),entries,
 addedEntry:added,definitionOnly:true,extraExampleRendererRequired:false,
 originalClickObserved:false,sourceAlignmentAccepted:false};
const bytes=Buffer.from(JSON.stringify(packet,null,2)+'\n'),file='migrations/shared-alg001-l06-p032/glossary-v1/four-key-crosswalk-v1.json';
const mode=process.argv[2];assert(['--write','--check'].includes(mode));
if(mode==='--write'){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});
 if(fs.existsSync(path.join(root,file)))assert.equal(fs.readFileSync(path.join(root,file)).toString(),bytes.toString(),'existing canonical crosswalk drift');
 else fs.writeFileSync(path.join(root,file),bytes,{flag:'wx'});
}else assert.equal(fs.readFileSync(path.join(root,file)).toString(),bytes.toString(),'canonical crosswalk drift');
console.log(JSON.stringify({mode,entries:entries.length,addedId:added.id,pin:{path:file,bytes:bytes.length,sha256:sha256(bytes)},registered:false}));
