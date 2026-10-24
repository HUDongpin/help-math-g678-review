import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE_RELATIVE='G6-G8-shared/NMS002/L2/GS/L2GS02.swf';
const SOURCE_SHA='f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf';
const SCENE_RELATIVE='migrations/shared-nms002-l02-p053/audit/visual-scene-v1.json';
const SCENE_SHA='b22a2e71c920e425d397a0070338ef9d66e714fff31df8959d9115878fbe8ea7';
const AUDIT_RELATIVE='migrations/shared-nms002-l02-p053/audit/shape-art-v1.json';
const GENERATED_RELATIVE='packages/demos/src/generated/nms-l02-p053-shape-art-v1.ts';
const EXTERNAL_PARENT='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const stableJson=value=>JSON.stringify(value,null,2)+'\n';

// Python's XML parser supplies structural parsing. This allowlist is deliberately
// narrower than SVG; each additional exported element needs a source review.
const INSPECT_SVG=String.raw`
import json,re,sys,xml.etree.ElementTree as ET
SVG='http://www.w3.org/2000/svg'
FFDEC='https://www.free-decompiler.com/flash'
ET.register_namespace('',SVG)
ET.register_namespace('ffdec',FFDEC)
TAGS={'svg','g','path','defs','linearGradient','stop'}
ATTR={
 'svg':{'width','height','{'+FFDEC+'}objectType'},
 'g':{'transform'},
 'path':{'d','fill','fill-opacity','fill-rule','stroke','stroke-linecap','stroke-linejoin','stroke-opacity','stroke-width','{'+FFDEC+'}has-small-stroke','{'+FFDEC+'}original-stroke-width'},
 'defs':set(),
 'linearGradient':{'gradientTransform','gradientUnits','id','spreadMethod','x1','x2'},
 'stop':{'offset','stop-color','stop-opacity'},
}
REF=re.compile(r'^url\(#([A-Za-z_][A-Za-z0-9_.-]*)\)$')
IDENT=re.compile(r'^[A-Za-z_][A-Za-z0-9_.-]*$')
MATRIX=re.compile(r'^matrix\(\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*\)$')
PX=re.compile(r'^([0-9]+(?:\.[0-9]+)?)px$')
def local(tag):
 if tag.startswith('{'+SVG+'}'):return tag[len(SVG)+2:]
 raise ValueError('non-SVG element namespace')
def xml(node):
 return ET.tostring(node,encoding='unicode').replace(' xmlns="'+SVG+'"','',1)
def inspect(row):
 raw=row['svg']
 body=re.sub(r'^\s*<\?xml\s+version=[^?]*\?>','',raw,count=1,flags=re.I)
 if '<!' in body or '<?' in body:raise ValueError('unreviewed XML declaration or markup')
 root=ET.fromstring(raw)
 if local(root.tag)!='svg':raise ValueError('SVG root required')
 for node in root.iter():
  tag=local(node.tag)
  if tag not in TAGS:raise ValueError('disallowed SVG element '+tag)
  if set(node.attrib)-ATTR[tag]:raise ValueError('disallowed SVG attribute on '+tag)
  if node.text and node.text.strip():raise ValueError('SVG text content disallowed')
  if node.tail and node.tail.strip():raise ValueError('SVG tail content disallowed')
  for key,value in node.attrib.items():
   if re.search(r'javascript:|data:|https?:|//',value,re.I):raise ValueError('external or active SVG reference')
   if 'url(' in value and not REF.fullmatch(value):raise ValueError('non-local SVG url')
   if key in ('fill','stroke','stop-color') and not (re.fullmatch(r'#[0-9a-fA-F]{6}',value) or value=='none' or REF.fullmatch(value)):
    raise ValueError('unreviewed SVG paint')
 if root.attrib.get('{'+FFDEC+'}objectType')!='shape':raise ValueError('FFDec shape identity')
 width=PX.fullmatch(root.attrib.get('width',''))
 height=PX.fullmatch(root.attrib.get('height',''))
 if not width or not height:raise ValueError('FFDec crop dimensions')
 groups=[child for child in root if local(child.tag)=='g']
 defs=[child for child in root if local(child.tag)=='defs']
 if len(groups)!=1 or len(defs)>1 or len(groups)+len(defs)!=len(root):raise ValueError('FFDec shape topology')
 matrix=MATRIX.fullmatch(groups[0].attrib.get('transform',''))
 if not matrix:raise ValueError('FFDec crop transform')
 matrix=[float(item) for item in matrix.groups()]
 b=row['boundsTwips']; x=-b['left']/20; y=-b['top']/20
 expected=[1,0,0,1,x,y]
 if any(abs(a-c)>1e-9 for a,c in zip(matrix,expected)):raise ValueError('FFDec crop versus source twips')
 if abs(float(width[1])-(b['right']-b['left'])/20)>1e-9 or abs(float(height[1])-(b['bottom']-b['top'])/20)>1e-9:
  raise ValueError('FFDec dimensions versus source twips')
 prefix='p053-shape-'+str(row['characterId'])+'-'
 ids=set()
 for definition in defs[0] if defs else []:
  if local(definition.tag)!='linearGradient':raise ValueError('unreviewed SVG definition')
  name=definition.attrib.get('id','')
  if not IDENT.fullmatch(name) or name in ids:raise ValueError('duplicate/unsafe gradient ID')
  ids.add(name)
 for node in root.iter():
  for key,value in list(node.attrib.items()):
   if key=='id':node.set(key,prefix+value)
   elif REF.fullmatch(value):
    name=REF.fullmatch(value)[1]
    if name not in ids:raise ValueError('broken local gradient reference')
    node.set(key,'url(#'+prefix+name+')')
 # The inverse crop restores native Flash local coordinates. Shape placement
 # matrices from the display-list IR can then operate in source pixel units.
 wrapper=ET.Element('{'+SVG+'}g',{'id':'p053-shape-'+str(row['characterId']),
  'transform':'translate('+str(b['left']/20)+' '+str(b['top']/20)+')'})
 wrapper.append(groups[0])
 return {'characterId':row['characterId'],'cropPx':{'width':float(width[1]),'height':float(height[1]),
  'matrix':matrix,'inverseTranslation':[b['left']/20,b['top']/20]},
  'defsSvg':''.join(xml(child) for child in defs[0]) if defs else '',
  'symbolSvg':xml(wrapper),'localDefinitionIds':sorted(ids)}
try:
 rows=json.load(sys.stdin)
 print(json.dumps([inspect(row) for row in rows],sort_keys=True,separators=(',',':')))
except Exception as error:
 print(str(error),file=sys.stderr)
 sys.exit(2)
`;

