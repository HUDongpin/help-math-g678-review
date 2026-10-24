import fs from'node:fs';import assert from'node:assert/strict';
const M='migrations/shared-alg001-l08-p037',O='output/g678-alg-l08-p037-integration-20261007-v1',s=JSON.parse(fs.readFileSync(M+'/native-v1/product-model-v1.json','utf8'));
const types=`// Generated from the frozen P037 source model. Change the maintained generator, never this file.
import type {L8P037SourceV1,L8P037Branch} from './alg-l08-p037-state-v1';
export type P037ColorTransform={multiply:readonly number[];add:readonly number[];divisor:number};
export type P037TextDefinition={sourceTextId:string;sourceCharacterId:number;textMatrix:readonly number[];text:string;runs:readonly{text:string;colorRgba:readonly number[];fontHeightTwips:number;y:number;glyphs:readonly{glyphId:string;text:string;x:number;advanceTwips:number}[]}[]};
export type P037NativeText={kind:'text';sourceTextId:string;sourceCharacterId:number;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P037ColorTransform};
export type P037Vector={kind:'vector';sourceShapeId:number;sourceCharacterId:number;shapeKey:string;instanceId:string;depth:number;matrix:readonly number[];alpha:number;colorTransform:P037ColorTransform;ratio:number;clipDepth:number|null};
export type P037Node=P037NativeText|P037Vector;
export type P037Visual={terms:readonly string[];nodes:readonly P037Node[]};
export type P037Hotspot={instanceId:string;term:string;sourceButtonId:number;depth:number;timelineId:string;matrix:readonly number[];structuralPlacementFrameRanges:readonly(readonly number[])[];hostCall:'DoHyperLinks';bareQExpression:boolean;explicitMainStop:boolean;actionScript:{path:string;bytes:number;sha256:string};pcode:{path:string;bytes:number;sha256:string}};
export interface P037Source extends L8P037SourceV1 {
 readonly coachHotspots:readonly P037Hotspot[];readonly mainHotspots:readonly P037Hotspot[];readonly sourceTermKeys:Readonly<Record<string,string>>;readonly title:string;readonly nativeBrowserDecoded:boolean;readonly coachVisual:P037Visual;readonly textDefinitions:readonly P037TextDefinition[];
 readonly feedbackVisuals:readonly{spriteId:number;mainPlacement:readonly number[];states:readonly{first:number;last:number;value:P037Visual}[]}[];
 readonly branches:readonly(L8P037Branch&{readonly title:string;readonly titleIds:readonly number[];readonly titleAlpha:readonly{first:number;last:number;value:number}[];readonly popupAlpha:readonly{first:number;last:number;value:number}[];readonly[key:string]:unknown})[];
 readonly behavior:L8P037SourceV1['behavior']&{readonly[key:string]:unknown};readonly clocks:readonly(L8P037SourceV1['clocks'][number]&{readonly[key:string]:unknown})[];
 readonly visualStates:readonly{first:number;last:number;value:P037Visual}[];
 readonly terms:readonly{id:string;sourceKeyAttribute:string;labels:{en:string;es:string};definitions:{en:string;es:string};sourceEntrySha256:{en:string;es:string};[key:string]:unknown}[];
 readonly diagram:{viewBox:readonly number[];coachViewBox:readonly number[];shapes:readonly{key:string;sourceShapeId:number;morph:boolean;ratio:number;paths:readonly Record<string,string>[];gradients:readonly{kind:string;attributes:Record<string,string>;stops:readonly Record<string,string>[]}[];patterns:readonly{attributes:Record<string,string>;images:readonly{attributes:Record<string,string>;href:string}[]}[];[key:string]:unknown}[];glyphs:readonly{id:string;fontId:number;glyphIndex:number;d:string}[];[key:string]:unknown};
 readonly answers:readonly{answer:1|2|3|4;letter:string;equation:string;buttonId:number}[];[key:string]:unknown
}
`;
const out=types+'export const ALG_L08_P037_SOURCE:P037Source = '+JSON.stringify(s)+';\n',p=O+'/draft-source/alg-l08-p037-source-v1.ts';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);else fs.writeFileSync(p,out);console.log(JSON.stringify({generated:p,bytes:Buffer.byteLength(out),check:process.argv.includes('--check')}));
