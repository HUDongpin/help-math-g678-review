"""Combine exact P038 selected geometry, hotspot and bilingual dictionary metadata."""
from pathlib import Path
import json,hashlib,sys,xml.etree.ElementTree as E
R=Path.cwd();assert R==Path('/Volumes/WestWorld/HELP MATH 2.0-g678-implementation')
OUT=Path(sys.argv[sys.argv.index('--output-root')+1]).resolve() if '--output-root' in sys.argv else R
A=R/'output/g678-alg-l08-p038-source-20261007-v1';O=R/'output/g678-alg-l08-p038-integration-20261007-v1';M=R/'migrations/shared-alg001-l08-p038'
read=lambda p:json.loads(p.read_text())
def verify(row):
 p=Path(row['path']);p=p if p.is_absolute()else R/p;b=p.read_bytes();assert len(b)==row['bytes']and hashlib.sha256(b).hexdigest()==row['sha256'],str(p)
selection=read(O/'selection-and-source-pins-v1.json')
for row in selection['sourceAudits'].values():verify(row)
geometry=read(M/'native-v1/selected-geometry-v1.json');glossary=read(A/'glossary-source-v1.json');behavior=read(A/'behavior-audit-v1.json')
for row in glossary['dictionaryPins'].values():verify(row)
for hotspot in behavior['hotspots']:verify(hotspot['actionScript']);verify(hotspot['pcode'])
hotspots=[dict(instanceId=h['placement']['instanceId'],term=h['term'],sourceButtonId=h['sourceButtonId'],depth=h['placement']['depth'],timelineId=h['timelineId'],matrix=h['placement']['matrix'],structuralFrameRanges=h['structuralFrameRanges'],hostCall=h['hostCall'],explicitMainStop=h['explicitMainStop'],actionScript=h['actionScript'],pcode=h['pcode'])for h in behavior['hotspots']]
assert len(hotspots)==18 and len(glossary['entries'])==14
model={k:geometry[k]for k in ['animationId','sourceSha256','stage','rootStates','mainStates','coachVisual','pointVisuals','popupVisuals','offstageAudioMarkers','buttons','backgroundHit','textDefinitions','dynamicTextFields','shapes','glyphs','sourceChildDispositions','sourceMainAudioRun']}
xml=E.parse(A/'source/movie.xml').getroot()
def backdrop_viewbox(cid):
 box=next(t for t in xml.find('Header/tags')if t.get('objectID')==str(cid)and t.tag.startswith('DefineShape')).find('bounds/Rectangle');left,right,top,bottom=[int(box.get(k))for k in ['left','right','top','bottom']];return [left-80,top-80,right-left+160,bottom-top+160]
