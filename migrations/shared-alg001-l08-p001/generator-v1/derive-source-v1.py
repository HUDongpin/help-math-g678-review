from pathlib import Path
import importlib.util,json,sys
R=Path(__file__).resolve().parents[3];M=R/'migrations/shared-alg001-l08-p001';D=Path('/Volumes/American Dream/.g6l8p1a1');producer=R/'scripts/lib/g678-two-layer-title-source-v1.py'
spec=importlib.util.spec_from_file_location('source_title',producer);lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
model,mp3=lib.derive_title_source(root=R,animation_id='shared-alg001-l08-p001',source=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L8/IR/L8IR01.swf'),source_sha='f0b332dc6586753bf485740cf4e9fa00833a5a2c929d546b1190fecd391eaaf7',copy=M/'source-v1/L8IR01.swf',xml=D/'movie.xml',export=D/'ffdec',frame_count=130,title='Graphing Linear Equations: Introduction',catalog=D/'source-text-catalog-v1.json')
model['producer']=lib.file_pin(producer,R);model['courseXmlTitle']='Graphing Linear Functions';model['titleDifference']='Course XML says Functions; source title says Equations. Preserve both independently.'
for p,b in[(M/'source-v1/source-stream-142.mp3',mp3),(M/'native-v1/source-model-v1.json',(json.dumps(model,indent=2,ensure_ascii=False)+'\n').encode())]:
 if '--check'in sys.argv:assert p.read_bytes()==b
 else:p.open('xb').write(b)
print(json.dumps(dict(pass_=True,frames=model['frameCount'],title=model['title'],stream=model['stream'],mode='check'if'--check'in sys.argv else'write')))
