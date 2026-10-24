import React,{useState,useRef,useEffect}from'react';import{createRoot}from'react-dom/client';
import{NmsL2P046Player,type P046PlayerControls}from'../packages/demos/src/nms-l02-p046-player-v1';
import type{P046AudioDomain}from'../packages/demos/src/nms-l02-p046-audio-pcm-v1';
async function read(domain:P046AudioDomain,signal:AbortSignal){const r=await fetch('/'+domain+'.mp3',{signal});return r.arrayBuffer();}
const OriginalAudioContext=window.AudioContext;
const stats={contexts:0,closed:0,starts:[] as {offset:number;duration:number;sampleRate:number;length:number}[],stops:0};
Object.assign(window,{p046AudioStats:stats});
class TrackedAudioContext extends OriginalAudioContext {
 constructor(options?:AudioContextOptions){super(options);stats.contexts++;}
 createBufferSource(){const node=super.createBufferSource(),start=node.start.bind(node),stop=node.stop.bind(node);
 node.start=(when=0,offset=0,duration?:number)=>{stats.starts.push({offset,duration:duration??0,sampleRate:node.buffer?.sampleRate??0,length:node.buffer?.length??0});if(duration===undefined)start(when,offset);else start(when,offset,duration);};
 node.stop=(when=0)=>{stats.stops++;stop(when);};return node;}
 async close(){stats.closed++;await super.close();}
}
window.AudioContext=TrackedAudioContext;
function App(){const[reducedMotion,setReducedMotion]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReducedMotion(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change)},[]);const[mounted,setMounted]=useState(true),[paused,setPaused]=useState(true),[complete,setComplete]=useState(0);const controls=useRef<P046PlayerControls|null>(null);return <><aside><button onClick={()=>controls.current?.setPaused(false)}>Play</button><button onClick={()=>controls.current?.setPaused(true)}>Pause</button><button onClick={()=>controls.current?.replay()}>Replay</button><button onClick={()=>setMounted(false)}>Unmount</button><output data-completed={complete}>{complete}</output></aside>{mounted&&<NmsL2P046Player reducedMotion={reducedMotion} seed={Number(new URLSearchParams(location.search).get("seed")??0)} uiLanguage={new URLSearchParams(location.search).get("lang")==="es"?"es":"en"} paused={paused} volume={0} readAudio={read} connectControls={c=>{controls.current=c;return()=>{controls.current=null}}} onPaused={setPaused} onComplete={()=>setComplete(n=>n+1)}/>}</>}
createRoot(document.getElementById('root')!).render(<App/>);
