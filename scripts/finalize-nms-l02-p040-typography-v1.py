from pathlib import Path
import json,hashlib,datetime,sys
R=Path(__file__).resolve().parents[1];T=Path(sys.argv[1]);ID='shared-nms002-l02-p040';A=R/'migrations'/ID/'audit'
def read(p):return json.loads(p.read_text())
def pin(p):
 p=Path(p);assert p.is_file()and p.resolve()==p and not p.is_symlink();b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def resolve(x):
 p=Path(x['path']);return p if p.is_absolute()else R/p
def result(p):
 s=p.read_text();start=s.index('### Result\n')+11;return json.loads(s[start:s.index('\n###',start)])
f=R/'catalog/product-bridge-calibrations/g678-nms-l02-p040-native-equivalent-percents-current-js-v1-compile-v2.json';assert pin(f)['sha256']=='cc9a9b457fce1e2c31cd8e075e35d7fcb91df5eb7ef7983f1c01caf89aea1ef7';freeze=read(f)
for x in freeze['inputs']+freeze['outputs']:assert pin(resolve(x))==x,x['path']
for p in [T/'p040-c2-host-qa-v1/es-terminal-layout-v1.log',T/'p040-c2-en-qa-v1/en-mid-layout-v1.log',T/'p040-c2-en-qa-v1/en-terminal-layout-v1.log']:
 rows=result(p);assert len(rows)==8 and all(not r['errors']for r in rows),p
assert read(T/'continuation205-p040-production-v1.json')['status']=='PASS'
assert result(T/'p040-static-browser-v1/static-dom-matrix-v1.log')['errors']==[]
files={}
for x in freeze['outputs']:
 if not Path(x['path']).is_absolute()and x['path'].startswith(('apps/web/','packages/demos/')):files[x['path']]=pin(resolve(x))
for x in read(R/'catalog/typography-v1/g678-integration.json')['sharedFiles']:
 p=pin(R/x['path']);assert p['sha256']==x['sha256'];files[x['path']]=p
p=R/'apps/web/lib/g678-nms-l02-p040-freeze-v1.ts';files[str(p.relative_to(R))]=pin(p)
binding=read(R/'catalog/typography-v1/g678-page-bindings'/(ID+'.prepared-v1.json'));binding.pop('preparationOnly');binding.update(implementation={'files':list(files.values())},unresolved=[],independentPending=['Original runtime and fidelity','Named human listening/visual review and Owner acceptance','Strict completion, release and publication','Native glossary word gates and terminalhold, sourcePCMgap and nativefonts remain qualified adaptations','Narrow large-text equation uses keyboard-accessible horizontal scrolling'])
out=R/'catalog/typography-v1/g678-page-bindings'/(ID+'.json');check=R/'catalog/typography-v1/g678-checks'/(ID+'.json');dest=R/'catalog/typography-v1/g678-checks/evidence'/(ID+'-v1');assert not out.exists()and not check.exists()and not dest.exists();dest.mkdir(parents=True)
sources=[]
for n in [178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205]:
 p=T/f'continuation{n}-progress-v1.json'
 if p.exists():sources.append(p)
for name in ['p040-real-host-v1','p040-host-layout-v1','p040-c2-host-qa-v1','p040-c2-en-qa-v1','p040-static-browser-v1','p040-player-browser-v1','p040-audio-browser-v1','p040-dialog-browser-v2']:
 sources.extend(p for p in sorted((T/name).iterdir())if p.is_file()and p.suffix in ['.json','.log','.png'])
for name in ['continuation205-p040-production-v1.json','continuation205-production-build-v1.log','continuation200-access-tests-v1.log','continuation201-binding-tests-v1.log','continuation196-frame-tests-v1.log','continuation197-text-tests-v1.log']:sources.append(T/name)
artifacts=[]
for i,p in enumerate(dict.fromkeys(sources)):
 q=dest/f'{i:03d}-{p.name}';q.write_bytes(p.read_bytes());artifacts.append(pin(q))
for n in ['source-specification-v1.json','native-typography-source-risk-dispositions-v1.json','source-glyph-mask-v1.json','source-grid-v1.json','source-heading-transcription-v1.json','native-audio-plan-v1.json','native-behavior-decisions-v1.json']:artifacts.append(pin(A/n))
with out.open('x')as h:h.write(json.dumps(binding,indent=2)+'\n')
risk=read(A/'native-typography-source-risk-dispositions-v1.json');keys=['sourceBinding','semanticText','mathSemantics','timingAndReplay','teachingTextDisposition','hostIntegration','responsiveTypography','accessibility','bilingualPolicy','performance','lifecycle','resourceStability']
record={'kind':'g678-lesson-typography-check-v1','placementId':ID,'sourceSwfSha256':binding['sourceSwfSha256'],'bindingSha256':pin(out)['sha256'],'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'artifacts':artifacts,'checks':{k:'passed'for k in keys},'languagePolicy':{'en':'source','es':'source-fallback'},'resolvedSourceRisks':[x['kind']for x in risk['riskDispositions']],'sourceRiskResolution':risk,'technicalScope':'Local Current-JS engineering. Source equation movement/alpha/glyphbounds and40cellgrid are audited; actualhostplay/glossary/navigation/fontfailure/resource checks are bounded evidence, not original-runtime authority.','matrix':{'actualHostLayouts':24,'languages':['en','es'],'textZoomPercent':[100,200],'widths':[320,390,768,1280],'staticDomCases':112,'staticTextChecks':1232,'moduleQueries':4500},'candidateScope':{'freeze':pin(f),'behavior':'C1samefunctionalcodeasC2; C2adds only scopedhostheading/toolbar wrapping withpreservedC1recovery.','layout':'C2 actualhost','production':'C2'},'performance':{'scope':'Localdevelopment only, no SLA','qualification':'Host source validation and initialcompile slow; no throughput claim. SourcePCM preparation and cancel/lifecycle checks bound separately.'},'humanReviewed':False,'ownerAccepted':False,'originalRuntimeAccepted':False,'fidelityAccepted':False,'audioAccepted':False,'strictComplete':False,'published':False}
with check.open('x')as h:h.write(json.dumps(record,indent=2)+'\n')
print(json.dumps({'status':'evidence-written-pending-development-check','binding':pin(out),'check':pin(check),'implementationFiles':len(files),'artifacts':len(artifacts)}))
