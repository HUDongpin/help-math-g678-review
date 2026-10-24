"""Project audited DAT geometry into a minimal frontend surface configuration."""
import argparse,hashlib,json
from pathlib import Path
R=Path(__file__).resolve().parent.parent;B=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f');O=R/'work/g678-shared-page-factory/dat-l05-drag-surface-v1';pins={}
def read(p,expected=None):
 p=Path(p);b=p.read_bytes();v={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert v==expected
 pins[str(p)]=v;return b
def build():
 c=json.loads(read(B/'dat-l05-source-contract-v1/contract.json'));m=json.loads(read(R/'work/g678-shared-page-factory/dat-l05-interactive-canvas-v1/manifest.json'));asset=next(p for p in m['outputs'] if p['path'].endswith('/canvas-renderer.js'));read(asset['path'],asset)
 def ranges(rows):return[{k:r[k] for k in ['firstFrame','lastFrame','depth','bounds']} for r in rows]
 config={'animationId':c['animationId'],'sourceSwfSha256':c['source']['sha256'],'assetSource':'/flash-assets/g678-local/'+c['animationId']+'/canvas-renderer.js','assetSha256':asset['sha256'],'mainOriginPixels':c['stage']['mainOriginPixels'],'prompt':c['prompt'],'items':[{'sourceId':r['sourceId'],'targetId':r['targetId'],'label':r['label'],'definitionText':r['definitionText'],'originTwips':r['sourceOriginTwips'],'targetOriginTwips':r['targetOriginTwips'],'sourcePlacements':ranges(r['sourcePlacements']),'targetPlacements':ranges(r['targetPlacements'])} for r in c['dragItems']],'popups':[{'instanceName':p['instanceName'],'placements':ranges(p['placements']),'closeBounds':p['closeBounds']} for p in c['popups']],'popupOpenButtons':[{'characterId':p['characterId'],'targetInstance':p['targetInstance'],'placements':ranges(p['placements'])} for p in c['popupOpenButtons']],'glossary':[{'characterId':g['characterId'],'entryId':g['entryId'],'keyAttribute':g['keyAttribute'],'labels':g['labels'],'definitions':g['definitions'],'placements':ranges(g['placements'])} for g in c['glossary']]}
 assert len(config['items'])==5 and len(config['popups'])==5 and len(config['popupOpenButtons'])==7 and len(config['glossary'])==6
 read(__file__);outputs={O/'config.json':(json.dumps(config,ensure_ascii=False,indent=2)+'\n').encode()};manifest={'status':'unregistered-dat-source-derived-surface-config','source':c['source'],'sourceCanvas':asset,'inputs':list(pins.values()),'outputs':[{'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for p,b in outputs.items()],'sourceHitSemanticsAccepted':False,'registered':False,'productCalibrationPassed':False};outputs[O/'manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode();return outputs
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();outputs=build()
 for p,b in outputs.items():
  if args.check:assert p.read_bytes()==b
  else:
   p.parent.mkdir(parents=True,exist_ok=True)
   with p.open('xb') as f:f.write(b)
 print(json.dumps({'output':str(O),'checked':args.check}))
