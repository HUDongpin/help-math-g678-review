"""Source text-cell geometry and frame-by-frame emphasis; no invented fees or graph."""
from pathlib import Path
import importlib.util,hashlib,json,xml.etree.ElementTree as E,sys
BASE=Path(__file__).resolve().parent.parent;ROOT=BASE.parents[1]
spec=importlib.util.spec_from_file_location('source',Path(__file__).with_name('derive-source-v1.py'));a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
m=a.build();assert json.loads((BASE/'native-v1/source-model-v1.json').read_bytes())==m
rt=E.parse(BASE/'source-v1/movie.xml').getroot().find('Header/tags');fonts={int(t.get('objectID')):t for t in rt.findall('DefineFont2')};defs={int(t.get('objectID')):t for t in rt.findall('DefineText')}
rows=[]
for cid,plan,monthly,rate in [(156,'Smooth Talk','0','$.20/minute'),(157,'Easy Talk','$50','$.05/minute'),(158,'Super Talk','$60','$.03/minute')]:
 text=next(t['text'] for t in m['textDefinitions'] if t['characterId']==cid);assert plan in text and monthly in text and rate in text
 glyphs=[];font=None;x=0;chars=''
 for rec in defs[cid].findall('.//TextRecord6'):
  if rec.get('objectID'):font=int(rec.get('objectID'))
  if rec.get('x'):x=int(rec.get('x'))
  if rec.get('isSetup')=='0':
   codes=[chr(int(g.get('map'))) for g in fonts[font].find('glyphs')]
   for g in rec.findall('.//TextEntry'):
    c=codes[int(g.get('glyph'))];advance=int(g.get('advance'));glyphs.append({'character':c,'x':x,'endX':x+advance});x+=advance;chars+=c
 assert chars==text
 cells={}
 for key,value in [('monthly',monthly),('rate',rate)]:
  start=text.index(value);end=start+len(value);cells[key]={'value':value,'sourceTextId':f'character-{cid}','characterRange':[start,end-1],'boundsTwips':{**defs[cid].find('bounds/Rectangle').attrib,'left':str(glyphs[start]['x']),'right':str(glyphs[end-1]['endX'])}}
 rows.append({'characterId':cid,'plan':plan,'monthly':monthly,'rate':rate,'cells':cells})
frameStates=[]
for f in m['frames']:
 source={t['objectId']:t for t in f['sourceTextInstances']};native=[]
 for row in rows:
  inst=source.get(row['characterId']);cells=[]
  for key,c in row['cells'].items():
   box=a.stagebox(c['boundsTwips'],inst['matrixTwips']) if inst else None
   cells.append({'key':key,'box':box,'text':c['value']})
  native.append({'sourceTextId':f"character-{row['characterId']}",'plan':row['plan'],'monthly':row['monthly'],'rate':row['rate'],'visible':bool(inst and inst['fullBoardGlyphBoxVisible']),'cells':cells})
 accents=[]
 positive={g['objectId'] for g in f['sourceTextInstances'] if g['fullBoardGlyphBoxVisible']}
 ownedRow=2 if positive.intersection({427,431}) else 1 if 421 in positive else 0 if 411 in positive else None
 for glyph in f['sourceTextInstances']:
  if glyph['objectId'] in (155,156,157,158,160) or not glyph['fullBoardGlyphBoxVisible']:continue
  box=glyph['sourceStageBoxPx'];point=((box[0]+box[2])/2,(box[1]+box[3])/2);rank=[]
  for ri,row in enumerate(native):
   if not row['visible'] or (ownedRow is not None and ri!=ownedRow):continue
   for c in row['cells']:
    b=c['box'];distance=(point[0]-(b[0]+b[2])/2)**2+(0 if ownedRow is not None else 4*(point[1]-(b[1]+b[3])/2)**2)
    rank.append((distance,ri,c['key'],b))
  if not rank:continue
  _,ri,key,b=min(rank)
  # Source emphasis is related geometrically only when close to its exact cell.
  if b[0]-20<=point[0]<=b[2]+20 and (ownedRow is not None or b[1]-15<=point[1]<=b[3]+15):accents.append({'row':ri,'cell':key,'sourceGlyphId':glyph['objectId']})
 frameStates.append({'frame':f['frame'],'tableVisible':all(r['visible'] for r in native),'sourceTextIds':f['positiveFullyVisibleTextIds'],'accents':accents})
result={'schemaVersion':1,'animationId':m['animationId'],'sourceSha256':m['physicalSource']['sha256'],'sourceModelSha256':hashlib.sha256((BASE/'native-v1/source-model-v1.json').read_bytes()).hexdigest(),'method':'Exact decoded primary table strings; native availability from source transform + positive alpha + conservative inside source clip1 rectangle. Emphasis row ownership from unique source glyph2/5/6/3 identities corresponding to exact0.20/50/60/0.03 values; shared moving letters inherit that source run, cell column from bounded source glyph/cell geometry. Canvas retains complete original source drawing.','rows':rows,'frames':frameStates,'sourceTitle':next(t['text'] for t in m['textDefinitions'] if t['characterId']==453),'tableTitle':next(t['text'] for t in m['textDefinitions'] if t['characterId']==160),'claim':'Current-JS semantic text candidate, original-runtime timing and listening acceptance unverified'}
p=BASE/'native-v1/teaching-state-v2.json';b=(json.dumps(result,indent=2,ensure_ascii=False)+'\n').encode()
if '--check' in sys.argv:assert p.read_bytes()==b
else:p.open('xb').write(b)
print(json.dumps({'pass':True,'firstCompleteTable':next(f['frame'] for f in frameStates if f['tableVisible']),'frame900':frameStates[899],'frame1077':frameStates[1076]}))
