from pathlib import Path
import json, subprocess, sys
base=Path(__file__).resolve().parent
name=sys.argv[1]
version=sys.argv[2] if len(sys.argv)>2 else 'v1'
assert version in ['v1','v2','v3','v4']
assert name in ['player','branches','continuation','pending']
code=(base/f'browser-{name}-{version}.js').read_text()
run=subprocess.run(['/Users/peter/.codex/skills/playwright/scripts/playwright_cli.sh','-s=p033-candidate','run-code',code],capture_output=True,text=True)
raw=run.stdout+run.stderr
(base/f'browser-{name}-{version}.txt').write_text(raw)
if run.returncode or '### Error' in raw or '### Result\n' not in raw:
 print(raw);sys.exit(1)
result=json.loads(raw.split('### Result\n',1)[1].split('\n### Ran',1)[0])
(base/f'browser-{name}-{version}.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'pass':result.get('pass'),'rows':len(result.get('rows',[])),'contexts':result.get('contexts'),'requests':result.get('requests')}))
