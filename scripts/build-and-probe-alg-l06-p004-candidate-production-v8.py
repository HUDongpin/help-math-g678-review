#!/usr/bin/env python3
"""Build the P004 text-presentation candidate, prove two-mode denial, restore old build."""
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
    raise RuntimeError('Ordinary Python assertions are required')

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'output/alg-l06-p004-production-v8'
LOGICAL = 'apps/web/.next-alg-p001-production-scan'
LINK = ROOT / LOGICAL
P055 = '/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
NEW = '/Volumes/American Dream/hudongpin/g678-p004-candidate-build-output-20260928/next-output-v8'
CHECKER = 'scripts/check-alg-l06-p004-candidate-production-v8.mjs'
V3_BUILD = '/Volumes/American Dream/hudongpin/g678-p004-candidate-build-output-20260928/next-output-v3'
V3_RECEIPT = 'output/alg-l06-p004-production-v3/build-receipt-v3.json'
V3_RESTORATION = 'output/alg-l06-p004-production-v3/production-build-link-restoration-v3.json'
V4_BUILD = '/Volumes/American Dream/hudongpin/g678-p004-candidate-build-output-20260928/next-output-v4'
V4_RECEIPT = 'output/alg-l06-p004-production-v4/build-receipt-v4.json'
V4_RESTORATION = 'output/alg-l06-p004-production-v4/production-build-link-restoration-v4.json'
V5_BUILD = '/Volumes/American Dream/hudongpin/g678-p004-candidate-build-output-20260928/next-output-v5'
V5_RECEIPT = 'output/alg-l06-p004-production-v5/build-receipt-v5.json'
V5_RESTORATION = 'output/alg-l06-p004-production-v5/production-build-link-restoration-v5.json'
SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'
CONFIG = ['apps/web/next-env.d.ts', 'apps/web/tsconfig.json', 'apps/web/next.config.ts']
OLD_BUILDS = [
    '/Volumes/American Dream/hudongpin/g678-p004-candidate-build-output-20260928/next-output-v1',
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
    '/Volumes/American Dream/hudongpin/g678-p053-product-build-output-20260928/next-output-v2',
    '/Volumes/American Dream/hudongpin/g678-p053-formal-build-output-20260928/next-output-v1',
    '/Volumes/American Dream/hudongpin/g678-p003-continuous-build-output-20260928/next-output-v2',
    '/Volumes/American Dream/hudongpin/g678-p003-continuous-build-output-20260928/next-output-v3',
    '/Volumes/American Dream/hudongpin/g678-p003-formal-build-output-20260928/next-output-v1',
    V3_BUILD,
    V4_BUILD,
    V5_BUILD,
]


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def pin(file):
    absolute = pathlib.Path(file) if pathlib.Path(file).is_absolute() else ROOT / file
    assert absolute.resolve() == absolute, 'physical pin required: ' + str(file)
    assert absolute.is_file() and not absolute.is_symlink(), 'ordinary pin: ' + str(file)
    body = absolute.read_bytes()
    return {'path': str(file), 'bytes': len(body),
            'sha256': hashlib.sha256(body).hexdigest()}


def save(file, value):
    with file.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')


