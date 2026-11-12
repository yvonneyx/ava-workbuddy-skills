# Environment Setup

## WorkBuddy

在 WorkBuddy 的命令环境里核对 Node.js 和 CLI。以实际落盘的附件路径运行 `ava source`，确认获得
`datasetId`。输出写入任务目录，脚本从本次加载的 Skill 目录调用。

## CLI

Use Node.js ≥22.13 and AVA CLI 4.0.2 or later. Install or update the CLI in the WorkBuddy command environment if needed:

```sh
npm install -g @antv/ava
```

Put the compatible Node's `bin` directory on the task's `PATH` so both `node` and `ava` use it.

### PowerShell 7 (Windows)

```powershell
ava source ".\sales.csv" > session.json
$datasetId = (Get-Content -Raw session.json | ConvertFrom-Json).datasetId
ava schema $datasetId > schema.json
# Inspect schema and establish Semantic before writing query.sql.
ava query $datasetId --dsl "@query.sql" > result.json
```

## Sessions

Use the same user and environment settings when accessing a session. Recover `datasetId` from saved session JSON across shell calls. Sessions expire after 30 idle minutes or disposal; reload the source, refresh schema, and reapply compatible saved semantic when access remains authorized.
