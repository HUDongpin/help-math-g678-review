from pathlib import Path
import json, subprocess, sys
base=Path(__file__).resolve().parent
name=sys.argv[1]
assert name in ['player','pending']
code=(base/f'browser-{name}-v1.js').read_text()
run=subprocess.run(['/Users/peter/.codex/skills/playwright/scripts/playwright_cli.sh','-s=p031-source','run-code',code],capture_output=True,text=True)
raw=run.stdout+run.stderr
(base/f'browser-{name}-v1.txt').write_text(raw)
if run.returncode or '### Error' in raw or '### Result\n' not in raw:
 print(raw);sys.exit(1)
result=json.loads(raw.split('### Result\n',1)[1].split('\n### Ran',1)[0])
(base/f'browser-{name}-v1.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'pass':result.get('pass'),'rows':len(result.get('rows',[])),'contexts':result.get('contexts'),'requests':result.get('requests')}))
