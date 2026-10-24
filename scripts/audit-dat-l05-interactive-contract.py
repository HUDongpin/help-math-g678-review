"""Recover the complete DAT L5 source interaction contract without changing registration."""
import argparse,hashlib,importlib.util,json,re,xml.etree.ElementTree as E
from pathlib import Path
R=Path(__file__).resolve().parent.parent;B=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f');O=B/'dat-l05-source-contract-v1';ID='shared-dat001-l05-p040';pins={}
def read(p,expected=None):
 p=Path(p);a=p.stat();b=p.read_bytes();z=p.stat();assert(a.st_dev,a.st_ino,a.st_mtime_ns,a.st_size)==(z.st_dev,z.st_ino,z.st_mtime_ns,z.st_size);d={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert d==expected,(str(p),'source drift')
 pins[str(p)]=d;return b
def js(p):return json.loads(read(p))
def matrix(n):
 t=n.find('transform/Transform');a={} if t is None else t.attrib
 return [float(a.get('scaleX',1)),float(a.get('skewY',0)),float(a.get('skewX',0)),float(a.get('scaleY',1)),float(a.get('transX',0)),float(a.get('transY',0))]
def mult(a,b):return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]
def trans(box,m):
 l,t,r,b=box;points=[(m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]) for x in [l,r] for y in [t,b]]
 return[min(x for x,y in points),min(y for x,y in points),max(x for x,y in points),max(y for x,y in points)]
