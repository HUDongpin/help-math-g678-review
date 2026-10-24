"""Probe a local production server; retain statuses and check browser bundles for source payload."""
from pathlib import Path
import json,sys,urllib.request,urllib.error,hashlib
base=sys.argv[1].rstrip('/');build=Path(sys.argv[2]).resolve();output=Path(sys.argv[3]).resolve()
assert base.startswith('http://127.0.0.1:')
page='shared-nms002-l02-p050';paths=[]
for locale in ['en','es','fr']:
 for suffix in ['', '?frame=209','?capture=1']:
  paths.append('/'+locale+'/migration-status/g678-calibration/'+page+suffix)
plans=json.loads((Path(__file__).resolve().parents[1]/'migrations'/page/'audit/source-pcm-inventory-v1.json').read_text())['streams']
for row in plans:
 domain=row['domain'].split('-')[1]
 paths.append('/flash-assets/g678-local/'+page+'/source-audio/'+domain+'?sha256='+row['source']['sha256'])
paths += ['/flash-assets/g678-local/'+page+'/source-audio/invalid','/flash-assets/g678-local/'+page+'/canvas-renderer.js']
rows=[]
for path in paths:
 try:
  with urllib.request.urlopen(base+path,timeout=45)as response:status=response.status
 except urllib.error.HTTPError as error:status=error.code
 rows.append({'path':path,'status':status})
markers=['28600adb8cd9a280e5052a25e448b7c71fc4b85ac4a5e89f6a73f23d7768a197','P050_AUDIO_HASH','P050_QUERY_IDENTITY','data-p050-player-frame']
files=[p for p in (build/'static').rglob('*.js') if p.is_file()];assert files
hits=[]
for file in files:
 data=file.read_text(errors='replace')
 for marker in markers:
  if marker in data:hits.append({'file':str(file.relative_to(build)),'marker':marker})
result={'status':'PASS'if all(row['status']==404 for row in rows)and not hits else 'FAIL','base':base,'routes':rows,'staticJsFiles':len(files),'payloadHits':hits,'buildId':(build/'BUILD_ID').read_text().strip()}
output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));sys.exit(result['status']!='PASS')
