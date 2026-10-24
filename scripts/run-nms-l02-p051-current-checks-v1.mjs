import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=fs.mkdtempSync('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p051-current-checks-');
const names=['audio-access-v1.ts','audio-loader-v1.ts','audio-normalization-v2.ts','clock-v1.ts','frame-v1.ts','glossary-v1.tsx','intro-scene-v1.ts','intro-v1.ts','intro-view-v1.tsx','module-v1.tsx','outro-view-v1.tsx','pcm-v1.ts','practice-v1.ts','practice-view-v1.tsx','runtime-access-v2.ts','semantic-dom-v1.tsx','session-v1.ts','source-bytes-v1.ts','text-snapshot-v1.ts','transport-v1.ts'];
const pin=file=>{const b=fs.readFileSync(file);return {path:file,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};};
const results=[];let cursor=0;
async function worker(){
 while(cursor<names.length){
  const name=names[cursor++],file=path.join(root,'scripts/check-nms-l02-p051-'+name),log=path.join(out,name+'.log'),script=pin(file),started=performance.now();
  const stream=fs.createWriteStream(log,{flags:'wx'}),child=spawn(path.join(root,'node_modules/.bin/tsx'),[file],{cwd:root,stdio:['ignore','pipe','pipe']});
  child.stdout.pipe(stream,{end:false});child.stderr.pipe(stream,{end:false});
  const result=await new Promise(resolve=>{child.once('error',error=>resolve({exitCode:null,error:String(error)}));child.once('close',(exitCode,signal)=>resolve({exitCode,signal}));});
  await new Promise(resolve=>stream.end(resolve));
  const row={script,log:pin(log),...result,elapsedMs:performance.now()-started};results.push(row);console.log(JSON.stringify({script:name,exitCode:row.exitCode}));
 }
}
await Promise.all([worker(),worker(),worker(),worker()]);
results.sort((a,b)=>a.script.path.localeCompare(b.script.path));
const passed=results.length===20&&results.every(r=>r.exitCode===0&&pin(r.script.path).sha256===r.script.sha256);
const report={kind:'p051-current-v7-page-checks',checkedAt:new Date().toISOString(),passed,results,runner:pin(fileURLToPath(import.meta.url)),superseded:'runtime-access-v1 rejects ES; replaced by v2 for declared v7 bilingual runtime'};
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed,checks:results.length,receipt:path.join(out,'results.json')}));if(!passed)process.exitCode=1;
