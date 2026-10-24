import 'server-only';
import type {HfrSourceHtmlGlossaryLink} from './hfr-p009-source-html-glossary';
import {hfrSourceGlossaryRequests} from './hfr-source-glossary-requests';
import {hfrGlossaryCaseAlias} from './hfr-glossary-case-alias';
import assert from 'node:assert/strict';
import path from 'node:path';
import {readJsonPin, readPin, readPageProof, readRegistryTransaction, verifyHostVersion, pinFile, withAdmissionReadStageAsync} from '../../../lib/g678-admission-proof.mjs';
import {withRegisteredHfrAsset} from '../../../lib/g678-hfr-registered-asset-cache.mjs';
import {validateHfrCurrentProducer} from '../../../scripts/lib/hfr-artifact-binding-v1.mjs';
import {localOnlyAnimationModuleRegistration} from '@helpmath/demos/local-only-animation-registry-metadata';
import {getWorkspaceRoot} from './catalog';
import {G678_ADMISSION_INDEX} from './g678-admission-activation';
import {g678PartialCalibrationSnapshot} from './g678-calibration-product-bridge.server';
import {readBoundG678LocalRuntimeAsset} from './g678-local-runtime-asset.server';
import {isG678LocalPreviewEnabled} from './g678-preview-policy';
import type {PageOnlyLessonGlossaryEntry, PageOnlyLessonPlayerDescriptor} from './whole-lesson-player-descriptor';

type Pin = Readonly<{path: string; bytes: number; sha256: string}>;
interface HfrPacket {
  schemaVersion: number;
  calibrationId: string;
  deploymentScope: string;
  source: Pin;
  sourceXml: Pin;
  entry: {key: string; module: string; maturity: string; complexityLane: string;
    artifacts: {kind: string; module: Pin; generated: Pin; data: Pin; closure: Pin}};
  selectedPages: readonly {animationId: string}[];
  glossary?: Readonly<{
    sourceGlossary: Readonly<{pageKey: string; sourceSha256: string; terms: readonly {dictionaryEntryId: string; sourceKeyAttribute?: string; sourceButtonCharacterId?: number; sourceActionSha256?: string}[]}>;
    sourceHtmlLinks?: readonly HfrSourceHtmlGlossaryLink[];
    descriptorEntries: readonly PageOnlyLessonGlossaryEntry[];
  }>;
  integrity: {files: readonly Pin[]};
  meta: {key: string; lessonKey: string; sourceSha256: string; hasSpanishNarration: boolean};
  runtimeQuery: {seed: string};
}

