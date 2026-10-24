"""Exact SWF-only P002 source IR; no runtime or listening acceptance implied."""
from pathlib import Path
import argparse,base64,collections,hashlib,json,xml.etree.ElementTree as E
ROOT=Path(__file__).resolve().parents[3]
BASE=ROOT/'migrations/shared-alg001-l07-p002'
PHYSICAL=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L7')
SHA='be4379b92c4a214b6a00d655cee930dbdba0a018c0b1dcb89be855e4a8c8f996'
XML_SHA='ca5327d744434264fcf08ae3209cbdda68c9cdbcfc59554687cc491132a6adbe'
CATALOG_XML_SHA='5eac052615476e688afc1e69391c17bb0c20db8200e7be3f7ea1f9bb778d85f6'
def demand(ok,why):
 if not ok:raise ValueError(why)
def pin(p,h=None):
 demand(p.is_file() and not p.is_symlink() and p.resolve()==p,'physical input '+str(p));b=p.read_bytes();s=hashlib.sha256(b).hexdigest();demand(h is None or s==h,'input drift '+str(p))
 return b,{'path':str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p),'bytes':len(b),'sha256':s}
def matrix(t):
 a=t.find('transform/Transform');a=a.attrib if a is not None else {}
 return {k:float(a.get(k,1 if k in ('scaleX','scaleY') else 0)) for k in ('scaleX','scaleY','skewX','skewY','transX','transY')}
def ranges(values):
 out=[]
 for value in values:
  if out and out[-1][-1]+1==value:out[-1][-1]=value
  else:out.append([value,value])
 return out
def stagebox(bounds,m):
 points=[]
 for x in (int(bounds['left']),int(bounds['right'])):
  for y in (int(bounds['top']),int(bounds['bottom'])):
   px=(m['scaleX']*x+m['skewX']*y+m['transX'])/20
   py=(m['skewY']*x+m['scaleY']*y+m['transY'])/20
   points.append((407.45+.9793701171875*px,281.5+.9793701171875*py))
 return [round(min(p[0] for p in points),6),round(min(p[1] for p in points),6),round(max(p[0] for p in points),6),round(max(p[1] for p in points),6)]
