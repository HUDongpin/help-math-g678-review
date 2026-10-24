from pathlib import Path
import hashlib,json,re,sys

B=Path(__file__).resolve().parents[1];R=Path.cwd()
read=lambda p:json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return dict(path=str(p.relative_to(R)) if p.is_relative_to(R) else str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
custody=read(B/'audit-v1/source-custody-v1.json')
for row in custody['sourceFiles']:
 a=Path(row['source']);b=R/row['copy'];assert a.resolve()==a
 assert a.read_bytes()==b.read_bytes() and pin(a)['sha256']==row['sha256'] and pin(a)['bytes']==row['bytes']
catalog=read(B/'source-v1/source-text-catalog-v1.json');assert catalog['sourceSha256']==custody['sourceFiles'][0]['sha256']
scripts=sorted((B/'source-v1/ffdec/scripts').rglob('*.as'));assert len(scripts)==80 and len(catalog['timelines'])==32
def source(rel):return (B/'source-v1/ffdec/scripts'/rel).read_text()
def one(pattern):
 rows=[p for p in scripts if re.search(pattern,str(p.relative_to(B/'source-v1/ffdec/scripts')))];assert len(rows)==1,pattern;return rows[0]
draw=one(r'^DefineButton2_63/');select=one(r'^DefineButton2_65/');init=one(r'^DefineSprite_288/frame_318/DoAction.as$')
assert 'function hideMovieClip()\n{\n}' in init.read_text()
assert '_global.quizTryCount++;' in draw.read_text() and '_global.quizTryCount = 0;' in init.read_text()
assert 'tempAns = "PT_2,PT_3,PT_4,PT_5";' in draw.read_text()
assert '_global.C = "PT_5";\n         _global.Y = "PT_3";' in draw.read_text()
assert 'Mc_Wrong_Feed4.gotoAndPlay' not in draw.read_text()
main=next(t for t in catalog['timelines'] if t['timelineId']=='sprite-288');assert main['declaredFrameCount']==641
live={}
for e in main['events']:
 if e['frame']>318:break
 if e['kind']=='remove':live.pop(e['depth'])
 elif e['kind']=='place':live[e['depth']]={**(live.get(e['depth'],{}) if e.get('move') else {}),**e}
named={p['name']['text']:p for p in live.values() if p.get('name')}
points=[]
for i,character in enumerate([73,75,76,77,78],1):
 name=f'PT_{i}';p=named[name];assert p['characterId']==character
 action=one(rf'^DefineSprite_288/frame_318/PlaceObject2_{character}_{p["depth"]}/')
 slot='Y' if i==1 else 'C';assert f'_global.{slot} = this._name;' in action.read_text()
 points.append(dict(name=name,characterId=character,depth=p['depth'],matrix=p['matrix'],slot=slot,placementTagSha256=p['sourceTagSha256'],release=pin(action)))
wrong=[];right=[]
for prefix,ids,holds,exits,target in [('Mc_Wrong_Feed',[143,158,173,188],[22,20,20,21],[31,28,29,28],wrong),('Mc_Right_Feed',[213,264,230,244],[None]*4,[27,33,28,32],right)]:
 for i,character,hold,end in zip(range(1,5),ids,holds,exits):
  assert named[f'{prefix}{i}']['characterId']==character
  timeline=next(t for t in catalog['timelines'] if t['timelineId']==f'sprite-{character}');assert timeline['declaredFrameCount']==end
  script=one(rf'^DefineSprite_{character}/frame_{end}/DoAction.as$')
  if prefix=='Mc_Wrong_Feed':
   assert '_global.quizTryCount++;' not in script.read_text()
   assert '_parent.GLine_Mc._visible = false;' in script.read_text() and 'if(_global.quizTryCount >= 2)' in script.read_text()
  target.append(dict(instance=f'{prefix}{i}',characterId=character,holdFrame=hold,terminalFrame=end,terminalAction=pin(script)))
helpAction=one(r'^DefineButton2_10/');assert 'Mc_Popup1.Mc_Ani.Mc_Ani1.gotoAndPlay(2);' in helpAction.read_text() and 'Mc_Popup1.Mc_Ani.Mc_Ani2.gotoAndPlay(2);' in helpAction.read_text()
messages=re.findall(r'(?:txtFeed.text|_global.WrongFeed) = "([^"]+)";',draw.read_text()+select.read_text())
model=dict(schemaVersion=1,kind='source-two-point-graph-behavior-v1',animationId=custody['animationId'],source=custody['sourceFiles'][0],sourceCatalog=pin(B/'source-v1/source-text-catalog-v1.json'),producer=pin(Path(__file__).resolve()),placement=custody['placement'],timeline=dict(rootEntry=6,mainSprite=288,quizFrame=318,terminalFrame=641,fps=12),points=points,sourceControls={n:dict(characterId=named[n]['characterId'],depth=named[n]['depth'],matrix=named[n]['matrix'])for n in ['DL_Btn','Wrong_Btn','NMHBtn','Mc_Popup','Mc_Popup1','Mc_Popup3','point_mc']},sourceActions=[pin(p)for p in scripts],drawAction=pin(draw),arbitraryPointAction=pin(select),initialization=pin(init),helpAction=pin(helpAction),messages=messages,wrongFeedbackVariants=wrong,rightFeedbackVariants=right,
 transitionRules=[
  'Entering frame318 resets attempts to0, mcCount to100 and both selection names to empty; source main holds.',
  'PT_1 writes Y; PT_2..PT_5 write C. Clicking a named point disables that point and selects its frame2. A later C point overwrites C if Y is still empty.',
  'A background click duplicates point_mc with a new Mc_N name at the source mouse coordinates. It fills Y when empty, otherwise C. Source mcCount increases monotonically within that quiz attempt sequence.',
  'With both slots filled, further point/background selections show the two-points popup and disable point, Draw Line and Help controls.',
  'Draw Line with either slot empty shows the missing-points popup without increasing attempts.',
  'When Y is PT_1 and C is PT_2..PT_5, Draw Line rewrites Y=PT_3,C=PT_5 before drawing the full accepted line.',
  'Draw Line connects C to Y with source lineStyle(3,255,100). If both resulting names are PT_2..PT_5, it calls the external _root.ShowRightFeed.',
  'Otherwise Draw Line increments attempts immediately, clears both names and calls external _root.ShowWrongFeed. First hint ends Try again.; subsequent hint does not.',
  'A wrong feedback terminal restores controls, hides the line and removes duplicated points. At attempts>=2 it resets attempts to0 and resumes main; it never increments attempts itself.',
  'Help opens animated popup1 and starts both nested Mc_Ani timelines at2. This is not the static-help behavior used on P044/P045.',
  'hideMovieClip is an empty source function. Do not invent clearing of named-point frames from that function.',
  'Main frame641 stops without a next-page or lesson-completion call.'
 ],
 unresolved=[
  'The exact _root.ShowRightFeed and _root.ShowWrongFeed dispatch implementations are absent from this page. All four local variants exist; dispatch selection cannot be inferred as fixed feedback4.',
  'Animated help child timelines, source audio ownership and Coach_audio_1/2 require dedicated audit before the maintained implementation.',
  'Named-point hit geometry and native graph coordinate transforms require source-shape analysis and browser validation.',
  'Original runtime, fidelity, listening, human/Owner, strict completion and publication are unaccepted.'
 ],registered=False,implementation=False)
out=B/'native-v1/two-point-behavior-v1.json';content=json.dumps(model,indent=2)+'\n'
if '--check' in sys.argv or out.exists():assert out.read_text()==content
else:out.open('x').write(content)
print(json.dumps(dict(output=pin(out),namedPoints=len(points),wrongFeedbackVariants=len(wrong),rightFeedbackVariants=len(right),registered=False)))
