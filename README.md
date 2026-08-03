# Starcat Raycast Extension

<!-- starcat-promo:start -->
<div align="center">
<a href="https://starcat.ink"><img src="https://raw.githubusercontent.com/starcat-app/starcat-pro/main/banner.webp" width="100%" alt="Starcat" /></a>

<p><strong>Official Raycast extension for searching Starcat local repositories and GitHub.</strong></p>
<p>Starcat is a native macOS app that turns GitHub Stars into a searchable, organized and AI-assisted local knowledge base. Version 1.3.0 includes README rendering, knowledge-base RAG, My Projects, library and repository insights, macOS desktop widgets, tags and private notes, release tracking, repository health signals, AI summaries, semantic search, browser plugins, Alfred / uTools / Raycast search integrations, and self-hostable support APIs.</p>

<a href="https://github.com/starcat-app/homebrew-starcat"><img src="https://img.shields.io/badge/Install%20with-Homebrew-FBBF24?style=for-the-badge&logo=homebrew&logoColor=white" width="220" alt="Install with Homebrew"/></a>
<br/>
<sub><a href="./README-ZH.md">中文说明</a></sub>
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

**Preferred install method:**

```bash
brew tap starcat-app/starcat
brew trust starcat-app/starcat
brew install --cask starcat
```

**Useful links:**

- Home and downloads: https://starcat.ink
- Public support and release notes: https://github.com/starcat-app/starcat-pro
- Starcat App Homebrew tap: https://github.com/starcat-app/homebrew-starcat
- CLI / MCP: [starcat-cli](https://github.com/starcat-app/starcat-cli) / [Homebrew tap](https://github.com/starcat-app/homebrew-starcat-cli)
- AI Agent Skill: https://github.com/starcat-app/starcat-skill
- Browser plugins: [Chrome](https://github.com/starcat-app/starcat-chrome-plugin) / [Safari](https://github.com/starcat-app/starcat-safari-plugin)
- Documentation: https://github.com/starcat-app/starcat-docs
- Website source: https://github.com/starcat-app/starcat-site
- Localization: https://github.com/starcat-app/starcat-localization

**Self-hostable support APIs:**

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

## What it does

Run **Search Starcat Repositories** in Raycast and type a repository keyword.
The list preserves Starcat's ranking and shows:

- repository owner/name and description;
- explicit source attribution: `Starcat Local` or `GitHub`;
- primary language and star count;
- the public owner or organization avatar.

Press Return to open a local result in Starcat through its constrained deep
link. A GitHub-only result opens on `github.com`. The Action Panel also exposes
Open on GitHub, Copy GitHub URL, retry, preferences, and a copyable
`starcat doctor` diagnostic command.

The source dropdown supports `All Sources`, `Starcat Local`, and `GitHub`.

## Architecture

The extension is a thin launcher adapter:

```text
Raycast List
  -> starcat search
  -> starcat.global_search_repos
  -> Starcat Local FTS + GitHub Search
```

It never reads the Starcat database, Keychain, local API key, pairing profile,
or GitHub token. Search, ranking, deduplication, authentication, and Starcat Pro
entitlement checks remain in Starcat and the CLI.

Queries are passed as one `execFile` argv element with no shell. The adapter
cancels superseded searches, applies an eight-second timeout, validates schema
v1, limits process output, and only opens allowlisted Starcat/GitHub URLs.

## Requirements

- macOS;
- [Raycast](https://www.raycast.com/);
- Starcat with MCP Service enabled;
- an active Starcat Pro entitlement;
- Starcat CLI v1.1.0 or newer, paired with Starcat.

Install and verify the CLI:

```bash
brew install starcat-app/starcat-cli/starcat
starcat pair
starcat doctor
```

The extension searches `PATH`, `/opt/homebrew/bin`, `/usr/local/bin`, and
`~/.local/bin`. If Raycast cannot find your CLI, set an absolute **Starcat CLI
Path** in the extension preferences.

## Local development

Development requires Node.js 22.22.2 or newer.

```bash
nvm use
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run dev
```

`npm run dev` opens the local extension in Raycast. It does not submit or
publish anything.

Tests cover CLI location and argv safety, cancellation, timeout, stable error
codes, schema decoding, URL allowlists, source presentation, and the versioned
fixtures copied from
[`starcat-cli/contracts/global-search`](https://github.com/starcat-app/starcat-cli/tree/main/contracts/global-search).

## Distribution

Raycast extensions intentionally do not declare a manifest version. The Store
maintains one implicit latest version and updates users after an accepted
submission.

Repository milestones use `vMAJOR.MINOR.PATCH` Git tags. Each
[GitHub Release](https://github.com/starcat-app/starcat-raycast-extension/releases)
contains source `.zip` / `.tar.gz` archives, `checksums.txt`, and GitHub artifact
attestations. These archives are intended for review and reproducible local
development; they are not a one-click Raycast Store installer.

Store submission is a separate manual operation that opens a pull request
against `raycast/extensions`. CI validates this repository but never runs
`npm run publish`. See [RELEASING.md](./RELEASING.md).

## Privacy, security, and support

- [Privacy](./PRIVACY.md)
- [Security](./SECURITY.md)
- [Support](./SUPPORT.md)
- [Contributing](./CONTRIBUTING.md)
- [Third-party notices](./THIRD_PARTY_NOTICES.md)
- [Changelog](./CHANGELOG.md)

## License

MIT. See [LICENSE](./LICENSE).
