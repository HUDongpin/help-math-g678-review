from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p026/audit/source-game-contract-v1.json';b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='d5fcef03bf7df86235433071b15308539237e0224130af96015176fe83e0db17'
q=json.loads(b);assert q['source']['sha256']=='d168033f7af079b7fad715adadf4c94fffaa84a8b8ddaefbd8d344ed1cfde1f5';assert len(q['rounds'])==2
for r in q['rounds']:
 assert r['cards']==8 and r['matchesRequired']==4
 for pair in r['pairs']:assert pair['numerator']*pair['totalSectors']==pair['denominator']*pair['coloredSectors']
value=dict(animationId=q['animationId'],sourceSha256=q['source']['sha256'],fps=12,mainFrameCount=q['mainFrames'],rounds=q['rounds'],movementDurationTicks=20)
text='// Generated from exact source game contract; do not edit.\nexport const P026_GAME_SOURCE = '+json.dumps(value,separators=(',',':'))+' as const;\n';out=R/'packages/demos/src/generated/nms-l02-p026-game-source-v1.ts'
if '--check'in sys.argv:assert out.read_text()==text
else:
 with out.open('x')as f:f.write(text)
print(json.dumps(dict(status='PASS',rounds=2,pairs=8,output=str(out))))
