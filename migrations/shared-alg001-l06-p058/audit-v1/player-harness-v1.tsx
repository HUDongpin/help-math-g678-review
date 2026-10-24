import React,{useCallback,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {P058PlayerV1} from '../../../packages/demos/src/alg-l06-p058-player-v1';
import type {P058PageRuntimeV1} from '../../../packages/demos/src/alg-l06-p058-audio-runtime-v1';
import type {P058AudioDomain} from '../../../packages/demos/src/alg-l06-p058-measured-bindings-v1';
import glossary from '../native-v1/three-term-crosswalk-v1.json';
const load=async(id:P058AudioDomain,signal:AbortSignal)=>{const r=await fetch('/audio/'+id,{signal});if(!r.ok)throw Error('audio HTTP '+r.status);return r.arrayBuffer();};
function App(){
 const [mounted,setMounted]=useState(true),[language,setLanguage]=useState<'en'|'es'>('en'),[seed,setSeed]=useState(0);
 const [term,setTerm]=useState<string|null>(null),trigger=useRef<HTMLButtonElement|null>(null);
 const observe=useCallback((s:unknown)=>{(window as any).p058Snapshot=s;},[]);
 const connect=useCallback((r:P058PageRuntimeV1|null)=>{(window as any).p058Runtime=r;},[]);
 const cleanup=useCallback(()=>{(window as any).p058Cleanup=((window as any).p058Cleanup??0)+1;},[]);
 const entry=glossary.entries.find(r=>r.sourceKeyAttribute===term);
 return <><header style={{padding:'.75em',borderBottom:'1px solid #aaa',fontSize:'1rem'}}>
  <p>Local P058 engineering fixture</p><button id="locale" onClick={()=>setLanguage(language==='en'?'es':'en')}>EN / ES</button>
  <button id="mount" onClick={()=>{setMounted(!mounted);setTerm(null);}}>{mounted?'Unmount':'Mount'} fixture</button>
  <label>Seed <select id="seed" value={seed} onChange={e=>setSeed(Number(e.target.value))}>{[0,1,2,3].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
 </header>{mounted&&<P058PlayerV1 asset={(window as any).HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p058']} load={load} language={language} seed={seed}
  onSnapshot={observe} connectRuntime={connect} onCleanup={cleanup} onGlossary={(key,button)=>{trigger.current=button;setTerm(key);}}/>}
 {entry&&<div role="dialog" aria-label={entry.labels[language]} style={{position:'fixed',inset:'15% 5% auto',padding:'1em',background:'white',border:'2px solid #203a60',boxShadow:'0 5px 30px #666'}}>
  <h2>{entry.labels[language]}</h2><p>{entry.definitions[language]}</p><button id="glossary-close" onClick={()=>{setTerm(null);(window as any).p058Runtime?.closeGlossary();requestAnimationFrame(()=>trigger.current?.focus());}}>{language==='en'?'Close':'Cerrar'}</button>
 </div>}</>;
}
createRoot(document.getElementById('root')!).render(<App/>);
