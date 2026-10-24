"""Source-locked NMS question/hint/feedback contract. No runtime or registration mutation."""
import hashlib,importlib.util,json,re,xml.etree.ElementTree as ET
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent;BASE=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f');OUT=BASE/'interactive-source-audit-v1';pins={}
def read(p,expected=None):
 p=Path(p);s=p.stat();b=p.read_bytes();a=p.stat();assert(s.st_ino,s.st_mtime_ns,s.st_size)==(a.st_ino,a.st_mtime_ns,a.st_size);d={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert d==expected
 pins[str(p)]=d;return b
def js(p):return json.loads(read(p))
def save(p,d):
 with p.open('x') as f:json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
binary=js(OUT/'binary-source-audit.json');source=next(r for r in binary['records'] if r['animationId']=='shared-nms002-l11-p030');read(source['source']['path'],source['source']);x=ET.fromstring(read(source['xml']['path'],source['xml']));scripts={s['relativePath']:s for s in source['sourceScripts']}
for s in scripts.values():assert read(s['binding']['path'],s['binding']).decode()==s['text']
def textscript(p):return scripts[p]['text'].replace('\r\n','\n')
defs={int(n.get('objectID')):n for n in x.iter() if n.tag.startswith('Define') and n.tag not in ('DefineFontName','DefineFontInfo','DefineFontInfo2') and n.get('objectID')};fonts={i:[chr(int(g.get('map'))) for g in n.find('glyphs')] for i,n in defs.items() if n.tag=='DefineFont2'}
texts={}
for i,n in defs.items():
 if n.tag not in ('DefineText','DefineText2'):continue
 font=None;px=py=0;runs=[]
 for r in n.findall('.//TextRecord6'):
  if r.get('objectID'):font=int(r.get('objectID'))
  if r.get('x') is not None:px=int(r.get('x'))
  if r.get('y') is not None:py=int(r.get('y'))
  glyphs=r.findall('./glyphs/TextEntry')
  if glyphs:
   content=''.join(fonts[font][int(g.get('glyph'))] for g in glyphs);runs.append({'text':content,'fontId':font,'xTwips':px,'yTwips':py,'glyphIndices':[int(g.get('glyph')) for g in glyphs]});px+=sum(int(g.get('advance')) for g in glyphs)
 texts[i]={'text':''.join(r['text'] for r in runs),'runs':runs}
def placements(n):
 frame=1;rows=[]
 for t in n.find('tags'):
  if t.tag=='ShowFrame':frame+=1
  elif t.tag.startswith('PlaceObject') and t.get('objectID'):
   rows.append({'frame':frame,'characterId':int(t.get('objectID')),'depth':int(t.get('depth')),'instanceName':t.get('name'),'transform':t.find('transform/Transform').attrib if t.find('transform/Transform') is not None else {}})
 return rows
main=defs[260];popup=defs[39];mp=placements(main);pp=placements(popup);assert int(main.get('frames'))==356 and int(popup.get('frames'))==1
named={r['instanceName']:r for r in mp if r['instanceName']};assert named['Mc_PopUp']['frame']==97 and named['Mc_PopUp']['characterId']==39
assert textscript('DefineSprite_260/frame_97/DoAction.as')=='stop();\n_global.quizSection = true;\n_global.quizTryCount = 0;\nMc_PopUp._visible = false;\n'
assert 'Mc_PopUp._visible = true;' in textscript('DefineButton2_40/BUTTONCONDACTION on(release).as')
assert next(r for r in pp if r['instanceName']=='BtnClose')['characterId']==38
assert texts[49]['text']=='Click the rational number that is NOT equivalent to 1.250'
assert [r['text'] for r in texts[68]['runs']]==['1','250'];assert texts[68]['runs'][0]['yTwips']<texts[68]['runs'][1]['yTwips'];assert texts[67]['text']=='1'
assert [r['text'] for r in texts[64]['runs']]==['1250','1000'];assert texts[64]['runs'][0]['yTwips']<texts[64]['runs'][1]['yTwips']
assert texts[56]['text']=='5' and texts[55]['text']=='4';assert texts[60]['text']=='25' and texts[59]['text']=='100' and texts[61]['text']=='1'
answers=[]
for id,char,label,whole,num,den,textids in [('AnsBtn1',71,'A',1,1,250,[66,67,68]),('AnsBtn2',69,'B',0,5,4,[54,55,56]),('AnsBtn3',70,'C',1,25,100,[58,59,60,61]),('AnsBtn4',72,'D',0,1250,1000,[63,64])]:
 assert named[id]['characterId']==char and named[id]['frame']==97;value=Fraction(whole)+Fraction(num,den);correct='_root.showRightFeed();' in textscript(f'DefineButton2_{char}/BUTTONCONDACTION on(release).as');assert correct==(value!=Fraction(5,4));answers.append({'id':id,'sourceCharacterId':char,'label':label,'whole':whole,'numerator':num,'denominator':den,'textCharacterIds':textids,'rationalValue':str(value),'correctForNotEquivalentQuestion':correct,'placement':named[id]})
assert texts[9]['text']=='To write equivalent fractions and decimals, divide the fraction’s numerator by the denominator.'
assert texts[18]['text']=='1.75' and texts[23]['text']=='4' and texts[24]['text']=='3' and texts[20]['text']=='100' and texts[21]['text']=='75' and texts[22]['text']=='1';assert Fraction(1)+Fraction(3,4)==Fraction(175,100)==Fraction(1)+Fraction(75,100)
helper=ROOT/'scripts/audit-g678-frozen16-glossary.py';read(helper);spec=importlib.util.spec_from_file_location('glossary',helper);gl=importlib.util.module_from_spec(spec);spec.loader.exec_module(gl)
xmls={}
for lang,sha in [('en',gl.SHA_EN),('es',gl.SHA_ES)]:
 p=gl.RECOVERY/f'objects/sha256/{sha[:2]}/{sha}';b=read(p);assert hashlib.sha256(b).hexdigest()==sha;xmls[lang]=gl.term_index(b.decode('utf-8-sig'))
glossary=[]
for char in [12,13,14,26,27,28,51,52]:
 script=textscript(f'DefineButton2_{char}/BUTTONCONDACTION on(release).as');m=re.fullmatch(r'on\(release\)\{\n(?:   q;\n)?   _global.KeyAttribute = "([^"\n]+)";\n   _root.DoHyperLinks\(\);\n   _root.animation_mc.animation.stop\(\);\n\}\n',script);assert m;key=m[1];left=xmls['en'][key.casefold()];right=xmls['es'][key.casefold()];assert len(left)==len(right)==1;parent='popup-39' if char<30 else 'main-260';placements_for_button=[r for r in (pp if char<30 else mp) if r['characterId']==char];assert placements_for_button
 glossary.append({'sourceCharacterId':char,'sourceKeyAttribute':key,'parent':parent,'visibilityCondition':'hint-open' if char<30 else 'source-main-placement','placements':placements_for_button,'labels':{'en':left[0]['labels']['en'],'es':right[0]['labels']['es']},'definitions':{'en':left[0]['definitions']['en'],'es':right[0]['definitions']['es']},'entryHashes':{'en':left[0]['sourceEntrySha256'],'es':right[0]['sourceEntrySha256']},'bareQExpressionRetainedAsEvidence':'   q;' in script})
host=read(BASE/'canonical-indexmi-host-audit-v1/scripts/scripts/frame_35/DoAction.as').decode().replace('\r\n','\n');hostBinding=js(BASE/'canonical-indexmi-host-audit-v1/source-binding.json');hostBytes=read(hostBinding['casPath']);assert hashlib.sha256(hostBytes).hexdigest()==hostBinding['source']['sha256']
functions={}
for name in ['showWrongFeed','showRightFeed','disableQuizButton','enableQuizButton']:
 start=host.index('function '+name+'()');end=host.index('\nfunction ',start+1);functions[name]=host[start:end]
assert 'random(3)' in functions['showWrongFeed'] and 'random(4)' in functions['showRightFeed'];assert '.gotoAndPlay(2)' in functions['showWrongFeed'] and '._x = 5;' in functions['showWrongFeed'];assert '.gotoAndPlay(2)' in functions['showRightFeed'] and '._x = 5;' in functions['showRightFeed']
feedback=[]
for name,r in named.items():
 if not re.fullmatch('Mc_(Wrong|Right)_Feed[1-5]',name):continue
 i=r['characterId'];kind='wrong' if 'Wrong' in name else 'right';end=int(defs[i].get('frames'));entry=textscript(f'DefineSprite_{i}/frame_1/DoAction.as');assert entry=='stop();\n';terminal=textscript(f'DefineSprite_{i}/frame_{end}/DoAction.as');assert 'this.gotoAndStop(1);' in terminal and '_parent.play();' in terminal
 if kind=='wrong':assert textscript(f'DefineSprite_{i}/frame_22/DoAction.as')=='stop();\n';assert 'quizTryCount >= 2' in terminal
 feedback.append({'instanceName':name,'characterId':i,'kind':kind,'frames':end,'entryStopFrame':1,'hostRequestedPlayFrame':2,'pauseForDismissalFrame':22 if kind=='wrong' else None,'dismissResumeFrame':23 if kind=='wrong' else None,'terminalScript':scripts[f'DefineSprite_{i}/frame_{end}/DoAction.as']['binding'],'placedAtQuestion':r,'selectedByAuditedIndexMISnapshot':int(name[-1])<=(3 if kind=='wrong' else 4),'sourceStillRetained':True})
assert len(feedback)==9;assert sum(r['selectedByAuditedIndexMISnapshot'] for r in feedback)==7
read(__file__)
result={'status':'nms-question-hint-and-feedback-source-contract-recovered','animationId':source['animationId'],'source':source['source'],'sourceXml':source['xml'],'registeredSnapshot':'379-v22','sourceGlyphTexts':texts,'question':{'prompt':texts[49]['text'],'answers':answers,'stopFrame':97,'resumeFrame':98,'mainFrameCount':356,'mainTerminalStopNotPresent':True},'hint':{'sourcePresent':True,'mainInstance':'Mc_PopUp','characterId':39,'textCharacterIds':[r['characterId'] for r in pp if r['characterId'] in texts],'explanation':texts[9]['text'],'example':{'whole':1,'numerator':3,'denominator':4,'decimal':'1.75','equivalentWhole':1,'equivalentNumerator':75,'equivalentDenominator':100},'closeInstance':'BtnClose','allPlacements':pp,'modernProductStillPlaceholder':True},'glossary':glossary,'feedback':feedback,'hostFunctions':functions,'hostScope':'This exact canonical indexMI snapshot selects three wrong and four right clips, starts at child frame2 and moves x to5. Original environment association and Adobe random state remain unaccepted; all nine source-present clips remain in custody and decoder scope.','runtimeRequirements':['Main source clock must stop at97 and resume at98 only after source-defined feedback resolution.','Start selected feedback at child2, never automatically on placement at97.','Wrong feedback holds at22 until explicit dismissal resumes23; only second wrong completion resumes main.','Right feedback completion resumes main; audio EOF alone cannot resolve the question.','Render source hint and six nested glossary buttons only when open; two main glossary buttons use source placement visibility.','Silence all active audio on pause, Replay, navigation and rejected/stale transitions.','Retain negative terminal block evidence for exact mapping and original-runtime review.'],'inputBindings':list(pins.values()),'productCalibrationPassed':False,'audioAccepted':False,'originalRuntimeAccepted':False,'humanAccepted':False,'ownerAccepted':False}
for p in list(pins.values()):read(p['path'],p)
save(OUT/'nms-l11-contract.json',result);print(json.dumps({'output':str(OUT/'nms-l11-contract.json'),'answers':len(answers),'glossaryButtons':len(glossary),'feedbackClips':len(feedback),'hintSourceRecovered':True}))
