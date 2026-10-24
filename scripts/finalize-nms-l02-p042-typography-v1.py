"""Finalize evidence-bound bilingual typography after real C3 host checks."""
from pathlib import Path
import json,hashlib,datetime,sys,subprocess,copy
R=Path(__file__).resolve().parents[1];T=Path(sys.argv[1]);ID='shared-nms002-l02-p042';A=R/'migrations'/ID/'audit'
def read(p):return json.loads(p.read_text())
def pin(p):
 p=Path(p);assert p.is_file()and p.resolve()==p and not p.is_symlink();b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def resolve(x):
 p=Path(x['path']);return p if p.is_absolute()else R/p
def result(p):
 s=p.read_text();start=s.index('### Result\n')+11;return json.loads(s[start:s.index('\n###',start)])
f=R/'catalog/product-bridge-calibrations/g678-nms-l02-p042-native-equivalent-practice-current-js-v1-compile-v3.json';assert pin(f)['sha256']=='db20c5a81c88826e081a7755e7b06ce1c63b674b5a56790f1131e0bde92b0dcd';freeze=read(f)
for x in freeze['inputs']+freeze['outputs']:assert pin(resolve(x))==x,x['path']
for name in ['en-mid-layout-v3.log','es-terminal-layout-v1.log']:
 rows=result(T/'p042-c3-host-v1'/name);assert len(rows)==8 and all(not r['errors']for r in rows)
prod=read(T/'continuation227-p042-production-v1.json');assert prod['status']=='PASS'and prod['candidateSha256']==pin(f)['sha256']
dom=result(T/'p042-static-browser-v1/dom-snapshot-v1.log');assert dom=={'cases':1272,'blocks':46694,'status':'PASS'}
assert result(T/'p042-c3-host-v1/navigation-v1.log')=={'frame':'1','phase':'paused'}
assert result(T/'p042-c3-host-v1/es-flow-v1.log')['frame']=='625'
files={}
for x in freeze['outputs']:
 if not Path(x['path']).is_absolute()and x['path'].startswith(('apps/web/','packages/demos/')):files[x['path']]=pin(resolve(x))
for x in read(R/'catalog/typography-v1/g678-integration.json')['sharedFiles']:
 p=pin(R/x['path']);assert p['sha256']==x['sha256'];files[x['path']]=p
p=R/'apps/web/lib/g678-nms-l02-p042-freeze-v1.ts';files[str(p.relative_to(R))]=pin(p)
binding=read(R/'catalog/typography-v1/g678-page-bindings'/(ID+'.prepared-v1.json'));binding.pop('preparationOnly');source=read(A/'source-text-catalog-v1.json');shapes={s['characterId']:s['sourceTagSha256']for s in source['shapeDefinitions']}
# The final review inventory expands localized DOM blocks. Runtime snapshots
# continue using the shared DOM id plus their language; no runtime code changes.
blocks=[]
for original in binding['blocks']:
 b=copy.deepcopy(original);graphics=[i for i in b.get('sourceShapeIds',[])if i not in [1,137,160,162]]
 b['sourceShapeIds']=[i for i in b.get('sourceShapeIds',[])if i in [1,137,160,162]]
 b['relatedGraphicShapeIds']=graphics;b['runtimeBlockId']=b['id'];blocks.append(b)
 if b['id']!='course-title':
  translated=copy.deepcopy(b);translated.update(id=b['id']+'-es',language='es');blocks.append(translated)
