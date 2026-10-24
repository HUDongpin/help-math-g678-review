"""Rebuild P050 inventories from source-bound audits; never assert acceptance."""
import csv
import hashlib
import io
import json
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'migrations/shared-nms002-l02-p050'
AUDIT = WORK / 'audit'
SHA = '28600adb8cd9a280e5052a25e448b7c71fc4b85ac4a5e89f6a73f23d7768a197'
def read(name):
    value = json.loads((AUDIT / name).read_text())
    assert value['sourceSha256'] == SHA, name
    return value
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
assert digest(AUDIT / 'source-input.swf') == SHA
shapes = read('shape-role-disposition-v1.json')['rows']
exports = {int(Path(v['path']).stem): v for v in read('shape-export-intake-v1.json')['files']}
texts = read('teaching-text-role-intake-v1.json')['roles']
streams = read('source-pcm-inventory-v1.json')['streams']
assert len(shapes) == 32 and len(texts) == 25 and len(streams) == 4
assert not {55,90,92}.intersection(v['characterId'] for v in texts)
assets = []
source = 'audit/source-input.swf'
for row in shapes:
    cid = row['characterId']; export = exports[cid]
    assert digest(Path(export['path'])) == export['sha256']
    assets.append(dict(asset_id=f'shape-{cid}', swf_character_id=cid, type='shape', source_file=source,
        exported_file=export['path'], sha256=export['sha256'], format='svg',
        transformation='FFDec SVG extraction; native rendering pending', confidence='source-bound',
        license_or_provenance='Owner-provided source SWF', notes=row['role'] + '; source tag SHA-256 ' + row['sourceTagSha256']))
for row in texts:
    cid = row['characterId']
    assets.append(dict(asset_id=f'text-{cid}', swf_character_id=cid, type='static-text',source_file=source,
        format='SWF DefineText', transformation='Semantic role recovered; bilingual implementation pending',
        confidence='source-bound', license_or_provenance='Owner-provided source SWF',
        notes=row['role'] + '; source tag SHA-256 ' + row['sourceTagSha256']))
audio = []
for row in streams:
    cid = int(row['domain'].split('-')[1]); file = ROOT / row['source']['path']
    assert digest(file) == row['source']['sha256']
    assert digest(ROOT / row['pcm']['path']) == row['pcm']['sha256']
    first = {88:1,91:2,93:3,94:3}[cid]
    notes = ('Unselected: no Coach_audio_1 start call recovered.' if cid == 93 else 'Selected native stream; source-frame PCM scheduling required.')
    audio.append(dict(cue_id=f'stream-{cid}',language='en',source_file=str(file),sha256=row['source']['sha256'],
        start_frame=first,start_frame_domain_id=row['domain'],start_semantics='source-first-stream-block',
        duration_ms=f"{row['seconds']*1000:.6f}",format='mp3',channels=row['channels'],sample_rate_hz=row['sampleRate'],
        source_character_id=cid,notes=notes+' Duration is full decoded source, not scheduled playback. Listening acceptance pending.'))
for name, rows in [('asset-inventory.csv', assets), ('audio-inventory.csv', audio)]:
    path = WORK / name
    fields = next(csv.reader(io.StringIO(path.read_text())))
    output = io.StringIO(newline=''); writer = csv.DictWriter(output, fieldnames=fields,lineterminator='\n')
    writer.writeheader();writer.writerows(rows)
    if '--check' in sys.argv:
        assert path.read_text() == output.getvalue(), f'Stale {name}'
    else:
        path.write_text(output.getvalue())
print('PASS: 57 source-bound asset rows; 4 verified audio rows (3 selected, 1 unselected).')
