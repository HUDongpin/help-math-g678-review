#!/usr/bin/env python3
"""Isolated P053 formal-route production build plus two-mode local denial; never a deployment."""
import datetime
import hashlib
import json
import os
import pathlib
import signal
import socket
import subprocess
import sys
import time

if not __debug__:
    raise RuntimeError('Safety checks require ordinary Python execution')

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'output/nms-l02-p053-product-20260928/formal-production'
LOGICAL = 'apps/web/.next-alg-p001-production-scan'
LINK = ROOT / LOGICAL
P055 = '/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
NEW = '/Volumes/American Dream/hudongpin/g678-p053-formal-build-output-20260928/next-output-v1'
PRODUCT_SUCCESS = '/Volumes/American Dream/hudongpin/g678-p053-product-build-output-20260928/next-output-v2'
PRODUCT_RECEIPTS = [
    'output/nms-l02-p053-product-20260928/production/build-receipt-v2.json',
    'output/nms-l02-p053-product-20260928/production/product-candidate-v2-unset.json',
    'output/nms-l02-p053-product-20260928/production/product-candidate-v2-real-root.json',
    'output/nms-l02-p053-product-20260928/production/product-v2-real-root-resume-receipt.json',
    'output/nms-l02-p053-product-20260928/production/production-build-link-restoration-v2.json',
]
CONFIG = ['apps/web/next-env.d.ts', 'apps/web/tsconfig.json', 'apps/web/next.config.ts']
OLD_BUILDS = [
    P055,
    '/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2',
    '/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2',
    '/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1',
    '/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v2',
    '/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v3',
    '/Volumes/American Dream/hudongpin/g678-p062-build-output-20260928/next-output-v1',
    '/Volumes/American Dream/hudongpin/g678-p064-product-build-output-20260928/next-output-v1',
    '/Volumes/American Dream/hudongpin/g678-p064-formal-build-output-20260928/next-output-v1',
    '/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v2',
    '/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v3',
    '/Volumes/American Dream/hudongpin/g678-p054-formal-build-output-20260928/next-output-v1',
]

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def pin(file):
    body = (ROOT / file).read_bytes()
    return {'path': file, 'bytes': len(body),
            'sha256': hashlib.sha256(body).hexdigest()}

def save(file, value):
    with file.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')

def no_listener(port):
    # A prior owned Next server may leave TIME_WAIT sockets. A connection test
    # identifies an active listener without falsely treating TIME_WAIT as busy.
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(('127.0.0.1', port)) != 0

def checker_plan():
    body = subprocess.check_output(['node',
        'scripts/probe-nms-l02-p053-production-isolation-v1.mjs', '--plan'],
        cwd=ROOT, text=True)
    value = json.loads(body)
    assert value['kind'] == 'nms-l02-p053-formal-production-plan-v1'
    assert value['routeCount'] == 560 and value['expectedCases'] == 4480
    assert value['hostFileCount'] == 212 and value['pageFileCount'] > 0
    assert value['predecessorInputCount'] >= 476
    assert value['domInputCount'] == 41 and value['domExternalCount'] == 135
    assert value['externalFileCount'] == 135
    return value

def preserved_ids():
    result = []
    for root in OLD_BUILDS:
        assert pathlib.Path(root).resolve() == pathlib.Path(root), root
        result.append(pin(root + '/BUILD_ID'))
    result.append(pin(PRODUCT_SUCCESS + '/BUILD_ID'))
    return result

def product_receipts():
    pins = [pin(file) for file in PRODUCT_RECEIPTS]
    build = json.loads((ROOT / PRODUCT_RECEIPTS[0]).read_text())
    assert build['exitCode'] == 0 and build['inputsStable'] is True and build['configRestored'] is True
    for file in PRODUCT_RECEIPTS[1:3]:
        record = json.loads((ROOT / file).read_text())
        assert record['status'] == 'technical-pass-not-deployment'
        assert record['expectedCases'] == 2240 and len(record['results']) == 2240
        assert all(row['pass'] is True for row in record['results'])
    resume = json.loads((ROOT / PRODUCT_RECEIPTS[3]).read_text())
    assert resume['inputsStable'] is True and resume['restored'] is True
    restoration = json.loads((ROOT / PRODUCT_RECEIPTS[4]).read_text())
    assert restoration['restored'] is True and restoration['buildSucceeded'] is True
    return pins

