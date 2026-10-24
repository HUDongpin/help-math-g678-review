import {ALG_L07_P028_SOURCE as S} from './alg-l07-p028-source-v1';
export {ALG_L07_P028_SOURCE} from './alg-l07-p028-source-v1';
export interface P028State {mainFrame:number;cycle:number;replay:number;glossary:null;}
export const p028InitialState=():P028State=>({mainFrame:1,cycle:0,replay:0,glossary:null});
export const p028Visual=(frame:number)=>{
 if(!Number.isSafeInteger(frame)||frame<1||frame>S.mainFrameCount)throw Error('invalid-p028-source-frame');
 return S.visualStates.find(s=>frame>=s.first&&frame<=s.last)!.value;
};
