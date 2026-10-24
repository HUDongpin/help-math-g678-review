"""Extract all original stream blocks without splitting encoded MP3 at gaps."""
from pathlib import Path
import json,hashlib,struct,zlib
R=Path(__file__).resolve().parents[1]; A=R/'migrations/shared-nms002-l02-p042/audit'
raw=(A/'source-input.swf').read_bytes(); sha=hashlib.sha256(raw).hexdigest()
assert sha=='6dce91764e5744cf72cbdb2a2d1a10990a1c3eb1f42f5aace4cb3be33a67fad0'
b=raw[:8]+zlib.decompress(raw[8:]); assert len(b)==struct.unpack_from('<I',b,4)[0]
rows=[]; payloads=[]; headers=[]
def scan(start,end,domain):
 pos=start;frame=1
 while pos<end:
  offset=pos;tag=struct.unpack_from('<H',b,pos)[0];pos+=2;code=tag>>6;size=tag&63
  if size==63:size=struct.unpack_from('<I',b,pos)[0];pos+=4
  stop=pos+size;assert stop<=end
  if code==0:return
  if code==1:frame+=1
  if code==39:
   ident,count=struct.unpack_from('<HH',b,pos);scan(pos+4,stop,'sprite-'+str(ident))
  if code in (18,45):headers.append({'domain':domain,'frame':frame,'hex':b[pos:stop].hex()})
  if code==19:
   assert domain=='sprite-261';assert size>=4
   count,seek=struct.unpack_from('<Hh',b,pos);payload=b[pos+4:stop];payloads.append(payload)
   rows.append({'frame':frame,'sampleCount':count,'seekSamples':seek,'encodedBytes':len(payload),'tagOffset':offset,'sha256':hashlib.sha256(payload).hexdigest()})
  pos=stop
nbits=b[8]>>3;scan(8+(5+4*nbits+7)//8+4,len(b),'root')
encoded=b''.join(payloads)
def write(p,data):
 if p.exists():assert p.read_bytes()==data
 else:p.write_bytes(data)
write(A/'source-stream-v1.mp3',encoded)
result={'sourceSha256':sha,'headers':headers,'blocks':rows,'encodedStream':{'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest()},'claim':'Original MP3 payloads concatenated in source order. No runtime, audio, or listening acceptance.'}
write(A/'source-audio-blocks-v1.json',(json.dumps(result,indent=2)+'\n').encode())
print(json.dumps({'blocks':len(rows),'first':rows[0],'last':rows[-1],'emptyFrames':[r['frame']for r in rows if r['sampleCount']==0],'stream':result['encodedStream']}))
