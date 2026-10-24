import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),audit=path.join(root,'migrations/shared-nms002-l02-p052/audit'),source=path.join(audit,'preserved-source-v1.swf');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),pin=f=>{const b=fs.readFileSync(f);return {path:f,bytes:b.length,sha256:sha(b)};};
assert.equal(pin(source).sha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const out=fs.mkdtempSync('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p052-source-export-');
const calls=[['help',['-help','-export']],['as',['-onerror','abort','-export','script,text,sound,shape',path.join(out,'as'),source]],['pcode',['-onerror','abort','-format','script:pcode','-export','script',path.join(out,'pcode'),source]],['xml',['-swf2xml',source,path.join(out,'source.xml')]]];
const results=[];for(const [name,args]of calls){const r=spawnSync('ffdec',args,{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});const log=path.join(out,name+'.log');fs.writeFileSync(log,(r.stdout||'')+(r.stderr||''),{flag:'wx'});results.push({name,args,exitCode:r.status,log:pin(log)});assert.equal(r.status,0,log);}
const files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())walk(f);else if(e.isFile())files.push(pin(f));else throw Error('nonregular export');}}walk(out);
assert.equal(pin(source).sha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const receipt={animationId:'shared-nms002-l02-p052',tool:'JPEXS FFDec26.2.1',source:pin(source),output:out,results,files,acceptance:'structural exports only; no runtime/fidelity/listening/human/Owner/publication'};
fs.writeFileSync(path.join(audit,'ffdec-export-v1.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({out,files:files.length,receipt:path.join(audit,'ffdec-export-v1.json')}));

