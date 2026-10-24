#!/usr/bin/env python3
"""Build the exact local P008 candidate, check production denial, restore the old build."""
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
    raise RuntimeError('Python assertions are required for this production probe')

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'output/alg-l06-p008-production-v2'
LOGICAL = 'apps/web/.next-alg-p001-production-scan'
LINK = ROOT / LOGICAL
BEFORE = '/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
NEW = '/Volumes/American Dream/hudongpin/g678-p008-candidate-build-output-20260928/next-output-v2'
CHECKER = 'scripts/check-alg-l06-p008-production-v2.mjs'
BUILD_RECEIPT = 'output/alg-l06-p008-production-v2/build-receipt-v1.json'
SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'
CONFIG = ['apps/web/next-env.d.ts', 'apps/web/tsconfig.json', 'apps/web/next.config.ts']
SLUG = 'p008-production-v2'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def pin(file):
    absolute = pathlib.Path(file) if pathlib.Path(file).is_absolute() else ROOT / file
    assert absolute.resolve() == absolute, 'physical pin required: ' + str(file)
    stat = absolute.lstat()
    assert absolute.is_file() and not absolute.is_symlink() and stat.st_nlink == 1, 'ordinary pin: ' + str(file)
    body = absolute.read_bytes()
    after = absolute.lstat()
    stable = lambda value: (value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
                            value.st_ctime_ns, value.st_mode, value.st_nlink)
    assert stable(after) == stable(stat), 'pin changed during read: ' + str(file)
    return {'path': str(file), 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}


def save(file, value):
    with file.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')


def no_listener(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(('127.0.0.1', port)) != 0


def checker_plan():
    value = json.loads(subprocess.check_output(['node', CHECKER, '--plan'], cwd=ROOT, text=True))
    assert value['schemaVersion'] == 1 and value['kind'] == 'alg-l06-p008-production-negative-plan-v1'
    assert value['buildRoot'] == NEW and value['logicalBuildPath'] == LOGICAL
    assert value['buildReceipt'] == BUILD_RECEIPT
    assert value['sourceModes'] == ['unset', 'real-root']
    assert value['headerModes'] == ['anonymous', 'production-shaped', 'development-shaped']
    assert value['routeCount'] == len(value['routes']) and value['routeCount'] > 0
    assert value['casesPerMode'] == value['routeCount'] * 6
    assert value['expectedCases'] == value['casesPerMode'] * 2
    assert value['writesPerformed'] is False
    assert len({item['path'] for item in value['inputs']}) == len(value['inputs'])
    return value


def switch_link(expected, target, label):
    temporary = LINK.with_name(LINK.name + '.p008-production-v1-' + label)
    assert not os.path.lexists(temporary), 'temporary build link already exists'
    assert LINK.is_symlink() and os.readlink(LINK) == expected, 'concurrent build-link drift'
    temporary.symlink_to(target)
    try:
        assert LINK.is_symlink() and os.readlink(LINK) == expected
        os.replace(temporary, LINK)
    finally:
        if temporary.is_symlink() and os.readlink(temporary) == target:
            temporary.unlink()
    assert LINK.is_symlink() and os.readlink(LINK) == target


def stop_process(process):
    if process is None or process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGKILL)
        process.wait(timeout=10)


assert LINK.is_symlink() and os.readlink(LINK) == BEFORE, 'exact P055 logical build link required'
assert not os.path.lexists(NEW), 'never overwrite a physical build'
old_build_id = pin(BEFORE + '/BUILD_ID')
plan = checker_plan()
inputs = plan['inputs']
for item in inputs:
    assert pin(item['path']) == item, 'checker input drift: ' + item['path']
config_before = [pin(file) for file in CONFIG]

if sys.argv[1:] == ['--plan']:
    print(json.dumps({'schemaVersion': 1, 'kind': 'alg-l06-p008-production-build-plan-v1',
        'logicalPath': LOGICAL, 'beforeTarget': BEFORE, 'priorBuildId': old_build_id,
        'newPhysicalRoot': NEW, 'buildReceipt': BUILD_RECEIPT,
        'sourceModes': plan['sourceModes'], 'routeCount': plan['routeCount'],
        'casesPerMode': plan['casesPerMode'], 'expectedCases': plan['expectedCases'],
        'inputs': inputs, 'config': config_before, 'writesPerformed': False}))
    sys.exit(0)