function readPinnedFile(file,expectedSha){
  const before=fs.lstatSync(file,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`real single-link file: ${file}`);
  assert.equal(fs.realpathSync(file),file,`physical input path: ${file}`);
  const bytes=fs.readFileSync(file);
  const after=fs.lstatSync(file,{bigint:true});
  for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])assert.equal(before[key],after[key],`stable file: ${file}`);
  assert.equal(sha(bytes),expectedSha,`source pin: ${file}`);
  return bytes;
}

function sourceScene(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real source root');
  const stat=fs.lstatSync(SOURCE_ROOT);
  assert(stat.isDirectory()&&!stat.isSymbolicLink(),'source root must be a real directory');
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical source root');
  readPinnedFile(path.join(SOURCE_ROOT,SOURCE_RELATIVE),SOURCE_SHA);
  const scene=JSON.parse(readPinnedFile(path.join(ROOT,SCENE_RELATIVE),SCENE_SHA));
  assert.equal(scene.kind,'nms-l02-p053-visual-scene-source-v1');
  assert.equal(scene.animationId,'shared-nms002-l02-p053');
  assert.equal(scene.source.sha256,SOURCE_SHA);
  assert.equal(scene.summary.sourceShapeDefinitions,68);
  assert.equal(scene.summary.placedShapeDefinitions,48);
  const shapes=scene.definitions.shapes;
  assert.equal(shapes.length,48);
  assert.equal(new Set(shapes.map(item=>item.characterId)).size,48);
  for(const shape of shapes){
    assert(Number.isInteger(shape.characterId)&&shape.characterId>0);
    assert(/^[a-f0-9]{64}$/u.test(shape.sourceTagSha256));
    assert(/^[a-f0-9]{64}$/u.test(shape.xmlFragmentSha256));
    for(const key of ['left','right','top','bottom'])assert(Number.isInteger(shape.boundsTwips[key]));
    assert(shape.boundsTwips.left<shape.boundsTwips.right&&shape.boundsTwips.top<shape.boundsTwips.bottom);
  }
  return scene;
}