assert LINK.is_symlink() and os.readlink(LINK) == P055, 'Exact original P055 build link required'
assert not os.path.lexists(NEW), 'Never overwrite an earlier P053 build'
probe_plan = checker_plan()
INPUTS = probe_plan['inputs']
assert len({item['path'] for item in INPUTS}) == len(INPUTS)
for item in INPUTS:
    current = pin(item['path'])
    assert current == item, 'Checker input drift: ' + item['path']

if sys.argv[1:] == ['--plan']:
    print(json.dumps({'schemaVersion': 1, 'kind': 'nms-l02-p053-formal-build-plan-v1',
        'logicalPath': LOGICAL, 'beforeTarget': P055, 'newPhysicalRoot': NEW,
        'preservedBuildIds': preserved_ids(), 'inputs': INPUTS,
        'productReceipts': product_receipts(),
        'productionProbeClosure': {key: probe_plan[key] for key in
            ['predecessorInputCount', 'hostFileCount', 'pageFileCount',
             'domInputCount', 'domExternalCount', 'externalFileCount']},
        'config': [pin(file) for file in CONFIG], 'writesPerformed': False}))
    sys.exit(0)

assert not sys.argv[1:], 'Usage: build-and-probe-nms-l02-p053-production-v1.py [--plan]'
assert LINK.resolve() == pathlib.Path(P055)
assert no_listener(3331) and no_listener(3332), 'Stop owned development server before this build'
DEPENDENCY_LINK = pathlib.Path(NEW).parent / 'node_modules'
DEPENDENCY_TARGET = str(ROOT / 'node_modules')
assert (ROOT / 'node_modules/sharp/package.json').is_file()
assert not DEPENDENCY_LINK.parent.is_symlink()
if not os.path.lexists(DEPENDENCY_LINK):
    DEPENDENCY_LINK.parent.mkdir(parents=True, exist_ok=True)
    assert DEPENDENCY_LINK.parent.resolve() == DEPENDENCY_LINK.parent
    DEPENDENCY_LINK.symlink_to(DEPENDENCY_TARGET)
assert DEPENDENCY_LINK.is_symlink() and os.readlink(DEPENDENCY_LINK) == DEPENDENCY_TARGET
assert DEPENDENCY_LINK.resolve() == (ROOT / 'node_modules').resolve()

OUTPUT.mkdir(parents=True, exist_ok=True)
for name in ['production-build-v1.log', 'production-server-unset-v1.log',
             'production-server-real-root-v1.log', 'build-receipt-v1.json',
             'production-build-intent-v1.json', 'production-build-link-restoration-v1.json',
             'production-build-failed-v1.json',
             'formal-candidate-v1-unset.json', 'formal-candidate-v1-real-root.json']:
    assert not (OUTPUT / name).exists(), name

original = {file: (ROOT / file).read_bytes() for file in CONFIG}
config_before = [pin(file) for file in CONFIG]
old_ids = preserved_ids()
selected = dict(NODE_ENV='production', NODE_OPTIONS='--max-old-space-size=12288',
    NEXT_TELEMETRY_DISABLED='1', HELP_MATH_ALG_P001_PRODUCTION_SCAN='1',
    HELP_MATH_G678_LOCAL_PREVIEW='true', HELP_MATH_G678_LOCAL_PREVIEW_BIND='127.0.0.1',
    HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware',
    HELP_MATH_G678_CALIBRATION_PHASE='frozen16-continuous-audio-provisional-browser-qa',
    HELP_MATH_G678_P052_AUDIO_CANDIDATE='1')