def no_listener(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(('127.0.0.1', port)) != 0


def checker_plan():
    output = subprocess.check_output(['node', CHECKER, '--plan'], cwd=ROOT, text=True)
    value = json.loads(output)
    assert value['kind'] == 'alg-l06-p004-candidate-production-plan-v8'
    assert value['buildRoot'] == NEW
    assert value['sourceModes'] == ['unset', 'real-root']
    assert value['routeCount'] == 145
    assert value['headerModes'] == ['anonymous', 'candidate-shaped', 'development-shaped']
    assert value['casesPerMode'] == value['routeCount'] * 6
    assert value['expectedCases'] == 1740 and value['casesPerMode'] == 870
    assert value['writesPerformed'] is False
    return value


def preserved_ids():
    prior = json.loads((ROOT / 'output/alg-l06-p004-production-v7/build-receipt-v7.json').read_text())
    restore = json.loads((ROOT / 'output/alg-l06-p004-production-v7/production-build-link-restoration-v7.json').read_text())
    assert prior['exitCode'] == 0 and prior['inputsStable'] and prior['configRestored']
    assert restore['restored'] and restore['buildSucceeded']
    assert not any(restore.get(k) for k in ['failure','linkRestorationFailure','configurationCleanupFailure'])
    assert restore['preservedBuildIdsBefore'] == restore['preservedBuildIdsAfter']
    assert restore['beforeTarget'] == P055 and restore['afterTarget'] == P055
    assert restore['temporaryTarget'] == '/Volumes/American Dream/hudongpin/g678-p004-candidate-build-output-20260928/next-output-v7'
    assert prior['buildId'] == {**restore['newBuildId'], 'path': LOGICAL + '/BUILD_ID'}
    expected = OLD_BUILDS + ['/Volumes/American Dream/hudongpin/g678-p004-candidate-build-output-20260928/next-output-v6']
    assert [p['path'] for p in restore['preservedBuildIdsAfter']] == [p + '/BUILD_ID' for p in expected]
    old = restore['preservedBuildIdsAfter'] + [restore['newBuildId']]
    assert len(old) == 23 and len({p['path'] for p in old}) == 23
    for item in old:
        assert pin(item['path']) == item
    return old


assert LINK.is_symlink() and os.readlink(LINK) == P055, 'Exact P055 logical build link required'
assert not os.path.lexists(NEW), 'Never overwrite a physical build'
plan = checker_plan()
INPUTS = plan['inputs']
assert len({item['path'] for item in INPUTS}) == len(INPUTS)
for item in INPUTS:
    assert pin(item['path']) == item, 'Checker input drift: ' + item['path']

if sys.argv[1:] == ['--plan']:
    print(json.dumps({'schemaVersion': 1,
        'kind': 'alg-l06-p004-candidate-production-build-plan-v8',
        'logicalPath': LOGICAL, 'beforeTarget': P055, 'newPhysicalRoot': NEW,
        'sourceModes': plan['sourceModes'], 'routeCount': plan['routeCount'],
        'casesPerMode': plan['casesPerMode'], 'expectedCases': plan['expectedCases'],
        'preservedBuildIds': preserved_ids(), 'inputs': INPUTS,
        'config': [pin(file) for file in CONFIG], 'writesPerformed': False}))
    sys.exit(0)

assert sys.argv[1:] == ['--run'], 'Usage: --plan | --run'
assert LINK.resolve() == pathlib.Path(P055)
assert no_listener(3331) and no_listener(3332), 'Stop owned local servers before build'
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
NAMES = ['production-build-v8.log', 'production-server-unset-v8.log',
         'production-server-real-root-v8.log', 'build-receipt-v8.json',
         'production-build-intent-v8.json', 'production-build-link-restoration-v8.json',
         'production-build-failed-v8.json', 'p004-candidate-v8-unset.json',
         'p004-candidate-v8-real-root.json']
for name in NAMES:
    assert not (OUTPUT / name).exists(), 'Preserve earlier evidence: ' + name

original = {file: (ROOT / file).read_bytes() for file in CONFIG}
config_before = [pin(file) for file in CONFIG]
old_ids = preserved_ids()
selected = dict(NODE_ENV='production', NODE_OPTIONS='--max-old-space-size=12288',
    NEXT_TELEMETRY_DISABLED='1', HELP_MATH_ALG_P001_PRODUCTION_SCAN='1',
    HELP_MATH_G678_LOCAL_PREVIEW='true', HELP_MATH_G678_LOCAL_PREVIEW_BIND='127.0.0.1',
    HELP_MATH_G678_SOURCE_ROOT=SOURCE_ROOT,
    HELP_MATH_G678_CALIBRATION_PHASE='frozen16-continuous-audio-provisional-browser-qa',
    HELP_MATH_G678_P052_AUDIO_CANDIDATE='1')
env = dict(os.environ)
env.update(selected)
intent = {'schemaVersion': 1, 'kind': 'alg-l06-p004-candidate-production-build-intent-v8',
    'startedAt': now(), 'logicalPath': LOGICAL, 'beforeTarget': P055,
    'temporaryTarget': NEW, 'preservedBuildIds': old_ids, 'inputs': INPUTS,
    'sourceModes': plan['sourceModes'], 'routeCount': plan['routeCount'],
    'casesPerMode': plan['casesPerMode'], 'expectedCases': plan['expectedCases'],
    'config': config_before, 'dependencyLink': str(DEPENDENCY_LINK),
    'dependencyTarget': DEPENDENCY_TARGET,
    'dependencyRealRoot': str((ROOT / 'node_modules').resolve()),
    'sharpLogicalPath': 'node_modules/sharp/package.json',
    'sharpPackage': pin(str((ROOT / 'node_modules/sharp/package.json').resolve()))}
save(OUTPUT / 'production-build-intent-v8.json', intent)
for file, body in original.items():
    with (OUTPUT / ('production-backup-v8-' + pathlib.Path(file).name)).open('xb') as backup:
        backup.write(body)


def restore_config():
    restored = []
    for file, body in original.items():
        current = (ROOT / file).read_bytes()
        if current == body:
            continue
        assert file == 'apps/web/next-env.d.ts', 'Unexpected configuration mutation'
        expected = [body.replace(prefix, b'./.next-alg-p001-production-scan/types/')
                    for prefix in [b'./.next-alg-p001-local-qa/dev/types/',
                                   b'./.next-current-js-candidate-qa/dev/types/',
                                   b'./.next/dev/types/'] if prefix in body]
        assert current in expected, 'Unknown generated next-env change; preserve for inspection'
        assert (ROOT / file).read_bytes() == current
        (ROOT / file).write_bytes(body)
        restored.append(file)
    return restored


def switch_link(expected, target, label):
    temporary = LINK.with_name(LINK.name + '.p004-candidate-v8-' + label)
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


record = {'schemaVersion': 1, 'kind': 'alg-l06-p004-candidate-local-production-build-v8',
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
    switch_link(P055, NEW, 'switch')
    changed = True
    with (OUTPUT / 'production-build-v8.log').open('x') as log:
        build = subprocess.Popen(record['command'], cwd=ROOT, env=env,
                                 stdout=log, stderr=subprocess.STDOUT,
                                 start_new_session=True)
        try:
            build.wait(timeout=900)
        except BaseException:
            os.killpg(build.pid, signal.SIGTERM)
            try:
                build.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(build.pid, signal.SIGKILL)
                build.wait(timeout=10)
            raise
    record['exitCode'] = build.returncode
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
    save(OUTPUT / 'build-receipt-v8.json', record)
    build_ok = True
    for mode in ['unset', 'real-root']:
        check_env = env.copy()
        if mode == 'unset':
            check_env.pop('HELP_MATH_G678_SOURCE_ROOT', None)
        assert no_listener(3332), 'Owned production port must be free'
        with (OUTPUT / ('production-server-' + mode + '-v8.log')).open('x') as log:
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
            probe = subprocess.run(['node', CHECKER, '--run', 'p004-candidate-v8', mode],
                cwd=ROOT, env=check_env, timeout=900)
            assert probe.returncode == 0, 'P004 candidate production denial failed: ' + mode
            result = OUTPUT / ('p004-candidate-v8-' + mode + '.json')
            evidence = json.loads(result.read_text())
            assert evidence['status'] == 'technical-pass-not-deployment'
            assert evidence['expectedCases'] == plan['casesPerMode']
            assert len(evidence['results']) == plan['casesPerMode']
            assert all(row['pass'] is True for row in evidence['results'])
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
            assert LINK.is_symlink() and os.readlink(LINK) == NEW, 'Concurrent link drift'
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
        'kind': 'alg-l06-p004-candidate-production-link-restoration-v8',
        'logicalPath': LOGICAL, 'beforeTarget': P055, 'temporaryTarget': NEW,
        'afterTarget': os.readlink(LINK) if LINK.is_symlink() else None,
        'restored': restored, 'preservedBuildIdsBefore': old_ids,
        'preservedBuildIdsAfter': ids_after,
        'newBuildId': pin(NEW + '/BUILD_ID') if pathlib.Path(NEW + '/BUILD_ID').is_file() else None,
        'probeReceipts': probe_receipts, 'buildSucceeded': build_ok,
        'failure': failure, 'linkRestorationFailure': link_failure,
        'configurationCleanupFailure': config_failure, 'finishedAt': now()}
    save(OUTPUT / 'production-build-link-restoration-v8.json', restoration)
    if not build_ok:
        record['failure'] = failure
        record['finishedAt'] = now()
        save(OUTPUT / 'production-build-failed-v8.json', record)
    assert ids_after == old_ids and restored and config_failure is None and link_failure is None

print(json.dumps({'status': 'P004_CANDIDATE_PRODUCTION_BUILD_AND_TWO_MODE_DENIAL_PASSED',
                  'restored': restored, 'probeReceipts': probe_receipts}))
