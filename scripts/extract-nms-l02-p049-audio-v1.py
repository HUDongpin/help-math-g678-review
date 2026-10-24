"""Preserve source stream tags per domain; concatenate only MP3 payloads."""
from pathlib import Path
import json,hashlib,struct,zlib
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p049/audit';raw=(A/'source-input.swf').read_bytes();sha=hashlib.sha256(raw).hexdigest();assert sha=='896e38a05c5e6392f7e9284aa278a5b7e10c13b15f7911fa09d1dc9b1de865b2'
b=raw[:8]+zlib.decompress(raw[8:]);assert len(b)==struct.unpack_from('<I',b,4)[0];rectEnd=8+(5+4*(b[8]>>3)+7)//8;streams=[]
def write(p,data):
 if p.exists():assert p.read_bytes()==data
 else:p.write_bytes(data)
def scan(start,end,domain):
 pos=start;frame=1;header=None;tags=[];rows=[];payloads=[]
 while pos<end:
  offset=pos;tag=struct.unpack_from('<H',b,pos)[0];pos+=2;code=tag>>6;size=tag&63
  if size==63:size=struct.unpack_from('<I',b,pos)[0];pos+=4
  stop=pos+size;assert stop<=end
  if code==0:break
  if code==39:
   ident,count=struct.unpack_from('<HH',b,pos);scan(pos+4,stop,'sprite-'+str(ident))
  if code in (18,45):
   assert header is None;flags=b[pos+1];header={'frame':frame,'compression':flags>>4,'rateCode':(flags>>2)&3,'sampleSize':struct.unpack_from('<H',b,pos+2)[0],'headerHex':b[pos:stop].hex()};tags.append(b[offset:stop])
  if code==19:
   assert header is not None;payload=b[pos:stop];row={'frame':frame,'offset':offset,'tagBytes':stop-offset,'rawPayloadBytes':len(payload),'rawPayloadSha256':hashlib.sha256(payload).hexdigest()}
   if header['compression']==2:
    assert size>=4;count,seek=struct.unpack_from('<Hh',payload);row.update(sampleCount=count,seekSamples=seek);payload=payload[4:]
   payloads.append(payload);rows.append(row);tags.append(b[offset:stop])
  if code==1:
   if header is not None:tags.append(b[offset:stop])
   frame+=1
  pos=stop
 if header:
  body=b[8:rectEnd+2]+struct.pack('<H',frame-1)+b''.join(tags)+b'\x00\x00';wrapper=b'FWS'+raw[3:4]+struct.pack('<I',8+len(body))+body;wp=A/(domain+'-stream-wrapper-v1.swf');write(wp,wrapper)
  record={'domain':domain,'header':header,'frames':frame-1,'blocks':rows,'wrapper':{'path':str(wp.relative_to(R)),'bytes':len(wrapper),'sha256':hashlib.sha256(wrapper).hexdigest()},'qualification':'Derived root-only public-tool decode wrapper preserving original stream header, blocks and ShowFrame tags; not an original animation runtime.'}
  if header['compression']==2:
   encoded=b''.join(payloads);p=A/(domain+'-source-stream-v1.mp3');write(p,encoded);record['encodedStream']={'path':str(p.relative_to(R)),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest()}
  streams.append(record)
scan(rectEnd+4,len(b),'root')
result={'sourceSha256':sha,'streams':streams,'audioAccepted':False};write(A/'source-audio-streams-v1.json',(json.dumps(result,indent=2)+'\n').encode());print(json.dumps([(s['domain'],s['header']['compression'],len(s['blocks']))for s in streams]))
