import React, {useCallback, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {P050AudioPlayerV1} from '../../../packages/demos/src/alg-l06-p050-audio-player-v1';
import type {P050RuntimeSnapshot} from '../../../packages/demos/src/alg-l06-p050-audio-runtime-v1';
import type {P050AudioDomain} from '../../../packages/demos/src/alg-l06-p050-measured-bindings-v1';
const load = async (id: P050AudioDomain, signal: AbortSignal) => {
  const response = await fetch('/audio/' + id, {signal});
  if (!response.ok) throw Error(`${id}: HTTP ${response.status}`);
  return response.arrayBuffer();
};
function App() {
  const [mounted, setMounted] = useState(true), [language, setLanguage] = useState<'en' | 'es'>('en');
  const observe = useCallback((snapshot: P050RuntimeSnapshot) => {(window as any).p050Snapshot = snapshot;}, []);
  const cleanup = useCallback(() => {(window as any).p050Cleanup = ((window as any).p050Cleanup ?? 0) + 1;}, []);
  const asset = (window as any).HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p050'];
  return <>
    <div><button id="locale" onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}>EN / ES</button>
      <button id="mount" onClick={() => setMounted(!mounted)}>{mounted ? 'Unmount' : 'Mount'} player fixture</button></div>
    {mounted && <P050AudioPlayerV1 asset={asset} load={load} language={language} onSnapshot={observe} onCleanup={cleanup} />}
  </>;
}
createRoot(document.getElementById('root')!).render(<App />);
