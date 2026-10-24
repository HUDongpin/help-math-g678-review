#!/usr/bin/env python3
"""Output-only, source-pinned Equation/Estimate host glossary proposal."""
import hashlib
import html
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path('/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI')
PINS = {
    'en': ('L1KTE01.xml', 345838,
           '14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b'),
    'es': ('L1KTS01.xml', 344456,
           '3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407'),
}
TERMS = {'Equation': ('equation', 'Ecuación'),
         'Estimate': ('estimate', 'Calcular')}
OUTPUT = HERE / 'p043-glossary-additions-draft.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def entry_from(source, term):
    prefix = ('<' + term + '~LNG~').encode()
    rows = [line.strip() for line in source.splitlines() if line.strip().startswith(prefix)]
    assert len(rows) == 1, ('unique key term', term, len(rows))
    row = rows[0]
    raw = row.decode('utf-8')
    assert 'ScreenkeyTerm="' + term + '"' in raw
    contents = raw.split('>', 1)[1].rsplit('</', 1)[0]
    en, es = contents.split('~LNG~', 1)
    normalize = lambda value: html.unescape(value).replace('\xa0', ' ').strip()
    return {'en': normalize(en), 'es': normalize(es), 'sha256': sha(row)}


def build():
    source = {}
    for lang, (name, size, digest) in PINS.items():
        raw = (ROOT / name).read_bytes()
        assert len(raw) == size and sha(raw) == digest, name
        source[lang] = raw
    entries = []
    for term, (identifier, spanish_label) in TERMS.items():
        en_row, es_row = (entry_from(source[lang], term) for lang in ('en', 'es'))
        assert en_row['en'] == es_row['en'] and en_row['es'] == es_row['es'], term
        entries.append({
            'id': identifier, 'sourceKeyAttribute': term,
            'labels': {'en': term, 'es': spanish_label},
            'definitions': {'en': en_row['en'], 'es': en_row['es']},
            'source': {lang: {'assetId': 'G678' + name,
                              'path': 'HELP_KEYTERMS/KT/XML/' + name,
                              'sha256': digest}
                       for lang, (name, _, digest) in PINS.items()},
            'sourceEntrySha256': {'en': en_row['sha256'],
                                  'es': es_row['sha256']},
        })
    return {
        'kind': 'alg-l06-p043-output-only-glossary-additions-draft-v1',
        'animationId': 'shared-alg001-l06-p043',
        'sourceSwfSha256': '8bec405895d09cc8f7dd9f0da197f67726cb45cab6cc8dec3d15b103bc04a97b',
        'sourceBankRoot': str(ROOT), 'entries': entries,
        'acceptedScope': 'proposal for two P043 KeyAttribute terms absent from P042 formal descriptor',
        'originalRuntimeBehaviorAccepted': False,
    }


def main():
    assert sys.argv[1:] in (['--write'], ['--check'])
    raw = (json.dumps(build(), indent=2, ensure_ascii=False) + '\n').encode()
    if sys.argv[1:] == ['--write']:
        OUTPUT.write_bytes(raw)
    else:
        assert OUTPUT.read_bytes() == raw, 'P043 glossary proposal drift'
    print(json.dumps({'mode': sys.argv[1], 'bytes': len(raw), 'sha256': sha(raw)}))


if __name__ == '__main__':
    main()