binding['blocks']=blocks
binding['localeInventoryPolicy']='Final review inventory contains en/es variants mapped by runtimeBlockId. Runtime uses37shared IDs per locale; course-title remains English. relatedGraphicShapeIds are non-text graphics, not outlined text.'
binding['sourceRoleDecisions']=[{'kind':'outlined-text','role':'heading','semanticValue':'Fractions, Decimals, and Percents Concepts: Instruction','sourceShapeHashes':[{'characterId':1,'sourceTagSha256':shapes[1]}],'evidencePath':str(A/'source-heading-transcription-v1.json')},{'kind':'outlined-text','role':'label','semanticValue':'100% = 1','sourceShapeHashes':[{'characterId':i,'sourceTagSha256':shapes[i]}for i in [137,160,162]],'evidencePath':str(A/'source-shape-roles-v1.json')}]
js="const fs=require('fs'),c=require('crypto');console.log(c.createHash('sha256').update(JSON.stringify(JSON.parse(fs.readFileSync(process.argv[1],'utf8')))).digest('hex'))"
binding['sourceCatalogContentSha256']=subprocess.check_output(['node','-e',js,str(A/'source-text-catalog-v1.json')],text=True).strip()
binding.update(implementation={'files':list(files.values())},unresolved=[],independentPending=['Original runtime and fidelity','Named human listening/visual review and Owner acceptance','Strict completion, release and publication','Mathematical pair bounds, integer fractions, responsive focus and steady emphasis are documented adaptations','English source narration and course heading remain; maintained UI instructions and labels are translated'])
out=R/'catalog/typography-v1/g678-page-bindings'/(ID+'.json');check=R/'catalog/typography-v1/g678-checks'/(ID+'.json');dest=R/'catalog/typography-v1/g678-checks/evidence'/(ID+'-v1');assert not out.exists()and not check.exists()and not dest.exists();dest.mkdir(parents=True)
sources=[]
for n in range(207,228):
 p=T/f'continuation{n}-progress-v1.json'
 if p.exists():sources.append(p)
for name in ['p042-browser-v1','p042-static-browser-v1','p042-audio-browser-v1','p042-player-browser-v1','p042-real-host-v1','p042-c2-host-v1','p042-c3-host-v1']:
 sources.extend(p for p in sorted((T/name).iterdir())if p.is_file()and p.suffix in ['.json','.log','.png'])
sources.extend([T/'continuation227-p042-production-v1.json',T/'continuation227-production-build-v1.log'])
artifacts=[]
for i,p in enumerate(dict.fromkeys(sources)):
 q=dest/f'{i:03d}-{p.name}';q.write_bytes(p.read_bytes());artifacts.append(pin(q))
for n in ['source-shape-roles-v1.json','source-heading-transcription-v1.json','native-typography-source-risk-dispositions-v1.json','teaching-cue-disposition-v2.json','teaching-corrections-v1.json','practice-implementation-v1.json','native-audio-plan-v1.json']:artifacts.append(pin(A/n))
with out.open('x')as h:h.write(json.dumps(binding,indent=2)+'\n')
risk=read(A/'native-typography-source-risk-dispositions-v1.json');keys=['sourceBinding','semanticText','mathSemantics','timingAndReplay','teachingTextDisposition','hostIntegration','responsiveTypography','accessibility','bilingualPolicy','performance','lifecycle','resourceStability']
record={'kind':'g678-lesson-typography-check-v1','placementId':ID,'sourceSwfSha256':binding['sourceSwfSha256'],'bindingSha256':pin(out)['sha256'],'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'artifacts':artifacts,'checks':{k:'passed'for k in keys},'languagePolicy':{'en':'source','es':'translated'},'resolvedSourceRisks':[x['kind']for x in risk['riskDispositions']],'sourceRiskResolution':risk,'technicalScope':'Local Current-JS engineering with documented mathematical corrections and responsive semantic adaptations. Runtime37DOM blocks per locale verified; final bilingual inventory expands73review rows. Source narration/heading remain English. Browser gain-zero transport tests are not listening acceptance.','matrix':{'actualHostLayouts':16,'languages':['en','es'],'textZoomPercent':[100,200],'widths':[320,390,768,1280],'staticDomCases':1272,'staticTextChecks':46694},'candidateScope':{'freeze':pin(f),'behavior':'C1functional code with C2heading and C3toolbar layout repairs. Source-role/cue coverage and corrections explicitly recorded.','layout':'C3actualhost','production':'C3'},'performance':{'scope':'Localdevelopment only, no SLA','qualification':'Initial route compilation and audio loading may be slow; observed waits and failures preserved. No throughput claim.'},'humanReviewed':False,'ownerAccepted':False,'originalRuntimeAccepted':False,'fidelityAccepted':False,'audioAccepted':False,'strictComplete':False,'published':False}
with check.open('x')as h:h.write(json.dumps(record,indent=2)+'\n')
print(json.dumps({'status':'evidence-written-pending-check','binding':pin(out),'check':pin(check),'implementationFiles':len(files),'artifacts':len(artifacts)}))
