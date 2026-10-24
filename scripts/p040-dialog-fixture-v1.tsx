import React,{useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {NmsL2P040TermDialog} from '../packages/demos/src/nms-l02-p040-term-dialog-v1';
import {P040_SOURCE} from '../packages/demos/src/generated/nms-l02-p040-presentation-v1';
function App(){const [id,setId]=useState<string|null>(null),[language,setLanguage]=useState<'en'|'es'>('en'),trigger=useRef<HTMLElement|null>(null);const term=P040_SOURCE.terms.find(t=>t.id===id);return <main><select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value as 'en'|'es')}><option>en</option><option>es</option></select>{P040_SOURCE.terms.map(t=><button key={t.id} onClick={e=>{trigger.current=e.currentTarget;setId(t.id)}}>{t.labels[language]}</button>)}{term&&<NmsL2P040TermDialog term={term} language={language} trigger={trigger.current} onClose={()=>setId(null)}/>}</main>}
createRoot(document.getElementById('root')!).render(<App/>);