// Explicit reviewed candidates. This does not add an entry to the renderer registry.
const CANDIDATES: Readonly<Record<string, Pin>> = Object.freeze({
  'shared-dat001-l02-p001': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p001-current-js-v1.json","bytes":34207,"sha256":"b652fecd89c0490d894ea5026bee2505f2d200f41f197fc98142bc93b1f56182"}),
  'shared-dat001-l02-p002': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p002-current-js-v1.json","bytes":35567,"sha256":"56fecd5e028c3ce3aecf75280da1637c42e4d30f759940f78c055711899686b2"}),
  'shared-dat001-l02-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p003-current-js-v1.json","bytes":39910,"sha256":"6d7e2ee5833e44bf44d92fbfee24df30915011f85ef6c6fa78944e668f921a20"}),
  'shared-dat001-l02-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p004-current-js-v1.json","bytes":35570,"sha256":"d89b29a973cf3ae7d5ac8033fa75a66d185e2933aa543e1b316d3de8fd6131b7"}),
  'shared-dat001-l02-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p005-current-js-v1.json","bytes":33398,"sha256":"da1b282699da6bf8473082f5f0739f9e7de99b55613f9e4350cb4050d8e3a57d"}),
  'shared-dat001-l02-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p006-current-js-v1.json","bytes":33399,"sha256":"e56843e699309c618cbfc7d6335617a790c514997b0ac2706a4f2f5e2622dcef"}),
  'shared-dat001-l02-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p007-current-js-v1.json","bytes":33402,"sha256":"80cd4edee88c2fad85ff6cd51ce76aa823c8005f92e0e700fe88835c2d0e0c98"}),
  'shared-dat001-l02-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p008-current-js-v1.json","bytes":37538,"sha256":"bc575873722fc5d2dab11d4d233a02d01e0155b55acf3c41a3426e43bf63642a"}),
  'shared-dat001-l02-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p009-current-js-v1.json","bytes":33399,"sha256":"a7ecf1ce37d097e4d600240639c5accf70a5a61884f1d092443c987026d38f73"}),
  'shared-dat001-l02-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p010-current-js-v1.json","bytes":33402,"sha256":"86de872d503b897fa92459c723eb601ba1f2489d659547e5cc5b8452514c1fd4"}),
  'shared-dat001-l02-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p011-current-js-v1.json","bytes":40812,"sha256":"634d93cb6fe7814948f54e4ffddbca2e794df3ed7bdf1ca40e89794d04903b9f"}),
  'shared-dat001-l02-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p012-current-js-v1.json","bytes":36372,"sha256":"bac1b6356a9fa68aeb67334771d1584d9cafe71b2ec020f257e5feec7d0872ea"}),
  'shared-dat001-l02-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p013-current-js-v1.json","bytes":33402,"sha256":"2ae866477d726820317fe0c9391a242c27cb10076cb26349f08ffdafbf3603d8"}),
  'shared-dat001-l02-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p014-current-js-v1.json","bytes":33964,"sha256":"79c329b868dec2e296d65cd3dcfa01d46f505130e2ea59a5a49ce7f6758fda0f"}),
  'shared-dat001-l02-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p015-current-js-v1.json","bytes":34229,"sha256":"576f386e2a42a268f627880c170059f1fc07a45714ec736b3bb35022c524c39e"}),
  'shared-dat001-l02-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p016-current-js-v1.json","bytes":37538,"sha256":"3d2da96f35efd14fca8dbc3e73bd5b417a0e1670867d00b32ac21e44362fe9d9"}),
  'shared-dat001-l02-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p017-current-js-v1.json","bytes":33404,"sha256":"d4eb37e247308e05e209f544a4b55368168d8d5608e68632e16658fc7ff9469c"}),
  'shared-dat001-l02-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p018-current-js-v1.json","bytes":40811,"sha256":"0d7ef039b1fd04b9115780dc62542ed930df7143d32c377a9a9b6282331504fa"}),
  'shared-dat001-l02-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p019-current-js-v1.json","bytes":33404,"sha256":"d7608beb3d9caef1375632c3d8affe82b73bab66e92c5ec389c2a9d4f763cc42"}),
  'shared-dat001-l02-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p020-current-js-v1.json","bytes":37536,"sha256":"b967a730a297ce44674c29d8cf0164839dfabfc272dabc01d58fd6055b9115bf"}),
  'shared-dat001-l02-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p021-current-js-v1.json","bytes":40534,"sha256":"8a05dfd4c55e638470695fb7dfd8b306148b8c4c7810605e8bca20beccdc69ec"}),
  'shared-dat001-l02-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p022-current-js-v1.json","bytes":33402,"sha256":"27ab8241408078955df5577cd4fe15a6a9500e5fd887f0394c10fdd3b7a02ab3"}),
  'shared-dat001-l02-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p023-current-js-v1.json","bytes":33399,"sha256":"7a2df5b0bdd529ef15e25a095fc9e4f3e5eec7efd2433fdb4f819d2d03689415"}),
  'shared-dat001-l02-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p024-current-js-v1.json","bytes":33399,"sha256":"09c56bf2a0a1c6ab5dd4a5ac66cf5ccf7f9e05a0a8b68a5376d37bd0827f7b1a"}),
  'shared-dat001-l02-p025': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p025-current-js-v1.json","bytes":37539,"sha256":"6f39f7d05ffcc8974801d9efb91de0d8dd685d705bd03540c7de3d52418c63e2"}),
  'shared-dat001-l02-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p026-current-js-v1.json","bytes":33672,"sha256":"f2903c19cf7be8c603f2221ebe6575e1a6246f54b352bb38d089dc877ecc7efb"}),
  'shared-dat001-l02-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p027-current-js-v1.json","bytes":33400,"sha256":"9c5a6e98949b0e3c67d9407e46be35660cb9d61565ab69d2b72a793585d1402a"}),
  'shared-dat001-l02-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p028-current-js-v1.json","bytes":33402,"sha256":"9a2afa35350a1c5003fa2356dcac8be09f49c4f77da5f427f1666d75a974c101"}),
  'shared-dat001-l02-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p029-current-js-v1.json","bytes":33402,"sha256":"97e6b9738652013d3370e231aa6a410d3e1bc0d2c29007752de67424c9046b9a"}),
  'shared-dat001-l02-p030': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p030-current-js-v1.json","bytes":33399,"sha256":"44e1e71c584e2619fe68c164b308ff0764f934601494b04f780acf3dce98b158"}),
  'shared-dat001-l02-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p031-current-js-v1.json","bytes":33404,"sha256":"a39e6626a591e8e7c2f1840df34d68be41c53d0812009b548f3ab6c55055a5f1"}),
  'shared-dat001-l02-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p032-current-js-v1.json","bytes":40815,"sha256":"f6f2bc7828c4fbf269467adcc85c6e6a432a568125fb3ab82d53bb17e24207ef"}),
  'shared-dat001-l02-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p033-current-js-v1.json","bytes":43834,"sha256":"3a99c9a8427029769682482b3f20d5e215ed10d3cd872fe1dfd17d8082e37a50"}),
  'shared-dat001-l02-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p034-current-js-v1.json","bytes":41651,"sha256":"3ed888cc26ee483ff20530465f5e5aec4ed87c0a37392263fa9db1ce817ab83d"}),
  'shared-dat001-l02-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p035-current-js-v1.json","bytes":43830,"sha256":"51d44a9073d661eb4d229beeaea4d777847194798fd5def885f1dbe7acf2db96"}),
  'shared-dat001-l02-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p036-current-js-v1.json","bytes":41651,"sha256":"cedcec93524528c33cb08e2ffffa2259b2a5458f4fb19503074eee71a99209aa"}),
  'shared-dat001-l02-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p037-current-js-v1.json","bytes":43831,"sha256":"15dcb05807da296d51929cc83cca2c4fc50b943316d2e0de9aba39a32112f9cc"}),
  'shared-dat001-l02-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p038-current-js-v1.json","bytes":41655,"sha256":"b14047609648417d4b399fad329492e5b07445276646a2c2896bacfb203e3176"}),
  'shared-dat001-l02-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p039-current-js-v1.json","bytes":43831,"sha256":"bbe4bcffadc301bcddb01ef41d5169c1477cafddaff4006a133fee1f6248c032"}),
  'shared-dat001-l02-p040': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p040-current-js-v1.json","bytes":41650,"sha256":"e211307301187a959fb6e3ae0db8c51fdc4dd7881fccb1ad5f8eaafeef780435"}),
  'shared-dat001-l02-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p041-current-js-v1.json","bytes":43830,"sha256":"739eee45379d18f795281cdde94bfd7ecea1d43326c977043efe989bf8bf1fd2"}),
  'shared-dat001-l02-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p042-current-js-v1.json","bytes":33407,"sha256":"d0444a59a6123ca867a57c7399ff0665c31c8f983b86490e7c5abbe5ca97d0aa"}),
  'shared-dat001-l02-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p043-current-js-v1.json","bytes":34234,"sha256":"1824c9030255c9bd4ea3aef8d16ecd05d3b58dddf4357274f34210adc7783c5c"}),
  'shared-dat001-l02-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p044-current-js-v1.json","bytes":33399,"sha256":"0ba5fd4826d38f7ce821680b625e2ebaf2da3f6150f328adfddbaf799af07718"}),
  'shared-dat001-l02-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p045-current-js-v1.json","bytes":33397,"sha256":"7e6f942302b0f6909ba147e0f8efc1c19b9babc937bee67f22c268d849847852"}),
  'shared-dat001-l02-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p046-current-js-v1.json","bytes":33399,"sha256":"6aea8ca8ab48ddcaf86b9d3f3edc2d42d7beee2d18911944d531f34539ad5366"}),
  'shared-dat001-l02-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p047-current-js-v1.json","bytes":33397,"sha256":"df106de833cca61c2370558ad5d5c1d37b2fdbd3b00f56b93c85426394e03eca"}),
  'shared-dat001-l02-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p049-current-js-v1.json","bytes":37819,"sha256":"b98e14e89722b678e3e0375ea098198bf0a8f3d6f0503e91d1a7bf63f9f1241b"}),
  'shared-dat001-l02-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p050-current-js-v1.json","bytes":35903,"sha256":"7cbb09500654a94d075205787b1277ce28b8c7cb78a7df1767b7efa3b9657154"}),
  'shared-dat001-l02-p051': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p051-current-js-v1.json","bytes":35902,"sha256":"b84304d03628e191d7be1785b63c4dd653029872ff113591c2bf3063c10bcf6c"}),
  'shared-dat001-l02-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l02-factory-registration-v1-shared-dat001-l02-p053-current-js-v1.json","bytes":34720,"sha256":"d08daaeea129706b3148abbf175c7d82301f09551b63a83244a64e5912d55104"}),
  'shared-dat001-l03-p001': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p001-current-js-v1.json","bytes":33535,"sha256":"e96312fd590928b5d043af20c61c53afeb94e7e0b36e463efac63aad486543c3"}),
  'shared-dat001-l03-p002': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p002-current-js-v1.json","bytes":34916,"sha256":"316b08d091114a53b7c3d254b267ab942957b1ef858f6abc08d0406b881d6ed9"}),
  'shared-dat001-l03-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p003-current-js-v1.json","bytes":33828,"sha256":"e13efa196d2026f74a458bb8dfdd3eaa14ca41a6668def2aea3be0d1e4c731ee"}),
  'shared-dat001-l03-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p004-current-js-v1.json","bytes":33827,"sha256":"4bc011cb153d871f424822540578b77bb32ff9642f1fb92654e55150db252785"}),
  'shared-dat001-l03-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p005-current-js-v1.json","bytes":33821,"sha256":"858f96f5bca30bb474a770ecd836a01036669c40c29a9729d830197fb811ac30"}),
  'shared-dat001-l03-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p006-current-js-v1.json","bytes":33817,"sha256":"7faf5bc0404c0b5842d0db4fbcd897b32497f2c76e4168b18ca4856f5cc33a84"}),
  'shared-dat001-l03-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p007-current-js-v1.json","bytes":33819,"sha256":"5f5f794893dee2b58dc9642035ca8b79f03c7ba6034b099a09065542fa6ec60c"}),
  'shared-dat001-l03-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p008-current-js-v1.json","bytes":33819,"sha256":"487e8adbb8ecdd42d0d9971a14b14ebcd6af50f7bdcb9768f5314e6257e3e86a"}),
  'shared-dat001-l03-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p009-current-js-v1.json","bytes":34648,"sha256":"0a67befabb992cb2b83e446f1381234ae3292e3564463bc8d079fc184c27a7cb"}),
  'shared-dat001-l03-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p010-current-js-v1.json","bytes":33816,"sha256":"14a61e0f0ffe4dbad926a712f557b72671c433a833c62870f408e8fd12946b0c"}),
  'shared-dat001-l03-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p011-current-js-v1.json","bytes":34648,"sha256":"e902fbfa51377dc1d37f16dba1d38c10071dea34fef4660d6a333165493ad4cf"}),
  'shared-dat001-l03-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p012-current-js-v1.json","bytes":33819,"sha256":"64144543308b0ef6aa8e5a9bae5cf7663cbedcca11640396d64e99976a796c9d"}),
  'shared-dat001-l03-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p013-current-js-v1.json","bytes":33816,"sha256":"70d8a5dda4b6d12dd007af5ee9bbce71d00da62bcb48257dfafc8c45ec1a34aa"}),
  'shared-dat001-l03-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p014-current-js-v1.json","bytes":34648,"sha256":"323238d1d78a0ce2b13a271fbc89bf911ef995e69d6c2687c94cd30d80915455"}),
  'shared-dat001-l03-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p015-current-js-v1.json","bytes":33816,"sha256":"6d4343409ae30525d6b1ebe23d5efabaf81d507e9944f673a8b784a802bba0d2"}),
  'shared-dat001-l03-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p016-current-js-v1.json","bytes":33816,"sha256":"e58fcc5cb0bc4934e233aa9f83b47be80ac77570e8fa6358d1006d2d38757869"}),
  'shared-dat001-l03-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p017-current-js-v1.json","bytes":34648,"sha256":"ebecfd35a031cb7ffb846faf338bca9949716d1732ec416aeca9a60a06edb363"}),
  'shared-dat001-l03-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p018-current-js-v1.json","bytes":33823,"sha256":"fc190fb4e916643e4729b5771107a92dbb96a895134a782898464a0b6e29d533"}),
  'shared-dat001-l03-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p019-current-js-v1.json","bytes":37955,"sha256":"b5bb805693b5ee5db5aa0e068d5604674ef4e4e8b7f2ceddb68f60a9d7634de6"}),
  'shared-dat001-l03-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p020-current-js-v1.json","bytes":41227,"sha256":"e6d8c7cf2b6528ec36f4da8faaac91b72c048b351f2a87abe899d84ff7ed19d1"}),
  'shared-dat001-l03-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p021-current-js-v1.json","bytes":33819,"sha256":"5e5b2ab89c299795008a2b2e8c6f8a76c68c02f5b51018a5500c6d9c8f2cba1b"}),
  'shared-dat001-l03-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p022-current-js-v1.json","bytes":33817,"sha256":"681b51f4dec0451d0e3960c94198d3a1dcbe7417a50df4bd99034c9b83e14a9a"}),
  'shared-dat001-l03-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p023-current-js-v1.json","bytes":33817,"sha256":"8ac095367ea261e2265a965e6fa9ba7cef5f644abf31b541092d1b7a16857d19"}),
  'shared-dat001-l03-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p024-current-js-v1.json","bytes":33818,"sha256":"f8f458fc7792c776a79f5ec9d6c41647bf5408a88ae811fd729f19c52985f74d"}),
  'shared-dat001-l03-p025': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p025-current-js-v1.json","bytes":33819,"sha256":"9ae735180e440b12a9624db0a1fe146428b30a58ce21999dbce2ee1ca85018dd"}),
  'shared-dat001-l03-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p026-current-js-v1.json","bytes":37957,"sha256":"909781ae99b5b0ce73e1c3a7169cd8ec60b09087f6abdd0e11afcfcd60018c96"}),
  'shared-dat001-l03-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p027-current-js-v1.json","bytes":34924,"sha256":"5fdcb57d4a5c4efce7e2b283da818738e598ee05ff50f46eae410bac20d15dee"}),
  'shared-dat001-l03-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p028-current-js-v1.json","bytes":33817,"sha256":"e6d05263f4d006ca918362065a061c275e7e01350da218443bee6f8c56fdc80f"}),
  'shared-dat001-l03-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p029-current-js-v1.json","bytes":41231,"sha256":"1a546c56377bba8b5614274c042a3937113c08ae76e0633dce19edf8dc0e930d"}),
  'shared-dat001-l03-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p031-current-js-v1.json","bytes":37958,"sha256":"f9daa16191a5143da51b0682a931542ad8ed779c96b6a03ac2b696c6d085d2fc"}),
  'shared-dat001-l03-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p032-current-js-v1.json","bytes":33819,"sha256":"668e91d721a620a42987f30df59751f27400989c940881fd2394d8d1085ceeb6"}),
  'shared-dat001-l03-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p033-current-js-v1.json","bytes":33819,"sha256":"f2ce8e7578d42a176f872a1b65da512d52cb06a19eb6da1d8354d5dddef7b97b"}),
  'shared-dat001-l03-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p034-current-js-v1.json","bytes":41232,"sha256":"10ed52ef348deaeec5669758b84b29a5d9927d7162f8b8d5564e06a40e98f77b"}),
  'shared-dat001-l03-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p035-current-js-v1.json","bytes":35198,"sha256":"71423005086e2ac54b419dbeeda473c93fd65ce6cef9f215f787e2a114264010"}),
  'shared-dat001-l03-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p036-current-js-v1.json","bytes":33823,"sha256":"6b1c7da9c9f6d20fc862bde9d55026b559778eabbe44e1320b3fc728bee0bc6a"}),
  'shared-dat001-l03-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p037-current-js-v1.json","bytes":37959,"sha256":"c54f8f57a88512c7df36335f19b9e1a8c90e567ef99ef2a74be0f30030343780"}),
  'shared-dat001-l03-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p038-current-js-v1.json","bytes":41233,"sha256":"0591f8295d0dd9a9359e6771d58cf7c77192a414c6701f24a7269a2499302716"}),
  'shared-dat001-l03-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p039-current-js-v1.json","bytes":33819,"sha256":"4de79a435b0a48acfbff8bef859d321f99ed7061911d245e31288d41506f205e"}),
  'shared-dat001-l03-p040': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p040-current-js-v1.json","bytes":37959,"sha256":"1ab900344515936f0bc1d8ab07403f7adaf5a5cc71b0aeb3f4e2a8369eb976ba"}),
  'shared-dat001-l03-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p041-current-js-v1.json","bytes":33819,"sha256":"d9a69800e4585d9228064093dc063b74c9d71460d187aa96d49973d1055a9c37"}),
  'shared-dat001-l03-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p042-current-js-v1.json","bytes":33823,"sha256":"5c462b4cf82ea68d3a3ecb8d4e5f780b44a1c8a71e3105818d9b380921c56b40"}),
  'shared-dat001-l03-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p043-current-js-v1.json","bytes":33819,"sha256":"a83e39f194b9528931bc8b538e648397204fbac3a5d5164a006648dffce1ead2"}),
  'shared-dat001-l03-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p044-current-js-v1.json","bytes":41232,"sha256":"17d47e2a0fbf4caf58b899c18174f622fa5967179d6b20ea4a3e4477ade8ca4f"}),
  'shared-dat001-l03-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p045-current-js-v1.json","bytes":37960,"sha256":"5367ef64aa17d744e8308f3af53d3da5e634f2b4b6220beaefd931065da79122"}),
  'shared-dat001-l03-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p046-current-js-v1.json","bytes":41231,"sha256":"eb2005eaf4319384c1cbb5cc677d1d7d8af584be960cb5c66781ed660309b085"}),
  'shared-dat001-l03-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p047-current-js-v1.json","bytes":44251,"sha256":"362ae1fd0b50d3567b7cb32b6de5e9eff36d070797845314d7713b96e5fa748c"}),
  'shared-dat001-l03-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p048-current-js-v1.json","bytes":42070,"sha256":"6ca62973ecf5ed34c4410c6fef53e75285817775a6ea7dda312a84c16fdb64bd"}),
  'shared-dat001-l03-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p049-current-js-v1.json","bytes":44250,"sha256":"ec7c74f6de985dcb053029d3faf0598db17b3d1b3ea85e2febcd7d797b125928"}),
  'shared-dat001-l03-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p050-current-js-v1.json","bytes":42070,"sha256":"bb1390806eed2ab77ed9171ac16f5ecf37351d6222bdbe79a78fd51ad0fc0a7a"}),
  'shared-dat001-l03-p051': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p051-current-js-v1.json","bytes":44251,"sha256":"2bf0182cdfaaf2a56d4c268ff4eb58ad785df8acb671787605692a4657729f71"}),
  'shared-dat001-l03-p052': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p052-current-js-v1.json","bytes":33827,"sha256":"48871e9a3f4eb6339a559b12c7a55772701be63917487d0cdfdbcb2a0dc6edd1"}),
  'shared-dat001-l03-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p053-current-js-v1.json","bytes":34653,"sha256":"be4bef5312ad610411be8b10550643fa7a36dab79bcf58eb8f947a496f54f1f3"}),
  'shared-dat001-l03-p054': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p054-current-js-v1.json","bytes":33819,"sha256":"29e31c01957aa7233a385f7f7acf77ca778ebb7de07092554e2c934b4f7c9a28"}),
  'shared-dat001-l03-p055': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p055-current-js-v1.json","bytes":33817,"sha256":"43f08320e9d0a669a474a5bee5e97a27634a8d35a7110063a91106703edf812a"}),
  'shared-dat001-l03-p056': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p056-current-js-v1.json","bytes":33819,"sha256":"bbd62529aecff6e50ee0a6a147032328a8cc90b926a91640aaadea0857e8fe54"}),
  'shared-dat001-l03-p057': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p057-current-js-v1.json","bytes":33819,"sha256":"318838289a0a0cb956202578c520a8144767608806452808ea8c246e4eba7408"}),
  'shared-dat001-l03-p059': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p059-current-js-v1.json","bytes":38239,"sha256":"dd60a1815a2177e7a553401c8441e68954d880dc01d99bc401d372ef785f9c6e"}),
  'shared-dat001-l03-p060': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p060-current-js-v1.json","bytes":36323,"sha256":"d1d78e74c77d814e8a5c40f05b08bbfef437f1591d1787166411425f56ae6139"}),
  'shared-dat001-l03-p061': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p061-current-js-v1.json","bytes":36323,"sha256":"8daf4778b6865f221504a4c323ac5e2db696b153cea0f5196ae94600ec1859c5"}),
  'shared-dat001-l03-p063': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l03-factory-registration-v1-shared-dat001-l03-p063-current-js-v1.json","bytes":33253,"sha256":"482e4745173ac455c05c6dd131858b514b883ddf3697d0a446b008990c359799"}),
  'shared-nms002-l12-p002': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p002-current-js-v1.json","bytes":37766,"sha256":"4a159ff4f55b2fc6e8b14d514adedd32253fd5d575f7d48a78e581ae1be93df3"}),
  'shared-nms002-l12-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p003-current-js-v1.json","bytes":37763,"sha256":"d417f2507a6a41b4cdbda07cd7e4e022c43012e4569bdd257c760ebb2ef1f5cb"}),
  'shared-nms002-l12-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p004-current-js-v1.json","bytes":34245,"sha256":"b0840deb0010361eaccc9afca5b7883b27a8c75d30e6d7d6bbcdc37da4f2df8e"}),
  'shared-nms002-l12-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p005-current-js-v1.json","bytes":38302,"sha256":"fdcfce67c61d74349edae6ab18997e70273c506d3514e462feaced21e275f962"}),
  'shared-nms002-l12-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p006-current-js-v1.json","bytes":33971,"sha256":"1c1bd6c907a48bb997fc13cdc897018fd657166b626134c34ecfea139700ed4e"}),
  'shared-nms002-l12-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p007-current-js-v1.json","bytes":38919,"sha256":"62158b6782f925ca978bca887b2727b0f759c9e95fc1a1c17499565b1f760540"}),
  'shared-nms002-l12-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p008-current-js-v1.json","bytes":41941,"sha256":"d9c9bea5582fd2f8d6bacd25b13bea1c98433ece8651b7f7e2ee0d180131de69"}),
  'shared-nms002-l12-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p009-current-js-v1.json","bytes":44118,"sha256":"07b7cd4cdeee7be9c9f8db4fe72d4b5b7187fe13e49c7399f90762e5532acdef"}),
  'shared-nms002-l12-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p010-current-js-v1.json","bytes":33971,"sha256":"be84ec7e6fd3b6cb61a18d5c51ba42874b1a64379ac74090f377e63ad279133a"}),
  'shared-nms002-l12-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p011-current-js-v1.json","bytes":36484,"sha256":"067c49b049b374313dfbb3d378d9584d947752f1218671b94515d432aeecc9ee"}),
  'shared-nms002-l12-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p012-current-js-v1.json","bytes":35050,"sha256":"eaa74e834caaff65db95a5c20ea1f2df62250d6e0f695ab2e9931cbd4cf58707"}),
  'shared-nms002-l12-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p013-current-js-v1.json","bytes":44120,"sha256":"7da5440683942222c4a24ab4994cf946605dd3e7210ed9b6bbbfa673bb7f3f3b"}),
  'shared-nms002-l12-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p014-current-js-v1.json","bytes":36483,"sha256":"fc816489f0050ebde2b1b5d39fc0ec1125e03a7bda5200d0173c4062763d5bee"}),
  'shared-nms002-l12-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p015-current-js-v1.json","bytes":33971,"sha256":"289c89d562f56a4c0d89910f25f5776e9e6b5dab77412458ea34eaa2f8a896b9"}),
  'shared-nms002-l12-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p016-current-js-v1.json","bytes":35051,"sha256":"89671645540ea3ed32289a4d77487509f427fb2415a4f82e9b267c521c65f91c"}),
  'shared-nms002-l12-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p017-current-js-v1.json","bytes":44119,"sha256":"e3d910484d9f71974a2615dedbedcd087721def710e38c2cdc7fb03d4ca940e7"}),
  'shared-nms002-l12-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p018-current-js-v1.json","bytes":36483,"sha256":"cbaca795113bce725c0d4c3b682eabacc4914972ca03e500b7d5ae14f0b900cd"}),
  'shared-nms002-l12-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p019-current-js-v1.json","bytes":36693,"sha256":"3a5c94dae137171f99edc92841832f648730116c1bed2cc8f9ade4350a82218f"}),
  'shared-nms002-l12-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p020-current-js-v1.json","bytes":34241,"sha256":"f073fb351240965e64ab26ca55c883ba28c43fb1ec19646407abfb8673d5d1dd"}),
  'shared-nms002-l12-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p023-current-js-v1.json","bytes":44122,"sha256":"3f90feaeed44e0698a06f7b375a5154ef5df3be2c779ca6c9ef4a7b0317456ce"}),
  'shared-nms002-l12-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p024-current-js-v1.json","bytes":36486,"sha256":"8bde976a280f35ea492e3369cb1c7a8dc3acc4767089c97aabd5f28650276896"}),
  'shared-nms002-l12-p025': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p025-current-js-v1.json","bytes":44121,"sha256":"45ec36940b3c038653b0331a72b1234bbda9723189df197e3548ca1fbcb3677b"}),
  'shared-nms002-l12-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p026-current-js-v1.json","bytes":36485,"sha256":"102b624e0212904f0d2fb7270b279e39a58221e2a50c40d041fb741c189e9bfb"}),
  'shared-nms002-l12-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p027-current-js-v1.json","bytes":34796,"sha256":"49ff2ce07e0942b6cea0b14334af0627a10cb86ab6e25c225e867184500cd640"}),
  'shared-nms002-l12-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p028-current-js-v1.json","bytes":33971,"sha256":"05dc7188e6f893741a8d37d36b5921466e7b09da00a9df9a510b24059963bf38"}),
  'shared-nms002-l12-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p029-current-js-v1.json","bytes":34510,"sha256":"6f9cf2d79e83429556b3a89d611c7efcce77e7ebe93bea0e508c331c348d898e"}),
  'shared-nms002-l12-p030': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p030-current-js-v1.json","bytes":34510,"sha256":"4598f02ec746bf7dfca19e5acbf050d3514a3eb5cc588caa057ca5674a628353"}),
  'shared-nms002-l12-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p031-current-js-v1.json","bytes":44115,"sha256":"7bd22d88cb280e153816f4cb50a5e50107e57b174ba98bf30766216bf91961be"}),
  'shared-nms002-l12-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p032-current-js-v1.json","bytes":36483,"sha256":"ec3c50f0034e1c8988a679ee8cf5642f656905e4a4aacb8e24ef052ef977294d"}),
  'shared-nms002-l12-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p033-current-js-v1.json","bytes":44117,"sha256":"4464f5b407e7c73f354a844c8f403e84ce24af2d994bfce49d948984b82a7c68"}),
  'shared-nms002-l12-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p034-current-js-v1.json","bytes":36484,"sha256":"11eb17e3c69b469377bfc2bc41891d39c1059c2b8b0228860e619053bccd7e8d"}),
  'shared-nms002-l12-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p035-current-js-v1.json","bytes":44117,"sha256":"48297cb3fca8eec16c05b8dc7ccd9861cc3456d539974b8f5a14029afbdbf6c4"}),
  'shared-nms002-l12-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p036-current-js-v1.json","bytes":34514,"sha256":"86a7b75df40c02df882603ab45adaa60566b737782434a1cdf9d95a1f789dfb5"}),
  'shared-nms002-l12-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p037-current-js-v1.json","bytes":34510,"sha256":"c9a45c00e09a89d6307a9b6861c7f5e8badf56b0d94461c5a161bbb9af72167a"}),
  'shared-nms002-l12-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p038-current-js-v1.json","bytes":33980,"sha256":"66ac9e49edb03dc025bc1a9a5c8463a9d88d3864183710390226b4dd093ba6c9"}),
  'shared-nms002-l12-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p039-current-js-v1.json","bytes":33971,"sha256":"0839ff9adb66009d4ed481134e83803c10b2c446e6964c701b84266f2dde7fef"}),
  'shared-nms002-l12-p040': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p040-current-js-v1.json","bytes":33974,"sha256":"8a2d56e0275bd7a93d702c3a036bd149103fc4734c7c4a4f138f5e9928c207e5"}),
  'shared-nms002-l12-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p041-current-js-v1.json","bytes":36484,"sha256":"fbaa56de6d2fec6ba726cbe94d01c105aab7667c0501e1d9568e05f553807afb"}),
  'shared-nms002-l12-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p042-current-js-v1.json","bytes":44115,"sha256":"0ca53a5b87795d3cc38e83995f94a27142c7fb2df245c417c642a23f397aa9cf"}),
  'shared-nms002-l12-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p043-current-js-v1.json","bytes":36485,"sha256":"7ce73f32d53064936605652e4b82fcac509524afae0b22497d065b00a8f761ec"}),
  'shared-nms002-l12-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p044-current-js-v1.json","bytes":33971,"sha256":"4b031f7f12b21a6151745d0f0005b63ad282224bcfcd93048486f509c32695a4"}),
  'shared-nms002-l12-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p045-current-js-v1.json","bytes":34534,"sha256":"7a70983733de8ccb5443e937616b582845d6d625d5bd0577cc9e5cc50ffdff5b"}),
  'shared-nms002-l12-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p046-current-js-v1.json","bytes":41663,"sha256":"76db6ca56e8095eed23cf186f816b0ed1073bfb45fe0bfdd098f196a6bf9dd1a"}),
  'shared-nms002-l12-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p047-current-js-v1.json","bytes":34808,"sha256":"6a70a06dee0c273864388a2e793b05231bd096ebd338f161eb36cbc520af7e31"}),
  'shared-nms002-l12-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p048-current-js-v1.json","bytes":41940,"sha256":"e5766599f3b94cc88a541dfac5a76114f2183e5ba5ab71113d62a4f3d617139f"}),
  'shared-nms002-l12-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p049-current-js-v1.json","bytes":41941,"sha256":"3d9fd17629457adcc27abb65e27bfb31257e8fc1af51006b0e023766832fc3aa"}),
  'shared-nms002-l12-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p050-current-js-v1.json","bytes":41939,"sha256":"0a10ea98ae9a45bc627442975bb27c54c00323b81f20b3964741d477dfb0917d"}),
  'shared-nms002-l12-p051': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p051-current-js-v1.json","bytes":41942,"sha256":"d3d80c5ef511f5fcaefb4fc49556f4847cf6567ea54ceb34afdec58c2abbf898"}),
  'shared-nms002-l12-p052': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p052-current-js-v1.json","bytes":35371,"sha256":"d1d2d4325edadd2b407c8608f800f9975bf7a84617e5f592d628a06d9e4095c6"}),
  'shared-nms002-l12-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p053-current-js-v1.json","bytes":41940,"sha256":"649044fd8a678c5b6564747690ad9aef4275b340f7766f13c484db018d52073c"}),
  'shared-nms002-l12-p054': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p054-current-js-v1.json","bytes":41941,"sha256":"51320635114791e82725b19cc34389ccfa9ce1c4ddb08efe61f1461f1c639818"}),
  'shared-nms002-l12-p055': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p055-current-js-v1.json","bytes":35094,"sha256":"ac70084c102f8fa343a839153aa1c84f6a7b2e8cc56ac8263067715f6a4edc29"}),
  'shared-nms002-l12-p056': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p056-current-js-v1.json","bytes":33971,"sha256":"8aa5d752597b40564860da10088b98060793fd90906e6e2949c01ee74678f7e0"}),
  'shared-nms002-l12-p057': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p057-current-js-v1.json","bytes":33969,"sha256":"dca08fd59a660d0430843ff7a39f5fe24b1c6a5c32fc4eba9ad860601091d45f"}),
  'shared-nms002-l12-p058': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p058-current-js-v1.json","bytes":33971,"sha256":"602ec8ed60e82300533b93b4772ba68898b48bf2ead11338ef4da2cef5b4166d"}),
  'shared-nms002-l12-p059': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p059-current-js-v1.json","bytes":33969,"sha256":"812be04e15e7b5e111a15808fcd7a85f0cbac2d8156c0745c5ee0af0e40e7560"}),
  'shared-nms002-l12-p061': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p061-current-js-v1.json","bytes":37317,"sha256":"2d5465ffc31a7181650c2ac7092e7ec1e917c53360e871a0c589d6944ec39f44"}),
  'shared-nms002-l12-p062': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p062-current-js-v1.json","bytes":37314,"sha256":"0b59ae26b75043f5fb819d05098210050b73e492789147eec95b77ebcbeab49c"}),
  'shared-nms002-l12-p063': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p063-current-js-v1.json","bytes":37316,"sha256":"fd3e0c3e432b0f6e928a9dfb05c2f8da3b15086f1ec13edfc4b47cd49eb4fe3b"}),
  'shared-nms002-l12-p065': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l12-factory-registration-v1-shared-nms002-l12-p065-current-js-v1.json","bytes":33405,"sha256":"67aab0e1f21126579372ec980a153131eaabe732866c8c1245aa327dd0fd8a16"}),
  'shared-geo001-l07-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p003-current-js-v1.json","bytes":34094,"sha256":"9bd22a3765f211dbadecb21c813bb3d39f98155c3330a8f3daa832232a7cafca"}),
  'shared-geo001-l07-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p004-current-js-v1.json","bytes":34097,"sha256":"eeaa9330f49a3e223aa654c4531b53f8ad3d181d41ef4c640a0d114fb5bb2aec"}),
  'shared-geo001-l07-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p005-current-js-v1.json","bytes":33818,"sha256":"817ba66390a20354f4a8e74be4370080121101137cc233c5500f2be0297a68c4"}),
  'shared-geo001-l07-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p006-current-js-v1.json","bytes":34096,"sha256":"0df4fd2f2da5863531e2540d36c02e4b051170c4ce4e4f3c3449b8df1942863f"}),
  'shared-geo001-l07-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p007-current-js-v1.json","bytes":33828,"sha256":"7a4fb5d32c6978ce02d1fbfb722a7a7b10c1d3b50f83abfa0e3f4ff32ce8f59a"}),
  'shared-geo001-l07-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p008-current-js-v1.json","bytes":33822,"sha256":"2ae30873b9e111f17b3319297ebd7b6a5289d46cce4cd9c9f5212629fd16adb9"}),
  'shared-geo001-l07-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p009-current-js-v1.json","bytes":44246,"sha256":"1881e753db8c6ba62659b898adc482c4e26bed29a55f7fcf22cadfb09f98b5d2"}),
  'shared-geo001-l07-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p010-current-js-v1.json","bytes":33819,"sha256":"91ef4f3aa0126dfbde0a9861c39ee26a54bf0ddc6107afd9309a9998b94a25a1"}),
  'shared-geo001-l07-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p011-current-js-v1.json","bytes":33822,"sha256":"85456cf4dc28aff7cdc2e6e9968bb671d616327eb058596ff88e31601113100d"}),
  'shared-geo001-l07-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p012-current-js-v1.json","bytes":44220,"sha256":"1b0a72869530f986cbc06ceae39d1094f109f45d1859c27adc4272994ebe5853"}),
  'shared-geo001-l07-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p013-current-js-v1.json","bytes":33819,"sha256":"148be0bf87d3476bb8c3ad18ecfc1d69cd21b31d0904b705e720f590aeb9b70e"}),
  'shared-geo001-l07-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p014-current-js-v1.json","bytes":33822,"sha256":"a285661cb9ab03adeb95ffd1f21143c65b1ad0068d23095945cc2043aaac7cbf"}),
  'shared-geo001-l07-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p015-current-js-v1.json","bytes":33818,"sha256":"b6e57357444617199b792baf51e080f7bf9db1d37cd041acaf831cd4f4ca3844"}),
  'shared-geo001-l07-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p016-current-js-v1.json","bytes":33820,"sha256":"d83866283cbb32e1bc3f50c2d72f68b5f4205d4c015695ca543ac78035db624c"}),
  'shared-geo001-l07-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p017-current-js-v1.json","bytes":44246,"sha256":"7076effaaa5e5333a2084d17185a6515c9457680b0ab2b0f318d5e3eb44b327e"}),
  'shared-geo001-l07-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p018-current-js-v1.json","bytes":33819,"sha256":"20b02f29b068b526b645b29e09054fd35e8a552e35bef03f096dfecfb180b897"}),
  'shared-geo001-l07-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p019-current-js-v1.json","bytes":33824,"sha256":"7e2e1d20e74c5492afd19c63886aad113a91ee77ca924ea437c2101d92fbf205"}),
  'shared-geo001-l07-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p020-current-js-v1.json","bytes":33822,"sha256":"f056cb2adb446cbb0775318682d3f1a6967c0353fd0813af74b58b732d1c7166"}),
  'shared-geo001-l07-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p021-current-js-v1.json","bytes":33818,"sha256":"1c4a0cfe252fd1bd89fd16dcd6d467d2998be413233e2992b66483496a3762c5"}),
  'shared-geo001-l07-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p022-current-js-v1.json","bytes":33824,"sha256":"28edec3854571aaac5355ec9175cbf49d1282ad7e2849e17feadab4a78636e3e"}),
  'shared-geo001-l07-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p023-current-js-v1.json","bytes":34641,"sha256":"569897d6281254e5209fb15609b05876ae2ad45eab250de728bf00b997076efe"}),
  'shared-geo001-l07-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p024-current-js-v1.json","bytes":33822,"sha256":"b097fd49e3a42221682801205a8c8c33dd2ec246fe90841ebc4d2cb4d4afc094"}),
  'shared-geo001-l07-p025': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p025-current-js-v1.json","bytes":34640,"sha256":"d281751c6a1f6dee2264b556a8e034364016493fade630d4aaaee1b221915f26"}),
  'shared-geo001-l07-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p026-current-js-v1.json","bytes":33822,"sha256":"60d590e8379758ad33880c88b7b9f169da40a9edcd844d62df19e2cc713db05d"}),
  'shared-geo001-l07-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p027-current-js-v1.json","bytes":34641,"sha256":"0244381de6344e6d221c5c17bdb028b9ea38b93cfbcad6ee5366a82df416effc"}),
  'shared-geo001-l07-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p028-current-js-v1.json","bytes":33824,"sha256":"be06b9c582b999ac54d15f05d99b25f0799ec976840fb257a48b8a8d9120e40c"}),
  'shared-geo001-l07-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p029-current-js-v1.json","bytes":34641,"sha256":"7290652b595c72f085b4faafc2711e6e97a9d7ea51135c82e19ffce40cc8a74a"}),
  'shared-geo001-l07-p030': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p030-current-js-v1.json","bytes":33819,"sha256":"ded035acf907a6d529afaf177205e641e479bb125c421e8d5006dad4a4f83c4f"}),
  'shared-geo001-l07-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p031-current-js-v1.json","bytes":34641,"sha256":"beb099f878971791e062ad030cf37e3b5907497f340dd5337c6721a8bb79cc20"}),
  'shared-geo001-l07-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p032-current-js-v1.json","bytes":34384,"sha256":"425ef7c66089089b755f112bbe975a252f62877e29640ba0a1db4a66e64e70bc"}),
  'shared-geo001-l07-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p033-current-js-v1.json","bytes":33826,"sha256":"e5d16026b49969c034ed01ed9250b240d359762cac588da047e985430795ab2c"}),
  'shared-geo001-l07-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p034-current-js-v1.json","bytes":33819,"sha256":"ad0b0de25c02b99eb29b5b3bd7b3dbe4c456b14ba819cbbd4031fd660b9ad903"}),
  'shared-geo001-l07-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p035-current-js-v1.json","bytes":33824,"sha256":"5927c9a69fbacac43828d5c1ac781bfd3133054b20e8bf7b1db46896086ee6af"}),
  'shared-geo001-l07-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p036-current-js-v1.json","bytes":42869,"sha256":"910eb4579dedce201cc6c0a5eb93000d2dca3fcae03bf1236644a60d46430dda"}),
  'shared-geo001-l07-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p037-current-js-v1.json","bytes":34641,"sha256":"653932158ba8d4c6f35584eeda406d0494b903295082bf74d28ae253b4530ab7"}),
  'shared-geo001-l07-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p038-current-js-v1.json","bytes":33822,"sha256":"678a4f8f623c57b6f0d47f5f7fc989a159af2f0964c6b484e734cf07c0325c2b"}),
  'shared-geo001-l07-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p039-current-js-v1.json","bytes":34641,"sha256":"d792417ddbb4ee94a18f841c4f5d1b03487b9f31636901f8a3a80b4e28f15177"}),
  'shared-geo001-l07-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p041-current-js-v1.json","bytes":34641,"sha256":"0316214b37f076ea6d81d8e9f37fc2fa9cc1fbfca6453d5d6a712849026c3758"}),
  'shared-geo001-l07-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p042-current-js-v1.json","bytes":33822,"sha256":"7dbd3e45eb9fdcd5b161f3f26c00ce0aa94f5197ac1d5b98666a5e500fd51684"}),
  'shared-geo001-l07-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p043-current-js-v1.json","bytes":34641,"sha256":"be5b9707908954281daa1a8f0c1de3510a6324c0b08e1434ec7876741592976a"}),
  'shared-geo001-l07-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p044-current-js-v1.json","bytes":33824,"sha256":"9dec141e1f24859365a7d97c2f48e91019ac84f2d37477ddb5644d14395164d9"}),
  'shared-geo001-l07-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p045-current-js-v1.json","bytes":34641,"sha256":"763667ffcda56bad620ad50f6660abef84a0b1f6dbeb27194c268469501d8ca3"}),
  'shared-geo001-l07-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p046-current-js-v1.json","bytes":33819,"sha256":"0cc5ffc6a9edf6330139bcc51dee18da68152ca53bb8538bb9993b28e444dfb0"}),
  'shared-geo001-l07-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p047-current-js-v1.json","bytes":34641,"sha256":"1ddbf20f4a9c57d0c7cdcebad07c8f30ee3fcb0afcd8e510a8c51118e2edc9d4"}),
  'shared-geo001-l07-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p048-current-js-v1.json","bytes":42874,"sha256":"106a42b9a3840f9506fa40edf811cb3f02a87f8e8bd1f7574341b57cba60cb55"}),
  'shared-geo001-l07-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p049-current-js-v1.json","bytes":42871,"sha256":"2c4e06831af215aee963581a97e7df21a22475f73b6113945284aa7994532f4d"}),
  'shared-geo001-l07-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p050-current-js-v1.json","bytes":42871,"sha256":"f243ee262bfb256724465b0e16cdc417277243006bd0d074cdf25cac157344cd"}),
  'shared-geo001-l07-p051': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p051-current-js-v1.json","bytes":34382,"sha256":"b95daf5dca2b88a7c4f86c901dc0b7c15d10927940f09c093959141ff642f432"}),
  'shared-geo001-l07-p052': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p052-current-js-v1.json","bytes":34383,"sha256":"b99e588b498a142f1e14eacbf7c6f0775e6de758e8dc374290e2be66f8efcf15"}),
  'shared-geo001-l07-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p053-current-js-v1.json","bytes":34928,"sha256":"377bed5296fc137481381b1614c10af7e8bcc2dc4c37b9f2760d094e4110c82d"}),
  'shared-geo001-l07-p054': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p054-current-js-v1.json","bytes":33819,"sha256":"80fd552a1b8a6cbfe16af6d2c93751a03921b264fb7eeb4bfd1d908e4fa344e1"}),
  'shared-geo001-l07-p055': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p055-current-js-v1.json","bytes":33817,"sha256":"59ec8a37ce9d359202a058a996dcd89b03eafa3517866b0deed915e907ba4727"}),
  'shared-geo001-l07-p056': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p056-current-js-v1.json","bytes":33819,"sha256":"355bd197970b9792fec552ba46368f3d3da2e00c4dd71d2fbf145994e07e1ab3"}),
  'shared-geo001-l07-p057': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p057-current-js-v1.json","bytes":33817,"sha256":"0f58a0d141e9adc42c5b881fd8001cb5f7ebab6759445f34b364b040cb7d29d4"}),
  'shared-geo001-l07-p059': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p059-current-js-v1.json","bytes":35776,"sha256":"36837291656382d47288ea1fb0262040ae20e5e5b8483a2856dc4ab695b11d2a"}),
  'shared-geo001-l07-p060': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p060-current-js-v1.json","bytes":35775,"sha256":"74e435069e6c9058f13028bb275feca1988cf7213250fbc4be8e918e3aa5e7f1"}),
  'shared-geo001-l07-p061': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p061-current-js-v1.json","bytes":36056,"sha256":"5c22f1b851acdb7aaea07f6a54b7de2713a11f86b0b237717f684189fcd18478"}),
  'shared-geo001-l07-p063': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l07-factory-registration-v1-shared-geo001-l07-p063-current-js-v1.json","bytes":33253,"sha256":"6680db14052d4f4a221d0fb5f0f2d8549abe95c10c9911965a135317ef3daa1a"}),
  'shared-dat001-l05-p001': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p001-current-js-v1.json","bytes":34543,"sha256":"6396bdb7f6c196a62f4c3c4270787b4b7ecde53fcac53bab4926408d4190740c"}),
  'shared-dat001-l05-p002': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p002-current-js-v1.json","bytes":38098,"sha256":"1bdaf80930abc8ed04c29810f94f79b421ce3ed397bd92091f0d92937838097e"}),
  'shared-dat001-l05-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p003-current-js-v1.json","bytes":37533,"sha256":"c8a997f9c52d99858692749a68f94c58ea2c7c97c6423f4a0820d7d007ff6014"}),
  'shared-dat001-l05-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p004-current-js-v1.json","bytes":37553,"sha256":"5eec299b46e97672bb7cf575a8cb920bca51fed56ecef175c6dced0a65a5e183"}),
  'shared-dat001-l05-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p005-current-js-v1.json","bytes":33738,"sha256":"7c4b29350dbfc221a71e6db98621587cfdc0157496968d3e450a6a3f27ceb7f1"}),
  'shared-dat001-l05-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p006-current-js-v1.json","bytes":34281,"sha256":"b6b7c33afb0487c8d63b114378b1f7c748da2a8fe15ae561c3886ac6aee09288"}),
  'shared-dat001-l05-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p007-current-js-v1.json","bytes":35910,"sha256":"a903d10de35626ad46ccae18d3191019375b14262883de2f9e61bf21c58cf33d"}),
  'shared-dat001-l05-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p008-current-js-v1.json","bytes":35910,"sha256":"d2173c72bd0f35887767c79392737074dcdc0bd6d10fcd56dbc0d42d75de0ef0"}),
  'shared-dat001-l05-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p009-current-js-v1.json","bytes":36463,"sha256":"8189546572dfc1ee1783d4725fa2e3a22671c091dcba4816a3d186f31835ec01"}),
  'shared-dat001-l05-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p010-current-js-v1.json","bytes":35910,"sha256":"7b79fa74a7174a7bec7a6d0fd32146b6453eb42179976a4ee8f63e30e91d3261"}),
  'shared-dat001-l05-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p011-current-js-v1.json","bytes":36236,"sha256":"ebbd34f69b697aabe8fd16ce7fac94243091f75b6fcd7c836e85c47d1d4db613"}),
  'shared-dat001-l05-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p012-current-js-v1.json","bytes":47630,"sha256":"101e60947c83d8c42d3858ba150a7cd0c68ac42737932014e331b4ec6b22a760"}),
  'shared-dat001-l05-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p013-current-js-v1.json","bytes":33735,"sha256":"09650f88221346fe776f2098550e47082150fd98a0209eae900b38b6e123abdc"}),
  'shared-dat001-l05-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p014-current-js-v1.json","bytes":41655,"sha256":"4c6842b7720e0b473405d56058f7a0d316e9f284f2ea1a6a260847bde0c05367"}),
  'shared-dat001-l05-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p015-current-js-v1.json","bytes":33735,"sha256":"282e2e037e0352b552e80bc90f51940027adef7aa626d8432db063ec6ef0581a"}),
  'shared-dat001-l05-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p016-current-js-v1.json","bytes":33735,"sha256":"5df0400ae8e566fb8ba53317bdba000d2a629279c04229e07bdd89a78515cb76"}),
  'shared-dat001-l05-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p017-current-js-v1.json","bytes":33735,"sha256":"8641ebb121e3449f98b4d1222d4ba554cb2f521a99c5a9b76b44b5dd1f3ace39"}),
  'shared-dat001-l05-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p018-current-js-v1.json","bytes":34289,"sha256":"942378562e92e9c4350460ad318f5262dfd1448257459e0001d3d7a22351631c"}),
  'shared-dat001-l05-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p019-current-js-v1.json","bytes":34822,"sha256":"f4a314b48818be4c3fef8828455084b28c58ae1f5019927785beed043cbb0a42"}),
  'shared-dat001-l05-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p020-current-js-v1.json","bytes":45240,"sha256":"ffa4420dce5a81ca33fd9ff28b3573d03b45bddb6cc0a441063899f79c6a21fe"}),
  'shared-dat001-l05-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p021-current-js-v1.json","bytes":45241,"sha256":"2ba0fad366e0e2d609bde12d2125a60d03fbd53f49e0f3cb521058bdd72e5332"}),
  'shared-dat001-l05-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p022-current-js-v1.json","bytes":35910,"sha256":"9c6f6a2590b2e759b928a308c138dc70564009c49975f0e7e49327a55a14c98b"}),
  'shared-dat001-l05-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p023-current-js-v1.json","bytes":33735,"sha256":"0e970a90195e72f586553c911ef905af750bab791c46892537f964c535dfb708"}),
  'shared-dat001-l05-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p024-current-js-v1.json","bytes":42784,"sha256":"ce5af6477707119506eb8abe9a0606add62a1230bb52aad8596c354005128f0f"}),
  'shared-dat001-l05-p025': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p025-current-js-v1.json","bytes":35910,"sha256":"e049f59748de41fa79d0f5472515bd92dd734fc9a5d9703c0554f22506b4c177"}),
  'shared-dat001-l05-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p026-current-js-v1.json","bytes":33735,"sha256":"e4d4b72b22c5cacb741557f2e964ee40dc2f73415e3182fa2f88c35d74119e97"}),
  'shared-dat001-l05-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p027-current-js-v1.json","bytes":35691,"sha256":"f98eba705710a909aec7368aef85c14b8b21f3f8f0b1d0da6ab6b81cff137647"}),
  'shared-dat001-l05-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p028-current-js-v1.json","bytes":33738,"sha256":"d4e46ba9beb3b53cce0583f690c4003fd6979acfeb78ce9bd868fdbf271fc00a"}),
  'shared-dat001-l05-p030': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p030-current-js-v1.json","bytes":35692,"sha256":"77dca6d71d7ebec4955310d998c0ee20454241dbf6af20674226c2d8ff030ef5"}),
  'shared-dat001-l05-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p031-current-js-v1.json","bytes":33735,"sha256":"537a38ba769977916af9b06e0885d28f880b3f1c37fb98b2096857e87da1a89f"}),
  'shared-dat001-l05-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p032-current-js-v1.json","bytes":35691,"sha256":"e74d0db52a79cd733319e8c731d06774cf19e25ca6964d9c9b23de2b7ce3d2d3"}),
  'shared-dat001-l05-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p033-current-js-v1.json","bytes":33739,"sha256":"886e8acbaba81d02e671138e4e34dc5bd1ae2aeb19c9a05fe5593b255d6cc922"}),
  'shared-dat001-l05-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p034-current-js-v1.json","bytes":36235,"sha256":"81b2f463c904cdb828c1e9b2b4abe91e1ee50f957de93ee910d0424350f41d3f"}),
  'shared-dat001-l05-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p035-current-js-v1.json","bytes":33735,"sha256":"164a7e4d4f3f1797135dde763b8d171091031f40fee7685e53879d53a6f55798"}),
  'shared-dat001-l05-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p036-current-js-v1.json","bytes":33740,"sha256":"28a80c04b2dd424462f13e00cf672fc4fca2b41acfae8474e3f2c0e403d8964d"}),
  'shared-dat001-l05-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p037-current-js-v1.json","bytes":34824,"sha256":"a4e081ab79a8f54c0459dbaa52b478fba9b646ca4cca0ddcb719209c5be21039"}),
  'shared-dat001-l05-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p038-current-js-v1.json","bytes":33740,"sha256":"fc4227fb9c38820e301f9cff6f1993d1bd1b238ff876a626d0af7f8a4343446a"}),
  'shared-dat001-l05-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p039-current-js-v1.json","bytes":35690,"sha256":"49fdd53307967733f38eb0b8ea7978df7a77f228f14b521a30856dd223314501"}),
  'shared-dat001-l05-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p041-current-js-v1.json","bytes":42785,"sha256":"2256e9bd59388a9a906617000dfe66bf54ba446e105238f8f141a9ae44cc28ff"}),
  'shared-dat001-l05-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p042-current-js-v1.json","bytes":42785,"sha256":"47d969e54efbf8f89e318a15e87a6318296240df14cbe810a5173e7ca1c62bea"}),
  'shared-dat001-l05-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p043-current-js-v1.json","bytes":42786,"sha256":"6110987ed82f689580626ec9825643580808f836c75172296943a1ff102f4636"}),
  'shared-dat001-l05-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p044-current-js-v1.json","bytes":42784,"sha256":"d937adc84afe116368938dab82bda29d50d335328b6f0c720b29ab90963c56b0"}),
  'shared-dat001-l05-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p045-current-js-v1.json","bytes":57800,"sha256":"5c1ab6e200cf24348d82451213ccf412a76375538842f0e8e96432995a025c6a"}),
  'shared-dat001-l05-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p046-current-js-v1.json","bytes":42778,"sha256":"8bba2dd2ccf3708eb4d97f3fbedb030d32cb392d315cae63ac7c4e71438ce4b8"}),
  'shared-dat001-l05-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p047-current-js-v1.json","bytes":42785,"sha256":"0a6810ca26c5fe209eac38dc65defed27834bd8969e0ffc37ebe7f654c5f9710"}),
  'shared-dat001-l05-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p048-current-js-v1.json","bytes":42784,"sha256":"541ce1b99426b454d4bc2a0b477d3e8c5cb92379eb35ccc567a1ef8ad01019cd"}),
  'shared-dat001-l05-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p049-current-js-v1.json","bytes":43054,"sha256":"02ce3915d9dea0b283aef6e06fac54a31194e6cf8660269505ac62f509c66683"}),
  'shared-dat001-l05-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p050-current-js-v1.json","bytes":42785,"sha256":"26e1c04d155065e2e4a6b0c518bddbb3cec65380597e4f9bb8517089ab2aa440"}),
  'shared-dat001-l05-p051': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p051-current-js-v1.json","bytes":41134,"sha256":"31493085e98fe598e3bcfbb28a0e106aa6e13d2f6c27a809cf9e77e0fe607c9e"}),
  'shared-dat001-l05-p052': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p052-current-js-v1.json","bytes":33735,"sha256":"37e47b0775019adfaf3064e0251e70a418a9f0183eebc47166b63f4315ababf3"}),
  'shared-dat001-l05-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p053-current-js-v1.json","bytes":33733,"sha256":"7d406134811a53fa95af5f9df159a4780e0793db1eaf18ce79237a7ed2121888"}),
  'shared-dat001-l05-p054': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p054-current-js-v1.json","bytes":33735,"sha256":"85167b5be6da454ecdaa9d1f66157f186731ca91f8b6a61e4722a3c671c8a4a3"}),
  'shared-dat001-l05-p055': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p055-current-js-v1.json","bytes":33734,"sha256":"8eeeabb4db8f4b2c3876b7d5480c7dd68bed44f25d4fc7850c705f078f8346bb"}),
  'shared-dat001-l05-p057': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p057-current-js-v1.json","bytes":37080,"sha256":"bbf333d79277983d0779731f18516fa189bbbe9b70104cabe7b8c82703c9d2a0"}),
  'shared-dat001-l05-p058': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p058-current-js-v1.json","bytes":37080,"sha256":"84e3f05b9c50f4b5d581f1acfb790f0aaf770c8dd366fc2dbb673fa64ce10d05"}),
  'shared-dat001-l05-p059': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p059-current-js-v1.json","bytes":37081,"sha256":"0f1498f51506c63542587cf8cef27eb090db6dc05e06b01cc2e960c8c0c82b9e"}),
  'shared-dat001-l05-p061': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l05-factory-registration-v1-shared-dat001-l05-p061-current-js-v1.json","bytes":34250,"sha256":"e732e005cfa83ecce9c493418002417c5eedf0156f166f11199c52e848e595ae"}),
  'shared-nms002-l08-p002': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p002-current-js-v1.json","bytes":34506,"sha256":"0c722469fb1084ba7a9a53e254d70a6403ebcaaad6729954ea0f910bb5e8a3b9"}),
  'shared-nms002-l08-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p003-current-js-v1.json","bytes":35847,"sha256":"f099f70ec86c6df5456d0d8da987043a13c3239b72c8eb7aa6ba246a83cba51c"}),
  'shared-nms002-l08-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p005-current-js-v1.json","bytes":33970,"sha256":"5f2cf1634093676543b92f42135bf79907ebbbbd2756c98f4669c084d12fd2e3"}),
  'shared-nms002-l08-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p007-current-js-v1.json","bytes":33693,"sha256":"67514defdb7a8b510212ae25438a13649eced175cf97cab1008954382a47de8a"}),
  'shared-nms002-l08-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p008-current-js-v1.json","bytes":33693,"sha256":"a043feca6f75d6a89299a27d0781d603cb44abdef1b38ae4f5c8a9398d9510f9"}),
  'shared-nms002-l08-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p009-current-js-v1.json","bytes":43838,"sha256":"a4f431ed60c3bb2e7fe87a0fd0b74623665a33f88d6c64e07a1cdd53d4877242"}),
  'shared-nms002-l08-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p010-current-js-v1.json","bytes":36205,"sha256":"12dd80728813d300e6573222940f8a3539bedbf2aa735457820d221975aecab3"}),
  'shared-nms002-l08-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p011-current-js-v1.json","bytes":43835,"sha256":"4586b347b17c2fd4b5fa967ecf30a84f876faca0365ddd03e3ce50b8b5239e89"}),
  'shared-nms002-l08-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p012-current-js-v1.json","bytes":36202,"sha256":"b5fddc12ec1315624853bc42ec16de76cd671933e018a42e7c9067e40ea5ce18"}),
  'shared-nms002-l08-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p013-current-js-v1.json","bytes":33693,"sha256":"0f14d8ead47e65ba4723dccc834a0ec3dbb1c596cc5dc34695794c60872e727f"}),
  'shared-nms002-l08-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p014-current-js-v1.json","bytes":43838,"sha256":"e117eaa05562d5d3ae1c6667c8c72adc20bb7d865ecd30fa0fbc4951e5b28fb1"}),
  'shared-nms002-l08-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p015-current-js-v1.json","bytes":33693,"sha256":"866b05cd6bb08a81c87c715a858606d24b418f9ae5f65f82f637b643f331d935"}),
  'shared-nms002-l08-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p016-current-js-v1.json","bytes":33693,"sha256":"185ba509cb7fb898819172b20614d9f89ba913392b9e0b9d878aaf65c1e7c577"}),
  'shared-nms002-l08-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p017-current-js-v1.json","bytes":36206,"sha256":"b1d35eea9abab55c13325b2c898c905a2ded23309954fc4d8d85f12d6d62f9d6"}),
  'shared-nms002-l08-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p019-current-js-v1.json","bytes":33691,"sha256":"0db6c5a3f1037fcd9adeb1aa3cfad9f7db38913d0f24721f2bdab4b85e9f59d2"}),
  'shared-nms002-l08-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p021-current-js-v1.json","bytes":33696,"sha256":"ef91e5df5b74f926d3bb49d6c5899aecc6fcbd479ded53d20cd046638e168529"}),
  'shared-nms002-l08-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p022-current-js-v1.json","bytes":33693,"sha256":"1e8be65e4149c4eaaf63e9985e48f407bb7de01ace17d812c36ca7c6e625069f"}),
  'shared-nms002-l08-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p023-current-js-v1.json","bytes":33693,"sha256":"1c295db60619d11db88b9645e3ca2c556c3151de2f278f37a92ce6afd4f6cadb"}),
  'shared-nms002-l08-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p024-current-js-v1.json","bytes":43838,"sha256":"ba392da18b000ec599e20da072fac1301ce6ea9fe0420f96ca07d3398b2a44b1"}),
  'shared-nms002-l08-p025': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p025-current-js-v1.json","bytes":36205,"sha256":"02b6439e810f4c3d2902202c8df8bb6ca895936100d76e08588e85f918ea0665"}),
  'shared-nms002-l08-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p026-current-js-v1.json","bytes":33691,"sha256":"31bdf88656a6f8e5bcb5feb253971fb16338ebb789a17a4e5b0537a86451fe4b"}),
  'shared-nms002-l08-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p027-current-js-v1.json","bytes":43842,"sha256":"2f9742b347f084b3db459fe941f7452ef8a702feb005c7bc13aba9d736a54baf"}),
  'shared-nms002-l08-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p028-current-js-v1.json","bytes":33693,"sha256":"bc5d080e06e78b58d7c8d1ce0465ec9f6811a79dc8e24cc50b2d3742450bb87e"}),
  'shared-nms002-l08-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p029-current-js-v1.json","bytes":33693,"sha256":"7738cf52d2fa9dd4c90c8e59390643de1180c2ad57cff8afff3ec544af03e6be"}),
  'shared-nms002-l08-p030': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p030-current-js-v1.json","bytes":36207,"sha256":"9dbf005e267d55db531354215f9abf976a18e7aa7256ef0e9f42e0858cafbe1a"}),
  'shared-nms002-l08-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p031-current-js-v1.json","bytes":33697,"sha256":"83943f66cb1809c25af23a69439c9d0c9eda52267a18890fe3ccea0633ec09a7"}),
  'shared-nms002-l08-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p032-current-js-v1.json","bytes":35357,"sha256":"b927df6f8db103169c27b24c500d8562e1c8e4faa17ccba5afdc1440b3776c55"}),
  'shared-nms002-l08-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p033-current-js-v1.json","bytes":33963,"sha256":"19d0c2dce9a01435e8c29cdccaa2aeeff29f022dfd7e54f7e4bee75f02d540d7"}),
  'shared-nms002-l08-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p034-current-js-v1.json","bytes":33697,"sha256":"eb1c53ff7f99785082816fe572ad9ab52b21e531dce5901de74bf69246f89c3d"}),
  'shared-nms002-l08-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p035-current-js-v1.json","bytes":43555,"sha256":"c60c4cdce2a28836450fc41190f5ab344cadef84b10c1715c4a258a0e07fca44"}),
  'shared-nms002-l08-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p036-current-js-v1.json","bytes":33697,"sha256":"cacd42dd2a68fa9ade96d80ba694f375c019b87cee2612413a367a13206a9e09"}),
  'shared-nms002-l08-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p037-current-js-v1.json","bytes":36209,"sha256":"f211b57c6094f0fed8e7ce255ad5f1b0906c9b37204b161e7dc775ec8524d5b9"}),
  'shared-nms002-l08-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p038-current-js-v1.json","bytes":33693,"sha256":"e8ee966b760061ed418936804022804e762d2621d08fd3fed6f492ddb4f7bd77"}),
  'shared-nms002-l08-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p039-current-js-v1.json","bytes":33693,"sha256":"6bd58418e0d4e87fca3cac7c661c129523f26f9da10e17e3bf4ee0fb56f3d6f5"}),
  'shared-nms002-l08-p040': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p040-current-js-v1.json","bytes":43842,"sha256":"d760c7275ac7f93db5d429c548c5875e754f9303bf7cae1385f9be4b4ccda77e"}),
  'shared-nms002-l08-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p041-current-js-v1.json","bytes":33693,"sha256":"37509c0703e08d436036dc0f4839fd0d5a41977315c6e8c0ea0be1fcf78881a3"}),
  'shared-nms002-l08-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p042-current-js-v1.json","bytes":43283,"sha256":"5e1b00705aad6ca6666bd8e11cb1b97831341fbe9fedd100f42553fdb0ba26f2"}),
  'shared-nms002-l08-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p043-current-js-v1.json","bytes":36486,"sha256":"a10545bf84b59a806c13191f8d47807272889346574c8e0a7cf2a378615b9573"}),
  'shared-nms002-l08-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p044-current-js-v1.json","bytes":44122,"sha256":"90559562a97007be78134d3bc3c708cfb19beae3552b7c307ef34ea0be0063d2"}),
  'shared-nms002-l08-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p045-current-js-v1.json","bytes":36486,"sha256":"f81e6db0e059c3006c70cae62a2a3b501d6a61c133e3bfb5d48497964dea0561"}),
  'shared-nms002-l08-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p046-current-js-v1.json","bytes":43286,"sha256":"e34ff49ae551fc2ac7bf9ad95fb72d293278254d6e1583d65e94eb0695e06e47"}),
  'shared-nms002-l08-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p047-current-js-v1.json","bytes":36487,"sha256":"ff4e013dffce947a455dd50e119c5c35d45bdadf2f120230cf85f513b36266ac"}),
  'shared-nms002-l08-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p048-current-js-v1.json","bytes":43563,"sha256":"f2103a2912b29faf03356ba2d69c5c3559305aba31d9404442a6e29c64df17f7"}),
  'shared-nms002-l08-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p049-current-js-v1.json","bytes":34532,"sha256":"89345a236cdd4e4e445fdfaa7463f1cfa5d762f63f6fe483467979c74f67d376"}),
  'shared-nms002-l08-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p050-current-js-v1.json","bytes":36429,"sha256":"d1d8652f94fcafb2b2c17b81dfad31eab5a7b503391e947e2489396dd968099c"}),
  'shared-nms002-l08-p051': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p051-current-js-v1.json","bytes":33693,"sha256":"2715f6cccdf9c529a3db4d78d8029e7ee8972eaf21b434103ae8030f1256aead"}),
  'shared-nms002-l08-p052': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p052-current-js-v1.json","bytes":33691,"sha256":"07b18af9b379bf823f3a1a05b14f8df1bab1fac86506fd6d672b36579ae309f9"}),
  'shared-nms002-l08-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p053-current-js-v1.json","bytes":33693,"sha256":"970e6bb6efed4eecdfc00355cbe9f99036fe3ed8614a682f89d75b2ab860137d"}),
  'shared-nms002-l08-p054': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p054-current-js-v1.json","bytes":33692,"sha256":"2687d6ed17b6545caf14352e25562f6faad277afea460733520780741f839fa7"}),
  'shared-nms002-l08-p056': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p056-current-js-v1.json","bytes":38111,"sha256":"5edd0320300d49b0c5541d60e2b516364aef15ef0aaad1eb278cd6a34153f1b6"}),
  'shared-nms002-l08-p057': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p057-current-js-v1.json","bytes":41654,"sha256":"389cc6dec0e0945fb45cc03874d933ade5a6526fa8352674c31e18ec7fae4e17"}),
  'shared-nms002-l08-p058': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p058-current-js-v1.json","bytes":36477,"sha256":"405907e835602dd2bd7c10f37b518fb80c07b33080e25fa3d4e06e9a77e64833"}),
  'shared-nms002-l08-p060': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-factory-registration-v1-shared-nms002-l08-p060-current-js-v1.json","bytes":33127,"sha256":"11e2b46da27a45e5bfad6d36f974457b21b7901306e5c35ec147bf7d98a67da8"}),
  'shared-alg001-l05-p001': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p001-current-js-v1.json","bytes":33533,"sha256":"57eb121567e8ad3e3d0e216c20a48efa063296ece2df9a3d260263e1fa36c41a"}),
  'shared-alg001-l05-p002': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p002-current-js-v1.json","bytes":34907,"sha256":"033a9378d8befce9cb3f88998a27b09e282d1f976e8886d3b20a356cf9d42a7c"}),
  'shared-alg001-l05-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p004-current-js-v1.json","bytes":34372,"sha256":"14d949809ce12a2073513589294bb39fce7ef2e1774c393fa6419de4509d623f"}),
  'shared-alg001-l05-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p007-current-js-v1.json","bytes":34094,"sha256":"a79d400350eb044986c45024ddd78a1314eeaf2abc241452ae3d41cf8b87223d"}),
  'shared-alg001-l05-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p008-current-js-v1.json","bytes":33821,"sha256":"0a14b46f9f644b096cc5cbcf7a1671195773899f8dc4b973d0480878692203d4"}),
  'shared-alg001-l05-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p009-current-js-v1.json","bytes":43690,"sha256":"1db652b7a9ecc128288c02d68ee60ef0a9f27a78e8427ef911b4239331e977e1"}),
  'shared-alg001-l05-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p010-current-js-v1.json","bytes":36333,"sha256":"49d5aef820b920c425e7b0ccf5cb5e62d6ea81973ddee4cf5093180556490e73"}),
  'shared-alg001-l05-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p011-current-js-v1.json","bytes":43969,"sha256":"59b9c130129705b6cfcbe53a42745a067b5db60faf25078b0c6ee67c798b539e"}),
  'shared-alg001-l05-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p012-current-js-v1.json","bytes":33820,"sha256":"2fcc33e81de28e5de9becdab42514624f814c792c0e094ca73b1c4ccf4eebb14"}),
  'shared-alg001-l05-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p013-current-js-v1.json","bytes":33821,"sha256":"aac61e60c582156f82607c6f15dc94c6085d1cc3e1bb9a7c070cfe0dde10bd7b"}),
  'shared-alg001-l05-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p016-current-js-v1.json","bytes":33820,"sha256":"67533beab7559dff644aa2a7b8ab63c6bf764216d4668bd39086f35c0821692e"}),
  'shared-alg001-l05-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p017-current-js-v1.json","bytes":33820,"sha256":"b5a352804c149e43cef069c00618186603d19abd0904571d7b24846e7807db8e"}),
  'shared-alg001-l05-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p018-current-js-v1.json","bytes":33818,"sha256":"c96ec46f61d9dec82051beb53656c3f0a78f9befaf5f4b406a391dc2a799911d"}),
  'shared-alg001-l05-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p019-current-js-v1.json","bytes":36332,"sha256":"de2d0dce6e5786c78b72b277887cd9ad216c2e8000f5701e845f28a9bd306456"}),
  'shared-alg001-l05-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p020-current-js-v1.json","bytes":33820,"sha256":"b8aecd1a1883dc12a6325af31de6a3bb68eec5725f167c1dddbcf561d1ed7892"}),
  'shared-alg001-l05-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p021-current-js-v1.json","bytes":33820,"sha256":"535efea7cfc418d132ad8d0208cf2a130fcb6f23761a40e85590bae8bbead56a"}),
  'shared-alg001-l05-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p022-current-js-v1.json","bytes":33821,"sha256":"8cd217ff0245448910cfc8e3bc35aec450e1f063f03068c515406e61472fd7e4"}),
  'shared-alg001-l05-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p023-current-js-v1.json","bytes":33821,"sha256":"acbc196050cfd7190454498ee971d210b22a1424631e3fbd372bc3ccf25a51ab"}),
  'shared-alg001-l05-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p024-current-js-v1.json","bytes":34647,"sha256":"e362171bed915d73357e7c280dc2713cf7ea8a5c5c2c750fd347c3b67936494a"}),
  'shared-alg001-l05-p025': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p025-current-js-v1.json","bytes":33821,"sha256":"a4df4e9120bf96f0f7e59052f021698919424bf56a63ec12e9926a18703c4672"}),
  'shared-alg001-l05-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p028-current-js-v1.json","bytes":34377,"sha256":"a0a18615b7cda53514b76f2ad9b540d6e5d268a824b58fffa46441560ca41a78"}),
  'shared-alg001-l05-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p029-current-js-v1.json","bytes":33820,"sha256":"01c092e3619ca803dc84f41d042e873370770cbed57b27c91df75522d52135c9"}),
  'shared-alg001-l05-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p031-current-js-v1.json","bytes":33818,"sha256":"eecbe95e31ba7e8defb001824ee2f1ca9e10a51e36a0fca228f872b92632d0e3"}),
  'shared-alg001-l05-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p032-current-js-v1.json","bytes":37957,"sha256":"ef383e043023a81489e7b5c6bca396a3993aea0d645e71b25fb8088ceb77aeb4"}),
  'shared-alg001-l05-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p033-current-js-v1.json","bytes":41223,"sha256":"3a79f65c45a5e903ecca19decdb1c332f24ee5bab32534785ad0682251ed1160"}),
  'shared-alg001-l05-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p034-current-js-v1.json","bytes":37415,"sha256":"dc50a637e18a5275e9a1f738ee5d1d06c9fc0ab3b061565f924ce384a1a6e9eb"}),
  'shared-alg001-l05-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p035-current-js-v1.json","bytes":38236,"sha256":"5bbdb837be767b79a89d9b700cf535d11086ad3a42e4451069e15d051bdd4855"}),
  'shared-alg001-l05-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p036-current-js-v1.json","bytes":33821,"sha256":"817b259e1e155b75d95ba0f9a9957a667e0092c5e794c8e8073b9074172e34bf"}),
  'shared-alg001-l05-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p037-current-js-v1.json","bytes":41492,"sha256":"6cb6f152210fe329f8848356e2f381040f4fd6223e710bd879943b6c452beb5c"}),
  'shared-alg001-l05-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p038-current-js-v1.json","bytes":33820,"sha256":"f253cb3c0ad8351880e71e3739510a7417cb48b59ca980398078b342e05874df"}),
  'shared-alg001-l05-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p039-current-js-v1.json","bytes":37684,"sha256":"347fea573d31b237856caf02656cf030f84e10bc1005b5ca0b75fc51e555629c"}),
  'shared-alg001-l05-p040': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p040-current-js-v1.json","bytes":33819,"sha256":"67388c72f9a6d9fb447ad89022e462c652dc29a6070c189d45021a378e188e3e"}),
  'shared-alg001-l05-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p041-current-js-v1.json","bytes":38235,"sha256":"1ee230b45b6a3f613ebd6712b20cba8adce56bf0b027383b370a9a73e6f40252"}),
  'shared-alg001-l05-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p042-current-js-v1.json","bytes":33823,"sha256":"beb889592dc94070d5e62ff981fb2b8ee3323d84501d1f103c6e80fe9cc05af0"}),
  'shared-alg001-l05-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p043-current-js-v1.json","bytes":41492,"sha256":"16f1131f9b27b2af0f6bea8dda74f3685ddb8d5286f3df263506455a02d946bb"}),
  'shared-alg001-l05-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p044-current-js-v1.json","bytes":43697,"sha256":"83dcae65f819d3d93a44840d059587cad4187d4c37f67c503afcff63282c642f"}),
  'shared-alg001-l05-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p045-current-js-v1.json","bytes":43699,"sha256":"7d80eef56cb780e8b91225b5dec82eb9ac3beb08c10a6caa90557a8ac7b916ef"}),
  'shared-alg001-l05-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p046-current-js-v1.json","bytes":42062,"sha256":"499d40dc84e3736b7d838dcd52f2a4205adf9035376f87156654de399e19ff75"}),
  'shared-alg001-l05-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p047-current-js-v1.json","bytes":43152,"sha256":"de7fbac87850a2d4969fff71e05c18ade261e918bcac9a5bdcf97b67c342d66e"}),
  'shared-alg001-l05-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p048-current-js-v1.json","bytes":38242,"sha256":"07501698abeb730651c5261199883582274a7e6ec542bb46f12742d704bb3b97"}),
  'shared-alg001-l05-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p049-current-js-v1.json","bytes":43151,"sha256":"3f239178f9281a55ef97a6affb31df337182a45e7ecff1f484578be9529940d0"}),
  'shared-alg001-l05-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p050-current-js-v1.json","bytes":43697,"sha256":"a35e920e191de1aeb496c2dff13fb9203db66c163cfc547344dc045a466a6957"}),
  'shared-alg001-l05-p051': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p051-current-js-v1.json","bytes":43699,"sha256":"37238488cb8ee2d5ce75119250965c7b8cd722b9efd5038219b601f4d53e26f4"}),
  'shared-alg001-l05-p052': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p052-current-js-v1.json","bytes":33828,"sha256":"c19198c2b7e1c5c135b749dcf0d50d0889bf27f8cbc57c9db3b067fb0e79890c"}),
  'shared-alg001-l05-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p053-current-js-v1.json","bytes":36830,"sha256":"ba130cae74d450a8a6075699f726546ea1433c4f4acee559d26ef181588d221b"}),
  'shared-alg001-l05-p059': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p059-current-js-v1.json","bytes":38237,"sha256":"d722247e48949f68d91328d6e91b8cc31bcecf2e64550e8ac2fd208c0428b8f0"}),
  'shared-alg001-l05-p060': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p060-current-js-v1.json","bytes":41485,"sha256":"8e6eecaf5cedf4e7fbb2ef816b098fdfa38ce4bd240241b9ddf39f6d8271c7e7"}),
  'shared-alg001-l05-p061': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p061-current-js-v1.json","bytes":36600,"sha256":"d540b66dd21d549dd5963d50aaf8a70cdc86a664f02c507eeab55b4e81c5b90e"}),
  'shared-alg001-l05-p063': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l05-factory-registration-v1-shared-alg001-l05-p063-current-js-v1.json","bytes":33254,"sha256":"f0c32dfbae0ce77dfc649964fe64b8d34544e6562bc3b66312194759a014361a"}),
  'shared-nms002-l03-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p003-current-js-v1.json","bytes":33528,"sha256":"0a5a5f47e4f7803820907ba2ea89b020a97fc2abb63c1875262c3c75c1cd11f7"}),
  'shared-nms002-l03-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p004-current-js-v1.json","bytes":34074,"sha256":"ba35034dcf3c5e42f28dc6136e5787e74cd415756765884e4ae5ce6a64f9b31e"}),
  'shared-nms002-l03-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p007-current-js-v1.json","bytes":43127,"sha256":"309811831e0d6b8aeb1cf9ade294285d105f07085711a81a609bba926ca6a88f"}),
  'shared-nms002-l03-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p009-current-js-v1.json","bytes":43127,"sha256":"797f4f2d664edb5f724b649db4fe298238831ba5e10ea150867bee568bf3714e"}),
  'shared-nms002-l03-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p010-current-js-v1.json","bytes":33523,"sha256":"717785c089c452c95bb946b9ef8813ed50abdcbbf40f45fefb0cf35b4aab02c6"}),
  'shared-nms002-l03-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p011-current-js-v1.json","bytes":42037,"sha256":"7cf4275ddc20e77fc9ca7a0b1d96f5156c2472e768a91ec5d28334402928b788"}),
  'shared-nms002-l03-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p012-current-js-v1.json","bytes":33525,"sha256":"bb365423c93883caa41be98622e1499ff735a4a3053e89edcd352a6f3578a8b1"}),
  'shared-nms002-l03-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p013-current-js-v1.json","bytes":42038,"sha256":"128073600ffbc39edbc47d602f74a023c392522017a77434bd27ebb13a45be4d"}),
  'shared-nms002-l03-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p014-current-js-v1.json","bytes":33523,"sha256":"d773e90b1f6dbd10191a344b2e600cf5decca84e052bcdbb83049a5afd0ea6c8"}),
  'shared-nms002-l03-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p015-current-js-v1.json","bytes":33525,"sha256":"82cac2fa04ec2bf80686e47c7ceb8120e8795b7b9fcc0c057a66274635ac95e7"}),
  'shared-nms002-l03-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p016-current-js-v1.json","bytes":33525,"sha256":"fd3e208db0202b2f828f6de10a4126c463f5a5d04785e5c3cedb3459d6420458"}),
  'shared-nms002-l03-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p017-current-js-v1.json","bytes":33523,"sha256":"8d4b57bff5643a50f5c9a30f7bec05da99749f5f3f7b7538d09810a5d508fd37"}),
  'shared-nms002-l03-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p018-current-js-v1.json","bytes":42037,"sha256":"604909768953cffce7b5d8bba7d4ffdff84281a38292c8ceb8e737ca5195d5f6"}),
  'shared-nms002-l03-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p019-current-js-v1.json","bytes":33525,"sha256":"ad7e19b518d596673e42de766ca1bd55b093362de197fded595d0854b00e67e2"}),
  'shared-nms002-l03-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p020-current-js-v1.json","bytes":34635,"sha256":"7d150e6ba1ac36c558455fd16868eb12e06489a0260555a74d79d076fdbb00b4"}),
  'shared-nms002-l03-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p021-current-js-v1.json","bytes":33524,"sha256":"a97ae9326185c291c93decef8688f3059e0948ff15a6dfb5e2636dbe7f6bb203"}),
  'shared-nms002-l03-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p022-current-js-v1.json","bytes":33523,"sha256":"3c47a75d806b96a618d398e87ffabeb63254d2637b96cc3b29c27f86926d16ee"}),
  'shared-nms002-l03-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p023-current-js-v1.json","bytes":34068,"sha256":"f944ba2c4245468f2fb9fd8c2bc25d904e5fcee249db36fa46f0c6599989d2a4"}),
  'shared-nms002-l03-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p024-current-js-v1.json","bytes":34346,"sha256":"0dd9833bab585566176c98c93206f51c64079c9d5612857f7c5f92e0b7bef009"}),
  'shared-nms002-l03-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p026-current-js-v1.json","bytes":33524,"sha256":"b0e380a95510db39c92aaea33f578b4fa21a0e6ab106467e3f970b28150d37dc"}),
  'shared-nms002-l03-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p027-current-js-v1.json","bytes":43132,"sha256":"0fedb607aafd4824956718a1c06ee6defdd1d2cdee4620d0bcacf276174f4e81"}),
  'shared-nms002-l03-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p028-current-js-v1.json","bytes":33792,"sha256":"62280112003180c521d2a9edb17880da3d0fdc069004aead6c4b43e32da92ab7"}),
  'shared-nms002-l03-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p029-current-js-v1.json","bytes":33526,"sha256":"cb7df637885d81cbac7ecf03d4c1560a71cdd7492807263ebe201ac21e96371f"}),
  'shared-nms002-l03-p030': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p030-current-js-v1.json","bytes":43132,"sha256":"a4e7de61b8b9126f7ff4445898d181fa49f4a8f267f2da1889f4f765c9c74ed7"}),
  'shared-nms002-l03-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p031-current-js-v1.json","bytes":35201,"sha256":"b79ca109a1c12cb009c4f651db27fb987f274d6dad14cf91183c62adcfdc7533"}),
  'shared-nms002-l03-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p032-current-js-v1.json","bytes":33525,"sha256":"8d392e560240f0f153cfa770fbb5ae07bc198e4326d9cd1a1ae483bb8fdbb926"}),
  'shared-nms002-l03-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p033-current-js-v1.json","bytes":43133,"sha256":"cb2655c959827256bf390e20c43d588e9149bc18b727bffb1d47eb73985b1bc3"}),
  'shared-nms002-l03-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p034-current-js-v1.json","bytes":33525,"sha256":"031f68a133ff171081ce3b649b99ae37d6fedda38671c18aed15b5d99615adc8"}),
  'shared-nms002-l03-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p035-current-js-v1.json","bytes":43134,"sha256":"b0be4148a7602f6d52a8eed853a18b954ac7823cbf57dc69f952ecc34a87e75c"}),
  'shared-nms002-l03-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p036-current-js-v1.json","bytes":33525,"sha256":"94ff8a089aecd07a45967fef68101695fea3f45d626b52f73bc6c92d4889dc26"}),
  'shared-nms002-l03-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p037-current-js-v1.json","bytes":43134,"sha256":"dca2a13998bba572aa53bff779d368149359993d903edf30b18742bd0b902f29"}),
  'shared-nms002-l03-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p038-current-js-v1.json","bytes":33528,"sha256":"ca747ef12d9d186f1608d7090407d0bc3f718e650f8029f9937d6bd8e52815f7"}),
  'shared-nms002-l03-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p039-current-js-v1.json","bytes":43134,"sha256":"f8a9c5229d91b354eaf4e8758e4349b07c21794d8c7bd042111b8c08875abc40"}),
  'shared-nms002-l03-p040': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p040-current-js-v1.json","bytes":41496,"sha256":"84ea0cd3b77dec8b05babcc9ac1eec282ba77281306f3f1fc6f2eef378343712"}),
  'shared-nms002-l03-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p041-current-js-v1.json","bytes":41495,"sha256":"e3dcaee17e6dff96b06064435605f5cef258e7c3757667675bb245533dc8ffa0"}),
  'shared-nms002-l03-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p042-current-js-v1.json","bytes":41496,"sha256":"34c7dd3edf7167cf0e34ca7b91c66ed231f1cc835bcb27ebc180c8317c38257a"}),
  'shared-nms002-l03-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p043-current-js-v1.json","bytes":41497,"sha256":"102a11f672197a7d8b135dd182f221096964a5e5a0563eb8d237e7d7ce1a72e9"}),
  'shared-nms002-l03-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p044-current-js-v1.json","bytes":41498,"sha256":"6537736a74ba62093304be0fc5a378fe511fdb5191544e6c389d86e173b80108"}),
  'shared-nms002-l03-p045': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p045-current-js-v1.json","bytes":41495,"sha256":"cba0eb7bf08ca8ea17930e9dc46c9eced3ed0d96e4889057d56cac107670669e"}),
  'shared-nms002-l03-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p046-current-js-v1.json","bytes":43909,"sha256":"5f96538dc260c1e0ae249f69bfbe75c811b3a223c78e843ff357a1d7195fc91d"}),
  'shared-nms002-l03-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p047-current-js-v1.json","bytes":33525,"sha256":"c37bccd14f08bec7529d3712883dbb7362cfb8a306aa284130c4c05b084dbf94"}),
  'shared-nms002-l03-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p048-current-js-v1.json","bytes":33523,"sha256":"2b3278d8d8eb42d854ce6a5f9e877dbff5a7558802799d937cfc3850f51719ec"}),
  'shared-nms002-l03-p049': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p049-current-js-v1.json","bytes":33525,"sha256":"489f53e5b1281534200740c523e600f6983cabaecef980d0669c6178d3726468"}),
  'shared-nms002-l03-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p050-current-js-v1.json","bytes":33523,"sha256":"216305ec6eb6f7f097dd0979907c70373769a19462711c72851f5e9086a9742d"}),
  'shared-nms002-l03-p052': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p052-current-js-v1.json","bytes":36870,"sha256":"f52ab24a59080e6a4fa7cc6d6656e7fe9d2d50b0872f64c28c70c90af6516f3c"}),
  'shared-nms002-l03-p053': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p053-current-js-v1.json","bytes":36870,"sha256":"ec9a22c6f0bf3c05870e55c2f2389dd461a8beafae0350038b9892503795c070"}),
  'shared-nms002-l03-p054': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p054-current-js-v1.json","bytes":36870,"sha256":"c1c2b5cbaf31db230a253dd9f22d8a15aed266a386e011a6c2a2b3a0fb4f3c36"}),
  'shared-nms002-l03-p056': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-factory-registration-v1-shared-nms002-l03-p056-current-js-v1.json","bytes":32959,"sha256":"99a483028267479da55def183de96035c54edfd24625a22d5ac537ee6a2447bd"}),
  'shared-dat001-l07-p001': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p001-current-js-v1.json","bytes":34081,"sha256":"9ac6970725efde5d61e09191bbadfdd150ad81ddaebcdb8bc623ef0b54b6618d"}),
  'shared-dat001-l07-p002': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p002-current-js-v1.json","bytes":41408,"sha256":"5f0a464bf7a0a85036cbafc2a67b99d0ff4d461f7d45e8c95caf7c6ce1e7d694"}),
  'shared-dat001-l07-p003': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p003-current-js-v1.json","bytes":40326,"sha256":"d2292f7ee1b35491b01e53b0f648334aea07b08d402cb58d687620ac248206df"}),
  'shared-dat001-l07-p004': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p004-current-js-v1.json","bytes":40330,"sha256":"280b4970b36999af2c70c29a005ee92a94d9fb3217cecc529b392147ab250f45"}),
  'shared-dat001-l07-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p005-current-js-v1.json","bytes":36513,"sha256":"501243ff9c2a3a43a34b57689e750668c138b768bebbe8ab2380fb738fb222f7"}),
  'shared-dat001-l07-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p006-current-js-v1.json","bytes":34905,"sha256":"d66cfe9f8bb47fcbfe05950eda161c5ce6e578fe14a2609812cf4702d788f6f6"}),
  'shared-dat001-l07-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p007-current-js-v1.json","bytes":34905,"sha256":"481b9b1464ff43c58d60824d31763b71eb226efa493b57b628edfefdd6931a3b"}),
  'shared-dat001-l07-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p008-current-js-v1.json","bytes":35776,"sha256":"0af4f139cab4033bf1636971de4333bd2e7e487ec4c80938ac9deac1f328ea77"}),
  'shared-dat001-l07-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p009-current-js-v1.json","bytes":36318,"sha256":"d64e8407ab88fd2b85c73ae43691a51312c0e35cb582bc784d4c4311f9146652"}),
  'shared-dat001-l07-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p010-current-js-v1.json","bytes":33277,"sha256":"4d650775fcb3694ad9e032dab9182834d381088b94a9a931917658e72e6e8809"}),
  'shared-dat001-l07-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p011-current-js-v1.json","bytes":33276,"sha256":"cd5dd67b97afbee2a127a80304628c3aa803c9de34235859fd4e85d8ed9e7343"}),
  'shared-dat001-l07-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p012-current-js-v1.json","bytes":33273,"sha256":"8c55df1c94e0911a97d74208829791f24bd55263fe13f2bccd6738c75f6f81fa"}),
  'shared-dat001-l07-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p013-current-js-v1.json","bytes":35229,"sha256":"e6b365fb1a3496a4840dce595c349e529252f7aaf3dc0a2a489a2166bd16c7cd"}),
  'shared-dat001-l07-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p014-current-js-v1.json","bytes":33276,"sha256":"9f4cd3ea89de0e61b3107cdc75df42ce3242585cf2a710820376a5c6c820e2ce"}),
  'shared-dat001-l07-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p015-current-js-v1.json","bytes":33273,"sha256":"630ff22c6bcb12e0603a4699158005d7d3c6a4fcab72ec2bf0122ddfdd44c952"}),
  'shared-dat001-l07-p016': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p016-current-js-v1.json","bytes":35228,"sha256":"0cedcc3e4734beee13fe57af048531aa0b36f51d7a40c6f508aba54b739007d7"}),
  'shared-dat001-l07-p017': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p017-current-js-v1.json","bytes":35228,"sha256":"8be8ce96b1a501ecb71d4dae0b31b5903957dd59d1efa75accf30269558243dd"}),
  'shared-dat001-l07-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p018-current-js-v1.json","bytes":33278,"sha256":"0aa110c921e1c6af1e97b79af02b8f4c8ca6242bdd2bec9086aa16c246df71dc"}),
  'shared-dat001-l07-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p019-current-js-v1.json","bytes":35229,"sha256":"12086e7c81a1605d0b4966a46cb7e05221de500c24e4e3f86d8d2cf53320257e"}),
  'shared-dat001-l07-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p020-current-js-v1.json","bytes":33550,"sha256":"df5b86b89a22c748446495f8c87504deb286f22a97ba599c4212e873fca9933a"}),
  'shared-dat001-l07-p021': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p021-current-js-v1.json","bytes":35230,"sha256":"ad5627990a1a628ac8d805b8abe9be367651bfbfd853fccffd96bda58513bd31"}),
  'shared-dat001-l07-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p022-current-js-v1.json","bytes":33279,"sha256":"f464c27a1f5c563aac2e91a7d4c619dde34f99bdeb1d16030bf09bf24732e13b"}),
  'shared-dat001-l07-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p023-current-js-v1.json","bytes":33276,"sha256":"2387e654eb2f34ce9a90fffe26f479e7e763468a1c1139873e0105be33fbce98"}),
  'shared-dat001-l07-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p024-current-js-v1.json","bytes":35229,"sha256":"00b35c521d0aaeaa51035032c94e2fc757726d67e889d4062f3a686829917b17"}),
  'shared-dat001-l07-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p026-current-js-v1.json","bytes":33276,"sha256":"09c63abffb1250245dc2e3924657f2f2e7d8fca68a3191231c730e176a44c413"}),
  'shared-dat001-l07-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p027-current-js-v1.json","bytes":33272,"sha256":"b3132220198fa021608518f921a7390c0370f19b75afc5c969843f36566db0c4"}),
  'shared-dat001-l07-p028': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p028-current-js-v1.json","bytes":42324,"sha256":"b2ed661ad9e7185d090b7ca6a6c0c780be49406120057ad6fc92b02100558560"}),
  'shared-dat001-l07-p029': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p029-current-js-v1.json","bytes":42324,"sha256":"b4f61341771deab413240ca750f424e0f4d226b2cb129bac747a382cde83de3a"}),
  'shared-dat001-l07-p030': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p030-current-js-v1.json","bytes":42324,"sha256":"11db7df7a9b1e017d3a18081e8da2c0de524619ef963e4bc371ff66c891e1193"}),
  'shared-dat001-l07-p031': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p031-current-js-v1.json","bytes":42323,"sha256":"7c218c60b3475323b8e40f77bc1dea76c8b8e7e4e30e1a41e231d6cda4c60746"}),
  'shared-dat001-l07-p032': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p032-current-js-v1.json","bytes":42325,"sha256":"43213e77a3414eba0584f7e918d4eabf73912da96907c8f837b28e83631162ff"}),
  'shared-dat001-l07-p033': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p033-current-js-v1.json","bytes":42328,"sha256":"f9af0c5830af8bb61d6d19d36e9e4cde1bf61b12b0ecaccd7a69a3bc2e476085"}),
  'shared-dat001-l07-p034': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p034-current-js-v1.json","bytes":42324,"sha256":"826c9ae36c78f80ec3a6c9b0333930301ea9f8f1a7333da928b243467f843da0"}),
  'shared-dat001-l07-p035': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p035-current-js-v1.json","bytes":42324,"sha256":"bd46de42c4aa25d40eb407ca69ce6bd9501d3ffdc0fcc9108ae7821da3f17727"}),
  'shared-dat001-l07-p036': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p036-current-js-v1.json","bytes":42325,"sha256":"4fb5fa2edc0b8b7f6164f022f9f956b82c20b9c64f003c4e3cdb0c9e867bcd9d"}),
  'shared-dat001-l07-p037': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p037-current-js-v1.json","bytes":42325,"sha256":"66665f5f126615aa12b213240e91379572c93dbcb427de0f15d717c312aa4c17"}),
  'shared-dat001-l07-p038': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p038-current-js-v1.json","bytes":42325,"sha256":"3b4dc98d071c47105bf0effa9092d2ee75067c6166aa56f737575bba1be14dfc"}),
  'shared-dat001-l07-p039': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p039-current-js-v1.json","bytes":33007,"sha256":"3d042b8a5d574b71a69fcbc4eb871767141338ce38547738f4c9fe9c0fdc010c"}),
  'shared-dat001-l07-p040': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p040-current-js-v1.json","bytes":38499,"sha256":"869dc7a0ffe3731cd7af005d6e00d7a2daa0edcaf18e117b083af1a9bae2a413"}),
  'shared-dat001-l07-p041': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p041-current-js-v1.json","bytes":33273,"sha256":"70030f3cf5fe01d3bcb0be6ad0fe95b2e935c14dc2ba63ce6b9e1910470dc28a"}),
  'shared-dat001-l07-p042': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p042-current-js-v1.json","bytes":33271,"sha256":"119810519b8d0dbdfb2242687a272142a6ab0835f1989eecdd887d8e79efbd25"}),
  'shared-dat001-l07-p043': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p043-current-js-v1.json","bytes":33273,"sha256":"28f69a03791a2eaae3a73cdd0ecb2f7cc226dce4c41720c583a1b731618f63c0"}),
  'shared-dat001-l07-p044': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p044-current-js-v1.json","bytes":33273,"sha256":"c35a6e2a9c338c6a82af99186807e8229c732d86f6b843d423d2b473bfb1ffa2"}),
  'shared-dat001-l07-p046': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p046-current-js-v1.json","bytes":36618,"sha256":"1d8d04efc47a3100b5db52854f0c4b8e4be6c8022713f5ef1c5392809b4c007c"}),
  'shared-dat001-l07-p047': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p047-current-js-v1.json","bytes":36618,"sha256":"4a606ad75aa4f7e89195c80522d1b407001a7e902ac45060bb024b8bb02e86dd"}),
  'shared-dat001-l07-p048': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p048-current-js-v1.json","bytes":36619,"sha256":"3024e4a12b8bd94e4fd9b29f6cd544b0b33ba2507475eabb9ed9192dbb5921fe"}),
  'shared-dat001-l07-p050': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-dat-l07-factory-registration-v1-shared-dat001-l07-p050-current-js-v1.json","bytes":32707,"sha256":"ace1be440f29390380c196837ed5bdbbcef7108d49df70df4ee46203dc321af7"}),
  'shared-nms002-l11-p027': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p027-reader-repair-stage-v3-shared-nms002-l11-p027-current-js-v1.json","bytes":64953,"sha256":"f0faebf045d465562f23d97da9a0e719b36cf9dd5082bd334460dab3d15bdd67"}),
  'shared-nms002-l11-p026': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p026-life-continuation-touch-ui-v7-stage-v1-shared-nms002-l11-p026-current-js-v1.json","bytes":87578,"sha256":"0019c80e5b9833eca4635e669d451dcda1164f9ed312cd94f88b5945c97a842c"}),
  'shared-nms002-l11-p024': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p024-presentation-life-resume-v4-shared-nms002-l11-p024-current-js-v1.json","bytes":89709,"sha256":"5ee406e59d7bd7207f031544177b093cf86a1b32c8cb94b66873fdb9df22b25b"}),
  'shared-nms002-l11-p023': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p023-claude-glyph-v2-shared-nms002-l11-p023-current-js-v1.json","bytes":68428,"sha256":"88b46b5ebb5f3fa97b934e9d82e1c452583f9d142d571b6c1078c2fcaee5618f"}),
  'shared-nms002-l11-p022': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p022-product-repair-life-session15-v1-shared-nms002-l11-p022-current-js-v1.json","bytes":80741,"sha256":"a5b1208b3bd02d237e7f361a7c3be1e18730e094df2955768e6ad5a6f001a499"}),
  'shared-nms002-l11-p020': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p020-product-repair-life-session14-v1-shared-nms002-l11-p020-current-js-v1.json","bytes":98857,"sha256":"bb65755ee4923408be3d0dca3b8bc5494d04106deb8e1cf4c965c56bffac3976"}),
  'shared-nms002-l11-p019': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p019-product-repair-life-session13-v1-shared-nms002-l11-p019-current-js-v1.json","bytes":108314,"sha256":"dd4c2740b58f8be3962f0f050c63a00e498e6806ead9766a4d8c61f2ad43f1fe"}),
  'shared-nms002-l11-p018': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p018-product-staged-p018-life-session11-v1-shared-nms002-l11-p018-current-js-v1.json","bytes":99865,"sha256":"a9fba5756556d5d6bf4fae7fde28c7242957f29922b5e508856813ef29192b39"}),
  'shared-nms002-l11-p015': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p015-product-staged-connection-session9-v1-shared-nms002-l11-p015-current-js-v1.json","bytes":57269,"sha256":"d9c47d03850a93cea36190e12792299c44bce37812bb94350fda82ab070904f9"}),
  'shared-nms002-l11-p014': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p014-native-stability-connection-session9-v1-current-js-v1.json","bytes":112505,"sha256":"67fd1ecfa950f202564db696eca8dee8ae82a501317893f3e1b77235b7d108f1"}),
  'shared-nms002-l11-p013': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p013-product-installed-focus-session6-v1-shared-nms002-l11-p013-current-js-v1-path-repair-session7-v1.json","bytes":215185,"sha256":"63103dd112dd29f1b2c6cbb2a20acf7a59513f2854884adb8895add2670dc08d"}),
  'shared-nms002-l11-p012': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p012-generated-focus-session6-v1-shared-nms002-l11-p012-current-js-v1.json","bytes":462859,"sha256":"df6336dfbd940aa8c32fae5a1dc98c19ceaba6f75f5951af60b146e57a60818e"}),
  'shared-nms002-l11-p011': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p011-glyph-repair-session6-v1-shared-nms002-l11-p011-current-js-v1.json","bytes":195292,"sha256":"1f1126c7dc14f38aeef4f0dec25725808e1f0bf0b6ee90a675da8f20d52ec6e3"}),
  'shared-nms002-l11-p010': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p010-product-installed-after-native-occlusion-session5-v1-shared-nms002-l11-p010-current-js-v1.json","bytes":67643,"sha256":"d40b309a80345b729ad95dae16092d5e598c821167f715f941a4119342361c1b"}),
  'shared-nms002-l11-p009': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p009-product-installed-native-ready-focus-v1-shared-nms002-l11-p009-current-js-v1.json","bytes":71991,"sha256":"4a8e6dc103d0bc50f92572bd632967519fd23fe2d6530d87aa427e19537a37bc"}),
  'shared-nms002-l11-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p008-product-installed-runtime-completion-session4-v1-shared-nms002-l11-p008-current-js-v1.json","bytes":72214,"sha256":"c32f7ddc217415a52065e13485c8cdadd7e75ab1419064f74896c2db66ef8102"}),
  'shared-nms002-l11-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p007-product-installed-header-session4-v1-shared-nms002-l11-p007-current-js-v1.json","bytes":65493,"sha256":"2eee2a7ff806c29994add6431f1fc5679636cd5d685cb8fad4142a54e3b06071"}),
  'shared-nms002-l11-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p006-product-installed-session3-v1-shared-nms002-l11-p006-current-js-v1.json","bytes":56814,"sha256":"c7298e8a858fa3597fd3ebf9e40eaeac39b643a5496743505f429ae617f54c71"}),
  'shared-nms002-l11-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l11-p005-product-installed-session3-v1-shared-nms002-l11-p005-current-js-v1.json","bytes":51230,"sha256":"81c4504c28cc08e0195056e035eeb68c9b84167ee0fd41ea84f91bb44ef9bae4"}),
  'shared-nms002-l06-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l06-p005-product-installed-session3-v1-shared-nms002-l06-p005-current-js-v1.json","bytes":51524,"sha256":"a20061374aa62332e9e6f358296ac7edd7ad65788c714e550ecc9d637beec49b"}),
  'shared-geo001-l03-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-geo-l03-p007-product-installed-focus-session3-v1-shared-geo001-l03-p007-current-js-v1.json","bytes":50188,"sha256":"3a4e6346c6e7d3d564e41dd450491a1967702391b9f725878ab7b6116f93eff0"}),
  'shared-nms002-l03-p005': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-vocabulary-batch-installed-v2-shared-nms002-l03-p005-current-js-v1.json","bytes":38350,"sha256":"e2683a8c43aa9735629846f4dd8ed7e93ad6cbfc7bc6173ece7d1c2e2161dcfc"}),
  'shared-nms002-l03-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-vocabulary-batch-installed-v2-shared-nms002-l03-p006-current-js-v1.json","bytes":38195,"sha256":"5611fdde5dee5bf4b9018880f2f0083b58bdb38f0ccad235cde0db46096fca38"}),
  'shared-nms002-l03-p008': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l03-vocabulary-batch-installed-v2-shared-nms002-l03-p008-current-js-v1.json","bytes":38191,"sha256":"a874f5a7ca1c9ab39f13ffe8ca3ad74872fcfd04de3a0ce6f99ea3f880a5025e"}),
  'shared-alg001-l02-p007': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-alg-l02-p007-product-nested-clip-v1-shared-alg001-l02-p007-current-js-v1.json","bytes":48614,"sha256":"88659dbb3ce3d7bc66430d376c13970e69e2e704df0a806227f161b75e9a1b65"}),
  'shared-nms002-l08-p006': Object.freeze({"path":"catalog/product-bridge-calibrations/g678-hfr-nms-l08-p006-product-title-wrap-v1-shared-nms002-l08-p006-current-js-v1.json","bytes":51482,"sha256":"18cafc0bd1fb0052cbd86067048f245bd444331dcc151fc29efeffae1d791cec"}),
  'shared-nms002-l07-p005': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l07-p005-product-v9-shared-nms002-l07-p005-current-js-v1.json',
    bytes: 219334, sha256: '499c96a4b3e24996195389c407710b86f283682cc71c40874251c1930d2d7f67',
  }),
  'shared-nms002-l10-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l10-p001-product-v7-shared-nms002-l10-p001-current-js-v1.json',
    bytes: 143960, sha256: '2f65b9da16b6bfb853417d535d1f52a28e34e9ab8289dbfe80264edc7374e5af',
  }),
  'shared-nms002-l12-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l12-p001-product-v7-shared-nms002-l12-p001-current-js-v1.json',
    bytes: 144650, sha256: '1ad3f696af2ebed69857e7161b94c28aaa93ce7e009b9e2e6e1d9969d0334064',
  }),
  'shared-nms002-l11-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l11-p001-product-v6-shared-nms002-l11-p001-current-js-v1.json',
    bytes: 165756, sha256: '46c81d9319ddada6fde8845c30891a27711ff106d14e1f0e8497bcf0c630199c',
  }),
  'shared-nms002-l06-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l06-p001-product-v6-shared-nms002-l06-p001-current-js-v1.json',
    bytes: 165872, sha256: '26c993d42c3a3ed1a41e47b198769cc13bfc96cf743096a388fa089f4ac5af96',
  }),
  'shared-nms002-l05-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l05-p001-product-v6-shared-nms002-l05-p001-current-js-v1.json',
    bytes: 165790, sha256: '2d340a205f8bf5c96475cb27e15b45bf408cc878be072f7a798413f039a9d952',
  }),
  'shared-nms002-l03-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l03-p001-product-v6-shared-nms002-l03-p001-current-js-v1.json',
    bytes: 166084, sha256: 'c2058065efdf62fb995942d91ad624e9e625206620156a0d8d6799469ce32ba1',
  }),
  'shared-nms002-l09-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l09-p001-product-v5-shared-nms002-l09-p001-current-js-v1.json',
    bytes: 131833, sha256: '2780ed885083a3295c571e8d104edd67bf13e278073baf2d97a707105d9855c0',
  }),
  'shared-nms002-l04-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l04-p001-product-v5-shared-nms002-l04-p001-current-js-v1.json',
    bytes: 131497, sha256: '5c3db1a8ceaaadc1a6c54e946d0a7efdc224c1709d65e757adbdba58ea070a49',
  }),
  'shared-nms002-l07-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l07-p001-product-v4-shared-nms002-l07-p001-current-js-v1.json',
    bytes: 101713, sha256: '306cc2c80d26a6e7f55d934ce1e3fec5f5a99543e078ad7218fa52f4bd35e926',
  }),
  'shared-nms002-l08-p001': Object.freeze({
    path: 'catalog/product-bridge-calibrations/g678-hfr-nms-l08-p001-product-v4-shared-nms002-l08-p001-current-js-v1.json',
    bytes: 87775, sha256: 'b12b887210fa65f74e935e88a696d3b76547b93f40f4009c2586ebf0bd141946',
  }),
});

