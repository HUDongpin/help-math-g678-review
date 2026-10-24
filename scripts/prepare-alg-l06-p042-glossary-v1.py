#!/usr/bin/env python3
"""Extract only P042's two missing glossary entries from the frozen key-term banks."""
from __future__ import annotations

import hashlib
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BANK_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI')
OUT = ROOT / 'migrations/shared-alg001-l06-p042/behavior-v1/source-glossary-additions-v1.json'
BANKS = {
    'en': ('L1KTE01.xml', 'G678L1KTE01.xml', '14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b', 345838),
    'es': ('L1KTS01.xml', 'G678L1KTS01.xml', '3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407', 344456),
}
TERMS = (('Expression', 'expression', 'Expresión'), ('Simplify', 'simplify', 'Simplificar'))


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract():
    bank_data = {}
    for locale, (name, asset, digest, size) in BANKS.items():
        data = (BANK_ROOT / name).read_bytes()
        if len(data) != size or sha(data) != digest:
            raise ValueError(f'{locale} dictionary changed')
        bank_data[locale] = (data.decode('utf-8-sig').splitlines(), asset, digest, name)
    entries = []
    for key, slug, spanish in TERMS:
        definitions = {}
        source = {}
        source_entry_sha = {}
        for locale, (lines, asset, digest, name) in bank_data.items():
            matches = [line.strip() for line in lines if f'ScreenkeyTerm="{key}"' in line]
            if len(matches) != 1:
                raise ValueError(f'{key} must have one {locale} exact source entry')
            line = matches[0]
            if not line.startswith(f'<{key}~LNG~{spanish} ') or not line.endswith(f'</{key}~LNG~{spanish}>'):
                raise ValueError(f'{key} {locale} element label changed')
            body = re.search(r'>([^<>]*)</' + re.escape(key) + r'~LNG~', line)
            if not body or body.group(1).count('~LNG~') != 1:
                raise ValueError(f'{key} {locale} bilingual content changed')
            english, translated = body.group(1).split('~LNG~')
            definitions[locale] = html.unescape((english if locale == 'en' else translated).strip())
            source[locale] = {'assetId': asset, 'path': f'HELP_KEYTERMS/KT/XML/{name}', 'sha256': digest}
            source_entry_sha[locale] = sha(line.encode('utf-8'))
        entries.append({'id': slug, 'sourceKeyAttribute': key,
                        'labels': {'en': key, 'es': spanish},
                        'definitions': definitions, 'source': source,
                        'sourceEntrySha256': source_entry_sha})
    return {'kind': 'alg-l06-p042-source-glossary-additions-v1',
            'animationId': 'shared-alg001-l06-p042',
            'sourceSwfSha256': '7df2077da472138df83a4485c0e15b7f3b1063aefcdcf2e3ded9232c98f68fcb',
            'sourceBankRoot': str(BANK_ROOT), 'entries': entries,
            'acceptedScope': 'two P042 source KeyAttribute terms absent from the P041 descriptor',
            'originalRuntimeBehaviorAccepted': False}


def main():
    body = (json.dumps(extract(), ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    if sys.argv[1:] == ['--check']:
        if not OUT.exists() or OUT.read_bytes() != body:
            raise SystemExit('P042 glossary output differs')
    elif sys.argv[1:] == ['--write']:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_bytes(body)
    else:
        raise SystemExit('use --write or --check')
    print(json.dumps({'path': str(OUT), 'bytes': len(body), 'sha256': sha(body)}))


if __name__ == '__main__':
    main()
