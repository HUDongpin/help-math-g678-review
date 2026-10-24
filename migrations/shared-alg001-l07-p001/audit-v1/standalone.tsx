import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AlgL07P001Player} from '../../../packages/demos/src/alg-l07-p001-player-v1';
const w=window as any;w.contexts=[];w.reads=0;
const Native=window.AudioContext;window.AudioContext=class extends Native{constructor(options?:AudioContextOptions){super(options);w.contexts.push(this);}};
const root=createRoot(document.getElementById('app')!);
function App(){
 const [language,setLanguage]=useState<'en'|'es'>('en'),[mounted,setMounted]=useState(true),[reduced,setReduced]=useState(false),[volume,setVolume]=useState(.8);
 return <main style={{maxWidth:'900px',margin:'auto',fontFamily:'"HELP Math Nunito Sans",sans-serif'}}>
  <div style={{display:'flex',gap:12,flexWrap:'wrap',padding:12}}>
   <label>Interface<select value={language} onChange={e=>setLanguage(e.target.value as 'en'|'es')}><option>en</option><option>es</option></select></label>
   <button onClick={()=>setReduced(v=>!v)}>Motion</button><button onClick={()=>setVolume(v=>v?0:.8)}>Volume</button><button onClick={()=>setMounted(v=>!v)}>Mount</button>
  </div>
  {mounted&&<AlgL07P001Player seed={0} uiLanguage={language} reducedMotion={reduced} volume={volume}
    readAudio={async signal=>{w.reads++;const r=await fetch('/stream.mp3',{signal});if(!r.ok)throw Error('audio unavailable');return r.arrayBuffer();}}
    onState={s=>{w.snap=s;}}/>}
 </main>;
}
root.render(<App/>);
