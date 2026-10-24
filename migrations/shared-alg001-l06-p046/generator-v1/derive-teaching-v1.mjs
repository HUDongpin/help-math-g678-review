import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const raw=fs.readFileSync(new URL('../native-v1/source-model-v1.json',import.meta.url));
const hash=createHash('sha256').update(raw).digest('hex');
assert.equal(hash,'0ab3cce9ece208aae74dd0a8ecc380c2fe1a6c2ea19a4d4ce0cc8ab816f7d682');
const m=JSON.parse(raw);
// Complete words/equations are the semantic companion. Individual animated
// letters remain in the source Canvas drawing and are not repeated as words.
const ids=[94,96,98,100,101,103,107,109,111,113,115,117,119,121];
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
const out=JSON.stringify({kind:'p046-native-teaching-ranges-v1',animationId:m.animationId,sourceModelSha256:hash,texts},null,2)+'\n';
const file=new URL('../native-v1/teaching-bindings-v1.json',import.meta.url);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write')fs.writeFileSync(file,out,{flag:'wx'});
else assert.equal(fs.readFileSync(file,'utf8'),out);
console.log({mode:process.argv[2],textIds:ids,sha256:createHash('sha256').update(out).digest('hex')});
