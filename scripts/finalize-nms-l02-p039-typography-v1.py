"""Bind completed P039 native engineering evidence; leave independent acceptance open."""
from pathlib import Path
import json,hashlib,datetime,sys
R=Path(__file__).resolve().parents[1];T=Path(sys.argv[1]);E=T/'p039-c2-host-matrix-v1';ID='shared-nms002-l02-p039';C='g678-nms-l02-p039-native-percent-practice-current-js-v1';now=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def pin(p):
 p=Path(p);assert p.is_file()and p.resolve()==p and not p.is_symlink();b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def resolve(x):
 p=Path(x['path']);return p if p.is_absolute()else R/p
def result(name):
 s=(E/name).read_text();start=s.index('### Result\n')+len('### Result\n');return json.loads(s[start:s.index('\n###',start)])
fp=R/'catalog/product-bridge-calibrations'/(C+'-compile-v3.json');assert pin(fp)['sha256']=='c18e8d1abf56c4a403a3bb980322d9f909c5f719be7da193198e3a6c16039bcf';freeze=read(fp)
for x in freeze['inputs']+freeze['outputs']:assert pin(resolve(x))==x,x['path']
matrixNames=['en-question-matrix-v2.log','en-wrong-matrix-v1.log','en-reveal-matrix-v1.log','es-question-matrix-v1.log','es-wrong-matrix-v1.log','es-reveal-matrix-v1.log','es-c3-question-matrix-v1.log','es-c3-wrong-matrix-v1.log','es-c3-reveal-matrix-v1.log']
for name in matrixNames:
 d=result(name);assert d['phase']in['546','579']and len(d['rows'])==8 and all(not x['failures']for x in d['rows']),name
assert result('es-host-heading-actual-c3-v1.log')['patchInjected']is False
assert read(T/'continuation174-p039-production-v1.json')['status']=='PASS'
assert read(E/'exercise-marker-lineage-v1.json')['behaviorUnchanged']
assert all(not x['mismatches']for x in read(E/'c3-lineage-pins-v1.json'))
prior=read(R/'catalog/typography-v1/g678-page-bindings'/(ID+'.prepared-v1.json'));integration=read(R/'catalog/typography-v1/g678-integration.json');files={}
for x in freeze['outputs']:
 if not Path(x['path']).is_absolute()and x['path'].startswith(('apps/web/','packages/demos/')):files[x['path']]=pin(resolve(x))
for x in integration['sharedFiles']:
 current=pin(R/x['path']);assert current['sha256']==x['sha256'];files[x['path']]=current
for rel in ['packages/demos/src/lesson-animation-title-v1.tsx','packages/demos/src/lesson-animation-title-v1.css','packages/demos/src/lesson-animation-title-v1.css.d.ts','apps/web/lib/g678-nms-l02-p039-freeze-v1.ts']:files[rel]=pin(R/rel)
prior.pop('preparationOnly',None);prior.update(implementation={'files':list(files.values())},unresolved=[],independentPending=['Original runtime and fidelity','Audio listening, human visual and Owner acceptance','Strict completion, release and publication','English source instructions with native Spanish controls/feedback; not Spanish original-runtime parity','Conservative glyph reveal, native focus/keyboard controls, corrected25percent fallback and source-audio tail extensions remain qualified adaptations'])
binding=R/'catalog/typography-v1/g678-page-bindings'/(ID+'.json');check=R/'catalog/typography-v1/g678-checks'/(ID+'.json');dest=R/'catalog/typography-v1/g678-checks/evidence'/(ID+'-v1');assert not binding.exists()and not check.exists()and not dest.exists();dest.mkdir(parents=True)
sources=[]
for n in range(164,174):
 p=T/f'continuation{n}-progress-v1.json'
 if p.exists():sources.append(p)
for n in [164,165,166,169]:
 for x in read(T/f'continuation{n}-progress-v1.json').get('evidence',[]):
  p=Path(x['path'])
  if p.suffix=='.log':sources.append(p)
