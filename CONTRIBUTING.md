# Contributing

Thank you for contributing to Starcat Raycast Extension.

## Before opening a pull request

- Discuss large behavior or architecture changes in an issue first.
- Keep each pull request focused.
- Update both `README.md` and `README-ZH.md` when public behavior changes.
- Do not commit credentials, private repository data, local profiles, build
  output, or Raycast Store publishing tokens.
- Keep this extension as a thin adapter over `starcat search`; search, ranking,
  authentication, and entitlement logic belong in Starcat/CLI.

## Development checks

Use Node.js 22.22.2 or newer:

```bash
nvm use
npm ci
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

If CLI JSON behavior changes, update the versioned source fixtures in
`starcat-cli/contracts/global-search` first, then copy them into `tests/fixtures`
and update adapter tests.

## Pull requests

Complete the pull request template and include:

- the user-visible effect;
- tests and commands run;
- screenshots for Raycast UI changes;
- whether both local and GitHub opening paths were verified.

Security vulnerabilities must be reported privately according to
[SECURITY.md](./SECURITY.md), not through a public issue or pull request.
