from pathlib import Path
import xml.etree.ElementTree as E
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p051/audit';p=Path(sys.argv[1]);root=E.parse(p).getroot();source=json.loads((A/'structural-intake-v1.json').read_text());rows=[];unused=[]
for tag in root.iter():
 if tag.get('type')not in ['DefineShapeTag','DefineShape2Tag','DefineShape3Tag','DefineShape4Tag']:continue
 cid=int(tag.get('shapeId'));shapes=tag.find('shapes');table=shapes.find('fillStyles/fillStyles');styles=list(table)if table is not None else [];generation=0;used=set()
 def flush():
  for index,style in enumerate(styles,1):
   if 'bitmapId' not in style.attrib:continue
   row={'shapeId':cid,'styleGeneration':generation,'fillIndex':index,'bitmapId':int(style.get('bitmapId')),'usedByStyleChange':index in used}
   (rows if index in used else unused).append(row)
 records=shapes.find('shapeRecords')
 for record in records:
  if record.get('type')!='StyleChangeRecord':continue
  for key in ['0','1']:
   if record.get('stateFillStyle'+key)=='true':
    index=int(record.get('fillStyle'+key,'0'));assert 0<=index<=len(styles)
    if index:used.add(index)
  if record.get('stateNewStyles')=='true':
   flush();table=record.find('fillStyles/fillStyles');styles=list(table)if table is not None else [];generation+=1;used=set()
 flush()
parents={child:parent for parent in root.iter()for child in parent}
for element in root.iter():
 if 'bitmapId'not in element.attrib:continue
 ancestor=parents.get(element)
 while ancestor is not None and 'shapeId'not in ancestor.attrib:ancestor=parents.get(ancestor)
 assert ancestor is not None and ancestor.get('type')in ['DefineShapeTag','DefineShape2Tag','DefineShape3Tag','DefineShape4Tag']
known={d['characterId']for d in source['bitmapDefinitions']};assert {row['bitmapId']for row in rows}==known;assert all(row['bitmapId']==65535 for row in unused)
for row in rows:
 row['placements']=[{'timelineId':t['timelineId'],'firstFrame':i['firstFrame']}for t in source['timelines']for i in t['instances']if i['characterId']==row['shapeId']]
 assert row['placements']and all(v['timelineId']in['sprite-189','sprite-217']and v['firstFrame']>=2 for v in row['placements'])
result={'sourceSha256':source['sourceSha256'],'xmlExport':{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()},'usedBitmapFills':rows,'unused65535Fills':unused,'all13BitmapIdsCovered':True,'decision':'All image-bearing normal shape fills are in stopped decorative feedback189/217 beyond empty frame1. Do not play absent a selected source start.','scope':'FFDec XML initial/new fill tables and style-index selection; not pixel fidelity or morph geometry reconstruction.','originalRuntimeAccepted':False}
(A/'bitmap-reference-audit-v2.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'usedBitmapFills':len(rows),'bitmapIds':len(known),'unused65535Fills':len(unused)}))
