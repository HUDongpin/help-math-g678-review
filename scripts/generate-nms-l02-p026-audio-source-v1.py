from pathlib import Path
import json,hashlib,sys,math
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p026/audit/source-game-contract-v1.json';b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='d5fcef03bf7df86235433071b15308539237e0224130af96015176fe83e0db17'
q=json.loads(b);a=q['audio'];assert a['decoder']['decodedSamples']==888768 and a['source']['bytes']==200590;assert a['outputStartSample']==12863 and a['outputEndSample']==899958 and a['bufferSamples']==902213
value=dict(sourceSha256=a['source']['sha256'],sourceBytes=a['source']['bytes'],sampleRate=22050,channels=1,decodedSamples=888768,latencySamples=1673,stopSamples=902213,stopSeconds=491/12,firstBlockFrame=8,frames=491,fps=12,language='und',interactiveStopFrames=[392,425],interactiveStopSeconds=[391/12,424/12],segments=[dict(sourceStartSample=1673,sourceEndSample=888768,outputStartSample=12863,outputEndSample=899958)])
s='// Generated whole-stream mapping; never edit. Main clock pauses at authored action entry.\nexport const P026_AUDIO_SOURCE = Object.freeze('+json.dumps(value,indent=2)+' as const);\nObject.freeze(P026_AUDIO_SOURCE.segments);\nfor(const s of P026_AUDIO_SOURCE.segments)Object.freeze(s);\nObject.freeze(P026_AUDIO_SOURCE.interactiveStopFrames);Object.freeze(P026_AUDIO_SOURCE.interactiveStopSeconds);\n';out=R/'packages/demos/src/nms-l02-p026-audio-source-v1.ts'
if '--check'in sys.argv:assert out.read_text()==s
else:
 with out.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',sourceBytes=200590,samples=902213)))
