import fs from'node:fs';import crypto from'node:crypto';import assert from'node:assert/strict';
const B='migrations/shared-alg001-l07-p007',sha=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>fs.readFileSync(p,'utf8');
const model=JSON.parse(read(B+'/native-v1/source-model-v1.json')),catalog=JSON.parse(read(B+'/source-v1/source-text-catalog-v1.json')),stream=JSON.parse(read(B+'/native-v1/streams-v1.json')),decode=JSON.parse(read(B+'/native-v1/decode-native-v1.json'));
const main=model.timelines.find(t=>t.timelineId==='sprite-228'),html=read(B+'/source-v1/ffdec-child-canvas/DefineSprite_228/frames.html');
assert.equal(sha(fs.readFileSync(B+'/source-v1/L7VB02.swf')),model.source.sha256);assert(decode.pass&&decode.streams.length===8);
const alpha=p=>p?Math.max(0,Math.min(1,(p.colorTransform?.multiply?.[3]??256)/256+(p.colorTransform?.add?.[3]??0)/255)):0;
const transform=(p,x,y)=>[p.matrix[0]*x+p.matrix[2]*y+p.matrix[4],p.matrix[1]*x+p.matrix[3]*y+p.matrix[5]];
const box=(bounds,p)=>{const q=[transform(p,bounds.left,bounds.top),transform(p,bounds.right,bounds.top),transform(p,bounds.left,bounds.bottom),transform(p,bounds.right,bounds.bottom)];return[Math.min(...q.map(x=>x[0])),Math.max(...q.map(x=>x[0])),Math.min(...q.map(x=>x[1])),Math.max(...q.map(x=>x[1]))];};
const inside=(b,c)=>b[0]>=c[0]&&b[1]<=c[1]&&b[2]>=c[2]&&b[3]<=c[3];
function prefix(row,id){const p=row.find(x=>x.characterId===id),text=model.texts.find(t=>t.characterId===id);if(!p||alpha(p)===0)return'';
 const masks=row.filter(x=>x.clipDepth&&x.depth<p.depth&&x.clipDepth>=p.depth);assert(masks.every(m=>m.characterId===10));
 const clip=masks.reduce((b,m)=>{const c=box({left:-4341,right:6181,top:-281,bottom:282},m);return[Math.max(b[0],c[0]),Math.min(b[1],c[1]),Math.max(b[2],c[2]),Math.min(b[3],c[3])];},[-Infinity,Infinity,-Infinity,Infinity]);
 let out='',x=0;outer:for(const r of text.runs){if(r.xOffsetTwips!==null)x=r.xOffsetTwips;for(const g of r.glyphs){const next=x+g.advanceTwips;if(!inside(box({left:x,right:next,top:text.boundsTwips.top,bottom:text.boundsTwips.bottom},p),clip))break outer;out+=g.unicode;x=next;}}
 if(out!==text.text&&!/\s/u.test(text.text[out.length]??''))out=out.includes(' ')?out.replace(/\s+\S*$/u,'').trimEnd():'';return out.trimEnd();}
