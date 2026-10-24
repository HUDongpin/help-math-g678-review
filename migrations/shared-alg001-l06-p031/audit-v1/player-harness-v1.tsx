import React, {useCallback, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {P031AudioPlayerV1} from '../../../packages/demos/src/alg-l06-p031-audio-player-v1';
import type {P031AudioRuntimeV1} from '../../../packages/demos/src/alg-l06-p031-audio-runtime-v1';
import glossary from '../native-v1/three-term-crosswalk-v1.json';

const load = async (id: 'main' | 'sa', signal: AbortSignal) => {
  const response = await fetch('/audio/' + id, {signal});
  if (!response.ok) throw Error('audio HTTP ' + response.status);
  return response.arrayBuffer();
};
function App() {
  const [mounted, setMounted] = useState(true), [language, setLanguage] = useState<'en' | 'es'>('en');
  const [term, setTerm] = useState<string | null>(null), [answer, setAnswer] = useState<unknown>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const observe = useCallback((snapshot: unknown) => {(window as any).p031Snapshot = snapshot;}, []);
  const connect = useCallback((runtime: P031AudioRuntimeV1 | null) => {(window as any).p031Runtime = runtime;}, []);
  const cleanup = useCallback(() => {(window as any).p031Cleanup = ((window as any).p031Cleanup ?? 0) + 1;}, []);
  const entry = glossary.entries.find(row => row.sourceKeyAttribute === term);
  const asset = (window as any).HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p031'];
  return <>
    <header style={{padding: '.75em', borderBottom: '1px solid #aaa'}}>
      <p>Local engineering fixture — host feedback binding remains unresolved.</p>
      <button id="locale" onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}>EN / ES</button>
      <button id="mount" onClick={() => {setMounted(!mounted); setTerm(null); setAnswer(null);}}>{mounted ? 'Unmount' : 'Mount'} fixture</button>
    </header>
    {mounted && <P031AudioPlayerV1 asset={asset} load={load} language={language} onSnapshot={observe}
      connectRuntime={connect} onCleanup={cleanup} onUnresolvedAnswer={setAnswer}
      onGlossary={(key, button) => {trigger.current = button; setTerm(key);}} />}
    {entry && <div role="dialog" aria-label={entry.labels[language]} style={{position: 'fixed', inset: '15% 5% auto',
      padding: '1em', background: 'white', border: '2px solid #203a60', boxShadow: '0 5px 30px #666'}}>
      <h2>{entry.labels[language]}</h2><p>{entry.definitions[language]}</p>
      <button id="glossary-close" onClick={() => {setTerm(null); trigger.current?.focus();}}>{language === 'en' ? 'Close' : 'Cerrar'}</button>
    </div>}
    {answer !== null && <pre id="unresolved-answer" style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(answer, null, 2)}</pre>}
  </>;
}
createRoot(document.getElementById('root')!).render(<App />);
