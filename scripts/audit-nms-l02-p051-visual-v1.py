#!/usr/bin/env python3
"""Source-locked structural role audit; does not establish Flash runtime parity."""
import json, hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[1]; A=R/'migrations/shared-nms002-l02-p051/audit'
T=Path('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p051-shapes-svg-v1')
x=json.loads((A/'structural-intake-v1.json').read_text()); sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(A/'source-input.swf')==x['sourceSha256']=='9c4c9857bb497497b4301a7b1cfec475b5f7bdf9d2cecabcd779fbd887de5d1f'
base={'schemaVersion':1,'animationId':'shared-nms002-l02-p051','sourceSha256':x['sourceSha256'],'claim':'Structural source-role audit only; not original-runtime, fidelity, human, Owner or publication acceptance.'}
def write(n,d): (A/n).write_text(json.dumps(base|d,indent=2)+'\n')
def refs(cid):
 return [{'timelineId':t['timelineId'],'depth':i['depth'],'firstFrame':i['firstFrame'],'lastFrameExclusive':i['lastFrameExclusive']}for t in x['timelines'] for i in t['instances'] if i['characterId']==cid]
roles={53:'course-title',57:'matching-instruction',60:'question-number',65:'fraction-column-heading',66:'decimal-column-heading',67:'fraction-one-tenth',69:'fraction-one-fifth',70:'fraction-one-quarter',71:'fraction-three-quarters',72:'fraction-seven-eighths',74:'decimal-0.1',76:'distractor-0.125',78:'decimal-0.2',80:'decimal-0.25',82:'distractor-0.3',84:'distractor-0.7',86:'distractor-0.8',87:'decimal-0.875',89:'decimal-0.75',106:'one-tenth-magenta-emphasis',108:'decimal-0.1-magenta-emphasis',233:'wrong-feedback-close',240:'calculator-coaching-introduction',241:'calculator-step-numerator',242:'calculator-step-divide',243:'calculator-step-denominator',244:'calculator-step-equals-retry',255:'completion-feedback'}
rows=[]; excluded=[]
for d in x['textDefinitions']:
 c=d['characterId']; r={'characterId':c,'sourceTagSha256':d['sourceTagSha256'],'boundsTwips':d['boundsTwips'],'placements':refs(c)}
 if c in roles:rows.append(r|{'role':roles[c],'sourceRuns':[q['text']for q in d['runs']]})
 else:
  reason='offstage-audio-instance-label' if c in [249,251] else 'stopped-unselected-decorative-feedback' if c>=171 else 'unplaced-legacy-help-button' if c in [4,5] else 'unplaced-hurricane-chart-library'
  excluded.append(r|{'disposition':reason,'sourceTextOmitted':True})
