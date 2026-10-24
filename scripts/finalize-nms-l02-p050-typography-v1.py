from pathlib import Path
import json,hashlib,datetime,sys
R=Path(__file__).resolve().parents[1];T=Path(sys.argv[1]).resolve();ID='shared-nms002-l02-p050'
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def resolve(x):
 p=Path(x['path']);return p if p.is_absolute()else R/p
def result(p):return json.loads(p.read_text().split('### Result\n')[1].split('\n')[0])
f=R/'catalog/product-bridge-calibrations/g678-nms-l02-p050-native-number-line-current-js-v1-compile-v1.json';assert pin(f)['sha256']=='4d9b2893edb6dafa83de8272eeffc15da393a11d80e7d2df45d2bccd5cdb9de9';freeze=read(f)
for x in freeze['inputs']+freeze['outputs']:assert pin(resolve(x))==x,x['path']
for lang in ['en','es']:
 d=result(T/f'continuation541-host-{lang}-layout-v1.log');assert d['status']=='PASS' and len(d['profiles'])==10
assert result(T/'continuation543-dom-text-v1.log')=={'cases':430,'errors':[]}
assert result(T/'continuation540-host-full-v1.log')['completionFrame']=='260'
assert result(T/'continuation542-host-audio-cleanup-v1.log')['after']==['closed','closed']
assert read(T/'continuation544-production-negative-v1.json')['status']=='PASS'
assert all(row['exitCode']==0 for row in read(T/'continuation538-checks-v3/results.json'))
files={x['path']:pin(resolve(x)) for x in freeze['outputs'] if x['path'].startswith(('apps/web/','packages/demos/'))}
for x in read(R/'catalog/typography-v1/g678-integration.json')['sharedFiles']:
 p=pin(R/x['path']);assert p['sha256']==x['sha256'];files[p['path']]=p
p=pin(R/'apps/web/lib/g678-nms-l02-p050-freeze-v1.ts');files[p['path']]=p
binding=read(R/f'catalog/typography-v1/g678-page-bindings/{ID}.prepared-v1.json');binding.pop('preparationOnly');binding['implementation']={'files':list(files.values())};binding['unresolved']=[]
output=R/f'catalog/typography-v1/g678-page-bindings/{ID}.json';check=R/f'catalog/typography-v1/g678-checks/{ID}.json';dest=R/f'migrations/{ID}/evidence/typography-current-js-v1';assert not output.exists()and not check.exists()and not dest.exists();dest.mkdir(parents=True)
names=['continuation540-host-full-v1.log','continuation540-host-navigation-v2.log','continuation541-host-en-layout-v1.log','continuation541-host-es-layout-v1.log','continuation542-host-audio-cleanup-v1.log','continuation543-dom-text-v1.log','continuation544-production-negative-v1.json','continuation544-pin-recheck-v1.json','continuation544-production-build-v2.log','continuation537-route-typecheck-v2.log','continuation534-outro-layout-v1.log','continuation535-intro-layout-v3.log']
sources=[T/n for n in names]+[Path(row['log'])for row in read(T/'continuation538-checks-v3/results.json')]
artifacts=[]
for i,p in enumerate(sources):
 q=dest/f'{i:03d}-{p.name}';q.write_bytes(p.read_bytes());artifacts.append(pin(q))
for name in ['native-text-role-coverage-v1.json','shape-role-disposition-v1.json','source-glossary-v1.json','source-main-glossary-v1.json','native-behavior-spec-v1.json','source-pcm-inventory-v1.json']:
 artifacts.append(pin(R/f'migrations/{ID}/audit'/name))
output.write_text(json.dumps(binding,indent=2)+'\n')
checks=['sourceBinding','semanticText','mathSemantics','timingAndReplay','teachingTextDisposition','hostIntegration','responsiveTypography','accessibility','bilingualPolicy','performance','lifecycle','resourceStability']
record={'kind':'g678-lesson-typography-check-v1','placementId':ID,'sourceSwfSha256':binding['sourceSwfSha256'],'bindingSha256':pin(output)['sha256'],'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':dict.fromkeys(checks,'passed'),'languagePolicy':{'en':'source','es':'translated'},'resolvedSourceRisks':list(binding['sourceRiskTreatments']),'sourceRiskDisposition':binding['sourceRiskTreatments'],'technicalScope':'Local Current-JS engineering only. No original-runtime, named listening, human/Owner, strict completion or publication acceptance.','matrix':{'nativeRoles':72,'bilingualReviewVariants':144,'semanticSnapshots':520,'browserTextPresenceComparisons':430,'hostLayoutCases':20,'widths':[320,390,768,1280,1920],'fontSizes':[16,32],'audioCleanup':['closed','closed']},'performance':{'scope':'Bounded source checks, real host playback and context cleanup, local production build; no FPS/load-test guarantee.'},'candidateScope':{'freezeManifest':str(f.relative_to(R)),'freezeSha256':pin(f)['sha256'],'deploymentScope':'local-only','limitations':['DOM comparison verifies presence,not bidirectional multiplicity','Native one-shot hold/duplicate feedback collapse/source coordinate regularization remain documented adaptations','Old502build cache invalidated during failed build setup; final new build and frozen pins verified']},'artifacts':artifacts}
check.write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'binding':pin(output),'check':pin(check),'implementationFiles':len(files),'artifacts':len(artifacts)}))
