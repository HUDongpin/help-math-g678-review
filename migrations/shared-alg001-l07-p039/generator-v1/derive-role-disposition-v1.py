from pathlib import Path
import json,hashlib,re,datetime
B=Path(__file__).resolve().parents[1];R=Path.cwd();m=json.loads((B/'native-v1/source-model-v1.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
pin=lambda p:dict(path=str(p.relative_to(R)),bytes=p.stat().st_size,sha256=sha(p.read_bytes()))
ts={int(t['timelineId'].split('-')[1]):t for t in m['timelines']if t['timelineId']!='root'};bs={b['characterId']:b for b in m['buttons']};sh={s['characterId']:s for s in m['shapes']};texts={t['characterId']:t for t in m['texts']};dormant={249,266,301,318,331,346}
for id in dormant:
 assert ts[id]['frames'][0]==[]
 raw=next(s['source']for s in m['scripts']if s['file']['path'].endswith(f'DefineSprite_{id}/frame_1/DoAction.as'));assert re.sub(r'\s','',raw)==('stop();_parent.enableButton();'if id in[318,346]else'stop();')
def reach(seed,prune):
 seen=set();q=list(seed)
 while q:
  id=q.pop()
  if id in seen:continue
  seen.add(id)
  if id in ts:q.extend(p['characterId']for row in(ts[id]['frames'][:1]if prune and id in dormant else ts[id]['frames'])for p in row)
  elif id in bs:q.extend(p['characterId']for p in bs[id]['statePlacements'])
 return seen
active=reach([191,366],True);placed=reach([191,366],False);allIds=set(ts)|set(bs)|set(sh)|set(texts)
assert set(ts)-placed=={8,9,11,12,13,14,61,62,90,93,103,112,113,124,127,128,129,130,131,132}
activeTimelineIds=active&set(ts)-dormant;assert activeTimelineIds=={188,191,280,357,361,366}
for s in m['scripts']:
 p=s['file']['path'];match=re.search(r'Define(?:Sprite|Button2)_(\d+)',p)
 if p.endswith(('FScrollBarSymbol.as','FScrollPaneSymbol.as','FUIComponentSymbol.as')):continue
 if match and int(match[1])not in active:continue
 assert 'attachMovie('not in s['source']and 'new FScroll'not in s['source']
roles={1:'Native Need More Help button background',2:'Native button highlight',6:'Native button highlight',133:'Native help dialog frame and glossary underlines',137:'Invisible glossary hit region; native semantic buttons',143:'Exact help linear grid/axes',150:'Exact help linear cyan curve',153:'Exact help nonfunction grid/axes',179:'Exact sideways red parabola',190:'Native source-derived title, outlined text inspected',192:'Native question-number circle',195:'Native question glossary underline',200:'Native answer A control',201:'Exact A grid/axes',202:'Exact A vertical black line',203:'Native answer B control',204:'Exact B grid/axes',205:'Exact B parabola',206:'Native answer C control',207:'Exact C grid/axes',208:'Exact C crossed lines',209:'Native answer D control',210:'Exact D grid/axes',211:'Exact D sloped line',215:'Native Close button border',216:'Native Close button backing',217:'Native Close button fill',218:'Native Close button highlight',220:'Native Close hover background',221:'Native Close shadow',222:'Native Close pressed background',223:'Native Close hit region',312:'Native wrong-feedback message panel',349:'Feedback display mask; native bounded feedback region',350:'Outlined Try Again title duplicated by source text352; native title retains words and measured alpha',362:'White underlay at depth1 behind B/C buttons on white background; no invented front flash',363:'Exact yellow upward-growing morph highlight on A',364:'Exact black vertical highlight on A',365:'Exact yellow full-length vertical highlight on A'}
for i in (active&set(sh))-set(roles):
 assert i in{267,268,269,270,271,275,276,277,279,347,348,353,354,358,359,360};roles[i]='Decorative right/wrong feedback artwork retained privately; source title/message/Close/audio timing represented with native feedback card'
assert set(roles)==active&set(sh)
domains=[]
for key,t in [('root',next(t for t in m['timelines']if t['timelineId']=='root'))]+[(f'sprite-{i}',t)for i,t in ts.items()]:
 id=None if key=='root'else int(key[7:]);role='active source domain'if id is None or id in activeTimelineIds else'placed at quiz but stopped empty at frame1 and never selected'if id in dormant else'only reached through dormant feedback after frame1'if id in placed else'unplaced library/legacy component'
 domains.append(dict(frameDomain=key,frames=t['declaredFrameCount'],disposition=role,inProduct=id is None or id in activeTimelineIds,originalRuntimeVerified=False))
shapeRows=[dict(characterId=i,tagName=sh[i]['tagName'],sourceTagSha256=sh[i]['sourceTagSha256'],disposition=roles[i]if i in active else'dormant feedback asset retained, not called'if i in placed else'unplaced library asset retained, not in page execution')for i in sorted(sh)]
receipt=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source=pin(B/'native-v1/source-model-v1.json'),visual=pin(B/'native-v1/teaching-visual-source-v2.json'),domains=domains,shapes=shapeRows,activeDefinitions=sorted(active),placementReachableDefinitions=sorted(placed),unplacedDefinitions=sorted(allIds-placed),activeButtonIds=sorted(active&set(bs)),risks=[dict(kind=r['kind'],disposition='sprite249 is dormant empty stop1; nonzero trailing bytes retained, never interpreted'if r['kind']=='nonzero-bytes-after-end'else'see exact shape/domain/action/visual/dynamic-text records; engineering recovery does not establish original-runtime fidelity')for r in m['risks']],dynamicText=[dict(characterId=i,disposition='source WrongFeed mapped from selected answer and attempt counter'if i==356 else'dormant feedback field retained, not instantiated')for i,t in texts.items()if t.get('kind')!='static-text'],libraryScripts=[s['file']for s in m['scripts']if s['file']['bytes']>2000],unresolvedLocalCallback=dict(sprites=[318,346,361],call='_parent.enableButton()',resolution='No enableButton definition exists in main366 or root scripts. Preserve unresolved local callback; do not substitute _root.enableQuizButton or unlock controls.'),boundary='Complete placement reachability with six named dormant feedback timelines stopped at1. Generic FScroll definitions register library classes; no active placement or active page script constructs them. No source/runtime acceptance claim.',originalRuntimeAccepted=False)
(B/'audit-v1/source-role-disposition-v1.json').open('x').write(json.dumps(receipt,indent=2)+'\n')
files=[p for p in(B/'audit-v1/source-static-v1').rglob('*-white.png')]+[p for p in(B/'audit-v1/source-static-v2').rglob('*-white.png')]+sorted((B/'audit-v1').glob('source-shapes-contact-*-v2.png'))
assert len(files)==19
review=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),reviewer='Codex source engineering review',viewedFiles=[pin(p)for p in files],roleAudit=pin(B/'audit-v1/source-role-disposition-v1.json'),corrections=[dict(prior='audit-v1/source-static-render-v1.json',correction='Only static main61 shows the popup that ActionScript hides; main62 removes popup and shows all four choices.'),dict(prior='native-v1/teaching-visual-source-v1.json',correction='White source362 is depth1 behind B/C buttons, not a visible front flash; successor v2 retains only the underlay placement. Source silhouettes and actual158/169 images reviewed.')],findings=['Exact title Linear and Nonlinear Functions: Try It!','Main375 retains D alone after A/B/C fade, with source D relocation.','Main236/248/300 show upward yellow A-line emphasis.','Help contains sideways red parabola and cyan straight line plus exact explanation paragraphs.','Feedback right title Excellent!; wrong outlined Try Again! matches text352. Static wrong panel has no WrongFeed because ActionScript was not executed.'],scope='Static FFDec and source glyph/vector/ActionScript engineering review. No Adobe/original-runtime capture, listening, human or Owner acceptance.')
(B/'audit-v1/source-parent-review-v2.json').open('x').write(json.dumps(review,indent=2)+'\n');print(json.dumps(dict(pass_=True,sourceDomains=len(domains),productDomains=sum(d['inProduct']for d in domains),shapeDefinitions=len(shapeRows),activeShapes=len(roles),viewedFiles=len(files))))
