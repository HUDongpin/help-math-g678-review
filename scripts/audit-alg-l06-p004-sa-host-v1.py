#!/usr/bin/env python3
"""Rehash retained host evidence and derive conditional P004 applicability."""
import hashlib,json,pathlib,sys,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
AWS=pathlib.Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
WORK=ROOT/'migrations/shared-alg001-l06-p004'
def read(p,sha=None,size=None):
 p=pathlib.Path(p);assert p.resolve()==p
 before=p.stat();assert p.is_file() and before.st_nlink==1
 data=p.read_bytes();after=p.stat()
 for k in ['st_dev','st_ino','st_size','st_mtime_ns','st_ctime_ns','st_mode','st_nlink']:assert getattr(before,k)==getattr(after,k)
 pin=dict(path=str(p),bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
 if sha:assert pin['sha256']==sha
 if size is not None:assert len(data)==size
 return data,pin
assert AWS.resolve()==AWS and AWS.is_dir()
prior_path=ROOT/'migrations/shared-alg001-l06-p003/audit/sa-host-disposition-v2.json'
prior_raw,prior_pin=read(prior_path,'7a7a4d1e26806569a788d6981593e027b583c84e55cd3d05ff42deae5351f463',12742)
prior=json.loads(prior_raw);inputs={'priorDisposition':prior_pin};data={}
for key in ['lessonXml','hostCas','hostWorkingCopy','hostExtractionReceipt','hostFunctions','hostGallery','saRelease','eaRelease','saPlay','saPause','hostFrameObserver']:
 pin=prior['inputs'][key];data[key],inputs[key]=read(pin['path'],pin['sha256'],pin['bytes'])
page,inputs['pageSwf']=read(AWS/'G6-G8-shared/ALG001/L6/RW/L6RW04.swf','514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e',1115626)
sa,inputs['separateSa']=read(AWS/'G6-G8-shared/ALG001/L6/SA/L6RW04.mp3','08bb62e9c1d92235c2e3fb96c44d44fc16b92ca7d175274e4c809f06bcfda8a5',667968)
movie,inputs['pageXmlExport']=read(WORK/'audit/movie-root-verified.xml','e4c1ac33596cac6b97491c6d74417ddd8edfebb8197b12f680fdaa2cf8e5b187')
tree=ET.fromstring(data['lessonXml']);sections=tree.findall('Section');rw=[s for s in sections if s.attrib['SName']=='RW'];assert len(rw)==1
assert rw[0].attrib['SNumber']=='2'
pages=rw[0].findall('Page');assert pages[2].text=='RW/L6RW04.swf'
assert tree.findtext('PageRoot')=='HELP_COURSES/ALG001/L6'
assert tree.findtext('CourseIMGName')=='HELP_COURSES/ALG001/ALG001.jpg'
assert b'HELP_COURSES/ALG001/ALG001.jpg' in data['hostGallery']
placements=[e for e in ET.fromstring(movie).iter('PlaceObject2') if e.attrib.get('objectID')=='95' and e.attrib.get('name')=='animation'];assert len(placements)==1
host=data['hostFunctions'].decode();release=data['saRelease'].decode()
assert 'doPlaySpanishAudio' in release
required=['function doPlaySpanishAudio()','_root.animation_mc.animation.stop();','SndFName = spanishAudioURL + "/SA/" + SSTemFName[0] + ".mp3";','if(_global.showLoading_Spanish)','_global.spanSoundMp3.start(0);','_global.spanSoundMp3.loadSound(SndFName,false);','_global.spanSoundMp3.onSoundComplete','_root.doStopSpanishAudio();']
for text in required:assert text in host,text
references=[r for r in prior['references'] if r['input'] in ['hostFunctions','hostGallery','saRelease','saPause','saPlay']]
payload=dict(schemaVersion=1,kind='alg-l06-p004-separate-sa-host-disposition-v1',animationId='shared-alg001-l06-p004',
 status='verified-static-host-algorithm-conditional-page-application-not-runtime-or-listening',inputs=inputs,references=references,
 applicability=dict(hostLogicalArchivePath='NewHelpProgram/HELP_COURSES/indexMI.swf',
  xmlPlacement=dict(globalOrdinal=4,sectionCode='RW',sectionNumber=2,sectionPageOrdinal=3,file='RW/L6RW04.swf'),
  derivedUrlTemplate='<ServerRoot>/HELP_COURSES/ALG001/L6/SA/L6RW04.mp3',
  derivationStatus='conditional substitution into rehashed host algorithm',
  availability='conditional on enabled dtfSPANISH and matching host launch; actual settings and launch association unobserved',
  sourceRole='explicit optional Spanish page-audio operation',actualSpokenLanguage='unverified'),
 requiredModernBehavior=[
 'Explicit user trigger only; locale es never starts audio.',
 'Pause main clock before SA loading; keep the full embedded stream separate.',
 'Start separate SA at zero only after a current successful load; cancel stale loads.',
 'Return or SA end releases SA and resumes retained nonterminal main position when appropriate.',
 'Main frame831 stays terminal on return; do not emit course completion.',
 'Navigation, Replay and close cancel resources without reviving a departing page.',
 'Glossary pauses main. Define and test glossary/SA ownership before implementation.',
 'Source SA pause uses stop and play uses start without offset; fractional resume would be a disclosed modern choice.'],
 limits=['No actual original host session or launch binding.','Retained AS rehashed, no new host extraction.','No spoken-language or listening acceptance.','No original AVM1 race or synchronization proof.','No provider access or source mutation.'],
 acceptanceEffects=dict(currentJsRegistrationChanged=False,originalRuntimeAccepted=False,fidelityAccepted=False,audioAccepted=False,humanAccepted=False,ownerAccepted=False,strictComplete=False,published=False))
encoded=(json.dumps(payload,indent=2,ensure_ascii=False)+'\n').encode();out=WORK/'audit/sa-host-disposition-v1.json'
assert len(sys.argv)==2 and sys.argv[1] in ['--write','--check']
if sys.argv[1]=='--write':
 with out.open('xb') as f:f.write(encoded)
else:assert out.read_bytes()==encoded
print(json.dumps(dict(status=payload['status'],bytes=len(encoded),sha256=hashlib.sha256(encoded).hexdigest())))
