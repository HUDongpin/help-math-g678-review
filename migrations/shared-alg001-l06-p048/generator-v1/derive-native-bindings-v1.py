#!/usr/bin/env python3
"""Compact P048 source bindings and exact SVG paths for maintained controls."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

assert __debug__
sys.dont_write_bytecode=True
WORK=Path(__file__).resolve().parent.parent
ROOT=WORK.parents[1]
MODEL=WORK/'native-v1/source-model-v1.json'
HELPER=ROOT/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
XML=WORK/'audit-v1/swfmill.xml'
def digest(raw):return hashlib.sha256(raw).hexdigest()
def build():
    assert digest(MODEL.read_bytes())=='adc0ba402c265deb7fa3fb9c06ce1d68454ea8ef5eaa15fa2842b12989ffda5b'
    assert digest(XML.read_bytes())=='fdb167ce605f52fd1af985f1a7a74a000f384871b9374d6f5e054aadf2e20f53'
    assert digest(HELPER.read_bytes())=='5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'
    model=json.loads(MODEL.read_text())
    spec=importlib.util.spec_from_file_location('p048_graph_geometry',HELPER)
    h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
    xml=ET.parse(XML).getroot()
    main=h.timeline(xml.find('.//DefineSprite[@objectID="348"]'),{347})
    quiz=main['snapshots'][223]
    shape=next(x for x in quiz.values() if x['objectId']==145)
    inverse={**h.matrix(),'transX':-shape['matrixTwips']['transX'],'transY':-shape['matrixTwips']['transY']}
    labels=[]
    for tid in range(146,157):
        row=next(x for x in quiz.values() if x['objectId']==tid)
        box=h.box(model['texts'][str(tid)]['boundsTwips'],h.compose(inverse,row['matrixTwips']))
        labels.append({'textId':tid,'text':model['texts'][str(tid)]['text'],'boxPx':box})
    paths=[];source_pins=[]
    for sid in [145,157,347]:
        file=WORK/f'audit-v1/graph-export/{sid}.svg';raw=file.read_bytes()
        source_pins.append({'path':str(file.relative_to(ROOT)),'bytes':len(raw),'sha256':digest(raw)})
        nodes=ET.fromstring(raw).findall('.//{http://www.w3.org/2000/svg}path')
        # 157's last two strokes underline glossary words in the question.
        # Its first four paths are the source efficiency curve and arrow.
        if sid==157:
            assert len(nodes)==6 and nodes[0].get('d').startswith('M464.5 394.05 Q')
            assert nodes[4].get('stroke')==nodes[5].get('stroke')=='#000099'
            nodes=nodes[:4]
        for index,n in enumerate(nodes):
            allowed=['d','fill','fill-rule','stroke','stroke-width','stroke-linecap','stroke-linejoin']
            attrs={k:n.get(k) for k in allowed if n.get(k) is not None}
            paths.append({'shapeId':sid,'pathIndex':index,**attrs})
    highlights=h.compress_selected(main)
    def visible_ranges(instances):
        frames=set()
        for instance in instances:
            for run in instance['runs']:
                color=run['color']
                if color['factor']['Alpha']+color['offset']['Alpha']>0:
                    frames.update(range(run['firstFrame'],run['lastFrame']+1))
        ranges=[]
        for frame in sorted(frames):
            if ranges and ranges[-1][1]+1==frame:ranges[-1][1]=frame
            else:ranges.append([frame,frame])
        return ranges
    options={x['letter']:{**x,'visibleRanges':visible_ranges([i for i in model['mainTextInstances'] if i['objectId']==x['textId']])} for x in model['answerPlacements']}
    return {'kind':'p048-source-native-bindings-v1','animationId':model['animationId'],
      'sourceSha256':model['assetId'][4:],'sourceModelSha256':digest(MODEL.read_bytes()),
      'runtime':model['runtime'],'behavior':model['sourceBehavior'],
      'question':{'textId':144,'text':model['texts']['144']['text'],'firstFrame':2,'lastFrame':327},
      'helpText':[{'textId':tid,'text':model['texts'][str(tid)]['text']} for tid in [133,134,138,135]],
      'options':options,'glossary':model['glossary'],
      'graph':{'sourcePins':source_pins,'viewBox':[400,260,320,190],
        'paths':paths,'labels':labels,'highlightPlacements':highlights,
        'plotPlacementMatrixTwips':shape['matrixTwips'],
        'description':'Machine efficiency versus time in hours. The source curve rises steeply to its highest point near one hour, then falls and levels off.'},
      'streams':[{k:x[k] for k in ['spriteId','role','activeAnswerPath','frameCount','blockCount','payloadBytes','payloadSha256','assetPath']} for x in model['streams']]}

if __name__=='__main__':
    assert sys.argv[1:] in [['--write'],['--check']]
    out=WORK/'native-v1/native-bindings-v2.json';raw=(json.dumps(build(),indent=2,ensure_ascii=False)+'\n').encode()
    if sys.argv[1]=='--write':
        with out.open('xb') as f:f.write(raw)
    else:assert out.read_bytes()==raw
    print(json.dumps({'bytes':len(raw),'sha256':digest(raw)}))
