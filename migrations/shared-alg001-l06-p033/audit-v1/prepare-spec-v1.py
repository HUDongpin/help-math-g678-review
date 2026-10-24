from pathlib import Path
import json,hashlib,csv,copy
R=Path.cwd();M=R/'migrations/shared-alg001-l06-p033';O=R/'output/alg-l06-p033-source-planning-20261001-v1';S=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
for name in ['source-v1','audit-v1','generator-v1','audit']:(M/name).mkdir(exist_ok=True)
def pin(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
rows=[]
for f in [S/'IN/L6IN05.swf',S/'SA/L6IN05.mp3',S/'index.xml']:
 dst=M/'source-v1'/f.name
 if dst.exists():assert dst.read_bytes()==f.read_bytes()
 else:dst.write_bytes(f.read_bytes());dst.chmod(0o444)
 rows.append({'source':pin(f),'copy':pin(dst)})
(M/'audit-v1/source-custody-v1.json').write_text(json.dumps({'kind':'byte-identical-read-only-working-copies','canonicalPromotion':False,'rows':rows},indent=2)+'\n')
p=json.loads((O/'source-plan-v1.json').read_text());d=json.loads((O/'source-display-list-v1.json').read_text());m=json.loads((M/'migration.json').read_text());m['confidence']='medium';m['classification'].update({'collection':'G6-G8-shared','grade':'middle-school/shared','lesson':6,'section':'IN','page':33,'domain':'algebra','knowledgePoint':{'en':'Identify a function from sets of ordered pairs','es':''},'titleRaw':'Testing Whether Ordered Pairs Represent a Function','titleDisplay':'Testing Whether Ordered Pairs Represent a Function','status':'verified','evidence':['source-v1/index.xml',str((O/'source-plan-v1.json').relative_to(R))]});m['runtime'].update({'backgroundColor':'#b8d8f7','actionScriptVersion':'AS2','complexity':'behavior-heavy','fonts':[x.get('name','') for x in d['fonts'].values()] if isinstance(d['fonts'],dict) else [],'scripts':[str((O/'source-plan-v1.json').relative_to(R))],'externalDependencies':['Root DoHyperLinks and host quiz enable/disable; same lesson EN/ES dictionary','Explicit modern 3 wrong/4 right selector matching exact page target names; historical natural host pairing/RNG remains unproven','Separate explicit-only SA; not locale autoplay or embedded splice']});m['audit']['assetsRequired']=True;m['audit']['masks']=p['structure']['sourceClipMasks']['190'];m['audio'].update({'required':True,'languages':['en','es']});m['toolVersions'].update({'ffdec':'26.2.1','swfmill':'0.3.6','ruffle':'0.4.1 forensic derivative only'});m['scenarios'][0].update({'kind':'interactive','description':'Source main stop52, four answers, three wrong/two-attempt paths, four right paths, nested Close and postquiz glossary; original runtime remains pending.'});frames=[{'id':'root','kind':'root','sourceTimelineId':'root','parentFrameDomainId':None,'frameCount':10,'scenarioIds':['default']}]
for sid,n in p['structure']['spriteFrameCounts'].items():
 parents=[int(k) for k,v in d['sprites'].items() if any(x['objectId']==int(sid) for x in v['instances'])];frames.append({'id':'sprite-'+sid,'kind':'nested','sourceTimelineId':'sprite-'+sid,'parentFrameDomainId':'sprite-'+str(parents[0]) if parents else 'root','frameCount':n,'scenarioIds':['default']})
m['implementation']['frameDomains']=frames;(M/'migration.json').write_text(json.dumps(m,indent=2)+'\n');coverage=json.loads((M/'evidence/full-frame-coverage.json').read_text());t=coverage['requirements'][0];coverage['requirements']=[]
for f in frames:
 for lang in ['en','es']:
  e={'kind':'source-domain-planning','frameDomainId':f['id'],'language':lang,'exactNaturalTracePending':True};v=copy.deepcopy(t);v.update({'requirementId':f"req-default-{f['id']}-{lang}",'scenario':'default','frameDomainId':f['id'],'traceId':f"default-{f['id']}-{lang}",'language':lang,'seed':'0','requiredRange':{'firstFrame':1,'lastFrame':f['frameCount']},'entryState':e,'entryStateSha256':hashlib.sha256(json.dumps(e,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'baselineAuthorityRequirement':'original-runtime-natural-trace','baselineAuthority':'unresolved','status':'pending','capturedFrameCount':0,'missingFrames':list(range(1,f['frameCount']+1))});coverage['requirements'].append(v)
(M/'evidence/full-frame-coverage.json').write_text(json.dumps(coverage,indent=2)+'\n')
(M/'audit/frame-domain-disposition.json').write_text(json.dumps({'kind':'p033-domain-disposition-v1','source':pin(M/'source-v1/L6IN05.swf'),'planningDomains':frames,'note':'Root reaches main190 and title2; nested domains and placements are source-display-list-v1.json. Each scenario/entry trace still requires runtime capture. No full-frame evidence yet.'},indent=2)+'\n')
fields=next(csv.reader((M/'asset-inventory.csv').open()));inventory=json.loads((O/'packet-inventory-v1.json').read_text());rows=[]
for i,s in enumerate(inventory['files']):
 row={k:'' for k in fields};row.update({'asset_id':f'p033-source-{i:03}','type':'source-extraction','source_file':str(S/'IN/L6IN05.swf'),'exported_file':str((O/s['path']).relative_to(R)),'sha256':s['sha256'],'format':Path(s['path']).suffix[1:],'confidence':'extracted','license_or_provenance':'owner-provided','notes':'Retained source-only packet; no runtime acceptance.'});rows.append(row)
with (M/'asset-inventory.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
fields=['cue_id','language','source_file','sha256','start_frame','start_frame_domain_id','start_semantics','duration_ms','format','channels','sample_rate_hz','source_character_id','notes'];rows=[]
for name in (O/'embedded-streams').glob('*.mp3'):
 sid=int(name.stem.split('-')[1]);a=d['sprites'][str(sid)]['audio'];row=dict(zip(fields,[f'source-stream-{sid}','en',str(name.relative_to(R)),pin(name)['sha256'],a['firstFrame'],f'sprite-{sid}','source embedded block; actual schedule and decoding pending','','MP3','1','22050',sid,'First-frame sound policy remains an independent claim.']));rows.append(row)
sa=M/'source-v1/L6IN05.mp3';rows.append(dict(zip(fields,['spanish-separate','es',str(sa.relative_to(R)),pin(sa)['sha256'],'1','sprite-190','explicit user action only','','MP3','','','','No locale autoplay or embedded splice.'])))
with (M/'audio-inventory.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
print(json.dumps({'domains':len(frames),'requirements':len(coverage['requirements']),'audio':len(rows)}))
