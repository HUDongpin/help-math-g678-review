from pathlib import Path
import urllib.request,urllib.error,json,hashlib,sys
T=Path(sys.argv[1]);B=T/'continuation174-production-build-v1';O=T/'continuation173-production-build-v1';ID='shared-nms002-l02-p039';paths=[f'/{l}/migration-status/g678-calibration/{ID}'for l in ['en','es','fr']]+[f'/flash-assets/g678-local/{ID}/source-audio/223?sha256=ad4a86a727b8d4b5379655258cdffc62f85f89cb460a96565fad27d975a2aa38',*[f'/flash-assets/g678-local/{ID}/source-audio/{s}'for s in ['230','234','237']]];rows=[]
for p in paths:
 try:
  with urllib.request.urlopen('http://127.0.0.1:3458'+p,timeout=30)as r:status=r.status
 except urllib.error.HTTPError as e:status=e.code
 rows.append({'path':p,'status':status})
markers=['p039-exercise','cb087b675e4ada79fb53d4a7f7368f69ed96abf6a71ea4c6e56afdaa683bd649','/shared-nms002-l02-p039/source-audio/','d92ed438cd5a8c0774706dd5ba101c5d23be8109e7d062405af14943205f3dcb'];shared='ad4a86a727b8d4b5379655258cdffc62f85f89cb460a96565fad27d975a2aa38';hits=[];comparisons=[];files=[p for p in (B/'static').rglob('*')if p.is_file()and p.suffix in ['.js','.css']]
for p in files:
 data=p.read_bytes();s=data.decode();rel=p.relative_to(B)
 for m in markers:
  if m in s:hits.append({'file':str(rel),'marker':m})
 if shared in s:
  q=O/rel;comparisons.append({'path':str(rel),'baselineIdentical':q.is_file()and q.read_bytes()==data,'sha256':hashlib.sha256(data).hexdigest()})
passed=all(x['status']==404 for x in rows)and not hits and len(comparisons)==13 and all(x['baselineIdentical']for x in comparisons)
d={'status':'PASS'if passed else'FAIL','candidate':'P039-C3','rows':rows,'files':len(files),'hits':hits,'markers':markers,'sharedFeedbackCloseBaseline':comparisons,'scope':'Local production only; shared short sound hash is notP039-specific and compared byte-for-byte againstC2 build. No deployment.'};(T/'continuation174-p039-production-v1.json').write_text(json.dumps(d,indent=2)+'\n');print({'status':d['status'],'files':len(files),'routes':len(rows),'hits':hits,'baselineSharedChunks':len(comparisons)})
