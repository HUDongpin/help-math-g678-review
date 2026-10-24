"""Source-only P042 structural closure and raw AVM1 instruction evidence."""
from pathlib import Path
import json,hashlib,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p042/audit';raw=(A/'source-input.swf').read_bytes();assert hashlib.sha256(raw).hexdigest()=='6dce91764e5744cf72cbdb2a2d1a10990a1c3eb1f42f5aace4cb3be33a67fad0';c=json.loads((A/'source-text-catalog-v1.json').read_text());xml=ET.parse(A/'source-swfmill-v1.xml').getroot();timelines={t['timelineId']:t for t in c['timelines']};buttons={b['characterId']:b for b in c['buttonDefinitions']};seen=set();queue=['root'];ids=set()
while queue:
 key=queue.pop()
 if key in seen:continue
 seen.add(key)
 if key in timelines:
  children=[e['characterId']for e in timelines[key]['events']if e.get('characterId')is not None and e['kind']=='place']
 else:children=[p['characterId']for p in buttons[int(key[7:])]['statePlacements']]
 for i in children:
  ids.add(i)
  if 'sprite-'+str(i)in timelines:queue.append('sprite-'+str(i))
  if i in buttons:queue.append('button-'+str(i))
rows=[]
for t in c['timelines']:
 frames={};live={}
 for e in t['events']:
  if e['kind']=='place':frames.setdefault(e['frame'],[]).append({'kind':'place','depth':e.get('depth'),'characterId':e.get('characterId'),'move':e.get('move'),'matrix':e.get('matrix'),'clipDepth':e.get('clipDepth')})
  elif e['kind']in ['remove','action-bytes','frame-label']:frames.setdefault(e['frame'],[]).append(e)
 rows.append({'timelineId':t['timelineId'],'frames':t['declaredFrameCount'],'structurallyReachable':t['timelineId']in seen,'changes':frames})
actions=[];sounds=[]
def scan(tags,domain):
 frame=1
 for e in tags:
  if e.tag=='ShowFrame':frame+=1
  elif e.tag=='DoAction':actions.append({'domain':domain,'frame':frame,'instructions':[{'op':n.tag,'attributes':n.attrib}for n in e.iter()if n.tag not in ['DoAction','actions','items','strings']],'xml':ET.tostring(e,encoding='unicode')})
  elif e.tag=='SoundStreamHead':sounds.append({'domain':domain,'frame':frame,'header':e.attrib})
  elif e.tag=='DefineSprite':scan(e.find('tags'), 'sprite-'+e.attrib['objectID'])
scan(xml.find('./Header/tags'),'root')
buttonRows=[]
for e in xml.iter('DefineButton2'):
 i=int(e.attrib['objectID']);buttonRows.append({'characterId':i,'structurallyReachable':i in ids,'dictionary':[s.attrib['value']for s in e.findall('.//Dictionary/strings/String')],'instructions':[{'op':n.tag,'attributes':n.attrib}for a in e.findall('.//actions')for n in a.iter()if n.tag not in ['actions','items','strings']],'claim':'Raw decodedAVM1operations; host execution and link resolution remain unverified.'})
texts=[{'characterId':t['characterId'],'structurallyReachable':t['characterId']in ids,'text':''.join(r.get('text','')for r in t.get('runs',[]))}for t in c['textDefinitions']]
result={'schemaVersion':1,'animationId':'shared-nms002-l02-p042','sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceXmlSha256':hashlib.sha256((A/'source-swfmill-v1.xml').read_bytes()).hexdigest(),'structuralReachability':sorted(seen),'timelines':rows,'actions':actions,'buttons':buttonRows,'sounds':sounds,'texts':texts,'claim':'Structural root-placement/button closure; does not resolve action-driven visibility, masks, source audio decoding, host APIs or original runtime.','registered':False,'originalRuntimeAccepted':False,'strictComplete':False}
result['decompiledScripts']=[{'path':str(f.relative_to(A)), 'sha256':hashlib.sha256(f.read_bytes()).hexdigest(), 'text':f.read_text()} for f in sorted((A/'ffdec-scripts-v1').rglob('*.as'))]
result['claim'] += ' Clip-event scripts included as decompiled evidence, not executed runtime evidence.'
p=A/'source-structure-v1.json';s=json.dumps(result,indent=2)+'\n'
if p.exists():assert p.read_text()==s
else:p.write_text(s)
print(json.dumps({'reachable':sorted(seen),'actions':[(a['domain'],a['frame'])for a in actions],'buttons':[(b['characterId'],b['structurallyReachable'],b['dictionary'][2])for b in buttonRows],'sounds':sounds,'reachableTexts':[t for t in texts if t['structurallyReachable']]}))