type HfrReadContext = {
  root: string;
  transaction?: ReturnType<typeof readRegistryTransaction>;
  index?: ReturnType<typeof readJsonPin>;
  host?: ReturnType<typeof verifyHostVersion>;
};
function hfrReadContext(): HfrReadContext {
  assert(process.env.NODE_ENV === 'development' && !process.env.VERCEL &&
    !process.env.VERCEL_ENV && isG678LocalPreviewEnabled(), 'HFR local development only');
  return {root: getWorkspaceRoot()};
}
function readHfrPacketInContext(animationId: string, context: HfrReadContext) {
  const pin = CANDIDATES[animationId];
  assert(pin, 'HFR candidate is not selected');
  const {root} = context;
  const packet = readJsonPin(root, pin) as HfrPacket;
  assert(packet.schemaVersion === 1 && packet.deploymentScope === 'local-only' &&
    packet.entry.key === animationId && packet.meta.key === animationId &&
    packet.meta.sourceSha256 === packet.source.sha256 && packet.selectedPages.length === 1 &&
    packet.selectedPages[0]?.animationId === animationId && packet.runtimeQuery.seed === '0', 'HFR exact candidate identity and runtime seed');
  // The actual registry and canonical dispatch determine the branch. A URL,
  // asset referrer or requested document mode cannot grant registered reads.
  const transaction = context.transaction ??= readRegistryTransaction(root);
  const calibrations = transaction.registry.calibrations as readonly {
    calibrationId: string; deploymentScope: string; freezeManifest: string;
    freezeManifestBytes: number; freezeManifestSha256: string; entries: readonly HfrPacket['entry'][];
  }[];
  const matches = calibrations.filter(calibration => calibration.entries.some(entry => entry.key === animationId));
  assert(matches.length <= 1, 'HFR unique actual registration');
  const registration = localOnlyAnimationModuleRegistration(animationId);
  if (matches.length === 0) {
    assert(!registration, 'HFR generated registration has no actual registry entry');
    validateHfrCurrentProducer(root, packet, packet.entry, packet);
    for (const input of packet.integrity.files) readPin(root, input);
    return {root, pin, packet, registered: false};
  }
  const calibration = matches[0]!;
  assert(calibration.deploymentScope === 'local-only' && calibration.calibrationId === packet.calibrationId &&
    calibration.freezeManifest === pin.path && calibration.freezeManifestBytes === pin.bytes &&
    calibration.freezeManifestSha256 === pin.sha256 && calibration.entries.length === 1, 'HFR exact registered calibration');
  assert.deepEqual(calibration.entries[0], packet.entry, 'HFR exact registered page entry');
  assert(registration?.deploymentScope === 'local-only' && registration.calibrationId === packet.calibrationId &&
    registration.freezeManifestSha256 === pin.sha256 && registration.moduleSha256 === packet.entry.artifacts.module.sha256 &&
    'generatedModuleSha256' in registration && 'pageDataSha256' in registration && 'artifactClosureSha256' in registration &&
    registration.generatedModuleSha256 === packet.entry.artifacts.generated.sha256 &&
    registration.pageDataSha256 === packet.entry.artifacts.data.sha256 &&
    registration.artifactClosureSha256 === packet.entry.artifacts.closure.sha256, 'HFR actual generated registration');
  const index = context.index ??= readJsonPin(root, G678_ADMISSION_INDEX);
  assert(index.schemaVersion === 1 && index.kind === 'g678-admission-index-v1' && Array.isArray(index.pages), 'HFR active admission index');
  const admitted = index.pages.filter((page: {animationId: string}) => page.animationId === animationId);
  assert(admitted.length === 1, 'HFR one active page proof');
  // The common reader verifies own artifacts, frozen compiler and source bytes;
  // only shared inputs may use its exact current-host/snapshot transitions.
  const verified = readPageProof(root, admitted[0].proof, context.host ??= verifyHostVersion(root, index.host), transaction);
  const {freezeManifest, ...frozenPacket} = verified;
  assert.deepEqual(freezeManifest, pin, 'HFR active proof binds selected freeze');
  assert.deepEqual(frozenPacket, packet, 'HFR active proof is the exact selected packet');
  return {root, pin, packet, registered: true};
}
export function readHfrLocalPacket(animationId: string) {
  return readHfrPacketInContext(animationId, hfrReadContext());
}

