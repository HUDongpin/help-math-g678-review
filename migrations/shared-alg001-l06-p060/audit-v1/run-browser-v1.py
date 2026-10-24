from pathlib import Path
import json,subprocess,sys
A=Path(__file__).resolve().parent;name=sys.argv[1];version=sys.argv[2]if len(sys.argv)>2 else'v1'
assert name in ['gallery','quiz','audio','lifecycle','responsive'];assert version in ['v1','v2','v3']
r=subprocess.run(['/Users/peter/.codex/skills/playwright/scripts/playwright_cli.sh','-s=p060-candidate','run-code',(A/f'browser-{name}-{version}.js').read_text()],capture_output=True,text=True)
raw=r.stdout+r.stderr;(A/f'browser-{name}-{version}.txt').write_text(raw)
if r.returncode or '### Error' in raw or '### Result\n'not in raw:print(raw);raise SystemExit(1)
result=json.loads(raw.split('### Result\n',1)[1].split('\n### Ran',1)[0]);(A/f'browser-{name}-{version}.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'pass':result.get('pass'),'rows':len(result.get('rows',[])),'contexts':result.get('contexts'),'requests':result.get('requests')}))
