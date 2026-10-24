from pathlib import Path
import subprocess,json,hashlib,time
R=Path.cwd();M=R/'migrations/shared-alg001-l06-p049';E=Path('/Volumes/American Dream/hudongpin/g678-p049-source-extraction-20261002-v1');S=M/'source-v1/L6TI09.swf'
assert hashlib.sha256(S.read_bytes()).hexdigest()=='33f90f5897fa60939fb7015f60c8789d98aad3dca65ad39cb04dac4fededb3a6'
T=E/'ffdec-export';T.mkdir()
cmd=['/opt/homebrew/bin/ffdec','-format','frame:canvas,sprite:canvas','-export','script,text,sound,image,shape,morphshape,font,frame,sprite',str(T),str(S)]
start=time.time()
with (E/'ffdec-export-v1.log').open('x') as log:p=subprocess.run(cmd,cwd=R,stdout=log,stderr=subprocess.STDOUT)
rows=[]
for f in sorted(T.rglob('*')):
 if f.is_file():
  b=f.read_bytes();rows.append({'path':str(f.relative_to(T)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
r={'kind':'p049-source-extraction-v1','sourceSha256':hashlib.sha256(S.read_bytes()).hexdigest(),'tool':'JPEXS FFDec 26.2.1','command':cmd,'startedAt':start,'finishedAt':time.time(),'exitCode':p.returncode,'exportRoot':str(T),'files':rows}
with (M/'audit-v1/ffdec-source-extraction-v1.json').open('x') as f:f.write(json.dumps(r,indent=2)+'\n')
print(json.dumps({'exitCode':p.returncode,'files':len(rows),'bytes':sum(x['bytes'] for x in rows)}));assert p.returncode==0 and len(rows)>0
