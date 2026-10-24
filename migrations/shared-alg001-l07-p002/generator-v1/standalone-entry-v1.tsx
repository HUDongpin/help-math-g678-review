import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{AlgL07P002Player,type AlgL07P002Controls}from'../../../packages/demos/src/alg-l07-p002-player-v1';
const NativeContext=window.AudioContext;const diagnostics={contexts:0,closed:0,activeNodes:0,startedNodes:0};
window.AudioContext=class extends NativeContext{
 constructor(options?:AudioContextOptions){super(options);diagnostics.contexts++;const create=this.createBufferSource.bind(this);this.createBufferSource=()=>{const node=create();const start=node.start.bind(node),disconnect=node.disconnect.bind(node);let counted=false;node.start=(...args:Parameters<AudioBufferSourceNode['start']>)=>{if(!counted){counted=true;diagnostics.activeNodes++;diagnostics.startedNodes++;}start(...args);};node.disconnect=()=>{if(counted){counted=false;diagnostics.activeNodes--;}disconnect();};return node;};const close=this.close.bind(this);this.close=async()=>{await close();diagnostics.closed++;};}
};
let controls:AlgL07P002Controls|null=null,state:unknown=null;
Object.assign(window,{p002Harness:{get controls(){return controls;},get state(){return state;},diagnostics}});
function App(){const[locale,setLocale]=useState<'en'|'es'>('en'),[mounted,setMounted]=useState(true),[inspect,setInspect]=useState('900'),[paused,setPaused]=useState(true),[reduced,setReduced]=useState(false);
 return <main><div className="harness-tools"><label>Interface <select aria-label="Interface" value={locale} onChange={e=>setLocale(e.target.value as'en'|'es')}><option value="en">English</option><option value="es">Español</option></select></label>
 <label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/>Reduced motion</label>
 <button onClick={()=>setMounted(!mounted)}>{mounted?'Leave page':'Return page'}</button>
 <input aria-label="Inspect source frame" value={inspect} onChange={e=>setInspect(e.target.value)}/><button onClick={()=>controls?.inspectFrame(Number(inspect))}>Inspect frame</button></div>
 {mounted&&<AlgL07P002Player seed={0} uiLanguage={locale} reducedMotion={reduced} paused={paused} volume={.1}
 readAudio={async signal=>{const response=await fetch('/stream.mp3',{signal,cache:'no-store'});if(!response.ok)throw Error('SOURCE_AUDIO_UNAVAILABLE');return response.arrayBuffer();}}
 connectControls={c=>{controls=c;return()=>{if(controls===c)controls=null;};}} onState={s=>{state=s;}}
 onPaused={setPaused}/>}<div className="harness-tools"><button onClick={()=>{controls?.setPaused(false);setPaused(false);}}>{locale==='es'?'Reproducir':'Play'}</button>
 <button onClick={()=>{controls?.setPaused(true);setPaused(true);}}>{locale==='es'?'Pausa':'Pause'}</button>
 <button onClick={()=>controls?.replay()}>{locale==='es'?'Repetir':'Replay'}</button></div></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
