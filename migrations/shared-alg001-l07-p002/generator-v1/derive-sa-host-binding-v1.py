from pathlib import Path
import hashlib,json,re,datetime
B=Path(__file__).resolve().parents[1];W=B.parents[1]
prior=W/'migrations/shared-alg001-l06-p004/audit/sa-host-disposition-v1.json'
old=json.loads(prior.read_text());inputs={}
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
for key in ['hostCas','hostWorkingCopy','hostExtractionReceipt','hostFunctions','hostGallery','saRelease','eaRelease','saPlay','saPause','hostFrameObserver']:
 row=old['inputs'][key];actual=pin(Path(row['path']));assert actual==row,key;inputs[key]=actual
inputs['priorDisposition']=pin(prior)
physical=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
inputs['lessonXml']=pin(physical/'G6-G8-shared/ALG001/L7/index.xml')
inputs['pageSwf']=pin(physical/'G6-G8-shared/ALG001/L7/RW/L7RW02.swf')
inputs['separateSa']=pin(physical/'G6-G8-shared/ALG001/L7/SA/L7RW02.mp3')
assert inputs['lessonXml']['sha256']=='5eac052615476e688afc1e69391c17bb0c20db8200e7be3f7ea1f9bb778d85f6'
assert inputs['pageSwf']['sha256']=='be4379b92c4a214b6a00d655cee930dbdba0a018c0b1dcb89be855e4a8c8f996'
assert inputs['separateSa']['bytes']==342384 and inputs['separateSa']['sha256']=='1bbe047ac9df1f924560264c03525304c80248dee73a29776aa5f43c73e9f667'
xml=re.sub(r'<!--[\s\S]*?-->','',Path(inputs['lessonXml']['path']).read_text())
assert '<CourseIMGName>HELP_COURSES/ALG001/ALG001.jpg</CourseIMGName>' in xml
assert '<PageRoot>HELP_COURSES/ALG001/L7</PageRoot>' in xml
sections=re.findall(r'<Section\b[^>]*SName="([A-Z]+)"[^>]*>([\s\S]*?)</Section>',xml)
occurrences=[(section,i+1,path.strip()) for section,body in sections for i,path in enumerate(re.findall(r'<Page\b[^>]*>([^<]+)</Page>',body))]
assert len(occurrences)==62 and occurrences[1]==('RW',1,'RW/L7RW02.swf')
functions=Path(inputs['hostFunctions']['path']).read_text();gallery=Path(inputs['hostGallery']['path']).read_text();release=Path(inputs['saRelease']['path']).read_text()
assert 'case "HELP_COURSES/ALG001/ALG001.jpg":' in gallery
assert 'doPlaySpanishAudio' in release
assert 'SFTemFName = _global.playSwfFileName.split("/");' in functions
assert 'while(i < SFTemFName.length - 2)' in functions
assert 'SndFName = spanishAudioURL + "/SA/" + SSTemFName[0] + ".mp3";' in functions
logical='HELP_COURSES/ALG001/L7/'+occurrences[1][2]
parts=logical.split('/');derived='/'.join(parts[:-2])+'/SA/'+parts[-1].split('.')[0]+'.mp3'
assert derived=='HELP_COURSES/ALG001/L7/SA/L7RW02.mp3'
d={'schemaVersion':1,'kind':'alg-l07-p002-separate-sa-host-binding-v1','animationId':'shared-alg001-l07-p002','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'status':'verified-static-host-algorithm-conditional-page-application-not-runtime-or-listening','inputs':inputs,
 'references':[{'input':'hostGallery','lines':[32,36],'claim':'Exact ALG001 CourseIMGName matches source lesson XML'},
 {'input':'saRelease','lines':[1,12],'claim':'Explicit release invokes doPlaySpanishAudio'},
 {'input':'hostFunctions','lines':[1519,1591],'claim':'Enabled newTitle path pauses main and derives separate SA from current page, guarded load then start(0)'},
 {'input':'hostFunctions','lines':[1594,1664],'claim':'Classic section path has same current-page SA construction'},
 {'input':'hostFunctions','lines':[1665,1708],'claim':'Return unloads SA and resumes retained nonterminal main only'},
 {'input':'hostFunctions','lines':[2786,2855],'claim':'Availability conditional on dtfSPANISH ON, eligible section and non-01.SWF'}],
 'applicability':{'hostLogicalArchivePath':'NewHelpProgram/HELP_COURSES/indexMI.swf','xmlPlacement':{'globalOrdinal':2,'sectionCode':'RW','sectionNumber':2,'sectionPageOrdinal':1,'file':'RW/L7RW02.swf'},
 'currentPageLogicalPath':logical,'derivedUrlTemplate':'<ServerRoot>/'+derived,'derivationStatus':'conditional substitution into freshly rehashed source host algorithm',
 'availability':'conditional on enabled dtfSPANISH and matching old-host launch; actual settings and launch unobserved','sourceRole':'explicit optional separate Spanish page-audio operation','actualSpokenLanguage':'unverified'},
 'modernContract':['Explicit user trigger only; locale never starts audio','Pause main before SA load; keep embedded stream intact','Cancel stale loads on Pause, Replay and navigation','Return releases SA and retains main cursor; terminal1195 remains held','No source-derived proof of fractional SA resume; separate Play starts sample0'],
 'limits':['No original host session or launch association','No listening or spoken-language acceptance','No original AVM1 race or timing parity'],
 'acceptanceEffects':{k:False for k in ['currentJsRegistrationChanged','originalRuntimeAccepted','fidelityAccepted','audioAccepted','humanAccepted','ownerAccepted','strictComplete','published']}}
(B/'audit-v1/sa-host-binding-v1.json').open('x').write(json.dumps(d,indent=2)+'\n')
print(json.dumps({'pass':True,'derived':derived,'inputPins':len(inputs)}))