/** This payload has already passed the page packet's complete byte bindings.
 * Preserve prior lesson entries and add only the exact reviewed source terms. */
function hfrGlossaryProjection(base: PageOnlyLessonPlayerDescriptor, packet: HfrPacket):
  Partial<Pick<PageOnlyLessonPlayerDescriptor, 'glossary' | 'support'>> {
  const addition = packet.glossary;
  if (!addition) {
    assert(!["shared-nms002-l11-p027","shared-nms002-l11-p026","shared-nms002-l07-p005","shared-nms002-l08-p006","shared-alg001-l02-p007","shared-nms002-l03-p005","shared-nms002-l03-p006","shared-nms002-l03-p008","shared-geo001-l03-p007","shared-nms002-l06-p005","shared-nms002-l11-p005","shared-nms002-l11-p006","shared-nms002-l11-p007","shared-nms002-l11-p008","shared-nms002-l11-p009","shared-nms002-l11-p010","shared-nms002-l11-p011","shared-nms002-l11-p012","shared-nms002-l11-p013","shared-nms002-l11-p014","shared-nms002-l11-p015","shared-nms002-l11-p018","shared-nms002-l11-p019","shared-nms002-l11-p020","shared-nms002-l11-p022","shared-nms002-l11-p023","shared-nms002-l11-p024"].includes(packet.entry.key), 'HFR source glossary is required');
    return {};
  }
  const profile = (Object.freeze({
  "shared-nms002-l11-p027": {"source":"bf11159ecf9dbb76b887f303e707bc0f55697e5ec8b5386ea1b3d6eb524632f5","terms":["comparison","express","integers","irrational-numbers","opposite","ratio","rational-numbers","whole-numbers"]},
  "shared-nms002-l11-p026": {"source":"a1b2d1ad691061ca206dab4b868eb9ffede0f880cbc58d1888db2896fe0fb4ea","terms":["column","equivalent","rational-numbers"]},
  "shared-nms002-l11-p024": {"source":"0230d992f1dda200d5a1e1b8e14ec7beffe9e28059577cda3f19db1102096fed","terms":["decimal","digit","pattern","repeating-decimals"]},
  "shared-nms002-l11-p023": {"source":"40c19a286fb238b1c3d824bfc24cb44376640e9ac0f314cb47b9e08d689a1fb4","terms":["rational-numbers","repeating-decimals","terminating-decimal"]},
  "shared-nms002-l11-p022": {"source":"36d1bc4ef0af5a83b10e3a908274c91b621161b581ed3775f84b559260ebbb87","terms":["number-line","point","rational-numbers"]},
  "shared-nms002-l11-p020": {"source":"4f3da6d49a2281938ea9a064eb6376a961ba705654f96b11633c7e4ae8990f59","terms":["decimal","ones-group","place-value-chart","rational-numbers","thousands-group"]},
  "shared-nms002-l11-p019": {"source":"2953b69c2fd544e580eda2a87153e2010177f83a229e67e0d07824b7bcdb209d","terms":["decimal","equivalent","ones-group","place-value-chart","rational-numbers","thousands-group"]},
  "shared-nms002-l11-p018": {"source":"9bc7bdad82be899cde533f17144de0fd45f643d16b890ea6bf70252d2f89be3d","terms":["decimal","ones-group","place-value-chart","thousands-group"]},
  "shared-nms002-l11-p015": {"source":"8c58397c556153b5f2104398939a179af077babafb469caba63ef214818c9b55","terms":["denominator","equivalent","fraction","numerator","rational-numbers"]},
  "shared-nms002-l11-p014": {"source":"9d79c185ac136146d1106d8f9082707646d2f0b3990d739ee06a00bac73a6092","terms":["expression","integers","number-line","position","ratio","rational-numbers"]},
  "shared-nms002-l11-p013": {"source":"4428cd1ec3380278a15310580187a282d0ee148eef943379cf7e6be8835111c0","terms":["express","integers","ratio","rational-numbers"]},
  "shared-nms002-l11-p012": {"source":"6a374691151f299737f718a17921db4d50b68040c6516df1d779279f17a002a5","terms":["decimal","express","form","fraction","integers","ratio","rational-numbers","word-form"]},
  "shared-nms002-l11-p011": {"source":"08a31899ced03455e03b51ce846f57108a6b98a8e442f6799b6a5cc4b46b8471","terms":["decimal","digit","pattern","repeating-decimals"]},
  "shared-nms002-l11-p009": {"source":"adec3c300a897fb11c12b06ab406a8c4352c0c24353f7890097c903fae6f67c5","terms":["express","integers","ratio","rational-numbers"]},
  "shared-nms002-l11-p010": {"source":"cfaacd10d60ed16d065fcf4d415550392233bf1d6f388bb22c687bcf5965bd08","terms":["express","integers","ratio","rational-numbers"]},
  "shared-nms002-l11-p008": {"source":"870edc144cd148165c3710f300cb53d448013ac2d828f0880f0030ebf73e8f67","terms":["ratio"]},
  "shared-nms002-l11-p007": {"source":"afc0d17523e1f062128750d922ac8ff5fdb8466eacdb28a12df6ae1483d531aa","terms":["comparison","express","integers","ratio","rational-numbers"]},
  "shared-nms002-l11-p006": {"source":"aef0af097fc096dd89b80352c174347b0b0dec67e6512c3aa543ecdeda86ff98","terms":["integers","opposite","whole-numbers"]},
  "shared-nms002-l11-p005": {"source":"7247edeaf29fbb3961b2e3a1e4895f1d3b5f49b49432c9fb53a5e8694afbf345","terms":["compare","order","rational-numbers"]},
  "shared-nms002-l06-p005": {"source":"d9d54076d4d0bc3e69ab9d9e5c2aa874dfee5e108582d15aadde237b3dfab7a9","terms":["compare","decimal","operation","whole-numbers"]},
  "shared-geo001-l03-p007": {
    "source": "f3dafd38a0bb4c75df2c875b7fba81e32a25773e752c52a269db64c7f5e49207",
    "terms": ["construction", "triangle"]
  },
  "shared-nms002-l07-p005": {
    "source": "52e001516750770e9e3f406d2f49bc1deecee438e4c37c1efae1080058c3fba4",
    "terms": [
      "comparison",
      "proportion"
    ]
  },
  "shared-nms002-l08-p006": {
    "source": "2c485c8aad462c223cc42d0db9e07be42ab44f1cf4446c12b533fd77378ecaed",
    "terms": [
      "exponent",
      "multiplication",
      "related"
    ]
  },
  "shared-alg001-l02-p007": {
    "source": "7efba02ce4ee2c150df6ca2320a75d96b9592b19a47e42350fb708ff875e41fd",
    "terms": [
      "algebra",
      "expression"
    ]
  },
  "shared-nms002-l03-p005": {
    "source": "b358833f61c723c6649a0597fc404361697877ffa9878ee7f527c6534cbd7b51",
    "terms": [
      "fraction",
      "group"
    ]
  },
  "shared-nms002-l03-p006": {
    "source": "d79f4312e360bc52f9c9faf766e4cb322d8528114d7e14deb66049916572c26b",
    "terms": [
      "fraction",
      "numerator"
    ]
  },
  "shared-nms002-l03-p008": {
    "source": "d1607c89fea9eeaedc2872dcdcadd690da7a95bc1818224e3206686d61c7d914",
    "terms": [
      "denominator",
      "fraction"
    ]
  }
}) as Readonly<Record<string, Readonly<{source: string; terms: readonly string[]}>>>)[packet.entry.key];
  assert(profile && addition.sourceGlossary.pageKey === packet.entry.key &&
    addition.sourceGlossary.sourceSha256 === packet.source.sha256 && packet.source.sha256 === profile.source,
    'HFR exact source glossary page');
  const expected = profile.terms;
  assert.deepEqual(addition.descriptorEntries.map(entry => entry.id).sort(), expected, 'HFR exact descriptor glossary terms');
  const sourceRequests = hfrSourceGlossaryRequests(packet.entry.key, packet.source.sha256, addition);
  assert.deepEqual(sourceRequests.map(term => term.dictionaryEntryId).sort(), expected, 'HFR exact source glossary requests');
  const glossary = [...base.glossary];
  for (const entry of addition.descriptorEntries) {
    assert.deepEqual(Object.keys(entry).sort(), ['definitions', 'id', 'labels', 'source', 'sourceKeyAttribute'], 'HFR descriptor glossary fields');
    const existing = glossary.filter(candidate => candidate.id === entry.id);
    assert(existing.length <= 1, 'HFR duplicate prior glossary entry');
    if (existing[0]) {
      const {id, sourceKeyAttribute, labels, definitions, source} = existing[0];
      // L11 P030 retains its lowercase source key; an HFR page binds the same exact
      // bilingual entry under a differently cased key. Preserve the existing entry.
      const caseAlias = hfrGlossaryCaseAlias(existing[0], entry, addition.sourceGlossary.terms);
      assert.deepEqual({id, sourceKeyAttribute: caseAlias ? entry.sourceKeyAttribute : sourceKeyAttribute,
        labels, definitions, source}, entry, 'HFR conflicting source glossary entry');
    }
    else glossary.push(entry);
  }
  return {glossary: Object.freeze(glossary), support: Object.freeze({...base.support,
    lessonHostCapabilities: Object.freeze([...new Set([...base.support.lessonHostCapabilities, 'glossary' as const])]),
  })};
}

