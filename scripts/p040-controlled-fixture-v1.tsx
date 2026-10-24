import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {P040Presentation} from '../packages/demos/src/nms-l02-p040-presentation-v1';
import {p040Initial,p040OpenTerm,p040CloseTerm,p040Replay} from '../packages/demos/src/nms-l02-p040-state-v1';
function App(){const [state,setState]=useState({...p040Initial(),frame:440}),[language,setLanguage]=useState<'en'|'es'>('en');return <><aside><label>Frame<input aria-label="Frame" type="number" min={1} max={440} value={state.frame} onChange={e=>setState({...p040Initial(),frame:Math.max(1,Math.min(440,Number(e.target.value)))})}/></label><select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value as 'en'|'es')}><option>en</option><option>es</option></select><button onClick={()=>setState(s=>p040Replay(s))}>Replay</button></aside><P040Presentation state={state} language={language} onTerm={term=>setState(s=>p040OpenTerm(s,term))} onCloseTerm={()=>setState(p040CloseTerm)}/></>}
createRoot(document.getElementById('root')!).render(<App/>);
