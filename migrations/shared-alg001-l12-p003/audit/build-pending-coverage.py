#!/usr/bin/env python3
"""Generate unexecuted requirements and structural checkpoints, not captures."""
import csv
import hashlib
import io
import json
from pathlib import Path
import sys

WORK = Path(__file__).resolve().parent.parent
m = json.loads((WORK / 'migration.json').read_text())
s = json.loads((WORK / 'audit/source-structure.json').read_text())
assert m['source']['swfSha256'] == s['source']['sha256']
requirements = []
for lang in ('en', 'es'):
    for domain, scenario, count, entry in [
        ('root','default',10,{'kind':'initial-load'}),
        ('sprite-164','source-main-natural',1008,{'kind':'source-root-begin','rootFrame':6,'rootDepth':2,'placementTwips':{'x':4189,'y':5670}}),
        ('sprite-22','source-main-natural',1,{'kind':'nested-placement','parentDomain':'sprite-164','parentFrame':124,'depth':8}),
        ('sprite-166','default',1,{'kind':'source-root-begin','rootFrame':6,'rootDepth':146,'placementTwips':{'x':8000,'y':869}}),
    ]:
        entry = {**entry,'language':lang,'sourceTimelineId':domain}
        key = f'{scenario}-{domain}-{lang}'
        requirements.append({'requirementId':'req-'+key,'scenario':scenario,'frameDomainId':domain,'traceId':key,'language':lang,'seed':'0','requiredRange':{'firstFrame':1,'lastFrame':count},'entryState':entry,'entryStateSha256':hashlib.sha256(json.dumps(entry,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'baselineAuthorityRequirement':'original-runtime-frame-accurate' if domain=='root' else 'original-runtime-natural-trace','baselineAuthority':'unresolved','status':'pending','capturedFrameCount':0,'missingFrames':list(range(1,count+1)),'baselineCaptureManifest':'','baselineCaptureManifestSha256':'','captureManifest':'','captureManifestSha256':'','metricsFile':'','metricsSha256':''})
payload = {'schemaVersion':2,'animationId':m['animationId'],'requirements':requirements,'pendingInteractiveTraces':[{'characterId':c,'term':t,'firstRetainedFrame':f,'lastRetainedFrame':1008,'status':'pending','eventScheduleAuthority':'unresolved-original-host-trace-required'} for c,t,f in [(150,'Graph',825),(151,'Relation',825),(156,'Function',860),(157,'Equation',860),(161,'Linear equation',908),(162,'Linear function',908)]]}
csvpath = WORK / 'keyframes.csv'
fields = csvpath.read_text().splitlines()[0].split(',')
buffer = io.StringIO()
writer = csv.DictWriter(buffer,fieldnames=fields,lineterminator='\n')
writer.writeheader()
for domain,frames,scenario in [('root',[1,6,10],'default'),('sprite-164',[1,123,124,824,825,843,844,859,860,906,907,908,984,985,1001,1002,1008],'source-main-natural'),('sprite-22',[1],'source-main-natural'),('sprite-166',[1],'default')]:
    for frame in frames:
        writer.writerow({'frame':frame,'frame_domain_id':domain,'time_ms':(frame-1)*1000/12,'scenario':scenario,'language':'en','kind':'source-structure-checkpoint','expected_state':'See source-structure.json placement/action state','trigger':'source timeline','evidence_source':'audit/swfmill.xml','notes':'Pending captures; not original-runtime evidence'})
outputs = {WORK/'evidence/full-frame-coverage.json':json.dumps(payload,indent=2)+'\n',csvpath:buffer.getvalue()}
assert sys.argv[1:] in ([],['--check'])
for p,text in outputs.items():
    if sys.argv[1:]: assert p.read_text()==text,str(p)
    else: p.write_text(text)
print('P003: eight pending frame requirements and six unresolved interactive traces')
