import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),web=path.join(root,'apps/web');
const evidence='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const link=path.join(web,'.next-local-reference-diagnostic');
assert.ok(fs.lstatSync(link).isSymbolicLink());const prior=fs.readlinkSync(link);
assert.equal(prior,path.join(evidence,'continuation544-production-build-v2'));
assert.equal(process.env.VERCEL_ENV,undefined);
const run=fs.mkdtempSync(path.join(evidence,'p052-production-build-')),build=path.join(run,'build');fs.mkdirSync(build);
const backup=link+'.'+path.basename(run)+'-prior',retained=link+'.'+path.basename(run)+'-result';
const pin=file=>{const b=fs.readFileSync(file);return {bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
const frozen=path.join(root,'catalog/product-bridge-calibrations/g678-nms-l02-p051-native-fraction-match-current-js-v1-compile-v8.json');
const report={kind:'p052-production-build',run,build,startedAt:new Date().toISOString(),prior,p051Before:pin(frozen),providerAccess:false,status:'RUNNING'};
try{
 fs.renameSync(link,backup);fs.symlinkSync(build,link);
 const log=fs.createWriteStream(path.join(run,'build.log'),{flags:'wx'});
 const child=spawn('npm',['run','build'],{cwd:web,env:{...process.env,NODE_ENV:'production',NODE_OPTIONS:'--max-old-space-size=8192',HELP_MATH_LOCAL_REFERENCE_DIAGNOSTIC:'1'},stdio:['ignore','pipe','pipe']});
 for(const stream of [child.stdout,child.stderr])stream.on('data',b=>{log.write(b);process.stdout.write(b);});
 console.log(JSON.stringify({run,status:'BUILDING',pid:child.pid}));
 report.exit=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',(code,signal)=>{log.end();resolve({code,signal});});});
 assert.equal(report.exit.code,0);assert.deepEqual(pin(frozen),report.p051Before);
 const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile()&&p.endsWith('.js'))files.push(p);}}walk(path.join(build,'static'));
 const markers=['5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638','P052_AUDIO_HASH','data-p052-player-phase','p052-intro-plane'];
 report.payloadHits=[];for(const file of files){const text=fs.readFileSync(file,'utf8');for(const marker of markers)if(text.includes(marker))report.payloadHits.push({file:path.relative(build,file),marker});}
 assert.ok(files.length>0);report.staticJsFiles=files.length;assert.equal(report.payloadHits.length,0);
 report.buildId=fs.readFileSync(path.join(build,'BUILD_ID'),'utf8').trim();report.status='PASS';
}catch(error){report.status='FAIL';report.error=String(error);process.exitCode=1;}
finally{
 if(fs.existsSync(backup)){assert.ok(fs.lstatSync(link).isSymbolicLink());assert.equal(fs.readlinkSync(link),build);fs.renameSync(link,retained);fs.renameSync(backup,link);}
 report.pointerRestored=fs.readlinkSync(link)===prior;report.finishedAt=new Date().toISOString();
 fs.writeFileSync(path.join(run,'receipt.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));
}
