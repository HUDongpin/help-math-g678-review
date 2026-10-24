import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const raw=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url)),sha256=createHash('sha256').update(raw).digest('hex');
assert.equal(sha256,'5b67c6c758f069a080e300ca3b30db9bdc76eee838fe3c3cde8c38851ae3f1b9');
const m=JSON.parse(raw),partners=[35,33,36,34,37],number=s=>Number(s.replace('–','-'));
const rows=[...m.drags].sort((a,b)=>a.targetOriginPx[1]-b.targetOriginPx[1]).map((drag,i)=>{
 const missing=drag.targetOriginPx[0]<460?'input':'output',givenTextId=partners[i],given=m.texts[givenTextId].text;
 const x=number(missing==='input'?drag.value:given),y=number(missing==='output'?drag.value:given);
 assert(m.graph.points.some(point=>point[0]===x&&point[1]===y));
 return {id:drag.id,missing,given,givenTextId,answer:drag.value,answerTextId:drag.textId,sourceInstance:drag.sourceInstance,targetInstance:drag.targetInstance,acceptedSources:drag.id===1||drag.id===5?[1,5]:[drag.id]};
});
assert.deepEqual(rows.map(r=>r.missing),['output','output','input','output','input']);
const text=id=>({textId:id,text:m.texts[id].text});
const binding={schemaVersion:1,animationId:m.animationId,sourceModelSha256:sha256,sourceSwfSha256:m.assetId.slice(4),question:text(11),inputLabel:text(31),outputLabel:text(32),retry:text(66),bank:[...m.drags].sort((a,b)=>a.sourceOriginPx[1]-b.sourceOriginPx[1]).map(({id,value,textId})=>({id,value,textId})),rows,help:[85,86,87,88].map(text),glossary:m.glossary,graph:m.graph,languagePolicy:'English source content; Spanish UI and exact dictionary definitions are separate',geometryPolicy:'Native source-pair plot and semantic table; original shape identities and positions remain in the source model'};
const out=JSON.stringify(binding,null,2)+'\n',file=new URL('../native-v1/native-bindings-v1.json',import.meta.url);assert(['--write','--check'].includes(process.argv[2]));if(process.argv[2]==='--write')fs.writeFileSync(file,out,{flag:'wx'});else assert.equal(fs.readFileSync(file,'utf8'),out);console.log({rows,sha256:createHash('sha256').update(out).digest('hex')});
