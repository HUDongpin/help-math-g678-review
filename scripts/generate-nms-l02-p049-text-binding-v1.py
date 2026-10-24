from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p049/audit';S='896e38a05c5e6392f7e9284aa278a5b7e10c13b15f7911fa09d1dc9b1de865b2'
assert hashlib.sha256((A/'source-input.swf').read_bytes()).hexdigest()==S
source=json.loads((A/'structural-intake-v1.json').read_text());assert source['sourceSha256']==S
rows=[('course-title','heading',[22]),('question','title',[28]),('instruction','body',[25,29]),('count','label',[42,44,46,48,50,52,53,54,55,57]),('demo-tenths','answer',[52,61]),('demo-hundredths','answer',[62]),('ones','answer',[39,68]),('decimal-point','label',[87,98]),('tenths-label','label',[95]),('hundredths-label','label',[96]),('tenths-value','answer',[69,141,151,132,144,154]),('hundredths-value','answer',[70,142,152,68,145,155]),('grid-description','label',[25,57]),('check','label',[31,34]),('feedback','feedback',[31]),('help-trigger','label',[4,5]),('help-heading','heading',[106]),('help-whole-group','heading',[88]),('help-decimal-group','heading',[89]),('help-point','body',[93,94,105]),('help-grid','label',[105]),('help-tenths','body',[99]),('help-hundredths','body',[100]),('help-close','label',[80]),('hint-heading','heading',[121]),('hint-definition','body',[121]),('hint-decimal','answer',[123]),('hint-fraction','answer',[125]),('hint-grid','label',[123,125]),('hint-equivalent','label',[125]),('hint-close','label',[111]),('glossary-close','label',[80,111]),('glossary-notation','body',[105])]
for name,n in [('hundreds',90),('tens',91),('ones',92),('tenths',95),('hundredths',96),('thousandths',97)]:rows.append(('place-'+name,'label',[n]))
for name,n in [('ones',39),('tenths',44),('hundredths',46)]:rows.append(('help-digit-'+name,'answer',[n]))
for name,ids in [('decimal',[106,121]),('equivalent',[125]),('fraction',[121]),('hundredth',[100]),('place-value',[106]),('power',[121]),('tenth',[99]),('whole',[121])]:
 rows.extend([('glossary-'+name+'-title','heading',ids),('glossary-'+name+'-definition','body',ids)])
known={x['characterId']for x in source['textDefinitions']};used={n for _,_,ids in rows for n in ids};assert used<=known
empty={x['characterId']for x in source['textDefinitions']if x['kind']=='static-text'and not x['runs']};assert empty=={38,120,133,134}
nonselected={11,13,14,15,16,17,18,19};authors={71,73};assert used==known-empty-nonselected-authors
blocks=[{'id':name,'sourceTextIds':['character-'+str(n)for n in ids],'role':role,'language':'en','readingOrder':i,'valueSource':'maintained-page-state',**({'sourceShapeIds':[23]}if name=='course-title'else{})}for i,(name,role,ids)in enumerate(rows)]
binding={'schemaVersion':1,'version':'nms-l02-p049-native-source-v1','animationId':'shared-nms002-l02-p049','placementId':'shared-nms002-l02-p049','sourceSwfSha256':S,'template':'exercise','blocks':blocks}
out="import type {LessonTextBinding} from './lesson-text-contract';\n/** Semantic associations; glossary additionally bound to exact source index and explicit corrections. */\nexport const P049_TEXT_BINDING:LessonTextBinding="+json.dumps(binding,separators=(',',':'))+';\n'
target=R/'packages/demos/src/nms-l02-p049-text-binding-v1.ts'
if '--check' in sys.argv:assert target.read_text()==out
else:target.write_text(out)
report={'sourceSha256':S,'nativeRoles':len(rows),'sourceTeachingDefinitionsCovered':len(used),'coveredSourceTextIds':sorted(used),'emptyGlyphDefinitions':sorted(empty),'nonSelectedDefinitions':sorted(nonselected),'offstageAuthorLabels':sorted(authors),'semanticAssociationBoundary':['Source IDs associate native labels with teaching roles; not every native string is verbatim source copy.','Feedback/complete labels are native result status associated with source Check Answer actions.','Glossary labels/definitions use separately pinned bilingual index entries; Whole/Power corrections remain explicit.','Group headings, input labels, grid alternative text and hint heading are maintained semantic/accessibility presentation.'],'originalRuntimeAccepted':False}
t=A/'native-text-role-coverage-v1.json';text=json.dumps(report,indent=2)+'\n'
if '--check' in sys.argv:assert t.read_text()==text
else:t.write_text(text)
print(json.dumps({'roles':len(rows),'coveredDefinitions':len(used),'emptyDefinitions':sorted(empty)}))
