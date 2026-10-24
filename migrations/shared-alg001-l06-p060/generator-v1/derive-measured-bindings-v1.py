from pathlib import Path
import hashlib,json,sys
M=Path(__file__).resolve().parents[1];R=M.parents[1]
sha=lambda b:hashlib.sha256(b).hexdigest()
def build():
 p=M/'audio-v1/source-role-inventory-v1.json';assert sha(p.read_bytes())=='011e17afadb1449610b3ca208ba0a4a8c2b74a37e7667fd04f7dc825b3a4c7e6';inventory=json.loads(p.read_text());p=M/'audit-v1/browser-decode-v1.json';receipt=json.loads(p.read_text());assert receipt['pass']and receipt['contextClosed']and len(receipt['rows'])==240
 rows=[]
 for a in inventory['assets']:
  d=next(d for d in receipt['rows']if d['id']==a['id']);assert (d['bytes'],d['sha256'])==(a['source']['bytes'],a['source']['sha256'])
  for key in ['source','copy']:
   p=Path(a[key]['path']);p=p if p.is_absolute()else R/p;assert sha(p.read_bytes())==d['sha256']and p.stat().st_size==d['bytes']
  assert d['sampleRate']==44100 and d['channels']in [1,2]and d['decodedSamples']>0 and d['peak']>0
  rows.append({k:a[k]for k in ['id','question','language','choice','owner']}|{'binding':{'sourceSha256':d['sha256'],'sourceBytes':d['bytes'],'sampleRate':d['sampleRate'],'channels':d['channels'],'decodedSamples':d['decodedSamples'],'pcmSha256':d['pcmSha256']}})
 return {'sourceSha256':inventory['sourceSha256'],'measurementSha256':sha((M/'audit-v1/browser-decode-v1.json').read_bytes()),'assets':rows}
if __name__=='__main__':
 assert sys.argv[1:]in [['--write'],['--check']];d=build();p=R/'packages/demos/src/generated/alg-l06-p060-measured-v1.ts';b=('// Generated from exact FQ recordings and browser PCM measurements. Do not hand-edit.\nexport const P060_AUDIO_SOURCE = '+json.dumps(d,indent=2)+' as const;\n').encode()
 if sys.argv[1]=='--write':p.write_bytes(b)
 else:assert p.read_bytes()==b
 print(json.dumps({'file':str(p.relative_to(R)),'bytes':len(b),'sha256':sha(b),'assets':len(d['assets'])}))
