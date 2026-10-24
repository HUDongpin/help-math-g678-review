"""Deterministic L7 introduction IR from exact SWFmill and FFDec evidence."""
from pathlib import Path
import argparse, base64, collections, hashlib, json, xml.etree.ElementTree as E

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'migrations/shared-alg001-l07-p001'
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L7/IR/L7IR01.swf')
SHA = 'cef7d8d01efa3a8cc1f2a6d6e6334213c23892e0375bdac72624fd6979c16821'
XML_SHA = '158379e26eb2309ac2c58eadf611c607a8f43114d98b9451bc462ac7d07daf3e'
TITLE = 'Linear and Nonlinear Functions: Introduction'

def demand(ok, message):
    if not ok: raise ValueError(message)

def pin(path, expected=None):
    demand(path.is_file() and path.resolve() == path and not path.is_symlink(), 'physical input: '+str(path))
    b=path.read_bytes(); h=hashlib.sha256(b).hexdigest()
    demand(expected is None or h == expected, 'source hash drift: '+str(path))
    return b, {'path':str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path), 'bytes':len(b), 'sha256':h}

def build():
    _,source=pin(SOURCE,SHA); pin(BASE/'source-v1/L7IR01.swf',SHA)
    b,xml=pin(BASE/'source-v1/movie.xml',XML_SHA); swf=E.fromstring(b); h=swf.find('Header'); tags=h.find('tags')
    demand(swf.get('version')=='6' and h.attrib=={'framerate':'12','frames':'10'},'source clock')
    demand(h.find('size/Rectangle').attrib=={'left':'0','right':'16000','top':'0','bottom':'12000'},'source stage')
    frame=1; placements=[]; actions=[]
    for t in tags:
        if t.tag=='ShowFrame': frame+=1
        elif t.tag.startswith('PlaceObject'): placements.append((frame,t))
        elif t.tag in ('DoAction','DoInitAction'): actions.append((frame,t.tag))
    demand(frame==11 and len(placements)==1,'root reachability')
    f,p=placements[0]
    demand(f==6 and p.attrib=={'replace':'0','depth':'1','objectID':'142','morph':'5','name':'animation'},'entry placement')
    demand(p.find('transform/Transform').attrib=={'transX':'8248','transY':'5666'},'entry transform')
    root_scripts=[]
    for f,expected in [(1,'_level0.InternalPreloader.gotoAndPlay("jump_check");\nstop();'),(6,'stop();')]:
        b,receipt=pin(BASE/f'source-v1/ffdec/scripts/frame_{f}/DoAction.as')
        demand('\n'.join(b.decode().splitlines()).strip()==expected,'root script'); root_scripts.append(receipt)
    font=tags.find('DefineFont2[@objectID="118"]')
    demand(font.get('name')=='Bauhaus Md BT','title font')
    glyphs=[chr(int(g.get('map'))) for g in font.find('glyphs')]
    texts=[]
    for cid in (140,141):
        text=tags.find(f'DefineText[@objectID="{cid}"]')
        value=''.join(glyphs[int(x.get('glyph'))] for x in text.findall('.//TextEntry'))
        demand(value==TITLE,'title glyph decoding')
        ff,receipt=pin(BASE/f'source-v1/ffdec/texts/{cid}.txt')
        normal=' '.join(ff.decode().replace('--- RECORDSEPARATOR ---','').split())
        demand(normal==TITLE,'independent FFDec text')
        texts.append({'characterId':cid,'text':value,'fontCharacterId':118,'boundsTwips':text.find('bounds/Rectangle').attrib,
          'records':[{'attributes':r.attrib,'color':r.find('color/Color').attrib if r.find('color/Color') is not None else None} for r in text.findall('.//TextRecord6') if r.get('isSetup')=='1'],'ffdec':receipt})
    sprite=tags.find('DefineSprite[@objectID="142"]'); demand(sprite.get('frames')=='138','main clock')
    st=sprite.find('tags'); census=collections.Counter(t.tag for t in st)
    demand(census=={'PlaceObject2':274,'SoundStreamBlock':138,'ShowFrame':138,'SoundStreamHead':1,'End':1},'main contains only title and source stream')
    demand(st.find('SoundStreamHead').get('compression')=='2','MP3 source')
    active={}; frames=[]; audio=None; payload=[]; count=0
    for t in st:
        if t.tag=='PlaceObject2':
            d=int(t.get('depth')); demand(d in (1,2),'only two title depths')
            c=int(t.get('objectID',active.get(d,{}).get('characterId',0)))
            demand(c==139+d,'title identity')
            m=t.find('transform/Transform'); color=t.find('colorTransform/ColorTransform2')
            demand(m is not None and not any(k in m.attrib for k in ('skewX','skewY')),'title matrix')
            active[d]={'characterId':c,'depth':d,'scaleX':float(m.get('scaleX','1')),'scaleY':float(m.get('scaleY','1')),
              'xTwips':int(m.get('transX','0')),'yTwips':int(m.get('transY','0')),'alpha256':int(color.get('factorAlpha','256')) if color is not None else 256}
        elif t.tag=='SoundStreamBlock':
            demand(audio is None,'one block per frame'); raw=base64.b64decode(t.findtext('data'),validate=True);demand(len(raw)>=4,'stream header')
            audio={'sampleCount':int.from_bytes(raw[:2],'little'),'seekSamples':int.from_bytes(raw[2:4],'little',signed=True),'mp3Bytes':len(raw)-4,'mp3Sha256':hashlib.sha256(raw[4:]).hexdigest()}
            payload.append(raw[4:]);count+=audio['sampleCount']
        elif t.tag=='ShowFrame':
            demand(set(active)=={1,2} and audio is not None,'complete frame')
            frames.append({'frame':len(frames)+1,'layers':[active[1],active[2]],'audio':audio});audio=None
    demand(len(frames)==138 and count==252864,'complete timeline and samples')
    mp3=b''.join(payload); existing,audio_pin=pin(BASE/'source-v1/source-stream-142.mp3','6ac6c824b8877f0365fb3ee878b2ba08e5015c44aa5e33fa3e9acc19dbe2e856')
    demand(existing==mp3,'independent common-extractor match')
    demand(all(f['audio']['seekSamples']>=0 for f in frames),'no negative-seek segments')
    demand(frames[0]['audio']['seekSamples']==1673 and frames[-1]['layers']==frames[-2]['layers'],'latency and last-frame hold')
    return {'schemaVersion':1,'animationId':'shared-alg001-l07-p001','source':source,'xml':xml,'rootScripts':root_scripts,
      'title':TITLE,'stage':{'width':800,'height':600,'backgroundColor':'#b8d8f7'},'fps':12,'rootFrameCount':10,'rootEntryFrame':6,
      'rootPlacement':{'characterId':142,'xTwips':8248,'yTwips':5666},'frameDomain':'sprite-142','frameCount':138,'texts':texts,'frames':frames,
      'stream':{'pin':audio_pin,'head':st.find('SoundStreamHead').attrib,'blockCount':138,'sampleCount':count,'firstSeekSamples':1673},
      'behavior':{'sourceChildDisposition':'loop-no-terminal-script','rootHostDependency':'InternalPreloader.jump_check; exact historical host execution unverified',
        'reachableInteractiveControls':0,'unreachableLibraryScripts':'Progress-bar and Flash UI component library are not instantiated by the reachable root/main display list.',
        'spanishAudio':'No separate SA candidate for this placement in the source catalog; embedded stream language unaccepted.',
        'originalRuntimeAccepted':False}}

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');a=ap.parse_args()
    value=build();p=BASE/'native-v1/source-model-v1.json';b=(json.dumps(value,indent=2,ensure_ascii=False)+'\n').encode()
    if a.check:demand(p.read_bytes()==b,'generated source model drift')
    else:p.parent.mkdir(exist_ok=True);p.open('xb').write(b)
    print(json.dumps({'pass':True,'frames':138,'title':value['title'],'sourceSha256':SHA,'mode':'check' if a.check else 'write'}))
