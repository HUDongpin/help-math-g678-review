"""Generate DAT source placement state from pinned source Canvas and audited contract."""
import argparse,hashlib,json,re
from pathlib import Path
R=Path(__file__).resolve().parent.parent;B=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f');O=R/'work/g678-shared-page-factory/dat-l05-interactive-canvas-v1';ID='shared-dat001-l05-p040';pins={}
def pin(p,b):return{'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p,expected=None):
 p=Path(p);b=p.read_bytes();d=pin(p,b)
 if expected:assert d==expected
 pins[str(p)]=d;return b
def build():
 c=json.loads(read(B/'dat-l05-source-contract-v1/contract.json'));assert c['status']=='dat-drag-feedback-enlargement-and-glossary-source-contract-recovered';read(c['source']['path'],c['source']);oldPath=R/f'work/g678-shared-page-factory/g678-advanced-manual-current-js-3-v1/members/{ID}/canvas-renderer.js';source=read(oldPath).decode();assert hashlib.sha256(source.encode()).hexdigest()=='bfe15341e4b321925ebbb558618800c8b07ae442c1d82260cd9515d2d590cf80';derived=source;changes={}
 # Direct main placements retain every authored matrix component except the x/y position explicitly controlled by source drag code.
 for item in c['dragItems']:
  char=item['characterId'];name=item['sourceId'];pattern=r'(?m)^(\s*)place\("sprite'+str(char)+r'",canvas,ctx,\[([^\]]+)\],([^\n]+)\);$'
  def replace(m):
   matrix=m[2].split(',');assert len(matrix)==6;assert float(matrix[4])==item['sourceOriginTwips']['x']/20 and float(matrix[5])==item['sourceOriginTwips']['y']/20;matrix[4]=f'__datState.positions.{name}.x/20';matrix[5]=f'__datState.positions.{name}.y/20';return m[1]+f'place("sprite{char}",canvas,ctx,['+','.join(matrix)+'],'+m[3]+');'
  derived,n=re.subn(pattern,replace,derived);assert n==17,(char,n);changes[name]=n
 for item in c['feedback']:
  char=item['characterId'];pattern=r'(?m)^(\s*)place\("sprite'+str(char)+r'",canvas,ctx,\[([^\]]+)\],ctrans,1,([^,]+),237,time\);$'
  def replace(m):
   matrix=m[2].split(',');matrix[4]='5';return m[1]+f'if (__datState.feedbackObjectId === {char}) place("sprite{char}",canvas,ctx,['+','.join(matrix)+'],ctrans,1,__datState.feedbackFrame-1,237,time);'
  derived,n=re.subn(pattern,replace,derived);assert n==1,(char,n);changes[item['instanceName']]=n
 for popup in c['popups']:
  char=popup['characterId'];name=popup['instanceName'];pattern=r'(?m)^(\s*)place\("sprite'+str(char)+r'",canvas,ctx,\[([^\]]+)\],ctrans,1,([^,]+),(\d+),time\);$'
  def replace(m):return m[1]+f'if (__datState.enlargements.{name}.open) place("sprite{char}",canvas,ctx,['+m[2]+'],ctrans,1,1,'+m[4]+',time);'
  derived,n=re.subn(pattern,replace,derived);assert n==232,(char,n);changes[name]=n
  for child in popup['childLoops']:
   childId=child['characterId'];pattern=r'(?m)^(\s*)place\("sprite'+str(childId)+r'",canvas,ctx,\[([^\]]+)\],ctrans,1,\(0\+time\)%'+str(child['frameCount'])+r',1,time\);$'
   replacement=lambda m:m[1]+f'place("sprite{childId}",canvas,ctx,['+m[2]+f'],ctrans,1,1+(__datState.enlargements.{name}.elapsedFrames % {child["frameCount"]-2}),1,time);'
   derived,n=re.subn(pattern,replacement,derived);assert n==1,(childId,n)
 origins={i['sourceId']:{'x':i['sourceOriginTwips']['x'],'y':i['sourceOriginTwips']['y']} for i in c['dragItems']};popupDefaults={p['instanceName']:{'open':False,'elapsedFrames':0} for p in c['popups']};default={'positions':origins,'feedbackObjectId':None,'feedbackFrame':1,'enlargements':popupDefaults};domains={str(r['characterId']):r['frameCount'] for r in c['feedback']}
 needle='function resolveFrameState(request) {';assert derived.count(needle)==1;derived=derived.replace(needle,'var __datState = '+json.dumps(default)+';\n'+needle)
 needle='    var allowedScenarios = ["source-static-frame"];'
 extra='''    var defaults = DEFAULTS, raw = request.interaction === undefined ? defaults : request.interaction;
    var domains = DOMAINS, positions = {}, enlargements = {};
    if (!raw || typeof raw !== "object" || !raw.positions || !raw.enlargements ||
        Object.keys(raw.positions).sort().join(",") !== Object.keys(defaults.positions).sort().join(",") ||
        Object.keys(raw.enlargements).sort().join(",") !== Object.keys(defaults.enlargements).sort().join(",") ||
        !Number.isSafeInteger(raw.feedbackFrame) ||
        (raw.feedbackObjectId === null ? raw.feedbackFrame !== 1 :
          !Number.isSafeInteger(raw.feedbackObjectId) || !Object.prototype.hasOwnProperty.call(domains, raw.feedbackObjectId) || raw.feedbackFrame < 2 || raw.feedbackFrame > domains[raw.feedbackObjectId]) ||
        (frame !== 238 && raw.feedbackObjectId !== null)) throw new Error("invalid-source-drag-state");
    Object.keys(defaults.positions).forEach(function (key) {
        var p = raw.positions[key], initial = defaults.positions[key];
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.x)>16000 || Math.abs(p.y)>16000 ||
            (frame<238 && (p.x!==initial.x || p.y!==initial.y))) throw new Error("invalid-source-drag-state");
        positions[key] = Object.freeze({x:p.x,y:p.y});
    });
    Object.keys(defaults.enlargements).forEach(function (key) {
        var p = raw.enlargements[key];
        if (!p || typeof p.open!=="boolean" || !Number.isSafeInteger(p.elapsedFrames) || p.elapsedFrames<0 ||
           (!p.open && p.elapsedFrames!==0) || (frame<23 && p.open)) throw new Error("invalid-source-enlargement-state");
        enlargements[key] = Object.freeze({open:p.open,elapsedFrames:p.elapsedFrames});
    });
    var interaction=Object.freeze({positions:Object.freeze(positions),enlargements:Object.freeze(enlargements),feedbackObjectId:raw.feedbackObjectId,feedbackFrame:raw.feedbackFrame});
'''.replace('DEFAULTS',json.dumps(default)).replace('DOMAINS',json.dumps(domains))
 assert derived.count(needle)==1;derived=derived.replace(needle,extra+needle)
 for needle,extra in [('        interactiveStateResolved: false,','\n        interaction: interaction,\n        sourcePlacementStateResolved: true,'),('    var previousCanvas = canvas;','\n    var previousInteraction = __datState;\n    __datState = state.interaction;'),('        canvas = previousCanvas;','\n        __datState = previousInteraction;'),('        targetCanvas.setAttribute("data-flash-frame", String(state.localFrame));','\n        targetCanvas.setAttribute("data-source-feedback-object", String(state.interaction.feedbackObjectId));\n        targetCanvas.setAttribute("data-source-feedback-frame", String(state.interaction.feedbackFrame));\n        targetCanvas.setAttribute("data-source-drag-positions", JSON.stringify(state.interaction.positions));\n        targetCanvas.setAttribute("data-source-enlargements", JSON.stringify(state.interaction.enlargements));')]:
  assert derived.count(needle)==1;derived=derived.replace(needle,needle+extra)
 needle=f'registry["{ID}"] = Object.freeze({{metadata: METADATA, ready: ready, resolveFrameState: resolveFrameState, render: render}});';assert derived.count(needle)==1;derived=derived.replace(needle,f'Object.defineProperty(registry,"{ID}",{{value:Object.freeze({{metadata:METADATA,ready:ready,resolveFrameState:resolveFrameState,render:render}}),writable:false,configurable:false,enumerable:true}});')
 pattern=r'(?ms)^function ((?:shape|text|sprite|button|morphshape)\d+)\([^\n]+\{.*?^}';before={m[1]:m[0] for m in re.finditer(pattern,source)};after={m[1]:m[0] for m in re.finditer(pattern,derived)};assert before.keys()==after.keys();changed=sorted(k for k in before if before[k]!=after[k]);assert changed==['sprite121','sprite133','sprite315'],changed
 read(__file__);asset=derived.encode();config={'animationId':ID,'sourceSwfSha256':c['source']['sha256'],'frameCount':254,'questionFrame':238,'defaultInteraction':default,'contract':c,'assetSha256':hashlib.sha256(asset).hexdigest()};outputs={O/'members'/ID/'canvas-renderer.js':asset,O/'config.json':(json.dumps(config,ensure_ascii=False,indent=2)+'\n').encode()};manifest={'status':'unregistered-dat-source-interaction-canvas-candidate','source':c['source'],'originalCanvas':pins[str(oldPath)],'sourceDrawingFunctionCount':len(before),'changedDrawingFunctions':changed,'changedFunctionScope':'sprite315 authored placement state; sprite121/133 source-triggered child frame dispatch; all vector, text, bitmap and feedback child drawing code retained','placementsChanged':changes,'inputs':list(pins.values()),'outputs':[pin(p,b) for p,b in outputs.items()],'registered':False,'audioRendered':False,'productCalibrationPassed':False,'originalRuntimeAccepted':False,'humanAccepted':False,'ownerAccepted':False};outputs[O/'manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode();return outputs
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();outputs=build()
 for p,b in outputs.items():
  if args.check:assert p.read_bytes()==b
  else:
   p.parent.mkdir(parents=True,exist_ok=True)
   with p.open('xb') as f:f.write(b)
 print(json.dumps({'output':str(O),'files':len(outputs),'checked':args.check}))