def build():
 _,physical=pin(PHYSICAL/'RW/L7RW02.swf',SHA);copy,source=pin(BASE/'source-v1/L7RW02.swf',SHA);demand(len(copy)==1603537,'bytes')
 pin(PHYSICAL/'index.xml',CATALOG_XML_SHA);pin(BASE/'source-v1/index.xml',CATALOG_XML_SHA)
 b,xml=pin(BASE/'source-v1/movie.xml',XML_SHA);swf=E.fromstring(b);head=swf.find('Header');tags=head.find('tags');definitions={int(t.get('objectID')):t for t in tags if t.tag in ('DefineSprite','DefineText','DefineShape','DefineShape2','DefineShape3','DefineShape4','DefineMorphShape','DefineBits','DefineBitsJPEG3') and t.get('objectID')}
 demand(swf.get('version')=='6' and head.attrib=={'framerate':'12','frames':'10'},'root clock')
 demand(head.find('size/Rectangle').attrib=={'left':'0','right':'16000','top':'0','bottom':'12000'},'stage')
 rootFrame=1;rootPlacements=[]
 for t in tags:
  if t.tag=='ShowFrame':rootFrame+=1
  elif t.tag.startswith('PlaceObject'):rootPlacements.append({'frame':rootFrame,'attributes':t.attrib,'matrixTwips':matrix(t)})
 demand([p['attributes']['objectID'] for p in rootPlacements]==['452','453','455','456'],'all root layers')
 demand(all(p['frame']==6 for p in rootPlacements),'root entry')
 demand(rootPlacements[0]['matrixTwips']=={'scaleX':.9793701171875,'scaleY':.9793701171875,'skewX':0.,'skewY':0.,'transX':8149.,'transY':5630.},'exact main matrix')
 scripts=[]
 for path,expected in [('frame_1/DoAction.as','_level0.InternalPreloader.gotoAndPlay("jump_check");\nstop();'),('frame_6/DoAction.as','stop();'),('DefineSprite_452/frame_1/DoAction.as',''),('DefineSprite_452/frame_1195/DoAction.as','stop();')]:
  b,p=pin(BASE/('source-v1/ffdec/scripts/'+path));demand('\n'.join(b.decode().splitlines()).strip()==expected,'script '+path);scripts.append(p)
 fonts={int(t.get('objectID')):t for t in tags.findall('DefineFont2')};texts=[]
 for cid,t in definitions.items():
  if t.tag!='DefineText':continue
  text='';font=None
  for r in t.findall('.//TextRecord6'):
   if r.get('objectID'):font=int(r.get('objectID'))
   if r.get('isSetup')=='0':
    glyphs=[chr(int(g.get('map'))) for g in fonts[font].find('glyphs')]
    text+=''.join(glyphs[int(g.get('glyph'))] for g in r.findall('.//TextEntry'))
  raw,p=pin(BASE/f'source-v1/ffdec/texts/{cid}.txt');normal=' '.join(raw.decode().replace('--- RECORDSEPARATOR ---','').split())
  demand(' '.join(text.split())==normal,'independent text '+str(cid))
  texts.append({'characterId':cid,'sourceTextId':f'character-{cid}','text':text,'boundsTwips':t.find('bounds/Rectangle').attrib,'fontCharacterId':font,'ffdec':p})
 textById={t['characterId']:t for t in texts}
 main=definitions[452];st=main.find('tags');demand(main.get('frames')=='1195','main clock')
 demand(collections.Counter(t.tag for t in st)=={'PlaceObject2':5402,'RemoveObject2':820,'ShowFrame':1195,'SoundStreamBlock':1177,'SoundStreamHead':1,'DoAction':2,'End':1},'main census')
 active={};frames=[];blocks=[];payload=[];total=0;offset=0;f=1;instances=collections.defaultdict(list);masks=[]
 for t in st:
  if t.tag=='PlaceObject2':
   depth=int(t.get('depth'));v=active.get(depth,{}).copy()
   if t.get('objectID'):v={'objectId':int(t.get('objectID')),'alpha256':256,'matrixTwips':{'scaleX':1.,'scaleY':1.,'skewX':0.,'skewY':0.,'transX':0.,'transY':0.},'clipDepth':None}
   if t.find('transform') is not None:v['matrixTwips']=matrix(t)
   color=t.find('colorTransform/ColorTransform2')
   if color is not None:v['alpha256']=int(color.get('factorAlpha','256'))
   if t.get('clipDepth'):v['clipDepth']=int(t.get('clipDepth'));masks.append({'frame':f,'depth':depth,**v})
   active[depth]=v
  elif t.tag=='RemoveObject2':active.pop(int(t.get('depth')),None)
  elif t.tag=='SoundStreamBlock':
   raw=base64.b64decode(t.findtext('data'),validate=True);demand(len(raw)>=4,'block wrapper');mp3=raw[4:];n=int.from_bytes(raw[:2],'little');seek=int.from_bytes(raw[2:4],'little',signed=True)
   blocks.append({'frame':f,'declaredSamples':n,'seekSamples':seek,'decodedBefore':total,'rawSeekCoordinate':total+seek,'payloadOffset':offset,'payloadBytes':len(mp3),'payloadSha256':hashlib.sha256(mp3).hexdigest()});payload.append(mp3);total+=n;offset+=len(mp3)
  elif t.tag=='ShowFrame':
   visible=[]
   for depth,v in active.items():
    if v['objectId'] not in textById:continue
    definition=textById[v['objectId']];box=stagebox(definition['boundsTwips'],v['matrixTwips']);full=v['alpha256']>0 and box[0]>=76.71 and box[1]>=88.58 and box[2]<=741.81 and box[3]<=477.85
    row={'objectId':v['objectId'],'sourceTextId':definition['sourceTextId'],'depth':depth,'alpha256':v['alpha256'],'sourceStageBoxPx':box,'fullBoardGlyphBoxVisible':full,'matrixTwips':v['matrixTwips']}
    visible.append(row);instances[v['objectId']].append({'frame':f,**row})
   frames.append({'frame':f,'sourceTextInstances':visible,'positiveFullyVisibleTextIds':[v['objectId'] for v in visible if v['fullBoardGlyphBoxVisible']]});f+=1
 demand(f==1196 and len(blocks)==1177 and total==2157696 and [(x['frame'],x['objectId'],x['depth'],x['clipDepth']) for x in masks]==[(1,1,1,131),(228,142,132,174)],'allframes and exact source masks')
 mp3=b''.join(payload);existing,audio=pin(BASE/'source-v1/source-stream-452.mp3','e016378323f1bec789386fccb3ddd723ddd857394249752a12114d7b15434b97');demand(mp3==existing,'payload assembly')
 negatives=[b for b in blocks if b['seekSamples']<0];demand([(b['frame'],b['declaredSamples'],b['payloadBytes']) for b in negatives]==[(425,0,0),(1153,0,0)],'negative markers')
 runs=[]
 for begin,end in [(2,424),(433,1152),(1164,1195)]:
  owned=[b for b in blocks if begin<=b['frame']<=end];first,last=owned[0],owned[-1]
  runs.append({'firstFrame':begin,'lastSourceBlockFrame':end,'firstDecodedSample':first['rawSeekCoordinate'],'endDecodedSample':last['decodedBefore']+last['declaredSamples'],'blockCount':len(owned),'evidence':'negative zero-sample marker and absent-block interval separate source runs; ordinary zero block frame3 does not create silence'})
 absent=[n for n in range(1,1196) if n not in [b['frame'] for b in blocks]]
 domains=[]
 for cid,t in definitions.items():
  if t.tag=='DefineSprite':domains.append({'id':f'sprite-{cid}','frameCount':int(t.get('frames')),'kind':'root-main' if cid==452 else 'root-title' if cid==455 else 'nested-artwork','objectDependencies':sorted({int(p.get('objectID')) for p in t.find('tags') if p.get('objectID')}),'actionScriptExecution':'not-executed'})
 riskData=json.loads((BASE/'source-v1/text-catalog-v1.json').read_text())
 return {'schemaVersion':1,'animationId':'shared-alg001-l07-p002','assetId':'swf-'+SHA,'physicalSource':physical,'sourceCopy':source,'swfmillXml':xml,'sourceCatalogXmlSha256':CATALOG_XML_SHA,
  'classification':{'moduleCode':'ALG001','lesson':7,'globalOrdinal':2,'sectionCode':'RW','sectionPageOrdinal':1,'xmlTitle':'Page 1','lessonTitle':'Linear and Nonlinear Functions','complexity':'timeline-understood','lane':'compiler-assisted-advanced-manual','laneReason':'1195-frame authored drawing with bitmap/vector character movement and terminal stop; exact source Canvas with maintainable native semantic text and shared source-run transport'},
  'stage':{'width':800,'height':600,'backgroundColor':'#b8d8f7'},'fps':12,'rootFrameCount':10,'rootEntryFrame':6,'frameDomain':'sprite-452','frameCount':1195,'terminalStopFrame':1195,'rootPlacements':rootPlacements,'scripts':scripts,'frameDomains':domains,'textDefinitions':texts,'frames':frames,
  'textRevealSummary':[{'characterId':cid,'text':textById[cid]['text'],'placedRanges':ranges([x['frame'] for x in rows]),'positiveFullyVisibleRanges':ranges([x['frame'] for x in rows if x['fullBoardGlyphBoxVisible']])} for cid,rows in instances.items()],
  'stream':{'pin':audio,'head':st.find('SoundStreamHead').attrib,'blockCount':len(blocks),'sampleCount':total,'blocks':blocks,'segments':runs,'emptyNegativeBlocks':[{'frame':b['frame'],'samples':0,'seek':b['seekSamples'],'mp3Bytes':0} for b in negatives],'absentFrameRanges':ranges(absent),'ordinaryEmptyBlocks':[b['frame'] for b in blocks if b['payloadBytes']==0 and b['seekSamples']>=0],'acceptance':'source-run-candidate-not-original-runtime-accepted'},
  'maskPlacements':masks,'sourceRisks':riskData['risks'],'behavior':{'reachableButtons':0,'rootPreloader':'InternalPreloader.gotoAndPlay(jump_check), root stops at1 and6; original shell execution unverified','mainFinalAction':'stop at1195','sourceRootTitle':'character453 offstage; sprite455 contains outlined title454; modern title reproduces exact character453 string','graphics':'Original source Canvas definitions retained, no scene redrawing. Native text follows independently decoded source glyphs and on-stage bounds.','spanish':'English visual fallback; separate SA matching-basename candidate remains optional explicit user action and has no listening acceptance.','originalRuntimeAccepted':False,'audioAccepted':False,'humanAccepted':False,'ownerAccepted':False,'strictComplete':False,'published':False}}
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--check',action='store_true');args=a.parse_args();value=build();b=(json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode();p=BASE/'native-v1/source-model-v1.json'
 if args.check:demand(p.read_bytes()==b,'model drift')
 else:p.open('xb').write(b)
 print(json.dumps({'pass':True,'frames':len(value['frames']),'sourceSha256':SHA,'audioRuns':value['stream']['segments'],'textRanges':value['textRevealSummary'][:5]}))
