"""Preserve full public-tool extraction of the canonical P060 SWF."""
from pathlib import Path
import hashlib
import json
import subprocess
import time

ROOT = Path.cwd()
M = ROOT / 'migrations/shared-alg001-l06-p060'
EXTERNAL = Path('/Volumes/American Dream/hudongpin/g678-p060-source-extraction-20261003-v1')
SOURCE = M / 'source-v1/L6FQ02.swf'
EXPECTED = '3228fd031f09bc4f888e35328c4c3ffc1b7a85d430e62af77335fadcd3214832'

def pin(file, relative_to=None):
    body = file.read_bytes()
    return {'path': str(file.relative_to(relative_to) if relative_to else file),
            'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}

assert pin(SOURCE)['sha256'] == EXPECTED
EXPORT = EXTERNAL / 'ffdec-export'
EXPORT.mkdir(parents=True)
commands = [
    (['/opt/homebrew/bin/swfmill', 'swf2xml', str(SOURCE),
      str(EXTERNAL / 'swfmill.xml')], 'swfmill-export-v1.log'),
    (['/opt/homebrew/bin/ffdec', '-format', 'frame:canvas,sprite:canvas',
      '-export', 'script,text,sound,image,shape,morphshape,font,frame,sprite',
      str(EXPORT), str(SOURCE)], 'ffdec-export-v1.log'),
]
runs = []
for command, name in commands:
    started = time.time()
    with (EXTERNAL / name).open('x') as log:
        process = subprocess.run(command, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT)
    runs.append({'command': command, 'startedAt': started,
                 'finishedAt': time.time(), 'exitCode': process.returncode,
                 'log': pin(EXTERNAL / name)})
    assert process.returncode == 0, runs[-1]
files = [pin(f, EXPORT) for f in sorted(EXPORT.rglob('*')) if f.is_file()]
assert files and pin(SOURCE)['sha256'] == EXPECTED
receipt = {'kind': 'p060-source-extraction-v1', 'source': pin(SOURCE),
           'tool': 'JPEXS FFDec 26.2.1 and swfmill 0.3.6', 'runs': runs,
           'exportRoot': str(EXPORT), 'xml': pin(EXTERNAL / 'swfmill.xml'),
           'files': files, 'acceptance': False}
with (M / 'audit-v1/source-extraction-v1.json').open('x') as output:
    output.write(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'files': len(files), 'bytes': sum(f['bytes'] for f in files),
                  'xmlBytes': receipt['xml']['bytes'], 'runs': len(runs)}))