assert sys.argv[1:] == ['--run'], 'Usage: --plan | --run'
assert no_listener(3331) and no_listener(3332), 'stop local 3331/3332 servers before build'
assert LINK.resolve() == pathlib.Path(BEFORE)
dependency_link = pathlib.Path(NEW).parent / 'node_modules'
dependency_target = str(ROOT / 'node_modules')
assert (ROOT / 'node_modules/sharp/package.json').is_file(), 'bundled sharp missing'
assert not dependency_link.parent.is_symlink()
if not os.path.lexists(dependency_link):
    dependency_link.parent.mkdir(parents=True, exist_ok=True)
    assert dependency_link.parent.resolve() == dependency_link.parent
    dependency_link.symlink_to(dependency_target)
assert dependency_link.is_symlink() and os.readlink(dependency_link) == dependency_target
assert dependency_link.resolve() == (ROOT / 'node_modules').resolve()

OUTPUT.mkdir(parents=True, exist_ok=True)
names = ['build-receipt-v1.json', 'build-intent-v1.json', 'build-link-restoration-v1.json',
         'build-failed-v1.json', 'production-build-v1.log',
         'production-server-unset-v1.log', 'production-server-real-root-v1.log']
for name in names:
    assert not (OUTPUT / name).exists(), 'preserve evidence: ' + name
for mode in plan['sourceModes']:
    assert not (OUTPUT / 'negative' / (SLUG + '-' + mode + '.json')).exists()

original = {file: (ROOT / file).read_bytes() for file in CONFIG}
assert [pin(file) for file in CONFIG] == config_before
selected = dict(NODE_ENV='production', NODE_OPTIONS='--max-old-space-size=12288',
    NEXT_TELEMETRY_DISABLED='1', HELP_MATH_ALG_P001_PRODUCTION_SCAN='1',
    HELP_MATH_G678_LOCAL_PREVIEW='true', HELP_MATH_G678_LOCAL_PREVIEW_BIND='127.0.0.1',
    HELP_MATH_G678_SOURCE_ROOT=SOURCE_ROOT,
    HELP_MATH_G678_CALIBRATION_PHASE='frozen16-continuous-audio-provisional-browser-qa',
    HELP_MATH_G678_P052_AUDIO_CANDIDATE='1')
environment = dict(os.environ)
environment.update(selected)
intent = {'schemaVersion': 1, 'kind': 'alg-l06-p008-production-build-intent-v1',
    'startedAt': now(), 'logicalPath': LOGICAL, 'beforeTarget': BEFORE,
    'temporaryTarget': NEW, 'priorBuildId': old_build_id, 'inputs': inputs,
    'config': config_before, 'sourceModes': plan['sourceModes'],
    'routeCount': plan['routeCount'], 'casesPerMode': plan['casesPerMode'],
    'expectedCases': plan['expectedCases'], 'dependencyLink': str(dependency_link),
    'dependencyTarget': dependency_target, 'sharpPackage':
        pin(str((ROOT / 'node_modules/sharp/package.json').resolve()))}
save(OUTPUT / 'build-intent-v1.json', intent)
for file, body in original.items():
    with (OUTPUT / ('config-backup-v1-' + pathlib.Path(file).name)).open('xb') as backup:
        backup.write(body)


def restore_config():
    restored = []
    for file, body in original.items():
        current = (ROOT / file).read_bytes()
        if current == body:
            continue
        assert file == 'apps/web/next-env.d.ts', 'unexpected configuration mutation: ' + file
        expected = [body.replace(prefix, b'./.next-alg-p001-production-scan/types/')
                    for prefix in [b'./.next-alg-p001-local-qa/dev/types/',
                                   b'./.next-current-js-candidate-qa/dev/types/',
                                   b'./.next/dev/types/'] if prefix in body]
        assert current in expected, 'unknown generated next-env change; preserve for inspection'
        (ROOT / file).write_bytes(body)
        restored.append(file)
    return restored


record = {'schemaVersion': 1, 'kind': 'alg-l06-p008-local-production-build-v1',
    'startedAt': now(), 'command': ['npm', 'run', 'build', '--workspace', '@helpmath/web'],
    'configBefore': config_before, 'inputsBefore': inputs,
    'priorBuildId': old_build_id, 'selectedNonSecretEnvironment': selected}