for p in sorted(E.iterdir()):
 if p.is_file()and p.suffix in ['.log','.json','.png','.js','.css','.py']:sources.append(p)
for name in ['continuation174-p039-production-v1.json','continuation174-production-build-v1.log','continuation174-registry-generation-v1.log','p039-heading-c3-staging-v1.json']:
 sources.append(T/name)
sources.extend([T/'p039-host-adapter-v1/module-contract.json',T/'p039-layout-investigation-v1/before-v1.log',T/'p039-layout-investigation-v1/actual-c2-v2.log'])
artifacts=[];seen=set()
for i,p in enumerate(sources):
 if p in seen:continue
 seen.add(p);target=dest/f'{i:03d}-{p.name}';target.write_bytes(p.read_bytes());artifacts.append(pin(target))
for name in ['source-specification-v1.json','native-typography-source-risk-dispositions-v1.json','native-frame-domains-v1.json','native-text-presentation-v1.json','native-behavior-decisions-v1.json']:
 artifacts.append(pin(R/'migrations'/ID/'audit'/name))
with binding.open('x')as f:f.write(json.dumps(prior,indent=2)+'\n')
risk=read(R/'migrations'/ID/'audit/native-typography-source-risk-dispositions-v1.json');spec=read(R/'migrations'/ID/'audit/source-specification-v1.json');risk.update(shapeRoles=spec['sourceShapeRoles'],textRoles=spec['sourceTextRoles'])
checks=['sourceBinding','semanticText','mathSemantics','timingAndReplay','teachingTextDisposition','hostIntegration','responsiveTypography','accessibility','bilingualPolicy','performance','lifecycle','resourceStability']
record={'kind':'g678-lesson-typography-check-v1','placementId':ID,'sourceSwfSha256':prior['sourceSwfSha256'],'bindingSha256':pin(binding)['sha256'],'checkedAt':now,'artifacts':artifacts,'checks':{k:'passed'for k in checks},'languagePolicy':{'en':'source','es':'source-fallback'},'resolvedSourceRisks':[x['kind']for x in risk['riskDispositions']],'sourceRiskResolution':risk,'technicalScope':'Local Current-JS engineering only. Source-locked state, math, timing, source-audio binding and native responsive controls are checked; original Flash pixel/runtime and listening acceptance remain pending.','matrix':{'stableExerciseAndRevealLayouts':72,'c2ContentAndToolbarLayouts':48,'c3FullSpanishHeadingAndContentLayouts':24,'c3HeadingWidths':[320,390,768,1280,1440,1920],'textZoomPercent':[100,200],'sourceFrameScenarios':36792},'candidateScope':{'currentFreeze':pin(fp),'functionalEvidence':'Controller/player files remain byte-identical; exercise changes since frame checks limited to neutral candidate marker, verified by reconstruction hash. C2 changed padding/toolbar; C3 changed only scoped heading layout.','responsiveEvidence':'C2 EN/ES content and toolbar matrices retained; C3 supersedes header finding and adds full Spanish header/content matrix.','production':'C3 complete production build and private-route/client-bundle negatives'},'performance':{'scope':'Local development and production-build checks, no throughput or user-facing latency SLA','navigation':result('es-fonts-performance-v1.log')['navigation'],'qualification':'Loading and natural play waits sometimes exceed55seconds; same live sessions subsequently reached expected hold, no timeout treated as completion.'},'humanReviewed':False,'ownerAccepted':False,'originalRuntimeAccepted':False,'fidelityAccepted':False,'audioAccepted':False,'strictComplete':False,'published':False}
with check.open('x')as f:f.write(json.dumps(record,indent=2)+'\n')
print(json.dumps({'status':'evidence-written-pending-development-check','binding':pin(binding),'check':pin(check),'implementationFiles':len(files),'artifacts':len(artifacts)}))
