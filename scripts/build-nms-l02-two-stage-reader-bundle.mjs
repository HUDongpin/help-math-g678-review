#!/usr/bin/env node
/** Compile-only, exact P005 provider/scope transform for a two-stage witness. */
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'output/nms-l02-host-successor-20260927/predecessor');
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=(p,b)=>({path:p,bytes:b.length,sha256:sha(b)});
function demand(v,m){if(!v)throw Error(`NMS_TWO_STAGE_BUNDLE:${m}`);}
function physical(file){const a=lstatSync(file,{bigint:true});demand(a.isFile()&&a.nlink===1n&&realpathSync(file)===file,`physical:${file}`);
  const b=readFileSync(file),c=lstatSync(file,{bigint:true});
  demand(['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'].every(k=>a[k]===c[k]),`stable:${file}`);return b;}
function checked(p){const b=physical(path.resolve(root,p.path));demand(b.length===p.bytes&&sha(b)===p.sha256,`pin:${p.path}`);return b;}
function writeExact(name,bytes){const file=path.join(out,name);demand(file.startsWith(out+path.sep),`output:${name}`);
  mkdirSync(path.dirname(file),{recursive:true});if(existsSync(file))demand(physical(file).equals(bytes),`output-drift:${name}`);
  else writeFileSync(file,bytes,{flag:'wx',mode:0o444});return pin(path.relative(root,file),bytes);}

const original={path:'apps/web/lib/g678-nms-l02-p005.server.ts',bytes:7627,
  sha256:'5a12bf47a21efed1170431d9104bb4b3e1293863d677f79e1196cf6cb4ba3909'};
const entry={path:'apps/web/lib/g678-nms-l02-p052.server.ts',bytes:9011,
  sha256:'848f3f9ea06e61e6c9aff23c368107bfc7000726db440195d4491610e578d1f9'};
const baseWitness={path:'output/nms-l02-host-successor-20260927/predecessor/base-witness-v2/base-witness.json',
  bytes:3744,sha256:'9222705bbee9dd99e9ee6fbd68d1fc4f0326a1e593e4709d9ee7cb5c36ea53d8'};
const priorRelocation={path:'output/nms-l02-host-successor-20260927/predecessor/reader-relocation-v1/manifest.json',
  bytes:1992,sha256:'62af13f952058f6400756a9f6fc89b6c9d77b548b243589a676f422f725995ed'};
checked(entry);checked(baseWitness);checked(priorRelocation);
const helperPath='scripts/read-nms-l02-base-witness.mjs';
const helper=pin(helperPath,physical(path.join(root,helperPath)));
const beforeImport="import {g678PartialCalibrationSnapshot} from './g678-calibration-product-bridge.server';";
const afterImport="import {g678PartialCalibrationSnapshot} from '../../../scripts/read-nms-l02-base-witness.mjs';";
const prior=JSON.parse(checked(priorRelocation));
const beforeScope=prior.exactReplacement.before,afterScope=prior.exactReplacement.after;
const source=checked(original).toString();
demand(source.split(beforeImport).length===2&&source.split(beforeScope).length===2,'exact-two-anchors');
const transformed=Buffer.from(source.replace(beforeImport,afterImport).replace(beforeScope,afterScope));
const transformedPin=writeExact('reader-two-stage-v1/g678-nms-l02-p005.server.ts',transformed);
let replaced=0;
const result=await build({entryPoints:[path.join(root,entry.path)],bundle:true,write:false,platform:'node',format:'esm',target:'node24',
  packages:'external',metafile:true,plugins:[{name:'p005-exact-two-stage',setup(builder){
    builder.onResolve({filter:/^server-only$/},()=>({path:'server-only',namespace:'server-only-empty'}));
    builder.onLoad({filter:/.*/,namespace:'server-only-empty'},()=>({contents:'export {};',loader:'js'}));
    builder.onLoad({filter:/g678-nms-l02-p005\.server\.ts$/},args=>{
      demand(path.resolve(args.path)===path.join(root,original.path),'only-p005-onload');replaced++;
      return {contents:transformed.toString(),loader:'ts',resolveDir:path.dirname(args.path)};
    });
  }}]});
demand(replaced===1&&result.outputFiles.length===1,'single-compiled-reader');
const bundle=writeExact('reader-two-stage-v1/p052-reader-bundle.mjs',Buffer.from(result.outputFiles[0].contents));
const inputs=Object.keys(result.metafile.inputs);
demand(inputs.some(p=>p.endsWith(helperPath))&&!inputs.some(p=>p.endsWith('g678-calibration-product-bridge.server.ts')),
  'adapter-in-base-reader-out');
const manifest={schemaVersion:1,kind:'nms-l02-p005-two-stage-provider-v1',scope:'compile-only-reviewed-two-stage',
  originalReader:original,transformedReader:transformedPin,entry,helper,baseWitness,priorRelocation,
  exactReplacements:[{before:beforeImport,after:afterImport,count:1},{before:beforeScope,after:afterScope,count:1}],
  bundle,inputCount:inputs.length,outputCount:Object.keys(result.metafile.outputs).length,
  claim:'P005 original body and all other chain readers remain byte-identical. Its base provider import now verifies the complete real live 44-descriptor witness and every pinned effective input; its sole absolute-catalog scope exception remains exact path/size/SHA bound. The predecessor chain has not yet been executed with this bundle.'};
const manifestPin=writeExact('reader-two-stage-v1/manifest.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n'));
process.stdout.write(JSON.stringify({manifest:manifestPin,transformedReader:transformedPin,bundle,helper,inputCount:inputs.length})+'\n');
