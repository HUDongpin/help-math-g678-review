#!/usr/bin/env node
/** Compile-only proof reader relocation for one absolute frozen catalog pin. */
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'output/nms-l02-host-successor-20260927/predecessor');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(p,bytes)=>({path:p,bytes:bytes.length,sha256:sha(bytes)});
function demand(ok,label){if(!ok)throw Error(`NMS_READER_RELOCATION:${label}`);}
function physical(file){
  const before=lstatSync(file,{bigint:true});
  demand(before.isFile()&&before.nlink===1n&&realpathSync(file)===file,`physical:${file}`);
  const bytes=readFileSync(file),after=lstatSync(file,{bigint:true});
  demand(['dev','ino','size','mtimeNs','mode','nlink'].every(k=>before[k]===after[k]),`stable:${file}`);
  return bytes;
}
function writeExact(rel,bytes){
  const file=path.join(out,rel);demand(file.startsWith(`${out}${path.sep}`),`output:${rel}`);
  mkdirSync(path.dirname(file),{recursive:true});
  if(existsSync(file))demand(physical(file).equals(bytes),`output-drift:${rel}`);
  else writeFileSync(file,bytes,{flag:'wx',mode:0o444});
  return pin(path.relative(root,file),bytes);
}
const originalPath='apps/web/lib/g678-nms-l02-p005.server.ts';
const originalPin={path:originalPath,bytes:7627,sha256:'5a12bf47a21efed1170431d9104bb4b3e1293863d677f79e1196cf6cb4ba3909'};
const originalBytes=physical(path.join(root,originalPath));
demand(originalBytes.length===originalPin.bytes&&sha(originalBytes)===originalPin.sha256,'original-p005-pin');
const catalogPin={path:'/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/catalog/g678-shared-catalog.v1.json',bytes:12534064,sha256:'a1692c2a86c6771dcb104f59195b5bfdd2b5281cceff0aaeb63a3aabcf4a5657'};
const catalogBytes=physical(catalogPin.path);
demand(catalogBytes.length===catalogPin.bytes&&sha(catalogBytes)===catalogPin.sha256,'absolute-catalog-pin');
const before="demand(anchors.some(anchor => file.startsWith(`${anchor}${path.sep}`)) && realpathSync(file) === file, 'physical input path');";
const after="demand((anchors.some(anchor => file.startsWith(`${anchor}${path.sep}`)) || (file === '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/catalog/g678-shared-catalog.v1.json' && pin.bytes === 12534064 && pin.sha256 === 'a1692c2a86c6771dcb104f59195b5bfdd2b5281cceff0aaeb63a3aabcf4a5657')) && realpathSync(file) === file, 'physical input path');";
const source=originalBytes.toString();
demand(source.split(before).length===2&&!source.includes(after),'single-scope-anchor');
const transformed=Buffer.from(source.replace(before,after));
const transformedPin=writeExact('reader-relocation-v1/g678-nms-l02-p005.server.ts',transformed);
const entry=path.join(root,'apps/web/lib/g678-nms-l02-p052.server.ts');
let replacementCount=0;
const bundle=await build({entryPoints:[entry],bundle:true,write:false,platform:'node',format:'esm',target:'node24',packages:'external',metafile:true,
  plugins:[{name:'p005-one-file-relocation',setup(builder){
    builder.onResolve({filter:/^server-only$/},()=>({path:'server-only',namespace:'server-only-empty'}));
    builder.onLoad({filter:/.*/,namespace:'server-only-empty'},()=>({contents:'export {};',loader:'js'}));
    builder.onLoad({filter:/g678-nms-l02-p005\.server\.ts$/},args=>{
      demand(path.resolve(args.path)===path.join(root,originalPath),'only-p005-onload');
      replacementCount++;
      return {contents:transformed.toString(),loader:'ts',resolveDir:path.dirname(args.path)};
    });
  }}]});
demand(replacementCount===1&&bundle.outputFiles.length===1,'bundle-single-replacement');
const bundleBytes=Buffer.from(bundle.outputFiles[0].contents);
const bundlePin=writeExact('reader-relocation-v1/p052-reader-bundle.mjs',bundleBytes);
const manifest={schemaVersion:1,kind:'nms-l02-p005-single-file-relocation-v1',scope:'physical-isolated-copy-reviewed-path-relocation',originalReader:originalPin,transformedReader:transformedPin,absoluteCatalog:catalogPin,exactReplacement:{before,after,count:replacementCount},bundle:bundlePin,entry:{path:'apps/web/lib/g678-nms-l02-p052.server.ts',bytes:9011,sha256:'848f3f9ea06e61e6c9aff23c368107bfc7000726db440195d4491610e578d1f9'},inputCount:Object.keys(bundle.metafile.inputs).length,outputCount:Object.keys(bundle.metafile.outputs).length,claim:'Only P005 source-scope admission of the single already-pinned absolute catalog file changes; ordinary-file, realpath, nlink, stable-stat, byte-size and SHA checks remain compiled.'};
const manifestPin=writeExact('reader-relocation-v1/manifest.json',Buffer.from(`${JSON.stringify(manifest,null,2)}\n`));
process.stdout.write(`${JSON.stringify({manifest:manifestPin,transformedReader:transformedPin,bundle:bundlePin,inputCount:manifest.inputCount})}\n`);
