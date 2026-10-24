import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {inspectP053ShapeSvgs} from './build-nms-l02-p053-shape-art-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const fixture=`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:ffdec="https://www.free-decompiler.com/flash" ffdec:objectType="shape" width="2.0px" height="3.0px"><g transform="matrix(1.0, 0.0, 0.0, 1.0, 1.0, 1.5)"><path d="M0 0 L1 1" fill="url(#gradient0)" stroke="none"/></g><defs><linearGradient id="gradient0" x1="0" x2="1"><stop offset="0.0" stop-color="#ffffff"/></linearGradient></defs></svg>`;
const entry=svg=>({characterId:2,boundsTwips:{left:-20,right:20,top:-30,bottom:30},svg});

test('restores source-local origin and names all gradient references by character',()=>{
  const [result]=inspectP053ShapeSvgs([entry(fixture)]);
  assert.deepEqual(result.cropPx,{width:2,height:3,matrix:[1,0,0,1,1,1.5],inverseTranslation:[-1,-1.5]});
  assert.match(result.symbolSvg,/id="p053-shape-2" transform="translate\(-1(?:\.0)? -1\.5\)"/u);
  assert.match(result.symbolSvg,/url\(#p053-shape-2-gradient0\)/u);
  assert.match(result.defsSvg,/id="p053-shape-2-gradient0"/u);
  assert.deepEqual(result.localDefinitionIds,['gradient0']);
});

test('rejects active elements, external/event references, broken local refs and crop drift',()=>{
  const violations=[
    fixture.replace('<g transform=', '<script/><g transform='),
    fixture.replace('<g transform=', '<foreignObject/><g transform='),
    fixture.replace('<path d=', '<path onload="alert(1)" d='),
    fixture.replace('url(#gradient0)','url(https://example.com/paint)'),
    fixture.replace('url(#gradient0)','url(#missing)'),
    fixture.replace('1.0, 1.5)', '2.0, 1.5)'),
    fixture.replace('<g transform=', '<!DOCTYPE svg><g transform='),
    fixture.replace('<g transform=', '<!-- ignored by some parsers --><g transform='),
  ];
  for(const svg of violations)assert.throws(()=>inspectP053ShapeSvgs([entry(svg)]));
});

test('actual generated shape art is reproducible from physical source and retained export pins',()=>{
  const result=spawnSync(process.execPath,['scripts/build-nms-l02-p053-shape-art-v1.mjs','--check'],{
    cwd:ROOT,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:SOURCE_ROOT},encoding:'utf8',maxBuffer:1024*1024,
  });
  assert.equal(result.status,0,result.stderr||result.stdout);
  const receipt=JSON.parse(result.stdout);
  assert.equal(receipt.status,'PASS');
  assert.equal(receipt.shapes,48);
  assert.equal(receipt.rawExported,68);
  const audit=JSON.parse(fs.readFileSync(path.join(ROOT,'migrations/shared-nms002-l02-p053/audit/shape-art-v1.json'),'utf8'));
  assert.equal(audit.shapes.length,48);
  assert.equal(audit.export.unconsumedShapeIds.length,20);
  assert.equal(audit.export.rawFiles.length,68);
  assert.equal(audit.boundary.currentJsRegistered,false);
});

test('generated SVG supports two collision-free mounts and resolves every local paint reference',()=>{
  const code=`import {namespaceP053ShapeArt,p053ShapeDefsSvg,p053ShapeSymbolId} from './packages/demos/src/generated/nms-l02-p053-shape-art-v1.ts';
    const first=namespaceP053ShapeArt('StageA'),second=namespaceP053ShapeArt('StageB');
    const a=first.defsSvg,b=second.defsSvg;
    if(!a.includes('id="StageA-p053-shape-2"')||!b.includes('id="StageB-p053-shape-2"'))throw Error('symbol namespace');
    if(Object.keys(first.symbolIds).length!==48||first.symbolIds[2]!=='StageA-p053-shape-2')throw Error('symbol map');
    if(p053ShapeSymbolId(2,'StageB')!=='StageB-p053-shape-2')throw Error('use identity');
    for(const invalid of ['','-bad','a\" onload=\"x']){
      try{p053ShapeDefsSvg(invalid);throw Error('accepted invalid namespace');}
      catch(error){if(!(error instanceof RangeError))throw error;}
    }
    console.log(JSON.stringify({a,b}));`;
  const result=spawnSync(process.execPath,['--import','tsx','--input-type=module','-e',code],{
    cwd:ROOT,encoding:'utf8',maxBuffer:1024*1024,
  });
  assert.equal(result.status,0,result.stderr||result.stdout);
  const {a,b}=JSON.parse(result.stdout);
  const parse=`import sys,json,re,xml.etree.ElementTree as E
rows=json.load(sys.stdin)
sets=[]
for data in (rows['a'],rows['b']):
 root=E.fromstring(data)
 ids=[item.get('id') for item in root.iter() if item.get('id')]
 refs=[value[5:-1] for item in root.iter() for value in item.attrib.values() if value.startswith('url(#')]
 assert len(ids)==len(set(ids))==74
 assert len(refs)==26 and set(refs)<=set(ids)
 sets.append(set(ids))
assert not sets[0]&sets[1]`;
  const parsed=spawnSync('python3',['-c',parse],{input:result.stdout,encoding:'utf8'});
  assert.equal(parsed.status,0,parsed.stderr||parsed.stdout);
});

test('exclusive prepare refuses to overwrite generated or audit bytes',()=>{
  const result=spawnSync(process.execPath,['scripts/build-nms-l02-p053-shape-art-v1.mjs','--prepare'],{
    cwd:ROOT,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:SOURCE_ROOT},encoding:'utf8',maxBuffer:1024*1024,
  });
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/exclusive prepare refuses existing output/u);
});