server = None
changed = False
build_ok = False
failure = None
probes = []
try:
    pathlib.Path(NEW).mkdir(parents=True, exist_ok=False)
    switch_link(BEFORE, NEW, 'switch')
    changed = True
    with (OUTPUT / 'production-build-v1.log').open('x') as log:
        build = subprocess.Popen(record['command'], cwd=ROOT, env=environment,
                                 stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            build.wait(timeout=900)
        except BaseException:
            stop_process(build)
            raise
    record['exitCode'] = build.returncode
    record['configAfterBuild'] = [pin(file) for file in CONFIG]
    record['restoredConfig'] = restore_config()
    record['configAfterRestore'] = [pin(file) for file in CONFIG]
    record['configRestored'] = record['configAfterRestore'] == config_before
    record['inputsAfter'] = checker_plan()['inputs']
    record['inputsStable'] = record['inputsAfter'] == inputs
    assert record['exitCode'] == 0 and record['configRestored'] and record['inputsStable']
    record['buildId'] = {**pin(NEW + '/BUILD_ID'), 'path': LOGICAL + '/BUILD_ID'}
    record['finishedAt'] = now()
    save(OUTPUT / 'build-receipt-v1.json', record)
    build_ok = True

    for mode in plan['sourceModes']:
        check_environment = environment.copy()
        if mode == 'unset':
            check_environment.pop('HELP_MATH_G678_SOURCE_ROOT', None)
        assert no_listener(3332), 'production port must be free before ' + mode
        with (OUTPUT / ('production-server-' + mode + '-v1.log')).open('x') as log:
            server = subprocess.Popen(['node', '../../node_modules/next/dist/bin/next',
                'start', '--hostname', '127.0.0.1', '--port', '3332'],
                cwd=ROOT / 'apps/web', env=check_environment, stdout=log,
                stderr=subprocess.STDOUT, start_new_session=True)
            for _ in range(80):
                assert server.poll() is None, 'production server exited before readiness'
                if not no_listener(3332):
                    break
                time.sleep(0.25)
            else:
                raise RuntimeError('production server not ready')
            probe = subprocess.run(['node', CHECKER, '--run', SLUG, mode],
                cwd=ROOT, env=check_environment, timeout=900)
            assert probe.returncode == 0, 'P008 production denial failed: ' + mode
            result = OUTPUT / 'negative' / (SLUG + '-' + mode + '.json')
            evidence = json.loads(result.read_text())
            assert evidence['kind'] == 'alg-l06-p008-production-negative-v1'
            assert evidence['status'] == 'technical-pass-not-deployment'
            assert evidence['expectedCases'] == plan['casesPerMode']
            assert len(evidence['results']) == plan['casesPerMode']
            assert all(row['pass'] is True for row in evidence['results'])
            probes.append(pin(str(result)))
        stop_process(server)
        server = None
except BaseException as error:
    failure = str(error)
    raise
finally:
    stop_process(server)
    restored = LINK.is_symlink() and os.readlink(LINK) == BEFORE
    link_failure = None
    try:
        if changed or (LINK.is_symlink() and os.readlink(LINK) == NEW):
            assert LINK.is_symlink() and os.readlink(LINK) == NEW, 'concurrent build-link drift'
            switch_link(NEW, BEFORE, 'restore')
            restored = LINK.is_symlink() and os.readlink(LINK) == BEFORE
    except Exception as error:
        link_failure = str(error)
    config_failure = None
    try:
        restore_config()
    except Exception as error:
        config_failure = str(error)
    after_id = pin(BEFORE + '/BUILD_ID')
    restoration = {'schemaVersion': 1, 'kind': 'alg-l06-p008-production-link-restoration-v1',
        'logicalPath': LOGICAL, 'beforeTarget': BEFORE, 'temporaryTarget': NEW,
        'afterTarget': os.readlink(LINK) if LINK.is_symlink() else None,
        'restored': restored, 'priorBuildIdBefore': old_build_id,
        'priorBuildIdAfter': after_id,
        'newBuildId': pin(NEW + '/BUILD_ID') if pathlib.Path(NEW + '/BUILD_ID').is_file() else None,
        'probeReceipts': probes, 'buildSucceeded': build_ok,
        'failure': failure, 'linkRestorationFailure': link_failure,
        'configurationCleanupFailure': config_failure, 'finishedAt': now()}
    save(OUTPUT / 'build-link-restoration-v1.json', restoration)
    if not build_ok:
        record['failure'] = failure
        record['finishedAt'] = now()
        save(OUTPUT / 'build-failed-v1.json', record)
    assert restored and after_id == old_build_id and link_failure is None and config_failure is None

print(json.dumps({'status': 'P008_PRODUCTION_BUILD_AND_TWO_MODE_DENIAL_PASSED',
    'restored': restored, 'probeReceipts': probes}))