/** Uses a real XML parser and a reviewed element/attribute/paint allowlist. */
export function inspectP053ShapeSvgs(entries){
  assert(Array.isArray(entries)&&entries.length>0,'shape SVG entries');
  const child=spawnSync('python3',['-c',INSPECT_SVG],{
    input:JSON.stringify(entries),encoding:'utf8',maxBuffer:32*1024*1024,
  });
  assert.equal(child.status,0,child.stderr||child.stdout||'SVG parser failed');
  const result=JSON.parse(child.stdout);
  assert.equal(result.length,entries.length);
  return result;
}

function exportShapes(directory){
  const args=['-format','shape:svg','-export','shape',directory,path.join(SOURCE_ROOT,SOURCE_RELATIVE)];
  const child=spawnSync('ffdec',args,{encoding:'utf8',maxBuffer:8*1024*1024});
  assert.equal(child.status,0,child.stderr||child.stdout||'FFDec failed');
  assert.match(child.stdout+child.stderr,/JPEXS Free Flash Decompiler v\.26\.2\.1/u,'FFDec version');
  const names=fs.readdirSync(directory).sort((a,b)=>Number(a.slice(0,-4))-Number(b.slice(0,-4)));
  assert.equal(names.length,68,'full FFDec shape export count; -select does not filter these outputs');
  assert(names.every(name=>/^[1-9]\d*\.svg$/u.test(name)),'only numeric SVG exports');
  return {args,names};
}

function readExport(directory,shapes){
  return shapes.map(shape=>{
    const file=path.join(directory,`${shape.characterId}.svg`);
    const stat=fs.lstatSync(file);
    assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1,`real SVG: ${file}`);
    const bytes=fs.readFileSync(file);
    return {characterId:shape.characterId,boundsTwips:shape.boundsTwips,
      sourceTagSha256:shape.sourceTagSha256,xmlFragmentSha256:shape.xmlFragmentSha256,
      svg:bytes.toString('utf8'),bytes:bytes.length,sha256:sha(bytes)};
  });
}

function pinAllExports(directory,names){
  return names.map(name=>{
    const file=path.join(directory,name);
    const stat=fs.lstatSync(file);
    assert(stat.isFile()&&!stat.isSymbolicLink()&&stat.nlink===1,`real raw export: ${file}`);
    const bytes=fs.readFileSync(file);
    return {path:name,bytes:bytes.length,sha256:sha(bytes)};
  });
}

