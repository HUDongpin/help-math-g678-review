#!/usr/bin/env python3
"""Offline decode measurements; no playback/listening or alignment acceptance."""
import hashlib,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parent.parent
BASE=ROOT/'migrations/shared-alg001-l06-p004/audit'
audit=json.loads((BASE/'source-audit-v1.json').read_text())
source=pathlib.Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
inputs=[('main',BASE/'continuous-source-v1.mp3',audit['stream']['mp3']),('spanish',source/audit['optionalSpanish']['path'],audit['optionalSpanish'])]
version=subprocess.check_output(['ffmpeg','-version'],text=True).splitlines()[0]
rows=[]
for name,file,pin in inputs:
 b=file.read_bytes();assert len(b)==pin['bytes'] and hashlib.sha256(b).hexdigest()==pin['sha256']
 results=[]
 for _ in range(2):
  p=subprocess.run(['ffmpeg','-v','error','-i',str(file),'-f','f32le','-acodec','pcm_f32le','-ac','1','-ar','22050','pipe:1'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
  assert not p.stderr and len(p.stdout)%4==0
  results.append({'samples':len(p.stdout)//4,'sha256':hashlib.sha256(p.stdout).hexdigest()})
 assert results[0]==results[1] and file.read_bytes()==b
 rows.append({'name':name,'source':{'path':str(file),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()},'pcm':results[0],'durationSeconds':results[0]['samples']/22050,'repeatEqual':True})
report={'schemaVersion':1,'kind':'alg-l06-p004-pcm-measurement-v1','decoder':version,'format':'mono 22050Hz float32 little-endian','streams':rows,'playbackInvoked':False,'audioAccepted':False,'sourceAlignmentAccepted':False}
output=BASE/'pcm-measurement-v1.json';body=(json.dumps(report,indent=2)+'\n').encode()
if output.exists():assert output.read_bytes()==body
else:output.write_bytes(body)
print(json.dumps(report))
