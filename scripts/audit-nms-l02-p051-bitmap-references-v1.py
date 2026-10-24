from pathlib import Path
import json,struct,zlib,hashlib
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p051/audit';raw=(A/'source-input.swf').read_bytes();source=json.loads((A/'structural-intake-v1.json').read_text());assert hashlib.sha256(raw).hexdigest()==source['sourceSha256'];data=raw[:8]+zlib.decompress(raw[8:])
def skip_rect(pos):return pos+(5+4*(data[pos]>>3)+7)//8
def skip_matrix(pos):
 bit=pos*8
 def read(n):
  nonlocal bit
  value=0
  for _ in range(n):value=value*2+((data[bit//8]>>(7-bit%8))&1);bit+=1
  return value
 if read(1):read(2*read(5))
 if read(1):read(2*read(5))
 read(2*read(5));return (bit+7)//8
refs=[];sentinels=[];skippedMorphs=[]
for shape in source['shapeDefinitions']:
 pos=shape['sourceTagOffset'];header=struct.unpack_from('<H',data,pos)[0];pos+=2;code=header>>6;length=header&63
 if length==63:length=struct.unpack_from('<I',data,pos)[0];pos+=4
 if code not in [2,22,32,83]:skippedMorphs.append(shape['characterId']);continue
 assert struct.unpack_from('<H',data,pos)[0]==shape['characterId'];pos=skip_rect(pos+2)
 if code==83:pos=skip_rect(pos)+1
 count=data[pos];pos+=1
 if count==255 and code!=2:count=struct.unpack_from('<H',data,pos)[0];pos+=2
 for _ in range(count):
  style=data[pos];pos+=1
  if style==0:pos+=4 if code in[32,83]else 3
  elif style in[16,18,19]:
   pos=skip_matrix(pos);records=data[pos]&15;pos+=1+records*(5 if code in[32,83]else 4)
   if style==19:pos+=2
  elif style in[64,65,66,67]:
   bitmap=struct.unpack_from('<H',data,pos)[0];pos=skip_matrix(pos+2)
   refs.append({'shapeId':shape['characterId'],'bitmapId':bitmap,'fillType':style,'sourceTagSha256':shape['sourceTagSha256']})
  else:raise AssertionError(('unsupported fill',style,shape['characterId']))

sentinels=[r for r in refs if r['bitmapId']==65535]
refs=[r for r in refs if r['bitmapId']!=65535]
missing=sorted({d['characterId']for d in source['bitmapDefinitions']}-{r['bitmapId']for r in refs})
assert missing==[204]
assert all(r['bitmapId']in {d['characterId']for d in source['bitmapDefinitions']}for r in refs)
for row in refs:
 row['placements']=[{'timelineId':t['timelineId'],'firstFrame':i['firstFrame'],'lastFrameExclusive':i['lastFrameExclusive'],'depth':i['depth']}for t in source['timelines']for i in t['instances']if i['characterId']==row['shapeId']]
 assert row['placements'] and all(p['timelineId']in['sprite-189','sprite-217'] and p['firstFrame']>=2 for p in row['placements'])
feedback=[]
for cid in [177,189,217,228]:
 t=next(t for t in source['timelines']if t['timelineId']==f'sprite-{cid}');assert not any(i['firstFrame']==1 for i in t['instances']);feedback.append({'domain':t['timelineId'],'frame1DisplayInstances':0,'firstDisplayFrame':min(i['firstFrame']for i in t['instances'])})
result={'sourceSha256':source['sourceSha256'],'bitmapShapeReferences':refs,'unresolvedBitmapIds':missing,'unresolved65535FillReferences':sentinels,'skippedMorphShapeIds':skippedMorphs,'stoppedFeedbackFrames':feedback,'nativeVisualDecision':'Do not display later decorative feedback frames without a source-evidenced start; all four feedback timelines stop on empty first frame.','limits':['Bounded initial fill reader for nonmorph shapes; bitmap204 and 65535 references unresolved; not full shape reachability','Frame1 streaming sound semantics are separate and still unverified'],'originalRuntimeAccepted':False}
(A/'bitmap-reference-audit-v1.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'bitmapShapes':len(refs),'bitmapIds':len({r['bitmapId']for r in refs}),'firstFrameBlankFeedbacks':len(feedback)}))