env = dict(os.environ)
env.update(selected)
intent = {'schemaVersion': 1, 'kind': 'nms-l02-p053-formal-build-intent-v1',
    'startedAt': now(), 'logicalPath': LOGICAL, 'beforeTarget': P055,
    'temporaryTarget': NEW, 'preservedBuildIds': old_ids, 'inputs': INPUTS,
    'productReceipts': product_receipts(),
    'productionProbeClosure': {key: probe_plan[key] for key in
        ['predecessorInputCount', 'hostFileCount', 'pageFileCount',
         'domInputCount', 'domExternalCount', 'externalFileCount']},
    'config': config_before, 'dependencyLink': str(DEPENDENCY_LINK),
    'dependencyTarget': DEPENDENCY_TARGET,
    'dependencyRealRoot': str((ROOT / 'node_modules').resolve()),
    'sharpPackage': pin('node_modules/sharp/package.json')}
save(OUTPUT / 'production-build-intent-v1.json', intent)
for file, body in original.items():
    with (OUTPUT / ('production-backup-v1-' + pathlib.Path(file).name)).open('xb') as out:
        out.write(body)

def restore_config():
    restored = []
    for file, body in original.items():
        current = (ROOT / file).read_bytes()
        if current == body:
            continue
        assert file == 'apps/web/next-env.d.ts', 'Unexpected configuration mutation'
        expected = [body.replace(prefix,
            b'./.next-alg-p001-production-scan/types/') for prefix in
            [b'./.next-current-js-candidate-qa/dev/types/', b'./.next/dev/types/']
            if prefix in body]
        assert current in expected, 'Unknown generated next-env change; preserve for inspection'
        assert (ROOT / file).read_bytes() == current
        (ROOT / file).write_bytes(body)
        restored.append(file)
    return restored

def switch_link(expected, target, label):
    temporary = LINK.with_name(LINK.name + '.p053-formal-' + label)
    assert not os.path.lexists(temporary), 'Temporary link already exists'
    assert LINK.is_symlink() and os.readlink(LINK) == expected
    temporary.symlink_to(target)
    try:
        assert LINK.is_symlink() and os.readlink(LINK) == expected
        os.replace(temporary, LINK)
    finally:
        if temporary.is_symlink() and os.readlink(temporary) == target:
            temporary.unlink()
    assert os.readlink(LINK) == target

record = {'schemaVersion': 1, 'kind': 'nms-l02-p053-formal-local-production-build-v1',
    'startedAt': now(), 'command': ['npm', 'run', 'build', '--workspace', '@helpmath/web'],
    'configBefore': config_before, 'inputsBefore': INPUTS,
    'selectedNonSecretEnvironment': selected}
