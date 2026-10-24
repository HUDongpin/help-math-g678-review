import json
import pathlib
import subprocess
import sys

root = pathlib.Path(__file__).resolve().parent
name = sys.argv[1]
assert name in ['correct', 'wrong-lifecycle', 'canvas']
run = subprocess.run(['/Users/peter/.codex/skills/playwright/scripts/playwright_cli.sh', '-s=p050-source',
                      'run-code', (root / f'browser-{name}-v1.js').read_text()], capture_output=True, text=True)
raw = run.stdout + run.stderr
(root / f'browser-{name}-v1.txt').write_text(raw)
if run.returncode or '### Error' in raw or '### Result\n' not in raw:
    print(raw)
    sys.exit(1)
result = json.loads(raw.split('### Result\n', 1)[1].split('\n### Ran', 1)[0])
(root / f'browser-{name}-v1.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'result': name, 'pass': result.get('pass'), 'summary': result.get('summary')}, indent=2))
