# AVA Skills for WorkBuddy

基于 [AntV AVA Skill](https://github.com/antvis/AVA/tree/ai/skills/ava)
的 WorkBuddy 独立技能。支持数据探索、只读 SQL、业务口径复用、交互图表，以及附查询证据并可持续更新的 HTML 报告。

## 安装

需要 macOS / Linux、Node.js ≥22.13 和 AVA CLI 4.x；运行环境需支持后台进程与 Unix
socket。先在 WorkBuddy 的命令环境执行 `ava --help`，缺少 CLI 时安装
`npm install -g @antv/ava@4`。结构化数据分析无需额外模型 API Key。数据库与飞书需要相应访问权限。

在仓库根目录打包：

```sh
mkdir -p dist
zip -r dist/ava-workbuddy-1.0.0.zip ava -x '*.DS_Store'
```

包内只有一个 `ava/`
技能目录。通过 WorkBuddy 的本地技能导入入口选择 ZIP；开放平台提交时也使用这个包，不要上传包含 `.git`
的整个仓库 ZIP。

## 官方格式适配

按 [WorkBuddy 技能规范](https://open.workbuddy.cn/docs/skill) 实现：

- `ava/SKILL.md`：必填标识、中英文展示名称/简介、触发说明、版本、作者，以及中英文示例。
- `ava/references/`：六份上游参考资料，通过 `@references/...` 按需读取。
- `ava/scripts/report.mjs`：查询证据记录、报告生成与追问更新；入口中声明命令及参数。
- `ava/templates/`：报告 HTML 与配套图标；脚本按自身位置解析模板，不依赖当前工作目录。

本技能版本为 1.0.0；上游固定于
`6e8cf0e87968022bf4ab6cc191f6ca32bd068ae8`。仅改写 WorkBuddy 入口、补充运行环境说明，并迁移模板目录及引用路径。上游 SQL、Semantic、图表协议和报告逻辑继续复用。完整来源、改动和许可证见
[NOTICE](ava/NOTICE) 与 [LICENSE](ava/LICENSE)。

HTML 报告内嵌查询结果；交互图表联网加载 GPT-Vis。分享前确认数据适合共享。这是由 yvonneyx 维护的社区适配，并非 WorkBuddy 或 AntV 官方发布。
