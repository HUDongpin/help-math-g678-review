import pathlib,json,hashlib,shutil,csv,xml.etree.ElementTree as E,sys
R=pathlib.Path(__file__).resolve().parents[1];T=pathlib.Path(sys.argv[1]);S=pathlib.Path(sys.argv[2]);W=R/'migrations/shared-nms002-l02-p039';B=T/'nms-l02-p039-behavior-source-v1';I=T/'nms-l02-p039-native-ir-v1'
def read(p):return json.loads(p.read_text())
def pin(p):
 raw=p.read_bytes();return {'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
source=S/'G6-G8-shared/NMS002/L2/IN/L2IN24.swf';assert pin(source)['sha256']=='cb087b675e4ada79fb53d4a7f7368f69ed96abf6a71ea4c6e56afdaa683bd649';xml=S/'G6-G8-shared/NMS002/L2/index.xml';assert pin(xml)['sha256']=='550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'
r=E.fromstring(xml.read_bytes());pages=list(r.iter('Page'));page=pages[38];section=next(s for s in r.findall('Section') if page in list(s));ordinal=list(section.findall('Page')).index(page)+1;assert ordinal==23 and section.attrib['SName']=='IN' and page.text.strip()=='IN/L2IN24.swf'
backup=T/'p039-workspace-before-metadata-v1'
if not backup.exists():shutil.copytree(W,backup,symlinks=True)
m=read(backup/'migration.json');runtime=read(T/'p039-runtime-metadata-v1/runtime.json');ir=read(I/'source-ir.json');catalog=read(B/'source-text-catalog-typography-v1.json');extraction=read(B/'extraction.json');audio=read(T/'nms-l02-p039-audio-plans-v1/receipt.json');assert runtime['source']['sourceSwfSha256']==m['source']['swfSha256']
m['status']='implementing';m['classification'].update(collection='course',grade='6-8/shared',lesson=2,section='IN',page=23,domain='fractions-decimals-percent',knowledgePoint={'en':page.attrib['Title'],'es':''},titleRaw=page.attrib['Title'],titleDisplay=page.attrib['Title'],status='confirmed',evidence=[{'source':'course-xml','path':str(xml),'field':'active Page ordinal39 / IN ordinal23','value':page.attrib['Title'],'sha256':pin(xml)['sha256']},{'source':'source-path','path':str(source),'sha256':pin(source)['sha256']}])
m['runtime'].update(actionScriptVersion='AS1/2',complexity='behavior-heavy',fonts=list(dict.fromkeys(f['name']['text']for f in catalog['fonts'])),externalDependencies=['_level0.InternalPreloader.gotoAndPlay (legacy bootstrap; original host behavior unverified)'])
m['toolVersions']['ffdec']=extraction['toolchain']['ffdec']['versionOutput']['text'];m['toolVersions']['swfmill']=extraction['toolchain']['swfmill']['version']
scenarios=[s['id']for s in runtime['scenarios']];m['scenarios']=[{'id':s['id'],'kind':'interactive','description':s['label']+'; local native inspection, not an original-runtime trace','reachable':True}for s in runtime['scenarios']]
parents={'root':None,'sprite-237':'root','sprite-223':'sprite-227','sprite-227':'sprite-237','sprite-228':'sprite-237','sprite-234':'sprite-237'}
m['implementation'].update(rendering='Maintained React/SVG percent practice, deterministic state, native text and independent source-PCM clocks; official My Lesson integration pending',component='packages/demos/src/nms-l02-p039-renderer-v1.tsx',registryModule='./modules/g678-nms-l02-native-percent-practice-p039',timelineModule='packages/demos/src/timelines/g678-nms-l02-native-percent-practice-p039.ts',testFile='packages/demos/tests/nms-l02-p039-frame-v1.test.ts',defaultFrameDomainId='sprite-237',frameDomains=[{'id':d['id'],'kind':'root'if d['id']=='root'else'nested','sourceTimelineId':'root'if d['id']=='root'else d['id'].split('-')[1],'parentFrameDomainId':parents[d['id']],'frameCount':d['frameCount'],'scenarioIds':scenarios}for d in runtime['runtime']['frameDomains']])
m['audio'].update(required=True,reasonNotRequired='',languages=['und']);m['audit'].update(assetsRequired=True,assetsNotRequiredReason='')
(W/'migration.json').write_text(json.dumps(m,indent=2)+'\n')
def write_csv(name,rows):
 with (backup/name).open()as f:fields=next(csv.reader(f))
 with (W/name).open('w',newline='')as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
roles=read(W/'audit/source-specification-v1.json')['sourceShapeRoles'];assets=[]
for key,art in sorted(ir['art'].items(),key=lambda x:int(x[0])):
 actual=pin(pathlib.Path(art['source']['path']));assert actual['sha256']==art['source']['sha256'];assets.append({'asset_id':'shape-'+key,'swf_character_id':key,'type':'shape','source_file':str(source),'exported_file':actual['path'],'sha256':actual['sha256'],'format':'SVG','transformation':'Unmodified source export; native treatment separately documented','confidence':'source-extracted','license_or_provenance':'Owner-provided source','notes':roles[key]})
for p in sorted((B/'source/audit/texts').glob('*.txt')):assets.append({'asset_id':'text-'+p.stem,'swf_character_id':p.stem,'type':'text','source_file':str(source),'exported_file':str(p),'sha256':pin(p)['sha256'],'format':'TXT','transformation':'Source text record; source instance visibility separately audited','confidence':'source-extracted','license_or_provenance':'Owner-provided source'})
for p in sorted(I.glob('font*-source.xml')):assets.append({'asset_id':p.stem,'type':'font','source_file':str(source),'exported_file':str(p),'sha256':pin(p)['sha256'],'format':'XML','transformation':'Source glyph contours for geometry audit, not product font substitution acceptance','confidence':'source-extracted','license_or_provenance':'Owner-provided source'})
write_csv('asset-inventory.csv',assets)
rows=[]
for s in audio['streams']:
 assert pin(pathlib.Path(s['source']['path']))['sha256']==s['source']['sha256'];rows.append({'cue_id':'sprite-'+s['domain']+'-stream','language':'und','source_file':s['source']['path'],'sha256':s['source']['sha256'],'start_frame':s['segments'][0]['frame'],'start_frame_domain_id':'sprite-'+s['domain'],'start_semantics':s['role']+'; full decode then source-frame PCM mapping','duration_ms':s['decodedSamples']/22050*1000,'format':'MP3','channels':1,'sample_rate_hz':22050,'source_character_id':s['domain'],'notes':'Native selectable'if s['nativeSelectable']else'Dormant source stream; native start prohibited'})
c=audio['coach'];assert pin(pathlib.Path(c['source']['path']))['sha256']==c['source']['sha256'];rows.append({'cue_id':'sprite-230-coach-stream','language':'und','source_file':c['source']['path'],'sha256':c['source']['sha256'],'start_frame':3,'start_frame_domain_id':'sprite-230','start_semantics':'Four branch entries3/18/31/40; complete decoded source partitions, qualified tails beyond local stop','duration_ms':c['sourcePcm']['bytes']/4/22050*1000,'format':'MP3','channels':1,'sample_rate_hz':22050,'source_character_id':'230','notes':'Source EOF retained; original-runtime timing and human listening pending'})
write_csv('audio-inventory.csv',rows)
brief=f'''# P039 Percent Practice migration brief

The active placement is shared-nms002-l02-p039, global page39 and Instruction page23 in NMS002 Lesson2. The source XML title is Percent Practice. The G6-G8 shared folder is a catalog grouping, not an independent curriculum-level assessment. The immutable source identity is swf-{m['source']['swfSha256']}.

## Source and runtime

Source: `{source}`. The same-path FLA remains missing. This SWF is CWS version6, 800×600, 12fps, root10frames with main237 entered at root6. Main237 has579frames and holds at546 for input. Source tool versions and hashes remain in the extraction receipt. No original-runtime baseline is established.

The native visual inspector declares six domains and seven scenarios. It selects canonical local invocations rather than presenting a fabricated elapsed-time trace. Correct234/13 resumes the main timeline. Corrected reveal228/35 resets that child to1 and resumes. Coach230has55sourceframes and uses independent audio transport;236has20frames and remains unstarted. Static grid/range helper domains and imported unused symbols remain documented in audit/native-frame-domains-v1.json.

## Implementation and deliberate adaptations

Compiler-assisted extraction supplies source paths, glyph schedules, grid poses and audio partitions; maintained React/SVG/state/audio code supplies the behavior-heavy advanced-manual implementation. The task is shade25of100. First error permits retry; Reset retains error count. Second error reveals25, correcting the source75/73fallback. Source column fill order is retained, while feedback is orientation-neutral. Native English/Spanish controls, readable fonts, visible percentage readout and keyboard/focus behavior are qualified adaptations. Hidden duplicate Done text is excluded by audited mask bounds.

The source contains five MP3 streams. Four are selected for playback;236is dormant. The selected streams create seven prepared buffers. Each MP3 is decoded in full before PCM scheduling. Coach tails are retained beyond local animation stops, including nonzero source EOF. Muted WebAudio tests establish mechanism only, not listening acceptance.

## Current engineering evidence

See continuation166-progress-v1.json and continuation167-progress-v1.json under `{T}` for module/frame/text and source-role checks. Earlier source, PCM, real-player and browser receipts remain retained. The actual registry still excludes P039. The module maturity field is candidate metadata only.

## Remaining work and gates

Prepare the complete candidate/member/source-run dependency closure, finalize typography implementation and host evidence, then freeze and stage exact My Lesson/registry/resource-route integration. Validate the real host, production-negative boundaries and current files before admitting Current-JS. Source-local inspection, preparation manifests, HTTP success and build success do not establish original-runtime, fidelity, audio listening, human/Owner, strict completion or publication acceptance. Existing keyframe/full-frame files still require deliberate source-trace requirements; they do not constitute baseline evidence.
'''
(W/'MIGRATION_BRIEF.md').write_text(brief)
receipt={'status':'PASS-workspace-metadata-preparation','assets':len(assets),'audioStreams':len(rows),'nativeSelectedAudioStreams':4,'visualDomains':6,'scenarios':7,'sourceOrdinal':39,'sectionPageOrdinal':23,'registered':False,'originalRuntimeAccepted':False,'files':[pin(W/n)for n in ['migration.json','asset-inventory.csv','audio-inventory.csv','MIGRATION_BRIEF.md']]}
(T/'continuation168-workspace-metadata-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items()if k!='files'}))
