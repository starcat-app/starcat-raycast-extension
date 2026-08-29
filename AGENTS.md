# AGENTS.md — Starcat Raycast Extension

本文档是本仓库 AI 协作规则的唯一维护源。

## 独立仓库边界

- 本目录是 `starcat-app/starcat-raycast-extension` 独立 Git 仓库，拥有自己的
  CI、GitHub Release 与 Raycast Store 提交边界。
- 修改前必须确认当前分支与工作区状态；未经 dong4j 明确要求，不得切换分支、提交或处理其他仓库。
- 本仓只负责 Raycast UI 和进程适配；搜索能力与 contract 由 `starcat-cli` 提供。

## 用途与技术栈

本项目是在 Raycast 中搜索 Starcat 本地仓库与 GitHub 的薄适配器。扩展调用已配对的
`starcat search`，保持 CLI 排序和来源标记，并使用 Raycast List 与 Action Panel
展示、打开或复制允许的仓库 URL。

- Node.js >= 22.22.2
- TypeScript 5.9、React 19
- `@raycast/api`、`@raycast/utils`
- Vitest、ESLint、Prettier、Raycast CLI

## 关键目录

- `src/search-repositories.tsx`：Raycast 搜索命令和 UI。
- `src/lib/cli.ts`：CLI 定位、`execFile` 调用、取消和超时。
- `src/lib/contract.ts` / `types.ts` / `errors.ts`：schema v1 与稳定错误。
- `src/lib/url-policy.ts` / `presentation.ts`：URL allowlist 和展示映射。
- `package.json`：Raycast manifest、偏好项、依赖和开发命令。
- `scripts/package-release.sh`：生成 GitHub Release 的源码归档与 checksum。
- `.github/workflows/`：CI 与 tag 驱动的 GitHub Release；不会提交 Raycast Store。

## 开发与验证

```bash
nvm use
npm ci
npm test
npm run typecheck
npm run lint
npm run build
bash -n scripts/*.sh
git diff --check
```

`npm run dev` 会在本地 Raycast 打开开发扩展，但不发布；只在需要人工联调时使用。

## 项目特有约束

- 保持薄适配器：不得读取 Starcat SQLite、Keychain、API key、pairing profile
  或 GitHub token，不得复制搜索、排序、去重、鉴权或 Pro entitlement。
- 必须通过 `execFile` 把查询作为独立 argv 传给 `starcat search`，禁止 shell 拼接。
- 必须遵守 `starcat-cli/contracts/global-search` v1；共享 fixture、schema 解码和稳定
  错误码应同步演进，不得建立 Raycast 私有 contract。
- 保留被替代查询取消、8 秒超时、进程输出上限和过期结果保护。
- 只允许打开通过 allowlist 的 Starcat deep link 与 GitHub URL。
- Raycast manifest 故意不声明版本；Store 维护隐式 latest。仓库 tag 只标记源码里程碑，
  GitHub Release 归档不是一键 Store 安装包。

## 发布边界与禁令

GitHub Release 与 Raycast Store 是两条独立路径：`v*` tag 只触发本仓源码归档、
checksum 和 attestation；Store 发布需运行 `npm run publish`，向
`raycast/extensions` 创建独立 PR。未经 dong4j 在当前任务中明确授权，禁止执行
`npm run package:release`、`npm run publish`、创建或推送 tag、执行 `git push`、
发布 Release、上传归档、提交 Store PR 或执行任何对外分发操作。