function hfrSourceOccurrence(base: PageOnlyLessonPlayerDescriptor, animationId: string, packet: HfrPacket) {
  const id = /^shared-(nms002|geo001|alg001|dat001)-l(\d{2})-p(\d{3})$/u.exec(animationId);
  assert(id, 'HFR placement identity');
  const target = base.pages[Number(id[3]) - 1];
  assert(base.course.moduleCode === id[1]!.toUpperCase() && base.course.lesson === Number(id[2]) &&
    target?.animationId === animationId && target.placementId === animationId &&
    target.source.assetId === `swf-${packet.source.sha256}` &&
    base.source.sourceXmlSha256 === packet.sourceXml.sha256 &&
    base.source.sourceXmlPath === `G6-G8-shared/${packet.sourceXml.path}` &&
    base.pages.length === base.course.activePageCount && base.course.courseShellCount === 0,
  'HFR exact source occurrence, XML and page-only denominator');
  return target;
}

/** Preserve every source occurrence and include each verified registered HFR
 * sibling in this lesson. Candidate selection itself never grants page credit. */
export async function hfrLocalLessonDescriptor(animationId: string, mode: 'candidate' | 'registered'):
  Promise<PageOnlyLessonPlayerDescriptor> {
  const context = hfrReadContext();
  return withAdmissionReadStageAsync(context.root, [G678_ADMISSION_INDEX,
    pinFile(context.root, 'apps/web/lib/g678-admission-activation.ts')], async () => {
  const requested = readHfrPacketInContext(animationId, context);
  const {pin, packet, registered: isRegistered} = requested;
  const snapshot = g678PartialCalibrationSnapshot();
  assert(snapshot.status === 'ready', `HFR predecessor: ${snapshot.error ?? snapshot.status}`);
  const id = /^shared-(nms002|geo001|alg001|dat001)-l(\d{2})-p(\d{3})$/u.exec(animationId);
  assert(id, 'HFR placement identity');
  const matches = snapshot.descriptors.filter(d => d.course.moduleCode === id[1]!.toUpperCase() &&
    d.course.lesson === Number(id[2]));
  assert(matches.length === 1, 'HFR source ordered lesson');
  const base = matches[0]!;
  const target = hfrSourceOccurrence(base, animationId, packet);
  if (mode === 'candidate') {
    assert(!isRegistered && target.rendererAvailability.kind === 'unavailable', 'HFR candidate stays unregistered');
  } else {
    assert(isRegistered, 'HFR actual registration and active proof');
  }
  const packets = [requested];
  const lessonPrefix = animationId.slice(0, -4);
  // Inspect registry membership/pin metadata before opening another candidate.
  // An unregistered or obsolete candidate must not break a registered sibling.
  for (const siblingId of Object.keys(CANDIDATES)) {
    if (siblingId === animationId || !siblingId.startsWith(lessonPrefix)) continue;
    const selected = CANDIDATES[siblingId]!;
    const calibrations = context.transaction!.registry.calibrations.filter((calibration: {
      deploymentScope: string; freezeManifest: string; freezeManifestBytes: number; freezeManifestSha256: string;
      entries: readonly HfrPacket['entry'][];
    }) => calibration.deploymentScope === 'local-only' && calibration.entries.some(entry =>
      entry.key === siblingId && entry.artifacts.kind === 'generated-typescript-hfr-v1') &&
      calibration.freezeManifest === selected.path && calibration.freezeManifestBytes === selected.bytes &&
      calibration.freezeManifestSha256 === selected.sha256);
    if (calibrations.length === 0) continue;
    assert(calibrations.length === 1, 'HFR unique same-lesson sibling registration');
    const sibling = readHfrPacketInContext(siblingId, context);
    assert(sibling.registered, 'HFR sibling remains actually registered');
    hfrSourceOccurrence(base, siblingId, sibling.packet);
    packets.push(sibling);
  }
  const registeredHfr = new Set(packets.filter(item => item.registered).map(item => item.packet.entry.key));
  const pages = base.pages.map(page => registeredHfr.has(page.animationId) ? Object.freeze({...page,
    rendererAvailability: Object.freeze({kind: 'registered' as const, moduleKey: page.animationId,
      runtimeQuery: Object.freeze({frameDomain: 'root', language: 'fixed-en' as const, scenario: 'hfr', seed: '0'})}),
  }) : page);
  let projected = base;
  for (const item of packets) projected = {...projected, ...hfrGlossaryProjection(projected, item.packet)};
  const registered = pages.filter(page => page.rendererAvailability.kind === 'registered').map(page => page.animationId);
  return Object.freeze({...projected, descriptorId: `${base.descriptorId}-hfr-${mode}`, calibrationId: packet.calibrationId,
    course: Object.freeze({...base.course, href: `/migration-status/g678-hfr/${animationId}/${mode}`}),
    source: Object.freeze({...base.source, candidateFreezeManifestPath: pin.path, candidateFreezeManifestSha256: pin.sha256}),
    pages: Object.freeze(pages), productBridge: Object.freeze({...base.productBridge,
      selectedAnimationIds: Object.freeze(registered), registeredAnimationCount: registered.length}),
  });
  });
}

/** Only the bound data and referenced media are readable through the private route. */
export async function readHfrLocalAsset(animationId: string, resource: string) {
  // Preserve development/local-preview guards on every request, including hits.
  const context = hfrReadContext();
  const verify = () => readHfrPacketInContext(animationId, context);
  const readAsset = async ({root, packet}: ReturnType<typeof readHfrLocalPacket>) => {
    const closure = readJsonPin(root, packet.entry.artifacts.closure) as {media: readonly Pin[]};
    const member = path.posix.dirname(packet.entry.artifacts.data.path);
    const candidates = [packet.entry.artifacts.data, ...closure.media];
    const matches = candidates.filter(pin => pin.path === `${member}/${resource}`);
    assert(matches.length === 1, 'HFR asset is outside the exact closure');
    return readBoundG678LocalRuntimeAsset({workspaceRoot: root, binding: {...matches[0]!, animationId,
      url: `/flash-assets/g678-local/${animationId}/hfr/${resource}`}});
  };
  if (!localOnlyAnimationModuleRegistration(animationId)) return readAsset(verify());
  return withRegisteredHfrAsset({root: context.root, animationId, packetPin: CANDIDATES[animationId],
    indexPin: G678_ADMISSION_INDEX, verify}, readAsset);
}
