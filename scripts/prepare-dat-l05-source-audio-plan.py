"""Pin DAT's eight measured native decoders and source-owned audio transitions."""
import argparse,hashlib,json
from pathlib import Path
R=Path(__file__).resolve().parent.parent;B=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f');O=R/'work/g678-shared-page-factory/dat-l05-source-audio-plan-v1';ID='shared-dat001-l05-p040';pins={}
def read(p,expected=None):
 p=Path(p);s=p.stat();b=p.read_bytes();a=p.stat();assert(s.st_ino,s.st_size,s.st_mtime_ns)==(a.st_ino,a.st_size,a.st_mtime_ns);d={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if expected:assert d==expected
 pins[str(p)]=d;return b
def build():
 contract=json.loads(read(B/'dat-l05-source-contract-v1/contract.json'));native=json.loads(read(B/'interactive-audio-decoder-v1/receipt.json'));assert native['status']=='eighteen-native-decoder-bindings-measured';rows=[r for r in native['records'] if r['animationId']==ID];assert len(rows)==8
 expected={315:254,**{r['characterId']:r['frameCount'] for r in contract['feedback']}};clips=[];payloads={}
 for r in rows:
  char=int(r['frameDomain'].removeprefix('sprite-'));assert expected[char]==r['domainFrames'];read(r['source']['path'],r['source']);assert r['source']==contract['source'];data=read(r['payload']['path'],r['payload']);read(r['pcm']['path'],r['pcm']);assert r['measurements'][0]==r['measurements'][1];assert r['decoder']['pcmSha256']==r['pcm']['sha256'];assert r['measurements'][0]['state']=='suspended' and r['measurements'][0]['currentTime']==0
  for block in r['negativeSeekBlocks']:assert block['sampleCount']==block['mp3Bytes']==block['mpegFrameCount']==0 and block['rawBytes']==4
  payloads[O/'payloads'/(r['payload']['sha256']+'.mp3')]=data
  clips.append({'frameDomain':r['frameDomain'],'frameCount':r['domainFrames'],'audioFirstFrame':r['firstBlockFrame'],'latencySamples':r['latencySamples'],'decoder':r['decoder'],'terminalEmptyNegativeSeekBlocks':r['negativeSeekBlocks'],'role':'main' if char==315 else'conditional-feedback','sourcePayload':r['payload'],'sourcePcm':r['pcm']})
 main=next(c for c in clips if c['role']=='main');assert main['audioFirstFrame']==24 and main['decoder']['decodedSamples']==423936;assert len([x for c in clips for x in c['terminalEmptyNegativeSeekBlocks']])==1
 canvas=json.loads(read(R/'work/g678-shared-page-factory/dat-l05-interactive-canvas-v1/manifest.json'));qa=json.loads(read(B/'dat-l05-canvas-qa-v3/receipt.json'));assert qa['status']=='source-canvas-drag-popup-and-feedback-tests-passed' and qa['inputsUnchanged'];assert len(qa['records'])==279
 for p in qa['inputs']:read(p['path'],p)
 for p in ['packages/demos/src/dat-l05-source-interaction.ts','packages/demos/tests/dat-l05-source-interaction.test.ts']:read(R/p)
 tests=read(B/'preflight/dat-l05-source-interaction-v1.log').decode();assert 'pass 9' in tests and 'fail 0' in tests;types=read(B/'preflight/dat-l05-source-interaction-demos-types-v1.log').decode();assert 'error TS' not in types
 read(__file__);plan={'sourceSwfSha256':contract['source']['sha256'],'animationId':ID,'fps':12,'clips':clips,'main':contract['main'],'feedbackSelector':{'wrong':[202,214,226],'right':[314,258,294,266],'sourceSnapshotOnly':True,'adobeRandomStateAccepted':False},'requiredTransitions':['Hold main238 until all five correct drops and the currently active right feedback reaches its source terminal.','Start a selected source feedback at child2 and host x5; no invented wrong-feedback dismissal.','Press on another unlocked source retires feedback and its pending completion before starting drag.','Retain correct locks committed at drop even when its feedback is interrupted.','Retain source-specific frame counts and empty negative-seek block metadata even for MP3 bytes shared with another page.','Reset all transient clocks and source state on Replay; distinguish modern quizTryCount initialization from unproven original state.','Drive popup child loops independently of stopped question main; bind global pause, glossary pause and cross-page cleanup explicitly.'],'originalRuntimeAccepted':False,'audioAccepted':False,'productCalibrationPassed':False};outputs={**payloads,O/'plan.json':(json.dumps(plan,ensure_ascii=False,indent=2)+'\n').encode()};manifest={'status':'unregistered-dat-source-audio-integration-inputs','source':contract['source'],'decoderMeasurementsReverified':8,'originalMeasurementRuns':16,'canvasCasesPassed':279,'sourceInteractionTestsPassed':9,'registered':False,'inputs':list(pins.values()),'outputs':[{'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()} for p,b in outputs.items()],'originalRuntimeAccepted':False,'audioAccepted':False,'productCalibrationPassed':False,'humanAccepted':False,'ownerAccepted':False};outputs[O/'manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode()
 for p in list(pins.values()):read(p['path'],p)
 return outputs
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();outputs=build()
 for p,b in outputs.items():
  if args.check:assert p.read_bytes()==b
  else:
   p.parent.mkdir(parents=True,exist_ok=True)
   with p.open('xb') as f:f.write(b)
 print(json.dumps({'output':str(O),'files':len(outputs),'checked':args.check}))