write('teaching-text-role-intake-v1.json',{'teachingDefinitionCount':len(rows),'definitions':rows,'outlinedTitle':{'characterId':54,'correspondingTextId':53},'limits':['Role bindings are not bilingual native typography acceptance.']})
write('nonteaching-text-disposition-v1.json',{'definitions':excluded,'count':len(excluded),'scope':'Exclusion from selected native teaching flow; not a claim of absence from SWF library.','offstageAudioLabels':{'249':{'parentTranslation':[-13837,689]},'251':{'parentTranslation':[-13797,123]},'mainRootTranslation':[8248,5866],'childTranslation':[40,40]},'unplacedChart':{'timelineId':'sprite-51','incomingTimelinePlacementCount':len(refs(51))},'limits':['Decorative feedback remains structurally placed at practice but stopped on empty frame 1; no selected playback claim.']})
known={54:'outlined-course-title',56:'main-panel-with-blue-instruction-underlines',58:'black-question-number-disc',61:'blue-hit-test-rectangle-for-glossary-buttons-62-63',64:'fraction-decimal-table-background-and-grid',68:'hit-test-rectangle-and-source-placement-geometry',73:'green-decimal-card-plus-separate-fraction-bar',90:'blue-horizontal-instruction-underline',107:'magenta-one-tenth-fraction-bar',109:'black-mouse-arrow-demonstration',110:'green-decimal-card-plus-separate-fraction-bar',118:'green-gradient-demonstration-card-background',120:'target-rectangle-geometry',239:'pale-yellow-calculator-coaching-panel-with-underlines',253:'magenta-rounded-completion-panel'}
shapes=[]
for d in x['shapeDefinitions']:
 c=d['characterId']; p=T/f'{c}.svg'; rr=refs(c)
 role=known.get(c)
 if role is None:
  if 91<=c<=105:role='red-rectangular-emphasis-outline'
  elif c in [75,77,79,81,83,85,88,111,112,113,114,115,116,117,126,128,130,132,134,136,138,140,142]:role='green-decimal-card-background'
  elif any(r['timelineId'] in ['sprite-177','sprite-189','sprite-217','sprite-228']for r in rr):role='unselected-decorative-feedback-shape'
  elif c in [229,230,231,232,234,235,236,237]:role='wrong-feedback-close-button-geometry'
  elif c<=50:role='unplaced-legacy-library-or-help-geometry'
  else:role='unresolved-role'
  
 shapes.append({'characterId':c,'sourceTagSha256':d['sourceTagSha256'],'tagName':d['tagName'],'role':role,'placements':rr,'buttonPlacements':[{'buttonId':b['characterId'],'states':p['states'],'matrix':p['matrix']}for b in x['buttonDefinitions'] for p in b['statePlacements'] if p['characterId']==c],'svgExport':{'path':str(p),'sha256':sha(p)} if p.exists() else None,'morph':d['tagName']=='Tag46'})
write('shape-role-disposition-v1.json',{'count':len(shapes),'ordinarySvgCount':sum(s['svgExport'] is not None for s in shapes),'morphCount':sum(s['morph']for s in shapes),'definitions':shapes,'visualInspection':['54 title outline and 109 mouse-arrow reviewed in raster contact sheet; fills in ImageMagick contact sheet are not color-authoritative.','SVG path/gradient source directly inspected for main geometry.'],'limits':['33 morph definitions are classified by containing feedback timeline, not rendered morph geometry.','Tag46 means DefineMorphShape; placement ratio alone does not establish morph usage.','Button 62/63 use shape61 as hit-only rectangle; do not render its blue fill in normal state.']})
write('source-visual-spec-v1.json',{'mainTimeline':'sprite-257','mainRootMatrix':[1,0,0,1,8248,5866],'introFrames':[1,484],'practiceFrame':485,'terminalFrame':503,'fractionTextIds':[67,69,70,71,72],'fractionValues':['1/10','1/5','1/4','3/4','7/8'],'decimalTextIds':[74,76,78,80,82,89,84,86,87],'demo':{'mouseArrowShape':109,'mouseArrowFrames':[333,481],'movingGroup':119,'groupChildren':[118,74],'backgroundShape118':'green gradient rectangular card, not pointer','instances':refs(119),'fractionBlinkText':106,'fractionBlinkBar':107,'fractionBlinkFrames':list(range(226,239,2)),'decimalBlinkText':108,'decimalBlinkFrames':list(range(284,297,2))},'terminal':{'retainedTargets':[121,122,123,124,125],'removedAt486':[127,129,131,133,135,137,139,141,143,177,189,217,228,248,250,252,256]},'bitmapDisposition':'See bitmap-reference-audit-v2.json; all 13 bitmaps belong to stopped decorative feedback 189/217 frame >=2.','unresolved':['Stopped frame-1 sound semantics for unselected audio timelines','Original-runtime dynamic visibility and feedback lookup not established'],'coverageCounts':{'teachingTextDefinitions':len(rows),'excludedTextDefinitions':len(excluded),'shapeDefinitions':len(shapes)}})
print(json.dumps({'teachingTexts':len(rows),'excludedTexts':len(excluded),'shapes':len(shapes),'ordinarySvg':sum(s['svgExport'] is not None for s in shapes)}))
