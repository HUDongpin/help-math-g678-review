import {P039SourceAudio}from'../packages/demos/src/nms-l02-p039-audio-v1';
const status=document.getElementById('status')!,events:unknown[]=[];
const audio=new P039SourceAudio({seed:3,read:async(domain,signal)=>{const response=await fetch('./audio/'+domain+'.mp3',{signal});if(!response.ok)throw Error('fixture read');return response.arrayBuffer();},changed:s=>status.textContent=JSON.stringify(s),createContext:()=>{
 const context=new AudioContext({sampleRate:22050}),create=context.createBufferSource.bind(context);
 context.createBufferSource=()=>{const node=create(),start=node.start.bind(node),stop=node.stop.bind(node);node.start=(when=0,offset=0,duration?:number)=>{events.push({event:'start',at:context.currentTime,length:node.buffer?.length,offset,duration});start(when,offset,duration);};node.stop=(when=0)=>{events.push({event:'stop',at:context.currentTime,length:node.buffer?.length});stop(when);};return node;};return context;
}});
audio.setVolume(0);
const actions:{[name:string]:()=>unknown}={Play:()=>audio.play(),Pause:()=>audio.pause(),Wrong:()=>audio.submit(),Close:()=>audio.closeWrong(),Correct:()=>{audio.setPercent(25);audio.submit();},Replay:()=>audio.replay(),Dispose:()=>audio.close()};
for(const[name,action]of Object.entries(actions)){const button=document.createElement('button');button.textContent=name;button.onclick=()=>void action();document.getElementById('controls')!.append(button);}
const timer=setInterval(()=>{status.textContent=JSON.stringify(audio.snapshot());document.getElementById('events')!.textContent=JSON.stringify(events);},50);
window.addEventListener('pagehide',()=>{clearInterval(timer);void audio.close();});
