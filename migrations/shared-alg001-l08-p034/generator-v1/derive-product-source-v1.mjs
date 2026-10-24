import fs from'node:fs';import assert from'node:assert/strict';
const M='migrations/shared-alg001-l08-p034',O='output/g678-alg-l08-p034-integration-20261007-v1',s=JSON.parse(fs.readFileSync(M+'/native-v1/product-model-v1.json','utf8'));
const types=`// Generated from the frozen P034 source model. Change the maintained generator, never this file.
import type {L8P034SourceV1,L8P034Branch} from './alg-l08-p034-state-v1';
export type P034ColorTransform={multiply:readonly number[];add:readonly number[];divisor:number};
export type P034TextDefinition={sourceTextId:string;sourceCharacterId:number;textMatrix:readonly number[];text:string;runs:readonly{text:string;colorRgba:readonly number[];fontHeightTwips:number;y:number;glyphs:readonly{glyphId:string;text:string;x:number;advanceTwips:number}[]}[]};
export type P034NativeText={kind:'text';sourceTextId:string;sourceCharacterId:number;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P034ColorTransform};
export type P034Vector={kind:'vector';sourceShapeId:number;sourceCharacterId:number;shapeKey:string;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P034ColorTransform;ratio:number;clipDepth:number|null};
export type P034Node=P034NativeText|P034Vector;
export type P034Visual={terms:readonly string[];nodes:readonly P034Node[]};
export interface P034Source extends L8P034SourceV1 {
 readonly title:string;readonly nativeBrowserDecoded:boolean;readonly coachVisual:P034Visual;readonly textDefinitions:readonly P034TextDefinition[];
 readonly feedbackVisuals:readonly{spriteId:number;mainPlacement:readonly number[];states:readonly{first:number;last:number;value:P034Visual}[]}[];
 readonly branches:readonly(L8P034Branch&{readonly title:string;readonly titleIds:readonly number[];readonly titleAlpha:readonly{first:number;last:number;value:number}[];readonly popupAlpha:readonly{first:number;last:number;value:number}[];readonly[key:string]:unknown})[];
 readonly behavior:L8P034SourceV1['behavior']&{readonly[key:string]:unknown};readonly clocks:readonly(L8P034SourceV1['clocks'][number]&{readonly[key:string]:unknown})[];
 readonly visualStates:readonly{first:number;last:number;value:P034Visual}[];
 readonly terms:readonly{id:string;sourceKeyAttribute:string;labels:{en:string;es:string};definitions:{en:string;es:string};sourceEntrySha256:{en:string;es:string};[key:string]:unknown}[];
 readonly diagram:{viewBox:readonly number[];coachViewBox:readonly number[];shapes:readonly{key:string;sourceShapeId:number;morph:boolean;ratio:number;paths:readonly Record<string,string>[];gradients:readonly{kind:string;attributes:Record<string,string>;stops:readonly Record<string,string>[]}[];patterns:readonly{attributes:Record<string,string>;images:readonly{attributes:Record<string,string>;href:string}[]}[];[key:string]:unknown}[];glyphs:readonly{id:string;fontId:number;glyphIndex:number;d:string}[];[key:string]:unknown};
 readonly answers:readonly{answer:1|2|3|4;letter:string;equation:string;buttonId:number}[];[key:string]:unknown
}
`;
const out=types+'export const ALG_L08_P034_SOURCE:P034Source = '+JSON.stringify(s)+';\n',p=O+'/draft-source/alg-l08-p034-source-v1.ts';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);else fs.writeFileSync(p,out);console.log(JSON.stringify({generated:p,bytes:Buffer.byteLength(out),check:process.argv.includes('--check')}));