function paths(id){const f=html.match(new RegExp('function shape'+id+'\\(.*?(?=\\nfunction )','s'))?.[0];assert(f);return f.split('var pathData=').slice(1).map((p,i)=>{const d=p.match(/^"([^"]*)"/)[1],c=p.match(/ctx\.(strokeStyle|fillStyle)=tocolor\(ctrans.apply\((\[[^\]]+\])/);if(!c)return null;const color=JSON.parse(c[2]);return{sourceShapeId:id,sourcePathIndex:i,d,paint:c[1]==='fillStyle'?'fill':'stroke',color:`rgb(${color.slice(0,3).join(',')})`,alpha:color[3],width:Number(p.match(/ctx.lineWidth=([\d.]+)/)?.[1]??0),sourceFunctionSha256:sha(f)};});}
const graphSpec=[{answer:1,letter:'A',letterId:35,grid:33,curve:34,depth:76,labels:[77,90],bounds:[-4397,-2792,2555,2555],matrix:[-420,470]},
 {answer:2,letter:'B',letterId:38,grid:36,curve:37,depth:104,labels:[105,118],bounds:[-1093,-1057,2555,2555],matrix:[-3725,2205]},
 {answer:3,letter:'C',letterId:32,grid:19,curve:28,depth:20,labels:[21,34],bounds:[2221,-2792,2555,2555],matrix:[-420,470]},
 {answer:4,letter:'D',letterId:30,grid:28,curve:29,depth:40,labels:[41,54],bounds:[2222,678,2555,2555],matrix:[-420,470]}];
const graphs=graphSpec.map(g=>{const row=main.frames[108],labels=row.filter(p=>p.depth>=g.labels[0]&&p.depth<=g.labels[1]).map(p=>{const text=model.texts.find(t=>t.characterId===p.characterId);assert(text);const b=box(text.boundsTwips,p);return{sourceTextId:text.sourceTextId,instanceId:p.instanceId,text:text.text,x:(b[0]+b[1])/2-g.matrix[0],y:(b[2]+b[3])/2-g.matrix[1]};});assert.equal(labels.length,14);
 const gridPaths=paths(g.grid).slice(g.letter==='D'?2:0);assert(gridPaths.every(Boolean));const curvePaths=paths(g.curve).slice(0,g.letter==='C'?2:1);assert(curvePaths.every(Boolean));
 return {...g,sourcePaths:[...gridPaths,...curvePaths],labels,viewBox:[g.bounds[0]-500,g.bounds[1]-500,g.bounds[2]+1000,g.bounds[3]+1000]};});
const spans=values=>{const out=[];values.forEach((value,i)=>{if(out.length&&JSON.stringify(out.at(-1).value)===JSON.stringify(value))out.at(-1).last=i+1;else out.push({first:i+1,last:i+1,value});});return out;};
const states=main.frames.map((row,i)=>{const definition=prefix(row,12),question=prefix(row,18);return{definition,question,
 graphAlpha:Object.fromEntries(graphs.map(g=>[g.letter,alpha(row.find(p=>p.depth===g.depth))])),
 bMove:row.some(p=>p.characterId===36)?(2205-row.find(p=>p.characterId===36).matrix[5])/3460:0,
 blueLine:row.find(p=>p.characterId===225)?(row.find(p=>p.characterId===225).ratio??0)/65535:row.some(p=>p.characterId===227)?1:null,
 redEmphasis:row.some(p=>p.characterId===226),terms:model.glossary.filter(g=>definition.toLowerCase().includes(g.term.toLowerCase())&&g.frameRanges.some(([a,z])=>i+1>=a&&i+1<=z)).map(g=>g.term)};});
// Dynamic wrong text is assigned by the containing popup; the Close button is nested one level deeper.
const branches=model.branches.map(b=>{const timeline=model.timelines.find(t=>t.timelineId==='sprite-'+b.spriteId),child={67:66,98:89,119:118}[b.spriteId];
 const closeFirst=child?timeline.frames.findIndex(r=>r.some(p=>p.characterId===child))+1:undefined;if(child)assert(closeFirst>0&&closeFirst<b.hold);
 const tids=[...new Set(timeline.frames.flatMap(r=>r.map(p=>p.characterId)))].filter(id=>model.texts.some(t=>t.characterId===id&&t.runs));
 const title=model.texts.find(t=>t.characterId===tids[0])?.text;assert(title&&tids.every(id=>model.texts.find(t=>t.characterId===id).text===title));
 // Native feedback retains the authored visible title window. Source duplicate shadows share one semantic heading.
 const y=main.frames[108].find(p=>p.name?.text===`Mc_${b.kind==='wrong'?'Wrong':'Right'}_Feed${b.index}`).matrix[5];
 const visible=timeline.frames.map(row=>{let a=0;for(const p of row.filter(p=>tids.includes(p.characterId))){const text=model.texts.find(t=>t.characterId===p.characterId),q=box(text.boundsTwips,p);if(q[1]+8348>0&&q[0]+8348<16000&&q[3]+5666+y>0&&q[2]+5666+y<12000)a=Math.max(a,alpha(p));}return a;});
 return{...b,closeFirst,title,titleIds:tids,titleAlpha:spans(visible),closeRanges:child?[[closeFirst,b.hold]]:undefined};});
const clocks=stream.map(s=>{const d=decode.streams.find(d=>d.spriteId===s.spriteId);assert(d.contextClosed&&d.sourceSha256===s.sourceSha256&&d.decodedSamples===s.decodedSamplesCandidate);return{spriteId:s.spriteId,sourceFrameCount:s.frameCount,decoder:Object.fromEntries(['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256'].map(k=>[k,d[k]])),segments:s.segments};});
const glossary=JSON.parse(read(B+'/native-v1/glossary-model-v1.json')),sa=JSON.parse(read(B+'/native-v1/sa-native-v1.json'));
assert(sa.decoder.contextClosed&&sa.decoder.sourceSha256===sa.source.sha256);
const native={title:'Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId:8,titleSvgSha256:sha(read(B+'/source-v1/title-svg/8.svg')),terms:glossary.entries,sa:Object.fromEntries(['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256'].map(k=>[k,sa.decoder[k]])),animationId:model.animationId,sourceSha256:model.source.sha256,fps:12,mainSpriteId:228,mainFrameCount:173,quizFrame:109,correctAnswer:2,answerCharacters:model.answerCharacters,behavior:model.behavior,graphs,branches,visualStates:spans(states),clocks,
 sourceAxisNote:'All upper vertical labels are literally -6 -4 -2 in the shipped SWF. Exact authored strings retained; no mathematical correction inferred.',
 graphEmphasis:{red:paths(226),blueStart:[-4753,-1634,-4730,-1621],blueEnd:[-4753,-1634,-2317,-206],bPostMatrix:[-3725,-1255]},
 independentPending:['original-runtime','fidelity','listening','human','Owner','strict','publication']};
const source='// Generated by migrations/shared-alg001-l07-p007/generator-v1/derive-native-v1.mjs; do not edit.\nexport const ALG_L07_P007_SOURCE = '+JSON.stringify(native)+' as const;\n';
const put=(p,s)=>{if(process.argv.includes('--check'))assert.equal(read(p),s);else fs.writeFileSync(p,s);};put('packages/demos/src/alg-l07-p007-source-v1.ts',source);
const receipt={sourceSha256:model.source.sha256,sourceCatalogContentSha256:sha(JSON.stringify(catalog)),rawCanvasSha256:sha(html),productSha256:sha(source),branches,visualStates:native.visualStates,axisLabels:native.sourceAxisNote,visibilityScope:'source static masks and authored glyph advances; complete words in native reflow; source original appearance pending',graphScope:'exact source grid and curve paths, native glyph-free plots, unchanged numeric signs; source fade and B-to-A move progress retained',mainShapes:[...new Set(graphs.flatMap(g=>g.sourcePaths.map(p=>p.sourceShapeId)))],title:'Outlined source shape8 visually inspected: Linear and Nonlinear Functions: Vocabulary; catalog placement label Linear Function remains separate'};
put(B+'/native-v1/native-derivation-v1.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({pass:true,visualSpans:native.visualStates.length,branches:branches.map(b=>({id:b.spriteId,closeFirst:b.closeFirst,title:b.title})),productBytes:Buffer.byteLength(source),firstFullDefinition:states.findIndex(s=>s.definition===model.texts.find(t=>t.characterId===12).text.trim())+1,firstFullQuestion:states.findIndex(s=>s.question===model.texts.find(t=>t.characterId===18).text)+1}));
