#!/usr/bin/env python3
"""Finish only the unrun real-root isolation mode on the successful v2 build."""
import hashlib
import json
import os
import pathlib
import socket
import subprocess
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'output/nms-l02-p053-product-20260928/production'
LINK = ROOT / 'apps/web/.next-alg-p001-production-scan'
OLD = '/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
NEW = '/Volumes/American Dream/hudongpin/g678-p053-product-build-output-20260928/next-output-v2'

def pin(relative):
    body = (ROOT / relative).read_bytes()
    return {'path': relative, 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}

def verify(item):
    assert pin(item['path']) == item, item['path']

def listening():
    with socket.socket() as sock:
        sock.settimeout(.5)
        return sock.connect_ex(('127.0.0.1', 3332)) == 0

def switch(expected, target):
    temporary = LINK.with_name(LINK.name + '.p053-v2-resume')
    assert not os.path.lexists(temporary)
    assert LINK.is_symlink() and os.readlink(LINK) == expected
    temporary.symlink_to(target)
    try:
        assert os.readlink(LINK) == expected
        os.replace(temporary, LINK)
    finally:
        if temporary.is_symlink():
            temporary.unlink()

assert __debug__ and not listening()
assert LINK.is_symlink() and os.readlink(LINK) == OLD
assert pathlib.Path(NEW).resolve() == pathlib.Path(NEW)
record = json.loads((OUT / 'build-receipt-v2.json').read_text())
assert record['exitCode'] == 0 and record['inputsStable'] and record['configRestored']
assert pin(NEW + '/BUILD_ID')['sha256'] == record['buildId']['sha256']
for item in record['inputsAfter'] + record['configAfterRestore']:
    verify(item)
restoration = json.loads((OUT / 'production-build-link-restoration-v2.json').read_text())
assert restoration['restored'] and restoration['buildSucceeded']
assert restoration['failure'] == 'Owned production port must be free'
assert restoration['preservedBuildIdsBefore'] == restoration['preservedBuildIdsAfter']
for item in restoration['preservedBuildIdsBefore']:
    verify(item)
first = json.loads((OUT / 'product-candidate-v2-unset.json').read_text())
assert first['status'] == 'technical-pass-not-deployment'
assert first['expectedCases'] == len(first['results']) == 2240
assert not (OUT / 'product-candidate-v2-real-root.json').exists()
receipt = OUT / 'product-v2-real-root-resume-receipt.json'
assert not receipt.exists()
environment = dict(os.environ)
environment.update(record['selectedNonSecretEnvironment'])
server = None
changed = False
failure = None
try:
    switch(OLD, NEW)
    changed = True
    with (OUT / 'production-server-real-root-v2-resume.log').open('x') as log:
        server = subprocess.Popen(['node', '../../node_modules/next/dist/bin/next',
            'start', '--hostname', '127.0.0.1', '--port', '3332'],
            cwd=ROOT / 'apps/web', env=environment, stdout=log, stderr=subprocess.STDOUT)
        for _ in range(120):
            assert server.poll() is None, 'Owned server exited'
            if listening():
                break
            time.sleep(.25)
        else:
            raise RuntimeError('Owned server not ready')
        result = subprocess.run(['node', 'scripts/check-nms-l02-p053-product-production-v2.mjs',
            '--run', 'product-candidate-v2', 'real-root'], cwd=ROOT, env=environment, timeout=900)
        assert result.returncode == 0
        second = json.loads((OUT / 'product-candidate-v2-real-root.json').read_text())
        assert second['status'] == 'technical-pass-not-deployment'
        assert second['expectedCases'] == len(second['results']) == 2240
except BaseException as error:
    failure = str(error)
    raise
finally:
    if server is not None and server.poll() is None:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait(timeout=10)
    if changed:
        switch(NEW, OLD)
    for item in record['inputsAfter'] + record['configAfterRestore'] + restoration['preservedBuildIdsBefore']:
        verify(item)
    assert os.readlink(LINK) == OLD and not listening()
    with receipt.open('x') as stream:
        json.dump({'kind': 'nms-l02-p053-real-root-resume-v1',
            'build': pin('output/nms-l02-p053-product-20260928/production/build-receipt-v2.json'),
            'firstMode': pin('output/nms-l02-p053-product-20260928/production/product-candidate-v2-unset.json'),
            'secondMode': pin('output/nms-l02-p053-product-20260928/production/product-candidate-v2-real-root.json') if failure is None else None,
            'script': pin('scripts/resume-nms-l02-p053-product-v2-real-root.py'),
            'inputsStable': True, 'configStable': True, 'oldBuildIdsStable': True,
            'restored': True, 'serverExited': True, 'failure': failure,
            'acceptanceEffect': 'none'}, stream, indent=2)
        stream.write('\n')
print('P053_PRODUCT_V2_BOTH_MODES_4480_PASSED')
