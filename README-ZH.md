# Starcat Raycast 扩展

<!-- starcat-promo:start -->
<div align="center">
<a href="https://starcat.ink"><img src="https://raw.githubusercontent.com/starcat-app/starcat-pro/main/banner.webp" width="100%" alt="Starcat" /></a>

<p><strong>这是在 Raycast 中搜索 Starcat 本地仓库与 GitHub 的官方扩展。</strong></p>
<p>Starcat 是一款原生 macOS 应用，可以把 GitHub Stars 变成可搜索、可整理、可用 AI 理解的知识库。它支持 README 渲染、标签与私有笔记、Release 追踪、仓库健康度、AI 摘要、语义搜索、浏览器插件工作流，并提供多个可自部署 API。</p>

<a href="https://github.com/starcat-app/homebrew-starcat"><img src="https://img.shields.io/badge/Install%20with-Homebrew-FBBF24?style=for-the-badge&logo=homebrew&logoColor=white" width="220" alt="Install with Homebrew"/></a>
<br/>
<sub><a href="./README.md">English</a></sub>
</div>

<div align="center">
<a href="https://starcat.ink"><img src="https://img.shields.io/badge/website-starcat.ink-38BDF8?style=flat&color=blue" alt="website"/></a>
<a href="https://github.com/starcat-app/starcat-pro"><img src="https://img.shields.io/badge/support-starcat--pro-lightgrey.svg?style=flat&color=blue" alt="support"/></a>
<a href="https://github.com/starcat-app/homebrew-starcat"><img src="https://img.shields.io/badge/install-homebrew-lightgrey.svg?style=flat&color=blue" alt="homebrew"/></a>
<a href="https://github.com/starcat-app/starcat-localization"><img src="https://img.shields.io/badge/localization-open-lightgrey.svg?style=flat&color=blue" alt="localization"/></a>
</div>

<div align="center">
<img width="900" src="https://raw.githubusercontent.com/starcat-app/starcat-pro/main/main.webp" alt="Starcat main window"/>
</div>

**首选 Homebrew 安装：**

```bash
brew tap starcat-app/starcat
brew trust starcat-app/starcat
brew install --cask starcat
```

**相关链接：**

- 官网与下载: https://starcat.ink
- 公开支持与发布说明: https://github.com/starcat-app/starcat-pro
- Starcat App Homebrew tap: https://github.com/starcat-app/homebrew-starcat
- CLI / MCP: [starcat-cli](https://github.com/starcat-app/starcat-cli) / [Homebrew tap](https://github.com/starcat-app/homebrew-starcat-cli)
- AI Agent Skill: https://github.com/starcat-app/starcat-skill
- 浏览器插件: [Chrome](https://github.com/starcat-app/starcat-chrome-plugin) / [Safari](https://github.com/starcat-app/starcat-safari-plugin)
- 官方文档: https://github.com/starcat-app/starcat-docs
- 官网源码: https://github.com/starcat-app/starcat-site
- 本地化: https://github.com/starcat-app/starcat-localization

**可自部署支撑 API：**

- [starcat-sharing-api](https://github.com/starcat-app/starcat-sharing-api)
- [starcat-trending-api](https://github.com/starcat-app/starcat-trending-api)
- [starcat-weekly-api](https://github.com/starcat-app/starcat-weekly-api)
- [starcat-wiki-api](https://github.com/starcat-app/starcat-wiki-api)
- [starcat-recommend-api](https://github.com/starcat-app/starcat-recommend-api)
- [starcat-discovery-api](https://github.com/starcat-app/starcat-discovery-api)
<!-- starcat-promo:end -->

[![CI](https://github.com/starcat-app/starcat-raycast-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/starcat-app/starcat-raycast-extension/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/starcat-app/starcat-raycast-extension)](https://github.com/starcat-app/starcat-raycast-extension/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## 功能

在 Raycast 中运行 **Search Starcat Repositories** 并输入仓库关键词。列表会保持
Starcat 的原始排序，并展示：

- 仓库 owner/name 与描述；
- `Starcat Local` 或 `GitHub` 来源标识；
- 主要语言和 Star 数量；
- owner 或 organization 的公开头像。

按 Return 后，本地结果通过受约束的 Deep Link 在 Starcat 中打开；纯 GitHub 结果
在 `github.com` 打开。Action Panel 还提供在 GitHub 打开、复制 GitHub URL、重试、
打开扩展设置和复制 `starcat doctor` 诊断命令。

来源下拉框支持 `All Sources`、`Starcat Local` 与 `GitHub`。

## 架构

扩展是一个薄 Launcher Adapter：

```text
Raycast List
  -> starcat search
  -> starcat.global_search_repos
  -> Starcat Local FTS + GitHub Search
```

扩展不读取 Starcat 数据库、Keychain、Local API Key、配对配置或 GitHub Token。
搜索、排序、去重、鉴权和 Starcat Pro 权限判断仍由 Starcat 与 CLI 负责。

查询词通过 `execFile` 的独立 argv 传递，不经过 shell。适配器会取消旧搜索、执行
8 秒超时、校验 schema v1、限制进程输出，并且只打开 allowlist 内的 Starcat /
GitHub URL。

## 使用要求

- macOS；
- [Raycast](https://www.raycast.com/)；
- Starcat 已开启 MCP Service；
- 有效的 Starcat Pro 权益；
- Starcat CLI v1.1.0 或更高版本，并且已经与 Starcat 配对。

安装并验证 CLI：

```bash
brew install starcat-app/starcat-cli/starcat
starcat pair
starcat doctor
```

扩展会依次从 `PATH`、`/opt/homebrew/bin`、`/usr/local/bin` 和
`~/.local/bin` 查找 `starcat`。如果 Raycast 找不到 CLI，请在扩展设置中配置绝对
路径 **Starcat CLI Path**。

## 本地开发

开发环境需要 Node.js 22.22.2 或更高版本：

```bash
nvm use
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

`npm run dev` 只会在 Raycast 中加载本地扩展，不会提交或发布扩展。

自动化测试覆盖 CLI 路径、argv 安全、取消、超时、稳定错误码、schema 解析、URL
allowlist、来源展示，以及从
[`starcat-cli/contracts/global-search`](https://github.com/starcat-app/starcat-cli/tree/main/contracts/global-search)
复制的版本化 fixtures。

## 分发

Raycast Extension 不在 manifest 中声明版本号。Store 只维护一个隐式的最新版本，
提交通过后自动更新给用户。

仓库里程碑使用 `vMAJOR.MINOR.PATCH` Git tag。每个
[GitHub Release](https://github.com/starcat-app/starcat-raycast-extension/releases)
都会提供源码 `.zip` / `.tar.gz`、`checksums.txt` 和 GitHub artifact
attestation。这些归档用于审查和可复现的本地开发，不是可一键安装的 Raycast Store
安装包。

Raycast Store 提交是独立的人工操作，会向 `raycast/extensions` 创建 Pull Request。
本仓库 CI 只做验证，绝不会执行 `npm run publish`。详见
[RELEASING.md](./RELEASING.md)。

## 隐私、安全与支持

- [隐私说明](./PRIVACY.md)
- [安全策略](./SECURITY.md)
- [支持渠道](./SUPPORT.md)
- [参与贡献](./CONTRIBUTING.md)
- [第三方声明](./THIRD_PARTY_NOTICES.md)
- [更新记录](./CHANGELOG.md)

## License

MIT，详见 [LICENSE](./LICENSE)。