export function deriveP053ShapeArt(scene,raw,inspected,{externalExportRoot,exportFiles}){
  assert.equal(scene.definitions.shapes.length,48);
  assert.equal(raw.length,48);assert.equal(inspected.length,48);
  assert.equal(exportFiles.length,68);
  const symbols={};const bounds={};const crops={};const defs=[];const auditShapes=[];
  for(let i=0;i<48;i++){
    const source=scene.definitions.shapes[i],item=raw[i],svg=inspected[i];
    assert.equal(item.characterId,source.characterId);
    assert.equal(svg.characterId,source.characterId);
    assert.deepEqual(item.boundsTwips,source.boundsTwips);
    assert.equal(item.sourceTagSha256,source.sourceTagSha256);
    assert.equal(item.xmlFragmentSha256,source.xmlFragmentSha256);
    const id=String(item.characterId);
    symbols[id]=`p053-shape-${id}`;
    bounds[id]=item.boundsTwips;
    crops[id]=svg.cropPx;
    defs.push(svg.defsSvg,svg.symbolSvg);
    auditShapes.push({characterId:item.characterId,sourceTagSha256:item.sourceTagSha256,
      xmlFragmentSha256:item.xmlFragmentSha256,boundsTwips:item.boundsTwips,
      rawExport:{path:`${id}.svg`,bytes:item.bytes,sha256:item.sha256},
      cropPx:svg.cropPx,localDefinitionIds:svg.localDefinitionIds,symbolId:symbols[id]});
  }
  const defsSvg=`<defs xmlns="http://www.w3.org/2000/svg" xmlns:ffdec="https://www.free-decompiler.com/flash">${defs.join('')}</defs>`;
  const generated=`/** Generated by scripts/build-nms-l02-p053-shape-art-v1.mjs from pinned source SVG. */\n`+
    `export const P053_SHAPE_SOURCE = ${JSON.stringify({animationId:'shared-nms002-l02-p053',
      sourceSwfSha256:SOURCE_SHA,visualSceneSha256:SCENE_SHA,ffdecVersion:'26.2.1',
      coordinateSystem:'source-local-pixels',shapeCount:48})} as const;\n`+
    `export const P053_SHAPE_SYMBOL_IDS = ${JSON.stringify(symbols)} as const;\n`+
    `export const P053_SHAPE_BOUNDS_TWIPS = ${JSON.stringify(bounds)} as const;\n`+
    `export const P053_SHAPE_CROPS_PX = ${JSON.stringify(crops)} as const;\n`+
    `export const P053_SHAPE_DEFS_SVG = ${JSON.stringify(defsSvg)};\n`+
    `export function p053ShapeDefsSvg(namespace:string):string{\n`+
    `  if(!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/u.test(namespace))throw new RangeError('P053 SVG namespace');\n`+
    `  return P053_SHAPE_DEFS_SVG.replace(/id="(p053-shape-[A-Za-z0-9_.-]+)"/gu,(_,id:string)=>\`id="\${namespace}-\${id}"\`)\n`+
    `    .replace(/url\\(#(p053-shape-[A-Za-z0-9_.-]+)\\)/gu,(_,id:string)=>\`url(#\${namespace}-\${id})\`);\n`+
    `}\n`+
    `export function p053ShapeSymbolId(characterId:number,namespace:string):string{\n`+
    `  if(!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/u.test(namespace))throw new RangeError('P053 SVG namespace');\n`+
    `  const id=P053_SHAPE_SYMBOL_IDS[String(characterId) as keyof typeof P053_SHAPE_SYMBOL_IDS];\n`+
    `  if(!id)throw new RangeError('Unknown P053 source shape');\n`+
    `  return \`\${namespace}-\${id}\`;\n`+
    `}\n`+
    `export function namespaceP053ShapeArt(namespace:string):{defsSvg:string;symbolIds:Readonly<Record<number,string>>}{\n`+
    `  const defsSvg=p053ShapeDefsSvg(namespace);\n`+
    `  const symbolIds=Object.fromEntries(Object.keys(P053_SHAPE_SYMBOL_IDS).map(id=>\n`+
    `    [Number(id),p053ShapeSymbolId(Number(id),namespace)])) as Readonly<Record<number,string>>;\n`+
    `  return {defsSvg,symbolIds:Object.freeze(symbolIds)};\n`+
    `}\n`;
  const audit={schemaVersion:1,kind:'nms-l02-p053-shape-art-source-v1',
    animationId:'shared-nms002-l02-p053',
    source:{root:SOURCE_ROOT,relativePath:SOURCE_RELATIVE,bytes:scene.source.bytes,sha256:SOURCE_SHA},
    visualScene:{path:SCENE_RELATIVE,sha256:SCENE_SHA},
    export:{tool:'JPEXS Free Flash Decompiler',version:'26.2.1',
      command:['ffdec','-format','shape:svg','-export','shape','<externalExportRoot>',path.join(SOURCE_ROOT,SOURCE_RELATIVE)],
      externalExportRoot,rawExportedShapeCount:exportFiles.length,consumedShapeCount:48,
      rawFiles:exportFiles,
      selectionBehavior:'FFDec shape export writes all 68 definitions; only 48 source-reachable IDs are consumed',
      unconsumedShapeIds:exportFiles.map(file=>Number(file.path.slice(0,-4))).filter(id=>!symbols[String(id)])},
    shapes:auditShapes,
    generated:{path:GENERATED_RELATIVE,bytes:Buffer.byteLength(generated),sha256:sha(generated)},
    boundary:{sourceShapeArtOnly:true,textConverted:false,bitmapConverted:false,
      displayListRendered:false,maskSemanticsRendered:false,childClocksSynchronized:false,
      originalRuntimeAccepted:false,fidelityAccepted:false,currentJsRegistered:false}};
  return {audit,generated};
}

