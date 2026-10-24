import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const raw=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url));
const hash=createHash('sha256').update(raw).digest('hex');
assert.equal(hash,'5b67c6c758f069a080e300ca3b30db9bdc76eee838fe3c3cde8c38851ae3f1b9');
const m=JSON.parse(raw);
// Complete words/equations are the semantic companion. Individual animated
// letters remain in the source Canvas drawing and are not repeated as words.
const ids=[96,97,98,99,100,101,102,103,104,105,107,108,109,110,111,112,113,114,115,116];
const texts=ids.map(textId=>{
  const instances=m.mainTextInstances.filter(row=>row.objectId===textId);
  assert(instances.length>0);
  const frames=new Set();
  for(const instance of instances)for(const run of instance.runs){
    const color=run.color;
    if(color && color.factor.Alpha===0 && color.offset.Alpha===0)continue;
    for(let f=run.firstFrame;f<=run.lastFrame;f++)frames.add(f);
  }
  const ranges=[];
  for(const frame of [...frames].sort((a,b)=>a-b)){
    if(ranges.length && ranges.at(-1)[1]===frame-1)ranges.at(-1)[1]=frame;
    else ranges.push([frame,frame]);
  }
  assert(ranges.length>0);
  return {textId,text:m.texts[textId].text,ranges};
});
const out=JSON.stringify({kind:'p047-native-teaching-ranges-v1',animationId:m.animationId,sourceModelSha256:hash,texts},null,2)+'\n';
const file=new URL('../native-v1/teaching-bindings-v1.json',import.meta.url);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write')fs.writeFileSync(file,out,{flag:'wx'});
else assert.equal(fs.readFileSync(file,'utf8'),out);
console.log({mode:process.argv[2],textIds:ids,sha256:createHash('sha256').update(out).digest('hex')});