server = None
changed = False
build_ok = False
failure = None
probe_receipts = []
try:
    pathlib.Path(NEW).mkdir(parents=True, exist_ok=False)
    assert os.readlink(LINK) == P055
    switch_link(P055, NEW, 'switch')
    changed = True
    with (OUTPUT / 'production-build-v1.log').open('x') as log:
        run = subprocess.Popen(record['command'], cwd=ROOT, env=env, stdout=log,
                               stderr=subprocess.STDOUT, start_new_session=True)
        try:
            run.wait(timeout=900)
        except BaseException:
            os.killpg(run.pid, signal.SIGTERM)
            try:
                run.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(run.pid, signal.SIGKILL)
                run.wait(timeout=10)
            raise
    record['exitCode'] = run.returncode
    record['configAfterBuild'] = [pin(file) for file in CONFIG]
    record['restoredConfig'] = restore_config()
    record['configAfterRestore'] = [pin(file) for file in CONFIG]
    record['configRestored'] = record['configAfterRestore'] == config_before
    record['inputsAfter'] = checker_plan()['inputs']
    record['inputsStable'] = record['inputsAfter'] == INPUTS
    assert record['exitCode'] == 0 and record['configRestored'] and record['inputsStable']
    record['dependencyBinding'] = {key: intent[key] for key in
        ['dependencyLink', 'dependencyTarget', 'dependencyRealRoot', 'sharpPackage']}
    record['buildId'] = {**pin(NEW + '/BUILD_ID'), 'path': LOGICAL + '/BUILD_ID'}
    record['finishedAt'] = now()
    save(OUTPUT / 'build-receipt-v1.json', record)
    build_ok = True
    for mode in ['unset', 'real-root']:
        check_env = env.copy()
        if mode == 'unset':
            check_env.pop('HELP_MATH_G678_SOURCE_ROOT', None)
        assert no_listener(3332), 'Owned production port must be free'
        with (OUTPUT / ('production-server-' + mode + '-v1.log')).open('x') as log:
            server = subprocess.Popen(['node', '../../node_modules/next/dist/bin/next',
                'start', '--hostname', '127.0.0.1', '--port', '3332'],
                cwd=ROOT / 'apps/web', env=check_env, stdout=log,
                stderr=subprocess.STDOUT)
            for _ in range(80):
                assert server.poll() is None, 'Owned production server exited'
                if not no_listener(3332):
                    break
                time.sleep(.25)
            else:
                raise RuntimeError('Production server not ready')
            probe = subprocess.run(['node',
                'scripts/probe-nms-l02-p053-production-isolation-v1.mjs', '--run',
                'formal-candidate-v1', mode], cwd=ROOT, env=check_env, timeout=900)
            assert probe.returncode == 0, 'P053 production denial failed: ' + mode
            result = OUTPUT / ('formal-candidate-v1-' + mode + '.json')
            evidence = json.loads(result.read_text())
            assert evidence['status'] == 'technical-pass-not-deployment'
            assert evidence['expectedCases'] == 2240 and len(evidence['results']) == 2240
            probe_receipts.append(pin(str(result)))
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait(timeout=10)
        server = None
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
    restored = LINK.is_symlink() and os.readlink(LINK) == P055
    link_failure = None
    try:
        if changed or (LINK.is_symlink() and os.readlink(LINK) == NEW):
            assert LINK.is_symlink() and os.readlink(LINK) == NEW, \
                'Link changed concurrently; do not overwrite'
            switch_link(NEW, P055, 'restore')
            restored = os.readlink(LINK) == P055
    except Exception as error:
        link_failure = str(error)
    config_failure = None
    try:
        restore_config()
    except Exception as error:
        config_failure = str(error)
    ids_after = preserved_ids()
    restoration = {'schemaVersion': 1,
        'kind': 'nms-l02-p053-formal-production-build-link-restoration-v1',
        'logicalPath': LOGICAL, 'beforeTarget': P055, 'temporaryTarget': NEW,
        'afterTarget': os.readlink(LINK) if LINK.is_symlink() else None,
        'restored': restored, 'preservedBuildIdsBefore': old_ids,
        'preservedBuildIdsAfter': ids_after,
        'p053BuildId': pin(NEW + '/BUILD_ID') if pathlib.Path(NEW + '/BUILD_ID').is_file() else None,
        'probeReceipts': probe_receipts, 'buildSucceeded': build_ok,
        'failure': failure, 'linkRestorationFailure': link_failure,
        'configurationCleanupFailure': config_failure, 'finishedAt': now()}
    save(OUTPUT / 'production-build-link-restoration-v1.json', restoration)
    if not build_ok:
        record['failure'] = failure
        record['finishedAt'] = now()
        save(OUTPUT / 'production-build-failed-v1.json', record)
    assert ids_after == old_ids and restored and config_failure is None and link_failure is None

print(json.dumps({'status': 'P053_FORMAL_PRODUCTION_BUILD_AND_TWO_MODE_DENIAL_PASSED',
                  'restored': restored, 'probeReceipts': probe_receipts}))
