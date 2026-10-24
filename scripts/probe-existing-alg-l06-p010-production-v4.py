#!/usr/bin/env python3
"""Probe the exact successful P010 v2 build; never build or mutate its inputs."""
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
OUTPUT = ROOT / 'output/alg-l06-p010-production-v4'
LOGICAL = 'apps/web/.next-alg-p001-production-scan'
LINK = ROOT / LOGICAL
BUILD = '/Volumes/American Dream/hudongpin/g678-p010-formal-build-output-20260928/next-output-v2'
BUILD_RECEIPT = ROOT / 'output/alg-l06-p010-production-v2/build-receipt-v2.json'
CHECKER = 'scripts/check-alg-l06-p010-production-v4.mjs'
SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'
CONFIG = ['apps/web/next-env.d.ts', 'apps/web/tsconfig.json', 'apps/web/next.config.ts']
SLUG = 'p010-production-v4'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def pin(file):
    absolute = pathlib.Path(file) if pathlib.Path(file).is_absolute() else ROOT / file
    assert absolute.resolve() == absolute, 'physical pin required: ' + str(file)
    before = absolute.lstat()
    assert absolute.is_file() and not absolute.is_symlink() and before.st_nlink == 1, 'ordinary pin: ' + str(file)
    body = absolute.read_bytes()
    after = absolute.lstat()
    stable = lambda value: (value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
                            value.st_ctime_ns, value.st_mode, value.st_nlink)
    assert stable(after) == stable(before), 'pin changed during read: ' + str(file)
    return {'path': str(file), 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}


def save(file, value):
    file.parent.mkdir(parents=True, exist_ok=True)
    with file.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')


