import * as React from 'react';import{createRoot}from'react-dom/client';
import{P039Exercise}from'../packages/demos/src/nms-l02-p039-exercise-v1';
import{p039Initial,p039Advance,p039SetPercent,p039Submit,p039Reset,p039CloseWrong,p039Replay}from'../packages/demos/src/nms-l02-p039-state-v1';
function Fixture(){const [state,set]=React.useState(()=>p039Advance(p039Initial(),545)),[lang,setLang]=React.useState<'en'|'es'>('en');const [presses,recordPress]=React.useState<boolean[]>([]);const press=React.useCallback((value:boolean)=>recordPress(s=>[...s,value]),[]);
 return <><nav aria-label="Engineering fixture"><button onClick={()=>set(s=>p039Advance(s,600))}>Advance 600 frames</button><button onClick={()=>set(s=>p039Replay(s))}>Replay</button><button onClick={()=>setLang(s=>s==='en'?'es':'en')}>EN / ES</button><output id="state">{JSON.stringify({frame:state.mainFrame,percent:state.percent,tries:state.tries,enabled:state.enabled,popup:state.popupVisible,reveal:state.correctedReveal,presses})}</output></nav><P039Exercise state={state} uiLanguage={lang} onPercent={n=>set(s=>p039SetPercent(s,n))} onSubmit={()=>set(p039Submit)} onReset={()=>set(p039Reset)} onClose={()=>set(p039CloseWrong)} onClosePress={press}/></>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
