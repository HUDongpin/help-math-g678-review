import fs from'node:fs';import assert from'node:assert/strict';
const b='migrations/shared-alg001-l07-p034',data=JSON.parse(fs.readFileSync(b+'/native-v1/visual-model-v1.json'));assert.equal(data.mainFrameCount,484);assert.equal(data.clocks.length,3);
const types=`// Generated from the source-locked P034 model; do not edit.
import type{SourceStreamRunsClockPlan}from'./source-stream-runs-clock-v1';
export type P034SourceTerm='Output'|'Value'|'Table';
export type P034SourceTile='Src_1'|'Src_2'|'Src_3'|'Src_4';
export type P034SourceTarget='Tar_1'|'Tar_2'|'Tar_3'|'Tar_4';
export interface P034SourceDrop {readonly spriteId:37|38|39|40;readonly name:P034SourceTile;readonly textId:number;readonly value:string;readonly allowedTargets:readonly P034SourceTarget[];readonly sourcePosition:readonly number[];}
export interface P034SourceRow {readonly input:string;readonly output:string;readonly target:P034SourceTarget|null;}
export interface P034SourceColumn {readonly input:string;readonly value:string;readonly depths:readonly number[];readonly ids:readonly number[];readonly multiplyDepth:number;readonly steps:readonly string[];readonly sourceText:readonly string[];readonly multiplySourceId:number;readonly firstVisible:readonly number[];readonly fullAlpha:readonly number[];}
export type P034SourceClock=Pick<SourceStreamRunsClockPlan,'decoder'|'segments'|'emptyNegativeBlocks'>&{readonly spriteId:60|62|86;readonly sourceFrameCount:number};
export interface P034SourceGlossary {readonly id:string;readonly sourceKeyAttribute:P034SourceTerm;readonly labels:Readonly<Record<'en'|'es',string>>;readonly definitions:Readonly<Record<'en'|'es',string>>;readonly source:Readonly<Record<'en'|'es',{readonly assetId:string;readonly path:string;readonly sha256:string}>>;readonly sourceEntrySha256:Readonly<Record<'en'|'es',string>>;readonly extractionLfNormalizedEntrySha256:Readonly<Record<'en'|'es',string>>;}
export interface P034SourceVisual {readonly first:number;readonly last:number;readonly value:{readonly paragraphs:readonly string[];readonly terms:readonly P034SourceTerm[];readonly tableAlpha:number;readonly formulaAlpha:number;readonly bankAlpha:number;readonly demonstrationOutputBlink:boolean;readonly demoCopyVisible:boolean;readonly demoCursorAlpha:number;readonly stepAlpha:readonly(readonly number[])[];readonly emphasis:Readonly<Record<'input-2'|'output4-negative'|'input-1'|'output1'|'input0'|'output0'|'input2'|'output4-positive',boolean>>;};}
export interface P034SourceText {readonly characterId:number;readonly sourceTextId:string;readonly text:string|null;readonly sourceTagSha256:string;}
`;
let encoded=JSON.stringify(data);for(const[k,type]of[['visualStates','P034SourceVisual'],['sourceTexts','P034SourceText'],['clocks','P034SourceClock'],['terms','P034SourceGlossary'],['drops','P034SourceDrop'],['rows','P034SourceRow'],['columns','P034SourceColumn']]){const literal=JSON.stringify(k)+':'+JSON.stringify(data[k]);assert(encoded.includes(literal));encoded=encoded.replace(literal,literal+' as readonly '+type+'[]');}
const out=types+'export const ALG_L07_P034_SOURCE = '+encoded+' as const;\n',p='packages/demos/src/alg-l07-p034-source-v1.ts';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out);else fs.writeFileSync(p,out,{flag:'wx'});console.log(JSON.stringify({pass:true,bytes:Buffer.byteLength(out)}));
