# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities through
[GitHub Security Advisories](https://github.com/starcat-app/starcat-raycast-extension/security/advisories/new).
Do not publish credentials, tokens, private repository data, pairing profiles,
local paths, or exploit details in a public issue.

Include the affected version or commit, macOS and Raycast versions,
reproduction steps, and expected impact. You should receive an acknowledgement
within seven days.

## Supported versions

Security fixes are provided for the latest published stable release or the
current default branch before the first stable release.

## Security boundaries

- Search queries are passed to a local `starcat` executable as one argv item;
  the extension never uses a shell.
- The extension never reads Starcat SQLite, Keychain, local API keys, GitHub
  tokens, or pairing profiles.
- CLI stdout is limited to 2 MiB, stderr to 64 KiB, and searches to eight
  seconds.
- CLI JSON is validated as global-search schema v1 before rendering.
- Actions only open constrained `starcat://repo/{owner}/{name}?v=1...` or
  `https://github.com/{owner}/{repo}` URLs.
- Avatar images are limited to HTTPS resources from `github.com` and
  `avatars.githubusercontent.com`, with a bundled fallback.
- Raw CLI stderr is never displayed in Raycast.

Raycast, Starcat, the Starcat CLI, GitHub, Homebrew, npm, and macOS remain
separate trust boundaries governed by their own update and security policies.
