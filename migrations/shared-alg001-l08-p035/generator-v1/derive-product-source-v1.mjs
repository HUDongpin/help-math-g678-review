import fs from'node:fs';import assert from'node:assert/strict';
const M='migrations/shared-alg001-l08-p035',O='output/g678-alg-l08-p035-integration-20261007-v1',s=JSON.parse(fs.readFileSync(M+'/native-v1/product-model-v1.json','utf8'));
const types=`// Generated from the frozen P035 source model. Change the maintained generator, never this file.
import type {L8P035SourceV1,L8P035Branch} from './alg-l08-p035-state-v1';
export type P035ColorTransform={multiply:readonly number[];add:readonly number[];divisor:number};
export type P035TextDefinition={sourceTextId:string;sourceCharacterId:number;textMatrix:readonly number[];text:string;runs:readonly{text:string;colorRgba:readonly number[];fontHeightTwips:number;y:number;glyphs:readonly{glyphId:string;text:string;x:number;advanceTwips:number}[]}[]};
export type P035NativeText={kind:'text';sourceTextId:string;sourceCharacterId:number;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P035ColorTransform};
export type P035Vector={kind:'vector';sourceShapeId:number;sourceCharacterId:number;shapeKey:string;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P035ColorTransform;ratio:number;clipDepth:number|null};
export type P035Node=P035NativeText|P035Vector;
export type P035Visual={terms:readonly string[];nodes:readonly P035Node[]};
export interface P035Source extends L8P035SourceV1 {
 readonly sourceTermKeys:Readonly<Record<string,string>>;readonly title:string;readonly nativeBrowserDecoded:boolean;readonly coachVisual:P035Visual;readonly textDefinitions:readonly P035TextDefinition[];
 readonly feedbackVisuals:readonly{spriteId:number;mainPlacement:readonly number[];states:readonly{first:number;last:number;value:P035Visual}[]}[];
 readonly branches:readonly(L8P035Branch&{readonly title:string;readonly titleIds:readonly number[];readonly titleAlpha:readonly{first:number;last:number;value:number}[];readonly popupAlpha:readonly{first:number;last:number;value:number}[];readonly[key:string]:unknown})[];
 readonly behavior:L8P035SourceV1['behavior']&{readonly[key:string]:unknown};readonly clocks:readonly(L8P035SourceV1['clocks'][number]&{readonly[key:string]:unknown})[];
 readonly visualStates:readonly{first:number;last:number;value:P035Visual}[];
 readonly terms:readonly{id:string;sourceKeyAttribute:string;labels:{en:string;es:string};definitions:{en:string;es:string};sourceEntrySha256:{en:string;es:string};[key:string]:unknown}[];
 readonly diagram:{viewBox:readonly number[];coachViewBox:readonly number[];shapes:readonly{key:string;sourceShapeId:number;morph:boolean;ratio:number;paths:readonly Record<string,string>[];gradients:readonly{kind:string;attributes:Record<string,string>;stops:readonly Record<string,string>[]}[];patterns:readonly{attributes:Record<string,string>;images:readonly{attributes:Record<string,string>;href:string}[]}[];[key:string]:unknown}[];glyphs:readonly{id:string;fontId:number;glyphIndex:number;d:string}[];[key:string]:unknown};
 readonly answers:readonly{answer:1|2|3|4;letter:string;equation:string;buttonId:number}[];[key:string]:unknown
}
`;
const out=types+'export const ALG_L08_P035_SOURCE:P035Source = '+JSON.stringify(s)+';\n',p=O+'/draft-source/alg-l08-p035-source-v1.ts';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);else fs.writeFileSync(p,out);console.log(JSON.stringify({generated:p,bytes:Buffer.byteLength(out),check:process.argv.includes('--check')}));
