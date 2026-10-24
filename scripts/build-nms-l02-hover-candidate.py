#!/usr/bin/env python3
"""Generate an exact-source hover candidate; never edit the preserved Canvas export."""
import argparse,hashlib,importlib.util,json,re
from pathlib import Path
import xml.etree.ElementTree as E
R=Path(__file__).resolve().parent.parent
B=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f')
O=R/'work/g678-shared-page-factory/nms-l02-hover-candidate-v1'
ID='shared-nms002-l02-p020'
pins={}
def read(p,expected=None):
 p=Path(p);s=p.stat();b=p.read_bytes();a=p.stat();assert(s.st_ino,s.st_mtime_ns,s.st_size)==(a.st_ino,a.st_mtime_ns,a.st_size)
 pin={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert pin==expected
 pins[str(p)]=pin;return b

def build():
 audit=json.loads(read(B/'nms-l02-hover-source-next-v1.json'))
 read(audit['source']['path'],audit['source']);x=E.fromstring(read(audit['sourceXml']['path'],audit['sourceXml']))
 original=R/f'work/g678-shared-page-factory/g678-shared-current-js-calibration-13-v1/members/{ID}/canvas-renderer.js'
 b=read(original);assert hashlib.sha256(b).hexdigest()=='1689bc6984240eaacb958f11498e49f0364ea29498d02535cb138fdddb3707bc'
 source=b.decode();derived=source
 defs={int(t.get('objectID')):t for t in x.iter() if t.tag.startswith('Define') and t.get('objectID') is not None}
 fonts={id:[int(g.get('map')) for g in t.find('glyphs')] for id,t in defs.items() if t.tag=='DefineFont2'}
 def texts(id):
  t=defs[id]
  if t.tag.startswith('DefineText'):
   font=None;s=''
   for r in t.iter('TextRecord6'):
    if r.get('objectID'):font=int(r.get('objectID'))
    for g in r.findall('glyphs/TextEntry'):s+=chr(fonts[font][int(g.get('glyph'))])
   return [s]
  if t.tag!='DefineSprite':return []
  result=[]
  for p in t.find('tags'):
   if p.tag=='ShowFrame':break
   if p.tag.startswith('PlaceObject') and p.get('objectID'):result.extend(texts(int(p.get('objectID'))))
  return result
 controls=[]
 for c in audit['controls']:
  sid=c['sourceCharacterId'];node=defs[sid]
  for a in c['scripts']:read(a['binding']['path'],a['binding'])
  assert node.find('tags/DoAction/actions/Stop') is not None
  shape_ids=[]
  for p in node.find('tags'):
   if p.tag=='ShowFrame':break
   if p.tag=='PlaceObject2' and p.get('objectID'):
    n=defs[int(p.get('objectID'))]
    if n.tag.startswith('DefineShape') and n.find('.//Solid/color/Color[@alpha="0"]') is not None:shape_ids.append(int(p.get('objectID')))
  assert len(shape_ids)==1
  bounds=defs[shape_ids[0]].find('bounds/Rectangle').attrib
  assert bounds=={'left':'-350','right':'339','top':'-500','bottom':'600'}
  digits=texts(sid);assert len(digits)==2 and all(s.isdecimal() for s in digits)
  trans=c['transform'];cx=412.4+int(trans['transX'])/20;cy=283.3+int(trans['transY'])/20
  controls.append({'sourceCharacterId':sid,'instanceName':c['instanceName'],'firstFrame':149,'lastFrame':151,
   'fraction':digits[0]+'/'+digits[1], 'hitBounds':{'x':cx-17.5,'y':cy-25,'width':34.45,'height':55},
   'sourceHitShape':shape_ids[0],'sourceGlyphTexts':digits})
  needle=f'function sprite{sid}(ctx,ctrans,frame,ratio,time){{';assert derived.count(needle)==1
  derived=derived.replace(needle,needle+f'\n\tframe = __nmsHoverIds.indexOf({sid}) >= 0 ? 1 : 0;')
 # These two retained grandchildren stop on entry, even when their parent reveals feedback.
 for sid in [40,66]:
  assert defs[sid].find('tags/DoAction/actions/Stop') is not None
  needle=f'function sprite{sid}(ctx,ctrans,frame,ratio,time){{';assert derived.count(needle)==1
  derived=derived.replace(needle,needle+'\n\tframe = 0;')
 assert 'ctx.transform(1,0,0,1,367.1,201.85);' in source
 assert 'ctx.transform(1, 0, 0, 1, 45.299999999999955, 81.45000000000002);' in source
 controls.sort(key=lambda c:(c['hitBounds']['y'],c['hitBounds']['x']))
 ids=[c['sourceCharacterId'] for c in controls]
 old='function resolveFrameState(request) {'
 derived=derived.replace(old,'var __nmsHoverIds = [];\n'+old,1)
 old='    var allowedScenarios = ["source-static-frame"];'
 new='''    var hoverIds = request.hoverCharacterIds === undefined ? [] : request.hoverCharacterIds;
    var allowedHoverIds = IDS;
    if (!Array.isArray(hoverIds) || hoverIds.some(function(id) { return allowedHoverIds.indexOf(id) < 0; }) ||
        new Set(hoverIds).size !== hoverIds.length || (frame < 149 && hoverIds.length)) {
        throw new Error("invalid-source-hover-state");
    }
    hoverIds = Object.freeze(hoverIds.slice().sort(function(a,b) {return a-b;}));
'''.replace('IDS',json.dumps(ids))+old
 assert derived.count(old)==1;derived=derived.replace(old,new,1)
 old='        interactiveStateResolved: false,';assert derived.count(old)==1
 derived=derived.replace(old,old+'\n        hoverStateResolved: true,\n        hoverCharacterIds: hoverIds,',1)
 old='    var previousCanvas = canvas;';assert derived.count(old)==1
 derived=derived.replace(old,old+'\n    var previousHoverIds = __nmsHoverIds;\n    __nmsHoverIds = state.hoverCharacterIds;',1)
 old='        canvas = previousCanvas;';assert derived.count(old)==1
 derived=derived.replace(old,old+'\n        __nmsHoverIds = previousHoverIds;',1)
 old='        targetCanvas.setAttribute("data-flash-frame", String(state.localFrame));'
 derived=derived.replace(old,old+'\n        targetCanvas.setAttribute("data-source-hover-character-ids", state.hoverCharacterIds.join(","));',1)
 # Reuse the exact source dictionary parser and visibility sampler, not another glossary implementation.
 spec=importlib.util.spec_from_file_location('glossary_audit',R/'scripts/audit-g678-frozen16-glossary.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
 read(R/'scripts/audit-g678-frozen16-glossary.py')
 ranges,events=mod.button_ranges(defs[69],{7})
 handler=R/f'work/g678-shared-page-factory/g678-shared-current-js-calibration-13-v1/members/{ID}/canvas/scripts/DefineButton2_7/BUTTONCONDACTION on(release).as'
 assert mod.parse_handler(read(handler).decode().replace('\r\n','\n'))=='Fraction'
 entries={}
 for lang,sha in [('en',mod.SHA_EN),('es',mod.SHA_ES)]:
  p=mod.RECOVERY/f'objects/sha256/{sha[:2]}/{sha}';raw=read(p);assert hashlib.sha256(raw).hexdigest()==sha
  matches=mod.term_index(raw.decode('utf-8-sig')).get('fraction');assert len(matches)==1;entries[lang]=matches[0]
 glossary={'sourceCharacterId':7,'sourceKeyAttribute':'Fraction','entryId':'fraction','ranges':ranges[7],
  'labels':{lang:entries[lang]['labels'][lang] for lang in entries},
  'definitions':{lang:entries[lang]['definitions'][lang] for lang in entries},
  'sourceEntrySha256':{lang:entries[lang]['sourceEntrySha256'] for lang in entries}}
 asset=derived.encode();config={'animationId':ID,'sourceSwfSha256':audit['source']['sha256'],
  'assetSource':f'/flash-assets/g678-local/{ID}/canvas-renderer.js',
  'assetSha256':hashlib.sha256(asset).hexdigest(),'firstHoverFrame':149,'lastFrame':151,
  'controls':controls,'glossary':glossary}
 outputs={'canvas-renderer.js':asset,'config.json':(json.dumps(config,indent=2,ensure_ascii=False)+'\n').encode()}
 read(Path(__file__))
 for p in list(pins.values()):read(p['path'],p)
 manifest={'schemaVersion':1,'status':'unregistered-source-hover-candidate','source':audit['source'],'originalCanvas':pins[str(original)],
  'inputs':list(pins.values()),'outputs':[{'path':str(O/k),'bytes':len(v),'sha256':hashlib.sha256(v).hexdigest()} for k,v in outputs.items()],
  'changes':{'eventOwnedSprites':ids,'stoppedGrandchildren':[40,66],'vectorOrTextDrawingEdits':0},
  'remaining':['My Lesson integration','Source audio lifecycle','Original-runtime and human acceptance'],
  'productCalibrationPassed':False,'audioAccepted':False,'originalRuntimeAccepted':False,'humanAccepted':False,'ownerAccepted':False}
 outputs['manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode()
 return outputs
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();outputs=build()
 if args.check:
  for k,v in outputs.items():assert (O/k).read_bytes()==v,k
 else:
  O.mkdir()
  for k,v in outputs.items():
   with (O/k).open('xb') as f:f.write(v)
 print(json.dumps({'output':str(O),'checked':args.check,'outputs':len(outputs)}))