def union(boxes):return[min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes)]
def build():
 binary=js(B/'interactive-source-audit-v1/binary-source-audit.json');source=next(r for r in binary['records'] if r['animationId']==ID);read(source['source']['path'],source['source']);x=E.fromstring(read(source['xml']['path'],source['xml']));scripts={s['relativePath']:s for s in source['sourceScripts']};assert len(scripts)==71
 for s in scripts.values():assert read(s['binding']['path'],s['binding']).decode()==s['text']
 def script(p):return scripts[p]['text'].replace('\r\n','\n')
 D={int(n.get('objectID')):n for n in x.iter() if n.tag.startswith('Define') and n.tag not in ('DefineFontName','DefineFontInfo','DefineFontInfo2') and n.get('objectID')};fonts={i:[chr(int(g.get('map'))) for g in n.find('glyphs')] for i,n in D.items() if n.tag=='DefineFont2'};texts={}
 for i,n in D.items():
  if n.tag not in ('DefineText','DefineText2'):continue
  font=None;runs=[]
  for t in n.findall('.//TextRecord6'):
   if t.get('objectID'):font=int(t.get('objectID'))
   glyphs=t.findall('./glyphs/TextEntry')
   if glyphs:runs.append({'text':''.join(fonts[font][int(g.get('glyph'))] for g in glyphs),'fontId':font,'glyphIndices':[int(g.get('glyph')) for g in glyphs]})
  texts[i]={'text':''.join(t['text'] for t in runs),'runs':runs}
 def bounds(i):
  n=D[i];r=n.find('bounds/Rectangle')
  if r is not None:return[float(r.get(k)) for k in ['left','top','right','bottom']]
  if n.tag=='DefineSprite':children=[p for p in n.find('tags') if p.tag.startswith('PlaceObject') and p.get('objectID')]
  elif n.tag=='DefineButton2':children=[p for p in n.find('buttons') if p.get('objectID') and p.get('hitTest')=='1']
  else:raise AssertionError((i,n.tag,'bounds unsupported'))
  return union([trans(bounds(int(p.get('objectID'))),matrix(p)) for p in children])
 main=D[315];assert int(main.get('frames'))==254;frame=1;active={};frames={}
 for t in main.find('tags'):
  if t.tag=='ShowFrame':frames[frame]=json.loads(json.dumps(active));frame+=1
  elif t.tag.startswith('PlaceObject'):
   depth=int(t.get('depth'));old=active.get(depth);char=t.get('objectID')
   if char is not None:active[depth]={'characterId':int(char),'name':t.get('name'),'depth':depth,'createdFrame':frame,'matrix':old['matrix'] if old and t.get('replace')=='1' else[1,0,0,1,0,0],'alpha':old['alpha'] if old and t.get('replace')=='1' else 256}
   assert depth in active;v=active[depth]
   if t.find('transform/Transform') is not None:v['matrix']=matrix(t)
   if t.get('name') is not None:v['name']=t.get('name')
   c=t.find('colorTransform/ColorTransform2')
   if c is not None:assert int(c.get('offsetAlpha','0'))==0;v['alpha']=int(c.get('factorAlpha',256))
  elif t.tag.startswith('RemoveObject'):active.pop(int(t.get('depth')),None)
 assert frame==255
 base=[.05,0,0,.05,412.4,283.3]
 def ranges(test,geometry=True,includeZeroAlpha=False):
  runs=[];open={}
  for f in range(1,256):
   visible={json.dumps(v,sort_keys=True):v for v in frames.get(f,{}).values() if test(v) and (includeZeroAlpha or v['alpha']>0)}
   for k in list(open):
    if k not in visible:
     start,v=open.pop(k);box=trans(bounds(v['characterId']),mult(base,v['matrix'])) if geometry else None;runs.append({**v,'firstFrame':start,'lastFrame':f-1,'bounds':{'x':box[0],'y':box[1],'width':box[2]-box[0],'height':box[3]-box[1]} if box else None})
   for k,v in visible.items():open.setdefault(k,(f,v))
  return sorted(runs,key=lambda r:(r['firstFrame'],r['depth']))
 named=lambda f:{v['name']:v for v in frames[f].values() if v['name']};q=named(238)
 assert script('DefineSprite_315/frame_238/DoAction.as')=='stop();\n_global.quizSection = true;\n_global.quizDragCount = 0;\n';assert script('DefineSprite_315/frame_239/DoAction.as')=='_global.quizSection = false;\n';assert script('DefineSprite_315/frame_254/DoAction.as')=='stop();\n'
 expected=[('Src_1',184,68,'Tar_1',63),('Src_2',185,69,'Tar_2',64),('Src_3',186,70,'Tar_3',65),('Src_4',188,71,'Tar_4',66),('Src_5',189,72,'Tar_5',67)];items=[]
 for name,char,textid,target,definition in expected:
  p=q[name];assert p['characterId']==char;prefix=f'DefineSprite_315/frame_238/PlaceObject2_{char}_{p["depth"]}/CLIPACTIONRECORD '
  press=script(prefix+'on(press).as');release=script(prefix+'on(releaseOutside,release).as');assert 'this.startDrag();' in press and 'while(i <= 4)' in press and '.gotoAndStop(1);' in press;assert 'enabled = false;' in release and '_global.quizDragCount++;' in release and '_X = oX;' in release and '_Y = oY;' in release
  srcRanges=ranges(lambda v:v['name']==name);tarRanges=ranges(lambda v:v['name']==target);assert srcRanges[0]['firstFrame']==238 and srcRanges[-1]['lastFrame']==254
  items.append({'sourceId':name,'characterId':char,'label':texts[textid]['text'],'textCharacterId':textid,'targetId':target,'definitionText':texts[definition]['text'],'definitionCharacterId':definition,'sourcePlacements':srcRanges,'targetPlacements':tarRanges,'sourceOriginTwips':{'x':p['matrix'][4],'y':p['matrix'][5]},'targetOriginTwips':{'x':q[target]['matrix'][4],'y':q[target]['matrix'][5]},'pressScript':scripts[prefix+'on(press).as']['binding'],'releaseScript':scripts[prefix+'on(releaseOutside,release).as']['binding']})
 nms=js(B/'interactive-source-audit-v1/nms-l11-contract.json');hostpath=B/'canonical-indexmi-host-audit-v1/scripts/scripts/frame_35/DoAction.as';host=read(hostpath).decode().replace('\r\n','\n');hostSource=js(B/'canonical-indexmi-host-audit-v1/source-binding.json');h=read(hostSource['casPath']);assert hashlib.sha256(h).hexdigest()==hostSource['source']['sha256'];functions=nms['hostFunctions'];assert all(v in host for v in functions.values());assert 'Src_' not in ''.join(functions.values());assert 'random(3)' in functions['showWrongFeed'] and 'random(4)' in functions['showRightFeed']
 feedback=[]
 for name,p in q.items():
  if not re.fullmatch('Mc_(Wrong|Right)_Feed[1-4]',name):continue
  char=p['characterId'];end=int(D[char].get('frames'));kind='wrong' if 'Wrong' in name else'right';entry=script(f'DefineSprite_{char}/frame_1/DoAction.as');terminal=script(f'DefineSprite_{char}/frame_{end}/DoAction.as');assert entry.startswith('stop();\n');assert 'this.gotoAndStop(1);' in terminal
  if kind=='wrong':assert '_global.quizTryCount++;' in terminal and '_parent.play();' not in terminal
  else:assert 'quizDragCount >= 5' in terminal and '_parent.play();' in terminal
  assert [s for s in scripts if re.fullmatch(f'DefineSprite_{char}/frame_\\d+/DoAction.as',s)]==[f'DefineSprite_{char}/frame_1/DoAction.as',f'DefineSprite_{char}/frame_{end}/DoAction.as']
  feedback.append({'instanceName':name,'characterId':char,'kind':kind,'frameCount':end,'entryStopFrame':1,'hostPlayFrame':2,'hostX':5,'dismissalRequired':False,'terminalScript':scripts[f'DefineSprite_{char}/frame_{end}/DoAction.as']['binding'],'placements':ranges(lambda v:v['name']==name,geometry=False)})
 assert len(feedback)==7 and 'Mc_Wrong_Feed4' not in q
 popupInfo={'mc1':(167,163,[],None),'mc2':(161,134,[],None),'mc3':(121,120,[108,110],None),'mc4':(133,120,[131],None),'mc5':(172,169,[],'mc4_a.gotoAndPlay(2) is called but no mc4_a is placed in this sprite')};popups=[]
 for name,(char,close,children,unresolved) in popupInfo.items():
  assert script(f'DefineSprite_{char}/frame_1/DoAction.as')=='stop();\n';assert int(D[char].get('frames'))==2
  placements=ranges(lambda v:v['name']==name);assert placements[0]['firstFrame']==23 and placements[-1]['lastFrame']==254
  cp=[n for n in D[char].find('tags') if n.tag.startswith('PlaceObject') and n.get('objectID')==str(close)];assert len(cp)==1
  action=script(f'DefineButton2_{close}/BUTTONCONDACTION on(release).as');assert 'this._visible = false;' in action and 'this.gotoAndStop(1);' in action
  childRows=[]
  for child in children:
   end=int(D[child].get('frames'));assert script(f'DefineSprite_{child}/frame_1/DoAction.as')=='stop();\n';assert script(f'DefineSprite_{child}/frame_2/DoAction.as')=='play();\n';assert script(f'DefineSprite_{child}/frame_{end}/DoAction.as')=='stop();\ngotoAndPlay(2);\n';childRows.append({'characterId':child,'frameCount':end,'entryPlayFrame':2,'loopTargetFrame':2,'terminalGotoFrame':end})
  closeBoxes=[]
  for p in placements:
   b=trans(bounds(close),mult(mult(base,p['matrix']),matrix(cp[0])));closeBoxes.append({'firstFrame':p['firstFrame'],'lastFrame':p['lastFrame'],'x':b[0],'y':b[1],'width':b[2]-b[0],'height':b[3]-b[1]})
  popups.append({'instanceName':name,'characterId':char,'entryStopFrame':1,'openFrame':2,'placements':placements,'closeButtonId':close,'closeBounds':closeBoxes,'childLoops':childRows,'unresolvedChildCall':unresolved})
 openButtons=[]
 for key,s in scripts.items():
  match=re.fullmatch('DefineButton2_(\\d+)/BUTTONCONDACTION on\\(release\\).as',key)
  if not match:continue
  v=s['text'].replace('\r\n','\n');op=re.fullmatch(r'on\(release\)\{\n   (mc[1-5])\._visible = true;\n   \1\.gotoAndStop\(2\);\n\}\n',v)
  if op:
   char=int(match[1]);rows=ranges(lambda p:p['characterId']==char,includeZeroAlpha=True);assert rows,(char,op[1],'no source placement');openButtons.append({'characterId':char,'targetInstance':op[1],'placements':rows,'script':s['binding']})
 assert len(openButtons)==7
 helper=R/'scripts/audit-g678-frozen16-glossary.py';read(helper);spec=importlib.util.spec_from_file_location('gl',helper);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);dictionaries={}
 for lang,sha in [('en',mod.SHA_EN),('es',mod.SHA_ES)]:
  data=read(mod.RECOVERY/f'objects/sha256/{sha[:2]}/{sha}');assert hashlib.sha256(data).hexdigest()==sha;dictionaries[lang]=mod.term_index(data.decode('utf-8-sig'))
 glossary=[]
 for char in range(75,81):
  key=mod.parse_handler(script(f'DefineButton2_{char}/BUTTONCONDACTION on(release).as'));left=dictionaries['en'][key.casefold()];right=dictionaries['es'][key.casefold()];assert len(left)==len(right)==1;glossary.append({'characterId':char,'keyAttribute':key,'entryId':re.sub('[^a-z0-9]+','-',key.lower()).strip('-'),'labels':{'en':left[0]['labels']['en'],'es':right[0]['labels']['es']},'definitions':{'en':left[0]['definitions']['en'],'es':right[0]['definitions']['es']},'placements':ranges(lambda v:v['characterId']==char),'entryHashes':{'en':left[0]['sourceEntrySha256'],'es':right[0]['sourceEntrySha256']}})
 # The authored display list recreates three popup instances at the question; two continue from frame23.
 assert {n for n in popupInfo if q[n]['createdFrame']==238}=={'mc2','mc3','mc4'}
 read(__file__);result={'status':'dat-drag-feedback-enlargement-and-glossary-source-contract-recovered','animationId':ID,'source':source['source'],'sourceXml':source['xml'],'fps':12,'stage':{'width':800,'height':600,'mainOriginPixels':{'x':412.4,'y':283.3}},'main':{'frameCount':254,'interactionFrame':238,'resumeFrame':239,'terminalStopFrame':254,'sourceInitializesQuizTryCount':False},'prompt':texts[54]['text'].strip(),'sourceGlyphTexts':texts,'dragItems':items,'feedback':feedback,'popups':popups,'popupOpenButtons':openButtons,'glossary':glossary,'hostFunctions':functions,'sourceBehaviorCorrections':['Source press resets all feedback clips; a new unlocked source can interrupt feedback because source/host scripts do not disable Src_ objects.','Correct-drop count and source enabled=false are committed at drop, before feedback completion.','Wrong feedback completes without dismissal and increments quizTryCount only at its own terminal script.','Only completed right feedback with quizDragCount>=5 resumes main239.','Five popup instances have source stop1, open2 and independent child timelines; multiple visible instances are permitted by source scripts.','At main238, mc2/mc3/mc4 are recreated while mc1/mc5 persist.','Six glossary handlers have repeated source placements and stop the main animation.'],'unresolvedSourceReferences':['Press reset loop refers to absent Mc_Wrong_Feed4.','mc5 frame2 calls absent mc4_a.','Wrong feedback214 and226 entry call absent page enableButton.','Feedback terminals refer to NMHBtn although page has no named NMHBtn.','Exact original-host association, Adobe random state, original drop-target hit semantics and source audio/visual acceptance remain unproven.'],'inputBindings':list(pins.values()),'registered':False,'productCalibrationPassed':False,'audioAccepted':False,'originalRuntimeAccepted':False,'humanAccepted':False,'ownerAccepted':False}
 for p in list(pins.values()):read(p['path'],p)
 return result
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();result=build();data=(json.dumps(result,ensure_ascii=False,indent=2)+'\n').encode();p=O/'contract.json'
 if args.check:assert p.read_bytes()==data
 else:
  O.mkdir()
  with p.open('xb') as f:f.write(data)
 print(json.dumps({'output':str(p),'dragItems':5,'feedback':7,'popupInstances':5,'popupOpenButtons':7,'glossaryHandlers':6,'checked':args.check}))
