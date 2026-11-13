# AntV 数据分析 for WorkBuddy

基于
[AntV AVA Skill](https://github.com/antvis/AVA/tree/6cc78312423cdc313c6e371a5257e536049064d0/skills/ava)
的 WorkBuddy 独立技能。支持多数据源联合分析、GitHub Issue/PR 数据、只读 SQL、业务口径复用、交互图表
，以及附查询证据并可持续更新的 HTML 报告。

## 安装

需要 Node.js 22.13+ 和 AVA CLI 4.0.3 或更高版本。在 WorkBuddy 的命令环境中执行
`npm install -g @antv/ava` 安装或更新 CLI。首次使用时用一份 CSV 执行 `ava source`，确认获得
`datasetId` 后释放测试会话。结构化数据分析无需额外模型 API Key。数据库、飞书与私有 GitHub 仓库需要相
应访问权限。

`ava source --help` 应支持多个输入，`ava viz --help` 应说明不传 `--output` 时返回图表配置。4.0.2 不
具备这些能力；升级后仍显示旧帮助时，检查 WorkBuddy 的 `PATH` 是否命中了旧 CLI。

在仓库根目录打包：

```sh
mkdir -p dist
zip -r dist/ava-workbuddy-1.0.2.zip ava -x '*.DS_Store'
```

包内只有一个 `ava/` 技能目录。通过 WorkBuddy 的本地技能导入入口选择 ZIP；开放平台提交时也使用这个包
，不要上传包含 `.git` 的整个仓库 ZIP。

安装兼容的 CLI 后，可在仓库根目录运行 `node --test tests/report.test.mjs`，验证联合查询、报告生成与追问更新。测试仅创建临时样例数据，结束后清理会话和文件。

## 官方格式适配

按 [WorkBuddy 技能规范](https://open.workbuddy.cn/docs/skill) 实现：

- `ava/SKILL.md`：必填标识、中英文展示名称/简介、触发说明、版本、作者，以及中英文示例。
- `ava/references/`：六份上游参考资料，通过 `@references/...` 按需读取。
- `ava/scripts/report.mjs`：查询证据记录、报告生成与追问更新；入口中声明命令及参数。
- `ava/templates/`：报告 HTML 与配套图标；脚本按自身位置解析模板，不依赖当前工作目录。

本技能版本为 1.0.2；上游固定于 AVA `v4.0.3`（`6cc78312423cdc313c6e371a5257e536049064d0`）。展示名称
为「AntV 数据分析 / AntV Data Analysis」，技能标识保持 `ava`。WorkBuddy 入口保留双语元数据
、PowerShell 示例、Windows 脚本与路径兼容。报告同步为页面内直接渲染，移除 iframe，并共用 GPT-Vis
1.3.1。完整来源、改动和许可证见 [NOTICE](ava/NOTICE) 与 [LICENSE](ava/LICENSE)。

HTML 报告内嵌查询结果；交互图表从 registry.npmmirror.com 联网加载 GPT-Vis。报告需要 JavaScript，禁用
脚本的文件预览无法完整展示。旧自定义模板需从 `chart.html` 迁移到 `chart.config`。分享前确认数据适合
共享。这是由 yvonneyx 维护的社区适配，并非 WorkBuddy 或 AntV 官方发布。
