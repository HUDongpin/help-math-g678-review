"""Project exact source cards into native table/math text and retained vector geometry."""
from pathlib import Path
import json,sys,xml.etree.ElementTree as E,hashlib
sys.path.insert(0,"scripts/lib");from g678_fixed_exit_visual_v1 import alpha,spans
B=Path('migrations/shared-alg001-l07-p052');m=json.loads((B/'native-v1/source-model-v1.json').read_text());ts={t['timelineId']:t for t in m['timelines']};texts={t['characterId']:t for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();defs={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')};N='{http://www.w3.org/2000/svg}'
def text_item(p):
 t=texts[p['characterId']];a,b,c,d,e,f=p['matrix'];assert b==c==0;return dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=''.join(r['text']for r in t['runs']),x=(a*t['boundsTwips']['left']+e)/20,y=(d*t['boundsTwips']['top']+f)/20,runs=t['runs'],matrix=p['matrix'],textMatrix=t['matrix'])
def graph_label(q):
 t=texts[q['characterId']];a,b,c,d,e,f=q['matrix'];assert b==c==0;assert t['matrix'][:4]==[1,0,0,1];assert len(t['runs'])==1;r=t['runs'][0]
 return dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=r['text'],x=(e+a*(t['matrix'][4]+(r['xOffsetTwips']or 0)))/20,y=(f+d*(t['matrix'][5]+(r['yOffsetTwips']or 0)))/20,fontSize=d*r['fontHeightTwips']/20)
def paths(id):
 root=E.parse(B/f'source-v1/ffdec/shapes/{id}.svg').getroot();return[{k:v for k,v in p.attrib.items()if k in ['d','fill','fill-opacity','fill-rule','stroke','stroke-opacity','stroke-width','stroke-linecap','stroke-linejoin']}for p in root.iter(N+'path')]
def image_shape(id):
 d=defs[id];r={k:int(v)for k,v in d.find('bounds/Rectangle').attrib.items()};fill=d.find('styles/StyleList/fillStyles/TiledBitmap');assert fill is not None;t=fill.find('matrix/Transform');assert t.get('scaleX')==t.get('scaleY');a=float(t.get('scaleX'));x=float(t.get('transX'));y=float(t.get('transY'));return dict(shapeId=id,bitmapId=int(fill.get('objectID')),sourceBounds=r,crop=[(r['left']-x)/a,(r['top']-y)/a,(r['right']-r['left'])/a,(r['bottom']-r['top'])/a])
levels=[]
expected_tables={110:[['–3','1'],['5','–2']],113:[['1','1'],['–1','1']],127:[['1','–3'],['–2','5']],132:[['–3','5'],['1','–2']],135:[['3','3'],['–3','–3']],138:[['5','–3'],['–2','1']]}
equations={254:dict(kind='fraction',prefix='y = ',numerator='3',denominator='4',variable='X',suffix='–2 '),275:dict(kind='plain',text=' y = x + 1'),284:dict(kind='power',base='y = x',exponent='2'),293:dict(kind='fraction',prefix='y = – ',numerator='8',denominator='3',variable='X',suffix=''),296:dict(kind='plain',text='y = x'),299:dict(kind='power',base='y = x',exponent='3')}
for level in m['findings']['levels']:
 cards=[]
 for p in level['cards']:
  id=p['characterId'];row=ts[f'sprite-{id}']['frames'][0];tt=[text_item(q)for q in row if q['characterId']in texts];ss=[q for q in row if q['characterId']not in texts];card=dict(name=p['name'],characterId=id,pair=int(p['name'][2]),side=int(p['name'][-1]),sourceMatrix=p['matrix'],textBindings=tt)
  if id in expected_tables:
   ordered=sorted(tt,key=lambda q:q['x']);left=sorted(ordered[:3],key=lambda q:q['y']);right=sorted(ordered[3:],key=lambda q:q['y']);assert[left[0]['text'],right[0]['text']]==['Input','Output'];rows=[[a['text'],b['text']]for a,b in zip(left[1:],right[1:])];assert rows==expected_tables[id];card.update(kind='table',headers=['Input','Output'],rows=rows)
  elif id in equations:
   eq=equations[id];assert ([q['text']for q in tt]==([eq['prefix'],eq['numerator'],eq['denominator'],eq['variable']]+([eq['suffix']]if eq['suffix']else[])if eq['kind']=='fraction'else[eq['text']]if eq['kind']=='plain'else[eq['base']+eq['exponent']]));card.update(kind='equation',equation=eq)
  else:
   assert any(q['text']=='x'for q in tt)and any(q['text']=='y'for q in tt);card.update(kind='graph',viewBox=[-60,-55,120,115],labels=[graph_label(q)for q in row if q['characterId']in texts],shapes=[dict(characterId=q['characterId'],matrix=[*q['matrix'][:4],q['matrix'][4]/20,q['matrix'][5]/20],paths=paths(q['characterId']))for q in ss])
  # Each revealed cell retains its original named bitmap crop; source photos are not replaced.
  piece=min([q for q in level['imagePieces']if q['name'].startswith(p['name'].split('_')[0]+'_Img')],key=lambda q:(q['matrix'][4]-p['matrix'][4])**2+(q['matrix'][5]-p['matrix'][5])**2);assert abs(piece['matrix'][4]-p['matrix'][4])<50 and abs(piece['matrix'][5]-p['matrix'][5])<50;card['rewardInstance']=piece['name'];srow=ts[f"sprite-{piece['characterId']}"]['frames'][0];assert len(srow)==1;card['reward']=dict(spriteId=piece['characterId'],**image_shape(srow[0]['characterId']))
  bound=defs[ss[0]['characterId']].find('bounds/Rectangle');card['sourceTop']=(p['matrix'][5]+float(bound.get('top')))/20;card['sourceLeft']=p['matrix'][4]/20;cards.append(card)
 # Source grid has unequal row heights; top/left ordering is kept for reflowed native cards.
 cards.sort(key=lambda q:(round(q['sourceTop']/4)*4,q['sourceLeft']));pieces=[]
 for piece in level['imagePieces']:
  rr=ts[f"sprite-{piece['characterId']}"]['frames'][0];assert len(rr)==1 and rr[0]['matrix']==[1,0,0,1,0,0];image=image_shape(rr[0]['characterId']);b=image['sourceBounds'];x,y=piece['matrix'][4:];pieces.append(dict(name=piece['name'],pair=int(piece['name'][2]),rect=[(b['left']+x)/20,(b['top']+y)/20,(b['right']-b['left'])/20,(b['bottom']-b['top'])/20],**image))
 left=min(p['rect'][0]for p in pieces);top=min(p['rect'][1]for p in pieces);right=max(p['rect'][0]+p['rect'][2]for p in pieces);bottom=max(p['rect'][1]+p['rect'][3]for p in pieces)
 levels.append(dict(level=level['level'],frame=level['frame'],completionFrame=level['completionFrame'],cards=cards,pieces=pieces,pictureViewBox=[left,top,right-left,bottom-top],reward=image_shape(193 if level['level']==1 else 301)))
feedbackTitles={id:spans([max([alpha(q)for q in r if q['characterId']in ids]or[0])for r in ts[f'sprite-{id}']['frames']])for id,ids in [(157,[151]),(170,[164,165])]}
model=dict(feedbackTitles=feedbackTitles,schemaVersion=1,animationId=m['animationId'],sourceSha256=m['source']['sha256'],levels=levels,popup=[dict(characterId=id,text=' '.join(r['text'].strip()for r in texts[id]['runs']))for id in [18,19,20]],scoreLabel='Score :',title='Function Match Game',completionLevelLabels=['Function and Ordered Pairs','Description and Table '],sourceRisks=m['risks'])
for p,bytes in [(B/'native-v1/cards-v1.json',(json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n').encode()),(Path('packages/demos/src/alg-l07-p052-cards-v1.ts'),('// Generated by migrations/shared-alg001-l07-p052/generator-v1/derive-cards-v1.py; edit the producer.\nexport const P052_CARDS = '+json.dumps(model,ensure_ascii=False,separators=(',',':'))+' as const;\n').encode())]:
 if '--check'in sys.argv or(p.exists()and'--write'not in sys.argv):assert p.read_bytes()==bytes,p
 else:p.write_bytes(bytes) if '--write'in sys.argv else p.open('xb').write(bytes)
print(json.dumps(dict(cards=24,levels=[[(c['name'],c['characterId'],c['kind'])for c in l['cards']]for l in levels],bytes=len(bytes))))
