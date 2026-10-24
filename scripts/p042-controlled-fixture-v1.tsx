import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { P042Presentation } from '../packages/demos/src/nms-l02-p042-presentation-v1';
import { replayP042Practice, setP042Percentage } from '../packages/demos/src/nms-l02-p042-practice-v1';
function App() {
  const [frame, setFrame] = useState(625);
  const [values, setValues] = useState(replayP042Practice);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  return <><aside style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
    <label>Frame<input aria-label="Frame" type="number" min={1} max={625} value={frame} onChange={e => setFrame(Number(e.target.value))} /></label>
    <select aria-label="Language" value={language} onChange={e => setLanguage(e.target.value as 'en' | 'es')}><option>en</option><option>es</option></select>
    <button onClick={() => { setValues(replayP042Practice()); setFrame(1); }}>Replay</button>
  </aside><P042Presentation frame={frame} percentages={values} language={language} onAdjust={(handle, percentage) => setValues(v => setP042Percentage(v, handle, percentage))} /></>;
}
createRoot(document.getElementById('root')!).render(<App />);
