"""Generate source-owned question visibility/feedback state; preserve source drawing functions."""
import argparse,hashlib,json,re
from pathlib import Path
R=Path(__file__).resolve().parent.parent;B=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f');O=R/'work/g678-shared-page-factory/nms-l11-interactive-canvas-v1';ID='shared-nms002-l11-p030';pins={}
def pin(p,b):return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(p,expected=None):
 p=Path(p);b=p.read_bytes();d=pin(p,b)
 if expected:assert d==expected
 pins[str(p)]=d;return b
def build():
 contract=json.loads(read(B/'interactive-source-audit-v1/nms-l11-contract.json'));assert contract['status']=='nms-question-hint-and-feedback-source-contract-recovered';read(contract['source']['path'],contract['source']);sourcePath=R/f'work/g678-shared-page-factory/g678-advanced-manual-current-js-3-v1/members/{ID}/canvas-renderer.js';source=read(sourcePath).decode();assert hashlib.sha256(source.encode()).hexdigest()=='f1a120e9c7c126d8d70433d917f8fa34fda45b1a37c751617f9a0094f65762c3';derived=source
 # Only the one source question frame places these ten characters.
 for sid in [39]+[r['characterId'] for r in contract['feedback']]:
  pattern=r'(?m)^(\s*)place\("sprite'+str(sid)+r'",canvas,ctx,\[([^\]]+)\],ctrans,1,([^,]+),96,time\);$';matches=list(re.finditer(pattern,derived));assert len(matches)==1,(sid,len(matches));m=matches[0];indent,matrix,oldFrame=m.groups();matrix=matrix.split(',');assert len(matrix)==6
  if sid==39:new=indent+'if (__nmsChoice.hintOpen) place("sprite39",canvas,ctx,['+','.join(matrix)+'],ctrans,1,0,96,time);'
  else:
   matrix[4]='5';new=indent+'if (__nmsChoice.feedbackObjectId === '+str(sid)+') place("sprite'+str(sid)+'",canvas,ctx,['+','.join(matrix)+'],ctrans,1,__nmsChoice.feedbackFrame-1,96,time);'
  derived=derived[:m.start()]+new+derived[m.end():]
 definitions={str(r['characterId']):r['frames'] for r in contract['feedback']}
 needle='function resolveFrameState(request) {';assert derived.count(needle)==1;derived=derived.replace(needle,'var __nmsChoice = {hintOpen:false,feedbackObjectId:null,feedbackFrame:1};\n'+needle)
 needle='    var allowedScenarios = ["source-static-frame"];'
 addition='''    var choice = request.choice === undefined ? {hintOpen:false,feedbackObjectId:null,feedbackFrame:1} : request.choice;
    var domainFrames = DOMAIN_FRAMES;
    if (!choice || typeof choice !== "object" || typeof choice.hintOpen !== "boolean" ||
        !Number.isSafeInteger(choice.feedbackFrame) ||
        (choice.feedbackObjectId !== null && (!Number.isSafeInteger(choice.feedbackObjectId) || !Object.prototype.hasOwnProperty.call(domainFrames, choice.feedbackObjectId))) ||
        (choice.feedbackObjectId === null ? choice.feedbackFrame !== 1 : choice.feedbackFrame < 2 || choice.feedbackFrame > domainFrames[choice.feedbackObjectId]) ||
        (choice.hintOpen && choice.feedbackObjectId !== null) ||
        (frame !== 97 && (choice.hintOpen || choice.feedbackObjectId !== null))) {
        throw new Error("invalid-source-question-state");
    }
    choice = Object.freeze({hintOpen:choice.hintOpen,feedbackObjectId:choice.feedbackObjectId,feedbackFrame:choice.feedbackFrame});
'''.replace('DOMAIN_FRAMES',json.dumps(definitions))
 assert derived.count(needle)==1;derived=derived.replace(needle,addition+needle)
 needle='        interactiveStateResolved: false,';assert derived.count(needle)==1;derived=derived.replace(needle,needle+'\n        choice: choice,\n        sourceQuestionVisibilityResolved: true,')
 needle='    var previousCanvas = canvas;';assert derived.count(needle)==1;derived=derived.replace(needle,needle+'\n    var previousChoice = __nmsChoice;\n    __nmsChoice = state.choice;')
 needle='        canvas = previousCanvas;';assert derived.count(needle)==1;derived=derived.replace(needle,needle+'\n        __nmsChoice = previousChoice;')
 needle='        targetCanvas.setAttribute("data-flash-frame", String(state.localFrame));';assert derived.count(needle)==1;derived=derived.replace(needle,needle+'\n        targetCanvas.setAttribute("data-source-hint-open", String(state.choice.hintOpen));\n        targetCanvas.setAttribute("data-source-feedback-object", String(state.choice.feedbackObjectId));\n        targetCanvas.setAttribute("data-source-feedback-frame", String(state.choice.feedbackFrame));')
 needle=f'registry["{ID}"] = Object.freeze({{metadata: METADATA, ready: ready, resolveFrameState: resolveFrameState, render: render}});';assert derived.count(needle)==1;derived=derived.replace(needle,f'Object.defineProperty(registry, "{ID}", {{value: Object.freeze({{metadata: METADATA, ready: ready, resolveFrameState: resolveFrameState, render: render}}), configurable: false, enumerable: true, writable: false}});')
 # All glyph, vector, bitmap and feedback child drawing functions retain exact bytes.
 graphicPattern=r'(?ms)^function ((?:shape|text|sprite|button)\d+)\([^\n]+\{.*?^}'
 before={m[0]:m[1] for m in [(m.group(1),m.group(0)) for m in re.finditer(graphicPattern,source)]};after={m.group(1):m.group(0) for m in re.finditer(graphicPattern,derived)};assert before.keys()==after.keys();changed=[k for k in before if before[k]!=after[k]];assert changed==['sprite260'],changed
 read(__file__);asset=derived.encode();config={'animationId':ID,'sourceSwfSha256':contract['source']['sha256'],'frameCount':356,'questionFrame':97,'sourceHostSelectedFeedbackIds':[r['characterId'] for r in contract['feedback'] if r['selectedByAuditedIndexMISnapshot']],'allSourcePresentFeedbackFrames':definitions,'hint':contract['hint'],'question':contract['question'],'glossary':contract['glossary']};outputs={O/'members'/ID/'canvas-renderer.js':asset,O/'config.json':(json.dumps(config,ensure_ascii=False,indent=2)+'\n').encode()}
 manifest={'status':'unregistered-source-question-canvas-candidate','source':contract['source'],'originalCanvas':pins[str(sourcePath)],'inputs':list(pins.values()),'outputs':[pin(p,b) for p,b in outputs.items()],'sourceDrawingFunctionCount':len(before),'changedDrawingFunctions':['sprite260 placement visibility and selected feedback frame/x only'],'sourceVectorTextBitmapAndChildDrawingFunctionsUnchanged':True,'audioRendered':False,'productCalibrationPassed':False,'originalRuntimeAccepted':False,'humanAccepted':False,'ownerAccepted':False}
 outputs[O/'manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode();return outputs
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();outputs=build()
 for p,b in outputs.items():
  if args.check:assert p.read_bytes()==b
  else:
   p.parent.mkdir(parents=True,exist_ok=True)
   with p.open('xb') as f:f.write(b)
 print(json.dumps({'output':str(O),'checked':args.check,'files':len(outputs)}))