function assertExternalPins(audit){
  const stat=fs.lstatSync(audit.export.externalExportRoot);
  assert(stat.isDirectory()&&!stat.isSymbolicLink(),'retained external export directory');
  assert(audit.export.externalExportRoot.startsWith(EXTERNAL_PARENT+path.sep),'external source artifact boundary');
  const names=fs.readdirSync(audit.export.externalExportRoot);
  assert.equal(names.length,68,'retained raw export membership');
  assert.deepEqual(names.sort(),audit.export.rawFiles.map(file=>file.path).sort(),'retained raw export names');
  for(const file of audit.export.rawFiles){
    const bytes=readPinnedFile(path.join(audit.export.externalExportRoot,file.path),file.sha256);
    assert.equal(bytes.length,file.bytes);
  }
  for(const shape of audit.shapes){
    assert.equal(shape.rawExport.path,`${shape.characterId}.svg`);
    const bytes=readPinnedFile(path.join(audit.export.externalExportRoot,shape.rawExport.path),shape.rawExport.sha256);
    assert.equal(bytes.length,shape.rawExport.bytes);
  }
}

export function runP053ShapeArt(mode){
  assert(mode==='--prepare'||mode==='--check','usage: --prepare or --check');
  const scene=sourceScene();
  const generatedFile=path.join(ROOT,GENERATED_RELATIVE),auditFile=path.join(ROOT,AUDIT_RELATIVE);
  if(mode==='--prepare'){
    assert(!fs.existsSync(generatedFile)&&!fs.existsSync(auditFile),'exclusive prepare refuses existing output');
  }
  const existing=mode==='--check'?JSON.parse(fs.readFileSync(auditFile,'utf8')):null;
  if(existing){
    assert.equal(existing.kind,'nms-l02-p053-shape-art-source-v1');
    assertExternalPins(existing);
  }
  const scratch=fs.mkdtempSync(path.join(EXTERNAL_PARENT,'p053-shape-art-v1-'));
  let keepScratch=mode==='--prepare';
  try{
    const exported=exportShapes(scratch);
    const exportFiles=pinAllExports(scratch,exported.names);
    const raw=readExport(scratch,scene.definitions.shapes);
    const inspected=inspectP053ShapeSvgs(raw.map(({characterId,boundsTwips,svg})=>({characterId,boundsTwips,svg})));
    const rendered=deriveP053ShapeArt(scene,raw,inspected,{externalExportRoot:existing?.export.externalExportRoot??scratch,exportFiles});
    if(existing){
      assert.equal(fs.readFileSync(generatedFile,'utf8'),rendered.generated,'generated bytes drift');
      assert.equal(fs.readFileSync(auditFile,'utf8'),stableJson(rendered.audit),'audit bytes drift');
      for(let i=0;i<raw.length;i++)assert.equal(raw[i].sha256,existing.shapes[i].rawExport.sha256,'fresh FFDec export drift');
    }else{
      fs.mkdirSync(path.dirname(generatedFile),{recursive:true});
      fs.writeFileSync(generatedFile,rendered.generated,{flag:'wx'});
      fs.writeFileSync(auditFile,stableJson(rendered.audit),{flag:'wx'});
    }
    return {status:'PASS',mode,animationId:rendered.audit.animationId,shapes:rendered.audit.shapes.length,
      rawExported:exported.names.length,generatedSha256:rendered.audit.generated.sha256};
  }finally{
    if(!keepScratch)fs.rmSync(scratch,{recursive:true,force:true});
  }
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{console.log(stableJson(runP053ShapeArt(process.argv[2])));}
  catch(error){console.error(error);process.exitCode=1;}
}
