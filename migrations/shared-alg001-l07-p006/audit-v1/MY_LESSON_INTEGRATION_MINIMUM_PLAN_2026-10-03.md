# P006 最小 My Lesson 集成对照

本轮仅阅读实际现有文件，并写此计划。沿用现有 P006 / `alg-l07-p006-source-and-maintained-20261003-v1`；没有修改 apps/web、packages、源、registry，没有启动服务器或测试。等待父代理放行共用 build 后的写入窗口。观察到的快照为 index-v183 / host-v182、47 个 proof；实施时重新读取届时的实际基线，不预定 successor 编号或登记总数。

**P006 不复制 P003 的 terminal 行为。** 已有 P006 module/session 是 sprite-223、1845 帧、12fps、`playbackMode:'loop'`、`lessonCompleted:false`；使用已审的 `SourceStreamCycleClockV2`，44100Hz 单声道、6755328 个解码采样，源分段起点 6/8/1233，首次 seek1695。P003 是 sprite-401、2141 帧末帧停止、22050Hz，使用 RunsClock。首轮集成无需修改 P006 的九个产品文件、cycle-clock-v1/v2、decoded transport、通用 admission reader 或共享 host bridge。

## 页面新增文件

- `apps/web/components/g678-alg-l07-p006-runtime-v1.tsx`：按现有 P003 runtime 的身份校验、脚本装载和桥接方式接入 P006 Player。绑定 ID/SWF、800×600、12fps、sprite-223/1845；固定 source-en、seed0，UI 可 EN/ES。Canvas 使用现有 v2 文件，脚本请求模式沿用 P003 的 `script/no-cors`；音频用 `loadBoundLessonAudio`，现有 session 再校验 encoded/PCM 与44100Hz plan。
- `apps/web/lib/alg-l07-p006-preview-policy-v1.ts`、`alg-l07-p006-local-request-v1.ts`、`alg-l07-p006-resources-v1.server.ts`，及 request/resources 两个 production stub：只声明 P006 文档和两个资源 `source-stream`、`canvas-renderer.js` 的准确 pins。保留现有127.0.0.1:3331、真实源根、GET/HEAD、same-origin、Referer、hash、mode/destination 和 production denial 条件。无需另造资源 gateway 或复制 P003 的旧独立 asset routes/host wrapper。
- `apps/web/lib/alg-l07-p006-candidate-v1.server.ts`：在现有 `algL07CurrentDescriptor()` 上只临时覆盖源顺序第6页为 P006 candidate，使用独立 course href/storage key，避免改动现有 P003 boolean candidate API；正式登记后由当前 descriptor 的已验证 packet 投影该页。
- `lib/alg-l07-p006-admission-semantics-v1.mjs` 与 `apps/web/lib/alg-l07-p006-formal-admission-v1.server.ts`：按 P003 的 maintained-DOM / provenance / registry / proof 校验形状，改为 P006 源、ordinal6/RW ordinal5、44100Hz 三分段、循环和两个 term。用现有通用 `embedded-source-stream-v1` 绑定 character223；该 reader 没有固定22050限制。`hostPlaybackCompletion:false`，不填入 P003 的 terminalStopFrame 或完成语义；不硬编码旧14/15页计数。
- `apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l07-p006/{candidate-v1,registered-v1}/page.tsx`：沿用现有 current host、source-ordered62页和 local-only/production-null dynamic imports；正式页只消费实际 P006 proof/registration。

## 共享文件最小差异

| 实际文件 | 必要差异 |
| --- | --- |
| `apps/web/components/g678-alg-l07-current-host-lesson-v1.tsx` | 追加唯一 P006 adapter，`audioEnabled:true`、`glossaryClosePolicy:'stay-paused'`；保留 P001/P002/P003 adapters。 |
| `apps/web/lib/alg-l07-current-descriptor-v1.server.ts` | 现有16个历史 term 加 P003 的 Relation/Value，共18个。Linear function 已逐字段匹配 P006；Nonlinear function 缺失。只从 P006 已有 glossary model/同一 EN/ES 字典准确追加 nonlinear-function，保留原18项顺序和pins，结果19项。需共享修改，因为从 P003 文档导航进入 P006 时也要能打开该词汇。 |
| `apps/web/lib/alg-l07-current-local-documents-v1.ts` | 将 P006 exact candidate/registered Referer 加入现有文档并集。 |
| `apps/web/lib/alg-l07-current-local-request-v1.ts` | owner union 增加 p006，追加两个 P006 token/pin；现有请求检查保持原边界。 |
| `apps/web/lib/alg-l07-current-resources-v1.server.ts` | 添加唯一 p006 owner 分支，动态读取 P006 精确资源；现有 shared asset-response 与两个 gateway route 可直接复用。 |
| `apps/web/next.config.ts` | referer 的 `p00[123]` 明确扩为 `p00[1236]`，不放宽至整段页码；resource rewrites 已遍历 pin 表，无需复制。`l7CurrentProductionReplacements` 增加 P006 request/resources 两项，复用现有 Turbopack/webpack alias 和 module replacement 机制；current host production stub 沿用。 |
| `apps/web/proxy.ts` | 在 document 检查、无locale redirect、calibration-route classification 的明确集合追加 P006 policy；资源许可已经过 common request helper，无需再加宽路径规则。 |
| activation/registry/generated dispatch | 写入窗口内用既有 prepareAdmissionCandidate、page/host boundary 和 guarded activation 流程生成新 host/index 与唯一 P006 registration。保存届时全部旧 proof/registration pins；不改旧冻结文件，也不重写旧 calibration。 |

## 两个桥接要点与实施顺序

`useSourceLessonHostBridge` 可以直接复用。P006 `loading` 映射为 `start-pending`，其余 phase 保留；snapshot 用1845帧、12fps、main audio，Spanish phase为idle。1845→1是循环，不能上报 ended、lesson完成或自动Next。

词汇映射为 `Linear function → linear-function`、`Nonlinear function → nonlinear-function`。现有 page-owned state 继续控制实际可见门槛1780/1810；源按钮placement窗口1760不是两词同时可用的证据。session先暂停再由 bridge 请求 host dialog，关闭保持暂停并还原焦点，显式 Resume 才继续。无需修改共享 bridge，也不添加 locale autoplay 或新 SA binding。

放行后先写这些最小集成文件和共享 successor，再跑既有实际 My Lesson candidate/正式流程与生产负向验证。复用当前 source/native/standalone证据；真实宿主的资源、两词汇、循环边界、Replay、相邻页离开/返回和移动布局需在宿主观察。沿用已接受的1844后真实跨界范围，不追加完整自然周期或新的 acceptance 要求。P006 proof producer 只枚举本页明确输入和本次集成文件，不照抄 P003 对整个 migration目录的扫描，以免把 P004/P005、P007/P009、L1只读兼容性副本收进 P006 证明包。共享 current文件归新host管理，不固化进本页 immutable evidence。
