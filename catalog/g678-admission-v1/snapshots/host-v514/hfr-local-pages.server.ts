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
