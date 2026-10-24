from pathlib import Path
import json,hashlib,re,subprocess,datetime
R=Path.cwd();M=R/'migrations/shared-alg001-l07-p031';S=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L7');sha=lambda b:hashlib.sha256(b).hexdigest();now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
for d in ['source-v1','audit-v1','native-v1']:(M/d).mkdir(exist_ok=True)
xml=(S/'index.xml').read_bytes();source=re.sub(r'<!--[\s\S]*?-->','',xml.decode());pages=[]
for sec,body in re.findall(r'<Section\b[^>]*\bSName="([A-Z]+)"[^>]*>([\s\S]*?)</Section>',source):
 for i,(attrs,p)in enumerate(re.findall(r'<Page\b([^>]*)>([^<]+)</Page>',body),1):pages.append(dict(sectionCode=sec,sectionPageOrdinal=i,path=p.strip(),attributes=dict(re.findall(r'(\w+)="([^"]*)"',attrs))))
assert len(pages)==62 and pages[30]['path']=='IN/L7IN12.swf'and pages[30]['sectionCode']=='IN'and pages[30]['sectionPageOrdinal']==11
rows=[]
for rel,expected in [('IN/L7IN12.swf','04805530a88d903095f6fc87df14ad31df8508ad258b68ef34664183da2f12d7'),('SA/L7IN12.mp3','36e5f50823581d27d47f0218640c8afa39740ab81cc8697f8e10bf53f0c0fe32'),('index.xml','5eac052615476e688afc1e69391c17bb0c20db8200e7be3f7ea1f9bb778d85f6')]:
 p=S/rel;assert p.resolve()==p;b=p.read_bytes();h=sha(b);assert expected is None or h==expected;copy=M/'source-v1'/p.name;copy.open('xb').write(b);assert copy.read_bytes()==p.read_bytes();rows.append(dict(source=str(p),copy=str(copy.relative_to(R)),bytes=len(b),sha256=h))
receipt=dict(at=now(),animationId='shared-alg001-l07-p031',sourceFiles=rows,placement=dict(globalOrdinal=31,**pages[30]),samePathFlaPresent=(S/'IN/L7IN12.fla').is_file(),scope='Byte-identical private source working copies; no canonical promotion or acceptance');(M/'audit-v1/source-custody-v1.json').open('x').write(json.dumps(receipt,indent=2)+'\n')
runs=[]
for args,log in [(['/opt/homebrew/bin/swfmill','swf2xml',str(M/'source-v1/L7IN12.swf'),str(M/'source-v1/movie.xml')],'swfmill-v1.txt'),(['/opt/homebrew/bin/ffdec','-export','script,text,shape,morphshape,image',str(M/'source-v1/ffdec'),str(M/'source-v1/L7IN12.swf')],'ffdec-assets-v1.txt')]:
 with(M/'audit-v1'/log).open('x')as f:r=subprocess.run(args,stdout=f,stderr=subprocess.STDOUT)
 runs.append(dict(at=now(),args=args,exitCode=r.returncode,log=str((M/'audit-v1'/log).relative_to(R))));assert r.returncode==0
(M/'audit-v1/extraction-runs-v1.json').open('x').write(json.dumps(runs,indent=2)+'\n');print(json.dumps(receipt))