def no_listener(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(('127.0.0.1', port)) != 0


def checker_plan():
    value = json.loads(subprocess.check_output(['node', CHECKER, '--plan'], cwd=ROOT, text=True))
    assert value['schemaVersion'] == 1 and value['kind'] == 'alg-l06-p010-production-negative-plan-v4'
    assert value['buildRoot'] == BUILD and value['logicalBuildPath'] == LOGICAL
    assert value['buildReceipt'] == str(BUILD_RECEIPT.relative_to(ROOT))
    assert value['sourceModes'] == ['unset', 'real-root']
    assert value['headerModes'] == ['anonymous', 'production-shaped', 'development-shaped']
    assert value['pageProofCount'] == 10 and value['sharedRegistered'] == 500
    assert value['totalRegistered'] == 642 and value['lessonCanvasBridgeCount'] == 18
    assert value['routeCount'] == len(value['routes']) == 822
    assert value['casesPerMode'] == 4932 and value['expectedCases'] == 9864
    assert len(value['inputs']) == 503 and len({x['path'] for x in value['inputs']}) == 503
    assert len(value['verificationTools']) == 2 and value['writesPerformed'] is False
    assert len(value['expectedRouteMetadataObservations']) == 3
    return value


def switch_link(expected, target, label):
    temporary = LINK.with_name(LINK.name + '.p010-production-v4-' + label)
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


assert LINK.is_symlink(), 'original logical build link required'
BEFORE = os.readlink(LINK)
assert pathlib.Path(BEFORE).is_absolute() and pathlib.Path(BEFORE).is_dir(), 'physical prior build target'
assert pathlib.Path(BUILD).is_dir() and pathlib.Path(BUILD).resolve() == pathlib.Path(BUILD), 'exact v2 physical build'
assert pathlib.Path(BUILD) != pathlib.Path(BEFORE), 'v2 build is not currently bound'
build_receipt_pin = pin(BUILD_RECEIPT)
build_receipt = json.loads(BUILD_RECEIPT.read_text())
assert build_receipt['kind'] == 'alg-l06-p010-local-production-build-v2'
assert build_receipt['exitCode'] == 0 and build_receipt['inputsStable'] is True
assert build_receipt['configRestored'] is True
assert build_receipt['configBefore'] == build_receipt['configAfterRestore']
assert build_receipt['priorBuildId'] == pin(BEFORE + '/BUILD_ID'), 'original logical link restored from v2'
new_id = pin(BUILD + '/BUILD_ID')
assert build_receipt['buildId'] == {**new_id, 'path': LOGICAL + '/BUILD_ID'}
plan = checker_plan()
assert build_receipt['inputsBefore'] == plan['inputs'] == build_receipt['inputsAfter'], 'exact 503 v2 source inputs'
assert all(pin(x['path']) == x for x in plan['inputs']), 'unchanged physical v2 inputs'
assert [pin(x['path']) for x in plan['verificationTools']] == plan['verificationTools'], 'v4 tool pins'
config_before = [pin(file) for file in CONFIG]
assert config_before == build_receipt['configAfterRestore'], 'current configuration is v2-restored'

if sys.argv[1:] == ['--plan']:
    print(json.dumps({'schemaVersion': 1, 'kind': 'alg-l06-p010-existing-build-probe-plan-v4',
        'buildReceipt': build_receipt_pin, 'logicalPath': LOGICAL, 'beforeTarget': BEFORE,
        'priorBuildId': build_receipt['priorBuildId'], 'temporaryTarget': BUILD,
        'buildId': build_receipt['buildId'], 'sourceInputCount': len(plan['inputs']),
        'sourceInputSetSha256': hashlib.sha256(json.dumps(plan['inputs'], separators=(',', ':')).encode()).hexdigest(),
        'verificationTools': plan['verificationTools'],
        'expectedRouteMetadataObservations': plan['expectedRouteMetadataObservations'],
        'routeCount': plan['routeCount'], 'casesPerMode': plan['casesPerMode'],
        'expectedCases': plan['expectedCases'], 'config': config_before,
        'writesPerformed': False}))
    sys.exit(0)

assert sys.argv[1:] == ['--run'], 'Usage: --plan | --run'
assert no_listener(3331) and no_listener(3332), 'local 3331/3332 ports must be free'
assert not OUTPUT.exists(), 'immutable v4 output directory already exists'
original = {file: (ROOT / file).read_bytes() for file in CONFIG}
environment = dict(os.environ)
environment.update(build_receipt['selectedNonSecretEnvironment'])
environment['NODE_ENV'] = 'production'
environment['HELP_MATH_G678_SOURCE_ROOT'] = SOURCE_ROOT
intent = {'schemaVersion': 1, 'kind': 'alg-l06-p010-existing-build-probe-intent-v4',
    'startedAt': now(), 'buildReceipt': build_receipt_pin, 'sourceInputs': plan['inputs'],
    'verificationTools': plan['verificationTools'], 'logicalPath': LOGICAL,
    'beforeTarget': BEFORE, 'temporaryTarget': BUILD, 'buildId': build_receipt['buildId'],
    'expectedCases': plan['expectedCases'], 'configBefore': config_before}
save(OUTPUT / 'probe-intent-v4.json', intent)


def restore_config():
    restored = []
    for file, body in original.items():
        current = (ROOT / file).read_bytes()
        if current == body:
            continue
        assert file == 'apps/web/next-env.d.ts', 'unexpected config mutation: ' + file
        expected = [body.replace(prefix, b'./.next-alg-p001-production-scan/types/')
                    for prefix in [b'./.next-alg-p001-local-qa/dev/types/',
                                   b'./.next-current-js-candidate-qa/dev/types/',
                                   b'./.next/dev/types/'] if prefix in body]
        assert current in expected, 'unknown generated next-env change; preserve for inspection'
        (ROOT / file).write_bytes(body)
        restored.append(file)
    return restored


server = None
switched = False
failure = None
probes = []
try:
    switch_link(BEFORE, BUILD, 'switch')
    switched = True
    for mode in plan['sourceModes']:
        check_environment = environment.copy()
        if mode == 'unset':
            check_environment.pop('HELP_MATH_G678_SOURCE_ROOT', None)
        assert no_listener(3332), 'production port must be free before ' + mode
        with (OUTPUT / ('production-server-' + mode + '-v4.log')).open('x') as log:
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
            assert probe.returncode == 0, 'P010 production denial failed: ' + mode
            result = OUTPUT / 'negative' / (SLUG + '-' + mode + '.json')
            evidence = json.loads(result.read_text())
            assert evidence['kind'] == 'alg-l06-p010-production-negative-v4'
            assert evidence['status'] == 'technical-pass-not-deployment'
            assert evidence['expectedCases'] == plan['casesPerMode']
            assert len(evidence['results']) == plan['casesPerMode']
            assert all(row['pass'] is True for row in evidence['results'])
            assert evidence['bundleScan']['matches'] == []
            assert evidence['bundleScan']['routeMetadataObservations'] == plan['expectedRouteMetadataObservations']
            assert evidence['inputsStable'] is True and evidence['verificationToolsStable'] is True
            probes.append(pin(result))
        stop_process(server)
        server = None
    assert checker_plan()['inputs'] == plan['inputs'], 'post-probe source closure drift'
    assert [pin(x['path']) for x in plan['verificationTools']] == plan['verificationTools'], 'verification tool drift'
except BaseException as error:
    failure = str(error)
finally:
    stop_process(server)
    link_failure = None
    config_failure = None
    try:
        if switched or (LINK.is_symlink() and os.readlink(LINK) == BUILD):
            assert LINK.is_symlink() and os.readlink(LINK) == BUILD, 'concurrent build-link drift'
            switch_link(BUILD, BEFORE, 'restore')
    except Exception as error:
        link_failure = str(error)
    try:
        restored_config = restore_config()
    except Exception as error:
        config_failure = str(error)
        restored_config = []
    restored = LINK.is_symlink() and os.readlink(LINK) == BEFORE
    prior_after = pin(BEFORE + '/BUILD_ID')
    restoration = {'schemaVersion': 1, 'kind': 'alg-l06-p010-existing-build-link-restoration-v4',
        'finishedAt': now(), 'logicalPath': LOGICAL, 'beforeTarget': BEFORE,
        'temporaryTarget': BUILD, 'afterTarget': os.readlink(LINK) if LINK.is_symlink() else None,
        'restored': restored, 'priorBuildIdBefore': build_receipt['priorBuildId'],
        'priorBuildIdAfter': prior_after, 'v2BuildId': new_id,
        'probeReceipts': probes, 'configRestoredFiles': restored_config,
        'configAfter': [pin(file) for file in CONFIG], 'failure': failure,
        'linkRestorationFailure': link_failure, 'configurationCleanupFailure': config_failure}
    save(OUTPUT / 'link-restoration-v4.json', restoration)
    assert restored and prior_after == build_receipt['priorBuildId']
    assert restoration['configAfter'] == config_before
    assert link_failure is None and config_failure is None

if failure is not None:
    raise RuntimeError(failure)
assert len(probes) == 2, 'both source environment probes required'
print(json.dumps({'status': 'P010_EXISTING_V2_BUILD_V4_DENIAL_PASSED',
    'restored': True, 'probeReceipts': probes, 'cases': plan['expectedCases']}))
