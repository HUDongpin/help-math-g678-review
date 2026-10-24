from pathlib import Path
import json,hashlib,copy,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p045/audit';c=json.loads((A/'source-text-catalog-v1.json').read_text());timelines={t['timelineId']:t for t in c['timelines']};ns='http://www.w3.org/2000/svg';ET.register_namespace('',ns)
def live(domain,frame):
 rows={}
 for e in timelines[domain]['events']:
  if e['frame']>frame:continue
  if e['kind']=='remove':rows.pop(e['depth'],None)
  if e['kind']=='place':
   prev=rows.get(e['depth'],{});rows[e['depth']]={**prev,**e,'matrix':e.get('matrix')or prev.get('matrix')or[1,0,0,1,0,0]}
 return [rows[k]for k in sorted(rows)]
def render(domain,frame,parent,leaves):
 for e in live(domain,frame):
  assert not e['flags'].get('hasColorTransform') and not e.get('clipDepth')
  m=e['matrix'];g=ET.SubElement(parent,'{'+ns+'}g',{'transform':f'matrix({m[0]} {m[1]} {m[2]} {m[3]} {m[4]/20} {m[5]/20})'});child='sprite-'+str(e['characterId'])
  if child in timelines:render(child,1,g,leaves)
  else:
   f=A/'shapes-svg-v1'/f"{e['characterId']}.svg";root=ET.parse(f).getroot();children=list(root);assert len(children)==1 and children[0].tag=='{'+ns+'}g';geometry=copy.deepcopy(children[0]);geometry.attrib.pop('transform',None);g.append(geometry);fills=sorted({p.get('fill')for p in geometry.iter()if p.get('fill')not in [None,'none']});leaves.append({'characterId':e['characterId'],'fills':fills,'svgSha256':hashlib.sha256(f.read_bytes()).hexdigest()})
svg=ET.Element('{'+ns+'}svg',{'width':'1200','height':'450','viewBox':'0 0 1200 450'});ET.SubElement(svg,'{'+ns+'}rect',{'width':'1200','height':'450','fill':'white'});rows=[]
for frame,answer in [(1,'2/10'),(2,'3/10'),(3,'4/10')]:
 x=200+(frame-1)*400;label=ET.SubElement(svg,'{'+ns+'}text',{'x':str(x),'y':'40','text-anchor':'middle','font-family':'Arial','font-size':'24'});label.text=f'L{frame} — {answer}';g=ET.SubElement(svg,'{'+ns+'}g',{'transform':f'translate({x} 235) scale(2)'});leaves=[];render('sprite-177',frame,g,leaves);rows.append({'frame':frame,'label':'L'+str(frame),'sourceAnswer':answer,'leaves':leaves,'blueLeafCount':sum('#0000ff'in p['fills']for p in leaves)})
print(json.dumps(rows))
out=A/'chart-source-composition-v1.svg'
with out.open('xb')as f:f.write(ET.tostring(svg,encoding='utf-8',xml_declaration=True))
result={'sourceSha256':c['sourceSha256'],'domain':'sprite-177','rows':rows,'compositionSha256':hashlib.sha256(out.read_bytes()).hexdigest(),'method':'Apply source display-list translations in twips/20; remove only FFDec export normalization transform; preserve original SVG paths and fills. Static structural composition, not original runtime or acceptance.','originalRuntimeAccepted':False}
with(A/'chart-state-audit-v1.json').open('x')as f:f.write(json.dumps(result,indent=2)+'\n')
print(json.dumps([{'frame':r['frame'],'blueLeafCount':r['blueLeafCount'],'leaves':len(r['leaves'])}for r in rows]))
