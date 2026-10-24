from pathlib import Path
import json,hashlib,re,subprocess,datetime
R=Path.cwd();M=R/'migrations/shared-alg001-l07-p022';S=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L7');sha=lambda b:hashlib.sha256(b).hexdigest();now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
for d in ['source-v1','audit-v1','native-v1']:(M/d).mkdir(exist_ok=True)
xml=(S/'index.xml').read_bytes();source=re.sub(r'<!--[\s\S]*?-->','',xml.decode());pages=[]
for sec,body in re.findall(r'<Section\b[^>]*\bSName="([A-Z]+)"[^>]*>([\s\S]*?)</Section>',source):
 for i,(attrs,p)in enumerate(re.findall(r'<Page\b([^>]*)>([^<]+)</Page>',body),1):pages.append(dict(sectionCode=sec,sectionPageOrdinal=i,path=p.strip(),attributes=dict(re.findall(r'(\w+)="([^"]*)"',attrs))))
assert len(pages)==62 and pages[21]['path']=='IN/L7IN03.swf'and pages[21]['sectionCode']=='IN'and pages[21]['sectionPageOrdinal']==2
rows=[]
for rel,expected in [('IN/L7IN03.swf','e453fae4bd225c92dee9070e02b3669a54b165ebb2d2f07b57613f179b087f26'),('SA/L7IN03.mp3',None),('index.xml','5eac052615476e688afc1e69391c17bb0c20db8200e7be3f7ea1f9bb778d85f6')]:
 p=S/rel;assert p.resolve()==p;b=p.read_bytes();h=sha(b);assert expected is None or h==expected;copy=M/'source-v1'/p.name;copy.open('xb').write(b);assert copy.read_bytes()==p.read_bytes();rows.append(dict(source=str(p),copy=str(copy.relative_to(R)),bytes=len(b),sha256=h))
receipt=dict(at=now(),animationId='shared-alg001-l07-p022',sourceFiles=rows,placement=dict(globalOrdinal=22,**pages[21]),samePathFlaPresent=(S/'IN/L7IN03.fla').is_file(),scope='Byte-identical private source working copies; no canonical promotion or acceptance');(M/'audit-v1/source-custody-v1.json').open('x').write(json.dumps(receipt,indent=2)+'\n')
runs=[]
for args,log in [(['/opt/homebrew/bin/swfmill','swf2xml',str(M/'source-v1/L7IN03.swf'),str(M/'source-v1/movie.xml')],'swfmill-v1.txt'),(['/opt/homebrew/bin/ffdec','-export','script,text,shape,morphshape,image',str(M/'source-v1/ffdec'),str(M/'source-v1/L7IN03.swf')],'ffdec-assets-v1.txt')]:
 with(M/'audit-v1'/log).open('x')as f:r=subprocess.run(args,stdout=f,stderr=subprocess.STDOUT)
 runs.append(dict(at=now(),args=args,exitCode=r.returncode,log=str((M/'audit-v1'/log).relative_to(R))));assert r.returncode==0
(M/'audit-v1/extraction-runs-v1.json').open('x').write(json.dumps(runs,indent=2)+'\n');print(json.dumps(receipt))
