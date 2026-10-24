from pathlib import Path
import json,hashlib,sys
B=Path(__file__).resolve().parents[1];R=B.parents[1]
read=lambda p:json.loads(p.read_text());m=read(B/'native-v1/source-model-v1.json');dec=read(B/'native-v1/decode-native-v1.json');streams=read(B/'native-v1/streams-v1.json');g=read(B/'native-v1/glossary-model-v1.json')
assert hashlib.sha256(Path(m['source']['path']).read_bytes()).hexdigest()==m['source']['sha256'];assert dec['pass']and len(dec['streams'])==12
clocks=[];sa=None
for d in dec['streams']:
 assert d['contextClosed'];binding={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=binding;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256']and s['decodedSamplesCandidate']==d['decodedSamples']
 if d['spriteId']not in m['findings']['activeSourceStreams']:continue
 clocks.append(dict(spriteId=d['spriteId'],decoder=binding,segments=s['segments'],emptyNegativeBlocks=[{k:x[k]for k in ['frame','samples','seek','mp3Bytes']}for x in s['blocks']if x['samples']==0 and x['seek']<0]))
assert len(clocks)==8 and sa['sourceSha256']==m['spanishAudio']['sha256']
terms=[]
for e in g['entries']:
 keys=sorted({b['sourceActionKey']for b in g['caseBindings']if b['dictionaryKey']==e['sourceKeyAttribute']})
 for key in keys:terms.append(dict(**e,sourceActionKey=key))
assert set(t['sourceActionKey']for t in terms)==set(t['term']for t in m['glossary'])
branches=[dict(**b,kind=kind)for kind in ['wrong','right']for b in m['feedback'][kind]]
points=[dict(name=p['name'],characterId=p['characterId'],x=p['matrix'][4],y=p['matrix'][5],slot=p['slot'])for p in m['points']]
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],mainSpriteId=288,mainFrameCount=641,quizFrame=318,postQuizFrame=319,fps=12,branches=branches,points=points,messages=m['messages'],terms=terms,clocks=clocks,sa=sa)
types="""// Generated from audited source data; edit the generator, never this output.
import type {DecodedSourceStreamBinding} from './decoded-source-stream-transport';
import type {SourceStreamRunsClockPlan} from './source-stream-runs-clock-v1';
export type P046FeedbackId=143|158|173|213|230|244|264;
export type P046PointName='PT_1'|'PT_2'|'PT_3'|'PT_4'|'PT_5';
export type P046SourceTerm="""+'|'.join(repr(t['sourceActionKey'])for t in terms)+""";
export type P046Branch={readonly spriteId:P046FeedbackId;readonly index:number;readonly terminal:number}&({readonly kind:'right'}|{readonly kind:'wrong';readonly hold:number;readonly closeFirst:number;readonly closeJump:number;readonly child:number;readonly close:number});
export interface P046Model {
 readonly animationId:string;readonly sourceSha256:string;readonly mainSpriteId:288;readonly mainFrameCount:641;readonly quizFrame:318;readonly postQuizFrame:319;readonly fps:12;
 readonly branches:readonly P046Branch[];
 readonly points:readonly {readonly name:P046PointName;readonly characterId:number;readonly x:number;readonly y:number;readonly slot:'Y'|'C'}[];
 readonly messages:readonly string[];
 readonly terms:readonly {readonly id:string;readonly sourceActionKey:P046SourceTerm;readonly labels:{readonly en:string;readonly es:string};readonly definitions:{readonly en:string;readonly es:string}}[];
 readonly clocks:readonly (Pick<SourceStreamRunsClockPlan,'decoder'|'segments'|'emptyNegativeBlocks'>&{readonly spriteId:P046FeedbackId|288})[];
 readonly sa:DecodedSourceStreamBinding;
}
"""
# Data retains dictionary provenance beyond the public interface via an intermediate.
body=types+'const source = '+json.dumps(result,separators=(',',':'),ensure_ascii=False)+' as const;\nexport const ALG_L07_P046_SOURCE:P046Model=source;\n'
p=R/'packages/demos/src/alg-l07-p046-source-v1.ts'
if p.exists()or'--check'in sys.argv:assert p.read_text()==body
else:p.open('x').write(body)
print(json.dumps(dict(pass_=True,clocks=8,branches=len(branches),points=len(points),terms=len(terms),bytes=len(body.encode()))))
