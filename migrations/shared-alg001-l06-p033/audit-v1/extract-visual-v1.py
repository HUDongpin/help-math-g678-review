from pathlib import Path
import hashlib,json,subprocess,time
R=Path.cwd();M=R/'migrations/shared-alg001-l06-p033';X=Path('/Volumes/American Dream/hudongpin/g678-p033-visual-extraction-20261003-v1');X.mkdir();E=X/'ffdec-export';E.mkdir();source=M/'source-v1/L6IN05.swf'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert pin(source)['sha256']=='fb11fd842f3f0948cf5b00bf3b7b63bde86f0af9bf41bb2f9e3a762a1daad071'
command=['/opt/homebrew/bin/ffdec','-format','frame:canvas,sprite:canvas','-export','shape,morphshape,image,frame,sprite',str(E),str(source)];started=time.time()
with (X/'ffdec-v1.log').open('x') as log:p=subprocess.run(command,cwd=R,stdout=log,stderr=subprocess.STDOUT)
assert p.returncode==0
files=[{**pin(f),'path':str(f.relative_to(E))} for f in sorted(E.rglob('*')) if f.is_file()]
assert files
j={'kind':'p033-missing-visual-extraction-v1','source':pin(source),'command':command,'exitCode':p.returncode,'elapsedSeconds':time.time()-started,'exportRoot':str(E),'files':files,'log':pin(X/'ffdec-v1.log'),'priorScriptTextFontAudioExtraction':'output/alg-l06-p033-source-planning-20261001-v1/packet-inventory-v1.json','originalRuntime':False,'acceptance':False}
(M/'audit-v1/visual-extraction-v1.json').write_text(json.dumps(j,indent=2)+'\n');print(json.dumps({'files':len(files),'bytes':sum(f['bytes'] for f in files),'seconds':j['elapsedSeconds']}))
