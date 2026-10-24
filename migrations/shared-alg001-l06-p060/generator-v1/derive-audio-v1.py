"""Bind all 24 x 5 x 2 user-triggered FQ recordings to exact source roles."""
from pathlib import Path
import hashlib,json,re,sys
M=Path(__file__).resolve().parents[1];R=M.parents[1]
S=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6')
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);assert p.is_file() and not p.is_symlink();b=p.read_bytes()
 return {'path':str(p.relative_to(R)) if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':sha(b)}
def build(write):
 model=M/'native-v1/source-model-v1.json';assert pin(model)['sha256']=='6e5422eb24aeac0d76138d1733b3d1fd22650cfba51f14ecf0e7258ab4f373a1';m=json.loads(model.read_text())
 hostReceipt=R/'migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-resolution-v1.json';h=json.loads(hostReceipt.read_text());inputs=[pin(model),pin(hostReceipt)]
 for key in ['hostSwf','hostFrame35ActionScript','hostFrame49ActionScript','lessonXml']:
  row=h['inputs'][key];p=Path(row['path']);p=p if p.is_absolute()else R/p;assert pin(p)==row;inputs.append(row)
 host=R/'migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-frame35.as';assert pin(host)['sha256']==h['inputs']['hostFrame35ActionScript']['sha256'];inputs.append(pin(host));code=host.read_text()
 assert 'strFQTempLabel = "Q" + Number(_root.animation_mc.animation._currentframe - 1).toString();'in code
 assert 'strFQQuestionAudioURL + "/EA/" + strFQTempLabel + ".mp3"'in code and 'strFQQuestionAudioURL + "/SA/" + strFQTempLabel + ".mp3"'in code
 assert 'strQAFName = strFQTempLabel + strQALabel + ".mp3";'in code
 for n,letter in enumerate('ABCD',1):assert re.search(r'case '+str(n)+r':\s+strQALabel = "'+letter+'";',code)
 for bid,lang in [(58,'EN'),(52,'SP')]:
  s=next(s for s in m['scripts']if s['relative']==f'scripts/DefineButton2_{bid}/BUTTONCONDACTION on(release).as');b=s['text']
  assert 'Mc_Quiz_Audio' in b and f'"{lang}"'in b and 'doPlayFQQuestionAudio' in b and 'doPlayFQAnswerAudio' in b;inputs.append(s['pin'])
 rows=[]
 for q in m['questions']:
  assert q['questionFrame']-1==q['id']
  widgets=[d['ownerName']for d in q['questionDrawing']if d['kind']=='scripted-widget'and d['objectId']==67]
  assert sorted(widgets)==sorted(['Mc_Quiz_Audio',*[f'Mc_Quiz_Audio_{n}'for n in range(1,5)]])
  for language,directory in [('en','EA'),('es','SA')]:
   for choice in [None,*'ABCD']:
    stem=f'Q{q["id"]}{choice or ""}';path=S/'FQ'/directory/(stem+'.mp3');p=pin(path);copy=M/'audio-v1'/directory/(stem+'.mp3')
    if write and not copy.exists():
     copy.parent.mkdir(parents=True,exist_ok=True)
     with copy.open('xb')as f:f.write(path.read_bytes())
     copy.chmod(0o444)
    c=pin(copy);assert (c['bytes'],c['sha256'])==(p['bytes'],p['sha256'])
    rows.append({'id':language+'-'+stem,'question':q['id'],'questionFrame':q['questionFrame'],'language':language,'choice':choice,'owner':'Mc_Quiz_Audio'+(''if choice is None else '_'+str('ABCD'.index(choice)+1)),'source':p,'copy':c})
 assert len(rows)==240 and sum(r['source']['bytes']for r in rows)==17681904
 for d in ['EA','SA']:assert {p.name for p in (S/'FQ'/d).glob('*.mp3')}=={f'Q{q}{c}.mp3'for q in range(1,25)for c in ['',*'ABCD']}
 return {'kind':'p060-source-role-audio-inventory-v1','sourceSha256':m['sourceSha256'],'inputs':inputs,'assets':rows,'counts':{'questions':24,'rolesPerQuestion':5,'languages':2,'files':240,'bytes':17681904},'hostBinding':'Conditional indexMI static interface compatibility; historical launcher/actual pairing unverified. Question frame minus one and option widget suffix match the recovered host formula.','policy':{'userTriggeredOnly':True,'localeSelectionAutoplays':False,'embeddedAudio':False,'reviewSourceHasAudioWidgets':False,'newRecordings':False},'acceptance':{'sourceRoleBinding':True,'browserDecode':False,'namedHumanListening':False,'originalRuntime':False,'registeredCurrentJs':False}}
if __name__=='__main__':
 assert sys.argv[1:]in [['--write'],['--check']];write=sys.argv[1]=='--write';data=build(write);p=M/'audio-v1/source-role-inventory-v1.json';b=(json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode()
 if write:
  with p.open('xb')as f:f.write(b)
 else:assert p.read_bytes()==b
 print(json.dumps({'output':pin(p),'counts':data['counts']}))
