'use client';
import type {CSSProperties} from 'react';
import type {AnimationRendererProps} from './contract';
import {LessonAnimationTitleV1} from './lesson-animation-title-v1';
import {ALG_L07_P028_SOURCE as S} from './alg-l07-p028-state-v1';
import {algL07P028Frame,type P028View} from './alg-l07-p028-frame-v1';
import './alg-l07-p028-v1.css';

function position(x:number,y:number):CSSProperties{return{left:`${(x-S.graph.viewBox[0])/S.graph.viewBox[2]*100}%`,top:`${(y-S.graph.viewBox[1])/S.graph.viewBox[3]*100}%`};}
export function p028MorphPath(start:string,end:string|null,ratio:number){
 if(!end)return start;
 const values=end.match(/[-+]?\d+(?:\.\d+)?/g)!.map(Number);let i=0;
 return start.replace(/[-+]?\d+(?:\.\d+)?/g,n=>String(Number(n)+(values[i++]-Number(n))*ratio/65535));
}
function morphColor(start:string,end:string|undefined,ratio:number){
 if(!end)return start;
 return '#'+[1,3,5].map(i=>Math.round(parseInt(start.slice(i,i+2),16)+(parseInt(end.slice(i,i+2),16)-parseInt(start.slice(i,i+2),16))*ratio/65535).toString(16).padStart(2,'0')).join('');
}
function Graph({view}:{view:P028View}){
 const v=view.visual;if(v.graphAlpha===0)return null;
 return <div className="alg-l07-p028__graph-scroll" tabIndex={0} role="region" aria-label="Graph of y = 3x minus 5" data-p028-graph-scroll="true"><div className="alg-l07-p028__graph" data-p028-graph="true">
  <svg viewBox={S.graph.viewBox.join(' ')} aria-hidden="true" focusable="false">{v.graph.map(g=><g key={g.depth} data-source-shape={g.sourceShapeId} data-source-depth={g.depth} data-source-ratio={g.ratio} opacity={g.alpha} transform={`matrix(${g.matrix.join(' ')})`}>{S.graph.paths.find(p=>p.sourceShapeId===g.sourceShapeId)!.paths.map(p=>{const a=p.attributes;return <path key={p.sourcePathIndex} d={p028MorphPath(a.d,p.endPath,g.ratio)} fill={a.fill} fillRule={a['fill-rule'] as 'evenodd'|'nonzero'|undefined} stroke={morphColor(a.stroke,p.endAttributes.stroke,g.ratio)} strokeWidth={a.stroke!=='none'?Math.max(.6,Number(a['stroke-width']??0)):undefined} strokeLinecap={a['stroke-linecap'] as 'butt'|'round'|'square'|undefined} strokeLinejoin={a['stroke-linejoin'] as 'miter'|'round'|'bevel'|undefined}/>;})}</g>)}</svg>
  {S.graph.labels.map(g=>{const cyan=g.sourceDepth===6&&v.firstXEmphasis||g.sourceDepth===22&&v.firstYEmphasis,magenta=g.sourceDepth===32&&v.secondXEmphasis||g.sourceDepth===28&&v.secondYEmphasis;return <span key={g.sourceDepth} className={`alg-l07-p028__graph-label${cyan?' alg-l07-p028__cyan':magenta?' alg-l07-p028__magenta':''}`} data-lesson-text-block={`graph-label-${g.sourceDepth}`} data-source-text-id={g.sourceTextId} style={{...position(g.x,g.y),opacity:v.graphAlpha}}>{g.text}</span>;})}
  {v.annotations.filter(a=>a.alpha>0).map(a=><span key={a.sourceCharacterId} className="alg-l07-p028__annotation" data-lesson-text-block={`text-${a.sourceCharacterId}`} data-source-text-id={a.sourceTextId} style={{...position(a.x,a.y),opacity:a.alpha}}>{a.text}</span>)}
 </div></div>;
}
function EquationLine({text,emphasis,token}:{text:string;emphasis?:string;token?:string}){
 if(!emphasis||!token)return <>{text}</>;
 const i=text.indexOf(token);return <>{text.slice(0,i)}<span className="alg-l07-p028__equation-emphasis" data-lesson-text-block={emphasis}>{token}</span>{text.slice(i+token.length)}</>;
}
export function AlgL07P028Presentation({view}:{view:P028View}){
 if(!view.ready)return <section data-animation-id={S.animationId} data-flash-frame={view.frame} data-flash-frame-domain={view.frameDomain} aria-busy="true"/>;
 const v=view.visual;
 return <section className="alg-l07-p028 lesson-text-presentation" data-animation-id={S.animationId} data-flash-animation-id={S.animationId} data-flash-frame={view.frame} data-flash-frame-domain={view.frameDomain} data-flash-root-frame={view.rootFrame} data-flash-scenario={view.scenario} data-flash-language={view.language} data-flash-seed={view.seed} data-flash-replay={view.replay} data-flash-trace-id={view.traceId} data-flash-requirement-id={view.requirementId} data-flash-entry-state-sha256={view.entryStateSha256} data-source-text-ids={view.sourceTextIds.join(',')} data-source-swf-sha256={S.sourceSha256} data-main-content-language="en" data-source-english-fallback={view.language==='es'} lang="en">
  <LessonAnimationTitleV1 courseTitle="Linear and Nonlinear Functions:" activityTitle="Instruction" language="en"/>
  <div className="alg-l07-p028__problem"><Graph view={view}/><div className="alg-l07-p028__calculations">
   <div className="alg-l07-p028__calculation">
    {v.equationAlpha>0&&<p data-lesson-text-block="text-19" style={{opacity:v.equationAlpha}}>{S.equation}</p>}
    {v.firstCalculationAlpha>0&&<div data-lesson-text-block="text-20" style={{opacity:v.firstCalculationAlpha}}>{S.firstCalculation.map((text,i)=><p key={i}><EquationLine text={text} emphasis={i===0&&v.firstXEmphasis?'first-x-emphasis':i===2&&v.firstYEmphasis?'first-y-emphasis':undefined} token={i===0?'2':i===2?'1':undefined}/>{i<S.firstCalculation.length-1?'\n':null}</p>)}</div>}
   </div>
   {v.secondCalculationAlpha>0&&<div className="alg-l07-p028__calculation" data-lesson-text-block="text-33" style={{opacity:v.secondCalculationAlpha}}>{S.secondCalculation.map((text,i)=><p key={i}><EquationLine text={text} emphasis={i===1&&v.secondXEmphasis?'second-x-emphasis':i===3&&v.secondYEmphasis?'second-y-emphasis':undefined} token={i===1?'0':i===3?'–5':undefined}/>{i<S.secondCalculation.length-1?'\n':null}</p>)}</div>}
  </div></div>
 </section>;
}
export function AlgL07P028Renderer(props:AnimationRendererProps){return <AlgL07P028Presentation view={algL07P028Frame(props.frame,{...props,frame:props.frame})}/>;}
