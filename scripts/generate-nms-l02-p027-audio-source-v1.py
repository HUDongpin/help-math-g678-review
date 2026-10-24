from pathlib import Path
import json,hashlib,math,sys
R=Path(__file__).resolve().parents[1];PINS=[{'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p027-behavior-source-v1/audio/measured-source-v1/measurement.json', 'sha256': '332e5fb3b7b9c717e2d335868a8d4fb2d98fef3b60b8cbdd32b4016c56bbbb3c'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p027-native-ir-v1/source-ir.json', 'sha256': '3b33e9fb744a4b725246870b78ac7eb62fd40a806f780c593851f42abf34dcc9'}]
for p in PINS:assert hashlib.sha256(Path(p['path']).read_bytes()).hexdigest()==p['sha256']
measurement=json.loads(Path(PINS[0]['path']).read_text());ir=json.loads(Path(PINS[1]['path']).read_text());audio={}
for s in measurement['streams']:
 k=s['frameDomain'].split('-')[-1];start=math.floor((s['rawFirstFrame']-1)*22050/12+.5);count=s['decoder']['decodedSamples']-s['latencySamples'];total=math.ceil(ir['domains'][k]['frameCount']*22050/12)
 assert count>0 and 0<=start and start+count<=total and s['repeatedDecodeIdentical']and s['ffmpegFullEofPassed']
 audio[k]=dict(**s['decoder'],latencySamples=s['latencySamples'],outputStartSample=start,outputEndSample=start+count,totalSamples=total,firstSourceFrame=s['rawFirstFrame'],lastSourceFrame=s['rawLastFrame'],frameCount=ir['domains'][k]['frameCount'],reachableInNativeQuiz=k!='116',language='und')
assert len(audio)==9
s='// Generated exact-source whole-stream PCM placement. Never edit.\nexport const P027_AUDIO_SOURCES = '+json.dumps(audio,separators=(',',':'))+' as const;\nObject.freeze(P027_AUDIO_SOURCES);\nfor(const s of Object.values(P027_AUDIO_SOURCES))Object.freeze(s);\n';p=R/'packages/demos/src/nms-l02-p027-audio-source-v1.ts'
if '--check'in sys.argv:assert p.read_text()==s
else:
 with p.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',streams=len(audio),samples={k:[v['outputStartSample'],v['outputEndSample'],v['totalSamples']]for k,v in audio.items()})))
