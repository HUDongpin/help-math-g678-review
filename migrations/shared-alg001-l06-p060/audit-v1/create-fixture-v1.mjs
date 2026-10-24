import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const X='/Volumes/American Dream/hudongpin/g678-p060-native-browser-20261003-v1';fs.mkdirSync(X,{recursive:true});
const entry=`import React,{useState} from ${JSON.stringify(R+'/node_modules/react/index.js')};
import {createRoot} from ${JSON.stringify(R+'/node_modules/react-dom/client.js')};
import {P060QuizPlayer} from ${JSON.stringify(R+'/packages/demos/src/alg-l06-p060-player-v1.tsx')};
import {P060QuestionContent,P060_CONTENT_CSS} from ${JSON.stringify(R+'/packages/demos/src/alg-l06-p060-content-v1.tsx')};
import {p060Question,p060Questions} from ${JSON.stringify(R+'/packages/demos/src/alg-l06-p060-source-v1.ts')};
import {p060Initial} from ${JSON.stringify(R+'/packages/demos/src/alg-l06-p060-state-v1.ts')};
window.contexts=[];const Base=window.AudioContext;window.AudioContext=class extends Base{constructor(...args){super(...args);window.contexts.push(this);}};
window.requests=[];window.completed=0;window.replays=0;window.seeds={};
for(let s=0;s<10000&&Object.keys(window.seeds).length<24;s++)window.seeds[p060Initial(s).selection[0]]=s;
window.questions=p060Questions;window.trace=[];
function App(){const[seed,setSeed]=useState(0),[language,setLanguage]=useState('en'),[paused,setPaused]=useState(false),[mounted,setMounted]=useState(true),[content,setContent]=useState(null);
window.setSeed=s=>{setContent(null);setMounted(true);setSeed(s);};window.setLocale=setLanguage;window.setPause=setPaused;window.unmountQuiz=()=>setMounted(false);window.remountQuiz=()=>setMounted(true);window.showContent=id=>{setMounted(false);setContent(id);};
return <><nav><button onClick={()=>setPaused(v=>!v)}>Host pause</button><button onClick={()=>window.controls?.replay()}>Host Replay</button><button onClick={()=>setMounted(v=>!v)}>Host leave / return</button></nav>
{content!==null?<article id="gallery"><style>{P060_CONTENT_CSS}</style><h2>Question {content}</h2><P060QuestionContent question={p060Question(content)}/><ol>{p060Question(content).options.map(o=><li key={o.letter}>{o.letter}. {o.value}</li>)}</ol></article>:mounted?<P060QuizPlayer key={seed} seed={seed} uiLanguage={language} paused={paused} volume={.7} audioEnabled={true}
readAudio={async(asset,signal)=>{window.requests.push({id:asset.id,at:performance.now()});const r=await fetch('/audio/'+asset.id,{signal});if(!r.ok)throw Error('fixture audio response');return r.arrayBuffer();}}
connectControls={controls=>{window.controls=controls;return()=>{window.controls=null;};}} onPaused={setPaused} onState={s=>{window.snap=s;window.trace.push({phase:s.quiz.phase,epoch:s.quiz.epoch,replay:s.quiz.replay,audio:s.audio.phase,id:s.audio.assetId});}}
onReplay={()=>window.replays++} onComplete={()=>window.completed++}/>:<p>Outside quiz</p>}</>};
createRoot(document.getElementById('root')).render(<App/>);`;
fs.writeFileSync(path.join(X,'entry.tsx'),entry);
await build({stdin:{contents:entry,sourcefile:'p060-fixture.tsx',resolveDir:R,loader:'tsx'},bundle:true,platform:'browser',format:'iife',outfile:path.join(X,'fixture.js'),jsx:'automatic',nodePaths:[path.join(R,'node_modules')],define:{'process.env.NODE_ENV':'"production"'}});
fs.writeFileSync(path.join(X,'index.html'),'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P060 local maintained candidate</title><style>html{font-size:20px}body{margin:0;font-family:system-ui;background:#eaf2f7}#root{max-width:54rem;padding:1rem;margin:auto;box-sizing:border-box}nav{display:flex;gap:8px;margin-bottom:1rem}nav button{min-height:44px}#gallery{background:white;padding:1rem;border-radius:1rem}#gallery ol{list-style:none;padding:0}#gallery li{padding:.5rem;border-top:1px solid #ddd}</style><main id="root"></main><script src="/fixture.js"></script>');
console.log(JSON.stringify({output:X,scriptBytes:fs.statSync(path.join(X,'fixture.js')).size}));
