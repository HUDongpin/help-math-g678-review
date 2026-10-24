from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1]
PINS=[{'path': '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/migrations/shared-nms002-l02-p027/audit/source-behavior-contract-v1.json', 'sha256': 'c5956fbb732cf6ddf9c55c88b718f20604b33fab1f91c61019a7f5886341d572'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p027-native-ir-v1/source-ir.json', 'sha256': '3b33e9fb744a4b725246870b78ac7eb62fd40a806f780c593851f42abf34dcc9'}]
for pin in PINS:assert hashlib.sha256(Path(pin['path']).read_bytes()).hexdigest()==pin['sha256']
c=json.loads(Path(PINS[0]['path']).read_text());ir=json.loads(Path(PINS[1]['path']).read_text())
def wrong(index):
 domain=str(c['feedback']['wrongHelpers']['Mc_Wrong_Feed'+str(index)])
 popup=next(i+1 for i,poses in enumerate(ir['domains'][domain]['frames'])if any(p['name']=='Mc_Feed_Popup'and p['color'][3]>0 for p in poses))
 return dict(domain=domain,hold=c['feedback']['wrongHoldFrames'][domain],close=c['feedback']['wrongCloseStarts'][domain],end=c['feedback']['wrongTerminalFrames'][domain],popup=popup,title={'98':'OH! NO','77':'incorrect!','62':'Try Again!','116':'OH! NO'}[domain])
right=[dict(domain=str(c['feedback']['rightHelpers']['Mc_Right_Feed'+str(i)]),end=c['feedback']['rightTerminalFrames'][str(c['feedback']['rightHelpers']['Mc_Right_Feed'+str(i)])],title={1:'YOU GOT IT!',2:'Correct!',3:'Excellent!',4:'Excellent!'}[i])for i in range(1,5)]
value=dict(animationId=c['animationId'],sourceSha256=c['source']['sha256'],mainDomain='207',mainFrames=384,quizStop=264,fps=12,options=[o['fraction']for o in c['question']['options']],correctIndex=next(i for i,o in enumerate(c['question']['options'])if o['correct']),branches=dict(wrong=[wrong(i)for i in range(1,4)],right=right),dormantWrong=wrong(4),hostAuthority='verified-companion-only-exact-Lesson2-unresolved')
s='// Generated from pinned page and companion-qualified behavior evidence; never edit.\nexport const P027_GAME_SOURCE = '+json.dumps(value,separators=(',',':'))+' as const;\n';out=R/'packages/demos/src/generated/nms-l02-p027-game-source-v1.ts'
if '--check'in sys.argv:assert out.read_text()==s
else:
 with out.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',options=4,wrongBranches=3,rightBranches=4,dormantWrong=1)))