# Modern framing adds four source pixels around each original backdrop, with no artwork transform.
model.update(title='Question 9',mainHotspots=[h for h in hotspots if h['timelineId']=='sprite-585'],coachHotspots=[h for h in hotspots if h['timelineId']=='sprite-570'],terms=glossary['entries'],sourceTermKeys={t['sourceKeyAttribute']:t['id']for t in glossary['entries']},coachViewBox=backdrop_viewbox(550),sourcePopupViewBox=backdrop_viewbox(532),nativeBrowserDecoded=False)
types='''// Generated from source-locked P038 geometry and dictionary. Edit the maintained generator.
export type P038ColorTransform={multiply:readonly number[];add:readonly number[];divisor:number};
export type P038TextDefinition={sourceTextId:string;sourceCharacterId:number;textMatrix:readonly number[];text:string;runs:readonly{text:string;colorRgba:readonly number[];fontHeightTwips:number;y:number;glyphs:readonly{glyphId:string;text:string;x:number;advanceTwips:number}[]}[]};
export type P038NativeText={kind:'text';sourceTextId:string;sourceCharacterId:number;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P038ColorTransform};
export type P038Vector={kind:'vector';sourceShapeId:number;sourceCharacterId:number;shapeKey:string;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P038ColorTransform;ratio:number;clipDepth:number|null};
export type P038DynamicText={kind:'dynamic-text';sourceCharacterId:number;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P038ColorTransform;initialText:null};
export type P038Node=P038NativeText|P038Vector|P038DynamicText;
export type P038Placement={depth:number;matrix:readonly number[];characterId:number;name?:{text:string;decodeStatus:string;rawSha256:string;rawHex:string|null};instanceId:string;ratio?:number;colorTransform?:P038ColorTransform};
export type P038Visual={nodes:readonly P038Node[];children:readonly{spriteId:number;disposition:string;placement:P038Placement}[];controls:readonly{sourceButtonId:number;placement:P038Placement;term:string|null}[]};
export type P038Spans=readonly{first:number;last:number;value:P038Visual}[];
export type P038Hotspot={instanceId:string;term:string;sourceButtonId:number;depth:number;timelineId:string;matrix:readonly number[];structuralFrameRanges:readonly(readonly number[])[];hostCall:'DoHyperLinks';explicitMainStop:boolean;actionScript:{path:string;bytes:number;sha256:string};pcode:{path:string;bytes:number;sha256:string}};
export interface P038PresentationSource {
 readonly animationId:string;readonly sourceSha256:string;readonly title:string;readonly nativeBrowserDecoded:boolean;
 readonly stage:{rootFrameCount:10;rootBeginFrame:6;mainSpriteId:585;mainFrameCount:525;fps:12;viewBox:readonly number[]};
 readonly rootStates:P038Spans;readonly mainStates:P038Spans;readonly coachVisual:P038Visual;readonly pointVisuals:readonly{spriteId:number;states:P038Spans}[];readonly popupVisuals:readonly{spriteId:number;states:P038Spans}[];
 readonly offstageAudioMarkers:readonly{spriteId:number;firstFrame:P038Visual}[];readonly buttons:readonly{sourceButtonId:number;sourceTagSha256:string;term:string|null;states:{up:readonly P038Node[];over:readonly P038Node[];down:readonly P038Node[];hitTest:readonly P038Node[]}}[];
 readonly backgroundHit:{sourceButton:number;hitShape:number;mainPlacement:P038Placement;buttonShape:P038Node;shapeBoundsTwips:{left:number;right:number;top:number;bottom:number};method:string};
 readonly textDefinitions:readonly P038TextDefinition[];readonly dynamicTextFields:readonly{characterId:number;[key:string]:unknown}[];
 readonly shapes:readonly{key:string;sourceShapeId:number;morph:boolean;ratio:number;paths:readonly Record<string,string>[];gradients:readonly{kind:string;attributes:Record<string,string>;stops:readonly Record<string,string>[]}[];patterns:readonly{attributes:Record<string,string>;images:readonly{attributes:Record<string,string>;href:string}[]}[];[key:string]:unknown}[];
 readonly glyphs:readonly{id:string;fontId:number;glyphIndex:number;d:string}[];readonly sourceChildDispositions:Readonly<Record<string,string>>;readonly sourceMainAudioRun:Readonly<Record<string,unknown>>;
 readonly mainHotspots:readonly P038Hotspot[];readonly coachHotspots:readonly P038Hotspot[];readonly sourceTermKeys:Readonly<Record<string,string>>;
 readonly terms:readonly{id:string;sourceKeyAttribute:string;labels:{en:string;es:string};definitions:{en:string;es:string};sourceEntrySha256:{en:string;es:string};[key:string]:unknown}[];
 readonly coachViewBox:readonly number[];readonly sourcePopupViewBox:readonly number[];
}
'''
outputs={OUT/'migrations/shared-alg001-l08-p038/native-v1/presentation-model-v1.json':json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n',OUT/'packages/demos/src/alg-l08-p038-presentation-source-v1.ts':types+'export const ALG_L08_P038_PRESENTATION_SOURCE:P038PresentationSource = '+json.dumps(model,separators=(',',':'),ensure_ascii=False)+';\n'}
for p,value in outputs.items():
 if '--check'in sys.argv:assert p.read_text()==value,str(p)
 else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(value)
print(json.dumps(dict(pass_=True,terms=len(model['terms']),mainHotspots=len(model['mainHotspots']),coachHotspots=len(model['coachHotspots']),nativeBrowserDecoded=False,outputs=[str(p)for p in outputs])))
